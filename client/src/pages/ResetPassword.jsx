import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Save, AlertCircle } from 'lucide-react';
import API_URL from '../api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  useEffect(() => {
    if (!email || !otp) {
      toast.error('Session expired. Please start over.');
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, password });
      toast.success('Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div style={{
          width: 72, height: 72,
          background: 'white',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 24px -4px rgba(28,61,90,0.18)',
          padding: 10,
          flexShrink: 0
        }}>
          <img
            src="/assets/psna_logo.png"
            alt="PSNA Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 900,
          color: 'var(--primary)',
          lineHeight: 1.2,
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Set New Password
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Please enter your new password below to regain access to your account.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <div className="form-input-wrapper">
              <Lock
                size={16}
                style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="new-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <div className="form-input-wrapper">
              <Lock
                size={16}
                style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <Save size={16} />
            {isSubmitting ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(28,61,90,0.04)',
          borderRadius: '12px',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>
            Make sure your password is secure and unique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
