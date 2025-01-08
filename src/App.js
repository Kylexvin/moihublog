import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogHomepage from './components/BlogHomepage';
import PostList from './components/WritersPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/authService'; // Ensure this service exists
import BlogPost from './components/BlogPost';
import EditPostPage from './components/EditPostPage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []); 

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout(); // Ensure logout method clears token/storage
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BlogHomepage />} />
        <Route path="/blog/:id" element={<BlogPost />} />        
        <Route path="/login" element={<Login setIsAuthenticated={handleLogin} />} />
        <Route path="/register" element={<Register setIsAuthenticated={handleLogin} />} />
        
        {/* Protected Routes for logged-in users only */}
        <Route
          path="/post-list"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PostList />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <EditPostPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
