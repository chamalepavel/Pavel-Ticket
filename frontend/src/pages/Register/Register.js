import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <h1>Crear Cuenta</h1>
          <p className="subtitle">Regístrate en E-TICKET</p>
          
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono (Opcional)</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+502 1234-5678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="login-footer">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
