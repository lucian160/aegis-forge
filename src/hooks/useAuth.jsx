import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const initializeSession = async () => {
      const session = authService.getSession();
      if (session) setUser(session);

      const refreshed = await authService.refreshSession();
      if (active) setUser(refreshed || session || null);
      if (active) setLoading(false);
    };
    initializeSession();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const session = await authService.login(email, password);
    setUser(session);
    return session;
  };

  const logout = async () => {
    const request = authService.logout();
    setUser(null);
    await request;
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
