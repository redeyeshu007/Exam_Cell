import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDept } from '../context/DeptContext';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Trash2, Edit3, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import BackButton from '../components/BackButton';
import API_URL from '../api';

const History = () => {
  const { selectedDept } = useDept();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState({ show: false, type: '', id: null });

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/exams`, {
        headers: { 'x-dept-name': selectedDept }
      });
      setExams(res.data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
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
      toast.success('Exam deleted');
      fetchExams();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/exams/clear`, {
        headers: { 'x-dept-name': selectedDept }
      });
      toast.success('History cleared');
      fetchExams();
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const handleEdit = (exam) => {
    navigate(`/create-exam?edit=${exam._id}`, { state: { exam } });
  };

  const handleExport = () => {
    if (exams.length === 0) return toast.error('No data to export');
    const headers = ['Exam Name', 'Date', 'Session', 'Allocated Halls'];
    const rows = exams.map(e => [
      e.name,
      e.date,
      e.session === 'FN' ? 'Morning' : 'Afternoon',
      e.allocatedHalls.map(h => typeof h === 'string' ? h : `${h.hall} (${h.faculty || 'No Faculty'})`).join(' | ')
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.visibility = 'hidden';
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedDept}_Exam_History_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('History Exported!');
  };

  const filteredExams = exams.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="standard-page">
      <BackButton />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '0.5rem' }}>
             Database History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '500' }}>
            Auditing records for the <span style={{ color: 'var(--primary-theme)', fontWeight: '800' }}>{selectedDept}</span> cloud workspace.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
           <button 
             onClick={() => setShowConfirm({ show: true, type: 'clear', id: null })} 
             className="btn-primary" 
             style={{ width: 'auto', padding: '0 2rem', height: '55px', background: 'transparent', color: 'var(--primary-theme)', border: '2.5px solid var(--primary-theme)', borderRadius: '15px', fontWeight: '800' }}
           >
             PURGE RECORDS
           </button>
           <button onClick={handleExport} className="btn-primary" style={{ width: 'auto', padding: '0 2.5rem', height: '55px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Download size={20} /> EXPORT DATA
           </button>
        </div>
      </div>

      <div className="hub-card" style={{ padding: '0.5rem', animation: 'none', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '30px' }}>
        <div style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input
                type="text"
                placeholder={`Search ${selectedDept} records...`}
                className="form-input"
                style={{ paddingLeft: '3.5rem', height: '60px', borderRadius: '20px', border: '1.5px solid #f1f5f9', background: 'rgba(248, 250, 252, 0.8)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div style={{ overflowX: 'auto', width: '100%', borderRadius: '0 0 30px 30px' }}>
          <table className="data-table" style={{ border: 'none', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'transparent' }}>
                <th style={{ padding: '2rem', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px' }}>SESSION NAME</th>
                <th style={{ padding: '2rem', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px' }}>DATE</th>
                <th style={{ padding: '2rem', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px' }}>SLOT</th>
                <th style={{ padding: '2rem', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px' }}>STATUS</th>
                <th style={{ padding: '2rem', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px' }}>HALLS</th>
                <th style={{ padding: '2rem', color: 'var(--text-muted)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px', textAlign: 'center' }}>CONTROL</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                      <AlertCircle size={48} />
                      <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                        {search ? `No matches found for "${search}"` : `No exam records found in ${selectedDept}`}
                      </p>
                      <p style={{ fontSize: '0.9rem' }}>{search ? 'Try a different search term' : 'Allocated exams will appear here'}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredExams.map((exam) => {
                const isCompleted = (exam.allocatedHalls?.length || 0) === (exam.halls?.length || 0) && (exam.halls?.length || 0) > 0;
              return (
                <tr key={exam._id}>
                  <td style={{ padding: '2rem', fontWeight: '800', color: 'var(--primary-theme)', fontSize: '1.1rem' }}>{exam.name}</td>
                  <td style={{ padding: '2rem', fontWeight: '500' }}>{exam.date}</td>
                  <td style={{ padding: '2rem' }}>
                    <span style={{ padding: '0.4rem 1rem', borderRadius: '50px', background: exam.session === 'FN' ? '#eff6ff' : '#fff7ed', color: exam.session === 'FN' ? '#2563eb' : '#ea580c', fontSize: '0.85rem', fontWeight: '900' }}>
                        {exam.session === 'FN' ? 'MORNING' : 'AFTERNOON'}
                    </span>
                  </td>
                  <td style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCompleted ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', background: '#f0fdf4', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', border: '1px solid #dcfce7' }}>
                          <CheckCircle2 size={14} /> COMPLETED
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-theme)', background: 'rgba(28, 61, 90, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '900', border: '1px solid rgba(28, 61, 90, 0.1)' }}>
                          <AlertCircle size={14} /> {exam.allocatedHalls.length}/{exam.halls.length} HALLS
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {exam.allocatedHalls.length > 0 ? (
                      exam.allocatedHalls.map((h, i) => {
                        const hallSymbol = typeof h === 'string' ? h : h.hall;
                        const facultySymbol = typeof h === 'string' ? '' : h.faculty;
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', minWidth: '80px' }}>
                            <span style={{ color: 'var(--primary-theme)', fontSize: '0.9rem', fontWeight: '900' }}>
                              {hallSymbol}
                            </span>
                            {facultySymbol && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                                {facultySymbol}
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No Allocations</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleEdit(exam)}
                      style={{ color: 'var(--secondary-theme)', background: 'rgba(59, 130, 246, 0.1)', border: 'none', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', transition: '0.3s' }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setShowConfirm({ show: true, type: 'delete', id: exam._id })}
                      style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer', transition: '0.3s' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

        {filteredExams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '8rem', color: '#64748b' }}>
            <Database size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>No records found in {selectedDept} Workspace</p>
          </div>
        )}
      </div>

      {showConfirm.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="hub-card" style={{ maxWidth: '450px', padding: '3rem', textAlign: 'center', animation: 'float 6s ease-in-out infinite' }}>
            <AlertCircle size={60} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary-theme)', marginBottom: '1rem' }}>
              {showConfirm.type === 'clear' ? 'Purge Workspace?' : 'Delete Session?'}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
              This action is irreversible. All data related to this {showConfirm.type === 'clear' ? 'entire database' : 'exam'} will be permanently erased.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowConfirm({ show: false, type: '', id: null })} style={{ flex: 1, height: '55px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={() => {
                  if (showConfirm.type === 'clear') handleClearAll();
                  else handleDelete(showConfirm.id);
                  setShowConfirm({ show: false, type: '', id: null });
                }} 
                className="btn-primary" 
                style={{ flex: 1, background: '#ef4444', border: 'none', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
              >
                Confirm Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
