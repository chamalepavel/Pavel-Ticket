import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const categories = [
    { id: 1, name: 'Conciertos', path: '/eventos/conciertos' },
    { id: 3, name: 'Deportes', path: '/eventos/deportes' },
    { id: 2, name: 'Teatro', path: '/eventos/teatro' },
    { id: 4, name: 'Culturales', path: '/eventos/culturales' },
    { id: 8, name: 'Comedia', path: '/eventos/comedia' },
    { id: 5, name: 'Familiares', path: '/eventos/familiares' },
    { id: 6, name: 'Congresos', path: '/eventos/congresos' },
    { id: 7, name: 'Festivales', path: '/eventos/festivales' },
  ];

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="logo">
              <Link to="/">
                <h1>PAVEL TICKET</h1>
                <p className="tagline">Tu boleto a experiencias inolvidables</p>
              </Link>
            </div>
            
            <div className="header-actions">
              {isAuthenticated ? (
                <div className="user-menu">
                  <span className="welcome-text">Hola, {user?.username || user?.full_name}</span>
                  <Link to="/perfil" className="btn btn-outline">Mi Perfil</Link>
                  <Link to="/mis-registros" className="btn btn-outline">Mis Eventos</Link>
                  {(user?.role?.name === 'admin' || user?.role_name === 'admin') && (
                    <Link to="/admin" className="btn btn-secondary">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="btn btn-primary">
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
                  <Link to="/register" className="btn btn-primary">Regístrate</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="container">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰ Categorías
          </button>
          
          <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <Link to="/" className="nav-link">Inicio</Link>
            </li>
            {categories.map(category => (
              <li key={category.id} className="nav-item">
                <Link 
                  to={`/eventos?categoria=${category.id}`} 
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li className="nav-item">
              <Link to="/ayuda" className="nav-link">Ayuda</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
