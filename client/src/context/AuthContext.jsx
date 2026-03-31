import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      if (response.data) {
        const user = response.data;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.status === 401) {
          toast.error('Invalid username or password');
        } else {
          toast.error(`Server Error: ${err.response.data.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        toast.error('Network Error: Cannot reach the server. Please check your internet or API URL.');
      } else {
        toast.error('Application Error: Something went wrong.');
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
