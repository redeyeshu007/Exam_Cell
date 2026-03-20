import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDept } from '../context/DeptContext';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilePlus2, Building2, Calendar, Clock, ChevronRight, Save } from 'lucide-react';
import BackButton from '../components/BackButton';
import API_URL from '../api';

const CreateExam = () => {
  const { selectedDept } = useDept();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  const existingExam = location.state?.exam;

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    session: 'FN',
    halls: [],
    allocatedHalls: []
  });
  const [availableHalls, setAvailableHalls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/halls`);
        setAvailableHalls(res.data);
      } catch (err) {
        toast.error('Failed to load halls');
      }
    };
    fetchHalls();

    if (editId) {
      if (existingExam) {
        setFormData({
          name: existingExam.name,
          date: existingExam.date,
          session: existingExam.session,
          halls: existingExam.halls,
          allocatedHalls: existingExam.allocatedHalls || []
        });
      } else {
        const fetchExam = async () => {
          try {
            const res = await axios.get(`${API_URL}/api/exams`, {
              headers: { 'x-dept-name': selectedDept }
            });
            const exam = res.data.find(e => e._id === editId);
            if (exam) {
              setFormData({
                name: exam.name,
                date: exam.date,
                session: exam.session,
                halls: exam.halls,
                allocatedHalls: exam.allocatedHalls || []
              });
            }
          } catch (err) {
            console.error(err);
          }
        };
        fetchExam();
      }
    }
  }, [editId, existingExam, selectedDept]);

  const toggleHall = (hallName) => {
    setFormData(prev => ({
      ...prev,
      halls: prev.halls.includes(hallName)
        ? prev.halls.filter(h => h !== hallName)
        : [...prev.halls, hallName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.halls.length === 0) {
      return toast.error('Please select at least one hall');
    }

    setLoading(true);
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/exams/${editId}`, 
          { ...formData, dept: selectedDept },
          { headers: { 'x-dept-name': selectedDept } }
        );
        toast.success(`Exam Updated Successfully!`);
        navigate('/history');
      } else {
        await axios.post(`${API_URL}/api/exams`, 
          { ...formData, dept: selectedDept },
          { headers: { 'x-dept-name': selectedDept } }
        );
        toast.success(`Exam Created Successfully!`);
        setFormData({ name: '', date: '', session: 'FN', halls: [], allocatedHalls: [] });
      }
    } catch (err) {
      toast.error('Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="standard-page">
      <BackButton />
      <div style={{ marginBottom: '4rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '0.5rem' }}>
          {editId ? 'Modify Session' : 'Create New Exam'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '500' }}>
          Configuring parameters for the <span style={{ color: 'var(--primary-theme)', fontWeight: '800' }}>{selectedDept}</span> department.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '3rem' }}>
        <div className="hub-card" style={{ height: 'fit-content', padding: '3rem', textAlign: 'left', alignItems: 'stretch', animation: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1.5px solid var(--border-muted)', paddingBottom: '1.2rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(28, 61, 90, 0.05)', borderRadius: '12px' }}>
                <FilePlus2 size={24} color="var(--primary-theme)" />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Basic Configuration</h3>
          </div>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Exam Label</label>
            <input
              type="text"
              className="form-input"
              style={{ height: '55px', borderRadius: '12px', fontSize: '1.1rem', background: 'white' }}
              placeholder="e.g. End Semester - Advanced Java"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Schedule Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input
                  type="date"
                  className="form-input"
                  style={{ height: '55px', borderRadius: '12px', background: 'white' }}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Time Slot</label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <select
                  className="form-input"
                  style={{ height: '55px', borderRadius: '12px', background: 'white' }}
                  value={formData.session}
                  onChange={(e) => setFormData({...formData, session: e.target.value})}
                >
                  <option value="FN">Forenoon (FN)</option>
                  <option value="AN">Afternoon (AN)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="hub-card" style={{ padding: '3rem', textAlign: 'left', alignItems: 'stretch', animation: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1.5px solid var(--border-muted)', paddingBottom: '1.2rem' }}>
             <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px' }}>
                <Building2 size={24} color="var(--secondary-theme)" />
             </div>
             <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Hall Selection</h3>
          </div>
          
          <div className="hall-grid" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '12px', gap: '1rem' }}>
            {availableHalls.map(hall => (
              <div
                key={hall._id}
                onClick={() => toggleHall(hall.hallName)}
                className={`hall-item ${formData.halls.includes(hall.hallName) ? 'selected' : ''}`}
                style={{ 
                  fontSize: '1rem', 
                  padding: '1.1rem', 
                  borderRadius: '14px',
                  fontWeight: '700',
                  border: '2px solid #f1f5f9',
                  background: formData.halls.includes(hall.hallName) ? 'var(--primary-theme)' : 'white',
                  color: formData.halls.includes(hall.hallName) ? 'white' : 'inherit'
                }}
              >
                {hall.hallName}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1.5px solid var(--border-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
               <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Inventory Summary</span>
               <div style={{ background: 'var(--primary-theme)', color: 'white', padding: '0.6rem 1.4rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 8px 20px rgba(28, 61, 90, 0.2)' }}>
                  {formData.halls.length} HALLS ALLOCATED
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {editId && (
                <button
                  type="button"
                  onClick={() => navigate('/history')}
                  style={{ flex: 1, height: '60px', background: 'white', border: '1.5px solid var(--border-muted)', borderRadius: '15px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ flex: 2, height: '65px', borderRadius: '16px', fontSize: '1.1rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                {loading ? 'Processing...' : <><Save size={20} /> {editId ? 'UPDATE SESSION' : 'FINALIZE EXAM'}</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
