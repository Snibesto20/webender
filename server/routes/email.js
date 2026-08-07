import express from 'express';
import { Resend } from 'resend';
import { auth } from '../middleware.js';
import { User, Client } from '../models.js';
import { ok, fail, normalizeDoc } from '../utils/response.js';
import { getEmailTemplate } from '../config/emails/index.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', auth(['admin', 'marketing']), async (req, res) => {
  const { to, name, language, subject, body } = req.body;

  if (!to) return fail(res, 'EMAIL_RECIPIENT_REQUIRED', 400);

  const normalizedName = (name || '').trim().toUpperCase();
  const template = getEmailTemplate(language);
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  try {
    await resend.emails.send({
      from: `"${template.fromName}" <${fromEmail}>`,
      to,
      subject: subject || template.subject,
      text: body || template.body,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { emailsSent: 1 },
    });

    let syncedClient = null;

    if (normalizedName) {
      try {
        const trimmedTo = to.trim();

        syncedClient = await Client.findOneAndUpdate(
          { name: normalizedName },
          {
            $addToSet: { contacts: trimmedTo },
            $setOnInsert: {
              tag: 'pending',
              serviceNeeded: '',
              notes: '',
              moneyMade: 0,
              marketer: req.user.username || 'nenurodyta',
              createdBy: req.user._id,
            },
          },
          { new: true, upsert: true }
        );
      } catch (dbErr) {
        console.error('Klaida sinchronizuojant klientą fone:', dbErr.message);
      }
    }

    return ok(res, { client: normalizeDoc(syncedClient) }, 'EMAIL_SEND_SUCCESS');
  } catch (err) {
    console.error('Email error:', {
      message: err.message,
      name: err.name,
    });
    return fail(res, 'EMAIL_SEND_ERROR', 500);
  }
});

export default router;