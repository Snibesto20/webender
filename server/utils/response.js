export const ok = (res, data = null, message = 'SUCCESS', status = 200) => {
  const body = { success: true, message, status };
  if (data !== null && data !== undefined) body.data = data;
  return res.status(status).json(body);
};

export const fail = (res, code, status = 400, meta = undefined) => {
  const body = { success: false, code, message: code, status };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
};

export const toPublicUser = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: obj._id,
    username: obj.username,
    role: obj.role,
    emailsSent: obj.emailsSent || 0
  };
};

export const normalizeDoc = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
  if (obj._id && !obj.id) obj.id = String(obj._id);
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.key;
  delete obj.owner;
  return obj;
};
