import { useEffect, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from './api';
import AuthForm from './components/AuthForm.jsx';
import LeadsPage from './components/LeadsPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return;
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(logout)
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = ({ token, user }) => {
    setToken(token);
    setUser(user);
  };

  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <AuthForm onAuth={handleAuth} />;
  return <LeadsPage user={user} onLogout={logout} />;
}
