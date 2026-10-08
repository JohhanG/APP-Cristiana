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

/**
 * Devuelve la lista de subtemas recomendados según el tema seleccionado.
 */
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

/**
 * Obtiene la API Key de Gemini desde process.env o almacenamiento seguro local.
 */
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

/**
 * Guarda la API Key de Gemini en el dispositivo del usuario.
 */
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

// Banco curado profesional con tono pastoral cálido, párrafos cortos y aplicación práctica:
// 1. Título y Cita bíblica (RV1960)
// 2. Reflexión (párrafos de 1 a 3 oraciones, lenguaje cercano y aplicable)
// 3. Aplicación para hoy / Paso de fe
// 4. Para meditar (preguntas de autoexamen)
// 5. Oración especial en primera persona
export const BANCO_DEVOCIONALES_SEMILLA = [
  // --- DEVOCIONAL DESTACADO: MUESTRA PRINCIPAL ---
  {
    id: 'semilla-planes-dios',
    tema: 'paz_ansiedad',
    titulo: 'Deja todos tus planes en manos de Dios',
    referencia_biblica: 'Proverbios 16:3',
    predicacion:
      'Todos hacemos planes.\n\nPensamos qué queremos conseguir este año, dónde queremos estar en unos meses, cómo mejorar nuestro trabajo, cómo cuidar a nuestra familia, qué cosas queremos comprar o qué sueños queremos alcanzar. Tener planes no está mal. De hecho, es bueno soñar, trabajar y prepararnos.\n\nEl problema aparece cuando queremos controlar cada detalle.\n\nQueremos saber cuándo llegará la respuesta, cómo se resolverá el problema, qué va a pasar mañana y cuál será exactamente el resultado de cada decisión. Y cuando algo se sale de nuestro plan, nos llenamos de ansiedad.\n\nPor eso Proverbios 16:3 nos da un consejo sencillo, pero profundo: “Encomienda a Jehová tus obras.”\n\nEn otras palabras: haz tus planes, trabaja por ellos, pero no intentes ser el dueño del futuro. Entrégale a Dios tus proyectos, tus decisiones, tus anhelos y también tus temores.\n\nEncomendar significa soltar el control y confiar en que Dios sabe mejor que nosotros lo que nos conviene.\n\nA veces pensamos que encomendar nuestras obras significa que Dios hará exactamente lo que nosotros queremos. Pero el versículo dice algo diferente: dice que nuestros pensamientos serán afirmados. Esto significa que cuando le entregas tus planes a Dios, Él te da claridad, alinea tu corazón con su voluntad y te da paz, incluso si las cosas no salen como tú esperabas.\n\nHoy tal vez estás esperando una respuesta de trabajo, tomando una decisión difícil o preocupado por el futuro. No cargues con todo ese peso tú solo.\n\nHaz lo que esté en tus manos, pero descansa sabiendo que el resultado final está en las manos de Dios.',
    paso_practico:
      'Escribe en una libreta o en tu teléfono los planes que más te preocupan en este momento. Luego, dile a Dios en oración: “Señor, estos son mis planes, pero confío más en tu dirección que en mis propias fuerzas.”',
    preguntas: [
      '¿Qué plan o decisión estás intentando controlar por ti mismo en lugar de entregárselo a Dios?',
      '¿Confías en que los planes de Dios para tu vida son mejores que los tuyos?',
    ],
    oracion:
      'Señor, hoy pongo en tus manos todos mis planes, proyectos y decisiones. Perdóname por querer controlar el futuro y por llenarme de ansiedad cuando las cosas no salen como yo espero.\n\nTe entrego mi trabajo, mi familia, mis anhelos y mis temores. Afirma mis pensamientos, dame sabiduría para tomar buenas decisiones y ayúdame a descansar en tu perfecta voluntad.\n\nConfío en que tus caminos son más altos que los míos y que tú siempre tienes el control. En el nombre de Jesús, amén.',
  },

  // --- MALOS HÁBITOS Y DOMINIO PROPIO ---
  {
    id: 'semilla-habito-1',
    tema: 'malos_habitos',
    titulo: 'Vencer la pereza: De la postergación a la diligencia',
    referencia_biblica: 'Proverbios 6:6-8',
    predicacion:
      'Todos conocemos esa sensación de dejar las cosas para después.\n\nNos decimos a nosotros mismos: "Mañana empiezo", "el lunes lo retomo", "ahora no tengo ganas" o "cuando tenga más tiempo lo haré mejor". Y sin darnos cuenta, los días pasan, las metas se enfrían y una pesadez silenciosa se va acumulando en el pecho.\n\nLa pereza casi nunca es falta de horas en el reloj; es una trampa de la comodidad.\n\nBuscamos el alivio momentáneo de posponer lo que cuesta esfuerzo, pero terminamos pagando un precio muy alto: estrés de última hora, oportunidades perdidas y un desánimo constante.\n\nPor eso el sabio Salomón nos aconseja con sencillez práctica: "Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán, ni gobernador, ni señor, prepara en el verano su comida."\n\nLa hormiga no espera a sentir ganas ni necesita que alguien la vigile. Tiene una convicción interna y da pasos pequeños pero constantes cada día.\n\nDios no te pide que hagas todo de golpe ni que seas perfecto. Te pide fidelidad con el paso de hoy: levantarte a tiempo, cumplir tu palabra, retomar la oración o avanzar en esa tarea que dejaste a medias.\n\nNo esperes a tener ganas perfectas; actúa en obediencia hoy, y verás cómo Dios renueva tus fuerzas en el camino.',
    paso_practico:
      'Identifica una responsabilidad que lleves postergando más de dos semanas. Deja el celular a un lado por 25 minutos y da el primer paso hoy mismo sin excusas.',
    preguntas: [
      '¿Qué área de tu vida estás descuidando con la excusa de "mañana lo haré"?',
      '¿Estás esperando tener ganas emocionales para actuar o estás dispuesto a dar un paso de disciplina en fe?',
    ],
    oracion:
      'Señor, reconozco que muchas veces me he dejado ganar por la pereza y las distracciones. Perdóname por malgastar el tiempo valioso que tú me has regalado.\n\nHoy te pido dominio propio y un corazón diligente. Quita de mí la pesadez y el desánimo, y ayúdame a honrarte con mi esfuerzo diario y mi obediencia.\n\nFortalece mis manos y guía mis pasos para edificar con sabiduría mi vida. En el nombre de Jesús, amén.',
  },
  {
    id: 'semilla-habito-2',
    tema: 'malos_habitos',
    titulo: 'El dominio del espíritu: Cómo frenar el enojo antes de que lastime',
    referencia_biblica: 'Proverbios 16:32',
    predicacion:
      'A todos nos ha pasado sentir cómo la sangre hierve en cuestión de segundos.\n\nUna mala contestación en el trabajo, una falta de respeto, el tráfico o una discusión en casa pueden encender una chispa de ira dentro de nosotros. En ese instante, nuestro primer impulso humano es defendernos, alzar la voz y tener la última palabra.\n\nEl problema es que una palabra dicha con furia en cinco segundos puede destruir la confianza que tomó años construir.\n\nEl mundo aplaude el desahogo violento y confunde la agresividad con carácter fuerte. Pero la Biblia nos enseña una verdad mucho más profunda: "Mejor es el que tarda en airarse que el fuerte; y el que se enseñorea de su espíritu, que el que toma una ciudad."\n\nEl verdadero poder no consiste en gritar más fuerte ni en ganar una discusión; consiste en tener dominio propio cuando tienes todos los motivos humanos para explotar.\n\nJesús fue provocado, acusado injustamente e insultado, y aun así eligió responder con gracia y templanza. El dominio propio no es debilidad; es la fuerza de Dios gobernando tus emociones.\n\nHoy, cuando sientas que la impaciencia quiere desbordarte, haz una pausa sagrada. Respira hondo, guarda silencio un minuto y permite que la mansedumbre de Cristo hable por ti.',
    paso_practico:
      'Aplica la regla de la pausa hoy: cuando sientas molestia o provocación de alguien, no respondas al instante. Cuenta hasta diez, ora en silencio por esa persona y responde con serenidad.',
    preguntas: [
      '¿Qué situaciones o actitudes de los demás son las que detonan con más facilidad tu enojo?',
      '¿Justificas tu mal genio diciendo "así soy yo", o estás permitiendo que el Espíritu Santo transforme tus reacciones?',
    ],
    oracion:
      'Señor Jesucristo, Príncipe de Paz, vengo ante ti reconociendo mi debilidad para frenar el mal genio y la impaciencia. Rindo en tu altar mi orgullo y la necesidad de tener siempre la razón.\n\nLlena las áreas heridas de mi corazón con tu bálsamo. Dame de tu paciencia, tu ternura y tu mansedumbre para que de mi boca solo salgan palabras que edifiquen y traigan paz.\n\nQue tu amor gobierne mis reacciones en este día. En tu santo nombre, amén.',
  },
  {
    id: 'semilla-habito-3',
    tema: 'malos_habitos',
    titulo: 'Redimiendo el tiempo: Vencer la distracción digital',
    referencia_biblica: 'Efesios 5:15-16',
    predicacion:
      'Abrimos el teléfono solo para ver la hora, y media hora después seguimos deslizando la pantalla sin rumbo.\n\nMiramos videos cortos, comparamos nuestra vida con las fotos perfectas de otros y nos llenamos de noticias que muchas veces solo nos dejan cansados, ansiosos y desenfocados. La tecnología no es mala en sí misma, pero puede convertirse en un ladrón silencioso de nuestra vida espiritual.\n\nEfesios 5:15-16 nos invita a vivir despiertos: "Mirad, pues, con diligencia cómo andéis, no como necios sino como sabios, aprovechando bien el tiempo, porque los días son malos."\n\nAprovechar el tiempo significa rescatarlo de la superficialidad para invertirlo en lo que realmente tiene valor eterno: tu comunión íntima con Dios, tu familia y tu propósito de vida.\n\nCuando la mente está aturdida por cientos de notificaciones cada hora, se vuelve casi imposible escuchar el susurro apacible del Espíritu Santo. Dios nos habla muchas veces en el silencio, pero no podemos oírlo si nunca apagamos el ruido exterior.\n\nHoy Dios te invita a recuperar tu paz mental y tu tiempo devocional. No dejes que una pantalla te robe los momentos más hermosos de tu día.',
    paso_practico:
      'Haz un ayuno de redes sociales o entretenimiento digital de 2 horas hoy. Dedica los primeros 20 minutos de ese espacio a leer tu Biblia con libreta en mano y en total silencio.',
    preguntas: [
      '¿Es tu teléfono lo primero que buscas en la mañana y lo último que ves al acostarte en lugar de la presencia de Dios?',
      '¿Cuánto tiempo de calidad le has quitado a tu relación con el Señor por navegar sin rumbo?',
    ],
    oracion:
      'Padre celestial, te pido perdón por las horas que he entregado a cosas vanas mientras he dejado apagado el fuego de mi comunión contigo.\n\nLimpia mi mirada y mi mente de toda saturación. Enséñame a valorar cada día como un regalo sagrado y a enfocar mi corazón en lo que realmente permanece.\n\nRompo con la atadura de la distracción y el hábito de postergar mi tiempo contigo. Ayúdame a escuchar tu voz en el silencio de cada día. En el nombre de Jesús, amén.',
  },

  // --- FORTALECER LA FE ---
  {
    id: 'semilla-fe-1',
    tema: 'fortalecer_fe',
    titulo: 'Caminar por fe cuando no ves el camino',
    referencia_biblica: 'Hebreos 11:1',
    predicacion:
      'A todos nos cuesta caminar cuando hay niebla en el camino.\n\nQueremos tener el mapa completo de los próximos años antes de dar un paso. Queremos garantías de que todo saldrá bien, de que no habrá pérdidas y de que las puertas se abrirán sin dolor. Y cuando el futuro se vuelve incierto, la duda empieza a susurrarnos al oído.\n\nPero la Biblia nos enseña que la fe no se mueve por certezas humanas, sino por promesas divinas.\n\nHebreos 11:1 lo dice con profunda claridad: "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve."\n\nAbraham salió de su tierra sin saber a dónde iba, pero confiando en Aquel que lo llamaba. Dios no suele mostrarnos toda la carretera iluminada de antemano; nos da su Palabra como una lámpara que alumbra exactamente el paso que debemos dar hoy.\n\nTal vez en este momento estás esperando una respuesta laboral, viviendo una prueba de salud o enfrentando un dilema difícil, y sientes que estás en un desierto donde nada se mueve. No te desanimes.\n\nEl silencio de Dios no significa que Él te haya olvidado. Dios está trabajando detrás del escenario, preparando el camino y fortaleciendo tu corazón para lo que viene.\n\nNo necesitas ver todo resuelto hoy; solo necesitas confiar en la mano del Padre que te sostiene.',
    paso_practico:
      'Escribe en una hoja tu mayor dilema actual y agrega al pie: "No entiendo cómo lo harás, Señor, pero decido confiar en tu fidelidad". Colócala dentro de tu Biblia como testimonio.',
    preguntas: [
      '¿Estás midiendo el poder de Dios por el tamaño de tus problemas o recordando su fidelidad en el pasado?',
      '¿Qué paso de fe u obediencia has estado retrasando porque tienes miedo a lo desconocido?',
    ],
    oracion:
      'Padre amado, vengo ante ti con mis dudas y temores. Reconozco que muchas veces me desespero cuando no veo resultados inmediatos ni entiendo el camino por donde me llevas.\n\nAumenta mi fe en este día. Ayúdame a no caminar por vista, sino por la firme convicción de que tú eres fiel y nunca llegas tarde.\n\nPongo en tus manos mi futuro, mi familia y mis necesidades. Decido confiar en ti con todo mi corazón. En el poderoso nombre de Jesús, amén.',
  },
  {
    id: 'semilla-fe-2',
    tema: 'fortalecer_fe',
    titulo: 'Dios pelea por ti: Cuando quedarse quieto es la mayor victoria',
    referencia_biblica: 'Éxodo 14:14',
    predicacion:
      'Hay momentos en la vida donde sentimos que estamos atrapados en un callejón sin salida.\n\nAl frente tenemos un mar que parece cerrarnos el paso; detrás, los problemas y las presiones que amenazan con alcanzarnos. En momentos así, nuestro instinto humano es correr, desesperarnos, discutir o tomar decisiones apresuradas guiadas por el temor.\n\nEso mismo sintió el pueblo de Israel frente al Mar Rojo con los carros del faraón pisándoles los talones.\n\nPero en medio del pánico colectivo, la voz de Dios a través de Moisés les dio una orden que cambió la historia: "Jehová peleará por vosotros, y vosotros estaréis tranquilos."\n\nQué difícil es quedarse tranquilo cuando todo parece derrumbarse alrededor. Nuestra carne quiere luchar en sus propias fuerzas y controlar el resultado.\n\nSin embargo, hay batallas espirituales que no se ganan discutiendo ni desgastándose, sino rindiendo el control ante el Dios Todopoderoso. Cuando tú decides guardar la calma y ponerte en oración, le permites a Dios abrir caminos sobrenaturales donde antes solo veías un muro imposible.\n\nEl mar no se abrió antes de llegar a la orilla; se abrió cuando el pueblo dio el paso de fe confiando en Dios.\n\nHoy no tienes que cargar con el peso de solucionar lo imposible tú solo. Tu parte es confiar y caminar en paz; la parte de abrir el mar le corresponde a Dios.',
    paso_practico:
      'Aparta 5 minutos de retiro en silencio hoy. Respira con calma y repite conscientemente en tu corazón: "Dios está peleando esta batalla por mí; mi alma descansa en quietud".',
    preguntas: [
      '¿Estás desgastándote tratando de resolver con tus propias fuerzas algo que solo Dios puede transformar?',
      '¿Confías en que el silencio de Dios en este tiempo es porque Él ya está obrando a tu favor?',
    ],
    oracion:
      'Señor de los ejércitos celestiales, vengo ante ti cansado de pelear en mis limitadas fuerzas humanas. Hoy suelto esta carga que me roba la paz y la pongo sobre tus hombros todopoderosos.\n\nDeclaro que ningún arma forjada contra mi vida prosperará, porque tú eres mi escudo, mi roca y mi salvador. Me aquieto en tu presencia y descanso sabiendo que tú tienes el control de todo.\n\nEspero en ti con gozo y gratitud. En el nombre de Jesús, amén.',
  },

  // --- PAZ Y ANSIEDAD ---
  {
    id: 'semilla-paz-1',
    tema: 'paz_ansiedad',
    titulo: 'La paz que cuida tu corazón: Calma para la mente abrumada',
    referencia_biblica: 'Filipenses 4:6-7',
    predicacion:
      'La ansiedad tiene una forma muy sutil de robarnos el presente.\n\nNos despierta en la madrugada con pensamientos acelerados, nos aprieta el pecho imaginando problemas futuros y nos hace vivir cansados aun después de haber dormido. Muchas veces buscamos alivio en distracciones, pero al poco tiempo la mente vuelve a caer en la misma preocupación.\n\nEl apóstol Pablo conocía muy bien lo que era estar bajo presión extrema. Escribió estas palabras desde una celda oscura en Roma:\n\n"Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús."\n\nFíjate que el antídoto contra el afán no es resignarse con tristeza, sino convertir cada preocupación en una oración llena de gratitud.\n\nCuando das gracias por lo que Dios ya ha hecho en tu vida, tu mente recuerda que el mismo Dios que te cuidó en el pasado tiene el poder para sostenerte hoy y en todo lo que venga mañana.\n\nLa paz de Dios no es una simple emoción pasajera; es como un centinela celestial que custodia la puerta de tu corazón para que el pánico y la desesperanza no entren a gobernar tu vida.\n\nHoy no permitas que la ansiedad decida tu día. Trae cada pensamiento al altar de Dios y descansa en sus promesas.',
    paso_practico:
      'Haz una lista con tus 3 mayores preocupaciones de hoy. Al lado de cada una, escribe un motivo concreto por el que estás agradecido a Dios. Luego, entrégaselas en oración.',
    preguntas: [
      '¿Pasas más tiempo imaginando escenarios difíciles del futuro que orando con gratitud por las bendiciones de hoy?',
      '¿Qué pensamiento de miedo o angustia necesitas reemplazar hoy con una verdad de la Palabra de Dios?',
    ],
    oracion:
      'Padre compasivo y Dios de toda consolación, vengo a tus pies entregándote cada pensamiento ansioso, cada duda y cada carga que me ha robado la calma.\n\nRenuncio al afán por el día de mañana y me refugio bajo la sombra de tus alas. Despliega tu paz sobrenatural sobre mi mente y mi corazón.\n\nGuarda mis pensamientos en Cristo Jesús y ayúdame a descansar confiando en tu perfecta provisión. En el nombre glorioso de Jesús, amén.',
  },

  // --- DEVOCIONALES DIARIOS ---
  {
    id: 'semilla-diario-1',
    tema: 'diario',
    titulo: 'Empezar el día con gratitud: Cuando el corazón despierta en paz',
    referencia_biblica: 'Salmos 118:24',
    predicacion:
      'Muchas mañanas comenzamos el día con el pie en el acelerador.\n\nApenas abrimos los ojos, la lista de pendientes, las cuentas por pagar y los mensajes del teléfono nos bombardean antes de haber respirado hondo. Empezar el día en modo de urgencia solo hace que vivamos agotados y reactivos.\n\nPero el salmista nos enseña una postura del corazón completamente diferente: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él."\n\nDespertar hoy con aire en tus pulmones no es una coincidencia ni una rutina casual; es una muestra fresca de la misericordia de Dios para contigo. Sus bondades son nuevas cada mañana.\n\nCuando decides empezar tu jornada dando gracias antes de quejarte, tu perspectiva cambia por completo. Los problemas no desaparecen mágicamente, pero tu espíritu se llena de la fuerza y la esperanza necesarias para afrontarlos con victoria.\n\nHoy no permitas que las prisas te roben el gozo de vivir este día de la mano de tu Creador. Camina con la seguridad de que Dios va delante de ti abriendo bendición en cada paso.',
    paso_practico:
      'Antes de iniciar tus labores, respira hondo y dile a Dios 3 cosas sencillas por las que estás sinceramente agradecido en este nuevo amanecer.',
    preguntas: [
      '¿Con qué actitud sueles comenzar tus mañanas: con preocupación o con alabanza y fe?',
      '¿Qué bendición cotidiana estás dando por sentada y que hoy merece una oración de agradecimiento?',
    ],
    oracion:
      'Señor Jesús, gracias por el regalo de este nuevo día. Gracias por la vida, por tu amor incondicional y por tus nuevas misericordias sobre mí.\n\nConsagro a ti cada hora de esta jornada: mis palabras, mis pensamientos y mis decisiones. Ayúdame a ser de bendición para quienes me rodean y a mantener un corazón agradecido en todo momento.\n\nVoy adelante confiado porque sé que tú estás conmigo. En el nombre de Jesús, amén.',
  },
  {
    id: 'semilla-diario-2',
    tema: 'diario',
    titulo: 'Sabiduría para tus decisiones: La dirección que calma el camino',
    referencia_biblica: 'Santiago 1:5',
    predicacion:
      'Todos los días nos encontramos frente a encrucijadas.\n\nDesde decisiones pequeñas en nuestra rutina hasta elecciones trascendentales sobre el trabajo, la familia, una propuesta o una relación. Muchas veces nos paraliza el miedo a equivocarnos o consultamos a tantas personas que terminamos más confundidos que al inicio.\n\nEl apóstol Santiago nos da una invitación hermosa y llena de generosidad: "Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada."\n\nDios no se molesta cuando le dices que no sabes qué hacer. Al contrario, le agrada que reconozcas tu necesidad de su guía.\n\nLa sabiduría de Dios no se basa en adivinar el futuro, sino en tener claridad espiritual para actuar con rectitud, prudencia y paz interior. Cuando buscas la dirección del Señor en oración, Él aquieta tus emociones y te da la serenidad para discernir la mejor decisión.\n\nHoy, si te encuentras ante una duda difícil, no te apresures por la presión de los demás. Haz una pausa, busca a Dios en lo secreto y espera con fe la paz que confirma el camino correcto.',
    paso_practico:
      'Presenta en oración esa decisión puntual que debes tomar. Pídele al Señor que cierre las puertas que no te convienen y confirme con paz la que tiene su bendición.',
    preguntas: [
      '¿Sueles tomar decisiones importantes por impulso emocional o buscando la dirección de Dios en oración?',
      '¿Estás dispuesto a aceptar la voluntad de Dios aunque sea diferente a lo que tú planeabas?',
    ],
    oracion:
      'Padre celestial, reconozco que mis pensamientos son limitados y que necesito tu sabiduría en cada paso que doy.\n\nTe presento hoy las decisiones y dilemas que tengo por delante. Alumbra mi entendimiento, quita toda confusión y dame el discernimiento para elegir lo que agrada a tu corazón.\n\nLíbrame de caminos apresurados y guía mis pies por sendas de justicia y paz. En el nombre de Jesús, amén.',
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

  // Si viene en JSON empaquetado desde Supabase o Gemini
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
    } catch (_) {
      // Dejar texto regular
    }
  }

  // Si no tenía predicación separada, usar la reflexión como el cuerpo pastoral
  if (!predicacion && reflexion) {
    predicacion = reflexion;
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

/**
 * Obtiene devocionales filtrados por tema combinados con el banco profesional.
 */
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

/**
 * Devocional aleatorio con estructura pastoral profesional.
 */
export async function obtenerDevocionalAleatorio(temaId = 'todos') {
  const lista = await obtenerDevocionalesPorTema(temaId);
  if (!lista || lista.length === 0) {
    return normalizarDevocional(BANCO_DEVOCIONALES_SEMILLA[0]);
  }
  const indiceAzar = Math.floor(Math.random() * lista.length);
  return lista[indiceAzar];
}

/**
 * Guarda un devocional en Supabase en formato completo.
 */
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
      console.warn('No se pudo guardar el devocional en Supabase:', error.message);
      return devocional;
    }

    return normalizarDevocional(data);
  } catch (e) {
    console.warn('Excepción guardando devocional:', e);
    return devocional;
  }
}

/**
 * Genera un devocional estilo prédica pastoral profesional con Gemini AI.
 */
/**
 * Genera un devocional nuevo y profundamente contextualizado con tono pastoral cálido y reflexivo.
 * Se utiliza cuando no hay clave de Gemini o como salvaguarda instantánea de alta calidad.
 */
export function sintetizarDevocionalContextual({ tema = 'malos_habitos', subtema = '', situacionPersonal = '' }) {
  const textoEntrada = `${subtema} ${situacionPersonal}`.toLowerCase();

  let titulo = 'Paz y dirección para tu día';
  let pasaje = 'Romanos 12:2';
  let parrafos = [
    'Cada nuevo día nos sitúa frente a una encrucijada de pensamientos, decisiones y emociones.',
    'Pensamos en las responsabilidades que nos esperan, en las conversaciones difíciles que debemos sostener, en los proyectos que todavía no despegan y en esas áreas de nuestra vida donde quisiéramos ver cambios mucho más rápidos. En medio de tantas demandas cotidianas, es muy fácil que la mente se sature de cansancio y confusión.',
    'El mundo que nos rodea nos empuja constantemente a la prisa, a la autosuficiencia y a la comparación. Nos dice que debemos tener todo resuelto por nuestra propia cuenta y que cualquier muestra de vulnerabilidad es debilidad.',
    'Por eso el apóstol Pablo nos deja en Romanos 12:2 un principio que transforma toda nuestra perspectiva: “No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento, para que comprobéis cuál sea la buena voluntad de Dios, agradable y perfecta.”',
    'Renovar el entendimiento significa apagar por un momento las voces del afán y permitir que la verdad eterna de Dios reordene nuestras prioridades. Significa recordar que tu valor no depende de cuántas cosas logres tachar hoy de tu lista, sino de la gracia del Padre que te llamó su hijo.',
    'Dios no te pide que enfrentes este día con tus solas fuerzas ni que tengas todas las respuestas claras. Lo que Él busca es un corazón sincero que se detenga a buscar su dirección antes de dar el siguiente paso.',
    'Quizás hoy tienes que tomar una decisión importante en el trabajo, en tu familia o en tu futuro personal. No te precipites por la angustia. Dale lugar a la oración en lo secreto; allí es donde Dios desarma el temor y siembra su quietud.',
    'Cuando rindes tus pensamientos ante el Señor, Él se encarga de darte sabiduría oportuna y paz duradera, esa paz que el dinero no puede comprar ni las circunstancias adversas pueden arrebatar.',
    'Hoy puedes caminar con la certeza de que no vas solo. Haz tu parte con excelencia y honestidad, pero descansa sabiendo que el cuidado de tu vida está en las manos del Dios que nunca falla.',
  ];
  let pasoPractico = 'Aparta 15 minutos hoy en un lugar tranquilo sin pantallas. Escribe en un papel las 3 decisiones o preocupaciones que más peso tienen en tu mente ahora mismo, léelas ante Dios en voz baja y dile: “Señor, no quiero decidir en mi propia prisa; guíame tú y afírmame en tu voluntad”.';
  let preg1 = '¿Qué situación o preocupación estás intentando controlar con tus solas fuerzas en lugar de entregarla con paciencia en oración?';
  let preg2 = '¿Estás permitiendo que la prisa del entorno dicte tus decisiones, o buscas la dirección apacible del Espíritu Santo?';
  let oracionEspecifica = 'Padre celestial, hoy me presento delante de ti con el corazón abierto y sin apariencias. Reconozco que muchas veces me dejo llevar por la prisa, la autosuficiencia y el ruido de este mundo, olvidando que mi vida entera descansa en tu gracia.\n\nRenueva hoy mi manera de pensar con tu santa Palabra. Quita de mi mente todo pensamiento de confusión, temor o desgaste, y alinea mis anhelos con tu voluntad buena, agradable y perfecta.\n\nDame sabiduría para cada conversación, discernimiento para cada decisión y serenidad para caminar en paz. Gracias porque tus misericordias son nuevas cada mañana y tu fidelidad me sostiene en cada paso. En el nombre de Jesús, amén.';

  // 1. Detección temática específica con desarrollo pastoral profundo
  if (textoEntrada.includes('plan') || textoEntrada.includes('futuro') || textoEntrada.includes('control') || textoEntrada.includes('decision') || textoEntrada.includes('proyecto')) {
    titulo = 'Deja todos tus planes en manos de Dios';
    pasaje = 'Proverbios 16:3';
    parrafos = [
      'Todos hacemos planes.',
      'Pensamos qué queremos conseguir este año, dónde queremos estar en unos meses, cómo mejorar nuestro trabajo, cómo cuidar a nuestra familia, qué cosas queremos comprar o qué sueños queremos alcanzar. Tener planes no está mal. De hecho, es bueno soñar, prepararnos y trabajar con diligencia.',
      'El problema aparece cuando queremos controlar cada detalle.',
      'Queremos saber con exactitud cuándo llegará la respuesta, cómo se resolverá el problema, qué va a pasar mañana y cuál será el fruto exacto de cada una de nuestras decisiones. Y cuando algo se sale de nuestro plan, nos llenamos de ansiedad, frustración y desgaste interior.',
      'Por eso Proverbios 16:3 nos da un consejo sencillo, pero inmensamente profundo: “Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.”',
      'En otras palabras: haz tus planes, trabaja por ellos con responsabilidad, pero no los cargues tú solo. No intentes ser el dueño absoluto del mañana.',
      'Hay una gran diferencia entre decirle a Dios: “Señor, bendice lo que yo ya decidí”, y decirle: “Señor, este es el deseo de mi corazón, pero si el camino que estoy tomando no es el correcto, muéstramelo con claridad”. La segunda oración requiere humildad y confianza verdadera.',
      'Quizás estás buscando un trabajo y has enviado muchas hojas de vida sin recibir respuesta aún. Quizás estás comenzando un negocio, esperando una oportunidad de estudio, tomando una decisión familiar importante o tratando de sacar adelante un proyecto que todavía no da los resultados que esperabas.',
      'Haz tu parte. Prepárate, trabaja, pregunta, aprende y corrige cuando sea necesario. Pero no olvides entregarle el proceso a Dios.',
      'Porque a veces creemos que una puerta cerrada significa que Dios no nos escuchó. Y quizá simplemente está evitando que entremos en un lugar que a largo plazo nos haría daño o nos apartaría de su propósito.',
      'También puede ocurrir que Dios no cambie inmediatamente las circunstancias externas, sino que primero transforme nuestra manera de enfrentarlas. Cuando ponemos nuestros planes en sus manos, aprendemos a decir con paz: “Señor, yo quiero esto, pero confío en ti incluso si tú tienes preparado algo diferente”.',
      'Hoy puedes llevarle a Dios tus proyectos tal como están: tus metas, tus dudas, tus sueños y también esos anhelos que todavía no le has contado a nadie. Entrégale el proceso y comienza a caminar con la seguridad de que tu destino está seguro en sus manos.',
    ];
    pasoPractico = 'Toma una hoja y escribe los planes o metas que más te generan afán en este momento. Lee Proverbios 16:3 sobre ellos y di con sinceridad: “Señor, estos son mis anhelos, pero rindo el control de los tiempos y los resultados en tus manos”. Guarda esa hoja en tu Biblia como señal de entrega.';
    preg1 = '¿Qué plan o proyecto has estado cargando sobre tus propios hombros con angustia en lugar de encomendárselo a Dios?';
    preg2 = '¿Estás dispuesto a aceptar con humildad la dirección del Señor aun cuando sus tiempos o caminos sean diferentes a lo que imaginabas?';
    oracionEspecifica = 'Señor, hoy pongo delante de ti todos mis planes, proyectos y decisiones. Tú conoces esos sueños que me entusiasman, pero también conoces las incertidumbres que a veces me quitan la paz.\n\nPerdóname por querer tener todo bajo control y por angustiarme cuando las cosas no salen en el tiempo ni de la forma en que yo esperaba. Hoy quiero entregarte mis obras de verdad; no solo para pedirte que apruebes mis ideas, sino para pedirte que alinees mi corazón con tu perfecta voluntad.\n\nSi voy por un camino equivocado, dame la humildad para detenerme. Si una puerta se cierra, ayúdame a confiar en tu protección. Y si me abres una puerta, dame sabiduría para caminar con fidelidad. Afirma mis pensamientos y enséñame a descansar en tu soberanía. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('ira') || textoEntrada.includes('enojo') || textoEntrada.includes('impacien') || textoEntrada.includes('rabia') || textoEntrada.includes('furia')) {
    titulo = 'El dominio del espíritu: Frenar el enojo antes de que lastime';
    pasaje = 'Proverbios 16:32';
    parrafos = [
      'A todos nos ha pasado sentir cómo la molestia nos hierve por dentro en cuestión de segundos.',
      'Basta una palabra hiriente en una conversación, una injusticia en el trabajo, un desacuerdo en el hogar o una mala actitud de alguien cercano para encender una chispa de enojo dentro de nuestro pecho.',
      'En ese instante crítico, nuestro primer impulso humano es atacar, levantar el tono de voz, defendernos y buscar tener la última palabra a cualquier costo. Sentimos una urgencia casi incontrolable de descargar la frustración.',
      'El problema es que una palabra dicha con furia en cinco segundos tiene el poder destructor de quebrar una confianza que costó años construir. El enojo descontrolado deja cicatrices profundas en el corazón de las personas que más decimos amar.',
      'El mundo muchas veces confunde el mal genio con fortaleza de carácter y aplaude las reacciones explosivas. Pero la Palabra de Dios nos enseña un principio radicalmente diferente en Proverbios 16:32: “Mejor es el que tarda en airarse que el fuerte; y el que se enseñorea de su espíritu, que el que toma una ciudad.”',
      'El verdadero poder espiritual no consiste en imponerse con gritos ni en ganar una discusión acalorada; consiste en tener dominio propio cuando tienes todos los motivos humanos para perder la compostura.',
      'Jesús fue provocado, escarnecido, acusado con falsedad e insultado sin piedad, y aun así eligió responder con serenidad, verdad y silencio santo. El dominio propio no es debilidad ni cobardía; es la fuerza todopoderosa de Dios gobernando las emociones humanas.',
      'El enojo acumulado es como tomar veneno esperando que el otro sufra el daño. Te desgasta el cuerpo, te roba la comunión con el Padre y abre puertas a la amargura y la división.',
      'Hoy, cuando sientas que la impaciencia o la molestia tocan a la puerta de tu corazón, haz una pausa sagrada. Respira hondo, guarda silencio dos minutos y permite que la mansedumbre de Cristo hable y actúe por ti.',
    ];
    pasoPractico = 'Pon en práctica la regla de la pausa sagrada hoy: si enfrentas una provocación o discusión tensa, no respondas de inmediato. Haz una pausa de 60 segundos, ora en silencio pidiéndole mansedumbre al Espíritu Santo y responde con calma o retírate hasta que puedas hablar con paz.';
    preg1 = '¿Qué actitudes o personas suelen detonar con mayor facilidad tu enojo e impaciencia en la rutina diaria?';
    preg2 = '¿Sueles justificar tus explosiones diciendo "así es mi temperamento", o estás permitiendo que el fruto del Espíritu Santo transforme tus respuestas?';
    oracionEspecifica = 'Señor Jesús, Príncipe de Paz, vengo ante ti con total sinceridad reconociendo mi debilidad para frenar el enojo, la impaciencia y las respuestas apresuradas. Rindo en tu altar mi orgullo y la necesidad de tener siempre la última palabra.\n\nSana las áreas sensibles de mi corazón que reaccionan con defensiva o irritación. Llena mi interior con tu fruto de templanza, paciencia y mansedumbre, para que de mi boca solo salgan palabras que traigan edificación, gracia y paz a los que me escuchan.\n\nPon una guardia en mis labios y una calma sobrenatural en mi espíritu en este día. Que otros puedan ver el amor de Cristo a través de mis reacciones. En tu santo nombre, amén.';
  } else if (textoEntrada.includes('pereza') || textoEntrada.includes('procrastina') || textoEntrada.includes('posponer') || textoEntrada.includes('posterga') || textoEntrada.includes('animo')) {
    titulo = 'De la postergación a la diligencia: Vencer la pereza en fe';
    pasaje = 'Proverbios 6:6-8';
    parrafos = [
      'Todos conocemos esa voz sutil que nos invita a dejar las cosas para más tarde.',
      'Nos decimos a nosotros mismos: “Mañana empiezo”, “el lunes lo retomo”, “ahora no tengo el ánimo suficiente” o “cuando esté más descansado lo haré mucho mejor”. Y casi sin darnos cuenta, los días transcurren, los compromisos se acumulan y una pesadez silenciosa se va instalando en el pecho.',
      'La pereza rara vez se presenta como un deseo abierto de no hacer nada; casi siempre se disfraza de cansancio justificado o de espera del “momento ideal”. Pero buscar el alivio momentáneo de posponer lo que cuesta esfuerzo termina cobrando una factura muy cara: estrés de última hora, metas rotas y un sentimiento constante de frustración personal.',
      'El sabio Salomón nos da un consejo de sabiduría práctica que conserva toda su frescura en Proverbios 6:6-8: “Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán, ni gobernador, ni señor, prepara en el verano su comida, y recoge en el tiempo de la siega su mantenimiento.”',
      'La hormiga no espera a sentir ganas emocionales para actuar ni necesita que alguien esté detrás vigilando sus pasos. Tiene una convicción interna clara y da pasos pequeños pero ininterrumpidos cada día.',
      'En la vida cristiana, muchas veces cometemos el error de esperar “sentir ganas” para orar, para estudiar la Biblia, para cumplir con el trabajo o para ordenar nuestras responsabilidades. Pero la disciplina espiritual no nace de las emociones pasajeras, sino de la obediencia fiel.',
      'Dios no te está pidiendo que soluciones toda tu vida en una sola tarde ni que logres metas inalcanzables de golpe. Lo que te pide es fidelidad en el paso que te corresponde dar hoy: levantarte a tiempo, cumplir tu palabra, honrar tu trabajo y retomar con constancia lo que dejaste a medias.',
      'Cuando vences la pereza y decides actuar en obediencia, descubres una verdad liberadora: la motivación muchas veces no llega antes de empezar, sino que aparece mientras estás en movimiento con la ayuda de Dios.',
      'Hoy rompe con el ciclo de la postergación. Da el primer paso con fe y verás cómo el Señor renueva tus fuerzas a lo largo del camino.',
    ];
    pasoPractico = 'Identifica esa responsabilidad, estudio o hábito que llevas postergando más de una semana. Apaga las distracciones por 30 minutos continuos y avanza en ella hoy mismo sin excusas, dando gracias a Dios por la capacidad y la energía que te regala.';
    preg1 = '¿Qué área concreta de tu vida personal, laboral o espiritual has estado descuidando con la excusa de "mañana lo hago"?';
    preg2 = '¿Estás esperando a sentir ganas emocionales para actuar, o estás dispuesto a dar hoy un paso de disciplina guiado por la fe?';
    oracionEspecifica = 'Padre celestial, reconozco delante de ti que muchas veces he cedido a la comodidad, a la pereza y al engaño de postergar lo que sé que debo hacer. Te pido perdón por los momentos en que he malgastado el tiempo valioso que tú me has concedido.\n\nHoy te pido que despiertes en mi corazón un espíritu diligente, ordenado y lleno de dominio propio. Quita de mí la pesadez, la dejadez y la apatía, y renueva mis fuerzas para servirte y trabajar con alegría y excelencia.\n\nQue en cada tarea grande o pequeña que realice hoy pueda glorificar tu nombre y ser de testimonio para quienes me rodean. Fortalece mis manos y guía mis pasos. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('ansiedad') || textoEntrada.includes('afan') || textoEntrada.includes('preocupa') || textoEntrada.includes('insomnio') || textoEntrada.includes('miedo') || textoEntrada.includes('panico')) {
    titulo = 'La paz que cuida tu corazón: Calma para la mente abrumada';
    pasaje = 'Filipenses 4:6-7';
    parrafos = [
      'La ansiedad tiene una manera muy silenciosa pero destructiva de robarnos la vida.',
      'Nos despierta a las tres de la mañana con pensamientos acelerados, nos hace imaginar los peores escenarios posibles sobre lo que podría pasar mañana, y nos llena el pecho de una opresión constante que no se calma con solo descansar unas horas.',
      'Vivimos en un mundo que normaliza el afán y la sobrecarga mental. Nos bombardean con noticias alarmistas, exigencias inmediatas y la presión constante de tener que resolverlo todo antes de que caiga la noche.',
      'Pero el apóstol Pablo, escribiendo estas palabras no desde un palacio cómodo sino desde una prisión romana con cadenas en sus manos, nos deja el antídoto divino en Filipenses 4:6-7: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”',
      'Observa con atención la enseñanza: Pablo no dice que la paz llega cuando desaparecen todos los problemas exteriores. Dice que la paz de Dios es un don sobrenatural que cuida tu mente en medio de las tormentas.',
      'En el idioma original, la palabra “guardará” hace referencia a un destacamento de soldados centinelas apostados a la entrada de una fortaleza para impedir que el enemigo entre. Eso es exactamente lo que hace la paz de Dios: se planta a la puerta de tus pensamientos para evitar que el pánico, el desánimo y la angustia tomen el control de tu vida.',
      'El puente entre la ansiedad y esa paz inquebrantable es la oración con acción de gracias. Cuando decides dar gracias por lo que Dios ya ha hecho en tu pasado, tu mente recuerda con claridad que el mismo Dios que no te abandonó en tus momentos más oscuros de ayer tiene el poder para sostenerte hoy y cuidar de tu futuro.',
      'No guardes las cargas apretadas en el pecho como si fueras el único responsable del universo. Suelta la necesidad de saberlo todo y de resolverlo todo en este instante.',
      'Hoy Dios te invita a respirar con tranquilidad bajo la sombra de sus alas. Entrega cada preocupación en el altar de la oración y descansa en la promesa de que Él cuida fielmente de ti.',
    ];
    pasoPractico = 'Anota en una hoja tus 3 mayores temores o pensamientos ansiosos del momento. Luego, al lado de cada uno, escribe una promesa bíblica de confianza y di en voz alta: “Dios tiene cuidado de mí; elijo soltar esta carga en sus manos”. Respira hondo y da gracias por su paz.';
    preg1 = '¿Pasas más tiempo imaginando problemas sobre el futuro que orando con agradecimiento por las bendiciones de hoy?';
    preg2 = '¿Confías en que Dios ya está en el día de mañana preparando el camino, aun cuando hoy no veas cómo se resolverán las cosas?';
    oracionEspecifica = 'Padre amado, vengo a ti trayendo esta mente cansada y este corazón que a veces se llena de temor y ansiedad. Tú conoces cada pensamiento que me inquieta en la noche y cada carga que pesa sobre mis hombros.\n\nHoy decido no guardar mis angustias dentro de mí. Te las entrego una por una con acción de gracias, recordando tu fidelidad en cada etapa de mi vida. Perdóname por dudar de tu cuidado y por intentar cargar con el peso del mañana.\n\nRecibo tu paz, esa paz que sobrepasa todo entendimiento humano. Haz que sea un centinela que guarde mi mente y mis emociones en Cristo Jesús. Me acuesto y me levanto en quietud, porque solo tú, Señor, me haces vivir confiado. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('soledad') || textoEntrada.includes('trist') || textoEntrada.includes('llor') || textoEntrada.includes('depre') || textoEntrada.includes('dolor') || textoEntrada.includes('vacio')) {
    titulo = 'Cerca de ti en medio de la tristeza: Consuelo para el alma herida';
    pasaje = 'Salmos 34:18';
    parrafos = [
      'Hay momentos en la vida donde el dolor es tan íntimo y pesado que resulta casi imposible expresarlo con palabras.',
      'Podemos estar rodeados de compañeros en el trabajo, de amigos o de familiares, y aun así sentir un profundo vacío en el pecho, preguntándonos si alguna persona en la tierra realmente entiende la batalla y la soledad que estamos atravesando por dentro.',
      'A veces la religiosidad nos hace creer erróneamente que un creyente nunca debe sentirse triste o que llorar es falta de fe. Pero las Escrituras nos muestran a Jesús llorando ante la tumba de Lázaro y a hombres de Dios como David derramando lágrimas noche tras noche en su lecho.',
      'Dios no te juzga por sentirte triste ni te exige que finjas una sonrisa forzada delante de Él. La ternura del corazón de Dios se revela de manera entrañable en Salmos 34:18: “Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.”',
      'Fíjate bien: el versículo no dice que Dios está cerca únicamente de los que cantan alegres o de los que tienen victorias visibles. Dice que está más cerca que nunca de quien tiene el corazón hecho pedazos.',
      'El Señor recoge cada una de tus lágrimas y no hay una sola herida de tu alma que pase desapercibida para sus ojos de compasión. En los momentos donde las fuerzas humanas se agotan, su presencia silenciosa es el refugio más seguro que puedes encontrar.',
      'La tristeza que sientes hoy no tiene la última palabra sobre tu historia. Es solo una noche oscura en el camino, pero la Palabra de Dios promete que el llanto puede durar una noche, mas a la mañana vendrá la alegría.',
      'No te aísles en el dolor ni permitas que el desánimo te convenza de que todo está perdido. Permite que el bálsamo sanador de Cristo toque esas heridas profundas que nadie más ha podido sanar.',
      'Hoy no estás solo ni abandonado a tu suerte. El Consolador divino camina contigo, sosteniéndote con su mano fuerte y renovando tu esperanza.',
    ];
    pasoPractico = 'Lee despacio el Salmo 23 y el Salmo 34 en voz baja hoy en un momento de soledad. Habla con Dios con total honestidad sobre cómo te sientes, sin miedo a desahogarte; Él escucha con amor cada palabra de tu corazón.';
    preg1 = '¿Le has abierto con completa transparencia tu dolor a Dios en oración, o has estado intentando disimularlo ante los demás y ante ti mismo?';
    preg2 = '¿Crees firmemente que el amor sanador de Jesús es suficiente para restaurar la alegría y el propósito en tu corazón?';
    oracionEspecifica = 'Señor Jesús, Consolador de los afligidos, hoy vengo ante ti tal como estoy, con mis lágrimas, mi tristeza y el cansancio de mi alma. Tú conoces las heridas que nadie más ve y el vacío que a veces pesa en mi pecho.\n\nGracias porque no me rechazas en mi dolor, sino que te acercas a abrazar mi corazón quebrantado. Rindo ante ti mis pérdidas, mis desilusiones y mi soledad. Lléname de tu presencia apacible y recuérdame que nunca me dejarás ni me desampararás.\n\nSana las heridas de mi pasado, restaura mi gozo y sé mi fortaleza en este día. Espero en tu luz y en tu amor fiel que nunca se agota. En tu santo nombre, amén.';
  } else if (textoEntrada.includes('dinero') || textoEntrada.includes('finanza') || textoEntrada.includes('deuda') || textoEntrada.includes('escasez') || textoEntrada.includes('econom') || textoEntrada.includes('sueldo')) {
    titulo = 'Dios es tu fiel proveedor en la necesidad';
    pasaje = 'Filipenses 4:19';
    parrafos = [
      'Las preocupaciones económicas son una de las pruebas que más fácilmente roban el sueño y generan tensión en el corazón.',
      'Miramos las cuentas por pagar, calculamos el presupuesto, enfrentamos gastos imprevistos y vemos que los números parecen no cuadrar. Es en esos momentos cuando la incertidumbre financiera intenta hacernos dudar de la fidelidad de Dios.',
      'Es completamente natural sentir la responsabilidad de trabajar y proveer para nosotros y para nuestra familia. De hecho, la Biblia elogia al trabajador diligente y nos anima a administrar con sabiduría e integridad cada recurso.',
      'El peligro espiritual surge cuando ponemos nuestra confianza y nuestra seguridad en el dinero o en las circunstancias del mercado, olvidando quién es la verdadera fuente inagotable de nuestra vida.',
      'El apóstol Pablo nos recuerda con autoridad en Filipenses 4:19: “Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.”',
      'Nota la riqueza de esta promesa: no dice que Dios suplirá según la escasez de la economía terrenal, sino “conforme a sus riquezas en gloria”. El Dios que viste con hermosura a los lirios del campo y alimenta a las aves del cielo conoce cada una de tus necesidades materiales antes de que tú las pongas en oración.',
      'A veces Dios permite temporadas de escasez o de espera para enseñarnos a depender de Él, para purificar nuestro corazón del apego material y para mostrarnos milagros sobrenaturales de provisión que nunca habríamos visto en la comodidad.',
      'Trabaja con honestidad, administra con prudencia y evita las deudas innecesarias, pero suelta la angustia que paraliza. Dios nunca ha dejado desamparado a ninguno de sus hijos ni a su descendencia que mendigue pan.',
      'Hoy declara tu confianza en Jehová Jireh, el Dios que provee oportunamente para todas tus necesidades.',
    ];
    pasoPractico = 'Haz una pausa en tus cálculos financieros hoy para agradecer a Dios por el pan que tienes en la mesa y por cada provisión del pasado. Pídele en oración sabiduría práctica para administrar tus ingresos y suelta la angustia en sus manos.';
    preg1 = '¿Estás midiendo tu paz y seguridad por el saldo de tus recursos terrenales o por la fidelidad permanente del Dios proveedor?';
    preg2 = '¿Has buscado la dirección y bendición de Dios en tus decisiones financieras con oración y generosidad?';
    oracionEspecifica = 'Padre proveedor, tú eres el dueño del oro, de la plata y de todo lo creado. Conoces al detalle cada una de mis obligaciones, mis deudas, mis necesidades de sustento y las preocupaciones de mi hogar.\n\nHoy renuncio a la angustia y al miedo a la escasez. Confío plenamente en que tú suplirás todo lo que me falta conforme a tus inagotables riquezas en gloria en Cristo Jesús.\n\nDame sabiduría para administrar con justicia, prudencia y honradez los recursos que pones en mis manos. Bendice mi trabajo, abre puertas de oportunidad y enséñame a descansar en tu fidelidad en todo tiempo. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('familia') || textoEntrada.includes('matrimonio') || textoEntrada.includes('hijo') || textoEntrada.includes('hogar') || textoEntrada.includes('espos') || textoEntrada.includes('padre')) {
    titulo = 'Paz, paciencia y perdón en el hogar';
    pasaje = 'Colosenses 3:12-14';
    parrafos = [
      'El hogar fue diseñado por Dios para ser un refugio de paz, seguridad y amor incondicional.',
      'Sin embargo, con frecuencia se convierte en el lugar donde más fácilmente se manifiestan las tensiones, los desacuerdos y los roces de convivencia.',
      'El cansancio del trabajo, las presiones económicas y las diferencias de carácter pueden abrir brechas de frialdad, distancia y amargura entre las personas que más amamos en esta tierra.',
      'Muchas veces guardamos resentimiento por palabras dichas sin pensar, y esperamos con orgullo que sea la otra persona quien venga a pedir disculpas primero, levantando muros invisibles dentro de la misma casa.',
      'El apóstol Pablo nos muestra la senda bíblica para la restauración familiar en Colosenses 3:12-14: “Vestíos, pues, como escogidos de Dios, santos y amados, de entrañable misericordia, de benignidad, de humildad, de mansedumbre, de paciencia; soportándoos unos a otros, y perdonándoos unos a otros si alguno tuviere queja contra otro. De la manera que Cristo os perdonó, así también hacedlo vosotros.”',
      'El perdón dentro de la familia no es un signo de debilidad ni significa justificar las faltas del otro; es la decisión valiente y sabia de no permitir que el rencor contamine y destruya lo más sagrado que Dios te ha confiado.',
      'No podemos cambiar el corazón de los demás con reclamos amargos ni con discusiones continuas. El cambio duradero casi siempre comienza cuando nosotros decidimos responder con gracia, bondad y mansedumbre.',
      'Hoy Dios te invita a derribar la barrera del orgullo en tu casa. Sé tú el primero en abrazar, el primero en escuchar con paciencia y el primero en sembrar palabras de bendición.',
      'Cuando Jesús es el centro de un hogar, los momentos difíciles no dividen, sino que se convierten en oportunidades para fortalecer los lazos en el amor inquebrantable de Dios.',
    ];
    pasoPractico = 'Haz hoy un gesto intencional de amor y reconciliación en tu hogar: pronuncia una palabra sincera de aprecio a tu cónyuge, hijo o familiar, o pide perdón con sencillez si hubo tensión recientemente, sembrando paz en tu casa.';
    preg1 = '¿Estás esperando con orgullo a que los demás cambien primero en lugar de dar tú el primer paso de humildad y amor?';
    preg2 = '¿Qué actitudes o palabras estás trayendo a tu hogar que generan distancia en lugar de edificar a tu familia?';
    oracionEspecifica = 'Señor Jesús, hoy te entrego mi hogar, mi matrimonio y mi familia. Te pido perdón por las ocasiones en que he respondido con impaciencia, dureza o resentimiento hacia las personas que tú pusiste a mi lado.\n\nViste nuestro hogar de entrañable misericordia, de perdón genuino y de amor sincero. Sana las heridas causadas por discusiones pasadas y aleja de nuestra casa todo espíritu de contienda y división.\n\nHaz de nuestro hogar un remanso de paz y un lugar donde tu presencia more continuamente. Ayúdame a ser un instrumento de reconciliación y bendición para los míos cada día. En tu nombre, amén.';
  } else if (textoEntrada.includes('fe') || textoEntrada.includes('duda') || textoEntrada.includes('insegur') || textoEntrada.includes('desierto') || textoEntrada.includes('prueba') || textoEntrada.includes('firme')) {
    titulo = 'Caminar por fe cuando no ves el camino';
    pasaje = 'Hebreos 11:1';
    parrafos = [
      'A todos nos cuesta caminar cuando el camino que tenemos delante se encuentra cubierto de niebla densa.',
      'Queremos tener todas las garantías firmadas, ver el desenlace completo antes de dar el primer paso y asegurarnos de que no habrá desvíos dolorosos ni pérdidas en el trayecto.',
      'Y cuando las oraciones parecen no recibir respuesta inmediata y los días pasan sin que veamos cambios palpables a nuestro alrededor, la duda comienza a sembrar susurros de desánimo en nuestro corazón.',
      'Pero la Biblia nos enseña que la fe cristiana no se sostiene en certezas humanas ni en lo que nuestros ojos físicos pueden ver, sino en las promesas firmes del Dios que nunca miente.',
      'Hebreos 11:1 lo define con una belleza insuperable: “Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.”',
      'Abraham salió de su tierra sin saber con exactitud hacia dónde iba, pero sabiendo perfectamente con Quién caminaba. Dios no suele mostrarnos toda la carretera iluminada de antemano; nos entrega su Palabra como una lámpara que alumbra el paso justo que debemos dar hoy.',
      'El silencio aparente de Dios no es ausencia ni olvido. En las temporadas de desierto, cuando parece que nada se mueve en la superficie, Dios está trabajando en lo profundo: formando tu carácter, podando lo innecesario y fortaleciendo tus raíces espirituales para sostener las bendiciones venideras.',
      'No midas el poder de Dios por el tamaño temporal de tus dificultades. Tu Dios es más grande que cualquier tormenta y su fidelidad no caduca con el paso de los años.',
      'Hoy no necesitas tener todas las respuestas claras. Solo necesitas poner tu mano en la mano del Padre y dar el paso de fidelidad y obediencia que te corresponde hoy.',
    ];
    pasoPractico = 'Escribe en una libreta una dificultad que hoy ponga a prueba tu fe. Al lado escribe: “No sé cómo lo harás, Señor, pero elijo creer en tu palabra y en tu fidelidad”. Léelo en voz alta cada vez que la duda intente inquietarte hoy.';
    preg1 = '¿Estás juzgando la fidelidad de Dios según la velocidad de tus resultados inmediatos o según sus promesas eternas?';
    preg2 = '¿Qué paso concreto de fe u obediencia sabes que debes dar hoy a pesar de los temores e incertidumbres?';
    oracionEspecifica = 'Padre celestial, hoy me presento delante de ti reconociendo que a veces mi fe flaquea cuando las circunstancias son adversas y no entiendo el camino por donde me conduces.\n\nAumenta mi fe en este día. Enséñame a no caminar por vista ni por emociones cambiantes, sino por la convicción inamovible de tu verdad. Aunque hoy no vea cómo se resolverán las cosas, elijo confiar en que tú eres bueno y que nunca me dejarás caer.\n\nPongo en tus manos mi futuro, mis anhelos y mis temores. Sostenme con tu diestra justa y ayúdame a permanecer firme en la esperanza viva de tu Palabra. En el nombre de Jesús, amén.';
  }

  // 2. Personalización profunda si el usuario redactó su situación particular
  if (situacionPersonal && situacionPersonal.trim().length > 3) {
    const textoLimpio = situacionPersonal.trim();
    parrafos.splice(
      3,
      0,
      `Hoy traes ante el Señor una carga muy concreta que pesa en lo íntimo de tu corazón: “${textoLimpio}”.\n\nEn momentos así, es totalmente comprensible sentir momentos de cansancio, incertidumbre o preguntarse por qué las cosas no se resuelven más rápido. Sin embargo, quiero recordarte con amor pastoral que Dios no es ajeno a lo que estás viviendo. Él conoce cada detalle, cada noche de insomnio y cada lágrima silenciosa que has derramado por esta situación.\n\nNo estás solo peleando esta batalla. El Dios todopoderoso está obrando a tu favor incluso en los días donde parece que nada cambia. Cuando le entregas esto en oración sincera, Él toma tu debilidad y la transforma en testimonio de su gracia.`
    );
    oracionEspecifica = `Señor Jesús, hoy vengo delante de ti con el corazón enteramente transparente. Pongo en tus manos amorosas esta situación tan particular que estoy viviendo: “${textoLimpio}”.\n\nTú conoces lo que siento, mis preocupaciones, mis miedos y también mis mayores anhelos respecto a esto. Perdóname por llenarme de afán y por intentar resolver en mis limitadas fuerzas lo que solo tú puedes transformar.\n\nDame sabiduría celestial para tomar las decisiones correctas, templanza para no desesperar y una fe inquebrantable para ver tu gloria obrando en mi vida. Declaro que en medio de esta circunstancia tú eres mi paz, mi refugio y mi pronto auxilio. Descanso seguro en tus brazos de amor. En el nombre de Jesús, amén.`;
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

/**
 * Genera un devocional con tono pastoral cálido y reflexivo usando Gemini AI
 * o el sintetizador contextual cuando no hay clave.
 */
export async function generarDevocionalConIA({ tema = 'malos_habitos', subtema = '', situacionPersonal = '' }) {
  const apiKey = await obtenerApiKeyGemini();

  // Si hay clave de Gemini disponible, intentamos la llamada en vivo a la IA
  if (apiKey) {
    const promptInstrucciones = `
Eres un consejero espiritual y pastor cristiano evangélico con una profunda sensibilidad pastoral, fundamentado exclusivamente en la Santa Biblia (versión Reina-Valera 1960).
Tu propósito es escribir un devocional diario EXTENSO, PROFUNDO, CÁLIDO, INSPIRADOR y altamente detallado (similar al devocional clásico de Proverbios 16:3 "Deja todos tus planes en manos de Dios", Nuestro Pan Diario o los mejores planes devocionales de YouVersion).

SOLICITUD DEL CREYENTE:
- Categoría: ${tema === 'malos_habitos' ? 'Dejar un mal hábito y dominio propio' : tema === 'fortalecer_fe' ? 'Fortalecer la fe y confianza en Dios' : tema === 'paz_ansiedad' ? 'Paz interior, calma y soltar la ansiedad' : 'Devocional diario para el crecimiento espiritual'}
${subtema ? `- Enfoque específico seleccionado: "${subtema}"` : ''}
${situacionPersonal ? `- Situación personal exacta que vive el creyente: "${situacionPersonal}"` : ''}

REGLAS DE EXTENSIÓN Y ESTILO PASTORAL (ESTRICTAMENTE OBLIGATORIO):
1. NO HAGAS UN DEVOCIONAL CORTO: La reflexión pastoral ("predicacion") DEBE TENER ENTRE 8 Y 14 PÁRRAFOS BIEN DESARROLLADOS (cada párrafo de 2 a 4 oraciones bien construidas). No resumas en 3 párrafos escuetos. Desarrolla la enseñanza a fondo.
2. ESTRUCTURA NARRATIVA Y PASTORAL CÁLIDA:
   - Inicia conectando con una experiencia o dilema humano real y relatable (el trabajo, el insomnio, enviar hojas de vida, la familia, decisiones difíciles, el anhelo de control).
   - Muestra dónde surge el conflicto interior, el miedo o la tentación.
   - Explica el pasaje bíblico con riqueza: qué nos enseña Dios a través de ese versículo, cuál es el trasfondo espiritual y qué significa aplicarlo con el corazón.
   - Brinda analogías cotidianas y ejemplos concretos de la vida real (ej. emprender un negocio, puertas cerradas que son protección divina, soltar expectativas, aprender a esperar).
   - Termina con una conclusión inspiradora que afirme la paz y soberanía de Dios.
3. PROHIBIDO USAR NÚMEROS ROMANOS O ESQUEMAS ACADÉMICOS: NO uses "I.", "II.", "III." ni subtítulos rígidos. Debe fluir como un mensaje de fe continuo, cercano y envolvente.
4. INTEGRACIÓN DE LA SITUACIÓN PERSONAL: Si el creyente especificó su situación ("${situacionPersonal || ''}"), abórdala directamente con consuelo bíblico y consejos prácticos dentro de la reflexión y en la oración.
5. ORACIÓN ESPECIAL AMPLIA: La oración ("oracion") debe ser de al menos 2 a 3 párrafos sinceros, íntimos y vulnerables en primera persona con Dios.

ESTRUCTURA JSON OBLIGATORIA (Responde ÚNICAMENTE en JSON válido sin formato markdown extra):
{
  "titulo": "Título inspirador y directo (máximo 8 palabras)",
  "referencia_biblica": "Cita bíblica exacta con Libro Capítulo:Versículo de la RV1960",
  "predicacion": "Reflexión profunda y extensa de 8 a 14 párrafos (separados por doble salto de línea \\n\\n). Cálida, bíblica y sin números romanos.",
  "paso_practico": "Un paso de fe o ejercicio práctico muy concreto y detallado para poner en práctica hoy.",
  "preguntas": [
    "Pregunta de autoexamen espiritual profunda y amorosa 1",
    "Pregunta de autoexamen espiritual profunda y amorosa 2"
  ],
  "oracion": "Oración especial sincera y vulnerable en primera persona (mínimo 2-3 párrafos de oración profunda).",
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
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/i, '')
              .replace(/\s*```$/i, '');

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

  // Si no hay clave de Gemini o la llamada falló, sintetizamos un devocional 100% personalizado profundo
  const devocionalGenerado = sintetizarDevocionalContextual({ tema, subtema, situacionPersonal });
  guardarDevocionalEnSupabase(devocionalGenerado).catch(() => {});
  return normalizarDevocional(devocionalGenerado);
}
