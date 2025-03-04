import React from 'react';
import AppRouter from './routers/AppRouter';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
