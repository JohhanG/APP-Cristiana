import AsyncStorage from '@react-native-async-storage/async-storage';

export const VERSION_ACTUAL = '1.3.0';

export const CLAVE_STORAGE_NOVEDADES = 'version_novedades_vista_v1_3_0';

export const NOVEDADES_SLIDES = [
  {
    id: 'audio_narracion_voz',
    icono: 'volume-high',
    colorIcono: '#8B5CF6',
    etiqueta: '¡Nuevo! Audio con Voz',
    titulo: 'Escucha Devocionales y la Biblia en Audio',
    descripcion:
      'Ahora puedes escuchar en voz alta cualquier devocional del día, estudio bíblico o capítulo de la Biblia. Incluye control de velocidad (0.8x, 1.0x, 1.2x) y funciona sin conexión a internet.',
    destacado: 'Diseñado para edificar tu fe mientras manejas, caminas o descansas.',
  },
  {
    id: 'cuaderno_predicas',
    icono: 'mic',
    colorIcono: '#F59E0B',
    etiqueta: '¡Nuevo! En el Culto',
    titulo: 'Cuaderno de Prédicas Dominicales',
    descripcion:
      'Toma apuntes estructurados del sermón de tu pastor. Al escribir cualquier cita como "Romanos 8:28", la app la reconoce y te permite insertar el versículo completo con un solo toque.',
    destacado: 'Plantilla de sermón homilético lista para rellenar y compartir por WhatsApp.',
  },
  {
    id: 'biblia_offline_24_7',
    icono: 'book',
    colorIcono: '#10B981',
    etiqueta: 'Biblia 24/7 Sin Internet',
    titulo: 'Biblia RV1960 Completa 100% Offline',
    descripcion:
      'Lee los 66 libros completos de la Biblia (Génesis a Apocalipsis) y sus 1,189 capítulos en cualquier momento y lugar, sin consumir datos móviles ni requerir WiFi.',
    destacado: 'Lectura inmediata 0ms, resaltado en 5 colores y versículos favoritos.',
  },
  {
    id: 'estudios_profundos',
    icono: 'school-outline',
    colorIcono: '#6366F1',
    etiqueta: 'Estudios Exegéticos',
    titulo: 'Análisis Bíblico Profundo y Contextual',
    descripcion:
      'Planes de estudio enriquecidos con contexto de autor, trasfondo histórico y cultural, exégesis en griego/hebreo original (makarios, hypomoné, Shalom), referencias cruzadas y oraciones.',
    destacado: 'Planes completos en Mateo, Santiago, 1 y 2 Pedro, Filipenses y Paz Sobrenatural.',
  },
  {
    id: 'perfil_estudios_organizados',
    icono: 'albums-outline',
    colorIcono: '#EC4899',
    etiqueta: 'Organización en Perfil',
    titulo: 'Mis Estudios Creados y Suscritos',
    descripcion:
      'Panel dividido en 2 pestañas para dar seguimiento a tu avance día a día, reanudar planes con un toque y compartir lecciones con hermanos en la fe.',
    destacado: 'Historial de lecciones, barra visual de progreso y gestión de autor.',
  },
];

/**
 * Comprueba si el usuario ya vio el recorrido de la versión actual.
 */
export async function haVistoUltimasNovedades() {
  try {
    const versionGuardada = await AsyncStorage.getItem(CLAVE_STORAGE_NOVEDADES);
    return versionGuardada === VERSION_ACTUAL;
  } catch (error) {
    return false;
  }
}

/**
 * Guarda en almacenamiento local que el usuario ya completó o cerró el recorrido de novedades.
 */
export async function marcarNovedadesComoVistas() {
  try {
    await AsyncStorage.setItem(CLAVE_STORAGE_NOVEDADES, VERSION_ACTUAL);
  } catch (error) {
    console.warn('Error guardando versión de novedades vista:', error);
  }
}

/**
 * Reinicia el estado para forzar mostrar el panel de novedades nuevamente.
 */
export async function reiniciarEstadoNovedades() {
  try {
    await AsyncStorage.removeItem(CLAVE_STORAGE_NOVEDADES);
  } catch {}
}
