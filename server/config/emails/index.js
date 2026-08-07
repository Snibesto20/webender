import lt from './lt.js';
import en from './en.js';
import de from './de.js';
import ru from './ru.js';

export const EMAIL_TEMPLATES = { lt, en, de, ru };

export const getEmailTemplate = (code = 'lt') => {
  const key = String(code || 'lt').toLowerCase();
  return EMAIL_TEMPLATES[key] || EMAIL_TEMPLATES.lt;
};
