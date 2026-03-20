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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      toast.success('Welcome Back, Admin!');
      navigate('/');
    } else {
      toast.error('Invalid Credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--primary-theme)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 15px -3px rgba(28, 61, 90, 0.2)'
          }}>
            <LogIn size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            PSNA College
          </h2>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-theme)' }}>
            EXAMCELL Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Please sign in to your administrator account</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem' }}>
          <div className="form-group">
            <label>Username</label>
            <div className="form-input-wrapper">
              <User size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="form-input-wrapper">
              <Lock size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
