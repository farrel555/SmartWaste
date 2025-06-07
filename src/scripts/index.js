// src/scripts/index.js
import '../styles/main.css';
import { initializeApp } from './pages/app'; // PERBAIKI PATH INI lagi, app.js ada di pages/

document.addEventListener('DOMContentLoaded', initializeApp);

if (process.env.NODE_ENV === 'production') {
    require('../public/sw.js'); // Ini mengasumsikan service-worker.js ada di src/
}