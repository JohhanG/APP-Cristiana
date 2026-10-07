import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import {
  TEMAS_DEVOCIONALES,
  SUBTEMAS_MALOS_HABITOS,
  SUBTEMAS_FORTALECER_FE,
  BANCO_DEVOCIONALES_SEMILLA,
  normalizarDevocional,
  obtenerDevocionalesPorTema,
  obtenerDevocionalAleatorio,
  obtenerSubtemasPorTema,
  obtenerApiKeyGemini,
  guardarApiKeyGemini,
  generarDevocionalConIA,
} from '../lib/devocionalesService';

export default function DevocionalesScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [temaActivo, setTemaActivo] = useState('todos');
  const [devocionales, setDevocionales] = useState(BANCO_DEVOCIONALES_SEMILLA.map(normalizarDevocional));
  const [cargando, setCargando] = useState(false); // Carga instantánea a 0ms
  const [refrescando, setRefrescando] = useState(false);
  const [cargandoAleatorio, setCargandoAleatorio] = useState(false);

  // Estados del modal de Inteligencia Artificial
  const [modalIaVisible, setModalIaVisible] = useState(false);
  const [categoriaModal, setCategoriaModal] = useState(temaActivo === 'todos' ? 'malos_habitos' : temaActivo);
  const [subtemaSeleccionado, setSubtemaSeleccionado] = useState('');
  const [situacionPersonal, setSituacionPersonal] = useState('');
  const [generandoIa, setGenerandoIa] = useState(false);
  const [mostrarConfigApiKey, setMostrarConfigApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const cargarDevocionales = useCallback(async (temaId = temaActivo) => {
    // 1. Mostrar catálogo local al instante (0ms)
    const locales = BANCO_DEVOCIONALES_SEMILLA.filter((d) => {
      if (!temaId || temaId === 'todos') return true;
      return d.tema === temaId;
    }).map(normalizarDevocional);
    setDevocionales(locales);

    // 2. Sincronizar en segundo plano con Supabase sin bloquear
    try {
      const lista = await obtenerDevocionalesPorTema(temaId);
      if (lista && lista.length > 0) {
        setDevocionales(lista);
      }
    } catch (e) {
      console.log('Carga silenciosa de devocionales completada con catálogo local:', e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [temaActivo]);

  useEffect(() => {
    cargarDevocionales(temaActivo);
  }, [temaActivo, cargarDevocionales]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarDevocionales(temaActivo);
  }, [temaActivo, cargarDevocionales]);

  async function abrirDevocionalAleatorio() {
    setCargandoAleatorio(true);
    const aleatorio = await obtenerDevocionalAleatorio(temaActivo);
    setCargandoAleatorio(false);
    if (aleatorio) {
      navigation.navigate('DevocionalDetalle', {
        devocional: aleatorio,
        temaId: temaActivo,
      });
    }
  }

  async function abrirModalIA() {
    setCategoriaModal(temaActivo === 'todos' ? 'malos_habitos' : temaActivo);
    setSubtemaSeleccionado('');
    setSituacionPersonal('');
    const keyGuardada = await obtenerApiKeyGemini();
    setApiKeyInput(keyGuardada || '');
    setModalIaVisible(true);
  }

  async function ejecutarGeneracionIA() {
    if (!subtemaSeleccionado && !situacionPersonal.trim()) {
      Alert.alert('Por favor selecciona un tema', 'Elige uno de los temas sugeridos o escribe con qué estás batallando.');
      return;
    }

    if (apiKeyInput.trim()) {
      await guardarApiKeyGemini(apiKeyInput.trim());
    }

    setGenerandoIa(true);
    try {
      const nuevoDevocional = await generarDevocionalConIA({
        tema: categoriaModal,
        subtema: subtemaSeleccionado,
        situacionPersonal: situacionPersonal.trim(),
      });

      setGenerandoIa(false);
      setModalIaVisible(false);

      if (nuevoDevocional) {
        navigation.navigate('DevocionalDetalle', {
          devocional: nuevoDevocional,
          temaId: categoriaModal,
        });
        // Recargar la lista en segundo plano
        cargarDevocionales(temaActivo);
      }
    } catch (error) {
      setGenerandoIa(false);
      Alert.alert('No se pudo generar', 'Ocurrió un inconveniente al generar la reflexión. Por favor intenta de nuevo.');
    }
  }

  const subtemasDisponibles = obtenerSubtemasPorTema(categoriaModal);

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      {/* Cabecera */}
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.titulo}>Devocionales</Text>
          <Text style={styles.subtitulo}>Fortalece tu espíritu y vence cada día</Text>
        </View>
      </View>

      <ScrollView
        style={styles.contenido}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colores.primario} />
        }
      >
        {/* Banner de Devocional Aleatorio */}
        <TouchableOpacity
          style={styles.tarjetaAleatorioHero}
          onPress={abrirDevocionalAleatorio}
          disabled={cargandoAleatorio}
        >
          <View style={styles.iconoAleatorioHero}>
            {cargandoAleatorio ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Ionicons name="shuffle" size={24} color="#ffffff" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloAleatorioHero}>Devocional aleatorio</Text>
            <Text style={styles.subtituloAleatorioHero}>
              {temaActivo === 'todos'
                ? 'Toca para recibir una palabra al azar para ti'
                : `Devocional al azar sobre: ${TEMAS_DEVOCIONALES.find((t) => t.id === temaActivo)?.etiqueta}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colores.primario} />
        </TouchableOpacity>

        {/* Tarjeta de Generación Inteligente (IA) */}
        <TouchableOpacity style={styles.tarjetaIaBanner} onPress={abrirModalIA}>
          <View style={styles.filaIa}>
            <View style={styles.iconoIa}>
              <Ionicons name="sparkles" size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloIa}>Crear devocional guiado con IA</Text>
              <Text style={styles.subtituloIa}>
                ¿Luchando con un mal hábito o desánimo? Recibe una palabra bíblica a tu medida.
              </Text>
            </View>
            <View style={styles.chipBotonIa}>
              <Text style={styles.textoChipIa}>Crear</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Selector de Temáticas (Chips) */}
        <Text style={styles.seccionTitulo}>Temáticas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filaChipsTemas}
        >
          {TEMAS_DEVOCIONALES.map((tema) => {
            const activo = temaActivo === tema.id;
            return (
              <TouchableOpacity
                key={tema.id}
                style={[
                  styles.chipTema,
                  activo && { backgroundColor: tema.color, borderColor: tema.color },
                ]}
                onPress={() => setTemaActivo(tema.id)}
              >
                <Ionicons
                  name={tema.icono}
                  size={15}
                  color={activo ? '#ffffff' : colores.textoSecundario}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.textoChipTema, activo && styles.textoChipTemaActivo]}>
                  {tema.etiqueta}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Listado de Devocionales */}
        <View style={styles.seccionLista}>
          <View style={styles.filaCabeceraLista}>
            <Text style={styles.seccionTitulo}>
              {temaActivo === 'todos'
                ? 'Todas las reflexiones'
                : TEMAS_DEVOCIONALES.find((t) => t.id === temaActivo)?.etiqueta}
            </Text>
            <Text style={styles.conteoDevocionales}>{devocionales.length} disponibles</Text>
          </View>

          {cargando ? (
            <ActivityIndicator size="large" color={colores.primario} style={{ marginTop: 30 }} />
          ) : devocionales.length === 0 ? (
            <View style={styles.vacioContenedor}>
              <Ionicons name="book-outline" size={42} color={colores.textoTenue} />
              <Text style={styles.textoVacio}>No encontramos devocionales para esta categoría.</Text>
            </View>
          ) : (
            devocionales.map((item) => {
              const infoTema = TEMAS_DEVOCIONALES.find((t) => t.id === item.tema) || TEMAS_DEVOCIONALES[0];
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.tarjetaDevocionalItem}
                  onPress={() =>
                    navigation.navigate('DevocionalDetalle', {
                      devocional: item,
                      temaId: temaActivo,
                    })
                  }
                >
                  <View style={styles.filaItemCabecera}>
                    <View style={[styles.insigniaPequena, { backgroundColor: infoTema.color + '20' }]}>
                      <Ionicons name={infoTema.icono} size={12} color={infoTema.color} style={{ marginRight: 4 }} />
                      <Text style={[styles.textoInsigniaPequena, { color: infoTema.color }]}>
                        {infoTema.etiqueta}
                      </Text>
                    </View>
                    <Text style={styles.referenciaItem}>{item.referencia_biblica}</Text>
                  </View>

                  <Text style={styles.tituloItem}>{item.titulo}</Text>
                  <Text style={styles.resumenItem} numberOfLines={2}>
                    {item.reflexion}
                  </Text>

                  <View style={styles.filaItemPie}>
                    <Text style={styles.enlaceLeer}>Leer reflexión</Text>
                    <Ionicons name="arrow-forward" size={14} color={colores.primario} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal para Creación con IA */}
      <Modal
        visible={modalIaVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !generandoIa && setModalIaVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <View style={styles.filaModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={20} color="#6366F1" />
                <Text style={styles.tituloModal}>Crear devocional personalizado</Text>
              </View>
              {!generandoIa && (
                <TouchableOpacity onPress={() => setModalIaVisible(false)}>
                  <Ionicons name="close" size={24} color={colores.textoTenue} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Selector de categoría para el modal */}
              <Text style={styles.etiquetaModalInput}>1. Selecciona la temática general:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {TEMAS_DEVOCIONALES.filter((t) => t.id !== 'todos').map((tema) => {
                  const activo = categoriaModal === tema.id;
                  return (
                    <TouchableOpacity
                      key={tema.id}
                      style={[
                        styles.chipModalCategoria,
                        activo && { backgroundColor: tema.color, borderColor: tema.color },
                      ]}
                      onPress={() => {
                        setCategoriaModal(tema.id);
                        setSubtemaSeleccionado('');
                      }}
                    >
                      <Ionicons
                        name={tema.icono}
                        size={14}
                        color={activo ? '#ffffff' : colores.textoSecundario}
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.textoChipModalCategoria,
                          activo && { color: '#ffffff', fontWeight: '700' },
                        ]}
                      >
                        {tema.etiqueta}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.etiquetaModalInput}>2. Elige un enfoque sugerido:</Text>
              <View style={styles.gridSubtemas}>
                {subtemasDisponibles.map((sub) => {
                  const seleccionado = subtemaSeleccionado === sub.titulo;
                  return (
                    <TouchableOpacity
                      key={sub.id}
                      style={[
                        styles.botonSubtema,
                        seleccionado && styles.botonSubtemaActivo,
                      ]}
                      onPress={() => setSubtemaSeleccionado(sub.titulo)}
                    >
                      <Text
                        style={[
                          styles.textoSubtema,
                          seleccionado && styles.textoSubtemaActivo,
                        ]}
                      >
                        {sub.titulo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.etiquetaModalInput, { marginTop: 14 }]}>
                3. Escribe tu situación o lo que estás batallando:
              </Text>
              <TextInput
                style={styles.inputSituacion}
                placeholder="Ej. Me siento abrumado con el trabajo, tengo ansiedad en las noches..."
                placeholderTextColor={colores.textoTenue}
                value={situacionPersonal}
                onChangeText={setSituacionPersonal}
                multiline
                numberOfLines={3}
                editable={!generandoIa}
              />

              {/* Ajuste opcional de clave de Gemini */}
              <TouchableOpacity
                style={styles.botonDesplegarClave}
                onPress={() => setMostrarConfigApiKey(!mostrarConfigApiKey)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="key-outline" size={14} color={colores.primario} />
                  <Text style={styles.textoDesplegarClave}>
                    {mostrarConfigApiKey ? 'Ocultar ajuste de clave Gemini' : '¿Tienes clave gratuita de Gemini AI? (Opcional)'}
                  </Text>
                </View>
                <Ionicons
                  name={mostrarConfigApiKey ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colores.textoTenue}
                />
              </TouchableOpacity>

              {mostrarConfigApiKey && (
                <View style={styles.cajaClaveApiKey}>
                  <Text style={styles.textoAyudaClave}>
                    Si deseas conectar tu clave de Google AI Studio (gratis), pégala aquí. Si la dejas en blanco, nuestro motor pastoral generará tu prédica personalizada de forma inmediata.
                  </Text>
                  <TextInput
                    style={styles.inputApiKey}
                    placeholder="Pega tu clave AIzaSy... aquí"
                    placeholderTextColor={colores.textoTenue}
                    value={apiKeyInput}
                    onChangeText={setApiKeyInput}
                    autoCapitalize="none"
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.filaModalBotones}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalIaVisible(false)}
                disabled={generandoIa}
              >
                <Text style={styles.textoBotonCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonGenerarModal}
                onPress={ejecutarGeneracionIA}
                disabled={generandoIa}
              >
                {generandoIa ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="flash" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.textoBotonGenerar}>Generar reflexión</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    encabezado: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 14,
    },
    titulo: {
      fontSize: 26,
      fontWeight: '800',
      color: colores.texto,
    },
    subtitulo: {
      fontSize: 13,
      color: colores.textoSecundario,
      marginTop: 2,
    },
    contenido: {
      flex: 1,
      paddingHorizontal: 20,
    },
    tarjetaAleatorioHero: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colores.primario + '40',
    },
    iconoAleatorioHero: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colores.primario,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tituloAleatorioHero: {
      fontSize: 16,
      fontWeight: '700',
      color: colores.texto,
      marginBottom: 2,
    },
    subtituloAleatorioHero: {
      fontSize: 12,
      color: colores.textoSecundario,
      lineHeight: 16,
    },
    tarjetaIaBanner: {
      backgroundColor: '#6366F112',
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#6366F135',
    },
    filaIa: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconoIa: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#6366F125',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tituloIa: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.texto,
      marginBottom: 2,
    },
    subtituloIa: {
      fontSize: 11,
      color: colores.textoSecundario,
      lineHeight: 15,
    },
    chipBotonIa: {
      backgroundColor: '#6366F1',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    textoChipIa: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '700',
    },
    seccionTitulo: {
      fontSize: 15,
      fontWeight: '700',
      color: colores.texto,
      marginBottom: 10,
    },
    filaChipsTemas: {
      gap: 8,
      paddingBottom: 16,
    },
    chipTema: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    textoChipTema: {
      fontSize: 13,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    textoChipTemaActivo: {
      color: '#ffffff',
    },
    seccionLista: {
      marginTop: 8,
    },
    filaCabeceraLista: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    conteoDevocionales: {
      fontSize: 12,
      color: colores.textoTenue,
    },
    tarjetaDevocionalItem: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    filaItemCabecera: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    insigniaPequena: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    textoInsigniaPequena: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    referenciaItem: {
      fontSize: 12,
      fontWeight: '700',
      color: colores.primario,
    },
    tituloItem: {
      fontSize: 16,
      fontWeight: '700',
      color: colores.texto,
      marginBottom: 6,
    },
    resumenItem: {
      fontSize: 13,
      lineHeight: 19,
      color: colores.textoSecundario,
      marginBottom: 10,
    },
    filaItemPie: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    enlaceLeer: {
      fontSize: 12,
      fontWeight: '700',
      color: colores.primario,
    },
    vacioContenedor: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      gap: 10,
    },
    textoVacio: {
      fontSize: 13,
      color: colores.textoTenue,
      textAlign: 'center',
    },
    fondoModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    cajaModal: {
      backgroundColor: colores.superficie,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 34,
    },
    filaModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    tituloModal: {
      fontSize: 17,
      fontWeight: '700',
      color: colores.texto,
    },
    etiquetaModalInput: {
      fontSize: 13,
      fontWeight: '600',
      color: colores.textoSecundario,
      marginBottom: 8,
    },
    gridSubtemas: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    botonSubtema: {
      backgroundColor: colores.fondo,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    botonSubtemaActivo: {
      backgroundColor: '#6366F1',
      borderColor: '#6366F1',
    },
    textoSubtema: {
      fontSize: 12,
      color: colores.texto,
      fontWeight: '500',
    },
    textoSubtemaActivo: {
      color: '#ffffff',
      fontWeight: '700',
    },
    inputSituacion: {
      backgroundColor: colores.fondo,
      borderRadius: 12,
      padding: 12,
      color: colores.texto,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colores.borde,
      textAlignVertical: 'top',
    },
    filaModalBotones: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    botonCancelarModal: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colores.fondo,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colores.borde,
    },
    textoBotonCancelar: {
      color: colores.textoSecundario,
      fontWeight: '600',
      fontSize: 14,
    },
    botonGenerarModal: {
      flex: 2,
      flexDirection: 'row',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: '#6366F1',
      justifyContent: 'center',
      alignItems: 'center',
    },
    textoBotonGenerar: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 14,
    },
    chipModalCategoria: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor: colores.fondo,
      borderWidth: 1,
      borderColor: colores.borde,
      marginRight: 8,
    },
    textoChipModalCategoria: {
      fontSize: 12,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    botonDesplegarClave: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 14,
      paddingVertical: 8,
    },
    textoDesplegarClave: {
      fontSize: 12,
      fontWeight: '600',
      color: colores.primario,
    },
    cajaClaveApiKey: {
      backgroundColor: colores.fondo,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      marginTop: 6,
    },
    textoAyudaClave: {
      fontSize: 11,
      lineHeight: 16,
      color: colores.textoTenue,
      marginBottom: 8,
    },
    inputApiKey: {
      backgroundColor: colores.superficie,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 12,
      color: colores.texto,
      borderWidth: 1,
      borderColor: colores.borde,
    },
  });
}
