import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Categorías</h3>
            <ul>
              <li><Link to="/eventos?categoria=1">Conciertos</Link></li>
              <li><Link to="/eventos?categoria=3">Deportes</Link></li>
              <li><Link to="/eventos?categoria=2">Teatro</Link></li>
              <li><Link to="/eventos?categoria=4">Culturales</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Información</h3>
            <ul>
              <li><Link to="/ayuda">Preguntas Frecuentes</Link></li>
              <li><Link to="/contacto">Contáctanos</Link></li>
              <li><Link to="/terminos">Términos y Condiciones</Link></li>
              <li><Link to="/privacidad">Políticas de Privacidad</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Síguenos</h3>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 :: PAVEL TICKET :: Todos los Derechos Reservados</p>
          <p className="footer-slogan">Tu boleto a experiencias inolvidables... #PavelTicket 🎟️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
