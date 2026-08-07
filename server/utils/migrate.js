/**
 * One-time: rename apikeys → users, strip legacy fields, ensure username is set.
 */
export async function migrateToUsersCollection(mongoose) {
  const db = mongoose.connection.db;
  if (!db) return;

  const hasApiKeys = (await db.listCollections({ name: 'apikeys' }).toArray()).length > 0;
  const hasUsers = (await db.listCollections({ name: 'users' }).toArray()).length > 0;

  if (hasApiKeys && !hasUsers) {
    await db.renameCollection('apikeys', 'users');
    console.log('✅ Renamed collection apikeys → users');
  } else if (hasApiKeys && hasUsers) {
    const legacy = db.collection('apikeys');
    const users = db.collection('users');
    const docs = await legacy.find({}).toArray();
    for (const doc of docs) {
      const { key, owner, __v, ...rest } = doc;
      const username = (rest.username || owner || '').toString().trim().toLowerCase();
      if (!username || !rest.passwordHash) continue;
      await users.updateOne(
        { _id: doc._id },
        {
          $set: {
            username,
            passwordHash: rest.passwordHash,
            role: rest.role === 'viewer' ? 'guest' : (rest.role || 'guest'),
            emailsSent: rest.emailsSent || 0,
            updatedAt: rest.updatedAt || new Date(),
            createdAt: rest.createdAt || new Date()
          },
          $unset: { key: '', owner: '', __v: '' }
        },
        { upsert: true }
      );
    }
    await legacy.drop();
    console.log('✅ Merged apikeys into users and dropped apikeys');
  }

  const users = db.collection('users');
  const dirty = await users.find({
    $or: [
      { key: { $exists: true } },
      { owner: { $exists: true } },
      { role: 'viewer' }
    ]
  }).toArray();

  for (const doc of dirty) {
    const username = (doc.username || doc.owner || '').toString().trim().toLowerCase();
    const role = doc.role === 'viewer' ? 'guest' : doc.role;
    await users.updateOne(
      { _id: doc._id },
      {
        $set: {
          ...(username ? { username } : {}),
          ...(role ? { role } : {})
        },
        $unset: { key: '', owner: '', __v: '' }
      }
    );
  }

  if (dirty.length > 0) {
    console.log(`✅ Cleaned ${dirty.length} user document(s) (removed key/owner, mapped viewer→guest)`);
  }

  // Align client.marketer strings that still hold legacy owner display names
  const clients = db.collection('clients');
  const allUsers = await users.find({}).project({ username: 1, owner: 1 }).toArray();
  for (const u of allUsers) {
    if (!u.username) continue;
    // If any client still uses a non-lowercase marketer equal to old owner casing variants
    await clients.updateMany(
      { marketer: { $regex: new RegExp(`^${u.username}$`, 'i') } },
      { $set: { marketer: u.username } }
    );
  }
}
