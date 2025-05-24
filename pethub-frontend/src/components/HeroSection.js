import React from 'react';
import { Link } from 'react-router-dom';

function HeroSection({ title, subtitle, customButtons }) {
  return (
    <div className="hero-section">
      <img src="/hero-pets.jpg" alt="Mascotas" className="hero-image" />
      <div className="hero-overlay">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}

        {customButtons && customButtons.length > 0 && (
          <div className="hero-buttons">
            {customButtons.map((button, index) => (
              <Link key={index} to={button.to} className={`hero-button ${button.className || ''}`}>
                {button.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroSection;