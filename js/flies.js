/* flies.js — moscas "sobre el monitor" durante la respiración de bienvenida (v21)
   Cada mosca es un SVG dibujado (cabeza con ojos, tórax, abdomen rayado, alas
   translúcidas con venas y seis patas) más una sombra difusa desplazada, para
   que parezca apoyada sobre el vidrio. Un rAF la mueve con una máquina de
   estados: camina (marcha de trípode: tres patas y tres patas), se frena, se
   frota las patas delanteras, gira de golpe, da un salto corto con las alas
   borrosas, y al final se va volando fuera de la pantalla. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!document.getElementById('loader')) return;

  const rnd = function (a, b) { return a + Math.random() * (b - a); };
  const pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

  const layer = document.createElement('div');
  layer.className = 'flies'; layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  // ---- dibujo ----
  function flySVG() {
    return '<svg class="fly__svg" viewBox="-24 -20 48 40">' +
      '<defs>' +
        '<radialGradient id="fb" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#5a5652"/><stop offset=".55" stop-color="#2a2725"/><stop offset="1" stop-color="#121110"/></radialGradient>' +
        '<radialGradient id="fe" cx="35%" cy="35%" r="65%"><stop offset="0" stop-color="#c9583a"/><stop offset=".6" stop-color="#7a2a1a"/><stop offset="1" stop-color="#2e0d08"/></radialGradient>' +
        '<linearGradient id="fw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#dfe6ee" stop-opacity=".28"/><stop offset="1" stop-color="#ffffff" stop-opacity=".45"/></linearGradient>' +
      '</defs>' +
      // patas: tres a cada lado, caderas a lo largo del tórax. Grupo A = L1, R2, L3; grupo B = R1, L2, R3
      '<g class="fly__legs">' +
        '<g class="fly__hip fly__hip--a" transform="translate(5 -3)"><path class="fly__leg" d="M0 0 L8 -8 L14 -4 L17 0"/></g>' +
        '<g class="fly__hip fly__hip--b" transform="translate(5 3)"><path class="fly__leg" d="M0 0 L8 8 L14 4 L17 0"/></g>' +
        '<g class="fly__hip fly__hip--b" transform="translate(0 -4)"><path class="fly__leg" d="M0 0 L5 -10 L12 -9 L15 -6"/></g>' +
        '<g class="fly__hip fly__hip--a" transform="translate(0 4)"><path class="fly__leg" d="M0 0 L5 10 L12 9 L15 6"/></g>' +
        '<g class="fly__hip fly__hip--a" transform="translate(-4 -4)"><path class="fly__leg" d="M0 0 L-3 -10 L-10 -8 L-14 -3"/></g>' +
        '<g class="fly__hip fly__hip--b" transform="translate(-4 4)"><path class="fly__leg" d="M0 0 L-3 10 L-10 8 L-14 3"/></g>' +
      '</g>' +
      // alas: nacen en el tórax, se apoyan hacia atrás sobre el abdomen
      '<g class="fly__wings">' +
        '<g class="fly__wing fly__wing--l"><path d="M2 -2 C-6 -12 -22 -12 -24 -6 C-25 -2 -14 0 2 -2z" fill="url(#fw)" stroke="#3a3634" stroke-width=".4" stroke-opacity=".6"/><path d="M0 -3 C-8 -8 -16 -9 -22 -7 M-2 -3 C-9 -5 -16 -5 -21 -5" fill="none" stroke="#3a3634" stroke-width=".35" stroke-opacity=".5"/></g>' +
        '<g class="fly__wing fly__wing--r"><path d="M2 2 C-6 12 -22 12 -24 6 C-25 2 -14 0 2 2z" fill="url(#fw)" stroke="#3a3634" stroke-width=".4" stroke-opacity=".6"/><path d="M0 3 C-8 8 -16 9 -22 7 M-2 3 C-9 5 -16 5 -21 5" fill="none" stroke="#3a3634" stroke-width=".35" stroke-opacity=".5"/></g>' +
      '</g>' +
      // abdomen rayado, tórax, cabeza y ojos
      '<ellipse cx="-8" cy="0" rx="9.5" ry="5" fill="url(#fb)"/>' +
      '<path d="M-3 -3.6 L-3 3.6 M-6.5 -4.4 L-6.5 4.4 M-10 -4.4 L-10 4.4 M-13.5 -3.4 L-13.5 3.4" stroke="#0d0c0b" stroke-width="1" stroke-opacity=".55"/>' +
      '<ellipse cx="2.5" cy="0" rx="6" ry="5.2" fill="url(#fb)"/>' +
      '<path d="M-2 -4 C0 -5.5 5 -5.5 7 -4" stroke="#6b6660" stroke-width=".6" fill="none" stroke-opacity=".7"/>' +
      '<ellipse cx="10" cy="0" rx="4" ry="3.8" fill="url(#fb)"/>' +
      '<ellipse cx="11" cy="-2.3" rx="2.4" ry="2" fill="url(#fe)"/>' +
      '<ellipse cx="11" cy="2.3" rx="2.4" ry="2" fill="url(#fe)"/>' +
      '<circle cx="11.8" cy="-2.9" r=".6" fill="#f3d9c9" fill-opacity=".8"/>' +
      '<circle cx="11.8" cy="1.7" r=".6" fill="#f3d9c9" fill-opacity=".8"/>' +
      '<path d="M13.5 -1 L15 -3.5 M13.5 1 L15 3.5" stroke="#2a2725" stroke-width=".6"/>' +
      '<path d="M13.8 .4 L15.5 2.8 L16 4.5" stroke="#2a2725" stroke-width=".8" fill="none"/>' +
    '</svg>';
  }

  // ---- máquina de estados ----
  function makeFly() {
    const el = document.createElement('div');
    el.className = 'fly';
    el.innerHTML = '<div class="fly__shadow"></div><div class="fly__body">' + flySVG() + '</div>';
    layer.appendChild(el);
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); squash(f, e); });
    const size = rnd(24, 34);
    el.style.width = size + 'px'; el.style.height = (size * 40 / 48) + 'px';
    const W = window.innerWidth, H = window.innerHeight;
    const edge = pick(['left', 'right', 'bottom', 'top']);
    const f = {
      el: el, body: el.querySelector('.fly__body'), legsA: el.querySelectorAll('.fly__hip--a'), legsB: el.querySelectorAll('.fly__hip--b'),
      wings: el.querySelector('.fly__wings'), wl: el.querySelector('.fly__wing--l'), wr: el.querySelector('.fly__wing--r'),
      x: edge === 'left' ? -40 : edge === 'right' ? W + 40 : rnd(W * .2, W * .8),
      y: edge === 'top' ? -40 : edge === 'bottom' ? H + 40 : rnd(H * .2, H * .8),
      a: 0, speed: 0, phase: 0, state: 'enter', t: 0, until: 0, turnTo: 0, size: size, dead: false, born: performance.now(),
      reflex: rnd(.45, .95)   // qué tan alerta está: la mayoría se escapa, alguna distraída se deja aplastar
    };
    // entra caminando desde el borde hacia adentro
    f.a = Math.atan2(rnd(H * .3, H * .7) - f.y, rnd(W * .3, W * .7) - f.x);
    f.speed = rnd(150, 220);
    f.until = rnd(.6, 1.2);
    return f;
  }

  // aplastar con el mouse: queda pegada, con las patas abiertas y una mancha; al rato se limpia
  function squash(f, e) {
    if (f.dead || f.state === 'squashed') return;
    f.state = 'squashed'; f.speed = 0; f.t = 0;
    f.el.classList.add('is-squashed');
    f.legsA.forEach(function (g, i) { g.style.transform = 'rotate(' + (i % 2 ? 38 : -34) + 'deg)'; });
    f.legsB.forEach(function (g, i) { g.style.transform = 'rotate(' + (i % 2 ? -40 : 36) + 'deg)'; });
    f.wl.style.transform = 'rotate(-48deg)'; f.wr.style.transform = 'rotate(52deg)'; f.wings.style.opacity = '.7';
    f.el.classList.remove('is-flying'); f.el.style.setProperty('--lift', '0');
    f.body.style.transform = 'rotate(' + (f.a * 180 / Math.PI).toFixed(1) + 'deg) scale(1.28, .5)';
    if (window.bloodSplat) window.bloodSplat(f.x + window.scrollX + rnd(-4, 4), f.y + window.scrollY + rnd(-3, 3), 18);
    window.setTimeout(function () { f.el.classList.add('is-cleaning'); window.setTimeout(function () { f.dead = true; f.el.remove(); }, 1500); }, rnd(6000, 9000));
  }

  function setState(f, s) {
    f.state = s; f.t = 0;
    if (s === 'walk') { f.speed = rnd(38, 95); f.until = rnd(.6, 2.2); f.turnTo = f.a + rnd(-.5, .5); }
    if (s === 'pause') { f.speed = 0; f.until = rnd(.35, 1.4); }
    if (s === 'rub') { f.speed = 0; f.until = rnd(.7, 1.6); }
    if (s === 'turn') { f.speed = 6; f.until = rnd(.12, .25); f.turnTo = f.a + pick([-1, 1]) * rnd(1.2, 2.8); }
    if (s === 'dart') { f.speed = rnd(650, 1000); f.until = rnd(.16, .3); f.turnTo = f.a + rnd(-.9, .9); f.a = f.turnTo; }
    if (s === 'leave') {
      const W = window.innerWidth, H = window.innerHeight;
      const tx = pick([-120, W + 120]), ty = rnd(-120, H * .4);
      f.a = Math.atan2(ty - f.y, tx - f.x); f.speed = rnd(900, 1400); f.until = 3;
    }
  }

  function next(f) {
    const r = Math.random();
    if (f.state === 'walk') return r < .45 ? 'pause' : r < .62 ? 'turn' : r < .74 ? 'rub' : r < .86 ? 'dart' : 'walk';
    if (f.state === 'pause') return r < .55 ? 'walk' : r < .8 ? 'rub' : 'turn';
    if (f.state === 'rub') return r < .7 ? 'walk' : 'turn';
    if (f.state === 'turn') return r < .8 ? 'walk' : 'dart';
    if (f.state === 'dart') return r < .6 ? 'pause' : 'walk';
    return 'walk';
  }

  function step(f, dt, now) {
    f.t += dt;
    if (f.state === 'squashed') return;
    const W = window.innerWidth, H = window.innerHeight;
    const flying = f.state === 'dart' || f.state === 'leave';
    // giro suave hacia el rumbo objetivo (brusco cuando gira en el lugar)
    if (f.state === 'walk' || f.state === 'turn' || f.state === 'enter') {
      let d = f.turnTo - f.a; d = Math.atan2(Math.sin(d), Math.cos(d));
      f.a += d * Math.min(1, dt * (f.state === 'turn' ? 14 : 3));
      if (f.state === 'walk') f.a += Math.sin(now / 130 + f.born) * .012;   // titubeo
    }
    if (f.state === 'enter') f.turnTo = f.a;
    f.x += Math.cos(f.a) * f.speed * dt;
    f.y += Math.sin(f.a) * f.speed * dt;
    // no se sale de la pantalla (salvo cuando se va)
    if (f.state !== 'leave' && f.state !== 'enter') {
      const m = 30;
      if (f.x < m) { f.x = m; f.turnTo = rnd(-1, 1); }
      if (f.x > W - m) { f.x = W - m; f.turnTo = Math.PI + rnd(-1, 1); }
      if (f.y < m) { f.y = m; f.turnTo = Math.PI / 2 + rnd(-1, 1); }
      if (f.y > H - m) { f.y = H - m; f.turnTo = -Math.PI / 2 + rnd(-1, 1); }
    }
    // patas: marcha de trípode; en pausa se frota las delanteras
    if (f.speed > 0 && !flying) {
      f.phase += dt * (6 + f.speed * .11);
      const k = Math.sin(f.phase) * 14;
      f.legsA.forEach(function (g) { g.style.transform = 'rotate(' + k + 'deg)'; });
      f.legsB.forEach(function (g) { g.style.transform = 'rotate(' + (-k) + 'deg)'; });
    } else if (f.state === 'rub') {
      const k = Math.sin(f.t * 22) * 9;
      f.legsA[0].style.transform = 'rotate(' + (k - 10) + 'deg)';
      f.legsB[0].style.transform = 'rotate(' + (-k + 10) + 'deg)';
    } else {
      f.legsA.forEach(function (g) { g.style.transform = ''; });
      f.legsB.forEach(function (g) { g.style.transform = ''; });
    }
    // alas: quietas y apoyadas; en vuelo, aleteo borroso
    if (flying) {
      const w = Math.sin(now / 9) * 42;
      f.wl.style.transform = 'rotate(' + (-30 + w) + 'deg)'; f.wr.style.transform = 'rotate(' + (30 - w) + 'deg)';
      f.wings.style.opacity = '.55'; f.el.classList.add('is-flying');
    } else {
      f.wl.style.transform = ''; f.wr.style.transform = ''; f.wings.style.opacity = ''; f.el.classList.remove('is-flying');
    }
    // sombra: al volar se separa del cuerpo
    f.el.style.setProperty('--lift', flying ? '1' : '0');
    f.el.style.transform = 'translate(' + f.x.toFixed(1) + 'px,' + f.y.toFixed(1) + 'px)';
    f.body.style.transform = 'rotate(' + (f.a * 180 / Math.PI).toFixed(1) + 'deg)';

    if (f.state === 'leave') {
      if (f.x < -150 || f.x > W + 150 || f.y < -150) { f.dead = true; f.el.remove(); }
      return;
    }
    if (f.state === 'enter' && (f.t > f.until || (f.x > 40 && f.x < W - 40 && f.y > 40 && f.y < H - 40))) { setState(f, 'walk'); return; }
    if (f.t > f.until) setState(f, next(f));
  }

  // ---- lanzamiento: dos o tres moscas, escalonadas; se van a los ~8 s ----
  // Dos o tres moscas con la respiración; se quedan paseando por el hero unos 16 s y
  // se van volando. Después, cada 25–45 s vuelve una sola de visita mientras estés en el inicio.
  const flies = [];
  const n = 5 + (Math.random() < .5 ? 1 : 0);   // cinco o seis moscas
  for (let i = 0; i < n; i++) window.setTimeout(function () { flies.push(makeFly()); }, i === 0 ? 0 : i * rnd(250, 600));
  const LIFE = 16000;
  let last = performance.now(), raf = null;
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    flies.forEach(function (f) {
      if (f.dead) return;
      if (f.state !== 'leave' && f.state !== 'squashed' && now - f.born > (f.life || LIFE)) setState(f, 'leave');
      step(f, dt, now);
    });
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  function visit() {
    if (document.hidden) { window.setTimeout(visit, 8000); return; }
    const k = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < k; i++) { const f = makeFly(); f.life = rnd(9000, 14000); flies.push(f); }
    window.setTimeout(visit, rnd(25000, 45000));
  }
  window.setTimeout(visit, LIFE + rnd(12000, 20000));
  // una mosca se espanta si le pasás el mouse cerca
  document.addEventListener('pointermove', function (e) {
    flies.forEach(function (f) {
      if (f.dead || f.state === 'dart' || f.state === 'leave' || f.state === 'squashed') return;
      // se espanta según su reflejo (menos cuando está frotándose las patas o parada)
      const d = Math.hypot(e.clientX - f.x, e.clientY - f.y);
      if (d > 64) return;
      const alert = f.reflex * (f.state === 'rub' ? .35 : f.state === 'pause' ? .6 : 1) * (d < 30 ? 1 : .6);
      if (Math.random() < alert) { f.a = Math.atan2(f.y - e.clientY, f.x - e.clientX); setState(f, 'dart'); }
    });
  }, { passive: true });
})();
