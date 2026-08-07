// Configuración de fecha: 11 de Agosto, 23:00H
const targetDate = new Date(new Date().getFullYear(), 7, 11, 23, 0, 0).getTime();
const url = window.location.href;

// 1. Conteo Regresivo
function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById("countdown").innerHTML = "<h2 style='color:var(--accent); font-size:1.1rem; letter-spacing:1px;'>📍 COORDENADAS REVELADAS</h2>";
        document.getElementById("location-details").innerText = "Nos vemos en la pista. Acceso obligatorio con ID.";
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

// 2. Sistema Toast & Copiado
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
    navigator.clipboard.writeText(url).then(() => showToast("¡Enlace copiado al portapapeles!"));
}

// 3. Confirmación RSVP
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

// 4. Compartir Redes
function share(platform) {
    const text = "¡No te pierdas The Sinister Forest! Techno Night.";
    if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
    if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// 5. CANVAS INTERACTIVO - Red de Partículas Techno
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];
let mouse = { x: null, y: null, radius: 120 };

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        this.radius = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interacción con Mouse
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                let angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * 2;
                this.y -= Math.sin(angle) * 2;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ff003c";
        ctx.fill();
    }
}

// Crear partículas según el tamaño de la pantalla
const count = Math.min(Math.floor((width * height) / 10000), 70);
for (let i = 0; i < count; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Conectar partículas cercanas con líneas
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255, 0, 60, ${1 - dist / 100})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}
animate();

// 6. EFECTO 3D TILT AL MOVER EL MOUSE (Escritorio)
const card = document.getElementById("tilt-card");
document.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 768) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 35;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 35;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Contador de visitas
let views = parseInt(localStorage.getItem("views") || "180", 10) + 1;
localStorage.setItem("views", views);
document.getElementById("views-count").innerText = String(views).padStart(4, "0");
