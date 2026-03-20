import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDept } from '../context/DeptContext';
import { LogOut, Database } from 'lucide-react';

const Header = () => {
  const { user, logout: originalLogout } = useAuth();
  const { selectedDept, setDept } = useDept();
  const navigate = useNavigate();

  const logout = () => {
    originalLogout();
    setDept('');
    navigate('/login');
  };

  const handleChangeDept = () => {
    setDept('');
    navigate('/select-dept');
  };

  return (
    <header className="main-header">
      <div className="header-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/assets/psna_logo.png" 
            alt="PSNA Logo" 
            className="college-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Link>
        <div className="title-container">
          <h1>PSNA college of engineering exam hall generator</h1>
        </div>
      </div>
      
      {user && selectedDept && (
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div 
            className="dept-badge"
            onClick={handleChangeDept}
            title="Click to Switch Department"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem'
            }}
          >
            <Database size={18} />
            <span>{selectedDept}</span>
          </div>
          
          <button 
            onClick={logout}
            className="logout-btn"
            style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#fca5a5', 
              fontWeight: '800', 
              cursor: 'pointer',
              padding: '0.8rem 1.5rem',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
