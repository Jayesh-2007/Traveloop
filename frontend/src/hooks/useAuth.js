import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import api, { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/api.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function persistSession({ user, token }) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    function handleExpiredSession() {
      setUser(null);
      setToken(null);
    }

    window.addEventListener('traveloop:auth:expired', handleExpiredSession);
    return () => window.removeEventListener('traveloop:auth:expired', handleExpiredSession);
  }, []);

  async function login(credentials) {
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', credentials);
      const session = response.data.data;

      persistSession(session);
      setUser(session.user);
      setToken(session.token);

      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(formData) {
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const session = response.data.data;

      persistSession(session);
      setUser(session.user);
      setToken(session.token);

      return response.data;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    clearSession();
    setUser(null);
    setToken(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
      register,
    }),
    [isLoading, token, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export default useAuth;
