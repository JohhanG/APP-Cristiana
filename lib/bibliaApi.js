// Cliente para la API pública de bolls.life (gratuita, sin necesidad de clave)
// Traducción usada: Reina-Valera 1960 (RV1960)

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
  const datos = interpretarReferencia(referencia);
  if (!datos) {
    return { exito: false, error: 'No pude interpretar esa referencia. Usa el formato: Libro Capítulo:Verso (ej. Mateo 6:14-15)' };
  }

  try {
    const respuesta = await fetch(
      `https://bolls.life/get-text/RV1960/${datos.libroNumero}/${datos.capitulo}/`
    );
    if (!respuesta.ok) throw new Error('No se pudo conectar con el servicio bíblico');

    const versiculos = await respuesta.json();
    const seleccionados = versiculos.filter(
      (v) => v.verse >= datos.versoInicio && v.verse <= datos.versoFin
    );

    if (seleccionados.length === 0) {
      return { exito: false, error: 'No se encontraron versículos para esa referencia' };
    }

    const texto = seleccionados.map((v) => limpiarHtml(v.text)).join(' ');
    return { exito: true, texto };
  } catch (error) {
    return { exito: false, error: 'Error de conexión. Revisa tu internet e intenta de nuevo.' };
  }
}