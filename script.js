// Configuración fecha
const targetDate = new Date(new Date().getFullYear(), 7, 10, 23, 0, 0).getTime();
const url = window.location.href; // Captura la URL actual

function share(platform) {
    const text = "¡No te pierdas The Sinister Forest! Techno Night.";
    if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    }
}

function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
        alert("¡Enlace copiado al portapapeles!");
    });
}

function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById("countdown").innerHTML = "<h2 style='color:var(--accent)'>📍 UBICACIÓN REVELADA</h2>";
        document.getElementById("location-map").style.display = "inline-block";
        return;
    }

    document.getElementById("days").innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
    document.getElementById("hours").innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    document.getElementById("minutes").innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    document.getElementById("seconds").innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
}

// Inicialización
setInterval(updateCountdown, 1000);
updateCountdown();

// Contador de vistas
let views = parseInt(localStorage.getItem("views") || "0") + 1;
localStorage.setItem("views", views);
document.getElementById("views-count").innerText = String(views).padStart(4, "0");
