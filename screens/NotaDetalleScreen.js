import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import { buscarVersiculo } from '../lib/bibliaApi';
import { PIE_DESCARGA } from '../constants/enlacesApp';

const CATEGORIAS = [
  { valor: 'predica', etiqueta: 'Prédica', icono: 'megaphone-outline' },
  { valor: 'general', etiqueta: 'General', icono: 'document-text-outline' },
  { valor: 'estudio', etiqueta: 'Estudio', icono: 'book-outline' },
  { valor: 'oracion', etiqueta: 'Oración', icono: 'hand-left-outline' },
];

const PLANTILLA_SERMON = `🎤 PREDICADOR / PASTOR: 
🏷️ SERIE / TEMA: 
📖 PASAJE CENTRAL: 

💡 IDEA PRINCIPAL DEL MENSAJE:


📝 PUNTOS CLAVE DEL SERMÓN:
1. 
2. 
3. 

🌱 APLICACIÓN PRÁCTICA PARA MI SEMANA:
• 

🙏 MI ORACIÓN DE RESPUESTA:
• 
`;

export default function NotaDetalleScreen({ route, navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const { notaId, referenciaBiblica, categoriaInicial } = route.params || {};
  const esNueva = !notaId;

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [categoria, setCategoria] = useState(categoriaInicial || 'general');
  const [referencia, setReferencia] = useState(referenciaBiblica || '');
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Estados del asistente bíblico para prédicas
  const [modalVersiculoVisible, setModalVersiculoVisible] = useState(false);
  const [referenciaABuscar, setReferenciaABuscar] = useState('');
  const [versiculoResultado, setVersiculoResultado] = useState(null);
  const [buscandoVersiculo, setBuscandoVersiculo] = useState(false);
  const [citaDetectada, setCitaDetectada] = useState(null);
  const timeoutDeteccionRef = useRef(null);

  useEffect(() => {
    if (esNueva) {
      if (categoriaInicial === 'predica' && !contenido) {
        setContenido(PLANTILLA_SERMON);
        const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        setTitulo(`Prédica - ${hoy.charAt(0).toUpperCase() + hoy.slice(1)}`);
      }
      return;
    }

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

  // Detector inteligente de citas bíblicas escritas en el texto
  function manejarCambioTextoContenido(nuevoTexto) {
    setContenido(nuevoTexto);

    if (timeoutDeteccionRef.current) clearTimeout(timeoutDeteccionRef.current);
    timeoutDeteccionRef.current = setTimeout(() => {
      // Busca patrones bíblicos como: Juan 3:16, 1 Corintios 13:4-8, Salmos 23:1
      const regexCita = /\b(?:[1-3]\s*)?[A-Za-zÁÉÍÓÚáéíóúñÑ]{3,15}\s+\d+:\d+(?:-\d+)?\b/g;
      const coincidencias = nuevoTexto.match(regexCita);
      if (coincidencias && coincidencias.length > 0) {
        const ultimaCita = coincidencias[coincidencias.length - 1];
        // Solo sugerir si el texto del versículo no está ya pegado justo después
        if (!nuevoTexto.includes(`— ${ultimaCita}`)) {
          setCitaDetectada(ultimaCita);
          return;
        }
      }
      setCitaDetectada(null);
    }, 700);
  }

  async function insertarCitaDetectada() {
    if (!citaDetectada) return;
    setBuscandoVersiculo(true);
    const res = await buscarVersiculo(citaDetectada);
    setBuscandoVersiculo(false);

    if (res.exito) {
      const bloqueVersiculo = `\n\n«${res.texto}»\n— ${citaDetectada} (RV1960)\n\n`;
      setContenido((prev) => prev + bloqueVersiculo);
      setCitaDetectada(null);
      Alert.alert('Versículo insertado 📖', `Se agregó el pasaje de ${citaDetectada} a tus notas.`);
    } else {
      Alert.alert('Aviso bíblico', res.error || 'No pudimos encontrar esa referencia.');
    }
  }

  async function buscarVersiculoManual() {
    if (!referenciaABuscar.trim()) return;
    setBuscandoVersiculo(true);
    const res = await buscarVersiculo(referenciaABuscar.trim());
    setBuscandoVersiculo(false);

    if (res.exito) {
      setVersiculoResultado({
        cita: referenciaABuscar.trim(),
        texto: res.texto,
      });
    } else {
      Alert.alert('Referencia no encontrada', res.error || 'Verifica el libro y capítulo (ej. Romanos 8:28).');
    }
  }

  function insertarVersiculoManualEnNota() {
    if (!versiculoResultado) return;
    const bloque = `\n\n«${versiculoResultado.texto}»\n— ${versiculoResultado.cita} (RV1960)\n\n`;
    setContenido((prev) => prev + bloque);
    setModalVersiculoVisible(false);
    setReferenciaABuscar('');
    setVersiculoResultado(null);
    Alert.alert('Versículo añadido ✨', `Se insertó ${versiculoResultado.cita} en tus apuntes.`);
  }

  function aplicarPlantillaSermon() {
    if (contenido.trim().length > 0) {
      Alert.alert(
        'Plantilla de prédica',
        '¿Deseas reemplazar el contenido actual con la estructura de sermón dominical?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Reemplazar',
            onPress: () => {
              setContenido(PLANTILLA_SERMON);
              setCategoria('predica');
            },
          },
          {
            text: 'Añadir al final',
            onPress: () => {
              setContenido((prev) => prev + '\n\n' + PLANTILLA_SERMON);
              setCategoria('predica');
            },
          },
        ]
      );
    } else {
      setContenido(PLANTILLA_SERMON);
      setCategoria('predica');
    }
  }

  async function compartirApunte() {
    if (!titulo.trim() && !contenido.trim()) return;
    try {
      const mensaje = `📝 *${titulo || 'Apuntes de Prédica'}*\n${referencia ? `📖 ${referencia}\n` : ''}\n${contenido}${PIE_DESCARGA}`;
      await Share.share({ message: mensaje });
    } catch (e) {}
  }

  async function guardarNota() {
    if (!titulo.trim()) {
      Alert.alert('Falta el título', 'Ponle un título a tu apunte de prédica');
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

  const esModoPredica = categoria === 'predica';

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {/* Banner especial para prédicas dominicales */}
        {esModoPredica && (
          <View style={styles.bannerPredica}>
            <View style={styles.bannerPredicaIcono}>
              <Ionicons name="mic" size={20} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerPredicaTitulo}>Cuaderno de Prédica Dominical</Text>
              <Text style={styles.bannerPredicaSubtitulo}>
                Anota el sermón de tu pastor. Puedes insertar versículos bíblicos automáticamente sin salir de tus notas.
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.etiqueta}>Título del apunte</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder={esModoPredica ? "Ej. Domingo: La Fe que Mueve Montañas" : "Ej. Lo que aprendí hoy"}
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

        <Text style={styles.etiqueta}>Pasaje o cita bíblica principal (opcional)</Text>
        <View style={styles.filaInputReferencia}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={referencia}
            onChangeText={setReferencia}
            placeholder="Ej. Hebreos 11:1-6"
            placeholderTextColor={colores.textoTenue}
          />
          {referencia.trim().length > 0 && (
            <TouchableOpacity
              style={styles.botonPegarReferencia}
              onPress={async () => {
                const res = await buscarVersiculo(referencia.trim());
                if (res.exito) {
                  const bloque = `\n\n«${res.texto}»\n— ${referencia.trim()} (RV1960)\n\n`;
                  setContenido((prev) => prev + bloque);
                  Alert.alert('Versículo insertado 📖', `Pasaje de ${referencia.trim()} añadido.`);
                } else {
                  Alert.alert('Aviso', res.error || 'No se pudo encontrar la cita');
                }
              }}
            >
              <Ionicons name="add-circle" size={18} color={colores.primario} />
              <Text style={styles.textoBotonPegar}>Insertar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de herramientas para el sermón */}
        <View style={styles.barraHerramientasPredica}>
          <TouchableOpacity style={styles.botonHerramienta} onPress={() => setModalVersiculoVisible(true)}>
            <Ionicons name="book-outline" size={16} color={colores.primario} />
            <Text style={styles.textoBotonHerramienta}>Insertar versículo (RV1960)</Text>
          </TouchableOpacity>

          {esModoPredica && (
            <TouchableOpacity style={styles.botonHerramienta} onPress={aplicarPlantillaSermon}>
              <Ionicons name="list-outline" size={16} color="#F59E0B" />
              <Text style={[styles.textoBotonHerramienta, { color: '#F59E0B' }]}>Esquema de sermón</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.botonHerramienta} onPress={compartirApunte}>
            <Ionicons name="share-social-outline" size={16} color={colores.textoSecundario} />
            <Text style={[styles.textoBotonHerramienta, { color: colores.textoSecundario }]}>Compartir</Text>
          </TouchableOpacity>
        </View>

        {/* Notificación flotante de cita detectada */}
        {citaDetectada && (
          <TouchableOpacity style={styles.chipCitaDetectada} onPress={insertarCitaDetectada} activeOpacity={0.85}>
            <Ionicons name="sparkles" size={16} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.textoCitaDetectadaTitulo}>¿Insertar versículo detectado?</Text>
              <Text style={styles.textoCitaDetectadaSub}>Toca aquí para traer el texto de «{citaDetectada}»</Text>
            </View>
            {buscandoVersiculo ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <View style={styles.badgeInsertarCita}>
                <Text style={styles.textoBadgeInsertarCita}>Insertar</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.etiqueta}>Tus apuntes y notas del sermón</Text>
        <TextInput
          style={[styles.input, styles.inputContenido]}
          value={contenido}
          onChangeText={manejarCambioTextoContenido}
          placeholder="Escribe aquí los puntos principales del sermón, versículos mencionados y aplicaciones..."
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

      {/* Modal: Insertar versículo bíblico RV1960 */}
      <Modal
        visible={modalVersiculoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVersiculoVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <View style={styles.cabeceraModal}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="book" size={20} color={colores.primario} />
                <Text style={styles.tituloModal}>Insertar Versículo Bíblico</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVersiculoVisible(false)}>
                <Ionicons name="close" size={22} color={colores.textoTenue} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtituloModal}>
              Escribe la cita que mencionó el predicador (funciona 100% offline con la RV1960 integrada):
            </Text>

            <View style={styles.filaBuscadorModal}>
              <TextInput
                style={styles.inputBuscadorModal}
                value={referenciaABuscar}
                onChangeText={setReferenciaABuscar}
                placeholder="Ej. Romanos 8:28 o Juan 14:6"
                placeholderTextColor={colores.textoTenue}
                autoCapitalize="sentences"
                onSubmitEditing={buscarVersiculoManual}
              />
              <TouchableOpacity style={styles.botonBuscarModal} onPress={buscarVersiculoManual} disabled={buscandoVersiculo}>
                {buscandoVersiculo ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="search" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {versiculoResultado && (
              <View style={styles.cajaResultadoModal}>
                <Text style={styles.tituloResultadoModal}>« {versiculoResultado.cita} »</Text>
                <ScrollView style={{ maxHeight: 160, marginVertical: 8 }}>
                  <Text style={styles.textoResultadoModal}>{versiculoResultado.texto}</Text>
                </ScrollView>
                <TouchableOpacity style={styles.botonConfirmarInsertar} onPress={insertarVersiculoManualEnNota}>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.textoConfirmarInsertar}>Pegar en mis notas</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sugerenciasModal}>
              <Text style={styles.textoSugerencias}>Citas populares:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {['Juan 3:16', 'Romanos 8:28', 'Filipenses 4:13', 'Salmos 23:1', 'Jeremías 29:11', 'Josué 1:9'].map((sug) => (
                  <TouchableOpacity
                    key={sug}
                    style={styles.chipSugerencia}
                    onPress={() => {
                      setReferenciaABuscar(sug);
                      buscarVersiculo(sug).then((res) => {
                        if (res.exito) setVersiculoResultado({ cita: sug, texto: res.texto });
                      });
                    }}
                  >
                    <Text style={styles.textoChipSugerencia}>{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bannerPredica: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F59E0B15',
      borderWidth: 1,
      borderColor: '#F59E0B40',
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
      gap: 12,
    },
    bannerPredicaIcono: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F59E0B25',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerPredicaTitulo: {
      fontSize: 15,
      fontWeight: '700',
      color: '#F59E0B',
      marginBottom: 2,
    },
    bannerPredicaSubtitulo: {
      fontSize: 12,
      color: colores.textoSecundario,
      lineHeight: 17,
    },
    etiqueta: { fontSize: 13, color: colores.textoSecundario, marginBottom: 6, marginTop: 14, fontWeight: '600' },
    input: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colores.texto,
      backgroundColor: colores.superficie,
    },
    filaInputReferencia: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    botonPegarReferencia: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    textoBotonPegar: {
      fontSize: 13,
      fontWeight: '600',
      color: colores.primario,
    },
    barraHerramientasPredica: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
      marginBottom: 6,
    },
    botonHerramienta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    textoBotonHerramienta: {
      fontSize: 12,
      fontWeight: '600',
      color: colores.primario,
    },
    chipCitaDetectada: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B98115',
      borderWidth: 1,
      borderColor: '#10B98150',
      borderRadius: 12,
      padding: 12,
      marginTop: 10,
      marginBottom: 4,
      gap: 10,
    },
    textoCitaDetectadaTitulo: {
      fontSize: 13,
      fontWeight: '700',
      color: '#10B981',
    },
    textoCitaDetectadaSub: {
      fontSize: 11,
      color: colores.textoSecundario,
      marginTop: 2,
    },
    badgeInsertarCita: {
      backgroundColor: '#10B981',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    textoBadgeInsertarCita: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    inputContenido: { height: 260, fontSize: 15, lineHeight: 24 },
    filaCategorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipCategoria: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    chipCategoriaActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
    textoChipCategoria: { fontSize: 13, color: colores.textoSecundario, fontWeight: '600' },
    textoChipCategoriaActivo: { color: colores.primarioTexto },
    botonGuardar: {
      backgroundColor: colores.primario,
      borderRadius: 10,
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

    // Estilos del Modal
    fondoModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    tarjetaModal: {
      backgroundColor: colores.superficie,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 36,
      maxHeight: '85%',
    },
    cabeceraModal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    tituloModal: {
      fontSize: 17,
      fontWeight: '700',
      color: colores.texto,
    },
    subtituloModal: {
      fontSize: 13,
      color: colores.textoSecundario,
      marginBottom: 14,
      lineHeight: 18,
    },
    filaBuscadorModal: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    inputBuscadorModal: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colores.texto,
      backgroundColor: colores.fondo,
    },
    botonBuscarModal: {
      backgroundColor: colores.primario,
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cajaResultadoModal: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colores.borde,
      marginBottom: 14,
    },
    tituloResultadoModal: {
      fontSize: 14,
      fontWeight: '700',
      color: colores.primario,
    },
    textoResultadoModal: {
      fontSize: 14,
      fontStyle: 'italic',
      color: colores.texto,
      lineHeight: 22,
    },
    botonConfirmarInsertar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#10B981',
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    textoConfirmarInsertar: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },
    sugerenciasModal: {
      marginTop: 4,
    },
    textoSugerencias: {
      fontSize: 12,
      color: colores.textoTenue,
      fontWeight: '600',
    },
    chipSugerencia: {
      backgroundColor: colores.fondo,
      borderWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
    },
    textoChipSugerencia: {
      fontSize: 11,
      color: colores.primario,
      fontWeight: '600',
    },
  });
}
