import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDept } from '../context/DeptContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Trash2, Zap, LayoutPanelLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import API_URL from '../api';

const JoinExam = () => {
  const { selectedDept } = useDept();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [allocatedHall, setAllocatedHall] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState({ show: false, type: '', id: null });
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyName, setFacultyName] = useState('');

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/exams`, {
        headers: { 'x-dept-name': selectedDept }
      });
      setExams(res.data);
    } catch (err) {
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
      toast.success('Exam record removed successfully');
      if (selectedExam?._id === id) {
        setSelectedExam(null);
        setAllocatedHall(null);
      }
      fetchExams();
    } catch (err) {
      toast.error('Could not delete the record');
    }
  };

  const handleGenerate = async () => {
    if (!selectedExam) return;
    setLoading(true);
    setAllocatedHall(null);
    try {
      const res = await axios.post(`${API_URL}/api/exams/${selectedExam._id}/allocate`, {}, {
        headers: { 'x-dept-name': selectedDept }
      });
      setAllocatedHall(res.data.hall);
      setSelectedExam(res.data.exam);
      setExams(prev => prev.map(e => e._id === res.data.exam._id ? res.data.exam : e));
      toast.success(`Hall ${res.data.hall} Assigned!`, {
        icon: '🎯',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation process failed');
    } finally {
      setLoading(false);
      setShowFacultyModal(true); // Open modal after generation
    }
  };

  const handleSaveFaculty = async () => {
    if (!selectedExam || !allocatedHall) return;
    try {
      await axios.put(`${API_URL}/api/exams/${selectedExam._id}/faculty`, {
        hall: allocatedHall,
        faculty: facultyName
      }, {
        headers: { 'x-dept-name': selectedDept }
      });
      setFacultyName('');
      setShowFacultyModal(false);
      fetchExams(); // Refresh to get the updated list
      toast.success('Faculty assigned successfully');
    } catch (err) {
      toast.error('Failed to save faculty name');
    }
  };

  const isAllAllocated = selectedExam && (selectedExam.allocatedHalls?.length || 0) === (selectedExam.halls?.length || 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="allocation-page-container"
    >
      <BackButton />
      <div style={{ marginBottom: '3rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>
          Hall Allocation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.1rem' }}>
          Assigning seats for the <span style={{ color: 'var(--primary-theme)' }}>{selectedDept}</span> department
        </p>
      </div>

      <div className="allocation-grid">
        {/* Sidebar: Exam Selection */}
        <div className="glass-panel sidebar-glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <LayoutGrid size={20} color="var(--primary-theme)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Scheduled Exams</h3>
          </div>
          
          <div className="exam-selection-list">
            {(() => {
              const pendingExams = exams.filter(exam => (exam.allocatedHalls?.length || 0) < (exam.halls?.length || 0));
              
              if (pendingExams.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <AlertCircle size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {exams.length > 0 ? 'All scheduled exams are completed' : `No exams found in ${selectedDept}`}
                    </p>
                  </div>
                );
              }

              return pendingExams.map((exam, idx) => {
                const finished = (exam.allocatedHalls?.length || 0) === (exam.halls?.length || 0) && (exam.halls?.length || 0) > 0;
                return (
                  <motion.div
                    key={exam._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`exam-item-card ${selectedExam?._id === exam._id ? 'selected' : ''}`}
                    onClick={() => { setSelectedExam(exam); setAllocatedHall(null); }}
                    style={{ position: 'relative' }}
                  >
                    <div className="info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ margin: 0 }}>{exam.name}</p>
                        {finished && <CheckCircle2 size={14} color="#16a34a" />}
                      </div>
                      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{exam.date} • {exam.session}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, background: finished ? 'rgba(22, 163, 74, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: finished ? '#16a34a' : 'var(--primary-theme)', padding: '2px 8px', borderRadius: '4px' }}>
                        {exam.allocatedHalls?.length || 0}/{exam.halls?.length || 0}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConfirm({ show: true, type: 'delete', id: exam._id });
                        }}
                        className="btn-delete-small"
                        title="Remove Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        </div>

        {/* Main Content: Allocation Area */}
        <div className="glass-panel" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {selectedExam ? (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="allocation-hero"
              >
                <div className="progress-pill">
                  <CheckCircle2 size={16} />
                  <span>{selectedExam.allocatedHalls?.length || 0} of {selectedExam.halls?.length || 0} Halls Assigned</span>
                </div>
                
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-theme)', marginBottom: '1rem' }}>
                  {selectedExam.name}
                </h2>

                <div className={`result-glow-box ${allocatedHall ? 'allocated' : ''}`}>
                  {allocatedHall ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                    >
                      <p style={{ fontWeight: 800, letterSpacing: '3px', color: 'var(--secondary-theme)', fontSize: '0.9rem' }}>
                        NEWLY ALLOCATED
                      </p>
                      <div className="glowing-hall">{allocatedHall}</div>
                    </motion.div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Zap size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                      <p style={{ fontWeight: 600 }}>Ready for Allocation</p>
                      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Click "GENERATE" to pick a random hall</p>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '2.5rem', width: '100%' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Allocated Halls ({selectedExam.allocatedHalls?.length || 0}/{selectedExam.halls?.length || 0})
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                    {selectedExam.allocatedHalls?.map((hall, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ 
                          padding: '1rem', 
                          background: 'white', 
                          border: '2px solid var(--border-muted)', 
                          borderRadius: '16px', 
                          textAlign: 'center', 
                          fontWeight: 800, 
                          color: 'var(--primary-theme)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                      >
                        {hall.hall || hall}
                        {hall.faculty && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                            {hall.faculty}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {(!selectedExam.allocatedHalls || selectedExam.allocatedHalls.length === 0) && (
                      <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', border: '2px dashed var(--border-muted)', borderRadius: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        No halls assigned yet.
                      </div>
                    )}
                  </div>
                </div>

                {isAllAllocated ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      padding: '1.5rem 3rem', 
                      background: 'rgba(21, 128, 61, 0.08)', 
                      borderRadius: '100px', 
                      color: '#16a34a', 
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      border: '1.5px solid rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    <CheckCircle2 size={24} />
                    Session Complete: All halls assigned.
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowConfirm({ show: true, type: 'allocate', id: null })}
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', width: 'auto' }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Zap className="spin-icon" size={20} />
                        ASSIGNING...
                      </span>
                    ) : (
                      'GENERATE HALL'
                    )}
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="allocation-hero"
                style={{ opacity: 0.7 }}
              >
                <div className="placeholder-icon">
                  <LayoutPanelLeft size={48} />
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Select an Exam</h3>
                <p style={{ maxWidth: '350px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Choose a session from the left sidebar to begin the random hall allocation process.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Dialog */}
      <AnimatePresence>
        {showConfirm.show && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm({ show: false, type: '', id: null })}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} 
            />
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{ 
                  background: 'var(--white)', 
                  padding: '3rem', 
                  borderRadius: '32px', 
                  maxWidth: '480px', 
                  width: '100%', 
                  boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-muted)'
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '20px', 
                  background: showConfirm.type === 'delete' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '2rem',
                  color: showConfirm.type === 'delete' ? '#D32F2F' : 'var(--primary-theme)'
                }}>
                  {showConfirm.type === 'delete' ? <Trash2 size={32} /> : <Zap size={32} />}
                </div>

                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--primary-theme)' }}>
                  {showConfirm.type === 'delete' ? 'Delete Record?' : 'Ready to Allocate?'}
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: '1.6', fontSize: '1.05rem', fontWeight: 500 }}>
                  {showConfirm.type === 'delete' 
                    ? 'This will permanently remove the exam and all session history. This operation is irreversible.'
                    : 'A random hall will be selected from the available pool for this department. Proced with allocation?'
                  }
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowConfirm({ show: false, type: '', id: null })} 
                    style={{ flex: 1, padding: '1.2rem', background: 'var(--background-site)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={() => {
                      if (showConfirm.type === 'delete') handleDelete(showConfirm.id);
                      else handleGenerate();
                      setShowConfirm({ show: false, type: '', id: null });
                    }} 
                    className="btn-primary" 
                    style={{ flex: 1.5, margin: 0, background: showConfirm.type === 'delete' ? '#ef4444' : 'var(--primary-theme)' }}
                  >
                    {showConfirm.type === 'delete' ? 'Yes, Delete' : 'Confirm Allocation'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Faculty Name Modal */}
      <AnimatePresence>
        {showFacultyModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }} 
            />
            <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{ 
                  background: 'var(--white)', 
                  padding: '3rem', 
                  borderRadius: '32px', 
                  maxWidth: '480px', 
                  width: '100%', 
                  boxShadow: '0 50px 100px -20px rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-muted)',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '20px', 
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  color: 'var(--primary-theme)'
                }}>
                  <Zap size={32} />
                </div>

                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--primary-theme)' }}>
                  Hall {allocatedHall} Assigned!
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
                  Enter the faculty name for this hall (optional).
                </p>

                <input 
                  type="text"
                  placeholder="Faculty Name (Alphanumeric)"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  autoFocus
                  style={{ 
                    width: '100%', 
                    padding: '1.25rem', 
                    borderRadius: '16px', 
                    border: '2px solid var(--border-muted)', 
                    background: 'var(--background-site)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '2rem',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => { setShowFacultyModal(false); setFacultyName(''); }} 
                    style={{ flex: 1, padding: '1.2rem', background: 'var(--background-site)', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-main)' }}
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleSaveFaculty} 
                    className="btn-primary" 
                    style={{ flex: 1.5, margin: 0 }}
                  >
                    Confirm & Save
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default JoinExam;
