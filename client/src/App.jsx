import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeptProvider, useDept } from './context/DeptContext';
import { Toaster } from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

import Login from './pages/Login';
import DeptSelect from './pages/DeptSelect';
import Dashboard from './pages/Dashboard';
import CreateExam from './pages/CreateExam';
import JoinExam from './pages/JoinExam';
import History from './pages/History';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Header from './components/Header';
import Footer from './components/Footer';

import './App.css';

const ProtectedRoute = ({ children, requireDept = true }) => {
  const { user, loading } = useAuth();
  const { selectedDept } = useDept();

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (requireDept && !selectedDept) {
    return <Navigate to="/select-dept" />;
  }
  
  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const NotFound = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, #1c3d5a 0%, #0f172a 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <AlertCircle size={80} style={{ marginBottom: '2rem', opacity: 0.5 }} />
      <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Oops! This URL is not safe or doesn't exist.</h2>
      <button 
        onClick={() => window.location.href = '/'}
        className="btn-primary"
        style={{ width: 'auto', padding: '1rem 3rem' }}
      >
        RETURN TO SAFETY
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DeptProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/select-dept" element={
              <ProtectedRoute requireDept={false}>
                <DeptSelect />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/create-exam" element={
              <ProtectedRoute>
                <Layout><CreateExam /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/join-exam" element={
              <ProtectedRoute>
                <Layout><JoinExam /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <Layout><History /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/404" />} />
            <Route path="/404" element={<NotFound />} />
          </Routes>
        </Router>
      </DeptProvider>
    </AuthProvider>
  );
}

export default App;
