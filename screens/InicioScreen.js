import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

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

function diaDelAnio() {
  const ahora = new Date();
  const inicioAnio = new Date(ahora.getFullYear(), 0, 0);
  const diferencia = ahora - inicioAnio;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
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

  const frase = FRASES[diaDelAnio() % FRASES.length];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarTodo);
    return unsubscribe;
  }, [navigation]);

  async function cargarTodo() {
    setCargando(true);

    const { count } = await supabase
      .from('devocionales')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      const indice = (diaDelAnio() % count) + 1;
      const { data: devocionalHoy } = await supabase
        .from('devocionales')
        .select('*')
        .eq('orden', indice)
        .single();
      setDevocional(devocionalHoy);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre_usuario')
        .eq('id', user.id)
        .single();
      if (perfil) setNombreUsuario(perfil.nombre_usuario);

      const hoy = new Date().toISOString().slice(0, 10);
      const { data: lecturaHoy } = await supabase
        .from('lecturas_diarias')
        .select('fecha')
        .eq('usuario_id', user.id)
        .eq('fecha', hoy)
        .maybeSingle();
      setYaLeidoHoy(!!lecturaHoy);

      await calcularRacha(user.id);
      await cargarEstudioEnProgreso(user.id);
      await cargarEstadisticas(user.id);
    }

    setCargando(false);
  }

  async function cargarEstudioEnProgreso(usuarioId) {
    const { data } = await supabase
      .from('progreso_usuario')
      .select('estudio_id, dia_actual, ultima_actividad, estudios(titulo, num_dias)')
      .eq('usuario_id', usuarioId)
      .eq('completado', false)
      .order('ultima_actividad', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && data.estudios) {
      setEstudioEnProgreso({
        estudioId: data.estudio_id,
        titulo: data.estudios.titulo,
        diaActual: data.dia_actual,
        numDias: data.estudios.num_dias,
      });
    } else {
      setEstudioEnProgreso(null);
    }
  }

  async function cargarEstadisticas(usuarioId) {
    const { count: completados } = await supabase
      .from('progreso_usuario')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('completado', true);

    const { count: diasLeidos } = await supabase
      .from('lecturas_diarias')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId);

    setEstadisticas({
      estudiosCompletados: completados || 0,
      diasLeidos: diasLeidos || 0,
    });
  }

  async function calcularRacha(usuarioId) {
    const { data } = await supabase
      .from('lecturas_diarias')
      .select('fecha')
      .eq('usuario_id', usuarioId)
      .order('fecha', { ascending: false })
      .limit(90);

    if (!data || data.length === 0) {
      setRacha(0);
      return;
    }

    let contador = 0;
    let fechaEsperada = new Date();
    fechaEsperada.setHours(0, 0, 0, 0);

    const fechasLeidas = new Set(data.map((d) => d.fecha));

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
    setRacha(contador);
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
      calcularRacha(user.id);
      const { data: { user: u2 } } = await supabase.auth.getUser();
      if (u2) cargarEstadisticas(u2.id);
    }
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
  });
}
