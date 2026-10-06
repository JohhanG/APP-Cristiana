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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
 
export default function FavoritosScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);
 
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
 
  async function cargarFavoritos() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      setRefrescando(false);
      return;
    }
 
    const { data, error } = await supabase
      .from('favoritos')
      .select('estudio_id, estudios(id, titulo, tema, num_dias, perfiles!autor_id(nombre_usuario))')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false });
 
    if (!error && data) {
      setFavoritos(data.filter((fila) => fila.estudios).map((fila) => fila.estudios));
    }
    setCargando(false);
    setRefrescando(false);
  }
 
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarFavoritos);
    return unsubscribe;
  }, [navigation]);
 
  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarFavoritos();
  }, []);
 
  async function quitarFavorito(estudioId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
 
    setFavoritos((actual) => actual.filter((e) => e.id !== estudioId));
    await supabase.from('favoritos').delete().eq('usuario_id', user.id).eq('estudio_id', estudioId);
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
        data={favoritos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name="heart-outline" size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>Aún no has guardado ningún estudio como favorito</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => navigation.navigate('EstudioDetalle', { estudioId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.meta}>
                por {item.perfiles?.nombre_usuario || 'anónimo'} · {item.num_dias} días
                {item.tema ? ` · ${item.tema}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => quitarFavorito(item.id)} style={styles.botonCorazon}>
              <Ionicons name="heart" size={22} color={colores.peligro} />
            </TouchableOpacity>
          </TouchableOpacity>
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
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14, paddingHorizontal: 30 },
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    titulo: { fontSize: 16, fontWeight: '600', color: colores.texto, marginBottom: 4 },
    meta: { fontSize: 13, color: colores.textoSecundario },
    botonCorazon: { padding: 6, marginLeft: 8 },
  });
}