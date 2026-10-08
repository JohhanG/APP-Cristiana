import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import {
  VERSION_ACTUAL,
  NOVEDADES_SLIDES,
  marcarNovedadesComoVistas,
} from '../constants/novedades';

const { width } = Dimensions.get('window');

export default function ModalNovedades({ visible, onCerrar, onExplorar }) {
  const { colores } = useTheme();
  const [indiceActual, setIndiceActual] = useState(0);

  if (!visible) return null;

  const totalSlides = NOVEDADES_SLIDES.length;
  const slide = NOVEDADES_SLIDES[indiceActual] || NOVEDADES_SLIDES[0];
  const esUltimo = indiceActual === totalSlides - 1;

  async function handleCerrar() {
    await marcarNovedadesComoVistas();
    setIndiceActual(0);
    if (onCerrar) onCerrar();
  }

  async function handleSiguiente() {
    if (esUltimo) {
      await handleCerrar();
      if (onExplorar) onExplorar(slide.id);
    } else {
      setIndiceActual((prev) => Math.min(prev + 1, totalSlides - 1));
    }
  }

  function handleAnterior() {
    setIndiceActual((prev) => Math.max(prev - 1, 0));
  }

  const styles = crearEstilos(colores);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCerrar}
    >
      <View style={styles.fondoOverlay}>
        <View style={styles.tarjetaModal}>
          {/* Cabecera del Tour */}
          <View style={styles.cabecera}>
            <View style={styles.badgeVersion}>
              <Ionicons name="sparkles" size={13} color={colores.primario} style={{ marginRight: 4 }} />
              <Text style={styles.textoBadgeVersion}>Novedades v{VERSION_ACTUAL}</Text>
            </View>

            <TouchableOpacity
              onPress={handleCerrar}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.botonCerrar}
            >
              <Ionicons name="close" size={22} color={colores.textoTenue} />
            </TouchableOpacity>
          </View>

          {/* Cuerpo del Slide */}
          <View style={styles.cuerpoSlide}>
            <View style={[styles.circuloIcono, { backgroundColor: slide.colorIcono + '18' }]}>
              <Ionicons name={slide.icono} size={46} color={slide.colorIcono} />
            </View>

            <View style={[styles.badgeCategoria, { borderColor: slide.colorIcono + '40' }]}>
              <Text style={[styles.textoBadgeCategoria, { color: slide.colorIcono }]}>
                {slide.etiqueta.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.tituloSlide}>{slide.titulo}</Text>
            <Text style={styles.descripcionSlide}>{slide.descripcion}</Text>

            {slide.destacado ? (
              <View style={styles.cajaDestacado}>
                <Ionicons name="checkmark-circle" size={18} color={slide.colorIcono} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.textoDestacado}>{slide.destacado}</Text>
              </View>
            ) : null}
          </View>

          {/* Puntos de Paginación */}
          <View style={styles.filaPuntos}>
            {NOVEDADES_SLIDES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setIndiceActual(i)}
                style={[
                  styles.punto,
                  i === indiceActual && styles.puntoActivo,
                ]}
              />
            ))}
          </View>

          {/* Barra de Acciones */}
          <View style={styles.pieAcciones}>
            {indiceActual > 0 ? (
              <TouchableOpacity
                style={styles.botonAtras}
                onPress={handleAnterior}
              >
                <Ionicons name="chevron-back" size={18} color={colores.textoSecundario} />
                <Text style={styles.textoBotonAtras}>Atrás</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.botonOmitir}
                onPress={handleCerrar}
              >
                <Text style={styles.textoBotonOmitir}>Omitir</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.botonPrincipal}
              onPress={handleSiguiente}
              activeOpacity={0.85}
            >
              <Text style={styles.textoBotonPrincipal}>
                {esUltimo ? '¡Comenzar ahora!' : 'Siguiente'}
              </Text>
              <Ionicons
                name={esUltimo ? 'arrow-forward' : 'chevron-forward'}
                size={16}
                color={colores.primarioTexto}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    fondoOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    tarjetaModal: {
      width: Math.min(width - 32, 420),
      backgroundColor: colores.superficie,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 10,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    cabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    badgeVersion: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.primario + '18',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
    },
    textoBadgeVersion: {
      fontSize: 12,
      fontWeight: '700',
      color: colores.primario,
    },
    botonCerrar: {
      padding: 4,
    },
    cuerpoSlide: {
      alignItems: 'center',
      minHeight: 310,
      justifyContent: 'center',
    },
    circuloIcono: {
      width: 86,
      height: 86,
      borderRadius: 43,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    badgeCategoria: {
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 10,
      marginBottom: 12,
    },
    textoBadgeCategoria: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
    },
    tituloSlide: {
      fontSize: 21,
      fontWeight: '800',
      color: colores.texto,
      textAlign: 'center',
      marginBottom: 10,
      lineHeight: 27,
    },
    descripcionSlide: {
      fontSize: 14,
      color: colores.textoSecundario,
      textAlign: 'center',
      lineHeight: 21,
      paddingHorizontal: 6,
      marginBottom: 16,
    },
    cajaDestacado: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colores.superficieAlterna,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: colores.primario,
      marginHorizontal: 4,
    },
    textoDestacado: {
      flex: 1,
      fontSize: 12.5,
      color: colores.texto,
      fontWeight: '500',
      lineHeight: 18,
    },
    filaPuntos: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 7,
      marginTop: 20,
      marginBottom: 20,
    },
    punto: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colores.borde,
    },
    puntoActivo: {
      backgroundColor: colores.primario,
      width: 24,
    },
    pieAcciones: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    botonOmitir: {
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    textoBotonOmitir: {
      fontSize: 14,
      fontWeight: '600',
      color: colores.textoTenue,
    },
    botonAtras: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    textoBotonAtras: {
      fontSize: 14,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    botonPrincipal: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colores.primario,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colores.primario,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    textoBotonPrincipal: {
      color: colores.primarioTexto,
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
