
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, clearSession, saveSession, saveUser, getUserByEmail } from '@/utils/localStorage';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (username: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const userData: User = {
        id: session.userId,
        username: session.username,
        email: session.email,
        createdAt: new Date().toISOString(),
      };
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const existingUser = getUserByEmail(email);
    
    if (existingUser) {
      // In a real app, you'd verify the password hash
      setUser(existingUser);
      setIsAuthenticated(true);
      saveSession(existingUser);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${existingUser.username}`,
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const signup = (username: string, email: string, password: string): boolean => {
    const existingUser = getUserByEmail(email);
    
    if (existingUser) {
      toast({
        title: "Signup failed",
        description: "User with this email already exists",
        variant: "destructive",
      });
      return false;
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    setUser(newUser);
    setIsAuthenticated(true);
    saveSession(newUser);
    
    toast({
      title: "Account created!",
      description: `Welcome to the platform, ${username}!`,
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
