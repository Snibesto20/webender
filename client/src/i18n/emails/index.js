import lt from './lt.js';
import en from './en.js';
import de from './de.js';
import ru from './ru.js';

export const EMAIL_TEMPLATES = { lt, en, de, ru };
export const EMAIL_LANGUAGES = [
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export const getEmailTemplate = (code = 'lt') =>
  EMAIL_TEMPLATES[code] || EMAIL_TEMPLATES.lt;
