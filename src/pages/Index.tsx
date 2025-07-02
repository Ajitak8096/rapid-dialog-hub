
import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import ChatInterface from '../components/ChatInterface';

interface User {
  email: string;
  username: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would make an API call to authenticate
    // For demo purposes, we'll simulate a successful login
    console.log('Login attempt:', { email, password });
    
    // Extract username from email for demo
    const username = email.split('@')[0];
    setUser({ email, username });
  };

  const handleRegister = (email: string, password: string, username: string) => {
    // In a real app, this would make an API call to create a new user
    // For demo purposes, we'll simulate a successful registration
    console.log('Register attempt:', { email, password, username });
    setUser({ email, username });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (user) {
    return <ChatInterface user={user} onLogout={handleLogout} />;
  }

  return (
    <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
  );
};

export default Index;
