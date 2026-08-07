import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ProfileHeader } from '../components/headers/ProfileHeader';
import { ComponentHeader } from '../components/headers/ComponentHeader';
import { StatusMessage } from '../components/StatusMessage';
import { ConfirmModal } from '../components/ConfirmModal';
import { TAG_PRIORITY, VALIDATION_CONFIG, ROLE_BADGE } from '../config';
import { TagBadge } from '../components/TagBadge';
import { ClientModal } from '../components/ClientModal';
import { useT } from '../i18n/useT';
import {
  MdLock, MdSettings, MdSecurity, MdTrendingUp,
  MdSearch, MdList, MdPerson, MdBadge, MdPersonOutline,
  MdDarkMode, MdLightMode, MdLanguage, MdCheck
} from 'react-icons/md';
import { AnimatePresence } from 'framer-motion';

export const Profile = () => {
  const { user, updateOwnPassword, clients, updateClient, darkMode, toggleDarkMode, setLanguage } = useStore();
  const { t, err, role: roleLabel, language, languages } = useT();
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  const filteredClients = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return clients
      .filter(c => c.marketer === user?.username)
      .filter(c => {
        const matchName = c.name?.toLowerCase().includes(query);
        const matchContacts = c.contacts?.some(contact => contact?.toLowerCase().includes(query));
        return matchName || matchContacts;
      })
      .sort((a, b) => (TAG_PRIORITY[b.tag] || 0) - (TAG_PRIORITY[a.tag] || 0));
  }, [clients, user?.username, searchTerm]);

  useEffect(() => {
    if (selectedClient) {
      const currentId = selectedClient._id || selectedClient.id;
      const freshData = clients.find(c => (c._id || c.id) === currentId);
      if (freshData) setSelectedClient(freshData);
      else setSelectedClient(null);
    }
  }, [clients, selectedClient]);

  const handleSaveClient = async (updatedData) => {
    if (updateClient && selectedClient) {
      const clientId = selectedClient._id || selectedClient.id;
      await updateClient(clientId, updatedData);
      setSelectedClient(prevState => ({ ...prevState, ...updatedData }));
    }
  };

  const handleUpdate = async () => {
    setIsPasswordModalOpen(false);

    if (passwords.next !== passwords.confirm) {
      return setStatus({ type: 'error', msg: t('profile.passwordsMismatch') });
    }
    if (passwords.next.trim().length < VALIDATION_CONFIG.MIN_PASSWORD_LENGTH) {
      return setStatus({ type: 'error', msg: err('AUTH_PASSWORD_TOO_SHORT') });
    }

    const result = await updateOwnPassword(passwords.current, passwords.next.trim());
    if (result.success) {
      setPasswords({ current: '', next: '', confirm: '' });
      setStatus({ type: 'success', msg: err('AUTH_PASSWORD_UPDATED') });
    } else {
      setStatus({ type: 'error', msg: err(result.error) || result.error || err('AUTH_PASSWORD_UPDATE_ERROR') });
    }
  };

  const handleCancel = () => {
    setPasswords({ current: '', next: '', confirm: '' });
    setStatus({ type: '', msg: '' });
  };

  const badgeStyle = ROLE_BADGE[user?.role] || ROLE_BADGE.guest;
  const badgeText = roleLabel(user?.role);
  const RoleIcon = user?.role === 'admin' ? MdSecurity : user?.role === 'marketing' ? MdTrendingUp : MdPersonOutline;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e]">
      <ProfileHeader />
      <main className="flex-1 overflow-y-auto lg:overflow-hidden page-pad">
        <div className="max-w-7xl mx-auto w-full h-auto lg:h-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch min-h-0">
          <div className="panel flex flex-col min-h-[420px] lg:min-h-0 overflow-hidden">
            <ComponentHeader title={t('profile.settings')} icon={MdSettings} />
            <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar min-h-0">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
                    {darkMode ? <MdDarkMode size={18} className="text-[#1a73e8]" /> : <MdLightMode size={18} className="text-[#1a73e8]" />}
                    {t('profile.appearance')}
                  </div>
                  <p className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mt-1">
                    {t('profile.themeDescription')}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={darkMode}
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-[#1a73e8]' : 'bg-[#dadce0] dark:bg-[#5f6368]'
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  >
                    {darkMode
                      ? <MdDarkMode size={12} className="text-[#1a73e8]" />
                      : <MdLightMode size={12} className="text-[#f9ab00]" />}
                  </span>
                </button>
              </div>

              <div className="pt-5 border-t border-[#dadce0] dark:border-[#3c4043]">
                <div className="flex items-center gap-2 text-[14px] font-medium text-[#202124] dark:text-[#e8eaed] mb-1">
                  <MdLanguage size={18} className="text-[#1a73e8]" />
                  {t('profile.language')}
                </div>
                <p className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mb-3">
                  {t('profile.languageDescription')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => {
                    const active = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                          active
                            ? 'border-[#1a73e8] bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                            : 'border-[#dadce0] dark:border-[#3c4043] hover:border-[#1a73e8]/50 hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043]/40'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-1.5 right-1.5 text-[#1a73e8]">
                            <MdCheck size={14} />
                          </span>
                        )}
                        <span className="text-[22px] leading-none" aria-hidden>{lang.flag}</span>
                        <span className={`text-[12px] font-medium ${active ? 'text-[#1a73e8]' : 'text-[#202124] dark:text-[#e8eaed]'}`}>
                          {lang.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-5 border-t border-[#dadce0] dark:border-[#3c4043] space-y-4">
                <div className="flex items-center gap-2 text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">
                  <MdLock size={18} className="text-[#1a73e8]" />
                  {t('profile.passwordSettings')}
                </div>
                <div className="space-y-1.5">
                  <label className="label-base"><MdLock size={14} className="text-[#1a73e8]" /> {t('profile.currentPassword')}</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="input-base" autoComplete="current-password" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-base"><MdLock size={14} className="text-[#1a73e8]" /> {t('profile.newPassword')}</label>
                  <input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} className="input-base" autoComplete="new-password" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-base"><MdLock size={14} className="text-[#1a73e8]" /> {t('profile.confirmPassword')}</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="input-base" autoComplete="new-password" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleCancel} className="px-4 py-2 rounded text-[13px] font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors">{t('profile.cancel')}</button>
                  <button onClick={() => setIsPasswordModalOpen(true)} className="btn-blue flex-1 h-[38px]">{t('profile.saveChanges')}</button>
                </div>
              </div>
            </div>
          </div>

          <div className="panel flex flex-col min-h-[420px] lg:min-h-0 overflow-hidden">
            <ComponentHeader title={t('profile.createdClients')} icon={MdList}>
              <div className="relative w-28 sm:w-36">
                <MdSearch className="absolute left-2.5 top-2 text-[#5f6368]" size={16} />
                <input type="text" className="input-base pl-9 h-[32px] text-[12px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('common.search')} />
              </div>
              <span className="text-[12px] bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] px-2.5 py-0.5 rounded-full font-medium shrink-0">{filteredClients.length}</span>
            </ComponentHeader>

            <div className="flex-1 flex flex-col min-h-0">
              {filteredClients.length > 0 ? (
                <table className="flex flex-col h-full w-full text-[13px] text-[#202124] dark:text-[#e8eaed]">
                  <thead className="block w-full border-b border-[#dadce0] dark:border-[#3c4043] bg-[#f8f9fa] dark:bg-[#202124]">
                    <tr className="flex w-full text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
                      <th className="py-3 text-left pl-4 sm:pl-6 flex-1 flex items-center gap-2 font-normal"><MdPerson size={14} className="text-[#1a73e8]" /> {t('common.name')}</th>
                      <th className="py-3 text-left flex-1 flex items-center gap-2 font-normal"><MdBadge size={14} className="text-[#1a73e8]" /> {t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="flex-1 block w-full overflow-y-auto custom-scrollbar">
                    {filteredClients.map(client => (
                      <tr key={client._id || client.id} onClick={() => setSelectedClient(client)} className="group flex w-full border-b border-[#f1f3f4] dark:border-[#3c4043] last:border-0 hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043]/30 transition-colors cursor-pointer">
                        <td className="py-3 font-medium pl-4 sm:pl-6 flex-1 flex items-center min-w-0"><span className="truncate block w-full">{client.name}</span></td>
                        <td className="py-3 flex-1 flex items-center"><TagBadge tag={client.tag} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[13px] text-[#5f6368] italic py-10">{t('profile.noClients')}</div>
              )}
            </div>
          </div>

          <div className="panel flex flex-col min-h-[280px] lg:min-h-0 overflow-hidden">
            <ComponentHeader title={t('profile.accountData')} icon={MdPerson} />
            <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div>
                <div className="text-[32px] font-light text-[#202124] dark:text-[#e8eaed]">{user?.emailsSent || 0}</div>
                <div className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">{t('profile.emailsSent')}</div>
              </div>
              <div className="pt-6 border-t border-[#dadce0] dark:border-[#3c4043]">
                <div className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">{user?.username || '—'}</div>
                <div className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">{t('profile.username')}</div>
              </div>
              <div className="flex flex-col pt-6 border-t border-[#dadce0] dark:border-[#3c4043]">
                <div className="w-fit">
                  <div className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded border ${badgeStyle.className}`}>
                    <RoleIcon size={10} /> {badgeText.label}
                  </div>
                </div>
                <div className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mt-2">{t('profile.systemRole')}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedClient && (
          <ClientModal client={selectedClient} onClose={() => setSelectedClient(null)} onSave={handleSaveClient} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPasswordModalOpen && (
          <ConfirmModal title={t('profile.confirmPasswordTitle')} message={t('profile.confirmPasswordMessage')} onConfirm={handleUpdate} onCancel={() => setIsPasswordModalOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status.msg && <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
