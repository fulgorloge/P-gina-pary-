document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('userName');
  if (savedUser) {
    document.getElementById('user-alias-input').value = savedUser;
  }
  initParticleCanvas();
  initCutMechanics();
});

// Canvas de Partículas Estéticas y Efecto Holográfico
function initParticleCanvas() {
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

  window.addEventListener('mousemove', (e) => {
    const xRatio = e.clientX / window.innerWidth;
    const yRatio = e.clientY / window.innerHeight;
    const angle = Math.floor(xRatio * 360);
    const watermark = document.getElementById('watermark');
    if (watermark) {
      watermark.style.setProperty('--holo-angle', `${angle}deg`);
    }
  });
}

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

// Generar el ticket VIP tras presionar el botón
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
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TSF_VIP_PASS_${encodedName}_2026&color=020203&bgcolor=ffffff`;
  
  const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000);
  document.getElementById('ticket-code-val').innerText = `PASS-#${hash.toString().slice(-4)}`;

  document.getElementById('ticket-form-view').style.display = 'none';
  document.getElementById('ticket-result-view').style.display = 'block';
}

// Volver al formulario para cambiar de alias
function resetTicketForm() {
  document.getElementById('ticket-form-view').style.display = 'block';
  document.getElementById('ticket-result-view').style.display = 'none';
  const ticketEl = document.getElementById('ticket');
  if (ticketEl) {
    ticketEl.classList.remove('torn', 'bending');
    document.getElementById('cut-progress').style.width = '0%';
    document.getElementById('cut-progress').style.height = '0%';
  }
}

// Voltear Tarjeta (Flip)
function toggleFlipCard() {
  const wrapper = document.getElementById('ticket-wrapper');
  wrapper.classList.toggle('flipped');
}

// Mecánica de Corte del Tiquete VIP
function initCutMechanics() {
  const cutLine = document.getElementById('cut-line');
  const cutProgress = document.getElementById('cut-progress');
  const ticket = document.getElementById('ticket');
  const flashOverlay = document.getElementById('flash-overlay');
  const instructionText = document.getElementById('instruction-text');
  
  if (!cutLine) return;

  let isDragging = false;
  let cutAmount = 0;
  let isTorn = false;

  const startDrag = (e) => {
    if (isTorn) return;
    isDragging = true;
    cutLine.classList.add('cutting');
    ticket.classList.add('bending');
    e.preventDefault();
  };

  const onDrag = (e) => {
    if (!isDragging || isTorn) return;

    const rect = cutLine.getBoundingClientRect();
    const isHorizontal = window.innerWidth < 580;
    
    let clientCoord = isHorizontal ? (e.touches ? e.touches[0].clientX : e.clientX) : (e.touches ? e.touches[0].clientY : e.clientY);
    let startCoord = isHorizontal ? rect.left : rect.top;
    let totalSize = isHorizontal ? rect.width : rect.height;

    let pos = clientCoord - startCoord;
    let percentage = Math.max(0, Math.min(100, (pos / totalSize) * 100));

    cutAmount = percentage;
    
    if (isHorizontal) {
      cutProgress.style.width = `${cutAmount}%`;
    } else {
      cutProgress.style.height = `${cutAmount}%`;
    }

    if (cutAmount >= 95 && !isTorn) {
      triggerCutComplete();
    }
  };

  const endDrag = () => {
    if (!isDragging || isTorn) return;
    isDragging = false;
    cutLine.classList.remove('cutting');
    ticket.classList.remove('bending');

    if (cutAmount < 95) {
      cutAmount = 0;
      cutProgress.style.width = '0%';
      cutProgress.style.height = '0%';
    }
  };

  function triggerCutComplete() {
    isTorn = true;
    isDragging = false;
    cutLine.classList.remove('cutting');
    ticket.classList.remove('bending');
    ticket.classList.add('torn');

    if (flashOverlay) {
      flashOverlay.style.opacity = '1';
      setTimeout(() => { flashOverlay.style.opacity = '0'; }, 150);
    }

    if (instructionText) {
      instructionText.innerText = '✨ ¡ACCESO VIP VALIDADO Y CORTADO! ✨';
    }
    showToast('¡Tiquete cortado con éxito!');
  }

  cutLine.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);

  cutLine.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', endDrag);
}

// Descarga independiente para Frente o Atrás sin efecto espejo
async function downloadQR(side) {
  const ticketWrapper = document.getElementById('ticket-wrapper');
  const backElement = document.getElementById('ticket-back-element');
  const alias = localStorage.getItem('userName') || 'GUEST_RAVER';
  const wasFlipped = ticketWrapper.classList.contains('flipped');
  
  try {
    showToast(`Generando imagen de la ${side === 'front' ? 'parte delantera' : 'parte trasera'}...`);
    
    if (side === 'front') {
      if (wasFlipped) {
        ticketWrapper.classList.remove('flipped');
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    } else {
      // Para descargar el reverso sin espejo, removemos el rotateY de CSS temporalmente antes de capturar
      if (backElement) {
        backElement.style.transform = 'rotateY(0deg)';
        backElement.style.position = 'relative';
      }
      if (!wasFlipped) {
        ticketWrapper.classList.add('flipped');
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    const canvas = await html2canvas(ticketWrapper, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `TSF_VIP_PASS_${alias.toUpperCase()}_${side.toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('¡Pase VIP descargado con éxito!');
  } catch (error) {
    showToast('Error al exportar la imagen');
  } finally {
    // Restaurar estilos del reverso
    if (side === 'back' && backElement) {
      backElement.style.transform = '';
      backElement.style.position = '';
    }
    // Restaurar estado visual original de la tarjeta
    if (wasFlipped !== ticketWrapper.classList.contains('flipped')) {
      if (wasFlipped) {
        ticketWrapper.classList.add('flipped');
      } else {
        ticketWrapper.classList.remove('flipped');
      }
    }
  }
}

function visitQRLink() {
  const alias = localStorage.getItem('userName') || 'GUEST_RAVER';
  const cleanName = alias.trim().toUpperCase();
  showToast(`¡Pase verificado correctamente para ${cleanName}!`);
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

// Utilidades para Nequi y Portapapeles
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
