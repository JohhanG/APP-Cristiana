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
    'Cada día nos presenta nuevos retos, decisiones y momentos que ponen a prueba nuestra tranquilidad.',
    'A veces sentimos que las responsabilidades nos superan o que llevamos demasiado tiempo esperando un cambio. En esos instantes, es fácil que la mente se llene de dudas y desgaste.',
    'Romanos 12:2 nos da un recordatorio lleno de esperanza: “Transformaos por medio de la renovación de vuestro entendimiento, para que comprobéis cuál sea la buena voluntad de Dios, agradable y perfecta.”',
    'Cuando le abres tu corazón a Dios en oración sincera, Él aquieta tus emociones y alinea tus pensamientos con su paz. No tienes que enfrentar este día con tus solas fuerzas.',
    'Haz lo que esté en tus manos con fidelidad, pero descansa sabiendo que Dios cuida de ti en cada paso.',
  ];
  let pasoPractico = 'Aparta 10 minutos de silencio hoy. Escribe lo que más te preocupa en una libreta y dile a Dios: “Señor, esto está en tus manos; yo elijo caminar en tu paz”.';
  let preg1 = '¿Qué situación estás intentando resolver con tus solas fuerzas en lugar de entregarla en oración?';
  let preg2 = '¿Confías en que la voluntad de Dios para tu vida es buena, agradable y perfecta?';
  let oracionEspecifica = 'Padre celestial, hoy vengo ante ti buscando tu dirección y tu paz. Renuevo mis pensamientos en tu Palabra y pongo en tus manos cada una de mis preocupaciones. Guía mis decisiones y acompáñame en cada momento de este día. En el nombre de Jesús, amén.';

  // 1. Detección temática específica
  if (textoEntrada.includes('plan') || textoEntrada.includes('futuro') || textoEntrada.includes('control') || textoEntrada.includes('decision') || textoEntrada.includes('proyecto')) {
    titulo = 'Deja todos tus planes en manos de Dios';
    pasaje = 'Proverbios 16:3';
    parrafos = [
      'Todos hacemos planes para el futuro: metas en el trabajo, anhelos familiares, proyectos personales y sueños que deseamos alcanzar. Tener planes es bueno y necesario.',
      'El problema aparece cuando queremos controlar cada resultado y nos angustiamos si algo no sale exactamente como esperábamos.',
      'Por eso Proverbios 16:3 nos da un consejo sabio y reconfortante: “Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.”',
      'Encomendar significa soltar el control y confiar en que Dios sabe mejor que nosotros lo que realmente nos conviene. Cuando le entregas tus planes, Él te da claridad, alinea tu corazón y te llena de paz.',
      'Haz lo que esté a tu alcance con diligencia, pero descansa sabiendo que el resultado final está seguro en las manos de Dios.',
    ];
    pasoPractico = 'Anota los planes que más te inquietan hoy y dile a Dios en oración: “Señor, estos son mis anhelos, pero confío más en tus tiempos que en mi propio afán”.';
    preg1 = '¿Qué plan o decisión estás intentando controlar por ti mismo en lugar de encomendárselo a Dios?';
    preg2 = '¿Confías en que los tiempos de Dios son mejores que los tuyos?';
    oracionEspecifica = 'Señor, pongo en tus manos todos mis planes, proyectos y decisiones. Perdóname por querer controlar el futuro y llenarme de ansiedad. Te entrego mis metas y mis temores; afirma mis pensamientos y ayúdame a descansar en tu perfecta voluntad. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('ira') || textoEntrada.includes('enojo') || textoEntrada.includes('impacien') || textoEntrada.includes('rabia')) {
    titulo = 'Frenar el enojo antes de que lastime';
    pasaje = 'Proverbios 16:32';
    parrafos = [
      'A todos nos ha pasado sentir cómo la molestia nos gana en cuestión de segundos ante una mala respuesta, una injusticia o una provocación inesperada.',
      'En ese instante, nuestro primer impulso humano es atacar, levantar la voz y tener la última palabra. Pero una frase dicha con furia en cinco segundos puede romper una confianza que tomó años construir.',
      'Proverbios 16:32 nos enseña una verdad contracultural: “Mejor es el que tarda en airarse que el fuerte; y el que se enseñorea de su espíritu, que el que toma una ciudad.”',
      'El verdadero poder no consiste en gritar más fuerte, sino en tener dominio propio cuando tienes todos los motivos para perder la calma. Jesús fue provocado y eligió responder con gracia y silencio.',
      'Hoy, antes de reaccionar ante una molestia, haz una pausa de calma. Permite que la mansedumbre de Cristo hable a través de ti.',
    ];
    pasoPractico = 'Si hoy enfrentas una situación tensa, aplica la regla de la pausa: no respondas de inmediato, respira hondo y ora en silencio antes de hablar.';
    preg1 = '¿Qué personas o situaciones suelen detonar con más facilidad tu impaciencia?';
    preg2 = '¿Estás justificando tu mal genio o permitiendo que el Espíritu Santo transforme tus respuestas?';
    oracionEspecifica = 'Señor Jesús, Príncipe de Paz, reconozco mi debilidad para frenar el enojo y las palabras precipitadas. Rindo mi orgullo en tu altar y te pido que llenes mi corazón de paciencia y templanza. Pon guarda a mis labios para que hoy solo salgan palabras que edifiquen. Amén.';
  } else if (textoEntrada.includes('pereza') || textoEntrada.includes('procrastina') || textoEntrada.includes('posponer') || textoEntrada.includes('posterga')) {
    titulo = 'De la postergación a la diligencia';
    pasaje = 'Proverbios 6:6-8';
    parrafos = [
      'Todos conocemos la tentación de decir: “Mañana empiezo”, “ahora no tengo ánimo” o “después lo haré mejor”.',
      'Posponer lo difícil nos da un alivio momentáneo, pero luego nos deja una pesadez silenciosa y una carga acumulada que nos roba la tranquilidad.',
      'La Biblia nos aconseja con sabiduría cotidiana: “Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual prepara en el verano su comida.”',
      'La hormiga no espera a sentir ganas ni necesita que alguien la vigile; da pasos pequeños pero constantes cada día. Dios no te pide que hagas todo de golpe, sino que seas fiel con la tarea de hoy.',
      'No esperes a tener el ánimo perfecto; actúa en obediencia hoy y verás cómo Dios renueva tus fuerzas.',
    ];
    pasoPractico = 'Identifica esa tarea o hábito que llevas postergando más de una semana. Deja el celular a un lado por 25 minutos y da el primer paso hoy mismo.';
    preg1 = '¿Qué responsabilidad estás descuidando con la excusa de "después lo hago"?';
    preg2 = '¿Estás esperando a sentir ganas para actuar o dispuesto a dar un paso de disciplina en fe?';
    oracionEspecifica = 'Padre bueno, reconozco que he cedido a la pereza y a la postergación. Te pido que despiertes en mí diligencia, disciplina y dominio propio. Ayúdame a aprovechar el tiempo y a honrarte en cada tarea que pones en mis manos. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('distra') || textoEntrada.includes('redes') || textoEntrada.includes('celular') || textoEntrada.includes('pantalla') || textoEntrada.includes('tiktok')) {
    titulo = 'Recuperar el tiempo y la calma interior';
    pasaje = 'Efesios 5:15-16';
    parrafos = [
      'Abrimos el teléfono para revisar algo rápido, y una hora después seguimos deslizando la pantalla sin rumbo.',
      'El bombardeo continuo de notificaciones fragmenta nuestra atención y nos deja cansados, vacíos y desenfocados. La tecnología no es mala, pero puede convertirse en un ladrón silencioso de nuestra devoción.',
      'Efesios 5:15-16 nos invita a vivir despiertos: “Mirad, pues, con diligencia cómo andéis, no como necios sino como sabios, aprovechando bien el tiempo.”',
      'Aprovechar el tiempo significa rescatarlo de la superficialidad para invertirlo en lo que realmente edifica: tu intimidad con Dios, tu familia y tu paz espiritual. Dios suele hablar en el susurro apacible, pero no podemos oírlo si nunca apagamos el ruido exterior.',
      'Hoy Dios te invita a cuidar tu tiempo y tu mente. No permitas que una pantalla te robe los momentos más valiosos de tu día.',
    ];
    pasoPractico = 'Haz un descanso digital hoy: apaga las notificaciones de redes durante 2 horas consecutivas. Usa los primeros 15 minutos para leer tu Biblia en soledad.';
    preg1 = '¿Es tu teléfono lo primero que buscas al despertar y lo último que ves al acostarte en lugar de la presencia de Dios?';
    preg2 = '¿Qué cosas importantes estás descuidando por pasar demasiado tiempo frente a pantallas?';
    oracionEspecifica = 'Padre celestial, te pido perdón por las horas que he malgastado en cosas pasajeras mientras he descuidado mi tiempo contigo. Limpia mi mente de distracciones y ayúdame a enfocar mi corazón en lo eterno. Rompo con el hábito de posponer mi devoción personal. En Jesús, amén.';
  } else if (textoEntrada.includes('queja') || textoEntrada.includes('murmur') || textoEntrada.includes('inconfor')) {
    titulo = 'El poder transformador de la gratitud';
    pasaje = 'Filipenses 2:14-15';
    parrafos = [
      'Quejarse parece una reacción inofensiva cuando las cosas no salen como queremos.',
      'Sin embargo, la queja constante desgasta el ánimo, nubla la visión y llena nuestro entorno de pesadez y descontento.',
      'Filipenses 2:14 nos exhorta: “Haced todo sin murmuraciones y contiendas, para que seáis irreprensibles y sencillos, hijos de Dios sin mancha.”',
      'La gratitud activa es el mayor antídoto contra la amargura. Cuando decides dar gracias por lo que Dios ya te ha dado, tu corazón se llena de paz y tu perspectiva cambia por completo.',
      'Hoy elige transformar cada queja en una oportunidad de bendecir y alabar a Dios.',
    ];
    pasoPractico = 'Cada vez que sientas el impulso de quejarte hoy, detenlo y declara en voz alta 3 bendiciones concretas por las que estás agradecido.';
    preg1 = '¿Tu lenguaje cotidiano transmite gratitud y fe o queja y desánimo?';
    preg2 = '¿Qué bendición de Dios has estado pasando por alto en estos días?';
    oracionEspecifica = 'Señor Jesús, limpia mi boca de toda queja y murmuración. Pon una guardia en mis labios y llena mi corazón de un espíritu agradecido en todo tiempo. Ayúdame a ser luz en medio de las dificultades. Amén.';
  } else if (textoEntrada.includes('impureza') || textoEntrada.includes('mente') || textoEntrada.includes('pensamien') || textoEntrada.includes('porno') || textoEntrada.includes('lujuria')) {
    titulo = 'Cuidar el altar de tus pensamientos';
    pasaje = 'Filipenses 4:8';
    parrafos = [
      'La batalla más importante de cada día se libra en el silencio de nuestros pensamientos.',
      'Lo que permitimos entrar por nuestros ojos y lo que dejamos anidar en la mente termina moldeando nuestras decisiones y afectando nuestra comunión con Dios.',
      'La Escritura nos da un filtro poderoso en Filipenses 4:8: “En todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro... en esto pensad.”',
      'Jesús no te llamó a vivir con culpa ni atrapado en hábitos ocultos; Él compró tu libertad en la cruz para darte un corazón limpio y un espíritu renovado.',
      'Hoy rinde tus pensamientos ante Dios. La luz de su verdad disipa cualquier sombra de impureza.',
    ];
    pasoPractico = 'Elimina de tus dispositivos cualquier cuenta, aplicación o contenido que represente una tentación para tus ojos y tu pureza espiritual.';
    preg1 = '¿Qué contenido estás permitiendo en tu mirada que apaga tu comunión con Dios?';
    preg2 = '¿Crees firmemente que en Cristo tienes poder y gracia para vivir en santidad?';
    oracionEspecifica = 'Crea en mí, oh Dios, un corazón limpio y renueva un espíritu recto dentro de mí. Cierra mis ojos a la vanidad y guarda mis pensamientos en tu verdad. Ayúdame a caminar en santidad y victoria cada día. En el nombre de Jesús, amén.';
  } else if (textoEntrada.includes('culpa') || textoEntrada.includes('pasado') || textoEntrada.includes('condena') || textoEntrada.includes('fallé') || textoEntrada.includes('pequé')) {
    titulo = 'Libertad y perdón: Descanso en la gracia de Dios';
    pasaje = 'Romanos 8:1';
    parrafos = [
      'El enemigo siempre intentará recordarte tus errores del pasado para hacerte sentir que Dios ya no te ama o que no mereces su favor.',
      'La culpa constante niega el poder perdonador de la cruz y nos mantiene prisioneros de lo que ya no podemos cambiar.',
      'Pero Romanos 8:1 declara con autoridad eterna: “Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús.”',
      'Cuando vienes a Dios con un corazón sincero, su perdón es total y definitivo. Dios no guarda un registro de tus caídas para avergonzarte; su gracia es infinitamente mayor que cualquier error.',
      'Hoy levanta tu cabeza y camina en la libertad que Cristo conquistó para ti.',
    ];
    pasoPractico = 'Escribe en una hoja tus errores pasados, escribe la palabra "PERDONADO EN CRISTO" en grande sobre ellos y deséchala en señal de fe.';
    preg1 = '¿Sigues castigándote por cosas que Dios ya perdonó y echó al fondo del mar?';
    preg2 = '¿Aceptas hoy por fe que la gracia de Jesús es suficiente para restaurarte?';
    oracionEspecifica = 'Padre bueno, recibo hoy tu perdón completo. Renuncio a la voz de la condenación y me refugio en la justicia de Cristo. Gracias porque en ti soy una nueva criatura. Camino en libertad y paz hoy. Amén.';
  } else if (textoEntrada.includes('trabajo') || textoEntrada.includes('abrumad') || textoEntrada.includes('estres') || textoEntrada.includes('canso') || textoEntrada.includes('agotad') || textoEntrada.includes('sobrecarga')) {
    titulo = 'Descanso para el alma cansada';
    pasaje = 'Mateo 11:28-30';
    parrafos = [
      'Hay días en que el cuerpo y las emociones se sienten al límite de su capacidad.',
      'Las exigencias laborales, las responsabilidades familiares y la presión constante por cumplir con todo pueden dejarnos profundamente agotados.',
      'Jesús mira tu fatiga y te extiende una invitación tierna y personal: “Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.”',
      'El descanso de Dios no es solo dormir unas horas; es la paz de saber que tu vida no se sostiene en tus solas fuerzas, sino en la fidelidad de un Padre que cuida de ti.',
      'Hoy suelta la carga de querer resolverlo todo tú solo. Descansa en su gracia y permite que renueve tus fuerzas.',
    ];
    pasoPractico = 'Tómate una pausa de 5 minutos al mediodía: cierra los ojos, respira despacio y dile a Jesús: “Dejo esta carga sobre tus hombros”.';
    preg1 = '¿Estás intentando sostener tu vida sobre tus propias fuerzas en lugar de apoyarte en Dios?';
    preg2 = '¿Qué carga laboral o familiar necesitas entregarle a Cristo en este día?';
    oracionEspecifica = 'Señor Jesús, me presento rendido y cansado ante ti. Tomo tu yugo que es fácil y mi alma descansa en tu paz. Renuevo mis fuerzas en tu presencia santa y confío en que tú tienes el cuidado de mi vida. Amén.';
  } else if (textoEntrada.includes('ansiedad') || textoEntrada.includes('afan') || textoEntrada.includes('preocupa') || textoEntrada.includes('insomnio') || textoEntrada.includes('miedo') || textoEntrada.includes('panico')) {
    titulo = 'La paz que sobrepasa todo entendimiento';
    pasaje = 'Filipenses 4:6-7';
    parrafos = [
      'La ansiedad tiene una forma particular de robarnos el presente imaginando los peores escenarios del futuro.',
      'Nos despierta en la madrugada con pensamientos acelerados y nos llena el pecho de una presión que parece difícil de apagar.',
      'Pero Filipenses 4:6-7 nos da una promesa inquebrantable: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones.”',
      'Cada vez que sientas que la preocupación te desborda, transfórmala en una oración de gratitud. La paz de Dios es un centinela celestial que custodia la puerta de tus pensamientos.',
      'Hoy descansa sabiendo que el Dios que cuidó de ti ayer ya está en el día de mañana preparando el camino.',
    ];
    pasoPractico = 'Anota tus 3 mayores temores de hoy y al lado escribe: "Dios tiene cuidado de mí". Ora entregándoselos uno a uno con acción de gracias.';
    preg1 = '¿Pasas más tiempo imaginando problemas del futuro que orando con gratitud por las bendiciones de hoy?';
    preg2 = '¿Confías en que Dios tiene el control aun cuando no entiendas cómo se resolverán las cosas?';
    oracionEspecifica = 'Padre celestial, expulso de mi mente todo temor y afán. Recibo tu paz que sobrepasa todo entendimiento y descanso bajo la sombra de tus alas. Guarda mis pensamientos en Cristo Jesús y renueva mi serenidad. Amén.';
  } else if (textoEntrada.includes('soledad') || textoEntrada.includes('trist') || textoEntrada.includes('llor') || textoEntrada.includes('depre') || textoEntrada.includes('dolor')) {
    titulo = 'Cerca de ti en medio de la tristeza';
    pasaje = 'Salmos 34:18';
    parrafos = [
      'Hay momentos en los que el dolor o la soledad se sienten tan profundos que cuesta ponerlos en palabras.',
      'Podemos estar rodeados de personas y aun así sentir un vacío en el pecho, preguntándonos si alguien realmente comprende lo que estamos atravesando.',
      'Salmos 34:18 nos da un consuelo entrañable: “Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.”',
      'Dios no te juzga por sentirte triste ni te exige que finjas alegría. Él se acerca con ternura a recoger cada una de tus lágrimas y a abrazar las áreas heridas de tu alma.',
      'Hoy no estás solo; la presencia reconfortante del Espíritu Santo está a tu lado para sostenerte y devolverte la esperanza.',
    ];
    pasoPractico = 'Lee el Salmo 23 completo en voz baja hoy, poniendo tu nombre en cada versículo como una promesa personal de Dios para ti.';
    preg1 = '¿Le has abierto con total sinceridad tu dolor a Dios en oración?';
    preg2 = '¿Crees que su amor es suficiente para sanar las heridas más profundas de tu corazón?';
    oracionEspecifica = 'Señor Jesús, Consolador mío, abraza mi corazón herido en este día. Quita la soledad con tu santa presencia y devuélveme el gozo de tu salvación. En ti descanso, amén.';
  } else if (textoEntrada.includes('dinero') || textoEntrada.includes('finanza') || textoEntrada.includes('deuda') || textoEntrada.includes('escasez') || textoEntrada.includes('econom')) {
    titulo = 'Dios es tu fiel proveedor';
    pasaje = 'Filipenses 4:19';
    parrafos = [
      'Las preocupaciones económicas son una de las causas más frecuentes de insomnio y tensión en el hogar.',
      'Miramos las cuentas, calculamos los gastos y nos angustiamos cuando vemos que los recursos parecen no alcanzar para lo que necesitamos.',
      'Sin embargo, Filipenses 4:19 nos recuerda la verdadera fuente de nuestro sustento: “Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.”',
      'Dios conoce tus obligaciones antes de que tú las pronuncies. Trabaja con diligencia y administra con sabiduría, pero no pongas tu seguridad en el dinero terrenal, sino en el Dios que viste los lirios del campo y alimenta a las aves.',
      'Hoy entrega tus finanzas en las manos de Dios y confía en su oportuna provisión.',
    ];
    pasoPractico = 'Haz una pausa en tus cálculos para dar gracias a Dios por el pan de hoy y pedirle sabiduría para administrar con justicia y paz.';
    preg1 = '¿Estás midiendo tu paz por el saldo de tus recursos o por la fidelidad de Dios?';
    preg2 = '¿Le has consultado a Dios tus decisiones financieras en oración?';
    oracionEspecifica = 'Padre proveedor, tú conoces cada una de mis necesidades y obligaciones. Renuncio a la angustia financiera y confío en que tú suplirás conforme a tus riquezas en gloria. Dame sabiduría para administrar bien y paz en mi corazón. Amén.';
  } else if (textoEntrada.includes('familia') || textoEntrada.includes('matrimonio') || textoEntrada.includes('hijo') || textoEntrada.includes('hogar') || textoEntrada.includes('espos')) {
    titulo = 'Paz y restauración en tu hogar';
    pasaje = 'Colosenses 3:12-14';
    parrafos = [
      'El hogar está llamado a ser un refugio de paz, pero a veces se convierte en un terreno de tensión y malos entendidos.',
      'El cansancio del día a día y las diferencias de carácter pueden abrir brechas de frialdad y rencor entre las personas que más amamos.',
      'Colosenses 3:12-13 nos enseña el camino de la sanidad: “Vestíos, pues, como escogidos de Dios... de entrañable misericordia, de benignidad, de humildad, de mansedumbre, de paciencia; soportándoos unos a otros, y perdonándoos.”',
      'El perdón dentro del hogar no es debilidad; es la decisión valiente de no permitir que la amargura destruya lo más valioso que Dios te ha confiado.',
      'Hoy da tú el primer paso de amor, comprensión y paz en tu casa.',
    ];
    pasoPractico = 'Da hoy un paso intencional de afecto en tu hogar: pronuncia una palabra sincera de aprecio o pide perdón con humildad si hubo una discusión.';
    preg1 = '¿Estás esperando que los demás cambien primero en lugar de dar tú el primer paso de amor?';
    preg2 = '¿Estás orando diariamente por la bendición y armonía de tu familia?';
    oracionEspecifica = 'Señor Jesús, bendice mi hogar y mi familia. Sana toda herida, aleja la contienda y haz de nuestra casa un altar de paz, amor y perdón en tu presencia. Amén.';
  } else if (textoEntrada.includes('fe') || textoEntrada.includes('duda') || textoEntrada.includes('insegur') || textoEntrada.includes('desierto')) {
    titulo = 'Caminar por fe cuando no ves el camino';
    pasaje = 'Hebreos 11:1';
    parrafos = [
      'A todos nos cuesta avanzar cuando el futuro parece cubierto de niebla e incertidumbre.',
      'Queremos ver el resultado completo antes de dar un paso, y cuando las respuestas tardan en llegar, la duda empieza a sembrar desánimo en nuestro corazón.',
      'Hebreos 11:1 nos define la verdadera fe: “Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.”',
      'La fe madura cuando aprendemos a confiar en la mano del Padre celestial aun cuando no entendamos el proceso. Las temporadas difíciles no vinieron a destruirte, sino a fortalecer tus raíces espirituales.',
      'Hoy no necesitas ver todo resuelto; solo necesitas dar el paso de hoy tomado de la mano de Dios.',
    ];
    pasoPractico = 'Declara en voz alta hoy: "Mi fe no depende de lo que veo, sino de las promesas del Dios fiel que me sostiene".';
    preg1 = '¿Estás juzgando el amor de Dios por las dificultades del momento presente?';
    preg2 = '¿Qué paso de obediencia necesitas dar hoy a pesar de tus dudas?';
    oracionEspecifica = 'Padre celestial, aumenta mi fe. Ayúdame a no dudar en medio de la prueba y a descansar seguro en tu perfecta fidelidad. Pongo mi futuro en tus manos, confiando en tu dirección. Amén.';
  }

  // 2. Personalización profunda si el usuario redactó su situación particular
  if (situacionPersonal && situacionPersonal.trim().length > 3) {
    const textoLimpio = situacionPersonal.trim();
    parrafos.splice(
      2,
      0,
      `Hoy traes ante el Señor una situación muy puntual que pesa en tu corazón: “${textoLimpio}”. En momentos así, es totalmente humano sentir incertidumbre o preguntarse cuándo cambiarán las cosas. Pero no tienes que cargar con todo ese peso tú solo. Dios conoce cada detalle de lo que vives y escucha cada una de tus oraciones.`
    );
    oracionEspecifica = `Señor Jesús, hoy vengo ante ti con el corazón abierto. Pongo en tus manos esta situación concreta que estoy viviendo: “${textoLimpio}”. Perdóname por llenarme de afán y por querer resolverlo todo en mis propias fuerzas.\n\nDame sabiduría para tomar buenas decisiones, serenidad para no desesperar y fe para ver tu mano obrando a mi favor. Confío en que tú tienes el control y que tus planes para mí son de bienestar y paz. En el nombre de Jesús, amén.`;
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
Tu propósito es escribir un devocional diario cálido, inspirador, empático y profundamente bíblico, con un estilo fluido y reconfortante (similar a "Nuestro Pan Diario" o los mejores planes de YouVersion).

SOLICITUD DEL CREYENTE:
- Categoría: ${tema === 'malos_habitos' ? 'Dejar un mal hábito y dominio propio' : tema === 'fortalecer_fe' ? 'Fortalecer la fe y confianza en Dios' : tema === 'paz_ansiedad' ? 'Paz interior, calma y soltar la ansiedad' : 'Devocional diario para el crecimiento espiritual'}
${subtema ? `- Enfoque específico seleccionado: "${subtema}"` : ''}
${situacionPersonal ? `- Situación personal exacta que vive el creyente: "${situacionPersonal}"` : ''}

REGLAS DE ESTILO Y REDACCIÓN (MUY IMPORTANTE):
1. TONO PASTORAL Y CERCANO: Escribe como un amigo sabio y pastor amoroso que entiende las luchas cotidianas de la vida real (trabajo, espera, familia, cansancio, decisiones).
2. PÁRRAFOS CORTOS Y FLUIDOS: Cada párrafo debe tener entre 1 y 3 oraciones. Deja espacio y aire entre párrafos con saltos de línea dobles (\\n\\n). Debe ser placentero y fácil de leer en un teléfono celular.
3. PROHIBIDO USAR NÚMEROS ROMANOS O ESQUEMAS ACADÉMICOS: NO uses "I.", "II.", "III." ni títulos fríos de sermón. La reflexión debe fluir con naturalidad: empieza con una experiencia cotidiana relatable, muestra dónde aparece la dificultad, explica la verdad del versículo con sencillez y esperanza, y concluye con una afirmación de paz y descanso en Dios.
4. INTEGRACIÓN DE LA SITUACIÓN: Si el usuario especificó una situación personal, abórdala con ternura y dale consuelo bíblico directo en la reflexión y en la oración.

ESTRUCTURA JSON OBLIGATORIA (Responde ÚNICAMENTE en JSON válido sin formato markdown extra):
{
  "titulo": "Título inspirador y directo (máximo 8 palabras, ej: 'Deja todos tus planes en manos de Dios')",
  "referencia_biblica": "Cita bíblica exacta con Libro Capítulo:Versículo de la RV1960 aplicable",
  "predicacion": "Reflexión completa en párrafos cortos (1 a 3 oraciones por párrafo) separados por saltos de línea dobles (\\n\\n). Sin números romanos ni divisiones frías. Cálida, bíblica y aplicable a la vida diaria.",
  "paso_practico": "Un paso de fe o ejercicio práctico muy concreto y amoroso para poner en práctica hoy.",
  "preguntas": [
    "Pregunta de autoexamen amorosa y profunda 1",
    "Pregunta de autoexamen amorosa y profunda 2"
  ],
  "oracion": "Oración especial sincera y vulnerable en primera persona, hablando con Dios sobre la situación y descansando en su soberanía.",
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

  // Si no hay clave de Gemini o la llamada falló, sintetizamos un devocional 100% personalizado
  const devocionalGenerado = sintetizarDevocionalContextual({ tema, subtema, situacionPersonal });
  guardarDevocionalEnSupabase(devocionalGenerado).catch(() => {});
  return normalizarDevocional(devocionalGenerado);
}
