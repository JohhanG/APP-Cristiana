import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import {
  reproducirVoz,
  detenerVoz,
  cambiarVelocidadVoz,
} from '../lib/audioVozService';

const VELOCIDADES = [
  { etiqueta: '0.8x', valor: 0.8 },
  { etiqueta: '1.0x', valor: 0.95 },
  { etiqueta: '1.2x', valor: 1.15 },
];

export default function BarraReproductorAudio({ textoANarrar, titulo = 'Audio narrado' }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [reproduciendo, setReproduciendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [indiceVelocidad, setIndiceVelocidad] = useState(1); // 1.0x por defecto
  const [progreso, setProgreso] = useState({ porcentaje: 0, indice: 0, total: 0 });

  // Detener audio si el componente se desmonta (al salir de la pantalla)
  useEffect(() => {
    return () => {
      detenerVoz();
    };
  }, []);

  async function alternarReproduccion() {
    if (reproduciendo) {
      detenerVoz();
      setReproduciendo(false);
      return;
    }

    if (!textoANarrar || !textoANarrar.trim()) return;

    setCargando(true);
    const vel = VELOCIDADES[indiceVelocidad].valor;

    await reproducirVoz(textoANarrar, {
      velocidad: vel,
      onInicio: () => {
        setCargando(false);
        setReproduciendo(true);
      },
      onProgreso: (datosProgreso) => {
        setProgreso(datosProgreso);
      },
      onFin: () => {
        setReproduciendo(false);
        setProgreso({ porcentaje: 100, indice: 0, total: 0 });
      },
      onError: () => {
        setCargando(false);
        setReproduciendo(false);
      },
    });
  }

  function rotarVelocidad() {
    const siguienteIndice = (indiceVelocidad + 1) % VELOCIDADES.length;
    setIndiceVelocidad(siguienteIndice);
    cambiarVelocidadVoz(VELOCIDADES[siguienteIndice].valor);
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.filaPrincipal}>
        {/* Botón de Reproducir / Pausa */}
        <TouchableOpacity
          style={[styles.botonPlay, reproduciendo && styles.botonPlayActivo]}
          onPress={alternarReproduccion}
          activeOpacity={0.8}
        >
          {cargando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={reproduciendo ? 'stop' : 'volume-high'}
              size={18}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        {/* Título y Estado */}
        <View style={styles.infoTexto}>
          <Text style={styles.tituloAudio} numberOfLines={1}>
            {reproduciendo ? 'Escuchando en voz alta...' : 'Escuchar en audio'}
          </Text>
          <Text style={styles.subtituloAudio}>
            {reproduciendo
              ? `Párrafo ${progreso.indice + 1} de ${progreso.total} (${progreso.porcentaje}%)`
              : 'Narración pastoral sin conexión'}
          </Text>
        </View>

        {/* Selector de Velocidad */}
        <TouchableOpacity style={styles.botonVelocidad} onPress={rotarVelocidad}>
          <Text style={styles.textoVelocidad}>
            {VELOCIDADES[indiceVelocidad].etiqueta}
          </Text>
        </TouchableOpacity>

        {/* Botón Cancelar si está reproduciendo */}
        {reproduciendo && (
          <TouchableOpacity
            style={styles.botonCerrar}
            onPress={() => {
              detenerVoz();
              setReproduciendo(false);
            }}
          >
            <Ionicons name="close" size={18} color={colores.textoTenue} />
          </TouchableOpacity>
        )}
      </View>

      {/* Barra de progreso sutil */}
      {reproduciendo && (
        <View style={styles.barraProgresoFondo}>
          <View style={[styles.barraProgresoRelleno, { width: `${progreso.porcentaje}%` }]} />
        </View>
      )}
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 14,
      padding: 12,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    filaPrincipal: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    botonPlay: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colores.primario,
      justifyContent: 'center',
      alignItems: 'center',
    },
    botonPlayActivo: {
      backgroundColor: '#EF4444', // Rojo para detener
    },
    infoTexto: {
      flex: 1,
    },
    tituloAudio: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.texto,
    },
    subtituloAudio: {
      fontSize: 11,
      color: colores.textoSecundario,
      marginTop: 2,
    },
    botonVelocidad: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: colores.superficieAlterna,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    textoVelocidad: {
      fontSize: 11,
      fontWeight: '700',
      color: colores.primario,
    },
    botonCerrar: {
      padding: 4,
    },
    barraProgresoFondo: {
      height: 3,
      backgroundColor: colores.borde,
      borderRadius: 2,
      marginTop: 10,
      overflow: 'hidden',
    },
    barraProgresoRelleno: {
      height: '100%',
      backgroundColor: colores.primario,
    },
  });
}
