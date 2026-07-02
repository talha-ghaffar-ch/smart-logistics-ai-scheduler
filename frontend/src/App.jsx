import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Truck, Users, Map, Calendar } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Vans from './pages/Vans';
import Drivers from './pages/Drivers';
import RoutesPage from './pages/Routes';
import Schedules from './pages/Schedules';

function Sidebar() {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/vans', name: 'Vans', icon: <Truck size={20} /> },
    { path: '/drivers', name: 'Drivers', icon: <Users size={20} /> },
    { path: '/routes', name: 'Routes', icon: <Map size={20} /> },
    { path: '/schedules', name: 'Schedules', icon: <Calendar size={20} /> },
  ];

  return (
    <motion.nav 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="sidebar glass-panel"
      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 'none' }}
    >
      <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.2rem' }}>
        <span>H&T LOGISTICS</span>
        <span style={{ fontSize: '0.45em', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: '400' }}>BY HIRA AND TALHA</span>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vans" element={<Vans />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/schedules" element={<Schedules />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;