import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
 
export default function EstudiosScreen({ navigation }) {
  const { colores } = useTheme();
  const [estudios, setEstudios] = useState([]);
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [busqueda, setBusqueda] = useState('');
  const [verSoloFavoritos, setVerSoloFavoritos] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
 
  async function cargarEstudios() {
    const { data, error } = await supabase
      .from('estudios')
      .select('id, titulo, tema, num_dias, autor_id, perfiles!autor_id(nombre_usuario)')
      .eq('estado', 'publicado')
      .order('creado_en', { ascending: false });
 
    if (!error) setEstudios(data);
 
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: favoritos } = await supabase
        .from('favoritos')
        .select('estudio_id')
        .eq('usuario_id', user.id);
      if (favoritos) setFavoritosIds(new Set(favoritos.map((f) => f.estudio_id)));
    }
 
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
 
  async function alternarFavorito(estudioId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
 
    const yaEsFavorito = favoritosIds.has(estudioId);
    const copia = new Set(favoritosIds);
 
    if (yaEsFavorito) {
      copia.delete(estudioId);
      setFavoritosIds(copia);
      await supabase.from('favoritos').delete().eq('usuario_id', user.id).eq('estudio_id', estudioId);
    } else {
      copia.add(estudioId);
      setFavoritosIds(copia);
      await supabase.from('favoritos').insert({ usuario_id: user.id, estudio_id: estudioId });
    }
  }
 
  const estudiosFiltrados = estudios.filter((item) => {
    if (verSoloFavoritos && !favoritosIds.has(item.id)) return false;
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const coincideTitulo = item.titulo?.toLowerCase().includes(texto);
      const coincideTema = item.tema?.toLowerCase().includes(texto);
      if (!coincideTitulo && !coincideTema) return false;
    }
    return true;
  });
 
  const styles = crearEstilos(colores);
 
  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }
 
  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Estudios bíblicos</Text>
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={() => navigation.navigate('CrearEstudio')}
        >
          <Text style={styles.textoBotonCrear}>+ Crear</Text>
        </TouchableOpacity>
      </View>
 
      <View style={styles.cajaBusqueda}>
        <Ionicons name="search" size={18} color={colores.textoTenue} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por título o tema..."
          placeholderTextColor={colores.textoTenue}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color={colores.textoTenue} />
          </TouchableOpacity>
        )}
      </View>
 
      <View style={styles.filaFiltros}>
        <TouchableOpacity
          style={[styles.chipFiltro, !verSoloFavoritos && styles.chipFiltroActivo]}
          onPress={() => setVerSoloFavoritos(false)}
        >
          <Text style={[styles.textoChip, !verSoloFavoritos && styles.textoChipActivo]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chipFiltro, verSoloFavoritos && styles.chipFiltroActivo]}
          onPress={() => setVerSoloFavoritos(true)}
        >
          <Ionicons
            name="heart"
            size={13}
            color={verSoloFavoritos ? colores.primarioTexto : colores.textoSecundario}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.textoChip, verSoloFavoritos && styles.textoChipActivo]}>Favoritos</Text>
        </TouchableOpacity>
      </View>
 
      <FlatList
        data={estudiosFiltrados}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {verSoloFavoritos
              ? 'Aún no has guardado ningún estudio como favorito'
              : busqueda
              ? 'No se encontraron estudios con esa búsqueda'
              : 'Aún no hay estudios publicados. ¡Crea el primero!'}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => navigation.navigate('EstudioDetalle', { estudioId: item.id })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloTarjeta}>{item.titulo}</Text>
              <Text style={styles.metaTarjeta}>
                por {item.perfiles?.nombre_usuario || 'anónimo'} · {item.num_dias} días
                {item.tema ? ` · ${item.tema}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => alternarFavorito(item.id)} style={styles.botonCorazon}>
              <Ionicons
                name={favoritosIds.has(item.id) ? 'heart' : 'heart-outline'}
                size={22}
                color={favoritosIds.has(item.id) ? colores.peligro : colores.textoTenue}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
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
      marginBottom: 14,
    },
    titulo: { fontSize: 22, fontWeight: '600', color: colores.texto },
    botonCrear: {
      backgroundColor: colores.primario,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    textoBotonCrear: { color: colores.primarioTexto, fontWeight: '600' },
    cajaBusqueda: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 42,
      marginBottom: 10,
      gap: 8,
    },
    inputBusqueda: { flex: 1, fontSize: 14, color: colores.texto },
    filaFiltros: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    chipFiltro: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colores.superficie,
    },
    chipFiltroActivo: { backgroundColor: colores.primario },
    textoChip: { fontSize: 13, color: colores.textoSecundario, fontWeight: '600' },
    textoChipActivo: { color: colores.primarioTexto },
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    tituloTarjeta: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: colores.texto },
    metaTarjeta: { fontSize: 13, color: colores.textoSecundario },
    botonCorazon: { padding: 6, marginLeft: 8 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 40, fontSize: 14 },
  });
}