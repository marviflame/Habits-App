import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { useAuthStore } from './store/authStore';
import { api } from './lib/api';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HabitsPage = lazy(() => import('./pages/HabitsPage'));

function App() {
  const { authenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!authenticated) return;
    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => logout());
  }, [authenticated, setUser, logout]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-brand-600 text-lg">Loading Habits...</div>
        </div>
      }
    >
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login" element={!authenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route
          path="/register" element={!authenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
        <Route element={<Layout />}>
          <Route
            path="/" element={authenticated ? <DashboardPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/habits" element={authenticated ? <HabitsPage /> : <Navigate to="/login" replace />} />
        </Route>
        <Route path="*" element={<Navigate to={authenticated ? '/' : '/login'} replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
