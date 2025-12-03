import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role?.name !== 'admin') {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Panel de Administración</h1>
        
        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Usuarios</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.totalEvents || 0}</h3>
            <p>Total Eventos</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.totalTickets || 0}</h3>
            <p>Tickets Vendidos</p>
          </div>
          <div className="stat-card">
            <h3>Q{stats?.totalRevenue || 0}</h3>
            <p>Ingresos Totales</p>
          </div>
        </div>

        {/* Menú de Acciones */}
        <div className="admin-menu">
          <h2>Gestión</h2>
          <div className="menu-grid">
            <Link to="/admin/users" className="menu-card">
              <h3>👥 Usuarios</h3>
              <p>Gestionar usuarios y roles</p>
            </Link>
            <Link to="/admin/events" className="menu-card">
              <h3>📅 Eventos</h3>
              <p>Crear y gestionar eventos</p>
            </Link>
            <Link to="/admin/categories" className="menu-card">
              <h3>📁 Categorías</h3>
              <p>Gestionar categorías</p>
            </Link>
            <Link to="/admin/reports" className="menu-card">
              <h3>📊 Reportes</h3>
              <p>Ver estadísticas y reportes</p>
            </Link>
          </div>
        </div>

        {/* Eventos Recientes */}
        {stats?.recentEvents && stats.recentEvents.length > 0 && (
          <div className="recent-section">
            <h2>Eventos Recientes</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEvents.map(event => (
                  <tr key={event.eventid}>
                    <td>{event.title}</td>
                    <td>{new Date(event.event_date).toLocaleDateString()}</td>
                    <td>{event.category?.name}</td>
                    <td>{event.is_active ? '✅ Activo' : '❌ Inactivo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
