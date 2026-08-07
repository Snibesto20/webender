import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { TopNavbar } from './components/TopNavbar';
import { Dashboard } from './pages/Dashboard';
import { UserManager } from './pages/UserManager';
import { Login } from './pages/Login';
import { EmailPage } from './pages/EmailPage';
import { Profile } from './pages/Profile';
import { EventsPage } from './pages/EventsPage';
import { useT } from './i18n/useT';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useStore();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useStore();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/" />;

  return children;
};

function App() {
  const {
    initUI, verifyAuth, fetchClients, fetchUsers, fetchEvents,
    isLoading, isAuthenticated, user
  } = useStore();
  const { t } = useT();

  useEffect(() => {
    initUI();
    verifyAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchClients();
      fetchEvents();
      if (user.role === 'admin') {
        fetchUsers();
      }
    }
  }, [isAuthenticated, user]);

  if (isLoading && isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-[#1e1e1e] text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8] mb-4"></div>
        <div className="italic tracking-wide font-medium">{t('app.loading')}</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#1e1e1e] overflow-hidden font-sans">
        {isAuthenticated && <TopNavbar />}

        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Routes>
            <Route path="/login" element={
              !isAuthenticated
                ? <Login />
                : <Navigate to="/" />
            } />

            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/email" element={
              <PrivateRoute>
                <EmailPage />
              </PrivateRoute>
            } />

            <Route path="/events" element={
              <PrivateRoute>
                <EventsPage />
              </PrivateRoute>
            } />

            <Route path="/users" element={
              <AdminRoute>
                <UserManager />
              </AdminRoute>
            } />

            <Route path="/keys" element={<Navigate to="/users" replace />} />

            <Route path="/settings" element={
              <AdminRoute>
                <div className="page-pad dark:text-white text-2xl">{t('app.settingsStub')}</div>
              </AdminRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
