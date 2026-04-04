import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SimpleRegistration from './components/SimpleRegistration';
import SimpleLogin from './components/SimpleLogin';
import Dashboard from './pages/Dashboard';
import RetirementPlanning from './pages/RetirementPlanning';
import Results from './pages/Results';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Register service worker for PWA capabilities
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registration" element={<SimpleRegistration />} />
            <Route path="/login" element={<SimpleLogin />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planning"
              element={
                <ProtectedRoute>
                  <RetirementPlanning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
