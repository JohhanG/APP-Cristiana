import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

export default function EstudioDetalleScreen({ route }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);
  const { estudioId } = route.params;
  const [estudio, setEstudio] = useState(null);
  const [dias, setDias] = useState([]);
  const [diaActual, setDiaActual] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data: estudioData } = await supabase
        .from('estudios')
        .select('*, perfiles!autor_id(nombre_usuario)')
        .eq('id', estudioId)
        .single();

      const { data: diasData } = await supabase
        .from('dias_estudio')
        .select('*')
        .eq('estudio_id', estudioId)
        .order('numero_dia', { ascending: true });

      setEstudio(estudioData);
      setDias(diasData || []);
      setCargando(false);
    }
    cargar();
  }, [estudioId]);

  async function marcarProgreso() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('progreso_usuario').upsert(
      {
        usuario_id: user.id,
        estudio_id: estudioId,
        dia_actual: diaActual + 1,
        completado: diaActual + 1 === dias.length,
      },
      { onConflict: 'usuario_id,estudio_id' }
    );

    if (diaActual + 1 < dias.length) {
      setDiaActual(diaActual + 1);
    } else {
      Alert.alert('¡Felicidades!', 'Completaste este estudio bíblico');
    }
  }

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const dia = dias[diaActual];

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.tituloEstudio}>{estudio?.titulo}</Text>
      <Text style={styles.autor}>por {estudio?.perfiles?.nombre_usuario || 'anónimo'}</Text>

      <View style={styles.progresoBar}>
        <View style={[styles.progresoRelleno, { width: `${((diaActual + 1) / dias.length) * 100}%` }]} />
      </View>
      <Text style={styles.progresoTexto}>Día {diaActual + 1} de {dias.length}</Text>

      {dia && (
        <View style={styles.tarjetaDia}>
          <Text style={styles.tituloDia}>{dia.titulo}</Text>
          <Text style={styles.referencia}>{dia.referencia_biblica}</Text>

          {dia.texto_biblico ? (
            <Text style={styles.textoBiblico}>{dia.texto_biblico}</Text>
          ) : null}

          <Text style={styles.reflexion}>{dia.reflexion}</Text>

          {dia.pregunta_reflexion ? (
            <View style={styles.cajaPregunta}>
              <Text style={styles.pregunta}>{dia.pregunta_reflexion}</Text>
            </View>
          ) : null}
        </View>
      )}

      <View style={styles.navegacion}>
        {diaActual > 0 && (
          <TouchableOpacity style={styles.botonSecundario} onPress={() => setDiaActual(diaActual - 1)}>
            <Text style={styles.textoBotonSecundario}>Día anterior</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.botonPrincipal} onPress={marcarProgreso}>
          <Text style={styles.textoBotonPrincipal}>
            {diaActual + 1 === dias.length ? 'Completar estudio' : 'Marcar como leído y continuar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tituloEstudio: { fontSize: 22, fontWeight: '600', color: colores.texto },
    autor: { fontSize: 13, color: colores.textoSecundario, marginBottom: 16 },
    progresoBar: { height: 6, backgroundColor: colores.superficie, borderRadius: 4, overflow: 'hidden' },
    progresoRelleno: { height: '100%', backgroundColor: colores.primario },
    progresoTexto: { fontSize: 12, color: colores.textoTenue, marginTop: 6, marginBottom: 20 },
    tarjetaDia: { backgroundColor: colores.superficie, borderRadius: 12, padding: 16 },
    tituloDia: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: colores.texto },
    referencia: { fontSize: 14, color: colores.primario, fontWeight: '600', marginBottom: 12 },
    textoBiblico: { fontStyle: 'italic', fontSize: 15, color: colores.textoSecundario, marginBottom: 12, lineHeight: 22 },
    reflexion: { fontSize: 15, lineHeight: 22, marginBottom: 12, color: colores.texto },
    cajaPregunta: { backgroundColor: colores.superficieAlterna, borderRadius: 8, padding: 12 },
    pregunta: { fontSize: 14, fontStyle: 'italic', color: colores.primario },
    navegacion: { marginTop: 24, gap: 10 },
    botonPrincipal: { backgroundColor: colores.primario, borderRadius: 8, padding: 14, alignItems: 'center' },
    textoBotonPrincipal: { color: colores.primarioTexto, fontWeight: '600' },
    botonSecundario: { borderWidth: 1, borderColor: colores.borde, borderRadius: 8, padding: 14, alignItems: 'center' },
    textoBotonSecundario: { color: colores.texto, fontWeight: '600' },
  });
}