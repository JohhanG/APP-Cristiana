import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import { buscarVersiculo, LIBROS_BIBLIA } from '../lib/bibliaApi';

const FRASES = [
  'Un paso de fe hoy vale más que mil pasos de duda.',
  'La constancia pequeña de cada día construye una fe grande.',
  'No estás atrasado, estás exactamente donde necesitas crecer.',
  'Descansar en Dios también es una forma de avanzar.',
  'Hoy es suficiente. No cargues con el peso de mañana.',
  'Tu historia con Dios no se mide en un solo día, sino en la constancia.',
  'La gracia no espera que estés listo, te encuentra donde estás.',
  'Cada versículo leído hoy es una semilla, aunque no la veas crecer aún.',
  'No necesitas tener todas las respuestas para dar el siguiente paso.',
  'La fe no elimina la duda, aprende a caminar junto a ella.',
  'Un corazón agradecido ve lo que un corazón ansioso no puede.',
  'Dios no se cansa de tus intentos, aunque tú sí.',
  'Lo pequeño hecho con constancia vence a lo grande hecho una vez.',
  'Hoy puedes empezar de nuevo, sin explicaciones.',
  'La paz no es ausencia de ruido, es presencia de Dios en medio del ruido.',
  'No mires cuánto falta, mira cuánto ya caminaste.',
  'Ser fiel en lo poco es más importante que ser visto en lo grande.',
  'El descanso no es debilidad, es reconocer que no todo depende de ti.',
  'Tu valor no sube ni baja con tu productividad de hoy.',
  'Cada día que te presentas a leer, ya es una victoria silenciosa.',
];

const ORACIONES = [
  '¡Gracias, Señor, por la libertad que me das! Ayúdame a usarla para servir a otros con amor y no para mí mismo.',
  'Padre, dame hoy la sabiduría para ver tu mano en las cosas pequeñas. Enséñame a confiar más y a temer menos.',
  'Gracias por este nuevo día. Ayúdame a caminar en paz, aunque no tenga todas las respuestas.',
  'Señor, calma mi ansiedad y recuérdame que tú ya conoces el final de mi historia.',
  'Gracias por tu fidelidad, que es nueva cada mañana. Que hoy pueda reflejar un poco de tu amor a quienes me rodean.',
  'Padre, dame fuerzas para perdonar y un corazón agradecido a pesar de mis circunstancias.',
  'Gracias por tu palabra, que es lámpara a mi camino. Ayúdame a vivirla hoy, no solo a leerla.',
];

function diaDelAnio() {
  const ahora = new Date();
  const inicioAnio = new Date(ahora.getFullYear(), 0, 0);
  const diferencia = ahora - inicioAnio;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
}

function calcularRachaDesdeFechas(fechas) {
  if (!fechas || fechas.length === 0) return 0;

  let contador = 0;
  let fechaEsperada = new Date();
  fechaEsperada.setHours(0, 0, 0, 0);

  const fechasLeidas = new Set(fechas);

  for (let i = 0; i < 90; i++) {
    const fechaStr = fechaEsperada.toISOString().slice(0, 10);
    if (fechasLeidas.has(fechaStr)) {
      contador++;
      fechaEsperada.setDate(fechaEsperada.getDate() - 1);
    } else if (i === 0) {
      fechaEsperada.setDate(fechaEsperada.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return contador;
}

export default function InicioScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [devocional, setDevocional] = useState(null);
  const [yaLeidoHoy, setYaLeidoHoy] = useState(false);
  const [racha, setRacha] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [estudioEnProgreso, setEstudioEnProgreso] = useState(null);
  const [estadisticas, setEstadisticas] = useState({ estudiosCompletados: 0, diasLeidos: 0 });
  const [lecturaBiblia, setLecturaBiblia] = useState(null);

  const [modalOracionVisible, setModalOracionVisible] = useState(false);
  const [modalMemorizarVisible, setModalMemorizarVisible] = useState(false);
  const [versiculoMemorizar, setVersiculoMemorizar] = useState(null);
  const [cargandoVersiculo, setCargandoVersiculo] = useState(false);
  const [versiculoRevelado, setVersiculoRevelado] = useState(false);

  const yaCargoUnaVez = useRef(false);

  const frase = FRASES[diaDelAnio() % FRASES.length];
  const oracionDeHoy = ORACIONES[diaDelAnio() % ORACIONES.length];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarTodo);
    // El evento "focus" a veces no se dispara a tiempo cuando esta es la
    // primera pestaña que se muestra al abrir la app, así que forzamos
    // la carga también aquí, al montar la pantalla.
    cargarTodo();
    return unsubscribe;
  }, [navigation]);

  async function cargarTodo() {
    // Solo mostramos el círculo de carga completo la primera vez.
    // Las veces siguientes se actualiza en silencio, sin bloquear la pantalla.
    if (!yaCargoUnaVez.current) setCargando(true);

    const { data: { user } } = await supabase.auth.getUser();
    const hoy = new Date().toISOString().slice(0, 10);

    // Todas estas consultas no dependen unas de otras, así que las lanzamos
    // todas a la vez en lugar de esperar una por una (esto es lo que hacía
    // que la pantalla tardara más que las demás).
    const [
      resultadoConteoDevocionales,
      resultadoPerfil,
      resultadoLecturaHoy,
      resultadoRacha,
      resultadoProgreso,
      resultadoCompletados,
      resultadoDiasLeidos,
    ] = await Promise.all([
      supabase.from('devocionales').select('*', { count: 'exact', head: true }),
      user ? supabase.from('perfiles').select('nombre_usuario').eq('id', user.id).single() : Promise.resolve({ data: null }),
      user
        ? supabase.from('lecturas_diarias').select('fecha').eq('usuario_id', user.id).eq('fecha', hoy).maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from('lecturas_diarias').select('fecha').eq('usuario_id', user.id).order('fecha', { ascending: false }).limit(90)
        : Promise.resolve({ data: [] }),
      user
        ? supabase
            .from('progreso_usuario')
            .select('estudio_id, dia_actual, ultima_actividad, estudios(titulo, num_dias)')
            .eq('usuario_id', user.id)
            .eq('completado', false)
            .order('ultima_actividad', { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from('progreso_usuario').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id).eq('completado', true)
        : Promise.resolve({ count: 0 }),
      user
        ? supabase.from('lecturas_diarias').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id)
        : Promise.resolve({ count: 0 }),
    ]);

    // Devocional del día (depende del conteo, así que va después, pero es rápido)
    const totalDevocionales = resultadoConteoDevocionales.count;
    if (totalDevocionales && totalDevocionales > 0) {
      const indice = (diaDelAnio() % totalDevocionales) + 1;
      const { data: devocionalHoy } = await supabase.from('devocionales').select('*').eq('orden', indice).single();
      setDevocional(devocionalHoy);
    }

    if (user) {
      if (resultadoPerfil.data) setNombreUsuario(resultadoPerfil.data.nombre_usuario);
      setYaLeidoHoy(!!resultadoLecturaHoy.data);
      setRacha(calcularRachaDesdeFechas((resultadoRacha.data || []).map((d) => d.fecha)));

      if (resultadoProgreso.data && resultadoProgreso.data.estudios) {
        setEstudioEnProgreso({
          estudioId: resultadoProgreso.data.estudio_id,
          titulo: resultadoProgreso.data.estudios.titulo,
          diaActual: resultadoProgreso.data.dia_actual,
          numDias: resultadoProgreso.data.estudios.num_dias,
        });
      } else {
        setEstudioEnProgreso(null);
      }

      setEstadisticas({
        estudiosCompletados: resultadoCompletados.count || 0,
        diasLeidos: resultadoDiasLeidos.count || 0,
      });
    }

    // Última lectura guardada en la pestaña Biblia (para la tarjeta "Seguir leyendo")
    const guardado = await AsyncStorage.getItem('bibliaUltimaLectura');
    if (guardado) {
      const datos = JSON.parse(guardado);
      const libro = LIBROS_BIBLIA.find((l) => l.numero === datos.libroNumero);
      if (libro) {
        setLecturaBiblia({ nombreLibro: libro.nombre, capitulo: datos.capitulo });
      }
    }

    yaCargoUnaVez.current = true;
    setCargando(false);
  }

  async function marcarLeido() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setGuardando(true);
    const hoy = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from('lecturas_diarias')
      .insert({ usuario_id: user.id, fecha: hoy });

    setGuardando(false);

    if (!error) {
      setYaLeidoHoy(true);
      cargarTodo();
    }
  }

  async function abrirMemorizar() {
    setModalMemorizarVisible(true);
    setVersiculoRevelado(false);

    if (!devocional?.referencia_biblica) return;
    setCargandoVersiculo(true);
    const resultado = await buscarVersiculo(devocional.referencia_biblica);
    setCargandoVersiculo(false);
    if (resultado.exito) setVersiculoMemorizar(resultado.texto);
  }

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.saludo}>
        {nombreUsuario ? `Hola, ${nombreUsuario}` : 'Bienvenido'}
      </Text>
      <Text style={styles.fecha}>
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      <Text style={styles.frase}>“{frase}”</Text>

      <View style={styles.filaEstadisticas}>
        <View style={styles.tarjetaEstadistica}>
          <Ionicons name="flame" size={20} color={colores.primario} />
          <Text style={styles.numeroEstadistica}>{racha}</Text>
          <Text style={styles.etiquetaEstadistica}>{racha === 1 ? 'día seguido' : 'días seguidos'}</Text>
        </View>
        <View style={styles.tarjetaEstadistica}>
          <Ionicons name="book" size={20} color={colores.primario} />
          <Text style={styles.numeroEstadistica}>{estadisticas.estudiosCompletados}</Text>
          <Text style={styles.etiquetaEstadistica}>completados</Text>
        </View>
        <View style={styles.tarjetaEstadistica}>
          <Ionicons name="calendar" size={20} color={colores.primario} />
          <Text style={styles.numeroEstadistica}>{estadisticas.diasLeidos}</Text>
          <Text style={styles.etiquetaEstadistica}>días leídos</Text>
        </View>
      </View>

      {estudioEnProgreso && (
        <TouchableOpacity
          style={styles.tarjetaEnProgreso}
          onPress={() => navigation.navigate('EstudioDetalle', { estudioId: estudioEnProgreso.estudioId })}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.etiquetaEnProgreso}>Continuar estudio</Text>
            <Text style={styles.tituloEnProgreso}>{estudioEnProgreso.titulo}</Text>
            <Text style={styles.subtituloEnProgreso}>
              Día {estudioEnProgreso.diaActual} de {estudioEnProgreso.numDias}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colores.primario} />
        </TouchableOpacity>
      )}

      {devocional && (
        <View style={styles.tarjetaDevocional}>
          <Text style={styles.etiquetaDevocional}>Devocional de hoy</Text>
          <Text style={styles.referencia}>{devocional.referencia_biblica}</Text>
          <Text style={styles.reflexion}>{devocional.reflexion}</Text>

          <TouchableOpacity
            style={[styles.botonLeido, yaLeidoHoy && styles.botonLeidoCompletado]}
            onPress={marcarLeido}
            disabled={yaLeidoHoy || guardando}
          >
            {guardando ? (
              <ActivityIndicator color={colores.primarioTexto} />
            ) : (
              <>
                <Ionicons
                  name={yaLeidoHoy ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color={colores.primarioTexto}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.textoBotonLeido}>
                  {yaLeidoHoy ? 'Ya leíste hoy' : 'Marcar como leído'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Tarjetas rápidas: Oración de hoy, Memorizar versículo, Seguir leyendo */}
      <View style={styles.listaTarjetasRapidas}>
        <TouchableOpacity style={styles.tarjetaRapida} onPress={() => setModalOracionVisible(true)}>
          <View style={[styles.iconoTarjetaRapida, { backgroundColor: colores.primario + '22' }]}>
            <Ionicons name="hand-left-outline" size={22} color={colores.primario} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloTarjetaRapida}>Oración de hoy</Text>
            <Text style={styles.subtituloTarjetaRapida} numberOfLines={1}>
              Toca para leerla completa
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
        </TouchableOpacity>

        {devocional && (
          <TouchableOpacity style={styles.tarjetaRapida} onPress={abrirMemorizar}>
            <View style={[styles.iconoTarjetaRapida, { backgroundColor: colores.primario + '22' }]}>
              <Ionicons name="school-outline" size={22} color={colores.primario} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloTarjetaRapida}>Memorizar versículo</Text>
              <Text style={styles.subtituloTarjetaRapida} numberOfLines={1}>
                {devocional.referencia_biblica}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.tarjetaRapida} onPress={() => navigation.navigate('Biblia')}>
          <View style={[styles.iconoTarjetaRapida, { backgroundColor: colores.primario + '22' }]}>
            <Ionicons name="reader-outline" size={22} color={colores.primario} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloTarjetaRapida}>Seguir leyendo</Text>
            <Text style={styles.subtituloTarjetaRapida} numberOfLines={1}>
              {lecturaBiblia ? `${lecturaBiblia.nombreLibro} ${lecturaBiblia.capitulo}` : 'Juan 1'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tarjetaRapida} onPress={() => navigation.navigate('EstadoAnimo')}>
          <View style={[styles.iconoTarjetaRapida, { backgroundColor: colores.primario + '22' }]}>
            <Ionicons name="happy-outline" size={22} color={colores.primario} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloTarjetaRapida}>¿Cómo te sientes hoy?</Text>
            <Text style={styles.subtituloTarjetaRapida} numberOfLines={1}>
              Versículos para tu momento
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
        </TouchableOpacity>
      </View>

      {/* Modal: Oración de hoy */}
      <Modal visible={modalOracionVisible} transparent animationType="fade" onRequestClose={() => setModalOracionVisible(false)}>
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalOracionVisible(false)}>
          <View style={styles.cajaModal}>
            <View style={[styles.iconoTarjetaRapida, { backgroundColor: colores.primario + '22', marginBottom: 12 }]}>
              <Ionicons name="hand-left-outline" size={24} color={colores.primario} />
            </View>
            <Text style={styles.tituloModal}>Oración de hoy</Text>
            <Text style={styles.textoOracion}>{oracionDeHoy}</Text>
            <TouchableOpacity style={styles.botonCerrarModal} onPress={() => setModalOracionVisible(false)}>
              <Text style={styles.textoBotonCerrarModal}>Amén</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: Memorizar versículo */}
      <Modal visible={modalMemorizarVisible} transparent animationType="fade" onRequestClose={() => setModalMemorizarVisible(false)}>
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalMemorizarVisible(false)}>
          <View style={styles.cajaModal}>
            <View style={[styles.iconoTarjetaRapida, { backgroundColor: colores.primario + '22', marginBottom: 12 }]}>
              <Ionicons name="school-outline" size={24} color={colores.primario} />
            </View>
            <Text style={styles.tituloModal}>{devocional?.referencia_biblica}</Text>

            {cargandoVersiculo ? (
              <ActivityIndicator color={colores.primario} style={{ marginVertical: 20 }} />
            ) : versiculoRevelado ? (
              <Text style={styles.textoOracion}>{versiculoMemorizar}</Text>
            ) : (
              <View style={styles.cajaOculta}>
                <Ionicons name="eye-off-outline" size={20} color={colores.textoTenue} />
                <Text style={styles.textoOculto}>Intenta recordarlo antes de verlo</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.botonCerrarModal}
              onPress={() => setVersiculoRevelado(!versiculoRevelado)}
              disabled={cargandoVersiculo}
            >
              <Text style={styles.textoBotonCerrarModal}>
                {versiculoRevelado ? 'Ocultar' : 'Mostrar versículo'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    saludo: { fontSize: 24, fontWeight: '600', color: colores.texto },
    fecha: { fontSize: 14, color: colores.textoSecundario, marginTop: 2, textTransform: 'capitalize' },
    frase: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colores.textoSecundario,
      marginTop: 14,
      lineHeight: 20,
    },
    filaEstadisticas: { flexDirection: 'row', gap: 10, marginTop: 20 },
    tarjetaEstadistica: {
      flex: 1,
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    numeroEstadistica: { fontSize: 18, fontWeight: '600', color: colores.texto, marginTop: 4 },
    etiquetaEstadistica: { fontSize: 11, color: colores.textoSecundario, marginTop: 2, textAlign: 'center' },
    tarjetaEnProgreso: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficieAlterna,
      borderRadius: 12,
      padding: 14,
      marginTop: 16,
    },
    etiquetaEnProgreso: { fontSize: 11, color: colores.primario, textTransform: 'uppercase', marginBottom: 2 },
    tituloEnProgreso: { fontSize: 15, fontWeight: '600', color: colores.texto },
    subtituloEnProgreso: { fontSize: 12, color: colores.textoSecundario, marginTop: 2 },
    tarjetaDevocional: {
      backgroundColor: colores.superficie,
      borderRadius: 14,
      padding: 18,
      marginTop: 20,
    },
    etiquetaDevocional: { fontSize: 12, color: colores.textoTenue, marginBottom: 8, textTransform: 'uppercase' },
    referencia: { fontSize: 18, fontWeight: '600', color: colores.primario, marginBottom: 10 },
    reflexion: { fontSize: 15, lineHeight: 23, color: colores.texto, marginBottom: 18 },
    botonLeido: {
      flexDirection: 'row',
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonLeidoCompletado: { backgroundColor: colores.textoTenue },
    textoBotonLeido: { color: colores.primarioTexto, fontWeight: '600', fontSize: 14 },
    listaTarjetasRapidas: { marginTop: 20, gap: 10 },
    tarjetaRapida: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 12,
      gap: 12,
    },
    iconoTarjetaRapida: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tituloTarjetaRapida: { fontSize: 15, fontWeight: '600', color: colores.texto },
    subtituloTarjetaRapida: { fontSize: 12, color: colores.textoSecundario, marginTop: 2 },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    cajaModal: { backgroundColor: colores.superficie, borderRadius: 16, padding: 22, alignItems: 'center' },
    tituloModal: { fontSize: 17, fontWeight: '700', color: colores.texto, marginBottom: 12, textAlign: 'center' },
    textoOracion: { fontSize: 15, lineHeight: 23, color: colores.texto, textAlign: 'center', marginBottom: 18 },
    cajaOculta: { alignItems: 'center', paddingVertical: 20, marginBottom: 6, gap: 8 },
    textoOculto: { fontSize: 13, color: colores.textoTenue, fontStyle: 'italic' },
    botonCerrarModal: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 30,
      alignItems: 'center',
    },
    textoBotonCerrarModal: { color: colores.primarioTexto, fontWeight: '700' },
  });
}