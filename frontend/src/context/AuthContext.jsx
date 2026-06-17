import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user details on start
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const loginWithGoogle = async (email, name) => {
    try {
      setError(null);
      const response = await fetch('/api/users/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Google Login failed');
      }

      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const uploadPhoto = async (profilePhoto) => {
    try {
      const response = await fetch('/api/users/profile-photo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          profilePhoto: data.profilePhoto
        };
      });
      return data;
    } catch (err) {
      console.error('Photo upload error:', err);
      throw err;
    }
  };

  const acceptChallenge = async (challengeName, pointsReward) => {
    try {
      const response = await fetch('/api/users/accept-challenge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeName, pointsReward }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept challenge');
      }
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          acceptedChallenges: data.acceptedChallenges,
          ecoPoints: data.ecoPoints
        };
      });
      return data;
    } catch (err) {
      console.error('Failed to accept challenge:', err);
      throw err;
    }
  };

  // Local helper to sync user metrics (savings, offset, points, etc.)
  const updateUserMetrics = (metrics) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...metrics
      };
    });
  };

  // Server update of points (check-ins, marketplace purchases)
  const adjustUserPoints = async (adjustments) => {
    try {
      const response = await fetch('/api/users/points', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustments),
      });
      if (response.ok) {
        const data = await response.json();
        updateUserMetrics(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to adjust user points:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUserMetrics,
      adjustUserPoints,
      fetchUser,
      loginWithGoogle,
      uploadPhoto,
      acceptChallenge
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
