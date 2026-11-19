// Comportamiento global: header, menú móvil, reveal, vídeo del hero e intro de la home.

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// La clase `intro` la pone un script inline en <head> (antes del primer pintado)
// solo si toca: home + primera visita de la sesión + sin reduced-motion.
const introMode = root.classList.contains('intro');

/* ---------- Header: más fino al hacer scroll ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header && !introMode) {
  // (En la intro, el scroll del header lo gobierna el propio guion de la intro.)
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ---------- Menú móvil ---------- */
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
if (menuBtn && menu) {
  const setOpen = (open: boolean) => {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
}

/* ---------- Reveal al entrar en pantalla ---------- */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (revealEls.length) {
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    revealEls.forEach((el) => io.observe(el));
  }
}

/* ---------- Vídeo del hero ----------
   Dos vídeos: vertical para pantallas más altas que anchas (móvil), horizontal
   para el resto. Solo se descarga el que toca. Con "reducir movimiento" se
   queda el fotograma fijo (poster). */
const heroVideo = document.querySelector<HTMLVideoElement>('[data-hero-video]');
let heroStarted = false;

if (heroVideo) {
  const portrait = matchMedia('(max-aspect-ratio: 1/1)');
  const pick = () => {
    const kind = portrait.matches ? 'mobile' : 'desktop';
    if (heroVideo.dataset.kind === kind) return;
    heroVideo.dataset.kind = kind;
    heroVideo.poster = `/video/hero-${kind}.jpg`;
    heroVideo.src = `/video/hero-${kind}.mp4`;
    heroVideo.load();
    if (heroStarted) startHero();
  };
  pick();
  portrait.addEventListener('change', pick);
}

function startHero() {
  heroStarted = true;
  if (!heroVideo || reduceMotion) return;
  heroVideo.play().catch(() => {});
}

if (!introMode) startHero();

/* ---------- Intro de la home ----------
   1. Pantalla blanca con DELTELL enorme, que se mantiene.
   2. A los 2 s: el vídeo arranca de fondo (la pantalla blanca se disuelve).
   3. Al hacer scroll, el logo viaja a su sitio en el header (todo ligado al
      scroll, así que también vuelve si se sube de nuevo). El vídeo sigue en
      bucle en su sección. */
if (introMode) {
  runIntro();
}

async function runIntro() {
  const brand = document.querySelector<HTMLElement>('[data-brand]');
  const overlay = document.querySelector<HTMLElement>('[data-intro-overlay]');
  if (!brand || !overlay || !header) return abort();

  const [{ gsap }] = await Promise.all([import('gsap'), document.fonts.ready]);
  // @ts-ignore — temporizador de seguridad definido en <head>
  clearTimeout(window.__introTimer);

  const letters = brand.querySelectorAll<HTMLElement>('.logo__l > span');
  const INK = 13;
  const tint = { w: 0 }; // 0 = color tinta, 1 = blanco (sobre el vídeo)

  let dx = 0;
  let dy = 0;
  let s = 1;
  let range = 1;

  // Mide el destino (logo en el header) y calcula cuánto hay que agrandarlo/moverlo
  const measure = () => {
    brand.style.transform = '';
    const r = brand.getBoundingClientRect();
    const targetW = Math.min(window.innerWidth * 0.8, 1180);
    s = targetW / r.width;
    dx = window.innerWidth / 2 - (r.left + r.width / 2);
    dy = window.innerHeight / 2 - (r.top + r.height / 2);
    range = window.innerHeight * 0.6;
  };

  const render = () => {
    const p = Math.min(1, Math.max(0, window.scrollY / range));
    const e = p * p * (3 - 2 * p); // suavizado
    brand.style.transform = `translate(${dx * (1 - e)}px, ${dy * (1 - e)}px) scale(${s + (1 - s) * e})`;
    // Blanco sobre el vídeo → vuelve a tinta al encajar en el header blanco
    const w = tint.w * (1 - e);
    const c = Math.round(INK + (255 - INK) * w);
    brand.style.color = `rgb(${c}, ${c}, ${c})`;
    header.style.backgroundColor = `rgba(255, 255, 255, ${e})`;
    header.classList.toggle('is-scrolled', p >= 1);
  };

  measure();
  gsap.set(letters, { yPercent: 115 });
  brand.style.transformOrigin = '50% 50%';
  brand.style.opacity = '1';
  render();

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          render();
          ticking = false;
        });
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', () => {
    measure();
    render();
  });

  const tl = gsap.timeline({
    onComplete: () => {
      overlay.style.display = 'none';
      try {
        sessionStorage.setItem('deltell-intro', '1');
      } catch {}
    },
  });
  tl.to(letters, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.07 }, 0.15)
    .add(startHero, 2)
    .to(overlay, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 2)
    .to(tint, { w: 1, duration: 1.2, ease: 'power2.inOut', onUpdate: render }, 2);

  function abort() {
    root.classList.remove('intro');
    startHero();
  }
}
