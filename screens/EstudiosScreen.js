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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import {
  ESTUDIOS_SEMILLA,
  DURACIONES_ESTUDIO,
  esUUID,
  obtenerSuscripcionesLocales,
} from '../lib/estudiosService';

export default function EstudiosScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [estudios, setEstudios] = useState(ESTUDIOS_SEMILLA); // Inicio instantáneo sin pantalla blanca
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [suscripcionesMap, setSuscripcionesMap] = useState({}); // estudioId -> { dia_actual, completado }
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('todos'); // 'todos', 'suscritos', 'semanales', 'mensuales', 'favoritos'
  const [cargando, setCargando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);

  const FILTROS = [
    { id: 'todos', etiqueta: 'Todos' },
    { id: 'libros', etiqueta: '📖 Libros Bíblicos' },
    { id: 'discipulos', etiqueta: '🕊️ Discípulos y Vidas' },
    { id: 'paz', etiqueta: '🌿 Paz y Calma' },
    { id: 'suscritos', etiqueta: 'Mis suscripciones' },
    { id: 'favoritos', etiqueta: 'Favoritos' },
  ];

  async function cargarEstudios() {
    try {
      // 1. Cargar datos de Supabase y usuario en paralelo
      const [estudiosRes, userRes] = await Promise.all([
        supabase
          .from('estudios')
          .select('id, titulo, descripcion, tema, num_dias, portada_url, autor_id, perfiles!autor_id(nombre_usuario)')
          .eq('estado', 'publicado')
          .order('creado_en', { ascending: false }),
        supabase.auth.getUser(),
      ]);

      const dbEstudios = estudiosRes.data || [];

      // Complementar con estudios semilla para garantizar siempre catálogo completo
      const combinados = [...dbEstudios];
      for (const semilla of ESTUDIOS_SEMILLA) {
        if (!combinados.some((e) => e.id === semilla.id || e.titulo === semilla.titulo)) {
          combinados.push(semilla);
        }
      }
      setEstudios(combinados);

      // 2. Cargar favoritos y suscripciones si el usuario está autenticado
      const user = userRes?.data?.user;
      if (user) {
        const [favRes, progRes, progLocales, favLocalesRaw] = await Promise.all([
          supabase.from('favoritos').select('estudio_id').eq('usuario_id', user.id),
          supabase.from('progreso_usuario').select('estudio_id, dia_actual, completado').eq('usuario_id', user.id),
          obtenerSuscripcionesLocales(user.id),
          AsyncStorage.getItem(`fav_estudios_${user.id}`),
        ]);

        const conjuntoFav = new Set();
        if (favRes?.data) {
          favRes.data.forEach((f) => conjuntoFav.add(f.estudio_id));
        }
        if (favLocalesRaw) {
          try {
            JSON.parse(favLocalesRaw).forEach((id) => conjuntoFav.add(id));
          } catch (_) {}
        }
        setFavoritosIds(conjuntoFav);

        const mapa = {};
        if (progRes?.data) {
          progRes.data.forEach((p) => {
            mapa[p.estudio_id] = { dia_actual: p.dia_actual, completado: p.completado };
          });
        }
        (progLocales || []).forEach((p) => {
          mapa[p.estudio_id] = { dia_actual: p.dia_actual, completado: p.completado };
        });
        setSuscripcionesMap(mapa);
      }
    } catch (e) {
      console.log('Carga silenciosa de estudios completada con catálogo local:', e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  useEffect(() => {
    cargarEstudios();
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
      if (esUUID(estudioId)) {
        await supabase.from('favoritos').delete().eq('usuario_id', user.id).eq('estudio_id', estudioId);
      }
      await AsyncStorage.setItem(`fav_estudios_${user.id}`, JSON.stringify([...copia]));
    } else {
      copia.add(estudioId);
      setFavoritosIds(copia);
      if (esUUID(estudioId)) {
        await supabase.from('favoritos').insert({ usuario_id: user.id, estudio_id: estudioId });
      }
      await AsyncStorage.setItem(`fav_estudios_${user.id}`, JSON.stringify([...copia]));
    }
  }

  const estudiosFiltrados = estudios.filter((item) => {
    // Filtros de categoría / estado
    if (filtroActivo === 'favoritos' && !favoritosIds.has(item.id)) return false;
    if (filtroActivo === 'suscritos' && !suscripcionesMap[item.id]) return false;

    if (filtroActivo === 'libros') {
      const texto = `${item.tema || ''} ${item.titulo || ''}`.toLowerCase();
      const esLibro =
        texto.includes('libro') ||
        texto.includes('mateo') ||
        texto.includes('filipenses') ||
        texto.includes('proverbios') ||
        texto.includes('santiago') ||
        texto.includes('sermón') ||
        texto.includes('sermon') ||
        texto.includes('efesios') ||
        texto.includes('romanos');
      if (!esLibro) return false;
    }

    if (filtroActivo === 'discipulos') {
      const texto = `${item.tema || ''} ${item.titulo || ''} ${item.descripcion || ''}`.toLowerCase();
      const esDiscipulo =
        texto.includes('discípulo') ||
        texto.includes('discipulo') ||
        texto.includes('pedro') ||
        texto.includes('david') ||
        texto.includes('pablo') ||
        texto.includes('personaje');
      if (!esDiscipulo) return false;
    }

    if (filtroActivo === 'paz') {
      const texto = `${item.tema || ''} ${item.titulo || ''} ${item.descripcion || ''}`.toLowerCase();
      const esPaz =
        texto.includes('paz') ||
        texto.includes('ansiedad') ||
        texto.includes('calma') ||
        texto.includes('afán') ||
        texto.includes('afan') ||
        texto.includes('descanso');
      if (!esPaz) return false;
    }

    // Filtro de búsqueda por texto
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase();
      const coincideTitulo = item.titulo?.toLowerCase().includes(texto);
      const coincideTema = item.tema?.toLowerCase().includes(texto);
      const coincideDesc = item.descripcion?.toLowerCase().includes(texto);
      if (!coincideTitulo && !coincideTema && !coincideDesc) return false;
    }
    return true;
  });

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.titulo}>Estudios bíblicos</Text>
          <Text style={styles.subtitulo}>Planes semanales, quincenales y mensuales</Text>
        </View>
        <TouchableOpacity
          style={styles.botonCrear}
          onPress={() => navigation.navigate('CrearEstudio')}
        >
          <Ionicons name="add" size={16} color={colores.primarioTexto} style={{ marginRight: 4 }} />
          <Text style={styles.textoBotonCrear}>Crear</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.cajaBusqueda}>
        <Ionicons name="search" size={18} color={colores.textoTenue} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por libro, pasaje o tema..."
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

      {/* Chips de Filtros */}
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTROS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filaFiltros}
          renderItem={({ item }) => {
            const activo = filtroActivo === item.id;
            return (
              <TouchableOpacity
                style={[styles.chipFiltro, activo && styles.chipFiltroActivo]}
                onPress={() => setFiltroActivo(item.id)}
              >
                {item.id === 'favoritos' && (
                  <Ionicons
                    name="heart"
                    size={12}
                    color={activo ? colores.primarioTexto : colores.textoSecundario}
                    style={{ marginRight: 4 }}
                  />
                )}
                {item.id === 'suscritos' && (
                  <Ionicons
                    name="bookmark"
                    size={12}
                    color={activo ? colores.primarioTexto : colores.textoSecundario}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>
                  {item.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Lista de Estudios */}
      <FlatList
        data={estudiosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 4 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name="book-outline" size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>
              {filtroActivo === 'suscritos'
                ? 'Aún no te has suscrito a ningún plan de estudio. ¡Elige uno y comienza hoy!'
                : filtroActivo === 'favoritos'
                ? 'Aún no has guardado ningún estudio como favorito.'
                : busqueda
                ? 'No se encontraron estudios con esa búsqueda.'
                : 'Aún no hay estudios publicados en esta categoría.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const suscripcion = suscripcionesMap[item.id];
          const duracionInfo = DURACIONES_ESTUDIO.find((d) => d.id === item.num_dias);

          return (
            <TouchableOpacity
              style={styles.tarjeta}
              onPress={() => navigation.navigate('EstudioDetalle', { estudioId: item.id })}
              activeOpacity={0.85}
            >
              {item.portada_url ? (
                <Image source={{ uri: item.portada_url }} style={styles.portadaMini} />
              ) : null}

              <View style={{ flex: 1, padding: 14 }}>
                <View style={styles.filaBadges}>
                  {duracionInfo ? (
                    <View style={[styles.badgeMini, { backgroundColor: duracionInfo.color + '20' }]}>
                      <Text style={[styles.textoBadgeMini, { color: duracionInfo.color }]}>
                        {duracionInfo.badge}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.badgeMini, { backgroundColor: colores.primario + '20' }]}>
                      <Text style={[styles.textoBadgeMini, { color: colores.primario }]}>
                        {item.num_dias} DÍAS
                      </Text>
                    </View>
                  )}

                  {suscripcion ? (
                    <View style={styles.badgeSuscrito}>
                      <Ionicons name="checkmark-circle" size={11} color="#059669" style={{ marginRight: 3 }} />
                      <Text style={styles.textBadgeSuscrito}>
                        {suscripcion.completado ? 'Completado' : `Día ${suscripcion.dia_actual}/${item.num_dias}`}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.tituloTarjeta}>{item.titulo}</Text>

                <Text style={styles.metaTarjeta}>
                  por {item.perfiles?.nombre_usuario || 'Comunidad'}
                  {item.tema ? ` · ${item.tema}` : ''}
                </Text>

                {item.descripcion ? (
                  <Text style={styles.descTarjeta} numberOfLines={2}>
                    {item.descripcion}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => alternarFavorito(item.id)}
                style={styles.botonCorazon}
              >
                <Ionicons
                  name={favoritosIds.has(item.id) ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favoritosIds.has(item.id) ? colores.peligro : colores.textoTenue}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo, paddingHorizontal: 16, paddingTop: 8 },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    encabezado: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    titulo: { fontSize: 24, fontWeight: '700', color: colores.texto },
    subtitulo: { fontSize: 12, color: colores.textoSecundario, marginTop: 2 },
    botonCrear: {
      backgroundColor: colores.primario,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textoBotonCrear: { color: colores.primarioTexto, fontWeight: '700', fontSize: 13 },
    cajaBusqueda: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 42,
      marginBottom: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    inputBusqueda: { flex: 1, fontSize: 14, color: colores.texto },
    filaFiltros: { gap: 8, paddingBottom: 10 },
    chipFiltro: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 18,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    chipFiltroActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
    textoChip: { fontSize: 12, color: colores.textoSecundario, fontWeight: '600' },
    textoChipActivo: { color: colores.primarioTexto, fontWeight: '700' },

    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
    },
    portadaMini: {
      width: 85,
      height: '100%',
      backgroundColor: colores.superficieAlterna,
    },
    filaBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    badgeMini: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    textoBadgeMini: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    badgeSuscrito: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B98120',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    textBadgeSuscrito: {
      fontSize: 10,
      fontWeight: '700',
      color: '#059669',
    },
    tituloTarjeta: { fontSize: 15, fontWeight: '700', marginBottom: 2, color: colores.texto },
    metaTarjeta: { fontSize: 12, color: colores.textoSecundario, marginBottom: 4 },
    descTarjeta: { fontSize: 12, color: colores.textoTenue, lineHeight: 16 },
    botonCorazon: { padding: 14, alignSelf: 'flex-start' },
    vacioContenedor: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 12,
    },
    vacio: { textAlign: 'center', color: colores.textoTenue, fontSize: 13, paddingHorizontal: 20 },
  });
}