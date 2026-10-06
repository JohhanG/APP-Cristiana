import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

const ROLES = [
  { valor: 'lector', etiqueta: 'Lector', color: '#6b7280' },
  { valor: 'revisor', etiqueta: 'Revisor', color: '#E0855A' },
  { valor: 'admin', etiqueta: 'Admin', color: '#3C3489' },
];

export default function UsuariosScreen() {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [miId, setMiId] = useState(null);
  const [modalRolVisible, setModalRolVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  async function cargarUsuarios() {
    const { data: { user } } = await supabase.auth.getUser();
    setMiId(user?.id || null);

    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, rol, creado_en, foto_url')
      .order('creado_en', { ascending: false });

    if (!error) setUsuarios(data);
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarUsuarios();
  }, []);

  function abrirSelectorRol(usuario) {
    if (usuario.id === miId) {
      Alert.alert('No puedes hacer esto', 'No puedes cambiar tu propio rol.');
      return;
    }
    setUsuarioSeleccionado(usuario);
    setModalRolVisible(true);
  }

  async function cambiarRol(nuevoRol) {
    const usuarioId = usuarioSeleccionado.id;
    setModalRolVisible(false);
    setProcesandoId(usuarioId);

    const { error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId);

    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    setUsuarios((actual) =>
      actual.map((u) => (u.id === usuarioId ? { ...u, rol: nuevoRol } : u))
    );
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
        data={usuarios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        renderItem={({ item }) => {
          const rolInfo = ROLES.find((r) => r.valor === item.rol) || ROLES[0];
          return (
            <View style={styles.tarjeta}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>
                  {(item.nombre_usuario || '?').charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>
                  {item.nombre_usuario} {item.id === miId ? '(tú)' : ''}
                </Text>
                <View style={[styles.insignia, { backgroundColor: rolInfo.color }]}>
                  <Text style={styles.textoInsignia}>{rolInfo.etiqueta}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.botonCambiarRol}
                onPress={() => abrirSelectorRol(item)}
                disabled={procesandoId === item.id || item.id === miId}
              >
                {procesandoId === item.id ? (
                  <ActivityIndicator size="small" color={colores.primario} />
                ) : (
                  <Text style={styles.textoBotonCambiarRol}>Cambiar rol</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal
        visible={modalRolVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalRolVisible(false)}
      >
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalRolVisible(false)}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>
              Rol para {usuarioSeleccionado?.nombre_usuario}
            </Text>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.valor}
                style={styles.opcionRol}
                onPress={() => cambiarRol(r.valor)}
              >
                <View style={[styles.puntoRol, { backgroundColor: r.color }]} />
                <Text style={styles.textoOpcionRol}>{r.etiqueta}</Text>
                {usuarioSeleccionado?.rol === r.valor && (
                  <Ionicons name="checkmark" size={18} color={colores.primario} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarTexto: { fontSize: 16, fontWeight: '600', color: colores.primario },
    nombre: { fontSize: 15, fontWeight: '600', color: colores.texto, marginBottom: 4 },
    insignia: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    textoInsignia: { fontSize: 11, color: '#fff', fontWeight: '600' },
    botonCambiarRol: {
      borderWidth: 1,
      borderColor: colores.primario,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    textoBotonCambiarRol: { color: colores.primario, fontSize: 12, fontWeight: '600' },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
    cajaModal: { backgroundColor: colores.superficie, borderRadius: 14, padding: 20 },
    tituloModal: { fontSize: 16, fontWeight: '700', color: colores.texto, marginBottom: 16, textAlign: 'center' },
    opcionRol: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colores.borde,
    },
    puntoRol: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    textoOpcionRol: { fontSize: 15, color: colores.texto },
  });
}