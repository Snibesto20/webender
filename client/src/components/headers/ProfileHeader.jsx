import { useT } from '../../i18n/useT';

export const ProfileHeader = () => {
  const { t } = useT();
  return (
    <header className="page-header">
      <h1 className="text-[16px] sm:text-[18px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">
        <span className="text-[#1a73e8] font-bold">Webend</span> {t('profile.title')}
      </h1>
    </header>
  );
};
