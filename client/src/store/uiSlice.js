import { DEFAULT_LANGUAGE, LOCALES } from '../i18n';

export const createUISlice = (set, get) => ({
  darkMode: false,
  showTrash: false,
  isLoading: true,
  language: DEFAULT_LANGUAGE,

  initUI: () => {
    const isDark = localStorage.getItem('crm-dark') === 'true';
    const isTrash = localStorage.getItem('crm-trash') === 'true';
    const savedLang = localStorage.getItem('crm-lang');
    const language = LOCALES[savedLang] ? savedLang : DEFAULT_LANGUAGE;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.lang = language;
    set({ darkMode: isDark, showTrash: isTrash, language });
  },

  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    set({ darkMode: newMode });
    localStorage.setItem('crm-dark', newMode);

    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setLanguage: (code) => {
    const language = LOCALES[code] ? code : DEFAULT_LANGUAGE;
    localStorage.setItem('crm-lang', language);
    document.documentElement.lang = language;
    set({ language });
  },

  toggleTrash: () => {
    const trash = !get().showTrash;
    set({ showTrash: trash });
    localStorage.setItem('crm-trash', trash);
  }
});
