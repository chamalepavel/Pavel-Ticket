import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import './AdminDashboard.css';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role?.name !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const response = await adminService.getAllUsers({ search });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userid, newRoleId) => {
    if (!window.confirm('¿Cambiar el rol de este usuario?')) return;
    
    try {
      await adminService.updateUserRole(userid, parseInt(newRoleId));
      alert('Rol actualizado exitosamente');
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar rol');
    }
  };

  const handleToggleStatus = async (userid) => {
    if (!window.confirm('¿Activar/Desactivar este usuario?')) return;
    
    try {
      await adminService.toggleUserStatus(userid);
      alert('Estado actualizado exitosamente');
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Gestión de Usuarios</h1>
        
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
          <button onClick={loadUsers} className="btn btn-primary">Buscar</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userid}>
                <td>{u.userid}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select 
                    value={u.role_id} 
                    onChange={(e) => handleRoleChange(u.userid, e.target.value)}
                    className="form-control"
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="1">Usuario</option>
                    <option value="2">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={u.is_active ? 'badge badge-success' : 'badge badge-danger'}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleStatus(u.userid)}
                    className="btn btn-sm btn-warning"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
