import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Bypass Localtunnel Landing Page
axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true';

// Anti-Inspect / Safety Deterrents
if (import.meta.env.PROD) {
  // Disable Right Click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Disable F12 and Common Inspect Shortcuts
  document.onkeydown = function(e) {
    if (e.keyCode === 123) return false; // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'I'.charCodeAt(0)) return false; // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'J'.charCodeAt(0)) return false; // Ctrl+Shift+J
    if (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0)) return false; // Ctrl+U (View Source)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 'C'.charCodeAt(0)) return false; // Ctrl+Shift+C (Inspect)
  };

  // Extra layer: Clear console on start
  console.log("%cSAFETY WARNING: Code inspection is disabled for this administrative portal.", "color: red; font-size: 20px; font-weight: bold;");
  setTimeout(() => console.clear(), 500);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
