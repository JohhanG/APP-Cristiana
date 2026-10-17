// Cabecera y funciones helper
import { supabase } from './supabase.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function esUUID(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export const DURACIONES_ESTUDIO = [
  { id: 7, etiqueta: '7 días (Semanal)', badge: 'SEMANAL', icono: 'calendar-outline', color: '#2563EB' },
  { id: 15, etiqueta: '15 días (Quincenal)', badge: '15 DÍAS', icono: 'hourglass-outline', color: '#7C3AED' },
  { id: 30, etiqueta: '30 días (Mensual)', badge: 'MENSUAL', icono: 'ribbon-outline', color: '#D97706' },
];

export function obtenerContextoAutor(referencia = '', tema = '', titulo = '') {
  const ref = (referencia + ' ' + tema + ' ' + titulo).toLowerCase();

  if (ref.includes('mateo')) {
    return 'Autor: El apóstol Mateo (Leví), publicano judío llamado por Jesús. Escribió a una audiencia primordialmente judía del primer siglo, presentando a Jesucristo como el Rey Mesías prometido en el Antiguo Testamento que cumple la Ley y los Profetas. En este pasaje del Sermón del Monte (Mateo 5-7), Jesús asciende a la montaña —en claro paralelismo con Moisés subiendo al Sinaí— pero no para traer truenos de juicio, sino para proclamar la justicia superior y el corazón interior del Reino de los Cielos.';
  }
  if (ref.includes('santiago')) {
    return 'Autor: Santiago (Jacobo), siervo de Dios y del Señor Jesucristo, hermano de Jesús y líder principal de la iglesia primitiva en Jerusalén (Gálatas 2:9; Hechos 15). Dirigida a las doce tribus de la dispersión (los creyentes judíos dispersos por el imperio romano). Su propósito es eminentemente práctico: demostrar que la fe viva no es un asentimiento intelectual abstracto, sino una vida transformada que se manifiesta en obras tangibles de misericordia, dominio de la lengua y perseverancia bajo la prueba.';
  }
  if (ref.includes('pedro')) {
    return 'Autor: El apóstol Simón Pedro, pescador de Galilea transformado por Cristo y testigo ocular de su ministerio, pasión, muerte y resurrección gloriosa. Escrito con el corazón de un pastor curtido por sus propios fracasos pasados y restaurado por la gracia divina. Enseña a la iglesia que el sufrimiento temporal refina la fe como el oro en el fuego, y que la esperanza cristiana es viva e inmarcesible.';
  }
  if (ref.includes('filipenses')) {
    return 'Autor: El apóstol Pablo, escribiendo desde su encarcelamiento en Roma (hacia el año 60-62 d.C.) a la amada congregación de Filipos, la primera iglesia fundada en suelo europeo (Hechos 16). A pesar de sus cadenas y la amenaza de muerte, la carta desborda una profunda alegría cristocéntrica, enseñando que el verdadero gozo no depende de la comodidad de las circunstancias externas, sino de la comunión íntima y victoriosa con Jesucristo.';
  }
  if (ref.includes('proverbios')) {
    return 'Autor: Principalmente el rey Salomón, hijo de David, dotado por Dios de una sabiduría sin precedentes (1 Reyes 4:29-34). El libro de Proverbios pertenece a la literatura sapiencial de Israel y tiene como propósito formar el carácter moral y espiritual en el "temor reverente de Jehová", ofreciendo directrices divinas para las finanzas, la lengua, la familia y el gobierno del corazón.';
  }
  if (ref.includes('paz') || ref.includes('ansiedad')) {
    return 'Contexto y Teología Bíblica: La paz divina (en hebreo Shalom; en griego Eirēnē) no es una simple ausencia pasiva de problemas o conflictos externos; es la plenitud espiritual, la seguridad holística y el reposo inconmovible que provienen de estar en una correcta relación de pacto con Dios por medio de Jesucristo.';
  }
  if (ref.includes('salmos')) {
    return 'Autor: Principalmente el rey David y los cantores levitas de Israel (Asaf, los hijos de Coré). Los Salmos constituyen el himnario inspirado del pueblo de Dios, donde el alma humana derrama ante el trono celestial sus alabanzas, angustias, lágrimas y cánticos de victoria con total transparencia.';
  }
  if (ref.includes('juan')) {
    return 'Autor: El apóstol Juan, el discípulo amado, testigo íntimo de los milagros y confidencias de Jesús. Su propósito supremo es presentar a Jesús como el Verbo eterno encarnado, el Hijo de Dios, para que creyendo tengamos vida en su nombre (Juan 20:31).';
  }
  if (ref.includes('romanos') || ref.includes('corintios') || ref.includes('galatas') || ref.includes('efesios') || ref.includes('colosenses')) {
    return 'Autor: El apóstol Pablo, embajador de Cristo a las naciones. Guiado por el Espíritu Santo, Pablo expone las riquezas inescrutables de Cristo, el misterio del evangelio de la gracia, la justificación por la fe y el poder de una vida gobernada por el Espíritu.';
  }

  return 'Autor bíblico inspirado: Exposición teológica profunda basada en el canon de las Sagradas Escrituras (Reina-Valera 1960), con contexto histórico, análisis de los textos originales y aplicación pastoral al creyente de hoy.';
}

export function obtenerVersiculosCruzados(referencia = '', tema = '', titulo = '') {
  const ref = (referencia + ' ' + tema + ' ' + titulo).toLowerCase();

  if (ref.includes('mateo 5:1-12') || ref.includes('bienaventuranzas')) {
    return 'Pasajes relacionados: Lucas 6:20-26 · Salmos 1:1-3 · Isaías 61:1-3 · Santiago 2:5 · 1 Pedro 3:14 · Romanos 5:3-5';
  }
  if (ref.includes('mateo 5:13-16') || ref.includes('sal') || ref.includes('luz')) {
    return 'Pasajes relacionados: Marcos 9:50 · Lucas 14:34-35 · Filipenses 2:14-16 · Proverbios 4:18 · Juan 8:12 · Colosenses 4:6';
  }
  if (ref.includes('mateo 5:21-26') || ref.includes('enojo') || ref.includes('reconciliacion')) {
    return 'Pasajes relacionados: 1 Juan 3:15 · Efesios 4:26-27 · Salmos 139:23-24 · Proverbios 16:32 · Colosenses 3:12-14 · Santiago 1:19-20';
  }
  if (ref.includes('mateo 5:43-48') || ref.includes('enemigos') || ref.includes('ofenden')) {
    return 'Pasajes relacionados: Romanos 12:14-21 · Proverbios 25:21-22 · Lucas 23:34 · Hechos 7:59-60 · 1 Pedro 2:21-23 · Lucas 6:27-36';
  }
  if (ref.includes('mateo 6:5-15') || ref.includes('secreto') || ref.includes('oracion')) {
    return 'Pasajes relacionados: Salmos 91:1-2 · Lucas 11:1-4 · Romanos 8:15 · Isaías 26:20 · Hebreos 4:16 · Salmos 139:1-4';
  }
  if (ref.includes('mateo 6:25-34') || ref.includes('afan') || ref.includes('lirios')) {
    return 'Pasajes relacionados: Filipenses 4:6-7 · 1 Pedro 5:7 · Salmos 127:1-2 · Lamentaciones 3:22-23 · Lucas 12:22-31 · Salmos 37:25';
  }
  if (ref.includes('mateo 7:24-27') || ref.includes('roca') || ref.includes('arena')) {
    return 'Pasajes relacionados: Lucas 6:46-49 · 1 Corintios 3:10-15 · Isaías 28:16 · Santiago 1:22-25 · Salmos 18:2 · Proverbios 10:25';
  }
  if (ref.includes('santiago 1:2-4')) {
    return 'Pasajes relacionados: Romanos 5:3-5 · 1 Pedro 1:6-7 · Habacuc 3:17-19 · 2 Corintios 12:9-10 · Hebreos 12:11';
  }
  if (ref.includes('santiago 1:5-8')) {
    return 'Pasajes relacionados: Proverbios 2:3-6 · 1 Reyes 3:9 · Efesios 1:17 · Salmos 25:4-5 · Marcos 11:24';
  }
  if (ref.includes('santiago 1:19-25')) {
    return 'Pasajes relacionados: Mateo 7:21-27 · Romanos 2:13 · Juan 13:17 · Salmos 119:105 · Ezequiel 33:31-32';
  }
  if (ref.includes('santiago 2:14-26')) {
    return 'Pasajes relacionados: Génesis 22:1-14 · Josué 2:1-21 · Gálatas 5:6 · 1 Juan 3:17-18 · Tito 3:8';
  }
  if (ref.includes('santiago 3:1-12')) {
    return 'Pasajes relacionados: Proverbios 18:21 · Salmos 141:3 · Efesios 4:29 · Colosenses 4:6 · 1 Pedro 3:10';
  }
  if (ref.includes('santiago 4:6-10')) {
    return 'Pasajes relacionados: 1 Pedro 5:5-7 · Proverbios 3:34 · Salmos 138:6 · Miqueas 6:8 · Isaías 57:15';
  }
  if (ref.includes('santiago 5:7-16')) {
    return 'Pasajes relacionados: 1 Reyes 18:41-45 · Salmos 126:5-6 · Gálatas 6:9 · Lucas 18:1 · 1 Tesalonicenses 5:17';
  }
  if (ref.includes('lucas 5:1-11')) {
    return 'Pasajes relacionados: Mateo 4:18-22 · Marcos 1:16-20 · Juan 21:1-11 · Isaías 6:1-8 · Romanos 11:33-36';
  }
  if (ref.includes('mateo 14:22-33')) {
    return 'Pasajes relacionados: Marcos 6:45-52 · Juan 6:16-21 · Salmos 77:19 · Salmos 107:23-30 · Hebreos 12:2';
  }
  if (ref.includes('mateo 16:13-19')) {
    return 'Pasajes relacionados: Juan 6:68-69 · 1 Corintios 10:4 · 1 Pedro 2:4-8 · Efesios 2:20 · Hechos 4:11-12';
  }
  if (ref.includes('juan 13:1-10')) {
    return 'Pasajes relacionados: Filipenses 2:5-8 · Mateo 20:25-28 · Lucas 22:24-27 · 1 Pedro 5:5 · Romanos 12:10';
  }
  if (ref.includes('lucas 22:54-62') || ref.includes('mateo 26:31-35')) {
    return 'Pasajes relacionados: Marcos 14:66-72 · Juan 18:15-27 · 1 Corintios 10:12 · Proverbios 16:18 · 2 Corintios 7:10';
  }
  if (ref.includes('juan 21:15-19')) {
    return 'Pasajes relacionados: Lucas 22:31-32 · Hechos 20:28 · 1 Pedro 5:1-4 · 2 Timoteo 4:7-8 · Jeremías 3:15';
  }
  if (ref.includes('hechos 2') || ref.includes('1 pedro 1:3-7')) {
    return 'Pasajes relacionados: Hechos 4:13 · 2 Timoteo 1:7 · Romanos 8:18 · Santiago 1:12 · Apocalipsis 2:10';
  }
  if (ref.includes('filipenses 4:6-7')) {
    return 'Pasajes relacionados: 1 Pedro 5:7 · Salmos 55:22 · Isaías 26:3 · Juan 14:27 · Colosenses 3:15';
  }
  if (ref.includes('juan 14:27') || ref.includes('juan 16:33')) {
    return 'Pasajes relacionados: Juan 20:19-21 · Romanos 5:1 · Efesios 2:14-17 · Salmos 29:11 · Isaías 9:6';
  }
  if (ref.includes('salmos 23')) {
    return 'Pasajes relacionados: Juan 10:11-15 · Isaías 40:11 · Ezequiel 34:11-16 · Salmos 84:11 · Hebreos 13:20-21';
  }
  if (ref.includes('isaias 26:3-4')) {
    return 'Pasajes relacionados: Salmos 112:7-8 · Jeremías 17:7-8 · Proverbios 3:5-6 · Romanos 8:6 · Salmos 62:1-2';
  }
  if (ref.includes('marcos 4:35-41')) {
    return 'Pasajes relacionados: Salmos 89:8-9 · Salmos 107:28-30 · Mateo 8:23-27 · Lucas 8:22-25 · Isaías 43:1-2';
  }
  if (ref.includes('romanos 8:31-39')) {
    return 'Pasajes relacionados: Juan 10:28-29 · 1 Juan 4:18 · 1 Juan 5:4 · 2 Corintios 2:14 · Salmos 27:1';
  }
  if (ref.includes('filipenses 1:6')) {
    return 'Pasajes relacionados: Salmos 138:8 · Romanos 8:28-30 · 1 Corintios 1:8-9 · 1 Tesalonicenses 5:24 · 2 Timoteo 1:12';
  }
  if (ref.includes('filipenses 4:13')) {
    return 'Pasajes relacionados: 2 Corintios 12:9-10 · Efesios 3:16 · Colosenses 1:11 · Isaías 40:29-31 · Salmos 18:29';
  }

  return 'Pasajes relacionados: Salmos 119:105 · 2 Timoteo 3:16-17 · Hebreos 4:12 · Josué 1:8 · Proverbios 3:5-6';
}

export function enriquecerDiaEstudioProfundo(dia, estudio = null) {
  if (!dia) return null;

  const autorContexto =
    dia.autor_contexto ||
    obtenerContextoAutor(dia.referencia_biblica, estudio?.tema || dia.tema, estudio?.titulo || dia.titulo);

  const versiculosClave =
    dia.versiculos_clave ||
    obtenerVersiculosCruzados(dia.referencia_biblica, estudio?.tema || dia.tema, dia.titulo);

  let predicacion = dia.predicacion || dia.reflexion || '';
  if (typeof predicacion === 'string') {
    predicacion = predicacion.replace(/\\n/g, '\n');
  }

  const parrafos = predicacion.split('\n\n').filter((p) => p.trim() !== '');

  // Si tiene menos de 8 párrafos, lo enriquecemos teológicamente para que sea un estudio completo
  if (parrafos.length < 8 && predicacion.trim().length > 0) {
    const ref = dia.referencia_biblica || 'las Escrituras';

    const complementoExegesis =
      'Para comprender la hondura de ' + ref + ', es fundamental adentrarse en el contexto histórico y espiritual que rodeó a su autor original.\n\n' +
      'Las palabras que encontramos en las Sagradas Escrituras no fueron escritas en un vacío cómodo o teórico; nacieron en el fragor de batallas reales, en medio de imperios hostiles, persecuciones, desiertos implacables y momentos donde la fe de los creyentes fue puesta a prueba hasta el límite.\n\n' +
      'Cuando analizamos el texto en su idioma original (el griego koiné en el Nuevo Testamento o el hebreo clásico en el Antiguo), descubrimos matices de un peso teológico extraordinario que a menudo pasan desapercibidos en una lectura superficial. Cada verbo, cada advertencia y cada promesa fue inspirada con una precisión quirúrgica para el corazón humano.\n\n' +
      'Este pasaje nos invita a examinar no solo lo que Dios demanda de nosotros externamente, sino las motivaciones más secretas de nuestra alma: ¿Por qué hacemos lo que hacemos? ¿De qué fuente estamos bebiendo cuando el desánimo o la duda tocan a la puerta?\n\n' +
      'A lo largo de toda la historia bíblica vemos un patrón inmutable: Dios nunca llama a hombres y mujeres perfectos ni autosuficientes; llama a personas conscientes de su necesidad que deciden aferrarse a su fidelidad por encima de las circunstancias visibles.\n\n' +
      'La teología de este capítulo se conecta de manera asombrosa con el resto del canon bíblico: la gracia que sustenta al creyente en ' + ref + ' es la misma gracia soberana que guió a Abraham en la noche oscura, la que sostuvo a David en la cueva de Adulam y la que selló nuestra redención eterna en la cruz del Calvario.\n\n' +
      'Por lo tanto, la verdad que hoy tienes delante no es un simple consejo moral para tener un día agradable; es el fundamento inamovible sobre el cual debes edificar tus pensamientos, tus finanzas, tu matrimonio y tus decisiones laborales.\n\n' +
      'Cuando decides abrazar la Palabra con reverencia y obediencia incondicional, el Espíritu Santo comienza a desmantelar las fortalezas del temor y a llenar tu espíritu de una paz y una firmeza que sobrepasan todo entendimiento humano.';

    predicacion = predicacion + '\n\n' + complementoExegesis;
  }

  // Garantizar oración profunda y extensa en varios párrafos
  let oracion = dia.oracion || '';
  if (typeof oracion === 'string') {
    oracion = oracion.replace(/\\n/g, '\n');
  }
  const parrafosOracion = oracion.split('\n\n').filter((p) => p.trim() !== '');
  if (parrafosOracion.length < 3 && oracion.trim().length > 0) {
    oracion =
      oracion +
      '\n\n' +
      'Padre Santo, te pido que esta palabra no quede como un mero conocimiento en mi cabeza, sino que descienda al terreno de mis decisiones diarias y transforme mi manera de hablar, de pensar y de actuar.\n\n' +
      'Limpia mi corazón de toda autosuficiencia y rebeldía. Cuando vengan las pruebas y los vientos contrarios, afírmame sobre la Roca eterna que es Cristo Jesús. Que mi vida sea un testimonio vivo de tu gracia y tu poder. En el dulce nombre de Jesús, amén.';
  }

  return {
    ...dia,
    autor_contexto: autorContexto,
    versiculos_clave: versiculosClave,
    predicacion,
    reflexion: predicacion,
    oracion,
  };
}

export function normalizarDiaEstudio(d, estudio = null) {
  if (!d) return null;
  let titulo = d.titulo;
  let predicacion = d.predicacion || null;
  let reflexion = d.reflexion || '';
  let aplicacion = d.aplicacion || d.paso_practico || null;
  let pregunta = d.pregunta_reflexion || null;
  let oracion = d.oracion || null;
  let autorContexto = d.autor_contexto || null;
  let versiculosClave = d.versiculos_clave || null;

  if (typeof reflexion === 'string' && reflexion.startsWith('{') && reflexion.endsWith('}')) {
    try {
      const parsed = JSON.parse(reflexion);
      titulo = parsed.titulo || titulo;
      predicacion = parsed.predicacion || predicacion;
      reflexion = parsed.reflexion || reflexion;
      aplicacion = parsed.aplicacion || aplicacion;
      pregunta = parsed.pregunta_reflexion || parsed.pregunta || pregunta;
      oracion = parsed.oracion || oracion;
      autorContexto = parsed.autor_contexto || autorContexto;
      versiculosClave = parsed.versiculos_clave || versiculosClave;
    } catch (_) {}
  }

  if (!predicacion && reflexion) {
    predicacion = reflexion;
  }

  // Normalizar los posibles saltos de línea literales
  if (typeof predicacion === 'string') {
    predicacion = predicacion.replace(/\\n/g, '\n');
  }
  if (typeof oracion === 'string') {
    oracion = oracion.replace(/\\n/g, '\n');
  }

  const baseDia = {
    ...d,
    titulo,
    predicacion,
    reflexion,
    aplicacion,
    pregunta_reflexion: pregunta,
    oracion,
    autor_contexto: autorContexto,
    versiculos_clave: versiculosClave,
  };

  return enriquecerDiaEstudioProfundo(baseDia, estudio);
}

export const ESTUDIOS_SEMILLA = [
  {
    "id": "semilla-estudio-7d-mateo",
    "titulo": "El Sermón del Monte: Principios del Reino",
    "descripcion": "Un recorrido exegético y pastoral profundo de 7 días versículo por versículo en Mateo 5-7. Descubre el corazón del Reino, la ética de la gracia frente a la ley farisaica, la intimidad secreta con el Padre y cómo edificar sobre la Roca inconmovible.",
    "tema": "Vida Cristiana",
    "num_dias": 7,
    "portada_url": "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
    "dias": [
      {
        "numero_dia": 1,
        "titulo": "Las Bienaventuranzas: La paradoja del gozo en el Reino",
        "referencia_biblica": "Mateo 5:1-12",
        "autor_contexto": "Autor: El apóstol Mateo (Leví), publicano judío llamado por Jesús. Escribió a creyentes de origen judío para demostrar que Jesús es el Rey Mesías prometido en el Antiguo Testamento que cumple la Ley y los Profetas. En este pasaje, Jesús asciende al monte junto al mar de Galilea —en claro paralelismo con Moisés subiendo al Sinaí— pero no para traer truenos de juicio, sino para proclamar la bienaventuranza y el corazón interior de su Reino.",
        "versiculos_clave": "Pasajes relacionados: Lucas 6:20-26 · Salmos 1:1-3 · Isaías 61:1-3 · Santiago 2:5 · 1 Pedro 3:14 · Romanos 5:3-5",
        "predicacion": "El Sermón del Monte es la constitución moral y espiritual del Reino de Dios. Jesús comienza su mensaje no con amenazas ni con exigencias religiosas frías, sino derramando una bendición inmerecida sobre aquellos que se sienten exhaustos y quebrantados.\n\nFrente a Él no había una multitud de reyes, filósofos ilustres o élites adineradas; había campesinos endeudados, pescadores curtidos por el sol, viudas olvidadas y enfermos abrumados por el peso de los impuestos romanos y la asfixiante religiosidad de los escribas.\n\nA este pueblo marginado, Jesús proclama una palabra revolucionaria: \"Bienaventurados\" (en griego *makarios*). Este término no describe una alegría superficial y pasajera basada en las circunstancias favorables del momento; describe el estado dichoso y pleno de quien vive bajo el favor, la sonrisa y la aprobación de Dios.\n\nLa primera bienaventuranza establece el cimiento indispensable de toda la vida cristiana: \"Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos\". En el griego clásico, existían dos palabras para pobreza: *penes*, que describía al obrero pobre que vive de su salario diario; y *ptojos*, que describía al mendigo absoluto que no tiene nada, absolutamente nada que ofrecer, salvo extender sus manos vacías con desesperación.\n\nJesús utiliza precisamente *ptojos*. No entras al Reino de Dios presumiendo tus títulos, tu moralidad intachable o tus méritos propios; entras reconociendo que delante de la santidad divina estás en bancarrota espiritual y necesitas con urgencia la gracia del Salvador.\n\n\"Bienaventurados los que lloran, porque ellos recibirán consolación\". Este llanto no es una lástima estéril de uno mismo; es el dolor sagrado por nuestro propio pecado y por la injusticia que desgarra a este mundo caído. Dios no ignora a los que lloran con verdad; el Espíritu Santo viene como el Paráclito celestial a enjugar cada lágrima y vendar los corazones heridos.\n\n\"Bienaventurados los mansos, porque ellos recibirán la tierra por heredad\". La palabra griega para mansedumbre es *praus*, un vocablo ecuestre que se utilizaba para describir a un corcel de guerra imponente que, poseyendo una fuerza salvaje descomunal, había sido domado y respondía al más leve susurro y tirón de la rienda de su jinete. Mansedumbre bíblica no es cobardía ni debilidad pasiva; es poder, temperamento y pasión puestos enteramente bajo el control del Espíritu de Dios.\n\n\"Bienaventurados los que tienen hambre y sed de justicia, porque ellos serán saciados\". El hambre y la sed no son pasatiempos intelectuales; son necesidades fisiológicas innegociables. Quien está en el desierto no puede distraerse con adornos: necesita agua o morirá. Quien anhela con esa desesperación la rectitud y la presencia de Dios recibirá una satisfacción que el mundo jamás podrá darle.\n\nA continuación, Jesús describe el impacto hacia los demás: los misericordiosos recibirán misericordia; los de limpio corazón verán a Dios; los pacificadores serán llamados hijos de Dios. En un imperio romano que rendía culto a la fuerza implacable de las espadas y a la revancha despiadada, Jesús declara que la verdadera grandeza consiste en construir puentes de paz y tratar a los pecadores con la misma compasión con la que Dios nos trató.\n\nY para sellar el pasaje, advierte con valentía: \"Bienaventurados sois cuando por mi causa os vituperen y os persigan... gozaos y alegraos, porque vuestro galardón es grande en los cielos\". El creyente que vive según el Reino no será popular ante la corriente del mundo, pero su recompensa está asegurada en la eternidad.\n\nHoy la cultura te susurra que los dichosos son los autosuficientes, los que se imponen con soberbia y los que amasan aplausos en las pantallas. Pero Jesús te invita hoy a dar vuelta tus valores: tu mayor fortaleza no radica en lo que puedes controlar, sino en postrarte ante el Padre y decirle con el alma: \"Señor, sin ti no puedo nada; heme aquí\".",
        "aplicacion": "Examina con sinceridad un área de tu vida donde hayas estado actuando con autosuficiencia u orgullo. Acércate hoy a Dios en silencio reconociendo tu debilidad, y realiza un acto concreto de bondad sin que nadie te vea para reflejar la misericordia del Reino.",
        "pregunta_reflexion": "¿Estás construyendo tu seguridad diaria sobre tus propias capacidades y méritos, o sobre la humildad de los pobres en espíritu que se refugian en la gracia de Cristo?",
        "oracion": "Padre celestial, Rey de gloria y Dios de toda gracia, me acerco a ti reconociendo mi absoluta bancarrota espiritual.\n\nPerdóname por las veces en que he pretendido ser fuerte en mis propias fuerzas, olvidando que mi justicia humana es como trapo de inmundicia delante de tu santidad. Vacíame hoy de todo orgullo, vanagloria y autosuficiencia.\n\nDame un corazón manso que sepa someterse a tu voz, hambre y sed constante de tu justicia, y una mirada compasiva para perdonar y consolar a los quebrantados. Que mi vida sea un reflejo puro de las bienaventuranzas de tu Hijo Jesucristo.\n\nGuárdame de buscar la aprobación de los hombres y afírmame en el gozo eterno de tu Reino. En el nombre poderoso de Jesús, amén."
      },
      {
        "numero_dia": 2,
        "titulo": "Sal de la tierra y luz del mundo: Tu impacto cotidiano",
        "referencia_biblica": "Mateo 5:13-16",
        "autor_contexto": "Autor: El apóstol Mateo. En el mundo antiguo, donde no existían refrigeradores ni iluminación eléctrica, la sal y la luz eran elementos esenciales para la supervivencia diaria de cualquier hogar judío y romano. Jesús utiliza estas dos poderosas metáforas domésticas para enseñar a sus discípulos cuál es su vocación innegociable en medio de una sociedad en descomposición moral.",
        "versiculos_clave": "Pasajes relacionados: Marcos 9:50 · Lucas 14:34-35 · Filipenses 2:14-16 · Proverbios 4:18 · Juan 8:12 · Colosenses 4:6",
        "predicacion": "Inmediatamente después de proclamar las Bienaventuranzas, Jesús mira a sus discípulos a los ojos y les hace una declaración de identidad asombrosa: \"Vosotros sois la sal de la tierra... Vosotros sois la luz del mundo\".\n\nObserva con detenimiento las palabras del Maestro: no les dice \"vosotros deberíais intentar ser sal\", ni \"quizás algún día lleguéis a ser luz\". Les dice: \"Vosotros sois\". Desde el momento en que has nacido de nuevo por el Espíritu Santo, tu naturaleza en Cristo es ser un agente activo de transformación espiritual.\n\nEn el primer siglo, la sal cumplía dos propósitos vitales e indispensables: primero, preservaba los alimentos de la putrefacción; y segundo, aportaba sazón y sabor a la comida ordinaria. La carne y el pescado se cubrían de sal para que las bacterias no los pudrieran en medio del calor del Medio Oriente.\n\nDe la misma manera, la presencia de los creyentes en la sociedad está diseñada por Dios para frenar la corrupción moral, la mentira y el cinismo que intentan degradar a las familias, los negocios, la política y la cultura. Tu honestidad en el trabajo, tu fidelidad en el matrimonio y tu rechazo a la trampa son la sal divina que preserva a tu entorno de la decadencia.\n\nPero Jesús pronuncia una advertencia penetrante: \"Pero si la sal se desvaneciere, ¿con qué será salada? No sirve más para nada, sino para ser echada fuera y hollada por los hombres\". La sal del mar Muerto solía estar mezclada con impurezas minerales; si se disolvía por la humedad, solo quedaba un polvo blanco insípido e inútil que se tiraba a los caminos para que la gente lo pisara.\n\nUn cristiano que pierde su devoción, que habla igual que el mundo, que se queja igual que el mundo y que transige con el pecado, pierde su poder de influencia y se vuelve irrelevante para el Reino.\n\nLuego, Jesús cambia la metáfora a la luz: \"Una ciudad asentada sobre un monte no se puede esconder. Ni se enciende una luz y se pone debajo de un almud, sino sobre el candelero, y alumbra a todos los que están en casa\".\n\nEl almud era un cajón de madera utilizado para medir granos. Poner una lámpara de aceite debajo de un cajón no solo sofoca su luz, sino que termina apagándola por falta de oxígeno. Jesús te dice con claridad: no te llamó a una fe clandestina, vergonzosa o aislada en cuatro paredes de domingo.\n\nTe encendió para que resplandezcas en el hospital, en el aula escolar, en la oficina, en la conversación con el vecino difícil y en las redes sociales. Tu testimonio no debe gritar con arrogancia condenatoria; debe alumbrar con la belleza humilde de las buenas obras.\n\n\"Así alumbre vuestra luz delante de los hombres, para que vean vuestras buenas obras, y glorifiquen a vuestro Padre que está en los cielos\". La meta de tu luz no es que la gente te aplauda a ti ni que admire tu elocuencia; es que al ver tu paciencia, tu integridad y tu amor sincero, los ojos de los hombres se levanten al Padre celestial y reconozcan que Dios es real.",
        "aplicacion": "Haz un acto consciente de \"sal y luz\" en este día: en tu lugar de trabajo o estudio, habla con rectitud donde otros murmuran, y extiende una mano de ayuda o consuelo a alguien que esté pasando un momento amargo.",
        "pregunta_reflexion": "¿Está tu vida diaria sazonando y alumbrando a quienes conviven contigo, o te has dejado apagar por la rutina y el conformismo de este siglo?",
        "oracion": "Señor Jesucristo, Luz del mundo y Salvador de mi alma, gracias por llamarme a ser sal y luz en medio de esta generación.\n\nPerdóname si en algún momento me he mimetizado con la oscuridad de este mundo por temor al rechazo o por comodidad terrenal. Purifica mi vida de toda impureza que apague mi testimonio.\n\nQue mis palabras sean sazonadas con gracia y verdad, y que mis obras de amor en lo cotidiano lleven a quienes me rodean a glorificar al Padre celestial.\n\nHazme un canal vivo de tu esperanza en mi hogar y en mi lugar de trabajo. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 3,
        "titulo": "La ley del corazón: Reconciliación y desarraigo del rencor",
        "referencia_biblica": "Mateo 5:21-26",
        "autor_contexto": "Autor: El apóstol Mateo. En este pasaje, Jesús inaugura su serie de antítesis (\"Oísteis que fue dicho... pero yo os digo\"), desmantelando la teología legalista y externa de los fariseos. Para los religiosos de la época, si no habías tomado un arma para quitar físicamente la vida a alguien, eras inocente ante la ley; pero Jesús penetra en el quirófano del alma y revela que el homicidio nace primero en los pensamientos no perdonados y en el desprecio del corazón.",
        "versiculos_clave": "Pasajes relacionados: 1 Juan 3:15 · Efesios 4:26-27 · Salmos 139:23-24 · Proverbios 16:32 · Colosenses 3:12-14 · Santiago 1:19-20",
        "predicacion": "A los seres humanos nos encanta medir nuestra bondad comparándonos con los peores pecados visibles de otros: \"Yo no robo, yo no mato, yo no hago daño a nadie; por lo tanto, Dios debe estar satisfecho conmigo\".\n\nPero en Mateo 5:21-26, Jesús quita el velo de esa autosatisfacción superficial: \"Oísteis que fue dicho a los antiguos: No matarás; y cualquiera que matare será culpable de juicio. Pero yo os digo que cualquiera que se enoje contra su hermano, será culpable de juicio; y cualquiera que diga: Necio, a su hermano, será culpable ante el concilio\".\n\nJesús identifica la raíz invisible del homicidio: el enojo arraigado, el rencor cultivado en el pecho y las palabras cargadas de desprecio verbal. Cuando llamas a alguien \"necio\" o utilizas el término arameo *raca* (que significaba \"cabeza hueca\", \"inútil\", despojando a la persona de su dignidad como criatura hecha a la imagen de Dios), estás cometiendo un asesinato espiritual en tu corazón.\n\nEl enojo acumulado es una toxina espiritual silenciosa: pretendes que el otro pague por su ofensa, pero quien termina envenenado, sin paz y atado a la amargura eres tú mismo.\n\nPor eso Jesús le da a la reconciliación una prioridad litúrgica y espiritual absoluta: \"Por tanto, si traes tu ofrenda al altar, y allí te acuerdas de que tu hermano tiene algo contra ti, deja allí tu ofrenda delante del altar, y anda, reconcíliate primero con tu hermano, y entonces ven y presenta tu ofrenda\".\n\nPiénsalo por un instante: un judío piadoso viajaba kilómetros hasta el Templo de Jerusalén, compraba su cordero para el sacrificio y se acercaba con solemnidad al sacerdote. Pero Jesús dice: detén el culto, suelta el animal, sal del santuario, camina de regreso y arregla la deuda de paz con tu hermano. Dios rechaza los cánticos y las ofrendas religiosas de un corazón que insiste en guardar rencor contra su prójimo.\n\n\"Ponte de acuerdo con tu adversario pronto, entre tanto que estás con él en el camino, no sea que el adversario te entregue al juez... y seas echado en la cárcel\". La palabra clave aquí es *pronto*. El rencor que no se atiende el primer día, echa raíces el segundo, florece en amargura al cabo de un mes y se convierte en una prisión emocional inquebrantable con el paso de los años.\n\nPerdonar no significa que lo que te hicieron estuvo bien, ni significa justificar la injusticia. Perdonar significa renunciar a la venganza personal, soltar el derecho de castigar y transferir la causa al único Juez justo de los cielos y de la tierra.\n\nCuando perdonas y buscas la paz, no estás perdiendo la batalla: estás desatando las cadenas de tu propia celda para caminar en la libertad gloriosa de los hijos de Dios.",
        "aplicacion": "Si hay alguna conversación pendiente, una distancia fría o una raíz de ofensa con un familiar, cónyuge, hermano o compañero, no dejes que pase este día sin dar un paso hacia la paz. Escribe un mensaje, pide disculpas con humildad o decide perdonar de corazón en oración.",
        "pregunta_reflexion": "¿Estás intentando mantener una relación religiosa con Dios mientras guardas resentimiento o desprecio hacia alguna persona en tu corazón?",
        "oracion": "Señor Jesús, Médico de las almas, penetra con la luz de tu verdad en los rincones más profundos de mi corazón.\n\nSaca a la superficie todo enojo guardado, toda palabra de amargura y todo resentimiento que me ate al pasado. Perdóname por las veces en que he juzgado o despreciado a otros, olvidando cuánto me has perdonado tú a mí.\n\nDame la humildad y la valentía para buscar la reconciliación y la paz. Limpia mi lengua de ironías y quejas, y que mi ofrenda diaria sea un corazón libre y reconciliado con mis hermanos.\n\nEn tu nombre precioso, amén."
      },
      {
        "numero_dia": 4,
        "titulo": "El amor contracultural: Amar y orar por los que nos ofenden",
        "referencia_biblica": "Mateo 5:43-48",
        "autor_contexto": "Autor: El apóstol Mateo. En el primer siglo, los judíos vivían bajo la humillación constante de la bota militar romana: los soldados podían obligar a un judío a cargar su equipo durante una milla, confiscar sus bienes y tratarlo con desdén. Los grupos nacionalistas como los zelotes enseñaban el odio frontal al invasor gentil. En medio de esta atmósfera cargada de odio y sed de venganza, Jesús proclama la doctrina más radical y sublime de su evangelio: el amor a los enemigos.",
        "versiculos_clave": "Pasajes relacionados: Romanos 12:14-21 · Proverbios 25:21-22 · Lucas 23:34 · Hechos 7:59-60 · 1 Pedro 2:21-23 · Lucas 6:27-36",
        "predicacion": "La ética del mundo es simple, predecible y carnal: \"Trata bien a los que te tratan bien, y paga con la misma moneda a los que te tratan mal\".\n\nJesús confronta esta lógica humana en Mateo 5:43-48: \"Oísteis que fue dicho: Amarás a tu prójimo, y aborrecerás a tu enemigo. Pero yo os digo: Amad a vuestros enemigos, bendecid a los que os maldicen, haced bien a los que os aborrecen, y orad por los que os ultrajan y os persiguen\".\n\nEl mandamiento de amar a los enemigos no es una emoción tibia o un sentimiento romántico; es una decisión deliberada de la voluntad guiada por el Espíritu Santo. El amor que Jesús demanda es *ágape*: un amor incondicional, generoso y activo que busca el mayor bien de la otra persona, incluso cuando esa persona no lo merece ni lo agradece.\n\nJesús nos da cuatro verbos de acción directa y poderosa:\n1. \"Amad\": toma la determinación de no devolver el golpe.\n2. \"Bendecid\": habla bien, responde con gracia y rehúsa utilizar el veneno de la maldición o la murmuración.\n3. \"Haced bien\": sirve de manera tangible cuando surja la oportunidad.\n4. \"Orad\": presenta a tu ofensor ante el trono de la gracia.\n\nEs imposible odiar a alguien por quien oras sinceramente ante Dios. Cuando te arrodillas y le pides al Padre celestial que tenga misericordia de esa persona que te ha calumniado o herido, el Espíritu Santo desarma tu ira y derrama en tu pecho la compasión sobrenatural de la cruz.\n\n¿Y cuál es el fundamento supremo de este amor contracultural? El carácter mismo de Dios: \"para que seáis hijos de vuestro Padre que está en los cielos, que hace salir su sol sobre malos y buenos, y que hace llover sobre justos e injustos\".\n\nDios envía el calor del sol y la frescura de la lluvia tanto sobre el campo del creyente fiel como sobre el campo de quien blasfema su santo nombre. Su providencia común no depende de la lealtad humana; brota de su propia naturaleza benevolente.\n\n\"Porque si amáis a los que os aman, ¿qué recompensa tendréis? ¿No hacen también lo mismo los publicanos? Y si saludáis a vuestros hermanos solamente, ¿qué hacéis de más?\". El cristianismo verdadero no se mide en lo que cualquier persona inconversa puede hacer; se revela cuando manifiestas la gracia de Cristo donde la carne solo produciría revancha.\n\nY Jesús corona su enseñanza con una cumbre gloriosa: \"Sed, pues, vosotros perfectos, como vuestro Padre que está en los cielos es perfecto\". La palabra griega para perfecto aquí es *teleios*, que significa maduro, completo, que ha alcanzado el propósito para el cual fue creado. Alcanzas la madurez de hijo de Dios cuando amas con la misma generosidad sin límites con la que tu Padre te amó a ti en la cruz.",
        "aplicacion": "Piensa en una persona que te ha tratado con hostilidad, desprecio o frialdad. Dedica 5 minutos hoy a interceder por ella en oración privada, pidiendo a Dios que bendiga su vida y le revele el evangelio de su gracia.",
        "pregunta_reflexion": "¿Estás respondiendo a las ofensas con el impulso natural de la revancha o con el poder sobrenatural del amor de Cristo?",
        "oracion": "Padre celestial, reconozco que en mis propias fuerzas humanas me resulta imposible amar a quien me ha herido o calumniado.\n\nPero hoy miro la cruz de tu Hijo Jesús, quien en medio de los clavos y la agonía oró: \"Padre, perdónalos, porque no saben lo que hacen\". Te pido que derrames de ese mismo amor sobrenatural en mi corazón herido.\n\nBendigo hoy a quienes me han tratado con aspereza. Quito de mí todo deseo de verlos caer y te los entrego en oración. Hazme un instrumento puro de tu paz y que mi vida refleje la perfección de tu misericordia.\n\nEn el nombre victorioso de Jesús, amén."
      },
      {
        "numero_dia": 5,
        "titulo": "La intimidad secreta: El Padre que ve en lo secreto",
        "referencia_biblica": "Mateo 6:5-15",
        "autor_contexto": "Autor: El apóstol Mateo. En el capítulo 6, Jesús aborda las tres columnas de la piedad judía tradicional: la limosna, la oración y el ayuno. En la sociedad de Jerusalén del siglo primero, los líderes religiosos tocaban trompeta para dar limosna y se paraban en las esquinas más concurridas de las calles para recitar oraciones en voz alta en los horarios públicos de oración (a las 9:00 AM, 12:00 PM y 3:00 PM), buscando ansiosamente la admiración popular. Jesús desenmascara este espectáculo y conduce a sus discípulos hacia la intimidad sagrada del Padre.",
        "versiculos_clave": "Pasajes relacionados: Salmos 91:1-2 · Lucas 11:1-4 · Romanos 8:15 · Isaías 26:20 · Hebreos 4:16 · Salmos 139:1-4",
        "predicacion": "Vivimos en una época dominada por la tiranía de la visibilidad pública.\n\nQueremos que la gente vea nuestros éxitos, aplauda nuestras virtudes y comente sobre nuestra vida en las redes sociales. Desafortunadamente, este apetito de aplauso humano también puede contaminar nuestra vida de oración y de servicio espiritual.\n\nJesús advierte con seriedad en Mateo 6:5: \"Y cuando ores, no seas como los hipócritas; porque ellos aman el orar en pie en las sinagogas y en las esquinas de las calles, para ser vistos de los hombres; de cierto os digo que ya tienen su recompensa\".\n\nLa palabra griega para hipócrita es *hypokrites*, un término que en el teatro griego clásico describía a los actores que se colocaban una máscara de madera pintada para interpretar un papel que no era su verdadera identidad. Quien ora para ser admirado por los hombres es un actor espiritual: ya recibió su aplauso terrenal, pero el cielo permanece cerrado.\n\nEn agudo contraste, Jesús entrega la receta de la verdadera vida con Dios: \"Mas tú, cuando ores, entra en tu aposento, y cerrada la puerta, ora a tu Padre que está en secreto; y tu Padre que ve en lo secreto te recompensará en público\".\n\nLa palabra para \"aposento\" en griego es *tameion*, el cuarto interior de la casa judía donde se guardaban los tesoros y las provisiones más valiosas; la única habitación con puerta y cerrojo donde no había ventanas hacia la calle.\n\nTu vida espiritual no se mide por las oraciones elocuentes que dices en público los domingos ni por las frases que compartes en internet; tu verdadera estatura espiritual se define por lo que ocurre cuando cierras la puerta de tu habitación y estás a solas con Dios sin nadie que te mire ni te aplauda.\n\nAllí, en lo secreto, Dios no busca oraciones mecánicas ni repeticiones vanas como las de los gentiles: \"porque vuestro Padre sabe de qué cosas tenéis necesidad, antes que vosotros le pidáis\". Dios no es un burócrata celestial al que debemos convencer con palabrería; es un Padre amoroso que conoce el anhelo de nuestro corazón antes de que pronunciemos una sola palabra.\n\nY Jesús nos enseña el modelo eterno de la oración en el Padre Nuestro: comenzar con adoración a su santidad (\"Padre nuestro que estás en los cielos, santificado sea tu nombre\"), someter nuestra vida al avance de su Reino (\"Venga tu reino. Hágase tu voluntad\"), descansar en su provisión diaria (\"El pan nuestro de cada día, dánoslo hoy\"), buscar el perdón y otorgarlo a otros (\"Y perdónanos nuestras deudas, como también nosotros perdonamos\"), y clamar por protección contra el mal (\"Y no nos metas en tentación, mas líbranos del mal\").\n\nHoy haz un alto en el ruido del mundo. Busca tu aposento secreto, apaga las distracciones y encuéntrate con el Padre que te ama y te espera.",
        "aplicacion": "Aparta hoy 15 minutos en total soledad: silencia las notificaciones de tu teléfono, cierra la puerta de tu habitación y habla con Dios con la transparencia de un hijo con su padre, utilizando el modelo del Padre Nuestro.",
        "pregunta_reflexion": "¿Es tu oración diaria un diálogo íntimo y transformador en lo secreto, o se ha convertido en una rutina apurada o exteriorizada?",
        "oracion": "Padre nuestro que estás en los cielos, santificado y exaltado sea tu glorioso nombre en toda la tierra.\n\nGracias por la bendición incomparable de poder entrar a tu presencia sin intermediarios terrenales, confiado en la sangre de tu Hijo Jesucristo. Perdóname si en algún momento he buscado el aplauso de los hombres antes que tu complacencia.\n\nHaz de mi vida un templo de oración constante en lo secreto. Venga tu Reino a mi hogar y a mis decisiones, y hágase tu perfecta voluntad en mí. Danos hoy el pan de cada día, perdona nuestras ofensas y líbranos del lazo del cazador.\n\nPorque tuyo es el reino, el poder y la gloria por todos los siglos. Amén."
      },
      {
        "numero_dia": 6,
        "titulo": "Basta a cada día su afán: Descanso en la provisión de Dios",
        "referencia_biblica": "Mateo 6:25-34",
        "autor_contexto": "Autor: El apóstol Mateo. En el mundo mediterráneo del primer siglo, la gran mayoría de la población vivía al borde de la subsistencia: sequías imprevistas, plagas sobre los cultivos de trigo y aceitunas, y la recaudación despiadada del fisco romano generaban una angustia constante por el alimento del día siguiente. A este pueblo agobiado por el fantasma de la escasez, Jesús les entrega el sermón sobre la ansiedad más conmovedor de la historia.",
        "versiculos_clave": "Pasajes relacionados: Filipenses 4:6-7 · 1 Pedro 5:7 · Salmos 127:1-2 · Lamentaciones 3:22-23 · Lucas 12:22-31 · Salmos 37:25",
        "predicacion": "Pocas cosas son tan agotadoras para el alma humana como el afán y la ansiedad por el porvenir.\n\nNos acostamos en la noche y nuestra mente comienza a proyectar escenarios catastróficos: \"¿Qué pasará si pierdo el trabajo? ¿Cómo pagaré las cuentas el próximo mes? ¿Qué pasará con la salud de mis hijos en diez años?\". La ansiedad es esencialmente un intento vano y desgastante de vivir el día de mañana con las fuerzas de hoy.\n\nJesús se detiene con infinita compasión en Mateo 6:25: \"Por tanto os digo: No os afanéis por vuestra vida, qué habéis de comer o qué habéis de beber; ni por vuestro cuerpo, qué habéis de vestir. ¿No es la vida más que el alimento, y el cuerpo más que el vestido?\".\n\nLa palabra griega que el Nuevo Testamento utiliza para afán es *merimnao*, que proviene de la raíz *merizo* (dividir) y *nous* (mente). La ansiedad literalmente parte tu mente en pedazos: te impide estar presente en el día de hoy porque te tiene secuestrado en los temores hipotéticos del mañana.\n\nJesús invita a sus oyentes a mirar el mundo natural con ojos de fe: \"Mirad las aves del cielo, que no siembran, ni siegan, ni recogen en graneros; y vuestro Padre celestial las alimenta. ¿No valéis vosotros mucho más que ellas?\".\n\nLas aves no son ociosas: vuelan, buscan ramitas y buscan su comida con diligencia. Pero las aves no sufren de úlceras por la preocupación ni se desvelan pensando en la economía del próximo año. Y luego añade con ternura: \"Y por el vestido, ¿por qué os afanáis? Considerad los lirios del campo, cómo crecen: no trabajan ni hilan; pero os digo, que ni aun Salomón con toda su gloria se vistió así como uno de ellos\".\n\nSi Dios viste con tanta hermosura a una hierba del campo que hoy es y mañana se echa en el fuego, ¿cuánto más cuidará de ti, hombre o mujer de poca fe? Tu valor ante los ojos del Padre no se mide por lo que tienes en el banco; se mide por la sangre preciosa que Cristo derramó por ti.\n\nJesús expone la absoluta inutilidad práctica de la angustia: \"¿Y quién de vosotros podrá, por mucho que se afane, añadir a su estatura un codo?\". Preocuparte no soluciona ni un solo problema del futuro; solo vacía el presente de sus energías, de su paz y de su gratitud.\n\nY nos entrega el orden divino inalterable que trae orden a toda nuestra existencia: \"Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas. Así que, no os afanéis por el día de mañana, porque el día de mañana traerá su afán. Basta a cada día su propio mal\".\n\nCuando pones a Dios en el trono de tus prioridades, Él se hace cargo de tus necesidades. Dios no te promete provisiones para los próximos cinco años de una sola vez; te promete el maná suficiente para el día de hoy. Descansa en que sus misericordias son nuevas cada mañana.",
        "aplicacion": "Escribe en una hoja de papel la preocupación que más te está robando la paz hoy. Dóblala, colócala sobre tu Biblia abierta y dile a Dios en voz alta: \"Señor, esto está en tus manos; yo me enfoco en buscar tu Reino hoy y confío en tu provisión para mi mañana\".",
        "pregunta_reflexion": "¿Estás desgastando tus fuerzas hoy por miedos sobre el futuro que Dios no te ha llamado a cargar todavía?",
        "oracion": "Padre celestial, hoy confieso ante ti mi tendencia a llenarme de afán y a querer controlar el rumbo del mañana.\n\nTe pido perdón por dudar de tu cuidado paternal. Si tú alimentas a las aves y vistes con belleza a las flores del campo, sé que no me desampararás a mí, tu hijo amado.\n\nRenuncio a la angustia por las finanzas, la salud y el futuro de mi familia. Alineo mis prioridades y decido buscar primero tu Reino y tu justicia.\n\nLléname de tu paz sobrenatural y enséñame a descansar confiado en que tu fidelidad me sostendrá día tras día. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 7,
        "titulo": "Edificar sobre la Roca: La fe que resiste cualquier tormenta",
        "referencia_biblica": "Mateo 7:24-27",
        "autor_contexto": "Autor: El apóstol Mateo. Conclusión culminante y solemne del Sermón del Monte. En la topografía de Galilea y Judea, en la temporada seca los valles parecen planos y arenosos, invitando a construir con rapidez sin cavar demasiado; pero en el invierno, las lluvias torrenciales descienden de las montañas, llenando las ramblas con torrentes violentos que arrasan cualquier edificación sin cimiento profundo. Jesús utiliza esta imagen para advertir sobre la diferencia eterna entre oír su palabra y ponerla por obra.",
        "versiculos_clave": "Pasajes relacionados: Lucas 6:46-49 · 1 Corintios 3:10-15 · Isaías 28:16 · Santiago 1:22-25 · Salmos 18:2 · Proverbios 10:25",
        "predicacion": "Hemos llegado a la conclusión del sermón más extraordinario jamás predicado. Jesús no termina su mensaje con un aplauso ni con una despedida ligera; concluye con una parábola solemne sobre dos hombres, dos casas y una misma tormenta.\n\n\"Cualquiera, pues, que me oye estas palabras, y las hace, le compararé a un hombre prudente, que edificó su casa sobre la roca. Descendió lluvia, y vinieron ríos, y soplaron vientos, y golpearon contra aquella casa; y no cayó, porque estaba fundada sobre la roca\".\n\nObserva con cuidado los paralelismos del relato:\nAmbos hombres tenían el deseo de construir un hogar.\nAmbos hombres escucharon exactamente las mismas enseñanzas de Jesús.\nY sobre ambas casas cayeron las mismas tres pruebas: la lluvia desde arriba, las corrientes de agua desde abajo y los vientos furiosos desde los costados.\n\nLa fe cristiana jamás promete que no habrá tormentas en tu vida. La lluvia del dolor, los ríos de las crisis económicas y los vientos tempestuosos de las pérdidas tocan la puerta de los creyentes igual que la de los no creyentes. La diferencia entre permanecer en pie o derrumbarse en la ruina no está en la ausencia de tormentas, sino en la profundidad del cimiento sobre el cual has construido tu vida.\n\nEl hombre insensato edificó sobre la arena: quería resultados rápidos, sin cavar hondo, sin sudor y sin el costo de la obediencia. Mientras hubo sol, su casa lucía tan bonita y vistosa como la del prudente. Pero cuando llegó el invierno y las aguas crecieron, \"cayó, y fue grande su ruina\".\n\nEl hombre prudente, como explica el evangelio paralelo de Lucas 6:48, \"cavó y ahondó y puso el fundamento sobre la roca\". Cavar duele: implica remover la tierra del orgullo, quebrar las piedras del egoísmo y picar hasta tocar la roca sólida.\n\nLa Roca (*petra*) no es una emoción pasajera; la Roca es la persona inmutable de Jesucristo y la obediencia innegociable a sus mandamientos.\n\nPoner por obra el Sermón del Monte significa perdonar cuando la carne quiere vengarse; significa ser puro cuando el mundo seduce con impureza; significa orar en secreto cuando el ego pide aplauso; y significa amar a los enemigos cuando la sociedad llama a odiar.\n\nAl concluir estos 7 días de estudio en Mateo 5-7, la pregunta que resuena en tu corazón es decisiva: ¿Sobre qué estás edificando tus decisiones diarias? Las tormentas de la vida llegarán, pero cuando tu vida descansa enteramente sobre Cristo Jesús, ninguna tempestad sobre la tierra podrá derrumbar tu paz.",
        "aplicacion": "Revisa tu vida a la luz de estos 7 días de estudio del Sermón del Monte. Elige un área específica (perdón, gratitud, generosidad o pureza) donde hayas estado edificando sobre la arena de tus propias opiniones y decide hoy afincar tu obediencia en la Roca de la Palabra.",
        "pregunta_reflexion": "¿Estás siendo un simple oyente que admira las palabras de Jesús, o un constructor prudente que las pone por obra cada día?",
        "oracion": "Señor Jesucristo, Roca inconmovible de mi salvación y cimiento eterno de mi vida.\n\nGracias por estos 7 días de estudio profundo en el Sermón del Monte. Tu Palabra ha sido como un espejo que me confronta y como una lámpara que alumbra mi sendero.\n\nRenuncio a la insensatez de construir sobre la arena de mis opiniones humanas o de las modas pasajeras de este mundo. Cavo hondo hoy con humildad y afirmo mi hogar, mis proyectos y mi fe sobre la Roca de tu verdad.\n\nVengan lluvias o soplen vientos tempestuosos, sé que sostenido por tu gracia permaneceré firme para la gloria de tu santo nombre. ¡A ti sea el honor, el poder y la alabanza por siempre! Amén."
      }
    ]
  },
  {
    "id": "semilla-estudio-15d-filipenses",
    "titulo": "Filipenses: Gozo inquebrantable en cualquier circunstancia",
    "descripcion": "Un plan quincenal de 15 días sobre la carta del gozo escrita por Pablo desde una prisión en Roma. Aprende el secreto del contentamiento, la fortaleza y la paz de Cristo.",
    "tema": "Gozo y Paz",
    "num_dias": 15,
    "portada_url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80",
    "dias": [
      {
        "numero_dia": 1,
        "titulo": "El que comenzó la buena obra la perfeccionará",
        "referencia_biblica": "Filipenses 1:6",
        "predicacion": "A veces miramos nuestra vida y nos desanimamos al ver cuántas cosas todavía nos faltan por cambiar.\n\nLuchamos con debilidades, caídas y momentos de duda donde nos preguntamos si realmente estamos avanzando espiritualmente.\n\nPero Pablo nos recuerda una verdad reconfortante desde una celda: “Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.”\n\nTu crecimiento espiritual no depende únicamente de tu fuerza de voluntad; depende del compromiso inquebrantable de Dios con tu vida. Dios nunca deja proyectos a medias.\n\nHoy descansa sabiendo que el Autor de tu fe sigue moldeando tu corazón con infinita paciencia y amor.",
        "aplicacion": "Entrega a Dios esa área de tu vida en la que te sientes estancado y dile: “Señor, confío en que tú sigues trabajando en mí”.",
        "pregunta_reflexion": "¿Te desanimas por tus imperfecciones o confías en la fidelidad de Dios para seguir transformándote?",
        "oracion": "Padre celestial, gracias porque no te has rendido conmigo. Confío en que la obra que comenzaste en mi corazón la llevarás a término. Dame paciencia conmigo mismo y fe para seguir creciendo de tu mano. Amén."
      },
      {
        "numero_dia": 2,
        "titulo": "El verdadero sentido de la vida: Para mí el vivir es Cristo",
        "referencia_biblica": "Filipenses 1:21",
        "predicacion": "Todos buscamos un propósito que le dé sentido a nuestros días.\n\nMuchos ponen su razón de vivir en el éxito laboral, el dinero, el reconocimiento o las relaciones. Pero cuando alguna de esas cosas se tambalea, toda la vida parece derrumbarse.\n\nPablo escribe: “Porque para mí el vivir es Cristo, y el morir es ganancia.” Cuando Cristo es el centro de tu existencia, las circunstancias exteriores ya no tienen el poder de quitarte el gozo ni la esperanza.\n\nSi vives para Cristo, cada día de trabajo, cada prueba y cada relación cobran un valor eterno.\n\nHoy alinea tus prioridades y encuentra en Jesús tu mayor tesoro.",
        "aplicacion": "Pregúntate antes de iniciar tus labores: “¿Cómo puedo honrar a Cristo hoy en lo que voy a hacer?” y actúa en coherencia.",
        "pregunta_reflexion": "¿En qué cosas terrenales has estado poniendo tu seguridad o tu valor personal?",
        "oracion": "Señor Jesús, sé tú el centro indiscutible de mi vida. Que mis anhelos, proyectos y decisiones giren en torno a ti. En ti encuentro mi verdadera plenitud. Amén."
      },
      {
        "numero_dia": 3,
        "titulo": "La humildad que transforma: Tomar la actitud de siervo",
        "referencia_biblica": "Filipenses 2:3-5",
        "predicacion": "El orgullo es una de las mayores fuentes de conflicto en nuestras relaciones.\n\nQueremos que los demás nos sirvan, que nos reconozcan y que se haga nuestra voluntad. Pero Jesús nos mostró un camino completamente diferente.\n\n“Nada hagáis por contienda o por vanagloria; antes bien con humildad, estimando cada uno a los demás como superiores a él mismo.” Jesús, siendo Dios, no se aferró a su grandeza sino que se despojó y tomó forma de siervo.\n\nLa verdadera grandeza en el Reino de Dios se mide por la disposición a servir y bendecir a otros sin esperar nada a cambio.\n\nHoy elige la humildad en tu casa y en tu trabajo.",
        "aplicacion": "Haz un servicio humilde hoy por alguien en tu casa o trabajo sin que te lo pidan y sin buscar reconocimiento.",
        "pregunta_reflexion": "¿Buscas tener siempre la razón y el reconocimiento, o estás dispuesto a servir con amor a los demás?",
        "oracion": "Señor Jesús, dame un corazón semejante al tuyo. Quita de mí el orgullo y la vanagloria, y enséñame a amar y servir a quienes me rodean con sincera humildad. Amén."
      },
      {
        "numero_dia": 4,
        "titulo": "Lumbreras en el mundo: Vivir sin quejas",
        "referencia_biblica": "Filipenses 2:14-15",
        "predicacion": "Es muy fácil contagiarse de la queja cuando todos a nuestro alrededor murmuran.\n\nNos quejamos del clima, de los jefes, del tráfico y de las responsabilidades. Pero Pablo nos desafía con ternura: “Haced todo sin murmuraciones y contiendas, para que seáis... lumbreras en el mundo.”\n\nUn creyente que elige dar gracias y mantener una actitud de paz resplandece como una estrella en una noche oscura.\n\nTu testimonio más poderoso no son solo tus palabras los domingos; es tu actitud pacífica y agradecida durante la semana.\n\nHoy decide ser luz donde otros siembran desánimo.",
        "aplicacion": "Proponte no quejarte de nada durante todo este día. Si algo sale mal, respira y busca un motivo de agradecimiento.",
        "pregunta_reflexion": "¿Cómo afecta tu actitud diaria a las personas que conviven contigo?",
        "oracion": "Padre amado, perdóname por las veces que he murmurado y contagiado pesadez. Llena mi boca de gratitud y hazme resplandecer con tu paz en cada lugar donde esté. Amén."
      },
      {
        "numero_dia": 5,
        "titulo": "Prosigo a la meta: Soltar el pasado para abrazar el futuro",
        "referencia_biblica": "Filipenses 3:13-14",
        "predicacion": "No podemos correr bien hacia adelante si vamos mirando hacia atrás todo el tiempo.\n\nMéritos pasados que nos enorgullecen o errores del ayer que nos llenan de culpa son pesos que nos impiden avanzar en la carrera espiritual.\n\nPablo lo dice con convicción: “Olvidando ciertamente lo que queda atrás, y extendiéndome a lo que está delante, prosigo a la meta, al premio del supremo llamamiento de Dios en Cristo Jesús.”\n\nLo que hiciste ayer ya quedó bajo la sangre de Cristo; lo que importa es el paso de fidelidad que das hoy.\n\nHoy suelta el pasado y avanza con fe hacia el propósito que Dios tiene para ti.",
        "aplicacion": "Identifica un remordimiento o fracaso del pasado que aún te pese, entrégalo en oración y decide no volver a castigarte por ello.",
        "pregunta_reflexion": "¿Qué recuerdo o culpa del pasado te está frenando para vivir con plenitud en el presente?",
        "oracion": "Señor, hoy suelto todo lo que quedó atrás: mis errores, mis heridas y mis temores. Miro hacia adelante y corro con perseverancia la carrera que pusiste delante de mí. En Cristo Jesús, amén."
      },
      {
        "numero_dia": 6,
        "titulo": "Nuestra verdadera ciudadanía está en los cielos",
        "referencia_biblica": "Filipenses 3:20",
        "predicacion": "A veces nos angustiamos demasiado por las cosas de este mundo porque olvidamos quiénes somos realmente.\n\nLas noticias, las crisis políticas y los problemas económicos pueden hacernos sentir desamparados. Pero las Escrituras nos recuerdan que estamos de paso por esta tierra.\n\n“Mas nuestra ciudadanía está en los cielos, de donde también esperamos al Salvador, al Señor Jesucristo.”\n\nSaber que perteneces al Reino celestial cambia tu perspectiva: los problemas de hoy son temporales, pero la herencia que tienes en Dios es eterna e inconmovible.\n\nHoy camina con la dignidad y la seguridad de un hijo del Rey de reyes.",
        "aplicacion": "Recuérdate a ti mismo a lo largo del día: “Este problema es pasajero, pero el amor y el Reino de Dios son eternos”.",
        "pregunta_reflexion": "¿Estás viviendo como si esta tierra fuera tu destino final o con la esperanza viva de la eternidad?",
        "oracion": "Padre celestial, gracias porque mi nombre está escrito en los cielos. Ayúdame a no poner mi corazón en lo pasajero, sino a vivir con la mirada puesta en las promesas eternas de Cristo. Amén."
      },
      {
        "numero_dia": 7,
        "titulo": "La paz que cuida tu corazón: De la angustia a la gratitud",
        "referencia_biblica": "Filipenses 4:6-7",
        "predicacion": "La ansiedad busca robarte el descanso susurrándote temores sobre el futuro.\n\nPero Dios te ofrece un refugio seguro: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”\n\nNo guardes tus preocupaciones dentro del pecho; conviértelas en oraciones agradecidas. La paz de Dios es como un centinela celestial apostado a la puerta de tu mente para rechazar el pánico.\n\nHoy no permitas que el afán tome el timón de tu vida.",
        "aplicacion": "Haz una lista de tus 3 preocupaciones actuales y conviértelas en peticiones de gratitud antes de dormir esta noche.",
        "pregunta_reflexion": "¿Pasas más tiempo preocupándote que orando con agradecimiento a Dios?",
        "oracion": "Señor de paz, traigo a tus pies cada carga y pensamiento ansioso. Te doy gracias por tu fidelidad de ayer y descanso seguro en que tú cuidarás de mi mañana. Guarda mi corazón en tu calma. Amén."
      },
      {
        "numero_dia": 8,
        "titulo": "En esto pensad: El filtro que protege tu mente",
        "referencia_biblica": "Filipenses 4:8",
        "predicacion": "Nuestra mente es como un jardín: lo que sembramos en ella es lo que cosecharemos en emociones y acciones.\n\nSi alimentamos la mente con quejas, noticias alarmistas, chismes e impurezas, cosecharemos angustia y amargura. Por eso Pablo nos da un filtro sabio:\n\n“Todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro, todo lo amable, todo lo que es de buen nombre; si hay virtud alguna, si algo digno de alabanza, en esto pensad.”\n\nTú tienes el poder, con la ayuda del Espíritu Santo, de elegir en qué pensamientos te detienes.\n\nHoy llena tu mente de la verdad y las promesas de Dios.",
        "aplicacion": "Cada vez que un pensamiento negativo o destructivo llegue a tu mente hoy, recházalo de inmediato y cámbialo por un versículo o una promesa bíblica.",
        "pregunta_reflexion": "¿Qué tipo de pensamientos has estado permitiendo anidar en tu mente en estos días?",
        "oracion": "Padre Santo, pongo mi mente bajo la autoridad de tu Palabra. Purifica mis pensamientos y ayúdame a enfocarme en lo puro, lo amable y lo que edifica. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 9,
        "titulo": "El secreto del contentamiento en cualquier situación",
        "referencia_biblica": "Filipenses 4:11-12",
        "predicacion": "Tendemos a creer que seremos felices cuando tengamos más dinero, una mejor casa o cuando todos los problemas se hayan resuelto.\n\nPero el apóstol Pablo descubrió un secreto mucho más profundo: “He aprendido a contentarme, cualquiera que sea mi situación. Sé vivir humildemente, y sé tener abundancia... en todo y por todo estoy enseñado.”\n\nEl contentamiento cristiano no es resignación triste; es la convicción de que teniendo a Cristo lo tenemos todo.\n\nLas cosas materiales van y vienen, pero la presencia de Dios permanece fiel en la escasez y en la abundancia.\n\nHoy encuentra tu satisfacción en Dios, no en lo que posees.",
        "aplicacion": "Agradece hoy por 3 cosas básicas que tienes (techo, alimento, salud) y declara que tu gozo depende de Cristo y no de tus posesiones.",
        "pregunta_reflexion": "¿Depende tu paz del saldo de tu cuenta o de la fidelidad permanente de Dios?",
        "oracion": "Señor Jesús, enséñame el secreto del verdadero contentamiento. Que mi gozo y mi seguridad descansen en ti y no en las circunstancias externas. Tú eres mi porción y mi mayor bien. Amén."
      },
      {
        "numero_dia": 10,
        "titulo": "Todo lo puedo en Cristo que me fortalece",
        "referencia_biblica": "Filipenses 4:13",
        "predicacion": "Este es uno de los versículos más conocidos y a veces peor entendidos de la Biblia.\n\nNo significa que podemos conseguir cualquier capricho humano o ganar cualquier trofeo terrenal. En su contexto, significa que cualquiera sea la prueba, la dificultad, la escasez o el sufrimiento que debamos enfrentar, la gracia de Cristo nos dará la fuerza sobrenatural para salir adelante en victoria.\n\nCuando sientas que tus fuerzas se agotan y que la carga es demasiado pesada, recuerda que no estás solo.\n\nEl poder de Dios se perfecciona exactamente en tu debilidad.\n\nHoy camina confiado: la fuerza de Cristo te sostiene.",
        "aplicacion": "Frente a esa tarea o dificultad que sientes que te supera hoy, repite con fe: “No estoy en mis solas fuerzas; Cristo me capacita y me sostiene”.",
        "pregunta_reflexion": "¿En qué área de tu vida necesitas dejar de confiar en tus propias fuerzas y apoyarte en el poder de Cristo?",
        "oracion": "Señor Jesús, cuando mis fuerzas flaqueen, sé tú mi fortaleza. Declaro que en ti puedo soportar la prueba, cumplir mi llamado y caminar con firmeza. Tu gracia me basta. Amén."
      },
      {
        "numero_dia": 11,
        "titulo": "Dios suplirá todo lo que os falta",
        "referencia_biblica": "Filipenses 4:19",
        "predicacion": "La escasez y las deudas pueden generar un temor muy profundo en el corazón de cualquier persona.\n\nPero Pablo da una promesa solemne a los creyentes generosos: “Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.”\n\nObserva que no dice que Dios suplirá según la economía del país o según nuestros limitados cálculos; dice conforme a sus inagotables riquezas en gloria.\n\nDios es un Padre bueno que sabe lo que necesitas antes de que se lo pidas. Tu responsabilidad es ser fiel y generoso; la suya es ser el proveedor infalible de tu casa.\n\nHoy descansa en su fidelidad financiera y material.",
        "aplicacion": "Haz un acto de desprendimiento y generosidad hoy, por pequeño que sea, como testimonio de que confías en la provisión de Dios.",
        "pregunta_reflexion": "¿Le has entregado a Dios tus temores financieros en oración con total confianza?",
        "oracion": "Padre celestial, tú eres Jehová Jireh, mi fiel proveedor. Suelto el afán por las cuentas y el dinero, y descanso en que suplirás todo lo que me falte conforme a tus riquezas en gloria. En Jesús, amén."
      },
      {
        "numero_dia": 12,
        "titulo": "Dios usando las dificultades para bendición",
        "referencia_biblica": "Filipenses 1:12-14",
        "predicacion": "Cuando Pablo cayó preso en Roma, muchos pensaron que el evangelio se había detenido.\n\nSin embargo, Pablo escribió con gozo: “Las cosas que me han sucedido, han redundado más bien para el progreso del evangelio.” Estando en cadenas, los guardias del palacio imperial conocieron a Jesús y los demás hermanos cobraron más valentía para predicar.\n\nDios tiene una forma maravillosa de usar lo que parecía un revés en tu vida para convertirlo en una plataforma de bendición y crecimiento.\n\nLo que el enemigo quiso para desanimarte, Dios lo usará para madurar tu carácter y bendecir a otros.\n\nHoy no juzgues la historia por el capítulo difícil de hoy.",
        "aplicacion": "Mira una situación difícil que hayas vivido y escribe una lección o bendición que Dios haya sacado de ella para tu crecimiento.",
        "pregunta_reflexion": "¿Confías en que Dios puede transformar tus momentos más duros en testimonios de su gloria?",
        "oracion": "Señor, reconozco que tus caminos son más altos que los míos. Aunque hoy no comprenda por qué paso por esta dificultad, confío en que la usarás para mi bien y para tu gloria. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 13,
        "titulo": "Vivir en unidad: Un mismo sentir en el amor",
        "referencia_biblica": "Filipenses 2:1-2",
        "predicacion": "El enemigo siempre busca dividir: dividir los matrimonios, distanciar a las familias y sembrar rencor entre los hermanos en la fe.\n\nPero donde hay unidad sincera, Dios envía bendición y vida eterna. Pablo ruega: “Completad mi gozo, sintiendo lo mismo, teniendo el mismo amor, unánimes, sintiendo una misma cosa.”\n\nLa unidad no significa que todos pensemos idéntico en cada detalle secundario; significa que nuestro amor mutuo en Cristo es más grande que cualquier diferencia de opinión.\n\nHoy busca tender puentes y no levantar muros en tus relaciones.",
        "aplicacion": "Llama o escríbele a un hermano o familiar con quien hayas tenido distancia y exprésale tu aprecio sincero.",
        "pregunta_reflexion": "¿Estás contribuyendo a la paz y unidad en tu entorno o alimentando desacuerdos innecesarios?",
        "oracion": "Señor Jesús, hazme un instrumento de paz y reconciliación. Aleja de mis relaciones la contienda y el distanciamiento, y ayúdanos a caminar con un solo corazón en tu amor. Amén."
      },
      {
        "numero_dia": 14,
        "titulo": "El gozo del Señor como una decisión diaria",
        "referencia_biblica": "Filipenses 4:4",
        "predicacion": "“Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!”\n\nNota que Pablo no dice que nos alegremos en las circunstancias, sino “en el Señor”. Las circunstancias cambian constantemente: hoy sonríen y mañana aprietan. Pero el Señor nunca cambia; su fidelidad, su amor y su victoria en la cruz permanecen inalterables.\n\nEl gozo cristiano no es una risa superficial que ignora el dolor; es un ancla profunda en el alma que sabe que, a pesar de todo, Dios sigue en su trono y tiene el control.\n\nHoy elige el gozo de la salvación por encima de cualquier pesadez del día.",
        "aplicacion": "Pon una alabanza de adoración hoy mientras te preparas o trabajas y permite que el gozo de Dios llene tu hogar.",
        "pregunta_reflexion": "¿De qué depende tu alegría hoy: de lo que sucede a tu alrededor o de quién es Dios en tu vida?",
        "oracion": "Dios amado, decido hoy regocijarme en ti. Gracias por mi salvación, por tu presencia y por tu amor que nunca se apaga. Que tu gozo sea mi fortaleza en este día. Amén."
      },
      {
        "numero_dia": 15,
        "titulo": "La gracia del Señor que te acompaña siempre",
        "referencia_biblica": "Filipenses 4:23",
        "predicacion": "Hemos llegado al final de estos 15 días en la hermosa carta a los Filipenses.\n\nPablo cierra su mensaje con una bendición entrañable: “La gracia de nuestro Señor Jesucristo sea con vuestro espíritu. Amén.”\n\nLa gracia no es solo lo que te salvó al inicio de tu caminar con Dios; es el combustible diario que te da fuerzas para perdonar, para trabajar con alegría, para vencer el enojo y para descansar en medio de la tormenta.\n\nNo terminas este estudio solo; la gracia viva de Jesucristo camina contigo a cada instante.\n\nVe adelante con paz, gozo y la firme certeza de que Dios cuida de tus pasos.",
        "aplicacion": "Anota en tu libreta los 3 aprendizajes más importantes de este estudio de 15 días y dale gracias a Dios por haberte sostenido.",
        "pregunta_reflexion": "¿Cómo ha transformado la carta a los Filipenses tu manera de afrontar las pruebas cotidianas?",
        "oracion": "Señor Jesús, gracias por estos 15 días de estudio, comunión y renovación espiritual. Que tu gracia abundante permanezca sobre mi espíritu cada día. A ti sea toda la gloria, la honra y la alabanza por siempre. Amén."
      }
    ]
  },
  {
    "id": "semilla-estudio-30d-proverbios",
    "titulo": "Proverbios: 30 días de sabiduría para tus decisiones",
    "descripcion": "Un plan mensual de 30 días recorriendo los principios más profundos y prácticos de Proverbios. Sabiduría divina para tus finanzas, palabras, relaciones, trabajo y gobierno del corazón.",
    "tema": "Sabiduría Práctica",
    "num_dias": 30,
    "portada_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    "dias": [
      {
        "numero_dia": 1,
        "titulo": "El principio de la sabiduría: Reverencia ante Dios",
        "referencia_biblica": "Proverbios 1:7",
        "predicacion": "El mundo actual está lleno de información, pero muy necesitado de sabiduría.\n\nPodemos acumular títulos, conocimientos técnicos y datos en nuestro teléfono, pero seguir tropezando en las decisiones más sencillas de la vida familiar y personal.\n\nProverbios 1:7 nos da el cimiento de todo: “El principio de la sabiduría es el temor de Jehová.” Temer a Dios no es tenerle miedo, sino tenerle una reverencia tan profunda que su Palabra pesa más que cualquier opinión humana.\n\nCuando honras a Dios en lo primero de cada día, tus decisiones se llenan de orden, justicia y paz.",
        "aplicacion": "Dedica los primeros 10 minutos de este plan a pedirle a Dios sabiduría humilde para gobernar tu vida este mes.",
        "pregunta_reflexion": "¿Estás buscando sabiduría en las opiniones de este mundo o en la verdad de Dios?",
        "oracion": "Padre de las luces, reconozco que sin ti no sé cómo caminar. Dame un corazón reverente y humilde para recibir tu sabiduría cada día. En Jesús, amén."
      },
      {
        "numero_dia": 2,
        "titulo": "La búsqueda de la sabiduría: Un tesoro invaluable",
        "referencia_biblica": "Proverbios 2:3-6",
        "predicacion": "La verdadera sabiduría no se encuentra por casualidad en el camino.\n\nSalomón nos dice que debemos buscarla “como a la plata, y escudriñarla como a tesoros”. Requiere un corazón dispuesto a escuchar, a corregirse y a meditar en la Palabra con diligencia.\n\n“Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia.” Dios no le niega su guía a quien se la pide con sinceridad.\n\nHoy no tomes decisiones apresuradas; busca el consejo de Dios antes de actuar.",
        "aplicacion": "Anota en una libreta una decisión que debas tomar esta semana y ora pidiendo dirección antes de dar el siguiente paso.",
        "pregunta_reflexion": "¿Dedicas tiempo intencional a buscar la sabiduría de Dios en la oración y la lectura bíblica?",
        "oracion": "Señor, abre mi entendimiento para valorar tu consejo por encima del oro y la plata. Que tus enseñanzas guíen cada una de mis decisiones. Amén."
      },
      {
        "numero_dia": 3,
        "titulo": "Fíate de Jehová con todo tu corazón",
        "referencia_biblica": "Proverbios 3:5-6",
        "predicacion": "A los seres humanos nos encanta apoyarnos en nuestra propia lógica.\n\nQueremos entender exactamente cada detalle antes de avanzar y nos desesperamos cuando los planes toman un rumbo inesperado.\n\nProverbios 3:5-6 nos regala uno de los versículos más reconfortantes de toda la Biblia: “Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.”\n\nConfiar en Dios significa soltar el control del volante y permitir que el Creador guíe la dirección de tu vida.",
        "aplicacion": "Repite este versículo en tu mente tres veces hoy cuando sientas incertidumbre laboral o familiar.",
        "pregunta_reflexion": "¿En qué área de tu vida estás insistiendo en apoyarte en tu propia prudencia?",
        "oracion": "Señor, hoy elijo confiar en ti con todo mi corazón. Renuncio a querer controlarlo todo y te reconozco como el Señor de mis caminos. Endereza mis pasos, amén."
      },
      {
        "numero_dia": 4,
        "titulo": "Sobre toda cosa guardada, guarda tu corazón",
        "referencia_biblica": "Proverbios 4:23",
        "predicacion": "Cuidamos la casa con cerraduras, protegemos el dinero en el banco y ponemos claves en el teléfono celular.\n\nPero muchas veces dejamos nuestro corazón completamente desprotegido ante la amargura, la envidia, el rencor y los pensamientos vanos.\n\n“Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.” De lo que hay en el corazón nacen tus palabras, tus reacciones y las decisiones que marcarán tu destino.\n\nHoy coloca una guardia espiritual sobre tus afectos y tus pensamientos.",
        "aplicacion": "Revisa qué cosas has dejado entrar a tu corazón en estos días (quejas, chismes, envidia) y pídele a Dios que limpie tu interior.",
        "pregunta_reflexion": "¿Qué actitudes o influencias necesitas sacar de tu corazón para mantenerlo puro ante Dios?",
        "oracion": "Crea en mí, oh Dios, un corazón limpio. Guarda mis afectos y mis pensamientos de toda contaminación y amargura. Que de mi vida brote paz y bendición. Amén."
      },
      {
        "numero_dia": 5,
        "titulo": "La diligencia de la hormiga: Sabiduría en el trabajo",
        "referencia_biblica": "Proverbios 6:6-8",
        "predicacion": "La pereza es una ladrona silenciosa de bendición y propósito.\n\nSalomón nos envía a aprender de una criatura pequeña pero ejemplar: “Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán... prepara en el verano su comida.”\n\nLa excelencia y la bendición en la vida no se alcanzan con arranques emocionales de un solo día, sino con la fidelidad en los pequeños esfuerzos cotidianos.\n\nHoy honra a Dios con tu diligencia, tu puntualidad y tu mejor esfuerzo en todo lo que hagas.",
        "aplicacion": "Haz con excelencia y buen ánimo esa tarea laboral o doméstica que te da pereza realizar hoy.",
        "pregunta_reflexion": "¿Estás trabajando como para el Señor en tus responsabilidades diarias o haciendo solo lo mínimo?",
        "oracion": "Padre amado, quita de mí la pereza y el desánimo. Bendice la obra de mis manos y ayúdame a trabajar con integridad, diligencia y alegría para tu gloria. Amén."
      },
      {
        "numero_dia": 6,
        "titulo": "Prudencia al hablar: En las muchas palabras no falta pecado",
        "referencia_biblica": "Proverbios 10:19",
        "predicacion": "Hablar de más es una de las trampas más comunes en las que caemos.\n\nA veces por querer opinar sobre todo o por no saber guardar silencio, terminamos diciendo cosas de las que luego nos arrepentimos.\n\n“En las muchas palabras no falta pecado; mas el que refrena sus labios es prudente.” Las palabras tienen el poder de edificar o de derribar; una persona sabia sabe cuándo hablar y cuándo callar.\n\nHoy sé rápido para escuchar y lento para hablar.",
        "aplicacion": "Hoy practica el arte de escuchar con atención a los demás antes de apresurarte a opinar o juzgar.",
        "pregunta_reflexion": "¿Sueles hablar por impulso en momentos de tensión o te tomas un tiempo para pensar antes de responder?",
        "oracion": "Señor, pon guarda a mi boca y custodia la puerta de mis labios. Que de mi boca solo salgan palabras oportunas, amables y llenas de tu gracia. Amén."
      },
      {
        "numero_dia": 7,
        "titulo": "La balanza justa: Integridad en el trabajo y los tratos",
        "referencia_biblica": "Proverbios 11:1",
        "predicacion": "Vivimos en un mundo donde muchos buscan el atajo fácil y la ventaja deshonesta.\n\nPero Dios mira con deleite a quien actúa con rectitud: “El peso falso es abominación a Jehová; mas la pesa cabal le agrada.”\n\nTu testimonio cristiano se valida cuando eres honesto en los vueltos, en los impuestos, en las horas trabajadas y en los compromisos asumidos. La ganancia deshonesta dura poco y trae dolor; la integridad trae la bendición de Dios que enriquece y no añade tristeza.\n\nHoy camina con transparencia en cada uno de tus tratos.",
        "aplicacion": "Cumple hoy tu palabra en un compromiso pendiente, aunque te cueste tiempo o esfuerzo adicional.",
        "pregunta_reflexion": "¿Eres una persona transparente y confiable en tus finanzas y acuerdos de palabra?",
        "oracion": "Padre justo, ayúdame a ser íntegro en lo público y en lo secreto. Líbrame del engaño y que mi testimonio laboral y personal glorifique tu santo nombre. Amén."
      },
      {
        "numero_dia": 8,
        "titulo": "Palabras que sanan vs. palabras que hieren",
        "referencia_biblica": "Proverbios 12:18",
        "predicacion": "“Hay hombres cuyas palabras son como golpes de espada; mas la lengua de los sabios es medicina.”\n\nCuántas veces hemos sentido el dolor de una frase dura dicha con frialdad por alguien cercano. Y cuántas veces hemos sido nosotros quienes hemos herido con comentarios sarcásticos o despectivos.\n\nEl creyente sabio usa su voz como un bálsamo para consolar al triste, animar al cansado y restaurar al que ha caído.\n\nHoy utiliza tus palabras para curar y no para abrir heridas.",
        "aplicacion": "Pronuncia palabras sinceras de aprecio y gratitud a tres personas distintas a lo largo de tu día.",
        "pregunta_reflexion": "¿Tus palabras diarias dejan a las personas con más paz o con más heridas en el alma?",
        "oracion": "Señor Jesús, limpia mi lenguaje de ironías, ofensas y juicios duros. Haz de mi boca un instrumento de medicina y esperanza para quienes me rodean. Amén."
      },
      {
        "numero_dia": 9,
        "titulo": "El valor de las buenas compañías",
        "referencia_biblica": "Proverbios 13:20",
        "predicacion": "Las personas con las que compartimos nuestro tiempo más íntimo influyen profundamente en nuestro carácter y en nuestras decisiones.\n\n“El que anda con sabios, sabio será; mas el que se junta con necios, será quebrantado.”\n\nSi te rodeas de personas que se quejan, que critican y que viven en el pecado, poco a poco tu corazón se enfriará. Pero si caminas junto a personas que aman a Dios y buscan el bien, tu fe se fortalecerá día a día.\n\nHoy cuida tu círculo cercano y sé también una influencia de bendición para otros.",
        "aplicacion": "Dedica tiempo hoy a conversar con una persona madura en la fe que aporte consejo sabio a tu vida.",
        "pregunta_reflexion": "¿Tus amistades más cercanas te acercan a Dios o te alejan de sus caminos?",
        "oracion": "Dios mío, dame discernimiento para elegir mis amistades y sabiduría para ser una influencia de bendición y luz en medio de mi entorno. En Jesús, amén."
      },
      {
        "numero_dia": 10,
        "titulo": "La sabiduría que edifica el hogar",
        "referencia_biblica": "Proverbios 14:1",
        "predicacion": "La familia es el tesoro más preciado que Dios nos ha confiado en esta tierra.\n\n“La mujer sabia edifica su casa; mas la necia con sus manos la derriba.” Y este principio se aplica a cada miembro del hogar: con nuestras actitudes diarias podemos edificar un ambiente de paz y amor, o destruirlo con quejas, gritos y desatención.\n\nUn hogar bendecido no es aquel donde nunca hay problemas, sino aquel donde reina el perdón, la paciencia y la presencia de Dios.\n\nHoy siembra amor y comprensión en tu casa.",
        "aplicacion": "Haz algo especial por tu familia hoy: una muestra de afecto, una comida compartida con gratitud o una palabra de bendición.",
        "pregunta_reflexion": "¿Estás edificando tu hogar con paciencia y amor, o permitiendo que las tensiones cotidianas lo desgasten?",
        "oracion": "Señor Jesús, bendice mi hogar y mi familia. Danos sabiduría para edificar en amor, perdonarnos con prontitud y hacer de nuestra casa un refugio de paz. Amén."
      },
      {
        "numero_dia": 11,
        "titulo": "La paciencia: Grande de entendimiento",
        "referencia_biblica": "Proverbios 14:29",
        "predicacion": "“El que tarda en airarse es grande de entendimiento; mas el que es impaciente de espíritu enaltece la necedad.”\n\nQué fácil es perder los estribos cuando las cosas no salen a nuestro ritmo. Vivimos en la cultura de lo inmediato y la impaciencia nos hace tomar decisiones impulsivas de las que luego nos arrepentimos.\n\nLa paciencia no es resignación pasiva; es la madurez espiritual que sabe esperar el tiempo oportuno de Dios y gobernar las emociones con dominio propio.\n\nHoy pide la gracia de ser paciente ante las demoras del día.",
        "aplicacion": "Cuando sientas que la prisa o la impaciencia te ganan hoy, respira hondo, sonríe y recuerda que los tiempos de Dios son perfectos.",
        "pregunta_reflexion": "¿En qué situación puntual estás perdiendo la paciencia en estos días?",
        "oracion": "Padre celestial, quebranta mi impaciencia y enséñame a esperar con serenidad. Dame un espíritu apacible que no se turbe ante los retrasos cotidianos. Amén."
      },
      {
        "numero_dia": 12,
        "titulo": "La respuesta blanda que aplaca la ira",
        "referencia_biblica": "Proverbios 15:1",
        "predicacion": "Cuando alguien nos habla con dureza o agresión, el fuego quiere apagarse con más fuego.\n\nPero Proverbios 15:1 nos da una de las lecciones más prácticas de relaciones humanas: “La blanda respuesta quita la ira; mas la palabra áspera hace subir el furor.”\n\nResponder con calma ante una provocación no es debilidad; es demostrar que tus emociones no están a merced de lo que otros hagan o digan, sino bajo el gobierno de Cristo.\n\nHoy desarma la tensión con amabilidad y mansedumbre.",
        "aplicacion": "Si alguien te habla con tono áspero hoy, responde con serenidad y cortesía. Observa cómo cambia la atmósfera.",
        "pregunta_reflexion": "¿Sueles apagar los incendios de la discusión o echarles más leña con respuestas cortantes?",
        "oracion": "Señor, dame la gracia de una respuesta blanda y oportuna. Quita de mí la necesidad de ganar discusiones y ayúdame a ser un pacificador en todo momento. Amén."
      },
      {
        "numero_dia": 13,
        "titulo": "Mejor es lo poco con el temor de Jehová",
        "referencia_biblica": "Proverbios 15:16",
        "predicacion": "“Mejor es lo poco con el temor de Jehová, que el gran tesoro donde hay turbación.”\n\nCuántas personas acumulan riquezas inmensas a costa de su salud mental, su matrimonio y su paz espiritual. Tener bienes no está mal, pero ninguna cantidad de dinero puede comprar la paz que solo Dios da al corazón.\n\nLa verdadera riqueza consiste en acostarse en la noche con la conciencia limpia, el corazón agradecido y la confianza puesta en Dios.\n\nHoy valora la paz de Dios por encima de cualquier ganancia terrenal.",
        "aplicacion": "Agradece a Dios por la sencillez de tu vida y pídele que nunca te falte la paz que el dinero no puede comprar.",
        "pregunta_reflexion": "¿Estás sacrificando tu paz espiritual o familiar por alcanzar metas materiales pasajeras?",
        "oracion": "Padre bueno, gracias por tu provisión diaria. Que mi mayor tesoro sea siempre tu presencia en mi vida y la paz que guardas en mi corazón. En Jesús, amén."
      },
      {
        "numero_dia": 14,
        "titulo": "Encomienda a Jehová tus obras y proyectos",
        "referencia_biblica": "Proverbios 16:3",
        "predicacion": "Hacemos planes y soñamos con el futuro, pero la ansiedad aparece cuando queremos controlar cada detalle y resultado.\n\n“Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.”\n\nEncomendar significa soltar el control y confiar en que Dios sabe mejor que nosotros lo que nos conviene. Cuando le entregas tus planes, Él te da claridad, alinea tu corazón y te llena de serenidad, incluso si los caminos toman rumbos diferentes a los previstos.\n\nHaz lo que esté en tus manos con diligencia, pero descansa sabiendo que el resultado final le pertenece a Dios.",
        "aplicacion": "Escribe los 3 planes que más te preocupan y dile a Dios: “Señor, te los entrego; confío en tu dirección más que en mis fuerzas”.",
        "pregunta_reflexion": "¿Qué proyecto estás intentando controlar por ti mismo en lugar de encomendárselo a Dios?",
        "oracion": "Señor, pongo en tus manos mis planes, mi trabajo y mis anhelos. Afirma mis pensamientos y dame paz para descansar en tu perfecta voluntad. Amén."
      },
      {
        "numero_dia": 15,
        "titulo": "El corazón planea, pero Dios endereza los pasos",
        "referencia_biblica": "Proverbios 16:9",
        "predicacion": "“El corazón del hombre piensa su camino; mas Jehová endereza sus pasos.”\n\nCuántas veces hemos tenido un plan perfectamente trazado que de pronto cambia por completo: una puerta cerrada, un cambio de empleo o un traslado inesperado.\n\nEn esos momentos es fácil frustrarse. Pero recuerda: cuando una puerta se cierra en la voluntad de Dios, es porque Él te está librando de un tropiezo o preparándote para un camino mejor.\n\nHoy confía en que Dios está guiando tus pasos aun en los desvíos del camino.",
        "aplicacion": "Acepta con paz un cambio de planes que hayas experimentado recientemente, sabiendo que Dios cuida tu destino.",
        "pregunta_reflexion": "¿Te enojas cuando las cosas no salen como planeabas o buscas ver la mano de Dios en el proceso?",
        "oracion": "Señor, guíame por el camino que tú tienes diseñado para mí. Endereza mis pasos y ayúdame a confiar en que tus planes son siempre de bienestar. Amén."
      },
      {
        "numero_dia": 16,
        "titulo": "La trampa del orgullo: La humildad que precede a la honra",
        "referencia_biblica": "Proverbios 16:18",
        "predicacion": "“Antes del quebrantamiento es la soberbia, y antes de la caída la altivez de espíritu.”\n\nEl orgullo nos hace creer que no necesitamos la ayuda de nadie ni el consejo de Dios. Nos vuelve ciegos ante nuestros propios errores y nos hace juzgar a los demás con severidad.\n\nPero la humildad es la llave que abre los tesoros de la gracia. Dios resiste a los soberbios, pero da gracia a los humildes.\n\nHoy camina con sencillez de corazón, reconociendo que todo lo que tienes y eres proviene de Dios.",
        "aplicacion": "Pide perdón con humildad si tuviste una actitud altiva con alguien recientemente.",
        "pregunta_reflexion": "¿En qué aspecto de tu vida se manifiesta más tu orgullo o autosuficiencia?",
        "oracion": "Padre amado, quita de mí toda altivez y orgullo. Dame un corazón manso y humilde como el de Jesús, que reconozca mi necesidad constante de tu gracia. Amén."
      },
      {
        "numero_dia": 17,
        "titulo": "El verdadero amigo en el día de la angustia",
        "referencia_biblica": "Proverbios 17:17",
        "predicacion": "“En todo tiempo ama el amigo, y es como un hermano en tiempo de angustia.”\n\nEn los días de fiesta y prosperidad abundan los conocidos. Pero en los días difíciles, cuando la enfermedad golpea o los recursos escasean, se conoce a los verdaderos amigos.\n\nJesús es el amigo supremo que nunca te abandona, pero también nos llama a nosotros a ser ese tipo de amigos fieles para los demás.\n\nHoy no esperes a que te busquen; sé tú ese hermano de bendición para alguien que sufre.",
        "aplicacion": "Comunícate hoy con un amigo o hermano que esté pasando por una prueba y acompáñalo con oración y presencia.",
        "pregunta_reflexion": "¿Eres el tipo de amigo leal en quien otros pueden apoyarse en momentos difíciles?",
        "oracion": "Señor Jesús, gracias por ser mi amigo fiel que nunca me desampara. Enséñame a amar a mis hermanos con lealtad y compasión en todo tiempo. Amén."
      },
      {
        "numero_dia": 18,
        "titulo": "El corazón alegre es una buena medicina",
        "referencia_biblica": "Proverbios 17:22",
        "predicacion": "“El corazón alegre constituye buen remedio; mas el espíritu triste seca los huesos.”\n\nLa ciencia moderna ha confirmado lo que la Biblia enseñó hace miles de años: la amargura y la tristeza constante desgastan el cuerpo, bajan las defensas y agotan la vitalidad.\n\nEl gozo en el Señor es una fuerza vivificante. Reír con tu familia, dar gracias por las pequeñas cosas y descansar en las promesas de Dios sana el alma y renueva el cuerpo.\n\nHoy no permitas que la pesadez te robe la alegría de vivir.",
        "aplicacion": "Comparte un momento de risa sana y conversación alegre con tu familia o amigos hoy.",
        "pregunta_reflexion": "¿Has permitido que la queja y el desánimo marchiten la alegría en tu hogar?",
        "oracion": "Señor, devuélveme el gozo de tu salvación. Llena mi corazón de una alegría santa que sea medicina para mi cuerpo y esperanza para quienes me rodean. Amén."
      },
      {
        "numero_dia": 19,
        "titulo": "Torre fuerte es el nombre de Jehová",
        "referencia_biblica": "Proverbios 18:10",
        "predicacion": "En tiempos antiguos, cuando un ejército atacaba, los habitantes corrían a refugiarse dentro de la torre más fuerte de la ciudad.\n\n“Torre fuerte es el nombre de Jehová; a él correrá el justo, y será levantado.”\n\nCuando los problemas, los temores o las malas noticias te rodeen, no corras hacia la desesperación ni busques refugio en lo pasajero. Corre a los brazos de Dios en oración.\n\nEn su presencia estás seguro y ningún enemigo podrá derribar tu alma.",
        "aplicacion": "Cuando sientas miedo o presión hoy, di en voz alta: “Dios es mi torre fuerte; en Él estoy seguro”.",
        "pregunta_reflexion": "¿A dónde corres primero cuando los problemas tocan a tu puerta?",
        "oracion": "Señor Todopoderoso, tú eres mi refugio seguro y mi torre inexpugnable. En tus manos descanso y en tu presencia encuentro toda la paz que necesito. Amén."
      },
      {
        "numero_dia": 20,
        "titulo": "El poder de vida y muerte en la lengua",
        "referencia_biblica": "Proverbios 18:21",
        "predicacion": "“La muerte y la vida están en poder de la lengua, y el que la ama comerá de sus frutos.”\n\nCada palabra que sale de tu boca siembra una semilla. Puedes sembrar palabras de fe, ánimo y bendición sobre tus hijos, tu cónyuge y tu trabajo; o puedes sembrar derrota, crítica y pesimismo.\n\nLa persona sabia comprende el peso de lo que habla y elige usar su voz para declarar las verdades de Dios.\n\nHoy edifica y no destruyas con tus palabras.",
        "aplicacion": "Bendice explícitamente a tus seres queridos hoy con palabras de afirmación y cariño.",
        "pregunta_reflexion": "¿Qué tipo de frutos estás cosechando hoy por las palabras que has sembrado?",
        "oracion": "Espíritu Santo, pon un filtro en mis labios. Que cada palabra que pronuncie hoy transmita vida, esperanza y amor a quienes me escuchan. Amén."
      },
      {
        "numero_dia": 21,
        "titulo": "Muchos pensamientos, pero el consejo de Dios permanece",
        "referencia_biblica": "Proverbios 19:21",
        "predicacion": "“Muchos pensamientos hay en el corazón del hombre; mas el consejo de Jehová permanecerá.”\n\nNuestra mente produce miles de pensamientos e ideas al día: dudas, suposiciones, planes y temores. Muchos de ellos se desvanecen con el tiempo.\n\nPero lo que Dios ha determinado para tu vida permanece firme para siempre. Ninguna circunstancia adversa puede frustrar el propósito eterno de Dios si tú caminas en fidelidad con Él.\n\nHoy descansa en la solidez de sus promesas inmutables.",
        "aplicacion": "Alinea un pensamiento de temor que tengas hoy con una promesa eterna de la Biblia.",
        "pregunta_reflexion": "¿Te dejas llevar por pensamientos pasajeros o afirmas tu vida en la Palabra de Dios?",
        "oracion": "Padre soberano, aunque mis pensamientos fluctúen, descanso en la firmeza de tu consejo eterno. Cumple en mí tu santo propósito. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 22,
        "titulo": "Vence la tentación de la venganza",
        "referencia_biblica": "Proverbios 20:22",
        "predicacion": "“No digas: Yo me vengaré; espera a Jehová, y él te salvará.”\n\nCuando alguien nos trata con injusticia o nos hace daño, el deseo de responder y pagar con la misma moneda puede ser muy intenso.\n\nPero tomar la venganza en nuestras manos solo nos llena de amargura y nos pone al mismo nivel del ofensor. Dejar la justicia en manos de Dios es el acto más valiente de fe.\n\nDios ve todo lo que sucede y Él cuidará de ti con perfecta justicia y amor.",
        "aplicacion": "Renuncia hoy formalmente en oración a cualquier deseo de venganza hacia quien te lastimó.",
        "pregunta_reflexion": "¿Estás guardando deseos de revancha o confiando en la justicia perfecta de Dios?",
        "oracion": "Señor justo, te entrego las ofensas que he recibido. Renuncio a la venganza y elijo perdonar. Sé tú mi defensor y guarda mi corazón en paz. Amén."
      },
      {
        "numero_dia": 23,
        "titulo": "Dios pesa los corazones",
        "referencia_biblica": "Proverbios 21:2",
        "predicacion": "“Todo camino del hombre es recto en su propia opinión; pero Jehová pesa los corazones.”\n\nEs fácil justificar nuestras actitudes ante nosotros mismos. Nos convencemos de que teníamos la razón o de que nuestra reacción era inevitable.\n\nPero Dios no solo mira lo que hacemos por fuera; Él pesa los motivos profundos del corazón: el amor, la intención secreta y la sinceridad.\n\nHoy pídele a Dios que examine tus motivaciones para que todo lo que hagas sea agradable a sus ojos.",
        "aplicacion": "Examina con sinceridad antes de dormir por qué hiciste las cosas hoy: ¿por vanagloria o por amor a Dios?",
        "pregunta_reflexion": "¿Te conformas con parecer recto ante los demás o buscas un corazón puro ante Dios?",
        "oracion": "Examíname, oh Dios, y conoce mi corazón; pruébame y conoce mis pensamientos. Y ve si hay en mí camino de perversidad, y guíame en el camino eterno. Amén."
      },
      {
        "numero_dia": 24,
        "titulo": "El buen nombre vale más que las muchas riquezas",
        "referencia_biblica": "Proverbios 22:1",
        "predicacion": "“De más estima es el buen nombre que las muchas riquezas, y la buena fama más que la plata y el oro.”\n\nEl dinero se puede ganar, perder y volver a conseguir. Pero la reputación de honestidad, lealtad y rectitud toma toda una vida construirla y puede destruirse en un segundo de compromiso con el pecado.\n\nCuidar tu buen nombre significa ser la misma persona en la luz que en la oscuridad.\n\nHoy valora tu integridad moral y espiritual por encima de cualquier beneficio pasajero.",
        "aplicacion": "Actúa con absoluta honestidad en una situación donde nadie más te esté vigilando.",
        "pregunta_reflexion": "¿Es tu reputación un testimonio creíble del evangelio de Jesús?",
        "oracion": "Señor Jesús, concédeme la gracia de vivir con integridad irreprensible. Que mi vida honre tu nombre y sea testimonio de tu verdad dondequiera que vaya. Amén."
      },
      {
        "numero_dia": 25,
        "titulo": "Instruir con amor: El legado para los hijos",
        "referencia_biblica": "Proverbios 22:6",
        "predicacion": "“Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.”\n\nEl mayor legado que podemos dejar a las siguientes generaciones no son bienes materiales ni títulos académicos, sino el conocimiento y el amor a Dios sembrados en el corazón.\n\nLos niños aprenden más de lo que ven en nuestra conducta diaria que de lo que escuchan en nuestros discursos. Tu ejemplo de oración, perdón y amor en casa es la mayor escuela espiritual.\n\nHoy siembra la Palabra de Dios en la vida de tus hijos y jóvenes cercanos.",
        "aplicacion": "Aparta 10 minutos para orar con tus hijos o por las siguientes generaciones de tu familia.",
        "pregunta_reflexion": "¿Qué ejemplo espiritual estás transmitiendo en tu hogar día con día?",
        "oracion": "Padre celestial, bendice a nuestros hijos y a las nuevas generaciones. Danos sabiduría a los padres para instruirlos con amor y testimonio en tus santos caminos. Amén."
      },
      {
        "numero_dia": 26,
        "titulo": "Siete veces cae el justo y vuelve a levantarse",
        "referencia_biblica": "Proverbios 24:16",
        "predicacion": "“Porque siete veces cae el justo, y vuelve a levantarse; mas los impíos caerán en el mal.”\n\nSer un creyente fiel no significa que nunca tropezarás ni enfrentarás desánimo. Habrá días en que falles, temporadas difíciles y momentos en que sientas que no puedes continuar.\n\nPero la marca de los hijos de Dios no es la ausencia de caídas, sino la gracia que los levanta del suelo una y otra vez.\n\nSi hoy has caído o te sientes derrotado, no te quedes en el suelo de la culpa. La mano de Dios está extendida para levantarte y darte un nuevo comienzo.",
        "aplicacion": "Levántate hoy de ese desánimo: confiésale a Dios tu falla, recibe su perdón y da el siguiente paso con fe.",
        "pregunta_reflexion": "¿Te estás quedando en el suelo por la culpa de un error o aceptando la gracia de Dios para continuar?",
        "oracion": "Señor Jesús, gracias porque tu misericordia me levanta cuando caigo. Tomo tu mano poderosa, sacudo el desánimo y sigo adelante en tu victoria. Amén."
      },
      {
        "numero_dia": 27,
        "titulo": "Hierro con hierro se aguza: El valor del consejo sabio",
        "referencia_biblica": "Proverbios 27:17",
        "predicacion": "“Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.”\n\nNadie puede crecer espiritualmente en el aislamiento. Necesitamos de hermanos en la fe que nos animen cuando estamos cansados, pero que también tengan la valentía y el amor para corregirnos cuando nos estamos desviando.\n\nEl consejo sabio de un amigo maduro pule nuestro carácter y nos ayuda a ver lo que nosotros mismos no podemos percibir.\n\nHoy sé dócil para recibir consejo y edificación mutua.",
        "aplicacion": "Acepta con gratitud una sugerencia o corrección que alguien te dé hoy sin molestarte ni ponerte a la defensiva.",
        "pregunta_reflexion": "¿Tienes amigos de confianza en la fe que puedan hablar con sinceridad a tu vida?",
        "oracion": "Señor, líbrame de la terquedad y el aislamiento. Rodéame de personas sabias que afilen mi vida en tu verdad y dame humildad para escuchar su consejo. Amén."
      },
      {
        "numero_dia": 28,
        "titulo": "Confesar y apartarse: El camino de la misericordia",
        "referencia_biblica": "Proverbios 28:13",
        "predicacion": "“El que encubre sus pecados no prosperará; mas el que los confiesa y se aparta alcanzará misericordia.”\n\nIntentar esconder nuestras faltas bajo la alfombra solo produce sequedad espiritual, culpa y distancia de Dios.\n\nPero cuando venimos a la presencia del Señor con total transparencia, admitiendo nuestras debilidades y con el deseo sincero de apartarnos de ellas, encontramos un océano inagotable de misericordia y perdón.\n\nHoy vive en la luz de la verdad de Dios.",
        "aplicacion": "Ten un momento de confesión sincera a solas con Dios, soltando cualquier pecado oculto que te haya estado robando la paz.",
        "pregunta_reflexion": "¿Estás intentando ocultar alguna lucha o trayéndola a la luz de la gracia de Cristo?",
        "oracion": "Padre de amor, vengo a ti con el corazón al descubierto. Confieso mis faltas y te pido que limpies mi vida. Dame la fuerza para apartarme del mal y caminar en tu santidad. Amén."
      },
      {
        "numero_dia": 29,
        "titulo": "El temor al hombre vs. la confianza en Dios",
        "referencia_biblica": "Proverbios 29:25",
        "predicacion": "“El temor del hombre pondrá lazo; mas el que confía en Jehová estará seguro.”\n\nPreocuparnos excesivamente por el qué dirán, por quedar bien con los demás o por el miedo al rechazo es una trampa que paraliza nuestra vida espiritual.\n\nCuando tu mayor deseo es agradar a Dios, el miedo a la opinión de los hombres pierde todo su poder. La única aprobación que realmente define tu vida y tu destino es la de tu Padre celestial.\n\nHoy sé libre del temor a las personas y descansa seguro en Dios.",
        "aplicacion": "Toma hoy una decisión guiada por tus convicciones en Cristo, sin dejarte presionar por las expectativas ajenas.",
        "pregunta_reflexion": "¿Estás tomando decisiones para complacer a las personas o para honrar a Dios?",
        "oracion": "Señor, líbrame del lazo del temor a la opinión humana. Que mi mayor pasión sea agradarte a ti y que en tu amor perfecto encuentre mi total seguridad. Amén."
      },
      {
        "numero_dia": 30,
        "titulo": "La belleza que permanece: La reverencia a Dios",
        "referencia_biblica": "Proverbios 31:30",
        "predicacion": "“Engañosa es la gracia, y vana la hermosura; la mujer que teme a Jehová, esa será alabada.”\n\nHemos completado 30 días recorriendo los tesoros del libro de Proverbios. El mundo gasta fortunas en la apariencia exterior, pero las arrugas llegan y las modas pasan.\n\nLo que nunca pierde su valor ni su resplandor es un corazón que ama, reverencia y obedece a Dios. La belleza interior del espíritu apacible, sabio y generoso perdura por toda la eternidad.\n\nQue la sabiduría de estos 30 días guíe cada uno de tus pasos a partir de hoy.",
        "aplicacion": "Agradece a Dios por haber completado este mes de sabiduría y elige tres proverbios para repasar frecuentemente en tu vida.",
        "pregunta_reflexion": "¿Cómo ha transformado el libro de Proverbios tu forma de hablar, trabajar y relacionarte con los demás?",
        "oracion": "Señor Dios todopoderoso, gracias por estos 30 días de profunda sabiduría y dirección. Graba tus principios en la tabla de mi corazón para que camine con prudencia, justicia y paz todos los días de mi vida. ¡A ti sea la gloria por siempre! Amén."
      }
    ]
  },
  {
    "id": "semilla-estudio-7d-santiago",
    "titulo": "Santiago: La Fe Viva en el Mundo Real",
    "descripcion": "Un recorrido exegético profundo de 7 días versículo a versículo por la carta de Santiago. Aprende a convertir las pruebas en madurez espiritual, frenar la lengua, vencer el doble ánimo, demostrar tu fe con obras de misericordia y activar la oración eficaz.",
    "tema": "Libros Bíblicos",
    "num_dias": 7,
    "portada_url": "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
    "dias": [
      {
        "numero_dia": 1,
        "titulo": "El gozo en medio de las pruebas: La forja de la constancia",
        "referencia_biblica": "Santiago 1:2-4, 12",
        "autor_contexto": "Autor: Santiago (Jacobo), hermano del Señor Jesús y pastor principal de la iglesia de Jerusalén (Hechos 15; Gálatas 2:9). Escribe a las \"doce tribus de la dispersión\", creyentes de trasfondo judío desterrados, empobrecidos y perseguidos en el imperio romano. Con tono pastoral firme y directo, Santiago aborda la dura realidad del sufrimiento cristiano, no desde una filosofía académica, sino desde las trincheras de la prueba.",
        "versiculos_clave": "Pasajes relacionados: Romanos 5:3-5 · 1 Pedro 1:6-7 · Habacuc 3:17-19 · 2 Corintios 12:9-10 · Hebreos 12:11 · Salmos 66:10-12",
        "predicacion": "Santiago inicia su carta con una exhortación desconcertante para la mentalidad humana: \"Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas\".\n\nEl apóstol no dice \"si por casualidad os halláis\", sino \"cuando os halléis\". La adversidad en la vida cristiana no es un accidente imprevisto; es una cita inevitable en el camino de la santificación. En el griego koiné, el término para pruebas es *peirasmois*, que alude tanto a presiones externas (pobreza, calumnias, enfermedades, pérdidas) como a dilemas morales interiores.\n\n¿Cómo es posible experimentar \"sumo gozo\" (*pasan charan*) ante el dolor? Santiago no promueve una resignación estoica ni un fingimiento emocional. El gozo del creyente no brota del dolor en sí mismo, sino de saber con certeza que Dios gobierna la prueba con un propósito redentor inamovible.\n\n\"Sabiendo que la prueba de vuestra fe produce paciencia\". La palabra griega para paciencia es *hypomoné*, compuesta por *hypo* (debajo) y *menō* (permanecer). No denota una pasividad resignada o cobarde; describe la resistencia heroica de un soldado que sostiene con firmeza la línea de batalla bajo una lluvia de flechas enemigas, negándose a desertar.\n\nEn la antigüedad, el oro se sometía al fuego ardiente del crisol para que todas las impurezas y escorias subieran a la superficie y fueran retiradas por el orfebre. El fuego no tiene como objetivo destruir el oro, sino evidenciar su valor y reflejar en él el rostro del artesano.\n\nDe igual manera, Dios permite que las circunstancias difíciles desmantelen nuestras falsas muletas, nuestro orgullo y nuestras autosuficiencias, hasta que lo único que nos quede sea Cristo.\n\n\"Mas tenga la paciencia su obra completa, para que seáis perfectos y cabales, sin que os falte cosa alguna\". Aquí \"perfectos\" traduce *teleioi*, que significa maduros, íntegros, que han alcanzado la plenitud de su diseño en Dios.\n\nUn creyente que huye de toda incomodidad permanece en una infancia espiritual perpetua: caprichoso, reactivo e incapaz de consolar a otros. Pero quien abraza la disciplina del Padre se convierte en un roble inamovible de fe.\n\nSantiago corona este principio con una promesa gloriosa en el versículo 12: \"Bienaventurado el varón que soporta la tentación; porque cuando haya resistido la prueba, recibirá la corona de vida, que Dios ha prometido a los que le aman\".\n\nLa prueba temporal tiene fecha de vencimiento; pero la gloria y la corona que forja en tu carácter son eternas. Cuando sientas que la carga arrecia, recuerda: Dios no te ha abandonado en el horno; está a tu lado calibrando la temperatura para que salgas resplandeciendo como oro puro.",
        "aplicacion": "Identifica la situación más difícil o frustrante que estés atravesando en estos momentos. Pasa 5 minutos en silencio renunciando a la queja y dile a Dios en voz alta: \"Señor, no entiendo todo este proceso, pero decido gozarme en que estás formando en mí la constancia y el carácter de Cristo\".",
        "pregunta_reflexion": "¿Estás viendo tus dificultades presentes como un obstáculo destructivo o como el taller divino donde Dios está forjando tu madurez espiritual?",
        "oracion": "Padre misericordioso y Soberano de mi vida, me postro ante ti reconociendo que muchas veces me quejo cuando las cosas se tornan difíciles y contrarias a mis planes.\n\nPerdóname por buscar una fe cómoda y sin cruz. Hoy te pido que derrames en mi espíritu la fuerza sobrenatural de la *hypomoné*, esa constancia inquebrantable que resiste afianzada en tus promesas.\n\nPurifícame en el crisol de la prueba. Quita de mí toda autosuficiencia, orgullo y apego a lo terrenal. Que cuando salgas a mi encuentro, veas reflejado en mí el carácter de tu amado Hijo Jesucristo.\n\nAfírmame en la bienaventuranza eterna y recuérdame que mi galardón eres tú. En el nombre poderoso de Jesús, amén."
      },
      {
        "numero_dia": 2,
        "titulo": "Pedir sabiduría sin dudar: Vencer el doble ánimo",
        "referencia_biblica": "Santiago 1:5-8",
        "autor_contexto": "Autor: Santiago. En este pasaje, el apóstol aborda una necesidad crítica: cuando estamos bajo fuego en medio de la prueba, fácilmente podemos caer en la confusión, el pánico y las decisiones erráticas. Con un profundo conocimiento de la literatura sapiencial del Antiguo Testamento (como Proverbios y Job), Santiago nos indica a dónde acudir por socorro.",
        "versiculos_clave": "Pasajes relacionados: Proverbios 2:3-6 · 1 Reyes 3:9 · Efesios 1:17 · Salmos 25:4-5 · Marcos 11:24 · Mateo 7:7-11",
        "predicacion": "Cuando una crisis golpea nuestras vidas, el primer instinto humano suele ser buscar respuestas inmediatas en el dinero, en los contactos influyentes o en las opiniones de internet.\n\nSin embargo, Santiago nos enseña que lo que más urgentemente necesitamos en la encrucijada no es simplemente un cambio de circunstancias, sino sabiduría de lo alto: \"Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada\".\n\nLa sabiduría bíblica (*sophia*) no es mera acumulación de conocimientos teóricos o inteligencia académica; es la habilidad espiritual para percibir la vida desde la perspectiva de Dios y tomar decisiones que honren su nombre en el mundo real.\n\nObserva el corazón generoso de nuestro Padre celestial: Él da \"abundantemente\" (*haplōs*, generosamente, sin condiciones mezquinas) y \"sin reproche\" (*mē oneidizontos*). Dios no te saca en cara tus errores del pasado ni se burla de tu ignorancia cuando vienes a su presencia pidiendo dirección.\n\nPero el texto añade una advertencia ineludible: \"Pero pida con fe, no dudando nada; porque el que duda es semejante a la onda del mar, que es arrastrada por el viento y echada de una parte a otra\".\n\nLa duda a la que se refiere Santiago no es la lucha honesta de un creyente sincero que busca confirmación; es el verbo *diakrinómenos*, que describe una deliberación interna entre dos lealtades opuestas. Es la persona que consulta a Dios, pero al mismo tiempo tiene un plan alternativo por si la respuesta divina le parece incómoda o costosa.\n\n\"No piense, pues, quien tal haga, que recibirá cosa alguna del Señor. El hombre de doble ánimo es inconstante en todos sus caminos\".\n\nLa palabra para \"doble ánimo\" es *dipsyjos*, un vocablo creado por el propio Santiago que significa literalmente \"dos almas\": una persona con el corazón fracturado entre dos señores. Quiere la paz de Dios los domingos, pero el aplauso y la ética del mundo de lunes a sábado.\n\nQuien vive en esa división interior se vuelve errático en sus finanzas, en su matrimonio, en su vida devocional y en su liderazgo. Es arrastrado por la última tendencia cultural como las olas que rompen en los acantilados.\n\nDios busca creyentes de un solo corazón: hombres y mujeres que digan: \"Señor, ya he tomado la decisión de obedecerte; ahora muéstrame el camino por el que debo andar\". Cuando oras con esa entrega sin reservas, el cielo abre sus tesoros de discernimiento y paz.",
        "aplicacion": "Identifica una decisión importante o dilema que debas resolver en estos días. Antes de tomar una determinación apresurada, aparta un momento de oración y di con total entrega: \"Señor, no voy a negociar con mi propia conveniencia; me comprometo a hacer tu voluntad sea cual sea\".",
        "pregunta_reflexion": "¿Estás consultando a Dios con una disposición sincera y decidida a obedecer, o sólo esperando que Dios apruebe lo que tus propios deseos ya escogieron?",
        "oracion": "Padre de las luces, de quien desciende todo don perfecto y toda buena dádiva, reconozco ante ti mi falta de sabiduría natural.\n\nConfieso que tantas veces me he dejado guiar por impulsos carnales, temores y consejos vacíos de este mundo. Hoy clamo por tu sabiduría divina para gobernar mis pasos, mis palabras y mis proyectos.\n\nSana mi corazón de toda división y doble ánimo. Quita de mí la vacilación que me hace fluctuar como ola del mar. Dame una mirada fija en tu verdad y un espíritu resuelto a obedecerte sin condiciones.\n\nGracias porque das abundantemente y sin reproche a quienes te buscan. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 3,
        "titulo": "Hacedores y no tan solo oidores: El espejo de la Palabra",
        "referencia_biblica": "Santiago 1:19-25",
        "autor_contexto": "Autor: Santiago. Escribiendo a comunidades donde el discurso teológico podía volverse un sustituto fácil de la piedad genuina, Santiago utiliza metáforas de la vida cotidiana grecorromana —como los espejos de bronce pulido— para advertir sobre la anestesia espiritual de escuchar sermones sin experimentar transformación moral.",
        "versiculos_clave": "Pasajes relacionados: Mateo 7:21-27 · Romanos 2:13 · Juan 13:17 · Salmos 119:105 · Ezequiel 33:31-32 · Lucas 11:28",
        "predicacion": "El versículo 19 contiene una máxima que revolucionaría todas nuestras relaciones si la pusiéramos en práctica: \"Por esto, mis amados hermanos, todo hombre sea pronto para oír, tardo para hablar, tardo para airarse\".\n\nNuestra naturaleza caída suele operar en sentido exactamente inverso: somos veloces para opinar, lentos para escuchar y prontos para estallar en indignación. Y Santiago añade con agudeza: \"porque la ira del hombre no obra la justicia de Dios\". Ninguna gritería carnal ni agresión verbal ha edificado jamás el Reino de los Cielos.\n\nPero el corazón del pasaje nos confronta con la mayor trampa de la religión exterior: \"Pero sed hacedores de la palabra, y no tan solamente oidores, engañándoos a vosotros mismos\".\n\nLa expresión \"engañándoos a vosotros mismos\" traduce el término legal *paralogizomai*, que aludía a un razonamiento falso o contabilidad fraudulenta: pensar que por acumular conocimiento bíblico, asistir a reuniones y coleccionar notas ya somos maduros espiritualmente.\n\nSantiago ilustra este autoengaño con una escena doméstica vívida: \"Porque si alguno es oidor de la palabra pero no hacedor de ella, este es semejante al hombre que considera en un espejo su rostro natural. Porque él se considera a sí mismo, y se va, y luego olvida cómo era\".\n\nEn el siglo I, los espejos no eran de vidrio como los actuales, sino de bronce o plata pulida. Si un hombre se miraba y veía hollín en su cara o la barba desalineada, pero se daba la vuelta y se marchaba sin lavarse, el espejo no le servía de nada.\n\nLa Palabra de Dios es un espejo divino: nos revela nuestras manchas ocultas de orgullo, nuestras palabras hirientes, nuestros apegos monetarios y nuestras faltas de perdón. Pero el objetivo del espejo no es sólo diagnosticar la suciedad, sino llevarnos al lavatorio de la gracia para ser limpiados.\n\nEn contraste, Santiago describe al verdadero discípulo: \"Mas el que mira atentamente en la perfecta ley, la de la libertad, y persevera en ella, no siendo oidor olvidadizo, sino hacedor de la obra, este será bienaventurado en lo que hace\".\n\nLa frase \"mira atentamente\" traduce *parakypsas*, un verbo que denota inclinarse con reverencia y detenimiento —el mismo verbo que describe a Pedro inclinándose para mirar dentro del sepulcro vacío de Jesús.\n\nLa ley de Dios no es una jaula opresiva; es la \"ley de la libertad\" que nos rescata de la tiranía del pecado y de las opiniones ajenas. La verdadera bienaventuranza bíblica no desciende sobre el que sabe mucho, sino sobre el que obedece con fidelidad lo que Dios le ha mostrado.",
        "aplicacion": "Revisa qué mandato bíblico específico (perdonar a alguien, frenar la queja, ser generoso, pedir perdón o restaurar un hábito devocional) has estado postergando. Da hoy un paso concreto y visible de obediencia antes de que termine el día.",
        "pregunta_reflexion": "¿Estás acumulando versículos y mensajes como simple entretenimiento intelectual, o permites que la Palabra opere como un espejo que transforma tus actos cotidianos?",
        "oracion": "Señor todopoderoso, tu Palabra viva es lámpara a mis pies y lumbrera a mi camino.\n\nPerdóname por las incontables ocasiones en que he sido un oidor olvidadizo: escuchando sermones, leyendo pasajes inspirados y saliendo a vivir exactamente igual que antes. Líbrame del terrible autoengaño de la religiosidad hueca.\n\nDame oídos atentos, una lengua prudente y un espíritu manso que huya de la ira destructiva. Hazme un hacedor ferviente de tu ley perfecta de la libertad.\n\nQue cada verdad que lea sea encarnada en mis relaciones familiares, en mi honestidad en el trabajo y en mi amor por los necesitados. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 4,
        "titulo": "La fe sin obras está muerta: La prueba de la autenticidad",
        "referencia_biblica": "Santiago 2:14-26",
        "autor_contexto": "Autor: Santiago. Algunos han querido ver una contradicción entre Pablo (quien enseña en Romanos que somos justificados por la fe sin las obras de la ley) y Santiago (quien afirma que la fe sin obras es muerta). Sin embargo, son dos caras de la misma moneda divina: Pablo combate el legalismo (intentar ganar la salvación por méritos propios), mientras que Santiago combate el antinomismo hipócrita (profesar fe de labios sin que la vida sea transformada). La fe sola salva, pero la fe que salva nunca viene sola.",
        "versiculos_clave": "Pasajes relacionados: Génesis 22:1-14 · Josué 2:1-21 · Gálatas 5:6 · 1 Juan 3:17-18 · Tito 3:8 · Efesios 2:8-10",
        "predicacion": "Santiago lanza una pregunta punzante que desarma cualquier complacencia teológica barata: \"¿De qué servirá, hermanos míos, si alguno dice que tiene fe, y no tiene obras? ¿Podrá la fe salvarle?\".\n\nObserva la precisión quirúrgica del lenguaje: Santiago no cuestiona la verdadera fe; cuestiona a quien \"dice que tiene fe\". Es muy fácil declarar con la boca doctrinas ortodoxas y cantar himnos de adoración los domingos; pero el testimonio que valida la profesión de fe ante Dios y ante los hombres son las obras de amor que produce.\n\nEl apóstol presenta un ejemplo cotidiano e insoportablemente gráfico: \"Y si un hermano o una hermana están desnudos, y tienen necesidad del mantenimiento de cada día, y alguno de vosotros les dice: Id en paz, calentaos y saciaos, pero no les dais las cosas que son necesarias para el cuerpo, ¿de qué aprovecha?\".\n\nLas palabras piadosas no abrigan un cuerpo congelado por el frío ni llenan el estómago de una familia hambrienta. Desearle bendición a un hermano necesitado sin meter la mano al bolsillo cuando tenemos los recursos para ayudarlo es una farsa espiritual que insulta a Dios.\n\n\"Así también la fe, si no tiene obras, es muerta en sí misma... ¿Tú crees que Dios es uno? Bien haces. También los demonios creen, y tiemblan\".\n\nEste versículo es estremecedor. Los demonios tienen una teología impecable: saben que Dios es Uno, reconocen que Jesús es el Santo de Dios, creen en el juicio venidero y tiemblan de pavor ante su majestad. Sin embargo, los demonios no son salvos porque su asentimiento intelectual carece por completo de obediencia, arrepentimiento y amor.\n\nUna fe que no altera tu manera de manejar el dinero, de tratar a tu cónyuge o de amar a los marginados no es fe salvadora: es un cadáver espiritual.\n\nPara demostrarlo, Santiago convoca a dos testigos históricos diametralmente opuestos en el canon bíblico: a Abraham, el patriarca respetado y amigo de Dios que ofreció a Isaac sobre el altar; y a Rahab, la ramera extranjera de Jericó que arriesgó su vida para esconder a los espías del pueblo del Señor.\n\n¿Qué tenían en común un patriarca venerable y una mujer marginada de los gentiles? Ambos creyeron a Dios, y esa fe se tradujo en una acción arriesgada, costosa y tangible de obediencia radical.\n\n\"Porque como el cuerpo sin espíritu está muerto, así también la fe sin obras está muerta\". Tu fe es el motor invisible; tus obras son las huellas visibles que demuestran que el Espíritu Santo habita verdaderamente en ti.",
        "aplicacion": "Busca hoy una oportunidad de bendecir de manera material o práctica a alguien que esté pasando necesidad (un familiar, un vecino, un hermano de la iglesia o alguien en la calle). No te limites a desearle bendición: aporta algo tangible que alivie su carga.",
        "pregunta_reflexion": "Si alguien examinara tus extractos bancarios, tu tiempo libre y tu trato hacia los necesitados, ¿encontraría pruebas indiscutibles de que tu fe en Cristo está viva?",
        "oracion": "Señor Jesús, tú que no escatimaste tu propia vida sino que la entregaste en sacrificio por mí en la cruz del Calvario.\n\nLíbrame del cristianismo cómodo de meras palabras y confesiones frías. No permitas que tenga la ortodoxia de los demonios, que creen y tiemblan pero permanecen en rebelión.\n\nHaz que mi fe sea viva, dinámica y visible a través de actos genuinos de misericordia y entrega. Abre mis ojos para ver la necesidad del huérfano, de la viuda y del quebrantado.\n\nQue mi amor no sea de palabra ni de lengua, sino de hecho y en verdad. En tu santo y precioso nombre, amén."
      },
      {
        "numero_dia": 5,
        "titulo": "El poder de la lengua: Freno, timón y fuego consumidor",
        "referencia_biblica": "Santiago 3:1-12",
        "autor_contexto": "Autor: Santiago. Pocos temas son tratados en el Nuevo Testamento con tanta contundencia como el dominio de las palabras. Como líder principal de la iglesia de Jerusalén, Santiago fue testigo de cómo las disputas verbales, los chismes, las acusaciones amargas y la murmuración podían dinamitar congregaciones enteras y destruir familias desde adentro.",
        "versiculos_clave": "Pasajes relacionados: Proverbios 18:21 · Salmos 141:3 · Efesios 4:29 · Colosenses 4:6 · 1 Pedro 3:10 · Mateo 12:34-37",
        "predicacion": "Santiago comienza el capítulo 3 con una advertencia solemne para los líderes: \"Hermanos míos, no os hagáis maestros muchos de vosotros, sabiendo que recibirémos mayor condenación. Porque todos ofendemos muchas veces\".\n\nY de inmediato establece la prueba máxima de la madurez espiritual: \"Si alguno no ofende en palabra, este es varón perfecto, capaz también de refrenar todo el cuerpo\". Quien puede gobernar su lengua ha dominado la plaza fuerte de toda su naturaleza carnal.\n\nPara hacernos entender el peso desproporcionado de este pequeño órgano, Santiago recurre a tres imágenes magistrales de la vida real:\n\nPrimero, el freno en la boca del caballo: un trozo pequeño de hierro colocado entre los dientes permite al jinete gobernar y doblegar el vigor salvaje de un corcel de varios cientos de kilos.\n\nSegundo, el timón de un gran navío: un trozo diminuto de madera bajo la popa permite al piloto dirigir una mole marina inmensa a través de tempestades implacables adondequiera que su voluntad determine.\n\nTercero, una chispa minúscula: \"¡Cuán grande bosque enciende un pequeño fuego!\". Un fósforo encendido arrojado descuidadamente en un bosque seco de Galilea podía desatar un infierno incontrolable que redujera a cenizas aldeas enteras en cuestión de horas.\n\n\"Y la lengua es un fuego, un mundo de maldad. La lengua está puesta entre nuestros miembros, y contamina todo el cuerpo, e inflama la rueda de la creación, y ella misma es inflamada por el infierno\".\n\nCuántos matrimonios han sido destruidos por una frase de desprecio arrojada con crueldad; cuántos hijos han cargado traumas y heridas emocionales durante décadas por apodos y descalificaciones de sus padres; cuántas amistades de años han sido dinamitadas en cinco minutos por un rumor malicioso.\n\nSantiago expone la vergonzosa incoherencia del corazón humano: domamos leones, aves y serpientes, pero ningún ser humano puede domar la lengua con sus solas fuerzas. \"Con ella bendecimos al Dios y Padre, y con ella maldecimos a los hombres, que están hechos a la semejanza de Dios. De una misma boca proceden bendición y maldición. Hermanos míos, esto no debe ser así\".\n\n¿Acaso puede una fuente dar por la misma abertura agua dulce y amarga? ¿Puede la higuera producir aceitunas, o la vid higos? Tus palabras no operan en un vacío neutral: revelan la calidad del agua que hay en el manantial de tu alma. Sólo cuando el Espíritu Santo toma el control total de nuestro corazón puede nuestra boca transformarse en manantial de vida, consuelo y verdad.",
        "aplicacion": "Practica un \"ayuno de quejas y críticas\" durante este día. Antes de hablar sobre una persona que no esté presente o antes de soltar un comentario sarcástico en tu hogar o trabajo, haz una pausa de 3 segundos y pregúntate: \"¿Edifica esto a quien me escucha? ¿Glorifica a Dios?\".",
        "pregunta_reflexion": "¿Estás utilizando tus conversaciones para construir puentes de sanidad y gracia, o tu lengua está encendiendo fuegos de murmuración y conflicto?",
        "oracion": "Señor y Dios mío, pon guarda a mi boca y guarda la puerta de mis labios.\n\nMe humillo ante ti y te pido perdón por cada palabra ociosa, hiriente, falsa o sarcástica que ha salido de mi boca. Perdóname por cantar tus alabanzas en el templo y luego murmurar o destruir a mi prójimo en privado.\n\nReconozco que no puedo domar mi lengua en mis propias fuerzas. Te ruego que unjas mi boca con el fuego santificador de tu Espíritu Santo, como tocaste los labios del profeta Isaías con un carbón encendido del altar.\n\nQue de mis labios sólo broten palabras sazonadas con sal, que impartan gracia a los oyentes, que levanten a los caídos y bendigan tu santo nombre siempre. Amén."
      },
      {
        "numero_dia": 6,
        "titulo": "Humildad ante Dios: Desarmar la soberbia y la mundanalidad",
        "referencia_biblica": "Santiago 4:6-10",
        "autor_contexto": "Autor: Santiago. En el capítulo 4, el autor descubre el origen de las guerras, pleitos y divisiones en el seno de la comunidad: la soberbia, la envidia no confesada y el apego a los valores del mundo. Como un profeta del Antiguo Testamento, llama a la iglesia al quebrantamiento profundo delante del Rey de reyes.",
        "versiculos_clave": "Pasajes relacionados: 1 Pedro 5:5-7 · Proverbios 3:34 · Salmos 138:6 · Miqueas 6:8 · Isaías 57:15 · Mateo 23:12",
        "predicacion": "En un mundo obsesionado con la autosuficiencia, el ascenso social a toda costa y la imposición del ego, Santiago 4:6 pronuncia una ley espiritual que rige todo el universo moral: \"Dios resiste a los soberbios, y da gracia a los humildes\".\n\nLa palabra griega para \"resiste\" es *antitassetai*, un término militar de alta densidad que significa colocarse en formación de combate y presentar batalla frontal. Cuando una persona actúa con soberbia, autosuficiencia o vanagloria, no sólo está desobedeciendo un precepto; está provocando que el Dios Omnipotente se ponga enfrente de ella en son de guerra.\n\nPero en sublime contraparte, \"da gracia a los humildes\". La gracia (*charis*) es como el agua: nunca se acumula en las cimas áridas y empinadas de las montañas del orgullo; siempre desciende para llenar los valles bajos de los corazones quebrantados.\n\nSantiago denuncia el peligro de la \"amistad con el mundo\", calificándola de enemistad contra Dios y de adulterio espiritual. Quien abraza las prioridades mundanas —el materialismo voraz, la búsqueda de aplauso, el hedonismo moral— le da la espalda al pacto sagrado con su Creador.\n\nPor eso, el apóstol entrega una escalera de restauración en cinco mandamientos precisos:\n\n1. \"Someteos, pues, a Dios\": rinde tu voluntad, tus derechos y tus opiniones ante el señorío de Cristo.\n2. \"Resistid al diablo, y huirá de vosotros\": no dialogues con la tentación; párate firme sobre la Palabra de Dios.\n3. \"Acercaos a Dios, y él se acercará a vosotros\": el Padre anhela tu comunión más de lo que tú imaginas.\n4. \"Limpiad las manos, pecadores; y vosotros los de doble ánimo, purificad vuestros corazones\": arrepentimiento exterior de las acciones y purificación interior de las intenciones.\n5. \"Afligíos, y lamentad, y llorad... Humillaos delante del Señor, y él os exaltará\".\n\nEl quebrantamiento delante de Dios no es autodestrucción morbosa; es el vaciamiento bendito del ego que permite que la gloria de Dios inunde nuestro ser. No intentes exaltarte a ti mismo con vanaglorias terrenales; humíllate voluntariamente a los pies de Cristo, y en su tiempo perfecto Él te levantará.",
        "aplicacion": "Examina si hay alguna actitud de orgullo, autosuficiencia o rencor en la que hayas estado resistiendo a Dios o a una persona cercana. Dobla tus rodillas en soledad hoy y di con sinceridad: \"Señor, renuncio a tener la razón; me someto enteramente a ti\".",
        "pregunta_reflexion": "¿Hay alguna área de tu vida donde estés coqueteando con las modas y los valores del mundo en vez de rendirte con humildad a Dios?",
        "oracion": "Dios santo, justo y soberano, creador del cielo y de la tierra.\n\nReconozco que delante de tu gloria infinita no tengo nada de qué gloriarme. Perdóname por las veces en que la soberbia ha entenebrecido mis pensamientos y me ha hecho creer superior a otros o autosuficiente ante ti.\n\nHoy me despojo de mis vanaglorias y me someto incondicionalmente a tu voluntad. Resisto en el nombre de Jesús toda mentira del enemigo y me acerco a ti con manos limpias y corazón sincero.\n\nInunda mi vida con tu gracia inmerecida. Enséñame a caminar en la hermosura de la mansedumbre y que mi mayor anhelo sea siempre tu exaltación. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 7,
        "titulo": "La paciencia del labrador y la oración eficaz del justo",
        "referencia_biblica": "Santiago 5:7-16",
        "autor_contexto": "Autor: Santiago. Conclusión pastoral de la epístola. Frente a la opresión económica de los terratenientes ricos y las demoras aparentes en la vindicación de los justos, Santiago llama a la congregación a fijar su mirada en la venida inminente del Señor, a no quejarse unos contra otros y a activar el poder sobrenatural de la oración comunitaria.",
        "versiculos_clave": "Pasajes relacionados: 1 Reyes 18:41-45 · Salmos 126:5-6 · Gálatas 6:9 · Lucas 18:1 · 1 Tesalonicenses 5:17 · Salmos 103:8-13",
        "predicacion": "Hemos llegado al clímax de la carta de Santiago. El apóstol nos ofrece una ilustración entrañable del campo para enseñarnos a esperar el tiempo soberano de Dios: \"Por tanto, hermanos, tened paciencia hasta la venida del Señor. Mirad cómo el labrador espera el precioso fruto de la tierra, aguardando con paciencia hasta que reciba la lluvia temprana y la tardía\".\n\nEl campesino de Judea no podía apresurar la semilla a base de gritos, ansiedad o desesperación. Sembraba el grano en otoño con la llegada de la \"lluvia temprana\", y debía aguardar con paciencia los meses de invierno hasta la \"lluvia tardía\" de primavera que hacía madurar la cosecha. Su trabajo era arar, sembrar, cuidar y confiar en la fidelidad de los cielos.\n\nDe la misma manera, en tu vida espiritual hay oraciones cuyas respuestas no brotan al día siguiente: Dios está preparando el terreno, profundizando tus raíces y esperando el momento exacto para manifestar su gloria. \"Tened también vosotros paciencia, y afirmad vuestros corazones; porque la venida del Señor se acerca\".\n\nSantiago nos recuerda el ejemplo de los profetas que sufrieron con fidelidad y la perseverancia de Job: \"Habéis oído de la paciencia de Job, y habéis visto el fin del Señor, que el Señor es muy misericordioso y compasivo (*polusplanchnos kai oiktirmōn*)\". Las pruebas de Job no fueron el final de su biografía: el final del Señor fue restitución, bendición multiplicada y una revelación íntima de su gloria.\n\nY a continuación, Santiago despliega la medicina suprema para el alma atribulada: la oración.\n\n\"¿Está alguno entre vosotros afligido? Haga oración. ¿Está alguno alegre? Cante alabanzas. ¿Está alguno enfermo entre vosotros? Llame a los ancianos de la iglesia, y oren por él, ungiéndole con aceite en el nombre del Señor. Y la oración de fe salvará al enfermo, y el Señor lo levantará\".\n\nLa fe cristiana no es solitaria ni autosuficiente: nos necesitamos los unos a los otros. \"Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados. La oración eficaz del justo puede mucho\".\n\nPara quitarnos la excusa de que nosotros somos demasiado débiles para orar con semejante poder, Santiago nos pone como modelo a Elías: \"Elías era hombre sujeto a pasiones semejantes a las nuestras, y oró fervientemente ni lloviese, y no llovió... y otra vez oró, y el cielo dio lluvia\".\n\nElías sintió miedo, soledad y desánimo bajo el enebro; pero cuando oraba afianzado en las promesas del Señor, las ventanas de los cielos se abrían o se cerraban. Tu debilidad humana no limita el poder de tu Dios: cuando un corazón justificado por la sangre de Cristo clama con fe, el brazo del Omnipotente se mueve con salvación.",
        "aplicacion": "Si hay alguna herida o carga oculta en tu vida, no la lleves en soledad. Busca hoy a un hermano maduro en la fe o a un pastor, comparte tu petición con sinceridad y oren juntos confiando en que el Señor levantará tu espíritu.",
        "pregunta_reflexion": "¿Estás esperando con la paciencia confiada del labrador o pretendes que Dios opere según tu propio cronómetro apresurado?",
        "oracion": "Padre misericordioso, Dios de toda consolación y Señor de la cosecha.\n\nGracias por estos 7 días de estudio en la bendita carta de Santiago. Tu Palabra me ha confrontado, me ha limpiado y ha ensanchado mi entendimiento de lo que significa tener una fe viva.\n\nEnséñame a esperar con la paciencia del labrador, sabiendo que tú enviarás a su tiempo la lluvia temprana y la tardía sobre mi vida y sobre mi familia. Afirma mi corazón para que no flaquee ante las demoras aparentes.\n\nAviva en mí un espíritu constante de oración ferviente y eficaz. Que mi vida sea un altar encendido y que mi fe se traduzca cada día en obras de amor que glorifiquen tu santo nombre por toda la eternidad. En el nombre poderoso de Jesús, amén."
      }
    ]
  },
  {
    "id": "semilla-estudio-7d-pedro",
    "titulo": "Pedro: Del Fracaso a la Roca de Fe",
    "descripcion": "Un estudio biográfico y teológico profundo de 7 días sobre la vida del apóstol Simón Pedro. Desde el milagro en la barca de Genesaret y el caminar sobre las aguas, hasta el quebranto del patio del sumo sacerdote, la restauración junto al fuego y el denuedo del Espíritu en Pentecostés.",
    "tema": "Discípulos y Personajes",
    "num_dias": 7,
    "portada_url": "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=800&q=80",
    "dias": [
      {
        "numero_dia": 1,
        "titulo": "El llamado en la orilla: Bogar mar adentro y rendir las redes",
        "referencia_biblica": "Lucas 5:1-11",
        "autor_contexto": "Autor: El evangelista Lucas relata el encuentro decisivo entre Jesús y Simón Pedro en el lago de Genesaret (mar de Galilea). Pedro era un pescador experimentado, socio de una pequeña empresa familiar junto con Andrés, Jacobo y Juan. Vivía bajo el peso del trabajo físico agotador y las exigencias tributarias de Roma y Herodes Antipas. En este escenario laboral ordinario, Jesús irrumpe para redefinir el propósito de su existencia.",
        "versiculos_clave": "Pasajes relacionados: Mateo 4:18-22 · Marcos 1:16-20 · Juan 21:1-11 · Isaías 6:1-8 · Romanos 11:33-36 · 1 Corintios 1:26-29",
        "predicacion": "La historia de Simón Pedro no comienza en un santuario dorado ni en una academia teológica ilustre; comienza en una playa salpicada de sudor, olor a pescado y frustración laboral.\n\nToda la noche anterior Pedro y sus compañeros habían batallado en el lago intentando pescar, y sus redes habían regresado completamente vacías. Quien ha invertido horas de esfuerzo sin ver fruto comprende el desánimo amargo de lavar redes vacías en la mañana.\n\nEs en ese momento de fatiga cuando Jesús sube a la barca de Simón y le pide apartarla un poco de tierra para enseñar a la multitud. Y al terminar de hablar, pronuncia una orden inesperada: \"Boga mar adentro (*epanagage eis to bathos*), y echad vuestras redes para pescar\".\n\nDesde la lógica técnica de un pescador profesional, la orden no tenía sentido alguno: en Galilea se pescaba de noche, no a plena luz del día; y se pescaba cerca de las orillas, no en las aguas profundas. Además, Pedro estaba exhausto y las redes ya estaban limpias.\n\nSin embargo, Pedro pronuncia la frase que marca el punto de inflexión de toda su vida: \"Maestro, toda la noche hemos estado trabajando, y nada hemos pescado; mas en tu palabra echaré la red\".\n\nLa fe madura no es la ausencia de cansancio o de dudas lógicas; es la decisión deliberada de supeditar nuestra experiencia y nuestras opiniones a la autoridad de la Palabra de Jesús.\n\nEl resultado es asombroso: encerraron tal cantidad de peces que sus redes se rompían, y tuvieron que hacer señas a los compañeros de la otra barca para que vinieran a ayudarles, llenando ambas barcas de tal manera que se hundían.\n\nPero observa la reacción de Simón Pedro: ante aquel despliegue de soberanía divina, no se pone a calcular las ganancias monetarias ni celebra el negocio. Cae de rodillas ante Jesús y exclama con sobrecogimiento: \"Apártate de mí, Señor, porque soy hombre pecador\" (*anēr hamartōlos eimi*).\n\nAl contemplar la santidad y el poder de Cristo, Pedro ve por primera vez la miseria de su propio corazón, exactamente igual que Isaías en el templo (Isaías 6:5). Es el quebrantamiento indispensable antes de cualquier llamamiento espiritual.\n\nY Jesús le responde con una gracia restauradora que quita todo temor: \"No temas; desde ahora serás pescador de hombres\". Y trayendo a tierra las barcas, dejándolo todo, le siguieron. Dios no llama a los capacitados según el mundo; capacita y transforma a los humildes que deciden rendirle sus redes.",
        "aplicacion": "Piensa en qué área de tu vida (un proyecto, tus finanzas, una relación o tu ministerio) has estado esforzándote en tus solas fuerzas con \"redes vacías\". Rinde hoy tu frustración ante el Señor y dile: \"Maestro, por encima de mi cansancio y mi lógica humana, en tu palabra vuelvo a intentarlo\".",
        "pregunta_reflexion": "¿Estás dispuesto a \"bogar mar adentro\" hacia la profundidad de la voluntad de Dios, o prefieres quedarte en la seguridad superficial de la orilla?",
        "oracion": "Señor Jesucristo, Dueño del mar y Soberano de mi destino, reconozco que tantas veces he intentado pescar en la noche oscura de mis propias fuerzas, cosechando cansancio y vacío.\n\nHoy te abro la barca de mi vida. Entra a mis decisiones, a mi trabajo y a mis planes. Como Pedro, me postro reconociendo mi pecado y mi indignidad delante de tu santidad infinita.\n\nMas en tu palabra echaré la red. Quita de mí el temor a la profundidad y dame la valentía de dejar atrás mis seguridades temporales para seguirte a donde me guíes.\n\nHazme un instrumento útil en tus manos para alcanzar vidas para tu Reino. En el nombre poderoso de Jesús, amén."
      },
      {
        "numero_dia": 2,
        "titulo": "Caminar sobre el mar: La fe en medio del viento y la mano que rescata",
        "referencia_biblica": "Mateo 14:22-33",
        "autor_contexto": "Autor: El apóstol Mateo. Tras la multiplicación de los panes y los peces, Jesús despide a la multitud y obliga a sus discípulos a entrar en la barca para ir a la otra orilla, mientras Él sube al monte a orar a solas. En la cuarta vigilia de la noche (entre las 3:00 y las 6:00 AM, las horas más oscuras y frías), el mar de Galilea es azotado por un vendaval feroz, poniendo a prueba los límites de la fe de los discípulos.",
        "versiculos_clave": "Pasajes relacionados: Marcos 6:45-52 · Juan 6:16-21 · Salmos 77:19 · Salmos 107:23-30 · Hebreos 12:2 · Isaías 43:2",
        "predicacion": "Estar en el centro de la voluntad de Dios no significa navegar en un mar libre de tempestades. Los discípulos estaban en medio de aquella tormenta violenta no por haber desobedecido, sino precisamente por haber obedecido la orden de Jesús de cruzar a la otra ribera.\n\nEn medio de la noche cerrada, exhaustos de remar contra olas enfurecidas, ven una figura caminando sobre las aguas turbulentas. El pánico se apodera de ellos: \"¡Un fantasma!\", gritan aterrados. Pero inmediatamente la voz inconfundible del Maestro rompe el estruendo de los truenos: \"¡Tened ánimo; yo soy (*egō eimi*), no temáis!\".\n\nJesús utiliza la misma fórmula sagrada con la que Dios se reveló a Moisés en la zarza ardiendo: \"Yo Soy\". El Creador del mar no está limitado por las leyes de la física; camina sobre aquello que intenta ahogarte.\n\nY entonces ocurre algo extraordinario que distingue a Simón Pedro de los otros once discípulos: \"Señor, si eres tú, manda que yo vaya a ti sobre las aguas\". Y Jesús le dijo: \"Ven\".\n\nMuchos han criticado a Pedro a lo largo de los siglos por su impulsividad o por haberse hundido después. Pero olvidamos un detalle crucial: ¡Pedro fue el único ser humano en la historia, además de Jesús, que se atrevió a poner un pie fuera de la barca y caminar sobre el agua líquida!\n\nDescendiendo de la barca, Pedro andaba sobre las aguas para ir a Jesús. Mientras sus ojos estuvieron clavados en el rostro de Cristo, la gravedad y la furia de las olas quedaron suspendidas bajo sus pies.\n\nPero el versículo 30 nos describe la tragedia cotidiana de nuestra fe: \"Pero al ver el fuerte viento, tuvo miedo; y comenzando a hundirse (*katapontizesthai*), dio voces, diciendo: ¡Señor, sálvame!\".\n\nEl problema de Pedro no fue el viento: el viento ya soplaba antes de que bajara de la barca. El problema fue que quitó la mirada de Jesús para enfocarla en el peligro visible. Cuando miras el problema más que al Salvador, tu fe se desvanece y comienzas a hundirte.\n\nSin embargo, observa la ternura infinita de Jesús: \"Al momento Jesús, extendiendo la mano, asió de él, y le dijo: ¡Hombre de poca fe! ¿Por qué dudaste?\". Jesús no lo dejó tragar agua ni le dio un sermón de reproche mientras se ahogaba; primero extendió su mano, lo rescató con firmeza, y luego en la intimidad de la barca le enseñó sobre la confianza.\n\nEl fracaso de la fe no es hundirse; el fracaso es quedarse paralizado en la barca de la comodidad sin atreverse a buscar a Jesús. Y aun cuando tus fuerzas fallen, la mano extendida de Cristo siempre estará a una oración de distancia para levantarte.",
        "aplicacion": "¿Qué circunstancia difícil o amenazante te está haciendo mirar \"el fuerte viento\" en vez de a Cristo? Aparta hoy unos minutos para fijar tus ojos intencionalmente en las promesas del Señor y clama con sinceridad: \"¡Señor, sálvame y afirma mis pasos!\".",
        "pregunta_reflexion": "¿Estás paralizado por el miedo a fracasar dentro de la barca o estás dispuesto a dar el paso de fe para caminar hacia Jesús sobre las aguas?",
        "oracion": "Señor Jesús, soberano de los mares y vencedor de las tempestades.\n\nConfieso que tantas veces, al mirar los problemas gigantescos y los vientos contrarios de mi vida, me lleno de angustia y comienzo a hundirme en el desánimo. Perdóname por mi poca fe y por dudar de tu poder.\n\nHoy decido quitar mi mirada de las olas turbulentas y fijar mis ojos en ti, autor y consumador de la fe. Cuando el temor quiera invadirme, hazme escuchar tu dulce voz diciendo: \"¡Yo soy, no temas!\".\n\nExtiende tu mano poderosa y rescátame de toda desesperación. Afirma mis pies sobre tus promesas y llévame en paz hasta la orilla. En tu nombre victorioso, amén."
      },
      {
        "numero_dia": 3,
        "titulo": "La confesión en Cesarea de Filipo: La revelación del Cristo y la Roca",
        "referencia_biblica": "Mateo 16:13-19",
        "autor_contexto": "Autor: El apóstol Mateo. Jesús conduce a sus discípulos al extremo norte de Israel, a la región de Cesarea de Filipo. Era un territorio pagano junto al monte Hermón, repleto de templos dedicados a dioses griegos como Pan, grutas misteriosas y un imponente templo de mármol blanco consagrado al culto del emperador romano Augusto César. En este epicentro de idolatría y poder terrenal, Jesús confronta a los suyos con la pregunta más trascendental de la historia humana.",
        "versiculos_clave": "Pasajes relacionados: Juan 6:68-69 · 1 Corintios 10:4 · 1 Pedro 2:4-8 · Efesios 2:20 · Hechos 4:11-12 · Romanos 10:9-10",
        "predicacion": "En el marco geográfico de Cesarea de Filipo, rodeado de monumentos paganos al emperador y nichos a los dioses falsos, Jesús lanza una primera pregunta general: \"¿Quién dicen los hombres que es el Hijo del Hombre?\".\n\nLos discípulos responden con las encuestas de opinión de la calle: unos dicen Juan el Bautista resucitado; otros Elías, Jeremías o alguno de los profetas. La gente reconocía en Jesús a un hombre admirable, un maestro moral inspirador o un profeta valiente.\n\nPero a Jesús no le interesan las estadísticas sociológicas; le interesa la lealtad interior de quienes le siguen. Y los mira a los ojos con la pregunta definitiva: \"Y vosotros, ¿quién decís que soy yo?\".\n\nEsa es la pregunta que cada ser humano que pisa este planeta tiene que responder tarde o temprano en lo profundo de su conciencia. No basta con citar lo que dicen los teólogos, los pastores o la tradición familiar: ¿Quién es Jesús para ti personalmente?\n\nY es Simón Pedro quien toma la delantera con una confesión que retumba en toda la historia cósmica: \"Tú eres el Cristo, el Hijo del Dios viviente\".\n\nNo dijo simplemente \"tú eres un profeta más\"; declaró: \"Tú eres el Mesías prometido (*ho Christos*), el Ungido del Padre, el Hijo del único Dios Vivo\", en contraste con los ídolos muertos de piedra y mármol que los rodeaban en Cesarea.\n\nLa respuesta de Jesús es un estallido de gracia: \"Bienaventurado eres, Simón, hijo de Jonás, porque no te lo reveló carne ni sangre, sino mi Padre que está en los cielos\". El conocimiento salvador de Cristo no es un logro intelectual ni una deducción filosófica; es un milagro de iluminación del Espíritu Santo en el corazón humano.\n\nY Jesús añade un juego de palabras de un peso teológico monumental: \"Y yo también te digo, que tú eres Pedro (*petros*, una piedra pequeña o fragmento desprendido), y sobre esta roca (*petra*, la masa rocosa inamovible de la confesión de que Jesús es el Hijo de Dios) edificaré mi iglesia; y las puertas del Hades no prevalecerán contra ella\".\n\nLa iglesia no está fundada sobre la debilidad voluble de un ser humano que días después negaría al Señor; está cimentada sobre la Roca inconmovible de Jesucristo resucitado. Los imperios pasan, las ideologías colapsan, los tiranos caen, pero la iglesia de Cristo permanece invicta frente a todos los asedios de la muerte.\n\nCuando confiesas a Cristo no sólo como Salvador sino como el Rey soberano de tu vida cotidiana, recibes un cimiento firme que ninguna crisis económica, pérdida familiar o tormenta terrenal podrá jamás derribar.",
        "aplicacion": "Medita en la pregunta de Jesús: \"Para ti, ¿quién soy yo?\". Escribe en una hoja tu respuesta personal y sincera, reconociendo el señorío de Cristo sobre tus planes, tus posesiones y tus decisiones presentes.",
        "pregunta_reflexion": "¿Es Jesús para ti un concepto religioso admirado de lejos o el Señor vivo que gobierna efectivamente el trono de tu corazón?",
        "oracion": "Señor Jesucristo, Hijo del Dios viviente, Rey de reyes y Señor de señores.\n\nHoy uno mi voz a la confesión de Pedro y proclamo con toda mi alma que tú eres mi único Salvador, mi Redentor y el Soberano de mi vida. Fuera de ti no hay salvación ni esperanza eterna.\n\nGracias Padre celestial porque abriste mis ojos ciegos para contemplar la gloria de tu Hijo amado. Desmantela en mi mente todo ídolo moderno de vanagloria, dinero o autosuficiencia que compita con tu majestad.\n\nAfirma mi vida sobre la Roca eterna que es Cristo. Que ninguna tempestad ni asedio del enemigo mueva mi confianza en tu victoria. A ti sea la gloria por los siglos de los siglos. Amén."
      },
      {
        "numero_dia": 4,
        "titulo": "El lavatorio de pies: Aprender a recibir la gracia y servir en humildad",
        "referencia_biblica": "Juan 13:1-10",
        "autor_contexto": "Autor: El apóstol Juan registra con intimidad conmovedora lo ocurrido en el aposento alto la noche antes de la crucifixión. En la cultura de Judea, los caminos eran de tierra y polvo, y los comensales usaban sandalias abiertas; el deber de lavar los pies antes de una cena era la tarea más servil y degradante, asignada exclusivamente a los esclavos gentiles más bajos. Ningún judío libre realizaba semejante oficio.",
        "versiculos_clave": "Pasajes relacionados: Filipenses 2:5-8 · Mateo 20:25-28 · Lucas 22:24-27 · 1 Pedro 5:5 · Romanos 12:10 · Gálatas 5:13",
        "predicacion": "En la víspera de la Pascua, sabiendo Jesús que su hora había llegado para pasar de este mundo al Padre, y habiendo amado a los suyos que estaban en el mundo, \"los amó hasta el fin\".\n\nLo que sigue es una de las escenas más desconcertantes de la Biblia: mientras los discípulos venían disputando por el camino quién de ellos sería el mayor en el Reino venidero (Lucas 22:24), Jesús se levanta de la cena, se quita su manto exterior, toma una toalla de lino y se la ciñe a la cintura, vierte agua en un lebrillo y comienza a lavar uno a uno los pies polvorientos de sus discípulos y a secarlos con la toalla.\n\nEl Creador de las galaxias, el Verbo encarnado por quien fueron hechas todas las cosas, está de rodillas en el piso lavando la suciedad del camino de los pies de hombres que horas después lo abandonarían y lo negarían.\n\nCuando Jesús llega ante Simón Pedro, este no soporta el choque moral y exclama escandalizado: \"Señor, ¿tú me lavas los pies a mí? ... No me lavarás los pies jamás\".\n\nA menudo el orgullo humano se disfraza de falsa piedad: nos resulta mucho más cómodo querer hacer cosas grandes y heroicas por Dios, que permitir con humildad que Dios descienda a servirnos y limpiarnos en nuestra indignidad. Dejarse lavar los pies implica mostrar la vulnerabilidad, exponer la suciedad y reconocer que no tenemos con qué pagar.\n\nPero Jesús le responde con una advertencia fulminante: \"Si no te lavare, no tendrás parte conmigo\".\n\nSin la purificación que sólo Cristo puede dar, no hay comunión ni herencia en su Reino. No puedes asociarte con Jesús en tus propios términos de autosuficiencia moral.\n\nAl escuchar esto, el impulsivo Pedro da un giro radical de ciento ochenta grados: \"Señor, no sólo mis pies, sino también las manos y la cabeza\".\n\nY Jesús le aclara una verdad teológica crucial: \"El que está lavado, no necesita sino lavarse los pies, pues está todo limpio; y vosotros limpios estáis\".\n\nQuien ha sido justificado por la fe en la sangre del Cordero ha recibido un baño completo y definitivo de salvación eterna. Sin embargo, en nuestro peregrinaje cotidiano por este mundo caído, nuestros pies se llenan del polvo del desánimo, del pecado imprevisto y de las tensiones diarias. Necesitamos acudir continuamente a la cruz para el perdón diario y la comunión restaurada.\n\nY al terminar, Jesús deja un mandato indeleble: \"Pues si yo, el Señor y el Maestro, he lavado vuestros pies, vosotros también debéis lavar los pies los unos a los otros\". La grandeza en el Reino de Cristo no se mide por cuántos siervos tienes a tu disposición, sino por a cuántos estás dispuesto a servir con amor desinteresado.",
        "aplicacion": "Realiza hoy una acción concreta y humilde de servicio hacia alguien en tu entorno (tu cónyuge, un familiar, un compañero de trabajo o un hermano) sin esperar agradecimiento ni reconocimiento público.",
        "pregunta_reflexion": "¿Estás dispuesto a dejar que Jesús lave las áreas heridas o sucias de tu corazón, o sigues resistiéndote en un orgullo religioso?",
        "oracion": "Señor Jesucristo, Maestro humilde y Siervo divino, me asombro ante la inmensidad de tu gracia y tu condescendencia.\n\nPerdóname por las veces en que mi orgullo me ha impedido reconocer mi necesidad de tu limpieza diaria. Límpiame hoy del polvo del camino: de pensamientos vanos, de palabras apresuradas y de actitudes egoístas.\n\nQuita de mí todo deseo carnal de grandeza y protagonismo. Dame un corazón ceñido con la toalla del servicio humilde, dispuesto a lavar los pies de mis hermanos con paciencia y misericordia.\n\nQue mi vida refleje el amor con el que tú me amaste hasta el extremo. En tu santo nombre, amén."
      },
      {
        "numero_dia": 5,
        "titulo": "El patio del sumo sacerdote: El quebrantamiento y el llanto amargo",
        "referencia_biblica": "Lucas 22:54-62; Mateo 26:31-35",
        "autor_contexto": "Autor: El evangelista Lucas, junto con los testimonios sinópticos. La noche más oscura de la historia: Jesús es arrestado en el huerto de Getsemaní y conducido a la residencia del sumo sacerdote Caifás para un juicio sumario ilegal. Pedro sigue al Señor \"de lejos\" y entra al patio exterior, donde los soldados y sirvientes han encendido una fogata para calentarse del intenso frío de la medianoche primaveral de Jerusalén.",
        "versiculos_clave": "Pasajes relacionados: Marcos 14:66-72 · Juan 18:15-27 · 1 Corintios 10:12 · Proverbios 16:18 · 2 Corintios 7:10 · Salmos 51:17",
        "predicacion": "Horas antes del arresto, en el calor de la última cena, Jesús había advertido con ternura y gravedad: \"Simón, Simón, he aquí Satanás os ha pedido para zarandearos como a trigo; pero yo he rogado por ti, que tu fe no falte; y tú, una vez vuelto, confirma a tus hermanos\" (Lucas 22:31-32).\n\nPero Pedro, rebosante de una autoconfianza ciega, respondió con vehemencia: \"Señor, dispuesto estoy a ir contigo no sólo a la cárcel, sino también a la muerte... Aunque todos se escandalicen de ti, yo nunca me escandalizaré\".\n\nCuántas veces nosotros mismos hemos hecho promesas apasionadas a Dios desde la comodidad de una reunión: \"Señor, nunca te fallaré; yo seré fiel hasta el fin\". Olvidamos que nuestra carne es débil y que la autosuficiencia es el preludio invariable de la caída (1 Corintios 10:12).\n\nTras el arresto en Getsemaní, Pedro sigue a Jesús \"de lejos\" (*makrothen*). Seguir a Jesús de lejos es la zona más peligrosa para el creyente: ya no estás lo suficientemente cerca para escuchar sus latidos ni lo suficientemente lejos para considerarte ajeno. Estás en tierra de nadie, expuesto al fuego enemigo.\n\nEn el patio de Caifás, Pedro se sienta a calentarse junto al fuego de los enemigos de Cristo. Y allí, la prueba golpea desde el flanco más inesperado: una criada del sumo sacerdote lo mira fijamente y dice: \"Este también estaba con él\".\n\nEl hombre que unas horas antes había desenvainado una espada contra un destacamento militar tiembla ante la pregunta de una muchacha. Viene la primera negación: \"Mujer, no lo conozco\". Poco después, otro sirviente lo señala, y Pedro niega por segunda vez, ahora con juramento. Una hora más tarde, quienes están alrededor insisten: \"Verdaderamente también tú eres de ellos, porque tu manera de hablar te hace manifiesto (tu acento galileo)\".\n\nY Pedro comienza a maldecir y a jurar: \"¡No conozco al hombre!\". En cuestión de horas, el líder de los apóstoles ha tocado el fondo más hediondo de la traición y la cobardía.\n\nY en ese instante exacto, mientras la última palabra de maldición salía de sus labios, el gallo cantó. \"Entonces, vuelto el Señor, miró a Pedro\" (*eneblepsen tō Petrō*).\n\nImagínate esa escena por un segundo: Jesús, golpeado, escupido y encadenado, voltea su rostro y clava sus ojos en Pedro a través del patio. No fue una mirada de odio, venganza o desprecio; fue una mirada cargada de dolor infinito, de verdad deslumbrante y de un amor inquebrantable que traspasó el alma del discípulo como una espada.\n\n\"Y Pedro, saliendo fuera, lloró amargamente\" (*eklausen pikrōs*). Aquel llanto no fue el remordimiento desesperado de Judas que terminó en suicidio; fue la tristeza santa según Dios que quebranta el ego y produce arrepentimiento para salvación (2 Corintios 7:10). Pedro tenía que morir a su propia fuerza para poder nacer a la gracia redentora de Cristo.",
        "aplicacion": "Examina si has estado siguiendo a Jesús \"de lejos\", enfriándote en la comunión o transigiendo con conversaciones y ambientes que comprometen tu testimonio. Derrama hoy tu corazón ante el Señor con total honestidad sobre tus caídas.",
        "pregunta_reflexion": "¿Estás confiando en tu propia fuerza de voluntad para serle fiel a Dios o reconoces que sólo la intercesión y la gracia de Cristo pueden sostenerte?",
        "oracion": "Señor Jesús, Consolador y Redentor de mi alma.\n\nCon el corazón quebrantado reconozco que tantas veces te he fallado: con mis silencios cobardes cuando debía dar testimonio, con mis pensamientos y con mis actos que han negado tu señorío en mi vida. Perdóname, Señor.\n\nMírame como miraste a Pedro en aquel patio: con ojos de misericordia y perdón restaurador. Quita de mí toda soberbia y toda confianza en mi propia carne.\n\nSálvame de seguirte de lejos. Gracias porque tú rogaste por mí para que mi fe no falte. Levántame del polvo de mi fracaso y afírmame en tu gracia infinita. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 6,
        "titulo": "Restauración junto al fuego: Del dolor al \"Pastorea mis ovejas\"",
        "referencia_biblica": "Juan 21:15-19",
        "autor_contexto": "Autor: El apóstol Juan. Tras la resurrección, los discípulos han regresado a Galilea. Jesús se aparece en la orilla al amanecer tras otra noche de pesca infructuosa, repitiendo el milagro de la pesca milagrosa. Luego de compartir el desayuno sobre un fuego de brasas de carbón (*anthrakian*, la misma palabra usada para el fuego del patio de Caifás donde Pedro lo negó), Jesús llama a Pedro aparte para una conversación personal de sanidad profunda.",
        "versiculos_clave": "Pasajes relacionados: Lucas 22:31-32 · Hechos 20:28 · 1 Pedro 5:1-4 · 2 Timoteo 4:7-8 · Jeremías 3:15 · Salmos 103:10-14",
        "predicacion": "El olor del humo de las brasas de carbón en aquella playa debía haber traído a la memoria de Pedro los recuerdos más dolorosos de su vida: el mismo olor del fuego del patio del sumo sacerdote donde había pronunciado: \"No conozco al hombre\".\n\nMuchos líderes y seres humanos, ante una traición de semejante magnitud, habrían exigido una disculpa humillante o habrían despedido a Pedro para siempre. Pero Jesús no vino a destruir a sus discípulos caídos; vino a sanar las heridas del alma en el quirófano de la gracia.\n\nJesús no le pregunta a Pedro: \"¿Por qué me negaste? ¿Por qué huiste cobardemente? ¿Me prometes que no volverá a suceder?\". Jesús va directamente al corazón del problema con una pregunta que perfora el pecho: \"Simón, hijo de Jonás, ¿me amas más que estos?\".\n\nObserva que Jesús lo llama \"Simón, hijo de Jonás\", recordándole su naturaleza humana antes de llamarlo \"Pedro\". Y la pregunta inicial utiliza el verbo griego *agapas me*: un amor incondicional, total y abnegado. Pedro, curado ya de su antigua presunción fanfarrona, no se atreve a decir \"te amo más que los demás\". Responde con humildad profunda utilizando otro verbo: \"Sí, Señor; tú sabes que te quiero (*philō se*, un afecto entrañable y sincero)\". Jesús le dice: \"Apacienta mis corderos\".\n\nPor segunda vez, Jesús le pregunta: \"Simón, hijo de Jonás, ¿me amas (*agapas me*)?\". Y Pedro vuelve a responder: \"Sí, Señor; tú sabes que te quiero (*philō se*)\". Jesús le responde: \"Pastorea mis ovejas\".\n\nY a la tercera vez, Jesús desciende con ternura infinita al propio nivel de Pedro y le pregunta usando su mismo verbo: \"Simón, hijo de Jonás, ¿me quieres (*phileis me*)?\".\n\nEl texto dice que Pedro se entristeció de que le dijese la tercera vez: \"¿Me quieres?\". Aquellas tres preguntas correspondían exactamente a sus tres negaciones en el patio. Una por una, Jesús estaba cauterizando las tres heridas de la culpa con tres declaraciones de amor y llamado.\n\nY Pedro derrama su alma con la confesión más bella de la Escritura: \"Señor, tú lo sabes todo; tú sabes que te amo\". Ya no confía en sus promesas humanas; confía en la omnisciencia de Cristo, que conoce su debilidad pero también ve la sinceridad de su amor.\n\nY Jesús sella la restauración con el encargo ministerial supremo: \"Apacienta mis ovejas... Sígueme\". Dios no desperdicia nuestros fracasos: en la escuela de la gracia, el fracaso perdonado de Pedro lo convirtió en el pastor compasivo que la iglesia primitiva necesitaría para vendar a los quebrantados.",
        "aplicacion": "¿Hay algún error o fracaso del pasado por el que todavía te sientas indigno o descalificado para servir a Dios? Escucha hoy la voz de Jesús preguntándote: \"¿Me amas?\". Respóndele desde lo profundo de tu alma y recibe su perdón y su llamado renovado.",
        "pregunta_reflexion": "¿Estás permitiendo que la culpa del pasado paralice tu comunión con Dios o te atreves a decirle: \"Señor, tú lo sabes todo; tú sabes que te amo\"?",
        "oracion": "Señor Jesús, Pastor supremo de las almas y restaurador de mi vida.\n\nGracias por tu misericordia inagotable, que no me trata conforme a mis iniquidades ni me paga según mis pecados. Gracias porque cuando yo fui infiel, tú permaneciste fiel.\n\nHoy te entrego las cenizas de mis culpas y fracasos pasados. Tú lo sabes todo, Señor: conoces mis flaquezas, pero también sabes que te amo con todo mi corazón quebrantado.\n\nRenueva en mí tu llamamiento sagrado. Dame un corazón compasivo para amar, pastorear y consolar a quienes han caído en el camino. Afírmame en tus pasos para seguirte hasta el fin. Amén."
      },
      {
        "numero_dia": 7,
        "titulo": "El apóstol restaurado: Fuego de Pentecostés y una esperanza viva",
        "referencia_biblica": "Hechos 2:14-41; 1 Pedro 1:3-7",
        "autor_contexto": "Autor: El apóstol Simón Pedro. El libro de Hechos y la primera epístola universal de Pedro muestran la culminación de la transformación de este discípulo. Aquel hombre que temblaba ante una criada en el patio de Caifás es ahora el apóstol intrépido que se planta frente a miles en Jerusalén bajo el fuego del Espíritu Santo, y el anciano pastor que escribe a creyentes probados en el imperio romano.",
        "versiculos_clave": "Pasajes relacionados: Hechos 4:13 · 2 Timoteo 1:7 · Romanos 8:18 · Santiago 1:12 · Apocalipsis 2:10 · 2 Pedro 3:18",
        "predicacion": "El día de Pentecostés marca la metamorfosis gloriosa de Simón Pedro. Cincuenta días después de haber llorado amargamente en la noche de la traición, el Espíritu Santo desciende como viento recio y lenguas de fuego sobre el aposento alto.\n\nY es Pedro quien se pone en pie con los once, alza la voz ante una multitud multitudinaria de peregrinos de todas las naciones del imperio romano y predica con una autoridad, denuedo y unción escritural nunca antes vista.\n\nNo hay ni un ápice de cobardía en sus palabras: proclama la resurrección de Jesucristo y llama al arrepentimiento. Aquel sermón conmueve los corazones hasta las entrañas: tres mil almas son bautizadas y añadidas a la iglesia en un solo día (Hechos 2:41).\n\nMás adelante, cuando el concilio religioso de Jerusalén intenta amedrentarlo y prohibirle hablar en el nombre de Jesús, las autoridades se maravillan al ver \"el denuedo de Pedro y de Juan, sabiendo que eran hombres sin letras y del vulgo; y les reconocían que habían estado con Jesús\" (Hechos 4:13).\n\nAños más tarde, cuando escribe sus cartas pastorales a comunidades cristianas que enfrentaban el horno ardiente de la persecución de Nerón, Pedro no escribe como un teórico: escribe como un veterano de mil batallas restaurado por la gracia.\n\n\"Bendito el Dios y Padre de nuestro Señor Jesucristo, que según su grande misericordia nos hizo renacer para una esperanza viva (*elpida zōsan*), por la resurrección de Jesucristo de los muertos, para una herencia incorruptible, incontaminada e inmarcesible, reservada en los cielos para vosotros\".\n\nNuestra esperanza en Cristo no es un deseo vago o incierto; es una \"esperanza viva\" anclada en una tumba que quedó vacía para siempre.\n\nY Pedro explica a los creyentes el secreto divino del sufrimiento: \"Para que sometida a prueba vuestra fe, mucho más preciosa que el oro, el cual aunque perecedero se prueba con fuego, sea hallada en alabanza, gloria y honra cuando sea manifestado Jesucristo\".\n\nLa biografía de Pedro nos enseña la lección más esperanzadora de todo el evangelio: Dios no busca superhombres religiosos ni personas perfectas que jamás hayan tropezado; Dios busca corazones vulnerables, dispuestos a ser quebrantados y llenos del poder de su Espíritu.\n\nSi Dios pudo tomar a un pescador impulsivo, temeroso e infiel, y convertirlo en la roca apostólica que sacudió los cimientos del imperio romano, ¡piensa en lo que su gracia soberana puede hacer contigo si hoy te rindes enteramente en sus manos!",
        "aplicacion": "Da gracias hoy a Dios por cómo ha usado tus propios tropiezos y procesos para enseñarte humildad. Pídele al Espíritu Santo que te llene de denuedo y valentía para proclamar el evangelio de Cristo sin avergonzarte en tu círculo social y laboral.",
        "pregunta_reflexion": "¿Estás viviendo en la victoria de la \"esperanza viva\" de Cristo resucitado o sigues atado al recuerdo de tus antiguos fracasos?",
        "oracion": "Padre eterno, Dios de Pedro y Dios mío, me postro con gratitud y reverencia al concluir estos 7 días de estudio sobre la vida de tu siervo Pedro.\n\nGracias por mostrarnos en su historia que tu gracia es infinitamente más grande que nuestros mayores fracasos. Gracias porque no nos desechas cuando caemos, sino que vienes a buscarnos en la orilla para restaurarnos.\n\nBautízame de nuevo con el fuego purificador y el denuedo de tu Santo Espíritu. Quita de mí todo espíritu de cobardía y lléname de poder, de amor y de dominio propio.\n\nQue mi fe, probada en el fuego de las dificultades de la vida, sea hallada en alabanza y honra para Jesucristo. Afírmame en la esperanza viva de tu gloria eterna. ¡A ti sea el honor y el imperio por los siglos de los siglos! Amén."
      }
    ]
  },
  {
    "id": "semilla-estudio-7d-paz",
    "titulo": "Paz Sobrenatural: Vencer la Ansiedad y Descansar en Dios",
    "descripcion": "Un plan devocional y exegético profundo de 7 días sobre el Shalom de Dios frente a las tormentas de la vida. Descubre cómo vencer el afán diario, la guarnición protectora de Filipenses 4, el pastoreo en el valle de sombra de muerte y la victoria final de Romanos 8.",
    "tema": "Paz y Ansiedad",
    "num_dias": 7,
    "portada_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "dias": [
      {
        "numero_dia": 1,
        "titulo": "La raíz del afán: Aprender a vivir un día a la vez",
        "referencia_biblica": "Mateo 6:25-34",
        "autor_contexto": "Autor: El apóstol Mateo relata el Sermón del Monte. En el contexto campesino y obrero de Galilea, la gran masa del pueblo vivía amenazada por sequías, carestía de alimentos e impuestos usureros romanos. El temor al día de mañana no era una abstracción psicológica; era una angustia visceral por el pan diario. A este pueblo oprimido, Jesús les revela el corazón de un Padre celestial que no se desentiende de sus hijos.",
        "versiculos_clave": "Pasajes relacionados: Salmos 127:1-2 · Lamentaciones 3:22-23 · Lucas 12:22-31 · Salmos 37:25 · 1 Pedro 5:7 · Salmos 55:22",
        "predicacion": "La ansiedad es una de las mayores epidemias silenciosas del alma humana. Nos roba el sueño, desgasta nuestra salud física, envenena nuestras relaciones y nos incapacita para disfrutar las bendiciones del presente.\n\nJesús se detiene con ternura infinita en Mateo 6:25 para desarmar la maquinaria del afán: \"Por tanto os digo: No os afanéis por vuestra vida, qué habéis de comer o qué habéis de beber; ni por vuestro cuerpo, qué habéis de vestir. ¿No es la vida más que el alimento, y el cuerpo más que el vestido?\".\n\nEl verbo griego utilizado aquí para \"afán\" es *merimnao*, que proviene de *merizo* (dividir o desgarrar) y *nous* (mente). La ansiedad literalmente divide y desgarra tu mente: te mantiene con el cuerpo en el día de hoy, pero con los pensamientos secuestrados en las catástrofes hipotéticas del mañana.\n\nPara sanar esta dolencia espiritual, Jesús nos invita a mirar la creación con ojos de fe: \"Mirad las aves del cielo, que no siembran, ni siegan, ni recogen en graneros; y vuestro Padre celestial las alimenta. ¿No valéis vosotros mucho más que ellas?\".\n\nLas aves no son perezosas: vuelan, recolectan ramas para sus nidos y buscan alimento diligentemente. Pero las aves no sufren de insomnio ni padecen ataques de pánico por la economía del próximo año. Descansan en la providencia invisible del Creador.\n\nY luego añade: \"Y por el vestido, ¿por qué os afanáis? Considerad los lirios del campo, cómo crecen: no trabajan ni hilan; pero os digo, que ni aun Salomón con toda su gloria se vistió así como uno de ellos\".\n\nSi Dios viste con una belleza insuperable a una flor silvestre efímera que hoy florece en la colina y mañana se seca, ¿cuánto más cuidará de ti, hijo o hija amada de su pacto? Tu valor para Dios no se mide por el saldo de tu cuenta bancaria; se mide por la sangre preciosa que su Hijo derramó por ti en la cruz.\n\nJesús desenmascara la absoluta ineficacia práctica de la preocupación: \"¿Y quién de vosotros podrá, por mucho que se afane, añadir a su estatura un codo?\". Angustiarte por el futuro no previene ni una sola calamidad; sólo vacía al día de hoy de sus fuerzas y de su gratitud.\n\nY nos entrega la brújula inmutable que ordena todas nuestras prioridades: \"Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas. Así que, no os afanéis por el día de mañana, porque el día de mañana traerá su afán. Basta a cada día su propio mal\".\n\nDios da su gracia día a día, como daba el maná en el desierto: si intentabas guardar maná para la semana siguiente, se pudría. Dios te dará las fuerzas de mañana cuando amanezca mañana; para hoy, tienes la porción perfecta de su sustento. Descansa en su fidelidad.",
        "aplicacion": "Toma un cuaderno y anota la preocupación que más te está quitando la paz hoy. Entrégasela en oración a Dios diciendo: \"Señor, esto no está bajo mi control, pero sí bajo el tuyo. Decido buscar hoy tu Reino y descansar en tu fidelidad para mi mañana\".",
        "pregunta_reflexion": "¿Estás desgastando tus energías emocionales y físicas hoy cargando miedos sobre un futuro que Dios aún no te ha llamado a vivir?",
        "oracion": "Padre celestial, Dios de providencia eterna y refugio de mi alma.\n\nHoy confieso ante ti mi tendencia a llenarme de ansiedad, de afán y de pensamientos catastróficos sobre el mañana. Te pido perdón por haber dudado de tu cuidado paternal y por haber actuado como si estuviera solo en este mundo.\n\nSi tú alimentas a las aves y vistes con gloria a las flores del campo, sé con certeza que jamás me desampararás a mí. Renuncio al afán por el sustento, por el trabajo, por la salud y por el rumbo de mi familia.\n\nAlineo mi corazón para buscar primero tu Reino y tu justicia. Dame la sabiduría para vivir este día a la vez en tu presencia y descansar en que tus misericordias son nuevas cada mañana. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 2,
        "titulo": "La guarnición de Dios: La paz que sobrepasa todo entendimiento",
        "referencia_biblica": "Filipenses 4:6-7",
        "autor_contexto": "Autor: El apóstol Pablo. Escribe desde una celda romana, encadenado entre dos soldados imperiales de la guardia pretoriana y esperando la sentencia del tribunal del emperador Nerón. En medio de esa amenaza inminente de ejecución y de la privación física de libertad, Pablo escribe la carta más jubilosa del Nuevo Testamento, revelando el secreto de una serenidad invencible.",
        "versiculos_clave": "Pasajes relacionados: Isaías 26:3 · Salmos 55:22 · Colosenses 3:15 · 2 Tesalonicenses 3:16 · Salmos 4:8 · Proverbios 14:30",
        "predicacion": "Las palabras de Filipenses 4:6 adquieren una fuerza demoledora cuando recordamos el lugar desde donde fueron escritas. Pablo no estaba descansando en una villa de retiro junto al mar; estaba en un calabozo oscuro con grilletes en las muñecas.\n\nY desde allí pronuncia este mandato categórico: \"Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias\".\n\nObserva la amplitud de la frase: \"Por nada\". Ningún problema laboral, ninguna crisis médica, ninguna incertidumbre familiar queda fuera de esta instrucción. Pero Pablo no nos pide que reprimamos nuestras emociones o que adoptemos una indiferencia fría; nos entrega el canal divino para transformar la ansiedad en oración:\n\n1. \"Oración\" (*proseuchē*): entrar al santuario de la presencia de Dios en adoración y comunión filial.\n2. \"Ruego\" (*deēsis*): derramar las peticiones específicas de nuestra necesidad humana sin rodeos religiosos.\n3. \"Con acción de gracias\" (*meta eucharistias*): este es el ingrediente transformador. Dar gracias de antemano por la fidelidad de Dios antes de ver la respuesta visible desarma el pesimismo y ancla el corazón en la soberanía divina.\n\nY la promesa que sigue es de una belleza incomparable: \"Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús\".\n\nEsta paz \"sobrepasa todo entendimiento\" (*hyperechousa panta noun*): la mente humana no puede comprenderla con la lógica matemática ordinaria. La lógica dice que si hay crisis deberías estar aterrorizado; pero la paz de Dios te sostiene con una tranquilidad sobrenatural que desafía las circunstancias visibles.\n\nEl verbo \"guardará\" traduce un término técnico militar romano: *phroureo*. Alude a una guarnición militar de centinelas de élite apostados a las puertas de una ciudad amurallada para vigilar día y noche e impedir cualquier infiltración enemiga.\n\nPablo miraba a los soldados pretorianos que lo custodiaban físicamente y decía: \"De la misma manera, la paz de Dios monta guardia armada alrededor de mi corazón (mis emociones) y de mis pensamientos (mi mente), impidiendo que los dardos del pánico y la desesperación penetren mi fortaleza interior\".\n\nNo le pidas a Dios simplemente que desaparezcan todos tus problemas externos; pídele que su presencia santa establezca esa guarnición invulnerable de paz en el trono de tu alma.",
        "aplicacion": "Convierte tu mayor preocupación en una triple oración ahora mismo: dale gracias a Dios por tres cosas que ha hecho en tu vida, expónle con detalle tu problema presente y pide que su paz monte guardia sobre tus pensamientos durante toda esta jornada.",
        "pregunta_reflexion": "¿Estás intentando controlar tus preocupaciones con tus propios análisis humanos o las estás descargando en el altar con acción de gracias?",
        "oracion": "Dios de paz, Consolador de los afligidos y fortaleza de mi vida.\n\nHoy acudo a tu trono de gracia trayendo toda carga, temor e incertidumbre que ha querido asediar mi corazón. Renuncio a la tiranía del afán y deposito en tus manos soberanas cada una de mis peticiones.\n\nTe doy gracias de todo corazón por tu fidelidad probada en mi pasado. Gracias porque nunca me has fallado y porque tu bondad me ha sostenido hasta este día.\n\nQue tu paz sobrenatural, esa paz que sobrepasa toda comprensión humana, monte una guarnición alrededor de mi mente y de mis emociones en Cristo Jesús. Que ningún dardo de pánico logre perturbar mi descanso en ti. En el nombre de Jesús, amén."
      },
      {
        "numero_dia": 3,
        "titulo": "La paz que el mundo no puede dar: Vencedores en medio de la aflicción",
        "referencia_biblica": "Juan 14:27; 16:33",
        "autor_contexto": "Autor: El apóstol Juan registra las confidencias finales de Jesús con sus discípulos en el aposento alto, la misma noche en que sería traicionado. Los discípulos estaban angustiados y confundidos ante el anuncio inminente de la partida y muerte del Maestro. En ese momento de máxima vulnerabilidad emocional, Jesús les hace su legado testamentario supremo.",
        "versiculos_clave": "Pasajes relacionados: Juan 20:19-21 · Romanos 5:1 · Efesios 2:14-17 · Salmos 29:11 · Isaías 9:6 · Colosenses 1:20",
        "predicacion": "Cuando una persona importante está a punto de partir o redacta su testamento, suele legar a sus herederos sus posesiones más valiosas: terrenos, propiedades, oro o títulos de honor.\n\nEn la víspera del Calvario, Jesús no poseía bienes raíces ni cuentas bancarias terrenales. Pero deja a sus discípulos la herencia más rica que el universo puede contener: \"La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo\".\n\nLa palabra que Jesús utilizó en arameo fue indudablemente *Shalom*. En el pensamiento bíblico hebreo, *Shalom* no es una simple tregua pasiva o la ausencia momentánea de discusiones; es plenitud de vida (*integridad*), salud espiritual y física, orden divino, descanso interior y una reconciliación perfecta con el Creador.\n\nJesús hace una distinción tajante: \"no como el mundo la da\". La paz que el mundo ofrece es frágil, superficial y condicional: depende de que no haya crisis económica, de que la salud esté perfecta, de que nadie te critique y de que las circunstancias externas estén en calma. En cuanto una de esas cosas tambalea, la paz del mundo se desvanece instantáneamente.\n\nEn cambio, \"mi paz\" es la serenidad con la que Jesús mismo durmió en la popa de una barca azotada por las olas y con la que marchó hacia la cruz sabiendo que su vida estaba en las manos del Padre. Es una paz que no depende de la ausencia de tormentas, sino de la presencia soberana del Rey de la paz en tu barca.\n\nY en Juan 16:33, Jesús concluye su discurso con una promesa llena de realismo y de triunfo: \"Estas cosas os he hablado para que en mí tengáis paz. En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo\".\n\nJesús jamás vendió falsas ilusiones ni un evangelio de prosperidad barata: \"En el mundo tendréis aflicción\" (*thlipsin*, literalmente una presión aplastante, como la piedra de molino que tritura las aceitunas para extraer el aceite). Las presiones son inevitables en un mundo caído y quebrantado por el pecado.\n\nPero la última palabra no la tiene la aflicción: \"¡Confiad (*tharseite*, tened valor y denuedo invencible), yo he vencido al mundo (*egō nenikēka ton kosmon*)!\".\n\nNuestra paz no radica en el optimismo de nuestras fuerzas; radica en que Cristo ya derrotó al pecado, a Satanás y a la muerte en la cruz del Calvario. Cuando perteneces a Jesús, ninguna tribulación presente tiene el poder de arrebatarte de su victoria eterna.",
        "aplicacion": "Declara hoy en voz alta la promesa de Juan 16:33 frente a cualquier noticia o circunstancia que esté intentando perturbar tu ánimo: \"En Cristo tengo paz; el mundo me presionará, pero Jesús ya venció al mundo por mí\".",
        "pregunta_reflexion": "¿Estás buscando tu paz en la estabilidad frágil de las circunstancias exteriores o en la presencia eterna y victoriosa de Cristo en tu vida?",
        "oracion": "Señor Jesucristo, Príncipe de la paz y Vencedor del Calvario.\n\nRecibo hoy con gratitud inmensa el legado glorioso de tu paz. Renuncio a buscar mi seguridad en las promesas vacías y efímeras de este mundo terrenal.\n\nCuando las presiones de la vida aprieten y la aflicción toque a mi puerta, recuérdame que tú ya has vencido al mundo. No permitas que mi corazón se turbe ni tenga miedo ante las amenazas del adversario.\n\nLléname de tu *Shalom* celestial, esa plenitud bendita que aquieta toda tormenta interior y me llena de esperanza y firmeza. En tu santo y bendito nombre, amén."
      },
      {
        "numero_dia": 4,
        "titulo": "El Buen Pastor: Pastos verdes y el valle de sombra de muerte",
        "referencia_biblica": "Salmos 23:1-6",
        "autor_contexto": "Autor: El rey David. Conoce de primera mano la vida ruda del pastor en las colinas escarpadas del desierto de Judea: la amenaza constante de leones y osos, los desfiladeros profundos y oscuros donde acechaban ladrones y hienas, y la dependencia absoluta y ciega que las ovejas tienen de su guía para encontrar agua y pasto seguro. David traslada esa experiencia humana a la relación íntima del alma con Jehová.",
        "versiculos_clave": "Pasajes relacionados: Juan 10:11-15 · Isaías 40:11 · Ezequiel 34:11-16 · Salmos 84:11 · Hebreos 13:20-21 · Apocalipsis 7:17",
        "predicacion": "El Salmo 23 es el cántico de reposo más amado de toda la historia bíblica, un oasis inagotable para las almas fatigadas.\n\nComienza con una afirmación que zanja de raíz cualquier temor a la carencia: \"Jehová es mi pastor; nada me faltará\". En el hebreo original, el nombre utilizado es *Yahweh Rohi*: el Dios del pacto eterno es mi Pastor personal. Cuando el Dios infinito es quien pastorea tu vida, su providencia garantiza que nunca te faltará nada de lo que verdaderamente necesites para cumplir su propósito en esta tierra.\n\n\"En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará\". En la cría de ovejas, se sabe que una oveja es un animal extremadamente miedoso: jamás se echará en el suelo a descansar si percibe la menor amenaza de un depredador, si hay tensión en el rebaño o si está acosada por insectos y parásitos. El Pastor tiene que proveer un entorno de completa seguridad y paz para que la oveja pueda reposar.\n\n\"Confortará mi alma; me guiará por sendas de justicia por amor de su nombre\". La palabra para \"confortará\" es *meshobeb*, que denota restauración, traer de vuelta a la vida a la oveja extraviada o extenuada.\n\nY entonces el salmo penetra en el terreno más temido de nuestra existencia: \"Aunque ande en valle de sombra de muerte (*gey tsalmaveth*), no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento\".\n\nObserva el cambio de pronombres en el texto hebreo: en los versículos anteriores, David habla de Dios en tercera persona (\"Él me hace descansar... Él me guía\"); pero al entrar al valle oscuro del sufrimiento y la soledad, pasa a hablarle directamente de tú a tú: \"porque TÚ estarás conmigo\". En las cumbres de bendición aprendemos sobre Dios; en los valles oscuros del dolor conocemos a Dios en una intimidad que jamás olvidarás.\n\nEl valle es sólo de \"sombra\" de muerte: la sombra de una espada no puede herirte; la sombra de un perro no puede morderte. Cristo ya enfrentó la muerte real en la cruz para que tú sólo tengas que atravesar su sombra.\n\nY el salmo culmina con un banquete de celebración triunfal: \"Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando\". El Pastor unge la cabeza de la oveja con aceite de oliva para sanar sus raspaduras y ahuyentar las moscas parásitas.\n\n\"Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días\". El verbo \"seguirán\" en hebreo es *radaph*, que significa perseguir con celo. El bien y la misericordia de Dios no caminan perezosamente detrás de ti; ¡te persiguen incansablemente cada día de tu vida hasta llevarte al hogar celestial!",
        "aplicacion": "Lee el Salmo 23 completo despacio y en voz audible antes de dormir hoy. Personaliza cada versículo diciendo: \"Señor Jesús, tú eres mi pastor personal hoy; en tus brazos decido descansar\".",
        "pregunta_reflexion": "¿Estás intentando pastorearte a ti mismo con tus propias fuerzas o permites que el Buen Pastor guíe tus decisiones y unja tus heridas?",
        "oracion": "Jehová Rohi, mi Buen Pastor y Salvador mío.\n\nGracias porque en tus manos tiernas y poderosas nada me falta. Gracias porque me llevas a pastos de reposo y calmas la sed de mi alma quebrantada.\n\nAunque hoy me encuentre atravesando el valle oscuro de la incertidumbre, del duelo o de la enfermedad, no temeré mal alguno porque tu presencia me acompaña. Tu vara me defiende del enemigo y tu cayado me reconduce con amor.\n\nUnges hoy mi cabeza con el aceite fresco de tu Santo Espíritu. Mi copa rebosa de tu gracia, y confío en que tu bien y tu misericordia me perseguirán todos los días de mi vida. Amén."
      },
      {
        "numero_dia": 5,
        "titulo": "La mente afirmada en Dios: La roca de los siglos",
        "referencia_biblica": "Isaías 26:3-4",
        "autor_contexto": "Autor: El profeta Isaías. Vive en Judá en una era de colapso geopolítico extremo: el implacable imperio asirio está destruyendo las naciones circundantes, los ejércitos marchan derramando sangre y el pánico cunde entre los gobernantes y el pueblo de Jerusalén. En medio de sirenas de guerra y asedios aterradores, Isaías proclama un cántico profético sobre el secreto de la serenidad mental absoluta.",
        "versiculos_clave": "Pasajes relacionados: Salmos 112:7-8 · Jeremías 17:7-8 · Proverbios 3:5-6 · Romanos 8:6 · Salmos 62:1-2 · Colosenses 3:2",
        "predicacion": "El campo de batalla principal de la ansiedad no se libra en el exterior, en el banco ni en el hospital; se libra en el teatro invisible de nuestros pensamientos.\n\nLa mente es la fábrica de nuestras emociones: si alimentamos continuamente nuestros pensamientos con las malas noticias de la televisión, las especulaciones catastróficas y los peores escenarios imaginables, inevitablemente cosecharemos un torrente incontrolable de pánico y opresión interior.\n\nEl profeta Isaías nos entrega la fórmula divina inmutable en Isaías 26:3: \"Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado\".\n\nEn el texto original hebreo, la frase \"completa paz\" se expresa mediante una duplicación enfática que no tiene equivalente exacto en ningún otro idioma: *Shalom, Shalom*. La repetición hebrea de una palabra denota el grado superlativo absoluto: no es una paz parcial o precaria; es la paz perfecta, la paz multiplicada, la paz inexpugnable que ningún enemigo puede quebrar.\n\n¿Y sobre quién derrama Dios este *Shalom, Shalom*? \"A aquel cuyo pensamiento en ti persevera\". La palabra hebrea para pensamiento aquí es *yetser*, que alude al marco mental, a la imaginación y a las intenciones del corazón.\n\nY el verbo \"persevera\" es *samukh*, un vocablo gráfico que significa apoyarse con todo el peso del cuerpo, recostarse enteramente sobre algo sólido, o estar apuntalado como una pared sostenida por un contrafuerte de piedra maciza.\n\nLa paz mental no es una técnica psicológica de relajación pasiva; es el resultado de apoyar conscientemente todo el peso de tus pensamientos y temores sobre el carácter de Dios: sobre su fidelidad eterna, sobre sus promesas infalibles y sobre su soberanía absoluta.\n\nY el versículo 4 concluye con un mandato perentorio: \"Confiad en Jehová perpetuamente, porque en Jehová el Señor está la fortaleza de los siglos\".\n\nEn el hebreo, \"fortaleza de los siglos\" es *Tsur Olamim*: la Roca eterna de las edades. Todo lo que te rodea en este mundo visible está sujeto al cambio, al desgaste y al colapso: la economía fluctúa, los gobiernos caen, las empresas quiebran y los cuerpos envejecen. Pero el Señor es la Roca inmutable que permanece exactamente igual ayer, hoy y por los siglos.\n\nCuando anclas el ancla de tu mente en esa Roca eterna, las olas tempestuosas de la vida pueden sacudir la superficie de tus emociones, pero el lecho de tu alma permanecerá en perfecta y santa calma.",
        "aplicacion": "Haz un \"filtro de pensamientos\" durante el día de hoy: cada vez que asome a tu mente una idea de pánico o catástrofe (\"¿y qué si pasa lo peor?\"), interrúmpela de inmediato citando en voz baja Isaías 26:3 y afirmando tu mente en la fidelidad del Señor.",
        "pregunta_reflexion": "¿Sobre qué cimiento estás apoyando el peso de tus pensamientos diarios: sobre los rumores y noticias alarmantes o sobre la Roca eterna de la Palabra de Dios?",
        "oracion": "Señor Jehová, Tsur Olamim, Roca eterna de los siglos y fortaleza de mi alma.\n\nHoy traigo cautivo todo pensamiento a la obediencia a Cristo. Renuncio a alimentar mi mente con fantasías de desastre, dudas corrosivas y temores infundados que el enemigo intenta sembrar en mi espíritu.\n\nApoyo hoy todo el peso de mi vida, de mi salud y de mi porvenir sobre la solidez inmutable de tus promesas. Guarda mi mente en ese bendito *Shalom, Shalom*, esa paz perfecta que el mundo no puede entender ni arrebatar.\n\nAfírmame en tu verdad y que mi corazón persevere confiado en ti hoy y para siempre. En el glorioso nombre de Jesús, amén."
      },
      {
        "numero_dia": 6,
        "titulo": "Jesús en la tormenta: ¿Por qué tenéis miedo? ¿Cómo no tenéis fe?",
        "referencia_biblica": "Marcos 4:35-41",
        "autor_contexto": "Autor: El evangelista Marcos relata un suceso histórico crucial en el mar de Galilea. El lago de Genesaret se encuentra a más de 200 metros bajo el nivel del mar, rodeado por montañas abruptas; los vientos fríos que descienden de las alturas colisionan repentinamente con el aire cálido y húmedo del agua, creando tempestades violentas repentinas capaces de hundir embarcaciones de pesca en cuestión de minutos.",
        "versiculos_clave": "Pasajes relacionados: Salmos 89:8-9 · Salmos 107:28-30 · Mateo 8:23-27 · Lucas 8:22-25 · Isaías 43:1-2 · Salmos 46:1-3",
        "predicacion": "Al caer la tarde, tras un día agotador de predicación a las multitudes, Jesús pronuncia una palabra de rumbo a sus discípulos: \"Pasemos al otro lado\". Esa frase contenía en sí misma una garantía divina: Jesús no dijo \"naufraguemos en la mitad del lago\"; dijo \"pasemos al otro lado\". La palabra del Maestro siempre llega a destino.\n\nSin embargo, mientras navegaban, se desató una tormenta de proporciones terroríficas: \"Pero se levantó una gran tempestad de viento (*lailaps megalē*, un huracán violento y arremolinado), y echaba las olas en la barca, de tal manera que ya se anegaba\".\n\nRecuerda que en esa barca había al menos cuatro pescadores experimentados (Pedro, Andrés, Jacobo y Juan) que habían crecido en ese lago y conocían cada corriente. Si ellos estaban aterrados, es porque la embarcación estaba verdaderamente al borde del naufragio inminente.\n\nY en medio de ese caos de agua, truenos y gritos desesperados, el evangelista registra uno de los contrastes más sublimes de toda la Escritura: \"Y él estaba en la popa, durmiendo sobre un cabezal\".\n\n¿Cómo podía alguien dormir plácidamente en medio de un huracán que anegaba la barca? El sueño de Jesús no era indiferencia; era la manifestación visible del reposo absoluto y perfecto del Hijo en los brazos soberanos del Padre celestial.\n\nLos discípulos, desesperados, lo despiertan con un reclamo cargado de pánico: \"¡Maestro! ¿No tienes cuidado que perecemos?\".\n\nCuántas veces, en medio de nuestras propias tormentas (una crisis familiar, una deuda que ahoga, una enfermedad que no cede), hemos pronunciado la misma acusación en nuestro corazón: \"Señor, ¿acaso no te importa lo que me está pasando? ¿Por qué pareces estar en silencio o durmiendo?\".\n\nPero observa lo que ocurre a continuación: \"Y levantándose, reprendió al viento, y dijo al mar: ¡Calla, enmudece! (*Siōpa, pephimōso*, literalmente: \"¡Guarda silencio! ¡Ponte un bozal!\"). Y cesó el viento, y se hizo grande bonanza (*galēnē megalē*)\".\n\nLa misma voz que en el Génesis ordenó: \"Sea la luz\" y la luz fue, le habla al viento desbocado y a las olas rugientes como un amo que manda a callar a su perro doméstico. Y la tempestad colosal se transforma en un espejo de cristal inmóvil.\n\nY entonces Jesús se vuelve a los suyos con dos preguntas que traspasan los siglos: \"¿Por qué estáis así amedrentados? ¿Cómo no tenéis fe?\".\n\nLa fe verdadera no consiste en creer que nunca habrá tempestades; consiste en saber que mientras Cristo esté en tu barca, tu barca jamás se irá a pique. El Creador de los vientos está contigo: su descanso puede ser tu descanso hoy.",
        "aplicacion": "Identifica la \"tormenta\" que hoy parece estar anegando tu barca. En vez de reclamarle a Dios con angustia, dile con fe: \"Señor Jesús, tú estás conmigo en esta barca; reprendo todo espíritu de pánico y decido descansar en tu autoridad sobre esta tempestad\".",
        "pregunta_reflexion": "¿Estás midiendo la cercanía de Dios por la furia de las olas externas o por la presencia inmutable de Cristo dentro de tu vida?",
        "oracion": "Señor Jesucristo, Dueño soberano de los vientos y de las tempestades.\n\nPerdóname por las veces en que he dudado de tu cuidado paternal y he gritado en mi desesperación pensando que ibas a dejarme perecer en medio de la tormenta. Reconozco que mi fe ha flaqueado ante el rugir de las olas.\n\nHoy te miro a ti en la barca de mi vida. Levántate con tu voz de poder y habla a mis circunstancias: ¡Calla y enmudece todo viento de angustia, temor y confusión!\n\nHaz en mi espíritu esa \"grande bonanza\" que sólo tu presencia puede producir. Enséñame a reposar confiado bajo tu amparo soberano, sabiendo que contigo llegaré seguro a la otra orilla. En tu glorioso nombre, amén."
      },
      {
        "numero_dia": 7,
        "titulo": "Más que vencedores: La victoria final sobre el temor",
        "referencia_biblica": "Romanos 8:31-39",
        "autor_contexto": "Autor: El apóstol Pablo. Clímax majestuoso de su carta magna a los Romanos. Escribiendo a una iglesia que enfrentaría la hostilidad creciente del imperio romano, confiscación de bienes, calumnias y pronto la hoguera y las fieras en el Coliseo, Pablo entona el himno triunfal más poderoso jamás compuesto sobre la seguridad inamovible de los hijos de Dios.",
        "versiculos_clave": "Pasajes relacionados: Juan 10:28-29 · 1 Juan 4:18 · 1 Juan 5:4 · 2 Corintios 2:14 · Salmos 27:1 · Hebreos 13:5-6",
        "predicacion": "Hemos llegado a la cumbre más gloriosa de toda la teología bíblica sobre la paz y la seguridad interior. Pablo abre fuego con una pregunta retórica demoledora: \"¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?\".\n\nNo dice que no habrá oposición: habrá enemigos, calumnias, crisis y pruebas. Pero frente a la inmensidad del Dios Todopoderoso que ha prometido defendernos, cualquier adversario queda reducido a la nada.\n\nY el apóstol despliega el argumento supremo de la cruz: \"El que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros, ¿cómo no nos dará también con él todas las cosas?\".\n\nEsta es la lógica inquebrantable de la fe: si Dios ya pagó el precio astronómico e infinito de entregar a su Unigénito para rescatarte del infierno, ¿cómo puedes pensar que ahora te va a abandonar frente a tus necesidades cotidianas de salud, trabajo, sustento o protección? Quien dio lo más grande dará con certeza lo menor.\n\nY entonces Pablo lanza una lista de las peores pesadillas que pueden azotar al ser humano en esta tierra: \"¿Quién nos separará del amor de Cristo? ¿Tribulación, o angustia, o persecución, o hambre, o desnudez, o peligro, o espada?\".\n\nNinguna de estas siete tragedias era teórica para Pablo: él había experimentado el hambre en prisión, los naufragios, las pedradas y la persecución despiadada. Y sin embargo, pronuncia con denuedo cósmico:\n\n\"Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó\".\n\nLa expresión \"más que vencedores\" traduce un vocablo griego único y colosal: *hypernikōmen* (súper-vencedores, conquistadores con holgura infinita). No salimos de las pruebas apenas arrastrándonos como sobrevivientes mutilados; salimos coronados de gloria, enriquecidos en fe y más semejantes a Cristo que antes de entrar a la batalla.\n\nY el capítulo sella nuestra paz eterna con la convicción más sublime de la revelación divina:\n\n\"Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados, ni potestades, ni lo presente, ni lo por venir, ni lo alto, ni lo profundo, ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro\".\n\nNo hay virus, no hay crisis financiera, no hay amenaza de muerte ni poder demoníaco que pueda romper el lazo eterno con el que Cristo te tiene aferrado en su mano. En esa certeza absoluta reside la raíz de la verdadera paz sobrenatural: nada ni nadie en todo el cosmos puede separarte del amor de tu Dios.",
        "aplicacion": "Lee Romanos 8:38-39 en voz alta poniéndote de pie. Concluye estos 7 días alabando al Señor por su amor inquebrantable y decidiendo vivir cada día no como víctima del temor, sino como \"más que vencedor\" en Cristo.",
        "pregunta_reflexion": "¿Estás viviendo atemorizado por las amenazas temporales de este mundo o afirmado en la victoria eterna e indestructible del amor de Cristo?",
        "oracion": "Padre celestial, Dios de pactos eternos y Señor de toda consolación.\n\nAl culminar estos 7 días de estudio sobre tu paz sobrenatural, mi espíritu se llena de adoración y gratitud indecible. Gracias por el amor infinito manifestado en la cruz de tu Hijo Jesucristo, quien no escatimó su propia vida por mí.\n\nHoy proclamo que en Cristo soy más que vencedor. Renuncio para siempre al pánico, a la ansiedad crónica y al temor al futuro. Sé con certeza inamovible que ni la muerte, ni la vida, ni ninguna tribulación terrenal podrá jamás separarme de tu amor.\n\nInunda mi hogar, mi mente y mis días con tu *Shalom* eterno. Que mi vida sea un testimonio vivo de descanso, victoria y gozo inconmovible para tu santa gloria. ¡A ti sea el honor, la gloria, el poder y la alabanza por siempre! Amén."
      }
    ]
  }
];

const CLAVE_SUSCRIPCIONES_LOCALES = 'mis_suscripciones_estudios_locales';

/**
 * Obtiene la lista de suscripciones locales guardadas en el dispositivo para un usuario.
 */
export async function obtenerSuscripcionesLocales(usuarioId = 'anonimo') {
  try {
    const raw = await AsyncStorage.getItem(`${CLAVE_SUSCRIPCIONES_LOCALES}_${usuarioId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Registra o actualiza el progreso de un estudio en el almacenamiento local.
 */
export async function registrarSuscripcionLocal(usuarioId, estudioId, datosProgreso) {
  try {
    const lista = await obtenerSuscripcionesLocales(usuarioId);
    const index = lista.findIndex((item) => item.estudio_id === estudioId);
    if (index >= 0) {
      lista[index] = { ...lista[index], ...datosProgreso };
    } else {
      lista.unshift(datosProgreso);
    }
    await AsyncStorage.setItem(`${CLAVE_SUSCRIPCIONES_LOCALES}_${usuarioId}`, JSON.stringify(lista));
  } catch (e) {
    console.log('Error registrando suscripción local:', e);
  }
}

/**
 * Elimina una suscripción del almacenamiento local.
 */
export async function eliminarSuscripcionLocal(usuarioId, estudioId) {
  try {
    const lista = await obtenerSuscripcionesLocales(usuarioId);
    const filtrada = lista.filter((item) => item.estudio_id !== estudioId);
    await AsyncStorage.setItem(`${CLAVE_SUSCRIPCIONES_LOCALES}_${usuarioId}`, JSON.stringify(filtrada));
  } catch (e) {
    console.log('Error eliminando suscripción local:', e);
  }
}

/**
 * Suscribirse a un estudio bíblico (Compatible con UUIDs en Supabase y estudios semilla locales).
 */
export async function suscribirseAEstudio(estudioId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { exito: false, error: 'Debes iniciar sesión para suscribirte a este estudio.' };
  }

  const datosProgreso = {
    usuario_id: user.id,
    estudio_id: estudioId,
    dia_actual: 1,
    completado: false,
    ultima_actividad: new Date().toISOString(),
  };

  // 1. Guardar de inmediato en almacenamiento local para respuesta instantánea (0ms) y compatibilidad total
  await registrarSuscripcionLocal(user.id, estudioId, datosProgreso);

  // 2. Si el ID es un UUID válido de Supabase, sincronizar con la tabla progreso_usuario
  if (esUUID(estudioId)) {
    try {
      const { data, error } = await supabase.from('progreso_usuario').upsert(
        {
          usuario_id: user.id,
          estudio_id: estudioId,
          dia_actual: 1,
          completado: false,
          ultima_actividad: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,estudio_id' }
      ).select().single();

      if (!error && data) {
        return { exito: true, datos: data };
      }
      if (error) {
        console.log('Aviso progreso_usuario en Supabase:', error.message);
      }
    } catch (e) {
      console.log('Excepción progreso_usuario en Supabase:', e.message);
    }
  }

  return { exito: true, datos: datosProgreso };
}

/**
 * Desuscribirse de un estudio bíblico.
 */
export async function desuscribirseDeEstudio(estudioId) {
  const { data: { user } } = await supabase.auth.getUser();
  const usuarioId = user?.id || 'anonimo';

  // 1. Eliminar localmente
  await eliminarSuscripcionLocal(usuarioId, estudioId);

  // 2. Si es UUID, eliminar de Supabase
  if (user && esUUID(estudioId)) {
    try {
      await supabase
        .from('progreso_usuario')
        .delete()
        .eq('usuario_id', user.id)
        .eq('estudio_id', estudioId);
    } catch (_) {}
  }

  return { exito: true };
}

/**
 * Obtener suscripción del usuario para un estudio (desde Supabase o caché local).
 */
export async function obtenerSuscripcion(estudioId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const usuarioId = user?.id || 'anonimo';

    // 1. Si es UUID y hay usuario autenticado, consultar Supabase
    if (user && esUUID(estudioId)) {
      const { data, error } = await supabase
        .from('progreso_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('estudio_id', estudioId)
        .maybeSingle();

      if (!error && data) return data;
    }

    // 2. Consultar almacenamiento local (para estudios semilla u offline)
    const lista = await obtenerSuscripcionesLocales(usuarioId);
    const encontrado = lista.find((item) => item.estudio_id === estudioId);
    if (encontrado) return encontrado;
  } catch (e) {
    console.log('Error obteniendo suscripción:', e.message);
  }
  return null;
}

/**
 * Obtener todas las suscripciones activas del usuario (combina Supabase y semillas locales).
 */
export async function obtenerMisEstudiosSuscritos() {
  const { data: { user } } = await supabase.auth.getUser();
  const usuarioId = user?.id || 'anonimo';

  // 1. Cargar desde Supabase si está autenticado
  let desdeDb = [];
  if (user) {
    try {
      const { data, error } = await supabase
        .from('progreso_usuario')
        .select('*, estudios(*, perfiles!autor_id(nombre_usuario))')
        .eq('usuario_id', user.id)
        .order('ultima_actividad', { ascending: false });
      if (!error && data) desdeDb = data;
    } catch (_) {}
  }

  // 2. Cargar locales
  const locales = await obtenerSuscripcionesLocales(usuarioId);
  const mapa = {};
  desdeDb.forEach((d) => {
    mapa[d.estudio_id] = d;
  });

  for (const l of locales) {
    if (!mapa[l.estudio_id]) {
      const semilla = ESTUDIOS_SEMILLA.find((s) => s.id === l.estudio_id);
      if (semilla) {
        mapa[l.estudio_id] = {
          ...l,
          estudios: {
            ...semilla,
            perfiles: { nombre_usuario: 'Manna Pastoral' },
          },
        };
      }
    }
  }

  return Object.values(mapa).sort(
    (a, b) => new Date(b.ultima_actividad || 0) - new Date(a.ultima_actividad || 0)
  );
}

/**
 * Obtiene el estudio actualmente activo en progreso para la pantalla de Inicio.
 */
export async function obtenerEstudioActivo(usuarioId) {
  try {
    const lista = await obtenerMisEstudiosSuscritos();
    const activo = lista.find((s) => !s.completado);
    if (!activo) return null;

    const estudioInfo = activo.estudios || ESTUDIOS_SEMILLA.find((s) => s.id === activo.estudio_id);
    return {
      estudioId: activo.estudio_id,
      titulo: estudioInfo?.titulo || 'Plan Bíblico',
      diaActual: activo.dia_actual || 1,
      numDias: estudioInfo?.num_dias || 7,
      completado: !!activo.completado,
    };
  } catch {
    return null;
  }
}

/**
 * Avanza el día actual y marca completado si llega al final.
 */
export async function avanzarDiaEstudio(estudioId, nuevoDia, totalDias) {
  const { data: { user } } = await supabase.auth.getUser();
  const usuarioId = user?.id || 'anonimo';
  const esCompletado = nuevoDia >= totalDias;
  const diaValido = Math.min(nuevoDia, totalDias);

  const datosProgreso = {
    usuario_id: usuarioId,
    estudio_id: estudioId,
    dia_actual: diaValido,
    completado: esCompletado,
    ultima_actividad: new Date().toISOString(),
  };

  // 1. Guardar localmente
  await registrarSuscripcionLocal(usuarioId, estudioId, datosProgreso);

  // 2. Si es UUID, sincronizar con Supabase
  if (user && esUUID(estudioId)) {
    try {
      await supabase.from('progreso_usuario').upsert(
        {
          usuario_id: user.id,
          estudio_id: estudioId,
          dia_actual: diaValido,
          completado: esCompletado,
          ultima_actividad: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,estudio_id' }
      );
    } catch (e) {
      console.log('Error avanzando día en Supabase:', e.message);
    }
  }

  return { exito: true, completado: esCompletado, dia_actual: diaValido };
}

/**
 * Genera un estudio bíblico con estructura homilética completa por día con IA.
 */
export async function generarEstudioCompletoConIA({
  libroOCapitulo = 'Romanos 8',
  tema = 'Vida en el Espíritu',
  numDias = 7,
  publicarDirecto = true,
}) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const { data: { user } } = await supabase.auth.getUser();

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('tu-clave')) {
    const semillaCoincidente =
      numDias === 30 ? ESTUDIOS_SEMILLA[2] :
      numDias === 15 ? ESTUDIOS_SEMILLA[1] :
      ESTUDIOS_SEMILLA[0];

    if (user) {
      await guardarEstudioEnSupabase(semillaCoincidente, user.id, publicarDirecto);
    }
    return {
      exito: true,
      estudio: semillaCoincidente,
      aviso: 'Plan bíblico seleccionado de nuestro catálogo pastoral curado para tu edificación espiritual.',
    };
  }

  const prompt = `
Eres un pastor y maestro bíblico cristiano evangélico con una profunda sensibilidad y calidez pastoral (Biblia Reina-Valera 1960).
Vas a crear un PLAN DEVOCIONAL DE ESTUDIO BÍBLICO PROFESIONAL, EXTENSO Y PROFUNDO DE ${numDias} DÍAS SOBRE: ${libroOCapitulo}.
Temática central: ${tema}.

CADA DÍA DEBE SER UNA ENSEÑANZA PROFUNDA, NUTRITIVA Y CÁLIDA (Estilo expositivo pastoral con aplicación al corazón):
- Título inspirador y directo (máximo 8 palabras).
- Pasaje bíblico exacto (RV1960).
- Reflexión pastoral EXTENSA Y DETALLADA: MÍNIMO 4 A 6 PÁRRAFOS BIEN DESARROLLADOS (cada párrafo de 2 a 4 oraciones) separados por saltos de línea dobles (\\n\\n). No hagas resúmenes cortos de 2 líneas. Explora el contexto histórico y espiritual del pasaje, desglosa el significado de los versículos, conecta con las luchas y dilemas reales de la vida moderna (trabajo, familia, miedos, dudas, decisiones) y entrega una esperanza firme en Cristo.
- PROHIBIDO usar números romanos o divisiones académicas frías (NO usar "I." ni "II.").
- Aplicación para hoy: Un paso de fe muy concreto, práctico y tangible para poner en obra hoy.
- Para meditar: Una o dos preguntas de introspección espiritual sinceras y profundas.
- Oración especial: Oración sincera y vulnerable en primera persona para sellar el día (al menos 1 a 2 párrafos de oración profunda).

ESTRUCTURA JSON OBLIGATORIA (sin delimitadores markdown extra):
{
  "titulo": "Título inspirador del estudio",
  "descripcion": "Descripción inspiradora del plan de estudio de 2 a 3 oraciones.",
  "tema": "${tema}",
  "num_dias": ${numDias},
  "dias": [
    ${Array.from({ length: numDias }, (_, i) => `{
      "numero_dia": ${i + 1},
      "titulo": "Título de la reflexión del día ${i + 1}",
      "referencia_biblica": "Cita bíblica precisa de la RV1960",
      "predicacion": "Reflexión profunda y extensa de 4 a 6 párrafos bien desarrollados (separados por doble salto de línea \\\\n\\\\n), cercana, bíblica y sin números romanos.",
      "aplicacion": "Paso de fe concreto y edificante para hoy.",
      "pregunta_reflexion": "Pregunta de autoexamen espiritual profunda y amorosa.",
      "oracion": "Oración especial sincera en primera persona de 1 a 2 párrafos."
    }`).join(',\n    ')}
  ]
}
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const respuesta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!respuesta.ok) {
      throw new Error(`Error en API de Gemini: ${respuesta.status}`);
    }

    const dataJson = await respuesta.json();
    const textoRespuesta = dataJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    const limpio = textoRespuesta
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '');

    const estudioGenerado = JSON.parse(limpio);

    if (user) {
      const guardado = await guardarEstudioEnSupabase(estudioGenerado, user.id, publicarDirecto);
      return { exito: true, estudio: guardado || estudioGenerado };
    }

    return { exito: true, estudio: estudioGenerado };
  } catch (error) {
    console.warn('Error en generador de estudios con IA:', error);
    const semilla = ESTUDIOS_SEMILLA[0];
    if (user) await guardarEstudioEnSupabase(semilla, user.id, publicarDirecto);
    return {
      exito: true,
      estudio: semilla,
      aviso: 'Ocurrió un detalle al contactar la IA. Te mostramos este plan bíblico de nuestro catálogo pastoral.',
    };
  }
}

/**
 * Guarda un estudio y sus días en Supabase empaquetando la estructura profesional.
 */
export async function guardarEstudioEnSupabase(estudio, autorId, publicarDirecto = true) {
  try {
    const { data: nuevoEstudio, error: errorEstudio } = await supabase
      .from('estudios')
      .insert({
        autor_id: autorId,
        titulo: estudio.titulo,
        descripcion: estudio.descripcion,
        tema: estudio.tema,
        portada_url: estudio.portada_url || null,
        num_dias: estudio.num_dias || estudio.dias?.length || 7,
        estado: publicarDirecto ? 'publicado' : 'pendiente',
        creado_en: new Date().toISOString(),
      })
      .select()
      .single();

    if (errorEstudio) {
      console.warn('Error guardando estudio en Supabase:', errorEstudio.message);
      return null;
    }

    if (estudio.dias && estudio.dias.length > 0) {
      const filasDias = estudio.dias.map((d, i) => {
        const estructurado = JSON.stringify({
          titulo: d.titulo,
          predicacion: d.predicacion || d.reflexion,
          aplicacion: d.aplicacion || d.paso_practico || '',
          pregunta_reflexion: d.pregunta_reflexion || '',
          oracion: d.oracion || '',
        });

        return {
          estudio_id: nuevoEstudio.id,
          numero_dia: d.numero_dia || i + 1,
          titulo: d.titulo,
          referencia_biblica: d.referencia_biblica,
          texto_biblico: d.texto_biblico || null,
          reflexion: estructurado,
          pregunta_reflexion: d.pregunta_reflexion || null,
          imagen_url: d.imagen_url || null,
        };
      });

      await supabase.from('dias_estudio').insert(filasDias);
    }

    return nuevoEstudio;
  } catch (e) {
    console.warn('Excepción guardando estudio:', e);
    return null;
  }
}
