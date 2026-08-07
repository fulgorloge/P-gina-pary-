// Configuración de fecha: 11 de Agosto, 23:00H
const targetDate = new Date(new Date().getFullYear(), 7, 11, 23, 0, 0).getTime();
const url = window.location.href;

// 1. Conteo Regresivo
function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById("countdown").innerHTML = "<h2 style='color:var(--accent); font-size:1.1rem;'>📍 COORDENADAS REVELADAS</h2>";
        document.getElementById("location-details").innerText = "Nos vemos en las sombras. ID obligatorio.";
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

// 2. Modo Strobe Lights
function toggleStrobe() {
    document.body.classList.toggle("strobe-active");
}

// 3. Generador de Ticket Pass VIP
function generateTicket() {
    let userName = localStorage.getItem("userName");
    if (!userName) {
        userName = prompt("Ingresa tu nombre para tu pase VIP:") || "TECHNOPHILE";
        localStorage.setItem("userName", userName);
    }
    
    let code = localStorage.getItem("userCode") || "TSF-" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("userCode", code);

    document.getElementById("pass-user-name").innerText = userName.toUpperCase();
    document.getElementById("pass-code").innerText = "CODE: " + code;
    
    // Generación de QR dinámico gratuito
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code + '-' + userName)}`;
    document.getElementById("qr-img").src = qrUrl;

    document.getElementById("ticket-modal").style.display = "flex";
}

function closeTicket() {
    document.getElementById("ticket-modal").style.display = "none";
}

// 4. Copiar Nequi y Links
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

function copyNequi(number) {
    navigator.clipboard.writeText(number).then(() => showToast("¡Número Nequi copiado!"));
}

function copyLink() {
    navigator.clipboard.writeText(url).then(() => showToast("¡Enlace copiado!"));
}

// 5. Confirmación RSVP
let isConfirmed = localStorage.getItem("rsvp") === "true";
const rsvpBtn = document.getElementById("rsvp-btn");

function updateRSVPUI() {
    if (isConfirmed) {
        rsvpBtn.innerText = "✓ CONFIRMADO";
        rsvpBtn.classList.add("confirmed");
    } else {
        rsvpBtn.innerText = "CONFIRMAR (RSVP)";
        rsvpBtn.classList.remove("confirmed");
    }
}

function toggleRSVP() {
    isConfirmed = !isConfirmed;
    localStorage.setItem("rsvp", isConfirmed);
    updateRSVPUI();
    showToast(isConfirmed ? "¡Asistencia confirmada!" : "Cancelado");
}
updateRSVPUI();

// 6. Compartir Redes
function share(platform) {
    const text = "¡No te pierdas The Sinister Forest! Techno Night.";
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// 7. CANVAS ESPORAS ROJAS / RUIDO FLOTANTE (Efecto sutil original restaurado)
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.6 + 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ff003c";
        ctx.fill();
    }
}

// Crear 75 esporas
for (let i = 0; i < 75; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animate);
}
animate();

// 8. EFECTO TILT 3D
const card = document.getElementById("tilt-card");
document.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 768) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 40;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Vistas activas
let views = parseInt(localStorage.getItem("views") || "215", 10) + 1;
localStorage.setItem("views", views);
document.getElementById("views-count").innerText = String(views).padStart(4, "0");
