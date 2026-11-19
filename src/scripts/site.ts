// Comportamiento global: header fino al scroll, menú móvil, reveal e intro de la home.

const root = document.documentElement;

/* ---------- Header: se hace más fino al hacer scroll ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
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

/* ---------- Intro de la home ---------- */
// La clase `intro` la pone un script inline en <head> (antes del primer pintado)
// solo si toca reproducirla: home + primera visita de la sesión + sin reduced-motion.
if (root.classList.contains('intro')) {
  runIntro();
}

async function runIntro() {
  const brand = document.querySelector<HTMLElement>('[data-brand]');
  const overlay = document.querySelector<HTMLElement>('[data-intro-overlay]');
  const hdr = document.querySelector<HTMLElement>('[data-header]');
  if (!brand || !overlay || !hdr) return finish();

  const [{ gsap }] = await Promise.all([import('gsap'), document.fonts.ready]);

  const letters = brand.querySelectorAll<HTMLElement>('.logo__l > span');
  window.scrollTo(0, 0);

  // Posición/tamaño final (el del header) → colocamos el logo grande en el centro
  const r = brand.getBoundingClientRect();
  const targetW = Math.min(window.innerWidth * 0.8, 1180);
  const s = targetW / r.width;
  const dx = window.innerWidth / 2 - (r.left + r.width / 2);
  const dy = window.innerHeight / 2 - (r.top + r.height / 2);

  gsap.set(brand, { x: dx, y: dy, scale: s, transformOrigin: '50% 50%', opacity: 1 });
  gsap.set(letters, { yPercent: 115 });

  const tl = gsap.timeline({ onComplete: finish });
  tl.to(letters, { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.07 }, 0.15)
    .to(
      brand,
      { x: 0, y: 0, scale: 1, duration: 1.25, ease: 'power3.inOut' },
      '+=0.55',
    )
    .to(overlay, { opacity: 0, duration: 0.9, ease: 'power2.out' }, '<0.1');

  function finish() {
    gsap.set([brand, ...letters], { clearProps: 'all' });
    root.classList.remove('intro');
    try {
      sessionStorage.setItem('deltell-intro', '1');
    } catch {}
  }
}
