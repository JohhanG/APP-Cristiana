import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ESTADOS_DE_ANIMO } from '../lib/estadosAnimo';
import { buscarVersiculo } from '../lib/bibliaApi';
import { useTheme } from '../theme/ThemeContext';

export default function EstadoAnimoScreen() {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [versiculos, setVersiculos] = useState([]);
  const [cargando, setCargando] = useState(false);

  async function elegirEstado(estado) {
    setEstadoSeleccionado(estado);
    setCargando(true);
    setVersiculos([]);

    const resultados = await Promise.all(estado.referencias.map((ref) => buscarVersiculo(ref)));

    const versiculosObtenidos = resultados
      .map((r, i) => (r.exito ? { referencia: estado.referencias[i], texto: r.texto } : null))
      .filter(Boolean);

    setVersiculos(versiculosObtenidos);
    setCargando(false);
  }

  if (estadoSeleccionado) {
    return (
      <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => setEstadoSeleccionado(null)}>
          <Ionicons name="chevron-back" size={18} color={colores.primario} />
          <Text style={styles.textoVolver}>Elegir otro estado</Text>
        </TouchableOpacity>

        <Text style={styles.emojiGrande}>{estadoSeleccionado.emoji}</Text>
        <Text style={styles.tituloEstado}>Te sientes {estadoSeleccionado.etiqueta.toLowerCase()}</Text>

        {cargando ? (
          <ActivityIndicator color={colores.primario} style={{ marginTop: 30 }} />
        ) : (
          <>
            {versiculos.map((v) => (
              <View key={v.referencia} style={styles.tarjetaVersiculo}>
                <Text style={styles.referenciaVersiculo}>{v.referencia}</Text>
                <Text style={styles.textoVersiculo}>{v.texto}</Text>
              </View>
            ))}

            <View style={styles.tarjetaOracion}>
              <View style={styles.filaTituloOracion}>
                <Ionicons name="hand-left-outline" size={18} color={colores.primario} />
                <Text style={styles.tituloOracion}>Una oración para ti</Text>
              </View>
              <Text style={styles.textoOracion}>{estadoSeleccionado.oracion}</Text>
            </View>
          </>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
      <Text style={styles.titulo}>¿Cómo te sientes hoy?</Text>
      <Text style={styles.subtitulo}>Elige lo que más se parezca a tu momento, y te compartimos algo para tu corazón</Text>

      <View style={styles.grid}>
        {ESTADOS_DE_ANIMO.map((estado) => (
          <TouchableOpacity key={estado.valor} style={styles.tarjetaEstado} onPress={() => elegirEstado(estado)}>
            <Text style={styles.emojiTarjeta}>{estado.emoji}</Text>
            <Text style={styles.etiquetaTarjeta}>{estado.etiqueta}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    titulo: { fontSize: 22, fontWeight: '700', color: colores.texto, marginBottom: 6 },
    subtitulo: { fontSize: 13, color: colores.textoSecundario, marginBottom: 20, lineHeight: 18 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    tarjetaEstado: {
      width: '30%',
      aspectRatio: 1,
      backgroundColor: colores.superficie,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    emojiTarjeta: { fontSize: 30 },
    etiquetaTarjeta: { fontSize: 12, fontWeight: '600', color: colores.texto, textAlign: 'center' },
    botonVolver: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
    textoVolver: { color: colores.primario, fontWeight: '600', fontSize: 14 },
    emojiGrande: { fontSize: 56, textAlign: 'center' },
    tituloEstado: { fontSize: 18, fontWeight: '700', color: colores.texto, textAlign: 'center', marginBottom: 24, textTransform: 'capitalize' },
    tarjetaVersiculo: { backgroundColor: colores.superficie, borderRadius: 12, padding: 16, marginBottom: 12 },
    referenciaVersiculo: { fontSize: 14, fontWeight: '700', color: colores.primario, marginBottom: 8 },
    textoVersiculo: { fontSize: 15, lineHeight: 22, color: colores.texto, fontStyle: 'italic' },
    tarjetaOracion: { backgroundColor: colores.superficieAlterna, borderRadius: 12, padding: 16, marginTop: 8 },
    filaTituloOracion: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    tituloOracion: { fontSize: 14, fontWeight: '700', color: colores.texto },
    textoOracion: { fontSize: 14, lineHeight: 21, color: colores.texto },
  });
}