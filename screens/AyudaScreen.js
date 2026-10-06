import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
 
const PREGUNTAS_FRECUENTES = [
  {
    pregunta: '¿Cómo cambio mi nombre?',
    respuesta: 'Ve a Perfil → Al lado de tu nombre encontraras un lapiz, haz click encima de el y te dejara cambiar tu nombre.',
  },
  {
    pregunta: '¿Cómo cambio mi foto de Perfil?',
    respuesta: 'Ve a perfil → selecciona la camara que sale al lado de tu foto el cual te llevara a la galeria de tu telefono y ahi selecciona la foto que quieres subir. ',
  },
  {
    pregunta: '¿Cómo creo un estudio bíblico?',
    respuesta: 'Ve a la pestaña Estudios y toca "+ Crear". Llena el título, tema y agrega los días con su referencia bíblica y reflexión. Puedes guardarlo como borrador o enviarlo directo a revisión.',
  },
  {
    pregunta: '¿Por qué mi estudio no se publica de inmediato?',
    respuesta: 'Todo estudio pasa primero por revisión de un administrador antes de ser visible para los demás usuarios. Esto puede tardar algunos días.',
  },
  {
    pregunta: 'Me devolvieron mi estudio, ¿qué hago?',
    respuesta: 'Ve a Perfil → Mis estudios. Ahí verás el motivo por el que fue devuelto. Tócalo, corrige lo que se te pide, y vuelve a enviarlo a revisión.',
  },
  {
    pregunta: '¿Cómo cambio o recupero mi contraseña?',
    respuesta: 'Si la recuerdas, ve a Perfil → Cambiar contraseña. Si la olvidaste, toca "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión y sigue el enlace que te llega por correo.',
  },
  {
    pregunta: '¿Cómo activo el recordatorio diario?',
    respuesta: 'Ve a Perfil y activa el interruptor de "Recordatorio diario". Te llegará una notificación todos los días a las 8:00 AM.',
  },
  {
    pregunta: '¿Qué versiones de la Biblia puedo leer?',
    respuesta: 'En la pestaña Biblia puedes elegir entre varias versiones en español (Reina-Valera 1960, NVI, NTV, entre otras) y en inglés, tocando el botón con el código de la versión arriba.',
  },
  {
    pregunta: '¿Cómo elimino un estudio que publiqué?',
    respuesta: 'Ve a Perfil → Mis estudios y toca "Solicitar eliminación" en el estudio publicado. Escribe el motivo; un administrador revisará tu solicitud.',
  },
];
 
export default function AyudaScreen() {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);
 
  const [preguntaAbierta, setPreguntaAbierta] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
 
  const [misTickets, setMisTickets] = useState([]);
  const [cargandoTickets, setCargandoTickets] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
 
  async function cargarMisTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargandoTickets(false);
      setRefrescando(false);
      return;
    }
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false });
 
    if (!error) setMisTickets(data);
    setCargandoTickets(false);
    setRefrescando(false);
  }
 
  useEffect(() => {
    cargarMisTickets();
  }, []);
 
  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarMisTickets();
  }, []);
 
  async function enviarTicket() {
    if (!asunto.trim() || !mensaje.trim()) {
      Alert.alert('Faltan datos', 'Escribe un asunto y tu mensaje');
      return;
    }
 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
 
    setEnviando(true);
    const { error } = await supabase.from('tickets').insert({
      usuario_id: user.id,
      asunto: asunto.trim(),
      mensaje: mensaje.trim(),
    });
    setEnviando(false);
 
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
 
    setAsunto('');
    setMensaje('');
    setMostrarFormulario(false);
    Alert.alert('Enviado', 'Recibimos tu mensaje. Te responderemos aquí mismo pronto.');
    cargarMisTickets();
  }
 
  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />}
    >
      <Text style={styles.titulo}>¿Cómo funciona la app?</Text>
      <Text style={styles.subtitulo}>Preguntas frecuentes</Text>
 
      {PREGUNTAS_FRECUENTES.map((item, index) => {
        const abierta = preguntaAbierta === index;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tarjetaPregunta}
            onPress={() => setPreguntaAbierta(abierta ? null : index)}
          >
            <View style={styles.filaPregunta}>
              <Text style={styles.textoPregunta}>{item.pregunta}</Text>
              <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={16} color={colores.textoSecundario} />
            </View>
            {abierta && <Text style={styles.textoRespuesta}>{item.respuesta}</Text>}
          </TouchableOpacity>
        );
      })}
 
      <View style={styles.separador} />
 
      <Text style={styles.subtitulo}>¿No encontraste tu respuesta?</Text>
 
      {!mostrarFormulario ? (
        <TouchableOpacity style={styles.botonContacto} onPress={() => setMostrarFormulario(true)}>
          <Ionicons name="mail-outline" size={18} color={colores.primarioTexto} style={{ marginRight: 8 }} />
          <Text style={styles.textoBotonContacto}>Contáctanos</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formulario}>
          <TextInput
            style={styles.input}
            placeholder="Asunto"
            placeholderTextColor={colores.textoTenue}
            value={asunto}
            onChangeText={setAsunto}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Cuéntanos qué pasó o en qué necesitas ayuda..."
            placeholderTextColor={colores.textoTenue}
            value={mensaje}
            onChangeText={setMensaje}
            multiline
          />
          <View style={styles.filaBotonesFormulario}>
            <TouchableOpacity style={styles.botonCancelar} onPress={() => setMostrarFormulario(false)}>
              <Text style={styles.textoBotonCancelar}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonEnviar} onPress={enviarTicket} disabled={enviando}>
              {enviando ? (
                <ActivityIndicator color={colores.primarioTexto} size="small" />
              ) : (
                <Text style={styles.textoBotonEnviar}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
 
      {misTickets.length > 0 && (
        <>
          <View style={styles.separador} />
          <Text style={styles.subtitulo}>Tus mensajes anteriores</Text>
 
          {cargandoTickets ? (
            <ActivityIndicator color={colores.primario} style={{ marginTop: 10 }} />
          ) : (
            misTickets.map((ticket) => (
              <View key={ticket.id} style={styles.tarjetaTicket}>
                <View style={styles.filaTicket}>
                  <Text style={styles.tituloTicket}>{ticket.asunto}</Text>
                  <View
                    style={[
                      styles.chipEstadoTicket,
                      { backgroundColor: (ticket.estado === 'respondido' ? colores.primario : colores.textoTenue) + '22' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoChipEstadoTicket,
                        { color: ticket.estado === 'respondido' ? colores.primario : colores.textoTenue },
                      ]}
                    >
                      {ticket.estado === 'respondido' ? 'Respondido' : 'En espera'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.mensajeTicket}>{ticket.mensaje}</Text>
 
                {ticket.respuesta && (
                  <View style={styles.cajaRespuesta}>
                    <Text style={styles.etiquetaRespuesta}>Respuesta del equipo:</Text>
                    <Text style={styles.textoRespuestaTicket}>{ticket.respuesta}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}
 
function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    titulo: { fontSize: 22, fontWeight: '700', color: colores.texto, marginBottom: 16 },
    subtitulo: { fontSize: 15, fontWeight: '600', color: colores.texto, marginBottom: 10 },
    separador: { height: 1, backgroundColor: colores.borde, marginVertical: 24 },
    tarjetaPregunta: {
      backgroundColor: colores.superficie,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
    },
    filaPregunta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    textoPregunta: { fontSize: 14, fontWeight: '600', color: colores.texto, flex: 1 },
    textoRespuesta: { fontSize: 13, color: colores.textoSecundario, marginTop: 10, lineHeight: 19 },
    botonContacto: {
      flexDirection: 'row',
      backgroundColor: colores.primario,
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoBotonContacto: { color: colores.primarioTexto, fontWeight: '600', fontSize: 15 },
    formulario: { backgroundColor: colores.superficie, borderRadius: 12, padding: 14 },
    input: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      marginBottom: 10,
      color: colores.texto,
      backgroundColor: colores.fondo,
      textAlignVertical: 'top',
    },
    filaBotonesFormulario: { flexDirection: 'row', gap: 10 },
    botonCancelar: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonCancelar: { color: colores.texto, fontWeight: '600' },
    botonEnviar: {
      flex: 1,
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonEnviar: { color: colores.primarioTexto, fontWeight: '600' },
    tarjetaTicket: {
      backgroundColor: colores.superficie,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    },
    filaTicket: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    tituloTicket: { fontSize: 14, fontWeight: '600', color: colores.texto, flex: 1 },
    chipEstadoTicket: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    textoChipEstadoTicket: { fontSize: 11, fontWeight: '600' },
    mensajeTicket: { fontSize: 13, color: colores.textoSecundario, marginTop: 6, lineHeight: 18 },
    cajaRespuesta: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 8,
      padding: 10,
      marginTop: 10,
    },
    etiquetaRespuesta: { fontSize: 11, color: colores.primario, fontWeight: '700', marginBottom: 4 },
    textoRespuestaTicket: { fontSize: 13, color: colores.texto, lineHeight: 18 },
  });
}