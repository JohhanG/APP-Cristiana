import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VERSIONES, LIBROS_BIBLIA, obtenerCapitulo } from '../lib/bibliaApi';
import {
  COLORES_RESALTADO,
  cargarInteraccionesCapitulo,
  guardarInteraccionVersiculo,
} from '../lib/versiculosInteracciones';
import { useTheme } from '../theme/ThemeContext';
import { PIE_DESCARGA } from '../constants/enlacesApp';
 
const CLAVE_ULTIMA_LECTURA = 'bibliaUltimaLectura';
 
export default function BibliaScreen({ navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);
 
  const [version, setVersion] = useState('RV1960');
  const [libroNumero, setLibroNumero] = useState(1); // Génesis, por defecto
  const [capitulo, setCapitulo] = useState(1);
  const [versiculos, setVersiculos] = useState([]);
  const [interacciones, setInteracciones] = useState({}); // { [numeroVerso]: { favorito, color_resaltado } }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
 
  const [modalVersionVisible, setModalVersionVisible] = useState(false);
  const [modalLibroVisible, setModalLibroVisible] = useState(false);
  const [modalCapituloVisible, setModalCapituloVisible] = useState(false);
  const [versiculoSeleccionado, setVersiculoSeleccionado] = useState(null); // { numero, texto }
  const [guardandoInteraccion, setGuardandoInteraccion] = useState(false);
 
  const libroActual = LIBROS_BIBLIA.find((l) => l.numero === libroNumero);
  const versionActual = VERSIONES.find((v) => v.codigo === version);
 
  // Cargar la última lectura guardada al abrir la pantalla por primera vez
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_ULTIMA_LECTURA).then((guardado) => {
      if (guardado) {
        const datos = JSON.parse(guardado);
        setVersion(datos.version || 'RV1960');
        setLibroNumero(datos.libroNumero || 1);
        setCapitulo(datos.capitulo || 1);
      }
    });
  }, []);
 
  useEffect(() => {
    cargarCapitulo();
  }, [version, libroNumero, capitulo]);
 
  async function cargarCapitulo() {
    setCargando(true);
    setError(null);
    const resultado = await obtenerCapitulo(version, libroNumero, capitulo);
    if (resultado.exito) {
      setVersiculos(resultado.versiculos);
      AsyncStorage.setItem(CLAVE_ULTIMA_LECTURA, JSON.stringify({ version, libroNumero, capitulo }));
      const mapaInteracciones = await cargarInteraccionesCapitulo(libroNumero, capitulo, version);
      setInteracciones(mapaInteracciones);
    } else {
      setError(resultado.error);
      setVersiculos([]);
      setInteracciones({});
    }
    setCargando(false);
  }
 
  function irACapituloAnterior() {
    if (capitulo > 1) {
      setCapitulo(capitulo - 1);
      return;
    }
    const indiceLibro = LIBROS_BIBLIA.findIndex((l) => l.numero === libroNumero);
    if (indiceLibro > 0) {
      const libroAnterior = LIBROS_BIBLIA[indiceLibro - 1];
      setLibroNumero(libroAnterior.numero);
      setCapitulo(libroAnterior.capitulos);
    }
  }
 
  function irASiguienteCapitulo() {
    if (capitulo < libroActual.capitulos) {
      setCapitulo(capitulo + 1);
      return;
    }
    const indiceLibro = LIBROS_BIBLIA.findIndex((l) => l.numero === libroNumero);
    if (indiceLibro < LIBROS_BIBLIA.length - 1) {
      const libroSiguiente = LIBROS_BIBLIA[indiceLibro + 1];
      setLibroNumero(libroSiguiente.numero);
      setCapitulo(1);
    }
  }
 
  function elegirLibro(libro) {
    setLibroNumero(libro.numero);
    setCapitulo(1);
    setModalLibroVisible(false);
  }
 
  function tocarVersiculo(v) {
    setVersiculoSeleccionado(v);
  }
 
  function cerrarAccionesVersiculo() {
    setVersiculoSeleccionado(null);
  }
 
  function referenciaDe(v) {
    return `${libroActual?.nombre} ${capitulo}:${v?.numero}`;
  }
 
  async function compartirVersiculoSeleccionado() {
    if (!versiculoSeleccionado) return;
    try {
      await Share.share({
        message: `"${versiculoSeleccionado.texto}"\n— ${referenciaDe(versiculoSeleccionado)} (${version})${PIE_DESCARGA}`,
      });
    } catch (error) {
      // el usuario canceló el diálogo de compartir, no hay nada que hacer
    }
  }
 
  async function alternarFavoritoVersiculo() {
    if (!versiculoSeleccionado) return;
    const actual = interacciones[versiculoSeleccionado.numero] || {};
    const nuevoFavorito = !actual.favorito;
 
    setGuardandoInteraccion(true);
    const resultado = await guardarInteraccionVersiculo({
      libroNumero,
      capitulo,
      verso: versiculoSeleccionado.numero,
      version,
      texto: versiculoSeleccionado.texto,
      referencia: `${libroActual?.nombre} ${capitulo}:${versiculoSeleccionado.numero}`,
      favorito: nuevoFavorito,
      colorResaltado: actual.color_resaltado || null,
    });
    setGuardandoInteraccion(false);
 
    if (!resultado.exito) {
      Alert.alert('Error', resultado.error || 'No se pudo guardar');
      return;
    }
 
    setInteracciones((actualMapa) => ({
      ...actualMapa,
      [versiculoSeleccionado.numero]: { favorito: nuevoFavorito, color_resaltado: actual.color_resaltado || null },
    }));
  }
 
  async function elegirColorResaltado(colorNombre) {
    if (!versiculoSeleccionado) return;
    const actual = interacciones[versiculoSeleccionado.numero] || {};
    // Si tocas el mismo color que ya estaba, lo quita (toggle); si no, lo aplica
    const nuevoColor = actual.color_resaltado === colorNombre ? null : colorNombre;
 
    setGuardandoInteraccion(true);
    const resultado = await guardarInteraccionVersiculo({
      libroNumero,
      capitulo,
      verso: versiculoSeleccionado.numero,
      version,
      texto: versiculoSeleccionado.texto,
      referencia: `${libroActual?.nombre} ${capitulo}:${versiculoSeleccionado.numero}`,
      favorito: actual.favorito || false,
      colorResaltado: nuevoColor,
    });
    setGuardandoInteraccion(false);
 
    if (!resultado.exito) {
      Alert.alert('Error', resultado.error || 'No se pudo guardar');
      return;
    }
 
    setInteracciones((actualMapa) => ({
      ...actualMapa,
      [versiculoSeleccionado.numero]: { favorito: actual.favorito || false, color_resaltado: nuevoColor },
    }));
  }
 
  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.barraSuperior}>
        <TouchableOpacity style={styles.selector} onPress={() => setModalLibroVisible(true)}>
          <Text style={styles.textoSelector} numberOfLines={1}>
            {libroActual?.nombre} {capitulo}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colores.texto} />
        </TouchableOpacity>
 
        <TouchableOpacity style={styles.selectorVersion} onPress={() => setModalVersionVisible(true)}>
          <Text style={styles.textoSelectorVersion}>{version}</Text>
          <Ionicons name="chevron-down" size={14} color={colores.primario} />
        </TouchableOpacity>
      </View>
 
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={colores.primario} />
        </View>
      ) : error ? (
        <View style={styles.centrado}>
          <Ionicons name="cloud-offline-outline" size={40} color={colores.textoTenue} />
          <Text style={styles.textoError}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.contenidoScroll} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={styles.tituloCapitulo}>
            {libroActual?.nombre} {capitulo}
          </Text>
          <Text style={styles.subtituloVersion}>{versionActual?.nombre}</Text>
          <Text style={styles.pistaToque}>Toca un versículo para marcarlo o resaltarlo</Text>
 
          {versiculos.map((v) => {
            const interaccion = interacciones[v.numero];
            const colorFondo = interaccion?.color_resaltado ? COLORES_RESALTADO[interaccion.color_resaltado] : null;
 
            return (
              <TouchableOpacity key={v.numero} onPress={() => tocarVersiculo(v)} activeOpacity={0.6}>
                <Text
                  style={[
                    styles.parrafoVersiculo,
                    colorFondo && { backgroundColor: colorFondo, borderRadius: 4 },
                  ]}
                >
                  <Text style={styles.numeroVersiculo}>{v.numero} </Text>
                  {v.texto}
                  {interaccion?.favorito ? (
                    <Text style={{ color: colores.peligro }}> ♥</Text>
                  ) : null}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
 
      <View style={styles.barraNavegacion}>
        <TouchableOpacity style={styles.botonNav} onPress={irACapituloAnterior}>
          <Ionicons name="chevron-back" size={18} color={colores.primario} />
          <Text style={styles.textoBotonNav}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botonCapituloCentro}
          onPress={() => setModalCapituloVisible(true)}
        >
          <Text style={styles.textoBotonCapituloCentro}>Cap. {capitulo}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonNav} onPress={irASiguienteCapitulo}>
          <Text style={styles.textoBotonNav}>Siguiente</Text>
          <Ionicons name="chevron-forward" size={18} color={colores.primario} />
        </TouchableOpacity>
      </View>
 
      {/* Modal: acción sobre el versículo tocado (favorito / resaltar) */}
      <Modal
        visible={!!versiculoSeleccionado}
        transparent
        animationType="fade"
        onRequestClose={() => setVersiculoSeleccionado(null)}
      >
        <TouchableOpacity
          style={styles.fondoModal}
          activeOpacity={1}
          onPress={() => setVersiculoSeleccionado(null)}
        >
          <View style={styles.cajaModalCentro}>
            <Text style={styles.referenciaModalVersiculo}>
              {libroActual?.nombre} {capitulo}:{versiculoSeleccionado?.numero}
            </Text>
            <Text style={styles.textoModalVersiculo} numberOfLines={3}>
              {versiculoSeleccionado?.texto}
            </Text>
 
            <TouchableOpacity
              style={styles.filaAccionVersiculo}
              onPress={alternarFavoritoVersiculo}
              disabled={guardandoInteraccion}
            >
              <Ionicons
                name={interacciones[versiculoSeleccionado?.numero]?.favorito ? 'heart' : 'heart-outline'}
                size={20}
                color={colores.peligro}
              />
              <Text style={styles.textoAccionVersiculo}>
                {interacciones[versiculoSeleccionado?.numero]?.favorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
              </Text>
            </TouchableOpacity>
 
            <Text style={styles.etiquetaColores}>Resaltar con color</Text>
            <View style={styles.filaColores}>
              {Object.entries(COLORES_RESALTADO).map(([nombre, hex]) => {
                const activo = interacciones[versiculoSeleccionado?.numero]?.color_resaltado === nombre;
                return (
                  <TouchableOpacity
                    key={nombre}
                    style={[styles.circuloColor, { backgroundColor: hex }, activo && styles.circuloColorActivo]}
                    onPress={() => elegirColorResaltado(nombre)}
                    disabled={guardandoInteraccion}
                  >
                    {activo && <Ionicons name="checkmark" size={16} color="#333" />}
                  </TouchableOpacity>
                );
              })}
            </View>
 
            {guardandoInteraccion && <ActivityIndicator color={colores.primario} style={{ marginTop: 10 }} />}
 
            <View style={styles.separadorModal} />
 
            <TouchableOpacity
              style={styles.filaAccionModal}
              onPress={() => {
                const referencia = referenciaDe(versiculoSeleccionado);
                cerrarAccionesVersiculo();
                navigation.navigate('NotaDetalle', {
                  notaId: null,
                  referenciaBiblica: referencia,
                });
              }}
            >
              <Ionicons name="create-outline" size={20} color={colores.texto} />
              <Text style={styles.textoAccionModal}>Crear apunte sobre este versículo</Text>
            </TouchableOpacity>
 
            <TouchableOpacity style={styles.filaAccionModal} onPress={compartirVersiculoSeleccionado}>
              <Ionicons name="share-social-outline" size={20} color={colores.texto} />
              <Text style={styles.textoAccionModal}>Compartir (WhatsApp y más)</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
 
      {/* Modal: elegir versión */}
      <Modal visible={modalVersionVisible} transparent animationType="slide" onRequestClose={() => setModalVersionVisible(false)}>
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalVersionVisible(false)}>
          <View style={styles.cajaModalInferior}>
            <Text style={styles.tituloModal}>Elige una versión</Text>
            <FlatList
              data={VERSIONES}
              keyExtractor={(item) => item.codigo}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.filaOpcion}
                  onPress={() => {
                    setVersion(item.codigo);
                    setModalVersionVisible(false);
                  }}
                >
                  <View>
                    <Text style={styles.textoOpcion}>{item.nombre}</Text>
                    <Text style={styles.textoOpcionSecundario}>{item.codigo} · {item.idioma}</Text>
                  </View>
                  {item.codigo === version && (
                    <Ionicons name="checkmark-circle" size={20} color={colores.primario} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
 
      {/* Modal: elegir libro */}
      <Modal visible={modalLibroVisible} transparent animationType="slide" onRequestClose={() => setModalLibroVisible(false)}>
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalLibroVisible(false)}>
          <View style={styles.cajaModalInferior}>
            <Text style={styles.tituloModal}>Elige un libro</Text>
            <FlatList
              data={LIBROS_BIBLIA}
              keyExtractor={(item) => String(item.numero)}
              ListHeaderComponent={<Text style={styles.encabezadoTestamento}>Antiguo Testamento</Text>}
              renderItem={({ item, index }) => (
                <>
                  {item.testamento === 'NT' && LIBROS_BIBLIA[index - 1]?.testamento === 'AT' && (
                    <Text style={styles.encabezadoTestamento}>Nuevo Testamento</Text>
                  )}
                  <TouchableOpacity style={styles.filaOpcion} onPress={() => elegirLibro(item)}>
                    <Text style={styles.textoOpcion}>{item.nombre}</Text>
                    {item.numero === libroNumero && (
                      <Ionicons name="checkmark-circle" size={20} color={colores.primario} />
                    )}
                  </TouchableOpacity>
                </>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
 
      {/* Modal: elegir capítulo */}
      <Modal visible={modalCapituloVisible} transparent animationType="slide" onRequestClose={() => setModalCapituloVisible(false)}>
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalCapituloVisible(false)}>
          <View style={styles.cajaModalInferior}>
            <Text style={styles.tituloModal}>{libroActual?.nombre} — elige un capítulo</Text>
            <FlatList
              data={Array.from({ length: libroActual?.capitulos || 1 }, (_, i) => i + 1)}
              keyExtractor={(item) => String(item)}
              numColumns={5}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.celdaCapitulo, item === capitulo && styles.celdaCapituloActiva]}
                  onPress={() => {
                    setCapitulo(item);
                    setModalCapituloVisible(false);
                  }}
                >
                  <Text style={[styles.textoCeldaCapitulo, item === capitulo && styles.textoCeldaCapituloActiva]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
 
function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    textoError: { color: colores.textoTenue, marginTop: 10, textAlign: 'center' },
    barraSuperior: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
      backgroundColor: colores.superficie,
      borderBottomWidth: 0.5,
      borderBottomColor: colores.borde,
    },
    selector: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    textoSelector: { fontSize: 18, fontWeight: '600', color: colores.texto },
    selectorVersion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colores.superficieAlterna,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    textoSelectorVersion: { fontSize: 12, fontWeight: '700', color: colores.primario },
    contenidoScroll: { flex: 1 },
    tituloCapitulo: { fontSize: 24, fontWeight: '700', color: colores.texto, marginBottom: 2 },
    subtituloVersion: { fontSize: 13, color: colores.textoTenue },
    pistaToque: { fontSize: 11, color: colores.textoTenue, fontStyle: 'italic', marginBottom: 16, marginTop: 4 },
    parrafoVersiculo: { fontSize: 16, lineHeight: 27, color: colores.texto, marginBottom: 10 },
    numeroVersiculo: { fontSize: 12, fontWeight: '700', color: colores.primario },
    barraNavegacion: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colores.superficie,
      borderTopWidth: 0.5,
      borderTopColor: colores.borde,
    },
    botonNav: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
    textoBotonNav: { color: colores.primario, fontWeight: '600', fontSize: 13 },
    botonCapituloCentro: {
      backgroundColor: colores.superficieAlterna,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    textoBotonCapituloCentro: { color: colores.texto, fontWeight: '600', fontSize: 13 },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    cajaModalInferior: {
      backgroundColor: colores.superficie,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      padding: 16,
      maxHeight: '75%',
    },
    cajaModalCentro: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      padding: 20,
      margin: 30,
    },
    referenciaModalVersiculo: { fontSize: 15, fontWeight: '700', color: colores.primario, marginBottom: 8 },
    textoModalVersiculo: { fontSize: 14, color: colores.textoSecundario, fontStyle: 'italic', marginBottom: 18, lineHeight: 20 },
    filaAccionVersiculo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
    textoAccionVersiculo: { fontSize: 15, color: colores.texto, fontWeight: '600' },
    etiquetaColores: { fontSize: 12, color: colores.textoTenue, marginTop: 12, marginBottom: 8, textTransform: 'uppercase' },
    filaColores: { flexDirection: 'row', gap: 14 },
    circuloColor: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circuloColorActivo: { borderWidth: 2, borderColor: colores.texto },
    separadorModal: { height: 1, backgroundColor: colores.borde, alignSelf: 'stretch', marginVertical: 16 },
    filaAccionModal: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      alignSelf: 'stretch',
      paddingVertical: 10,
    },
    textoAccionModal: { fontSize: 14, color: colores.texto, fontWeight: '600' },
    tituloModal: { fontSize: 16, fontWeight: '700', color: colores.texto, marginBottom: 10, textAlign: 'center' },
    encabezadoTestamento: {
      fontSize: 12,
      fontWeight: '700',
      color: colores.primario,
      textTransform: 'uppercase',
      marginTop: 12,
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    filaOpcion: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: colores.borde,
    },
    textoOpcion: { fontSize: 15, color: colores.texto },
    textoOpcionSecundario: { fontSize: 12, color: colores.textoTenue, marginTop: 2 },
    celdaCapitulo: {
      flex: 1,
      margin: 4,
      aspectRatio: 1,
      borderRadius: 8,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
    },
    celdaCapituloActiva: { backgroundColor: colores.primario },
    textoCeldaCapitulo: { color: colores.texto, fontWeight: '600' },
    textoCeldaCapituloActiva: { color: colores.primarioTexto },
  });
}