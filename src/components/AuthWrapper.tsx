
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';
import Home from './Home';

const AuthWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  if (isAuthenticated) {
    return <Home />;
  }

  return isLoginMode ? (
    <Login onToggleMode={() => setIsLoginMode(false)} />
  ) : (
    <Signup onToggleMode={() => setIsLoginMode(true)} />
  );
};

export default AuthWrapper;
