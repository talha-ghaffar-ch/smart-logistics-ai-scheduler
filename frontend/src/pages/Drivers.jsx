import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { api } from '../api';

function DriverModal({ driver, onClose, onSave }) {
  const [formData, setFormData] = useState(
    driver || { name: '', license_number: '', is_available: true, max_working_hours: 8 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (driver) {
      await api.updateDriver(driver.id, formData);
    } else {
      await api.addDriver(formData);
    }
    onSave();
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content glass-panel"
      >
        <div className="modal-header">
          <h3>{driver ? 'Edit Driver' : 'Add New Driver'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input required className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input required className="form-control" value={formData.license_number} onChange={e => setFormData({...formData, license_number: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Max Working Hours</label>
            <input type="number" required className="form-control" value={formData.max_working_hours} onChange={e => setFormData({...formData, max_working_hours: parseInt(e.target.value)})} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="available" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} />
            <label htmlFor="available" style={{ marginBottom: 0 }}>Available for Work</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Driver</button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadDrivers = () => {
    api.getDrivers().then(setDrivers).catch(console.error);
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.deleteDriver(id);
      loadDrivers();
    }
  };

  return (
    <PageWrapper title="Manage Drivers">
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={18} /> Add Driver
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>License</th>
              <th>Max Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.license_number}</td>
                <td>{driver.max_working_hours}</td>
                <td>
                  <span className={`badge badge-${driver.is_available ? 'active' : 'inactive'}`}>
                    {driver.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => { setEditing(driver); setShowModal(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(driver.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <DriverModal 
            driver={editing} 
            onClose={() => setShowModal(false)} 
            onSave={() => { setShowModal(false); loadDrivers(); }} 
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}