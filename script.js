// Configuración de la fecha de revelación: Lunes 10 de Agosto a las 23:00 (11:00 PM)
const currentYear = new Date().getFullYear();
const targetDate = new Date(currentYear, 7, 10, 23, 0, 0).getTime();

// Ubicación y enlace a Google Maps
const ubicacionEvento = "Parque Lineal La Frontera — Envigado / El Poblado";
const urlGoogleMaps = "https://maps.google.com/?q=Parque+Lineal+La+Frontera";

// Elementos del DOM
const countdownEl = document.getElementById("countdown");
const locationCardEl = document.getElementById("location-card");
const locationTitleEl = document.getElementById("location-title");
const locationDetailsEl = document.getElementById("location-details");
const locationMapBtnEl = document.getElementById("location-map");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date().getTime();
  const difference = targetDate - now;

  if (difference <= 0) {
    // Revelar la ubicación
    countdownEl.style.display = "none";
    
    locationCardEl.classList.add("revealed");
    
    locationTitleEl.innerText = "📍 UBICACIÓN REVELADA";
    locationTitleEl.style.color = "var(--accent-bright-red)";
    
    locationDetailsEl.innerText = ubicacionEvento;
    locationDetailsEl.style.color = "#ffffff";
    locationMapBtnEl.href = urlGoogleMaps;
    locationMapBtnEl.style.display = "inline-block";
    
    clearInterval(timerInterval);
    return;
  }

  // Cálculos de tiempo
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  // Renderizado en pantalla con formato de 2 dígitos
  daysEl.innerText = String(days).padStart(2, '0');
  hoursEl.innerText = String(hours).padStart(2, '0');
  minutesEl.innerText = String(minutes).padStart(2, '0');
  secondsEl.innerText = String(seconds).padStart(2, '0');
}

// Inicialización
updateCountdown();
const timerInterval = setInterval(updateCountdown, 1000);
