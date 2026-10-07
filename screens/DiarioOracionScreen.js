import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

export default function DiarioOracionScreen() {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [oraciones, setOraciones] = useState([]);
  const [vista, setVista] = useState('activa'); // 'activa' | 'respondida'
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const [modalNuevaVisible, setModalNuevaVisible] = useState(false);
  const [tituloNueva, setTituloNueva] = useState('');
  const [detalleNueva, setDetalleNueva] = useState('');
  const [guardandoNueva, setGuardandoNueva] = useState(false);

  const [modalResponderVisible, setModalResponderVisible] = useState(false);
  const [oracionAResponder, setOracionAResponder] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [guardandoRespuesta, setGuardandoRespuesta] = useState(false);

  async function cargarOraciones() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      setRefrescando(false);
      return;
    }

    const { data, error } = await supabase
      .from('oraciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false });

    if (!error) setOraciones(data || []);
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    cargarOraciones();
  }, []);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarOraciones();
  }, []);

  async function guardarNuevaOracion() {
    if (!tituloNueva.trim()) {
      Alert.alert('Falta el título', 'Escribe brevemente por qué estás orando');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setGuardandoNueva(true);
    const { error } = await supabase.from('oraciones').insert({
      usuario_id: user.id,
      titulo: tituloNueva.trim(),
      detalle: detalleNueva.trim() || null,
    });
    setGuardandoNueva(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setTituloNueva('');
    setDetalleNueva('');
    setModalNuevaVisible(false);
    cargarOraciones();
  }

  function abrirModalResponder(oracion) {
    setOracionAResponder(oracion);
    setTextoRespuesta('');
    setModalResponderVisible(true);
  }

  async function marcarComoRespondida() {
    if (!textoRespuesta.trim()) {
      Alert.alert('Cuéntanos cómo respondió Dios', 'Escribe brevemente cómo se respondió esta oración');
      return;
    }

    setGuardandoRespuesta(true);
    const { error } = await supabase
      .from('oraciones')
      .update({
        estado: 'respondida',
        respuesta: textoRespuesta.trim(),
        respondida_en: new Date().toISOString(),
      })
      .eq('id', oracionAResponder.id);
    setGuardandoRespuesta(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setModalResponderVisible(false);
    cargarOraciones();
  }

  function confirmarEliminar(oracionId) {
    Alert.alert('Eliminar petición', '¿Seguro que quieres eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setOraciones((actual) => actual.filter((o) => o.id !== oracionId));
          await supabase.from('oraciones').delete().eq('id', oracionId);
        },
      },
    ]);
  }

  const oracionesFiltradas = oraciones.filter((o) => o.estado === vista);

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Diario de oración</Text>
        <TouchableOpacity style={styles.botonCrear} onPress={() => setModalNuevaVisible(true)}>
          <Text style={styles.textoBotonCrear}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filaPestanas}>
        <TouchableOpacity
          style={[styles.pestana, vista === 'activa' && styles.pestanaActiva]}
          onPress={() => setVista('activa')}
        >
          <Text style={[styles.textoPestana, vista === 'activa' && styles.textoPestanaActiva]}>
            En oración ({oraciones.filter((o) => o.estado === 'activa').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pestana, vista === 'respondida' && styles.pestanaActiva]}
          onPress={() => setVista('respondida')}
        >
          <Text style={[styles.textoPestana, vista === 'respondida' && styles.textoPestanaActiva]}>
            Respondidas ({oraciones.filter((o) => o.estado === 'respondida').length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={oracionesFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name={vista === 'activa' ? 'hand-left-outline' : 'checkmark-done-circle-outline'} size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>
              {vista === 'activa'
                ? 'No tienes peticiones activas. ¡Agrega la primera!'
                : 'Aún no tienes oraciones marcadas como respondidas'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.tituloOracion}>{item.titulo}</Text>
            {item.detalle && <Text style={styles.detalleOracion}>{item.detalle}</Text>}

            {item.estado === 'respondida' && item.respuesta && (
              <View style={styles.cajaRespuesta}>
                <Text style={styles.etiquetaRespuesta}>Cómo Dios respondió:</Text>
                <Text style={styles.textoRespuesta}>{item.respuesta}</Text>
              </View>
            )}

            <Text style={styles.fecha}>
              {item.estado === 'activa'
                ? `Orando desde ${new Date(item.creado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                : `Respondida el ${new Date(item.respondida_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </Text>

            <View style={styles.filaBotones}>
              {item.estado === 'activa' && (
                <TouchableOpacity style={styles.botonPrimario} onPress={() => abrirModalResponder(item)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colores.primarioTexto} />
                  <Text style={styles.textoBotonPrimario}>Marcar como respondida</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmarEliminar(item.id)}>
                <Ionicons name="trash-outline" size={16} color={colores.peligro} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal: nueva petición */}
      <Modal visible={modalNuevaVisible} transparent animationType="fade" onRequestClose={() => setModalNuevaVisible(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>Nueva petición de oración</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej. Sanidad para mi mamá"
              placeholderTextColor={colores.textoTenue}
              value={tituloNueva}
              onChangeText={setTituloNueva}
            />
            <TextInput
              style={[styles.inputModal, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Detalles (opcional)"
              placeholderTextColor={colores.textoTenue}
              value={detalleNueva}
              onChangeText={setDetalleNueva}
              multiline
            />
            <View style={styles.filaBotonesModal}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalNuevaVisible(false)}>
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarModal} onPress={guardarNuevaOracion} disabled={guardandoNueva}>
                {guardandoNueva ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.textoBotonEnviarModal}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: marcar como respondida */}
      <Modal visible={modalResponderVisible} transparent animationType="fade" onRequestClose={() => setModalResponderVisible(false)}>
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>¡Dios respondió! 🙌</Text>
            <Text style={styles.subtituloModal}>{oracionAResponder?.titulo}</Text>
            <TextInput
              style={[styles.inputModal, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Cuéntanos cómo se respondió esta oración..."
              placeholderTextColor={colores.textoTenue}
              value={textoRespuesta}
              onChangeText={setTextoRespuesta}
              multiline
              autoFocus
            />
            <View style={styles.filaBotonesModal}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalResponderVisible(false)}>
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarModal} onPress={marcarComoRespondida} disabled={guardandoRespuesta}>
                {guardandoRespuesta ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.textoBotonEnviarModal}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    encabezado: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    titulo: { fontSize: 22, fontWeight: '600', color: colores.texto },
    botonCrear: { backgroundColor: colores.primario, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
    textoBotonCrear: { color: colores.primarioTexto, fontWeight: '600' },
    filaPestanas: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
    pestana: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colores.superficie, alignItems: 'center' },
    pestanaActiva: { backgroundColor: colores.primario },
    textoPestana: { color: colores.textoSecundario, fontWeight: '600', fontSize: 12 },
    textoPestanaActiva: { color: colores.primarioTexto },
    vacioContenedor: { alignItems: 'center', marginTop: 60 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14, paddingHorizontal: 30 },
    tarjeta: { backgroundColor: colores.superficie, borderRadius: 12, padding: 14, marginBottom: 10 },
    tituloOracion: { fontSize: 15, fontWeight: '600', color: colores.texto },
    detalleOracion: { fontSize: 13, color: colores.textoSecundario, marginTop: 4, lineHeight: 18 },
    cajaRespuesta: { backgroundColor: colores.superficieAlterna, borderRadius: 8, padding: 10, marginTop: 10 },
    etiquetaRespuesta: { fontSize: 11, color: colores.primario, fontWeight: '700', marginBottom: 4 },
    textoRespuesta: { fontSize: 13, color: colores.texto, lineHeight: 18 },
    fecha: { fontSize: 11, color: colores.textoTenue, marginTop: 10 },
    filaBotones: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
    botonPrimario: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colores.primario,
      borderRadius: 8,
      paddingVertical: 10,
    },
    textoBotonPrimario: { color: colores.primarioTexto, fontWeight: '600', fontSize: 12 },
    botonEliminar: { padding: 10 },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    cajaModal: { backgroundColor: colores.superficie, borderRadius: 14, padding: 20 },
    tituloModal: { fontSize: 17, fontWeight: '700', color: colores.texto, marginBottom: 6 },
    subtituloModal: { fontSize: 13, color: colores.textoSecundario, marginBottom: 14 },
    inputModal: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colores.texto,
      backgroundColor: colores.fondo,
      marginBottom: 12,
    },
    filaBotonesModal: { flexDirection: 'row', gap: 10 },
    botonCancelarModal: { flex: 1, borderWidth: 1, borderColor: colores.borde, borderRadius: 8, padding: 12, alignItems: 'center' },
    textoBotonCancelarModal: { color: colores.texto, fontWeight: '600' },
    botonEnviarModal: { flex: 1, backgroundColor: colores.primario, borderRadius: 8, padding: 12, alignItems: 'center' },
    textoBotonEnviarModal: { color: colores.primarioTexto, fontWeight: '700' },
  });
}