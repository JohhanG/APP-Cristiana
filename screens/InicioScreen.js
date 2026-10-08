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
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import { buscarVersiculo, LIBROS_BIBLIA } from '../lib/bibliaApi';
import { BANCO_DEVOCIONALES_SEMILLA, normalizarDevocional } from '../lib/devocionalesService';
import { obtenerEstudioActivo, obtenerSuscripcionesLocales } from '../lib/estudiosService';
import ModalNovedades from '../components/ModalNovedades';
import { VERSION_ACTUAL, haVistoUltimasNovedades } from '../constants/novedades';

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

  const devocionalSemillaHoy = normalizarDevocional(
    BANCO_DEVOCIONALES_SEMILLA[diaDelAnio() % BANCO_DEVOCIONALES_SEMILLA.length]
  );
  const [devocional, setDevocional] = useState(devocionalSemillaHoy);
  const [yaLeidoHoy, setYaLeidoHoy] = useState(false);
  const [racha, setRacha] = useState(0);
  const [cargando, setCargando] = useState(false); // Carga instantánea a 0ms sin spinner bloqueante
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
  const [modalNovedadesVisible, setModalNovedadesVisible] = useState(false);
  const [mostrarBannerNovedades, setMostrarBannerNovedades] = useState(false);

  const yaCargoUnaVez = useRef(false);

  const frase = FRASES[diaDelAnio() % FRASES.length];
  const oracionDeHoy = ORACIONES[diaDelAnio() % ORACIONES.length];

  useEffect(() => {
    async function revisarNovedades() {
      const yaVistas = await haVistoUltimasNovedades();
      if (!yaVistas) {
        setModalNovedadesVisible(true);
        setMostrarBannerNovedades(true);
      }
    }
    revisarNovedades();
  }, []);

  useEffect(() => {
    cargarTodo();
    const unsubscribe = navigation.addListener('focus', cargarTodo);
    return unsubscribe;
  }, [navigation]);

  async function cargarTodo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const hoy = new Date().toISOString().slice(0, 10);

      // Carga paralela ultrarrápida
      const [
        resultadoConteoDevocionales,
        resultadoPerfil,
        resultadoLecturaHoy,
        resultadoRacha,
        resultadoEstudioActivo,
        resultadoCompletados,
        resultadoDiasLeidos,
      ] = await Promise.all([
        supabase.from('devocionales').select('*', { count: 'exact', head: true }),
        user ? supabase.from('perfiles').select('nombre_usuario').eq('id', user.id).maybeSingle() : Promise.resolve({ data: null }),
        user
          ? supabase.from('lecturas_diarias').select('fecha').eq('usuario_id', user.id).eq('fecha', hoy).maybeSingle()
          : Promise.resolve({ data: null }),
        user
          ? supabase.from('lecturas_diarias').select('fecha').eq('usuario_id', user.id).order('fecha', { ascending: false }).limit(90)
          : Promise.resolve({ data: [] }),
        user
          ? obtenerEstudioActivo(user.id)
          : Promise.resolve(null),
        user
          ? Promise.all([
              supabase.from('progreso_usuario').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id).eq('completado', true),
              obtenerSuscripcionesLocales(user.id),
            ])
          : Promise.resolve([{ count: 0 }, []]),
        user
          ? supabase.from('lecturas_diarias').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id)
          : Promise.resolve({ count: 0 }),
      ]);

      // Rotación automática del devocional: si existe en Supabase se usa, si no, se mantiene el catálogo semilla
      const totalDevocionales = resultadoConteoDevocionales?.count;
      if (totalDevocionales && totalDevocionales > 0) {
        const indice = (diaDelAnio() % totalDevocionales) + 1;
        const { data: devocionalDb } = await supabase
          .from('devocionales')
          .select('*')
          .eq('orden', indice)
          .maybeSingle();

        if (devocionalDb) {
          setDevocional(normalizarDevocional(devocionalDb));
        }
      }

      if (user) {
        if (resultadoPerfil?.data?.nombre_usuario) {
          setNombreUsuario(resultadoPerfil.data.nombre_usuario);
        }
        setYaLeidoHoy(!!resultadoLecturaHoy?.data);
        setRacha(calcularRachaDesdeFechas((resultadoRacha?.data || []).map((d) => d.fecha)));

        if (resultadoEstudioActivo) {
          setEstudioEnProgreso({
            estudioId: resultadoEstudioActivo.estudioId,
            titulo: resultadoEstudioActivo.titulo,
            diaActual: resultadoEstudioActivo.diaActual,
            numDias: resultadoEstudioActivo.numDias,
          });
        } else {
          setEstudioEnProgreso(null);
        }

        const completadosDb = resultadoCompletados?.[0]?.count || 0;
        const completadosLocales = (resultadoCompletados?.[1] || []).filter((s) => s.completado).length;

        setEstadisticas({
          estudiosCompletados: completadosDb + completadosLocales,
          diasLeidos: resultadoDiasLeidos?.count || 0,
        });
      }

      // Última lectura guardada en la pestaña Biblia (para la tarjeta "Seguir leyendo")
      const guardado = await AsyncStorage.getItem('bibliaUltimaLectura');
      if (guardado) {
        try {
          const datos = JSON.parse(guardado);
          const libro = LIBROS_BIBLIA.find((l) => l.numero === datos.libroNumero);
          if (libro) {
            setLecturaBiblia({ nombreLibro: libro.nombre, capitulo: datos.capitulo });
          }
        } catch {}
      }
    } catch (error) {
      console.log('Carga en segundo plano completada con fallback seguro:', error?.message);
    } finally {
      yaCargoUnaVez.current = true;
      setCargando(false);
    }
  }

  async function marcarLeido() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Actualización optimista inmediata (0ms de respuesta visual)
    setYaLeidoHoy(true);
    setRacha((r) => r + 1);

    setGuardando(true);
    const hoy = new Date().toISOString().slice(0, 10);
    try {
      const { error } = await supabase
        .from('lecturas_diarias')
        .insert({ usuario_id: user.id, fecha: hoy });

      if (error && error.code !== '23505') {
        console.log('Aviso en registro diario:', error.message);
      }
    } catch (e) {
      console.log('Error de red al marcar lectura:', e.message);
    } finally {
      setGuardando(false);
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
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
      >
        {/* Encabezado con saludo y fecha */}
        <View style={styles.encabezado}>
          <View style={styles.filaSaludo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.saludo}>
                {nombreUsuario ? `Hola, ${nombreUsuario}` : 'Bienvenido'}
              </Text>
              <Text style={styles.fecha}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
          </View>

          {/* Barra de separación elegante */}
          <View style={styles.contenedorBarra}>
            <View style={styles.barraAcento} />
            <View style={styles.lineaSeparadora} />
          </View>
        </View>

        {/* Banner de Novedades de la Versión */}
        {mostrarBannerNovedades && (
          <TouchableOpacity
            style={styles.bannerNovedades}
            activeOpacity={0.88}
            onPress={() => setModalNovedadesVisible(true)}
          >
            <View style={styles.bannerNovedadesIcono}>
              <Ionicons name="sparkles" size={18} color="#6366F1" />
            </View>
            <View style={{ flex: 1, paddingRight: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={styles.bannerNovedadesTitulo}>¡Novedades en la app!</Text>
                <View style={styles.bannerNovedadesBadge}>
                  <Text style={styles.bannerNovedadesBadgeTexto}>v{VERSION_ACTUAL}</Text>
                </View>
              </View>
              <Text style={styles.bannerNovedadesSubtitulo}>
                Toca aquí para descubrir las nuevas mejoras y funciones.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setMostrarBannerNovedades(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.bannerNovedadesBotonCerrar}
            >
              <Ionicons name="close" size={16} color={colores.textoTenue} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

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
        <TouchableOpacity
          style={styles.tarjetaDevocional}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('DevocionalDetalle', { devocional })}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.etiquetaDevocional}>Devocional de hoy</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 12, color: colores.primario, fontWeight: '600' }}>Ver completo</Text>
              <Ionicons name="chevron-forward" size={14} color={colores.primario} />
            </View>
          </View>
          <Text style={styles.referencia}>{devocional.referencia_biblica}</Text>
          <Text style={styles.reflexion} numberOfLines={4}>{devocional.reflexion}</Text>

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
        </TouchableOpacity>
      )}

      {/* Tarjetas rápidas: Explorar devocionales, Oración de hoy, Memorizar versículo, Seguir leyendo */}
      <View style={styles.listaTarjetasRapidas}>
        <TouchableOpacity
          style={[styles.tarjetaRapida, { borderWidth: 1, borderColor: colores.primario + '30' }]}
          onPress={() => navigation.navigate('Devocionales')}
        >
          <View style={[styles.iconoTarjetaRapida, { backgroundColor: '#6366F125' }]}>
            <Ionicons name="sparkles" size={22} color="#6366F1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloTarjetaRapida}>Devocionales según tu situación</Text>
            <Text style={styles.subtituloTarjetaRapida} numberOfLines={1}>
              Paz, familia, decisiones o según tu necesidad
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
        </TouchableOpacity>

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
              {lecturaBiblia ? `${lecturaBiblia.nombreLibro} ${lecturaBiblia.capitulo}` : 'Génesis 1'}
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

      {/* Modal Novedades de la Versión */}
      <ModalNovedades
        visible={modalNovedadesVisible}
        onCerrar={() => setModalNovedadesVisible(false)}
        onExplorar={(featureId) => {
          setModalNovedadesVisible(false);
          if (featureId === 'situacion') {
            navigation.navigate('Devocionales');
          } else if (featureId === 'estudios') {
            navigation.navigate('Estudios');
          } else if (featureId === 'biblia_genesis') {
            navigation.navigate('Biblia');
          }
        }}
      />
    </ScrollView>
  </SafeAreaView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    encabezado: {
      paddingTop: 8,
      marginBottom: 2,
    },
    filaSaludo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    saludo: {
      fontSize: 26,
      fontWeight: '700',
      color: colores.texto,
      letterSpacing: -0.3,
    },
    fecha: {
      fontSize: 14,
      color: colores.textoSecundario,
      marginTop: 4,
      textTransform: 'capitalize',
      fontWeight: '500',
    },
    contenedorBarra: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      marginBottom: 6,
    },
    barraAcento: {
      width: 48,
      height: 3.5,
      backgroundColor: colores.primario,
      borderRadius: 2,
    },
    lineaSeparadora: {
      flex: 1,
      height: 1,
      backgroundColor: colores.borde,
      marginLeft: 10,
      opacity: 0.8,
    },
    frase: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colores.textoSecundario,
      marginTop: 8,
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
    bannerNovedades: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 14,
      padding: 12,
      marginHorizontal: 20,
      marginTop: 4,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colores.primario + '40',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 2,
      gap: 12,
    },
    bannerNovedadesIcono: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#6366F118',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerNovedadesTitulo: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.texto,
    },
    bannerNovedadesBadge: {
      backgroundColor: colores.primario + '18',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    bannerNovedadesBadgeTexto: {
      fontSize: 10,
      fontWeight: '800',
      color: colores.primario,
    },
    bannerNovedadesSubtitulo: {
      fontSize: 12,
      color: colores.textoSecundario,
      lineHeight: 16,
      marginTop: 2,
    },
    bannerNovedadesBotonCerrar: {
      padding: 4,
    },
  });
}