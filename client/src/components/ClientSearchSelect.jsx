import { useEffect, useMemo, useRef, useState } from 'react';
import { MdSearch, MdClose, MdBusiness } from 'react-icons/md';
import { useT } from '../i18n/useT';

export const ClientSearchSelect = ({ clients = [], value, onChange, placeholder }) => {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchPlaceholder = placeholder || t('events.searchClient');

  const selected = useMemo(
    () => clients.find(c => String(c._id || c.id) === String(value)) || null,
    [clients, value]
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return clients.slice(0, 50);
    return clients.filter(c => {
      const name = (c.name || '').toUpperCase();
      const contacts = (c.contacts || []).some(ct => (ct || '').toUpperCase().includes(q));
      return name.includes(q) || contacts;
    }).slice(0, 50);
  }, [clients, query]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input-base flex items-center justify-between gap-2 text-left w-full"
      >
        <span className={`truncate flex items-center gap-1.5 ${selected ? '' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}>
          <MdBusiness size={14} className="text-[#1a73e8] shrink-0" />
          {selected ? selected.name : t('events.generalReminder')}
        </span>
        <span className={`text-[10px] text-[#5f6368] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {selected && (
        <button
          type="button"
          className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); }}
          title={t('common.clear')}
        >
          <MdClose size={14} />
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#2d2e31] border border-[#b8bbbf] dark:border-[#4a4d51] rounded shadow-xl overflow-hidden">
          <div className="p-2 border-b border-[#dadce0] dark:border-[#3c4043]">
            <div className="relative">
              <MdSearch className="absolute left-2.5 top-2.5 text-[#5f6368]" size={16} />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="input-base pl-9 h-[34px] text-[12px] mb-0"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-[#3c4043]">
            <li
              onClick={() => { onChange(''); setOpen(false); }}
              className="px-3 py-2 text-[13px] italic text-[#5f6368] dark:text-[#9aa0a6] hover:bg-blue-50/60 dark:hover:bg-[#1a73e8]/20 cursor-pointer"
            >
              {t('events.generalReminder')}
            </li>
            {filtered.length > 0 ? filtered.map(c => {
              const id = c._id || c.id;
              const active = String(id) === String(value);
              return (
                <li
                  key={id}
                  onClick={() => { onChange(String(id)); setOpen(false); }}
                  className={`px-3 py-2 text-[13px] cursor-pointer truncate ${active ? 'bg-blue-50 dark:bg-[#1a73e8]/20 text-[#1a73e8] font-medium' : 'hover:bg-blue-50/60 dark:hover:bg-[#1a73e8]/20 text-[#202124] dark:text-[#e8eaed]'}`}
                >
                  {c.name}
                </li>
              );
            }) : (
              <li className="px-3 py-4 text-center text-[12px] text-gray-400 italic">{t('common.notFound')}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
