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

export default function AdminScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  async function cargarPendientes() {
    const { data, error } = await supabase
      .from('estudios')
      .select('id, titulo, tema, num_dias, creado_en, perfiles!autor_id(nombre_usuario)')
      .eq('estado', 'pendiente')
      .order('creado_en', { ascending: true });

    if (error) {
      Alert.alert('Error al cargar pendientes', error.message);
    } else {
      setPendientes(data);
    }
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarPendientes);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarPendientes();
  }, []);

  async function actualizarEstado(estudioId, nuevoEstado) {
    setProcesandoId(estudioId);
    const { error } = await supabase
      .from('estudios')
      .update({ estado: nuevoEstado })
      .eq('id', estudioId);
    setProcesandoId(null);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setPendientes((actual) => actual.filter((e) => e.id !== estudioId));
  }

  function confirmarRechazo(estudioId) {
    Alert.alert('Rechazar estudio', '¿Seguro que quieres rechazar este estudio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Rechazar', style: 'destructive', onPress: () => actualizarEstado(estudioId, 'rechazado') },
    ]);
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
        data={pendientes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
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
                style={styles.botonRechazar}
                onPress={() => confirmarRechazo(item.id)}
                disabled={procesandoId === item.id}
              >
                <Text style={styles.textoBotonRechazar}>Rechazar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonAprobar}
                onPress={() => actualizarEstado(item.id, 'publicado')}
                disabled={procesandoId === item.id}
              >
                {procesandoId === item.id ? (
                  <ActivityIndicator color={colores.primarioTexto} size="small" />
                ) : (
                  <Text style={styles.textoBotonAprobar}>Aprobar</Text>
                )}
              </TouchableOpacity>
            </View>
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
    vacioContenedor: { alignItems: 'center', marginTop: 60 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14 },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    titulo: { fontSize: 16, fontWeight: '600', color: colores.texto, marginBottom: 4 },
    meta: { fontSize: 13, color: colores.textoSecundario },
    filaBotones: { flexDirection: 'row', gap: 10, marginTop: 12 },
    botonRechazar: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.peligro,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    textoBotonRechazar: { color: colores.peligro, fontWeight: '600', fontSize: 13 },
    botonAprobar: {
      flex: 1,
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    textoBotonAprobar: { color: colores.primarioTexto, fontWeight: '600', fontSize: 13 },
  });
}