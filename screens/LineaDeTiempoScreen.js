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

const CONFIG_TIPO = {
  lectura: { icono: 'flame', color: '#F59E0B' },
  estudio_completado: { icono: 'checkmark-done-circle', color: '#8B5CF6' },
  favorito: { icono: 'heart', color: '#EF4444' },
  apunte: { icono: 'create', color: '#3B82F6' },
  estudio_creado: { icono: 'book', color: '#10B981' },
};

function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso);
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LineaDeTiempoScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  async function cargarLineaDeTiempo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      setRefrescando(false);
      return;
    }

    const [lecturas, completados, favoritos, apuntes, estudiosCreados] = await Promise.all([
      supabase.from('lecturas_diarias').select('fecha').eq('usuario_id', user.id).order('fecha', { ascending: false }).limit(60),
      supabase
        .from('progreso_usuario')
        .select('ultima_actividad, estudios(titulo)')
        .eq('usuario_id', user.id)
        .eq('completado', true)
        .order('ultima_actividad', { ascending: false })
        .limit(30),
      supabase
        .from('versiculos_interacciones')
        .select('referencia, actualizado_en')
        .eq('usuario_id', user.id)
        .eq('favorito', true)
        .order('actualizado_en', { ascending: false })
        .limit(30),
      supabase
        .from('notas_personales')
        .select('titulo, creado_en, categoria')
        .eq('usuario_id', user.id)
        .order('creado_en', { ascending: false })
        .limit(30),
      supabase
        .from('estudios')
        .select('titulo, creado_en, estado')
        .eq('autor_id', user.id)
        .eq('estado', 'publicado')
        .order('creado_en', { ascending: false })
        .limit(30),
    ]);

    const listaEventos = [];

    (lecturas.data || []).forEach((l) => {
      listaEventos.push({
        tipo: 'lectura',
        fecha: l.fecha,
        texto: 'Leíste el devocional del día',
      });
    });

    (completados.data || []).forEach((c) => {
      listaEventos.push({
        tipo: 'estudio_completado',
        fecha: c.ultima_actividad,
        texto: `Completaste el estudio "${c.estudios?.titulo || 'un estudio'}"`,
      });
    });

    (favoritos.data || []).forEach((f) => {
      listaEventos.push({
        tipo: 'favorito',
        fecha: f.actualizado_en,
        texto: `Marcaste como favorito ${f.referencia}`,
      });
    });

    (apuntes.data || []).forEach((a) => {
      listaEventos.push({
        tipo: 'apunte',
        fecha: a.creado_en,
        texto: `Escribiste el apunte "${a.titulo}"`,
      });
    });

    (estudiosCreados.data || []).forEach((e) => {
      listaEventos.push({
        tipo: 'estudio_creado',
        fecha: e.creado_en,
        texto: `Publicaste el estudio "${e.titulo}"`,
      });
    });

    listaEventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    setEventos(listaEventos);
    setCargando(false);
    setRefrescando(false);
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargarLineaDeTiempo);
    cargarLineaDeTiempo();
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarLineaDeTiempo();
  }, []);

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
        data={eventos}
        keyExtractor={(item, index) => `${item.tipo}-${item.fecha}-${index}`}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.titulo}>Tu camino con Dios</Text>
            <Text style={styles.subtitulo}>Un vistazo a tu constancia y crecimiento</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Ionicons name="footsteps-outline" size={40} color={colores.textoTenue} />
            <Text style={styles.vacio}>
              Aún no hay nada que mostrar aquí. Empieza leyendo el devocional o guardando un versículo favorito.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const config = CONFIG_TIPO[item.tipo] || CONFIG_TIPO.lectura;
          const esUltimo = index === eventos.length - 1;

          return (
            <View style={styles.filaEvento}>
              <View style={styles.columnaLinea}>
                <View style={[styles.puntoEvento, { backgroundColor: config.color + '22' }]}>
                  <Ionicons name={config.icono} size={16} color={config.color} />
                </View>
                {!esUltimo && <View style={styles.lineaConectora} />}
              </View>
              <View style={styles.contenidoEvento}>
                <Text style={styles.textoEvento}>{item.texto}</Text>
                <Text style={styles.fechaEvento}>{formatearFecha(item.fecha)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    titulo: { fontSize: 22, fontWeight: '700', color: colores.texto },
    subtitulo: { fontSize: 13, color: colores.textoSecundario, marginTop: 2 },
    vacioContenedor: { alignItems: 'center', marginTop: 60 },
    vacio: { textAlign: 'center', color: colores.textoTenue, marginTop: 10, fontSize: 14, paddingHorizontal: 30 },
    filaEvento: { flexDirection: 'row' },
    columnaLinea: { alignItems: 'center', width: 40 },
    puntoEvento: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lineaConectora: { width: 2, flex: 1, backgroundColor: colores.borde, marginVertical: 2 },
    contenidoEvento: { flex: 1, paddingBottom: 20, paddingLeft: 10 },
    textoEvento: { fontSize: 14, color: colores.texto, lineHeight: 20 },
    fechaEvento: { fontSize: 12, color: colores.textoTenue, marginTop: 3 },
  });
}