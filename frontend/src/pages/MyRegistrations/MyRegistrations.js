import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import registrationService from '../../services/registrationService';
import '../Home/Home.css';

const MyRegistrations = () => {
  const { isAuthenticated, user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated]);

  const loadRegistrations = async () => {
    try {
      const response = await registrationService.getMyRegistrations();
      // El backend retorna un array de registrations con el evento incluido
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setMessage('Error al cargar tus registros');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('¿Estás seguro de cancelar este registro?')) return;

    try {
      await registrationService.cancelRegistration(eventId);
      setMessage('Registro cancelado exitosamente');
      loadRegistrations();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al cancelar el registro');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '40px 20px', minHeight: '70vh' }}>
        <div className="text-center mt-4">
          <h2>Debes iniciar sesión</h2>
          <p>Para ver tus eventos registrados, necesitas iniciar sesión.</p>
          <Link to="/login" className="btn btn-primary mt-2">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '70vh' }}>
      <h1 className="section-title">Mis Eventos Registrados</h1>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mb-3`}>
          {message}
        </div>
      )}

      {registrations.length === 0 ? (
        <div className="text-center mt-4">
          <p>No tienes registros en ningún evento aún.</p>
          <Link to="/eventos" className="btn btn-primary mt-2">Ver Eventos Disponibles</Link>
        </div>
      ) : (
        <div className="events-grid">
          {registrations.map(reg => (
            <div key={reg.registration_id} className="card">
              {reg.event?.image_url && (
                <img 
                  src={`http://localhost:3001${reg.event.image_url}`} 
                  alt={reg.event.title}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h3>{reg.event?.title || 'Evento'}</h3>
                <p><strong>Fecha del Evento:</strong> {new Date(reg.event?.event_date).toLocaleDateString('es-GT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Ubicación:</strong> {reg.event?.location}</p>
                <p><strong>Precio:</strong> Q{parseFloat(reg.event?.price || 0).toFixed(2)}</p>
                <p><strong>Fecha de Registro:</strong> {new Date(reg.created_at).toLocaleDateString('es-GT')}</p>
                
                <div className="mt-3" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  <Link 
                    to={`/eventos/${reg.eventid}`} 
                    className="btn btn-outline"
                  >
                    Ver Detalles
                  </Link>
                  <button
                    onClick={() => handleCancel(reg.eventid)}
                    className="btn btn-danger"
                  >
                    Cancelar Registro
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
