/* blood.js — simulación de sangre reutilizable + loader + gota del hero + salpicón del tráiler
   Cada "burst" es un impacto: charco (metaballs que crecen), salpicaduras con física
   (velocidad, arrastre viscoso, estiradas en la dirección del vuelo) y chorreaduras
   con gravedad lenta. El canvas lleva el filtro SVG #f-goo-blood, que funde las
   gotas, oscurece el borde, agrega brillo húmedo y suaviza (anti-aliasing). */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('pageshow', function () { window.scrollTo(0, 0); });

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ease(t) { return 1 - Math.exp(-t / .24); }

  /* ------------------------------------------------------------------
     Simulación (varios impactos sobre un mismo canvas)
     ------------------------------------------------------------------ */
  function createSim(canvas, maxDpr) {
    const sim = { canvas: canvas, ctx: null, w: 0, h: 0, bursts: [], done: false, raf: null };

    sim.resize = function () {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(maxDpr || 2, window.devicePixelRatio || 1);
      sim.w = rect.width; sim.h = rect.height;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      sim.ctx = canvas.getContext('2d');
      sim.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return rect;
    };

    /* opts: cx, cy, R, dir (rad, opcional: cono), spread (rad), count, speed, pool (0..1), drips (n), delay (s) */
    sim.burst = function (o) {
      const R = o.R;
      const b = { cx: o.cx, cy: o.cy, R: R, t: -(o.delay || 0), pool: [], parts: [], drips: [],
                  nDrips: o.drips == null ? 3 : o.drips, poolK: o.pool == null ? 1 : o.pool, started: false };
      if (b.poolK > 0) {
        b.pool.push({ dx: 0, dy: 0, r: R * b.poolK, delay: 0 });
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2 + rnd(-.3, .3), d = rnd(.45, 1.25) * R * b.poolK;
          b.pool.push({ dx: Math.cos(a) * d, dy: Math.sin(a) * d * .85, r: rnd(.1, .46) * R * b.poolK, delay: rnd(.02, .3) });
        }
      }
      const n = o.count || 34;
      b.grow = o.grow || 0;          // >0: las gotas "vienen hacia la cámara" (crecen en vuelo)
      b.dripGrav = o.dripGrav || 70; b.dripMax = o.dripMax || 42; b.dripLenK = o.dripLenK || 1; b.dripAt = o.dripAt || .26; b.dripW = o.dripW || 1;   // chorreaduras: gravedad, velocidad tope, largo
      b.partDrips = o.partDrips == null ? 2 : o.partDrips;
      for (let i = 0; i < n; i++) {
        const a = o.dir == null ? rnd(0, Math.PI * 2) : o.dir + rnd(-1, 1) * (o.spread || .6);
        const u = Math.random();
        const sp = (o.speed || 1) * (260 + u * u * 1350);
        const r = (1.3 + (1 - u) * 3.6) * (R / 72);
        const spines = [];
        const ns = r > 2 ? 2 + Math.floor(Math.random() * 4) : 0;
        for (let k = 0; k < ns; k++) spines.push({ a: rnd(0, Math.PI * 2), l: rnd(.5, 1.3), w: rnd(.25, .45) });
        b.parts.push({ x: b.cx, y: b.cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .85,
                       r: b.grow ? r * .3 : r, r1: r, alive: true, dir: [Math.cos(a), Math.sin(a)], spines: spines });
      }
      // bruma: gotitas mínimas, rápidas, que quedan como puntos alrededor
      b.mist = [];
      const nm = Math.round(n * 3.2);
      for (let i = 0; i < nm; i++) {
        const a = o.dir == null ? rnd(0, Math.PI * 2) : o.dir + rnd(-1, 1) * ((o.spread || .6) * 1.3);
        const sp = (o.speed || 1) * rnd(300, 1900);
        b.mist.push({ x: b.cx, y: b.cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .85, r: rnd(.3, 1.3) * (R / 72), a: rnd(.45, .95), alive: true });
      }
      sim.bursts.push(b);
      return b;
    };

    function stepBurst(b, dt) {
      b.t += dt;
      if (b.t < 0) return true;
      const R = b.R, drag = Math.pow(.9, dt * 60);
      let moving = false;
      b.parts.forEach(function (p) {
        if (!p.alive) return;
        p.vx *= drag; p.vy *= drag;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (b.grow) p.r = Math.min(p.r1, p.r + p.r1 * dt / b.grow);
        if (Math.hypot(p.vx, p.vy) < 6) p.alive = false; else moving = true;
      });
      const dragM = Math.pow(.86, dt * 60);
      b.mist.forEach(function (p) {
        if (!p.alive) return;
        p.vx *= dragM; p.vy *= dragM;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.hypot(p.vx, p.vy) < 8) p.alive = false;
      });
      if (b.t > b.dripAt && !b.started) {
        b.started = true;
        if (b.nDrips > 0 && b.poolK > 0) {
          b.drips.push({ x: b.cx + rnd(-.3, .3) * R, y0: b.cy + R * .85 * b.poolK, vy: 0, w: rnd(3.2, 4.6) * (R / 72) * b.dripW, max: rnd(1.4, 2.4) * R * b.dripLenK });
          if (b.nDrips > 1) b.drips.push({ x: b.cx + rnd(.45, .8) * R, y0: b.cy + R * .6 * b.poolK, vy: 0, w: rnd(2, 2.8) * (R / 72) * b.dripW, max: rnd(.5, 1.1) * R * b.dripLenK });
          if (b.nDrips > 2) b.drips.push({ x: b.cx + rnd(-.9, -.5) * R, y0: b.cy + R * .45 * b.poolK, vy: 0, w: rnd(2, 3) * (R / 72) * b.dripW, max: rnd(.6, 1.2) * R * b.dripLenK });
        }
        // 1–2 salpicaduras grandes también chorrean
        if (b.nDrips > 0) {
          b.parts.filter(function (p) { return p.r1 > 2.4; }).slice(0, b.partDrips).forEach(function (p) {
            b.drips.push({ from: p, x: p.x, y0: p.y, vy: 0, w: p.r * 1.2 * b.dripW, max: rnd(.3, .8) * R * b.dripLenK });
          });
        }
        b.drips.forEach(function (d) { d.y = d.y0; });
      }
      b.drips.forEach(function (d) {
        if (d.from) { d.x = d.from.x; if (d.from.y > d.y0) { d.y0 = d.from.y; d.y = Math.max(d.y, d.y0); } }
        if (d.y - d.y0 >= d.max) return;
        const k = 1 - (d.y - d.y0) / d.max;               // 1 al empezar, 0 al agotarse
        d.vy = Math.min(d.vy + b.dripGrav * dt * (k * k + .1), b.dripMax * (k + .15));
        d.y += d.vy * dt;
        moving = true;
      });
      return moving || b.t < 3.4;
    }

    /* Una gota: centro espeso y opaco, borde fino y translúcido (se absorbe en el papel) */
    function dropGradient(c, r) {
      const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, 'rgba(128, 14, 20, .96)');
      g.addColorStop(.55, 'rgba(160, 24, 28, .94)');
      g.addColorStop(.88, 'rgba(178, 34, 36, .8)');
      g.addColorStop(1, 'rgba(184, 40, 40, 0)');
      return g;
    }
    function drawDrop(c, x, y, r, nx, ny, stretch) {
      c.save();
      c.translate(x, y);
      if (stretch > 1.02) { c.rotate(Math.atan2(ny, nx)); c.scale(stretch, 1); c.translate(-r * (stretch - 1) * .35, 0); }
      c.fillStyle = dropGradient(c, r);
      c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
      c.restore();
    }
    /* Chorreadura real: baja ondulando (dos senos con fase propia), el grosor varía a lo largo
       (más fina en el medio, con pequeños "nudos"), la película fina es más transparente y la
       cabeza es una lágrima alargada con el núcleo más oscuro. */
    function drawDrip(c, d) {
      const len = d.y - d.y0;
      if (len <= .5) return;
      if (d.seed == null) { d.seed = Math.random() * 1000; d.f1 = .018 + Math.random() * .02; d.f2 = .06 + Math.random() * .05; d.amp = d.w * (.5 + Math.random() * .9); }
      const steps = Math.max(8, Math.min(60, Math.round(len / 7)));
      const left = [], right = [];
      for (let i = 0; i <= steps; i++) {
        const s = i / steps, yy = d.y0 + len * s;
        const wob = Math.sin(yy * d.f1 + d.seed) * d.amp * .6 + Math.sin(yy * d.f2 + d.seed * 1.7) * d.amp * .25;
        // grosor: arranca ancho, se afina, y cerca de la cabeza vuelve a engordar; nudos aleatorios suaves
        let w = d.w * (1.05 - .55 * Math.sin(s * Math.PI) + .18 * (1 - s)) * (1 + .12 * Math.sin(yy * .21 + d.seed));
        w = Math.max(d.w * .28, w);
        left.push([d.x + wob * s - w * .5, yy]); right.push([d.x + wob * s + w * .5, yy]);
      }
      const hx = left[steps][0] + (right[steps][0] - left[steps][0]) / 2, hy = d.y;
      // hilo: película translúcida con centro más denso
      c.beginPath();
      c.moveTo(left[0][0], left[0][1]);
      for (let i = 1; i <= steps; i++) c.lineTo(left[i][0], left[i][1]);
      for (let i = steps; i >= 0; i--) c.lineTo(right[i][0], right[i][1]);
      c.closePath();
      c.fillStyle = 'rgba(150, 22, 26, .55)';
      c.fill();
      // centro del hilo
      c.beginPath();
      for (let i = 0; i <= steps; i++) { const x = (left[i][0] + right[i][0]) / 2, y = left[i][1]; if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = 'rgba(118, 12, 18, .85)'; c.lineWidth = Math.max(1, d.w * .38); c.stroke();
      // cabeza: lágrima alargada, núcleo oscuro, borde translúcido
      const r = d.w * 1.15;
      c.save(); c.translate(hx, hy); c.scale(1, 1.35);
      const rg = c.createRadialGradient(0, -r * .15, 0, 0, 0, r);
      rg.addColorStop(0, 'rgba(112, 10, 16, .97)'); rg.addColorStop(.6, 'rgba(150, 22, 26, .95)'); rg.addColorStop(.9, 'rgba(176, 34, 36, .75)'); rg.addColorStop(1, 'rgba(184, 40, 40, 0)');
      c.fillStyle = rg; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
      c.restore();
    }

    function drawBurst(c, b) {
      if (b.t < 0) return;
      // charco: lóbulos superpuestos, cada uno con espesor propio → el centro queda más oscuro
      // charco unificado: lóbulos planos que se funden en una sola silueta, y encima
      // un solo gradiente de espesor (centro más oscuro) recortado a esa silueta
      if (b.pool.length) {
        c.save();
        c.beginPath();
        b.pool.forEach(function (p) {
          const k = ease(Math.max(0, b.t - p.delay));
          if (k <= 0) return;
          c.moveTo(b.cx + p.dx * k + p.r * k, b.cy + p.dy * k);
          c.arc(b.cx + p.dx * k, b.cy + p.dy * k, p.r * k * 1.15, 0, Math.PI * 2);
        });
        c.fillStyle = 'rgba(160, 24, 28, .94)';
        c.fill();
        c.clip();
        const gk = ease(Math.max(0, b.t));
        const g = c.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.R * 1.25 * gk + 1);
        g.addColorStop(0, 'rgba(110, 10, 16, .95)');
        g.addColorStop(.55, 'rgba(140, 18, 24, .5)');
        g.addColorStop(1, 'rgba(184, 40, 40, 0)');
        c.fillStyle = g;
        c.fillRect(b.cx - b.R * 2, b.cy - b.R * 2, b.R * 4, b.R * 4);
        c.restore();
      }
      // salpicaduras: lágrima estirada en la dirección del vuelo
      b.parts.forEach(function (p) {
        const sp = Math.hypot(p.vx, p.vy);
        const stretch = Math.max(1.08, Math.min(3.2, 1 + sp * .0035));
        drawDrop(c, p.x, p.y, p.r * 1.05, p.dir[0], p.dir[1], stretch);
        // espinas cortas en el borde, una de ellas siguiendo la dirección del vuelo
        if (p.spines && !p.alive) {
          p.spines.forEach(function (q, i) {
            const ang = i === 0 ? Math.atan2(p.dir[1], p.dir[0]) : q.a;
            const len = p.r * q.l, w = Math.max(.6, p.r * q.w);
            c.save(); c.translate(p.x, p.y); c.rotate(ang);
            c.fillStyle = 'rgba(160, 24, 28, .92)';
            c.beginPath(); c.moveTo(p.r * .6, -w); c.lineTo(p.r * .95 + len, 0); c.lineTo(p.r * .6, w); c.closePath(); c.fill();
            c.restore();
          });
        }
      });
      // bruma
      b.mist.forEach(function (p) {
        c.fillStyle = 'rgba(150, 22, 26, ' + p.a + ')';
        c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill();
      });
      // chorreaduras
      b.drips.forEach(function (d) { if (d.y != null) drawDrip(c, d); });
    }

    sim.step = function (dt) {
      let any = false;
      sim.bursts.forEach(function (b) { if (stepBurst(b, dt)) any = true; });
      sim.done = !any;
    };
    sim.draw = function () {
      const c = sim.ctx;
      c.clearRect(0, 0, sim.w, sim.h);
      sim.bursts.forEach(function (b) { drawBurst(c, b); });
    };
    sim.settle = function () { for (let i = 0; i < 280; i++) sim.step(1 / 60); sim.draw(); };

    let last = 0;
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000 || .016);
      last = now;
      sim.step(dt); sim.draw();
      if (!sim.done) sim.raf = requestAnimationFrame(frame);
    }
    sim.start = function () {
      if (reduced) { sim.settle(); return; }
      last = performance.now();
      sim.raf = requestAnimationFrame(frame);
    };
    sim.stop = function () { if (sim.raf) cancelAnimationFrame(sim.raf); };
    return sim;
  }

  window.BloodSim = createSim;

  /* ------------------------------------------------------------------
     Hero: loader → gota → impacto sobre la S
     ------------------------------------------------------------------ */
  const hero = document.getElementById('inicio');
  const title = document.getElementById('hero-title');
  const target = document.querySelector('.hero__target');
  const heroCanvas = document.getElementById('blood-canvas');
  let heroSim = null;

  // Punto de impacto: la gota termina exactamente acá y el charco nace acá (v16).
  // Está en el tercio superior de la S final, así el charco se apoya sobre la letra
  // y las chorreaduras corren hacia abajo por encima del rojo.
  const IMPACT_Y = .34;
  function impactPoint() {
    const s = target.getBoundingClientRect();
    return { x: s.left + s.width * .5, y: s.top + s.height * IMPACT_Y, h: s.height };
  }
  function heroBurst(sim) {
    alignToTarget();
    const rect = sim.resize();
    const ip = impactPoint();
    const R = Math.max(30, Math.min(74, ip.h * .44));
    // charco mediano en el punto exacto, salpicaduras cortas y cuatro chorreaduras largas
    sim.burst({ cx: ip.x - rect.left, cy: ip.y - rect.top, R: R, count: 30, speed: .95, pool: 1, drips: 4, partDrips: 2,
                dripAt: .22, dripGrav: 110, dripMax: 64, dripLenK: 2.8, dripW: 1.1 });
  }
  function heroImpact() {
    heroSim = createSim(heroCanvas, 2);
    heroBurst(heroSim);
    hero.classList.add('is-stained');
    heroSim.start();
  }

  let resizeT = null;
  window.addEventListener('resize', function () {
    if (!heroSim) return;
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      heroSim.stop();
      heroSim = createSim(heroCanvas, 2);
      heroBurst(heroSim);
      heroSim.settle();
    }, 150);
  });

  // La gota y el canvas se centran en la S final medida en pantalla (el título
  // puede tener líneas de distinto ancho, así que no alcanza con "right").
  function alignToTarget() {
    const h = title.getBoundingClientRect(), s = target.getBoundingClientRect();
    const cx = s.left + s.width * .5 - h.left;
    const drip = document.getElementById('blood-drip');
    if (drip) { drip.style.right = 'auto'; drip.style.left = (cx - drip.getBoundingClientRect().width * .5) + 'px'; }
    if (heroCanvas) {
      const cw = heroCanvas.getBoundingClientRect().width;
      heroCanvas.style.right = 'auto'; heroCanvas.style.left = (cx - cw * .5) + 'px';
      heroCanvas.style.top = (s.top - h.top - s.height * .9) + 'px';
    }
  }
  function placeDrip() {
    const navH = parseFloat(getComputedStyle(root).getPropertyValue('--nav-h')) || 76;
    const h = title.getBoundingClientRect();
    const titleTop = h.top + window.scrollY;
    const len = Math.max(120, titleTop - navH - 12);
    title.style.setProperty('--drip-start', (-len) + 'px');
    title.style.setProperty('--drip-len', len + 'px');
    alignToTarget();
    // la punta del trazo (99% del alto del SVG) cae en el punto de impacto, no "a ojo"
    const ip = impactPoint();
    const drip = document.getElementById('blood-drip');
    if (drip) { drip.style.top = (-len) + 'px'; drip.style.height = ((len + (ip.y - h.top)) / .99) + 'px'; }
  }
  function drip() {
    placeDrip();
    hero.classList.add('is-dripping');
    window.setTimeout(heroImpact, 800);
  }
  function start() {
    body.classList.add('is-loaded');
    root.classList.add('is-loaded');
    if (reduced) { heroImpact(); return; }
    window.setTimeout(drip, 350);
  }

  let seenIntro = false;
  try { seenIntro = !!sessionStorage.getItem('mpa-intro'); sessionStorage.setItem('mpa-intro', '1'); } catch (err) { seenIntro = false; }
  if (!hero) {
    body.classList.add('is-loaded'); root.classList.add('is-loaded');
  } else if (reduced || seenIntro) {
    // la respiración de bienvenida es sólo la primera vez por visita
    root.classList.add('no-intro');
    start();
  } else {
    const minLoader = 2750, t0 = performance.now();
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () { window.setTimeout(start, Math.max(0, minLoader - (performance.now() - t0))); });
  }

  /* ------------------------------------------------------------------
     Hero: pantalla 3D con el tráiler; la sangre sale de la escena
     ------------------------------------------------------------------ */
  const screen = document.getElementById('hero-screen');
  if (screen && hero) {
    const plane = document.getElementById('hero-plane');
    const videoBox = document.getElementById('hero-video');
    const sCanvas = document.getElementById('screen-blood');
    let screenSim = null;

    // El embed de YouTube sólo funciona por http(s) y fuera de entornos que bloquean iframes
    // (window.__NO_EMBED lo marca el bundle publicado). Si no, queda el still con Ken Burns.
    if (/^https?:/.test(location.protocol) && !window.__NO_EMBED && !reduced) {
      const id = screen.dataset.video, start = Number(screen.dataset.start || 0);
      // API de YouTube: si el video falla (error, bloqueo, red), se saca el reproductor y queda el still.
      const host = document.createElement('div'); host.id = 'hero-yt';
      videoBox.appendChild(host);
      let ready = false;
      function fallbackIframe() {
        if (ready) return;
        host.remove();
        const f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + id +
                '&start=' + start + '&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3';
        f.title = 'Tráiler en loop, sin sonido'; f.allow = 'autoplay; encrypted-media'; f.tabIndex = -1;
        videoBox.appendChild(f);
      }
      window.onYouTubeIframeAPIReady = function () {
        if (!window.YT || !YT.Player) { fallbackIframe(); return; }
        ready = true;
        screen.classList.add('is-loading');   // tapado por el still desde antes de que cargue el iframe (sin botón de play ni portada)
        window.__heroPlayer = new YT.Player('hero-yt', {
          host: 'https://www.youtube-nocookie.com',   // sin cookies de terceros (Lighthouse)
          videoId: id,
          playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: id, start: start, rel: 0, modestbranding: 1, playsinline: 1, disablekb: 1, iv_load_policy: 3 },
          events: {
            // el reproductor queda tapado por el still hasta que realmente reproduce (sin botones ni portada de YouTube)
            onReady: function (e) { screen.classList.add('is-loading'); e.target.mute(); e.target.seekTo(start, true); e.target.playVideo(); },
            onError: function () { videoBox.innerHTML = ''; screen.classList.remove('is-loading'); screen.classList.add('is-fallback'); },
            onStateChange: function (e) {
              const P = YT.PlayerState;
              if (e.data === P.PLAYING) {
                screen.classList.remove('is-loading');
                // vuelve al inicio un segundo y medio antes del final: nunca aparece la pantalla de "videos relacionados"
                if (!e.target.__loop) {
                  e.target.__loop = setInterval(function () {
                    try {
                      const d = e.target.getDuration(), t = e.target.getCurrentTime();
                      if (d && t > d - 1.5) { screen.classList.add('is-loading'); e.target.seekTo(start, true); }
                    } catch (err) {}
                  }, 250);
                }
              } else if (e.data === P.ENDED) { screen.classList.add('is-loading'); e.target.seekTo(start, true); e.target.playVideo(); }
              else if (e.data === P.BUFFERING || e.data === P.UNSTARTED || e.data === P.CUED) { screen.classList.add('is-loading'); }
            }
          }
        });
      };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = fallbackIframe;
      document.head.appendChild(tag);
      window.setTimeout(function () { if (!ready && !window.YT) fallbackIframe(); }, 5000);
    }

    // Parallax: la pantalla sigue al mouse unos grados
    if (!reduced && window.matchMedia('(hover: hover)').matches) {
      let pf = null;
      hero.addEventListener('pointermove', function (e) {
        if (pf) return;
        pf = requestAnimationFrame(function () {
          pf = null;
          const r = hero.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          plane.style.setProperty('--ry', (-16 + x * 10).toFixed(2) + 'deg');
          plane.style.setProperty('--rx', (4 - y * 8).toFixed(2) + 'deg');
        });
      });
      hero.addEventListener('pointerleave', function () { plane.style.removeProperty('--ry'); plane.style.removeProperty('--rx'); });
    }

    function screenBursts(sim, animate) {
      const rect = sim.resize();
      // el salpicón nace en el punto de la escena que queda debajo del título, a la derecha
      const p = plane.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const px = t.left + t.width * .5 - rect.left + p.width * .06, py = t.top + t.height * .3 - rect.top;
      const R = Math.max(40, Math.min(72, p.width * .05));
      // sale desde adentro de la escena (punto en el tercio derecho) hacia la cámara: gotas que crecen en vuelo
      sim.burst({ cx: px, cy: py, R: R, count: 46, speed: 1.35, pool: 0, drips: 4, partDrips: 4, grow: .45 });
      sim.burst({ cx: px - R * .8, cy: py + R * .4, R: R * .8, count: 26, speed: 1.1, pool: 0, drips: 3, partDrips: 3, grow: .4, delay: .35 });
      // lo que queda sobre el vidrio, abajo, chorrea
      sim.burst({ cx: px + p.width * .3, cy: py + p.height * .98, R: R * .55, dir: Math.PI / 2, spread: 1.1, count: 10, speed: .5, pool: .6, drips: 2, delay: .6 });
      if (animate) sim.start(); else sim.settle();
    }

    function screenImpact() {
      screenSim = createSim(sCanvas, 2);
      screenBursts(screenSim, true);
    }
    window.addEventListener('resize', function () {
      if (!screenSim) return;
      clearTimeout(resizeT2);
      resizeT2 = setTimeout(function () { screenSim.stop(); screenSim = createSim(sCanvas, 2); screenBursts(screenSim, false); }, 150);
    });
    var resizeT2 = null;

    // dispara ~2.6 s después del impacto en la S: coincide con el plano del tráiler
    // en que a Björn le salpica la cara (segundo 62 del tráiler oficial, arranca en 58)
    const obs = new MutationObserver(function () {
      if (hero.classList.contains('is-stained') && !screenSim) {
        obs.disconnect();
        window.setTimeout(screenImpact, reduced ? 0 : 2600);
      }
    });
    obs.observe(hero, { attributes: true, attributeFilter: ['class'] });
  }

  /* ------------------------------------------------------------------
     Tráiler: al dar play, la pantalla salpica hacia la página
     ------------------------------------------------------------------ */
  const trailer = document.getElementById('trailer-player');
  if (trailer) {
    const frame = trailer.querySelector('.trailer__frame');
    const poster = trailer.querySelector('.trailer__poster');
    const canvas = trailer.querySelector('.trailer__blood');
    const videoId = trailer.dataset.video;
    let fired = false;

    function spray() {
      if (fired) return;
      fired = true;
      trailer.classList.add('is-sprayed');
      const sim = createSim(canvas, 1.5);
      const rect = sim.resize();
      const f = frame.getBoundingClientRect();
      const fx = f.left - rect.left, fy = f.top - rect.top;
      const R = Math.max(40, f.width * .07);
      // derecha: chorro principal hacia afuera del cuadro
      sim.burst({ cx: fx + f.width, cy: fy + f.height * .42, R: R, dir: 0, spread: .75, count: 40, speed: 1.25, pool: .8, drips: 3 });
      // izquierda: réplica más chica
      sim.burst({ cx: fx, cy: fy + f.height * .6, R: R * .7, dir: Math.PI, spread: .7, count: 22, speed: 1.05, pool: .7, drips: 2, delay: .12 });
      // abajo: gotas que caen del borde inferior
      sim.burst({ cx: fx + f.width * .3, cy: fy + f.height, R: R * .55, dir: Math.PI / 2, spread: .9, count: 14, speed: .6, pool: .6, drips: 2, delay: .25 });
      sim.burst({ cx: fx + f.width * .72, cy: fy + f.height, R: R * .5, dir: Math.PI / 2, spread: .9, count: 12, speed: .6, pool: .6, drips: 2, delay: .4 });
      sim.start();
    }

    const canEmbed = /^https?:/.test(location.protocol) && !window.__NO_EMBED;
    if (!canEmbed) {
      // sin embed posible: el botón abre YouTube en otra pestaña, y la pantalla salpica igual
      const cta = poster.querySelector('.trailer__cta');
      if (cta) cta.textContent = 'Ver el tráiler en YouTube';
      poster.addEventListener('click', function () {
        window.open('https://www.youtube.com/watch?v=' + videoId, '_blank', 'noopener');
        spray();
      });
    }
    poster.addEventListener('click', function () {
      if (!canEmbed) return;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&hl=es&cc_lang_pref=es&cc_load_policy=1';
      iframe.title = 'Tráiler oficial';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.setAttribute('allowfullscreen', '');
      frame.appendChild(iframe);
      trailer.classList.add('is-playing');
      window.setTimeout(spray, 500);
    });
  }
})();
