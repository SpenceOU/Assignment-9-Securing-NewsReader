import { createContext, useContext, useState } from 'react';

// Holds who is logged in so any component can check it
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load the logged in user from localStorage so a refresh doesn't log them out
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = user !== null;

  // Login - simulates an API call (any username/password works for this demo)
  const login = (username, password, role = 'regular') => {
    // In a real app, the username and password would be checked by a backend.
    // Here we create a fake JWT-style token instead.
    const mockToken = `mock_jwt_token_${Date.now()}`;

    // Never store the password, only the info the app needs
    const userData = { username: username.trim(), role, token: mockToken };

    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('authToken', mockToken);
    return userData;
  };

  // Logout - clear the user and their token
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  // Authorization helpers
  const hasRole = (role) => user?.role === role;
  const isAdmin = () => hasRole('admin');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// Shortcut hook so components can write useAuth()
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}