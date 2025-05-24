import React from 'react';
import HeroSection from '../components/HeroSection';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  const authButtons = [
    { text: 'Registrarse', to: '/register' },
    { text: 'Iniciar Sesión', to: '/login', className: 'secondary' }
  ];

  return (
    <div className="home-container">
      <HeroSection
        title="Bienvenido a PetHub"
        subtitle="Tu centro para gestionar tus mascotas y programar sus citas veterinarias."
        customButtons={!isAuthenticated ? authButtons : null}
      />

      <section className="features-section">
        <h2>Nuestras Características</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Gestión de Mascotas</h3>
            <p>Lleva un registro detallado de todas tus mascotas.</p>
          </div>
          <div className="card">
            <h3>Citas Veterinarias</h3>
            <p>Programa y gestiona las citas de salud para tus amigos peludos.</p>
          </div>
          <div className="card">
            <h3>Acceso Seguro</h3>
            <p>Tu información y la de tus mascotas protegidas con autenticación.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;