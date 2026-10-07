import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase.js';
import { useTheme } from '../theme/ThemeContext';
import {
  suscribirseAEstudio,
  desuscribirseDeEstudio,
  obtenerSuscripcion,
  avanzarDiaEstudio,
  normalizarDiaEstudio,
  esUUID,
  ESTUDIOS_SEMILLA,
  DURACIONES_ESTUDIO,
} from '../lib/estudiosService.js';

export default function EstudioDetalleScreen({ route, navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);
  const { estudioId } = route.params;

  const semillaInicial = ESTUDIOS_SEMILLA.find((s) => s.id === estudioId);
  const [estudio, setEstudio] = useState(semillaInicial || null);
  const [dias, setDias] = useState(semillaInicial?.dias || []);
  const [diaActual, setDiaActual] = useState(0);
  const [cargando, setCargando] = useState(!semillaInicial);
  const [esFavorito, setEsFavorito] = useState(false);
  const [cambiandoFavorito, setCambiandoFavorito] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  // Estados de suscripción
  const [suscrito, setSuscrito] = useState(false);
  const [procesandoSuscripcion, setProcesandoSuscripcion] = useState(false);
  const [diaSuscripcion, setDiaSuscripcion] = useState(1);
  const [estudioCompletado, setEstudioCompletado] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        // 1. Cargar datos del usuario y suscripción en paralelo
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUsuarioId(user.id);
          const [favoritoRes, progreso] = await Promise.all([
            esUUID(estudioId)
              ? supabase
                  .from('estudio_likes')
                  .select('estudio_id')
                  .eq('usuario_id', user.id)
                  .eq('estudio_id', estudioId)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            obtenerSuscripcion(estudioId),
          ]);

          if (esUUID(estudioId)) {
            setEsFavorito(!!favoritoRes?.data);
          } else {
            const favLocal = await AsyncStorage.getItem(`like_estudio_${user.id}_${estudioId}`);
            setEsFavorito(favLocal === 'true');
          }

          if (progreso) {
            setSuscrito(true);
            const diaIndex = Math.max(0, (progreso.dia_actual || 1) - 1);
            setDiaActual(diaIndex);
            setDiaSuscripcion(progreso.dia_actual || 1);
            setEstudioCompletado(!!progreso.completado);
          }
        }

        // 2. Cargar estudio y días desde Supabase SOLO SI ES UUID válido
        if (esUUID(estudioId)) {
          const [estudioRes, diasRes] = await Promise.all([
            supabase
              .from('estudios')
              .select('*, perfiles!autor_id(nombre_usuario)')
              .eq('id', estudioId)
              .maybeSingle(),
            supabase
              .from('dias_estudio')
              .select('*')
              .eq('estudio_id', estudioId)
              .order('numero_dia', { ascending: true }),
          ]);

          if (estudioRes?.data) {
            setEstudio(estudioRes.data);
            setDias(diasRes?.data || []);
          }
        } else if (!semillaInicial) {
          const semilla = ESTUDIOS_SEMILLA.find((s) => s.id === estudioId);
          if (semilla) {
            setEstudio(semilla);
            setDias(semilla.dias || []);
          }
        }
      } catch (err) {
        console.log('Carga silenciosa de detalle de estudio:', err.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [estudioId]);

  async function alternarFavorito() {
    if (!usuarioId) return;
    setCambiandoFavorito(true);

    const nuevoEstado = !esFavorito;
    setEsFavorito(nuevoEstado);

    if (esUUID(estudioId)) {
      if (esFavorito) {
        await supabase
          .from('estudio_likes')
          .delete()
          .eq('usuario_id', usuarioId)
          .eq('estudio_id', estudioId);
      } else {
        await supabase
          .from('estudio_likes')
          .insert({ usuario_id: usuarioId, estudio_id: estudioId });
      }
    } else {
      await AsyncStorage.setItem(`like_estudio_${usuarioId}_${estudioId}`, nuevoEstado ? 'true' : 'false');
    }

    setCambiandoFavorito(false);
  }

  async function manejarSuscripcion() {
    if (!usuarioId) {
      Alert.alert('Inicia sesión', 'Necesitas iniciar sesión para seguir este estudio bíblico.');
      return;
    }

    setProcesandoSuscripcion(true);
    const resultado = await suscribirseAEstudio(estudioId);
    setProcesandoSuscripcion(false);

    if (resultado.exito) {
      setSuscrito(true);
      setDiaActual(0);
      setDiaSuscripcion(1);
      setEstudioCompletado(false);
      Alert.alert(
        '¡Te has suscrito con éxito! 📖',
        `Comenzaste este plan de ${estudio?.num_dias || dias.length} días. Lo encontrarás en tu pantalla de Inicio en "Continuar estudio".`
      );
    } else {
      Alert.alert('No se pudo suscribir', resultado.error);
    }
  }

  function confirmarDesuscripcion() {
    Alert.alert(
      'Abandonar estudio',
      '¿Deseas dejar de seguir este estudio bíblico? Se borrará tu progreso actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abandonar',
          style: 'destructive',
          onPress: async () => {
            setProcesandoSuscripcion(true);
            await desuscribirseDeEstudio(estudioId);
            setProcesandoSuscripcion(false);
            setSuscrito(false);
            setEstudioCompletado(false);
          },
        },
      ]
    );
  }

  async function marcarProgreso() {
    if (!usuarioId) {
      Alert.alert('Inicia sesión', 'Necesitas una cuenta para guardar tu avance en los estudios.');
      return;
    }

    const diaCompletadoNumero = diaActual + 1;
    const esElUltimo = diaCompletadoNumero >= dias.length;
    const siguienteDia = esElUltimo ? dias.length : diaCompletadoNumero + 1;

    setProcesandoSuscripcion(true);
    await avanzarDiaEstudio(estudioId, siguienteDia, dias.length);
    setProcesandoSuscripcion(false);
    setSuscrito(true);

    if (!esElUltimo) {
      setDiaActual(diaActual + 1);
      setDiaSuscripcion(siguienteDia);
      Alert.alert('¡Día completado! 📖', `Avanzaste al Día ${siguienteDia} de ${dias.length}.`);
    } else {
      setEstudioCompletado(true);
      Alert.alert(
        '¡Gloria a Dios! 🎉',
        `Has completado con éxito los ${dias.length} días del estudio bíblico "${estudio?.titulo}". ¡Sigue creciendo en tu fe!`
      );
    }
  }

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const rawDia = dias[diaActual];
  const dia = normalizarDiaEstudio(rawDia);
  const duracionInfo = DURACIONES_ESTUDIO.find((d) => d.id === (estudio?.num_dias || dias.length));

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ paddingBottom: 60 }}>
      {estudio?.portada_url && (
        <Image source={{ uri: estudio.portada_url }} style={styles.imagenPortada} />
      )}

      <View style={{ padding: 16 }}>
        {/* Encabezado: Título y Favorito */}
        <View style={styles.filaTitulo}>
          <View style={{ flex: 1 }}>
            {duracionInfo && (
              <View style={[styles.badgeDuracion, { backgroundColor: duracionInfo.color + '20' }]}>
                <Ionicons name={duracionInfo.icono} size={12} color={duracionInfo.color} style={{ marginRight: 4 }} />
                <Text style={[styles.textoBadgeDuracion, { color: duracionInfo.color }]}>
                  {duracionInfo.badge} ({estudio?.num_dias || dias.length} DÍAS)
                </Text>
              </View>
            )}
            <Text style={styles.tituloEstudio}>{estudio?.titulo}</Text>
            <Text style={styles.autor}>
              por {estudio?.perfiles?.nombre_usuario || 'Comunidad'}
              {estudio?.tema ? ` · ${estudio.tema}` : ''}
            </Text>
          </View>

          {usuarioId && (
            <TouchableOpacity
              style={styles.botonFavorito}
              onPress={alternarFavorito}
              disabled={cambiandoFavorito}
            >
              <Ionicons
                name={esFavorito ? 'heart' : 'heart-outline'}
                size={26}
                color={esFavorito ? colores.peligro : colores.textoSecundario}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Banner de Suscripción si NO está suscrito */}
        {!suscrito ? (
          <View style={styles.cajaSuscripcionInvitacion}>
            <View style={styles.filaInfoSuscripcion}>
              <Ionicons name="calendar" size={24} color={colores.primario} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tituloInvitacion}>Sigue este plan de estudio</Text>
                <Text style={styles.subtituloInvitacion}>
                  {estudio?.descripcion || `Avanza día a día durante ${dias.length} días con prédicas, reflexiones y oración.`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botonSuscribirseGrande}
              onPress={manejarSuscripcion}
              disabled={procesandoSuscripcion}
            >
              {procesandoSuscripcion ? (
                <ActivityIndicator color={colores.primarioTexto} />
              ) : (
                <>
                  <Ionicons name="bookmark" size={18} color={colores.primarioTexto} style={{ marginRight: 8 }} />
                  <Text style={styles.textoBotonSuscribirse}>
                    Suscribirme a este estudio ({dias.length} días)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cajaEstadoSuscrito}>
            <View style={styles.filaEstadoSuscrito}>
              <View style={styles.indicadorVerde} />
              <Text style={styles.textoEstadoSuscrito}>
                {estudioCompletado
                  ? '¡Has completado este estudio!'
                  : `Siguiendo este estudio · Día ${diaActual + 1} de ${dias.length}`}
              </Text>
              <TouchableOpacity onPress={confirmarDesuscripcion} style={{ marginLeft: 'auto' }}>
                <Text style={styles.textoAbandonar}>Abandonar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Barra de progreso */}
        <View style={styles.progresoBar}>
          <View
            style={[
              styles.progresoRelleno,
              { width: `${dias.length > 0 ? ((diaActual + 1) / dias.length) * 100 : 0}%` },
            ]}
          />
        </View>

        {/* Selector horizontal de días */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filaSelectorDias}
        >
          {dias.map((d, index) => {
            const esSeleccionado = diaActual === index;
            const esPasado = suscrito && index < diaSuscripcion;
            return (
              <TouchableOpacity
                key={d.id || index}
                style={[
                  styles.chipDia,
                  esSeleccionado && styles.chipDiaSeleccionado,
                  esPasado && !esSeleccionado && styles.chipDiaPasado,
                ]}
                onPress={() => setDiaActual(index)}
              >
                {esPasado && !esSeleccionado ? (
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
                ) : null}
                <Text
                  style={[
                    styles.textoChipDia,
                    esSeleccionado && styles.textoChipDiaSeleccionado,
                  ]}
                >
                  Día {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Tarjeta de Contenido del Día Estilo Prédica Profesional */}
        {dia ? (
          <View style={styles.tarjetaDia}>
            {dia.imagen_url && (
              <Image source={{ uri: dia.imagen_url }} style={styles.imagenDia} />
            )}

            <Text style={styles.tituloDia}>{dia.titulo}</Text>

            {/* Pasaje bíblico */}
            <View style={styles.cajaPasaje}>
              <Ionicons name="book" size={16} color={colores.primario} />
              <Text style={styles.referencia}>{dia.referencia_biblica}</Text>
            </View>

            {dia.texto_biblico ? (
              <Text style={styles.textoBiblico}>“{dia.texto_biblico}”</Text>
            ) : null}

            {/* 1. Reflexión del Día */}
            <View style={styles.bloquePredicacion}>
              <View style={styles.filaTituloBloque}>
                <Ionicons name="sparkles-outline" size={16} color={colores.primario} />
                <Text style={styles.tituloBloque}>Reflexión del día</Text>
              </View>
              <Text style={styles.predicacionTexto}>{dia.predicacion || dia.reflexion}</Text>
            </View>

            {/* 2. Aplicación para hoy */}
            {dia.aplicacion ? (
              <View style={styles.bloqueAplicacion}>
                <View style={styles.filaTituloBloque}>
                  <Ionicons name="footsteps" size={16} color="#059669" />
                  <Text style={[styles.tituloBloque, { color: '#059669' }]}>Aplicación para hoy</Text>
                </View>
                <Text style={styles.textoAplicacion}>{dia.aplicacion}</Text>
              </View>
            ) : null}

            {/* 3. Para meditar */}
            {dia.pregunta_reflexion ? (
              <View style={styles.cajaPregunta}>
                <View style={styles.filaTituloBloque}>
                  <Ionicons name="bulb-outline" size={16} color="#D97706" />
                  <Text style={[styles.tituloBloque, { color: '#D97706' }]}>Para meditar</Text>
                </View>
                <Text style={styles.pregunta}>{dia.pregunta_reflexion}</Text>
              </View>
            ) : null}

            {/* 4. Oración especial */}
            {dia.oracion ? (
              <View style={styles.cajaOracion}>
                <View style={styles.filaTituloBloque}>
                  <Ionicons name="hand-left-outline" size={16} color={colores.primario} />
                  <Text style={styles.tituloBloque}>Oración especial</Text>
                </View>
                <Text style={styles.textoOracion}>“{dia.oracion}”</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Botones de navegación inferior */}
        <View style={styles.navegacion}>
          {diaActual > 0 && (
            <TouchableOpacity
              style={styles.botonSecundario}
              onPress={() => setDiaActual(diaActual - 1)}
            >
              <Text style={styles.textoBotonSecundario}>Día anterior</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.botonPrincipal} onPress={marcarProgreso}>
            <Text style={styles.textoBotonPrincipal}>
              {diaActual + 1 === dias.length
                ? 'Completar estudio'
                : 'Marcar día como leído y continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    imagenPortada: { width: '100%', height: 210 },
    imagenDia: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
    badgeDuracion: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      marginBottom: 6,
    },
    textoBadgeDuracion: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    tituloEstudio: { fontSize: 22, fontWeight: '700', color: colores.texto, lineHeight: 28 },
    autor: { fontSize: 13, color: colores.textoSecundario, marginTop: 4 },
    botonFavorito: { padding: 4, marginLeft: 8 },

    cajaSuscripcionInvitacion: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colores.primario + '30',
      gap: 12,
    },
    filaInfoSuscripcion: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    tituloInvitacion: {
      fontSize: 15,
      fontWeight: '700',
      color: colores.texto,
    },
    subtituloInvitacion: {
      fontSize: 12,
      color: colores.textoSecundario,
      lineHeight: 17,
      marginTop: 2,
    },
    botonSuscribirseGrande: {
      backgroundColor: colores.primario,
      borderRadius: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textoBotonSuscribirse: {
      color: colores.primarioTexto,
      fontSize: 14,
      fontWeight: '700',
    },

    cajaEstadoSuscrito: {
      backgroundColor: '#10B98115',
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#10B98130',
    },
    filaEstadoSuscrito: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    indicadorVerde: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
    },
    textoEstadoSuscrito: {
      fontSize: 13,
      fontWeight: '700',
      color: '#059669',
    },
    textoAbandonar: {
      fontSize: 12,
      color: colores.peligro,
      fontWeight: '600',
    },

    progresoBar: {
      height: 6,
      backgroundColor: colores.superficie,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 14,
    },
    progresoRelleno: { height: '100%', backgroundColor: colores.primario },

    filaSelectorDias: {
      gap: 8,
      paddingBottom: 14,
    },
    chipDia: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    chipDiaSeleccionado: {
      backgroundColor: colores.primario,
      borderColor: colores.primario,
    },
    chipDiaPasado: {
      borderColor: '#10B98160',
    },
    textoChipDia: {
      fontSize: 12,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    textoChipDiaSeleccionado: {
      color: colores.primarioTexto,
      fontWeight: '700',
    },

    tarjetaDia: {
      backgroundColor: colores.superficie,
      borderRadius: 18,
      padding: 18,
      marginTop: 4,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    tituloDia: { fontSize: 19, fontWeight: '800', marginBottom: 8, color: colores.texto, lineHeight: 26 },
    cajaPasaje: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    referencia: { fontSize: 14, color: colores.primario, fontWeight: '700' },
    textoBiblico: {
      fontStyle: 'italic',
      fontSize: 15,
      color: colores.textoSecundario,
      marginBottom: 16,
      lineHeight: 22,
      paddingLeft: 10,
      borderLeftWidth: 3,
      borderLeftColor: colores.primario,
    },

    bloquePredicacion: {
      marginBottom: 16,
    },
    filaTituloBloque: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    tituloBloque: {
      fontSize: 13,
      fontWeight: '800',
      color: colores.primario,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    predicacionTexto: {
      fontSize: 15,
      lineHeight: 24,
      color: colores.texto,
    },

    bloqueAplicacion: {
      backgroundColor: '#10B98112',
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#10B98130',
    },
    textoAplicacion: {
      fontSize: 14,
      lineHeight: 21,
      color: colores.texto,
    },

    cajaPregunta: {
      backgroundColor: '#D9770612',
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#D9770630',
    },
    pregunta: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colores.texto,
      lineHeight: 21,
    },

    cajaOracion: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
    },
    textoOracion: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colores.texto,
      lineHeight: 22,
    },

    navegacion: { marginTop: 22, gap: 10 },
    botonPrincipal: {
      backgroundColor: colores.primario,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    textoBotonPrincipal: { color: colores.primarioTexto, fontWeight: '700', fontSize: 14 },
    botonSecundario: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      backgroundColor: colores.superficie,
    },
    textoBotonSecundario: { color: colores.texto, fontWeight: '600', fontSize: 14 },
  });
}
