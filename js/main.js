/* main.js — navbar, infección por scroll, reveals, carrusel, tilt, trail, lightbox */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ------------------------------------------------------------------
     1. Infección por scroll: una sola fuente de verdad (data-stage)
     ------------------------------------------------------------------ */
  const stages = Array.from(document.querySelectorAll('[data-stage]')).filter(function (el) { return el !== root; });
  const navLinks = Array.from(document.querySelectorAll('.nav__links a'));

  // Sitio multipágina: el link activo es el de la página actual (body[data-page])
  const page = document.body.getAttribute('data-page');
  navLinks.forEach(function (a) {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('is-active', href === page + '.html' || href === '#/' + page);
  });

  function setStage(section) {
    root.setAttribute('data-stage', section.getAttribute('data-stage'));
  }

  // El observer usa una franja central del viewport: la sección que cruza
  // el 40% de altura manda. Así no hay dos secciones "activas".
  const stageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) setStage(e.target); });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  stages.forEach(function (s) { stageObserver.observe(s); });

  /* Línea de infección en la navbar: progreso de lectura (0..1) */
  let progressRaf = null;
  const progressDrop = document.createElement('i');
  progressDrop.className = 'progress-drop'; progressDrop.setAttribute('aria-hidden', 'true');
  const headerEl = document.querySelector('.site-header');
  if (headerEl) headerEl.appendChild(progressDrop);
  function updateProgress() {
    progressRaf = null;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    root.style.setProperty('--progress', p.toFixed(4));
    if (headerEl) { progressDrop.style.left = (p * 100).toFixed(2) + '%'; progressDrop.style.setProperty('--grow', (.5 + p * 1.6).toFixed(2)); }
  }
  const edgeStains = Array.from(document.querySelectorAll('.edge-stain'));
  function updateParallax() {
    if (reduced) return;
    edgeStains.forEach(function (el, i) {
      const r = el.parentElement.getBoundingClientRect();
      const k = (i % 2 ? -.06 : .09);
      el.style.marginTop = (r.top * k).toFixed(1) + 'px';
    });
  }
  window.addEventListener('scroll', function () {
    if (!progressRaf) progressRaf = requestAnimationFrame(function () { updateProgress(); updateParallax(); });
  }, { passive: true });
  updateParallax();
  updateProgress();

  /* ------------------------------------------------------------------
     2. Reveal único (fade + 20px)
     ------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ------------------------------------------------------------------
     3. Navbar mobile
     ------------------------------------------------------------------ */
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    links.classList.remove('is-open');
  }
  toggle.addEventListener('click', function () {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) { closeMenu(); return; }
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    links.classList.add('is-open');
  });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ------------------------------------------------------------------
     4. Carrusel de personajes: infinito, quieto, pasa solo de a una (v17)
        Se clona el elenco dos veces (tres juegos); el scroll vive siempre
        dentro del juego del medio, así nunca se ve el final ni rebota.
        Cada 5 s desliza una tarjeta; se frena al pasar el mouse, tocar
        o enfocar. Las flechas y el teclado deslizan una tarjeta.
     ------------------------------------------------------------------ */
  const carousel = document.getElementById('carrusel-personajes');
  if (carousel) {
    const track = carousel.querySelector('.carousel__track');
    const originals = Array.from(track.children);
    const N = originals.length;
    const current = carousel.querySelector('[data-current]');
    const total = carousel.querySelector('[data-total]');
    const AUTOPLAY = Number(carousel.dataset.autoplay) || 5200;   // ms entre tarjetas
    let lastStep = 0;
    let setW = 0, step = 0, pos = 0, active = 0;
    let paused = false, dragging = false, glide = null, raf = null, last = 0;

    originals.forEach(function (c, i) { c.dataset.idx = i; });
    for (let k = 0; k < 2; k++) {
      originals.forEach(function (c) {
        const clone = c.cloneNode(true);
        clone.classList.add('is-clone'); clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('img').forEach(function (im) { im.loading = 'lazy'; });
        track.appendChild(clone);
      });
    }
    const all = Array.from(track.children);
    total.textContent = String(N).padStart(2, '0');
    track.classList.add('is-infinite');

    function measure() {
      const first = originals[0], second = originals[1] || originals[0];
      step = second.offsetLeft - first.offsetLeft || first.offsetWidth;
      setW = step * N;
    }
    function wrap() {
      if (pos >= setW * 2) pos -= setW;
      else if (pos < setW) pos += setW;
    }
    function apply() { track.scrollLeft = pos; }
    function syncActive() {
      const i = ((Math.round((pos - originals[0].offsetLeft) / step) % N) + N) % N;
      if (i === active && all[0].classList.contains('is-active') === (active === 0)) return;
      active = i;
      all.forEach(function (c) { c.classList.toggle('is-active', Number(c.dataset.idx) === active); });
      current.textContent = String(active + 1).padStart(2, '0');
    }

    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000 || .016);
      last = now;
      if (glide) {
        const t = Math.min(1, (now - glide.t0) / glide.dur);
        const e = 1 - Math.pow(1 - t, 3);
        pos = glide.from + (glide.to - glide.from) * e;
        if (t >= 1) glide = null;
        wrap(); apply();
      } else if (!paused && !dragging && !reduced && now - lastStep > AUTOPLAY) {
        // quieto, y cada tanto pasa a la siguiente tarjeta (infinito: nunca rebota)
        lastStep = now; slide(1);
      }
      syncActive();
      raf = requestAnimationFrame(frame);
    }

    function slide(dir) {
      lastStep = performance.now();
      const from = glide ? glide.to : pos;
      // alinea al múltiplo de tarjeta más cercano y se mueve una entera
      const base = Math.round((from - originals[0].offsetLeft) / step) * step + originals[0].offsetLeft;
      glide = { from: pos, to: base + dir * step, t0: performance.now(), dur: reduced ? 1 : 520 };
    }

    carousel.querySelectorAll('.carousel__btn').forEach(function (btn) {
      btn.addEventListener('click', function () { slide(Number(btn.dataset.dir)); });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); slide(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); slide(-1); }
    });

    // se frena mientras el visitante mira o toca; el arrastre manual manda
    ['mouseenter', 'focusin'].forEach(function (ev) { carousel.addEventListener(ev, function () { paused = true; }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { carousel.addEventListener(ev, function () { paused = false; }); });
    let dragT = null;
    track.addEventListener('pointerdown', function () { dragging = true; glide = null; }, { passive: true });
    track.addEventListener('touchstart', function () { dragging = true; glide = null; }, { passive: true });
    track.addEventListener('scroll', function () {
      if (glide) return;
      if (Math.abs(track.scrollLeft - pos) > 1.5) { pos = track.scrollLeft; wrap(); if (track.scrollLeft !== pos) track.scrollLeft = pos; }
      if (dragging) { clearTimeout(dragT); dragT = setTimeout(function () { dragging = false; }, 900); }
    }, { passive: true });

    // sólo corre mientras está en pantalla
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: .05 }).observe(carousel);

    let rz = null;
    window.addEventListener('resize', function () {
      clearTimeout(rz);
      rz = setTimeout(function () { const k = (pos - setW) / setW; measure(); pos = setW + k * setW; wrap(); apply(); }, 120);
    });

    measure();
    pos = setW + originals[0].offsetLeft;   // arranca en el juego del medio, primera tarjeta
    apply();
    syncActive();
    if (reduced) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  /* ------------------------------------------------------------------
     5. Tilt 3D sutil (±6°) atado al mouse
     ------------------------------------------------------------------ */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      let frame = null;
      el.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5;
          const y = (e.clientY - r.top) / r.height - .5;
          el.style.transform = 'perspective(900px) rotateX(' + (-y * 6).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
        });
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------
     6. Trail de gotas en el hero (máx. 12 nodos vivos)
     ------------------------------------------------------------------ */
  const trail = document.getElementById('hero-trail');
  const hero = document.getElementById('inicio');
  if (trail && !reduced && window.matchMedia('(hover: hover)').matches) {
    let last = 0;
    hero.addEventListener('pointermove', function (e) {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      if (trail.childElementCount >= 20) trail.firstElementChild.remove();
      const r = hero.getBoundingClientRect();
      const dot = document.createElement('i');
      dot.style.left = (e.clientX - r.left) + 'px';
      dot.style.top = (e.clientY - r.top) + 'px';
      trail.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     6a. Narrativa: título letra por letra, ejercicios a máquina, salida de página
     ------------------------------------------------------------------ */
  // título del hero: cada letra sube con un retraso
  document.querySelectorAll('.hero__word').forEach(function (w) {
    const text = w.textContent;
    w.textContent = '';
    Array.from(text).forEach(function (ch, i) {
      const s = document.createElement('i');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.animationDelay = (120 + i * 28) + 'ms';
      w.appendChild(s);
    });
  });

  // ejercicios: se escriben a máquina al entrar en pantalla
  const exObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      exObs.unobserve(e.target);
      const el = e.target, box = el.querySelector('.exercise__text'), text = el.dataset.type || '';
      // el texto completo queda invisible reservando el alto: escribir a máquina no mueve la página (CLS)
      box.textContent = '';
      const ghost = document.createElement('span'); ghost.className = 'exercise__ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.textContent = text;
      const out = document.createElement('span'); out.className = 'exercise__typed';
      box.appendChild(ghost); box.appendChild(out);
      if (reduced) { out.textContent = text; el.classList.add('is-done'); return; }
      let i = 0;
      (function tick() {
        out.textContent = text.slice(0, i++);
        if (i <= text.length) window.setTimeout(tick, text[i - 2] === '.' ? 260 : 28 + Math.random() * 30);
        else el.classList.add('is-done');
      })();
    });
  }, { threshold: .6 });
  document.querySelectorAll('.exercise').forEach(function (el) { exObs.observe(el); });

  // salida de página: fade corto antes de navegar a otra lección
  if (!reduced) {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href$=".html"]');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      // salpicón desde el punto del click (misma simulación que el hero) mientras la página se apaga
      const cv = document.createElement('canvas'); cv.className = 'wipe'; cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      let wait = 620;
      if (window.BloodSim) {
        const sim = window.BloodSim(cv, 2);
        const rect = sim.resize();
        const W = rect.width, H = rect.height;
        const cx = (e.clientX || W * .5) - rect.left, cy = (e.clientY || H * .4) - rect.top;
        // impacto moderado que chorrea: las chorreaduras corren hacia abajo con gravedad fuerte
        // sutil: impacto chico, dos chorreaduras finas, pocas salpicaduras
        const R = Math.max(42, Math.min(W, H) * .058);
        sim.burst({ cx: cx, cy: cy, R: R, count: 16, speed: 1.1, pool: .75, drips: 2, partDrips: 1, dripAt: .08, dripGrav: 2400, dripMax: 1700, dripLenK: 14, dripW: 1.5 });
        sim.start();
        wait = 860;
      }
      window.setTimeout(function () { location.href = a.href; }, wait);
    });
    window.addEventListener('pageshow', function () { document.body.classList.remove('is-leaving'); });
  }

  /* ------------------------------------------------------------------
     6b. Temporadas: desplegable animado (details/summary)
     ------------------------------------------------------------------ */
  document.querySelectorAll('.season-acc').forEach(function (d) {
    const sum = d.querySelector('summary');
    if (d.open) d.classList.add('is-open');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        d.classList.remove('is-open');
        const panel = d.querySelector('.season-acc__panel');
        const done = function () { d.open = false; panel.removeEventListener('transitionend', done); };
        if (reduced) done(); else panel.addEventListener('transitionend', done);
      } else {
        d.open = true;
        requestAnimationFrame(function () { d.classList.add('is-open'); });
      }
    });
  });

  /* ------------------------------------------------------------------
     6c. Goteo ambiental: cada tanto una gota cae del logo y mancha el pie
     ------------------------------------------------------------------ */
  if (!reduced && document.getElementById('s-stain')) {
    const stains = [];
    function dripX() {
      const el = document.querySelector('.nav__brand--stained .stain-word');
      if (el && el.offsetParent) { const r = el.getBoundingClientRect(); return r.left + r.width * .86; }
      return window.innerWidth - 30;
    }
    function ambientDrop() {
      const navH = parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 76;
      const x = dripX();
      const drop = document.createElement('i');
      drop.className = 'adrop';
      drop.style.left = x + 'px'; drop.style.top = (navH - 4) + 'px';
      document.body.appendChild(drop);
      const fall = window.innerHeight - navH - 8;
      const anim = drop.animate([
        { transform: 'scaleY(.2)', opacity: 0, offset: 0 },
        { transform: 'scaleY(1.15)', opacity: 1, offset: .35 },
        { transform: 'scaleY(1.15)', opacity: 1, offset: .45 },
        { transform: 'translateY(' + fall + 'px) scaleY(1.6)', opacity: 1, offset: 1 }
      ], { duration: 3200, easing: 'cubic-bezier(.6,0,1,.5)', fill: 'forwards' });
      anim.onfinish = function () {
        drop.remove();
        const st = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        st.setAttribute('class', 'astain'); st.setAttribute('viewBox', '0 0 600 420'); st.setAttribute('aria-hidden', 'true');
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        use.setAttribute('href', '#s-stain'); st.appendChild(use);
        const w = 22 + Math.random() * 22;
        st.style.width = w + 'px'; st.style.height = (w * .7) + 'px';
        st.style.left = (x - w / 2 + (Math.random() * 10 - 5)) + 'px';
        st.style.transform = 'rotate(' + (Math.random() * 40 - 20) + 'deg)';
        document.body.appendChild(st);
        requestAnimationFrame(function () { st.classList.add('is-on'); });
        stains.push(st);
        if (stains.length > 9) { const old = stains.shift(); old.classList.remove('is-on'); setTimeout(function () { old.remove(); }, 600); }
      };
      // casi constante: la siguiente empieza a formarse apenas cae la anterior
      window.setTimeout(ambientDrop, 1200 + Math.random() * 1800);
    }
    window.setTimeout(ambientDrop, 2500);
  }

  /* ------------------------------------------------------------------
     6d. Huella: cada click en el papel deja una salpicadura chica
     ------------------------------------------------------------------ */
  const marks = [];
  // API global: salpicadura chica en coordenadas de página (la usan el quiz y el lightbox)
  window.bloodSplat = function (pageX, pageY, size) {
    if (reduced || !document.getElementById('s-stain')) return;
    const w = (size || (18 + Math.random() * 18)) * .6;
    let el;
    if (window.BloodSim) {
      // salpicón simulado: cada click es distinto (charco irregular, gotitas, bruma, chorreadura corta)
      const box = Math.round(w * 7);
      el = document.createElement('canvas'); el.className = 'astain astain--click astain--sim';
      el.style.width = box + 'px'; el.style.height = box + 'px';
      el.style.left = (pageX - box / 2) + 'px'; el.style.top = (pageY - box * .42) + 'px';
      document.body.appendChild(el);
      const sim = window.BloodSim(el, 2);
      sim.resize();
      sim.burst({ cx: box / 2, cy: box * .42, R: w * .55, count: 5 + Math.round(w / 6), speed: .8, pool: .8, drips: Math.random() < .35 ? 1 : 0, partDrips: 0, dripLenK: .6 });
      sim.start();
      window.setTimeout(function () { sim.stop(); }, 2600);
      // se desvanece solo: la página no se llena de manchas
      window.setTimeout(function () { el.classList.remove('is-on'); window.setTimeout(function () { el.remove(); }, 900); }, 6000 + Math.random() * 3000);
      requestAnimationFrame(function () { el.classList.add('is-on'); });
    } else {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      el.setAttribute('class', 'astain astain--click'); el.setAttribute('viewBox', '0 0 600 420'); el.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#s-stain'); el.appendChild(use);
      el.style.width = w + 'px'; el.style.height = (w * .7) + 'px';
      el.style.left = (pageX - w / 2) + 'px'; el.style.top = (pageY - w * .35) + 'px';
      el.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.classList.add('is-on'); });
    }
    marks.push(el);
    if (marks.length > 8) { const old = marks.shift(); old.classList.remove('is-on'); setTimeout(function () { old.remove(); }, 600); }
  };
  if (!reduced && document.getElementById('s-stain')) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('a, button, input, textarea, select, summary, iframe, dialog, .carousel__track')) return;
      window.bloodSplat(e.pageX, e.pageY);
      return;
      const st = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      st.setAttribute('class', 'astain astain--click'); st.setAttribute('viewBox', '0 0 600 420'); st.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#s-stain'); st.appendChild(use);
      const w = 18 + Math.random() * 18;
      st.style.width = w + 'px'; st.style.height = (w * .7) + 'px';
      st.style.left = (e.pageX - w / 2) + 'px'; st.style.top = (e.pageY - w * .35) + 'px';
      st.style.transform = 'rotate(' + (Math.random() * 360) + 'deg) scale(.2)';
      document.body.appendChild(st);
      requestAnimationFrame(function () { st.classList.add('is-on'); st.style.transform = 'rotate(' + (Math.random() * 360) + 'deg) scale(1)'; });
      marks.push(st);
      if (marks.length > 12) { const old = marks.shift(); old.classList.remove('is-on'); setTimeout(function () { old.remove(); }, 600); }
    });
  }

  /* ------------------------------------------------------------------
     6e. Rastro global: gotitas finas al mover el mouse por cualquier página
     ------------------------------------------------------------------ */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    let lastT = 0, lastX = 0, lastY = 0;
    document.addEventListener('pointermove', function (e) {
      const now = performance.now();
      if (now - lastT < 110 || Math.hypot(e.clientX - lastX, e.clientY - lastY) < 18) return;
      if (e.target.closest && e.target.closest('.hero, iframe, dialog')) return;
      lastT = now; lastX = e.clientX; lastY = e.clientY;
      const dot = document.createElement('i'); dot.className = 'trail-dot';
      dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
      document.body.appendChild(dot);
      dot.addEventListener('animationend', function () { dot.remove(); });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     6f. Flechas del carrusel: salpican al usarlas
     ------------------------------------------------------------------ */
  document.querySelectorAll('.carousel__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!window.bloodSplat) return;
      const r = b.getBoundingClientRect();
      window.bloodSplat(r.left + r.width / 2 + window.scrollX + (Math.random() * 20 - 10), r.bottom + window.scrollY + 6, 16);
    });
  });

  /* ------------------------------------------------------------------
     7. Lightbox propio
     ------------------------------------------------------------------ */
  const lightbox = document.getElementById('lightbox');
  const gallery = document.getElementById('gallery');
  if (lightbox && gallery) {
    const items = Array.from(gallery.querySelectorAll('.gallery__btn'));
    const img = document.getElementById('lightbox-img');
    const frame = document.getElementById('lightbox-frame');
    const ph = document.getElementById('lightbox-ph');
    const caption = document.getElementById('lightbox-caption');
    let idx = 0;
    let opener = null;

    function show(i) {
      idx = (i + items.length) % items.length;
      const src = items[idx].querySelector('img');
      const missing = items[idx].closest('.gallery__item').classList.contains('is-placeholder');
      frame.classList.toggle('is-placeholder', missing);
      ph.textContent = String(idx + 1).padStart(2, '0');
      img.alt = src.alt;
      img.src = missing ? '' : src.src;
      caption.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0') + ' · ' + (src.alt || 'Escena');
    }
    function open(i, from) {
      opener = from || null;
      if (from && window.bloodSplat) { const r = from.getBoundingClientRect(); window.bloodSplat(r.right - 14 + window.scrollX, r.top + 14 + window.scrollY, 22); }
      show(i);
      if (!lightbox.open) lightbox.showModal();
      requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    }
    function close() {
      lightbox.classList.remove('is-open');
      const done = function () { if (lightbox.open) lightbox.close(); if (opener) opener.focus(); };
      if (reduced) done(); else setTimeout(done, 280);
    }

    items.forEach(function (btn, i) {
      btn.dataset.cap = 'Escena ' + String(i + 1).padStart(2, '0');
      btn.addEventListener('click', function () { open(Number(btn.dataset.index), btn); });
    });
    document.getElementById('lightbox-close').addEventListener('click', close);
    document.getElementById('lightbox-prev').addEventListener('click', function () { show(idx - 1); });
    document.getElementById('lightbox-next').addEventListener('click', function () { show(idx + 1); });
    lightbox.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) close();
    });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }

  /* ------------------------------------------------------------------
     8. Contacto: el formulario no envía a ningún servidor (proyecto de
        clase); valida, sella "Recibido" y guarda el pedido en el navegador.
     ------------------------------------------------------------------ */
  const form = document.getElementById('contact-form');
  if (form) {
    const problem = form.querySelector('#c-problema');
    const hint = form.querySelector('.form__hint');
    const HINTS = {
      vecino: 'Breitner sugiere empezar por una nota amable. Y terminar ahí.',
      jefe: 'El trabajo termina cuando vos decidís. Breitner lo dijo; Björn lo aplicó.',
      cliente: 'Si tu cliente se llama Dragan, no hace falta que sigas escribiendo.',
      familia: 'Respirar. Contar hasta diez. Pedir turno igual.',
      otro: 'Contanos. Sin nombres, por las dudas.'
    };
    if (problem) problem.addEventListener('change', function () { hint.textContent = HINTS[problem.value] || HINTS.otro; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      try { sessionStorage.setItem('mpa-contacto', JSON.stringify(data)); } catch (err) {}
      form.classList.add('is-sent');
      const btn = form.querySelector('[type="submit"]');
      if (btn && window.bloodSplat) { const r = btn.getBoundingClientRect(); window.bloodSplat(r.left + window.scrollX + r.width * .7, r.top + window.scrollY + r.height * .5, 26); }
      const done = form.querySelector('.form__done');
      if (done) { const name = (data.nombre || '').trim().split(' ')[0]; done.querySelector('[data-name]').textContent = name ? name + ', r' : 'R'; done.focus(); }
    });
    const again = form.querySelector('#contact-again');
    if (again) again.addEventListener('click', function () { form.reset(); form.classList.remove('is-sent'); hint.textContent = HINTS.otro; form.querySelector('input').focus(); });
  }
})();