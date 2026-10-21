// Índice y cargador perezoso para la Biblia Reina-Valera 1960 (100% Offline)
// No carga todos los libros en memoria al inicio: sólo el libro que se esté leyendo.

const LIBROS_RV1960 = {
  1: () => require('./rv1960/1.json'),
  2: () => require('./rv1960/2.json'),
  3: () => require('./rv1960/3.json'),
  4: () => require('./rv1960/4.json'),
  5: () => require('./rv1960/5.json'),
  6: () => require('./rv1960/6.json'),
  7: () => require('./rv1960/7.json'),
  8: () => require('./rv1960/8.json'),
  9: () => require('./rv1960/9.json'),
  10: () => require('./rv1960/10.json'),
  11: () => require('./rv1960/11.json'),
  12: () => require('./rv1960/12.json'),
  13: () => require('./rv1960/13.json'),
  14: () => require('./rv1960/14.json'),
  15: () => require('./rv1960/15.json'),
  16: () => require('./rv1960/16.json'),
  17: () => require('./rv1960/17.json'),
  18: () => require('./rv1960/18.json'),
  19: () => require('./rv1960/19.json'),
  20: () => require('./rv1960/20.json'),
  21: () => require('./rv1960/21.json'),
  22: () => require('./rv1960/22.json'),
  23: () => require('./rv1960/23.json'),
  24: () => require('./rv1960/24.json'),
  25: () => require('./rv1960/25.json'),
  26: () => require('./rv1960/26.json'),
  27: () => require('./rv1960/27.json'),
  28: () => require('./rv1960/28.json'),
  29: () => require('./rv1960/29.json'),
  30: () => require('./rv1960/30.json'),
  31: () => require('./rv1960/31.json'),
  32: () => require('./rv1960/32.json'),
  33: () => require('./rv1960/33.json'),
  34: () => require('./rv1960/34.json'),
  35: () => require('./rv1960/35.json'),
  36: () => require('./rv1960/36.json'),
  37: () => require('./rv1960/37.json'),
  38: () => require('./rv1960/38.json'),
  39: () => require('./rv1960/39.json'),
  40: () => require('./rv1960/40.json'),
  41: () => require('./rv1960/41.json'),
  42: () => require('./rv1960/42.json'),
  43: () => require('./rv1960/43.json'),
  44: () => require('./rv1960/44.json'),
  45: () => require('./rv1960/45.json'),
  46: () => require('./rv1960/46.json'),
  47: () => require('./rv1960/47.json'),
  48: () => require('./rv1960/48.json'),
  49: () => require('./rv1960/49.json'),
  50: () => require('./rv1960/50.json'),
  51: () => require('./rv1960/51.json'),
  52: () => require('./rv1960/52.json'),
  53: () => require('./rv1960/53.json'),
  54: () => require('./rv1960/54.json'),
  55: () => require('./rv1960/55.json'),
  56: () => require('./rv1960/56.json'),
  57: () => require('./rv1960/57.json'),
  58: () => require('./rv1960/58.json'),
  59: () => require('./rv1960/59.json'),
  60: () => require('./rv1960/60.json'),
  61: () => require('./rv1960/61.json'),
  62: () => require('./rv1960/62.json'),
  63: () => require('./rv1960/63.json'),
  64: () => require('./rv1960/64.json'),
  65: () => require('./rv1960/65.json'),
  66: () => require('./rv1960/66.json'),
};

/**
 * Obtiene los versículos de un capítulo completo de la RV1960 de forma local y 100% offline.
 * @param {number} libroNumero - Número del libro bíblico (1..66)
 * @param {number} capitulo - Número del capítulo
 * @returns {Array<{ numero: number, texto: string }> | null}
 */
export function obtenerCapituloLocalRV1960(libroNumero, capitulo) {
  const loader = LIBROS_RV1960[libroNumero];
  if (!loader) return null;
  try {
    const libroData = loader();
    const versosArray = libroData[String(capitulo)] || libroData[capitulo];
    if (!versosArray || !Array.isArray(versosArray)) return null;
    return versosArray.map((texto, idx) => ({
      numero: idx + 1,
      texto,
    }));
  } catch (err) {
    console.log('Error al cargar libro local RV1960:', err);
    return null;
  }
}
