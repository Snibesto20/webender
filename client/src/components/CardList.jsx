import { useMemo, useState, memo } from 'react';
import { useStore } from '../store/useStore';
import { TAG_PRIORITY } from "../config";
import { ClientCard } from './ClientCard';
import { MdViewModule } from 'react-icons/md';
import { AnimatePresence } from 'framer-motion';
import { StatusMessage } from './StatusMessage';
import { ComponentHeader } from '../components/headers/ComponentHeader';
import { useT } from '../i18n/useT';

const MemoizedClientCard = memo(ClientCard);

export const CardList = () => {
  const clients = useStore((state) => state.clients);
  const showTrash = useStore((state) => state.showTrash);
  const filterType = useStore((state) => state.filterType);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const { t } = useT();

  const sortedClients = useMemo(() => {
    const filtered = [...clients].filter(c => {
      const tag = c.tag?.toLowerCase();

      if (filterType === 'unprocessed') {
        return tag === 'unprocessed';
      }

      if (tag === 'unprocessed') {
        return false;
      }

      if (!showTrash) {
        return !['disapproved', 'archived client'].includes(tag);
      }

      return true;
    });

    return filtered.sort((a, b) => {
      const prioB = TAG_PRIORITY[b.tag] || TAG_PRIORITY[b.tag?.toLowerCase()] || 0;
      const prioA = TAG_PRIORITY[a.tag] || TAG_PRIORITY[a.tag?.toLowerCase()] || 0;
      return prioB - prioA;
    });
  }, [clients, showTrash, filterType]);

  const handleActionSuccess = (msg) => {
    setStatus({ type: 'success', msg });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#292a2d] border border-[#dadce0] dark:border-[#3c4043] rounded shadow-sm overflow-hidden relative">
      <div className="border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between pr-6">
        <div className="flex-1">
          <ComponentHeader title={t('dashboard.clientList')} icon={MdViewModule} />
        </div>
        <span className="text-[12px] bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] px-2.5 py-0.5 rounded-full font-medium shrink-0">
          {sortedClients.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {sortedClients.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#5f6368] dark:text-[#9aa0a6] text-sm italic">
            {t('dashboard.emptyList')}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 auto-rows-max">
            {sortedClients.map(client => (
              <MemoizedClientCard 
                key={client._id || client.id} 
                client={client} 
                onDeleteSuccess={handleActionSuccess}
                onSaveSuccess={handleActionSuccess}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {status.msg && (
          <StatusMessage 
            type={status.type} 
            msg={status.msg} 
            onClose={() => setStatus({ type: '', msg: '' })} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
