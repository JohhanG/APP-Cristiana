import React, { useCallback, useEffect, useState } from 'react';
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

const CATEGORIAS = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'general', etiqueta: 'General' },
  { valor: 'predica', etiqueta: 'Prédica' },
  { valor: 'estudio', etiqueta: 'Estudio' },
  { valor: 'oracion', etiqueta: 'Oración' },
];

const ICONOS_CATEGORIA = {
  general: 'document-text-outline',
  predica: 'megaphone-outline',
  estudio: 'book-outline',
  oracion: 'hand-left-outline',
};

export default function NotasScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [notas, setNotas] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  async function cargarNotas() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      setRefrescando(false);
      return;
    }

    const { data, error } = await supabase
      .from('notas_personales')
      .select('*')
      .eq('usuario_id', user.id)
      .order('actualizado_en', { ascending: false });

    if (!error) setNotas(data);
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarNotas);
    cargarNotas();
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarNotas();
  }, []);

  const notasFiltradas = notas.filter((n) => categoriaActiva === 'todas' || n.categoria === categoriaActiva);

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
        <Text style={styles.titulo}>Mis apuntes</Text>
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={() => navigation.navigate('NotaDetalle', { notaId: null, referenciaBiblica: null })}
        >
          <Text style={styles.textoBotonCrear}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filaCategorias}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat.valor}
            style={[styles.chipCategoria, categoriaActiva === cat.valor && styles.chipCategoriaActivo]}
            onPress={() => setCategoriaActiva(cat.valor)}
          >
            <Text
              style={[styles.textoChipCategoria, categoriaActiva === cat.valor && styles.textoChipCategoriaActivo]}
            >
              {cat.etiqueta}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={notasFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name="document-text-outline" size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>
              {categoriaActiva === 'todas' ? 'Aún no tienes apuntes. ¡Crea el primero!' : 'No hay apuntes en esta categoría'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tarjeta}
            onPress={() => navigation.navigate('NotaDetalle', { notaId: item.id, referenciaBiblica: item.referencia_biblica })}
          >
            <View style={styles.filaTarjeta}>
              <View style={styles.iconoCategoria}>
                <Ionicons name={ICONOS_CATEGORIA[item.categoria] || 'document-text-outline'} size={16} color={colores.primario} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tituloNota} numberOfLines={1}>{item.titulo}</Text>
                {item.referencia_biblica && (
                  <Text style={styles.referenciaNota}>{item.referencia_biblica}</Text>
                )}
              </View>
            </View>
            <Text style={styles.contenidoNota} numberOfLines={2}>{item.contenido}</Text>
            <Text style={styles.fechaNota}>
              {new Date(item.actualizado_en).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
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
    encabezado: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    titulo: { fontSize: 22, fontWeight: '600', color: colores.texto },
    botonCrear: {
      backgroundColor: colores.primario,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    textoBotonCrear: { color: colores.primarioTexto, fontWeight: '600' },
    filaCategorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
    chipCategoria: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colores.superficie,
    },
    chipCategoriaActivo: { backgroundColor: colores.primario },
    textoChipCategoria: { fontSize: 13, color: colores.textoSecundario, fontWeight: '600' },
    textoChipCategoriaActivo: { color: colores.primarioTexto },
    vacioContenedor: { alignItems: 'center', marginTop: 60 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14, paddingHorizontal: 30 },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    filaTarjeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    iconoCategoria: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tituloNota: { fontSize: 15, fontWeight: '600', color: colores.texto },
    referenciaNota: { fontSize: 12, color: colores.primario, marginTop: 2, fontWeight: '600' },
    contenidoNota: { fontSize: 13, color: colores.textoSecundario, lineHeight: 18, marginBottom: 8 },
    fechaNota: { fontSize: 11, color: colores.textoTenue },
  });
}