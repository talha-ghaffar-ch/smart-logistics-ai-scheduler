import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Truck, User } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { api } from '../api';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadSchedules = () => {
    api.getSchedules().then(setSchedules).catch(console.error);
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.generateSchedules();
      setMessage(res.message);
      loadSchedules();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="AI Schedule Generation">
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ padding: '1rem 2rem', fontSize: '1.1rem', width: '100%', justifyContent: 'center' }}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Zap size={24} />
            </motion.div>
          ) : <Zap size={24} />}
          {loading ? 'AI Engine Calculating...' : 'Generate with AI (CSP)'}
        </button>
      </div>

      {error && <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>{error}</div>}
      {message && <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', border: '1px solid var(--success)' }}>{message}</div>}

      <div className="dashboard-grid">
        {schedules.map((schedule, idx) => (
          <motion.div 
            key={schedule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card glass-panel"
          >
            <div className="stat-header" style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{schedule.route_details?.source} &rarr; {schedule.route_details?.destination}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Clock size={16} className="text-warning" />
                <span>Departure: {new Date(schedule.departure_time).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Truck size={16} className="text-primary" />
                <span>Van: {schedule.van_details?.vehicle_number} (Cap: {schedule.van_details?.capacity})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <User size={16} className="text-success" />
                <span>Driver: {schedule.driver_details?.name}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {schedules.length === 0 && !loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
          No schedules generated yet. Click the button above to run the AI solver.
        </div>
      )}
    </PageWrapper>
  );
}