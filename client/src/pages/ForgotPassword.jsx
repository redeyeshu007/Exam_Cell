import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import API_URL from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      toast.success('OTP sent to your email!');
      setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`), 1500);
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Back Link */}
        <Link to="/login" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          alignSelf: 'flex-start'
        }} onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
           onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={16} />
          Back to Login
        </Link>

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
          Reset Password
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Enter your email address and we'll send you an OTP to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reset-email">Email Address</label>
            <div className="form-input-wrapper">
              <Mail
                size={16}
                style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="reset-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <Send size={16} />
            {isSubmitting ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
