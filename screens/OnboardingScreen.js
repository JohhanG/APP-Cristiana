import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { elegirYSubirImagen } from '../lib/subirImagen';
import { useTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SLIDES = [
  {
    icono: 'hand-left-outline',
    titulo: 'Bienvenido a Maná',
    descripcion: 'Tu espacio para leer, estudiar y guardar lo que Dios te muestra cada día.',
  },
  {
    icono: 'reader-outline',
    titulo: 'La Biblia a tu manera',
    descripcion: 'Lee en distintas versiones, resalta versículos con colores y guárdalos en tus favoritos.',
  },
  {
    icono: 'book-outline',
    titulo: 'Estudios de la comunidad',
    descripcion: 'Explora estudios bíblicos creados por otros usuarios, o crea el tuyo propio y compártelo.',
  },
  {
    icono: 'create-outline',
    titulo: 'Tus propios apuntes',
    descripcion: 'Escribe lo que aprendes en la prédica, en tus estudios personales o en oración — todo queda guardado solo para ti.',
  },
];

export default function OnboardingScreen({ onListo }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [paso, setPaso] = useState(0);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [fotoUrl, setFotoUrl] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const enPasoFinal = paso === SLIDES.length;

  async function elegirFoto() {
    setSubiendoFoto(true);
    const resultado = await elegirYSubirImagen('perfiles', [1, 1]);
    setSubiendoFoto(false);

    if (resultado.cancelado) return;
    if (!resultado.exito) {
      Alert.alert('No se pudo subir la foto', resultado.error);
      return;
    }
    setFotoUrl(resultado.url);
  }

  async function finalizar() {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setGuardando(false);
      Alert.alert('Error', 'No se pudo identificar tu sesión. Cierra la app y vuelve a intentar.');
      return;
    }

    const actualizacion = { onboarding_completado: true };
    if (nombreUsuario.trim()) actualizacion.nombre_usuario = nombreUsuario.trim();
    if (fotoUrl) actualizacion.foto_url = fotoUrl;

    const { data, error } = await supabase
      .from('perfiles')
      .update(actualizacion)
      .eq('id', user.id)
      .select();

    setGuardando(false);

    if (error) {
      Alert.alert('Error al guardar', error.message);
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        'No se pudo guardar',
        'No se encontró tu perfil para actualizar. Puedes completar tu foto y nombre después desde Perfil.'
      );
      onListo();
      return;
    }

    AsyncStorage.setItem('onboarding_completado_' + user.id, 'true').catch(() => {});
    onListo();
  }

  async function omitir() {
    setGuardando(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('perfiles').update({ onboarding_completado: true }).eq('id', user.id);
      AsyncStorage.setItem('onboarding_completado_' + user.id, 'true').catch(() => {});
    }
    setGuardando(false);
    onListo();
  }

  if (enPasoFinal) {
    return (
      <View style={styles.contenedor}>
        <TouchableOpacity style={styles.botonOmitir} onPress={omitir} disabled={guardando}>
          <Text style={styles.textoOmitir}>Omitir</Text>
        </TouchableOpacity>

        <View style={styles.contenidoFinal}>
          <Text style={styles.tituloFinal}>Personaliza tu perfil</Text>
          <Text style={styles.descripcionFinal}>Puedes cambiar esto después desde Perfil cuando quieras</Text>

          <TouchableOpacity style={styles.avatar} onPress={elegirFoto} disabled={subiendoFoto}>
            {subiendoFoto ? (
              <ActivityIndicator color={colores.primario} />
            ) : fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImagen} />
            ) : (
              <Ionicons name="camera-outline" size={28} color={colores.primario} />
            )}
          </TouchableOpacity>
          <Text style={styles.textoAgregarFoto}>{fotoUrl ? 'Cambiar foto' : 'Agregar foto (opcional)'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor={colores.textoTenue}
            value={nombreUsuario}
            onChangeText={setNombreUsuario}
            maxLength={30}
          />
        </View>

        <TouchableOpacity style={styles.botonPrincipal} onPress={finalizar} disabled={guardando}>
          {guardando ? (
            <ActivityIndicator color={colores.primarioTexto} />
          ) : (
            <Text style={styles.textoBotonPrincipal}>Comenzar</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const slide = SLIDES[paso];

  return (
    <View style={styles.contenedor}>
      <TouchableOpacity style={styles.botonOmitir} onPress={omitir} disabled={guardando}>
        <Text style={styles.textoOmitir}>Omitir</Text>
      </TouchableOpacity>

      <View style={styles.contenidoSlide}>
        <View style={styles.circuloIcono}>
          <Ionicons name={slide.icono} size={48} color={colores.primario} />
        </View>
        <Text style={styles.tituloSlide}>{slide.titulo}</Text>
        <Text style={styles.descripcionSlide}>{slide.descripcion}</Text>
      </View>

      <View style={styles.filaPuntos}>
        {[...SLIDES, {}].map((_, i) => (
          <View key={i} style={[styles.punto, i === paso && styles.puntoActivo]} />
        ))}
      </View>

      <TouchableOpacity style={styles.botonPrincipal} onPress={() => setPaso(paso + 1)}>
        <Text style={styles.textoBotonPrincipal}>
          {paso === SLIDES.length - 1 ? 'Continuar' : 'Siguiente'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo, padding: 24, justifyContent: 'space-between' },
    botonOmitir: { alignSelf: 'flex-end', padding: 8 },
    textoOmitir: { color: colores.textoTenue, fontSize: 14 },
    contenidoSlide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    circuloIcono: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 28,
    },
    tituloSlide: { fontSize: 24, fontWeight: '700', color: colores.texto, textAlign: 'center', marginBottom: 12 },
    descripcionSlide: { fontSize: 15, color: colores.textoSecundario, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
    filaPuntos: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
    punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: colores.borde },
    puntoActivo: { backgroundColor: colores.primario, width: 22 },
    botonPrincipal: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 15,
      alignItems: 'center',
    },
    textoBotonPrincipal: { color: colores.primarioTexto, fontWeight: '600', fontSize: 16 },
    contenidoFinal: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    tituloFinal: { fontSize: 22, fontWeight: '700', color: colores.texto, marginBottom: 6 },
    descripcionFinal: { fontSize: 13, color: colores.textoTenue, textAlign: 'center', marginBottom: 28 },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    avatarImagen: { width: 96, height: 96, borderRadius: 48 },
    textoAgregarFoto: { fontSize: 13, color: colores.primario, fontWeight: '600', marginBottom: 28 },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 13,
      fontSize: 15,
      color: colores.texto,
      backgroundColor: colores.superficie,
      textAlign: 'center',
    },
  });
}