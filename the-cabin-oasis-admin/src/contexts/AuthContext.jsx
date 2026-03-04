import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await api.get('/staff/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Adding token to', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const response = await api.post('/staff/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = response.data;
      setToken(data.access_token);
      localStorage.setItem('token', data.access_token);
      await fetchUser();
      setToast({ message: 'Login successful', type: 'success' });
      return { success: true };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setToast({ message: 'Invalid Credentials', type: 'error' });
        } else if (error.response.status === 403) {
          setToast({ message: 'Unauthorized Access', type: 'error' });
        } else {
          setToast({ message: 'Login failed', type: 'error' });
        }
      } else {
        setToast({ message: 'Network error', type: 'error' });
      }
      return { success: false };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    setToast({ message: 'Logged out', type: 'success' });
  };

  const clearToast = () => {
    setToast(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    toast,
    clearToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
