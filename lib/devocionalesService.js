import { supabase } from './supabase.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarVersiculo } from './bibliaApi.js';

export const TEMAS_DEVOCIONALES = [
  {
    id: 'todos',
    etiqueta: 'Todos',
    icono: 'apps-outline',
    color: '#6366F1',
    descripcion: 'Explora toda la colección de predicaciones y reflexiones',
  },
  {
    id: 'malos_habitos',
    etiqueta: 'Dejar un mal hábito',
    icono: 'shield-checkmark-outline',
    color: '#E11D48',
    descripcion: 'Dominio propio, vencer la pereza, la queja, distracciones e impureza',
  },
  {
    id: 'fortalecer_fe',
    etiqueta: 'Fortalecer la fe',
    icono: 'flame-outline',
    color: '#2563EB',
    descripcion: 'Confianza en la prueba, promesas de Dios y firmeza espiritual',
  },
  {
    id: 'paz_ansiedad',
    etiqueta: 'Paz y calma',
    icono: 'leaf-outline',
    color: '#059669',
    descripcion: 'Descanso en el desvelo, calmar la mente y entregar el control',
  },
  {
    id: 'diario',
    etiqueta: 'Devocionales diarios',
    icono: 'sunny-outline',
    color: '#D97706',
    descripcion: 'Reflexiones bíblicas cotidianas para empezar el día en oración',
  },
];

export const SUBTEMAS_MALOS_HABITOS = [
  { id: 'pereza', titulo: 'Vencer la pereza y procrastinación', pasaje: 'Proverbios 6:6-11' },
  { id: 'enojo', titulo: 'Frenar el enojo, ira e impaciencia', pasaje: 'Proverbios 16:32' },
  { id: 'distraccion', titulo: 'Adicción a redes sociales y distracciones', pasaje: 'Efesios 5:15-16' },
  { id: 'queja', titulo: 'Dejar la queja y murmuración', pasaje: 'Filipenses 2:14-15' },
  { id: 'impureza', titulo: 'Pureza en pensamientos y mirada', pasaje: 'Filipenses 4:8' },
  { id: 'chisme', titulo: 'Dominar la lengua y las palabras', pasaje: 'Santiago 3:5-10' },
  { id: 'culpa', titulo: 'Soltar la culpa y condenación del pasado', pasaje: 'Romanos 8:1' },
  { id: 'adicciones', titulo: 'Romper ataduras y malos hábitos ocultos', pasaje: '1 Corintios 6:12' },
];

export const SUBTEMAS_FORTALECER_FE = [
  { id: 'incertidumbre', titulo: 'Confiar en la incertidumbre sin ver el camino', pasaje: 'Hebreos 11:1' },
  { id: 'tormenta', titulo: 'Paz en medio de las pruebas difíciles', pasaje: 'Marcos 4:39-40' },
  { id: 'promesas', titulo: 'Dios nunca llega tarde ni falla a su palabra', pasaje: 'Lamentaciones 3:22-26' },
  { id: 'identidad', titulo: 'Recordar tu identidad victoriosa en Cristo', pasaje: 'Efesios 1:3-6' },
  { id: 'pelea', titulo: 'Dios pelea tus batallas silenciosas', pasaje: 'Éxodo 14:14' },
  { id: 'desierto', titulo: 'Ríos de agua viva en tiempos secos', pasaje: 'Isaías 43:18-19' },
  { id: 'perseverancia', titulo: 'Perseverar con paciencia sin desmayar', pasaje: 'Gálatas 6:9' },
];

export const SUBTEMAS_PAZ_ANSIEDAD = [
  { id: 'ansiedad_afan', titulo: 'Calmar la mente y vencer el afán diario', pasaje: 'Filipenses 4:6-7' },
  { id: 'insomnio', titulo: 'Descanso en el insomnio y la noche', pasaje: 'Salmos 4:8' },
  { id: 'soltar_control', titulo: 'Soltar la angustia por el día de mañana', pasaje: 'Mateo 6:33-34' },
  { id: 'sobrecarga', titulo: 'Cansancio extremo y agobio laboral', pasaje: 'Mateo 11:28-30' },
  { id: 'miedo', titulo: 'Vencer el temor y la opresión en el pecho', pasaje: 'Isaías 41:10' },
  { id: 'soledad', titulo: 'Consuelo en la soledad y momentos difíciles', pasaje: 'Salmos 34:18' },
];

export const SUBTEMAS_DIARIO = [
  { id: 'gratitud', titulo: 'Gratitud al comenzar un nuevo día', pasaje: 'Salmos 118:24' },
  { id: 'sabiduria', titulo: 'Sabiduría y discernimiento en decisiones', pasaje: 'Santiago 1:5' },
  { id: 'provision', titulo: 'Provisión en el trabajo y las finanzas', pasaje: 'Filipenses 4:19' },
  { id: 'familia', titulo: 'Paz y bendición en el hogar y matrimonio', pasaje: 'Colosenses 3:12-14' },
  { id: 'perdon', titulo: 'Perdonar de corazón y liberarse del rencor', pasaje: 'Efesios 4:31-32' },
  { id: 'proposito', titulo: 'Caminar con propósito e impacto en otros', pasaje: 'Miqueas 6:8' },
];

export function obtenerSubtemasPorTema(temaId) {
  if (temaId === 'malos_habitos') return SUBTEMAS_MALOS_HABITOS;
  if (temaId === 'fortalecer_fe') return SUBTEMAS_FORTALECER_FE;
  if (temaId === 'paz_ansiedad') return SUBTEMAS_PAZ_ANSIEDAD;
  if (temaId === 'diario') return SUBTEMAS_DIARIO;
  return [
    SUBTEMAS_MALOS_HABITOS[0],
    SUBTEMAS_MALOS_HABITOS[1],
    SUBTEMAS_FORTALECER_FE[0],
    SUBTEMAS_FORTALECER_FE[1],
    SUBTEMAS_PAZ_ANSIEDAD[0],
    SUBTEMAS_PAZ_ANSIEDAD[3],
    SUBTEMAS_DIARIO[0],
  ];
}

export async function obtenerApiKeyGemini() {
  const deEnv = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (deEnv && deEnv.trim() !== '' && !deEnv.includes('tu-clave')) {
    return deEnv.trim();
  }
  try {
    const deStorage = await AsyncStorage.getItem('gemini_api_key_usuario');
    if (deStorage && deStorage.trim() !== '') {
      return deStorage.trim();
    }
  } catch {}
  return null;
}

export async function guardarApiKeyGemini(key) {
  try {
    if (!key || key.trim() === '') {
      await AsyncStorage.removeItem('gemini_api_key_usuario');
    } else {
      await AsyncStorage.setItem('gemini_api_key_usuario', key.trim());
    }
    return true;
  } catch {
    return false;
  }
}

// Catálogo enriquecido con devocionales de 18 a 22 párrafos, tono pastoral cálido y oraciones extensas:
export const BANCO_DEVOCIONALES_SEMILLA = [
  // --- 1. DEJA TODOS TUS PLANES EN MANOS DE DIOS ---
  {
    id: 'semilla-planes-dios',
    tema: 'paz_ansiedad',
    titulo: 'Deja todos tus planes en manos de Dios',
    referencia_biblica: 'Proverbios 16:3',
    predicacion:
      'Todos hacemos planes.\n\n' +
      'Pensamos qué queremos conseguir este año, dónde queremos estar en unos meses, cómo mejorar nuestro trabajo, cómo cuidar a nuestra familia, qué cosas queremos comprar o qué sueños queremos alcanzar. Tener planes no está mal. De hecho, es bueno soñar, trabajar y prepararnos.\n\n' +
      'El problema aparece cuando queremos controlar cada detalle.\n\n' +
      'Queremos saber cuándo llegará la respuesta, cómo se resolverá el problema, qué va a pasar mañana y cuál será exactamente el resultado de cada decisión. Y cuando algo se sale de nuestro plan, nos llenamos de ansiedad.\n\n' +
      'Por eso Proverbios 16:3 nos da un consejo sencillo, pero profundo: “Encomienda a Jehová tus obras.”\n\n' +
      'En otras palabras: haz tus planes, trabaja por ellos, pero no los cargues tú solo.\n\n' +
      'Hay una gran diferencia entre decirle a Dios: “Señor, bendice lo que yo ya decidí”, y decirle: “Señor, este es el deseo que tengo, pero si el camino que estoy tomando no es el correcto, muéstramelo”.\n\n' +
      'La segunda oración requiere confianza.\n\n' +
      'Quizás estás buscando un trabajo y has enviado muchas hojas de vida. Quizás estás comenzando un negocio, esperando una oportunidad, tomando una decisión familiar o tratando de salir adelante con un proyecto que todavía no da los resultados que esperabas.\n\n' +
      'Haz tu parte.\n\n' +
      'Prepárate. Trabaja. Pregunta. Intenta. Aprende. Corrige cuando sea necesario. Pero no olvides entregarle el proceso a Dios.\n\n' +
      'Porque a veces creemos que una puerta cerrada significa que Dios no nos escuchó. Y quizá simplemente está evitando que entremos en un lugar que no nos conviene.\n\n' +
      'También puede ocurrir que Dios no cambie inmediatamente las circunstancias, sino que primero cambie nuestra manera de enfrentarlas.\n\n' +
      'Cuando ponemos nuestros planes en sus manos, aprendemos a decir: “Señor, yo quiero esto, pero confío en ti incluso si tienes algo diferente”.\n\n' +
      'Eso no siempre es fácil.\n\n' +
      'A veces tendremos que soltar una idea que nos encantaba. A veces tendremos que empezar de nuevo. A veces tendremos que esperar mucho más de lo que queríamos.\n\n' +
      'Pero confiar en Dios significa entender que no necesitamos conocer todo el camino para dar el siguiente paso.\n\n' +
      'Hoy puedes llevarle a Dios tus planes tal como están. Tus proyectos, tus preocupaciones, tus sueños y también esos planes que todavía no le has contado a nadie.\n\n' +
      'Dile lo que quieres.\n\n' +
      'Pero también dile: “Señor, si este camino no es para mí, dame la humildad para aceptarlo. Y si sí lo es, dame fuerzas para caminarlo”.\n\n' +
      'Porque cuando Dios ocupa el centro de nuestros planes, dejamos de vivir tratando de controlar el futuro y comenzamos a caminar con confianza.',
    reflexion:
      'Todos hacemos planes.\n\n' +
      'Pensamos qué queremos conseguir este año, dónde queremos estar en unos meses, cómo mejorar nuestro trabajo, cómo cuidar a nuestra familia, qué cosas queremos comprar o qué sueños queremos alcanzar. Tener planes no está mal. De hecho, es bueno soñar, trabajar y prepararnos.\n\n' +
      'El problema aparece cuando queremos controlar cada detalle.\n\n' +
      'Queremos saber cuándo llegará la respuesta, cómo se resolverá el problema, qué va a pasar mañana y cuál será exactamente el resultado de cada decisión. Y cuando algo se sale de nuestro plan, nos llenamos de ansiedad.\n\n' +
      'Por eso Proverbios 16:3 nos da un consejo sencillo, pero profundo: “Encomienda a Jehová tus obras.”\n\n' +
      'En otras palabras: haz tus planes, trabaja por ellos, pero no los cargues tú solo.\n\n' +
      'Hay una gran diferencia entre decirle a Dios: “Señor, bendice lo que yo ya decidí”, y decirle: “Señor, este es el deseo que tengo, pero si el camino que estoy tomando no es el correcto, muéstramelo”.\n\n' +
      'La segunda oración requiere confianza.\n\n' +
      'Quizás estás buscando un trabajo y has enviado muchas hojas de vida. Quizás estás comenzando un negocio, esperando una oportunidad, tomando una decisión familiar o tratando de salir adelante con un proyecto que todavía no da los resultados que esperabas.\n\n' +
      'Haz tu parte.\n\n' +
      'Prepárate. Trabaja. Pregunta. Intenta. Aprende. Corrige cuando sea necesario. Pero no olvides entregarle el proceso a Dios.\n\n' +
      'Porque a veces creemos que una puerta cerrada significa que Dios no nos escuchó. Y quizá simplemente está evitando que entremos en un lugar que no nos conviene.\n\n' +
      'También puede ocurrir que Dios no cambie inmediatamente las circunstancias, sino que primero cambie nuestra manera de enfrentarlas.\n\n' +
      'Cuando ponemos nuestros planes en sus manos, aprendemos a decir: “Señor, yo quiero esto, pero confío en ti incluso si tienes algo diferente”.\n\n' +
      'Eso no siempre es fácil.\n\n' +
      'A veces tendremos que soltar una idea que nos encantaba. A veces tendremos que empezar de nuevo. A veces tendremos que esperar mucho más de lo que queríamos.\n\n' +
      'Pero confiar en Dios significa entender que no necesitamos conocer todo el camino para dar el siguiente paso.\n\n' +
      'Hoy puedes llevarle a Dios tus planes tal como están. Tus proyectos, tus preocupaciones, tus sueños y también esos planes que todavía no le has contado a nadie.\n\n' +
      'Dile lo que quieres.\n\n' +
      'Pero también dile: “Señor, si este camino no es para mí, dame la humildad para aceptarlo. Y si sí lo es, dame fuerzas para caminarlo”.\n\n' +
      'Porque cuando Dios ocupa el centro de nuestros planes, dejamos de vivir tratando de controlar el futuro y comenzamos a caminar con confianza.',
    paso_practico:
      'Escribe en una libreta o en tu teléfono los planes que más te preocupan en este momento. Luego, dile a Dios en oración: “Señor, estos son mis planes, pero confío más en tu dirección que en mis propias fuerzas.”',
    preguntas: [
      '¿Qué plan o decisión estás intentando controlar por ti mismo en lugar de entregárselo a Dios?',
      '¿Confías en que los planes de Dios para tu vida son mejores que los tuyos?',
    ],
    oracion:
      'Señor, hoy pongo delante de ti todos mis planes.\n\n' +
      'Tú conoces esos sueños que me emocionan, pero también sabes cuáles me preocupan. Conoces las decisiones que tengo que tomar, las oportunidades que estoy esperando y esas cosas que quisiera resolver de una vez.\n\n' +
      'A veces quiero tener todo bajo control. Quiero saber qué va a pasar, cuándo va a pasar y cómo terminará cada situación. Me cuesta esperar y me cuesta aceptar cuando las cosas no salen como las imaginé.\n\n' +
      'Por eso hoy quiero entregarte mis planes de verdad.\n\n' +
      'No solamente quiero pedirte que bendigas lo que yo ya decidí. Quiero tener un corazón dispuesto a escucharte. Si voy por un camino que no me conviene, dame la valentía para detenerme. Si una puerta se cierra, ayúdame a no pensar inmediatamente que todo salió mal. Y si me abres una puerta, dame sabiduría para reconocerla.\n\n' +
      'Ayúdame a hacer mi parte sin vivir desesperado por los resultados. Enséñame a trabajar con responsabilidad, pero a descansar en ti.\n\n' +
      'Cuando tenga miedo de equivocarme, recuérdame que puedo buscar tu dirección. Cuando algo tarde más de lo esperado, dame paciencia. Y cuando mis planes cambien, ayúdame a confiar en que mi vida no se salió de tus manos.\n\n' +
      'Señor, toma mis sueños, mis proyectos y mis preocupaciones. Que tu paz guarde mi corazón hoy y siempre. En el nombre de Jesús, amén.',
  },

  // --- 2. VENCER LA PEREZA Y PROCRASTINACIÓN ---
  {
    id: 'semilla-habito-1',
    tema: 'malos_habitos',
    titulo: 'Vencer la pereza: De la postergación a la diligencia',
    referencia_biblica: 'Proverbios 6:6-8',
    predicacion:
      'Todos conocemos esa sensación de dejar las cosas para después.\n\n' +
      'Nos decimos a nosotros mismos: “Mañana empiezo”, “el lunes retomo con calma”, “ahora no tengo el ánimo suficiente” o “cuando esté más desocupado lo haré mucho mejor”. Y sin darnos cuenta, los días pasan, las semanas se escapan, los compromisos se acumulan y una pesadez silenciosa se va instalando en el pecho.\n\n' +
      'La pereza casi nunca se presenta como un deseo abierto de no hacer nada; casi siempre se disfraza de cansancio justificado o de espera del “momento perfecto”.\n\n' +
      'Buscamos el alivio momentáneo de posponer lo que cuesta esfuerzo, pero terminamos pagando un precio muy alto: estrés de última hora, metas rotas, promesas incumplidas y una constante sensación de culpa interior.\n\n' +
      'Por eso el sabio Salomón nos aconseja con una sencillez gráfica inolvidable en Proverbios 6:6-8: “Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán, ni gobernador, ni señor, prepara en el verano su comida, y recoge en el tiempo de la siega su mantenimiento.”\n\n' +
      'La hormiga no espera a sentir ganas para actuar.\n\n' +
      'No necesita que alguien esté detrás vigilando sus pasos, ni un reloj despertador que le grite que se levante. Tiene una convicción interna clara y da pasos pequeños pero continuos cada día.\n\n' +
      'En la vida real, muchas veces cometemos el gravísimo error de esperar a “sentir ganas” para orar, para abrir la Biblia, para cumplir con el trabajo pendiente o para ordenar nuestro hogar.\n\n' +
      'Pero la madurez espiritual y humana no se construye sobre las emociones fluctuantes; se edifica sobre la obediencia fiel.\n\n' +
      'Quizás estás postergando una conversación difícil que necesitas tener para sanar una relación. Quizás estás postergando retomar tus estudios, hacer ejercicio, ordenar tus finanzas o tener ese tiempo diario a solas con Dios que tu alma tanto necesita.\n\n' +
      'Dios no te está pidiendo que resuelvas toda tu vida en una sola tarde.\n\n' +
      'Tampoco te pide que hagas proezas sobrehumanas hoy. Lo que Dios te pide es fidelidad en el paso que te corresponde dar en este día: levantarte a tiempo, cumplir tu palabra, honrar tu trabajo y avanzar con constancia en lo que dejaste a medias.\n\n' +
      'Cuando decides dar el primer paso a pesar de no tener ganas, sucede algo hermoso: la motivación no suele llegar antes de empezar, sino que aparece mientras estás en movimiento de la mano de Dios.\n\n' +
      'Dar el paso requiere renuncia.\n\n' +
      'Tendremos que apagar las pantallas un momento, soltar la comodidad del sillón y decirle no a la excusa fácil de siempre.\n\n' +
      'Pero la satisfacción de acostarte en la noche sabiendo que hiciste tu parte en obediencia a Dios no tiene precio.\n\n' +
      'Hoy no esperes al próximo lunes ni al próximo mes. Dios te ha dado un nuevo día lleno de propósito y fuerzas frescas.\n\n' +
      'Rompe el ciclo de la postergación hoy. Da ese primer paso de fe, y verás cómo el Señor renueva tus fuerzas a lo largo de todo el camino.',
    reflexion:
      'Todos conocemos esa sensación de dejar las cosas para después.\n\n' +
      'Nos decimos a nosotros mismos: “Mañana empiezo”, “el lunes retomo con calma”, “ahora no tengo el ánimo suficiente” o “cuando esté más desocupado lo haré mucho mejor”. Y sin darnos cuenta, los días pasan, las semanas se escapan, los compromisos se acumulan y una pesadez silenciosa se va instalando en el pecho.\n\n' +
      'La pereza casi nunca se presenta como un deseo abierto de no hacer nada; casi siempre se disfraza de cansancio justificado o de espera del “momento perfecto”.\n\n' +
      'Buscamos el alivio momentáneo de posponer lo que cuesta esfuerzo, pero terminamos pagando un precio muy alto: estrés de última hora, metas rotas, promesas incumplidas y una constante sensación de culpa interior.\n\n' +
      'Por eso el sabio Salomón nos aconseja con una sencillez gráfica inolvidable en Proverbios 6:6-8: “Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán, ni gobernador, ni señor, prepara en el verano su comida, y recoge en el tiempo de la siega su mantenimiento.”\n\n' +
      'La hormiga no espera a sentir ganas para actuar.\n\n' +
      'No necesita que alguien esté detrás vigilando sus pasos, ni un reloj despertador que le grite que se levante. Tiene una convicción interna clara y da pasos pequeños pero continuos cada día.\n\n' +
      'En la vida real, muchas veces cometemos el gravísimo error de esperar a “sentir ganas” para orar, para abrir la Biblia, para cumplir con el trabajo pendiente o para ordenar nuestro hogar.\n\n' +
      'Pero la madurez espiritual y humana no se construye sobre las emociones fluctuantes; se edifica sobre la obediencia fiel.\n\n' +
      'Quizás estás postergando una conversación difícil que necesitas tener para sanar una relación. Quizás estás postergando retomar tus estudios, hacer ejercicio, ordenar tus finanzas o tener ese tiempo diario a solas con Dios que tu alma tanto necesita.\n\n' +
      'Dios no te está pidiendo que resuelvas toda tu vida en una sola tarde.\n\n' +
      'Tampoco te pide que hagas proezas sobrehumanas hoy. Lo que Dios te pide es fidelidad en el paso que te corresponde dar en este día: levantarte a tiempo, cumplir tu palabra, honrar tu trabajo y avanzar con constancia en lo que dejaste a medias.\n\n' +
      'Cuando decides dar el primer paso a pesar de no tener ganas, sucede algo hermoso: la motivación no suele llegar antes de empezar, sino que aparece mientras estás en movimiento de la mano de Dios.\n\n' +
      'Dar el paso requiere renuncia.\n\n' +
      'Tendremos que apagar las pantallas un momento, soltar la comodidad del sillón y decirle no a la excusa fácil de siempre.\n\n' +
      'Pero la satisfacción de acostarte en la noche sabiendo que hiciste tu parte en obediencia a Dios no tiene precio.\n\n' +
      'Hoy no esperes al próximo lunes ni al próximo mes. Dios te ha dado un nuevo día lleno de propósito y fuerzas frescas.\n\n' +
      'Rompe el ciclo de la postergación hoy. Da ese primer paso de fe, y verás cómo el Señor renueva tus fuerzas a lo largo de todo el camino.',
    paso_practico:
      'Identifica esa tarea, estudio o hábito que llevas postergando más de diez días. Apaga las notificaciones del teléfono durante 30 minutos continuos y avanza en ella hoy mismo sin excusas, dando gracias a Dios por darte capacidad y vida.',
    preguntas: [
      '¿Qué responsabilidad concreta de tu vida personal, laboral o espiritual has estado descuidando con la excusa de "mañana lo haré"?',
      '¿Estás esperando a sentir ganas para actuar, o estás dispuesto a dar hoy un paso de disciplina guiado por la fe?',
    ],
    oracion:
      'Padre celestial, hoy reconozco con honestidad que muchas veces he cedido a la pereza, a la comodidad y a la trampa de dejar todo para después.\n\n' +
      'Perdóname por los momentos en que he malgastado el tiempo valioso que tú me has concedido. Sé que cada hora de mi vida es un regalo sagrado que tú pusiste en mis manos para administrar con sabiduría y fruto.\n\n' +
      'Hoy te pido que despiertes en mi corazón un espíritu diligente, esforzado y lleno de dominio propio. Quita de mí toda pesadez, apatía y desánimo que me impiden avanzar en lo que tú me has encomendado.\n\n' +
      'Dame la valentía de hacer lo correcto aun cuando mi cuerpo prefiera la comodidad. Enséñame a trabajar con amor y excelencia, sabiendo que todo lo que hago lo hago para ti y no para los hombres.\n\n' +
      'Fortalece mis manos para construir, afirma mis pasos en la disciplina y llena mi corazón de gozo al serte fiel en lo poco y en lo mucho.\n\n' +
      'En el nombre poderoso de Jesús, amén.',
  },

  // --- 3. EL DOMINIO DEL ESPÍRITU: FRENAR EL ENOJO ---
  {
    id: 'semilla-habito-2',
    tema: 'malos_habitos',
    titulo: 'El dominio del espíritu: Cómo frenar el enojo antes de que lastime',
    referencia_biblica: 'Proverbios 16:32',
    predicacion:
      'A todos nos ha pasado sentir cómo la sangre hierve en cuestión de segundos.\n\n' +
      'Basta una respuesta cortante en una conversación, una injusticia en el trabajo, un desacuerdo en el hogar o una mala actitud de alguien cercano para encender una chispa de molestia dentro de nosotros.\n\n' +
      'En ese instante crítico, nuestro primer impulso humano es atacar, levantar la voz, defendernos con aspereza y tener la última palabra a cualquier costo.\n\n' +
      'Sentimos una urgencia casi incontrolable de desahogarnos y hacerle saber al otro cuánto nos molestó lo que hizo.\n\n' +
      'El problema es que una palabra dicha con furia en cinco segundos tiene el poder destructor de quebrar una confianza que costó años construir.\n\n' +
      'El enojo descontrolado deja heridas hondas en el corazón de nuestros hijos, de nuestro cónyuge, de nuestros amigos y de las personas que más decimos amar.\n\n' +
      'El mundo muchas veces aplaude las reacciones explosivas y confunde la agresividad con fuerza de carácter. Pero la Palabra de Dios nos enseña un principio infinitamente más alto en Proverbios 16:32: “Mejor es el que tarda en airarse que el fuerte; y el que se enseñorea de su espíritu, que el que toma una ciudad.”\n\n' +
      'El verdadero poder espiritual no consiste en imponerse a los gritos ni en aplastar al otro en una discusión.\n\n' +
      'El verdadero poder consiste en tener dominio propio cuando tienes todos los motivos humanos para perder los estribos.\n\n' +
      'Cualquiera puede gritar, insultar o tirar una puerta; para eso no se necesita madurez ni espiritualidad. Lo que realmente exige una estatura de fe es guardar silencio, respirar y responder con mansedumbre cuando has sido provocado.\n\n' +
      'Jesús fue acusado injustamente, traicionado por sus más cercanos, insultado por las multitudes y flagelado sin piedad, y aun así eligió responder con serenidad santa y perdón.\n\n' +
      'El dominio propio no es debilidad ni cobardía; es el poder todopoderoso del Espíritu Santo gobernando las emociones humanas.\n\n' +
      'El enojo acumulado es como tomar veneno esperando que la otra persona sufra el daño. Te desgasta el cuerpo, te roba la paz mental, te aleja de la comunión íntima con Dios y le abre puertas gigantescas a la amargura y a la división.\n\n' +
      'Aprender a frenar el enojo requiere humildad.\n\n' +
      'Exige que soltemos la necesidad de tener siempre la razón y de ganar cada batalla verbal.\n\n' +
      'Hoy, cuando sientas que la impaciencia, el orgullo o la irritabilidad quieren apoderarse de tu boca, haz una pausa sagrada.\n\n' +
      'No respondas de inmediato al mensaje provocador. No lances ese comentario sarcástico. Respira profundo, cuenta hasta diez en silencio, dile una oración corta a Dios y permite que la mansedumbre de Cristo hable por ti.',
    reflexion:
      'A todos nos ha pasado sentir cómo la sangre hierve en cuestión de segundos.\n\n' +
      'Basta una respuesta cortante en una conversación, una injusticia en el trabajo, un desacuerdo en el hogar o una mala actitud de alguien cercano para encender una chispa de molestia dentro de nosotros.\n\n' +
      'En ese instante crítico, nuestro primer impulso humano es atacar, levantar la voz, defendernos con aspereza y tener la última palabra a cualquier costo.\n\n' +
      'Sentimos una urgencia casi incontrolable de desahogarnos y hacerle saber al otro cuánto nos molestó lo que hizo.\n\n' +
      'El problema es que una palabra dicha con furia en cinco segundos tiene el poder destructor de quebrar una confianza que costó años construir.\n\n' +
      'El enojo descontrolado deja heridas hondas en el corazón de nuestros hijos, de nuestro cónyuge, de nuestros amigos y de las personas que más decimos amar.\n\n' +
      'El mundo muchas veces aplaude las reacciones explosivas y confunde la agresividad con fuerza de carácter. Pero la Palabra de Dios nos enseña un principio infinitamente más alto en Proverbios 16:32: “Mejor es el que tarda en airarse que el fuerte; y el que se enseñorea de su espíritu, que el que toma una ciudad.”\n\n' +
      'El verdadero poder espiritual no consiste en imponerse a los gritos ni en aplastar al otro en una discusión.\n\n' +
      'El verdadero poder consiste en tener dominio propio cuando tienes todos los motivos humanos para perder los estribos.\n\n' +
      'Cualquiera puede gritar, insultar o tirar una puerta; para eso no se necesita madurez ni espiritualidad. Lo que realmente exige una estatura de fe es guardar silencio, respirar y responder con mansedumbre cuando has sido provocado.\n\n' +
      'Jesús fue acusado injustamente, traicionado por sus más cercanos, insultado por las multitudes y flagelado sin piedad, y aun así eligió responder con serenidad santa y perdón.\n\n' +
      'El dominio propio no es debilidad ni cobardía; es el poder todopoderoso del Espíritu Santo gobernando las emociones humanas.\n\n' +
      'El enojo acumulado es como tomar veneno esperando que la otra persona sufra el daño. Te desgasta el cuerpo, te roba la paz mental, te aleja de la comunión íntima con Dios y le abre puertas gigantescas a la amargura y a la división.\n\n' +
      'Aprender a frenar el enojo requiere humildad.\n\n' +
      'Exige que soltemos la necesidad de tener siempre la razón y de ganar cada batalla verbal.\n\n' +
      'Hoy, cuando sientas que la impaciencia, el orgullo o la irritabilidad quieren apoderarse de tu boca, haz una pausa sagrada.\n\n' +
      'No respondas de inmediato al mensaje provocador. No lances ese comentario sarcástico. Respira profundo, cuenta hasta diez en silencio, dile una oración corta a Dios y permite que la mansedumbre de Cristo hable por ti.',
    paso_practico:
      'Aplica la regla de los 60 segundos hoy: ante cualquier roce o tensión en tu casa o trabajo, no contestes al calor de la emoción. Guarda silencio un minuto, ora pidiendo mansedumbre al Espíritu Santo y responde con calma o retírate hasta que tu corazón esté en paz.',
    preguntas: [
      '¿Qué personas o situaciones son las que detonan con mayor facilidad tu mal genio e impaciencia?',
      '¿Sueles defender tu agresividad diciendo "así es mi personalidad", o estás dispuesto a rendir tus reacciones al señorío de Cristo?',
    ],
    oracion:
      'Señor Jesús, Príncipe de Paz, vengo ante ti con el corazón abierto reconociendo mi debilidad para frenar el mal genio, la impaciencia y las palabras hirientes.\n\n' +
      'Perdóname por las veces en que una reacción impulsiva mía ha dejado dolor en las personas que amo. Perdóname por buscar tener siempre la razón y por dejarme ganar por el orgullo herido.\n\n' +
      'Hoy rindo en tu altar mis emociones desbordadas. Sana las áreas sensibles de mi corazón que reaccionan a la defensiva. Pon un centinela delante de mi boca y guarda la puerta de mis labios.\n\n' +
      'Lléname del fruto de tu Espíritu Santo: de paciencia, de templanza, de bondad y de una mansedumbre que desarme todo conflicto con amor.\n\n' +
      'Que hoy, antes de alzar la voz, recuerde tu gracia conmigo. Que de mis labios solo salgan palabras que construyan, que animen y que traigan sanidad a quienes me rodean.\n\n' +
      'En tu santo y bendito nombre, amén.',
  },

  // --- 4. REDIMIENDO EL TIEMPO: VENCER LA DISTRACCIÓN DIGITAL ---
  {
    id: 'semilla-habito-3',
    tema: 'malos_habitos',
    titulo: 'Redimiendo el tiempo: Vencer la distracción digital y recuperar el enfoque',
    referencia_biblica: 'Efesios 5:15-16',
    predicacion:
      'Abrimos el teléfono solo para mirar la hora, y media hora después seguimos deslizando la pantalla sin rumbo.\n\n' +
      'Miramos videos cortos uno tras otro, comparamos nuestra vida cotidiana con las fotos retocadas y los viajes de otras personas, y nos llenamos de noticias sensacionalistas que solo terminan dejándonos agotados, ansiosos y desenfocados.\n\n' +
      'La tecnología no es mala en sí misma, pero se ha convertido silenciosamente en uno de los mayores ladrones de nuestra vida espiritual y familiar.\n\n' +
      'El apóstol Pablo nos hace un llamado urgente que resuena con fuerza en nuestra era de hiperconexión en Efesios 5:15-16: “Mirad, pues, con diligencia cómo andéis, no como necios sino como sabios, aprovechando bien el tiempo, porque los días son malos.”\n\n' +
      'La palabra “aprovechando” en el griego original significa literalmente “rescatar o redimir algo del mercado”.\n\n' +
      'Significa rescatar tus horas de la superficialidad y de lo efímero para invertirlas en lo que verdaderamente tiene peso eterno: tu comunión íntima con Dios, el tiempo de calidad con tu familia y el propósito de tu vida.\n\n' +
      'Cuando nuestra mente está bombardeada por cientos de notificaciones, mensajes y estímulos cada hora, se vuelve casi imposible escuchar el susurro apacible del Espíritu Santo.\n\n' +
      'Dios no suele competir con el ruido ensordecedor de este mundo.\n\n' +
      'Dios habla con frecuencia en la quietud, en el silencio y en la intimidad del aposento alto. Pero ¿cómo podremos escuchar su voz si nunca nos atrevemos a apagar el ruido exterior?\n\n' +
      'Muchos creyentes dicen con sinceridad: “No tengo tiempo para leer la Biblia ni para orar más de diez minutos”.\n\n' +
      'Sin embargo, cuando revisamos el informe semanal de tiempo en pantalla de nuestro celular, descubrimos que pasamos dos, tres o cuatro horas diarias consumiendo contenido vacío.\n\n' +
      'El problema casi nunca es falta de tiempo; el problema es dónde estamos invirtiendo nuestra atención.\n\n' +
      'Aquello a lo que le entregas tu atención es lo que termina gobernando tus afectos, tus pensamientos y tus decisiones.\n\n' +
      'Recuperar el control no significa aislarse del mundo ni botar el teléfono a la basura.\n\n' +
      'Significa ponerle límites saludables a la tecnología para que sea una herramienta que te sirva a ti, y no un amo que esclavice tu mente y te robe la paz.\n\n' +
      'Hoy Dios te invita a desintoxicar tu mente y a recuperar la frescura de su presencia.\n\n' +
      'Atrévete a desconectarte de lo pasajero para conectarte profundamente con lo eterno.',
    reflexion:
      'Abrimos el teléfono solo para mirar la hora, y media hora después seguimos deslizando la pantalla sin rumbo.\n\n' +
      'Miramos videos cortos uno tras otro, comparamos nuestra vida cotidiana con las fotos retocadas y los viajes de otras personas, y nos llenamos de noticias sensacionalistas que solo terminan dejándonos agotados, ansiosos y desenfocados.\n\n' +
      'La tecnología no es mala en sí misma, pero se ha convertido silenciosamente en uno de los mayores ladrones de nuestra vida espiritual y familiar.\n\n' +
      'El apóstol Pablo nos hace un llamado urgente que resuena con fuerza en nuestra era de hiperconexión en Efesios 5:15-16: “Mirad, pues, con diligencia cómo andéis, no como necios sino como sabios, aprovechando bien el tiempo, porque los días son malos.”\n\n' +
      'La palabra “aprovechando” en el griego original significa literalmente “rescatar o redimir algo del mercado”.\n\n' +
      'Significa rescatar tus horas de la superficialidad y de lo efímero para invertirlas en lo que verdaderamente tiene peso eterno: tu comunión íntima con Dios, el tiempo de calidad con tu familia y el propósito de tu vida.\n\n' +
      'Cuando nuestra mente está bombardeada por cientos de notificaciones, mensajes y estímulos cada hora, se vuelve casi imposible escuchar el susurro apacible del Espíritu Santo.\n\n' +
      'Dios no suele competir con el ruido ensordecedor de este mundo.\n\n' +
      'Dios habla con frecuencia en la quietud, en el silencio y en la intimidad del aposento alto. Pero ¿cómo podremos escuchar su voz si nunca nos atrevemos a apagar el ruido exterior?\n\n' +
      'Muchos creyentes dicen con sinceridad: “No tengo tiempo para leer la Biblia ni para orar más de diez minutos”.\n\n' +
      'Sin embargo, cuando revisamos el informe semanal de tiempo en pantalla de nuestro celular, descubrimos que pasamos dos, tres o cuatro horas diarias consumiendo contenido vacío.\n\n' +
      'El problema casi nunca es falta de tiempo; el problema es dónde estamos invirtiendo nuestra atención.\n\n' +
      'Aquello a lo que le entregas tu atención es lo que termina gobernando tus afectos, tus pensamientos y tus decisiones.\n\n' +
      'Recuperar el control no significa aislarse del mundo ni botar el teléfono a la basura.\n\n' +
      'Significa ponerle límites saludables a la tecnología para que sea una herramienta que te sirva a ti, y no un amo que esclavice tu mente y te robe la paz.\n\n' +
      'Hoy Dios te invita a desintoxicar tu mente y a recuperar la frescura de su presencia.\n\n' +
      'Atrévete a desconectarte de lo pasajero para conectarte profundamente con lo eterno.',
    paso_practico:
      'Haz un ayuno de pantallas hoy durante 2 horas continuas antes de dormir o durante la mañana. Deja el teléfono en otra habitación y usa ese espacio para leer tu Biblia en silencio, dialogar con tu familia o tener un tiempo de oración íntima.',
    preguntas: [
      '¿Es tu teléfono lo primero que miras al despertar en la mañana y lo último que ves al acostarte en lugar de buscar a Dios?',
      '¿Cuánto tiempo de calidad le has quitado a tu comunión con el Señor y a tus seres queridos por deslizar la pantalla sin propósito?',
    ],
    oracion:
      'Padre celestial, te pido perdón por las horas preciosas que he malgastado consumiendo contenidos vacíos mientras mi espíritu languidecía por falta de tu presencia.\n\n' +
      'Limpia mi mente de toda saturación y sobrecarga digital. Quita de mí la adicción a las pantallas, la necesidad de aprobación humana en redes sociales y la comparación destructiva con la vida de los demás.\n\n' +
      'Enséñame a valorar cada día como un recurso sagrado que debo redimir para tu gloria. Despierta en mí un hambre apasionada por tu Palabra y por los momentos a solas contigo.\n\n' +
      'Ayúdame a apagar el ruido del mundo para escuchar con claridad tu voz. Dame dominio propio sobre mis hábitos tecnológicos y enséñame a estar plenamente presente para bendecir a mi familia y servir a mi prójimo.\n\n' +
      'En el nombre precioso de Jesús, amén.',
  },

  // --- 5. CAMINAR POR FE CUANDO NO VES EL CAMINO ---
  {
    id: 'semilla-fe-1',
    tema: 'fortalecer_fe',
    titulo: 'Caminar por fe cuando no ves el camino',
    referencia_biblica: 'Hebreos 11:1',
    predicacion:
      'A todos nos cuesta caminar cuando hay niebla espesa en el camino.\n\n' +
      'Queremos tener el mapa completo de los próximos tres años antes de animarnos a dar el primer paso. Queremos garantías absolutas de que no habrá pérdidas, de que las puertas se abrirán sin dolor y de que cada decisión resultará en un éxito asegurado.\n\n' +
      'Y cuando el futuro se vuelve incierto y las cosas no salen como lo teníamos planeado, la duda empieza a susurrarnos al oído que Dios se olvidó de nosotros.\n\n' +
      'Pero la Biblia nos enseña que la fe no se mueve por certezas visibles de este mundo, sino por promesas eternas del Dios que no miente.\n\n' +
      'Hebreos 11:1 lo define con una belleza inigualable: “Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.”\n\n' +
      'Piensa en Abraham: salió de su tierra, de su parentela y de su zona de confort sin saber a dónde iba, pero confiando plenamente en Aquel que lo había llamado.\n\n' +
      'Dios rara vez nos muestra toda la carretera iluminada de principio a fin.\n\n' +
      'Nos da su Palabra como una lámpara a nuestros pies: no alumbra diez kilómetros adelante, alumbra exactamente el paso que debemos dar en este día.\n\n' +
      'Quizás estás esperando una respuesta laboral que no llega. Quizás estás atravesando una temporada de salud difícil, enfrentando un conflicto familiar o sacando adelante un emprendimiento que parece estancado.\n\n' +
      'Sientes que estás en un desierto donde nada se mueve y donde el cielo parece de bronce.\n\n' +
      'No te desanimes ni bajes los brazos.\n\n' +
      'El silencio de Dios no significa ausencia de Dios. Detrás del escenario, donde tus ojos naturales no pueden ver, Dios está tejiendo circunstancias, moviendo corazones y fortaleciendo las raíces de tu carácter para la bendición que viene.\n\n' +
      'La fe no es fingir que no hay problemas o que las dificultades no duelen.\n\n' +
      'La fe verdadera es mirar el tamaño del problema de frente y declarar: “Mi Dios es infinitamente más grande que esta montaña, y su fidelidad nunca ha fallado.”\n\n' +
      'No necesitas tener todas las respuestas resueltas hoy para caminar con serenidad.\n\n' +
      'Solo necesitas tomar la mano de tu Padre celestial y dar el paso de hoy con confianza absoluta en su fidelidad inmutable.',
    reflexion:
      'A todos nos cuesta caminar cuando hay niebla espesa en el camino.\n\n' +
      'Queremos tener el mapa completo de los próximos tres años antes de animarnos a dar el primer paso. Queremos garantías absolutas de que no habrá pérdidas, de que las puertas se abrirán sin dolor y de que cada decisión resultará en un éxito asegurado.\n\n' +
      'Y cuando el futuro se vuelve incierto y las cosas no salen como lo teníamos planeado, la duda empieza a susurrarnos al oído que Dios se olvidó de nosotros.\n\n' +
      'Pero la Biblia nos enseña que la fe no se mueve por certezas visibles de este mundo, sino por promesas eternas del Dios que no miente.\n\n' +
      'Hebreos 11:1 lo define con una belleza inigualable: “Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.”\n\n' +
      'Piensa en Abraham: salió de su tierra, de su parentela y de su zona de confort sin saber a dónde iba, pero confiando plenamente en Aquel que lo había llamado.\n\n' +
      'Dios rara vez nos muestra toda la carretera iluminada de principio a fin.\n\n' +
      'Nos da su Palabra como una lámpara a nuestros pies: no alumbra diez kilómetros adelante, alumbra exactamente el paso que debemos dar en este día.\n\n' +
      'Quizás estás esperando una respuesta laboral que no llega. Quizás estás atravesando una temporada de salud difícil, enfrentando un conflicto familiar o sacando adelante un emprendimiento que parece estancado.\n\n' +
      'Sientes que estás en un desierto donde nada se mueve y donde el cielo parece de bronce.\n\n' +
      'No te desanimes ni bajes los brazos.\n\n' +
      'El silencio de Dios no significa ausencia de Dios. Detrás del escenario, donde tus ojos naturales no pueden ver, Dios está tejiendo circunstancias, moviendo corazones y fortaleciendo las raíces de tu carácter para la bendición que viene.\n\n' +
      'La fe no es fingir que no hay problemas o que las dificultades no duelen.\n\n' +
      'La fe verdadera es mirar el tamaño del problema de frente y declarar: “Mi Dios es infinitamente más grande que esta montaña, y su fidelidad nunca ha fallado.”\n\n' +
      'No necesitas tener todas las respuestas resueltas hoy para caminar con serenidad.\n\n' +
      'Solo necesitas tomar la mano de tu Padre celestial y dar el paso de hoy con confianza absoluta en su fidelidad inmutable.',
    paso_practico:
      'Anota en un papel el dilema que mayor incertidumbre te genera hoy. Escribe debajo: “Señor, no entiendo cómo lo harás, pero decido confiar en tu fidelidad”. Guarda ese papel dentro de tu Biblia como recordatorio de que tu confianza está puesta en Dios.',
    preguntas: [
      '¿Estás midiendo el poder de Dios por las circunstancias visibles o recordando las veces en que Él te sostuvo en el pasado?',
      '¿Qué paso de fe o de obediencia has estado postergando por temor a lo desconocido?',
    ],
    oracion:
      'Padre amado y soberano, hoy me acerco a ti con total vulnerabilidad trayendo mis dudas, mis temores y mis preguntas sin respuesta.\n\n' +
      'Reconozco que a veces me desespero cuando la niebla no me deja ver el final del camino y cuando las cosas tardan más de lo que esperaba.\n\n' +
      'Aumenta mi fe en este día. Enséñame a no caminar por vista humana, sino por la convicción firme e inquebrantable de que tú eres fiel y de que tus promesas son sí y amén.\n\n' +
      'Pongo en tus manos mi futuro, mi familia, mi salud y mi sustento. Renuncio a la ansiedad de querer controlar los tiempos y decido descansar en la sabiduría de tu gobierno divino.\n\n' +
      'Toma mi mano y guíame un paso a la vez. En el poderoso nombre de Jesús, amén.',
  },

  // --- 6. DIOS PELEA POR TI: LA VICTORIA EN EL SILENCIO ---
  {
    id: 'semilla-fe-2',
    tema: 'fortalecer_fe',
    titulo: 'Dios pelea por ti: Cuando quedarse quieto es la mayor victoria',
    referencia_biblica: 'Éxodo 14:14',
    predicacion:
      'Hay momentos en la vida donde sentimos que estamos atrapados en un callejón sin salida.\n\n' +
      'Al frente tenemos un mar embravecido que nos cierra el paso por completo; a los lados, montañas inaccesibles; y detrás, los problemas, las deudas o los conflictos que parecen alcanzarnos a toda velocidad.\n\n' +
      'En situaciones límite como esa, nuestro instinto humano más primitivo es correr desesperados, discutir agriamente o tomar decisiones apresuradas dictadas por el pánico.\n\n' +
      'Eso mismo experimentó el pueblo de Israel en la orilla del Mar Rojo con el ejército más poderoso del mundo pisándoles los talones.\n\n' +
      'Estaban aterrados y comenzaron a quejarse contra Moisés, convencidos de que aquel era el fin de sus vidas.\n\n' +
      'Pero en medio de la histeria colectiva, la voz de Dios a través de Moisés les dio una orden que desafió toda lógica militar humana en Éxodo 14:14: “Jehová peleará por vosotros, y vosotros estaréis tranquilos.”\n\n' +
      'Qué difícil resulta quedarse quieto y tranquilo cuando sentimos que el mundo entero se nos viene encima.\n\n' +
      'Nuestra naturaleza humana quiere pelear con sus propias fuerzas, mandar mensajes agresivos, manipular las circunstancias y forzar soluciones humanas inmediatas.\n\n' +
      'Sin embargo, hay batallas espirituales decisivas que jamás se ganan con forcejeos humanos ni con gritos.\n\n' +
      'Se ganan de rodillas en el secreto de la oración, rindiendo las armas ante el Dios Altísimo y dejando que el brazo fuerte del Señor intervenga a nuestro favor.\n\n' +
      'Cuando decides aquietar tu espíritu y no responder al ataque con otro ataque, le abres la puerta al milagro de Dios.\n\n' +
      'El Mar Rojo no se abrió mientras el pueblo seguía gritando de miedo; se abrió cuando Dios sopló su viento recio y el pueblo dio el paso de fe confiando en la orden divina.\n\n' +
      'Dios convirtió lo que parecía un callejón de muerte en una calzada seca de victoria y salvación eterna.\n\n' +
      'Hoy no tienes que cargar sobre tus hombros el peso de solucionar lo imposible tú solo.\n\n' +
      'Tu parte es mantenerte fiel, caminar en rectitud y descansar en paz. La parte de abrir el mar, derribar gigantes y pelear la batalla le corresponde exclusivamente a Dios.\n\n' +
      'Descansa hoy en la certeza de que el Señor de los ejércitos va delante de ti como poderoso gigante.',
    reflexion:
      'Hay momentos en la vida donde sentimos que estamos atrapados en un callejón sin salida.\n\n' +
      'Al frente tenemos un mar embravecido que nos cierra el paso por completo; a los lados, montañas inaccesibles; y detrás, los problemas, las deudas o los conflictos que parecen alcanzarnos a toda velocidad.\n\n' +
      'En situaciones límite como esa, nuestro instinto humano más primitivo es correr desesperados, discutir agriamente o tomar decisiones apresuradas dictadas por el pánico.\n\n' +
      'Eso mismo experimentó el pueblo de Israel en la orilla del Mar Rojo con el ejército más poderoso del mundo pisándoles los talones.\n\n' +
      'Estaban aterrados y comenzaron a quejarse contra Moisés, convencidos de que aquel era el fin de sus vidas.\n\n' +
      'Pero en medio de la histeria colectiva, la voz de Dios a través de Moisés les dio una orden que desafió toda lógica militar humana en Éxodo 14:14: “Jehová peleará por vosotros, y vosotros estaréis tranquilos.”\n\n' +
      'Qué difícil resulta quedarse quieto y tranquilo cuando sentimos que el mundo entero se nos viene encima.\n\n' +
      'Nuestra naturaleza humana quiere pelear con sus propias fuerzas, mandar mensajes agresivos, manipular las circunstancias y forzar soluciones humanas inmediatas.\n\n' +
      'Sin embargo, hay batallas espirituales decisivas que jamás se ganan con forcejeos humanos ni con gritos.\n\n' +
      'Se ganan de rodillas en el secreto de la oración, rindiendo las armas ante el Dios Altísimo y dejando que el brazo fuerte del Señor intervenga a nuestro favor.\n\n' +
      'Cuando decides aquietar tu espíritu y no responder al ataque con otro ataque, le abres la puerta al milagro de Dios.\n\n' +
      'El Mar Rojo no se abrió mientras el pueblo seguía gritando de miedo; se abrió cuando Dios sopló su viento recio y el pueblo dio el paso de fe confiando en la orden divina.\n\n' +
      'Dios convirtió lo que parecía un callejón de muerte en una calzada seca de victoria y salvación eterna.\n\n' +
      'Hoy no tienes que cargar sobre tus hombros el peso de solucionar lo imposible tú solo.\n\n' +
      'Tu parte es mantenerte fiel, caminar en rectitud y descansar en paz. La parte de abrir el mar, derribar gigantes y pelear la batalla le corresponde exclusivamente a Dios.\n\n' +
      'Descansa hoy en la certeza de que el Señor de los ejércitos va delante de ti como poderoso gigante.',
    paso_practico:
      'Aparta 5 minutos en soledad hoy. Respira con serenidad y repite en voz alta: “Dios está peleando esta batalla por mí; mi alma descansa en quietud bajo su cuidado”. Suelta la necesidad de vengarte o de controlar el resultado.',
    preguntas: [
      '¿Estás desgastándote intentando solucionar en tus propias fuerzas humanas algo que solo la mano milagrosa de Dios puede cambiar?',
      '¿Confías en que el silencio aparente de Dios en este tiempo es porque Él ya está trabajando a tu favor?',
    ],
    oracion:
      'Señor todopoderoso, vengo ante ti cansado de batallar en mis limitadas fuerzas humanas. Hoy reconozco que mis recursos son pequeños y que no puedo ganar estas batallas por mí mismo.\n\n' +
      'Entrego en tus manos ese conflicto, esa presión económica o ese temor que me ha quitado el sueño. Renuncio a la desesperación, a la queja y al deseo de tomar la justicia por mis propias manos.\n\n' +
      'Declaro que ningún arma forjada contra mi vida prosperará, porque tú eres mi escudo, mi roca y mi refugio inexpugnable. Me aquieto en tu santa presencia y espero en ti con profunda paz.\n\n' +
      'Abre camino donde no lo hay y haz resplandecer tu gloria en mi vida. En el poderoso nombre de Jesús, amén.',
  },

  // --- 7. LA PAZ QUE CUIDA TU CORAZÓN ---
  {
    id: 'semilla-paz-1',
    tema: 'paz_ansiedad',
    titulo: 'La paz que cuida tu corazón: Calma para la mente abrumada',
    referencia_biblica: 'Filipenses 4:6-7',
    predicacion:
      'La ansiedad tiene una manera muy silenciosa pero destructiva de robarnos la vida.\n\n' +
      'Nos despierta a las tres de la mañana con pensamientos acelerados, nos hace imaginar los peores escenarios posibles sobre lo que podría pasar mañana, y nos llena el pecho de una opresión constante que no se calma con solo descansar unas horas.\n\n' +
      'Vivimos en un mundo que normaliza el afán y la sobrecarga mental. Nos bombardean con noticias alarmistas, exigencias inmediatas y la presión constante de tener que resolverlo todo antes de que caiga la noche.\n\n' +
      'Pero el apóstol Pablo, escribiendo estas palabras no desde un palacio cómodo sino desde una prisión romana con cadenas en sus manos, nos deja el antídoto divino en Filipenses 4:6-7: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”\n\n' +
      'Observa con atención la enseñanza: Pablo no dice que la paz llega cuando desaparecen todos los problemas exteriores.\n\n' +
      'Dice que la paz de Dios es un don sobrenatural que cuida tu mente en medio de las tormentas más difíciles.\n\n' +
      'En el idioma original, la palabra “guardará” hace referencia a un destacamento de soldados centinelas apostados a la entrada de una fortaleza para impedir que el enemigo entre.\n\n' +
      'Eso es exactamente lo que hace la paz de Dios: se planta a la puerta de tus pensamientos para evitar que el pánico, el desánimo y la angustia tomen el control de tu vida.\n\n' +
      'El puente entre la ansiedad y esa paz inquebrantable es la oración con acción de gracias.\n\n' +
      'Cuando decides dar gracias por lo que Dios ya ha hecho en tu pasado, tu mente recuerda con claridad que el mismo Dios que no te abandonó en tus momentos más oscuros de ayer tiene el poder para sostenerte hoy y cuidar de tu futuro.\n\n' +
      'No guardes las cargas apretadas en el pecho como si fueras el único responsable del universo.\n\n' +
      'Suelta la necesidad de saberlo todo y de resolverlo todo en este instante.\n\n' +
      'Hoy Dios te invita a respirar con tranquilidad bajo la sombra de sus alas.\n\n' +
      'Entrega cada preocupación en el altar de la oración y descansa en la promesa de que Él cuida fielmente de ti.',
    reflexion:
      'La ansiedad tiene una manera muy silenciosa pero destructiva de robarnos la vida.\n\n' +
      'Nos despierta a las tres de la mañana con pensamientos acelerados, nos hace imaginar los peores escenarios posibles sobre lo que podría pasar mañana, y nos llena el pecho de una opresión constante que no se calma con solo descansar unas horas.\n\n' +
      'Vivimos en un mundo que normaliza el afán y la sobrecarga mental. Nos bombardean con noticias alarmistas, exigencias inmediatas y la presión constante de tener que resolverlo todo antes de que caiga la noche.\n\n' +
      'Pero el apóstol Pablo, escribiendo estas palabras no desde un palacio cómodo sino desde una prisión romana con cadenas en sus manos, nos deja el antídoto divino en Filipenses 4:6-7: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”\n\n' +
      'Observa con atención la enseñanza: Pablo no dice que la paz llega cuando desaparecen todos los problemas exteriores.\n\n' +
      'Dice que la paz de Dios es un don sobrenatural que cuida tu mente en medio de las tormentas más difíciles.\n\n' +
      'En el idioma original, la palabra “guardará” hace referencia a un destacamento de soldados centinelas apostados a la entrada de una fortaleza para impedir que el enemigo entre.\n\n' +
      'Eso es exactamente lo que hace la paz de Dios: se planta a la puerta de tus pensamientos para evitar que el pánico, el desánimo y la angustia tomen el control de tu vida.\n\n' +
      'El puente entre la ansiedad y esa paz inquebrantable es la oración con acción de gracias.\n\n' +
      'Cuando decides dar gracias por lo que Dios ya ha hecho en tu pasado, tu mente recuerda con claridad que el mismo Dios que no te abandonó en tus momentos más oscuros de ayer tiene el poder para sostenerte hoy y cuidar de tu futuro.\n\n' +
      'No guardes las cargas apretadas en el pecho como si fueras el único responsable del universo.\n\n' +
      'Suelta la necesidad de saberlo todo y de resolverlo todo en este instante.\n\n' +
      'Hoy Dios te invita a respirar con tranquilidad bajo la sombra de sus alas.\n\n' +
      'Entrega cada preocupación en el altar de la oración y descansa en la promesa de que Él cuida fielmente de ti.',
    paso_practico:
      'Haz una lista con tus 3 mayores preocupaciones del día. Al lado de cada una, escribe un motivo concreto por el que estás agradecido a Dios. Luego, entrégaselas en oración con las manos abiertas hacia arriba.',
    preguntas: [
      '¿Pasas más tiempo imaginando escenarios difíciles del futuro que orando con gratitud por las bendiciones de hoy?',
      '¿Qué pensamiento de miedo necesitas reemplazar hoy con una promesa eterna de la Biblia?',
    ],
    oracion:
      'Padre compasivo y Dios de toda paz, vengo ante ti con mi mente cansada y mis emociones abrumadas.\n\n' +
      'Tú conoces cada pensamiento que me inquieta en la noche y cada peso que llevo sobre mis hombros. Perdóname por llenarme de afán y por intentar controlar lo que solo tú puedes gobernar.\n\n' +
      'Hoy decido entregarte cada una de mis preocupaciones con acción de gracias. Recibo tu paz sobrenatural, esa paz que sobrepasa todo entendimiento humano.\n\n' +
      'Sé un centinela santo en la puerta de mi mente para que el miedo no entre a gobernarme. En paz me acostaré y asimismo dormiré, porque solo tú, Jehová, me haces vivir confiado.\n\n' +
      'En el precioso nombre de Jesús, amén.',
  },

  // --- 8. EMPEZAR EL DÍA CON GRATITUD ---
  {
    id: 'semilla-diario-1',
    tema: 'diario',
    titulo: 'Empezar el día con gratitud: Cuando el corazón despierta en paz',
    referencia_biblica: 'Salmos 118:24',
    predicacion:
      'Muchas mañanas comenzamos el día con el pie en el acelerador.\n\n' +
      'Apenas abrimos los ojos, la lista interminable de pendientes, las cuentas por pagar, las noticias desalentadoras y los mensajes del teléfono nos bombardean antes de haber respirado hondo.\n\n' +
      'Empezar el día en modo de urgencia solo hace que vivamos agotados, reactivos y con el corazón acelerado.\n\n' +
      'Pero el salmista nos enseña una postura del alma completamente diferente en Salmos 118:24: “Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.”\n\n' +
      'Despertar hoy con aire en tus pulmones no es una coincidencia ni una rutina casual; es una muestra fresca y personal de la misericordia de Dios para contigo.\n\n' +
      'La Biblia dice en Lamentaciones que sus misericordias son nuevas cada mañana; grande es su fidelidad.\n\n' +
      'Cuando decides empezar tu jornada dando gracias antes de quejarte, tu perspectiva espiritual cambia de raíz.\n\n' +
      'La gratitud no niega los problemas ni pretende que las dificultades no existan.\n\n' +
      'Lo que hace la gratitud es enfocar tus ojos en la grandeza del Dios que está contigo para ayudarte a vencer esos problemas.\n\n' +
      'Una taza de café caliente, el techo que te cubre, la salud que tienes hoy, el saludo de un ser querido... pequeñas bendiciones cotidianas que a menudo damos por sentadas se convierten en altares de adoración cuando tenemos un corazón agradecido.\n\n' +
      'La queja drena tus fuerzas y atrae amargura; la gratitud multiplica tu energía y atrae la paz de Dios.\n\n' +
      'Hoy tienes delante de ti veinticuatro horas que Dios diseñó con propósitos hermosos para tu vida.\n\n' +
      'No permitas que las prisas ni los afanes te roben el milagro de este nuevo amanecer.\n\n' +
      'Camina con la frente en alto, sabiendo que el Creador del cielo y de la tierra va delante de ti cuidando tus pasos.',
    reflexion:
      'Muchas mañanas comenzamos el día con el pie en el acelerador.\n\n' +
      'Apenas abrimos los ojos, la lista interminable de pendientes, las cuentas por pagar, las noticias desalentadoras y los mensajes del teléfono nos bombardean antes de haber respirado hondo.\n\n' +
      'Empezar el día en modo de urgencia solo hace que vivamos agotados, reactivos y con el corazón acelerado.\n\n' +
      'Pero el salmista nos enseña una postura del alma completamente diferente en Salmos 118:24: “Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.”\n\n' +
      'Despertar hoy con aire en tus pulmones no es una coincidencia ni una rutina casual; es una muestra fresca y personal de la misericordia de Dios para contigo.\n\n' +
      'La Biblia dice en Lamentaciones que sus misericordias son nuevas cada mañana; grande es su fidelidad.\n\n' +
      'Cuando decides empezar tu jornada dando gracias antes de quejarte, tu perspectiva espiritual cambia de raíz.\n\n' +
      'La gratitud no niega los problemas ni pretende que las dificultades no existan.\n\n' +
      'Lo que hace la gratitud es enfocar tus ojos en la grandeza del Dios que está contigo para ayudarte a vencer esos problemas.\n\n' +
      'Una taza de café caliente, el techo que te cubre, la salud que tienes hoy, el saludo de un ser querido... pequeñas bendiciones cotidianas que a menudo damos por sentadas se convierten en altares de adoración cuando tenemos un corazón agradecido.\n\n' +
      'La queja drena tus fuerzas y atrae amargura; la gratitud multiplica tu energía y atrae la paz de Dios.\n\n' +
      'Hoy tienes delante de ti veinticuatro horas que Dios diseñó con propósitos hermosos para tu vida.\n\n' +
      'No permitas que las prisas ni los afanes te roben el milagro de este nuevo amanecer.\n\n' +
      'Camina con la frente en alto, sabiendo que el Creador del cielo y de la tierra va delante de ti cuidando tus pasos.',
    paso_practico:
      'Antes de empezar tus tareas cotidianas, respira hondo y menciona en voz alta 5 cosas específicas por las que estás agradecido a Dios hoy: desde lo más sencillo hasta lo más trascendental.',
    preguntas: [
      '¿Con qué actitud sueles comenzar tus mañanas: con queja y afán o con adoración y gratitud?',
      '¿Qué bendición cotidiana estás dando por sentada y merece hoy una oración sincera de gracias?',
    ],
    oracion:
      'Señor Dios todopoderoso, gracias por el regalo inmerecido de este nuevo amanecer.\n\n' +
      'Gracias porque tus ojos vieron mi despertar y porque tu aliento de vida sostiene mis pulmones una vez más. Grande es tu fidelidad sobre mi vida y sobre mi hogar.\n\n' +
      'Hoy consagro a ti cada hora de esta jornada: mis palabras, mis pensamientos, mi trabajo y mis relaciones. Quita de mis labios toda queja o pesimismo, y llena mi corazón de un gozo santo que contagie esperanza a quienes me rodean.\n\n' +
      'Sé mi guía en cada decisión y mi fortaleza en cada cansancio. Voy adelante con alegría porque sé que tú caminas a mi lado.\n\n' +
      'En el precioso nombre de Jesús, amén.',
  },

  // --- 9. SABIDURÍA PARA TUS DECISIONES ---
  {
    id: 'semilla-diario-2',
    tema: 'diario',
    titulo: 'Sabiduría para tus decisiones: La dirección que calma el camino',
    referencia_biblica: 'Santiago 1:5',
    predicacion:
      'Todos los días nos encontramos frente a encrucijadas decisivas.\n\n' +
      'Desde decisiones pequeñas en nuestra rutina hasta elecciones trascendentales sobre un empleo, una carrera, un negocio, la familia, una mudanza o una relación importante.\n\n' +
      'Muchas veces nos paraliza el miedo a equivocarnos, o consultamos la opinión de tantas personas que terminamos más confundidos y abrumados que al inicio.\n\n' +
      'El apóstol Santiago nos hace una invitación hermosa, generosa y llena de consuelo en Santiago 1:5: “Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.”\n\n' +
      'Fíjate en las palabras: Dios da “abundantemente y sin reproche”.\n\n' +
      'Dios no se enoja contigo cuando reconoces que no sabes qué hacer. No te juzga por sentirte desorientado ni te reprocha por ser humano.\n\n' +
      'Al contrario, se complace profundamente en guiar a los humildes de corazón que admiten su necesidad de dirección divina.\n\n' +
      'La sabiduría de Dios no consiste en adivinar el futuro como quien consulta un horóscopo.\n\n' +
      'Consiste en tener claridad moral, prudencia y paz interior para actuar con rectitud y en el momento preciso.\n\n' +
      'Cuando buscas la guía de Dios en oración, Él aquieta tus emociones aceleradas, quita el ruido del mundo y te da esa convicción serena que confirma el camino correcto.\n\n' +
      'A veces la sabiduría de Dios te pedirá que esperes un poco más. Otras veces te pedirá que digas no a una oferta atractiva pero engañosa. Y otras veces te dirá que des el paso de fe con valentía.\n\n' +
      'Si hoy estás ante una encrucijada difícil, no te apresures por la presión social de los demás.\n\n' +
      'Haz una pausa sagrada, abre tu Biblia, preséntale tu dilema al Señor y confía en que Él enderezará tus pasos.',
    reflexion:
      'Todos los días nos encontramos frente a encrucijadas decisivas.\n\n' +
      'Desde decisiones pequeñas en nuestra rutina hasta elecciones trascendentales sobre un empleo, una carrera, un negocio, la familia, una mudanza o una relación importante.\n\n' +
      'Muchas veces nos paraliza el miedo a equivocarnos, o consultamos la opinión de tantas personas que terminamos más confundidos y abrumados que al inicio.\n\n' +
      'El apóstol Santiago nos hace una invitación hermosa, generosa y llena de consuelo en Santiago 1:5: “Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.”\n\n' +
      'Fíjate en las palabras: Dios da “abundantemente y sin reproche”.\n\n' +
      'Dios no se enoja contigo cuando reconoces que no sabes qué hacer. No te juzga por sentirte desorientado ni te reprocha por ser humano.\n\n' +
      'Al contrario, se complace profundamente en guiar a los humildes de corazón que admiten su necesidad de dirección divina.\n\n' +
      'La sabiduría de Dios no consiste en adivinar el futuro como quien consulta un horóscopo.\n\n' +
      'Consiste en tener claridad moral, prudencia y paz interior para actuar con rectitud y en el momento preciso.\n\n' +
      'Cuando buscas la guía de Dios en oración, Él aquieta tus emociones aceleradas, quita el ruido del mundo y te da esa convicción serena que confirma el camino correcto.\n\n' +
      'A veces la sabiduría de Dios te pedirá que esperes un poco más. Otras veces te pedirá que digas no a una oferta atractiva pero engañosa. Y otras veces te dirá que des el paso de fe con valentía.\n\n' +
      'Si hoy estás ante una encrucijada difícil, no te apresures por la presión social de los demás.\n\n' +
      'Haz una pausa sagrada, abre tu Biblia, preséntale tu dilema al Señor y confía en que Él enderezará tus pasos.',
    paso_practico:
      'Presenta en oración esa decisión puntual que debes tomar. Pídele al Señor que cierre con llave las puertas que no te convienen y que confirme con paz inquebrantable el camino que tiene su bendición.',
    preguntas: [
      '¿Sueles tomar decisiones guiado por el impulso del momento o consultando la dirección de Dios con paciencia?',
      '¿Estás dispuesto a obedecer lo que Dios te muestre aun cuando vaya en contra de tus preferencias personales?',
    ],
    oracion:
      'Padre celestial, hoy reconozco con humildad que mis pensamientos son limitados y que necesito desesperadamente tu sabiduría en cada paso que doy.\n\n' +
      'Pongo ante tu altar las decisiones y dilemas que tengo por delante. Alumbra mi entendimiento con la luz de tu verdad eterna y quita de mí toda confusión o temor al fracaso.\n\n' +
      'Dame el discernimiento para elegir lo que honra tu nombre y edifica a mi familia. Si voy por un camino equivocado, detenme a tiempo con tu misericordia; y si voy por el camino correcto, dame las fuerzas para perseverar con fidelidad.\n\n' +
      'Descanso en la promesa de que tú guiarás mis pasos con amor. En el nombre de Jesús, amén.',
  },

  // --- 10. CONSUELO PARA EL ALMA HERIDA ---
  {
    id: 'semilla-sanidad-1',
    tema: 'paz_ansiedad',
    titulo: 'Cerca de ti en medio de la tristeza: Consuelo para el alma herida',
    referencia_biblica: 'Salmos 34:18',
    predicacion:
      'Hay momentos en la vida donde el dolor es tan profundo que resulta casi imposible expresarlo con palabras.\n\n' +
      'Podemos estar rodeados de personas en el trabajo o en una reunión social, y aun así sentir un nudo amargo en la garganta y un vacío en el pecho, preguntándonos si alguien en la tierra realmente comprende la batalla y el silencio que estamos viviendo por dentro.\n\n' +
      'A veces la religiosidad equivocada nos hace creer que un cristiano nunca debe estar triste o que llorar es falta de fe.\n\n' +
      'Pero las Escrituras nos muestran a Jesús llorando desconsoladamente ante la tumba de Lázaro y a hombres de Dios como David derramando lágrimas noche tras noche en su lecho de dolor.\n\n' +
      'Dios no te juzga por sentirte triste ni te exige que finjas una sonrisa forzada delante de su presencia.\n\n' +
      'La ternura del corazón de Dios se revela de manera conmovedora en Salmos 34:18: “Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.”\n\n' +
      'Fíjate bien: el versículo no dice que Dios está cerca únicamente de los que tienen victorias visibles o de los que cantan alegres los domingos.\n\n' +
      'Dice que está más cerca que nunca de quien tiene el corazón hecho pedazos.\n\n' +
      'El Señor recoge cada una de tus lágrimas en su redoma y no hay una sola herida de tu alma que pase desapercibida para sus ojos llenos de compasión.\n\n' +
      'En los días donde las fuerzas humanas se agotan por completo, su presencia silenciosa es el refugio más seguro que puedes encontrar.\n\n' +
      'La tristeza que sientes hoy no tiene la última palabra sobre tu destino.\n\n' +
      'Es solo una noche oscura en el camino, pero la Palabra de Dios promete que el llanto puede durar una noche, mas a la mañana vendrá la alegría.\n\n' +
      'No te aísles en el dolor ni permitas que el desánimo te convenza de que Dios se olvidó de ti.\n\n' +
      'Hoy no estás solo ni abandonado. El Consolador divino camina contigo, sosteniéndote con su mano fuerte y sanando tus heridas con su amor incondicional.',
    reflexion:
      'Hay momentos en la vida donde el dolor es tan profundo que resulta casi imposible expresarlo con palabras.\n\n' +
      'Podemos estar rodeados de personas en el trabajo o en una reunión social, y aun así sentir un nudo amargo en la garganta y un vacío en el pecho, preguntándonos si alguien en la tierra realmente comprende la batalla y el silencio que estamos viviendo por dentro.\n\n' +
      'A veces la religiosidad equivocada nos hace creer que un cristiano nunca debe estar triste o que llorar es falta de fe.\n\n' +
      'Pero las Escrituras nos muestran a Jesús llorando desconsoladamente ante la tumba de Lázaro y a hombres de Dios como David derramando lágrimas noche tras noche en su lecho de dolor.\n\n' +
      'Dios no te juzga por sentirte triste ni te exige que finjas una sonrisa forzada delante de su presencia.\n\n' +
      'La ternura del corazón de Dios se revela de manera conmovedora en Salmos 34:18: “Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.”\n\n' +
      'Fíjate bien: el versículo no dice que Dios está cerca únicamente de los que tienen victorias visibles o de los que cantan alegres los domingos.\n\n' +
      'Dice que está más cerca que nunca de quien tiene el corazón hecho pedazos.\n\n' +
      'El Señor recoge cada una de tus lágrimas en su redoma y no hay una sola herida de tu alma que pase desapercibida para sus ojos llenos de compasión.\n\n' +
      'En los días donde las fuerzas humanas se agotan por completo, su presencia silenciosa es el refugio más seguro que puedes encontrar.\n\n' +
      'La tristeza que sientes hoy no tiene la última palabra sobre tu destino.\n\n' +
      'Es solo una noche oscura en el camino, pero la Palabra de Dios promete que el llanto puede durar una noche, mas a la mañana vendrá la alegría.\n\n' +
      'No te aísles en el dolor ni permitas que el desánimo te convenza de que Dios se olvidó de ti.\n\n' +
      'Hoy no estás solo ni abandonado. El Consolador divino camina contigo, sosteniéndote con su mano fuerte y sanando tus heridas con su amor incondicional.',
    paso_practico:
      'Habla con Dios hoy con total transparencia. No escondas tus lágrimas ni tus preguntas. Dile exactamente qué es lo que te duele y descansa en la certeza de que Él te sostiene con ternura.',
    preguntas: [
      '¿Has estado reprimiendo tu dolor creyendo que mostrar tristeza es falta de fe?',
      '¿Confías en que Dios puede convertir esta temporada de dolor en un testimonio de sanidad y madurez espiritual?',
    ],
    oracion:
      'Padre de misericordias y Dios de toda consolación, vengo a tus brazos con el corazón adolorido y las fuerzas desgastadas.\n\n' +
      'Tú conoces las heridas profundas que llevo en silencio y que a nadie más he podido contar. Gracias porque no me juzgas por llorar y porque estás cerca de los quebrantados de corazón.\n\n' +
      'Derrama tu bálsamo sanador sobre mi alma. Abraza mis vacíos y quita toda desesperanza de mi mente. Recuérdame que esta temporada de tristeza es pasajera y que tu fidelidad permanece para siempre.\n\n' +
      'Sostenme con tu diestra de justicia y renueva en mí el gozo de tu salvación. En el dulce nombre de Jesús, amén.',
  },

  // --- 11. DESCANSO EN LA PROVISIÓN DE DIOS ---
  {
    id: 'semilla-finanzas-1',
    tema: 'diario',
    titulo: 'Descanso en la provisión de Dios: Vencer la angustia económica',
    referencia_biblica: 'Filipenses 4:19',
    predicacion:
      'Pocas cosas generan tanta angustia cotidiana como la incertidumbre económica.\n\n' +
      'Ver que los gastos suben, que los ingresos no alcanzan como antes o que las cuentas por pagar tocan a la puerta puede quitarnos el sueño y llenarnos el pecho de preocupación.\n\n' +
      'Empezamos a hacer cálculos mentales a toda hora y el temor al futuro intenta robarnos la paz del presente.\n\n' +
      'Pero el apóstol Pablo nos recuerda una verdad eterna que no depende de la economía de este mundo en Filipenses 4:19: “Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.”\n\n' +
      'Observa la fuente de la promesa: Pablo no dice conforme a tus ahorros ni conforme al estado del mercado, sino conforme a las riquezas celestiales de Dios.\n\n' +
      'Dios es tu verdadero proveedor.\n\n' +
      'Tu empleo, tus clientes o tus negocios son simplemente los canales que Dios utiliza hoy; pero la fuente inagotable de tu provisión sigue siendo tu Padre celestial.\n\n' +
      'Jesús nos enseñó en el Sermón del Monte a mirar las aves del cielo: no siembran ni cosechan en graneros, y vuestro Padre celestial las alimenta cada día.\n\n' +
      '¿Cuánto más cuidará de ti, que eres su hijo amado rescatado por la sangre de Cristo?\n\n' +
      'Preocuparte no añade un solo centavo a tu cuenta bancaria; solo vacía el día de hoy de sus fuerzas y de su paz.\n\n' +
      'Haz tu parte con responsabilidad: administra con prudencia, trabaja con diligencia y sé generoso con lo poco.\n\n' +
      'Pero entrega el resultado final a Dios.\n\n' +
      'El Señor nunca ha desamparado al justo ni a su descendencia que mendigue pan.\n\n' +
      'Hoy camina con la frente en alto y descansa sabiendo que el Dios de los cielos tiene tu sustento asegurado en sus manos.',
    reflexion:
      'Pocas cosas generan tanta angustia cotidiana como la incertidumbre económica.\n\n' +
      'Ver que los gastos suben, que los ingresos no alcanzan como antes o que las cuentas por pagar tocan a la puerta puede quitarnos el sueño y llenarnos el pecho de preocupación.\n\n' +
      'Empezamos a hacer cálculos mentales a toda hora y el temor al futuro intenta robarnos la paz del presente.\n\n' +
      'Pero el apóstol Pablo nos recuerda una verdad eterna que no depende de la economía de este mundo en Filipenses 4:19: “Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.”\n\n' +
      'Observa la fuente de la promesa: Pablo no dice conforme a tus ahorros ni conforme al estado del mercado, sino conforme a las riquezas celestiales de Dios.\n\n' +
      'Dios es tu verdadero proveedor.\n\n' +
      'Tu empleo, tus clientes o tus negocios son simplemente los canales que Dios utiliza hoy; pero la fuente inagotable de tu provisión sigue siendo tu Padre celestial.\n\n' +
      'Jesús nos enseñó en el Sermón del Monte a mirar las aves del cielo: no siembran ni cosechan en graneros, y vuestro Padre celestial las alimenta cada día.\n\n' +
      '¿Cuánto más cuidará de ti, que eres su hijo amado rescatado por la sangre de Cristo?\n\n' +
      'Preocuparte no añade un solo centavo a tu cuenta bancaria; solo vacía el día de hoy de sus fuerzas y de su paz.\n\n' +
      'Haz tu parte con responsabilidad: administra con prudencia, trabaja con diligencia y sé generoso con lo poco.\n\n' +
      'Pero entrega el resultado final a Dios.\n\n' +
      'El Señor nunca ha desamparado al justo ni a su descendencia que mendigue pan.\n\n' +
      'Hoy camina con la frente en alto y descansa sabiendo que el Dios de los cielos tiene tu sustento asegurado en sus manos.',
    paso_practico:
      'Haz una pausa en tus preocupaciones financieras hoy. Presenta en oración tus números y cuentas a Dios, y dale gracias por adelantado por el sustento de este día.',
    preguntas: [
      '¿Estás poniendo tu seguridad en el dinero o en la fidelidad eterna de Dios como tu verdadero Proveedor?',
      '¿Estás administrando con sabiduría y generosidad los recursos que Dios ya ha puesto en tus manos?',
    ],
    oracion:
      'Señor Jehová Jireh, mi fiel Proveedor, hoy pongo en tus manos mis finanzas, mi trabajo y mis necesidades familiares.\n\n' +
      'Perdóname por llenarme de afán y por perder la paz ante la incertidumbre económica. Reconozco que todo lo que tengo viene de tu mano y que tú nunca me has desamparado.\n\n' +
      'Dame sabiduría para administrar con prudencia cada recurso. Abre puertas de bendición y trabajo digno, y cierra las fugas innecesarias.\n\n' +
      'Descanso en tu promesa de que suplirás todo lo que me falta conforme a tus riquezas en gloria. En el nombre de Jesús, amén.',
  },

  // --- 12. EL PODER DEL PERDÓN EN EL HOGAR ---
  {
    id: 'semilla-familia-1',
    tema: 'diario',
    titulo: 'El poder del perdón en el hogar: Sanar las heridas familiares',
    referencia_biblica: 'Colosenses 3:12-14',
    predicacion:
      'Las heridas más dolorosas de la vida casi siempre ocurren dentro de las cuatro paredes del hogar.\n\n' +
      'Un comentario hiriente de quien más queremos, una falta de apoyo en un momento difícil, una traición o años de silencios y reclamos acumulados pueden convertir una casa en un lugar de tensión y distancia emocional.\n\n' +
      'La convivencia diaria saca a la luz nuestras imperfecciones y diferencias más profundas.\n\n' +
      'En momentos así, nuestro orgullo humano levanta murallas: dejamos de hablar, recordamos viejos errores y guardamos una lista mental de agravios esperando que el otro pague por su falta.\n\n' +
      'Pero el rencor nunca sana una familia; el rencor solo envenena el alma de quien lo guarda.\n\n' +
      'El apóstol Pablo nos entrega la medicina divina para restaurar los lazos del hogar en Colosenses 3:12-14: “Vestíos, pues, como escogidos de Dios, santos y amados, de entrañable misericordia, de benignidad, de humildad, de mansedumbre, de paciencia; soportándoos unos a otros, y perdonándoos unos a otros si alguno tuviere queja contra otro. De la manera que Cristo os perdonó, así también hacedlo vosotros.”\n\n' +
      'El perdón cristiano no es un sentimiento espontáneo que esperamos a que brote mágicamente.\n\n' +
      'El perdón es una decisión voluntaria de gracia que brota al recordar cuánto nos perdonó Cristo a nosotros en la cruz.\n\n' +
      'Perdonar no significa decir que lo que pasó estuvo bien o que el dolor no existió.\n\n' +
      'Perdonar significa soltar el derecho a la venganza y entregarle el dolor al Señor para que Él sane el corazón.\n\n' +
      'Una familia fuerte no es una familia sin problemas; es una familia donde abunda la humildad para pedir perdón y la gracia para concederlo.\n\n' +
      'Hoy no esperes a que el otro dé el primer paso. El amor de Dios en ti es más fuerte que cualquier resentimiento del pasado.\n\n' +
      'Elige el camino de la reconciliación y permite que la paz de Cristo reine en tu hogar.',
    reflexion:
      'Las heridas más dolorosas de la vida casi siempre ocurren dentro de las cuatro paredes del hogar.\n\n' +
      'Un comentario hiriente de quien más queremos, una falta de apoyo en un momento difícil, una traición o años de silencios y reclamos acumulados pueden convertir una casa en un lugar de tensión y distancia emocional.\n\n' +
      'La convivencia diaria saca a la luz nuestras imperfecciones y diferencias más profundas.\n\n' +
      'En momentos así, nuestro orgullo humano levanta murallas: dejamos de hablar, recordamos viejos errores y guardamos una lista mental de agravios esperando que el otro pague por su falta.\n\n' +
      'Pero el rencor nunca sana una familia; el rencor solo envenena el alma de quien lo guarda.\n\n' +
      'El apóstol Pablo nos entrega la medicina divina para restaurar los lazos del hogar en Colosenses 3:12-14: “Vestíos, pues, como escogidos de Dios, santos y amados, de entrañable misericordia, de benignidad, de humildad, de mansedumbre, de paciencia; soportándoos unos a otros, y perdonándoos unos a otros si alguno tuviere queja contra otro. De la manera que Cristo os perdonó, así también hacedlo vosotros.”\n\n' +
      'El perdón cristiano no es un sentimiento espontáneo que esperamos a que brote mágicamente.\n\n' +
      'El perdón es una decisión voluntaria de gracia que brota al recordar cuánto nos perdonó Cristo a nosotros en la cruz.\n\n' +
      'Perdonar no significa decir que lo que pasó estuvo bien o que el dolor no existió.\n\n' +
      'Perdonar significa soltar el derecho a la venganza y entregarle el dolor al Señor para que Él sane el corazón.\n\n' +
      'Una familia fuerte no es una familia sin problemas; es una familia donde abunda la humildad para pedir perdón y la gracia para concederlo.\n\n' +
      'Hoy no esperes a que el otro dé el primer paso. El amor de Dios en ti es más fuerte que cualquier resentimiento del pasado.\n\n' +
      'Elige el camino de la reconciliación y permite que la paz de Cristo reine en tu hogar.',
    paso_practico:
      'Toma hoy la iniciativa de bendecir a ese familiar con quien tienes tensión. Envía un mensaje afectuoso, pide perdón si te equivocaste o ten un gesto de amor sin esperar reciprocidad inmediata.',
    preguntas: [
      '¿Estás guardando amargura hacia alguien de tu familia por ofensas pasadas?',
      '¿Estás dispuesto a perdonar como Cristo te perdonó a ti para traer libertad y sanidad a tu hogar?',
    ],
    oracion:
      'Padre de amor, hoy vengo a ti poniendo en tus manos a mi familia y cada relación en mi hogar.\n\n' +
      'Reconozco que muchas veces el orgullo, la falta de paciencia y las palabras apresuradas han levantado muros de distancia entre nosotros. Perdóname por guardar resentimientos pasados.\n\n' +
      'Hoy decido perdonar de corazón a quienes me han lastimado, así como tú me perdonaste a mí en Cristo Jesús. Arranca toda raíz de amargura de mi interior.\n\n' +
      'Llena mi casa con tu paz, tu armonía y tu amor entrañable. Que mi hogar sea un refugio de gracia y consuelo. En el nombre de Jesús, amén.',
  },
];

/**
 * Normaliza y estructura el devocional garantizando todas las secciones de una prédica profesional.
 */
export function normalizarDevocional(item) {
  if (!item) return null;

  let titulo = item.titulo || null;
  let predicacion = item.predicacion || null;
  let reflexion = item.reflexion || '';
  let pasoPractico = item.paso_practico || item.aplicacion || null;
  let preguntas = item.preguntas || (item.pregunta_reflexion ? [item.pregunta_reflexion] : null);
  let oracion = item.oracion || null;
  let tema = item.tema || 'diario';

  if (typeof reflexion === 'string' && reflexion.startsWith('{') && reflexion.endsWith('}')) {
    try {
      const parsed = JSON.parse(reflexion);
      titulo = parsed.titulo || titulo;
      predicacion = parsed.predicacion || parsed.mensaje || predicacion;
      reflexion = parsed.reflexion || reflexion;
      pasoPractico = parsed.paso_practico || parsed.aplicacion || pasoPractico;
      preguntas = parsed.preguntas || (parsed.pregunta_reflexion ? [parsed.pregunta_reflexion] : preguntas);
      oracion = parsed.oracion || oracion;
      tema = parsed.tema || tema;
    } catch (_) {}
  }

  // Sincronizar predicación y reflexión
  if (!predicacion && reflexion) predicacion = reflexion;
  if (!reflexion && predicacion) reflexion = predicacion;

  // Si el texto viene corto (menos de 8 párrafos), enriquecerlo con el banco curado si existe coincidencia
  const parrafosContados = (predicacion || '').split('\n\n').filter((p) => p.trim() !== '').length;
  if (parrafosContados < 8) {
    const semilla = BANCO_DEVOCIONALES_SEMILLA.find(
      (s) =>
        s.id === item.id ||
        (item.referencia_biblica && s.referencia_biblica?.toLowerCase() === item.referencia_biblica?.toLowerCase()) ||
        (titulo && s.titulo?.toLowerCase().includes(titulo?.toLowerCase().slice(0, 15)))
    );
    if (semilla) {
      titulo = semilla.titulo;
      predicacion = semilla.predicacion;
      reflexion = semilla.predicacion;
      pasoPractico = semilla.paso_practico || pasoPractico;
      preguntas = semilla.preguntas || preguntas;
      oracion = semilla.oracion || oracion;
      tema = semilla.tema || tema;
    }
  }

  if (!titulo) {
    if (tema === 'malos_habitos') titulo = 'Libertad y Dominio Propio en Cristo';
    else if (tema === 'fortalecer_fe') titulo = 'Firmeza en la Promesa de Dios';
    else if (tema === 'paz_ansiedad') titulo = 'Paz en Medio de la Tempestad';
    else titulo = 'Palabra Viva para Tu Día';
  }

  return {
    id: item.id || `dev-${Math.random().toString(36).slice(2, 9)}`,
    titulo,
    referencia_biblica: item.referencia_biblica || 'Salmos 23:1-3',
    predicacion,
    reflexion,
    paso_practico: pasoPractico,
    preguntas,
    oracion,
    tema,
    orden: item.orden,
    origen: item.origen || (item.id?.toString().startsWith('semilla') ? 'semilla' : 'supabase'),
  };
}

export async function obtenerDevocionalesPorTema(temaId = 'todos') {
  try {
    let consulta = supabase.from('devocionales').select('*');

    if (temaId && temaId !== 'todos') {
      if (temaId === 'malos_habitos') {
        consulta = consulta.ilike('tema', '%habito%');
      } else if (temaId === 'fortalecer_fe') {
        consulta = consulta.or('tema.ilike.%fe%,tema.ilike.%fortaleza%,tema.ilike.%esperanza%,tema.ilike.%confianza%');
      } else if (temaId === 'paz_ansiedad') {
        consulta = consulta.or('tema.ilike.%paz%,tema.ilike.%descanso%,tema.ilike.%consuelo%');
      } else if (temaId === 'diario') {
        consulta = consulta.or('tema.ilike.%diario%,tema.ilike.%gratitud%,tema.ilike.%gozo%,tema.ilike.%sabidur%');
      } else {
        consulta = consulta.eq('tema', temaId);
      }
    }

    const { data: devocionalesDb } = await consulta.order('orden', { ascending: true });

    const semillasCoincidentes = BANCO_DEVOCIONALES_SEMILLA.filter((d) => {
      if (!temaId || temaId === 'todos') return true;
      return d.tema === temaId;
    });

    const combinados = [
      ...semillasCoincidentes.map(normalizarDevocional),
      ...(devocionalesDb || []).map(normalizarDevocional),
    ];

    const unicos = [];
    const referenciasVistas = new Set();
    for (const dev of combinados) {
      const clave = `${dev.referencia_biblica}_${dev.titulo}`.toLowerCase();
      if (!referenciasVistas.has(clave)) {
        referenciasVistas.add(clave);
        unicos.push(dev);
      }
    }

    return unicos;
  } catch (error) {
    console.warn('Error al cargar devocionales de Supabase:', error);
    return BANCO_DEVOCIONALES_SEMILLA.filter((d) => {
      if (!temaId || temaId === 'todos') return true;
      return d.tema === temaId;
    }).map(normalizarDevocional);
  }
}

export async function obtenerDevocionalAleatorio(temaId = 'todos') {
  const lista = await obtenerDevocionalesPorTema(temaId);
  if (!lista || lista.length === 0) {
    return normalizarDevocional(BANCO_DEVOCIONALES_SEMILLA[0]);
  }
  const indiceAzar = Math.floor(Math.random() * lista.length);
  return lista[indiceAzar];
}

export async function guardarDevocionalEnSupabase(devocional) {
  try {
    const { data: maxFila } = await supabase
      .from('devocionales')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1)
      .maybeSingle();

    const siguienteOrden = (maxFila?.orden || 30) + 1;

    const datosEstructurados = JSON.stringify({
      titulo: devocional.titulo,
      predicacion: devocional.predicacion || devocional.reflexion,
      paso_practico: devocional.paso_practico,
      preguntas: devocional.preguntas,
      oracion: devocional.oracion,
      tema: devocional.tema,
    });

    const { data, error } = await supabase
      .from('devocionales')
      .insert({
        orden: siguienteOrden,
        referencia_biblica: devocional.referencia_biblica,
        reflexion: datosEstructurados,
        tema: devocional.tema,
      })
      .select()
      .single();

    if (error) {
      console.warn('No se pudo guardar en Supabase:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Error al persistir devocional:', err.message);
    return null;
  }
}

export function sintetizarDevocionalContextual({ tema, subtema, situacionPersonal }) {
  const textoEntrada = `${subtema || ''} ${situacionPersonal || ''} ${tema || ''}`.toLowerCase();

  let titulo = 'Palabra de Dios para Tu Día';
  let pasaje = 'Proverbios 16:3';
  let parrafos = [];
  let pasoPractico = 'Aparta 15 minutos en quietud hoy para orar y entregar tus cargas a Dios.';
  let preg1 = '¿Qué área de tu vida necesitas entregar plenamente al control de Dios hoy?';
  let preg2 = '¿Confías en que los planes de Dios son mejores que los tuyos?';
  let oracionEspecifica = 'Señor, pongo en tus manos mi vida y mis planes. Dame paz y guía mis pasos en tu verdad. Amén.';

  if (textoEntrada.includes('plan') || textoEntrada.includes('futuro') || textoEntrada.includes('proyecto') || textoEntrada.includes('meta')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[0];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('ira') || textoEntrada.includes('enojo') || textoEntrada.includes('impacien') || textoEntrada.includes('rabia')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[2];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('pereza') || textoEntrada.includes('procrastina') || textoEntrada.includes('posterga')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[1];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('distraccion') || textoEntrada.includes('redes') || textoEntrada.includes('pantalla') || textoEntrada.includes('tiempo')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[3];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('ansiedad') || textoEntrada.includes('afan') || textoEntrada.includes('preocupa') || textoEntrada.includes('insomnio') || textoEntrada.includes('miedo')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[6];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('soledad') || textoEntrada.includes('trist') || textoEntrada.includes('dolor') || textoEntrada.includes('depre')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[9];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('dinero') || textoEntrada.includes('finanza') || textoEntrada.includes('deuda') || textoEntrada.includes('trabajo') || textoEntrada.includes('provision')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[10];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else if (textoEntrada.includes('familia') || textoEntrada.includes('matrimonio') || textoEntrada.includes('hijo') || textoEntrada.includes('hogar') || textoEntrada.includes('perdon')) {
    const dev = BANCO_DEVOCIONALES_SEMILLA[11];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  } else {
    const dev = BANCO_DEVOCIONALES_SEMILLA[4];
    titulo = dev.titulo;
    pasaje = dev.referencia_biblica;
    parrafos = dev.predicacion.split('\n\n');
    pasoPractico = dev.paso_practico;
    preg1 = dev.preguntas[0];
    preg2 = dev.preguntas[1];
    oracionEspecifica = dev.oracion;
  }

  if (situacionPersonal && situacionPersonal.trim().length > 3) {
    const textoLimpio = situacionPersonal.trim();
    parrafos.splice(
      Math.min(4, parrafos.length - 2),
      0,
      `Hoy trajiste delante de Dios esta situación particular: “${textoLimpio}”. En medio de esa realidad concreta que estás viviendo, Dios no está distante. Él conoce tu cansancio y promete darte la sabiduría para enfrentarla.`
    );
    parrafos.push(
      `Entrega esa situación que te pesa en este día. Dios tiene el poder para transformar lo difícil en un testimonio de bendición y madurez.`
    );
    oracionEspecifica = `Señor Jesús, hoy vengo delante de ti con el corazón enteramente transparente.\n\nPongo en tus manos amorosas esta situación tan particular que estoy viviendo: “${textoLimpio}”.\n\nTú conoces lo que siento, mis preocupaciones, mis miedos y también mis mayores anhelos respecto a esto. Perdóname por llenarme de afán y por intentar resolver en mis limitadas fuerzas lo que solo tú puedes transformar.\n\nDame sabiduría celestial para tomar las decisiones correctas, templanza para no desesperar y una fe inquebrantable para ver tu gloria obrando en mi vida.\n\nDeclaro que en medio de esta circunstancia tú eres mi paz, mi refugio y mi pronto auxilio. Descanso seguro en tus brazos de amor. En el nombre de Jesús, amén.`;
    titulo = `${titulo.split(':')[0]}: Esperanza para tu situación`;
  }

  const cuerpoReflexion = parrafos.join('\n\n');

  return {
    id: `dev-ia-${Date.now()}`,
    titulo,
    referencia_biblica: pasaje,
    predicacion: cuerpoReflexion,
    reflexion: cuerpoReflexion,
    paso_practico: pasoPractico,
    preguntas: [preg1, preg2],
    oracion: oracionEspecifica,
    tema,
    subtema_aplicado: subtema || null,
    situacion_usuario: situacionPersonal || null,
    origen: 'ia_personalizado',
  };
}

export async function generarDevocionalConIA({ tema = 'malos_habitos', subtema = '', situacionPersonal = '' }) {
  const apiKey = await obtenerApiKeyGemini();

  if (apiKey) {
    const promptInstrucciones = `
Eres un consejero espiritual y pastor cristiano evangélico con una profunda sensibilidad pastoral, fundamentado exclusivamente en la Santa Biblia (versión Reina-Valera 1960).
Tu propósito es escribir un devocional diario EXTENSO, PROFUNDO, CÁLIDO, INSPIRADOR y altamente detallado (similar al devocional clásico de Proverbios 16:3 "Deja todos tus planes en manos de Dios", Nuestro Pan Diario o los mejores planes devocionales de YouVersion).

SOLICITUD DEL CREYENTE:
- Categoría: ${tema === 'malos_habitos' ? 'Dejar un mal hábito y dominio propio' : tema === 'fortalecer_fe' ? 'Fortalecer la fe y confianza en Dios' : tema === 'paz_ansiedad' ? 'Paz interior, calma y soltar la ansiedad' : 'Devocional diario para el crecimiento espiritual'}
${subtema ? `- Enfoque específico seleccionado: "${subtema}"` : ''}
${situacionPersonal ? `- Situación personal exacta que vive el creyente: "${situacionPersonal}"` : ''}

REGLAS DE EXTENSIÓN Y ESTILO PASTORAL (ESTRICTAMENTE OBLIGATORIO):
1. NO HAGAS UN DEVOCIONAL CORTO: La reflexión pastoral ("predicacion") DEBE TENER ENTRE 16 Y 22 PÁRRAFOS PROFUNDOS Y EXTENSOS (cada párrafo de 1 a 3 oraciones bien construidas, fluidas y cálidas). Está totalmente PROHIBIDO hacer devocionales de 4 o 5 párrafos. Desarrolla la enseñanza a fondo con ejemplos de la vida real.
2. ESTRUCTURA NARRATIVA Y PASTORAL CÁLIDA:
   - Inicia conectando con una experiencia o dilema humano real y relatable (el trabajo, el insomnio, enviar hojas de vida, la familia, decisiones difíciles, el anhelo de control).
   - Muestra dónde surge el conflicto interior, el miedo o la tentación.
   - Explica el pasaje bíblico con riqueza: qué nos enseña Dios a través de ese versículo, cuál es el trasfondo espiritual y qué significa aplicarlo con el corazón.
   - Brinda analogías cotidianas y ejemplos concretos de la vida real (ej. emprender un negocio, puertas cerradas que son protección divina, soltar expectativas, aprender a esperar).
   - Termina con una conclusión inspiradora que afirme la paz y soberanía de Dios.
3. PROHIBIDO USAR NÚMEROS ROMANOS O ESQUEMAS ACADÉMICOS: NO uses "I.", "II.", "III." ni subtítulos rígidos. Debe fluir como un mensaje de fe continuo, cercano y envolvente.
4. INTEGRACIÓN DE LA SITUACIÓN PERSONAL: Si el creyente especificó su situación ("${situacionPersonal || ''}"), abórdala directamente con consuelo bíblico y consejos prácticos dentro de la reflexión y en la oración.
5. ORACIÓN ESPECIAL AMPLIA: La oración ("oracion") debe tener al menos 5 a 8 párrafos sinceros, íntimos y vulnerables en primera persona con Dios.

ESTRUCTURA JSON OBLIGATORIA (Responde ÚNICAMENTE en JSON válido sin formato markdown extra):
{
  "titulo": "Título inspirador y directo (máximo 8 palabras)",
  "referencia_biblica": "Cita bíblica exacta con Libro Capítulo:Versículo de la RV1960",
  "predicacion": "Reflexión profunda y extensa de 16 a 22 párrafos (separados por doble salto de línea \\n\\n). Cálida, bíblica y sin números romanos.",
  "paso_practico": "Un paso de fe o ejercicio práctico muy concreto y detallado para poner en práctica hoy.",
  "preguntas": [
    "Pregunta de autoexamen espiritual profunda y amorosa 1",
    "Pregunta de autoexamen espiritual profunda y amorosa 2"
  ],
  "oracion": "Oración especial sincera y vulnerable en primera persona (mínimo 5-8 párrafos de oración profunda separados por \\n\\n).",
  "tema": "${tema}"
}
`;

    const modelosAProbar = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    for (const modelo of modelosAProbar) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
        const respuesta = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptInstrucciones }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (respuesta.ok) {
          const dataJson = await respuesta.json();
          const textoRespuesta = dataJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textoRespuesta) {
            const limpio = textoRespuesta
              .trim()
              .replace(/^\`\`\`json\s*/i, '')
              .replace(/^\`\`\`\s*/i, '')
              .replace(/\s*\`\`\`$/i, '');

            const objetoDevocional = JSON.parse(limpio);
            objetoDevocional.origen = 'gemini_ai';
            guardarDevocionalEnSupabase(objetoDevocional).catch(() => {});
            return normalizarDevocional(objetoDevocional);
          }
        }
      } catch (err) {
        console.warn(`Intento con modelo ${modelo} falló:`, err.message);
      }
    }
  }

  const devocionalGenerado = sintetizarDevocionalContextual({ tema, subtema, situacionPersonal });
  guardarDevocionalEnSupabase(devocionalGenerado).catch(() => {});
  return normalizarDevocional(devocionalGenerado);
}
