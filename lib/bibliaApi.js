// Cliente para la API pública de bolls.life (gratuita, sin necesidad de clave)
// Traducción usada: Reina-Valera 1960 (RV1960)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Caché en memoria ultrarrápida (0ms de latencia en visitas repetidas)
const CACHE_CAPITULOS = new Map();
const CACHE_VERSICULOS = new Map();

const LIBROS = {
  'genesis': 1, 'exodo': 2, 'levitico': 3, 'numeros': 4, 'deuteronomio': 5,
  'josue': 6, 'jueces': 7, 'rut': 8,
  '1 samuel': 9, '1samuel': 9, 'i samuel': 9,
  '2 samuel': 10, '2samuel': 10, 'ii samuel': 10,
  '1 reyes': 11, '1reyes': 11, 'i reyes': 11,
  '2 reyes': 12, '2reyes': 12, 'ii reyes': 12,
  '1 cronicas': 13, '1cronicas': 13, 'i cronicas': 13,
  '2 cronicas': 14, '2cronicas': 14, 'ii cronicas': 14,
  'esdras': 15, 'nehemias': 16, 'ester': 17, 'job': 18,
  'salmos': 19, 'salmo': 19,
  'proverbios': 20, 'eclesiastes': 21,
  'cantares': 22, 'cantar de los cantares': 22, 'cantar de cantares': 22,
  'isaias': 23, 'jeremias': 24, 'lamentaciones': 25, 'ezequiel': 26, 'daniel': 27,
  'oseas': 28, 'joel': 29, 'amos': 30, 'abdias': 31, 'jonas': 32, 'miqueas': 33,
  'nahum': 34, 'habacuc': 35, 'sofonias': 36, 'hageo': 37, 'zacarias': 38, 'malaquias': 39,
  'mateo': 40, 'marcos': 41, 'lucas': 42, 'juan': 43, 'hechos': 44,
  'romanos': 45,
  '1 corintios': 46, '1corintios': 46, 'i corintios': 46,
  '2 corintios': 47, '2corintios': 47, 'ii corintios': 47,
  'galatas': 48, 'efesios': 49, 'filipenses': 50, 'colosenses': 51,
  '1 tesalonicenses': 52, '1tesalonicenses': 52, 'i tesalonicenses': 52,
  '2 tesalonicenses': 53, '2tesalonicenses': 53, 'ii tesalonicenses': 53,
  '1 timoteo': 54, '1timoteo': 54, 'i timoteo': 54,
  '2 timoteo': 55, '2timoteo': 55, 'ii timoteo': 55,
  'tito': 56, 'filemon': 57, 'hebreos': 58, 'santiago': 59,
  '1 pedro': 60, '1pedro': 60, 'i pedro': 60,
  '2 pedro': 61, '2pedro': 61, 'ii pedro': 61,
  '1 juan': 62, '1juan': 62, 'i juan': 62,
  '2 juan': 63, '2juan': 63, 'ii juan': 63,
  '3 juan': 64, '3juan': 64, 'iii juan': 64,
  'judas': 65,
  'apocalipsis': 66,
};

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/\./g, '')
    .trim();
}

export function interpretarReferencia(referencia) {
  const coincidencia = referencia.trim().match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!coincidencia) return null;

  const [, nombreLibro, capitulo, versoInicio, versoFin] = coincidencia;
  const libroNumero = LIBROS[normalizar(nombreLibro)];
  if (!libroNumero) return null;

  return {
    libroNumero,
    capitulo: parseInt(capitulo, 10),
    versoInicio: parseInt(versoInicio, 10),
    versoFin: versoFin ? parseInt(versoFin, 10) : parseInt(versoInicio, 10),
  };
}

function limpiarHtml(texto) {
  return texto.replace(/<[^>]*>/g, '').trim();
}

export async function buscarVersiculo(referencia) {
  if (!referencia) return { exito: false, error: 'Referencia vacía' };
  const refNorm = referencia.trim().toLowerCase();
  if (CACHE_VERSICULOS.has(refNorm)) {
    return { exito: true, texto: CACHE_VERSICULOS.get(refNorm) };
  }

  const datos = interpretarReferencia(referencia);
  if (!datos) {
    return { exito: false, error: 'No pude interpretar esa referencia. Usa el formato: Libro Capítulo:Verso (ej. Mateo 6:14-15)' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const respuesta = await fetch(
      `https://bolls.life/get-text/RV1960/${datos.libroNumero}/${datos.capitulo}/`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!respuesta.ok) throw new Error('No se pudo conectar con el servicio bíblico');

    const versiculos = await respuesta.json();
    const seleccionados = (versiculos || []).filter(
      (v) => v.verse >= datos.versoInicio && v.verse <= datos.versoFin
    );

    if (seleccionados.length === 0) {
      return { exito: false, error: 'No se encontraron versículos para esa referencia' };
    }

    const texto = seleccionados.map((v) => limpiarHtml(v.text)).join(' ');
    CACHE_VERSICULOS.set(refNorm, texto);
    return { exito: true, texto };
  } catch (error) {
    return { exito: false, error: 'Error de conexión. Revisa tu internet e intenta de nuevo.' };
  }
}

// ============================================================
// SECCIÓN DE LA BIBLIA (lectura completa por libro/capítulo/versión)
// ============================================================

// Versiones disponibles a través de bolls.life (código exacto que usa su API)
export const VERSIONES = [
  { codigo: 'RV1960', nombre: 'Reina-Valera 1960', idioma: 'Español' },
  { codigo: 'NVI', nombre: 'Nueva Versión Internacional', idioma: 'Español' },
  { codigo: 'NTV', nombre: 'Nueva Traducción Viviente', idioma: 'Español' },
  { codigo: 'LBLA', nombre: 'La Biblia de las Américas', idioma: 'Español' },
  { codigo: 'RV2004', nombre: 'Reina Valera Gómez', idioma: 'Español' },
  { codigo: 'PDT', nombre: 'Palabra de Dios para Todos', idioma: 'Español' },
  { codigo: 'BTX3', nombre: 'La Biblia Textual 3ra Ed.', idioma: 'Español' },
  { codigo: 'KJV', nombre: 'King James Version', idioma: 'English' },
  { codigo: 'NIV2011', nombre: 'New International Version', idioma: 'English' },
  { codigo: 'ESV', nombre: 'English Standard Version', idioma: 'English' },
];

// Los 66 libros en orden (número usado por la API en la posición del arreglo)
// y su cantidad de capítulos (es la misma en cualquier versión/traducción)
export const LIBROS_BIBLIA = [
  { numero: 1, nombre: 'Génesis', capitulos: 50, testamento: 'AT' },
  { numero: 2, nombre: 'Éxodo', capitulos: 40, testamento: 'AT' },
  { numero: 3, nombre: 'Levítico', capitulos: 27, testamento: 'AT' },
  { numero: 4, nombre: 'Números', capitulos: 36, testamento: 'AT' },
  { numero: 5, nombre: 'Deuteronomio', capitulos: 34, testamento: 'AT' },
  { numero: 6, nombre: 'Josué', capitulos: 24, testamento: 'AT' },
  { numero: 7, nombre: 'Jueces', capitulos: 21, testamento: 'AT' },
  { numero: 8, nombre: 'Rut', capitulos: 4, testamento: 'AT' },
  { numero: 9, nombre: '1 Samuel', capitulos: 31, testamento: 'AT' },
  { numero: 10, nombre: '2 Samuel', capitulos: 24, testamento: 'AT' },
  { numero: 11, nombre: '1 Reyes', capitulos: 22, testamento: 'AT' },
  { numero: 12, nombre: '2 Reyes', capitulos: 25, testamento: 'AT' },
  { numero: 13, nombre: '1 Crónicas', capitulos: 29, testamento: 'AT' },
  { numero: 14, nombre: '2 Crónicas', capitulos: 36, testamento: 'AT' },
  { numero: 15, nombre: 'Esdras', capitulos: 10, testamento: 'AT' },
  { numero: 16, nombre: 'Nehemías', capitulos: 13, testamento: 'AT' },
  { numero: 17, nombre: 'Ester', capitulos: 10, testamento: 'AT' },
  { numero: 18, nombre: 'Job', capitulos: 42, testamento: 'AT' },
  { numero: 19, nombre: 'Salmos', capitulos: 150, testamento: 'AT' },
  { numero: 20, nombre: 'Proverbios', capitulos: 31, testamento: 'AT' },
  { numero: 21, nombre: 'Eclesiastés', capitulos: 12, testamento: 'AT' },
  { numero: 22, nombre: 'Cantares', capitulos: 8, testamento: 'AT' },
  { numero: 23, nombre: 'Isaías', capitulos: 66, testamento: 'AT' },
  { numero: 24, nombre: 'Jeremías', capitulos: 52, testamento: 'AT' },
  { numero: 25, nombre: 'Lamentaciones', capitulos: 5, testamento: 'AT' },
  { numero: 26, nombre: 'Ezequiel', capitulos: 48, testamento: 'AT' },
  { numero: 27, nombre: 'Daniel', capitulos: 12, testamento: 'AT' },
  { numero: 28, nombre: 'Oseas', capitulos: 14, testamento: 'AT' },
  { numero: 29, nombre: 'Joel', capitulos: 3, testamento: 'AT' },
  { numero: 30, nombre: 'Amós', capitulos: 9, testamento: 'AT' },
  { numero: 31, nombre: 'Abdías', capitulos: 1, testamento: 'AT' },
  { numero: 32, nombre: 'Jonás', capitulos: 4, testamento: 'AT' },
  { numero: 33, nombre: 'Miqueas', capitulos: 7, testamento: 'AT' },
  { numero: 34, nombre: 'Nahúm', capitulos: 3, testamento: 'AT' },
  { numero: 35, nombre: 'Habacuc', capitulos: 3, testamento: 'AT' },
  { numero: 36, nombre: 'Sofonías', capitulos: 3, testamento: 'AT' },
  { numero: 37, nombre: 'Hageo', capitulos: 2, testamento: 'AT' },
  { numero: 38, nombre: 'Zacarías', capitulos: 14, testamento: 'AT' },
  { numero: 39, nombre: 'Malaquías', capitulos: 4, testamento: 'AT' },
  { numero: 40, nombre: 'Mateo', capitulos: 28, testamento: 'NT' },
  { numero: 41, nombre: 'Marcos', capitulos: 16, testamento: 'NT' },
  { numero: 42, nombre: 'Lucas', capitulos: 24, testamento: 'NT' },
  { numero: 43, nombre: 'Juan', capitulos: 21, testamento: 'NT' },
  { numero: 44, nombre: 'Hechos', capitulos: 28, testamento: 'NT' },
  { numero: 45, nombre: 'Romanos', capitulos: 16, testamento: 'NT' },
  { numero: 46, nombre: '1 Corintios', capitulos: 16, testamento: 'NT' },
  { numero: 47, nombre: '2 Corintios', capitulos: 13, testamento: 'NT' },
  { numero: 48, nombre: 'Gálatas', capitulos: 6, testamento: 'NT' },
  { numero: 49, nombre: 'Efesios', capitulos: 6, testamento: 'NT' },
  { numero: 50, nombre: 'Filipenses', capitulos: 4, testamento: 'NT' },
  { numero: 51, nombre: 'Colosenses', capitulos: 4, testamento: 'NT' },
  { numero: 52, nombre: '1 Tesalonicenses', capitulos: 5, testamento: 'NT' },
  { numero: 53, nombre: '2 Tesalonicenses', capitulos: 3, testamento: 'NT' },
  { numero: 54, nombre: '1 Timoteo', capitulos: 6, testamento: 'NT' },
  { numero: 55, nombre: '2 Timoteo', capitulos: 4, testamento: 'NT' },
  { numero: 56, nombre: 'Tito', capitulos: 3, testamento: 'NT' },
  { numero: 57, nombre: 'Filemón', capitulos: 1, testamento: 'NT' },
  { numero: 58, nombre: 'Hebreos', capitulos: 13, testamento: 'NT' },
  { numero: 59, nombre: 'Santiago', capitulos: 5, testamento: 'NT' },
  { numero: 60, nombre: '1 Pedro', capitulos: 5, testamento: 'NT' },
  { numero: 61, nombre: '2 Pedro', capitulos: 3, testamento: 'NT' },
  { numero: 62, nombre: '1 Juan', capitulos: 5, testamento: 'NT' },
  { numero: 63, nombre: '2 Juan', capitulos: 1, testamento: 'NT' },
  { numero: 64, nombre: '3 Juan', capitulos: 1, testamento: 'NT' },
  { numero: 65, nombre: 'Judas', capitulos: 1, testamento: 'NT' },
  { numero: 66, nombre: 'Apocalipsis', capitulos: 22, testamento: 'NT' },
];

export async function obtenerCapitulo(codigoVersion, libroNumero, capitulo) {
  const claveCache = `${codigoVersion}_${libroNumero}_${capitulo}`;

  // 1. Nivel 1: Memoria RAM instantánea (0ms)
  if (CACHE_CAPITULOS.has(claveCache)) {
    predescargarSiguiente(codigoVersion, libroNumero, capitulo);
    return { exito: true, versiculos: CACHE_CAPITULOS.get(claveCache) };
  }

  // 2. Nivel 2: Almacenamiento local persistente (Offline inmediato)
  try {
    const persistido = await AsyncStorage.getItem(`biblia_cache_${claveCache}`);
    if (persistido) {
      const parsed = JSON.parse(persistido);
      if (Array.isArray(parsed) && parsed.length > 0) {
        CACHE_CAPITULOS.set(claveCache, parsed);
        predescargarSiguiente(codigoVersion, libroNumero, capitulo);
        return { exito: true, versiculos: parsed };
      }
    }
  } catch {}

  // 3. Nivel 3: Descarga con control de timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const respuesta = await fetch(
      `https://bolls.life/get-text/${codigoVersion}/${libroNumero}/${capitulo}/`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!respuesta.ok) throw new Error('No se pudo conectar con el servicio bíblico');

    const datos = await respuesta.json();
    if (!datos || datos.length === 0) {
      return { exito: false, error: 'Este capítulo no está disponible en esta versión' };
    }

    const versiculos = datos.map((v) => ({ numero: v.verse, texto: limpiarHtml(v.text) }));
    CACHE_CAPITULOS.set(claveCache, versiculos);

    // Guardar en caché local silenciosamente
    AsyncStorage.setItem(`biblia_cache_${claveCache}`, JSON.stringify(versiculos)).catch(() => {});

    // Pre-descargar siguiente capítulo para navegación instantánea
    predescargarSiguiente(codigoVersion, libroNumero, capitulo);

    return { exito: true, versiculos };
  } catch (error) {
    // Si falla la red pero hay en memoria
    if (CACHE_CAPITULOS.has(claveCache)) {
      return { exito: true, versiculos: CACHE_CAPITULOS.get(claveCache) };
    }
    return { exito: false, error: 'Modo sin conexión. Revisa tu internet para descargar nuevos capítulos.' };
  }
}

// Pre-descarga silenciosa del siguiente capítulo para que el usuario nunca espere al tocar "Siguiente"
function predescargarSiguiente(codigoVersion, libroNumero, capitulo) {
  const libro = LIBROS_BIBLIA.find((l) => l.numero === libroNumero);
  if (!libro || capitulo >= libro.capitulos) return;

  const siguienteClave = `${codigoVersion}_${libroNumero}_${capitulo + 1}`;
  if (CACHE_CAPITULOS.has(siguienteClave)) return;

  setTimeout(async () => {
    try {
      const res = await fetch(`https://bolls.life/get-text/${codigoVersion}/${libroNumero}/${capitulo + 1}/`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const vers = data.map((v) => ({ numero: v.verse, texto: limpiarHtml(v.text) }));
          CACHE_CAPITULOS.set(siguienteClave, vers);
          AsyncStorage.setItem(`biblia_cache_${siguienteClave}`, JSON.stringify(vers)).catch(() => {});
        }
      }
    } catch {}
  }, 400);
}