import axios from 'axios';

// Crea una instancia de axios con una URL base
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Esta es la URL base de tu backend
  headers: {
    'Content-Type': 'application/json' // Por defecto, enviamos y esperamos JSON
  }
});

export default api;