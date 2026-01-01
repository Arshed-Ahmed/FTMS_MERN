import { createContext, useState, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  userInfo: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (username: string, password: string, role: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<User | null>(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
  );

  const login = async (username: string, password: string) => {
    try {
      const data = await authService.login({ username, password });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error: any) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUserInfo(null);
      localStorage.removeItem('userInfo');
    } catch (error) {
      console.error(error);
    }
  };

  const register = async (username: string, password: string, role: string) => {
    try {
      const data = await authService.register({ username, password, role });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error: any) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
