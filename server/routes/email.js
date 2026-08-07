import express from 'express';
import nodemailer from 'nodemailer';
import { auth } from '../middleware.js';
import { User, Client } from '../models.js';
import { ok, fail, normalizeDoc } from '../utils/response.js';
import { getEmailTemplate } from '../config/emails/index.js';

const router = express.Router();

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    console.error('Email config missing: EMAIL_USER / EMAIL_PASS');
  }

  // Use port 465 + SSL with connection pooling for better stability on cloud platforms like Render
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 3,
    auth: { user, pass },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

const transporter = createTransporter();

router.post('/', auth(['admin', 'marketing']), async (req, res) => {
  const { to, name, language } = req.body;

  if (!to) return fail(res, 'EMAIL_RECIPIENT_REQUIRED', 400);

  const normalizedName = (name || '').trim().toUpperCase();
  const template = getEmailTemplate(language);

  const mailOptions = {
    from: `"${template.fromName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: template.subject,
    text: template.body
  };

  try {
    await transporter.sendMail(mailOptions);

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { emailsSent: 1 }
    });

    let syncedClient = null;

    if (normalizedName) {
      try {
        const trimmedTo = to.trim();

        // Single atomic operation to find/create client and append email without duplicates
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
              createdBy: req.user._id
            }
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
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });
    return fail(res, 'EMAIL_SEND_ERROR', 500);
  }
});

export default router;