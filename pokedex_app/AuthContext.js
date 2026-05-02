import React, { createContext, useContext, useState } from 'react';
import * as api from './api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authVisible, setAuthVisible] = useState(false);

  const openAuth = () => setAuthVisible(true);
  const closeAuth = () => setAuthVisible(false);

  const register = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.signUp(email, password);
      const authUser = result.user ?? result;
      if (!authUser?.id) {
        throw new Error('Unable to register user.');
      }
      setUser({ id: authUser.id, email: authUser.email });
      if (result.access_token) {
        setAccessToken(result.access_token);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.signIn(email, password);
      if (result?.access_token) {
        setAccessToken(result.access_token);
      }
      const authUser = result.user ?? null;
      if (authUser?.id) {
        setUser({ id: authUser.id, email: authUser.email });
        return result;
      }
      if (result?.access_token) {
        const profile = await api.getAuthUser(result.access_token);
        if (profile?.id) {
          setUser({ id: profile.id, email: profile.email });
          return result;
        }
      }
      throw new Error('Login response did not include user info.');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setAccessToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, error, register, login, signOut, authVisible, openAuth, closeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
