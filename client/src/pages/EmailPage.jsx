import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { EmailPageHeader } from '../components/headers/EmailPageHeader';
import { ClientRegistry } from '../components/ClientRegistry';
import { MdSend, MdEmail, MdPerson, MdBusiness, MdLanguage, MdCheck, MdPreview } from 'react-icons/md';
import { StatusMessage } from '../components/StatusMessage';
import { AnimatePresence } from 'framer-motion';
import { ComponentHeader } from '../components/headers/ComponentHeader';
import { useT } from '../i18n/useT';
import { EMAIL_LANGUAGES, getEmailTemplate } from '../i18n/emails';

export const EmailPage = () => {
  const { sendEmail, clients, user, language: uiLanguage } = useStore();
  const { t, err } = useT();
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [form, setForm] = useState({ to: '', name: '' });
  const [emailLang, setEmailLang] = useState(uiLanguage || 'lt');
  const [loading, setLoading] = useState(false);
  const [previewDraft, setPreviewDraft] = useState(null);
  const canSend = user?.role === 'admin' || user?.role === 'marketing';
  const isAdmin = user?.role === 'admin';
  const template = getEmailTemplate(emailLang);

  useEffect(() => {
    if (uiLanguage) setEmailLang(uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    setPreviewDraft(null);
  }, [emailLang]);

  const previewSubject = previewDraft?.subject ?? template.subject;
  const previewBody = previewDraft?.body ?? template.body;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (!canSend) {
      setStatus({ type: 'error', msg: t('email.guestForbidden') });
      return;
    }

    const trimmedName = (form.name || '').trim();
    const trimmedEmail = (form.to || '').trim();

    if (!trimmedName || !trimmedEmail) {
      setStatus({ type: 'error', msg: t('email.allFieldsRequired') });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setStatus({ type: 'error', msg: t('email.invalidEmail') });
      return;
    }

    setLoading(true);

    try {
      const normalizedName = trimmedName.toUpperCase();
      const existingClient = clients?.find(c =>
        (c.name || '').trim().toUpperCase() === normalizedName
      );

      const clientId = existingClient?._id || existingClient?.id;

      if (existingClient) {
        const hasEmail = existingClient.contacts?.some(
          c => c.trim().toLowerCase() === trimmedEmail.toLowerCase()
        );
        if (!hasEmail && existingClient.contacts && existingClient.contacts.length > 0) {
          throw new Error(t('email.clientExists', normalizedName));
        }
      }

      const result = await sendEmail({
        to: trimmedEmail,
        name: normalizedName,
        id: clientId,
        language: emailLang,
      });

      if (!result.success) {
        throw new Error(err(result.error) || t('email.sendFailed'));
      }

      setStatus({ type: 'success', msg: t('email.sendSuccess') });
      setForm({ to: '', name: '' });

    } catch (errObj) {
      setStatus({ type: 'error', msg: errObj.message || t('email.genericError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#1e1e1e] overflow-hidden">
      <EmailPageHeader />
      <main className="flex-1 page-pad overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-4 sm:gap-6 justify-center items-start">

          <div className="flex-1 max-w-2xl shrink-0 min-w-0 h-[calc(100vh-140px)]">
            <div className="panel h-full flex flex-col">
              <ComponentHeader title={t('email.sendTitle')} icon={MdEmail} />

              <form onSubmit={handleSubmit} noValidate={true} className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col min-h-0">
                <div className="space-y-1.5">
                  <label className="label-base">
                    <MdBusiness size={14} className="text-[#1a73e8]" /> {t('email.clientName')}
                  </label>
                  <input type="text" className="input-base" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="label-base">
                    <MdPerson size={14} className="text-[#1a73e8]" /> {t('email.clientEmail')}
                  </label>
                  <input type="text" className="input-base" value={form.to} onChange={(e) => setForm({...form, to: e.target.value})} />
                </div>

                <div className="space-y-1.5">
                  <label className="label-base">
                    <MdLanguage size={14} className="text-[#1a73e8]" /> {t('email.language')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {EMAIL_LANGUAGES.map((lang) => {
                      const active = emailLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          disabled={!canSend}
                          onClick={() => setEmailLang(lang.code)}
                          className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all disabled:opacity-50 ${
                            active
                              ? 'border-[#1a73e8] bg-blue-50 dark:bg-blue-900/20'
                              : 'border-[#dadce0] dark:border-[#3c4043] hover:border-[#1a73e8]/40'
                          }`}
                        >
                          {active && (
                            <span className="absolute top-1 right-1 text-[#1a73e8]"><MdCheck size={12} /></span>
                          )}
                          <span className="text-[18px] leading-none">{lang.flag}</span>
                          <span className={`text-[11px] font-medium ${active ? 'text-[#1a73e8]' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}>
                            {lang.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-1 flex-1 flex flex-col min-h-0">
                  <label className="label-base">
                    <MdPreview size={14} className="text-[#1a73e8]" /> {t('email.preview')}
                  </label>
                  <div className="rounded-lg border border-[#dadce0] dark:border-[#3c4043] bg-[#f8f9fa]/60 dark:bg-[#202124]/30 p-3 space-y-2 flex-1 flex flex-col min-h-0">
                    <div className="space-y-1 shrink-0">
                      <span className="text-[10px] uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6] font-medium">{t('email.previewSubject')}</span>
                      {isAdmin ? (
                        <input
                          type="text"
                          className="input-base text-[13px] mb-0"
                          value={previewSubject}
                          onChange={(e) => setPreviewDraft(prev => ({ subject: e.target.value, body: prev?.body ?? template.body }))}
                        />
                      ) : (
                        <p className="text-[13px] font-medium text-[#202124] dark:text-[#e8eaed] px-1">{previewSubject}</p>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 flex flex-col min-h-0">
                      <span className="text-[10px] uppercase tracking-wide text-[#5f6368] dark:text-[#9aa0a6] font-medium">{t('email.previewBody')}</span>
                      {isAdmin ? (
                        <textarea
                          className="input-base text-[12px] resize-none !h-auto flex-1 min-h-[280px] mb-0 leading-relaxed"
                          value={previewBody}
                          onChange={(e) => setPreviewDraft(prev => ({ subject: prev?.subject ?? template.subject, body: e.target.value }))}
                        />
                      ) : (
                        <pre className="text-[12px] text-[#202124] dark:text-[#e8eaed] whitespace-pre-wrap leading-relaxed font-sans px-1 flex-1 min-h-[280px] overflow-y-auto custom-scrollbar">{previewBody}</pre>
                      )}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading || !canSend} className="btn-blue w-full h-[38px] shrink-0 disabled:bg-gray-300 dark:disabled:bg-[#3c4043] flex items-center justify-center gap-2">
                  {loading ? t('common.processing') : <><MdSend size={16} /> {t('email.submit')}</>}
                </button>
              </form>
            </div>
          </div>

          <div className="w-[260px] shrink-0 hidden xl:block h-[calc(100vh-140px)] overflow-hidden border border-[#dadce0] dark:border-[#3c4043] rounded shadow-sm bg-white dark:bg-[#292a2d]">
            <ClientRegistry />
          </div>

        </div>
      </main>
      <AnimatePresence>
        {status.msg && <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />}
      </AnimatePresence>
    </div>
  );
};
