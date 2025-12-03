import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import eventService from '../../services/eventService';
import '../Home/Home.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoria');

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, categoriesData] = await Promise.all([
        categoryId 
          ? eventService.getEventsByCategory(categoryId)
          : eventService.getAllEvents(),
        eventService.getCategories()
      ]);
      
      setEvents(eventsData.data.events || eventsData.data || []);
      setCategories(categoriesData.data.categories || categoriesData.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.category_id === parseInt(categoryId));

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '70vh' }}>
      <h1 className="section-title">
        {selectedCategory ? `Eventos de ${selectedCategory.name}` : 'Todos los Eventos'}
      </h1>
      
      <div className="categories-grid mb-4">
        <Link to="/eventos" className={`category-card ${!categoryId ? 'active' : ''}`}>
          <h3>Todos</h3>
        </Link>
        {categories.map(category => (
          <Link
            key={category.category_id}
            to={`/eventos?categoria=${category.category_id}`}
            className={`category-card ${categoryId === String(category.category_id) ? 'active' : ''}`}
          >
            <h3>{category.name}</h3>
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="text-center mt-4">
          <p>No hay eventos disponibles en esta categoría.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <Link
              key={event.eventid || event.event_id}
              to={`/eventos/${event.eventid || event.event_id}`}
              className="event-card"
            >
              {event.image_url && (
                <div className="event-image">
                  <img src={event.image_url} alt={event.title} />
                </div>
              )}
              <div className="event-info">
                <h3>{event.title}</h3>
                <p className="event-location">{event.location}</p>
                <p className="event-date">
                  {new Date(event.event_date).toLocaleDateString('es-GT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <button className="btn btn-primary">Ver Detalles</button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
