import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cargarVersiculosFavoritos, COLORES_RESALTADO } from '../lib/versiculosInteracciones';
import { useTheme } from '../theme/ThemeContext';
import { PIE_DESCARGA } from '../constants/enlacesApp';

export default function VersiculosFavoritosScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [versiculos, setVersiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  async function cargar() {
    const data = await cargarVersiculosFavoritos();
    setVersiculos(data);
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    cargar();
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargar();
  }, []);

  async function compartir(item) {
    try {
      await Share.share({
        message: `"${item.texto}"\n— ${item.referencia} (${item.version})${PIE_DESCARGA}`,
      });
    } catch (e) {
      // el usuario canceló, no pasa nada
    }
  }

  function irAVersiculo(item) {
    navigation.navigate('Pestanas', {
      screen: 'Biblia',
      params: { libroNumero: item.libro, capitulo: item.capitulo, version: item.version },
    });
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
        data={versiculos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name="heart-outline" size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>Aún no tienes versículos guardados</Text>
            <Text style={styles.vacioSub}>Toca cualquier versículo en la Biblia para guardarlo</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.tarjeta,
              item.color_resaltado && { borderLeftWidth: 4, borderLeftColor: COLORES_RESALTADO[item.color_resaltado] },
            ]}
          >
            <TouchableOpacity onPress={() => irAVersiculo(item)}>
              <Text style={styles.referencia}>{item.referencia} · {item.version}</Text>
              <Text style={styles.texto}>{item.texto}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonCompartir} onPress={() => compartir(item)}>
              <Ionicons name="share-social-outline" size={18} color={colores.primario} />
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
    vacioContenedor: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
    vacio: { textAlign: 'center', color: colores.textoSecundario, marginTop: 12, fontSize: 15, fontWeight: '600' },
    vacioSub: { textAlign: 'center', color: colores.textoTenue, marginTop: 6, fontSize: 13 },
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    referencia: { fontSize: 13, fontWeight: '700', color: colores.primario, marginBottom: 4 },
    texto: { fontSize: 15, color: colores.texto, lineHeight: 21, flex: 1 },
    botonCompartir: { padding: 8, marginLeft: 8 },
  });
}
