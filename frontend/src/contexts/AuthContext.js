import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by verifying session with backend
    verifySession();
  }, []);

  const verifySession = async () => {
    try {
      const response = await axios.get('/api/auth/verify', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User is not authenticated, which is fine
      console.log('No active session');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/login/local', credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const loginWithMicrosoft = (authUrl) => {
    // Redirect to Microsoft OAuth
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const getMicrosoftAuthUrl = async () => {
    try {
      const response = await axios.get('/api/microsoft-url', {
        withCredentials: true
      });
      
      if (response.data.success) {
        return response.data.auth_url;
      }
      return null;
    } catch (error) {
      console.error('Error fetching Microsoft auth URL:', error);
      return null;
    }
  };

  const value = {
    user,
    login,
    loginWithMicrosoft,
    logout,
    getMicrosoftAuthUrl,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}