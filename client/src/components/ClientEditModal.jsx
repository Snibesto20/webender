import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ConfirmModal } from './ConfirmModal';
import { ComponentHeader } from './headers/ComponentHeader';
import { CLIENT_TAGS_CONFIG } from '../config';
import { useT } from '../i18n/useT';
import {
  MdEdit, MdDelete, MdCheck, MdClose, MdEuro,
  MdMiscellaneousServices, MdNotes, MdPerson,
  MdContactMail, MdAdd, MdBadge
} from 'react-icons/md';

const ALL_TAGS = [
  'potential 1', 'potential 2', 'potential 3', 'potential 4', 'potential 5',
  'potential 6', 'potential 7', 'potential 8', 'potential 9', 'potential 10',
  'pending', 'approved', 'active client', 'archived client', 'disapproved', 'unprocessed'
];

const formatPhoneNumber = (contactStr) => {
  const trimmed = contactStr.trim();
  if (!trimmed) return '';
  const hasLetters = /[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ]/i.test(trimmed);
  if (hasLetters) return trimmed;
  let cleaned = trimmed.replace(/\D/g, '');
  if (!cleaned) return trimmed;
  if (cleaned.startsWith('370')) cleaned = '0' + cleaned.substring(3);
  else if (cleaned.startsWith('8')) cleaned = '0' + cleaned.substring(1);
  return cleaned;
};

export const ClientEditModal = ({ client, onClose, onSaveSuccess, onDeleteSuccess }) => {
  const { updateClient, deleteClient } = useStore();
  const user = useStore((state) => state.user);
  const { t, err, tag: tagLabel } = useT();
  const modalRef = useRef(null);

  const [editData, setEditData] = useState(() => ({
    ...client,
    contacts: client?.contacts || ['']
  }));
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setEditData({ ...client, contacts: client.contacts || [''] });
    }
  }, [client]);

  if (!client) return null;

  const isAdmin = user?.role === 'admin';
  const isMarketing = user?.role === 'marketing';
  const isGuest = user?.role === 'guest';
  const isSimulated = Boolean(client.isGuestSimulated);
  const isOwner = (
    (client.createdBy && String(client.createdBy) === String(user?._id || user?.id)) ||
    (client.marketer && client.marketer === user?.username)
  );
  const canEdit = isAdmin || (isMarketing && isOwner) || (isGuest && isSimulated);
  const canDelete = isAdmin || (isMarketing && isOwner) || (isGuest && isSimulated);
  const clientId = client._id || client.id;

  const isActive = editData.tag === 'active client';
  const isArchived = editData.tag === 'archived client';
  const showMoney = isActive || isArchived;
  const isServiceInputGhosted = editData.tag === 'disapproved' || editData.tag === 'unprocessed';

  const handleTagChange = (newTag) => {
    setEditData((prev) => ({
      ...prev,
      tag: newTag,
      serviceNeeded: newTag === 'unprocessed' ? '' : prev.serviceNeeded
    }));
  };

  const handleSave = async () => {
    if (!canEdit || !clientId) return;
    setError('');

    const isEditUnprocessed = editData.tag === 'unprocessed';
    if (isEditUnprocessed && (editData.serviceNeeded || '').trim()) {
      setError(t('clientCard.unprocessedNoService'));
      return;
    }

    const filteredEditContacts = (editData.contacts || [])
      .map(c => formatPhoneNumber(c))
      .filter(c => c.trim() !== '');

    setIsSubmitting(true);
    try {
      await updateClient(clientId, {
        ...editData,
        name: (editData.name || '').trim(),
        serviceNeeded: isEditUnprocessed ? '' : (editData.serviceNeeded || '').trim(),
        notes: (editData.notes || '').trim(),
        moneyMade: Number(editData.moneyMade || 0),
        contacts: filteredEditContacts
      });
      onSaveSuccess?.(err('CLIENT_UPDATE_SUCCESS'));
      onClose();
    } catch (errObj) {
      let errorMsg = err(errObj.message);
      if (errObj.message === 'CLIENT_DUPLICATE_NAME' && errObj.meta?.name) {
        errorMsg = t('clientCard.duplicateName', errObj.meta.name);
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!clientId) return;
    setIsDeleteModalOpen(false);
    try {
      await deleteClient(clientId);
      onDeleteSuccess?.(err('CLIENT_DELETE_SUCCESS'));
      onClose();
    } catch (errObj) {
      setError(err(errObj.message));
    }
  };

  const handleContactChange = (index, value) => {
    const newContacts = [...(editData.contacts || [])];
    newContacts[index] = value;
    setEditData({ ...editData, contacts: newContacts });
  };

  const addContactField = () => {
    setEditData({ ...editData, contacts: [...(editData.contacts || []), ''] });
  };

  const removeContactField = (index) => {
    const newContacts = (editData.contacts || []).filter((_, i) => i !== index);
    setEditData({ ...editData, contacts: newContacts.length ? newContacts : [''] });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] overflow-hidden"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isDeleteModalOpen) onClose();
        }}
      >
        <div
          ref={modalRef}
          className={`bg-white dark:bg-[#292a2d] w-full max-w-lg rounded border border-[#dadce0] dark:border-[#3c4043] shadow-xl overflow-hidden flex flex-col ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <ComponentHeader
            title={t('clientModal.editTitle')}
            icon={MdEdit}
            onClose={onClose}
          />

          <div className="p-5 overflow-y-auto max-h-[80vh] bg-[#f8f9fa]/30 dark:bg-[#202124]/10 space-y-4">
            <div className="space-y-1.5">
              <label className="label-base"><MdPerson size={14} className="text-[#1a73e8]" /> {t('clientCard.name')}</label>
              <input type="text" className="input-base" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} disabled={!canEdit} />
            </div>

            <div className="space-y-1.5">
              <label className="label-base"><MdContactMail size={14} className="text-[#1a73e8]" /> {t('clientCard.contacts')}</label>
              <div className="space-y-2">
                {(editData.contacts || []).map((contact, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input type="text" className="input-base flex-1" value={contact} onChange={(e) => handleContactChange(index, e.target.value)} disabled={!canEdit} />
                    {canEdit && editData.contacts.length > 1 && (
                      <button type="button" onClick={() => removeContactField(index)} className="btn-blue-icon h-[38px] w-[38px] flex items-center justify-center shrink-0"><MdDelete size={16} /></button>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <button type="button" onClick={addContactField} className="flex items-center gap-1 text-[13px] text-[#1a73e8] hover:underline pt-0.5 font-medium">
                    <MdAdd size={16} /> {t('clientCard.addContact')}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-base"><MdBadge size={14} className="text-[#1a73e8]" /> {t('clientCard.tag')}</label>
              <select className={`input-base capitalize ${CLIENT_TAGS_CONFIG[editData.tag]?.colorClass || ''}`} value={editData.tag} onChange={(e) => handleTagChange(e.target.value)} disabled={!canEdit}>
                {ALL_TAGS.map(tagKey => (
                  <option key={tagKey} value={tagKey} className={CLIENT_TAGS_CONFIG[tagKey]?.colorClass || ''}>{tagLabel(tagKey)}</option>
                ))}
              </select>
            </div>

            {showMoney && (
              <div className="space-y-1.5">
                <label className="label-base"><MdEuro size={14} className="text-[#1a73e8]" /> {t('clientCard.money')}</label>
                <div className="relative">
                  <MdEuro className="absolute left-2.5 top-2.5 text-slate-500" size={16} />
                  <input type="number" className="input-base pl-9" value={editData.moneyMade || 0} onChange={(e) => setEditData({ ...editData, moneyMade: parseFloat(e.target.value) || 0 })} disabled={!canEdit} />
                </div>
              </div>
            )}

            <div className={`space-y-1.5 ${isServiceInputGhosted ? 'opacity-60' : 'opacity-100'}`}>
              <label className="label-base"><MdMiscellaneousServices size={14} className="text-[#1a73e8]" /> {t('clientCard.service')}</label>
              <input
                type="text"
                disabled={isServiceInputGhosted || !canEdit}
                value={editData.serviceNeeded || ''}
                onChange={(e) => setEditData({ ...editData, serviceNeeded: e.target.value })}
                className={isServiceInputGhosted ? 'input-ghost' : 'input-base'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="label-base"><MdNotes size={14} className="text-[#1a73e8]" /> {t('clientCard.notes')}</label>
              <textarea
                className="input-base resize-none !h-[96px]"
                rows={3}
                value={editData.notes || ''}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                disabled={!canEdit}
                placeholder={t('clientCard.noNotes')}
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
            )}

            {canEdit && (
              <div className="flex gap-2 justify-between pt-2">
                {canDelete ? (
                  <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="btn-blue-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <MdDelete size={16} />
                  </button>
                ) : <span />}
                <div className="flex gap-2">
                  <button type="button" onClick={onClose} className="p-1.5 rounded text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors">
                    <MdClose size={16} />
                  </button>
                  <button type="button" onClick={handleSave} className="p-1.5 rounded text-white bg-[#1a73e8] hover:bg-[#1557b0] transition-colors shadow-sm">
                    <MdCheck size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={t('clientCard.deleteTitle')}
        message={<>{t('clientCard.deleteMessage', client.name)}</>}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default ClientEditModal;
