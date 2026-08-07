import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdLock, MdLogin } from 'react-icons/md';
import { AnimatePresence } from 'framer-motion';
import { StatusMessage } from '../components/StatusMessage';
import { useT } from '../i18n/useT';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const { t, err } = useT();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (!username.trim() || !password) {
      setStatus({ type: 'error', msg: err('AUTH_CREDENTIALS_REQUIRED') });
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.success) {
        setStatus({ type: 'success', msg: err('AUTH_LOGIN_SUCCESS') });
        setTimeout(() => navigate('/'), 400);
      } else {
        setStatus({ type: 'error', msg: err(result.code) || err('AUTH_INVALID_CREDENTIALS') });
        setPassword('');
      }
    } catch {
      setStatus({ type: 'error', msg: err('AUTH_SERVER_ERROR') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#202124] p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-[#292a2d] p-6 sm:p-8 rounded-lg shadow-xl border border-[#dadce0] dark:border-[#3c4043] w-full max-w-[380px]"
      >
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold dark:text-white">
            <span className="text-[#1a73e8]">Webend</span> CRM
          </h1>
          <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] mt-1">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="space-y-1.5">
            <label className="label-base">
              <MdPerson size={14} className="text-[#1a73e8]" /> {t('login.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setStatus({ type: '', msg: '' }); }}
              className="input-base"
              placeholder={t('login.usernamePlaceholder')}
              autoFocus
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="label-base">
              <MdLock size={14} className="text-[#1a73e8]" /> {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setStatus({ type: '', msg: '' }); }}
              className="input-base"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-blue w-full h-[40px] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <MdLogin size={18} />
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>

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
