import jwt from 'jsonwebtoken';
import { User } from './models.js';
import { fail } from './utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET || 'webend-crm-dev-secret-change-me';

export const signToken = (user) => {
  return jwt.sign(
    { sub: String(user._id), role: user.role, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const auth = (allowedRoles = []) => async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

    if (!bearer) return fail(res, 'AUTH_UNAUTHORIZED', 401);

    let payload;
    try {
      payload = jwt.verify(bearer, JWT_SECRET);
    } catch {
      return fail(res, 'AUTH_INVALID_TOKEN', 401);
    }

    const user = await User.findById(payload.sub);
    if (!user) return fail(res, 'AUTH_UNAUTHORIZED', 401);

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return fail(res, 'AUTH_FORBIDDEN', 403);
    }

    req.user = user;
    next();
  } catch {
    return fail(res, 'AUTH_SERVER_ERROR', 500);
  }
};
