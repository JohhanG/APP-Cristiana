import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import { enviarNotificacionAUsuario } from '../lib/notificaciones';
import { generarEstudioCompletoConIA, DURACIONES_ESTUDIO } from '../lib/estudiosService';

export default function AdminScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [miRol, setMiRol] = useState(null); // 'admin' | 'revisor'
  const [vista, setVista] = useState('pendientes'); // 'pendientes' | 'eliminaciones' | 'soporte' | 'revisores'

  const [pendientes, setPendientes] = useState([]);
  const [eliminaciones, setEliminaciones] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [historialRevision, setHistorialRevision] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  const [modalRechazoVisible, setModalRechazoVisible] = useState(false);
  const [estudioARechazar, setEstudioARechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const [modalRespuestaVisible, setModalRespuestaVisible] = useState(false);
  const [ticketAResponder, setTicketAResponder] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');

  // Generador de estudios con IA
  const [modalIaEstudioVisible, setModalIaEstudioVisible] = useState(false);
  const [iaLibro, setIaLibro] = useState('');
  const [iaTema, setIaTema] = useState('');
  const [iaNumDias, setIaNumDias] = useState(7);
  const [iaPublicarDirecto, setIaPublicarDirecto] = useState(true);
  const [generandoIaEstudio, setGenerandoIaEstudio] = useState(false);

  async function cargarTodo() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let rolActual = miRol;

      if (user) {
        const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).maybeSingle();
        rolActual = perfil?.rol || null;
        setMiRol(rolActual);
      }

      const { data: pendientesData, error: errorPendientes } = await supabase
        .from('estudios')
        .select('id, titulo, tema, num_dias, creado_en, autor_id, perfiles!autor_id(nombre_usuario)')
        .eq('estado', 'pendiente')
        .order('creado_en', { ascending: true });

      if (errorPendientes) {
        console.log('Error al cargar pendientes:', errorPendientes.message);
        setPendientes([]);
      } else {
        setPendientes(pendientesData || []);
      }

      // Lo siguiente solo aplica para administradores
      if (rolActual === 'admin') {
        const { data: eliminacionesData, error: errorEliminaciones } = await supabase
          .from('estudios')
          .select('id, titulo, tema, num_dias, motivo_eliminacion, autor_id, perfiles!autor_id(nombre_usuario)')
          .eq('solicitud_eliminacion', true)
          .order('creado_en', { ascending: true });
        if (!errorEliminaciones) setEliminaciones(eliminacionesData || []);
        else setEliminaciones([]);

        const { data: ticketsData, error: errorTickets } = await supabase
          .from('tickets')
          .select('*, perfiles!usuario_id(nombre_usuario)')
          .order('creado_en', { ascending: false });
        if (!errorTickets) setTickets(ticketsData || []);
        else setTickets([]);

        const { data: historialData, error: errorHistorial } = await supabase
          .from('estudios')
          .select('id, titulo, estado, revisado_en, perfiles!revisado_por(nombre_usuario)')
          .not('revisado_por', 'is', null)
          .order('revisado_en', { ascending: false })
          .limit(100);
        if (!errorHistorial) setHistorialRevision(historialData || []);
        else setHistorialRevision([]);
      }
    } catch (err) {
      console.log('Error en cargarTodo:', err.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  useEffect(() => {
    cargarTodo();
    const unsubscribe = navigation.addListener('focus', cargarTodo);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarTodo();
  }, []);

  // ---------- Estudios pendientes (admin y revisor) ----------

  async function aprobar(estudioId) {
    const estudio = pendientes.find((e) => e.id === estudioId);
    const { data: { user } } = await supabase.auth.getUser();

    setProcesandoId(estudioId);
    const { error } = await supabase
      .from('estudios')
      .update({
        estado: 'publicado',
        motivo_rechazo: null,
        revisado_por: user?.id || null,
        revisado_en: new Date().toISOString(),
      })
      .eq('id', estudioId);
    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setPendientes((actual) => actual.filter((e) => e.id !== estudioId));

    if (estudio?.autor_id) {
      enviarNotificacionAUsuario(
        estudio.autor_id,
        '¡Tu estudio fue aprobado! 🎉',
        `"${estudio.titulo}" ya está publicado y visible para todos.`
      );
    }
  }

  function abrirModalRechazo(estudioId) {
    setEstudioARechazar(estudioId);
    setMotivoRechazo('');
    setModalRechazoVisible(true);
  }

  async function confirmarRechazoConMotivo() {
    if (!motivoRechazo.trim()) {
      Alert.alert('Falta el motivo', 'Escribe brevemente por qué se rechaza, así la persona puede corregirlo');
      return;
    }

    const estudioId = estudioARechazar;
    const estudio = pendientes.find((e) => e.id === estudioId);
    const { data: { user } } = await supabase.auth.getUser();

    setModalRechazoVisible(false);
    setProcesandoId(estudioId);
    const { error } = await supabase
      .from('estudios')
      .update({
        estado: 'rechazado',
        motivo_rechazo: motivoRechazo.trim(),
        revisado_por: user?.id || null,
        revisado_en: new Date().toISOString(),
      })
      .eq('id', estudioId);
    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setPendientes((actual) => actual.filter((e) => e.id !== estudioId));

    if (estudio?.autor_id) {
      enviarNotificacionAUsuario(
        estudio.autor_id,
        'Tu estudio necesita ajustes',
        `"${estudio.titulo}" fue devuelto para que lo corrijas. Motivo: ${motivoRechazo.trim()}`
      );
    }
  }

  // ---------- Solicitudes de eliminación (solo admin) ----------

  function confirmarEliminacionDefinitiva(item) {
    Alert.alert(
      'Eliminar definitivamente',
      `"${item.titulo}" se eliminará por completo y no se podrá recuperar. ¿Continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarDefinitivamente(item) },
      ]
    );
  }

  async function eliminarDefinitivamente(item) {
    setProcesandoId(item.id);
    const { error } = await supabase.from('estudios').delete().eq('id', item.id);
    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setEliminaciones((actual) => actual.filter((e) => e.id !== item.id));

    if (item.autor_id) {
      enviarNotificacionAUsuario(item.autor_id, 'Tu estudio fue eliminado', `"${item.titulo}" fue eliminado según tu solicitud.`);
    }
  }

  async function rechazarSolicitudEliminacion(item) {
    setProcesandoId(item.id);
    const { error } = await supabase
      .from('estudios')
      .update({ solicitud_eliminacion: false, motivo_eliminacion: null })
      .eq('id', item.id);
    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setEliminaciones((actual) => actual.filter((e) => e.id !== item.id));

    if (item.autor_id) {
      enviarNotificacionAUsuario(item.autor_id, 'Tu solicitud de eliminación fue rechazada', `"${item.titulo}" se queda publicado.`);
    }
  }

  // ---------- Tickets de soporte (solo admin) ----------

  function abrirModalRespuesta(ticket) {
    setTicketAResponder(ticket);
    setTextoRespuesta(ticket.respuesta || '');
    setModalRespuestaVisible(true);
  }

  async function enviarRespuestaTicket() {
    if (!textoRespuesta.trim()) {
      Alert.alert('Falta la respuesta', 'Escribe algo para responder al usuario');
      return;
    }

    const ticketId = ticketAResponder.id;
    setModalRespuestaVisible(false);
    setProcesandoId(ticketId);

    const { error } = await supabase
      .from('tickets')
      .update({ estado: 'respondido', respuesta: textoRespuesta.trim(), respondido_en: new Date().toISOString() })
      .eq('id', ticketId);

    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setTickets((actual) =>
      actual.map((t) => (t.id === ticketId ? { ...t, estado: 'respondido', respuesta: textoRespuesta.trim() } : t))
    );

    enviarNotificacionAUsuario(
      ticketAResponder.usuario_id,
      'Respondimos tu mensaje',
      `Tu ticket "${ticketAResponder.asunto}" tiene una respuesta nueva.`
    );
  }

  async function ejecutarGeneracionIaEstudio() {
    if (!iaLibro.trim()) {
      Alert.alert('Falta el pasaje', 'Ingresa el libro o capítulos sobre los que deseas generar el estudio (ej. Romanos 8).');
      return;
    }

    setGenerandoIaEstudio(true);
    const resultado = await generarEstudioCompletoConIA({
      libroOCapitulo: iaLibro.trim(),
      tema: iaTema.trim() || 'Crecimiento espiritual',
      numDias: iaNumDias,
      publicarDirecto: iaPublicarDirecto,
    });
    setGenerandoIaEstudio(false);

    if (resultado.exito) {
      setModalIaEstudioVisible(false);
      setIaLibro('');
      setIaTema('');
      Alert.alert(
        '¡Estudio bíblico generado! 🎉',
        `El plan de ${iaNumDias} días sobre "${resultado.estudio?.titulo}" ha sido ${iaPublicarDirecto ? 'publicado para la comunidad' : 'enviado a pendientes'}.`
      );
      cargarTodo();
    } else {
      Alert.alert('Error', 'No se pudo generar el estudio bíblico. Intenta nuevamente.');
    }
  }

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const esAdmin = miRol === 'admin';
  const ticketsAbiertos = (tickets || []).filter((t) => t?.estado === 'abierto').length;
  const cantPendientes = (pendientes || []).length;
  const cantEliminaciones = (eliminaciones || []).length;

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      {!esAdmin && (
        <View style={styles.tarjetaInstrucciones}>
          <View style={styles.filaInstrucciones}>
            <Ionicons name="shield-checkmark" size={20} color={colores.primario} />
            <Text style={styles.tituloInstrucciones}>Tu función como Revisor</Text>
          </View>
          <Text style={styles.textoInstrucciones}>
            Tu trabajo es revisar los estudios bíblicos que la comunidad envía antes de que se publiquen. Por cada
            estudio pendiente:
          </Text>
          <Text style={styles.itemInstrucciones}>• Léelo completo, día por día</Text>
          <Text style={styles.itemInstrucciones}>• Revisa que las referencias bíblicas sean correctas</Text>
          <Text style={styles.itemInstrucciones}>• Verifica que el contenido esté alineado con la fe cristiana y sea respetuoso</Text>
          <Text style={styles.itemInstrucciones}>• Si todo está bien, apruébalo</Text>
          <Text style={styles.itemInstrucciones}>• Si algo falta o está mal, devuélvelo explicando claramente qué corregir</Text>
        </View>
      )}

      {esAdmin && (
        <View style={styles.filaPestanas}>
          <TouchableOpacity
            style={[styles.pestana, vista === 'pendientes' && styles.pestanaActiva]}
            onPress={() => setVista('pendientes')}
          >
            <Text style={[styles.textoPestana, vista === 'pendientes' && styles.textoPestanaActiva]}>
              Pendientes {cantPendientes > 0 ? `(${cantPendientes})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pestana, vista === 'eliminaciones' && styles.pestanaActiva]}
            onPress={() => setVista('eliminaciones')}
          >
            <Text style={[styles.textoPestana, vista === 'eliminaciones' && styles.textoPestanaActiva]}>
              Eliminar {cantEliminaciones > 0 ? `(${cantEliminaciones})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pestana, vista === 'soporte' && styles.pestanaActiva]}
            onPress={() => setVista('soporte')}
          >
            <Text style={[styles.textoPestana, vista === 'soporte' && styles.textoPestanaActiva]}>
              Soporte {ticketsAbiertos > 0 ? `(${ticketsAbiertos})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pestana, vista === 'revisores' && styles.pestanaActiva]}
            onPress={() => setVista('revisores')}
          >
            <Text style={[styles.textoPestana, vista === 'revisores' && styles.textoPestanaActiva]}>Historial</Text>
          </TouchableOpacity>
        </View>
      )}

      {(!esAdmin || vista === 'pendientes') && (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.botonGenerarIaHeader}
              onPress={() => setModalIaEstudioVisible(true)}
            >
              <View style={styles.iconoGenerarIa}>
                <Ionicons name="sparkles" size={18} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tituloBotonGenerarIa}>Crear nuevo plan de estudio</Text>
                <Text style={styles.subtituloBotonGenerarIa}>
                  Crea planes de 7, 15 o 30 días sobre cualquier pasaje bíblico
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colores.textoTenue} />
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color={colores.textoTenue} />
              <Text style={styles.vacio}>No hay estudios pendientes de revisión</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <TouchableOpacity onPress={() => navigation.navigate('EstudioDetalle', { estudioId: item.id })}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.meta}>
                  por {item.perfiles?.nombre_usuario || 'anónimo'} · {item.num_dias} días
                  {item.tema ? ` · ${item.tema}` : ''}
                </Text>
              </TouchableOpacity>

              <View style={styles.filaBotones}>
                <TouchableOpacity
                  style={styles.botonSecundario}
                  onPress={() => abrirModalRechazo(item.id)}
                  disabled={procesandoId === item.id}
                >
                  <Text style={styles.textoBotonSecundario}>Devolver con motivo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonPrimario}
                  onPress={() => aprobar(item.id)}
                  disabled={procesandoId === item.id}
                >
                  {procesandoId === item.id ? (
                    <ActivityIndicator color={colores.primarioTexto} size="small" />
                  ) : (
                    <Text style={styles.textoBotonPrimario}>Aprobar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {esAdmin && vista === 'eliminaciones' && (
        <FlatList
          data={eliminaciones}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <Ionicons name="trash-outline" size={40} color={colores.textoTenue} />
              <Text style={styles.vacio}>No hay solicitudes de eliminación</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <TouchableOpacity onPress={() => navigation.navigate('EstudioDetalle', { estudioId: item.id })}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.meta}>
                  por {item.perfiles?.nombre_usuario || 'anónimo'} · {item.num_dias} días
                  {item.tema ? ` · ${item.tema}` : ''}
                </Text>
                <View style={styles.cajaTexto}>
                  <Text style={styles.textoCaja}>{item.motivo_eliminacion}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.filaBotones}>
                <TouchableOpacity
                  style={styles.botonSecundario}
                  onPress={() => rechazarSolicitudEliminacion(item)}
                  disabled={procesandoId === item.id}
                >
                  <Text style={styles.textoBotonSecundario}>Mantener publicado</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonPeligro}
                  onPress={() => confirmarEliminacionDefinitiva(item)}
                  disabled={procesandoId === item.id}
                >
                  {procesandoId === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.textoBotonPeligro}>Eliminar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {esAdmin && vista === 'soporte' && (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <Ionicons name="mail-open-outline" size={40} color={colores.textoTenue} />
              <Text style={styles.vacio}>No hay mensajes de soporte</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <View style={styles.filaTicket}>
                <Text style={styles.titulo}>{item.asunto}</Text>
                <View
                  style={[
                    styles.chipEstado,
                    { backgroundColor: (item.estado === 'respondido' ? colores.primario : colores.peligro) + '22' },
                  ]}
                >
                  <Text
                    style={[
                      styles.textoChipEstado,
                      { color: item.estado === 'respondido' ? colores.primario : colores.peligro },
                    ]}
                  >
                    {item.estado === 'respondido' ? 'Respondido' : 'Sin responder'}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>de {item.perfiles?.nombre_usuario || 'anónimo'}</Text>
              <View style={styles.cajaTexto}>
                <Text style={styles.textoCaja}>{item.mensaje}</Text>
              </View>

              {item.respuesta && (
                <View style={[styles.cajaTexto, { marginTop: 8 }]}>
                  <Text style={styles.etiquetaRespuestaAdmin}>Tu respuesta:</Text>
                  <Text style={styles.textoCaja}>{item.respuesta}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.botonPrimario, { marginTop: 12 }]}
                onPress={() => abrirModalRespuesta(item)}
                disabled={procesandoId === item.id}
              >
                <Text style={styles.textoBotonPrimario}>{item.estado === 'respondido' ? 'Editar respuesta' : 'Responder'}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {esAdmin && vista === 'revisores' && (
        <FlatList
          data={historialRevision}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <Ionicons name="time-outline" size={40} color={colores.textoTenue} />
              <Text style={styles.vacio}>Aún no hay estudios revisados</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <View style={styles.filaTicket}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <View
                  style={[
                    styles.chipEstado,
                    { backgroundColor: (item.estado === 'publicado' ? colores.primario : colores.peligro) + '22' },
                  ]}
                >
                  <Text
                    style={[
                      styles.textoChipEstado,
                      { color: item.estado === 'publicado' ? colores.primario : colores.peligro },
                    ]}
                  >
                    {item.estado === 'publicado' ? 'Aprobado' : 'Devuelto'}
                  </Text>
                </View>
              </View>
              <Text style={styles.meta}>
                por {item.perfiles?.nombre_usuario || 'un revisor'}
                {item.revisado_en ? ` · ${new Date(item.revisado_en).toLocaleDateString('es-ES')}` : ''}
              </Text>
            </View>
          )}
        />
      )}

      {esAdmin && (
        <TouchableOpacity style={styles.botonFlotanteUsuarios} onPress={() => navigation.navigate('Usuarios')}>
          <Ionicons name="people" size={20} color={colores.primarioTexto} />
        </TouchableOpacity>
      )}

      {/* Modal: motivo de rechazo */}
      <Modal visible={modalRechazoVisible} transparent animationType="fade" onRequestClose={() => setModalRechazoVisible(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>¿Por qué se devuelve este estudio?</Text>
            <Text style={styles.subtituloModal}>
              La persona verá este motivo y podrá corregir su estudio para volver a enviarlo.
            </Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej. Falta la referencia bíblica del día 3, revisa la ortografía..."
              placeholderTextColor={colores.textoTenue}
              value={motivoRechazo}
              onChangeText={setMotivoRechazo}
              multiline
            />
            <View style={styles.filaBotonesModal}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalRechazoVisible(false)}>
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarModal} onPress={confirmarRechazoConMotivo}>
                <Text style={styles.textoBotonEnviarModal}>Devolver estudio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: responder ticket */}
      <Modal visible={modalRespuestaVisible} transparent animationType="fade" onRequestClose={() => setModalRespuestaVisible(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>Responder a {ticketAResponder?.perfiles?.nombre_usuario || 'usuario'}</Text>
            <Text style={styles.subtituloModal}>{ticketAResponder?.asunto}</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor={colores.textoTenue}
              value={textoRespuesta}
              onChangeText={setTextoRespuesta}
              multiline
            />
            <View style={styles.filaBotonesModal}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalRespuestaVisible(false)}>
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarModal} onPress={enviarRespuestaTicket}>
                <Text style={styles.textoBotonEnviarModal}>Enviar respuesta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Generar Estudio Bíblico con IA */}
      <Modal
        visible={modalIaEstudioVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !generandoIaEstudio && setModalIaEstudioVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={[styles.cajaModal, { maxHeight: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="sparkles" size={20} color="#6366F1" />
                <Text style={styles.tituloModal}>Crear nuevo plan de estudio</Text>
              </View>
              {!generandoIaEstudio && (
                <TouchableOpacity onPress={() => setModalIaEstudioVisible(false)}>
                  <Ionicons name="close" size={22} color={colores.textoTenue} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.subtituloModal}>
                Crea un plan devocional completo de varios días con reflexiones y preguntas basadas en la Biblia.
              </Text>

              {/* Sugerencias Rápidas de Estudio */}
              <Text style={[styles.etiquetaCampo, { marginTop: 8, marginBottom: 6 }]}>Sugerencias temáticas:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {[
                  { libro: 'Santiago', tema: 'Fe Práctica en el Mundo Real', dias: 7 },
                  { libro: 'Pedro (Evangelios y Hechos)', tema: 'Del Fracaso a la Roca de Fe', dias: 7 },
                  { libro: 'Filipenses 4 y Salmos', tema: 'Paz Sobrenatural y Vencer la Ansiedad', dias: 7 },
                  { libro: 'David (1 Samuel y Salmos)', tema: 'Un Corazón que Busca a Dios', dias: 7 },
                  { libro: 'Filipenses', tema: 'Gozo Inquebrantable en las Pruebas', dias: 15 },
                  { libro: 'Proverbios', tema: 'Sabiduría para tus Decisiones', dias: 30 },
                ].map((sug, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      backgroundColor: colores.superficieAlterna,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: colores.borde,
                    }}
                    onPress={() => {
                      setIaLibro(sug.libro);
                      setIaTema(sug.tema);
                      setIaNumDias(sug.dias);
                    }}
                  >
                    <Text style={{ fontSize: 11.5, color: colores.texto, fontWeight: '600' }}>
                      {sug.libro} ({sug.dias}d)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.etiquetaCampo}>Libro o Pasaje bíblico:</Text>
              <TextInput
                style={styles.inputSimple}
                placeholder="Ej. Romanos 8, Efesios, Mateo 5-7..."
                placeholderTextColor={colores.textoTenue}
                value={iaLibro}
                onChangeText={setIaLibro}
                editable={!generandoIaEstudio}
              />

              <Text style={[styles.etiquetaCampo, { marginTop: 12 }]}>Tema o Enfoque espiritual:</Text>
              <TextInput
                style={styles.inputSimple}
                placeholder="Ej. Vida en el Espíritu, Fe en las pruebas..."
                placeholderTextColor={colores.textoTenue}
                value={iaTema}
                onChangeText={setIaTema}
                editable={!generandoIaEstudio}
              />

              <Text style={[styles.etiquetaCampo, { marginTop: 14 }]}>Duración del estudio:</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                {DURACIONES_ESTUDIO.map((d) => {
                  const seleccionado = iaNumDias === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[
                        styles.chipDuracionModal,
                        seleccionado && { backgroundColor: d.color, borderColor: d.color },
                      ]}
                      onPress={() => setIaNumDias(d.id)}
                      disabled={generandoIaEstudio}
                    >
                      <Text style={[styles.textoChipDuracion, seleccionado && { color: '#fff', fontWeight: '700' }]}>
                        {d.etiqueta}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.filaSwitchPublicar}>
                <TouchableOpacity
                  style={[styles.botonOpcionPublicar, iaPublicarDirecto && styles.botonOpcionPublicarActivo]}
                  onPress={() => setIaPublicarDirecto(true)}
                  disabled={generandoIaEstudio}
                >
                  <Text style={[styles.textoOpcionPublicar, iaPublicarDirecto && styles.textoOpcionPublicarActivo]}>
                    Publicar de inmediato
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botonOpcionPublicar, !iaPublicarDirecto && styles.botonOpcionPublicarActivo]}
                  onPress={() => setIaPublicarDirecto(false)}
                  disabled={generandoIaEstudio}
                >
                  <Text style={[styles.textoOpcionPublicar, !iaPublicarDirecto && styles.textoOpcionPublicarActivo]}>
                    Guardar como pendiente
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.filaBotonesModal}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalIaEstudioVisible(false)}
                disabled={generandoIaEstudio}
              >
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonEnviarModal, { backgroundColor: '#6366F1' }]}
                onPress={ejecutarGeneracionIaEstudio}
                disabled={generandoIaEstudio}
              >
                {generandoIaEstudio ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.textoBotonEnviarModal}>Generar estudio ({iaNumDias} días)</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tarjetaInstrucciones: {
      backgroundColor: colores.superficieAlterna,
      margin: 16,
      marginBottom: 0,
      borderRadius: 12,
      padding: 16,
    },
    filaInstrucciones: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    tituloInstrucciones: { fontSize: 15, fontWeight: '700', color: colores.texto },
    textoInstrucciones: { fontSize: 13, color: colores.textoSecundario, lineHeight: 18, marginBottom: 8 },
    itemInstrucciones: { fontSize: 13, color: colores.texto, lineHeight: 20 },
    filaPestanas: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, gap: 6 },
    pestana: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colores.superficie, alignItems: 'center' },
    pestanaActiva: { backgroundColor: colores.primario },
    textoPestana: { color: colores.textoSecundario, fontWeight: '600', fontSize: 11 },
    textoPestanaActiva: { color: colores.primarioTexto },
    vacioContenedor: { alignItems: 'center', marginTop: 60 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14 },
    tarjeta: { backgroundColor: colores.superficie, borderRadius: 12, padding: 14, marginBottom: 10 },
    titulo: { fontSize: 16, fontWeight: '600', color: colores.texto, marginBottom: 4, flex: 1 },
    meta: { fontSize: 13, color: colores.textoSecundario },
    filaTicket: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    chipEstado: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    textoChipEstado: { fontSize: 11, fontWeight: '600' },
    cajaTexto: { backgroundColor: colores.superficieAlterna, borderRadius: 8, padding: 10, marginTop: 10 },
    textoCaja: { fontSize: 13, color: colores.texto, lineHeight: 18 },
    etiquetaRespuestaAdmin: { fontSize: 11, color: colores.primario, fontWeight: '700', marginBottom: 4 },
    filaBotones: { flexDirection: 'row', gap: 10, marginTop: 12 },
    botonSecundario: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.peligro,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textoBotonSecundario: { color: colores.peligro, fontWeight: '600', fontSize: 12, textAlign: 'center' },
    botonPrimario: { flex: 1, backgroundColor: colores.primario, borderRadius: 8, padding: 10, alignItems: 'center' },
    textoBotonPrimario: { color: colores.primarioTexto, fontWeight: '600', fontSize: 13 },
    botonPeligro: { flex: 1, backgroundColor: colores.peligro, borderRadius: 8, padding: 10, alignItems: 'center' },
    textoBotonPeligro: { color: '#fff', fontWeight: '600', fontSize: 13 },
    botonFlotanteUsuarios: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colores.primario,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    cajaModal: { backgroundColor: colores.superficie, borderRadius: 14, padding: 20 },
    tituloModal: { fontSize: 17, fontWeight: '600', color: colores.texto, marginBottom: 6 },
    subtituloModal: { fontSize: 13, color: colores.textoSecundario, marginBottom: 14, lineHeight: 18 },
    inputModal: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colores.texto,
      backgroundColor: colores.fondo,
      minHeight: 90,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    filaBotonesModal: { flexDirection: 'row', gap: 10 },
    botonCancelarModal: { flex: 1, borderWidth: 1, borderColor: colores.borde, borderRadius: 8, padding: 12, alignItems: 'center' },
    textoBotonCancelarModal: { color: colores.texto, fontWeight: '600' },
    botonEnviarModal: { flex: 1, backgroundColor: colores.peligro, borderRadius: 8, padding: 12, alignItems: 'center' },
    textoBotonEnviarModal: { color: '#fff', fontWeight: '600', textAlign: 'center' },

    botonGenerarIaHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#6366F112',
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#6366F135',
      gap: 12,
    },
    iconoGenerarIa: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#6366F125',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tituloBotonGenerarIa: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.texto,
    },
    subtituloBotonGenerarIa: {
      fontSize: 11,
      color: colores.textoSecundario,
      marginTop: 2,
    },
    etiquetaCampo: {
      fontSize: 13,
      fontWeight: '600',
      color: colores.textoSecundario,
      marginBottom: 6,
    },
    inputSimple: {
      backgroundColor: colores.fondo,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colores.texto,
    },
    chipDuracionModal: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colores.fondo,
      borderWidth: 1,
      borderColor: colores.borde,
      alignItems: 'center',
    },
    textoChipDuracion: {
      fontSize: 11,
      fontWeight: '600',
      color: colores.textoSecundario,
      textAlign: 'center',
    },
    filaSwitchPublicar: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
      marginBottom: 10,
    },
    botonOpcionPublicar: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colores.fondo,
      borderWidth: 1,
      borderColor: colores.borde,
      alignItems: 'center',
    },
    botonOpcionPublicarActivo: {
      backgroundColor: colores.primario,
      borderColor: colores.primario,
    },
    textoOpcionPublicar: {
      fontSize: 11,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    textoOpcionPublicarActivo: {
      color: colores.primarioTexto,
      fontWeight: '700',
    },
  });
}