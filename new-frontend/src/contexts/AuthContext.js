import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@retirementplanner.com' && password === 'demo123') {
          const userData = {
            id: 'demo-user-1',
            email: email,
            firstName: 'Raj',
            lastName: 'Kumar',
            age: 30,
            location: 'Mumbai, India',
            monthlyIncome: 100000,
            isDemo: true
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('incuverse_user_id', userData.id);
          resolve(userData);
          setUser(userData);
          setIsLoading(false);
        } else {
          const userData = {
            id: `user-${Date.now()}`,
            email: email,
            firstName: email.split('@')[0],
            lastName: 'User',
            age: 30,
            location: 'India',
            monthlyIncome: 50000,
            isDemo: false
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('incuverse_user_id', userData.id);
          resolve(userData);
          setUser(userData);
          setIsLoading(false);
        }
      }, 1000);
    });
  };

  const register = async (userData) => {
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const newUser = {
          id: `user-${Date.now()}`,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          age: parseInt(userData.age),
          location: userData.location,
          monthlyIncome: parseInt(userData.monthlyIncome),
          isDemo: false
        };
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('incuverse_user_id', newUser.id);
        resolve(newUser);
        setUser(newUser);
        setIsLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('incuverse_user_id');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const getCurrentUser = () => {
    return user;
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};