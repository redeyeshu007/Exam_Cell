import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDept } from '../context/DeptContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Trash2, LayoutPanelLeft,
  CheckCircle2, AlertCircle, Search
} from 'lucide-react';
import BackButton from '../components/BackButton';
import API_URL from '../api';

const JoinExam = () => {
  const { selectedDept } = useDept();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [allocatedHall, setAllocatedHall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState({ show: false, type: '', id: null });
  const [facultyName, setFacultyName] = useState('');
  const [search, setSearch] = useState('');

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/exams`, {
        headers: { 'x-dept-name': selectedDept }
      });
      setExams(res.data);
    } catch {
      toast.error('Failed to load exams');
    }
  };

  useEffect(() => {
    if (selectedDept) fetchExams();
  }, [selectedDept]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/exams/${id}`, {
        headers: { 'x-dept-name': selectedDept }
      });
      toast.success('Exam removed successfully');
      if (selectedExam?._id === id) {
        setSelectedExam(null);
        setAllocatedHall(null);
      }
      fetchExams();
    } catch {
      toast.error('Could not delete the record');
    }
  };

  const handleGenerate = async () => {
    if (!selectedExam) return;
    setLoading(true);
    setAllocatedHall(null);
    try {
      const res = await axios.post(
        `${API_URL}/api/exams/${selectedExam._id}/allocate`,
        {},
        { headers: { 'x-dept-name': selectedDept } }
      );
      setAllocatedHall(res.data.hall);
      setSelectedExam(res.data.exam);
      setExams(prev => prev.map(e => e._id === res.data.exam._id ? res.data.exam : e));
      toast.success(`Hall ${res.data.hall.replace(/-\d+$/, '')} assigned!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaculty = async () => {
    if (!selectedExam || !allocatedHall) return;
    try {
      const res = await axios.put(
        `${API_URL}/api/exams/${selectedExam._id}/faculty`,
        { hall: allocatedHall, faculty: facultyName },
        { headers: { 'x-dept-name': selectedDept } }
      );
      setFacultyName('');
      setAllocatedHall(null);
      setSelectedExam(res.data);
      fetchExams();
      // Faculty saved silently
    } catch {
      toast.error('Failed to save faculty name');
    }
  };

  const isAllAllocated =
    selectedExam &&
    (selectedExam.allocatedHalls?.length || 0) === (selectedExam.halls?.length || 0);

  const dismissConfirm = () => setShowConfirm({ show: false, type: '', id: null });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="allocation-page-container"
    >
      <BackButton />

      {/* Page Title */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h1
          className="gradient-text"
          style={{ fontSize: 'var(--font-xl)', fontWeight: 900, marginBottom: '0.375rem', lineHeight: 1.1 }}
        >
          Hall Allocation
        </h1>
        <p
          className="mobile-hide"
          style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 'var(--font-base)' }}
        >
          Assigning halls for the{' '}
          <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedDept}</strong>{' '}
          department
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── LIST VIEW ── */}
        {!selectedExam ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className="exam-list-view"
          >
            <div className="view-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div className="view-icon-box">
                  <LayoutGrid size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>
                    Scheduled Exams
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500, marginTop: 2 }}>
                    Select a session to begin hall allocation
                  </p>
                </div>
              </div>

              {/* Real-time Search */}
              <div style={{ position: 'relative', maxWidth: 450, width: '100%', margin: '0 auto 1.5rem 0' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute', left: '0.875rem',
                    top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter sessions..."
                  className="form-input"
                  style={{ paddingLeft: '2.75rem', height: 42, borderRadius: 'var(--r)' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="exam-grid-container">
              {(() => {
                const pendingExams = exams.filter(
                  e => (e.allocatedHalls?.length || 0) < (e.halls?.length || 0) &&
                       e.name.toLowerCase().includes(search.toLowerCase())
                );

                if (pendingExams.length === 0) {
                  return (
                    <div className="empty-state-card">
                      <AlertCircle size={52} color="var(--border-strong)" style={{ marginBottom: '1.25rem', margin: '0 auto 1.25rem' }} />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        Nothing Scheduled
                      </h3>
                      <p style={{ color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto', fontSize: '0.875rem' }}>
                        {exams.length > 0
                          ? 'All scheduled exams have been fully allocated.'
                          : `No upcoming exams found in the ${selectedDept} department.`}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="exam-cards-grid">
                    {pendingExams.map(exam => {
                      const finished =
                        (exam.allocatedHalls?.length || 0) === (exam.halls?.length || 0) &&
                        (exam.halls?.length || 0) > 0;
                      return (
                        <motion.div
                          key={exam._id}
                          layoutId={exam._id}
                          className="exam-card-detailed"
                          onClick={() => { setSelectedExam(exam); setAllocatedHall(null); }}
                        >
                          <div className="card-top">
                            <span
                              className="status-badge"
                              style={{ background: finished ? 'var(--success)' : 'var(--accent)' }}
                            >
                              {finished ? 'Completed' : 'Pending Allocation'}
                            </span>
                            <button
                              className="btn-delete-card"
                              onClick={e => {
                                e.stopPropagation();
                                setShowConfirm({ show: true, type: 'delete', id: exam._id });
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="card-main">
                            <h3>{exam.name}</h3>
                            <div className="meta-info">
                              <span>📅 {exam.date}</span>
                              <span>🕒 {exam.session === 'FN' ? 'Morning' : 'Afternoon'}</span>
                            </div>
                          </div>

                          <div className="card-footer">
                            <div className="progress-container">
                              <div className="progress-text">
                                <span>Progress</span>
                                <span>{exam.allocatedHalls?.length || 0} / {exam.halls?.length || 0}</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div
                                  className="progress-bar-fill"
                                  style={{
                                    width: `${((exam.allocatedHalls?.length || 0) / Math.max(exam.halls?.length || 1, 1)) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                            <div className="action-hint">
                              Select to proceed <LayoutPanelLeft size={14} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        ) : (

          /* ── DETAIL VIEW ── */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="allocation-detail-view"
          >
            <button className="back-to-list-btn" onClick={() => setSelectedExam(null)}>
              <LayoutPanelLeft size={16} />
              Back to Scheduled Exams
            </button>

            <div className="glass-panel main-allocation-panel">
              <div className="allocation-hero" style={{ maxWidth: 760, margin: '0 auto' }}>

                {/* Exam Info */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap',
                  gap: '0.75rem', marginBottom: '1.5rem'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.35rem', fontWeight: 900,
                      color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '-0.3px'
                    }}>
                      {selectedExam.name}
                    </h2>
                    <div style={{
                      fontSize: '0.82rem', color: 'var(--text-muted)',
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <span>📅 {selectedExam.date}</span>
                      <span style={{ opacity: 0.4 }}>|</span>
                      <span>🕒 {selectedExam.session === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)'}</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.4rem 0.875rem',
                    background: 'var(--bg)', borderRadius: 'var(--r-full)',
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)'
                  }}>
                    {selectedExam.allocatedHalls?.length || 0} / {selectedExam.halls?.length || 0} halls
                  </div>
                </div>

                {/* Generate / Complete */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {!isAllAllocated ? (
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="btn-generate-main"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {loading
                        ? <><span className="spin-icon" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Allocating...</>
                        : 'Generate Next Hall'}
                    </button>
                  ) : (
                    <div className="complete-status-pill">
                      <CheckCircle2 size={18} />
                      All Halls Allocated Successfully
                    </div>
                  )}
                </div>

                {/* Allocated Halls List */}
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem'
                  }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      Allocated ({selectedExam.allocatedHalls?.length || 0})
                    </span>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                  </div>

                  {selectedExam.allocatedHalls?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedExam.allocatedHalls.map((hall, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: 'var(--surface)', padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)',
                            fontSize: '0.82rem'
                          }}
                        >
                          <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', minWidth: 14 }}>
                            {i + 1}
                          </span>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                            {(hall.hall || hall).replace(/-\d+$/, '')}
                          </span>
                          {hall.faculty && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              · {hall.faculty}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p style={{
                      textAlign: 'center', padding: '1.5rem 0',
                      color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic'
                    }}>
                      No halls assigned yet. Click "Generate Next Hall" to begin.
                    </p>
                  )}
                </div>

                {/* All done */}
                {isAllAllocated && !allocatedHall && (
                  <div style={{
                    marginTop: '1rem', padding: '0.75rem 1rem',
                    background: 'var(--success-bg)', borderRadius: 'var(--r)',
                    border: '1px solid var(--success-border)',
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    color: 'var(--success-text)', fontSize: '0.82rem', fontWeight: 700
                  }}>
                    <CheckCircle2 size={16} />
                    All halls have been successfully assigned.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FACULTY MODAL ── */}
      <AnimatePresence>
        {allocatedHall && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="allocation-modal"
              style={{
                position: 'relative',
                background: 'white',
                padding: '2.25rem 2rem',
                borderRadius: 'var(--r-xl)',
                maxWidth: 380, width: '100%',
                boxShadow: 'var(--shadow-xl)',
                textAlign: 'center'
              }}
            >
              {/* Success Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 20px rgba(16,185,129,0.28)'
              }}>
                <CheckCircle2 size={26} color="white" />
              </div>

              <p style={{
                fontSize: '0.68rem', fontWeight: 800, color: '#10b981',
                letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.25rem'
              }}>
                Hall Assigned
              </p>

              <h3 style={{
                fontSize: 'clamp(2.5rem, 8vw, 3.75rem)',
                fontWeight: 900, color: 'var(--primary)',
                margin: '0.25rem 0 1.5rem', lineHeight: 1,
                letterSpacing: '-2px'
              }}>
                {allocatedHall.replace(/-\d+$/, '')}
              </h3>

              {/* Faculty Input */}
              <div style={{ maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
                <label style={{
                  display: 'block', fontSize: '0.72rem', fontWeight: 700,
                  color: 'var(--text-muted)', marginBottom: '0.5rem',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Assign Faculty
                </label>
                <input
                  type="text"
                  placeholder="Enter faculty name"
                  value={facultyName}
                  onChange={e => setFacultyName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveFaculty()}
                  className="form-input"
                  style={{ marginBottom: '0.875rem' }}
                />
                <button
                  onClick={handleSaveFaculty}
                  className="btn-primary"
                  style={{ margin: 0, width: '100%' }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ── */}
      <AnimatePresence>
        {showConfirm.show && showConfirm.type === 'delete' && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={dismissConfirm}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              style={{
                position: 'relative', background: 'white',
                padding: '2rem 1.75rem', borderRadius: 'var(--r-xl)',
                maxWidth: 360, width: '100%',
                boxShadow: 'var(--shadow-xl)', textAlign: 'center'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--danger-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', color: 'var(--danger)'
              }}>
                <Trash2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>
                Delete this exam?
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={dismissConfirm}
                  style={{
                    flex: 1, padding: '0.8rem',
                    background: 'var(--bg)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r)', cursor: 'pointer',
                    fontWeight: 700, color: 'var(--text-secondary)',
                    fontSize: '0.875rem', fontFamily: 'inherit'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(showConfirm.id);
                    dismissConfirm();
                  }}
                  style={{
                    flex: 1, padding: '0.8rem',
                    background: 'var(--danger)', color: 'white',
                    border: 'none', borderRadius: 'var(--r)',
                    cursor: 'pointer', fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                    fontFamily: 'inherit'
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JoinExam;
