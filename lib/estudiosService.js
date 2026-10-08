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
  {
    id: 'semilla-estudio-7d-santiago',
    titulo: 'Santiago: La Fe Viva en el Mundo Real',
    descripcion: 'Un recorrido profundo de 7 días versículo a versículo por la carta de Santiago. Aprende a convertir las pruebas en madurez, frenar la lengua, orar con fe sin doble ánimo y demostrar tu amor con obras prácticas.',
    tema: 'Libros Bíblicos',
    num_dias: 7,
    portada_url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80',
    dias: [
      {
        numero_dia: 1,
        titulo: 'El gozo en medio de las pruebas: La forja de la constancia',
        referencia_biblica: 'Santiago 1:2-4, 12',
        predicacion:
          'Santiago comienza su carta sin rodeos, hablándole a creyentes dispersos que enfrentaban persecución, pérdidas materiales e incertidumbre social: “Hermanos míos, tened por sumo gozo cuando os halléis en diversas pruebas.”\n\nA primera vista, pedirnos que tengamos gozo frente al sufrimiento parece una contradicción casi inhumana. Sin embargo, Santiago no nos pide que disfrutemos del dolor en sí mismo, sino que nos gocemos en el fruto eterno que Dios produce a través de la prueba.\n\nEn la vida real, las temporadas difíciles funcionan como un crisol donde el oro es purificado al fuego. La prueba saca a la superficie nuestras falsas seguridades, nuestra autosuficiencia y nuestros apegos terrenales, revelando la autenticidad de nuestra fe.\n\n“Sabiendo que la prueba de vuestra fe produce paciencia. Mas tenga la paciencia su obra completa, para que seáis perfectos y cabales, sin que os falte cosa alguna.” La palabra griega para paciencia aquí es *hypomoné*, que significa constancia heroica, la capacidad de resistir bajo una carga pesada sin rendirse.\n\nCuando atraviesas una prueba tomado de la mano de Dios, no sales debilitado; sales con raíces espirituales mucho más profundas, con mayor madurez y con un carácter semejante al de Cristo.',
        aplicacion: 'Frente a esa dificultad que hoy te genera incomodidad o tristeza, cambia tu oración de queja por una de entrega: “Señor, no entiendo toda esta prueba, pero decido confiar en que estás forjando madurez y paciencia en mi carácter”.',
        pregunta_reflexion: '¿Sueles ver las dificultades como un castigo o como un taller divino para fortalecer y purificar tu fe?',
        oracion: 'Padre celestial, gracias porque ninguna prueba en mi vida escapa de tu soberanía y amor. Cuando sienta que el camino es difícil, dame la gracia de mirar más allá del dolor presente y esperar en el fruto bendito de la paciencia que estás formando en mí. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 2,
        titulo: 'Pedir sabiduría sin dudar: Vencer el doble ánimo',
        referencia_biblica: 'Santiago 1:5-8',
        predicacion:
          'Cuando nos encontramos en una encrucijada difícil, lo primero que necesitamos desesperadamente no es más dinero ni más opiniones humanas, sino sabiduría divina para saber cómo actuar.\n\nSantiago nos da una invitación abierta y reconfortante: “Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.” Dios no se enoja contigo por reconocer que no sabes qué hacer; al contrario, se complace en guiar a los humildes de corazón.\n\nPero el pasaje añade una condición fundamental: “Pero pida con fe, no dudando nada; porque el que duda es semejante a la onda del mar, que es arrastrada por el viento y echada de una parte a otra.”\n\nEl hombre de “doble ánimo” (*dipsyjos* en griego) es literalmente una persona con el corazón dividido: con un pie en las promesas de Dios y con el otro en la lógica del mundo; queriendo la dirección de Dios los domingos, pero actuando según sus propios caprichos de lunes a sábado.\n\nLa verdadera sabiduría no es acumular datos en la mente, sino tener la valentía espiritual de obedecer el consejo de Dios aun cuando vaya en contra de la corriente de este siglo.\n\nHoy Dios te pide que unifiques tu corazón. No vaciles en dos pensamientos: rinde tus decisiones ante su altar y camina con firmeza.',
        aplicacion: 'Identifica una decisión importante que debas tomar esta semana. Antes de pedir consejo a otras personas o actuar por impulso, pasa 10 minutos a solas con tu Biblia abierta pidiendo dirección a Dios y decidiendo de antemano obedecer lo que Él te muestre.',
        pregunta_reflexion: '¿Estás buscando la sabiduría de Dios con un corazón totalmente decidido a obedecer, o solo buscando que Dios apruebe lo que tú ya decidiste?',
        oracion: 'Señor de la gloria, hoy reconozco que mis solas fuerzas y mi lógica humana son insuficientes para gobernar mi vida. Te pido de tu sabiduría santa y abundante para cada decisión en mi trabajo, mi hogar y mis relaciones. Quita de mí la vacilación y el doble ánimo, y afirma mis pasos en tu verdad. Amén.',
      },
      {
        numero_dia: 3,
        titulo: 'Hacedores y no tan solo oidores: El espejo de la Palabra',
        referencia_biblica: 'Santiago 1:19-25',
        predicacion:
          'Una de las trampas más sutiles en la vida cristiana es confundir el conocimiento bíblico con la verdadera madurez espiritual.\n\nPodemos escuchar sermones todas las semanas, leer devocionales en el teléfono, memorizar versículos bíblicos y comentar en redes sociales sobre teología, y aun así seguir teniendo un carácter áspero, un matrimonio descuidado o un corazón lleno de rencor.\n\nSantiago nos confronta con una analogía inolvidable: “Sed hacedores de la palabra, y no tan solamente oidores, engañándoos a vosotros mismos. Porque si alguno es oidor de la palabra pero no hacedor... es semejante al hombre que considera en un espejo su rostro natural. Porque él se considera a sí mismo, y se va, y luego olvida cómo era.”\n\nEl propósito de mirarse en un espejo no es simplemente contemplar la suciedad en el rostro para luego alejarse sin lavarse. El espejo de la Palabra de Dios nos muestra nuestras manchas, nuestro orgullo y nuestras áreas no rendidas para que corramos a la gracia de Cristo y permitamos que Él nos limpie y transforme.\n\n“Mas el que mira atentamente en la perfecta ley, la de la libertad, y persevera en ella... este será bienaventurado en lo que hace.”\n\nLa bendición no se derrama sobre los que simplemente acumulan información bíblica en la cabeza, sino sobre los que bajan esa verdad al barro de la vida cotidiana a través de la obediencia fiel.',
        aplicacion: 'Revisa qué mandato bíblico específico has estado postergando o pasando por alto en estos días (perdonar a alguien, dejar de murmurar, ser generoso, pedir disculpas) y ponlo por obra hoy mismo antes de que termine el día.',
        pregunta_reflexion: '¿Está tu vida diaria reflejando lo que aprendes en la Biblia, o hay una distancia entre lo que profesas creer y cómo te comportas en lo privado?',
        oracion: 'Padre Santo, perdóname por las veces en que he sido un simple oidor de tu Palabra, engañándome a mí mismo con religiosidad exterior. Que tu Espíritu Santo quiebre toda dureza en mi corazón y me dé la gracia de ser un hacedor fiel de tus mandamientos en cada área de mi vida. En Cristo Jesús, amén.',
      },
      {
        numero_dia: 4,
        titulo: 'La fe que se ve: Obras vivas que demuestran la gracia',
        referencia_biblica: 'Santiago 2:14-26',
        predicacion:
          'La salvación es un regalo inmerecido que recibimos por pura gracia mediante la fe en Jesucristo, no por obras para que nadie se gloríe (Efesios 2:8-9).\n\nSin embargo, Santiago plantea la otra cara inseparable de esa misma moneda: si esa fe que dices tener es genuina, ¿dónde están las evidencias visibles en tu manera de vivir?\n\n“Hermanos míos, ¿de qué aprovechará si alguno dice que tiene fe, y no tiene obras? ¿Podrá la fe salvarle? Y si un hermano o una hermana están desnudos, y tienen necesidad del mantenimiento de cada día, y alguno de vosotros les dice: Id en paz, calentaos y saciaos, pero no les dais las cosas que son necesarias para el cuerpo; ¿de qué aprovecha? Así también la fe, si no tiene obras, es muerta en sí misma.”\n\nUna fe que solo se queda en frases bonitas pero que no se compadece del necesitado, que no comparte el pan con el hambriento y que no muestra amor activo, es una fe estéril.\n\nSantiago utiliza el ejemplo de Abraham ofreciendo a Isaac y de Rahab arriesgando su vida para proteger a los espías. Ambos demostraron que su confianza en Dios era real porque sus acciones respaldaron sus palabras.\n\nEl cristianismo verdadero no es una filosofía abstracta; es un estilo de vida que huele a misericordia, a generosidad y a servicio desinteresado hacia los demás.',
        aplicacion: 'Haz una obra concreta de misericordia hoy: ayuda económicamente a alguien en necesidad, comparte un alimento o dedica tiempo para servir a una persona vulnerable sin buscar reconocimiento alguno.',
        pregunta_reflexion: 'Si alguien observara tus acciones, tus gastos y tu trato con los demás durante esta semana, ¿encontraría pruebas claras de que vives por fe?',
        oracion: 'Señor Jesús, no quiero una fe vacía de palabras que no toque la realidad de quienes sufren. Abre mis ojos a la necesidad de mi prójimo y dame un corazón generoso y compasivo como el tuyo. Que mi vida sea un testimonio vivo de tu amor a través de acciones concretas de bien. Amén.',
      },
      {
        numero_dia: 5,
        titulo: 'El timón de la nave: El poder creativo y destructor de la lengua',
        referencia_biblica: 'Santiago 3:1-12',
        predicacion:
          'Santiago dedica uno de los pasajes más solemnes y gráficos de todo el Nuevo Testamento a un miembro diminuto de nuestro cuerpo: la lengua.\n\nNos muestra cómo los caballos más fuertes son gobernados por un pequeño freno en la boca, y cómo las naves más gigantescas son dirigidas en medio de vientos tempestuosos por un timón muy pequeño. De igual manera, un bosque inmenso puede ser consumido por una diminuta chispa de fuego.\n\n“Y la lengua es un fuego, un mundo de maldad... inflama la rueda de la creación, y ella misma es inflamada por el infierno.”\n\nCuántas familias se han destruido por comentarios venenosos, cuántas reputaciones han sido arruinadas por chismes infundados y cuántas heridas profundas han quedado en el corazón de hijos y cónyuges por gritos y sarcasmos dichos en un arranque de enojo.\n\n“De una misma boca proceden bendición y maldición. Hermanos míos, esto no debe ser así. ¿Acaso alguna fuente echa por una misma abertura agua dulce y amarga?”\n\nNuestras palabras son un termómetro infalible del estado real de nuestro corazón. No podemos cantar alabanzas a Dios los domingos y pasar el resto de la semana destruyendo con murmuraciones a nuestros hermanos creados a su imagen.\n\nHoy Dios te llama a consagrar tu lengua. Tus palabras tienen el poder divino de impartir vida, ánimo, consuelo y verdad.',
        aplicacion: 'Haz un compromiso sagrado para el día de hoy: no participes de ningún chisme ni crítica destructiva. Si alguien comienza a hablar mal de otra persona en tu presencia, cambia el tema con amabilidad o resalta una virtud de la persona ausente.',
        pregunta_reflexion: '¿Están tus palabras cotidianas edificando y trayendo paz a quienes te rodean, o dejando heridas de juicio y amargura?',
        oracion: 'Padre celestial, reconozco con dolor que muchas veces he pecado con mi boca, usando mis palabras para quejarme, juzgar o lastimar. Te pido perdón y rindo mi lengua a la autoridad del Espíritu Santo. Pon guarda a mi boca, oh Jehová; guarda la puerta de mis labios. Que cada palabra mía hoy sea sazonada con gracia. Amén.',
      },
      {
        numero_dia: 6,
        titulo: 'Gracia para los humildes: Someteos a Dios y el diablo huirá',
        referencia_biblica: 'Santiago 4:6-10',
        predicacion:
          'El orgullo es la raíz oculta detrás de la gran mayoría de nuestras contiendas, resentimientos y frustraciones espirituales.\n\nQueremos que las cosas se hagan a nuestra manera, nos sentimos ofendidos cuando no nos reconocen y entramos en pleitos porque nuestros deseos egoístas no son satisfechos.\n\nSantiago nos confronta con una verdad contundente: “Dios resiste a los soberbios, y da gracia a los humildes.” La palabra “resiste” describe a un ejército que se pone en formación de batalla en contra de un enemigo. Nada frena tanto la bendición y el favor de Dios en tu vida como el orgullo autosuficiente.\n\nPero para quien se humilla sinceramente, hay una fuente inagotable de gracia disponible. Y Santiago nos entrega el mapa de la libertad espiritual en tres pasos claros:\n\n1. “Someteos, pues, a Dios”: rinde tus planes, tus emociones y tus derechos bajo su señorío absoluto.\n2. “Resistid al diablo, y huirá de vosotros”: el enemigo no tiene autoridad sobre una vida que camina en obediencia a Cristo.\n3. “Acercaos a Dios, y él se acercará a vosotros”: no hay distancia que Dios no acorte cuando das un paso de arrepentimiento hacia Él.\n\n“Humillaos delante del Señor, y él os exaltará.” Cuando tú dejas de buscar autopromocionarte y aprendes a menguar, la mano todopoderosa de Dios se encarga de levantarte a su debido tiempo.',
        aplicacion: 'Arrodíllate hoy en tu tiempo devocional en señal física de reverencia. Rinde ante Dios cualquier área de orgullo o autosuficiencia y dile: “Señor, no soy yo, eres tú; rindo mi voluntad a la tuya”.',
        pregunta_reflexion: '¿En qué aspecto de tu vida has estado resistiéndote a la voluntad de Dios por defender tu orgullo o tus propios intereses?',
        oracion: 'Señor todopoderoso, me humillo delante de tu santa majestad. Rindo en tu altar mi orgullo, mi vanagloria y todo deseo de reconocimiento terrenal. Me someto enteramente a tu autoridad y resisto toda mentira del enemigo en mi vida. Acércame a tu corazón y enséñame a caminar en la hermosura de la santidad. En Jesús, amén.',
      },
      {
        numero_dia: 7,
        titulo: 'La paciencia del sembrador y la oración eficaz del justo',
        referencia_biblica: 'Santiago 5:7-16',
        predicacion:
          'Llegamos al final de la carta de Santiago, y el apóstol fija nuestra mirada en la esperanza final y en la perseverancia cotidiana.\n\n“Por tanto, hermanos, tened paciencia hasta la venida del Señor. Mirad cómo el labrador espera el precioso fruto de la tierra, aguardando con paciencia hasta que reciba la lluvia temprana y la tardía. Tened también vosotros paciencia, y afirmad vuestros corazones; porque la venida del Señor se acerca.”\n\nEl agricultor sabe que sembrar la semilla no produce una cosecha al día siguiente. Hay temporadas de silencio, de frío y de espera donde parece que nada ocurre bajo la tierra, pero la semilla está muriendo para dar fruto abundante.\n\nDe la misma manera, tus oraciones, tu fidelidad en lo secreto y tus sacrificios por la causa de Cristo no han sido en vano. Aunque el fruto tarde, la lluvia de Dios llegará a su tiempo exacto.\n\nY Santiago corona su enseñanza con una promesa que debe encender el fuego de nuestra devoción: “La oración eficaz del justo puede mucho.” Nos recuerda a Elías, un hombre con pasiones semejantes a las nuestras, que oró fervientemente y Dios cerró y abrió los cielos.\n\nTú no necesitas ser una figura inalcanzable para que Dios te escuche; necesitas un corazón justo, limpio por la sangre de Jesús y perseverante en la fe.\n\nConcluye este estudio con la convicción de que tu fe no es una teoría: es una vida viva, práctica y respaldada por el poder de Dios.',
        aplicacion: 'Haz una lista de 3 peticiones por las que lleves mucho tiempo orando sin ver respuesta. Ora hoy con la fe renovada de un sembrador que confía en que la lluvia de Dios descenderá sobre esa semilla.',
        pregunta_reflexion: '¿Has estado desanimándote en la espera de ver tus oraciones contestadas, olvidando que Dios siempre recompensa la perseverancia fiel?',
        oracion: 'Dios eterno y fiel, gracias por estos 7 días de estudio en la carta de Santiago. Afirma mi corazón en la constancia santa del sembrador. Ayúdame a vivir una fe activa, llena de amor, de prudencia en mis palabras y de profunda oración. Que mi vida entera sea un testimonio fiel para tu Reino. ¡A ti sea la gloria por siempre! Amén.',
      },
    ],
  },
  {
    id: 'semilla-estudio-7d-pedro',
    titulo: 'Pedro: Del Fracaso a la Roca de Fe',
    descripcion: 'Un estudio biográfico profundo de 7 días sobre el apóstol Pedro. Descubre cómo Jesús tomó a un pescador impulsivo, trató con su orgullo, lo restauró tras su caída más dolorosa y lo convirtió en una columna inquebrantable de la Iglesia.',
    tema: 'Discípulos y Personajes',
    num_dias: 7,
    portada_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    dias: [
      {
        numero_dia: 1,
        titulo: 'El llamado en la orilla: Bogar mar adentro y rendir las redes',
        referencia_biblica: 'Lucas 5:1-11',
        predicacion:
          'Simón Pedro era un pescador experimentado del mar de Galilea. Conocía las corrientes, los vientos y las mejores horas para tirar las redes.\n\nSin embargo, aquella noche había sido un fracaso absoluto: “Maestro, toda la noche hemos estado trabajando, y nada hemos pescado.” Pedro estaba cansado, frustrado y lavando sus redes vacías en la orilla cuando Jesús subió a su barca.\n\nJesús no se asustó de las redes vacías de Pedro. Le dio una orden contraria a toda lógica humana de la pesca: “Boga mar adentro, y echad vuestras redes para pescar.”\n\nPescar a plena luz del día en aguas profundas iba en contra de toda la experiencia profesional de Pedro. Pero en ese instante decisivo, Pedro pronunció las palabras que cambiaron el curso de su historia: “Mas en tu palabra echaré la red.”\n\nEl resultado fue una pesca tan milagrosa y abundante que las redes se rompían y las barcas comenzaban a hundirse. Al ver el poder santo de Jesús, Pedro cayó de rodillas diciendo: “Apártate de mí, Señor, porque soy hombre pecador.”\n\nPero Jesús no vino a apartarse de los pecadores, sino a llamarlos: “No temas; desde ahora serás pescador de hombres.” Dejándolo todo, Pedro se levantó y le siguió.',
        aplicacion: 'Frente a esa área de tu vida donde sientes que has trabajado duro sin ver fruto (trabajo, familia, fe), di hoy en oración: “Señor, en tu palabra volveré a intentarlo”. Rinde tu experiencia humana ante la autoridad de Jesús.',
        pregunta_reflexion: '¿Estás dispuesto a "bogar mar adentro" y obedecer a Jesús aun cuando sus instrucciones desafíen tu propia lógica?',
        oracion: 'Señor Jesús, muchas veces me he sentido cansado de remar en mis propias fuerzas con redes vacías. Hoy reconozco tu señorío y decido actuar bajo tu Palabra. Toma mi barca, mis talentos y mi vida entera; hazme un instrumento útil para tu Reino. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 2,
        titulo: 'Caminar sobre las aguas: Cuando la mirada se desvía a la tormenta',
        referencia_biblica: 'Mateo 14:22-33',
        predicacion:
          'La barca de los discípulos estaba en medio del mar en plena madrugada, azotada con violencia por olas contrarias y un viento tempestuoso.\n\nDe pronto, vieron a Jesús caminando sobre las aguas. El miedo inicial se transformó en asombro cuando Pedro, con su característico ímpetu, dijo: “Señor, si eres tú, manda que yo vaya a ti sobre las aguas. Y él dijo: Ven.”\n\nPedro bajó de la barca y comenzó a caminar sobre las aguas hacia Jesús. Es fácil criticar a Pedro por lo que sucedió después, pero olvidamos que fue el único entre los doce discípulos que tuvo la valentía de poner sus pies sobre el mar embravecido.\n\nEl problema comenzó cuando Pedro cambió el foco de su atención: “Pero al ver el fuerte viento, tuvo miedo; y comenzando a hundirse, dio voces, diciendo: ¡Señor, sálvame!”\n\nEn el momento exacto en que Pedro quitó sus ojos de Jesús y miró la altura de las olas y la fuerza del viento, la gravedad de sus temores humanos lo arrastró hacia el fondo. Lo que te hunde en la vida no es la fuerza de las dificultades exteriores, sino desviar la mirada del Salvador que te llamó a caminar sobre ellas.\n\nY la reacción de Jesús es conmovedora: “Al momento Jesús, extendiendo la mano, asió de él.” Jesús no lo dejó ahogar para darle una lección; lo tomó de la mano primero, y luego le enseñó con amor: “¡Hombre de poca fe! ¿Por qué dudaste?”',
        aplicacion: 'Cuando sientas que los problemas o las malas noticias intentan abrumarte hoy, haz una pausa consciente y enfoca tus pensamientos en la fidelidad de Cristo. Recuerda que Él es más grande que cualquier viento en contra.',
        pregunta_reflexion: '¿En qué estás fijando tu mirada en estos días: en el tamaño de tus olas o en el poder de Jesús que camina sobre ellas?',
        oracion: 'Señor Jesús, cuando el viento ruja y la incertidumbre intente hacerme dudar, no permitas que desvíe mis ojos de ti. Extiende tu mano de poder y sostenme. Enséñame a caminar en fe por encima de las dificultades, confiando en que tú estás conmigo. Amén.',
      },
      {
        numero_dia: 3,
        titulo: 'La gran confesión: "¿Quién decís que soy yo?" y la roca de la fe',
        referencia_biblica: 'Mateo 16:13-19',
        predicacion:
          'En la región de Cesarea de Filipo, un lugar lleno de templos paganos y estatuas de emperadores que se hacían llamar dioses, Jesús le hizo a sus discípulos la pregunta más trascendental de la historia humana:\n\n“Y vosotros, ¿quién decís que soy yo?”\n\nMuchos decían que era Juan el Bautista resucitado, otros que era Elías o Jeremías, o alguno de los antiguos profetas. La gente tenía muchas opiniones interesantes sobre Jesús, pero Jesús no buscaba la opinión de las multitudes; quería conocer la convicción íntima de sus seguidores más cercanos.\n\nSimón Pedro dio un paso al frente y proclamó con fuego divino: “Tú eres el Cristo, el Hijo del Dios viviente.”\n\nJesús le respondió: “Bienaventurado eres, Simón, hijo de Jonás, porque no te lo reveló carne ni sangre, sino mi Padre que está en los cielos. Y yo también te digo, que tú eres Pedro, y sobre esta roca edificaré mi iglesia; y las puertas del Hades no prevalecerán contra ella.”\n\nLa roca inamovible no era la persona imperfecta y fluctuante de Pedro, sino la revelación eterna que Pedro acababa de confesar: que Jesús es el Mesías, el Salvador, el Hijo del Dios viviente.\n\nTu fe no se fundamenta en tradiciones familiares ni en emociones temporales; se apoya sobre la verdad inquebrantable de quién es Jesucristo. Cuando Cristo es el cimiento de tu vida, ni las crisis más oscuras ni las puertas del infierno podrán derribar tu esperanza.',
        aplicacion: 'Haz una confesión personal de fe hoy en tu oración: proclama en voz alta que Jesús es el Señor de tu vida, el dueño de tu hogar y el Rey de tu corazón.',
        pregunta_reflexion: 'Para ti personalmente, en tu día a día, ¿quién es Jesús? ¿Es solo un personaje histórico o el Señor viviente que gobierna tus decisiones?',
        oracion: 'Jesús, confieso hoy con todo mi corazón que tú eres el Cristo, el Hijo del Dios viviente, mi Señor y mi Redentor. Edifico mi vida, mis proyectos y mi familia sobre la roca eterna de tu salvación. Que nada ni nadie mueva mi fe de tu verdad. Amén.',
      },
      {
        numero_dia: 4,
        titulo: 'El lavamiento de los pies: Vencer el orgullo para ser servido por Jesús',
        referencia_biblica: 'Juan 13:1-10',
        predicacion:
          'En la última cena, en la víspera de su crucifixión, Jesús hizo algo que dejó atónitos a todos los presentes.\n\nSe levantó de la mesa, se quitó su manto, tomó una toalla y un lebrillo de agua, y comenzó a lavar los pies sucios y polvorientos de sus discípulos, secándolos con la toalla con la que estaba ceñido.\n\nEn la cultura judía del primer siglo, lavar los pies de los invitados era la tarea más baja y denigrante, reservada exclusivamente para los esclavos gentiles más humildes. Ningún maestro judío se rebajaba jamás a hacer semejante labor.\n\nCuando Jesús llegó a Simón Pedro, este retrocedió escandalizado por su orgullo religioso: “Señor, ¿tú me lavas los pies a mí? No me lavarás los pies jamás.”\n\nA veces nuestro orgullo humano se disfraza de falsa humildad: nos cuesta recibir la gracia, nos incomoda mostrarnos necesitados y preferimos pensar que nosotros podemos hacer cosas por Dios antes que dejar que Dios haga su obra purificadora en nosotros.\n\nLa respuesta de Jesús a Pedro fue tajante y llena de luz: “Si no te lavare, no tendrás parte conmigo.”\n\nPara caminar con Jesús, lo primero que debemos hacer es derribar la autosuficiencia y permitir que Él lave nuestras faltas, nuestro cansancio y las áreas sucias de nuestro corazón con su gracia perdonadora.',
        aplicacion: 'Examina si hay alguna falta o carga que has estado ocultando por orgullo o vergüenza. Preséntate hoy ante Jesús y dile: “Señor, lávame por completo; no quiero tener nada en mí que no esté rendido a tu gracia”.',
        pregunta_reflexion: '¿Te cuesta aceptar que necesitas la gracia y el perdón diario de Jesús, o intentas justificarte por tus propias obras buenas?',
        oracion: 'Señor Jesús, me conmueve ver tu humildad incomparable lavando los pies de tus discípulos. Rindo ante ti toda autosuficiencia y falsa piedad. Lávame de mis pecados, limpia mis pensamientos y renuévame en tu amor. Enséñame también a servir a mis hermanos con tu misma mansedumbre. Amén.',
      },
      {
        numero_dia: 5,
        titulo: 'La noche de la negación: El canto del gallo y las lágrimas del orgullo roto',
        referencia_biblica: 'Lucas 22:54-62; Mateo 26:31-35',
        predicacion:
          'Pocas horas antes de ser arrestado, Jesús les advirtió a los discípulos que todos se escandalizarían de Él aquella noche.\n\nPedro, confiando plenamente en su propia fuerza de voluntad, afirmó con vehemencia: “Aunque todos se escandalicen de ti, yo nunca me escandalizaré. Aunque me sea necesario morir contigo, no te negaré.”\n\nPedro amaba a Jesús de verdad, pero cometió el gravísimo error de confiar en sus propias fuerzas carnales en lugar de velar y orar en el huerto de Getsemaní. Cuando vino la prueba real en el patio del sumo sacerdote, el miedo lo acorraló.\n\nFrente a una criada y a los sirvientes que calentaban sus manos junto al fuego, Pedro negó a Jesús tres veces con juramentos y maldiciones: “Hombre, no conozco al hombre.”\n\n“Y en seguida, mientras él todavía hablaba, el gallo cantó. Entonces, vuelto el Señor, miró a Pedro; y Pedro se acordó de la palabra del Señor... Y Pedro, saliendo fuera, lloró amargamente.”\n\nAquella mirada de Jesús a través del patio no fue una mirada de odio ni de desprecio condenatorio; fue una mirada de dolor entrañable y de amor que quebrantó el orgullo de Pedro hasta las entrañas.\n\nEl fracaso de Pedro no fue el final de su historia; fue el entierro necesario de su autosuficiencia para que pudiera nacer un hombre verdaderamente dependiente de la gracia de Dios.',
        aplicacion: 'Si alguna vez le has fallado a Dios y sientes que la culpa no te deja levantar la cabeza, recuerda las lágrimas de Pedro. No huyas de Jesús; corre hacia sus brazos de perdón hoy.',
        pregunta_reflexion: '¿Has confiado demasiado en tu propia fuerza de voluntad en lugar de pedir la ayuda diaria del Espíritu Santo para vencer la tentación?',
        oracion: 'Padre misericordioso, reconozco con dolor las veces en que mis acciones, palabras o silencios te han negado. Perdóname por confiar en mis propias fuerzas carnales. Quebranta todo orgullo en mí y recibe mis lágrimas de arrepentimiento sincero. Gracias porque tu gracia es mayor que cualquiera de mis caídas. En Jesús, amén.',
      },
      {
        numero_dia: 6,
        titulo: 'Las brasas en la playa: "¿Me amas? Apacienta mis ovejas" (La restauración)',
        referencia_biblica: 'Juan 21:15-19',
        predicacion:
          'Después de la resurrección, Pedro había vuelto a Galilea con las redes de pescar, cargando en silencio el peso desgarrador de haber negado a su Maestro tres veces.\n\nJesús resucitado se les apareció al amanecer en la orilla del lago, preparándoles un fuego de brasas con pescado y pan. Fíjate en este detalle conmovedor: la última vez que Pedro había estado junto a un fuego de brasas fue la noche en que negó a Jesús.\n\nJesús no trajo a Pedro a la playa para recordarle su traición ni para humillarlo delante de los demás discípulos. Le hizo tres veces una sola pregunta que fue directo al fondo de su corazón:\n\n“Simón, hijo de Jonás, ¿me amas más que estos? Le dijo: Sí, Señor; tú sabes que te amo. Él le dijo: Apacienta mis corderos.”\n\nPor cada una de las tres negaciones de Pedro, Jesús le dio una triple oportunidad de confesar su amor y de recibir una comisión pastoral renovada.\n\nJesús no le preguntó a Pedro: “¿Me prometes que nunca volverás a equivocarte?” o “¿Tienes un currículum perfecto?” Le preguntó: “¿Me amas?” Porque el único combustible que puede sostener un ministerio cristiano fiel y una vida de servicio a través de los años no es la confianza propia, sino el amor apasionado y agradecido a Cristo.\n\nJesús sanó la herida de Pedro en el mismo lugar donde se había producido. Tu pasado de errores no te descalifica para el Reino cuando vienes arrepentido al amor restaurador del Salvador.',
        aplicacion: 'Dile a Jesús hoy con el corazón en la mano: “Señor, tú conoces mis debilidades y mis caídas, pero tú sabes que te amo”. Permite que su perdón te levante a servirle con renovada pasión.',
        pregunta_reflexion: '¿Estás permitiendo que tus fracasos del pasado te impidan servir a Dios y amar a los demás hoy?',
        oracion: 'Señor Jesús, gracias por tu infinita misericordia que restaura y levanta a los caídos. Tú conoces todas las cosas; tú sabes que te amo. Sana mis recuerdos dolorosos y capacítame para amar, cuidar y alentar a otros con la misma gracia con la que tú me has abrazado. Heme aquí, envíame a mí. Amén.',
      },
      {
        numero_dia: 7,
        titulo: 'De pescador temeroso a columna del Reino: La fe probada como el oro',
        referencia_biblica: 'Hechos 2:14-41; 1 Pedro 1:3-7',
        predicacion:
          'Pocas semanas después de haber llorado amargamente en la noche del juicio, el cambio sobrenatural en Pedro se hizo visible ante los ojos de todo el mundo.\n\nEn el día de Pentecostés, lleno del poder del Espíritu Santo, Pedro se puso en pie con denuedo y predicó el evangelio a miles de personas en Jerusalén, declarando con valentía que el mismo Jesús a quien habían crucificado, Dios lo había hecho Señor y Cristo. Aquel día se añadieron tres mil almas a la Iglesia.\n\nAños más tarde, ya como un anciano pastor maduro que había soportado prisiones, azotes y pruebas incontables, Pedro escribió en su carta pastoral (1 Pedro 1:6-7):\n\n“En lo cual vosotros os alegráis, aunque ahora por un poco de tiempo, si es necesario, tengáis que ser afligidos en diversas pruebas, para que sometida a prueba vuestra fe, mucho más preciosa que el oro, el cual aunque perecedero se prueba con fuego, sea hallada en alabanza, gloria y honra cuando sea manifestado Jesucristo.”\n\nPedro hablaba con la autoridad de quien había sido probado en el fuego de la caída y purificado por el amor perdonador de Dios. La roca no era Pedro en su fuerza carnal; la roca era la obra que Cristo hizo en Pedro.\n\nEl mismo Dios que tomó a aquel pescador rudo e inestable y lo convirtió en un apóstol fiel hasta el martirio, tiene el poder para transformar tu vida hoy. Entrega tus debilidades en las manos del alfarero divino y permítele moldear tu carácter para su gloria.',
        aplicacion: 'Agradece a Dios por haber completado este estudio sobre la vida de Pedro. Pídele al Espíritu Santo que te llene de valentía para compartir tu fe y hablar del amor de Cristo sin temor.',
        pregunta_reflexion: '¿Puedes ver cómo Dios ha utilizado tus momentos difíciles y tus errores del pasado para forjar en ti una fe más madura y compasiva?',
        oracion: 'Padre celestial, gracias por el testimonio vivo de tu siervo Pedro. Gracias porque no desechas a los imperfectos, sino que los capacitas y los levantas con tu poder. Lléname de tu Santo Espíritu, quita de mí todo temor y hazme una columna firme de fe y amor en tu Reino. En el poderoso nombre de Jesús, amén.',
      },
    ],
  },
  {
    id: 'semilla-estudio-7d-paz',
    titulo: 'Paz Sobrenatural: Vencer la Ansiedad y Descansar en Dios',
    descripcion: 'Un plan devocional intensivo y profundo de 7 días para aquietar la mente, vencer el insomnio, soltar el control del futuro y experimentar la shalom de Cristo en medio de cualquier tormenta cotidiana.',
    tema: 'Paz y Ansiedad',
    num_dias: 7,
    portada_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    dias: [
      {
        numero_dia: 1,
        titulo: 'La raíz del afán: Aprender a vivir un día a la vez',
        referencia_biblica: 'Mateo 6:25-34',
        predicacion:
          'La ansiedad es esencialmente un intento agotador de vivir el día de mañana con las fuerzas de hoy.\n\nNos adelantamos en el calendario mental imaginando problemas económicos, crisis familiares o enfermedades que todavía no han ocurrido, desgastando la energía que Dios nos dio para ser fieles en el presente.\n\nJesús aborda la raíz profunda de este afán con una ternura magistral: “Por tanto os digo: No os afanéis por vuestra vida, qué habéis de comer o qué habéis de beber; ni por vuestro cuerpo, qué habéis de vestir. ¿No es la vida más que el alimento, y el cuerpo más que el vestido? Mirad las aves del cielo... y vuestro Padre celestial las alimenta. ¿No valéis vosotros mucho más que ellas?”\n\nNadie puede añadir un solo codo a su estatura por mucho que se preocupe. La preocupación no vacía el mañana de sus problemas; solo vacía el día de hoy de su fuerza y de su paz.\n\n“Basta a cada día su propio afán.” Dios no nos da provisiones espirituales para los próximos cinco años de una sola vez; nos da el pan nuestro de cada día. Cuando aprendes a confiar en que la fidelidad de Dios es nueva cada mañana, el peso del futuro se desvanece.',
        aplicacion: 'Haz un compromiso hoy de no adelantar preocupaciones de la próxima semana o mes. Enfócate exclusivamente en las tareas y relaciones de este día, agradeciendo a Dios por el sustento de hoy.',
        pregunta_reflexion: '¿Estás viviendo angustiado por situaciones hipotéticas del futuro que tal vez nunca lleguen a suceder?',
        oracion: 'Padre celestial, hoy renuncio al hábito agotador de adelantarme con afán al día de mañana. Sé que tú eres mi Padre amoroso y que tienes cuidado de cada detalle de mi vida. Dame la gracia de vivir este día con gratitud, fidelidad y paz bajo tu cuidado. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 2,
        titulo: 'El centinela celestial: La paz que sobrepasa todo entendimiento',
        referencia_biblica: 'Filipenses 4:6-7',
        predicacion:
          'Cuando la ansiedad toca a la puerta, nuestro impulso común es intentar controlar las circunstancias o buscar distracciones pasajeras.\n\nPero el apóstol Pablo nos enseña una disciplina espiritual que desarma el pánico de raíz: “Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.”\n\nEl agradecimiento es la clave secreta. Cuando agradeces a Dios en medio de la dificultad, tu mente recuerda su fidelidad en el pasado y la fe desplaza al temor.\n\n“Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.”\n\nEsta paz no depende de que el saldo bancario esté lleno ni de que todos los problemas se hayan solucionado; es sobrenatural porque existe en medio del conflicto. Funciona como un destacamento militar que cuida la fortaleza de tu mente para que la desesperanza no tome el control.\n\nHoy cambia cada preocupación por una oración llena de gratitud y deja que el centinela de Dios custodie tu corazón.',
        aplicacion: 'Cada vez que un pensamiento de angustia cruce por tu mente hoy, no te quedes rumiándolo: conviértelo en una oración breve diciendo: “Señor, te entrego esto con gratitud, confiando en tu cuidado”.',
        pregunta_reflexion: '¿Dedicas más tiempo a preocuparte mentalmente o a presentar tus peticiones a Dios con acción de gracias?',
        oracion: 'Dios de paz, entrego en tus manos cada pensamiento que intenta robarme la serenidad. Traigo a tu altar mis peticiones con un corazón agradecido. Que tu paz sobrenatural sea el centinela que guarde mi mente y mis emociones en Cristo Jesús. Amén.',
      },
      {
        numero_dia: 3,
        titulo: 'Paz en la barca en plena tormenta: Jesús en medio de las olas',
        referencia_biblica: 'Marcos 4:35-41',
        predicacion:
          'Los discípulos estaban en medio del mar cuando se levantó una gran tempestad de viento que anegaba la barca con olas violentas.\n\nLos discípulos, muchos de ellos pescadores profesionales, estaban aterrados y desesperados. ¿Y dónde estaba Jesús? “Él estaba en la popa, durmiendo sobre un cabezal.”\n\nLos discípulos lo despertaron angustiados con un reclamo que todos hemos sentido en momentos de prueba: “Maestro, ¿no tienes cuidado que perecemos?”\n\nJesús se levantó, reprendió al viento y dijo al mar: “¡Calla, enmudece!” Y cesó el viento, y se hizo grande bonanza. Luego les preguntó: “¿Por qué estáis así amedrentados? ¿Cómo no tenéis fe?”\n\nLa presencia de Jesús en la barca no impidió que la tormenta ocurriera, pero garantizó que la barca jamás se hundiera. La verdadera paz no es la ausencia de olas afuera, sino saber Quién viaja contigo en la barca de tu vida.',
        aplicacion: 'En medio de la prueba que estés atravesando hoy, recuerda conscientemente: Jesús está en mi barca; esta tormenta no tiene el poder de destruirme porque Él tiene el control.',
        pregunta_reflexion: '¿Has estado pensando que Jesús se olvidó de ti solo porque las circunstancias externas parecen fuera de control?',
        oracion: 'Señor Jesús, calma las tempestades de miedo e incertidumbre en mi interior. Perdóname por dudar de tu cuidado cuando las olas rugen. Declaro que tú estás en mi barca y que en tu presencia descanso en gran bonanza. Amén.',
      },
      {
        numero_dia: 4,
        titulo: 'Descanso para el alma agotada: El yugo fácil y la carga ligera',
        referencia_biblica: 'Mateo 11:28-30',
        predicacion:
          'Existe un cansancio físico que se alivia durmiendo ocho horas, pero existe un cansancio mucho más pesado: el cansancio del alma.\n\nEs el agotamiento de intentar ser perfecto, de complacer a todo el mundo, de sostener responsabilidades que no nos corresponden y de cargar culpas pasadas que Dios ya perdonó.\n\nJesús mira esa fatiga profunda y extiende una invitación tierna y personal: “Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar. Llevad mi yugo sobre vosotros, y aprended de mí, que soy manso y humilde de corazón; y hallaréis descanso para vuestras almas.”\n\nEn la agricultura, el yugo unía a dos bueyes: un buey maduro y fuerte que marcaba el paso y cargaba la mayor parte del peso, y un buey más joven que simplemente caminaba a su lado aprendiendo. Jesús te invita a ponerte bajo su yugo: Él lleva la carga pesada; tu parte es caminar a su lado con humildad y mansedumbre.',
        aplicacion: 'Identifica una carga que lleves sobre tus hombros que Dios nunca te pidió que cargaras tú solo (el control de la vida de otros, la culpa, el perfeccionismo) y entrégasela a Jesús hoy.',
        pregunta_reflexion: '¿Estás intentando demostrar tu valor mediante el agotamiento y el activismo, en lugar de descansar en tu identidad como hijo amado de Dios?',
        oracion: 'Jesús amoroso, me acerco a ti con mi alma cansada y mis fuerzas agotadas. Tomo tu yugo que es fácil y tu carga que es ligera. Enséñame tu mansedumbre y permíteme descansar verdaderamente en tu gracia. Amén.',
      },
      {
        numero_dia: 5,
        titulo: 'Soltar el control del futuro: Encomendar el camino a Jehová',
        referencia_biblica: 'Proverbios 16:3; Salmos 37:3-7',
        predicacion:
          'El deseo de control es el principal combustible de la ansiedad.\n\nQueremos asegurarnos de que todo salga de acuerdo a nuestros planes y nos angustiamos ante la más mínima desviación. Pero las Escrituras nos invitan a una postura de descanso sabio:\n\n“Encomienda a Jehová tu camino, y confía en él; y él hará... Guarda silencio ante Jehová, y espera en él.”\n\nGuardar silencio ante Dios significa acallar la prisa interior, renunciar a las exigencias impacientes y confiar en que Dios sabe mejor que nosotros cuál es el momento y el modo perfecto para cada situación.\n\nCuando encomiendas tu camino al Señor, dejas de ser un administrador desesperado del futuro y te conviertes en un hijo confiado que descansa en la providencia de su Padre celestial.',
        aplicacion: 'Anota en una hoja esa situación que has estado intentando resolver con obsesión o afán. Pon las manos abiertas hacia arriba en oración y dile a Dios: “Señor, suelto esto; confío plenamente en tu tiempo y en tu manera de obrar”.',
        pregunta_reflexion: '¿Qué área de tu vida te cuesta más trabajo soltar y dejar en las manos soberanas de Dios?',
        oracion: 'Padre eterno, hoy encomiendo enteramente mi camino y mi futuro en tus manos. Renuncio al afán de querer controlar cada resultado. Guarda mi alma en silencio y paciencia mientras espero en ti. En el nombre de Jesús, amén.',
      },
      {
        numero_dia: 6,
        titulo: 'Dormir en paz en la noche: El descanso que Dios da a su amado',
        referencia_biblica: 'Salmos 4:8; Salmos 127:1-2',
        predicacion:
          'El insomnio y las noches agitadas son con frecuencia el síntoma visible de un corazón que sigue cargando batallas en la almohada.\n\nEl Salmo 127:2 nos recuerda con amor: “Por demás es que os levantéis de madrugada, y vayáis tarde a reposar, y que comáis pan de dolores; pues que a su amado dará Dios el sueño.”\n\nDios no duerme para que tú sí puedas dormir. El universo no se va a caer porque tú cierres los ojos y descanses ocho horas. Al contrario, ir a la cama en paz es un acto de fe que declara: “Dios sigue en el trono y cuidará de todo mientras yo duermo”.\n\nDavid escribió el Salmo 4:8 mientras huía de sus enemigos en medio de un peligro real de muerte: “En paz me acostaré, y asimismo dormiré; porque solo tú, Jehová, me haces vivir confiado.”\n\nSi David pudo dormir en paz huyendo en el desierto porque confiaba en Dios, tú también puedes apagar la luz esta noche sabiendo que el Ángel de Jehová acampa alrededor de ti y te defiende.',
        aplicacion: 'Antes de acostarte esta noche, apaga el teléfono media hora antes, lee el Salmo 4 en voz baja y repite el versículo 8 como tu última oración antes de cerrar los ojos.',
        pregunta_reflexion: '¿Te acuestas con la mente saturada de pantallas y preocupaciones, o entregando el día en las manos de Dios con gratitud?',
        oracion: 'Señor, gracias porque tú nunca duermes ni te adormeces velando por mi vida. Esta noche suelto toda preocupación y pensamiento ansioso. En paz me acostaré y asimismo dormiré, porque solo tú me haces vivir confiado. Guarda mi descanso y renueva mis fuerzas. Amén.',
      },
      {
        numero_dia: 7,
        titulo: 'La shalom de Cristo: "Mi paz os dejo, mi paz os doy"',
        referencia_biblica: 'Juan 14:27; Colosenses 3:15',
        predicacion:
          'En sus últimas palabras a los discípulos antes de ir a la cruz, Jesús les dejó el regalo más precioso de su herencia espiritual:\n\n“La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.”\n\nLa paz que el mundo ofrece es frágil y superficial: depende de que no haya problemas, de que el dinero alcance y de que la gente nos trate bien. Pero la paz de Cristo (*shalom*) es una plenitud y bienestar interior tan profundo que permanece firme e inamovible incluso en medio del dolor, de la pérdida o de la persecución.\n\n“Y la paz de Dios gobierne en vuestros corazones.” La palabra “gobierne” significa que la paz de Cristo debe ser el árbitro que decida qué pensamientos permites en tu mente y cuáles rechazas.\n\nHemos completado 7 días sumergiéndonos en la paz sobrenatural de Dios. No permitas que el afán vuelva a usurpar el trono de tu corazón. Tienes un Salvador que venció al mundo y un Padre que cuida de ti en cada instante de tu caminar.',
        aplicacion: 'Escribe Juan 14:27 en una tarjeta o guárdalo como fondo de pantalla en tu teléfono como recordatorio diario de la paz que Cristo te entregó para siempre.',
        pregunta_reflexion: '¿Estás permitiendo que la paz de Cristo sea el árbitro que gobierne tus reacciones y decisiones de cada día?',
        oracion: 'Señor Jesús, gracias por tu shalom, esa paz inquebrantable que el mundo no puede dar ni quitar. Declaro que mi corazón no se turbará ni tendrá miedo, porque tú eres mi refugio y mi paz eterna. Gobierna cada área de mi ser y hazme un instrumento de tu paz para los demás. ¡A ti sea la gloria por siempre! Amén.',
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
