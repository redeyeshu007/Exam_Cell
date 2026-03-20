import { useDept } from '../context/DeptContext';
import { useNavigate } from 'react-router-dom';
import { Cpu, Radio, Zap, Settings, Building2, LayoutGrid } from 'lucide-react';

const DeptSelect = () => {
  const { departments, setDept } = useDept();
  const navigate = useNavigate();

  const deptIcons = {
    'CSE': <Cpu size={32} />,
    'ECE': <Radio size={32} />,
    'EEE': <Zap size={32} />,
    'MECH': <Settings size={32} />,
    'CIVIL': <Building2 size={32} />,
    'AIDS': <Zap size={32} />,
    'CSBS': <Settings size={32} />,
  };

  const handleSelect = (dept) => {
    setDept(dept);
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '900px', padding: '4rem 3rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--secondary-theme)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
          }}>
            <LayoutGrid size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary-theme)', marginBottom: '0.75rem' }}>
            Welcome to PSNA EXAMCELL
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Choose your department to access the administrative dashboard
          </p>
        </div>
        
        <div className="dept-grid">
          {departments.map(dept => (
            <div
              key={dept}
              onClick={() => handleSelect(dept)}
              className="dept-card"
            >
              <div className="dept-icon">
                {deptIcons[dept] || <Building2 size={32} />}
              </div>
              <div className="dept-name">{dept}</div>
              <div className="dept-label">DEPARTMENT</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeptSelect;
