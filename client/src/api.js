const API_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:5000"
    : "https://thin-llamas-marry.loca.lt" // Your current backend tunnel
);

export default API_URL;
