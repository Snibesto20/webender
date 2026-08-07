import { useState, useEffect, useRef, memo } from 'react';
import { useStore } from '../store/useStore';
import { TagBadge } from './TagBadge';
import { ConfirmModal } from './ConfirmModal';
import { ClientEditModal } from './ClientEditModal';
import { AnimatePresence, motion } from 'framer-motion';
import { StatusMessage } from './StatusMessage';
import { useT } from '../i18n/useT';
import {
  MdEdit,
  MdDelete,
  MdEuro,
  MdMiscellaneousServices,
  MdPerson,
  MdContactMail,
  MdCalendarToday
} from 'react-icons/md';

const getContactLinkProps = (contactStr) => {
  const trimmed = contactStr.trim();
  if (/^\d+$/.test(trimmed)) return { href: `tel:${trimmed}`, isLink: true };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) return { href: `mailto:${trimmed}`, isLink: true };
  if (/^(https?:\/\/|www\.)/i.test(trimmed)) {
    const href = /^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed;
    return { href, isLink: true, target: '_blank', rel: 'noopener noreferrer' };
  }
  return { isLink: false };
};

export const ClientCardComponent = ({ client, onDeleteSuccess, onSaveSuccess }) => {
  const { deleteClient } = useStore();
  const user = useStore((state) => state.user);
  const { t, err, dateLocale } = useT();

  const [hasRendered, setHasRendered] = useState(false);
  const cardRef = useRef(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRendered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

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

  const formattedCreationDate = client.createdAt
    ? new Date(client.createdAt).toLocaleDateString(dateLocale, {
        year: 'numeric', month: '2-digit', day: '2-digit'
      })
    : t('common.unknownDate');

  const handleDelete = async () => {
    if (!clientId) return;
    setStatus({ type: '', msg: '' });
    setIsDeleteModalOpen(false);
    try {
      await deleteClient(clientId);
      const successMsg = err('CLIENT_DELETE_SUCCESS');
      if (onDeleteSuccess) onDeleteSuccess(successMsg);
      else setStatus({ type: 'success', msg: successMsg });
    } catch (errObj) {
      setStatus({ type: 'error', msg: err(errObj.message) });
    }
  };

  const isDisapproved = client.tag === 'disapproved';
  const isPending = client.tag === 'pending';
  const isArchived = client.tag === 'archived client';
  const isActive = client.tag === 'active client';
  const isGhosted = isDisapproved || isArchived;
  const hideBody = isDisapproved || isPending;
  const showMoney = isActive || isArchived;

  const fadeVariants = {
    initial: { opacity: 0, scale: 0.98, y: 4 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.1, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.07, ease: 'easeIn' } }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`relative bg-white dark:bg-[#292a2d] rounded border transition-all duration-300 p-4 shadow-sm group ${isGhosted ? 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/10' : 'border-[#dadce0] dark:border-[#3c4043]'}`}
        style={{ minHeight: hideBody ? '76px' : '185px' }}
      >
        {!hasRendered ? (
          <div className="animate-pulse flex space-x-4 h-full items-center">
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ) : (
          <motion.div key="view-mode" variants={fadeVariants} initial="initial" animate="animate" exit="exit">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium text-[15px] truncate ${isDisapproved ? 'text-slate-400' : isArchived ? 'text-amber-900/70 dark:text-amber-600/70' : 'text-[#202124] dark:text-[#e8eaed]'}`}>
                    {client.name}
                  </h3>
                  {showMoney && (
                    <span className="flex items-center gap-0.5 text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800/50 whitespace-nowrap">
                      {client.moneyMade?.toLocaleString() || 0} <MdEuro size={10} />
                    </span>
                  )}
                </div>
                <TagBadge tag={client.tag} />
              </div>

              {(canEdit || canDelete) && (
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  {canEdit && (
                    <button onClick={() => setIsEditModalOpen(true)} className="btn-blue-icon"><MdEdit size={16} /></button>
                  )}
                  {canDelete && (
                    <button onClick={() => setIsDeleteModalOpen(true)} className="btn-blue-icon"><MdDelete size={16} /></button>
                  )}
                </div>
              )}
            </div>

            {!hideBody && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-[13px] text-[#202124] dark:text-[#e8eaed]">
                  <div className="flex items-center gap-2 min-w-0">
                    <MdMiscellaneousServices className={`shrink-0 ${isArchived ? 'text-slate-400' : 'text-blue-600'}`} size={16} />
                    <span className={`truncate ${isArchived ? 'text-slate-500 italic' : 'font-medium'}`}>
                      {client.serviceNeeded || t('clientCard.noService')}
                    </span>
                  </div>
                </div>

                {client.contacts && client.contacts.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2 min-h-[24px]">
                    {client.contacts.map((contact, idx) => {
                      const linkProps = getContactLinkProps(contact);
                      const baseBadgeClass = 'flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-800/30 text-[11px] transition-colors max-w-[150px]';
                      if (linkProps.isLink) {
                        return (
                          <a key={idx} href={linkProps.href} target={linkProps.target} rel={linkProps.rel} className={`${baseBadgeClass} hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer`}>
                            <MdContactMail size={12} className="shrink-0" />
                            <span className="truncate">{contact}</span>
                          </a>
                        );
                      }
                      return (
                        <div key={idx} className={`${baseBadgeClass} cursor-default`}>
                          <MdContactMail size={12} className="shrink-0" />
                          <span className="truncate">{contact}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 h-[24px]" />
                )}

                <div className="h-[52px] px-3 py-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-[12px] leading-relaxed text-[#5f6368] dark:text-[#9aa0a6] overflow-hidden">
                  {client.notes?.trim() ? client.notes : t('clientCard.noNotes')}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                    <MdPerson size={12} /> {client.marketer || t('common.notSpecified')}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pl-2">
                    <MdCalendarToday size={12} className="text-slate-400/80" />
                    <span>{formattedCreationDate}</span>
                  </div>
                </div>
              </div>
            )}

            {hideBody && (
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                  <MdPerson size={12} /> {client.marketer || t('common.notSpecified')}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <MdCalendarToday size={12} />
                  <span>{formattedCreationDate}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <ConfirmModal isOpen={isDeleteModalOpen} title={t('clientCard.deleteTitle')} message={<>{t('clientCard.deleteMessage', client.name)}</>} onConfirm={handleDelete} onCancel={() => setIsDeleteModalOpen(false)} />

        <AnimatePresence>
          {status.msg && (
            <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <ClientEditModal
            client={client}
            onClose={() => setIsEditModalOpen(false)}
            onSaveSuccess={(msg) => {
              setIsEditModalOpen(false);
              if (onSaveSuccess) onSaveSuccess(msg);
              else setStatus({ type: 'success', msg });
            }}
            onDeleteSuccess={(msg) => {
              setIsEditModalOpen(false);
              if (onDeleteSuccess) onDeleteSuccess(msg);
              else setStatus({ type: 'success', msg });
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const ClientCard = memo(ClientCardComponent);
export default ClientCard;
