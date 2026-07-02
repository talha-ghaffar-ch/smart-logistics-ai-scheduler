import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Users, Map, Calendar, Wrench } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import PageWrapper from '../components/PageWrapper';
import { api } from '../api';

const COLORS = ['#00f0ff', '#ff003c', '#00ff66', '#fce205'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [vans, setVans] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getVans(),
      api.getDrivers(),
      api.getRoutes()
    ]).then(([statsData, vansData, driversData, routesData]) => {
      setStats(statsData);
      setVans(vansData);
      setDrivers(driversData);
      setRoutes(routesData);
    }).catch(console.error);
  }, []);

  if (!stats) return <PageWrapper><p style={{ color: 'var(--primary)' }}>INITIALIZING NEURAL LINK...</p></PageWrapper>;

  const cards = [
    { title: 'Fleet Size', value: stats.total_vans, icon: <Truck size={32} className="text-primary" /> },
    { title: 'Active Drivers', value: stats.total_drivers, icon: <Users size={32} className="text-primary" /> },
    { title: 'Active Routes', value: stats.total_routes, icon: <Map size={32} className="text-primary" /> },
    { title: 'Calculated Schedules', value: stats.total_schedules, icon: <Calendar size={32} className="text-success" /> },
    { title: 'Maintenance Alerts', value: stats.vans_in_maintenance, icon: <Wrench size={32} className="text-warning" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  // Data for Charts
  const vanCapacityData = vans.map(v => ({ name: v.vehicle_number, capacity: v.capacity }));
  
  const driverAvailData = [
    { name: 'Available', value: drivers.filter(d => d.is_available).length },
    { name: 'Unavailable', value: drivers.filter(d => !d.is_available).length }
  ];

  const routeDistanceData = routes.map((r, i) => ({ name: `R${i+1}`, distance: r.distance }));

  return (
    <PageWrapper title="Command Center">
      <motion.div 
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {cards.map((card, idx) => (
          <motion.div key={idx} variants={itemVariants} className="stat-card glass-panel">
            <div className="stat-header">
              <span>{card.title}</span>
              <span style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>{card.icon}</span>
            </div>
            <div className="stat-value">{card.value}</div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Van Capacities Bar Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Fleet Payload Matrix</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vanCapacityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--primary)', borderRadius: '4px' }} />
                <Bar dataKey="capacity" fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Driver Availability Pie Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Operative Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', height: 300 }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driverAvailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {driverAvailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--success)' : 'var(--danger)'} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--primary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, backgroundColor: 'var(--danger)', borderRadius: '50%', boxShadow: '0 0 10px var(--danger)' }}></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Route Distances Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Route Topography (Distance)</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={routeDistanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--primary)' }} />
                <Line type="monotone" dataKey="distance" stroke="var(--secondary)" strokeWidth={3} dot={{ fill: 'var(--secondary)', r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-in-out" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </PageWrapper>
  );
}