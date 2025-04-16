import { login } from './login.js';
import { displayMap } from './mapbox.js';

// DOM Elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');

// Delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}