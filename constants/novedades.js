import AsyncStorage from '@react-native-async-storage/async-storage';

export const VERSION_ACTUAL = '1.2.0';

export const CLAVE_STORAGE_NOVEDADES = 'version_novedades_vista';

export const NOVEDADES_SLIDES = [
  {
    id: 'situacion',
    icono: 'heart-outline',
    colorIcono: '#6366F1',
    etiqueta: 'Nueva experiencia',
    titulo: 'Devocionales según tu situación',
    descripcion:
      'Encuentra reflexiones pastorales cálidas y cercanas según lo que estés viviendo hoy: momentos de ansiedad, familia, trabajo, paz o fe.',
    destacado: 'Inspiración bíblica oportuna y reconfortante para tu caminar.',
  },
  {
    id: 'estudios',
    icono: 'book-outline',
    colorIcono: '#10B981',
    etiqueta: 'Crecimiento bíblico',
    titulo: 'Planes de estudio de 7, 15 y 30 días',
    descripcion:
      'Sumérgete en planes con estructura homilética diaria: lectura bíblica, reflexión profunda, paso práctico de fe y preguntas para meditar.',
    destacado: 'Suscripción fluida y lectura disponible en modo sin conexión.',
  },
  {
    id: 'biblia_genesis',
    icono: 'reader-outline',
    colorIcono: '#F59E0B',
    etiqueta: 'Lectura bíblica',
    titulo: 'Comienza desde el Principio',
    descripcion:
      'Tu lectura bíblica ahora comienza organizadamente desde Génesis 1, guardando siempre tu progreso exacto para que continúes sin perderte.',
    destacado: 'Resalta con colores y guarda versículos favoritos.',
  },
  {
    id: 'rendimiento',
    icono: 'flash-outline',
    colorIcono: '#8B5CF6',
    etiqueta: 'Rendimiento y fluidez',
    titulo: 'Mayor velocidad y estabilidad',
    descripcion:
      'Optimizamos la carga para que sea inmediata y sin interrupciones. Disfruta de una experiencia ágil, fluida y sin demoras en cada pantalla.',
    destacado: 'Respuestas al instante para que te enfoques en tu comunión.',
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
