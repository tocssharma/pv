import React, { createContext, useContext, useState, useMemo  } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState('guest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Compute isAdmin based on userRole
    const isAdmin = useMemo(() => userRole === 'admin', [userRole])


  const login = async (password) => {
    // In a real app, this would be an API call
    // For demo, using a simple password check
    if (password === 'admin123') {
      setUserRole('admin');
      setIsAuthenticated(true);
      return true;
    }    // For guest login, no password needed
    if (password === 'guest') {
      setUserRole('guest');
      //setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole('guest');
    setIsAuthenticated(false);
  };

  const contextValue = {
    userRole,      // Keep userRole for potential future role-based features
    isAdmin,       // Add isAdmin for simple admin/non-admin checks
    isAuthenticated,
    login,
    logout
  };


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook for checking admin status
export const useIsAdmin = () => {
    const { isAdmin } = useAuth();
    return isAdmin;
  };