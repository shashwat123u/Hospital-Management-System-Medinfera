import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { setAccessToken, setRefreshToken, getRefreshToken, clearTokens } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await authService.me();
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch (error) {
          if (error.response?.status === 403 && error.response?.data?.message === 'Password reset required before proceeding') {
            setUser({ mustResetPassword: true });
            setIsAuthenticated(true);
          } else {
            clearTokens();
          }
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { accessToken, refreshToken, user } = response.data.data;
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Local sign-out still completes when the server session has expired.
    } finally {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  const changePassword = async (data) => {
    await authService.changePassword(data);
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
