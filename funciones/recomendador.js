/* =========================================================
   RECOMENDADOR DE POSTRES
   Proyecto: Postres de Yogur con Frutas
   Archivo: funciones/recomendador.js
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   CONFIGURACIÓN DEL CUESTIONARIO
   --------------------------------------------------------- */
const configuracion = {
  totalPreguntas: 4,
  preguntaActual: 1
};

/* ---------------------------------------------------------
   REFERENCIAS AL DOM
   --------------------------------------------------------- */
const cuestionario          = document.getElementById('cuestionario');
const resultadoContenedor   = document.getElementById('resultado-recomendador');
const botonDescubrir        = document.getElementById('btn-descubrir');
const botonReintentar       = document.getElementById('btn-reintentar');

/* ---------------------------------------------------------
   LÓGICA DE NAVEGACIÓN ENTRE PREGUNTAS
   --------------------------------------------------------- */
function mostrarPregunta(numeroPregunta) {
  const todasLasPreguntas = document.querySelectorAll('.pregunta');
  const puntos            = document.querySelectorAll('.progreso-punto');

  // Ocultar todas las preguntas
  todasLasPreguntas.forEach(function (pregunta) {
    pregunta.classList.remove('visible');
  });

  // Mostrar la pregunta actual
  const preguntaActual = document.getElementById('pregunta-' + numeroPregunta);
  if (preguntaActual) {
    preguntaActual.classList.add('visible');
  }

  // Actualizar los puntos de progreso
  puntos.forEach(function (punto, indice) {
    punto.classList.remove('activo', 'completado');
    if (indice + 1 === numeroPregunta) {
      punto.classList.add('activo');
    } else if (indice + 1 < numeroPregunta) {
      punto.classList.add('completado');
    }
  });

  // Actualizar barra de progreso
  const porcentaje        = ((numeroPregunta - 1) / configuracion.totalPreguntas) * 100;
  const barraRelleno      = document.getElementById('barra-progreso-relleno');
  if (barraRelleno) {
    barraRelleno.style.width = porcentaje + '%';
  }

  configuracion.preguntaActual = numeroPregunta;
}

/* ---------------------------------------------------------
   OBTENER RESPUESTA SELECCIONADA
   --------------------------------------------------------- */
function obtenerRespuesta(nombreGrupo) {
  const opcionSeleccionada = document.querySelector('input[name="' + nombreGrupo + '"]:checked');
  return opcionSeleccionada ? opcionSeleccionada.value : null;
}

/* ---------------------------------------------------------
   NAVEGAR A SIGUIENTE PREGUNTA
   --------------------------------------------------------- */
function irASiguientePregunta(preguntaActual) {
  const nombreGrupo       = 'pregunta' + preguntaActual;
  const respuesta         = obtenerRespuesta(nombreGrupo);

  if (!respuesta) {
    // Indicar visualmente que falta seleccionar una opción
    const preguntaEl = document.getElementById('pregunta-' + preguntaActual);
    if (preguntaEl) {
      preguntaEl.style.animation = 'none';
      preguntaEl.offsetHeight; // Forzar reflow
      preguntaEl.style.animation = '';
      
      // Resaltar las opciones brevemente
      const opciones = preguntaEl.querySelectorAll('.opcion-label');
      opciones.forEach(function (opcion) {
        opcion.style.borderColor = '#E8365D';
        setTimeout(function () {
          opcion.style.borderColor = '';
        }, 800);
      });
    }
    return;
  }

  if (preguntaActual < configuracion.totalPreguntas) {
    mostrarPregunta(preguntaActual + 1);
    // Scroll suave al cuestionario en móvil
    if (cuestionario) {
      cuestionario.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/* ---------------------------------------------------------
   LÓGICA DE RECOMENDACIÓN
   --------------------------------------------------------- */
function calcularRecomendacion(respuestas) {

  // Puntajes para determinar el tipo de producto
  let puntajeVaso   = 0;
  let puntajePaleta = 0;

  // --- Pregunta 1: Tipo de postre ---
  if (respuestas.tipoPosre === 'cremoso') {
    puntajeVaso   += 3;
  } else if (respuestas.tipoPostre === 'frio') {
    puntajePaleta += 3;
  } else if (respuestas.tipoPostre === 'ambos') {
    puntajeVaso   += 1;
    puntajePaleta += 1;
  }

  // --- Pregunta 2: Preferencia de sabor ---
  if (respuestas.sabor === 'dulce') {
    puntajeVaso   += 2;
  } else if (respuestas.sabor === 'equilibrado') {
    puntajeVaso   += 1;
    puntajePaleta += 1;
  } else if (respuestas.sabor === 'frutal') {
    puntajePaleta += 2;
  } else if (respuestas.sabor === 'acido') {
    puntajePaleta += 2;
  }

  // --- Pregunta 4: Textura ---
  if (respuestas.textura === 'cremosa') {
    puntajeVaso   += 3;
  } else if (respuestas.textura === 'trozos') {
    puntajeVaso   += 2;
    puntajePaleta += 1;
  } else if (respuestas.textura === 'crujiente') {
    puntajeVaso   += 3; // La granola da textura crujiente en el vaso
  } else if (respuestas.textura === 'congelada') {
    puntajePaleta += 3;
  }

  // Determinar producto
  let producto;
  if (puntajeVaso > puntajePaleta) {
    producto = 'vaso';
  } else if (puntajePaleta > puntajeVaso) {
    producto = 'paleta';
  } else {
    // Empate: decidir por textura
    producto = (respuestas.textura === 'congelada' || respuestas.textura === 'trozos')
      ? 'paleta'
      : 'vaso';
  }

  // Determinar combinación de sabores
  let saboresCombinacion = calcularSabores(respuestas.fruta);

  return {
    producto: producto,
    sabores: saboresCombinacion
  };
}

/* ---------------------------------------------------------
   CALCULAR COMBINACIÓN DE SABORES
   --------------------------------------------------------- */
function calcularSabores(frutaElegida) {
  const combinaciones = {
    'fresa':    { frutas: ['🍓 Fresa'],                          nombre: 'Fresa',                  clave: 'fresa' },
    'platano':  { frutas: ['🍌 Plátano'],                        nombre: 'Plátano',                clave: 'platano' },
    'arandano': { frutas: ['🫐 Arándano'],                        nombre: 'Arándano',               clave: 'arandano' },
    'todas':    { frutas: ['🍓 Fresa', '🍌 Plátano', '🫐 Arándano'], nombre: 'Triple Fruta',          clave: 'triple' }
  };

  // Combinaciones extra basadas en preferencias de sabor
  if (frutaElegida && combinaciones[frutaElegida]) {
    return combinaciones[frutaElegida];
  }

  return combinaciones['todas'];
}

/* ---------------------------------------------------------
   NOMBRES DESCRIPTIVOS DE LOS RESULTADOS
   --------------------------------------------------------- */
function obtenerNombreProducto(producto, claveSabor) {
  const nombres = {
    vaso: {
      fresa:    'Vaso Fresa',
      platano:  'Vaso Plátano',
      arandano: 'Vaso Arándano',
      triple:   'Vaso Triple Fruta'
    },
    paleta: {
      fresa:    'Paleta de Fresa',
      platano:  'Paleta de Plátano',
      arandano: 'Paleta de Arándano',
      triple:   'Paleta Triple Fruta'
    }
  };

  if (nombres[producto] && nombres[producto][claveSabor]) {
    return nombres[producto][claveSabor];
  }

  return producto === 'vaso' ? 'Vaso de Yogur con Frutas' : 'Paleta de Yogur con Frutas';
}

/* ---------------------------------------------------------
   OBTENER DESCRIPCIÓN DEL RESULTADO
   --------------------------------------------------------- */
function obtenerDescripcion(producto, claveSabor) {
  const descripcionesVaso = {
    fresa:    'Una combinación cremosa de yogur y fresa, con su sabor frutal característico y color atractivo.',
    platano:  'Un vaso suave y cremoso con el dulzor natural del plátano como protagonista.',
    arandano: 'Una combinación cremosa con el sabor característico y el color vibrante del arándano.',
    triple:   'Una combinación cremosa con diferentes sabores y texturas: fresa, plátano y arándano en un solo vaso.'
  };

  const descripcionesPaleta = {
    fresa:    'Una paleta fría y frutal con el sabor inconfundible de la fresa y pequeños trozos visibles.',
    platano:  'Una paleta refrescante con el dulzor natural del plátano, suave y cremosa al paladar.',
    arandano: 'Una paleta fría con el color y el sabor característicos del arándano.',
    triple:   'Una alternativa fría y frutal con fresa, plátano y arándano en cada mordida.'
  };

  const descripciones = producto === 'vaso' ? descripcionesVaso : descripcionesPaleta;
  return descripciones[claveSabor] || 'Una deliciosa combinación de yogur y frutas.';
}

/* ---------------------------------------------------------
   MOSTRAR RESULTADO
   --------------------------------------------------------- */
function mostrarResultado(recomendacion) {
  if (!resultadoContenedor || !cuestionario) return;

  const { producto, sabores } = recomendacion;
  const nombreProducto = obtenerNombreProducto(producto, sabores.clave);
  const descripcion    = obtenerDescripcion(producto, sabores.clave);

  // Emojis y colores por producto
  const esVaso    = producto === 'vaso';
  const emojiProducto   = esVaso ? '🥗' : '🍦';
  const colorProducto   = esVaso ? '#E8365D' : '#5C3D8F';

  // Construir etiquetas de sabores
  const etiquetasSabores = sabores.frutas.map(function (fruta) {
    return '<span class="etiqueta" style="background: rgba(232,54,93,0.1); color: #E8365D; margin: 4px;">' + fruta + '</span>';
  }).join('');

  // Rellenar el contenedor de resultado
  resultadoContenedor.innerHTML = `
    <span class="resultado-producto-icono" role="img" aria-label="${esVaso ? 'Vaso de yogur' : 'Paleta congelada'}">${emojiProducto}</span>
    <p class="resultado-etiqueta">Tu elección podría ser</p>
    <h3 class="resultado-titulo" style="color: ${colorProducto};">${nombreProducto}</h3>
    <div class="resultado-sabores" aria-label="Sabores recomendados">
      ${etiquetasSabores}
    </div>
    <p class="resultado-descripcion">${descripcion}</p>
    <p class="resultado-descargo">
      ⚠️ Esta recomendación se basa únicamente en preferencias de sabor y presentación,
      no constituye una recomendación nutricional o médica.
    </p>
    <button id="btn-reintentar" class="btn btn-contorno" aria-label="Volver a responder el cuestionario">
      🔄 Volver a intentar
    </button>
  `;

  // Ocultar cuestionario y mostrar resultado
  cuestionario.style.display = 'none';
  resultadoContenedor.classList.add('visible');

  // Agregar evento al nuevo botón de reintentar
  const nuevoBotonReintentar = document.getElementById('btn-reintentar');
  if (nuevoBotonReintentar) {
    nuevoBotonReintentar.addEventListener('click', reiniciarCuestionario);
  }

  // Scroll al resultado
  resultadoContenedor.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------------------------------------------------------
   REINICIAR CUESTIONARIO
   --------------------------------------------------------- */
function reiniciarCuestionario() {
  if (!resultadoContenedor || !cuestionario) return;

  // Ocultar resultado
  resultadoContenedor.classList.remove('visible');

  // Mostrar cuestionario
  cuestionario.style.display = '';

  // Limpiar todas las respuestas
  const todosLosRadios = cuestionario.querySelectorAll('input[type="radio"]');
  todosLosRadios.forEach(function (radio) {
    radio.checked = false;
  });

  // Volver a la primera pregunta
  mostrarPregunta(1);

  // Scroll al cuestionario
  cuestionario.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------------------------------------------------------
   PROCESAR Y ENVIAR CUESTIONARIO
   --------------------------------------------------------- */
function procesarCuestionario() {
  // Verificar que todas las preguntas estén respondidas
  const respuestas = {
    tipoPostre: obtenerRespuesta('pregunta1'),
    sabor:      obtenerRespuesta('pregunta2'),
    fruta:      obtenerRespuesta('pregunta3'),
    textura:    obtenerRespuesta('pregunta4')
  };

  // Verificar respuestas faltantes
  const preguntasSinResponder = [];
  if (!respuestas.tipoPostre) preguntasSinResponder.push(1);
  if (!respuestas.sabor)      preguntasSinResponder.push(2);
  if (!respuestas.fruta)      preguntasSinResponder.push(3);
  if (!respuestas.textura)    preguntasSinResponder.push(4);

  if (preguntasSinResponder.length > 0) {
    // Ir a la primera pregunta sin responder
    mostrarPregunta(preguntasSinResponder[0]);
    return;
  }

  // Calcular y mostrar recomendación
  const recomendacion = calcularRecomendacion(respuestas);
  mostrarResultado(recomendacion);
}

/* ---------------------------------------------------------
   INICIALIZAR BOTONES DE NAVEGACIÓN DEL CUESTIONARIO
   --------------------------------------------------------- */
function inicializarBotonesNavegacion() {
  // Botones "Siguiente" de cada pregunta
  for (let i = 1; i <= configuracion.totalPreguntas - 1; i++) {
    const botonSiguiente = document.getElementById('btn-siguiente-' + i);
    if (botonSiguiente) {
      // Usamos una IIFE para capturar el valor de i en cada iteración
      (function (numeroPregunta) {
        botonSiguiente.addEventListener('click', function () {
          irASiguientePregunta(numeroPregunta);
        });
      })(i);
    }
  }

  // Botones "Anterior" de cada pregunta
  for (let j = 2; j <= configuracion.totalPreguntas; j++) {
    const botonAnterior = document.getElementById('btn-anterior-' + j);
    if (botonAnterior) {
      (function (numeroPregunta) {
        botonAnterior.addEventListener('click', function () {
          mostrarPregunta(numeroPregunta - 1);
        });
      })(j);
    }
  }

  // Botón "Descubrir mi postre"
  const botonFinal = document.getElementById('btn-descubrir');
  if (botonFinal) {
    botonFinal.addEventListener('click', procesarCuestionario);
  }

  // Botón de reintentar inicial (si existe en el HTML)
  if (botonReintentar) {
    botonReintentar.addEventListener('click', reiniciarCuestionario);
  }
}

/* ---------------------------------------------------------
   AVANZAR AUTOMÁTICAMENTE AL SELECCIONAR UNA OPCIÓN
   --------------------------------------------------------- */
function inicializarAvanceAutomatico() {
  // En preguntas 1-3, avanzar automáticamente al elegir
  for (let i = 1; i <= configuracion.totalPreguntas - 1; i++) {
    const preguntaEl = document.getElementById('pregunta-' + i);
    if (!preguntaEl) continue;

    const radios = preguntaEl.querySelectorAll('input[type="radio"]');
    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        // Pequeño retraso para mostrar la selección visualmente
        setTimeout(function () {
          irASiguientePregunta(i);
        }, 400);
      });
    });
  }
}

/* ---------------------------------------------------------
   INICIALIZACIÓN DEL RECOMENDADOR
   --------------------------------------------------------- */
function inicializarRecomendador() {
  // Verificar que existan los elementos necesarios
  if (!cuestionario) return;

  // Mostrar la primera pregunta
  mostrarPregunta(1);

  // Inicializar botones de navegación
  inicializarBotonesNavegacion();

  // Avance automático al seleccionar
  inicializarAvanceAutomatico();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarRecomendador);
} else {
  inicializarRecomendador();
}
