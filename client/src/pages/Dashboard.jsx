import { Link } from 'react-router-dom';
import { useDept } from '../context/DeptContext';
import { FilePlus2, Shuffle, History } from 'lucide-react';

const Dashboard = () => {
  const { selectedDept } = useDept();

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h1
            className="gradient-text"
            style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 900,
              letterSpacing: '-1px',
              lineHeight: 1.1,
              marginBottom: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            {selectedDept} - Exam Hall Invigilator Allocation
          </h1>
          <p
            className="mobile-hide"
            style={{
              color: 'var(--text-muted)',
              fontSize: 'var(--font-base)',
              fontWeight: 500,
              maxWidth: 640,
              margin: '0 auto',
              lineHeight: 1.7
            }}
          >
            Manage examinations and allocate halls for the{' '}
            <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
              {selectedDept}
            </strong>{' '}
            department.
          </p>
        </div>

        {/* Hub Cards */}
        <div className="hub-grid">
          <Link to="/create-exam" className="hub-card">
            <div className="icon-box">
              <FilePlus2 size={26} />
            </div>
            <h3>Create Exam</h3>
            <p>Design and schedule new examination sessions with hall selection.</p>
          </Link>

          <Link to="/join-exam" className="hub-card">
            <div className="icon-box">
              <Shuffle size={26} />
            </div>
            <h3>Hall Allocation</h3>
            <p>Smart, conflict-free random hall assignment for exam sessions.</p>
          </Link>

          <Link to="/history" className="hub-card">
            <div className="icon-box">
              <History size={26} />
            </div>
            <h3>View History</h3>
            <p>Access, manage, and export comprehensive allocation archives.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
