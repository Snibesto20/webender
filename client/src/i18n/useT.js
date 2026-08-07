import { useCallback, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getLocale, translate, getErrorMessage, getRoleBadge, getTagLabel, LANGUAGES } from './index';

export const useT = () => {
  const language = useStore((s) => s.language);
  const locale = useMemo(() => getLocale(language), [language]);

  const t = useCallback(
    (key, ...args) => translate(locale, key, ...args),
    [locale]
  );

  const err = useCallback(
    (code) => getErrorMessage(locale, code),
    [locale]
  );

  const role = useCallback(
    (roleKey) => getRoleBadge(locale, roleKey),
    [locale]
  );

  const tag = useCallback(
    (tagKey) => getTagLabel(locale, tagKey),
    [locale]
  );

  return {
    t,
    err,
    role,
    tag,
    language,
    locale,
    dateLocale: locale.dateLocale,
    languages: LANGUAGES,
  };
};
