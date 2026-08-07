import express from 'express';
import { Event, Client } from '../models.js';
import { auth } from '../middleware.js';
import { ok, fail } from '../utils/response.js';

const router = express.Router();

const READ_ROLES = ['admin', 'marketing', 'guest'];
const WRITE_ROLES = ['admin', 'marketing'];

const archiveExpiredEvents = async () => {
  const now = new Date();
  await Event.updateMany(
    { archived: false, date: { $lt: now } },
    { $set: { archived: true } }
  );
};

router.get('/', auth(READ_ROLES), async (req, res) => {
  try {
    await archiveExpiredEvents();
    const events = await Event.find()
      .sort({ date: 1 })
      .populate('clientId', 'name tag')
      .lean();

    const normalized = events.map((e) => ({
      ...e,
      id: e._id,
      _id: e._id,
      client: e.clientId || null,
      clientId: e.clientId?._id || e.clientId || null
    }));

    return ok(res, normalized, 'EVENT_LIST_SUCCESS');
  } catch {
    return fail(res, 'EVENT_FETCH_ERROR', 500);
  }
});

router.post('/', auth(WRITE_ROLES), async (req, res) => {
  try {
    const { note, date, clientId } = req.body;

    if (!note || !String(note).trim()) {
      return fail(res, 'EVENT_NOTE_REQUIRED', 400);
    }

    if (!date) {
      return fail(res, 'EVENT_DATE_REQUIRED', 400);
    }

    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) {
      return fail(res, 'EVENT_DATE_INVALID', 400);
    }

    let linkedClient = null;
    if (clientId) {
      linkedClient = await Client.findById(clientId).lean();
      if (!linkedClient) {
        return fail(res, 'EVENT_CLIENT_NOT_FOUND', 400);
      }
    }

    const archived = eventDate < new Date();
    const event = new Event({
      note: String(note).trim().substring(0, 2000),
      date: eventDate,
      clientId: linkedClient?._id || null,
      createdBy: req.user._id,
      createdByName: req.user.username,
      archived
    });

    await event.save();
    const populated = await Event.findById(event._id).populate('clientId', 'name tag').lean();

    return ok(res, {
      ...populated,
      id: populated._id,
      client: populated.clientId || null,
      clientId: populated.clientId?._id || populated.clientId || null
    }, 'EVENT_CREATE_SUCCESS', 201);
  } catch {
    return fail(res, 'EVENT_CREATE_ERROR', 400);
  }
});

router.put('/:id', auth(WRITE_ROLES), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return fail(res, 'GLOBAL_NOT_FOUND', 404);

    const { note, date, clientId, archived } = req.body;
    const updateData = {};

    if (note !== undefined) {
      if (!String(note).trim()) return fail(res, 'EVENT_NOTE_REQUIRED', 400);
      updateData.note = String(note).trim().substring(0, 2000);
    }

    if (date !== undefined) {
      const eventDate = new Date(date);
      if (Number.isNaN(eventDate.getTime())) return fail(res, 'EVENT_DATE_INVALID', 400);
      updateData.date = eventDate;
      if (archived === undefined) {
        updateData.archived = eventDate < new Date();
      }
    }

    if (clientId !== undefined) {
      if (clientId === null || clientId === '') {
        updateData.clientId = null;
      } else {
        const linkedClient = await Client.findById(clientId).lean();
        if (!linkedClient) return fail(res, 'EVENT_CLIENT_NOT_FOUND', 400);
        updateData.clientId = linkedClient._id;
      }
    }

    if (archived !== undefined) {
      updateData.archived = Boolean(archived);
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('clientId', 'name tag').lean();

    return ok(res, {
      ...updated,
      id: updated._id,
      client: updated.clientId || null,
      clientId: updated.clientId?._id || updated.clientId || null
    }, 'EVENT_UPDATE_SUCCESS');
  } catch {
    return fail(res, 'EVENT_UPDATE_ERROR', 400);
  }
});

router.delete('/:id', auth(WRITE_ROLES), async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return fail(res, 'GLOBAL_NOT_FOUND', 404);
    return ok(res, null, 'EVENT_DELETE_SUCCESS');
  } catch {
    return fail(res, 'EVENT_DELETE_ERROR', 500);
  }
});

export default router;
