import React from 'react'
import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import NutritionForm from './components/Food/NutritionForm'
import Exercise from './components/Exercise/Exercise'
import Profile from './components/Profile/Profile'
import ForgotPassword from './components/ForgotPassword'
import VerifyForgotPassword from './components/VerifyForgotPassword'
import TwoFactorAuth from './components/Admin/TwoFactorAuth'
import AdminHome from './components/Admin/AdminHome'
import UserActivity from './components/Admin/UserActivity'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-forgot-password/:email" element={<VerifyForgotPassword />} />
            <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
            
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/nutrition-form" element={<PrivateRoute><NutritionForm /></PrivateRoute>} />
            <Route path="/exercise" element={<PrivateRoute><Exercise /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/admin-home" element={<PrivateRoute><AdminHome /></PrivateRoute>} />
            <Route path="/user-activity/:id" element={<PrivateRoute><UserActivity /></PrivateRoute>} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App