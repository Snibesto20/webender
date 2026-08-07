import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ComponentHeader } from '../components/headers/ComponentHeader';
import { ConfirmModal } from '../components/ConfirmModal';
import { StatusMessage } from '../components/StatusMessage';
import { ClientModal } from '../components/ClientModal';
import { ClientSearchSelect } from '../components/ClientSearchSelect';
import { useT } from '../i18n/useT';
import {
  MdEvent, MdAdd, MdDelete, MdEdit, MdCheck, MdClose,
  MdNotes, MdCalendarToday, MdBusiness, MdArchive, MdEventNote, MdPerson
} from 'react-icons/md';

const EventsHeader = ({ title }) => (
  <header className="page-header">
    <h1 className="text-[16px] sm:text-[18px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">
      <span className="text-[#1a73e8] font-bold">Webend</span> {title}
    </h1>
  </header>
);

const toLocalInputValue = (date) => {
  const d = date ? new Date(date) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const EventsPage = () => {
  const {
    events, fetchEvents, addEvent, updateEvent, deleteEvent,
    clients, fetchClients, updateClient, user
  } = useStore();
  const { t, err, dateLocale } = useT();

  const isGuest = user?.role === 'guest';
  const canWrite = user?.role === 'admin' || user?.role === 'marketing' || isGuest;

  const [tab, setTab] = useState('active');
  const [form, setForm] = useState({ note: '', date: toLocalInputValue(), clientId: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ note: '', date: '', clientId: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, note: '' });
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
    if (!clients?.length) fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const currentId = selectedClient._id || selectedClient.id;
      const fresh = clients.find(c => (c._id || c.id) === currentId);
      if (fresh) setSelectedClient(fresh);
      else setSelectedClient(null);
    }
  }, [clients, selectedClient]);

  const activeEvents = useMemo(
    () => (events || []).filter(e => !e.archived).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events]
  );
  const archivedEvents = useMemo(
    () => (events || []).filter(e => e.archived).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [events]
  );

  const visible = tab === 'active' ? activeEvents : archivedEvents;

  const resolveClient = (event) => {
    if (event.client?.name) return event.client;
    if (event.clientId?.name) return event.clientId;
    const id = event.clientId?._id || event.clientId;
    if (!id) return null;
    return clients.find(c => String(c._id || c.id) === String(id)) || null;
  };

  const canModifyEvent = (event) => {
    if (user?.role === 'admin' || user?.role === 'marketing') return true;
    if (isGuest && event.isGuestSimulated) return true;
    return false;
  };

  const openClientPopup = (event) => {
    const linked = resolveClient(event);
    if (linked) setSelectedClient(linked);
  };

  const handleSaveClient = async (updatedData) => {
    if (!selectedClient) return;
    const clientId = selectedClient._id || selectedClient.id;
    await updateClient(clientId, updatedData);
    setSelectedClient(prev => ({ ...prev, ...updatedData }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canWrite) {
      setStatus({ type: 'error', msg: err('CLIENT_GUEST_FORBIDDEN') });
      return;
    }
    setStatus({ type: '', msg: '' });
    if (!form.note.trim()) {
      setStatus({ type: 'error', msg: err('EVENT_NOTE_REQUIRED') });
      return;
    }
    if (!form.date) {
      setStatus({ type: 'error', msg: err('EVENT_DATE_REQUIRED') });
      return;
    }

    setSubmitting(true);
    try {
      const created = await addEvent({
        note: form.note.trim(),
        date: new Date(form.date).toISOString(),
        clientId: form.clientId || null
      });
      setForm({ note: '', date: toLocalInputValue(), clientId: '' });
      setStatus({
        type: 'success',
        msg: created?._guestSimulated ? err('EVENT_GUEST_SIMULATED') : err('EVENT_CREATE_SUCCESS')
      });
      if (!created?._guestSimulated) await fetchEvents();
    } catch (errObj) {
      setStatus({ type: 'error', msg: err(errObj.message) || err('EVENT_CREATE_ERROR') });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (event) => {
    if (!canModifyEvent(event)) return;
    setEditingId(event._id || event.id);
    setEditForm({
      note: event.note || '',
      date: toLocalInputValue(event.date),
      clientId: event.clientId?._id || event.clientId || ''
    });
  };

  const handleUpdate = async (id) => {
    setStatus({ type: '', msg: '' });
    try {
      await updateEvent(id, {
        note: editForm.note.trim(),
        date: new Date(editForm.date).toISOString(),
        clientId: editForm.clientId || null
      });
      setEditingId(null);
      setStatus({ type: 'success', msg: err('EVENT_UPDATE_SUCCESS') });
      const existing = events.find(e => (e._id || e.id) === id);
      if (!existing?.isGuestSimulated) await fetchEvents();
    } catch (errObj) {
      setStatus({ type: 'error', msg: err(errObj.message) || err('EVENT_UPDATE_ERROR') });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteEvent(deleteModal.id);
      setStatus({ type: 'success', msg: err('EVENT_DELETE_SUCCESS') });
    } catch (errObj) {
      setStatus({ type: 'error', msg: err(errObj.message) || err('EVENT_DELETE_ERROR') });
    }
    setDeleteModal({ isOpen: false, id: null, note: '' });
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString(dateLocale, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] dark:bg-[#1e1e1e]">
      <EventsHeader title={t('events.title')} />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={t('events.deleteTitle')}
        message={t('events.deleteMessage', deleteModal.note)}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null, note: '' })}
      />

      <main className="flex-1 overflow-y-auto page-pad">
        <div className="page-max space-y-4 sm:space-y-6">
          {canWrite && (
            <div className="panel">
              <ComponentHeader title={t('events.newEvent')} icon={MdAdd} />
              <form onSubmit={handleCreate} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                <div className="space-y-1.5 lg:col-span-5">
                  <label className="label-base"><MdNotes size={14} className="text-[#1a73e8]" /> {t('events.note')}</label>
                  <input
                    type="text"
                    className="input-base"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder={t('events.notePlaceholder')}
                  />
                </div>
                <div className="space-y-1.5 lg:col-span-3">
                  <label className="label-base"><MdCalendarToday size={14} className="text-[#1a73e8]" /> {t('events.dateTime')}</label>
                  <input
                    type="datetime-local"
                    className="input-base"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 lg:col-span-2">
                  <label className="label-base">
                    <MdBusiness size={14} className="text-[#1a73e8]" />
                    <span>{t('events.client')}</span>
                  </label>
                  <ClientSearchSelect
                    clients={clients}
                    value={form.clientId}
                    onChange={(id) => setForm({ ...form, clientId: id })}
                  />
                </div>
                <div className="lg:col-span-2">
                  <button type="submit" disabled={submitting} className="btn-blue h-[38px] w-full">
                    {submitting ? t('common.saving') : t('events.addEvent')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="panel">
            <ComponentHeader title={t('events.list')} icon={MdEvent}>
              <div className="flex bg-[#f1f3f4] dark:bg-[#3c4043] p-0.5 rounded border border-[#dadce0] dark:border-[#5f6368] text-[12px] sm:text-[13px]">
                <button
                  type="button"
                  onClick={() => setTab('active')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded font-medium transition-all ${tab === 'active' ? 'bg-white dark:bg-[#202124] text-[#1a73e8] shadow-sm' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
                >
                  <MdEventNote size={14} /> {t('events.active')} ({activeEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('archived')}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded font-medium transition-all ${tab === 'archived' ? 'bg-white dark:bg-[#202124] text-[#1a73e8] shadow-sm' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
                >
                  <MdArchive size={14} /> {t('events.archive')} ({archivedEvents.length})
                </button>
              </div>
            </ComponentHeader>

            <div className="p-4 sm:p-6">
              {visible.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-[#5f6368] italic">
                  {tab === 'active' ? t('events.noActive') : t('events.archiveEmpty')}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {visible.map((event) => {
                    const id = event._id || event.id;
                    const linked = resolveClient(event);
                    const isEditing = editingId === id;
                    const canModify = canModifyEvent(event);

                    return (
                      <div
                        key={id}
                        className="relative bg-white dark:bg-[#292a2d] rounded border border-[#dadce0] dark:border-[#3c4043] transition-all duration-300 p-4 shadow-sm group"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <input className="input-base" value={editForm.note} onChange={(e) => setEditForm({ ...editForm, note: e.target.value })} />
                            <div className="grid grid-cols-1 gap-3">
                              <input type="datetime-local" className="input-base" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                              <ClientSearchSelect
                                clients={clients}
                                value={editForm.clientId}
                                onChange={(cid) => setEditForm({ ...editForm, clientId: cid })}
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button type="button" onClick={() => setEditingId(null)} className="btn-blue-icon"><MdClose size={16} /></button>
                              <button type="button" onClick={() => handleUpdate(id)} className="p-1.5 rounded text-white bg-[#1a73e8] hover:bg-[#1557b0]"><MdCheck size={16} /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-medium text-[15px] text-[#202124] dark:text-[#e8eaed] break-words min-w-0 flex-1">
                                {event.note}
                              </p>
                              {canModify && (
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                  <button type="button" onClick={() => startEdit(event)} className="btn-blue-icon"><MdEdit size={16} /></button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteModal({ isOpen: true, id, note: event.note })}
                                    className="btn-blue-icon"
                                  >
                                    <MdDelete size={16} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {linked ? (
                              <button
                                type="button"
                                onClick={() => openClientPopup(event)}
                                className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-800/30 text-[11px] hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer max-w-full"
                              >
                                <MdBusiness size={12} className="shrink-0" />
                                <span className="truncate">{linked.name}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 italic">
                                {t('events.generalReminder')}
                              </span>
                            )}

                            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                <MdPerson size={12} /> {event.createdByName || t('common.notSpecified')}
                              </div>
                              <div className="flex items-center gap-1 shrink-0 pl-2">
                                <MdCalendarToday size={12} className="text-slate-400/80" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedClient && (
          <ClientModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onSave={handleSaveClient}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status.msg && <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage;
