/* quiz.js — "¿Qué tan Björn estás hoy?"
   Siete situaciones sacadas del mundo de la serie. Cada opción suma de 0 (alumno
   modelo) a 3 (muy Björn). Breitner reacciona distinto a cada respuesta. En el
   medio, Dragan llama. Al final, un diagnóstico con sello y texto para compartir. */
(function () {
  'use strict';

  const QUESTIONS = [
    {
      q: 'Tu vecino de arriba arrastra muebles todos los días a las siete de la mañana. Hoy es domingo. Son las 6:58.',
      o: [
        { t: 'Respiro. El ruido es un sonido; el enojo lo pongo yo. Me doy vuelta y sigo durmiendo.', n: 'Breitner asiente. Es exactamente la página 12 de su libro.' },
        { t: 'Le dejo una nota en el ascensor: "Buen domingo. ¿Todo bien con los muebles?". Con un corazón.', n: 'Breitner valora el corazón. El vecino, no.' },
        { t: 'Subo en pantuflas a preguntarle, con mucha calma, qué mueble es. Y a qué hora duerme.', n: 'Breitner anota "límites" con un signo de pregunta.' },
        { t: 'Desde el lunes no hay más ruido. El vecino encontró la paz. Yo lo ayudé a encontrarla.', n: 'Breitner deja de escribir.' }
      ]
    },
    {
      q: 'Grupo de WhatsApp de la familia. Tu tío manda por tercera vez el mismo audio de nueve minutos sobre política. 47 mensajes sin leer.',
      o: [
        { t: 'Silencio el grupo un año. Amar a la familia no es escucharla en tiempo real.', n: 'Breitner sonríe. "Silenciar también es amar."' },
        { t: 'Escucho el audio a 2x y respondo "qué interesante, tío". Es una mentira piadosa.', n: 'Breitner dice que la mentira piadosa cuenta como respiración.' },
        { t: 'Le mando a mi tío un audio de once minutos. Sin decir nada. Solo respiro.', n: 'Breitner reconoce la técnica. No la enseñó él.' },
        { t: 'Organizo el asado del mes que viene. En el campo. Lejos. Sin señal. Voy a estar muy presente.', n: 'Breitner pregunta cuántos vuelven del campo. No responde nadie.' }
      ]
    },
    {
      q: 'Un compañero presenta tu idea en la reunión como si fuera suya. El jefe lo felicita delante de todos.',
      o: [
        { t: 'Lo dejo pasar. Las ideas son del mundo, y el mundo es grande.', n: 'Breitner se emociona. Quiere ponerte de ejemplo en su próximo curso.' },
        { t: 'Después de la reunión le digo, en privado, que me dolió. Practico la honestidad amable.', n: 'Breitner aprueba. Subraya "amable".' },
        { t: 'En la próxima reunión presento su idea. Mejorada. Con su nombre mal escrito.', n: 'Breitner tose y cambia de página.' },
        { t: 'Ya no tengo ese compañero. La empresa mandó flores. Yo también, por las dudas.', n: 'Breitner mira la puerta. Después el reloj. Después la puerta.' }
      ]
    },
    {
      call: true,
      q: 'Tu jefe te está llamando.',
      sub: 'Domingo, 21:40. Breitner dijo "el trabajo termina cuando vos decidís".',
      o: [
        { t: 'Silenciar y seguir respirando', n: 'Breitner: "Muy bien. El teléfono no sos vos."', p: 0 },
        { t: 'Atender', n: 'Breitner: "Nadie te dijo que atiendas."', p: 2 }
      ]
    },
    {
      q: 'Tu suegra te explica, mientras te sirve más comida, cómo deberías criar a tus hijos. Es la cuarta vez hoy.',
      o: [
        { t: 'Como en silencio y agradezco. Ella también fue madre; la escucho como escucho la lluvia.', n: 'Breitner anota "la lluvia" y lo usa después en un libro.' },
        { t: 'Le digo "gracias, lo voy a pensar" con la sonrisa que enseña Breitner. Funciona con todos.', n: 'Breitner se siente orgulloso de esa sonrisa.' },
        { t: 'Le pregunto, con atención plena, por qué su hijo nunca la llama. Y me sirvo más comida.', n: 'Breitner deja el tenedor en la mesa.' },
        { t: 'Le regalo un retiro de silencio de un mes. Ya lo pagué. El lugar es hermoso y muy aislado.', n: 'Breitner pregunta el nombre del retiro. Vos cambiás de tema.' }
      ]
    },
    {
      q: 'Son las 19:55. Tu jefe te pide "quedarte un ratito más". Es el cumpleaños de tu hija. Es la tercera vez este mes.',
      o: [
        { t: 'Le digo que no y me voy. Breitner enseña que "no" es una oración completa.', n: 'Breitner aplaude de pie. Tu hija sopla las velitas con vos.' },
        { t: 'Me quedo media hora y compro una torta en la estación de servicio. Con vela y todo.', n: 'Breitner dice que la torta de estación también es amor. Tu hija no está tan segura.' },
        { t: 'Me quedo. Aprovecho para leer, con mucha calma, el seguro de vida de la empresa. La parte de los beneficiarios.', n: 'Breitner pregunta por qué esa parte. Vos seguís leyendo.' },
        { t: 'Mi jefe ya no pide nada. Hubo una reestructuración. Llegué a tiempo a soplar las velitas.', n: 'Breitner no pregunta qué reestructuración. Prefiere no saber.' }
      ]
    },
    {
      q: 'Tu ex te escribe "¿podemos hablar?" un martes a las 2:14 de la mañana.',
      o: [
        { t: 'No respondo. Lo que necesita decir, lo puede decir a las diez. Duermo en paz.', n: 'Breitner aplaude. "El sueño es un límite."' },
        { t: 'Respondo "mañana". Y me quedo despierto pensando en todas las respuestas que no mandé.', n: 'Breitner dice que eso es progreso. Con cariño.' },
        { t: 'Respondo "claro" y le mando la ubicación de un lugar tranquilo. Cerca del agua.', n: 'Breitner pregunta por qué siempre cerca del agua. Nadie sabe.' },
        { t: 'Le respondo a las 2:15. Ya estoy en la puerta. Muy presente. Muy en el ahora.', n: 'Breitner cierra el cuaderno. Curso terminado.' }
      ]
    }
  ];

  const MAX = QUESTIONS.reduce(function (acc, q) {
    return acc + Math.max.apply(null, q.o.map(function (o, i) { return o.p == null ? i : o.p; }));
  }, 0);

  const PROFILES = [
    { max: 5,  title: 'Alumno modelo',
      text: 'Respirás bien, soltás bien y probablemente te pasan por encima en todas las reuniones. Breitner te pondría de ejemplo. Tu vecino de arriba, también.',
      tip: 'Mirá la serie para ver todo lo que no vas a hacer nunca.' },
    { max: 11, title: 'Practicante con antecedentes',
      text: 'Tenés la teoría clara y una lista mental de gente (tu tío incluido) a la que todavía no le aplicaste ninguna técnica. Subrayamos "todavía".',
      tip: 'Mirá la serie con el cuaderno cerca. Vas a subrayar.' },
    { max: 17, title: 'Abogado de la calma',
      text: 'Resolvés problemas con mucha presencia y poca policía. Tu suegra habla menos, tu compañero cambió de empresa y nadie sabe bien por qué.',
      tip: 'Mirá la serie. Vas a sentir que te leen el diario.' },
    { max: 99, title: 'Certificado Breitner',
      text: 'Ya no necesitás el curso: lo dictás. Tu jefe fue reestructurado, tu ex no volvió a escribir y vos estás, sinceramente, muy en paz.',
      tip: 'Mirá la serie antes de que alguien la mire por vos.' }
  ];

  const LETTERS = ['A', 'B', 'C', 'D'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slide = document.getElementById('quiz-slide');
  if (!slide) return;
  const stepEl = document.getElementById('quiz-step');
  const progress = document.getElementById('quiz-progress');
  const progressWrap = progress.parentElement;
  const result = document.getElementById('quiz-result');
  const stampTitle = document.getElementById('quiz-stamp-title');
  const stampScore = document.getElementById('quiz-stamp-score');
  const resultText = document.getElementById('quiz-result-text');
  const restart = document.getElementById('quiz-restart');
  const viewport = document.querySelector('.quiz__viewport');
  const quizBox = document.getElementById('quiz-app');
  progressWrap.setAttribute('aria-valuemax', String(QUESTIONS.length));

  let index = -1;   // -1 = pantalla de inicio
  let score = 0;
  let locked = false;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* pantalla de inicio */
  function renderIntro() {
    stepEl.textContent = 'Evaluación de ingreso';
    progress.style.transform = 'scaleX(0)';
    slide.innerHTML = '';
    slide.appendChild(el('p', 'quiz__q', 'Cerrá los ojos. Respirá. Ahora abrilos, que hay que leer.'));
    slide.appendChild(el('p', 'quiz__intro', 'Seis situaciones de tu vida cotidiana y una llamada. No hay respuestas correctas: hay respuestas y consecuencias. Toma nota Joschka Breitner, el coach de mindfulness de la serie: un hombre muy sereno que, sin querer, entrenó a un asesino.'));
    const b = el('button', 'btn btn--primary', 'Empezar el curso');
    b.type = 'button';
    b.addEventListener('click', function () { index = 0; transition(render); });
    slide.appendChild(b);
  }

  function render() {
    const item = QUESTIONS[index];
    stepEl.textContent = item.call ? 'Llamada entrante' : 'Situación ' + (index + 1) + ' de ' + QUESTIONS.length + ' · tu vida';
    progress.style.transform = 'scaleX(' + (index / QUESTIONS.length) + ')';
    progressWrap.setAttribute('aria-valuenow', String(index));
    quizBox.classList.toggle('is-call', !!item.call);

    slide.innerHTML = '';
    if (item.call) {
      const phone = el('div', 'quiz__phone');
      phone.appendChild(el('span', 'quiz__phone-icon'));
      phone.appendChild(el('p', 'quiz__phone-name', 'Dragan'));
      phone.appendChild(el('p', 'quiz__phone-sub', item.sub));
      slide.appendChild(phone);
      slide.appendChild(el('p', 'quiz__q', item.q));
    } else {
      slide.appendChild(el('p', 'quiz__q', item.q));
    }

    const list = el('div', item.call ? 'quiz__options quiz__options--call' : 'quiz__options');
    list.setAttribute('role', 'group');
    list.setAttribute('aria-label', 'Opciones');
    item.o.forEach(function (opt, i) {
      const btn = el('button', 'quiz__opt' + (item.call ? (i === 0 ? ' quiz__opt--calm' : ' quiz__opt--answer') : ''));
      btn.type = 'button';
      const b = el('b', null, item.call ? '' : LETTERS[i]);
      const s = el('span', null, opt.t);
      btn.appendChild(b); btn.appendChild(s);
      btn.addEventListener('click', function () { answer(opt.p == null ? i : opt.p, btn, opt.n); });
      list.appendChild(btn);
    });
    slide.appendChild(list);

    const note = el('p', 'quiz__note');
    note.setAttribute('aria-live', 'polite');
    slide.appendChild(note);
  }

  function answer(points, btn, noteText) {
    if (locked) return;
    locked = true;
    score += points;
    slide.querySelectorAll('.quiz__opt').forEach(function (b) { b.disabled = true; });
    btn.classList.add('is-chosen');
    if (window.bloodSplat) {
      const r = btn.getBoundingClientRect();
      const n = 1 + points;
      for (let k = 0; k < n; k++) {
        window.bloodSplat(r.left + window.scrollX + r.width * (.15 + Math.random() * .7), r.top + window.scrollY + r.height * (.2 + Math.random() * .6), 14 + points * 9 + Math.random() * 10);
      }
    }
    const note = slide.querySelector('.quiz__note');
    note.textContent = noteText;
    requestAnimationFrame(function () { note.classList.add('is-on'); });
    window.setTimeout(function () {
      locked = false;
      index += 1;
      if (index >= QUESTIONS.length) { transition(finish); return; }
      transition(render);
    }, reduced ? 400 : 1500);
  }

  /* slide entre pantallas */
  function transition(next) {
    if (reduced) { next(); return; }
    slide.classList.add('is-leaving');
    slide.addEventListener('animationend', function gone() {
      slide.removeEventListener('animationend', gone);
      next();
      slide.classList.remove('is-leaving');
      slide.classList.add('is-entering');
      slide.addEventListener('animationend', function done() {
        slide.classList.remove('is-entering');
        slide.removeEventListener('animationend', done);
      });
      const first = slide.querySelector('.quiz__opt, .btn');
      if (first) first.focus({ preventScroll: true });
    });
  }

  function finish() {
    progress.style.transform = 'scaleX(1)';
    progressWrap.setAttribute('aria-valuenow', String(QUESTIONS.length));
    stepEl.textContent = 'Evaluación completa';
    quizBox.classList.remove('is-call');
    const profile = PROFILES.find(function (p) { return score <= p.max; });
    stampTitle.textContent = profile.title;
    stampScore.textContent = score + ' de ' + MAX + ' puntos cuestionables';
    resultText.textContent = profile.text;

    // consejo + compartir
    let extra = document.getElementById('quiz-extra');
    if (!extra) {
      extra = el('div', 'quiz__extra'); extra.id = 'quiz-extra';
      const tip = el('p', 'quiz__tip'); tip.id = 'quiz-tip';
      const share = el('button', 'btn btn--ghost', 'Copiar mi diagnóstico'); share.type = 'button'; share.id = 'quiz-share';
      share.addEventListener('click', function () {
        const txt = 'Mi diagnóstico en Mindfulness para asesinos: ' + stampTitle.textContent + ' (' + score + '/' + MAX + '). ¿Qué tan Björn estás vos? ' + location.href.split('#')[0];
        const done = function () { share.textContent = 'Copiado. Ahora respirá.'; window.setTimeout(function () { share.textContent = 'Copiar mi diagnóstico'; }, 2500); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done); else done();
      });
      extra.appendChild(tip); extra.appendChild(share);
      resultText.insertAdjacentElement('afterend', extra);
    }
    document.getElementById('quiz-tip').textContent = profile.tip;

    viewport.hidden = true;
    result.hidden = false;
    result.classList.remove('is-stamped');
    void result.offsetWidth;
    result.classList.add('is-stamped');
    restart.focus({ preventScroll: true });
  }

  function reset() {
    index = -1; score = 0; locked = false;
    result.hidden = true;
    result.classList.remove('is-stamped');
    viewport.hidden = false;
    renderIntro();
  }

  restart.addEventListener('click', reset);
  renderIntro();
})();
