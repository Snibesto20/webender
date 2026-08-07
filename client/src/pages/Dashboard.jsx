import { useState } from 'react';
import { ClientForm } from '../components/ClientForm';
import { CardList } from '../components/CardList';
import { ClientRegistry } from '../components/ClientRegistry';
import { DashboardHeader } from '../components/headers/DashboardHeader';
import { MdClose, MdPersonAdd } from 'react-icons/md';
import { useT } from '../i18n/useT';

export const Dashboard = () => {
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const { t } = useT();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8f9fa] dark:bg-[#1e1e1e]">
      <DashboardHeader />
      <div className="flex-1 flex overflow-hidden page-pad gap-4 sm:gap-6 min-h-0">
        <aside className="w-[280px] shrink-0 hidden md:block border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] rounded shadow-sm overflow-hidden">
          <ClientForm />
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
          <CardList />
        </main>

        <aside className="w-[260px] shrink-0 hidden xl:block border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] rounded shadow-sm overflow-hidden">
          <ClientRegistry />
        </aside>
      </div>

      <button
        type="button"
        onClick={() => setMobileFormOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 btn-blue h-12 w-12 rounded-full shadow-lg flex items-center justify-center"
        aria-label={t('dashboard.newClient')}
      >
        <MdPersonAdd size={22} />
      </button>

      {mobileFormOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end">
          <div className="bg-white dark:bg-[#202124] rounded-t-xl max-h-[90vh] overflow-hidden flex flex-col border-t border-[#dadce0] dark:border-[#3c4043]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#dadce0] dark:border-[#3c4043]">
              <span className="text-[14px] font-medium dark:text-white">{t('dashboard.newClient')}</span>
              <button type="button" onClick={() => setMobileFormOpen(false)} className="btn-blue-icon">
                <MdClose size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ClientForm onSuccess={() => setMobileFormOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
