import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models.js';
import { auth } from '../middleware.js';
import { ok, fail, toPublicUser } from '../utils/response.js';

const router = express.Router();

const MIN_PASSWORD_LENGTH = 6;
const ALLOWED_ROLES = ['admin', 'marketing', 'guest'];

router.get('/me', auth(), async (req, res) => {
  return ok(res, toPublicUser(req.user), 'USER_ME_SUCCESS');
});

router.get('/', auth(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').lean();
    return ok(res, users.map(u => ({
      _id: u._id,
      id: u._id,
      username: u.username,
      role: u.role,
      emailsSent: u.emailsSent || 0
    })), 'USER_LIST_SUCCESS');
  } catch {
    return fail(res, 'USER_FETCH_ERROR', 500);
  }
});

router.post('/', auth(['admin']), async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const trimmedUsername = String(username || '').trim().toLowerCase();
    if (!trimmedUsername) {
      return fail(res, 'USER_USERNAME_REQUIRED', 400);
    }

    if (!/^[a-z0-9._-]{3,32}$/.test(trimmedUsername)) {
      return fail(res, 'USER_USERNAME_INVALID', 400);
    }

    const trimmedPassword = String(password || '').trim();
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      return fail(res, 'USER_PASSWORD_TOO_SHORT', 400);
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return fail(res, 'USER_INVALID_ROLE', 400);
    }

    const usernameExists = await User.findOne({ username: trimmedUsername }).lean();
    if (usernameExists) {
      return fail(res, 'USER_DUPLICATE_USERNAME', 400);
    }

    const passwordHash = await bcrypt.hash(trimmedPassword, 10);
    const newUser = new User({
      username: trimmedUsername,
      passwordHash,
      role
    });

    await newUser.save();
    return ok(res, toPublicUser(newUser), 'USER_CREATE_SUCCESS', 201);
  } catch (err) {
    if (err?.code === 11000) {
      return fail(res, 'USER_DUPLICATE_USERNAME', 400);
    }
    return fail(res, 'GLOBAL_VALIDATION_ERROR', 400);
  }
});

router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return fail(res, 'GLOBAL_NOT_FOUND', 404);

    if (target.role === 'admin') {
      return fail(res, 'USER_DELETE_ADMIN_FORBIDDEN', 403);
    }

    if (String(target._id) === String(req.user._id)) {
      return fail(res, 'USER_DELETE_SELF_FORBIDDEN', 403);
    }

    await User.findByIdAndDelete(req.params.id);
    return ok(res, null, 'USER_DELETE_SUCCESS');
  } catch {
    return fail(res, 'USER_DELETE_ERROR', 500);
  }
});

export default router;
