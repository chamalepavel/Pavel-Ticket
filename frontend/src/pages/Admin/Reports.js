import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventReports, setEventReports] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear
  });

  useEffect(() => {
    if (!user || user.role?.name !== 'admin') {
      navigate('/');
      return;
    }
    loadReports();
  }, [user, navigate]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Calcular fechas basadas en mes y año
      let params = {};
      if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59);
        params = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
      }
      
      const response = await adminService.getSalesReport(params);
      
      if (response.data) {
        setEventReports(response.data.eventReports || []);
        setSalesSummary(response.data.summary || null);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilter = () => {
    loadReports();
  };

  const handleClearFilter = () => {
    setFilters({ month: '', year: '' });
    setTimeout(() => loadReports(), 100);
  };

  const handleCurrentMonth = () => {
    setFilters({
      month: currentMonth,
      year: currentYear
    });
    setTimeout(() => loadReports(), 100);
  };

  // Generar opciones de años (últimos 5 años y próximos 2)
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const downloadCSV = () => {
    if (!eventReports.length) return;

    // Crear CSV con los valores correctos del backend
    const headers = ['Evento', 'Boletos Vendidos', 'Precio', 'Ingresos Totales', 'Capacidad', '% Ocupación'];
    const rows = eventReports.map(event => [
      event.title,
      event.tickets_sold || 0,
      `Q${parseFloat(event.price).toFixed(2)}`,
      `Q${parseFloat(event.total_revenue || 0).toFixed(2)}`,
      event.capacity,
      `${event.occupancy_percentage}%`
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Descargar
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="header-section">
          <h1>📊 Reportes de Ventas y Asistencia</h1>
        </div>

        {/* Filtros de Mes y Año */}
        <div className="filters-section" style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>📅 Filtrar por Período</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'end' }}>
            <div>
              <label><strong>Mes:</strong></label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="form-control"
                style={{ minWidth: '150px' }}
              >
                <option value="">Todos los meses</option>
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label><strong>Año:</strong></label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="form-control"
                style={{ minWidth: '120px' }}
              >
                <option value="">Todos los años</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={handleFilter} className="btn btn-primary">
                🔍 Filtrar
              </button>
              <button 
                onClick={handleCurrentMonth} 
                className="btn btn-success"
                style={{ marginLeft: '10px' }}
              >
                📆 Mes Actual
              </button>
              <button 
                onClick={handleClearFilter} 
                className="btn btn-outline"
                style={{ marginLeft: '10px' }}
              >
                🔄 Ver Todos
              </button>
            </div>
          </div>
          
          {/* Mostrar período seleccionado */}
          {filters.month && filters.year && (
            <div style={{ marginTop: '15px', padding: '10px', background: '#f0f8ff', borderRadius: '4px' }}>
              <strong>Período seleccionado:</strong> {monthNames[filters.month - 1]} {filters.year}
            </div>
          )}
        </div>

        {/* Resumen de Ventas */}
        {salesSummary && (
          <div className="summary-cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div className="stat-card">
              <h3>💰 Ingresos Totales</h3>
              <p className="stat-value">Q{parseFloat(salesSummary.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>🎟️ Total Boletos Vendidos</h3>
              <p className="stat-value">{salesSummary.totalTicketsSold || 0}</p>
            </div>
            <div className="stat-card">
              <h3>🎪 Eventos Activos</h3>
              <p className="stat-value">{salesSummary.activeEvents || 0}</p>
            </div>
            <div className="stat-card">
              <h3>📊 Promedio por Evento</h3>
              <p className="stat-value">
                Q{salesSummary.activeEvents > 0 
                  ? (salesSummary.totalRevenue / salesSummary.activeEvents).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
        )}

        {/* Botón de Descarga */}
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <button 
            onClick={downloadCSV} 
            className="btn btn-success"
            disabled={!eventReports.length}
          >
            📥 Descargar Reporte CSV
          </button>
        </div>

        {/* Tabla de Reportes por Evento */}
        <div className="reports-table">
          <h2>Reporte Detallado por Evento</h2>
          
          {eventReports.length === 0 ? (
            <div className="alert alert-info">
              No hay datos para mostrar en el rango de fechas seleccionado.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Boletos Vendidos</th>
                  <th>Capacidad</th>
                  <th>% Ocupación</th>
                  <th>Ingresos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {eventReports.map(event => {
                  // Usar los valores que vienen directamente del backend
                  const ticketsSold = event.tickets_sold || 0;
                  const totalRevenue = parseFloat(event.total_revenue || 0);
                  const occupancy = parseFloat(event.occupancy_percentage || 0);

                  return (
                    <tr key={event.eventid}>
                      <td><strong>{event.title}</strong></td>
                      <td>{new Date(event.event_date).toLocaleDateString('es-GT')}</td>
                      <td>{event.category_name || 'N/A'}</td>
                      <td>Q{parseFloat(event.price).toFixed(2)}</td>
                      <td>
                        <span className="badge badge-info">
                          {ticketsSold}
                        </span>
                      </td>
                      <td>{event.capacity}</td>
                      <td>
                        <div style={{ 
                          width: '100%', 
                          background: '#e0e0e0', 
                          borderRadius: '4px',
                          height: '20px',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: `${occupancy}%`,
                            background: occupancy >= 80 ? '#4caf50' : occupancy >= 50 ? '#ff9800' : '#2196f3',
                            height: '100%',
                            borderRadius: '4px',
                            transition: 'width 0.3s'
                          }}></div>
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {occupancy.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#4caf50' }}>
                          Q{totalRevenue.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge ${event.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {event.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                  <td colSpan="4">TOTALES:</td>
                  <td>
                    <span className="badge badge-primary">
                      {eventReports.reduce((sum, e) => sum + (e.tickets_sold || 0), 0)}
                    </span>
                  </td>
                  <td>{eventReports.reduce((sum, e) => sum + e.capacity, 0)}</td>
                  <td>-</td>
                  <td>
                    <strong style={{ color: '#4caf50', fontSize: '16px' }}>
                      Q{eventReports.reduce((sum, e) => 
                        sum + parseFloat(e.total_revenue || 0), 0
                      ).toFixed(2)}
                    </strong>
                  </td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* Eventos Más Populares */}
        {eventReports.length > 0 && (
          <div className="popular-events" style={{ marginTop: '30px' }}>
            <h2>🏆 Eventos Más Populares</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {eventReports
                .sort((a, b) => (b.tickets_sold || 0) - (a.tickets_sold || 0))
                .slice(0, 3)
                .map((event, index) => (
                  <div 
                    key={event.eventid}
                    className="card"
                    style={{
                      background: index === 0 ? '#fff3cd' : 'white',
                      border: index === 0 ? '2px solid #ffc107' : '1px solid #ddd'
                    }}
                  >
                    <div className="card-body">
                      {index === 0 && <div style={{ fontSize: '24px', marginBottom: '10px' }}>🥇</div>}
                      {index === 1 && <div style={{ fontSize: '24px', marginBottom: '10px' }}>🥈</div>}
                      {index === 2 && <div style={{ fontSize: '24px', marginBottom: '10px' }}>🥉</div>}
                      <h3>{event.title}</h3>
                      <p><strong>Boletos Vendidos:</strong> {event.tickets_sold || 0}</p>
                      <p><strong>Ingresos:</strong> Q{parseFloat(event.total_revenue || 0).toFixed(2)}</p>
                      <p><strong>Ocupación:</strong> {parseFloat(event.occupancy_percentage || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
