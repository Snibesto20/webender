import express from 'express';
import { Client } from '../models.js';
import { auth } from '../middleware.js';
import { ok, fail, normalizeDoc } from '../utils/response.js';

const router = express.Router();

const VALID_TAGS = [
  'potential 1', 'potential 2', 'potential 3', 'potential 4', 'potential 5',
  'potential 6', 'potential 7', 'potential 8', 'potential 9', 'potential 10',
  'pending', 'approved', 'active client', 'archived client', 'disapproved', 'unprocessed'
];

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const READ_ROLES = ['admin', 'marketing', 'guest'];
const WRITE_ROLES = ['admin', 'marketing'];

const expireStalePendingClients = async () => {
  const cutoff = new Date(Date.now() - TWO_WEEKS_MS);
  await Client.updateMany(
    { tag: 'pending', updatedAt: { $lt: cutoff } },
    { $set: { tag: 'disapproved', serviceNeeded: '' } }
  );
};

const ownsClient = (user, client) => {
  if (user.role === 'admin') return true;
  if (client.createdBy && String(client.createdBy) === String(user._id)) return true;
  if (client.marketer && client.marketer === user.username) return true;
  return false;
};

router.get('/', auth(READ_ROLES), async (req, res) => {
  try {
    await expireStalePendingClients();
    const clients = await Client.find().sort({ createdAt: -1 }).lean();
    const normalized = clients.map((c) => ({
      ...c,
      id: c._id,
      _id: c._id
    }));
    return ok(res, normalized, 'CLIENT_LIST_SUCCESS');
  } catch {
    return fail(res, 'CLIENT_FETCH_ERROR', 500);
  }
});

router.post('/', auth(WRITE_ROLES), async (req, res) => {
  try {
    const { name, contacts, tag, serviceNeeded, notes, moneyMade } = req.body;

    if (!name || !name.trim()) {
      return fail(res, 'CLIENT_NAME_REQUIRED', 400);
    }

    const normalizedTag = tag ? String(tag).trim().toLowerCase() : '';
    if (!VALID_TAGS.includes(normalizedTag)) {
      return fail(res, 'CLIENT_TAG_REQUIRED', 400);
    }

    const filteredContacts = Array.isArray(contacts)
      ? contacts.map(c => String(c).trim()).filter(c => c !== '')
      : [];

    if (normalizedTag === 'unprocessed' && filteredContacts.length === 0) {
      return fail(res, 'CLIENT_CONTACTS_REQUIRED_FOR_UNPROCESSED', 400);
    }

    const nameUpper = name.trim().toUpperCase();
    const exists = await Client.findOne({ name: nameUpper }).lean();
    if (exists) {
      return fail(res, 'CLIENT_DUPLICATE_NAME', 400, { name: nameUpper });
    }

    const shouldHideService = ['disapproved', 'pending', 'archived client'].includes(normalizedTag);

    const cleanClientData = {
      name: nameUpper,
      tag: normalizedTag,
      contacts: filteredContacts,
      serviceNeeded: shouldHideService ? '' : (serviceNeeded ? String(serviceNeeded).trim().substring(0, 255) : ''),
      notes: notes ? String(notes).trim().substring(0, 2000) : '',
      moneyMade: typeof moneyMade === 'number' ? moneyMade : 0,
      marketer: req.user?.username || 'nenurodyta',
      createdBy: req.user?._id || null
    };

    const newClient = new Client(cleanClientData);
    await newClient.save();
    return ok(res, normalizeDoc(newClient), 'CLIENT_CREATE_SUCCESS', 201);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return fail(res, 'GLOBAL_VALIDATION_ERROR', 400);
    }
    return fail(res, 'CLIENT_CREATE_ERROR', 400);
  }
});

router.put('/:id', auth(WRITE_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contacts, tag, serviceNeeded, notes, moneyMade } = req.body;

    const existingClient = await Client.findById(id);
    if (!existingClient) return fail(res, 'GLOBAL_NOT_FOUND', 404);

    if (req.user.role === 'marketing' && !ownsClient(req.user, existingClient)) {
      return fail(res, 'CLIENT_EDIT_FORBIDDEN', 403);
    }

    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) return fail(res, 'CLIENT_NAME_REQUIRED', 400);
      const nameUpper = name.trim().toUpperCase();
      const duplicateExists = await Client.findOne({ name: nameUpper, _id: { $ne: id } }).lean();
      if (duplicateExists) {
        return fail(res, 'CLIENT_DUPLICATE_NAME', 400, { name: nameUpper });
      }
      updateData.name = nameUpper;
    }

    if (tag !== undefined) {
      const normalizedTag = String(tag).trim().toLowerCase();
      if (!VALID_TAGS.includes(normalizedTag)) return fail(res, 'CLIENT_TAG_REQUIRED', 400);
      updateData.tag = normalizedTag;
    }

    const targetTag = updateData.tag || existingClient.tag;

    if (contacts !== undefined) {
      if (!Array.isArray(contacts)) return fail(res, 'CLIENT_CONTACTS_REQUIRED_FOR_UNPROCESSED', 400);
      const filteredContacts = contacts.map(c => String(c).trim()).filter(c => c !== '');
      if (targetTag === 'unprocessed' && filteredContacts.length === 0) {
        return fail(res, 'CLIENT_CONTACTS_REQUIRED_FOR_UNPROCESSED', 400);
      }
      updateData.contacts = filteredContacts;
    } else if (targetTag === 'unprocessed' && existingClient.contacts.length === 0) {
      return fail(res, 'CLIENT_CONTACTS_REQUIRED_FOR_UNPROCESSED', 400);
    }

    const shouldHideService = ['disapproved', 'pending', 'archived client'].includes(targetTag);
    if (shouldHideService) {
      updateData.serviceNeeded = '';
    } else if (serviceNeeded !== undefined) {
      updateData.serviceNeeded = String(serviceNeeded).trim().substring(0, 255);
    }

    if (notes !== undefined) {
      updateData.notes = String(notes).trim().substring(0, 2000);
    }

    if (moneyMade !== undefined) {
      const parsed = Number(moneyMade);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        updateData.moneyMade = parsed;
      }
    }

    const updated = await Client.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return ok(res, normalizeDoc(updated), 'CLIENT_UPDATE_SUCCESS');
  } catch {
    return fail(res, 'CLIENT_UPDATE_ERROR', 400);
  }
});

router.delete('/:id', auth(WRITE_ROLES), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return fail(res, 'GLOBAL_NOT_FOUND', 404);

    if (req.user.role === 'marketing' && !ownsClient(req.user, client)) {
      return fail(res, 'CLIENT_DELETE_FORBIDDEN', 403);
    }

    await Client.findByIdAndDelete(req.params.id);
    return ok(res, null, 'CLIENT_DELETE_SUCCESS');
  } catch {
    return fail(res, 'CLIENT_DELETE_ERROR', 500);
  }
});

export default router;
