import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import ExcelAnalyzer from '../pages/ExcelAnalyzer';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/signin" replace />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/excel" replace />}
        />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/excel"
          element={<PrivateRoute element={<ExcelAnalyzer />} />}
        />
      </Routes>
    </Router>
  );
};

export default AppRouter; 