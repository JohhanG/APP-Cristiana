import { supabase } from './supabase.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Valida si un identificador tiene formato canónico de UUID (v4).
 */
export function esUUID(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export const DURACIONES_ESTUDIO = [
  { id: 7, etiqueta: '7 días (Semanal)', badge: 'SEMANAL', icono: 'calendar-outline', color: '#2563EB' },
  { id: 15, etiqueta: '15 días (Quincenal)', badge: '15 DÍAS', icono: 'hourglass-outline', color: '#7C3AED' },
  { id: 30, etiqueta: '30 días (Mensual)', badge: 'MENSUAL', icono: 'ribbon-outline', color: '#D97706' },
];

/**
 * Normaliza y extrae las secciones de un día de estudio bíblico profesional:
 * predicación, aplicación práctica, preguntas de autoexamen y oración guiada.
 */
export function normalizarDiaEstudio(d) {
  if (!d) return null;
  let titulo = d.titulo;
  let predicacion = d.predicacion || null;
  let reflexion = d.reflexion || '';
  let aplicacion = d.aplicacion || d.paso_practico || null;
  let pregunta = d.pregunta_reflexion || null;
  let oracion = d.oracion || null;

  if (typeof reflexion === 'string' && reflexion.startsWith('{') && reflexion.endsWith('}')) {
    try {
      const parsed = JSON.parse(reflexion);
      titulo = parsed.titulo || titulo;
      predicacion = parsed.predicacion || predicacion;
      reflexion = parsed.reflexion || reflexion;
      aplicacion = parsed.aplicacion || aplicacion;
      pregunta = parsed.pregunta_reflexion || parsed.pregunta || pregunta;
      oracion = parsed.oracion || oracion;
    } catch (_) {}
  }

  if (!predicacion && reflexion) {
    predicacion = reflexion;
  }

  return {
    ...d,
    titulo,
    predicacion,
    reflexion,
    aplicacion,
    pregunta_reflexion: pregunta,
    oracion,
  };
}

/**
 * Banco de estudios bíblicos semilla estructurados con prédica profesional por cada día.
 */
export const ESTUDIOS_SEMILLA = [
  {
    id: 'semilla-estudio-7d-mateo',
    titulo: 'El Sermón del Monte: Principios del Reino',
    descripcion: 'Un recorrido cálido y práctico de 7 días por las enseñanzas maestras de Jesús en Mateo 5-7. Descubre cómo vivir con bienaventuranza, luz y confianza plena en el Padre.',
    tema: 'Vida Cristiana',
    num_dias: 7,
    portada_url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
    dias: [
      {
        numero_dia: 1,
        titulo: 'Las Bienaventuranzas: La paradoja del gozo en el Reino',
        referencia_biblica: 'Mateo 5:1-12',
        predicacion:
          'Jesús comienza su enseñanza más famosa no con una lista de reglas duras ni con exigencias religiosas, sino con una bendición para los que sienten que no pueden más.\n\nEn la lógica de este mundo, los dichosos son los autosuficientes, los que imponen su fuerza y los que aparentan tener todo bajo control. Pero en el Reino de Dios, la verdadera dicha comienza cuando reconocemos con humildad que necesitamos al Padre en cada área de nuestra vida.\n\nBienaventurados los que lloran, los humildes, los que tienen hambre de justicia. Quien reconoce su necesidad espiritual está en el lugar correcto para recibir el consuelo sobrenatural y la gracia de Dios.\n\nHoy no tienes que fingir que eres fuerte; tu mayor fortaleza comienza cuando te apoyas en el amor de Dios.',
        aplicacion: 'Comienza este estudio despojándote de la necesidad de aparentar. Reconoce ante Dios en silencio una debilidad y pídele que sea tu fortaleza hoy.',
        pregunta_reflexion: '¿En qué área de tu vida has intentado actuar en tus propias fuerzas en lugar de apoyarte con humildad en la gracia de Dios?',
        oracion: 'Padre celestial, gracias porque tu gracia me abraza en mi debilidad. Vacía mi corazón de autosuficiencia y lléname de la humildad que me hace bienaventurado en tu Reino. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 2,
        titulo: 'Sal de la tierra y luz del mundo: Tu impacto cotidiano',
        referencia_biblica: 'Mateo 5:13-16',
        predicacion:
          'La sal y la luz tienen algo en común: no existen para beneficiarse a sí mismas, sino para transformar su entorno.\n\nEn la antigüedad, la sal evitaba que los alimentos se pudrieran y aportaba sazón. Jesús te llama a ser sal no para aislarte del mundo, sino para ser una influencia de pureza, esperanza y verdad en medio de un entorno muchas veces contaminado por la queja y el desánimo.\n\nY la luz no se enciende para esconderla debajo de una mesa, sino para alumbrar el camino de los demás. Tus buenas obras y tu testimonio no son para ganar el aplauso de los hombres, sino para que quienes te rodean vean el amor del Padre.\n\nHoy tu amabilidad, tu honestidad y tu paz pueden ser la luz que alguien necesita desesperadamente ver.',
        aplicacion: 'Haz un acto intencional de bondad hoy en tu trabajo, escuela o familia: envía un mensaje de ánimo a alguien que lo necesite o ayuda sin esperar nada a cambio.',
        pregunta_reflexion: '¿Está tu vida diaria alumbrando con amor a los que te rodean, o te has dejado apagar por la rutina?',
        oracion: 'Señor Jesús, hazme hoy sal que preserve y luz que alumbre en medio de cualquier oscuridad. Que mis palabras y acciones reflejen tu amor sincero. Amén.',
      },
      {
        numero_dia: 3,
        titulo: 'La ley del corazón: Reconciliación y desarraigo del rencor',
        referencia_biblica: 'Mateo 5:21-26',
        predicacion:
          'Es fácil pensar que somos buenas personas solo porque no hemos cometido faltas graves.\n\nPero Jesús va directo al corazón: nos enseña que guardar rencor, hablar con desprecio o desear el mal a otros tiene el mismo veneno destructor. El enojo acumulado es como tomar veneno esperando que el otro se haga daño.\n\nJesús nos dice que si traemos una ofrenda a Dios y recordamos que alguien tiene algo contra nosotros, lo primero que debemos hacer es buscar la paz y reconciliarnos. Dios prefiere un corazón reconciliado antes que un acto religioso frío.\n\nPerdonar no significa que lo que pasó estuvo bien; significa que decides no dejar que el resentimiento siga envenenando tu presente ni tu futuro.\n\nHoy Dios te invita a soltar la amargura y dar el paso hacia la paz.',
        aplicacion: 'Si hay un conflicto pendiente con un familiar, amigo o compañero, da el primer paso hoy. Envía un mensaje amable o decide perdonar de corazón en oración.',
        pregunta_reflexion: '¿Hay alguna raíz de amargura o rencor que aún no le has querido entregar a Dios?',
        oracion: 'Dios de misericordia, limpia mi corazón de todo resentimiento y deseo de venganza. Dame la valentía y la mansedumbre para buscar la paz y vivir con un corazón libre. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 4,
        titulo: 'El amor contracultural: Amar y orar por los que nos ofenden',
        referencia_biblica: 'Mateo 5:43-48',
        predicacion:
          'Amar a quienes nos tratan bien y nos devuelven el cariño es algo natural que cualquiera puede hacer.\n\nPero el sello de los verdaderos hijos de Dios es amar incluso cuando no somos correspondidos, y orar por quienes nos han juzgado o lastimado injustamente.\n\nJesús nos recuerda que nuestro Padre celestial hace salir su sol sobre buenos y malos, y envía lluvia sobre justos e injustos. Su amor es generoso, paciente y no busca revancha.\n\nCuando respondes a un desaire con bendición y silencio paciente, estás rompiendo el ciclo del rencor y manifestando el carácter mismo de Cristo en la tierra.\n\nHoy no pagues mal por mal; vence el mal con el bien.',
        aplicacion: 'Ora sinceramente por aquella persona que te ha tratado con frialdad o te ha ofendido, pidiendo que la bendición y la paz de Dios alcancen su vida.',
        pregunta_reflexion: '¿Sueles reaccionar con el deseo de defenderte y pagar con la misma moneda, o buscas responder con la gracia de Cristo?',
        oracion: 'Padre amoroso, quita de mí toda amargura hacia quienes me han ofendido. Llena mi corazón de tu amor sobrenatural para bendecir y no maldecir. Que tu perdón fluya a través de mí. Amén.',
      },
      {
        numero_dia: 5,
        titulo: 'La intimidad secreta: El Padre que ve en lo secreto',
        referencia_biblica: 'Mateo 6:5-15',
        predicacion:
          'Vivimos en una época obsesionada con las apariencias y los números.\n\nQueremos que la gente vea nuestros logros y nos aplauda. Pero Jesús advierte contra la religiosidad que busca llamar la atención: quienes buscan ser admirados por los hombres ya recibieron su recompensa terrenal y efímera.\n\n“Mas tú, cuando ores, entra en tu aposento, y cerrada la puerta, ora a tu Padre que está en secreto; y tu Padre que ve en lo secreto te recompensará en público.”\n\nTu verdadera vida espiritual no se mide por lo que publicas ni por lo que dices ante los demás; se define por lo que ocurre cuando nadie más te está mirando. En ese rincón a solas, Dios escucha tus lágrimas, tus miedos y tus anhelos más profundos.\n\nHoy busca ese momento íntimo con tu Padre. Él te está esperando con amor.',
        aplicacion: 'Aparta 15 minutos hoy en total soledad, apaga el teléfono y dialoga con Dios en silencio como un hijo conversa con su padre amoroso.',
        pregunta_reflexion: '¿Es tu oración una conversación honesta y cercana con Dios, o una rutina mecánica?',
        oracion: 'Padre celestial, gracias porque me ves en lo secreto y conoces cada detalle de mi vida. Enséñame a disfrutar de tu presencia a solas y que mi mayor anhelo sea agradarte a ti. Amén.',
      },
      {
        numero_dia: 6,
        titulo: 'Basta a cada día su afán: Descanso en la provisión de Dios',
        referencia_biblica: 'Mateo 6:25-34',
        predicacion:
          'Preocuparse por el día de mañana es una de las trampas más agotadoras de la vida moderna.\n\nPasamos horas imaginando qué pasará con nuestras finanzas, nuestra salud o nuestra familia en los próximos meses o años. Pero Jesús nos recuerda algo evidente: nadie puede añadir un solo momento a su vida por mucho que se angustie.\n\nSi Dios cuida de las aves del cielo que no siembran ni cosechan, y si viste con belleza a los lirios del campo, ¿cuánto más cuidará de ti, que eres su hijo amado?\n\nEl afán por el mañana no soluciona los problemas futuros; solo vacía el presente de sus fuerzas y de su paz. Busca primero el Reino de Dios y su justicia, y todo lo demás vendrá como añadidura.\n\nHoy no cargues con la semana entera; vive el día de hoy confiando en la fidelidad de tu Padre.',
        aplicacion: 'Anota en un papel la preocupación que más te quita la paz y dile a Dios: “Señor, tú tienes el cuidado de mi mañana; yo decido descansar hoy en tu provisión”.',
        pregunta_reflexion: '¿Estás viviendo atrapado en el miedo a lo que pasará mañana en lugar de disfrutar la fidelidad de Dios hoy?',
        oracion: 'Señor todopoderoso, renuncio al afán y a la ansiedad por el futuro. Sé que tú conoces todas mis necesidades antes de que yo las pida. Descanso en tus promesas y confío en tu provisión fiel para hoy. Amén.',
      },
      {
        numero_dia: 7,
        titulo: 'Edificar sobre la Roca: La fe que resiste cualquier tormenta',
        referencia_biblica: 'Mateo 7:24-27',
        predicacion:
          'Tanto el hombre que edificó sobre la arena como el que edificó sobre la roca escucharon las mismas palabras de Jesús.\n\nLa diferencia entre ellos no fue lo que oyeron, sino lo que hicieron con lo que oyeron. Uno puso en práctica la verdad con obediencia constante, mientras que el otro solo escuchó sin cambiar su vida.\n\nJesús nos advierte con franqueza que la lluvia caerá, los ríos crecerán y los vientos soplarán sobre ambas casas. Las dificultades y las pruebas llegan a la vida de todos. Pero la casa fundada sobre la Roca de la obediencia a Cristo permanece firme y segura ante cualquier tempestad.\n\nHan pasado 7 días de estudio en el Sermón del Monte. Ahora el llamado es poner por obra cada principio en tu hogar, en tu trabajo y en tus pensamientos.\n\nCuando tu vida descansa sobre Cristo, ninguna tormenta podrá derrumbar tu paz.',
        aplicacion: 'Elige uno de los principios aprendidos en esta semana (perdón, gratitud, descanso o generosidad) y conviértelo en una práctica diaria innegociable a partir de hoy.',
        pregunta_reflexion: '¿Sobre qué base estás construyendo tus decisiones diarias: sobre las opiniones de este mundo o sobre la verdad eterna de Jesús?',
        oracion: 'Señor Jesús, Roca firme de mi vida, gracias por esta semana de estudio y edificación. Te pido que mi corazón sea obediente a tu Palabra para que mi vida permanezca inquebrantable ante cualquier viento o prueba. ¡A ti sea toda la gloria! Amén.',
      },
    ],
  },
  {
    id: 'semilla-estudio-15d-filipenses',
    titulo: 'Filipenses: Gozo inquebrantable en cualquier circunstancia',
    descripcion: 'Un plan quincenal de 15 días sobre la carta del gozo escrita por Pablo desde una prisión en Roma. Aprende el secreto del contentamiento, la fortaleza y la paz de Cristo.',
    tema: 'Gozo y Paz',
    num_dias: 15,
    portada_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    dias: [
      {
        numero_dia: 1,
        titulo: 'El que comenzó la buena obra la perfeccionará',
        referencia_biblica: 'Filipenses 1:6',
        predicacion:
          'A veces miramos nuestra vida y nos desanimamos al ver cuántas cosas todavía nos faltan por cambiar.\n\nLuchamos con debilidades, caídas y momentos de duda donde nos preguntamos si realmente estamos avanzando espiritualmente.\n\nPero Pablo nos recuerda una verdad reconfortante desde una celda: “Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.”\n\nTu crecimiento espiritual no depende únicamente de tu fuerza de voluntad; depende del compromiso inquebrantable de Dios con tu vida. Dios nunca deja proyectos a medias.\n\nHoy descansa sabiendo que el Autor de tu fe sigue moldeando tu corazón con infinita paciencia y amor.',
        aplicacion: 'Entrega a Dios esa área de tu vida en la que te sientes estancado y dile: “Señor, confío en que tú sigues trabajando en mí”.',
        pregunta_reflexion: '¿Te desanimas por tus imperfecciones o confías en la fidelidad de Dios para seguir transformándote?',
        oracion: 'Padre celestial, gracias porque no te has rendido conmigo. Confío en que la obra que comenzaste en mi corazón la llevarás a término. Dame paciencia conmigo mismo y fe para seguir creciendo de tu mano. Amén.',
      },
      {
        numero_dia: 2,
        titulo: 'El verdadero sentido de la vida: Para mí el vivir es Cristo',
        referencia_biblica: 'Filipenses 1:21',
        predicacion:
          'Todos buscamos un propósito que le dé sentido a nuestros días.\n\nMuchos ponen su razón de vivir en el éxito laboral, el dinero, el reconocimiento o las relaciones. Pero cuando alguna de esas cosas se tambalea, toda la vida parece derrumbarse.\n\nPablo escribe: “Porque para mí el vivir es Cristo, y el morir es ganancia.” Cuando Cristo es el centro de tu existencia, las circunstancias exteriores ya no tienen el poder de quitarte el gozo ni la esperanza.\n\nSi vives para Cristo, cada día de trabajo, cada prueba y cada relación cobran un valor eterno.\n\nHoy alinea tus prioridades y encuentra en Jesús tu mayor tesoro.',
        aplicacion: 'Pregúntate antes de iniciar tus labores: “¿Cómo puedo honrar a Cristo hoy en lo que voy a hacer?” y actúa en coherencia.',
        pregunta_reflexion: '¿En qué cosas terrenales has estado poniendo tu seguridad o tu valor personal?',
        oracion: 'Señor Jesús, sé tú el centro indiscutible de mi vida. Que mis anhelos, proyectos y decisiones giren en torno a ti. En ti encuentro mi verdadera plenitud. Amén.',
      },
      {
        numero_dia: 3,
        titulo: 'La humildad que transforma: Tomar la actitud de siervo',
        referencia_biblica: 'Filipenses 2:3-5',
        predicacion:
          'El orgullo es una de las mayores fuentes de conflicto en nuestras relaciones.\n\nQueremos que los demás nos sirvan, que nos reconozcan y que se haga nuestra voluntad. Pero Jesús nos mostró un camino completamente diferente.\n\n“Nada hagáis por contienda o por vanagloria; antes bien con humildad, estimando cada uno a los demás como superiores a él mismo.” Jesús, siendo Dios, no se aferró a su grandeza sino que se despojó y tomó forma de siervo.\n\nLa verdadera grandeza en el Reino de Dios se mide por la disposición a servir y bendecir a otros sin esperar nada a cambio.\n\nHoy elige la humildad en tu casa y en tu trabajo.',
        aplicacion: 'Haz un servicio humilde hoy por alguien en tu casa o trabajo sin que te lo pidan y sin buscar reconocimiento.',
        pregunta_reflexion: '¿Buscas tener siempre la razón y el reconocimiento, o estás dispuesto a servir con amor a los demás?',
        oracion: 'Señor Jesús, dame un corazón semejante al tuyo. Quita de mí el orgullo y la vanagloria, y enséñame a amar y servir a quienes me rodean con sincera humildad. Amén.',
      },
      {
        numero_dia: 4,
        titulo: 'Lumbreras en el mundo: Vivir sin quejas',
        referencia_biblica: 'Filipenses 2:14-15',
        predicacion:
          'Es muy fácil contagiarse de la queja cuando todos a nuestro alrededor murmuran.\n\nNos quejamos del clima, de los jefes, del tráfico y de las responsabilidades. Pero Pablo nos desafía con ternura: “Haced todo sin murmuraciones y contiendas, para que seáis... lumbreras en el mundo.”\n\nUn creyente que elige dar gracias y mantener una actitud de paz resplandece como una estrella en una noche oscura.\n\nTu testimonio más poderoso no son solo tus palabras los domingos; es tu actitud pacífica y agradecida durante la semana.\n\nHoy decide ser luz donde otros siembran desánimo.',
        aplicacion: 'Proponte no quejarte de nada durante todo este día. Si algo sale mal, respira y busca un motivo de agradecimiento.',
        pregunta_reflexion: '¿Cómo afecta tu actitud diaria a las personas que conviven contigo?',
        oracion: 'Padre amado, perdóname por las veces que he murmurado y contagiado pesadez. Llena mi boca de gratitud y hazme resplandecer con tu paz en cada lugar donde esté. Amén.',
      },
      {
        numero_dia: 5,
        titulo: 'Prosigo a la meta: Soltar el pasado para abrazar el futuro',
        referencia_biblica: 'Filipenses 3:13-14',
        predicacion:
          'No podemos correr bien hacia adelante si vamos mirando hacia atrás todo el tiempo.\n\nMéritos pasados que nos enorgullecen o errores del ayer que nos llenan de culpa son pesos que nos impiden avanzar en la carrera espiritual.\n\nPablo lo dice con convicción: “Olvidando ciertamente lo que queda atrás, y extendiéndome a lo que está delante, prosigo a la meta, al premio del supremo llamamiento de Dios en Cristo Jesús.”\n\nLo que hiciste ayer ya quedó bajo la sangre de Cristo; lo que importa es el paso de fidelidad que das hoy.\n\nHoy suelta el pasado y avanza con fe hacia el propósito que Dios tiene para ti.',
        aplicacion: 'Identifica un remordimiento o fracaso del pasado que aún te pese, entrégalo en oración y decide no volver a castigarte por ello.',
        pregunta_reflexion: '¿Qué recuerdo o culpa del pasado te está frenando para vivir con plenitud en el presente?',
        oracion: 'Señor, hoy suelto todo lo que quedó atrás: mis errores, mis heridas y mis temores. Miro hacia adelante y corro con perseverancia la carrera que pusiste delante de mí. En Cristo Jesús, amén.',
      },
      {
        numero_dia: 6,
        titulo: 'Nuestra verdadera ciudadanía está en los cielos',
        referencia_biblica: 'Filipenses 3:20',
        predicacion:
          'A veces nos angustiamos demasiado por las cosas de este mundo porque olvidamos quiénes somos realmente.\n\nLas noticias, las crisis políticas y los problemas económicos pueden hacernos sentir desamparados. Pero las Escrituras nos recuerdan que estamos de paso por esta tierra.\n\n“Mas nuestra ciudadanía está en los cielos, de donde también esperamos al Salvador, al Señor Jesucristo.”\n\nSaber que perteneces al Reino celestial cambia tu perspectiva: los problemas de hoy son temporales, pero la herencia que tienes en Dios es eterna e inconmovible.\n\nHoy camina con la dignidad y la seguridad de un hijo del Rey de reyes.',
        aplicacion: 'Recuérdate a ti mismo a lo largo del día: “Este problema es pasajero, pero el amor y el Reino de Dios son eternos”.',
        pregunta_reflexion: '¿Estás viviendo como si esta tierra fuera tu destino final o con la esperanza viva de la eternidad?',
        oracion: 'Padre celestial, gracias porque mi nombre está escrito en los cielos. Ayúdame a no poner mi corazón en lo pasajero, sino a vivir con la mirada puesta en las promesas eternas de Cristo. Amén.',
      },
      {
        numero_dia: 7,
        titulo: 'La paz que cuida tu corazón: De la angustia a la gratitud',
        referencia_biblica: 'Filipenses 4:6-7',
        predicacion:
          'La ansiedad busca robarte el descanso susurrándote temores sobre el futuro.\n\nPero Dios te ofrece un refugio seguro: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”\n\nNo guardes tus preocupaciones dentro del pecho; conviértelas en oraciones agradecidas. La paz de Dios es como un centinela celestial apostado a la puerta de tu mente para rechazar el pánico.\n\nHoy no permitas que el afán tome el timón de tu vida.',
        aplicacion: 'Haz una lista de tus 3 preocupaciones actuales y conviértelas en peticiones de gratitud antes de dormir esta noche.',
        pregunta_reflexion: '¿Pasas más tiempo preocupándote que orando con agradecimiento a Dios?',
        oracion: 'Señor de paz, traigo a tus pies cada carga y pensamiento ansioso. Te doy gracias por tu fidelidad de ayer y descanso seguro en que tú cuidarás de mi mañana. Guarda mi corazón en tu calma. Amén.',
      },
      {
        numero_dia: 8,
        titulo: 'En esto pensad: El filtro que protege tu mente',
        referencia_biblica: 'Filipenses 4:8',
        predicacion:
          'Nuestra mente es como un jardín: lo que sembramos en ella es lo que cosecharemos en emociones y acciones.\n\nSi alimentamos la mente con quejas, noticias alarmistas, chismes e impurezas, cosecharemos angustia y amargura. Por eso Pablo nos da un filtro sabio:\n\n“Todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro, todo lo amable, todo lo que es de buen nombre; si hay virtud alguna, si algo digno de alabanza, en esto pensad.”\n\nTú tienes el poder, con la ayuda del Espíritu Santo, de elegir en qué pensamientos te detienes.\n\nHoy llena tu mente de la verdad y las promesas de Dios.',
        aplicacion: 'Cada vez que un pensamiento negativo o destructivo llegue a tu mente hoy, recházalo de inmediato y cámbialo por un versículo o una promesa bíblica.',
        pregunta_reflexion: '¿Qué tipo de pensamientos has estado permitiendo anidar en tu mente en estos días?',
        oracion: 'Padre Santo, pongo mi mente bajo la autoridad de tu Palabra. Purifica mis pensamientos y ayúdame a enfocarme en lo puro, lo amable y lo que edifica. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 9,
        titulo: 'El secreto del contentamiento en cualquier situación',
        referencia_biblica: 'Filipenses 4:11-12',
        predicacion:
          'Tendemos a creer que seremos felices cuando tengamos más dinero, una mejor casa o cuando todos los problemas se hayan resuelto.\n\nPero el apóstol Pablo descubrió un secreto mucho más profundo: “He aprendido a contentarme, cualquiera que sea mi situación. Sé vivir humildemente, y sé tener abundancia... en todo y por todo estoy enseñado.”\n\nEl contentamiento cristiano no es resignación triste; es la convicción de que teniendo a Cristo lo tenemos todo.\n\nLas cosas materiales van y vienen, pero la presencia de Dios permanece fiel en la escasez y en la abundancia.\n\nHoy encuentra tu satisfacción en Dios, no en lo que posees.',
        aplicacion: 'Agradece hoy por 3 cosas básicas que tienes (techo, alimento, salud) y declara que tu gozo depende de Cristo y no de tus posesiones.',
        pregunta_reflexion: '¿Depende tu paz del saldo de tu cuenta o de la fidelidad permanente de Dios?',
        oracion: 'Señor Jesús, enséñame el secreto del verdadero contentamiento. Que mi gozo y mi seguridad descansen en ti y no en las circunstancias externas. Tú eres mi porción y mi mayor bien. Amén.',
      },
      {
        numero_dia: 10,
        titulo: 'Todo lo puedo en Cristo que me fortalece',
        referencia_biblica: 'Filipenses 4:13',
        predicacion:
          'Este es uno de los versículos más conocidos y a veces peor entendidos de la Biblia.\n\nNo significa que podemos conseguir cualquier capricho humano o ganar cualquier trofeo terrenal. En su contexto, significa que cualquiera sea la prueba, la dificultad, la escasez o el sufrimiento que debamos enfrentar, la gracia de Cristo nos dará la fuerza sobrenatural para salir adelante en victoria.\n\nCuando sientas que tus fuerzas se agotan y que la carga es demasiado pesada, recuerda que no estás solo.\n\nEl poder de Dios se perfecciona exactamente en tu debilidad.\n\nHoy camina confiado: la fuerza de Cristo te sostiene.',
        aplicacion: 'Frente a esa tarea o dificultad que sientes que te supera hoy, repite con fe: “No estoy en mis solas fuerzas; Cristo me capacita y me sostiene”.',
        pregunta_reflexion: '¿En qué área de tu vida necesitas dejar de confiar en tus propias fuerzas y apoyarte en el poder de Cristo?',
        oracion: 'Señor Jesús, cuando mis fuerzas flaqueen, sé tú mi fortaleza. Declaro que en ti puedo soportar la prueba, cumplir mi llamado y caminar con firmeza. Tu gracia me basta. Amén.',
      },
      {
        numero_dia: 11,
        titulo: 'Dios suplirá todo lo que os falta',
        referencia_biblica: 'Filipenses 4:19',
        predicacion:
          'La escasez y las deudas pueden generar un temor muy profundo en el corazón de cualquier persona.\n\nPero Pablo da una promesa solemne a los creyentes generosos: “Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.”\n\nObserva que no dice que Dios suplirá según la economía del país o según nuestros limitados cálculos; dice conforme a sus inagotables riquezas en gloria.\n\nDios es un Padre bueno que sabe lo que necesitas antes de que se lo pidas. Tu responsabilidad es ser fiel y generoso; la suya es ser el proveedor infalible de tu casa.\n\nHoy descansa en su fidelidad financiera y material.',
        aplicacion: 'Haz un acto de desprendimiento y generosidad hoy, por pequeño que sea, como testimonio de que confías en la provisión de Dios.',
        pregunta_reflexion: '¿Le has entregado a Dios tus temores financieros en oración con total confianza?',
        oracion: 'Padre celestial, tú eres Jehová Jireh, mi fiel proveedor. Suelto el afán por las cuentas y el dinero, y descanso en que suplirás todo lo que me falte conforme a tus riquezas en gloria. En Jesús, amén.',
      },
      {
        numero_dia: 12,
        titulo: 'Dios usando las dificultades para bendición',
        referencia_biblica: 'Filipenses 1:12-14',
        predicacion:
          'Cuando Pablo cayó preso en Roma, muchos pensaron que el evangelio se había detenido.\n\nSin embargo, Pablo escribió con gozo: “Las cosas que me han sucedido, han redundado más bien para el progreso del evangelio.” Estando en cadenas, los guardias del palacio imperial conocieron a Jesús y los demás hermanos cobraron más valentía para predicar.\n\nDios tiene una forma maravillosa de usar lo que parecía un revés en tu vida para convertirlo en una plataforma de bendición y crecimiento.\n\nLo que el enemigo quiso para desanimarte, Dios lo usará para madurar tu carácter y bendecir a otros.\n\nHoy no juzgues la historia por el capítulo difícil de hoy.',
        aplicacion: 'Mira una situación difícil que hayas vivido y escribe una lección o bendición que Dios haya sacado de ella para tu crecimiento.',
        pregunta_reflexion: '¿Confías en que Dios puede transformar tus momentos más duros en testimonios de su gloria?',
        oracion: 'Señor, reconozco que tus caminos son más altos que los míos. Aunque hoy no comprenda por qué paso por esta dificultad, confío en que la usarás para mi bien y para tu gloria. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 13,
        titulo: 'Vivir en unidad: Un mismo sentir en el amor',
        referencia_biblica: 'Filipenses 2:1-2',
        predicacion:
          'El enemigo siempre busca dividir: dividir los matrimonios, distanciar a las familias y sembrar rencor entre los hermanos en la fe.\n\nPero donde hay unidad sincera, Dios envía bendición y vida eterna. Pablo ruega: “Completad mi gozo, sintiendo lo mismo, teniendo el mismo amor, unánimes, sintiendo una misma cosa.”\n\nLa unidad no significa que todos pensemos idéntico en cada detalle secundario; significa que nuestro amor mutuo en Cristo es más grande que cualquier diferencia de opinión.\n\nHoy busca tender puentes y no levantar muros en tus relaciones.',
        aplicacion: 'Llama o escríbele a un hermano o familiar con quien hayas tenido distancia y exprésale tu aprecio sincero.',
        pregunta_reflexion: '¿Estás contribuyendo a la paz y unidad en tu entorno o alimentando desacuerdos innecesarios?',
        oracion: 'Señor Jesús, hazme un instrumento de paz y reconciliación. Aleja de mis relaciones la contienda y el distanciamiento, y ayúdanos a caminar con un solo corazón en tu amor. Amén.',
      },
      {
        numero_dia: 14,
        titulo: 'El gozo del Señor como una decisión diaria',
        referencia_biblica: 'Filipenses 4:4',
        predicacion:
          '“Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!”\n\nNota que Pablo no dice que nos alegremos en las circunstancias, sino “en el Señor”. Las circunstancias cambian constantemente: hoy sonríen y mañana aprietan. Pero el Señor nunca cambia; su fidelidad, su amor y su victoria en la cruz permanecen inalterables.\n\nEl gozo cristiano no es una risa superficial que ignora el dolor; es un ancla profunda en el alma que sabe que, a pesar de todo, Dios sigue en su trono y tiene el control.\n\nHoy elige el gozo de la salvación por encima de cualquier pesadez del día.',
        aplicacion: 'Pon una alabanza de adoración hoy mientras te preparas o trabajas y permite que el gozo de Dios llene tu hogar.',
        pregunta_reflexion: '¿De qué depende tu alegría hoy: de lo que sucede a tu alrededor o de quién es Dios en tu vida?',
        oracion: 'Dios amado, decido hoy regocijarme en ti. Gracias por mi salvación, por tu presencia y por tu amor que nunca se apaga. Que tu gozo sea mi fortaleza en este día. Amén.',
      },
      {
        numero_dia: 15,
        titulo: 'La gracia del Señor que te acompaña siempre',
        referencia_biblica: 'Filipenses 4:23',
        predicacion:
          'Hemos llegado al final de estos 15 días en la hermosa carta a los Filipenses.\n\nPablo cierra su mensaje con una bendición entrañable: “La gracia de nuestro Señor Jesucristo sea con vuestro espíritu. Amén.”\n\nLa gracia no es solo lo que te salvó al inicio de tu caminar con Dios; es el combustible diario que te da fuerzas para perdonar, para trabajar con alegría, para vencer el enojo y para descansar en medio de la tormenta.\n\nNo terminas este estudio solo; la gracia viva de Jesucristo camina contigo a cada instante.\n\nVe adelante con paz, gozo y la firme certeza de que Dios cuida de tus pasos.',
        aplicacion: 'Anota en tu libreta los 3 aprendizajes más importantes de este estudio de 15 días y dale gracias a Dios por haberte sostenido.',
        pregunta_reflexion: '¿Cómo ha transformado la carta a los Filipenses tu manera de afrontar las pruebas cotidianas?',
        oracion: 'Señor Jesús, gracias por estos 15 días de estudio, comunión y renovación espiritual. Que tu gracia abundante permanezca sobre mi espíritu cada día. A ti sea toda la gloria, la honra y la alabanza por siempre. Amén.',
      },
    ],
  },
  {
    id: 'semilla-estudio-30d-proverbios',
    titulo: 'Proverbios: 30 días de sabiduría para tus decisiones',
    descripcion: 'Un plan mensual de 30 días recorriendo los principios más profundos y prácticos de Proverbios. Sabiduría divina para tus finanzas, palabras, relaciones, trabajo y gobierno del corazón.',
    tema: 'Sabiduría Práctica',
    num_dias: 30,
    portada_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    dias: [
      {
        numero_dia: 1,
        titulo: 'El principio de la sabiduría: Reverencia ante Dios',
        referencia_biblica: 'Proverbios 1:7',
        predicacion:
          'El mundo actual está lleno de información, pero muy necesitado de sabiduría.\n\nPodemos acumular títulos, conocimientos técnicos y datos en nuestro teléfono, pero seguir tropezando en las decisiones más sencillas de la vida familiar y personal.\n\nProverbios 1:7 nos da el cimiento de todo: “El principio de la sabiduría es el temor de Jehová.” Temer a Dios no es tenerle miedo, sino tenerle una reverencia tan profunda que su Palabra pesa más que cualquier opinión humana.\n\nCuando honras a Dios en lo primero de cada día, tus decisiones se llenan de orden, justicia y paz.',
        aplicacion: 'Dedica los primeros 10 minutos de este plan a pedirle a Dios sabiduría humilde para gobernar tu vida este mes.',
        pregunta_reflexion: '¿Estás buscando sabiduría en las opiniones de este mundo o en la verdad de Dios?',
        oracion: 'Padre de las luces, reconozco que sin ti no sé cómo caminar. Dame un corazón reverente y humilde para recibir tu sabiduría cada día. En Jesús, amén.',
      },
      {
        numero_dia: 2,
        titulo: 'La búsqueda de la sabiduría: Un tesoro invaluable',
        referencia_biblica: 'Proverbios 2:3-6',
        predicacion:
          'La verdadera sabiduría no se encuentra por casualidad en el camino.\n\nSalomón nos dice que debemos buscarla “como a la plata, y escudriñarla como a tesoros”. Requiere un corazón dispuesto a escuchar, a corregirse y a meditar en la Palabra con diligencia.\n\n“Porque Jehová da la sabiduría, y de su boca viene el conocimiento y la inteligencia.” Dios no le niega su guía a quien se la pide con sinceridad.\n\nHoy no tomes decisiones apresuradas; busca el consejo de Dios antes de actuar.',
        aplicacion: 'Anota en una libreta una decisión que debas tomar esta semana y ora pidiendo dirección antes de dar el siguiente paso.',
        pregunta_reflexion: '¿Dedicas tiempo intencional a buscar la sabiduría de Dios en la oración y la lectura bíblica?',
        oracion: 'Señor, abre mi entendimiento para valorar tu consejo por encima del oro y la plata. Que tus enseñanzas guíen cada una de mis decisiones. Amén.',
      },
      {
        numero_dia: 3,
        titulo: 'Fíate de Jehová con todo tu corazón',
        referencia_biblica: 'Proverbios 3:5-6',
        predicacion:
          'A los seres humanos nos encanta apoyarnos en nuestra propia lógica.\n\nQueremos entender exactamente cada detalle antes de avanzar y nos desesperamos cuando los planes toman un rumbo inesperado.\n\nProverbios 3:5-6 nos regala uno de los versículos más reconfortantes de toda la Biblia: “Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.”\n\nConfiar en Dios significa soltar el control del volante y permitir que el Creador guíe la dirección de tu vida.',
        aplicacion: 'Repite este versículo en tu mente tres veces hoy cuando sientas incertidumbre laboral o familiar.',
        pregunta_reflexion: '¿En qué área de tu vida estás insistiendo en apoyarte en tu propia prudencia?',
        oracion: 'Señor, hoy elijo confiar en ti con todo mi corazón. Renuncio a querer controlarlo todo y te reconozco como el Señor de mis caminos. Endereza mis pasos, amén.',
      },
      {
        numero_dia: 4,
        titulo: 'Sobre toda cosa guardada, guarda tu corazón',
        referencia_biblica: 'Proverbios 4:23',
        predicacion:
          'Cuidamos la casa con cerraduras, protegemos el dinero en el banco y ponemos claves en el teléfono celular.\n\nPero muchas veces dejamos nuestro corazón completamente desprotegido ante la amargura, la envidia, el rencor y los pensamientos vanos.\n\n“Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.” De lo que hay en el corazón nacen tus palabras, tus reacciones y las decisiones que marcarán tu destino.\n\nHoy coloca una guardia espiritual sobre tus afectos y tus pensamientos.',
        aplicacion: 'Revisa qué cosas has dejado entrar a tu corazón en estos días (quejas, chismes, envidia) y pídele a Dios que limpie tu interior.',
        pregunta_reflexion: '¿Qué actitudes o influencias necesitas sacar de tu corazón para mantenerlo puro ante Dios?',
        oracion: 'Crea en mí, oh Dios, un corazón limpio. Guarda mis afectos y mis pensamientos de toda contaminación y amargura. Que de mi vida brote paz y bendición. Amén.',
      },
      {
        numero_dia: 5,
        titulo: 'La diligencia de la hormiga: Sabiduría en el trabajo',
        referencia_biblica: 'Proverbios 6:6-8',
        predicacion:
          'La pereza es una ladrona silenciosa de bendición y propósito.\n\nSalomón nos envía a aprender de una criatura pequeña pero ejemplar: “Ve a la hormiga, oh perezoso, mira sus caminos, y sé sabio; la cual no teniendo capitán... prepara en el verano su comida.”\n\nLa excelencia y la bendición en la vida no se alcanzan con arranques emocionales de un solo día, sino con la fidelidad en los pequeños esfuerzos cotidianos.\n\nHoy honra a Dios con tu diligencia, tu puntualidad y tu mejor esfuerzo en todo lo que hagas.',
        aplicacion: 'Haz con excelencia y buen ánimo esa tarea laboral o doméstica que te da pereza realizar hoy.',
        pregunta_reflexion: '¿Estás trabajando como para el Señor en tus responsabilidades diarias o haciendo solo lo mínimo?',
        oracion: 'Padre amado, quita de mí la pereza y el desánimo. Bendice la obra de mis manos y ayúdame a trabajar con integridad, diligencia y alegría para tu gloria. Amén.',
      },
      {
        numero_dia: 6,
        titulo: 'Prudencia al hablar: En las muchas palabras no falta pecado',
        referencia_biblica: 'Proverbios 10:19',
        predicacion:
          'Hablar de más es una de las trampas más comunes en las que caemos.\n\nA veces por querer opinar sobre todo o por no saber guardar silencio, terminamos diciendo cosas de las que luego nos arrepentimos.\n\n“En las muchas palabras no falta pecado; mas el que refrena sus labios es prudente.” Las palabras tienen el poder de edificar o de derribar; una persona sabia sabe cuándo hablar y cuándo callar.\n\nHoy sé rápido para escuchar y lento para hablar.',
        aplicacion: 'Hoy practica el arte de escuchar con atención a los demás antes de apresurarte a opinar o juzgar.',
        pregunta_reflexion: '¿Sueles hablar por impulso en momentos de tensión o te tomas un tiempo para pensar antes de responder?',
        oracion: 'Señor, pon guarda a mi boca y custodia la puerta de mis labios. Que de mi boca solo salgan palabras oportunas, amables y llenas de tu gracia. Amén.',
      },
      {
        numero_dia: 7,
        titulo: 'La balanza justa: Integridad en el trabajo y los tratos',
        referencia_biblica: 'Proverbios 11:1',
        predicacion:
          'Vivimos en un mundo donde muchos buscan el atajo fácil y la ventaja deshonesta.\n\nPero Dios mira con deleite a quien actúa con rectitud: “El peso falso es abominación a Jehová; mas la pesa cabal le agrada.”\n\nTu testimonio cristiano se valida cuando eres honesto en los vueltos, en los impuestos, en las horas trabajadas y en los compromisos asumidos. La ganancia deshonesta dura poco y trae dolor; la integridad trae la bendición de Dios que enriquece y no añade tristeza.\n\nHoy camina con transparencia en cada uno de tus tratos.',
        aplicacion: 'Cumple hoy tu palabra en un compromiso pendiente, aunque te cueste tiempo o esfuerzo adicional.',
        pregunta_reflexion: '¿Eres una persona transparente y confiable en tus finanzas y acuerdos de palabra?',
        oracion: 'Padre justo, ayúdame a ser íntegro en lo público y en lo secreto. Líbrame del engaño y que mi testimonio laboral y personal glorifique tu santo nombre. Amén.',
      },
      {
        numero_dia: 8,
        titulo: 'Palabras que sanan vs. palabras que hieren',
        referencia_biblica: 'Proverbios 12:18',
        predicacion:
          '“Hay hombres cuyas palabras son como golpes de espada; mas la lengua de los sabios es medicina.”\n\nCuántas veces hemos sentido el dolor de una frase dura dicha con frialdad por alguien cercano. Y cuántas veces hemos sido nosotros quienes hemos herido con comentarios sarcásticos o despectivos.\n\nEl creyente sabio usa su voz como un bálsamo para consolar al triste, animar al cansado y restaurar al que ha caído.\n\nHoy utiliza tus palabras para curar y no para abrir heridas.',
        aplicacion: 'Pronuncia palabras sinceras de aprecio y gratitud a tres personas distintas a lo largo de tu día.',
        pregunta_reflexion: '¿Tus palabras diarias dejan a las personas con más paz o con más heridas en el alma?',
        oracion: 'Señor Jesús, limpia mi lenguaje de ironías, ofensas y juicios duros. Haz de mi boca un instrumento de medicina y esperanza para quienes me rodean. Amén.',
      },
      {
        numero_dia: 9,
        titulo: 'El valor de las buenas compañías',
        referencia_biblica: 'Proverbios 13:20',
        predicacion:
          'Las personas con las que compartimos nuestro tiempo más íntimo influyen profundamente en nuestro carácter y en nuestras decisiones.\n\n“El que anda con sabios, sabio será; mas el que se junta con necios, será quebrantado.”\n\nSi te rodeas de personas que se quejan, que critican y que viven en el pecado, poco a poco tu corazón se enfriará. Pero si caminas junto a personas que aman a Dios y buscan el bien, tu fe se fortalecerá día a día.\n\nHoy cuida tu círculo cercano y sé también una influencia de bendición para otros.',
        aplicacion: 'Dedica tiempo hoy a conversar con una persona madura en la fe que aporte consejo sabio a tu vida.',
        pregunta_reflexion: '¿Tus amistades más cercanas te acercan a Dios o te alejan de sus caminos?',
        oracion: 'Dios mío, dame discernimiento para elegir mis amistades y sabiduría para ser una influencia de bendición y luz en medio de mi entorno. En Jesús, amén.',
      },
      {
        numero_dia: 10,
        titulo: 'La sabiduría que edifica el hogar',
        referencia_biblica: 'Proverbios 14:1',
        predicacion:
          'La familia es el tesoro más preciado que Dios nos ha confiado en esta tierra.\n\n“La mujer sabia edifica su casa; mas la necia con sus manos la derriba.” Y este principio se aplica a cada miembro del hogar: con nuestras actitudes diarias podemos edificar un ambiente de paz y amor, o destruirlo con quejas, gritos y desatención.\n\nUn hogar bendecido no es aquel donde nunca hay problemas, sino aquel donde reina el perdón, la paciencia y la presencia de Dios.\n\nHoy siembra amor y comprensión en tu casa.',
        aplicacion: 'Haz algo especial por tu familia hoy: una muestra de afecto, una comida compartida con gratitud o una palabra de bendición.',
        pregunta_reflexion: '¿Estás edificando tu hogar con paciencia y amor, o permitiendo que las tensiones cotidianas lo desgasten?',
        oracion: 'Señor Jesús, bendice mi hogar y mi familia. Danos sabiduría para edificar en amor, perdonarnos con prontitud y hacer de nuestra casa un refugio de paz. Amén.',
      },
      {
        numero_dia: 11,
        titulo: 'La paciencia: Grande de entendimiento',
        referencia_biblica: 'Proverbios 14:29',
        predicacion:
          '“El que tarda en airarse es grande de entendimiento; mas el que es impaciente de espíritu enaltece la necedad.”\n\nQué fácil es perder los estribos cuando las cosas no salen a nuestro ritmo. Vivimos en la cultura de lo inmediato y la impaciencia nos hace tomar decisiones impulsivas de las que luego nos arrepentimos.\n\nLa paciencia no es resignación pasiva; es la madurez espiritual que sabe esperar el tiempo oportuno de Dios y gobernar las emociones con dominio propio.\n\nHoy pide la gracia de ser paciente ante las demoras del día.',
        aplicacion: 'Cuando sientas que la prisa o la impaciencia te ganan hoy, respira hondo, sonríe y recuerda que los tiempos de Dios son perfectos.',
        pregunta_reflexion: '¿En qué situación puntual estás perdiendo la paciencia en estos días?',
        oracion: 'Padre celestial, quebranta mi impaciencia y enséñame a esperar con serenidad. Dame un espíritu apacible que no se turbe ante los retrasos cotidianos. Amén.',
      },
      {
        numero_dia: 12,
        titulo: 'La respuesta blanda que aplaca la ira',
        referencia_biblica: 'Proverbios 15:1',
        predicacion:
          'Cuando alguien nos habla con dureza o agresión, el fuego quiere apagarse con más fuego.\n\nPero Proverbios 15:1 nos da una de las lecciones más prácticas de relaciones humanas: “La blanda respuesta quita la ira; mas la palabra áspera hace subir el furor.”\n\nResponder con calma ante una provocación no es debilidad; es demostrar que tus emociones no están a merced de lo que otros hagan o digan, sino bajo el gobierno de Cristo.\n\nHoy desarma la tensión con amabilidad y mansedumbre.',
        aplicacion: 'Si alguien te habla con tono áspero hoy, responde con serenidad y cortesía. Observa cómo cambia la atmósfera.',
        pregunta_reflexion: '¿Sueles apagar los incendios de la discusión o echarles más leña con respuestas cortantes?',
        oracion: 'Señor, dame la gracia de una respuesta blanda y oportuna. Quita de mí la necesidad de ganar discusiones y ayúdame a ser un pacificador en todo momento. Amén.',
      },
      {
        numero_dia: 13,
        titulo: 'Mejor es lo poco con el temor de Jehová',
        referencia_biblica: 'Proverbios 15:16',
        predicacion:
          '“Mejor es lo poco con el temor de Jehová, que el gran tesoro donde hay turbación.”\n\nCuántas personas acumulan riquezas inmensas a costa de su salud mental, su matrimonio y su paz espiritual. Tener bienes no está mal, pero ninguna cantidad de dinero puede comprar la paz que solo Dios da al corazón.\n\nLa verdadera riqueza consiste en acostarse en la noche con la conciencia limpia, el corazón agradecido y la confianza puesta en Dios.\n\nHoy valora la paz de Dios por encima de cualquier ganancia terrenal.',
        aplicacion: 'Agradece a Dios por la sencillez de tu vida y pídele que nunca te falte la paz que el dinero no puede comprar.',
        pregunta_reflexion: '¿Estás sacrificando tu paz espiritual o familiar por alcanzar metas materiales pasajeras?',
        oracion: 'Padre bueno, gracias por tu provisión diaria. Que mi mayor tesoro sea siempre tu presencia en mi vida y la paz que guardas en mi corazón. En Jesús, amén.',
      },
      {
        numero_dia: 14,
        titulo: 'Encomienda a Jehová tus obras y proyectos',
        referencia_biblica: 'Proverbios 16:3',
        predicacion:
          'Hacemos planes y soñamos con el futuro, pero la ansiedad aparece cuando queremos controlar cada detalle y resultado.\n\n“Encomienda a Jehová tus obras, y tus pensamientos serán afirmados.”\n\nEncomendar significa soltar el control y confiar en que Dios sabe mejor que nosotros lo que nos conviene. Cuando le entregas tus planes, Él te da claridad, alinea tu corazón y te llena de serenidad, incluso si los caminos toman rumbos diferentes a los previstos.\n\nHaz lo que esté en tus manos con diligencia, pero descansa sabiendo que el resultado final le pertenece a Dios.',
        aplicacion: 'Escribe los 3 planes que más te preocupan y dile a Dios: “Señor, te los entrego; confío en tu dirección más que en mis fuerzas”.',
        pregunta_reflexion: '¿Qué proyecto estás intentando controlar por ti mismo en lugar de encomendárselo a Dios?',
        oracion: 'Señor, pongo en tus manos mis planes, mi trabajo y mis anhelos. Afirma mis pensamientos y dame paz para descansar en tu perfecta voluntad. Amén.',
      },
      {
        numero_dia: 15,
        titulo: 'El corazón planea, pero Dios endereza los pasos',
        referencia_biblica: 'Proverbios 16:9',
        predicacion:
          '“El corazón del hombre piensa su camino; mas Jehová endereza sus pasos.”\n\nCuántas veces hemos tenido un plan perfectamente trazado que de pronto cambia por completo: una puerta cerrada, un cambio de empleo o un traslado inesperado.\n\nEn esos momentos es fácil frustrarse. Pero recuerda: cuando una puerta se cierra en la voluntad de Dios, es porque Él te está librando de un tropiezo o preparándote para un camino mejor.\n\nHoy confía en que Dios está guiando tus pasos aun en los desvíos del camino.',
        aplicacion: 'Acepta con paz un cambio de planes que hayas experimentado recientemente, sabiendo que Dios cuida tu destino.',
        pregunta_reflexion: '¿Te enojas cuando las cosas no salen como planeabas o buscas ver la mano de Dios en el proceso?',
        oracion: 'Señor, guíame por el camino que tú tienes diseñado para mí. Endereza mis pasos y ayúdame a confiar en que tus planes son siempre de bienestar. Amén.',
      },
      {
        numero_dia: 16,
        titulo: 'La trampa del orgullo: La humildad que precede a la honra',
        referencia_biblica: 'Proverbios 16:18',
        predicacion:
          '“Antes del quebrantamiento es la soberbia, y antes de la caída la altivez de espíritu.”\n\nEl orgullo nos hace creer que no necesitamos la ayuda de nadie ni el consejo de Dios. Nos vuelve ciegos ante nuestros propios errores y nos hace juzgar a los demás con severidad.\n\nPero la humildad es la llave que abre los tesoros de la gracia. Dios resiste a los soberbios, pero da gracia a los humildes.\n\nHoy camina con sencillez de corazón, reconociendo que todo lo que tienes y eres proviene de Dios.',
        aplicacion: 'Pide perdón con humildad si tuviste una actitud altiva con alguien recientemente.',
        pregunta_reflexion: '¿En qué aspecto de tu vida se manifiesta más tu orgullo o autosuficiencia?',
        oracion: 'Padre amado, quita de mí toda altivez y orgullo. Dame un corazón manso y humilde como el de Jesús, que reconozca mi necesidad constante de tu gracia. Amén.',
      },
      {
        numero_dia: 17,
        titulo: 'El verdadero amigo en el día de la angustia',
        referencia_biblica: 'Proverbios 17:17',
        predicacion:
          '“En todo tiempo ama el amigo, y es como un hermano en tiempo de angustia.”\n\nEn los días de fiesta y prosperidad abundan los conocidos. Pero en los días difíciles, cuando la enfermedad golpea o los recursos escasean, se conoce a los verdaderos amigos.\n\nJesús es el amigo supremo que nunca te abandona, pero también nos llama a nosotros a ser ese tipo de amigos fieles para los demás.\n\nHoy no esperes a que te busquen; sé tú ese hermano de bendición para alguien que sufre.',
        aplicacion: 'Comunícate hoy con un amigo o hermano que esté pasando por una prueba y acompáñalo con oración y presencia.',
        pregunta_reflexion: '¿Eres el tipo de amigo leal en quien otros pueden apoyarse en momentos difíciles?',
        oracion: 'Señor Jesús, gracias por ser mi amigo fiel que nunca me desampara. Enséñame a amar a mis hermanos con lealtad y compasión en todo tiempo. Amén.',
      },
      {
        numero_dia: 18,
        titulo: 'El corazón alegre es una buena medicina',
        referencia_biblica: 'Proverbios 17:22',
        predicacion:
          '“El corazón alegre constituye buen remedio; mas el espíritu triste seca los huesos.”\n\nLa ciencia moderna ha confirmado lo que la Biblia enseñó hace miles de años: la amargura y la tristeza constante desgastan el cuerpo, bajan las defensas y agotan la vitalidad.\n\nEl gozo en el Señor es una fuerza vivificante. Reír con tu familia, dar gracias por las pequeñas cosas y descansar en las promesas de Dios sana el alma y renueva el cuerpo.\n\nHoy no permitas que la pesadez te robe la alegría de vivir.',
        aplicacion: 'Comparte un momento de risa sana y conversación alegre con tu familia o amigos hoy.',
        pregunta_reflexion: '¿Has permitido que la queja y el desánimo marchiten la alegría en tu hogar?',
        oracion: 'Señor, devuélveme el gozo de tu salvación. Llena mi corazón de una alegría santa que sea medicina para mi cuerpo y esperanza para quienes me rodean. Amén.',
      },
      {
        numero_dia: 19,
        titulo: 'Torre fuerte es el nombre de Jehová',
        referencia_biblica: 'Proverbios 18:10',
        predicacion:
          'En tiempos antiguos, cuando un ejército atacaba, los habitantes corrían a refugiarse dentro de la torre más fuerte de la ciudad.\n\n“Torre fuerte es el nombre de Jehová; a él correrá el justo, y será levantado.”\n\nCuando los problemas, los temores o las malas noticias te rodeen, no corras hacia la desesperación ni busques refugio en lo pasajero. Corre a los brazos de Dios en oración.\n\nEn su presencia estás seguro y ningún enemigo podrá derribar tu alma.',
        aplicacion: 'Cuando sientas miedo o presión hoy, di en voz alta: “Dios es mi torre fuerte; en Él estoy seguro”.',
        pregunta_reflexion: '¿A dónde corres primero cuando los problemas tocan a tu puerta?',
        oracion: 'Señor Todopoderoso, tú eres mi refugio seguro y mi torre inexpugnable. En tus manos descanso y en tu presencia encuentro toda la paz que necesito. Amén.',
      },
      {
        numero_dia: 20,
        titulo: 'El poder de vida y muerte en la lengua',
        referencia_biblica: 'Proverbios 18:21',
        predicacion:
          '“La muerte y la vida están en poder de la lengua, y el que la ama comerá de sus frutos.”\n\nCada palabra que sale de tu boca siembra una semilla. Puedes sembrar palabras de fe, ánimo y bendición sobre tus hijos, tu cónyuge y tu trabajo; o puedes sembrar derrota, crítica y pesimismo.\n\nLa persona sabia comprende el peso de lo que habla y elige usar su voz para declarar las verdades de Dios.\n\nHoy edifica y no destruyas con tus palabras.',
        aplicacion: 'Bendice explícitamente a tus seres queridos hoy con palabras de afirmación y cariño.',
        pregunta_reflexion: '¿Qué tipo de frutos estás cosechando hoy por las palabras que has sembrado?',
        oracion: 'Espíritu Santo, pon un filtro en mis labios. Que cada palabra que pronuncie hoy transmita vida, esperanza y amor a quienes me escuchan. Amén.',
      },
      {
        numero_dia: 21,
        titulo: 'Muchos pensamientos, pero el consejo de Dios permanece',
        referencia_biblica: 'Proverbios 19:21',
        predicacion:
          '“Muchos pensamientos hay en el corazón del hombre; mas el consejo de Jehová permanecerá.”\n\nNuestra mente produce miles de pensamientos e ideas al día: dudas, suposiciones, planes y temores. Muchos de ellos se desvanecen con el tiempo.\n\nPero lo que Dios ha determinado para tu vida permanece firme para siempre. Ninguna circunstancia adversa puede frustrar el propósito eterno de Dios si tú caminas en fidelidad con Él.\n\nHoy descansa en la solidez de sus promesas inmutables.',
        aplicacion: 'Alinea un pensamiento de temor que tengas hoy con una promesa eterna de la Biblia.',
        pregunta_reflexion: '¿Te dejas llevar por pensamientos pasajeros o afirmas tu vida en la Palabra de Dios?',
        oracion: 'Padre soberano, aunque mis pensamientos fluctúen, descanso en la firmeza de tu consejo eterno. Cumple en mí tu santo propósito. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 22,
        titulo: 'Vence la tentación de la venganza',
        referencia_biblica: 'Proverbios 20:22',
        predicacion:
          '“No digas: Yo me vengaré; espera a Jehová, y él te salvará.”\n\nCuando alguien nos trata con injusticia o nos hace daño, el deseo de responder y pagar con la misma moneda puede ser muy intenso.\n\nPero tomar la venganza en nuestras manos solo nos llena de amargura y nos pone al mismo nivel del ofensor. Dejar la justicia en manos de Dios es el acto más valiente de fe.\n\nDios ve todo lo que sucede y Él cuidará de ti con perfecta justicia y amor.',
        aplicacion: 'Renuncia hoy formalmente en oración a cualquier deseo de venganza hacia quien te lastimó.',
        pregunta_reflexion: '¿Estás guardando deseos de revancha o confiando en la justicia perfecta de Dios?',
        oracion: 'Señor justo, te entrego las ofensas que he recibido. Renuncio a la venganza y elijo perdonar. Sé tú mi defensor y guarda mi corazón en paz. Amén.',
      },
      {
        numero_dia: 23,
        titulo: 'Dios pesa los corazones',
        referencia_biblica: 'Proverbios 21:2',
        predicacion:
          '“Todo camino del hombre es recto en su propia opinión; pero Jehová pesa los corazones.”\n\nEs fácil justificar nuestras actitudes ante nosotros mismos. Nos convencemos de que teníamos la razón o de que nuestra reacción era inevitable.\n\nPero Dios no solo mira lo que hacemos por fuera; Él pesa los motivos profundos del corazón: el amor, la intención secreta y la sinceridad.\n\nHoy pídele a Dios que examine tus motivaciones para que todo lo que hagas sea agradable a sus ojos.',
        aplicacion: 'Examina con sinceridad antes de dormir por qué hiciste las cosas hoy: ¿por vanagloria o por amor a Dios?',
        pregunta_reflexion: '¿Te conformas con parecer recto ante los demás o buscas un corazón puro ante Dios?',
        oracion: 'Examíname, oh Dios, y conoce mi corazón; pruébame y conoce mis pensamientos. Y ve si hay en mí camino de perversidad, y guíame en el camino eterno. Amén.',
      },
      {
        numero_dia: 24,
        titulo: 'El buen nombre vale más que las muchas riquezas',
        referencia_biblica: 'Proverbios 22:1',
        predicacion:
          '“De más estima es el buen nombre que las muchas riquezas, y la buena fama más que la plata y el oro.”\n\nEl dinero se puede ganar, perder y volver a conseguir. Pero la reputación de honestidad, lealtad y rectitud toma toda una vida construirla y puede destruirse en un segundo de compromiso con el pecado.\n\nCuidar tu buen nombre significa ser la misma persona en la luz que en la oscuridad.\n\nHoy valora tu integridad moral y espiritual por encima de cualquier beneficio pasajero.',
        aplicacion: 'Actúa con absoluta honestidad en una situación donde nadie más te esté vigilando.',
        pregunta_reflexion: '¿Es tu reputación un testimonio creíble del evangelio de Jesús?',
        oracion: 'Señor Jesús, concédeme la gracia de vivir con integridad irreprensible. Que mi vida honre tu nombre y sea testimonio de tu verdad dondequiera que vaya. Amén.',
      },
      {
        numero_dia: 25,
        titulo: 'Instruir con amor: El legado para los hijos',
        referencia_biblica: 'Proverbios 22:6',
        predicacion:
          '“Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.”\n\nEl mayor legado que podemos dejar a las siguientes generaciones no son bienes materiales ni títulos académicos, sino el conocimiento y el amor a Dios sembrados en el corazón.\n\nLos niños aprenden más de lo que ven en nuestra conducta diaria que de lo que escuchan en nuestros discursos. Tu ejemplo de oración, perdón y amor en casa es la mayor escuela espiritual.\n\nHoy siembra la Palabra de Dios en la vida de tus hijos y jóvenes cercanos.',
        aplicacion: 'Aparta 10 minutos para orar con tus hijos o por las siguientes generaciones de tu familia.',
        pregunta_reflexion: '¿Qué ejemplo espiritual estás transmitiendo en tu hogar día con día?',
        oracion: 'Padre celestial, bendice a nuestros hijos y a las nuevas generaciones. Danos sabiduría a los padres para instruirlos con amor y testimonio en tus santos caminos. Amén.',
      },
      {
        numero_dia: 26,
        titulo: 'Siete veces cae el justo y vuelve a levantarse',
        referencia_biblica: 'Proverbios 24:16',
        predicacion:
          '“Porque siete veces cae el justo, y vuelve a levantarse; mas los impíos caerán en el mal.”\n\nSer un creyente fiel no significa que nunca tropezarás ni enfrentarás desánimo. Habrá días en que falles, temporadas difíciles y momentos en que sientas que no puedes continuar.\n\nPero la marca de los hijos de Dios no es la ausencia de caídas, sino la gracia que los levanta del suelo una y otra vez.\n\nSi hoy has caído o te sientes derrotado, no te quedes en el suelo de la culpa. La mano de Dios está extendida para levantarte y darte un nuevo comienzo.',
        aplicacion: 'Levántate hoy de ese desánimo: confiésale a Dios tu falla, recibe su perdón y da el siguiente paso con fe.',
        pregunta_reflexion: '¿Te estás quedando en el suelo por la culpa de un error o aceptando la gracia de Dios para continuar?',
        oracion: 'Señor Jesús, gracias porque tu misericordia me levanta cuando caigo. Tomo tu mano poderosa, sacudo el desánimo y sigo adelante en tu victoria. Amén.',
      },
      {
        numero_dia: 27,
        titulo: 'Hierro con hierro se aguza: El valor del consejo sabio',
        referencia_biblica: 'Proverbios 27:17',
        predicacion:
          '“Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.”\n\nNadie puede crecer espiritualmente en el aislamiento. Necesitamos de hermanos en la fe que nos animen cuando estamos cansados, pero que también tengan la valentía y el amor para corregirnos cuando nos estamos desviando.\n\nEl consejo sabio de un amigo maduro pule nuestro carácter y nos ayuda a ver lo que nosotros mismos no podemos percibir.\n\nHoy sé dócil para recibir consejo y edificación mutua.',
        aplicacion: 'Acepta con gratitud una sugerencia o corrección que alguien te dé hoy sin molestarte ni ponerte a la defensiva.',
        pregunta_reflexion: '¿Tienes amigos de confianza en la fe que puedan hablar con sinceridad a tu vida?',
        oracion: 'Señor, líbrame de la terquedad y el aislamiento. Rodéame de personas sabias que afilen mi vida en tu verdad y dame humildad para escuchar su consejo. Amén.',
      },
      {
        numero_dia: 28,
        titulo: 'Confesar y apartarse: El camino de la misericordia',
        referencia_biblica: 'Proverbios 28:13',
        predicacion:
          '“El que encubre sus pecados no prosperará; mas el que los confiesa y se aparta alcanzará misericordia.”\n\nIntentar esconder nuestras faltas bajo la alfombra solo produce sequedad espiritual, culpa y distancia de Dios.\n\nPero cuando venimos a la presencia del Señor con total transparencia, admitiendo nuestras debilidades y con el deseo sincero de apartarnos de ellas, encontramos un océano inagotable de misericordia y perdón.\n\nHoy vive en la luz de la verdad de Dios.',
        aplicacion: 'Ten un momento de confesión sincera a solas con Dios, soltando cualquier pecado oculto que te haya estado robando la paz.',
        pregunta_reflexion: '¿Estás intentando ocultar alguna lucha o trayéndola a la luz de la gracia de Cristo?',
        oracion: 'Padre de amor, vengo a ti con el corazón al descubierto. Confieso mis faltas y te pido que limpies mi vida. Dame la fuerza para apartarme del mal y caminar en tu santidad. Amén.',
      },
      {
        numero_dia: 29,
        titulo: 'El temor al hombre vs. la confianza en Dios',
        referencia_biblica: 'Proverbios 29:25',
        predicacion:
          '“El temor del hombre pondrá lazo; mas el que confía en Jehová estará seguro.”\n\nPreocuparnos excesivamente por el qué dirán, por quedar bien con los demás o por el miedo al rechazo es una trampa que paraliza nuestra vida espiritual.\n\nCuando tu mayor deseo es agradar a Dios, el miedo a la opinión de los hombres pierde todo su poder. La única aprobación que realmente define tu vida y tu destino es la de tu Padre celestial.\n\nHoy sé libre del temor a las personas y descansa seguro en Dios.',
        aplicacion: 'Toma hoy una decisión guiada por tus convicciones en Cristo, sin dejarte presionar por las expectativas ajenas.',
        pregunta_reflexion: '¿Estás tomando decisiones para complacer a las personas o para honrar a Dios?',
        oracion: 'Señor, líbrame del lazo del temor a la opinión humana. Que mi mayor pasión sea agradarte a ti y que en tu amor perfecto encuentre mi total seguridad. Amén.',
      },
      {
        numero_dia: 30,
        titulo: 'La belleza que permanece: La reverencia a Dios',
        referencia_biblica: 'Proverbios 31:30',
        predicacion:
          '“Engañosa es la gracia, y vana la hermosura; la mujer que teme a Jehová, esa será alabada.”\n\nHemos completado 30 días recorriendo los tesoros del libro de Proverbios. El mundo gasta fortunas en la apariencia exterior, pero las arrugas llegan y las modas pasan.\n\nLo que nunca pierde su valor ni su resplandor es un corazón que ama, reverencia y obedece a Dios. La belleza interior del espíritu apacible, sabio y generoso perdura por toda la eternidad.\n\nQue la sabiduría de estos 30 días guíe cada uno de tus pasos a partir de hoy.',
        aplicacion: 'Agradece a Dios por haber completado este mes de sabiduría y elige tres proverbios para repasar frecuentemente en tu vida.',
        pregunta_reflexion: '¿Cómo ha transformado el libro de Proverbios tu forma de hablar, trabajar y relacionarte con los demás?',
        oracion: 'Señor Dios todopoderoso, gracias por estos 30 días de profunda sabiduría y dirección. Graba tus principios en la tabla de mi corazón para que camine con prudencia, justicia y paz todos los días de mi vida. ¡A ti sea la gloria por siempre! Amén.',
      },
    ],
  },
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
      aviso: 'Se generó a partir de nuestro catálogo pastoral curado. Para generar libros personalizados ilimitados, ingresa tu clave gratuita de Gemini.',
    };
  }

  const prompt = `
Eres un pastor y maestro bíblico cristiano evangélico con una profunda sensibilidad y calidez pastoral (Biblia Reina-Valera 1960).
Vas a crear un PLAN DEVOCIONAL DE ESTUDIO BÍBLICO PROFESIONAL DE ${numDias} DÍAS SOBRE: ${libroOCapitulo}.
Temática central: ${tema}.

CADA DÍA DEBE SER UNA REFLEXIÓN DEVOCIONAL PROFUNDA Y CÁLIDA (Estilo "Nuestro Pan Diario" o YouVersion):
- Título inspirador y directo (máximo 8 palabras)
- Pasaje bíblico exacto (RV1960)
- Reflexión pastoral completa en párrafos cortos y fluidos (1 a 3 oraciones por párrafo) separados por saltos de línea dobles (\\n\\n). PROHIBIDO usar números romanos o divisiones académicas frías (NO usar "I." ni "II."). Debe hablar al corazón y a la vida real con amor y esperanza.
- Aplicación para hoy: Un paso de fe claro, práctico y edificante.
- Para meditar: Una pregunta de autoexamen espiritual amorosa y profunda.
- Oración especial: Oración sincera y vulnerable en primera persona para sellar el día.

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
      "predicacion": "Reflexión en párrafos cortos (1 a 3 oraciones) separados por saltos de línea dobles (\\\\n\\\\n), cercana, bíblica y sin números romanos.",
      "aplicacion": "Paso de fe concreto y edificante para hoy.",
      "pregunta_reflexion": "Pregunta de autoexamen espiritual amorosa.",
      "oracion": "Oración especial sincera en primera persona."
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
