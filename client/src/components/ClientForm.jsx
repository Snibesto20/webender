import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { AnimatePresence } from 'framer-motion';
import { StatusMessage } from './StatusMessage';
import { ComponentHeader } from './headers/ComponentHeader';
import { ClientTagDropdown } from './ClientTagDropdown';
import { INITIAL_TAGS } from '../config';
import { useT } from '../i18n/useT';
import { MdPersonAdd, MdAdd, MdDelete, MdContactMail, MdPerson, MdMiscellaneousServices, MdBadge, MdNotes } from 'react-icons/md';

const formatPhoneNumber = (contactStr) => {
  const trimmed = contactStr.trim();
  if (!trimmed) return '';

  const hasLetters = /[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ]/i.test(trimmed);
  
  if (hasLetters) {
    return trimmed;
  }

  let cleaned = trimmed.replace(/\D/g, '');
  if (!cleaned) return trimmed;

  if (cleaned.startsWith('370')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('8')) {
    cleaned = '0' + cleaned.substring(1);
  }

  return cleaned;
};

export const ClientForm = ({ onSuccess }) => {
  const addClient = useStore((state) => state.addClient);
  const user = useStore((state) => state.user);
  const filterType = useStore((state) => state.filterType);
  const { t, err } = useT();

  const getDefaultTag = () => filterType === 'unprocessed' ? 'unprocessed' : 'disapproved';

  const [formData, setFormData] = useState({ 
    name: '', 
    tag: getDefaultTag(), 
    serviceNeeded: '', 
    notes: '',
    contacts: ['']
  });
  
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [issubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextTag = getDefaultTag();
    setFormData((prev) => ({
      ...prev,
      tag: nextTag,
      serviceNeeded: nextTag === 'unprocessed' ? '' : prev.serviceNeeded
    }));
  }, [filterType]);

  const canCreate = user?.role === 'admin' || user?.role === 'marketing' || user?.role === 'guest';
  const isGuest = user?.role === 'guest';
  const isUnprocessed = formData.tag === 'unprocessed';
  const isDisapproved = formData.tag === 'disapproved';
  
  const isGhosted = isDisapproved || isUnprocessed;

  const handleContactChange = (index, value) => {
    if (!canCreate) return;
    const newContacts = [...formData.contacts];
    newContacts[index] = value;
    setFormData({ ...formData, contacts: newContacts });
  };

  const addContactField = () => {
    if (!canCreate) return;
    setFormData({ ...formData, contacts: [...formData.contacts, ''] });
  };

  const removeContactField = (index) => {
    if (!canCreate) return;
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: newContacts.length ? newContacts : [''] });
  };

  const handleTagChange = (newTag) => {
    setFormData((prev) => ({
      ...prev,
      tag: newTag,
      serviceNeeded: newTag === 'unprocessed' ? '' : prev.serviceNeeded
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      setStatus({ type: 'error', msg: t('clientForm.noPermission') });
      return;
    }
    setStatus({ type: '', msg: '' });
    
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setStatus({ type: 'error', msg: err('CLIENT_NAME_REQUIRED') });
      return;
    }
    
    if (!formData.tag) {
      setStatus({ type: 'error', msg: err('CLIENT_TAG_REQUIRED') });
      return;
    }

    if (isUnprocessed && formData.serviceNeeded.trim()) {
      setStatus({ type: 'error', msg: t('clientForm.unprocessedNoService') });
      return;
    }

    const formattedContacts = formData.contacts
      .map(c => formatPhoneNumber(c))
      .filter(c => c.trim() !== '');

    if (isUnprocessed && formattedContacts.length === 0) {
      setStatus({ type: 'error', msg: err('CLIENT_CONTACTS_REQUIRED_FOR_UNPROCESSED') });
      return;
    }
    
    try {
      setIsSubmitting(true);

      await addClient({
        ...formData,
        name: trimmedName.toUpperCase(),
        contacts: formattedContacts,
        serviceNeeded: isUnprocessed ? '' : formData.serviceNeeded.trim()
      });
      
      setStatus({
        type: 'success',
        msg: isGuest ? err('CLIENT_GUEST_SIMULATED') : t('clientForm.createSuccess')
      });
      
      setFormData({ 
        name: '', 
        tag: getDefaultTag(), 
        serviceNeeded: '', 
        notes: '', 
        contacts: [''] 
      });
      if (onSuccess) onSuccess();
    } catch (errObj) {
      const backendCode = errObj.code || errObj.message;
      let errorMsg = err(backendCode);
      
      if (backendCode === 'CLIENT_DUPLICATE_NAME' && (errObj.meta?.name || errObj.response?.data?.meta?.name)) {
        const nameVal = errObj.meta?.name || errObj.response?.data?.meta?.name;
        errorMsg = t('clientForm.duplicateName', nameVal);
      }

      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#292a2d] border border-[#dadce0] dark:border-[#3c4043] rounded shadow-sm">
      <ComponentHeader title={t('clientForm.title')} icon={MdPersonAdd} />
      
      <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 ${!canCreate ? "opacity-60 pointer-events-none select-none" : ""}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label-base">
              <MdPerson size={14} className="text-[#1a73e8]" /> 
              <span>{t('clientForm.name')} <span className="form-asterisk">*</span></span>
            </label>
            <input type="text" disabled={!canCreate} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-base" />
          </div>

          <div className="space-y-1.5">
            <label className="label-base">
              <MdContactMail size={14} className="text-[#1a73e8]" /> 
              <span>{t('clientForm.contacts')} {isUnprocessed && <span className="form-asterisk">*</span>}</span>
            </label>
            <div className="space-y-2">
              {formData.contacts.map((contact, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input type="text" disabled={!canCreate} value={contact} onChange={(e) => handleContactChange(index, e.target.value)} className="input-base pl-9" />
                  {formData.contacts.length > 1 && (
                    <button type="button" disabled={!canCreate} onClick={() => removeContactField(index)} className="btn-blue-icon h-[38px] w-[38px] flex items-center justify-center shrink-0"><MdDelete size={16} /></button>
                  )}
                </div>
              ))}
              <button type="button" disabled={!canCreate} onClick={addContactField} className="flex items-center gap-1 text-[13px] text-[#1a73e8] hover:underline pt-0.5 font-medium disabled:no-underline disabled:opacity-40">
                <MdAdd size={16} /> {t('clientForm.addContact')}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label-base">
              <MdBadge size={14} className="text-[#1a73e8]" /> 
              <span>{t('clientForm.tag')} <span className="form-asterisk">*</span></span>
            </label>
            <ClientTagDropdown value={formData.tag} onChange={handleTagChange} disabled={!canCreate} tagsList={INITIAL_TAGS} />
          </div>

          <div className={`space-y-1.5 ${isGhosted ? "opacity-60" : "opacity-100"}`}>
            <label className="label-base"><MdMiscellaneousServices size={14} className="text-[#1a73e8]" /> {t('clientForm.service')}</label>
            <input 
              type="text" 
              disabled={isGhosted || !canCreate} 
              value={formData.serviceNeeded} 
              onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })} 
              className={isGhosted ? "input-ghost" : "input-base"} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-base"><MdNotes size={14} className="text-[#1a73e8]" /> {t('clientForm.notes')}</label>
            <textarea disabled={!canCreate} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-base resize-none h-auto" rows="3" />
          </div>

          <button type="submit" disabled={issubmitting || !canCreate} className={`btn-blue w-full h-[38px] ${issubmitting ? "opacity-50 cursor-wait" : ""} ${!canCreate ? "bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none hover:bg-slate-300 dark:hover:bg-slate-800" : ""}`}>
            {issubmitting ? t('common.processing') : t('clientForm.submit')}
          </button>
        </form>
      </div>
      <AnimatePresence>
        {status.msg && <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />}
      </AnimatePresence>
    </div>
  );
};
