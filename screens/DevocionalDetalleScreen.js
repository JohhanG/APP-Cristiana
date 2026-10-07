import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { buscarVersiculo } from '../lib/bibliaApi.js';
import { supabase } from '../lib/supabase.js';
import {
  obtenerDevocionalAleatorio,
  normalizarDevocional,
  TEMAS_DEVOCIONALES,
} from '../lib/devocionalesService.js';

export default function DevocionalDetalleScreen({ route, navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const devocionalInicial = route.params?.devocional;
  const temaId = route.params?.temaId || devocionalInicial?.tema || 'todos';

  const [devocional, setDevocional] = useState(devocionalInicial ? normalizarDevocional(devocionalInicial) : null);
  const [textoBiblico, setTextoBiblico] = useState('');
  const [cargandoVerso, setCargandoVerso] = useState(false);
  const [yaLeidoHoy, setYaLeidoHoy] = useState(false);
  const [guardandoLectura, setGuardandoLectura] = useState(false);
  const [cambiandoDevocional, setCambiandoDevocional] = useState(false);

  useEffect(() => {
    if (devocional?.referencia_biblica) {
      cargarTextoBiblico(devocional.referencia_biblica);
    }
    verificarSiLeidoHoy();
  }, [devocional?.id, devocional?.referencia_biblica]);

  async function cargarTextoBiblico(referencia) {
    setCargandoVerso(true);
    const resultado = await buscarVersiculo(referencia);
    setCargandoVerso(false);
    if (resultado.exito) {
      setTextoBiblico(resultado.texto);
    } else {
      setTextoBiblico('');
    }
  }

  async function verificarSiLeidoHoy() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('lecturas_diarias')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('fecha', hoy)
      .maybeSingle();
    if (data) setYaLeidoHoy(true);
  }

  async function marcarLeido() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes estar autenticado para registrar tu lectura.');
      return;
    }

    setYaLeidoHoy(true);
    setGuardandoLectura(true);
    const hoy = new Date().toISOString().slice(0, 10);
    try {
      const { error } = await supabase
        .from('lecturas_diarias')
        .insert({ usuario_id: user.id, fecha: hoy });

      if (!error || error.code === '23505') {
        Alert.alert('¡Lectura completada! 🙏', 'Tu racha espiritual se ha actualizado hoy.');
      }
    } catch {} finally {
      setGuardandoLectura(false);
    }
  }

  async function cargarOtroAleatorio() {
    setCambiandoDevocional(true);
    const nuevo = await obtenerDevocionalAleatorio(temaId);
    setCambiandoDevocional(false);
    if (nuevo) {
      setDevocional(nuevo);
    }
  }

  async function compartirDevocional() {
    if (!devocional) return;
    try {
      const mensaje = `✨ ${devocional.titulo}\n📖 ${devocional.referencia_biblica}\n\n"${textoBiblico || ''}"\n\n🎙️ REFLEXIÓN:\n${devocional.predicacion || devocional.reflexion}\n\n🙏 ORACIÓN ESPECIAL:\n${devocional.oracion || ''}\n\nCompartido desde Mi App Cristiana`;
      await Share.share({
        message: mensaje.trim(),
        title: devocional.titulo,
      });
    } catch (e) {
      console.warn('Error al compartir:', e);
    }
  }

  const infoTema = TEMAS_DEVOCIONALES.find((t) => t.id === devocional?.tema) || TEMAS_DEVOCIONALES[0];

  if (!devocional) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const textoPredicacion = devocional.predicacion || devocional.reflexion;

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      {/* Insignia de tema y acciones de cabecera */}
      <View style={styles.filaCabecera}>
        <View style={[styles.insigniaTema, { backgroundColor: infoTema.color + '20' }]}>
          <Ionicons name={infoTema.icono} size={14} color={infoTema.color} style={{ marginRight: 6 }} />
          <Text style={[styles.textoInsignia, { color: infoTema.color }]}>{infoTema.etiqueta}</Text>
        </View>

        <TouchableOpacity style={styles.botonAccionIcono} onPress={compartirDevocional}>
          <Ionicons name="share-outline" size={20} color={colores.texto} />
        </TouchableOpacity>
      </View>

      {/* Título de la Prédica */}
      <Text style={styles.titulo}>{devocional.titulo}</Text>

      {/* 1. Tarjeta del Pasaje Bíblico Central */}
      <View style={styles.tarjetaBiblica}>
        <View style={styles.filaVersiculoHeader}>
          <Ionicons name="book" size={18} color={colores.primario} />
          <Text style={styles.referenciaBiblica}>{devocional.referencia_biblica}</Text>
          <Text style={styles.versionBiblica}>RV1960</Text>
        </View>

        {cargandoVerso ? (
          <ActivityIndicator color={colores.primario} style={{ marginVertical: 12 }} />
        ) : textoBiblico ? (
          <Text style={styles.textoVersiculo}>“{textoBiblico}”</Text>
        ) : (
          <Text style={[styles.textoVersiculo, { fontStyle: 'normal', color: colores.textoTenue }]}>
            Medita en el pasaje de las Escrituras: {devocional.referencia_biblica}
          </Text>
        )}
      </View>

      {/* 2. Sección: Reflexión */}
      <View style={styles.seccionPredicacion}>
        <View style={styles.filaTituloSeccion}>
          <Ionicons name="sparkles-outline" size={18} color={colores.primario} />
          <Text style={styles.tituloSeccion}>Reflexión</Text>
        </View>
        <Text style={styles.textoPredicacion}>{textoPredicacion}</Text>
      </View>

      {/* 3. Sección: Aplicación para hoy */}
      {devocional.paso_practico ? (
        <View style={styles.tarjetaPasoPractico}>
          <View style={styles.filaTituloTarjeta}>
            <Ionicons name="footsteps" size={18} color="#059669" />
            <Text style={styles.tituloPasoPractico}>Aplicación para hoy</Text>
          </View>
          <Text style={styles.textoPasoPractico}>{devocional.paso_practico}</Text>
        </View>
      ) : null}

      {/* 4. Sección: Para meditar */}
      {devocional.preguntas && devocional.preguntas.length > 0 ? (
        <View style={styles.tarjetaPreguntas}>
          <View style={styles.filaTituloTarjeta}>
            <Ionicons name="help-circle-outline" size={20} color="#D97706" />
            <Text style={styles.tituloPreguntas}>Para meditar</Text>
          </View>
          {devocional.preguntas.map((p, idx) => (
            <View key={idx} style={styles.itemPregunta}>
              <Text style={styles.bulletPregunta}>•</Text>
              <Text style={styles.textoPreguntaItem}>{p}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 5. Sección: Oración especial */}
      {devocional.oracion ? (
        <View style={styles.tarjetaOracion}>
          <View style={styles.filaTituloTarjeta}>
            <Ionicons name="hand-left-outline" size={18} color={colores.primario} />
            <Text style={styles.tituloOracion}>Oración especial</Text>
          </View>
          <Text style={styles.textoOracion}>“{devocional.oracion}”</Text>
        </View>
      ) : null}

      {/* Aviso de biblioteca o IA */}
      {devocional.avisoClave ? (
        <View style={styles.tarjetaAviso}>
          <Ionicons name="information-circle-outline" size={16} color={colores.textoSecundario} />
          <Text style={styles.textoAviso}>{devocional.avisoClave}</Text>
        </View>
      ) : null}

      {/* Botones de acción */}
      <View style={styles.contenedorBotones}>
        <TouchableOpacity
          style={[styles.botonMarcarLeido, yaLeidoHoy && styles.botonMarcarLeidoListo]}
          onPress={marcarLeido}
          disabled={yaLeidoHoy || guardandoLectura}
        >
          {guardandoLectura ? (
            <ActivityIndicator color={colores.primarioTexto} />
          ) : (
            <>
              <Ionicons
                name={yaLeidoHoy ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={colores.primarioTexto}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.textoBotonLeido}>
                {yaLeidoHoy ? 'Devocional completado hoy' : 'Marcar devocional leído'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonAleatorioSecundario}
          onPress={cargarOtroAleatorio}
          disabled={cambiandoDevocional}
        >
          {cambiandoDevocional ? (
            <ActivityIndicator color={colores.primario} />
          ) : (
            <>
              <Ionicons name="shuffle" size={18} color={colores.primario} style={{ marginRight: 6 }} />
              <Text style={styles.textoBotonAleatorio}>Ver otra prédica aleatoria</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    centrado: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filaCabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    insigniaTema: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
    },
    textoInsignia: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    botonAccionIcono: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: colores.superficie,
    },
    titulo: {
      fontSize: 24,
      fontWeight: '800',
      color: colores.texto,
      marginBottom: 16,
      lineHeight: 32,
    },
    tarjetaBiblica: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: colores.primario,
    },
    filaVersiculoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    referenciaBiblica: {
      fontSize: 15,
      fontWeight: '700',
      color: colores.primario,
      flex: 1,
    },
    versionBiblica: {
      fontSize: 11,
      fontWeight: '700',
      color: colores.textoTenue,
      backgroundColor: colores.borde,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    textoVersiculo: {
      fontSize: 15,
      lineHeight: 23,
      fontStyle: 'italic',
      color: colores.texto,
    },

    seccionPredicacion: {
      marginBottom: 22,
    },
    filaTituloSeccion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    tituloSeccion: {
      fontSize: 14,
      fontWeight: '800',
      color: colores.primario,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    textoPredicacion: {
      fontSize: 15,
      lineHeight: 25,
      color: colores.texto,
    },

    tarjetaPasoPractico: {
      backgroundColor: '#10B98112',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#10B98135',
    },
    filaTituloTarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    tituloPasoPractico: {
      fontSize: 14,
      fontWeight: '700',
      color: '#059669',
    },
    textoPasoPractico: {
      fontSize: 14,
      lineHeight: 22,
      color: colores.texto,
    },

    tarjetaPreguntas: {
      backgroundColor: '#D9770612',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#D9770635',
    },
    tituloPreguntas: {
      fontSize: 14,
      fontWeight: '700',
      color: '#D97706',
    },
    itemPregunta: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 6,
    },
    bulletPregunta: {
      fontSize: 16,
      lineHeight: 20,
      color: '#D97706',
      fontWeight: '700',
    },
    textoPreguntaItem: {
      flex: 1,
      fontSize: 14,
      lineHeight: 21,
      color: colores.texto,
    },

    tarjetaOracion: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 16,
      padding: 18,
      marginBottom: 22,
    },
    tituloOracion: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.primario,
    },
    textoOracion: {
      fontSize: 14,
      lineHeight: 23,
      color: colores.texto,
      fontStyle: 'italic',
    },

    tarjetaAviso: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 10,
      padding: 12,
      marginBottom: 20,
      gap: 8,
    },
    textoAviso: {
      fontSize: 12,
      color: colores.textoSecundario,
      flex: 1,
      lineHeight: 16,
    },
    contenedorBotones: {
      gap: 12,
      marginTop: 6,
    },
    botonMarcarLeido: {
      backgroundColor: colores.primario,
      borderRadius: 14,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    botonMarcarLeidoListo: {
      backgroundColor: '#059669',
    },
    textoBotonLeido: {
      color: colores.primarioTexto,
      fontSize: 15,
      fontWeight: '700',
    },
    botonAleatorioSecundario: {
      backgroundColor: colores.superficie,
      borderRadius: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colores.borde,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textoBotonAleatorio: {
      color: colores.primario,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
