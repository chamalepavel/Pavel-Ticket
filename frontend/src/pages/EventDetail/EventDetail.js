import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import registrationService from '../../services/registrationService';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadEventData();
    if (isAuthenticated) {
      checkIfRegistered();
    }
  }, [id, isAuthenticated]);

  const loadEventData = async () => {
    try {
      const response = await eventService.getEventById(id);
      setEvent(response.data.event || response.data);
    } catch (error) {
      console.error('Error loading event:', error);
      setMessage('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const checkIfRegistered = async () => {
    try {
      const response = await registrationService.getMyRegistrations();
      const registrations = response.data || [];
      const registered = registrations.some(reg => reg.eventid === parseInt(id));
      setIsRegistered(registered);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      setMessage('Debes iniciar sesión para registrarte');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (isRegistered) {
      setMessage('Ya estás registrado en este evento');
      return;
    }

    if (quantity < 1) {
      setMessage('La cantidad debe ser al menos 1');
      return;
    }

    setRegistering(true);
    setMessage('');

    try {
      await registrationService.registerForEvent(parseInt(id), quantity);
      const total = (parseFloat(event.price) * quantity).toFixed(2);
      setMessage(`Compra exitosa! ${quantity} entrada(s) - Total: Q${total}`);
      setIsRegistered(true);
      setTimeout(() => navigate('/mis-registros'), 2500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al comprar entradas');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('¿Estás seguro de cancelar tu registro?')) return;

    try {
      await registrationService.cancelRegistration(parseInt(id));
      setMessage('Registro cancelado exitosamente');
      setIsRegistered(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al cancelar el registro');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!event) {
    return (
      <div className="container mt-4">
        <p>Evento no encontrado</p>
        <button onClick={() => navigate('/eventos')} className="btn btn-primary">
          Ver Todos los Eventos
        </button>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className="event-detail">
      <div className="container">
        <div className="event-detail-content">
          {event.image_url && (
            <div className="event-detail-image">
              <img 
                src={`http://localhost:3001${event.image_url}`} 
                alt={event.title}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Evento';
                }}
              />
            </div>
          )}
          
          <div className="event-detail-info">
            <h1>{event.title}</h1>
            <p className="event-description">{event.description}</p>
            
            <div className="event-details">
              <div className="detail-item">
                <strong>📅 Fecha:</strong>
                <span>{eventDate.toLocaleDateString('es-GT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              
              <div className="detail-item">
                <strong>📍 Ubicación:</strong>
                <span>{event.location}</span>
              </div>
              
              <div className="detail-item">
                <strong>💰 Precio:</strong>
                <span className="price-tag">
                  {parseFloat(event.price) === 0 ? 'GRATIS' : `Q${parseFloat(event.price).toFixed(2)}`}
                </span>
              </div>
              
              <div className="detail-item">
                <strong>👥 Capacidad:</strong>
                <span>{event.capacity} personas</span>
              </div>
              
              {event.category_name && (
                <div className="detail-item">
                  <strong>🎯 Categoría:</strong>
                  <span>{event.category_name}</span>
                </div>
              )}

              {event.is_featured && (
                <div className="detail-item">
                  <span className="badge badge-featured">⭐ Destacado</span>
                </div>
              )}
            </div>

            {message && (
              <div className={`alert ${message.includes('exitoso') || message.includes('Registro exitoso') ? 'alert-success' : 'alert-danger'}`}>
                {message}
              </div>
            )}

            <div className="action-buttons">
              {isPastEvent ? (
                <div className="alert alert-warning">
                  Este evento ya finalizó
                </div>
              ) : isRegistered ? (
                <>
                  <div className="alert alert-success">
                    ✓ Ya estás registrado en este evento
                  </div>
                  <button
                    onClick={handleCancelRegistration}
                    className="btn btn-danger"
                  >
                    Cancelar Registro
                  </button>
                </>
              ) : (
                <>
                  <div className="quantity-selector">
                    <label htmlFor="quantity">Cantidad de entradas:</label>
                    <div className="quantity-control">
                      <button 
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="btn-qty"
                      >
                        -
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={event.capacity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="quantity-input"
                      />
                      <button 
                        type="button"
                        onClick={() => setQuantity(Math.min(event.capacity, quantity + 1))}
                        className="btn-qty"
                      >
                        +
                      </button>
                    </div>
                    <div className="total-price">
                      <strong>Total:</strong> Q{(parseFloat(event.price) * quantity).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={handleRegister}
                    className="btn btn-primary btn-lg"
                    disabled={registering}
                  >
                    {registering ? 'Procesando...' : `🎟️ Comprar ${quantity} Entrada${quantity > 1 ? 's' : ''}`}
                  </button>
                </>
              )}

              <button
                onClick={() => navigate('/eventos')}
                className="btn btn-outline"
              >
                ← Volver a Eventos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
