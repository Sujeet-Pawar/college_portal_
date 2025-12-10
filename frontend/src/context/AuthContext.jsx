import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/auth/me');
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        setUser(user);
        window.location.href = '/';
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      console.log('Register response:', response.data);
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        setUser(user);
        window.location.href = '/';
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfile = async (data) => {
    const response = await axios.put('/auth/me', data);
    setUser(response.data.data);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

