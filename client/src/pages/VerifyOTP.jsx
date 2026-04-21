import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import API_URL from '../api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please start over.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error('Please enter a 6-digit code');
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      toast.success('OTP Verified!');
      // Navigate to reset password with email and otp in state
      setTimeout(() => navigate(`/reset-password`, { state: { email, otp } }), 1000);
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      toast.success('New OTP sent!');
    } catch (err) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Back Link */}
        <Link to="/forgot-password" style={{
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
          Change Email
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
          Verify OTP
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Enter the 6-digit code sent to <br/>
          <strong style={{ color: 'var(--primary)' }}>{email}</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-input-wrapper">
              <ShieldCheck
                size={18}
                style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="otp-code"
                type="text"
                className="form-input"
                style={{ 
                  paddingLeft: '2.75rem', 
                  textAlign: 'center', 
                  letterSpacing: '0.5rem', 
                  fontSize: '1.25rem',
                  fontWeight: 700 
                }}
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <CheckCircle2 size={16} />
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <button 
          onClick={resendOTP}
          style={{
            marginTop: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '1.5rem auto 0'
          }}
        >
          <RefreshCw size={14} />
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
