import { useDept } from '../context/DeptContext';
import { useNavigate } from 'react-router-dom';
import { Cpu, Radio, Zap, Settings, Building2 } from 'lucide-react';

const DEPT_ICONS = {
  CSE:   <Cpu size={28} />,
  ECE:   <Radio size={28} />,
  EEE:   <Zap size={28} />,
  MECH:  <Settings size={28} />,
  CIVIL: <Building2 size={28} />,
  AIDS:  <Zap size={28} />,
  CSBS:  <Settings size={28} />,
};

const DeptSelect = () => {
  const { departments, setDept } = useDept();
  const navigate = useNavigate();

  const handleSelect = (dept) => {
    setDept(dept);
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="logo-box">
          <img
            src="/assets/psna_logo.png"
            alt="PSNA Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <h1 className="welcome-title">
          Welcome to ExamCell
        </h1>
        <p
          className="mobile-hide"
          style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}
        >
          Select your department to access the administrative dashboard
        </p>

        <div className="dept-grid">
          {departments.map(dept => (
            <div
              key={dept}
              onClick={() => handleSelect(dept)}
              className="dept-card"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(dept)}
            >
              <div className="dept-icon">
                {DEPT_ICONS[dept] ?? <Building2 size={28} />}
              </div>
              <div className="dept-name">{dept}</div>
              <div className="dept-label">Department</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeptSelect;
