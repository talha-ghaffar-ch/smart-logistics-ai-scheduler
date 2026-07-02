import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';
import { api } from '../api';

function RouteModal({ route, onClose, onSave }) {
  const [formData, setFormData] = useState(
    route || { source: '', destination: '', distance: 0, estimated_time: 0, passengers: 0, priority: 2 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (route) {
      await api.updateRoute(route.id, formData);
    } else {
      await api.addRoute(formData);
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
          <h3>{route ? 'Edit Route' : 'Add New Route'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Source</label>
            <input required className="form-control" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input required className="form-control" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Distance (km)</label>
              <input type="number" required className="form-control" value={formData.distance} onChange={e => setFormData({...formData, distance: parseFloat(e.target.value)})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Est. Time (hours)</label>
              <input type="number" step="0.1" required className="form-control" value={formData.estimated_time} onChange={e => setFormData({...formData, estimated_time: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Passengers</label>
              <input type="number" required className="form-control" value={formData.passengers} onChange={e => setFormData({...formData, passengers: parseInt(e.target.value)})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Priority</label>
              <select className="form-control" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}>
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Route</button>
        </form>
      </motion.div>
    </div>
  );
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadRoutes = () => {
    api.getRoutes().then(setRoutes).catch(console.error);
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      await api.deleteRoute(id);
      loadRoutes();
    }
  };

  return (
    <PageWrapper title="Manage Routes">
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={18} /> Add Route
        </button>
      </div>

      <div className="glass-panel table-container">
        <table>
          <thead>
            <tr>
              <th>Source &rarr; Destination</th>
              <th>Distance</th>
              <th>Time</th>
              <th>Passengers</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.id}>
                <td>{route.source} &rarr; {route.destination}</td>
                <td>{route.distance} km</td>
                <td>{route.estimated_time} h</td>
                <td>{route.passengers}</td>
                <td>
                  <span className={`badge badge-${route.priority === 3 ? 'inactive' : route.priority === 2 ? 'maintenance' : 'active'}`}>
                    {route.priority === 3 ? 'High' : route.priority === 2 ? 'Medium' : 'Low'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)' }} onClick={() => { setEditing(route); setShowModal(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(route.id)}>
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
          <RouteModal 
            route={editing} 
            onClose={() => setShowModal(false)} 
            onSave={() => { setShowModal(false); loadRoutes(); }} 
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}