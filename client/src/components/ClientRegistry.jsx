import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MdPeople } from 'react-icons/md';
import { ConfirmModal } from './ConfirmModal';
import { ClientModal } from './ClientModal';
import { AnimatePresence } from 'framer-motion';
import { StatusMessage } from './StatusMessage';
import { ComponentHeader } from '../components/headers/ComponentHeader';
import { useT } from '../i18n/useT';

export const ClientRegistry = ({ onSelect }) => {
  const clients = useStore((state) => state.clients);
  const deleteClient = useStore((state) => state.deleteClient);
  const updateClient = useStore((state) => state.updateClient);
  const { t, err } = useT();
  
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [selectedClient, setSelectedClient] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const searchQuery = search.toUpperCase().trim();

  const filteredClients = (clients || []).filter(client => {
    const matchName = client.name?.toUpperCase().includes(searchQuery);
    const matchContacts = client.contacts?.some(contact => contact?.toUpperCase().includes(searchQuery));
    return matchName || matchContacts;
  });

  const filteredNames = [...new Set(filteredClients.map(c => c.name.toUpperCase()))].sort();

  useEffect(() => {
    if (selectedClient) {
      const currentId = selectedClient._id || selectedClient.id;
      const freshData = clients.find(c => (c._id || c.id) === currentId);
      if (freshData) setSelectedClient(freshData);
    }
  }, [clients, selectedClient]);

  const handleSaveClient = async (updatedData) => {
    if (updateClient && selectedClient) {
      const clientId = selectedClient._id || selectedClient.id;
      try {
        setStatus({ type: '', msg: '' });
        await updateClient(clientId, updatedData);
        setSelectedClient(prevState => ({ ...prevState, ...updatedData }));
        setStatus({ type: 'success', msg: t('clientRegistry.updateSuccess') });
      } catch (errObj) {
        const backendCode = errObj.message;
        const errorMsg = err(backendCode);
        setStatus({ type: 'error', msg: errorMsg });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    const targetId = deleteModal.id;
    setStatus({ type: '', msg: '' });
    setDeleteModal({ isOpen: false, id: null, name: '' });

    if (!targetId) return;

    try {
      await deleteClient(targetId);
      if ((selectedClient?._id === targetId) || (selectedClient?.id === targetId)) {
        setSelectedClient(null);
      }
      setStatus({ type: 'success', msg: err('CLIENT_DELETE_SUCCESS') });
    } catch (errObj) {
      const backendCode = errObj.message;
      const errorMsg = err(backendCode);
      setStatus({ type: 'error', msg: errorMsg });
    }
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white dark:bg-[#292a2d] rounded shadow-sm overflow-hidden">
        <ComponentHeader title={t('clientRegistry.title')} icon={MdPeople} />
        
        <div className="p-4 border-b border-[#dadce0] dark:border-[#3c4043] bg-[#f8f9fa]/50 dark:bg-[#202124]/30 shrink-0">
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder={t('common.search')}
            className="input-base pl-9 pr-3 h-[38px]" 
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ul className="divide-y divide-[#dadce0] dark:divide-[#3c4043]">
            {filteredNames.length > 0 ? (
              filteredNames.map(name => {
                const found = clients.find(c => c.name.toUpperCase() === name);
                return (
                  <li key={name} onClick={() => { if (onSelect) { onSelect(found); } else { setSelectedClient(found); } }} className="group flex items-center justify-between px-6 py-3 hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043]/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 min-w-0 pr-4">
                      <span className="text-[13px] text-[#202124] dark:text-[#e8eaed] truncate font-medium">{name}</span>
                    </div>
                  </li>
                );
              })
            ) : (
              <div className="p-8 text-center text-[12px] text-gray-400 italic">{t('common.notFound')}</div>
            )}
          </ul>
        </div>
      </div>
      
      <AnimatePresence>
        {selectedClient && (
          <ClientModal client={selectedClient} onClose={() => setSelectedClient(null)} onSave={handleSaveClient} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal.isOpen && (
          <ConfirmModal
            title={t('clientRegistry.deleteTitle')}
            message={<>{t('clientRegistry.deleteMessage', deleteModal.name)} <br /><span className="text-blue-600 text-[12px] font-medium">{t('clientRegistry.deleteWarning')}</span></>}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status.msg && <StatusMessage type={status.type} msg={status.msg} onClose={() => setStatus({ type: '', msg: '' })} />}
      </AnimatePresence>
    </>
  );
};
