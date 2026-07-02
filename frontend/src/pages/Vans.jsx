import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { api } from '../api';

function VanModal({ van, onClose, onSave }) {
  const [formData, setFormData] = useState(
    van || { vehicle_number: '', capacity: 10, fuel_capacity: 500, status: 'Active', under_maintenance: false }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (van) {
      await api.updateVan(van.id, formData);
    } else {
      await api.addVan(formData);
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
          <h3>{van ? 'Edit Van' : 'Add New Van'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vehicle Number</label>
            <input required className="form-control" value={formData.vehicle_number} onChange={e => setFormData({...formData, vehicle_number: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Passenger Capacity</label>
            <input type="number" required className="form-control" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Fuel Range (km)</label>
            <input type="number" required className="form-control" value={formData.fuel_capacity} onChange={e => setFormData({...formData, fuel_capacity: parseInt(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="maintenance" checked={formData.under_maintenance} onChange={e => setFormData({...formData, under_maintenance: e.target.checked})} />
            <label htmlFor="maintenance" style={{ marginBottom: 0 }}>Under Maintenance</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Van</button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Vans() {
  const [vans, setVans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadVans = () => {
    api.getVans().then(setVans).catch(console.error);
  };

  useEffect(() => {
    loadVans();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.deleteVan(id);
      loadVans();
    }
  };

  return (
    <PageWrapper title="Manage Vans">
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={18} /> Add Van
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Vehicle Number</th>
              <th>Capacity</th>
              <th>Fuel (km)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vans.map(van => (
              <tr key={van.id}>
                <td>{van.vehicle_number}</td>
                <td>{van.capacity}</td>
                <td>{van.fuel_capacity}</td>
                <td>
                  <span className={`badge badge-${van.under_maintenance ? 'maintenance' : van.status === 'Active' ? 'active' : 'inactive'}`}>
                    {van.under_maintenance ? 'Maintenance' : van.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => { setEditing(van); setShowModal(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(van.id)}>
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
          <VanModal 
            van={editing} 
            onClose={() => setShowModal(false)} 
            onSave={() => { setShowModal(false); loadVans(); }} 
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}