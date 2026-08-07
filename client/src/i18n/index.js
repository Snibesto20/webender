import lt from './locales/lt.js';
import en from './locales/en.js';
import de from './locales/de.js';
import ru from './locales/ru.js';

export const LOCALES = { lt, en, de, ru };

export const LANGUAGES = [
  { code: 'lt', name: lt.name, flag: lt.flag },
  { code: 'en', name: en.name, flag: en.flag },
  { code: 'de', name: de.name, flag: de.flag },
  { code: 'ru', name: ru.name, flag: ru.flag },
];

export const DEFAULT_LANGUAGE = 'lt';

export const getLocale = (code = DEFAULT_LANGUAGE) =>
  LOCALES[code] || LOCALES[DEFAULT_LANGUAGE];

/** Resolve nested key like "nav.clients" or top-level "errors.CLIENT_NAME_REQUIRED" */
export const translate = (locale, key, ...args) => {
  if (!key) return '';
  const parts = key.split('.');
  let value = locale;
  for (const part of parts) {
    if (value == null) return key;
    value = value[part];
  }
  if (typeof value === 'function') return value(...args);
  if (value == null) return key;
  return value;
};

export const getErrorMessage = (locale, code) => {
  if (!code) return locale.errors.GLOBAL_UNKNOWN_ERROR;
  return locale.errors[code] || locale.errors.GLOBAL_UNKNOWN_ERROR;
};

export const getRoleBadge = (locale, role) => {
  const cfg = locale.roles[role] || locale.roles.guest;
  return cfg;
};

export const getTagLabel = (locale, tag) => {
  if (!tag) return '';
  return locale.tags[tag] || tag;
};
