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
 
const ETIQUETAS_ESTADO = {
  borrador: { texto: 'Borrador', icono: 'document-outline' },
  pendiente: { texto: 'En revisión', icono: 'time-outline' },
  publicado: { texto: 'Publicado', icono: 'checkmark-circle' },
  rechazado: { texto: 'Necesita ajustes', icono: 'alert-circle' },
};
 
export default function MisEstudiosScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);
 
  const [estudios, setEstudios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
 
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [estudioAEliminar, setEstudioAEliminar] = useState(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
 
  async function cargarMisEstudios() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      setRefrescando(false);
      return;
    }
 
    const { data, error } = await supabase
      .from('estudios')
      .select('id, titulo, tema, num_dias, estado, motivo_rechazo, solicitud_eliminacion, creado_en')
      .eq('autor_id', user.id)
      .order('creado_en', { ascending: false });
 
    if (!error) setEstudios(data);
    setCargando(false);
    setRefrescando(false);
  }
 
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarMisEstudios);
    return unsubscribe;
  }, [navigation]);
 
  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarMisEstudios();
  }, []);
 
  function tocarEstudio(item) {
    if (item.estado === 'rechazado' || item.estado === 'borrador') {
      navigation.navigate('CrearEstudio', { estudioId: item.id });
    } else {
      navigation.navigate('EstudioDetalle', { estudioId: item.id });
    }
  }
 
  function confirmarEliminarDirecto(item) {
    Alert.alert(
      'Eliminar estudio',
      `¿Seguro que quieres eliminar "${item.titulo}"? Esto no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarDirecto(item.id) },
      ]
    );
  }
 
  async function eliminarDirecto(estudioId) {
    setEstudios((actual) => actual.filter((e) => e.id !== estudioId));
    const { error } = await supabase.from('estudios').delete().eq('id', estudioId);
    if (error) {
      Alert.alert('Error', error.message);
      cargarMisEstudios();
    }
  }
 
  function abrirModalSolicitud(item) {
    setEstudioAEliminar(item);
    setMotivoEliminacion('');
    setModalEliminarVisible(true);
  }
 
  async function enviarSolicitudEliminacion() {
    if (!motivoEliminacion.trim()) {
      Alert.alert('Falta el motivo', 'Escribe brevemente por qué quieres eliminar este estudio publicado');
      return;
    }
 
    const estudioId = estudioAEliminar.id;
    setModalEliminarVisible(false);
 
    const { error } = await supabase
      .from('estudios')
      .update({ solicitud_eliminacion: true, motivo_eliminacion: motivoEliminacion.trim() })
      .eq('id', estudioId);
 
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
 
    Alert.alert('Solicitud enviada', 'Un administrador revisará tu solicitud de eliminación.');
    cargarMisEstudios();
  }
 
  function tocarBotonEliminar(item) {
    if (item.estado === 'publicado') {
      abrirModalSolicitud(item);
    } else {
      confirmarEliminarDirecto(item);
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
    <View style={styles.contenedor}>
      <FlatList
        data={estudios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name="book-outline" size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>Aún no has creado ningún estudio</Text>
          </View>
        }
        renderItem={({ item }) => {
          const etiqueta = ETIQUETAS_ESTADO[item.estado] || ETIQUETAS_ESTADO.borrador;
          const colorEstado = item.estado === 'publicado'
            ? colores.primario
            : item.estado === 'rechazado'
            ? colores.peligro
            : colores.textoTenue;
 
          return (
            <View style={styles.tarjeta}>
              <TouchableOpacity onPress={() => tocarEstudio(item)}>
                <View style={styles.encabezadoTarjeta}>
                  <Text style={styles.titulo}>{item.titulo}</Text>
                  <View style={[styles.chipEstado, { backgroundColor: colorEstado + '22' }]}>
                    <Ionicons name={etiqueta.icono} size={12} color={colorEstado} />
                    <Text style={[styles.textoChipEstado, { color: colorEstado }]}>{etiqueta.texto}</Text>
                  </View>
                </View>
 
                <Text style={styles.meta}>
                  {item.num_dias} días{item.tema ? ` · ${item.tema}` : ''}
                </Text>
 
                {item.estado === 'rechazado' && item.motivo_rechazo && (
                  <View style={styles.cajaMotivo}>
                    <Text style={styles.textoMotivo}>{item.motivo_rechazo}</Text>
                    <Text style={styles.avisoEditar}>Toca para corregir y volver a enviar</Text>
                  </View>
                )}
 
                {item.solicitud_eliminacion && (
                  <View style={styles.cajaSolicitud}>
                    <Ionicons name="hourglass-outline" size={14} color={colores.peligro} />
                    <Text style={styles.textoSolicitud}>Solicitud de eliminación en revisión</Text>
                  </View>
                )}
              </TouchableOpacity>
 
              {!item.solicitud_eliminacion && (
                <TouchableOpacity style={styles.botonEliminar} onPress={() => tocarBotonEliminar(item)}>
                  <Ionicons name="trash-outline" size={15} color={colores.peligro} />
                  <Text style={styles.textoBotonEliminar}>
                    {item.estado === 'publicado' ? 'Solicitar eliminación' : 'Eliminar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
 
      <Modal
        visible={modalEliminarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEliminarVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>¿Por qué quieres eliminar este estudio?</Text>
            <Text style={styles.subtituloModal}>
              Como ya está publicado, un administrador debe revisar y aprobar la eliminación.
            </Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej. Encontré un error grave, ya no aplica, lo quiero rehacer..."
              placeholderTextColor={colores.textoTenue}
              value={motivoEliminacion}
              onChangeText={setMotivoEliminacion}
              multiline
              autoFocus
            />
            <View style={styles.filaBotonesModal}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalEliminarVisible(false)}
              >
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarModal} onPress={enviarSolicitudEliminacion}>
                <Text style={styles.textoBotonEnviarModal}>Enviar solicitud</Text>
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
    vacioContenedor: { alignItems: 'center', marginTop: 60 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14 },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    encabezadoTarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    titulo: { fontSize: 16, fontWeight: '600', color: colores.texto, flex: 1 },
    meta: { fontSize: 13, color: colores.textoSecundario, marginTop: 4 },
    chipEstado: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    textoChipEstado: { fontSize: 11, fontWeight: '600' },
    cajaMotivo: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 8,
      padding: 10,
      marginTop: 10,
    },
    textoMotivo: { fontSize: 13, color: colores.texto, fontStyle: 'italic', lineHeight: 18 },
    avisoEditar: { fontSize: 11, color: colores.primario, marginTop: 6, fontWeight: '600' },
    cajaSolicitud: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
    },
    textoSolicitud: { fontSize: 12, color: colores.peligro, fontStyle: 'italic' },
    botonEliminar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 0.5,
      borderTopColor: colores.borde,
    },
    textoBotonEliminar: { color: colores.peligro, fontSize: 12, fontWeight: '600' },
    fondoModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    cajaModal: {
      backgroundColor: colores.superficie,
      borderRadius: 14,
      padding: 20,
    },
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
    botonCancelarModal: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonCancelarModal: { color: colores.texto, fontWeight: '600' },
    botonEnviarModal: {
      flex: 1,
      backgroundColor: colores.peligro,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonEnviarModal: { color: '#fff', fontWeight: '600' },
  });
}