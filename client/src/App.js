import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import theme from './theme/theme';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Elections from './pages/Elections';
import ElectionDetails from './components/elections/ElectionDetails';
import ElectionResults from './components/elections/ElectionResults';
import Candidates from './pages/Candidates';
import Campaigns from './pages/Campaigns';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminDashboard from './components/admin/AdminDashboard';
import Navbar from './components/layout/Navbar';
import CandidateManagement from './components/admin/CandidateManagement';
import VotingPage from './components/voter/VotingPage';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.isAdmin ? children : <Navigate to="/dashboard" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/elections"
        element={
          <PrivateRoute>
            <Layout>
              <Elections />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/elections/:id"
        element={
          <PrivateRoute>
            <Layout>
              <ElectionDetails />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/elections/:id/vote"
        element={
          <PrivateRoute>
            <Layout>
              <VotingPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/elections/:id/results"
        element={
          <PrivateRoute>
            <Layout>
              <ElectionResults />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <PrivateRoute>
            <Layout>
              <Candidates />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <PrivateRoute>
            <Layout>
              <Campaigns />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/elections/:electionId/candidates"
        element={
          <AdminRoute>
            <Layout>
              <CandidateManagement />
            </Layout>
          </AdminRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
