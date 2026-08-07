import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models.js';
import { auth, signToken } from '../middleware.js';
import { ok, fail, toPublicUser } from '../utils/response.js';

const router = express.Router();
const MIN_PASSWORD_LENGTH = 6;

router.post('/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return fail(res, 'AUTH_CREDENTIALS_REQUIRED', 401);
    }

    const user = await User.findOne({ username });
    if (!user || !user.passwordHash) {
      return fail(res, 'AUTH_INVALID_CREDENTIALS', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return fail(res, 'AUTH_INVALID_CREDENTIALS', 401);
    }

    const token = signToken(user);
    return ok(res, {
      token,
      user: toPublicUser(user)
    }, 'AUTH_LOGIN_SUCCESS');
  } catch {
    return fail(res, 'AUTH_SERVER_ERROR', 500);
  }
});

router.put('/me/password', auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return fail(res, 'AUTH_PASSWORD_FIELDS_REQUIRED', 400);
    }

    if (String(newPassword).trim().length < MIN_PASSWORD_LENGTH) {
      return fail(res, 'AUTH_PASSWORD_TOO_SHORT', 400);
    }

    const valid = await bcrypt.compare(String(currentPassword), req.user.passwordHash);
    if (!valid) {
      return fail(res, 'AUTH_CURRENT_PASSWORD_INVALID', 400);
    }

    req.user.passwordHash = await bcrypt.hash(String(newPassword).trim(), 10);
    await req.user.save();

    return ok(res, null, 'AUTH_PASSWORD_UPDATED');
  } catch {
    return fail(res, 'AUTH_PASSWORD_UPDATE_ERROR', 500);
  }
});

export default router;
