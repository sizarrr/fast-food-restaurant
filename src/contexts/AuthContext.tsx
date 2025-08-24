import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'cashier';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: '2', username: 'cashier', password: 'cashier123', role: 'cashier' as const },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      setUser({ id: foundUser.id, username: foundUser.username, role: foundUser.role });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};