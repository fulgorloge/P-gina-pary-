document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('userName');
  if (savedUser) {
    const formattedName = savedUser.toUpperCase();
    document.getElementById('modal-user-display').innerText = formattedName;
    document.getElementById('user-alias-input').value = savedUser;
    updateQRAndCode(savedUser);
  }
});

// Canvas de Partículas Estéticas
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.speedY = (Math.random() - 0.5) * 0.8;
    this.color = Math.random() > 0.5 ? '#ff003c' : '#ffffff';
    this.opacity = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Interruptor de Efecto Strobe
let strobeActive = false;
function toggleStrobe() {
  strobeActive = !strobeActive;
  document.body.classList.toggle('strobe-active', strobeActive);
  const btn = document.getElementById('strobe-toggle');
  btn.classList.toggle('active', strobeActive);
  btn.innerText = strobeActive ? 'STROBE ON' : 'STROBE OFF';
}

// Funciones del Modal de Ticket
function openModal() {
  const modal = document.getElementById('ticket-modal');
  modal.style.display = 'flex';
}
function closeModal() {
  const modal = document.getElementById('ticket-modal');
  modal.style.display = 'none';
}

// Actualización en tiempo real del Alias y QR
function updateTicketAlias(val) {
  const name = val.trim() || 'GUEST_RAVER';
  const cleanName = name.toUpperCase();
  
  document.getElementById('modal-user-display').innerText = cleanName;
  localStorage.setItem('userName', name);
  
  updateQRAndCode(name);
}

function updateQRAndCode(name) {
  const cleanStr = name.trim() || 'GUEST_RAVER';
  const encodedName = encodeURIComponent(cleanStr);
  const qrImg = document.getElementById('ticket-qr');
  
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TSF_PASS_${encodedName}_2026&color=020203&bgcolor=ffffff`;
  
  const hash = cleanStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000);
  document.getElementById('ticket-code-val').innerText = `PASS-#${hash.toString().slice(-4)}-TSF`;
}

// Control de Confirmación de Asistencia (RSVP)
let rsvpConfirmed = false;
function toggleRSVP() {
  rsvpConfirmed = !rsvpConfirmed;
  const btn = document.getElementById('rsvp-trigger');
  const capCount = document.getElementById('capacity-count');
  const capBar = document.getElementById('capacity-progress');

  if (rsvpConfirmed) {
    btn.classList.add('confirmed');
    btn.innerText = '✓ ASISTENCIA CONFIRMADA';
    capCount.innerText = '83%';
    capBar.style.width = '83%';
    showToast('¡Asistencia confirmada!');
  } else {
    btn.classList.remove('confirmed');
    btn.innerText = 'CONFIRMAR ASISTENCIA';
    capCount.innerText = '82%';
    capBar.style.width = '82%';
  }
}

// Utilidades para Nequi y Copiar Portapapeles
function copyNequi() {
  const num = document.getElementById('nequi-val').innerText;
  navigator.clipboard.writeText(num.replace(/\s+/g, ''));
  showToast('Número Nequi copiado');
}

function openNequiApp() {
  window.location.href = 'nequi://';
  setTimeout(() => {
    showToast('Abriendo Nequi o copia el número');
  }, 1000);
}

// Botones de Compartir
function shareWhatsApp() {
  const text = encodeURIComponent('🔥 Asiste a THE SINISTER FOREST - Underground Techno Experience. ¡Nos vemos en el rave!');
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

function shareFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  showToast('Enlace del evento copiado');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function addToCalendar(e) {
  e.preventDefault();
  alert('Evento añadido a la agenda.');
}

// Cuenta Regresiva y Revelación de Ubicación
function startCountdown() {
  const targetDate = new Date('2026-08-10T23:59:59').getTime();

  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
      document.getElementById('cd-days').innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      document.getElementById('cd-hours').innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      document.getElementById('cd-minutes').innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      document.getElementById('cd-seconds').innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    } else {
      document.getElementById('cd-days').innerText = '00';
      document.getElementById('cd-hours').innerText = '00';
      document.getElementById('cd-minutes').innerText = '00';
      document.getElementById('cd-seconds').innerText = '00';

      const locBox = document.getElementById('location-box-container');
      locBox.innerHTML = `
        <p id="location-title" style="color:#00ff66;">📍 UBICACIÓN REVELADA</p>
        <p id="location-details" style="color:#fff; font-weight:bold; margin-bottom:10px;">Parque Lineal La Frontera // Envigado, Antioquia</p>
        <a href="https://maps.google.com/?q=Parque+Lineal+La+Frontera+Envigado" target="_blank" class="calendar-btn" style="margin-bottom:0; background:var(--accent);">
          VER EN GOOGLE MAPS
        </a>
      `;
    }
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}
startCountdown();
