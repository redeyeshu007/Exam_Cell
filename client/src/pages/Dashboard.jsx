import { Link } from 'react-router-dom';
import { useDept } from '../context/DeptContext';
import { FilePlus2, Shuffle, History, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { selectedDept } = useDept();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div style={{ marginBottom: '7rem', textAlign: 'center' }}>
          <h1 className="gradient-text" style={{ fontSize: '5.5rem', fontWeight: '1000', letterSpacing: '-4px', marginBottom: '1.5rem', lineHeight: '0.9' }}>
            Administrator Hub
          </h1>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: '500', maxWidth: '800px', margin: '1rem auto 0', lineHeight: '1.6' }}>
            Seamlessly managing examinations and real-time hall allocations for 
            <span style={{ color: 'var(--primary-theme)', fontWeight: '900', marginLeft: '0.75rem', position: 'relative' }}>
              {selectedDept} 
              <span style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '4px', background: 'var(--secondary-theme)', borderRadius: '2px', opacity: 0.3 }}></span>
            </span>
          </p>
        </div>

        <div className="hub-grid">
          <Link to="/create-exam" className="hub-card">
            <div className="icon-box">
              <FilePlus2 size={50} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Create Exam</h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Design and schedule new examination sessions with a few clicks.</p>
          </Link>

          <Link to="/join-exam" className="hub-card">
            <div className="icon-box">
              <Shuffle size={50} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Hall Allocation</h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Smart, conflict-free random hall assignment for students.</p>
          </Link>

          <Link to="/history" className="hub-card">
            <div className="icon-box">
              <History size={50} />
            </div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>View History</h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>Access, manage and export comprehensive allocation archives.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
