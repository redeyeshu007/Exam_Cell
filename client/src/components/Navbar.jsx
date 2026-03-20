import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDept } from '../context/DeptContext';

const Navbar = () => {
  const { user, logout: originalLogout } = useAuth();
  const { selectedDept, setDept } = useDept();
  const navigate = useNavigate();

  if (!user || !selectedDept) return null;

  const logout = () => {
    originalLogout();
    setDept('');
  };

  const handleChangeDept = () => {
    setDept('');
    navigate('/select-dept');
  };

  return (
    <div className="sub-header">
      <div className="brand-name">EXAMCELL</div>
      
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/create-exam" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Create Exam</NavLink>
        <NavLink to="/join-exam" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Join Exam</NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>History</NavLink>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div 
          onClick={handleChangeDept}
          style={{ 
            cursor: 'pointer',
            padding: '0.4rem 1rem', 
            borderRadius: '4px', 
            border: '1px solid var(--primary-theme)', 
            color: 'var(--primary-theme)', 
            fontWeight: 'bold',
            background: 'var(--white)'
          }}
          title="Click to Switch Department"
        >
          DB: {selectedDept}
        </div>
        <button 
          onClick={logout}
          style={{ background: 'none', border: 'none', color: 'var(--primary-theme)', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
