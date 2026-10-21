import * as Speech from 'expo-speech';

// Variables de estado interno para el reproductor de voz
let colaFragmentos = [];
let indiceActual = 0;
let reproduciendoActivo = false;
let velocidadActual = 0.95; // Velocidad pausada y reflexiva
let callbackProgreso = null;
let callbackFin = null;
let callbackInicio = null;

/**
 * Divide textos largos (como devocionales de 20 párrafos) en fragmentos naturales
 * para que el motor nativo TTS de Android/iOS nunca se congele ni corte la narración.
 */
function dividirEnFragmentos(texto) {
  if (!texto) return [];

  // Limpiar caracteres extra y dividir por saltos de línea o puntos
  const parrafos = texto
    .replace(/\r/g, '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const fragmentosFinales = [];

  for (const parrafo of parrafos) {
    if (parrafo.length <= 350) {
      fragmentosFinales.push(parrafo);
    } else {
      // Si el párrafo es muy extenso, dividir por oraciones
      const oraciones = parrafo.split(/(?<=[.?!])\s+/);
      let buffer = '';
      for (const oracion of oraciones) {
        if ((buffer + ' ' + oracion).length > 350) {
          if (buffer.trim()) fragmentosFinales.push(buffer.trim());
          buffer = oracion;
        } else {
          buffer = buffer ? buffer + ' ' + oracion : oracion;
        }
      }
      if (buffer.trim()) fragmentosFinales.push(buffer.trim());
    }
  }

  return fragmentosFinales;
}

/**
 * Inicia la narración por voz de un texto bíblico o devocional.
 * @param {string} texto - Contenido a narrar
 * @param {object} opciones - Configuración de voz y callbacks
 */
export async function reproducirVoz(texto, opciones = {}) {
  try {
    detenerVoz();

    if (!texto || !texto.trim()) return;

    colaFragmentos = dividirEnFragmentos(texto);
    if (colaFragmentos.length === 0) return;

    indiceActual = 0;
    reproduciendoActivo = true;
    velocidadActual = opciones.velocidad || 0.95;

    callbackInicio = opciones.onInicio || null;
    callbackProgreso = opciones.onProgreso || null;
    callbackFin = opciones.onFin || null;

    if (callbackInicio) callbackInicio();

    reproducirSiguienteFragmento();
  } catch (error) {
    console.warn('Error al iniciar narración de voz:', error);
    reproduciendoActivo = false;
    if (opciones.onError) opciones.onError(error);
  }
}

function reproducirSiguienteFragmento() {
  if (!reproduciendoActivo || indiceActual >= colaFragmentos.length) {
    reproduciendoActivo = false;
    if (callbackFin) callbackFin();
    return;
  }

  const fragmento = colaFragmentos[indiceActual];
  const progresoPorcentaje = Math.round(((indiceActual + 1) / colaFragmentos.length) * 100);

  if (callbackProgreso) {
    callbackProgreso({
      indice: indiceActual,
      total: colaFragmentos.length,
      porcentaje: progresoPorcentaje,
      textoActual: fragmento,
    });
  }

  Speech.speak(fragmento, {
    language: 'es-ES',
    pitch: 1.0,
    rate: velocidadActual,
    onDone: () => {
      if (reproduciendoActivo) {
        indiceActual++;
        reproducirSiguienteFragmento();
      }
    },
    onStopped: () => {
      reproduciendoActivo = false;
    },
    onError: (err) => {
      console.warn('Error en fragmento de voz:', err);
      // Avanzar al siguiente si hubo un fallo en un caracter
      if (reproduciendoActivo) {
        indiceActual++;
        reproducirSiguienteFragmento();
      }
    },
  });
}

/**
 * Detiene la reproducción de voz actual de forma inmediata.
 */
export function detenerVoz() {
  reproduciendoActivo = false;
  colaFragmentos = [];
  indiceActual = 0;
  try {
    Speech.stop();
  } catch (e) {}
}

/**
 * Cambia la velocidad de narración al vuelo (0.8x, 1.0x, 1.25x).
 */
export function cambiarVelocidadVoz(nuevaVelocidad) {
  velocidadActual = nuevaVelocidad;
  if (reproduciendoActivo) {
    try {
      Speech.stop();
      reproducirSiguienteFragmento();
    } catch (e) {}
  }
}

/**
 * Verifica si el motor está hablando en este momento.
 */
export async function estaHablandoVoz() {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
}
