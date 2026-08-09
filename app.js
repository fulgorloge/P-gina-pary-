document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('userName');
  if (savedUser) {
    const inputEl = document.getElementById('user-alias-input');
    if (inputEl) inputEl.value = savedUser;
  }
  initParticleCanvas();
  initCutMechanics();
  startCountdown();
});

function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
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
    const angle = Math.floor(xRatio * 360);
    const watermark = document.getElementById('watermark');
    if (watermark) {
      watermark.style.setProperty('--holo-angle', `${angle}deg`);
    }
  });
}

let strobeActive = false;
function toggleStrobe() {
  strobeActive = !strobeActive;
  document.body.classList.toggle('strobe-active', strobeActive);
  const btn = document.getElementById('strobe-toggle');
  if (btn) {
    btn.classList.toggle('active', strobeActive);
    btn.innerText = strobeActive ? 'STROBE ON' : 'STROBE OFF';
  }
}

function openModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.style.display = 'flex';
  
  const savedUser = localStorage.getItem('userName');
  if (savedUser) {
    const formView = document.getElementById('ticket-form-view');
    const resultView = document.getElementById('ticket-result-view');
    if (formView) formView.style.display = 'none';
    if (resultView) resultView.style.display = 'block';
    generateTicket(savedUser);
  } else {
    const formView = document.getElementById('ticket-form-view');
    const resultView = document.getElementById('ticket-result-view');
    if (formView) formView.style.display = 'block';
    if (resultView) resultView.style.display = 'none';
  }
}

function closeModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.style.display = 'none';
}

function generateTicket(forcedName = null) {
  const inputEl = document.getElementById('user-alias-input');
  const inputVal = forcedName !== null ? forcedName : (inputEl ? inputEl.value : '');
  const name = inputVal.trim();

  if (!name) {
    showToast('Por favor ingresa un alias válido');
    return;
  }

  const cleanName = name.toUpperCase();
  localStorage.setItem('userName', name);

  const userDisplay = document.getElementById('modal-user-display');
  if (userDisplay) userDisplay.innerText = cleanName;
  
  const encodedName = encodeURIComponent(cleanName);
  const qrImg = document.getElementById('ticket-qr');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=TSF_VIP_PASS_${encodedName}_2026&color=020203&bgcolor=ffffff`;
  }
  
  const hash = cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000);
  const codeVal = document.getElementById('ticket-code-val');
  if (codeVal) codeVal.innerText = `PASS-#${hash.toString().slice(-4)}`;

  const formView = document.getElementById('ticket-form-view');
  const resultView = document.getElementById('ticket-result-view');
  if (formView) formView.style.display = 'none';
  if (resultView) resultView.style.display = 'block';
}

function resetTicketForm() {
  const formView = document.getElementById('ticket-form-view');
  const resultView = document.getElementById('ticket-result-view');
  if (formView) formView.style.display = 'block';
  if (resultView) resultView.style.display = 'none';

  const ticketEl = document.getElementById('ticket');
  const instructionText = document.getElementById('instruction-text');
  
  if (ticketEl) {
    ticketEl.classList.remove('torn', 'bending');
    const cutProgress = document.getElementById('cut-progress');
    if (cutProgress) {
      cutProgress.style.width = '0%';
      cutProgress.style.height = '0%';
    }
  }
  
  if (instructionText) {
    instructionText.innerHTML = '✂️ DESLIZA SOBRE LA LÍNEA PARA CORTAR EL TIQUETE ✂️';
  }
}

function toggleFlipCard() {
  const wrapper = document.getElementById('ticket-wrapper');
  if (wrapper) wrapper.classList.toggle('flipped');
}

// Mecánica de Corte y Función para Descargar Frente y Atrás en una sola imagen
let isTorn = false;
let cutAmount = 0;
let isDragging = false;

function initCutMechanics() {
  const cutLine = document.getElementById('cut-line');
  const cutProgress = document.getElementById('cut-progress');
  const ticket = document.getElementById('ticket');
  const flashOverlay = document.getElementById('flash-overlay');
  const instructionText = document.getElementById('instruction-text');
  
  if (!cutLine || !ticket) return;

  const startDrag = (e) => {
    if (isTorn) return;
    isDragging = true;
    cutLine.classList.add('cutting');
    ticket.classList.add('bending');
    if (navigator.vibrate) navigator.vibrate(30);
    e.preventDefault();
  };

  const onDrag = (e) => {
    if (!isDragging || isTorn) return;

    const rect = cutLine.getBoundingClientRect();
    const isHorizontal = window.innerWidth < 580;
    
    let clientCoord = isHorizontal 
      ? (e.touches ? e.touches[0].clientX : e.clientX) 
      : (e.touches ? e.touches[0].clientY : e.clientY);
      
    let startCoord = isHorizontal ? rect.left : rect.top;
    let totalSize = isHorizontal ? rect.width : rect.height;

    let pos = clientCoord - startCoord;
    let percentage = Math.max(0, Math.min(100, (pos / totalSize) * 100));

    cutAmount = percentage;
    
    if (cutProgress) {
      if (isHorizontal) {
        cutProgress.style.width = `${cutAmount}%`;
      } else {
        cutProgress.style.height = `${cutAmount}%`;
      }
    }

    if (cutAmount >= 90 && !isTorn) {
      triggerCutComplete();
    }
  };

  const endDrag = () => {
    if (!isDragging || isTorn) return;
    isDragging = false;
    cutLine.classList.remove('cutting');
    ticket.classList.remove('bending');

    if (cutAmount < 90) {
      cutAmount = 0;
      if (cutProgress) {
        cutProgress.style.width = '0%';
        cutProgress.style.height = '0%';
      }
    }
  };

  async function triggerCutComplete() {
    isTorn = true;
    isDragging = false;
    cutLine.classList.remove('cutting');
    ticket.classList.remove('bending');
    ticket.classList.add('torn');

    if (flashOverlay) {
      flashOverlay.style.opacity = '1';
      setTimeout(() => { flashOverlay.style.opacity = '0'; }, 150);
    }

    if (navigator.vibrate) navigator.vibrate([50, 50, 100]);

    if (instructionText) {
      instructionText.innerHTML = '✨ ¡ACCESO VIP VALIDADO Y CORTADO! ✨';
    }

    const secretRewardBox = document.getElementById('secret-reward-box');
    if (secretRewardBox) {
      secretRewardBox.style.display = 'block';
    }

    showToast('¡Ticket cortado! Generando imagen combinada...');

    // =========================================================================
    // FUNCIÓN DE DESCARGA AUTOMÁTICA EN UNA SOLA IMAGEN (FRENTE + ATRÁS)
    // =========================================================================
    await downloadBothSidesInOneImage();
  }

  cutLine.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);

  cutLine.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', onDrag, { passive: false });
  window.addEventListener('touchend', endDrag);
}

// Función maestra para renderizar ambos lados juntos en un canvas y descargarlos
async function downloadBothSidesInOneImage() {
  const ticketWrapper = document.getElementById('ticket-wrapper');
  const ticketFrame = document.getElementById('ticket-frame');
  const backElement = document.getElementById('ticket-back-element');
  const alias = localStorage.getItem('userName') || 'GUEST_RAVER';
  const wasFlipped = ticketWrapper.classList.contains('flipped');

  try {
    // 1. Forzar que el reverso sea visible temporalmente sin transformaciones 3D de giro invertido para la captura
    ticketWrapper.classList.remove('flipped');
    if (backElement) {
      backElement.style.transform = 'rotateY(0deg)';
      backElement.style.position = 'relative';
      backElement.style.display = 'block';
      backElement.style.marginTop = '20px'; // Espacio vertical entre el frente y atrás en la misma imagen
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. Renderizar todo el contenedor (que ahora muestra ambos lados apilados)
    const canvas = await html2canvas(ticketWrapper, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      logging: false,
      allowTaint: true
    });

    // 3. Descargar automáticamente
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1.0);
    link.download = `TSF_VIP_PASS_${alias.toUpperCase()}_COMPLETO.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('¡Pase completo (Frente y Atrás) descargado!');
  } catch (error) {
    console.error(error);
    showToast('Error al generar la imagen combinada.');
  } finally {
    // Restaurar los estilos originales del reverso
    if (backElement) {
      backElement.style.transform = '';
      backElement.style.position = '';
      backElement.style.display = '';
      backElement.style.marginTop = '';
    }
    if (wasFlipped) {
      ticketWrapper.classList.add('flipped');
    }
  }
}

// Descarga manual por si desean descargar solo frente o solo atrás individualmente
async function downloadQR(side) {
  const ticketWrapper = document.getElementById('ticket-wrapper');
  const backElement = document.getElementById('ticket-back-element');
  const alias = localStorage.getItem('userName') || 'GUEST_RAVER';
  const wasFlipped = ticketWrapper.classList.contains('flipped');
  
  try {
    showToast(`Preparando diseño de la ${side === 'front' ? 'parte delantera' : 'parte trasera'}...`);
    
    if (side === 'front') {
      if (wasFlipped) {
        ticketWrapper.classList.remove('flipped');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      if (backElement) {
        backElement.style.transform = 'rotateY(0deg)';
        backElement.style.position = 'relative';
      }
      if (!wasFlipped) {
        ticketWrapper.classList.add('flipped');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const canvas = await html2canvas(ticketWrapper, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      logging: false,
      allowTaint: true
    });
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1.0);
    link.download = `TSF_VIP_PASS_${alias.toUpperCase()}_${side.toUpperCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('¡Pase VIP descargado con éxito!');
  } catch (error) {
    showToast('Error al exportar la imagen.');
  } finally {
    if (side === 'back' && backElement) {
      backElement.style.transform = '';
      backElement.style.position = '';
    }
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
  showToast(`¡Pase verificado correctamente para ${alias.toUpperCase()}!`);
}

let rsvpConfirmed = false;
function toggleRSVP() {
  rsvpConfirmed = !rsvpConfirmed;
  const btn = document.getElementById('rsvp-trigger');
  const capCount = document.getElementById('capacity-count');
  const capBar = document.getElementById('capacity-progress');

  if (rsvpConfirmed) {
    if (btn) { btn.classList.add('confirmed'); btn.innerText = '✓ ASISTENCIA CONFIRMADA'; }
    if (capCount) capCount.innerText = '83%';
    if (capBar) capBar.style.width = '83%';
    showToast('¡Asistencia confirmada!');
  } else {
    if (btn) { btn.classList.remove('confirmed'); btn.innerText = 'CONFIRMAR ASISTENCIA'; }
    if (capCount) capCount.innerText = '82%';
    if (capBar) capBar.style.width = '82%';
  }
}

function copyNequi() {
  const nequiVal = document.getElementById('nequi-val');
  if (nequiVal) {
    navigator.clipboard.writeText(nequiVal.innerText.replace(/\s+/g, ''));
    showToast('Número Nequi copiado');
  }
}

function openNequiApp() {
  window.location.href = 'nequi://';
  setTimeout(() => {
    showToast('Abriendo Nequi...');
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
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function addToCalendar(e) {
  e.preventDefault();
  alert('Evento añadido a la agenda.');
}

function startCountdown() {
  const targetDate = new Date('2026-08-10T23:59:59').getTime();

  const updateTimer = () => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minEl = document.getElementById('cd-minutes');
    const secEl = document.getElementById('cd-seconds');

    if (diff > 0) {
      if (daysEl) daysEl.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      if (hoursEl) hoursEl.innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      if (minEl) minEl.innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      if (secEl) secEl.innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    } else {
      if (daysEl) daysEl.innerText = '00';
      if (hoursEl) hoursEl.innerText = '00';
      if (minEl) minEl.innerText = '00';
      if (secEl) secEl.innerText = '00';

      const locBox = document.getElementById('location-box-container');
      if (locBox) {
        locBox.innerHTML = `
          <p id="location-title" style="color:#00ff66;">📍 UBICACIÓN REVELADA</p>
          <p id="location-details" style="color:#fff; font-weight:bold; margin-bottom:10px;">Parque Lineal La Frontera // Envigado, Antioquia</p>
          <a href="https://maps.google.com/?q=Parque+Lineal+La+Frontera+Envigado" target="_blank" class="calendar-btn" style="margin-bottom:0; background:var(--accent);">
            VER EN GOOGLE MAPS
          </a>
        `;
      }
    }
  };

  updateTimer();
  setInterval(updateTimer, 1000);
}
