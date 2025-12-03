import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredEvents, setFeaturedEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, categoriesData] = await Promise.all([
        eventService.getAllEvents({ limit: 12 }),
        eventService.getCategories()
      ]);
      
      setEvents(eventsData.data.events || eventsData.data || []);
      setCategories(categoriesData.data.categories || categoriesData.data || []);
      setFeaturedEvents((eventsData.data.events || eventsData.data || []).slice(0, 6));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Bienvenido a PAVEL TICKET</h1>
          <p className="hero-subtitle">Compra tus boletos para los mejores eventos en Guatemala</p>
          <Link to="/eventos" className="btn btn-primary btn-lg">Ver Todos los Eventos</Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Categorías</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link
                key={category.category_id}
                to={`/eventos?categoria=${category.category_id}`}
                className="category-card"
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Eventos Destacados</h2>
          <div className="events-grid">
          {featuredEvents.map(event => (
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
        </div>
      </section>

      {/* All Events Section */}
      <section className="all-events-section">
        <div className="container">
          <h2 className="section-title">Todos los Eventos</h2>
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
                    {new Date(event.event_date).toLocaleDateString('es-GT')}
                  </p>
                  <button className="btn btn-outline">Comprar</button>
                </div>
              </Link>
            ))}
          </div>
          
          {events.length > 0 && (
            <div className="text-center mt-4">
              <Link to="/eventos" className="btn btn-secondary">Ver Más Eventos</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
