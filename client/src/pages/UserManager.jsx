import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { UsersHeader } from '../components/headers/UsersHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { TagBadge } from '../components/TagBadge';
import { StatusMessage } from '../components/StatusMessage';
import { ComponentHeader } from '../components/headers/ComponentHeader';
import { VALIDATION_CONFIG, TAG_PRIORITY, ROLE_BADGE } from '../config';
import { useT } from '../i18n/useT';
import {
  MdDelete, MdPersonAdd, MdPerson, MdShield,
  MdSecurity, MdTrendingUp, MdSearch, MdList,
  MdBadge, MdPeople, MdBlock, MdLock, MdPersonOutline
} from 'react-icons/md';

const RoleTag = ({ role }) => {
  const { role: roleLabel } = useT();
  const style = ROLE_BADGE[role] || ROLE_BADGE.guest;
  const text = roleLabel(role);
  const Icon = role === 'admin' ? MdSecurity : role === 'marketing' ? MdTrendingUp : MdPersonOutline;
  return (
    <div className={`flex items-center justify-start gap-1 text-[9px] font-bold tracking-tight w-fit px-1.5 py-0.5 rounded border ${style.className}`}>
      <Icon size={10} /> {text.label}
    </div>
  );
};

const UserProfileModal = ({ user, clients, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef(null);
  const { t } = useT();

  const totalUserClientsCount = useMemo(() => {
    if (!user) return 0;
    return clients.filter(c => c.marketer === user.username).length;
  }, [clients, user]);

  const userClients = useMemo(() => {
    if (!user) return [];
    return clients
      .filter(c => c.marketer === user.username)
      .filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (TAG_PRIORITY[b.tag] || 0) - (TAG_PRIORITY[a.tag] || 0));
  }, [clients, user, searchTerm]);

  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} className="bg-[#f8f9fa] dark:bg-[#1e1e1e] max-h-[90vh] w-full max-w-5xl rounded-lg shadow-xl overflow-hidden flex flex-col border border-[#dadce0] dark:border-[#3c4043]">
        <ComponentHeader title={t('users.profileOverview')} icon={MdPerson} onClose={onClose} />
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            <div className="panel flex flex-col h-full min-h-[380px]">
              <ComponentHeader title={t('users.accountData')} icon={MdPerson} />
              <div className="p-4 sm:p-6 space-y-6 flex-1">
                <div>
                  <div className="text-[14px] font-medium text-[#202124] dark:text-[#e8eaed]">{user?.username || '—'}</div>
                  <div className="text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 text-[10px]">{t('profile.username')}</div>
                </div>
                <div className="pt-6 border-t border-[#dadce0] dark:border-[#3c4043]">
                  <span className="text-[32px] font-light text-[#202124] dark:text-[#e8eaed] leading-none">{totalUserClientsCount}</span>
                  <div className="text-[#5f6368] dark:text-[#9aa0a6] mt-1 text-[10px]">{t('users.addedClients')}</div>
                </div>
                <div className="pt-6 border-t border-[#dadce0] dark:border-[#3c4043]">
                  <RoleTag role={user?.role} />
                  <div className="text-[#5f6368] dark:text-[#9aa0a6] tracking-wide text-[10px] mt-2">{t('users.accessLevel')}</div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 panel flex flex-col h-full min-h-[380px]">
              <ComponentHeader title={t('users.addedClients')} icon={MdList}>
                <div className="relative w-36 sm:w-48">
                  <MdSearch className="absolute left-2.5 top-2 text-[#5f6368]" size={16} />
                  <input type="text" className="input-base pl-9 h-[32px] text-[12px] mb-0" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('common.search')} />
                </div>
                <span className="text-[12px] bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] px-2.5 py-0.5 rounded-full font-medium shrink-0">
                  {totalUserClientsCount}
                </span>
              </ComponentHeader>

              <div className="flex-1 max-h-[380px] overflow-y-auto custom-scrollbar">
                {userClients.length > 0 ? (
                  <table className="w-full text-[13px] text-[#202124] dark:text-[#e8eaed]">
                    <thead>
                      <tr className="bg-[#f8f9fa] dark:bg-[#202124] text-[13px] text-[#5f6368] dark:text-[#9aa0a6] border-b border-[#dadce0] dark:border-[#3c4043]">
                        <th className="py-3 text-left pl-4 sm:pl-6 font-normal"><span className="inline-flex items-center gap-2"><MdPerson size={14} className="text-[#1a73e8]" /> {t('users.name')}</span></th>
                        <th className="py-3 text-left px-4 sm:px-6 font-normal"><span className="inline-flex items-center gap-2"><MdBadge size={14} className="text-[#1a73e8]" /> {t('users.status')}</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
                      {userClients.map(client => (
                        <tr key={client._id || client.id}>
                          <td className="pl-4 sm:pl-6 pr-4 py-3.5 font-medium"><span className="truncate block">{client.name}</span></td>
                          <td className="px-4 sm:px-6 py-3.5"><TagBadge tag={client.tag} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-[#5f6368] italic text-[13px] p-10 py-20">{t('users.noClients')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManager = () => {
  const { users, fetchUsers, createUser, deleteUser, clients } = useStore();
  const { t, err } = useT();
  const [formData, setFormData] = useState({ username: '', password: '', role: 'marketing' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, username: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserClientCount = (username) => {
    if (!clients) return 0;
    return clients.filter(c => c.marketer === username).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = formData.username.trim().toLowerCase();
    const trimmedPassword = formData.password.trim();
    setStatus({ type: '', msg: '' });

    if (!trimmedUsername || !trimmedPassword) {
      setStatus({ type: 'error', msg: err('FORM_ALL_FIELDS_REQUIRED') });
      return;
    }
    if (trimmedPassword.length < VALIDATION_CONFIG.MIN_PASSWORD_LENGTH) {
      setStatus({ type: 'error', msg: err('USER_PASSWORD_TOO_SHORT') });
      return;
    }

    try {
      await createUser({
        username: trimmedUsername,
        password: trimmedPassword,
        role: formData.role
      });
      setFormData({ username: '', password: '', role: 'marketing' });
      setStatus({ type: 'success', msg: err('FORM_CREATE_SUCCESS') });
    } catch (errObj) {
      setStatus({ type: 'error', msg: err(errObj.message) || err('FORM_CREATE_ERROR') });
    }
  };

  const confirmDelete = async () => {
    setStatus({ type: '', msg: '' });
    const result = await deleteUser(deleteModal.id);
    if (result.success) {
      setStatus({ type: 'success', msg: t('users.deleteSuccess', deleteModal.username) });
    } else {
      setStatus({ type: 'error', msg: err(result.error) || err('USER_DELETE_ERROR') });
    }
    setDeleteModal({ isOpen: false, id: null, username: '' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e]">
      <UsersHeader />
      <UserProfileModal user={selectedUser} clients={clients} onClose={() => setSelectedUser(null)} />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={t('users.deleteTitle')}
        message={t('users.deleteMessage', deleteModal.username)}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, username: '' })}
      />

      <main className="flex-1 overflow-y-auto page-pad">
        <div className="page-max space-y-4 sm:space-y-6">
          <div className="panel overflow-visible relative z-30">
            <ComponentHeader title={t('users.createTitle')} icon={MdPersonAdd} />
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="label-base"><MdBadge size={14} className="text-[#1a73e8]" /> {t('users.username')}</label>
                <input type="text" className="input-base h-[38px] mb-0" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <label className="label-base"><MdLock size={14} className="text-[#1a73e8]" /> {t('users.tempPassword')}</label>
                <input type="text" className="input-base h-[38px] mb-0" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} autoComplete="off" />
              </div>
              <div ref={dropdownRef} className="space-y-1.5 relative z-40">
                <label className="label-base"><MdShield size={14} className="text-[#1a73e8]" /> {t('users.role')}</label>
                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="input-base flex items-center justify-between bg-white dark:bg-[#202124] w-full h-[38px] mb-0 text-left cursor-pointer">
                  <RoleTag role={formData.role} />
                  <span className={`text-[10px] text-[#5f6368] dark:text-[#9aa0a6] mr-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#2d2e31] border border-[#b8bbbf] dark:border-[#4a4d51] rounded shadow-xl z-50 divide-y divide-slate-100 dark:divide-[#3c4043] transition-all origin-top ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <ul className="py-0.5">
                    {VALIDATION_CONFIG.ALLOWED_ROLES.map(role => (
                      <li key={role} onClick={() => { setFormData({ ...formData, role }); setIsDropdownOpen(false); }} className="flex items-center px-3 py-1.5 hover:bg-blue-50/60 dark:hover:bg-[#1a73e8]/20 cursor-pointer">
                        <RoleTag role={role} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button type="submit" className="btn-blue h-[38px] mb-0 w-full">{t('users.create')}</button>
            </form>
          </div>

          <div className="panel overflow-hidden">
            <ComponentHeader title={t('users.list')} icon={MdList}>
              <span className="text-[12px] bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] px-2.5 py-0.5 rounded-full font-medium">
                {users.length}
              </span>
            </ComponentHeader>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px] text-[#202124] dark:text-[#e8eaed] min-w-[520px]">
                <thead>
                  <tr className="bg-[#f8f9fa] dark:bg-[#202124] text-[13px] text-[#5f6368] dark:text-[#9aa0a6] border-b border-[#dadce0] dark:border-[#3c4043]">
                    <th className="py-3 px-4 sm:px-6 font-normal text-left"><span className="inline-flex items-center gap-2"><MdPerson size={14} className="text-[#1a73e8]" /> {t('users.username')}</span></th>
                    <th className="py-3 px-4 sm:px-6 font-normal text-left"><span className="inline-flex items-center gap-2"><MdShield size={14} className="text-[#1a73e8]" /> {t('users.role')}</span></th>
                    <th className="py-3 px-4 sm:px-6 font-normal text-left"><span className="inline-flex items-center gap-2"><MdPeople size={14} className="text-[#1a73e8]" /> {t('users.clients')}</span></th>
                    <th className="py-3 px-4 sm:px-6 font-normal text-right w-24"><span className="inline-flex items-center gap-2 justify-end"><MdDelete size={14} className="text-[#1a73e8]" /> {t('users.deletion')}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
                  {users.map((item) => (
                    <tr key={item._id || item.id} onClick={() => setSelectedUser(item)} className="group hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043]/30 transition-colors cursor-pointer">
                      <td className="py-3 px-4 sm:px-6 font-medium"><span className="truncate block max-w-[180px]">{item.username}</span></td>
                      <td className="py-3 px-4 sm:px-6"><RoleTag role={item.role} /></td>
                      <td className="py-3 px-4 sm:px-6 font-bold text-slate-500 dark:text-slate-400">{getUserClientCount(item.username)}</td>
                      <td className="py-3 px-4 sm:px-6 text-right">
                        <div className="flex justify-end">
                          {item.role === 'admin' ? (
                            <div className="p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed pointer-events-none inline-flex">
                              <MdBlock size={16} />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({ isOpen: true, id: item._id || item.id, username: item.username });
                              }}
                              className="btn-blue-icon inline-flex items-center justify-center"
                            >
                              <MdDelete size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {status.msg && <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />}
      </AnimatePresence>
    </div>
  );
};

export default UserManager;
