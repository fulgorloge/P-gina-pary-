// Configuración de Fecha Objetivo: 11 AGO - 23:00H
const targetDate = new Date(new Date().getFullYear(), 7, 11, 23, 0, 0).getTime();
const url = window.location.href;

// 1. Contador Regresivo
function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById("countdown").innerHTML = "<h2 style='color:var(--accent); font-size:1.1rem;'>📍 COORDENADAS DESBLOQUEADAS</h2>";
        document.getElementById("location-details").innerText = "Nos vemos en las sombras. Acceso solo con ID.";
        document.getElementById("location-map").classList.remove("hidden");
        clearInterval(timerInterval);
        return;
    }

    document.getElementById("days").innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    document.getElementById("hours").innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    document.getElementById("minutes").innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    document.getElementById("seconds").innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
}
const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// 2. Copiar Nequi & Link
function copyNequi(number) {
    navigator.clipboard.writeText(number).then(() => showToast("¡Número Nequi copiado!"));
}

function copyLink() {
    navigator.clipboard.writeText(url).then(() => showToast("¡Enlace copiado!"));
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

// 3. Sistema RSVP
let isConfirmed = localStorage.getItem("rsvp") === "true";
const rsvpBtn = document.getElementById("rsvp-btn");

function updateRSVPUI() {
    if (isConfirmed) {
        rsvpBtn.innerText = "✓ ASISTENCIA CONFIRMADA";
        rsvpBtn.classList.add("confirmed");
    } else {
        rsvpBtn.innerText = "CONFIRMAR ASISTENCIA (RSVP)";
        rsvpBtn.classList.remove("confirmed");
    }
}

function toggleRSVP() {
    isConfirmed = !isConfirmed;
    localStorage.setItem("rsvp", isConfirmed);
    updateRSVPUI();
    showToast(isConfirmed ? "¡Asistencia confirmada!" : "Asistencia cancelada.");
}
updateRSVPUI();

// 4. Compartir en Redes
function share(platform) {
    const text = "¡No te pierdas The Sinister Forest! Techno Night.";
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// 5. EFECTO CANVAS DE PARTÍCULAS (Esporas Rojas)
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
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

// 6. EFECTO 3D TILT AL MOVER EL MOUSE
const card = document.getElementById("tilt-card");
document.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 768) return; // Desactivar en celulares para mayor fluidez
    const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Vistas activas
let views = parseInt(localStorage.getItem("views") || "142", 10) + 1;
localStorage.setItem("views", views);
document.getElementById("views-count").innerText = String(views).padStart(4, "0");
