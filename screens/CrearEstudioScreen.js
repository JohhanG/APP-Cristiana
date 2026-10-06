import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { buscarVersiculo } from '../lib/bibliaApi';
import { elegirYSubirImagen } from '../lib/subirImagen';
import { useTheme } from '../theme/ThemeContext';

export default function CrearEstudioScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [titulo, setTitulo] = useState('');
  const [tema, setTema] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [portadaUrl, setPortadaUrl] = useState(null);
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const [dias, setDias] = useState([
    { titulo: '', referencia_biblica: '', texto_biblico: '', reflexion: '', pregunta_reflexion: '', imagen_url: null, buscando: false, subiendoImagen: false },
  ]);
  const [guardando, setGuardando] = useState(false);

  function actualizarDia(index, campo, valor) {
    const copia = [...dias];
    copia[index][campo] = valor;
    setDias(copia);
  }

  function agregarDia() {
    setDias([...dias, { titulo: '', referencia_biblica: '', texto_biblico: '', reflexion: '', pregunta_reflexion: '', imagen_url: null, buscando: false, subiendoImagen: false }]);
  }

  function quitarDia(index) {
    if (dias.length === 1) return;
    setDias(dias.filter((_, i) => i !== index));
  }

  async function subirPortada() {
    setSubiendoPortada(true);
    const resultado = await elegirYSubirImagen('portadas');
    setSubiendoPortada(false);

    if (resultado.cancelado) return;
    if (!resultado.exito) {
      Alert.alert('No se pudo subir la imagen', resultado.error);
      return;
    }
    setPortadaUrl(resultado.url);
  }

  async function subirImagenDia(index) {
    actualizarDia(index, 'subiendoImagen', true);
    const resultado = await elegirYSubirImagen('dias');
    actualizarDia(index, 'subiendoImagen', false);

    if (resultado.cancelado) return;
    if (!resultado.exito) {
      Alert.alert('No se pudo subir la imagen', resultado.error);
      return;
    }
    actualizarDia(index, 'imagen_url', resultado.url);
  }

  async function buscarTextoBiblico(index) {
    const referencia = dias[index].referencia_biblica;
    if (!referencia.trim()) {
      Alert.alert('Falta la referencia', 'Escribe primero una referencia, ej. Mateo 6:14-15');
      return;
    }

    actualizarDia(index, 'buscando', true);
    const resultado = await buscarVersiculo(referencia);
    actualizarDia(index, 'buscando', false);

    if (resultado.exito) {
      actualizarDia(index, 'texto_biblico', resultado.texto);
    } else {
      Alert.alert('No se encontró', resultado.error);
    }
  }

  async function guardarEstudio(publicarDirecto) {
    if (!titulo.trim()) {
      Alert.alert('Falta el título', 'Ponle un título a tu estudio');
      return;
    }
    const diasInvalidos = dias.some((d) => !d.titulo.trim() || !d.referencia_biblica.trim() || !d.reflexion.trim());
    if (diasInvalidos) {
      Alert.alert('Días incompletos', 'Cada día necesita título, referencia bíblica y reflexión');
      return;
    }

    setGuardando(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setGuardando(false);
      Alert.alert('Error', 'Necesitas iniciar sesión');
      return;
    }

    const { data: estudio, error: errorEstudio } = await supabase
      .from('estudios')
      .insert({
        autor_id: user.id,
        titulo,
        descripcion,
        tema,
        portada_url: portadaUrl,
        num_dias: dias.length,
        estado: publicarDirecto ? 'pendiente' : 'borrador',
      })
      .select()
      .single();

    if (errorEstudio) {
      setGuardando(false);
      Alert.alert('Error al guardar', errorEstudio.message);
      return;
    }

    const filasDias = dias.map((d, i) => ({
      estudio_id: estudio.id,
      numero_dia: i + 1,
      titulo: d.titulo,
      referencia_biblica: d.referencia_biblica,
      texto_biblico: d.texto_biblico || null,
      reflexion: d.reflexion,
      pregunta_reflexion: d.pregunta_reflexion,
      imagen_url: d.imagen_url || null,
    }));

    const { error: errorDias } = await supabase.from('dias_estudio').insert(filasDias);

    setGuardando(false);

    if (errorDias) {
      Alert.alert('Error al guardar los días', errorDias.message);
      return;
    }

    Alert.alert('Listo', publicarDirecto ? 'Tu estudio fue enviado a revisión. Te avisaremos cuando sea aprobado.' : 'Tu estudio se guardó como borrador');
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.etiqueta}>Portada del estudio (opcional)</Text>
      <TouchableOpacity style={styles.cajaImagen} onPress={subirPortada} disabled={subiendoPortada}>
        {subiendoPortada ? (
          <ActivityIndicator color={colores.primario} />
        ) : portadaUrl ? (
          <Image source={{ uri: portadaUrl }} style={styles.imagenPortada} />
        ) : (
          <View style={styles.placeholderImagen}>
            <Ionicons name="image-outline" size={28} color={colores.textoTenue} />
            <Text style={styles.textoPlaceholderImagen}>Toca para subir una portada</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.etiqueta}>Título del estudio</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ej. 7 días sobre el perdón"
        placeholderTextColor={colores.textoTenue}
      />

      <Text style={styles.etiqueta}>Tema</Text>
      <TextInput
        style={styles.input}
        value={tema}
        onChangeText={setTema}
        placeholder="Ej. perdón, familia, ansiedad"
        placeholderTextColor={colores.textoTenue}
      />

      <Text style={styles.etiqueta}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 70 }]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="De qué trata este estudio"
        placeholderTextColor={colores.textoTenue}
        multiline
      />

      <Text style={styles.seccion}>Días del estudio</Text>

      {dias.map((dia, index) => (
        <View key={index} style={styles.tarjetaDia}>
          <View style={styles.encabezadoDia}>
            <Text style={styles.numeroDia}>Día {index + 1}</Text>
            {dias.length > 1 && (
              <TouchableOpacity onPress={() => quitarDia(index)}>
                <Text style={styles.quitar}>Quitar</Text>
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Título del día"
            placeholderTextColor={colores.textoTenue}
            value={dia.titulo}
            onChangeText={(v) => actualizarDia(index, 'titulo', v)}
          />

          <View style={styles.filaReferencia}>
            <TextInput
              style={[styles.input, styles.inputReferencia]}
              placeholder="Referencia (ej. Mateo 6:14-15)"
              placeholderTextColor={colores.textoTenue}
              value={dia.referencia_biblica}
              onChangeText={(v) => actualizarDia(index, 'referencia_biblica', v)}
            />
            <TouchableOpacity
              style={styles.botonBuscar}
              onPress={() => buscarTextoBiblico(index)}
              disabled={dia.buscando}
            >
              {dia.buscando ? (
                <ActivityIndicator color={colores.primarioTexto} size="small" />
              ) : (
                <Text style={styles.textoBotonBuscar}>Buscar</Text>
              )}
            </TouchableOpacity>
          </View>

          {dia.texto_biblico ? (
            <View style={styles.cajaTextoBiblico}>
              <Text style={styles.textoBiblicoEncontrado}>{dia.texto_biblico}</Text>
              <Text style={styles.notaVersion}>Reina-Valera 1960</Text>
            </View>
          ) : null}

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Reflexión"
            placeholderTextColor={colores.textoTenue}
            multiline
            value={dia.reflexion}
            onChangeText={(v) => actualizarDia(index, 'reflexion', v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Pregunta para reflexionar (opcional)"
            placeholderTextColor={colores.textoTenue}
            value={dia.pregunta_reflexion}
            onChangeText={(v) => actualizarDia(index, 'pregunta_reflexion', v)}
          />

          <Text style={styles.etiquetaImagenDia}>Imagen del día (opcional)</Text>
          <TouchableOpacity
            style={styles.cajaImagenDia}
            onPress={() => subirImagenDia(index)}
            disabled={dia.subiendoImagen}
          >
            {dia.subiendoImagen ? (
              <ActivityIndicator color={colores.primario} />
            ) : dia.imagen_url ? (
              <Image source={{ uri: dia.imagen_url }} style={styles.imagenDiaPreview} />
            ) : (
              <View style={styles.placeholderImagenDia}>
                <Ionicons name="image-outline" size={20} color={colores.textoTenue} />
                <Text style={styles.textoPlaceholderImagenDia}>Agregar imagen</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.botonAgregarDia} onPress={agregarDia}>
        <Text style={styles.textoAgregarDia}>+ Agregar otro día</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonGuardar}
        disabled={guardando}
        onPress={() => guardarEstudio(false)}
      >
        <Text style={styles.textoBotonGuardar}>Guardar como borrador</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botonGuardar, styles.botonPublicar]}
        disabled={guardando}
        onPress={() => guardarEstudio(true)}
      >
        <Text style={styles.textoBotonGuardar}>Enviar a revisión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo, padding: 16 },
    etiqueta: { fontSize: 13, color: colores.textoSecundario, marginBottom: 4, marginTop: 10 },
    input: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      marginBottom: 8,
      color: colores.texto,
      backgroundColor: colores.superficie,
    },
    cajaImagen: {
      height: 140,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colores.superficie,
      marginBottom: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagenPortada: { width: '100%', height: '100%' },
    placeholderImagen: { alignItems: 'center' },
    textoPlaceholderImagen: { fontSize: 12, color: colores.textoTenue, marginTop: 6 },
    seccion: { fontSize: 17, fontWeight: '600', marginTop: 20, marginBottom: 8, color: colores.texto },
    tarjetaDia: {
      backgroundColor: colores.superficie,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    encabezadoDia: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    numeroDia: { fontWeight: '600', fontSize: 14, color: colores.texto },
    quitar: { color: colores.peligro, fontSize: 13 },
    filaReferencia: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    inputReferencia: { flex: 1 },
    botonBuscar: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      paddingHorizontal: 14,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    textoBotonBuscar: { color: colores.primarioTexto, fontWeight: '600', fontSize: 13 },
    cajaTextoBiblico: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    textoBiblicoEncontrado: { fontSize: 14, fontStyle: 'italic', color: colores.texto, lineHeight: 20 },
    notaVersion: { fontSize: 11, color: colores.textoTenue, marginTop: 6, textAlign: 'right' },
    etiquetaImagenDia: { fontSize: 12, color: colores.textoSecundario, marginTop: 4, marginBottom: 6 },
    cajaImagenDia: {
      height: 90,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagenDiaPreview: { width: '100%', height: '100%' },
    placeholderImagenDia: { alignItems: 'center' },
    textoPlaceholderImagenDia: { fontSize: 11, color: colores.textoTenue, marginTop: 4 },
    botonAgregarDia: {
      borderWidth: 1,
      borderColor: colores.primario,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginBottom: 24,
    },
    textoAgregarDia: { color: colores.primario, fontWeight: '600' },
    botonGuardar: {
      backgroundColor: colores.textoTenue,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    botonPublicar: { backgroundColor: colores.primario },
    textoBotonGuardar: { color: colores.primarioTexto, fontWeight: '600', fontSize: 15 },
  });
}
