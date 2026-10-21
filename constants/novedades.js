import AsyncStorage from '@react-native-async-storage/async-storage';

export const VERSION_ACTUAL = '1.2.0';

export const CLAVE_STORAGE_NOVEDADES = 'version_novedades_vista_v1_2_0_completa';

export const NOVEDADES_SLIDES = [
  {
    id: 'biblia_offline_24_7',
    icono: 'book',
    colorIcono: '#10B981',
    etiqueta: 'Biblia 24/7 Sin Internet',
    titulo: 'Biblia RV1960 Completa 100% Offline',
    descripcion:
      'Ahora puedes leer los 66 libros completos de la Biblia (Génesis a Apocalipsis) y sus 1,189 capítulos sin necesidad de conexión a internet ni consumo de datos móviles.',
    destacado: 'Lectura inmediata 0ms, disponible las 24 horas del día en cualquier lugar.',
  },
  {
    id: 'estudios_profundos',
    icono: 'school-outline',
    colorIcono: '#6366F1',
    etiqueta: 'Estudios Exegéticos Profundos',
    titulo: 'Análisis Bíblico Profundo y Contextual',
    descripcion:
      'Estudios enriquecidos con contexto de autor, trasfondo histórico y cultural, exégesis en griego/hebreo original (makarios, hypomoné, Shalom), referencias cruzadas y oraciones guiadas.',
    destacado: 'Planes completos en Mateo, Santiago, 1 y 2 Pedro, Filipenses y Paz Sobrenatural.',
  },
  {
    id: 'perfil_estudios_organizados',
    icono: 'albums-outline',
    colorIcono: '#F59E0B',
    etiqueta: 'Organización en Perfil',
    titulo: 'Mis Estudios Creados y Suscritos',
    descripcion:
      'Nuevo panel dividido en 2 pestañas organizadas para dar seguimiento a tu avance diario, reanudar planes bíblicos con un toque y compartir lecciones con hermanos en la fe.',
    destacado: 'Historial de lecciones, barra visual de progreso y gestión de autor.',
  },
  {
    id: 'devocionales_extensos',
    icono: 'heart-outline',
    colorIcono: '#EC4899',
    etiqueta: 'Comunión Diaria',
    titulo: 'Devocionales Pastorales Extensos',
    descripcion:
      'Reflexiones diarias enriquecidas de 14 a 22 párrafos, con profunda aplicación práctica a tu vida familiar, laboral y espiritual, complementadas con oraciones guiadas para cada día.',
    destacado: 'Diseñados para nutrir tu alma sin prisa, con tipografía cómoda y párrafos bien espaciados.',
  },
  {
    id: 'actualizaciones_ota',
    icono: 'flash-outline',
    colorIcono: '#8B5CF6',
    etiqueta: 'Actualizaciones Instantáneas',
    titulo: 'Actualizaciones al Instante sin Reinstalar',
    descripcion:
      'La app se actualiza automáticamente por el aire (OTA) a través de EAS Update sin que tengas que descargar ni instalar nuevos archivos APK manualmente.',
    destacado: 'Tu aplicación siempre moderna, rápida y al día con las últimas mejoras.',
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
