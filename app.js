document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('userName');
  if (savedUser) {
    document.getElementById('user-alias-input').value = savedUser;
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
  
  const savedUser = localStorage.getItem('userName');
  if (savedUser) {
    document.getElementById('ticket-form-view').style.display = 'none';
    document.getElementById('ticket-result-view').style.display = 'block';
    generateTicket(savedUser);
  } else {
    document.getElementById('ticket-form-view').style.display = 'block';
    document.getElementById('ticket-result-view').style.display = 'none';
  }
}

function closeModal() {
  const modal = document.getElementById('ticket-modal');
  modal.style.display = 'none';
}

// Generar el ticket tras presionar el botón
function generateTicket(forcedName = null) {
  const inputVal = forcedName !== null ? forcedName : document.getElementById('user-alias-input').value;
  const name = inputVal.trim();

  if (!name) {
    showToast('Por favor ingresa un alias válido');
    return;
  }

  const cleanName = name.toUpperCase();
  localStorage.setItem('userName', name);

  document.getElementById('modal-user-display').innerText = cleanName;
  
  const encodedName = encodeURIComponent(cleanName);
  const qrImg = document.getElementById('ticket-qr');
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TSF_PASS_${encodedName}_2026&color=020203&bgcolor=ffffff`;
  
  const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000);
  document.getElementById('ticket-code-val').innerText = `PASS-#${hash.toString().slice(-4)}-TSF`;

  document.getElementById('ticket-form-view').style.display = 'none';
  document.getElementById('ticket-result-view').style.display = 'block';
}

// Volver al formulario para cambiar de alias
function resetTicketForm() {
  document.getElementById('ticket-form-view').style.display = 'block';
  document.getElementById('ticket-result-view').style.display = 'none';
}

// Función para descargar la imagen del QR generado
async function downloadQR() {
  const qrImg = document.getElementById('ticket-qr');
  const alias = localStorage.getItem('userName') || 'GUEST_RAVER';
  
  try {
    const response = await fetch(qrImg.src);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `TSF_PASS_${alias.toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
    showToast('¡QR descargado con éxito!');
  } catch (error) {
    showToast('Error al descargar la imagen');
  }
}

// Función para ir a la dirección o enlace cifrado del QR
function visitQRLink() {
  const alias = localStorage.getItem('userName') || 'GUEST_RAVER';
  const cleanName = alias.trim().toUpperCase();
  
  const accessUrl = `https://thesinisterforest.com/verify?pass=TSF_${encodeURIComponent(cleanName)}_2026`;
  
  window.open(accessUrl, '_blank');
  showToast('Abriendo enlace de acceso...');
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
