import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

export default function EstudiosScreen({ navigation }) {
  const { colores } = useTheme();
  const [estudios, setEstudios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  async function cargarEstudios() {
    const { data, error } = await supabase
      .from('estudios')
      .select('id, titulo, tema, num_dias, autor_id, perfiles!autor_id(nombre_usuario)')
      .eq('estado', 'publicado')
      .order('creado_en', { ascending: false });

    if (!error) setEstudios(data);
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarEstudios);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarEstudios();
  }, []);

  const styles = crearEstilos(colores);

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
        <Text style={styles.titulo}>Estudios bíblicos</Text>
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={() => navigation.navigate('CrearEstudio')}
        >
          <Text style={styles.textoBotonCrear}>+ Crear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={estudios}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <Text style={styles.vacio}>Aún no hay estudios publicados. ¡Crea el primero!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => navigation.navigate('EstudioDetalle', { estudioId: item.id })}
          >
            <Text style={styles.tituloTarjeta}>{item.titulo}</Text>
            <Text style={styles.metaTarjeta}>
              por {item.perfiles?.nombre_usuario || 'anónimo'} · {item.num_dias} días
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo, paddingHorizontal: 16, paddingTop: 12 },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    encabezado: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    titulo: { fontSize: 22, fontWeight: '600', color: colores.texto },
    botonCrear: {
      backgroundColor: colores.primario,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    textoBotonCrear: { color: colores.primarioTexto, fontWeight: '600' },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    tituloTarjeta: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: colores.texto },
    metaTarjeta: { fontSize: 13, color: colores.textoSecundario },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 40, fontSize: 14 },
  });
}