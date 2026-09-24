# SPEC — Landing "MINDFULNESS PARA ASESINOS"

Proyecto de clase. Landing de una sola página para la serie *Achtsam Morden*
(Netflix, 2024–2026). Este documento es a la vez el prompt de construcción y
el sistema de diseño: todo lo que dice acá se cumple, y lo que no dice acá se
resuelve con el criterio "calma primero, la sangre contamina".

---

## 0. Método de trabajo (no negociable)

1. Ninguna sección se da por terminada por lectura de código. Se levanta el
   HTML en un navegador real (Chrome DevTools MCP o Playwright), se saca
   screenshot a 1440 y a 375, se MIRA y se corrige. Repetir hasta pasar la
   checklist de la sección 9.
2. Antes de codear, leer la sección 8 ("Errores del intento anterior").
   Cualquiera de esos errores en el resultado final = trabajo no entregable.
3. Un solo commit mental: primero el sistema (tokens, tipografía, grano,
   infección), después las secciones. Nunca estilos ad hoc por bloque.

---

## 1. Contexto de la serie

*Mindfulness para asesinos* (orig. *Achtsam Morden*, Netflix, 2 temporadas,
16 episodios, 2024 y 2026). Comedia negra alemana. Björn Diemel (Tom
Schilling) es abogado de la mafia, adicto al trabajo y a punto de perder a su
familia. Hace un curso de mindfulness con el coach Joschka Breitner para
"estar presente"… y aplica cada técnica, literalmente, a resolver sus
problemas. El primero de esos problemas es su cliente, Dragan Sergowicz.

El chiste visual de la serie: estética de folleto de spa (tipografía fina,
mayúsculas con tracking amplio, beige, verde), interrumpida por sangre. La
landing replica ese espíritu, no la fuente exacta (no es pública).

---

## 1b. Arquitectura (2026-09-10): una página por lección
El sitio se separa en seis HTML: `index` (hero + índice del curso),
`personajes`, `trailer`, `temporadas` (desplegable `<details>` animado con
las dos temporadas: poster, sinopsis y los 8 episodios de cada una, los que
dejan consecuencias marcados con una gota), `quiz` y `galeria`. La
navegación es la misma en todas; el link activo es la página actual. Cada
página fija su etapa de infección en `<html data-stage>`: 0, 1, 2, 2, 3, 4.
Al pie de cada lección, un bloque "Siguiente lección". El loader sólo
existe en el inicio; el resto entra con un fade de 520 ms.
Goteo ambiental (todas las páginas): cada 9–17 s una gota crece en el logo
de la derecha, cae hasta el borde inferior y deja una mancha (`#s-stain`,
máx. 6, las viejas se desvanecen). Sin `prefers-reduced-motion`.

## 1c. Capa narrativa (2026-09-10): que den ganas de verla
- Hero: gancho concreto ("Björn Diemel tenía un cliente imposible, una
  esposa harta y una hija a la que no veía. Hizo un curso de mindfulness.
  Ahora tiene un problema menos.") + dos CTAs: "Empezar el curso" y "Ver en
  Netflix". Título que se revela letra por letra antes de la gota.
- "Antes de empezar" (inicio): editorial a dos columnas. Premisa, tono,
  por qué ahora (Top 10 en 66 países, 3ª temporada confirmada), y "Si te
  gustaron Dexter, Barry o Fleabag".
- Cada lección abre con un **ejercicio de Breitner** escrito a máquina al
  entrar en pantalla (cursor rojo). Es el hilo que une las páginas.
- Personajes: "Su ejercicio", una línea con humor negro por tarjeta.
- Quiz: tras el diagnóstico, "Ver cómo le fue a Björn" → Netflix.
- Galería cierra el curso: "Ya hiciste las seis lecciones. Ahora vela."
- Movimiento: listas escalonadas (índice, episodios), salida de página con
  fade, goteo ambiental casi constante.
- Fondo: nunca negro. Las últimas lecciones son papel más sucio (#CBC0AD,
  #C3B6A1) con texto oscuro; la infección la cuenta la sangre acumulada.

## 1d. Sangre en todas partes (v6, 2026-09-10)
- Gota colgando del extremo de la línea de progreso de la navbar; crece con
  el scroll. Subrayado del menú que gotea al pasar.
- Palabras rojas de los títulos: sangran al entrar en pantalla y más al
  pasar el mouse. Botones rojos gotean al hover. Episodios marcados
  chorrean al pasar.
- `window.bloodSplat(x, y, size)` (main.js): salpicadura chica reutilizable.
  La usan: click sobre el papel, cada respuesta del quiz (más gotas y más
  grandes cuanto más Björn), y abrir una foto en la galería (huella).
- Hero: video por YouTube IFrame API con `onError` → si falla, se quita el
  reproductor y queda el still (antes YouTube mostraba un error encima).

## 1e. Sangre v7 + quiz v3
- Quiz v3: siete situaciones de la vida cotidiana del visitante (vecino,
  grupo de WhatsApp, compañero que roba la idea, suegra, carrito, ex a las
  2:14), llamada del jefe en el medio, humor negro parodiando el tono de la
  serie; la intro explica quién es Breitner para quien no la vio.
- Cortina de goteo al cambiar de página (14 chorros que bajan en 520 ms).
- Charco fijo en el borde inferior que se ensancha con cada gota ambiental.
- Rastro fino de gotitas al mover el mouse en todas las páginas.
- Temporadas: el número chorrea al abrirse. Flechas del carrusel salpican.
  Galería: la foto sangra desde abajo al pasar. Mantras: gota al final de
  la línea roja. Loader: la línea suelta una gota antes de abrir.

## 1f. v8: carga y transición
- Loader (sólo inicio, 2,75 s): un círculo de respiración. "Inhalá" mientras
  se expande, "Exhalá" mientras se contrae; al final el círculo se vuelve
  rojo, se condensa en una gota y cae, y la página se abre. Después, la
  gota del hero.
- Transición entre páginas (v13, sutil): impacto chico (R ≈ 6% del lado
  menor), 16 salpicaduras, dos chorreaduras finas, canvas al 82%.
  Antes (v11): impacto moderado que **chorrea**: la
  simulación acepta `dripAt`, `dripGrav`, `dripMax`, `dripLenK`; la
  transición usa gravedad fuerte para que las chorreaduras corran hacia
  abajo en 0,86 s desde el punto del click. Antes (v10): salpicón de la misma simulación del hero
  (`window.BloodSim`, blood.js cargado en todas las páginas) desde el punto
  exacto del click: charco, salpicaduras, bruma y chorreaduras, en multiply
  con `f-blood-soft`, mientras la página se apaga debajo (720 ms). Las
  versiones "telón" y "chorreaduras dibujadas" se descartaron por parecer
  falsas.
- La respiración de bienvenida (loader) aparece sólo la primera vez por
  visita (`sessionStorage`); al volver a Inicio, entra directo con la gota.

## 1g. Pasada de diseño v15
- Temporadas: cada episodio con su fotograma real (TMDB, w342, en
  `assets/img/episodios/`), grilla de 4 columnas; los que dejan
  consecuencias llevan una línea roja abajo y chorrean al pasar.
- Índice: fila "01 Respirar · Estás acá" para que el programa esté completo.
- Tráiler: cuadro a todo el ancho y botón de play más grande.
- Menos aire muerto al final de cada lección.

## 1h. v16 · Entrega (2026-09-23)
- **Fondo que respira**: cinco anillos concéntricos fijos (abajo a la
  derecha) que se expanden y contraen cada 9 s como una app de meditación,
  con "Inhalá / Exhalá" abajo a la izquierda. La infección los tiñe: de
  salvia (inicio) a rojo (galería) vía `color-mix` por `data-stage`. Los
  fondos por etapa son siempre papel (#F3F1EA → #D3C8B3); el oscurecimiento
  se descartó porque no contaba nada.
- **Sangre del hero**: la punta de la gota termina exactamente en el punto
  de impacto (34% de la altura de la S final) y el charco nace ahí
  (`impactPoint()` en blood.js, alto del SVG fijado por JS). Charco
  mediano, 30 salpicaduras, 4 chorreaduras largas hacia abajo. Se quitó
  la barra recta del pie (`.pool-line`).
- **Contacto** (página propia `contacto.html`, link en navbar, pie e índice): formulario
  "Consultorio Breitner" (nombre, email, tipo de problema con pista de
  Breitner, mensaje, promesa). No envía a ningún servidor: valida, guarda
  en `sessionStorage`, sella "Recibido" y salpica.
- **Temporadas**: desplegable de tres ítems. La tercera ("Al borde del
  mundo", 2027, en rodaje) con póster SVG (concha del Camino) y ficha de
  datos verificados: confirmada en enero de 2026, adapta *Achtsam morden am
  Rande der Welt*, rodaje 2026, estreno 2027.
- **Quiz**: seis situaciones + llamada del jefe; se reemplazó el carrito
  por "quedate un ratito más" en el cumpleaños de la hija.
- **SEO**: title y description únicos por página, Open Graph y Twitter
  cards, `theme-color`, JSON-LD (TVSeries en inicio, BreadcrumbList en
  internas), un solo `h1` por página (las internas pasaron de h2 a h1),
  alt descriptivo en galería y fotogramas, `robots.txt` y `sitemap.xml`
  (reemplazar `https://TU-DOMINIO/` al publicar).
- **QA v16.1** (mismo día): en móvil, la fila del desplegable de
  temporadas ponía el ícono +/– en la segunda fila, chocando con la meta
  ("en rodaje"); ahora el ícono va en la fila 1 y la meta debajo, con
  wrap. Hero móvil: el iframe se recorta a 1.55 (sin franja negra arriba)
  y la bajada lleva un velo de papel radial más denso para leerse sobre
  cualquier plano del tráiler.
- **QA v16.2–16.3**: contraste 4.5:1 en eyebrow, etiquetas chicas y marca
  del pie sobre el papel sucio (Lighthouse accesibilidad); el ejercicio a
  máquina reserva su alto con un "fantasma" invisible (sin CLS); entrada
  de página sólo con fade; hero con `youtube-nocookie` (sin cookies de
  terceros); navbar entre 901 y 1140 px oculta la marca derecha; fila del
  desplegable de temporadas apilada hasta 900 px.
- **Lighthouse (móvil, 2026-09-23)**: Contacto 100/100/100; Inicio
  accesibilidad 100, SEO 100, buenas prácticas 77 sólo por una cookie de
  terceros que carga el propio reproductor de YouTube del hero (fuera de
  nuestro control mientras haya embed). Galería y Temporadas revisadas a
  768 sin desbordes.

## 1i. v17 (2026-09-23, noche)
- Pie sin la línea "Proyecto de clase…": quedan los links y la marca.
- Carrusel de personajes **infinito**: el elenco se clona dos veces y el
  scroll vive en el juego del medio (nunca se ve el final ni rebota). Está
  quieto y cada 5,2 s pasa a la siguiente tarjeta con un deslizamiento de
  520 ms; se frena al pasar el mouse, tocar o enfocar. Flechas y teclado
  deslizan una tarjeta. Sin scroll-snap (el rAF manda).
- Hero: el reproductor queda tapado por el still (`.screen.is-loading`)
  desde que se crea hasta que reproduce, y vuelve al segundo 58 un segundo
  y medio antes del final, así nunca aparecen el botón de play ni la
  pantalla de videos relacionados de YouTube. `window.__heroPlayer` expone
  el player para pruebas.
- Menú móvil: siete links con tamaño fluido y `overflow-y: auto` (en
  pantallas bajas se desliza).
- Barrido responsive automático (iframes a 360, 768, 1024, 1180): sin
  desbordes en las siete páginas; a 1180 la marca derecha vuelve con 24 px
  de aire respecto del último link.

## 2. Stack y estructura

HTML5 + CSS3 + JS vanilla. Sin build, sin npm. Se abre `index.html` directo
o con `npx serve`.

```
index.html
css/styles.css
js/main.js        navbar, infección por scroll, reveals, carruseles, tilt, lightbox, trail
js/blood.js       loader + gota + mancha del hero
js/quiz.js        datos y lógica del quiz
assets/img/personajes/   bjorn.jpg katharina.jpg dragan.jpg joschka.jpg sascha.jpg toni.jpg nicole.jpg boris.jpg
assets/img/galeria/      galeria-01.jpg … galeria-08.jpg
assets/img/temporadas/   temporada-01.jpg temporada-02.jpg
README.md  SPEC.md  .gitignore
```

---

## 3. Sistema de diseño

### 3.1 Concepto
Un cuaderno de ejercicios de meditación que alguien usó como evidencia. La
página nace impecable y se va infectando: el papel se ensucia, se oscurece y
el rojo crece. La tensión zen ⟷ gore es el diseño; nada es decorativo.

### 3.2 Tokens (en `:root`, documentados)

```css
/* color */
--papel:         #F3F1EA;   /* base clara                        */
--papel-sucio:   #E6E0D3;   /* etapa 1 de la infección           */
--papel-manchado:#CDC3B2;   /* etapa 2                            */
--humo:          #3B322E;   /* etapa 3 (oscuro cálido, NO gris)   */
--tinta:         #141311;   /* texto / etapa 4                    */
--salvia:        #7C8B6F;   /* mindfulness                        */
--salvia-oscura: #55614B;   /* placeholders, sombras de salvia    */
--sangre:        #7A1620;   /* acento principal                   */
--sangre-densa:  #5A0E16;   /* centro y sombra de mancha          */
--sangre-fresca: #A32332;   /* borde de mancha, uso mínimo        */
--gris-humo:     #6F6B63;   /* texto secundario sobre claro       */
--ceniza:        #B8B2A6;   /* texto secundario sobre oscuro      */

/* tipografía (ratio 1.25, base 17px) */
--fs--1: .8rem;  --fs-0: 1rem;   --fs-1: 1.25rem; --fs-2: 1.563rem;
--fs-3: 1.953rem; --fs-4: 2.441rem; --fs-5: 3.052rem;
--fs-hero: clamp(3rem, 8.6vw, 8.25rem);

/* espacio */
--s-1: 4px; --s-2: 8px; --s-3: 16px; --s-4: 24px; --s-5: 40px; --s-6: 64px; --s-7: 96px;

/* motion */
--ease-out: cubic-bezier(.16, 1, .3, 1);   /* viscoso                  */
--ease-in:  cubic-bezier(.55, 0, 1, .45);  /* caída por gravedad       */
--t-reveal: 450ms;
```

Regla dura: el rojo es acento. Nunca fondo de sección. Nunca más del 20% del
área visible.

### 3.3 Infección (UN sistema, no transiciones sueltas)
`body` tiene `--bg` y `--ink` y hace `transition: background-color .8s,
color .8s`. Cada `<section>` declara `data-stage="0..4"`. Un
IntersectionObserver (threshold .45) setea `data-stage` en `<html>` y el CSS
resuelve:

| stage | sección     | --bg             | --ink    | grano   | rojo visible                          |
|-------|-------------|------------------|----------|---------|---------------------------------------|
| 0     | hero        | papel            | tinta    | .35     | la mancha del logo                    |
| 1     | personajes  | papel-sucio      | tinta    | .45     | halo en hover, 1 palabra              |
| 2     | temporadas  | papel-manchado   | tinta    | .55     | número de temporada, línea de tiempo  |
| 3     | quiz        | humo             | papel    | .70     | progreso, sello                       |
| 4     | galería     | tinta            | papel    | .85     | marcos, lightbox                      |

Los tonos intermedios son CÁLIDOS (van hacia marrón), nunca gris neutro.
La navbar hereda `--bg`/`--ink`.

### 3.4 Fondo
Grano SVG `feTurbulence` (baseFrequency .9, 3 octavas) como `data:` URI en un
`body::before` fijo con `mix-blend-mode: multiply` y `opacity` atada al stage.
Nunca patrón de puntos, nunca gradiente de moda, nunca glassmorphism.

### 3.5b Tipografía del logo (cotejada con el póster oficial, 2026-09-10)
El logo real de la serie NO es una letra fina: es una grotesca geométrica
extra-negra (tipo Gotham Ultra), "MINDFULNESS" en blanco con halo luminoso
(estética de publicidad de bienestar), "PARA" chico, "ASESINOS" en rojo
pesado (#C0161C). Sustituto libre: **Montserrat 800/900**. Se usa en la
marca de la navbar/footer y en el título del hero, que ahora se compone
como el póster: video del tráiler a fondo completo fundido al papel hacia
abajo, título luminoso encima, gota sobre la S. Jost sigue en los títulos
de sección (la voz calma del curso) y Work Sans en el cuerpo.
Fondo con capas: grano + viñeta + "lavado" rojo abajo a la derecha que
crece con la etapa (`--wash`); manchas de borde con parallax al scroll.
Interacción: cada click sobre el papel deja una salpicadura chica.

### 3.5 Tipografía
- Display: **Jost** 200/300 (mayúsculas, tracking .08–.2em) para logo,
  H1/H2 y números. Es "app de meditación"; ese es el chiste.
- Cuerpo: **Work Sans** 400/500, line-height 1.6, `max-width: 62ch`.
- Nunca Jost Light en párrafos. Nunca más de una palabra "con sangre" por
  sección (color `--sangre` + goteo mínimo).

### 3.6 Espaciado
Escala de la sección 3.2. Padding vertical de sección: 160px arriba (hero),
128 (personajes), 112 (temporadas), 96 (quiz), 80 (galería). Mínimo absoluto
48px. Nada toca el borde: gutter lateral `clamp(20px, 6vw, 96px)`.

### 3.7 Estructura que significa algo
Cada sección lleva un eyebrow tipo "Lección 02 · Aceptar a los demás",
porque la página está armada como el curso de Breitner: las lecciones son el
índice de la serie. El número no es decorativo: es el orden del curso.

---

## 4. Animación de sangre (pieza central)

Todo SVG + CSS, sin librerías ni bitmaps.

1. **Gota**: `<path>` vertical con `pathLength="1"`, `stroke-dasharray:1`,
   `stroke-dashoffset` 1→0 en 820ms con `--ease-in`. Termina con un bulbo
   (`<ellipse>`) que aparece al 60%. La gota cae EXACTAMENTE sobre el punto
   donde nace la mancha.
2. **Mancha**: tres capas dentro de un `<g>` que escala de .05 a 1 en
   1100ms con `--ease-out` (viscoso, no elástico):
   - abajo: `--sangre-densa`, `feGaussianBlur` 6, opacidad .7, MISMO centro
     que la capa principal (no corrida);
   - medio: `--sangre`, `feTurbulence fractalNoise baseFrequency="0.018 0.026"
     numOctaves=4` → `feDisplacementMap scale=46`;
   - arriba: borde `--sangre-fresca` stroke 3, opacidad .55, otro seed.
   Más 5–6 satélites (círculos r 3–9) con el mismo filtro y una "lengua"
   que cae por gravedad (`scaleY` 0→1, 1600ms, delay 1300ms).
3. La mancha va DETRÁS del texto con `mix-blend-mode: multiply`, así las
   letras se leen encima como tinta sobre sangre. Nunca tapa la bajada.
4. Ocurre una sola vez al cargar. No loop, no sigue el cursor.
5. Criterio de aceptación (por screenshot): bordes irregulares con lóbulos,
   satélites, ninguna simetría, color de sangre seca sobre papel. Si parece
   círculo, mapa, o pintura de Halloween, está mal.

---

## 5. Secciones

### Navbar (fixed)
Grid `auto 1fr auto`. Izquierda: "MINDFULNESS PARA ASESINOS" limpio.
Derecha: mismo texto con "ASESINOS" en `--sangre` y una gota mínima
colgando de la última S. Centro: Inicio · Personajes · Temporadas · Quiz ·
Galería con indicador activo (línea 2px `--sangre` que crece de izquierda a
derecha). Hereda la infección. Mobile: hamburguesa → panel de página
completa.

### 1. Hero — "Lección 01 · Respirar" (versión inmersiva)
A la derecha, el tráiler oficial de Netflix corre en loop y sin sonido
(iframe de YouTube, `data-video` y `data-start="58"` en `#hero-screen`,
sólo por http). No es un recuadro: el plano lleva una máscara SVG con
borde roto y difuso (turbulencia + desplazamiento + blur) y `mix-blend-mode:
multiply`, así el video se funde con el papel y el grano se ve a través.
Perspectiva leve (`rotateY -9°`) con parallax al mouse. Abierto como
archivo local queda un still de la galería con Ken Burns.
Sangre: la gota cae sobre la S y chorrea sobre el video; 2.6 s después,
sincronizado con el plano en que a Björn le salpica la cara (segundo 62 del
tráiler), dos ráfagas salen desde adentro de la escena hacia la cámara
(gotas que crecen en vuelo, opción `grow` de la simulación) y quedan
chorreando sobre el vidrio. Canvas a DPR 2 con `#f-goo-blood`.

### 1 (base). Hero
Alineado a la izquierda, no centrado. Eyebrow; H1 en dos líneas
("MINDFULNESS" / "PARA ASESINOS"); la gota cae sobre la última S y la
mancha nace ahí. Bajada de 2 líneas máximo:
"Ocho episodios. Un abogado de mafiosos. Un curso de respiración
consciente. Consecuencias bastante poco conscientes."
Debajo, ficha en una línea: Comedia negra · Alemania · 2 temporadas · 16
episodios. Trail de gotas sutil al mover el mouse, sólo en el hero.

### 2. Personajes — "Lección 02 · Aceptar a los demás"
H2: "Personas que deberían respirar **más**". Carrusel scroll-snap de 8
tarjetas (imagen 3:4 arriba, nombre Jost, actor y rol en Work Sans, 2–3
líneas sin spoilers). Botones ← →, teclado, swipe, autoplay 5s pausado en
hover/focus. Tilt 3D ±6° con halo rojo detrás en hover; Ken Burns lento en
la tarjeta activa. Placeholder si falta el archivo: bloque `--salvia-oscura`
con grano, inicial en Jost 200 gigante y una línea "still pendiente".

### 2b. Tráiler — "Lección 03 · Mirar sin apartar la vista"
Cuadro 16:9 con poster (still de la galería, oscurecido) y botón de play.
Al click se inyecta el iframe de YouTube (tráiler oficial de Netflix,
`youtube-nocookie`, autoplay) y 500ms después la pantalla salpica: cuatro
impactos direccionales de la simulación de sangre (derecha, izquierda y
dos por debajo) sobre un canvas que desborda el cuadro, con el filtro
`f-goo-blood`. Nota debajo con link a YouTube por si el embed falla
(abrir como `file://` da error 153).

### 3. Temporadas — "Lección 04 · Soltar"
Dos dossiers asimétricos (poster 2:3 + texto), no dos cards iguales:
T1 (2024, 8 ep.) y T2 (2026, 8 ep.). Número de temporada en Jost 200
enorme en `--sangre`. Sinopsis sin spoilers de final.

### 4b. Quiz v2 (2026-09-10): situaciones de la serie
Pantalla de ingreso ("Cerrá los ojos. Respirá. Ahora abrilos, que hay que
leer."), siete situaciones del mundo de Björn (Dragan a las 3:10, el lugar
seguro, el paquete que respira, Katharina, Sascha y el jardín, la fiscal
Egmann), cada opción con su propia reacción de Breitner. La cuarta es una
**llamada entrante de Dragan** (ícono que vibra, "Silenciar y seguir
respirando" 0 pts / "Atender" 2 pts). Diagnóstico con sello, consejo para
ver la serie y botón "Copiar mi diagnóstico" (portapapeles).

### 4. Quiz — "Lección 04 · Actuar con conciencia"
"¿Qué tan Björn estás hoy?" 6 situaciones cotidianas, 4 opciones que
escalan de respirar (0 pts) a solución Björn-coded (3 pts). Barra de
progreso, slide horizontal entre preguntas, resultado con 4 perfiles y
frase de cierre. El resultado entra como SELLO: scale 2.4→1 en 220ms con
`cubic-bezier(.2,1.4,.4,1)`, shake de 240ms, y una mancha que aparece
detrás. Botón "Volver a respirar" reinicia.

### 5. Galería — "Lección 05 · Observar sin juzgar"
Grilla modular de 8 slots (proporciones variadas, no cuadrícula uniforme).
Lightbox propio: `<dialog>`, fade + scale, Esc, click afuera, ← →, foco
atrapado.

### Footer
Una línea: proyecto de clase, sin afiliación con Netflix, año.

---

## 6. Animaciones (orquestadas)
1. Loader 1.4s: el logo se dibuja con `stroke-dasharray`; al terminar
   dispara la gota.
2. Infección por scroll (3.3).
3. Reveal único: `opacity 0→1` + `translateY(20px→0)`, 450ms, una vez.
4. Carruseles con `scroll-snap`, sin animar `left`/`width`.
5. Quiz: progreso, slide, sello.
6. Trail de gotas en el hero: máx. 12 nodos vivos, desaparecen en 600ms.
7. `prefers-reduced-motion`: sin loader, sin ken burns, sin tilt, sin
   trail; la mancha aparece en estado final; sólo fades de 200ms.

---

## 7. Imágenes reales
Todas las `<img>` con `width`/`height`, `object-fit: cover`, `alt`
descriptivo, `loading="lazy"` salvo la primera, `onerror` que activa el
placeholder. Las fotos incluidas (retratos del elenco, posters en español,
stills de episodios) vienen de TMDB; el README documenta origen, derechos y
nombres de archivo. El elenco verificado: Björn (Tom Schilling), Katharina
(Emily Cox), Dragan (Sascha Alexander Geršak), Breitner (Peter Jordan),
Sascha (Murathan Muslu), Toni (Marc Hosemann), Nicole Egmann (Britta
Hammelstein), Boris (Luca Maric).

### 7e. Salpicaduras de click (v14)
`window.bloodSplat(x, y, tamaño)` ya no estampa el símbolo fijo: crea un
canvas chico en el punto y corre la simulación (charco irregular, 8–17
gotas, bruma, a veces una chorreadura corta), con `f-blood-soft` en
multiply. Cada click es distinto. Versión discreta: 60% del tamaño, 5–9
gotas, opacidad .8, máximo 8 vivos, y cada uno se desvanece solo a los
6–9 s para que la página no se llene. Lo usan el click sobre el papel, el quiz, el lightbox y las
flechas del carrusel.

### 7d. Chorreaduras v12 (lo que delataba el dibujo)
Una línea recta con una bolita al final se lee como dibujo. Ahora cada
chorreadura baja **ondulando** (dos senos con fase propia), el **grosor
varía** a lo largo (más fina en el medio, con nudos suaves), la película
fina es **translúcida** con un centro más denso, la cabeza es una
**lágrima alargada** con núcleo oscuro, y las chorreaduras **se frenan** a
medida que se quedan sin volumen. Opciones por impacto: `dripAt`,
`dripGrav`, `dripMax`, `dripLenK`, `dripW`.

### 7c. Sangre v3 (referencias fotográficas)
Comparada contra fotos reales de salpicaduras (Wikimedia Commons, uso
libre): sobre superficie clara la sangre es **roja y mate**, no bordó
brillante. Cambios: paleta rgba(128,14,20)→rgba(184,40,40) con centro
apenas más oscuro y borde translúcido que se absorbe; sin umbral "goo"
(aplanaba la translucidez); brillo casi nulo (specularConstant .07);
espinas cortas en el borde de las gotas grandes (una sigue la dirección
del vuelo); bruma de gotitas mínimas 3× más abundante; charco como una
sola silueta de lóbulos con un único gradiente de espesor; chorreaduras
con forma cónica y bulbo. Filtro `#f-blood-soft` (sólo irregularidad de
borde + brillo tenue).

### 7b. Sangre realista (versión anterior: simulación)
La mancha del hero no es una forma dibujada: es una **simulación en canvas**
(`js/blood.js`) que corre una sola vez al impacto de la gota.
- Charco: un núcleo + 14 lóbulos que crecen con retraso (ease exponencial
  de 240ms) → silueta irregular con "corona".
- Salpicaduras: 34 partículas con velocidad inicial 260–1600 px/s (pocas
  rápidas, muchas lentas), arrastre viscoso (.9 por frame), dibujadas como
  cápsulas en la dirección del vuelo → lágrimas apuntando hacia afuera.
- Chorreaduras: nacen a los 260ms en el borde inferior y en una salpicadura
  baja; caen con gravedad lenta (máx. 42 px/s) hasta un largo aleatorio.
- El canvas lleva el filtro SVG `#f-goo-blood`: blur + umbral de alpha
  (metaballs que se funden), leve turbulencia en el borde, **borde oscuro**
  (erode + composite out, sangre que se seca), **brillo húmedo**
  (`feSpecularLighting`, constante .5), grano interno. `mix-blend-mode:
  multiply` para que las letras queden encima como tinta.
- `prefers-reduced-motion`: se simulan 260 pasos sin animar y se pinta el
  estado final. Al redimensionar se re-simula al estado final.
- Las manchas de borde (quiz, galería) usan el símbolo SVG `#s-stain` con
  gradiente + filtro `f-blood` (misma receta, sin simulación).

---

## 8. Errores del intento anterior (prohibidos)
- Mancha que parece un mapa o una isla; goteo como barra recta; mancha
  tapando el logo.
- Hero centrado con media pantalla vacía y título chico.
- Fondo intermedio gris barro (interpolar papel→negro pasa por gris: usar
  los tonos cálidos de 3.3).
- Placeholders como bloques verdes de 400px con una silueta genérica.
- Tarjetas idénticas en fila; "cards" con el mismo radio y padding en todo.
- Patrón de puntos como "grano".
- Fuente display en párrafos.

---

## 9. Checklist por screenshot (desktop 1440 + mobile 375)
- [ ] Ningún texto a menos de 20px del borde. Ningún elemento tocándose.
- [ ] Mancha orgánica, del color correcto, detrás del texto.
- [ ] Título del hero ocupa ≥ 55% del ancho en desktop, sin cortar en mobile.
- [ ] Infección visible: 5 fondos distintos y cálidos, texto legible en todos.
- [ ] Carrusel: flechas visibles, foco visible, snap correcto.
- [ ] Quiz: progreso animado, sello dispara, resultado legible.
- [ ] Lightbox: abre, Esc cierra, flechas navegan.
- [ ] Consola sin errores. Sin scroll horizontal.
