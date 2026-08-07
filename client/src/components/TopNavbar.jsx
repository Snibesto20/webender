import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link, useLocation } from 'react-router-dom';
import { ROLE_BADGE } from '../config';
import { useT } from '../i18n/useT';
import {
  MdExitToApp, MdSecurity,
  MdTrendingUp, MdPerson, MdDashboard,
  MdPeople, MdEmail, MdSettings, MdEvent, MdMenu, MdClose, MdPersonOutline
} from 'react-icons/md';

const RoleIcon = ({ role }) => {
  if (role === 'admin') return <MdSecurity size={10} />;
  if (role === 'marketing') return <MdTrendingUp size={10} />;
  return <MdPersonOutline size={10} />;
};

export const TopNavbar = () => {
  const { initUI, logout, isAuthenticated, user } = useStore();
  const { t, role: roleLabel } = useT();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    initUI();
  }, [initUI]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated || !user) return null;

  const userRole = user.role;
  const username = user.username;
  const badgeStyle = ROLE_BADGE[userRole] || ROLE_BADGE.guest;
  const badgeText = roleLabel(userRole);

  const getNavLinks = () => {
    const links = [
      { name: t('nav.clients'), path: '/', icon: <MdDashboard size={14} /> },
      { name: t('nav.events'), path: '/events', icon: <MdEvent size={14} /> },
      { name: t('nav.emails'), path: '/email', icon: <MdEmail size={14} /> },
      { name: t('nav.profile'), path: '/profile', icon: <MdSettings size={14} /> }
    ];
    if (userRole === 'admin') {
      links.splice(1, 0, { name: t('nav.users'), path: '/users', icon: <MdPeople size={14} /> });
    }
    return links;
  };

  const navLinks = getNavLinks();

  const linkClass = (path) =>
    `text-[12px] px-2.5 py-1.5 sm:py-0.5 rounded transition-all flex items-center gap-1.5 ${
      location.pathname === path
        ? 'bg-[#e1e1e1] dark:bg-[#333333] text-[#1a73e8] font-bold'
        : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#e8eaed] dark:hover:bg-[#2d2d2d]'
    }`;

  const RoleBadge = ({ className = '' }) => (
    <div className={`flex items-center gap-1 text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded border ${badgeStyle.className} ${className}`}>
      <RoleIcon role={userRole} /> {badgeText.short}
    </div>
  );

  return (
    <nav className="min-h-[40px] sm:h-[30px] bg-[#f3f3f3] dark:bg-[#1e1e1e] flex flex-col border-b border-[#dadce0] dark:border-[#3c4043] shrink-0 z-50 select-none">
      <div className="flex items-center px-3 gap-2 h-[40px] sm:h-[30px]">
        <button
          type="button"
          className="sm:hidden p-1.5 rounded hover:bg-[#e8eaed] dark:hover:bg-[#2d2d2d] text-[#5f6368]"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={t('nav.menu')}
        >
          {menuOpen ? <MdClose size={18} /> : <MdMenu size={18} />}
        </button>

        <div className="hidden sm:flex items-center flex-1 min-w-0 overflow-x-auto">
          {navLinks.map((link, idx) => (
            <div key={link.path} className="flex items-center shrink-0">
              <Link to={link.path} className={linkClass(link.path)}>
                <span className="opacity-70">{link.icon}</span>
                {link.name}
              </Link>
              {idx < navLinks.length - 1 && (
                <div className="h-3 w-[1px] bg-[#dadce0] dark:bg-[#3c4043] mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="sm:hidden flex-1 text-[13px] font-medium text-[#1a73e8] truncate">
          Webend CRM
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-3 pr-3 ml-1 border-r border-[#dadce0] dark:border-[#3c4043]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <MdPerson size={14} className="text-[#1a73e8] opacity-80" />
              <span className="max-w-[120px] truncate">{username || t('nav.user')}</span>
            </div>
            <RoleBadge />
          </div>

          <button
            onClick={logout}
            className="text-[12px] text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 font-medium"
          >
            <MdExitToApp size={14} />
            <span className="hidden sm:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-0.5 px-3 pb-3 border-t border-[#dadce0] dark:border-[#3c4043] bg-[#f3f3f3] dark:bg-[#1e1e1e]">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={linkClass(link.path)}>
              <span className="opacity-70">{link.icon}</span>
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-2 pt-2 mt-1 border-t border-[#dadce0] dark:border-[#3c4043] text-[11px] text-slate-600 dark:text-slate-300">
            <MdPerson size={14} className="text-[#1a73e8]" />
            <span className="truncate">{username}</span>
            <RoleBadge className="ml-auto" />
          </div>
        </div>
      )}
    </nav>
  );
};
