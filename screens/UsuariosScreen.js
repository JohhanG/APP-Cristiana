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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

export default function UsuariosScreen() {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [miId, setMiId] = useState(null);

  async function cargarUsuarios() {
    const { data: { user } } = await supabase.auth.getUser();
    setMiId(user?.id || null);

    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre_usuario, rol, creado_en')
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

  function confirmarCambioRol(usuario) {
    const haciendoAdmin = usuario.rol !== 'admin';

    if (usuario.id === miId && !haciendoAdmin) {
      Alert.alert('No puedes hacer esto', 'No puedes quitarte el rol de admin a ti mismo.');
      return;
    }

    Alert.alert(
      haciendoAdmin ? 'Hacer administrador' : 'Quitar rol de administrador',
      haciendoAdmin
        ? `${usuario.nombre_usuario} podrá aprobar/rechazar estudios y gestionar usuarios.`
        : `${usuario.nombre_usuario} dejará de tener permisos de administrador.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => cambiarRol(usuario.id, haciendoAdmin ? 'admin' : 'lector') },
      ]
    );
  }

  async function cambiarRol(usuarioId, nuevoRol) {
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
        renderItem={({ item }) => (
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
              {item.rol === 'admin' && (
                <View style={styles.insignia}>
                  <Ionicons name="shield-checkmark" size={12} color={colores.primario} />
                  <Text style={styles.textoInsignia}>Admin</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.botonRol, item.rol === 'admin' && styles.botonQuitarRol]}
              onPress={() => confirmarCambioRol(item)}
              disabled={procesandoId === item.id}
            >
              {procesandoId === item.id ? (
                <ActivityIndicator size="small" color={item.rol === 'admin' ? colores.peligro : colores.primarioTexto} />
              ) : (
                <Text style={[styles.textoBotonRol, item.rol === 'admin' && styles.textoBotonQuitarRol]}>
                  {item.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      />
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
    nombre: { fontSize: 15, fontWeight: '600', color: colores.texto },
    insignia: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    textoInsignia: { fontSize: 11, color: colores.primario, marginLeft: 4, fontWeight: '600' },
    botonRol: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    botonQuitarRol: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colores.peligro,
    },
    textoBotonRol: { color: colores.primarioTexto, fontSize: 12, fontWeight: '600' },
    textoBotonQuitarRol: { color: colores.peligro },
  });
}
