/* =========================================================
   FUNCIONES PRINCIPALES
   Proyecto: Postres de Yogur con Frutas
   Archivo: funciones/principal.js
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   VARIABLES GLOBALES
   --------------------------------------------------------- */
const botonHamburguesa  = document.getElementById('boton-hamburguesa');
const menuNavegacion    = document.getElementById('menu-navegacion');
const navegacion        = document.getElementById('navegacion');
const botonScrollArriba = document.getElementById('scroll-arriba');

/* ---------------------------------------------------------
   MENÚ HAMBURGUESA
   --------------------------------------------------------- */
function inicializarMenuHamburguesa() {
  if (!botonHamburguesa || !menuNavegacion) return;

  botonHamburguesa.addEventListener('click', function () {
    const estaAbierto = menuNavegacion.classList.contains('abierto');

    // Alternar estado del menú
    menuNavegacion.classList.toggle('abierto');
    botonHamburguesa.classList.toggle('abierto');

    // Accesibilidad: aria-expanded
    botonHamburguesa.setAttribute('aria-expanded', !estaAbierto);

    // Bloquear scroll del body cuando el menú está abierto
    document.body.style.overflow = estaAbierto ? '' : '';
  });

  // Cerrar menú al hacer clic en un enlace
  const enlacesMenu = menuNavegacion.querySelectorAll('a');
  enlacesMenu.forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      menuNavegacion.classList.remove('abierto');
      botonHamburguesa.classList.remove('abierto');
      botonHamburguesa.setAttribute('aria-expanded', 'false');
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function (evento) {
    const dentroDelMenu       = menuNavegacion.contains(evento.target);
    const dentroDelBoton      = botonHamburguesa.contains(evento.target);
    const menuEstaAbierto     = menuNavegacion.classList.contains('abierto');

    if (!dentroDelMenu && !dentroDelBoton && menuEstaAbierto) {
      menuNavegacion.classList.remove('abierto');
      botonHamburguesa.classList.remove('abierto');
      botonHamburguesa.setAttribute('aria-expanded', 'false');
    }
  });

  // Cerrar menú con tecla Escape
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && menuNavegacion.classList.contains('abierto')) {
      menuNavegacion.classList.remove('abierto');
      botonHamburguesa.classList.remove('abierto');
      botonHamburguesa.setAttribute('aria-expanded', 'false');
      botonHamburguesa.focus();
    }
  });
}

/* ---------------------------------------------------------
   SCROLL SUAVE
   --------------------------------------------------------- */
function inicializarScrollSuave() {
  const enlacesAncla = document.querySelectorAll('a[href^="#"]');

  enlacesAncla.forEach(function (enlace) {
    enlace.addEventListener('click', function (evento) {
      evento.preventDefault();

      const idDestino  = enlace.getAttribute('href');
      const seccionDestino = document.querySelector(idDestino);

      if (!seccionDestino) return;

      const alturaNav    = navegacion ? navegacion.offsetHeight : 70;
      const posicionTop  = seccionDestino.getBoundingClientRect().top + window.scrollY - alturaNav;

      window.scrollTo({
        top: posicionTop,
        behavior: 'smooth'
      });
    });
  });
}

/* ---------------------------------------------------------
   NAVEGACIÓN: RESALTAR SECCIÓN ACTIVA
   --------------------------------------------------------- */
function inicializarNavegacionActiva() {
  const seccionesNavegables = document.querySelectorAll('section[id]');
  const enlacesMenu         = document.querySelectorAll('.nav-menu a');

  if (!seccionesNavegables.length || !enlacesMenu.length) return;

  function actualizarEnlaceActivo() {
    const alturaNav    = navegacion ? navegacion.offsetHeight : 70;
    const posicionScroll = window.scrollY + alturaNav + 80;

    let seccionActual = '';

    seccionesNavegables.forEach(function (seccion) {
      const topSeccion = seccion.offsetTop;
      const alturaSeccion = seccion.offsetHeight;

      if (posicionScroll >= topSeccion && posicionScroll < topSeccion + alturaSeccion) {
        seccionActual = seccion.getAttribute('id');
      }
    });

    enlacesMenu.forEach(function (enlace) {
      enlace.classList.remove('activo');
      const idEnlace = enlace.getAttribute('href').replace('#', '');
      if (idEnlace === seccionActual) {
        enlace.classList.add('activo');
      }
    });
  }

  window.addEventListener('scroll', actualizarEnlaceActivo, { passive: true });
  actualizarEnlaceActivo();
}

/* ---------------------------------------------------------
   BARRA DE NAVEGACIÓN: EFECTO AL HACER SCROLL
   --------------------------------------------------------- */
function inicializarEfectoNavegacion() {
  if (!navegacion) return;

  function actualizarNav() {
    if (window.scrollY > 50) {
      navegacion.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.12)';
    } else {
      navegacion.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
    }
  }

  window.addEventListener('scroll', actualizarNav, { passive: true });
}

/* ---------------------------------------------------------
   BOTÓN SCROLL HACIA ARRIBA
   --------------------------------------------------------- */
function inicializarScrollArriba() {
  if (!botonScrollArriba) return;

  function mostrarOcultarBoton() {
    if (window.scrollY > 400) {
      botonScrollArriba.classList.add('visible');
    } else {
      botonScrollArriba.classList.remove('visible');
    }
  }

  botonScrollArriba.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', mostrarOcultarBoton, { passive: true });
}

/* ---------------------------------------------------------
   ANIMACIONES AL HACER SCROLL (Intersection Observer)
   --------------------------------------------------------- */
function inicializarAnimacionesScroll() {
  // Verificar soporte del navegador
  if (!('IntersectionObserver' in window)) {
    // Si no hay soporte, mostrar todos los elementos directamente
    document.querySelectorAll('.animar-scroll, .animar-scroll-izq, .animar-scroll-der, .animar-scroll-escala')
      .forEach(function (el) { el.classList.add('en-vista'); });
    return;
  }

  const opcionesObservador = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('en-vista');
        observador.unobserve(entrada.target); // Solo animar una vez
      }
    });
  }, opcionesObservador);

  // Observar todos los elementos animables
  const elementosAnimables = document.querySelectorAll(
    '.animar-scroll, .animar-scroll-izq, .animar-scroll-der, .animar-scroll-escala'
  );

  elementosAnimables.forEach(function (elemento) {
    observador.observe(elemento);
  });
}

/* ---------------------------------------------------------
   SECCIÓN: ¿CUÁL PREFIERES?
   --------------------------------------------------------- */
function inicializarPreferencia() {
  const botonesEleccion = document.querySelectorAll('.btn-eleccion');

  botonesEleccion.forEach(function (boton) {
    boton.addEventListener('click', function () {
      const tarjeta           = boton.closest('.preferencia-card');
      const mensajeGracias    = tarjeta ? tarjeta.querySelector('.mensaje-gracias') : null;
      const todasLasTarjetas  = document.querySelectorAll('.preferencia-card');

      if (!tarjeta || !mensajeGracias) return;

      // Quitar estado elegido de todas las tarjetas
      todasLasTarjetas.forEach(function (t) {
        t.classList.remove('elegido');
        const msg = t.querySelector('.mensaje-gracias');
        if (msg) msg.classList.remove('visible');
      });

      // Marcar la tarjeta elegida
      tarjeta.classList.add('elegido');
      mensajeGracias.classList.add('visible');

      // Pequeña vibración/pulso visual
      tarjeta.style.transform = 'scale(1.03)';
      setTimeout(function () {
        tarjeta.style.transform = '';
      }, 200);
    });
  });
}

/* ---------------------------------------------------------
   BOTONES DEL HERO
   --------------------------------------------------------- */
function inicializarBotonesHero() {
  const botonPostres  = document.getElementById('btn-ver-postres');
  const botonDescubrir = document.getElementById('btn-descubrir-sabor');

  if (botonPostres) {
    botonPostres.addEventListener('click', function () {
      const seccionPostres = document.getElementById('postres');
      if (seccionPostres) {
        const alturaNav = navegacion ? navegacion.offsetHeight : 70;
        window.scrollTo({
          top: seccionPostres.offsetTop - alturaNav,
          behavior: 'smooth'
        });
      }
    });
  }

  if (botonDescubrir) {
    botonDescubrir.addEventListener('click', function () {
      const seccionRecomendador = document.getElementById('recomendador');
      if (seccionRecomendador) {
        const alturaNav = navegacion ? navegacion.offsetHeight : 70;
        window.scrollTo({
          top: seccionRecomendador.offsetTop - alturaNav,
          behavior: 'smooth'
        });
      }
    });
  }
}

/* ---------------------------------------------------------
   INICIALIZACIÓN GENERAL
   --------------------------------------------------------- */
function inicializar() {
  inicializarMenuHamburguesa();
  inicializarScrollSuave();
  inicializarNavegacionActiva();
  inicializarEfectoNavegacion();
  inicializarScrollArriba();
  inicializarAnimacionesScroll();
  inicializarPreferencia();
  inicializarBotonesHero();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}
