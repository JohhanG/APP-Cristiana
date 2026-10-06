import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

const CATEGORIAS = [
  { valor: 'general', etiqueta: 'General', icono: 'document-text-outline' },
  { valor: 'predica', etiqueta: 'Prédica', icono: 'megaphone-outline' },
  { valor: 'estudio', etiqueta: 'Estudio', icono: 'book-outline' },
  { valor: 'oracion', etiqueta: 'Oración', icono: 'hand-left-outline' },
];

export default function NotaDetalleScreen({ route, navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const { notaId, referenciaBiblica } = route.params || {};
  const esNueva = !notaId;

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState('general');
  const [referencia, setReferencia] = useState(referenciaBiblica || '');
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (esNueva) return;

    async function cargarNota() {
      const { data, error } = await supabase
        .from('notas_personales')
        .select('*')
        .eq('id', notaId)
        .single();

      if (!error && data) {
        setTitulo(data.titulo);
        setContenido(data.contenido);
        setCategoria(data.categoria || 'general');
        setReferencia(data.referencia_biblica || '');
      }
      setCargando(false);
    }
    cargarNota();
  }, [notaId]);

  async function guardarNota() {
    if (!titulo.trim()) {
      Alert.alert('Falta el título', 'Ponle un título a tu apunte');
      return;
    }
    if (!contenido.trim()) {
      Alert.alert('Falta el contenido', 'Escribe algo en tu apunte');
      return;
    }

    setGuardando(true);

    if (esNueva) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGuardando(false);
        Alert.alert('Error', 'Necesitas iniciar sesión');
        return;
      }

      const { error } = await supabase.from('notas_personales').insert({
        usuario_id: user.id,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        categoria,
        referencia_biblica: referencia.trim() || null,
      });

      setGuardando(false);
      if (error) {
        Alert.alert('Error al guardar', error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('notas_personales')
        .update({
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          categoria,
          referencia_biblica: referencia.trim() || null,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', notaId);

      setGuardando(false);
      if (error) {
        Alert.alert('Error al guardar', error.message);
        return;
      }
    }

    navigation.goBack();
  }

  function confirmarEliminar() {
    Alert.alert('Eliminar apunte', '¿Seguro que quieres eliminar este apunte? No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: eliminarNota },
    ]);
  }

  async function eliminarNota() {
    setEliminando(true);
    const { error } = await supabase.from('notas_personales').delete().eq('id', notaId);
    setEliminando(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    navigation.goBack();
  }

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.etiqueta}>Título</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ej. Lo que aprendí hoy"
        placeholderTextColor={colores.textoTenue}
      />

      <Text style={styles.etiqueta}>Categoría</Text>
      <View style={styles.filaCategorias}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat.valor}
            style={[styles.chipCategoria, categoria === cat.valor && styles.chipCategoriaActivo]}
            onPress={() => setCategoria(cat.valor)}
          >
            <Ionicons
              name={cat.icono}
              size={14}
              color={categoria === cat.valor ? colores.primarioTexto : colores.textoSecundario}
            />
            <Text style={[styles.textoChipCategoria, categoria === cat.valor && styles.textoChipCategoriaActivo]}>
              {cat.etiqueta}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.etiqueta}>Referencia bíblica (opcional)</Text>
      <TextInput
        style={styles.input}
        value={referencia}
        onChangeText={setReferencia}
        placeholder="Ej. Juan 3:16"
        placeholderTextColor={colores.textoTenue}
      />

      <Text style={styles.etiqueta}>Tu apunte</Text>
      <TextInput
        style={[styles.input, styles.inputContenido]}
        value={contenido}
        onChangeText={setContenido}
        placeholder="Escribe lo que quieras recordar..."
        placeholderTextColor={colores.textoTenue}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarNota} disabled={guardando}>
        {guardando ? (
          <ActivityIndicator color={colores.primarioTexto} />
        ) : (
          <Text style={styles.textoBotonGuardar}>{esNueva ? 'Guardar apunte' : 'Guardar cambios'}</Text>
        )}
      </TouchableOpacity>

      {!esNueva && (
        <TouchableOpacity style={styles.botonEliminar} onPress={confirmarEliminar} disabled={eliminando}>
          {eliminando ? (
            <ActivityIndicator color={colores.peligro} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color={colores.peligro} style={{ marginRight: 6 }} />
              <Text style={styles.textoBotonEliminar}>Eliminar apunte</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    etiqueta: { fontSize: 13, color: colores.textoSecundario, marginBottom: 6, marginTop: 14 },
    input: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: colores.texto,
      backgroundColor: colores.superficie,
    },
    inputContenido: { height: 180 },
    filaCategorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipCategoria: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colores.superficie,
    },
    chipCategoriaActivo: { backgroundColor: colores.primario },
    textoChipCategoria: { fontSize: 13, color: colores.textoSecundario, fontWeight: '600' },
    textoChipCategoriaActivo: { color: colores.primarioTexto },
    botonGuardar: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginTop: 24,
    },
    textoBotonGuardar: { color: colores.primarioTexto, fontWeight: '600', fontSize: 15 },
    botonEliminar: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 14,
      marginTop: 10,
    },
    textoBotonEliminar: { color: colores.peligro, fontWeight: '600' },
  });
}