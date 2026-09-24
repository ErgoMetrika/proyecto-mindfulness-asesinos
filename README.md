# Mindfulness para asesinos — landing

Landing de una sola página para la serie *Mindfulness para asesinos*
(*Achtsam Morden*, Netflix, 2024–2026). Proyecto de clase. HTML, CSS y
JavaScript vanilla, sin frameworks ni build.

El diseño completo (concepto, tokens, animación de sangre, secciones y
checklist de calidad) está en [SPEC.md](SPEC.md).

## Cómo abrirlo

1. Clonar o descargar el repo.
2. Abrir `index.html` en Chrome, Edge, Firefox o Safari.

Opcional, con servidor local:

```bash
npx serve .
```

Las fuentes (Jost y Work Sans) se cargan desde Google Fonts. Sin internet
la página usa las fuentes de sistema de respaldo.

## Imágenes

Las fotos incluidas en `assets/img/` son material promocional de la serie
(retratos del elenco, stills y posters) tomadas de la base pública de
The Movie Database (TMDB), donde se publica el material de prensa. Son
imágenes con derechos de Netflix / Constantin Film: se usan acá sólo con
fines educativos, para un trabajo de clase. Si el proyecto se publica fuera
de ese ámbito, reemplazarlas o pedir autorización.

Para cambiar una imagen, sobrescribir el archivo con el mismo nombre:

`assets/img/personajes/` (retratos, proporción 3:4)

- `bjorn.jpg` — Björn Diemel (Tom Schilling)
- `katharina.jpg` — Katharina Diemel (Emily Cox)
- `dragan.jpg` — Dragan Sergowicz (Sascha Alexander Geršak)
- `joschka.jpg` — Joschka Breitner (Peter Jordan)
- `sascha.jpg` — Sascha (Murathan Muslu)
- `toni.jpg` — Toni (Marc Hosemann)
- `nicole.jpg` — Nicole Egmann (Britta Hammelstein)
- `boris.jpg` — Boris (Luca Maric)

`assets/img/temporadas/` (posters 2:3): `temporada-01.jpg`, `temporada-02.jpg`

`assets/img/episodios/` (fotogramas 16:9, chicos): `t1-01.jpg` … `t1-08.jpg`,
`t2-01.jpg` … `t2-08.jpg`

`assets/img/galeria/` (stills 16:9): `galeria-01.jpg` … `galeria-08.jpg`
(01, 06 y 08 se muestran anchos; 03 se muestra alto)

Si un archivo falta, el slot muestra un placeholder diseñado, nunca un
ícono roto. El elenco está verificado contra Wikipedia y TMDB.

## Estructura (sitio multipágina: una página por lección)

```
index.html         Lección 01 · hero inmersivo + índice del curso
personajes.html    Lección 02 · carrusel de personajes
trailer.html       Lección 03 · tráiler oficial (salpica al dar play)
temporadas.html    Lección 04 · desplegable con las tres temporadas (la 3ª, en rodaje)
quiz.html          Lección 05 · quiz "¿Qué tan Björn estás hoy?"
galeria.html       Lección 06 · galería con lightbox
contacto.html      Consultorio · formulario de contacto
css/styles.css     tokens, infección por etapa, todas las secciones
js/blood.js        simulación de sangre (hero y tráiler)
js/quiz.js         preguntas, perfiles y lógica del quiz
js/main.js         navbar, reveals, carrusel, tilt, desplegable, goteo ambiental, lightbox
assets/img/        personajes/ temporadas/ galeria/
robots.txt         SEO: permite indexar; apunta al sitemap
sitemap.xml        SEO: las seis páginas (reemplazar https://TU-DOMINIO/ al publicar)
SPEC.md            sistema de diseño y brief completo
```

Cada página tiene su etapa de "infección" (el fondo se oscurece lección a
lección), un bloque "Siguiente lección" al pie, y un goteo ambiental: cada
tanto cae una gota del logo y queda una mancha al pie de la pantalla.

## Qué hace la página

- Hero inmersivo: el tráiler oficial de Netflix corre en loop y sin sonido
  fundido en el papel (máscara de borde roto + multiply), con parallax; la
  sangre sale de adentro de la escena hacia el espectador y queda
  chorreando. Necesita http (con `npx serve` o publicado); como archivo
  local muestra un still. El id del video y el segundo de inicio están en
  `#hero-screen` (`data-video`, `data-start`).
- Loader que dibuja el logo y suelta una gota de sangre sobre la última S
  del título. La mancha es SVG con `feTurbulence` + `feDisplacementMap`,
  tres capas, satélites y una lengua que cae por gravedad. Ocurre una vez.
- "Infección" por scroll: cinco etapas de fondo (papel → papel sucio →
  papel manchado → humo → tinta) controladas por `data-stage` en `<html>`.
- Carrusel de personajes con scroll-snap, botones, teclado, swipe,
  autoplay pausable, tilt 3D y Ken Burns en la tarjeta activa.
- Sección Tráiler: embebe el tráiler oficial de Netflix desde YouTube
  (id en `data-video` del bloque `#trailer-player`; hoy es el de la
  temporada 1 doblado al castellano, `8umozeMUssc`; alternativas probadas
  que también se pueden embeber: `_VjrdtMjnEs`, `xTGPlPDZRdA`, y el
  oficial de Netflix en inglés `0fMsAQ83KKc`). Al dar play, la pantalla "salpica" sangre
  hacia la página con la misma simulación del hero. El reproductor de
  YouTube necesita abrir la página por http (con `npx serve` o publicada);
  abierta como archivo local muestra error 153 y queda el link a YouTube.
- Quiz de seis preguntas con barra de progreso, slide entre preguntas y
  resultado que entra como sello de tinta.
- Galería modular con lightbox propio (Esc, click afuera, flechas).
- Contacto (`contacto.html`): formulario "Consultorio Breitner" que
  valida y sella "Recibido" sin enviar datos a ningún servidor (proyecto
  de clase). Para conectarlo a un servicio real, poner `action` y `method`
  en el `<form>` y quitar el `preventDefault` de `main.js` (sección 8).
- SEO: title y description por página, Open Graph/Twitter, JSON-LD, un h1
  por página, alt descriptivos, `robots.txt` y `sitemap.xml`. Antes de
  publicar, reemplazar `https://TU-DOMINIO/` en ambos archivos y, si se
  quiere, `og:image` por una URL absoluta.
- Fondo que respira: anillos concéntricos que se expanden cada 9 s y se
  tiñen de rojo lección a lección.
- `prefers-reduced-motion` respetado en todo.

## Créditos

Proyecto de clase sin afiliación con Netflix ni con los titulares de la
serie. Código y diseño con fines educativos.
