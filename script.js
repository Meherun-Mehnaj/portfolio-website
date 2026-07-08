const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.lucide) {
  window.lucide.createIcons();
}

const mobileNav = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector(".menu-toggle");

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

document.querySelectorAll("[data-counter]").forEach((counter) => setCounterValue(counter));

function setCounterValue(element) {
  const target = Number(element.dataset.counter);
  element.textContent = Number.isInteger(target) ? target : target.toFixed(2);
}

document.querySelectorAll("[data-tilt]").forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -5;
    const rotateY = ((x / rect.width) - 0.5) * 5;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll(".magnetic").forEach((button) => {
  if (prefersReducedMotion) return;

  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  });

  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));

    projectCards.forEach((card) => {
      const categories = card.dataset.category?.split(" ") ?? [];
      const shouldShow = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const awardsTrack = document.querySelector("#awardsTrack");
document.querySelectorAll("[data-carousel]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!awardsTrack) return;
    const direction = button.dataset.carousel === "next" ? 1 : -1;
    const cardWidth = awardsTrack.querySelector(".award-card")?.getBoundingClientRect().width ?? 360;
    awardsTrack.scrollBy({ left: direction * (cardWidth + 14), behavior: "smooth" });
  });
});

const tickerTrack = document.querySelector(".ticker-track");
if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

const canvas = document.querySelector("#heroCanvas");
const context = canvas?.getContext("2d");
const pointer = { x: 0, y: 0, active: false };
let particles = [];
let animationFrame;

if (canvas && context) {
  window.addEventListener("resize", resetCanvas);
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  resetCanvas();
}

function resetCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particleCount = Math.max(42, Math.min(92, Math.floor((width * height) / 18000)));
  particles = Array.from({ length: particleCount }, (_, index) => createParticle(width, height, index));

  cancelAnimationFrame(animationFrame);
  drawNetwork();
}

function createParticle(width, height, index) {
  const colors = ["#1f7a59", "#315d9f", "#d66246", "#ad8126", "#7361a8"];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    radius: 1.2 + Math.random() * 2.8,
    color: colors[index % colors.length],
  };
}

function drawNetwork() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.x += prefersReducedMotion ? 0 : particle.vx;
    particle.y += prefersReducedMotion ? 0 : particle.vy;

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    if (pointer.active && !prefersReducedMotion) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 170) {
        particle.x -= dx * 0.0025;
        particle.y -= dy * 0.0025;
      }
    }
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const first = particles[i];
      const second = particles[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      if (distance < 132) {
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.strokeStyle = `rgba(16, 19, 18, ${0.12 * (1 - distance / 132)})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }
  }

  particles.forEach((particle) => {
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = particle.color;
    context.globalAlpha = 0.4;
    context.fill();
    context.globalAlpha = 1;
  });

  animationFrame = requestAnimationFrame(drawNetwork);
}
