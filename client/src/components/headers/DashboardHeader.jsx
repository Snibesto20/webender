import { useStore } from '../../store/useStore';
import { MdVisibility, MdVisibilityOff, MdEuro, MdPeople, MdPhoneInTalk } from 'react-icons/md';
import { useT } from '../../i18n/useT';

export const DashboardHeader = () => {
  const {
    showTrash,
    toggleTrash,
    clients,
    filterType,
    setFilterType
  } = useStore();
  const { t } = useT();

  const totalEarnings = (clients || []).reduce((sum, client) => sum + (client.moneyMade || 0), 0);
  const isUnprocessed = filterType === 'unprocessed';

  return (
    <header className="min-h-[48px] border-b border-[#dadce0] dark:border-[#3c4043] flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2 bg-white dark:bg-[#292a2d] shadow-sm shrink-0">
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        <h1 className="text-[15px] sm:text-[18px] font-medium text-[#5f6368] dark:text-[#9aa0a6] truncate">
          <span className="text-[#1a73e8] font-bold">Webend</span>
          <span className="hidden xs:inline sm:inline"> {t('dashboard.title')}</span>
        </h1>

        {!isUnprocessed && (
          <button
            onClick={toggleTrash}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] text-[12px] sm:text-[13px] transition-colors border border-transparent hover:border-[#dadce0] dark:hover:border-[#5f6368] shrink-0"
          >
            {showTrash ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            <span className="hidden sm:inline">{showTrash ? t('dashboard.hideTrash') : t('dashboard.showTrash')}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex bg-[#f1f3f4] dark:bg-[#3c4043] p-0.5 rounded border border-[#dadce0] dark:border-[#5f6368] text-[12px] sm:text-[13px]">
          <button
            onClick={() => setFilterType('processed')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded transition-all font-medium ${!isUnprocessed ? 'bg-white dark:bg-[#202124] text-[#1a73e8] shadow-sm' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
          >
            <MdPeople size={16} /> <span className="hidden sm:inline">{t('dashboard.processed')}</span>
          </button>
          <button
            onClick={() => setFilterType('unprocessed')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded transition-all font-medium ${isUnprocessed ? 'bg-white dark:bg-[#202124] text-[#1a73e8] shadow-sm' : 'text-[#5f6368] dark:text-[#9aa0a6]'}`}
          >
            <MdPhoneInTalk size={14} /> <span className="hidden sm:inline">{t('dashboard.unprocessed')}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 py-1 rounded-full border border-green-200 dark:border-green-800/50">
          <MdEuro size={14} />
          <span>{totalEarnings.toLocaleString()}</span>
        </div>
      </div>
    </header>
  );
};
