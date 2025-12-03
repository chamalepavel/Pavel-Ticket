import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Events from './pages/Events/Events';
import EventDetail from './pages/EventDetail/EventDetail';
import MyRegistrations from './pages/MyRegistrations/MyRegistrations';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import EventManagement from './pages/Admin/EventManagement';
import Reports from './pages/Admin/Reports';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/eventos/:id" element={<EventDetail />} />
              <Route path="/mis-registros" element={<MyRegistrations />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/events" element={<EventManagement />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/ayuda" element={<Help />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Simple placeholder components
const Help = () => (
  <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
    <h1>Ayuda</h1>
    <h2>Preguntas Frecuentes</h2>
    <div className="faq">
      <h3>¿Cómo compro boletos?</h3>
      <p>Navega por los eventos, selecciona el que te interese y sigue el proceso de compra.</p>
      
      <h3>¿Puedo cancelar mi registro?</h3>
      <p>Sí, puedes cancelar tu registro desde la sección "Mis Eventos".</p>
      
      <h3>¿Cómo contacto soporte?</h3>
      <p>Puedes contactarnos a través de la página de contacto o escribirnos a soporte@eticket.gt</p>
    </div>
  </div>
);

const Contact = () => (
  <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
    <h1>Contacto</h1>
    <p>¿Tienes preguntas? Contáctanos:</p>
    <ul>
      <li>Email: contacto@eticket.gt</li>
      <li>Teléfono: +502 2315-5919</li>
      <li>WhatsApp: +502 2315-5919</li>
    </ul>
  </div>
);

const NotFound = () => (
  <div className="container" style={{ padding: '40px 20px', minHeight: '60vh', textAlign: 'center' }}>
    <h1>404 - Página No Encontrada</h1>
    <p>La página que buscas no existe.</p>
    <a href="/" className="btn btn-primary">Volver al Inicio</a>
  </div>
);

export default App;
