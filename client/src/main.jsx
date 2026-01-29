import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Log toutes les erreurs globales pour diagnostiquer les bugs
window.addEventListener('error', (event) => {
  console.error('[GLOBAL ERROR]', {
    message: event?.message,
    filename: event?.filename,
    lineno: event?.lineno,
    colno: event?.colno,
    error: event?.error,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNHANDLED PROMISE]', event?.reason);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

