import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import eventService from '../../services/eventService';
import './AdminDashboard.css';

const EventManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesFormData, setSalesFormData] = useState({
    tickets_sold: 0,
    total_revenue: 0
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    price: '',
    capacity: '',
    category_id: ''
  });

  useEffect(() => {
    if (!user || user.role?.name !== 'admin') {
      navigate('/');
      return;
    }
    loadEvents();
    loadCategories();
  }, [user, navigate]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAllEvents();
      setEvents(response.data.events || response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await eventService.getCategories();
      const categoriesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.categories || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_date: new Date(event.event_date).toISOString().slice(0, 16),
      location: event.location,
      price: event.price,
      capacity: event.capacity,
      category_id: event.category_id || ''
    });
    setShowModal(true);
  };

  const handleEditSales = (event) => {
    setEditingEvent(event);
    setSalesFormData({
      tickets_sold: event.tickets_sold || 0,
      total_revenue: event.total_revenue || 0
    });
    setShowSalesModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalesChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setSalesFormData(prev => {
      const newData = { ...prev, [name]: numValue };
      
      // Auto-calcular revenue si cambia tickets_sold
      if (name === 'tickets_sold' && editingEvent) {
        newData.total_revenue = numValue * parseFloat(editingEvent.price);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const eventId = editingEvent.event_id || editingEvent.eventid;
      
      const updateData = new FormData();
      updateData.append('title', formData.title);
      updateData.append('description', formData.description);
      updateData.append('event_date', formData.event_date);
      updateData.append('location', formData.location);
      updateData.append('price', formData.price);
      updateData.append('capacity', formData.capacity);
      if (formData.category_id) {
        updateData.append('category_id', formData.category_id);
      }

      await adminService.updateEvent(eventId, updateData);
      alert('Evento actualizado correctamente');
      setShowModal(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar evento');
    }
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const eventId = editingEvent.event_id || editingEvent.eventid;
      
      await adminService.updateEventSales(eventId, {
        tickets_sold: salesFormData.tickets_sold,
        total_revenue: salesFormData.total_revenue
      });
      
      alert('Ventas actualizadas correctamente');
      setShowSalesModal(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar ventas');
    }
  };

  const handleDelete = async (eventid) => {
    if (!window.confirm('¿Eliminar este evento?')) return;
    
    try {
      await adminService.deleteEvent(eventid);
      alert('Evento eliminado');
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al eliminar evento');
    }
  };

  const handleToggleStatus = async (eventid) => {
    try {
      await adminService.toggleEventStatus(eventid);
      loadEvents();
    } catch (error) {
      alert('Error al cambiar estado');
    }
  };

  const handleResetSales = async (event) => {
    const eventId = event.event_id || event.eventid;
    const confirmMessage = `¿Estás seguro de reiniciar las ventas del evento "${event.title}"?\n\nEsto pondrá:\n• Boletos vendidos: 0\n• Ingresos totales: Q0.00`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      await adminService.resetEventSales(eventId);
      alert('✅ Ventas reiniciadas correctamente');
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al reiniciar ventas');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const closeSalesModal = () => {
    setShowSalesModal(false);
    setEditingEvent(null);
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="header-section">
          <h1>Gestión de Eventos</h1>
          <p style={{ marginTop: '10px', color: '#666' }}>
            💡 Edita eventos y gestiona las ventas manualmente. Los cambios se reflejan inmediatamente en los reportes.
          </p>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Fecha</th>
              <th>Precio</th>
              <th>Capacidad</th>
              <th>Boletos Vendidos</th>
              <th>Ingresos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.event_id || event.eventid}>
                <td>{event.event_id || event.eventid}</td>
                <td>{event.title}</td>
                <td>{new Date(event.event_date).toLocaleDateString('es-GT')}</td>
                <td>Q{parseFloat(event.price).toFixed(2)}</td>
                <td>{event.capacity}</td>
                <td>
                  <strong>{event.tickets_sold || 0}</strong>
                </td>
                <td>
                  <strong style={{color: '#28a745'}}>
                    Q{parseFloat(event.total_revenue || 0).toFixed(2)}
                  </strong>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleStatus(event.event_id || event.eventid)}
                    className={`badge ${event.is_active ? 'badge-success' : 'badge-danger'}`}
                  >
                    {event.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleEdit(event)}
                      className="btn btn-md btn-primary"
                      title="Editar evento"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleEditSales(event)}
                      className="btn btn-md btn-success"
                      title="Editar ventas manualmente"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      💰 Ventas
                    </button>
                    <button 
                      onClick={() => handleResetSales(event)}
                      className="btn btn-md btn-warning"
                      title="Reiniciar estadísticas de ventas"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      🔄 Reset
                    </button>
                    <button 
                      onClick={() => handleDelete(event.event_id || event.eventid)}
                      className="btn btn-md btn-danger"
                      title="Eliminar evento"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal de Edición de Evento */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Editar Evento</h2>
                <button onClick={closeModal} className="close-btn">&times;</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Título del Evento *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha y Hora *</label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="">Sin categoría</option>
                      {Array.isArray(categories) && categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ubicación *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Ej: Antigua Guatemala"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio (Q) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Capacidad *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-outline">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    💾 Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Edición de Ventas */}
        {showSalesModal && (
          <div className="modal-overlay" onClick={closeSalesModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
              <div className="modal-header">
                <h2>💰 Editar Ventas - {editingEvent?.title}</h2>
                <button onClick={closeSalesModal} className="close-btn">&times;</button>
              </div>
              
              <form onSubmit={handleSalesSubmit} className="modal-body">
                <div style={{
                  background: '#e3f2fd',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #2196f3'
                }}>
                  <p style={{margin: 0, fontSize: '14px'}}>
                    <strong>ℹ️ Información del Evento:</strong><br/>
                    Precio por boleto: <strong>Q{parseFloat(editingEvent?.price || 0).toFixed(2)}</strong><br/>
                    Capacidad máxima: <strong>{editingEvent?.capacity}</strong> personas
                  </p>
                </div>

                <div className="form-group">
                  <label>
                    Boletos Vendidos * 
                    <span style={{color: '#666', fontSize: '12px', fontWeight: 'normal'}}>
                      {' '}(Máximo: {editingEvent?.capacity})
                    </span>
                  </label>
                  <input
                    type="number"
                    name="tickets_sold"
                    value={salesFormData.tickets_sold}
                    onChange={handleSalesChange}
                    required
                    min="0"
                    max={editingEvent?.capacity}
                    className="form-control"
                    style={{fontSize: '16px', padding: '10px'}}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Ingresos Totales (Q) *
                    <span style={{color: '#666', fontSize: '12px', fontWeight: 'normal'}}>
                      {' '}(Se calcula automáticamente)
                    </span>
                  </label>
                  <input
                    type="number"
                    name="total_revenue"
                    value={salesFormData.total_revenue}
                    onChange={handleSalesChange}
                    required
                    min="0"
                    step="0.01"
                    className="form-control"
                    style={{fontSize: '16px', padding: '10px'}}
                  />
                </div>

                <div style={{
                  background: '#fff3cd',
                  padding: '12px',
                  borderRadius: '6px',
                  marginTop: '15px',
                  border: '1px solid #ffc107'
                }}>
                  <p style={{margin: 0, fontSize: '13px'}}>
                    <strong>💡 Nota:</strong> Al cambiar los boletos vendidos, los ingresos se calculan automáticamente. 
                    Puedes ajustar manualmente los ingresos si es necesario.
                  </p>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeSalesModal} className="btn btn-outline">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    💾 Guardar Ventas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .close-btn:hover {
          color: #000;
        }

        .modal-body {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }

        .btn-md {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-md:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .btn-success {
          background-color: #28a745;
          color: white;
        }

        .btn-success:hover {
          background-color: #218838;
        }

        .btn-warning {
          background-color: #ffc107;
          color: #212529;
        }

        .btn-warning:hover {
          background-color: #e0a800;
        }
      `}</style>
    </div>
  );
};

export default EventManagement;
