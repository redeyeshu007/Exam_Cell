import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDept } from '../context/DeptContext';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Trash2, Edit3,
  Database, AlertCircle, CheckCircle2
} from 'lucide-react';
import BackButton from '../components/BackButton';
import API_URL from '../api';

const History = () => {
  const { selectedDept } = useDept();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExams, setSelectedExams] = useState([]);
  const [showConfirm, setShowConfirm] = useState({ show: false, type: '', id: null });

  const fetchExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/exams`, {
        headers: { 'x-dept-name': selectedDept }
      });
      setExams(res.data);
    } catch {
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
      toast.success('Record deleted');
      fetchExams();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/exams/clear`, {
        headers: { 'x-dept-name': selectedDept }
      });
      toast.success('All records cleared');
      fetchExams();
    } catch {
      toast.error('Failed to clear history');
    }
  };

  const handleEdit = (exam) => {
    navigate(`/create-exam?edit=${exam._id}`, { state: { exam } });
  };

  const handleExport = () => {
    const dataToExport = selectedExams.length > 0
      ? exams.filter(e => selectedExams.includes(e._id))
      : exams;

    if (dataToExport.length === 0) return toast.error('No records to export');

    const wsData = [['Exam Name', 'Date', 'Session', 'Allocated Halls']];

    dataToExport.forEach(e => {
      let displayDate = e.date;
      if (e.date?.includes('-') && e.date.split('-')[0].length === 4) {
        const [y, m, d] = e.date.split('-');
        displayDate = `${d}-${m}-${y}`;
      }
      const hallsList = e.allocatedHalls.map(h => {
        const hName = (typeof h === 'string' ? h : h.hall).replace(/-\d+$/, '');
        return `${hName}${h.faculty ? ` (${h.faculty})` : ''}`;
      }).join(', ');

      wsData.push([
        e.name,
        displayDate,
        e.session === 'FN' ? 'Morning (FN)' : 'Afternoon (AN)',
        hallsList
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [{ wch: 32 }, { wch: 14 }, { wch: 16 }, { wch: 80 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exam History');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${selectedDept}_Exam_History_${dateStr}.xlsx`);
    toast.success('Excel file exported!');
  };

  const filteredExams = exams.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const dismissConfirm = () => setShowConfirm({ show: false, type: '', id: null });

  return (
    <div className="standard-page">
      <BackButton />

      {/* Page Header */}
      <div className="flex-responsive page-header-flex" style={{ gap: '1rem' }}>
        <div>
          <h1
            className="gradient-text"
            style={{
              fontSize: 'var(--font-xl)',
              fontWeight: 900,
              letterSpacing: '-1px',
              marginBottom: '0.375rem',
              lineHeight: 1.1
            }}
          >
            Database History
          </h1>
          <p
            className="mobile-hide"
            style={{ color: 'var(--text-muted)', fontSize: 'var(--font-base)', fontWeight: 500 }}
          >
            Auditing records for the{' '}
            <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedDept}</strong>{' '}
            department.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowConfirm({ show: true, type: 'clear', id: null })}
            className="btn-primary"
            style={{
              width: 'auto', margin: 0, padding: '0 1.125rem', height: 42,
              background: 'transparent',
              color: 'var(--danger)',
              border: '1.5px solid var(--danger-border)',
              borderRadius: 'var(--r)',
              fontSize: 'var(--font-xs)'
            }}
          >
            Purge All
          </button>
          <button
            onClick={handleExport}
            className="btn-primary"
            style={{
              width: 'auto', margin: 0, padding: '0 1.125rem', height: 42,
              borderRadius: 'var(--r)',
              fontSize: 'var(--font-xs)',
              background: selectedExams.length > 0 ? 'var(--accent)' : undefined
            }}
          >
            <Download size={15} />
            {selectedExams.length > 0 ? `Export (${selectedExams.length})` : 'Export All'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
          placeholder={`Search ${selectedDept} records...`}
          className="form-input"
          style={{ paddingLeft: '2.75rem', height: 44, borderRadius: 'var(--r-md)' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-inner">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 52 }}>
                  <input
                    type="checkbox"
                    checked={filteredExams.length > 0 && selectedExams.length === filteredExams.length}
                    onChange={() =>
                      setSelectedExams(
                        selectedExams.length === filteredExams.length
                          ? []
                          : filteredExams.map(e => e._id)
                      )
                    }
                    style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--accent)' }}
                  />
                </th>
                <th>Session Name</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Status</th>
                <th>Halls</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading records...
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
                      <Database size={44} style={{ opacity: 0.15, color: 'var(--primary)' }} />
                      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>
                        {search
                          ? `No results for "${search}"`
                          : `No exam records found in ${selectedDept}`}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {search ? 'Try a different search term.' : 'Created and allocated exams will appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => {
                  const isCompleted =
                    (exam.allocatedHalls?.length || 0) === (exam.halls?.length || 0) &&
                    (exam.halls?.length || 0) > 0;
                  return (
                    <tr
                      key={exam._id}
                      style={{
                        background: selectedExams.includes(exam._id)
                          ? 'rgba(37,99,235,0.04)'
                          : undefined
                      }}
                    >
                      <td className="cell-selection" style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedExams.includes(exam._id)}
                          onChange={() =>
                            setSelectedExams(prev =>
                              prev.includes(exam._id)
                                ? prev.filter(i => i !== exam._id)
                                : [...prev, exam._id]
                            )
                          }
                          style={{ width: 17, height: 17, cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                      </td>

                      <td
                        data-label="Session"
                        style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}
                      >
                        {exam.name}
                      </td>

                      <td data-label="Date" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {exam.date}
                      </td>

                      <td data-label="Slot">
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.3rem 0.875rem',
                          borderRadius: 'var(--r-full)',
                          background: exam.session === 'FN' ? 'var(--morning-bg)' : 'var(--afternoon-bg)',
                          color: exam.session === 'FN' ? 'var(--morning-text)' : 'var(--afternoon-text)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          whiteSpace: 'nowrap'
                        }}>
                          {exam.session === 'FN' ? 'Morning' : 'Afternoon'}
                        </span>
                      </td>

                      <td data-label="Status">
                        {isCompleted ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            color: 'var(--success)', background: 'var(--success-bg)',
                            padding: '0.3rem 0.75rem', borderRadius: 'var(--r-full)',
                            fontSize: '0.72rem', fontWeight: 800,
                            border: '1px solid var(--success-border)'
                          }}>
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            color: 'var(--primary)', background: 'rgba(28,61,90,0.06)',
                            padding: '0.3rem 0.75rem', borderRadius: 'var(--r-full)',
                            fontSize: '0.72rem', fontWeight: 800,
                            border: '1px solid rgba(28,61,90,0.1)'
                          }}>
                            <AlertCircle size={12} />
                            {exam.allocatedHalls.length}/{exam.halls.length} Halls
                          </span>
                        )}
                      </td>

                      <td data-label="Halls">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {exam.allocatedHalls.length > 0 ? (
                            exam.allocatedHalls.map((h, i) => {
                              const hallName = (typeof h === 'string' ? h : h.hall).replace(/-\d+$/, '');
                              const faculty  = typeof h === 'string' ? '' : h.faculty;
                              return (
                                <div key={i} style={{
                                  display: 'flex', flexDirection: 'column', gap: 2,
                                  background: 'var(--bg)',
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: 'var(--r-sm)',
                                  border: '1px solid var(--border)',
                                  minWidth: 64
                                }}>
                                  <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 800 }}>
                                    {hallName}
                                  </span>
                                  {faculty && (
                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                                      {faculty}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <span style={{ color: 'var(--text-faint)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                              No allocations
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="cell-actions" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(exam)}
                            title="Edit exam"
                            style={{
                              color: 'var(--accent)',
                              background: 'var(--morning-bg)',
                              border: '1px solid #bfdbfe',
                              padding: '0.45rem',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              transition: 'var(--t-fast)',
                              display: 'flex'
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setShowConfirm({ show: true, type: 'delete', id: exam._id })}
                            title="Delete record"
                            style={{
                              color: 'var(--danger)',
                              background: 'var(--danger-bg)',
                              border: '1px solid var(--danger-border)',
                              padding: '0.45rem',
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              transition: 'var(--t-fast)',
                              display: 'flex'
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm.show && (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', zIndex: 1000
        }}>
          <div
            onClick={dismissConfirm}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15,23,42,0.55)',
              backdropFilter: 'blur(6px)'
            }}
          />
          <div style={{
            position: 'relative',
            background: 'white',
            padding: '2rem 1.75rem',
            borderRadius: 'var(--r-xl)',
            maxWidth: 360, width: '100%',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--danger-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', color: 'var(--danger)'
            }}>
              <AlertCircle size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text)' }}>
              {showConfirm.type === 'clear' ? 'Purge all records?' : 'Delete this record?'}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              This action cannot be undone and all related data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={dismissConfirm}
                style={{
                  flex: 1, padding: '0.8rem',
                  background: 'var(--bg)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r)', cursor: 'pointer',
                  fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm.type === 'clear') handleClearAll();
                  else handleDelete(showConfirm.id);
                  dismissConfirm();
                }}
                style={{
                  flex: 1, padding: '0.8rem',
                  background: 'var(--danger)', color: 'white',
                  border: 'none', borderRadius: 'var(--r)', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
                  fontFamily: 'inherit'
                }}
              >
                {showConfirm.type === 'clear' ? 'Purge All' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
