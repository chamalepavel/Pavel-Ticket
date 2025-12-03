import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css';

const Profile = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <h1>Mi Perfil</h1>
          
          {message && <div className="alert alert-success">{message}</div>}
          
          <div className="event-details" style={{marginTop: '20px'}}>
            <div className="detail-item">
              <strong>Nombre:</strong>
              <span>{user?.full_name || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <strong>Usuario:</strong>
              <span>{user?.username}</span>
            </div>
            
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{user?.email}</span>
            </div>
            
            <div className="detail-item">
              <strong>Rol:</strong>
              <span style={{textTransform: 'capitalize'}}>{user?.role_name || 'Usuario'}</span>
            </div>
            
            <div className="detail-item">
              <strong>Fecha de Registro:</strong>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('es-GT') : 'N/A'}</span>
            </div>
          </div>

          <div style={{marginTop: '30px', textAlign: 'center'}}>
            <p style={{color: '#666'}}>
              Para actualizar tu información, contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
