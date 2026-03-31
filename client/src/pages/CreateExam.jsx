import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDept } from '../context/DeptContext';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilePlus2, Building2, Calendar, Clock, Save } from 'lucide-react';
import BackButton from '../components/BackButton';
import API_URL from '../api';

const SPECIAL_LABS = ['GFLAB', 'FFLAB', 'SFLAB'];

const CreateExam = () => {
  const { selectedDept } = useDept();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams  = new URLSearchParams(location.search);
  const editId       = queryParams.get('edit');
  const existingExam = location.state?.exam;

  const [formData, setFormData] = useState({
    name: '', date: '', session: 'FN', halls: [], allocatedHalls: []
  });
  const [availableHalls, setAvailableHalls] = useState([]);
  const [loading, setLoading] = useState(false);

  const normalizeDate = (dateStr) => {
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (s.includes('T')) return s.split('T')[0];
    const parts = s.match(/\d+/g);
    if (parts?.length === 3) {
      let d, m, y;
      if (parts[0].length === 4) { [y, m, d] = parts; }
      else { [d, m, y] = parts; if (y.length === 2) y = '20' + y; }
      return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    return s;
  };

  useEffect(() => {
    axios.get(`${API_URL}/api/halls`)
      .then(res => setAvailableHalls(res.data))
      .catch(() => toast.error('Failed to load halls'));

    if (editId) {
      const applyExam = (exam) => setFormData({
        name: exam.name,
        date: normalizeDate(exam.date),
        session: exam.session,
        halls: exam.halls,
        allocatedHalls: exam.allocatedHalls || []
      });

      if (existingExam) {
        applyExam(existingExam);
      } else {
        axios.get(`${API_URL}/api/exams`, { headers: { 'x-dept-name': selectedDept } })
          .then(res => {
            const exam = res.data.find(e => e._id === editId);
            if (exam) applyExam(exam);
          })
          .catch(console.error);
      }
    }
  }, [editId, existingExam, selectedDept]);

  const toggleHall = (hallName) => {
    if (SPECIAL_LABS.includes(hallName)) {
      const entries = formData.halls.filter(h => h.startsWith(`${hallName}-`));
      setFormData(prev => ({
        ...prev,
        halls: entries.length > 0
          ? prev.halls.filter(h => !h.startsWith(`${hallName}-`))
          : [...prev.halls, `${hallName}-1`]
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      halls: prev.halls.includes(hallName)
        ? prev.halls.filter(h => h !== hallName)
        : [...prev.halls, hallName]
    }));
  };

  const updateLabCount = (hallName, delta, e) => {
    e.stopPropagation();
    const count    = formData.halls.filter(h => h.startsWith(`${hallName}-`)).length;
    const next     = Math.max(1, Math.min(5, count + delta));
    if (next === count) return;
    setFormData(prev => ({
      ...prev,
      halls: [
        ...prev.halls.filter(h => !h.startsWith(`${hallName}-`)),
        ...Array.from({ length: next }, (_, i) => `${hallName}-${i + 1}`)
      ]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.halls.length === 0) return toast.error('Please select at least one hall');

    setLoading(true);
    try {
      if (editId) {
        await axios.put(
          `${API_URL}/api/exams/${editId}`,
          { ...formData, dept: selectedDept },
          { headers: { 'x-dept-name': selectedDept } }
        );
        toast.success('Exam updated successfully');
      } else {
        await axios.post(
          `${API_URL}/api/exams`,
          { ...formData, dept: selectedDept },
          { headers: { 'x-dept-name': selectedDept } }
        );
        toast.success('Exam created successfully');
      }
      navigate('/');
    } catch {
      toast.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared card header style ── */
  const cardHeaderStyle = {
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border)'
  };
  const cardIconStyle = (bg) => ({
    width: 38, height: 38, borderRadius: 'var(--r-sm)',
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  });

  return (
    <div className="standard-page">
      <BackButton />

      {/* Page Title */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h1
          className="gradient-text"
          style={{ fontSize: 'var(--font-xl)', fontWeight: 900, letterSpacing: '-1px', marginBottom: '0.375rem', lineHeight: 1.1 }}
        >
          {editId ? 'Modify Session' : 'Create New Exam'}
        </h1>
        <p
          className="mobile-hide"
          style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}
        >
          Configuring exam parameters for the{' '}
          <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedDept}</strong>{' '}
          department.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="create-exam-form">

        {/* ── Basic Configuration ── */}
        <div
          className="glass-panel"
          style={{ padding: 'var(--space-md)', height: 'fit-content' }}
        >
          <div style={cardHeaderStyle}>
            <div style={cardIconStyle('rgba(28,61,90,0.07)')}>
              <FilePlus2 size={20} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, margin: 0 }}>
              Basic Configuration
            </h3>
          </div>

          <div className="form-group">
            <label htmlFor="exam-name">Exam Name</label>
            <input
              id="exam-name"
              type="text"
              className="form-input"
              placeholder="e.g. Serial Test 1 - Programming in C"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="flex-responsive" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="exam-date">Schedule Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar
                  size={15}
                  style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none'
                  }}
                />
                <input
                  id="exam-date"
                  type="date"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="exam-session">Time Slot</label>
              <div style={{ position: 'relative' }}>
                <Clock
                  size={15}
                  style={{
                    position: 'absolute', left: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none'
                  }}
                />
                <select
                  id="exam-session"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.session}
                  onChange={e => setFormData({ ...formData, session: e.target.value })}
                >
                  <option value="FN">Forenoon (FN)</option>
                  <option value="AN">Afternoon (AN)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Hall Selection ── */}
        <div className="glass-panel" style={{ padding: 'var(--space-md)' }}>
          <div style={cardHeaderStyle}>
            <div style={cardIconStyle('rgba(37,99,235,0.07)')}>
              <Building2 size={20} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, margin: 0 }}>
              Hall Selection
            </h3>
          </div>

          {/* Hall Grid */}
          <div
            className="hall-grid"
            style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}
          >
            {availableHalls.map(hall => {
              const isSpecial  = SPECIAL_LABS.includes(hall.hallName);
              const labEntries = formData.halls.filter(h => h.startsWith(hall.hallName));
              const labCount   = labEntries.length;
              const isSelected = isSpecial ? labCount > 0 : formData.halls.includes(hall.hallName);

              return (
                <div
                  key={hall._id}
                  onClick={() => toggleHall(hall.hallName)}
                  className={`hall-item${isSelected ? ' selected' : ''}`}
                  style={{
                    padding: isSpecial && isSelected ? '0.5rem' : undefined,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: isSpecial && isSelected ? '0.2rem' : 0,
                    minHeight: 48
                  }}
                >
                  <span style={{ fontSize: isSpecial && isSelected ? '0.72rem' : undefined }}>
                    {hall.hallName}
                  </span>

                  {isSpecial && isSelected && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.6rem',
                        background: 'rgba(255,255,255,0.15)',
                        padding: '2px 8px', borderRadius: 6,
                        width: '100%', marginTop: 2
                      }}
                    >
                      <button
                        type="button"
                        onClick={e => updateLabCount(hall.hallName, -1, e)}
                        disabled={labCount <= 1}
                        style={{
                          background: 'none', border: 'none', color: 'white',
                          cursor: labCount <= 1 ? 'default' : 'pointer',
                          padding: '2px 4px', fontSize: '1rem', fontWeight: 700,
                          opacity: labCount <= 1 ? 0.3 : 1, lineHeight: 1,
                          fontFamily: 'inherit'
                        }}
                      >
                        &minus;
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '1rem', textAlign: 'center' }}>
                        {labCount}
                      </span>
                      <button
                        type="button"
                        onClick={e => updateLabCount(hall.hallName, 1, e)}
                        disabled={labCount >= 5}
                        style={{
                          background: 'none', border: 'none', color: 'white',
                          cursor: labCount >= 5 ? 'default' : 'pointer',
                          padding: '2px 4px', fontSize: '1rem', fontWeight: 700,
                          opacity: labCount >= 5 ? 0.3 : 1, lineHeight: 1,
                          fontFamily: 'inherit'
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary + Submit */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              justifyContent: 'space-between', alignItems: 'center',
              gap: '0.75rem', marginBottom: '1.25rem'
            }}>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>
                Inventory Summary
              </span>
              <span style={{
                background: 'var(--primary)', color: 'white',
                padding: '0.35rem 0.875rem', borderRadius: 'var(--r-full)',
                fontSize: 'var(--font-xs)', fontWeight: 800,
                boxShadow: '0 4px 12px rgba(28,61,90,0.2)'
              }}>
                {formData.halls.length} {formData.halls.length === 1 ? 'Hall' : 'Halls'} Selected
              </span>
            </div>

            <div className="flex-responsive" style={{ gap: '0.75rem' }}>
              {editId && (
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  className="btn-secondary"
                  style={{ flex: 1, minWidth: 100, height: 50, margin: 0 }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 2, minWidth: 160, height: 50, margin: 0 }}
              >
                {loading
                  ? 'Processing...'
                  : <><Save size={16} /> {editId ? 'Update Session' : 'Finalize Exam'}</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
