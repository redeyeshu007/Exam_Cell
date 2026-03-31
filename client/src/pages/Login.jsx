import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      toast.success('Welcome Back, Administrator!');
      navigate('/');
    } else {
      toast.error('Invalid credentials. Please try again.');
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
        <p style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontWeight: 700,
          marginBottom: '0.375rem'
        }}>
          PSNA College of Engineering and Technology
        </p>
        <h1 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 900,
          color: 'var(--primary)',
          lineHeight: 1.2,
          marginBottom: '0.375rem'
        }}>
          ExamCell Portal
        </h1>
        <p className="mobile-hide" style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)',
          marginBottom: '0.25rem'
        }}>
          Sign in to your administrator account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <div className="form-input-wrapper">
              <User
                size={16}
                style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="login-username"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="form-input-wrapper">
              <Lock
                size={16}
                style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="login-password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            <LogIn size={16} />
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
