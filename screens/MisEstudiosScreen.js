import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Image,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import {
  obtenerMisEstudiosSuscritos,
  desuscribirseDeEstudio,
  ESTUDIOS_SEMILLA,
} from '../lib/estudiosService';

const ETIQUETAS_ESTADO = {
  borrador: { texto: 'Borrador', icono: 'document-outline' },
  pendiente: { texto: 'En revisión', icono: 'time-outline' },
  publicado: { texto: 'Publicado', icono: 'checkmark-circle' },
  rechazado: { texto: 'Necesita ajustes', icono: 'alert-circle' },
};

export default function MisEstudiosScreen({ route, navigation }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  // Pestaña activa: 'suscritos' (estudios que llevo / historial) o 'creados' (mis estudios creados)
  const pestanaInicial = route?.params?.pestanaInicial || 'suscritos';
  const [pestanaActiva, setPestanaActiva] = useState(pestanaInicial);

  // Subfiltro para suscritos: 'todos', 'en_curso', 'completados'
  const [filtroSuscritos, setFiltroSuscritos] = useState('todos');

  // Estados de datos
  const [estudiosCreados, setEstudiosCreados] = useState([]);
  const [estudiosSuscritos, setEstudiosSuscritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Modal para solicitar eliminación de estudio creado
  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [estudioAEliminar, setEstudioAEliminar] = useState(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');

  async function cargarTodo() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 1. Cargar estudios creados por el usuario
      let creados = [];
      if (user) {
        const { data, error } = await supabase
          .from('estudios')
          .select(
            'id, titulo, tema, num_dias, descripcion, estado, motivo_rechazo, solicitud_eliminacion, creado_en, portada_url'
          )
          .eq('autor_id', user.id)
          .order('creado_en', { ascending: false });

        if (!error && data) creados = data;
      }
      setEstudiosCreados(creados);

      // 2. Cargar estudios suscritos e historial (progreso de usuario + locales)
      const suscritos = await obtenerMisEstudiosSuscritos();
      setEstudiosSuscritos(suscritos || []);
    } catch (e) {
      console.log('Error cargando estudios en MisEstudiosScreen:', e?.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  useEffect(() => {
    cargarTodo();
    const unsubscribe = navigation.addListener('focus', cargarTodo);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarTodo();
  }, []);

  // --- COMPARTIR / RECOMENDAR ESTUDIO ---
  async function recomendarEstudio(estudio, esCreador = false) {
    try {
      const titulo = estudio?.titulo || 'Estudio Bíblico';
      const dias = estudio?.num_dias ? `${estudio.num_dias} días` : 'varios días';
      const tema = estudio?.tema ? ` · ${estudio.tema}` : '';

      let mensaje = '';
      if (esCreador) {
        mensaje = `📖 ¡Hola! Quiero compartirte un estudio bíblico que preparé: "${titulo}" (${dias}${tema}).\n\n"${estudio?.descripcion || 'Un tiempo especial para profundizar en la Palabra de Dios y fortalecer tu fe.'}"\n\n¡Espero de corazón que edifique mucho tu vida y la de tu familia! 🙏✨`;
      } else {
        mensaje = `🕊️ ¡Hola! Te recomiendo este hermoso estudio bíblico que estoy realizando: "${titulo}" (${dias}${tema}).\n\n"${estudio?.descripcion || 'Un plan devocional para meditar en la Palabra y encontrar paz en Dios.'}"\n\n¡Ha sido de gran bendición para mí y te animo a llevarlo también! Puedes hacerlo desde la app. 🙏✨`;
      }

      await Share.share({
        title: `Estudio Bíblico: ${titulo}`,
        message: mensaje,
      });
    } catch (error) {
      if (
        error?.message &&
        !error.message.includes('dismissed') &&
        !error.message.includes('User did not share')
      ) {
        Alert.alert('Compartir', 'No se pudo abrir el menú para compartir.');
      }
    }
  }

  // --- ACCIONES PARA ESTUDIOS CREADOS ---
  function tocarEstudioCreado(item) {
    if (item.estado === 'rechazado' || item.estado === 'borrador') {
      navigation.navigate('CrearEstudio', { estudioId: item.id });
    } else {
      navigation.navigate('EstudioDetalle', { estudioId: item.id });
    }
  }

  function confirmarEliminarDirecto(item) {
    Alert.alert(
      'Eliminar estudio',
      `¿Seguro que quieres eliminar "${item.titulo}"? Esto no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarDirecto(item.id) },
      ]
    );
  }

  async function eliminarDirecto(estudioId) {
    setEstudiosCreados((actual) => actual.filter((e) => e.id !== estudioId));
    const { error } = await supabase.from('estudios').delete().eq('id', estudioId);
    if (error) {
      Alert.alert('Error', error.message);
      cargarTodo();
    }
  }

  function abrirModalSolicitud(item) {
    setEstudioAEliminar(item);
    setMotivoEliminacion('');
    setModalEliminarVisible(true);
  }

  async function enviarSolicitudEliminacion() {
    if (!motivoEliminacion.trim()) {
      Alert.alert(
        'Falta el motivo',
        'Escribe brevemente por qué quieres eliminar este estudio publicado'
      );
      return;
    }

    const estudioId = estudioAEliminar.id;
    setModalEliminarVisible(false);

    const { error } = await supabase
      .from('estudios')
      .update({ solicitud_eliminacion: true, motivo_eliminacion: motivoEliminacion.trim() })
      .eq('id', estudioId);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Solicitud enviada', 'Un administrador revisará tu solicitud de eliminación.');
    cargarTodo();
  }

  function tocarBotonEliminarCreado(item) {
    if (item.estado === 'publicado') {
      abrirModalSolicitud(item);
    } else {
      confirmarEliminarDirecto(item);
    }
  }

  // --- ACCIONES PARA ESTUDIOS SUSCRITOS ---
  function confirmarDesuscripcion(estudioId, titulo) {
    Alert.alert(
      'Desuscribirse del estudio',
      `¿Deseas dejar de llevar "${titulo}"? Tu progreso quedará pausado y podrás retomarlo cuando gustes.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desuscribirme',
          style: 'destructive',
          onPress: async () => {
            await desuscribirseDeEstudio(estudioId);
            cargarTodo();
          },
        },
      ]
    );
  }

  // Filtrado de suscripciones
  const listaSuscritosFiltrada = estudiosSuscritos.filter((item) => {
    if (filtroSuscritos === 'en_curso') return !item.completado;
    if (filtroSuscritos === 'completados') return !!item.completado;
    return true;
  });

  const conteoEnCurso = estudiosSuscritos.filter((s) => !s.completado).length;
  const conteoCompletados = estudiosSuscritos.filter((s) => !!s.completado).length;

  if (cargando) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={[styles.textoCargando, { color: colores.textoSecundario }]}>
          Cargando tus estudios...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {/* SELECTOR DE PESTAÑAS PRINCIPALES */}
      <View style={styles.contenedorSelectorPestanas}>
        <TouchableOpacity
          style={[
            styles.botonPestana,
            pestanaActiva === 'suscritos' && styles.botonPestanaActiva,
          ]}
          onPress={() => setPestanaActiva('suscritos')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={pestanaActiva === 'suscritos' ? 'book' : 'book-outline'}
            size={18}
            color={pestanaActiva === 'suscritos' ? colores.primarioTexto : colores.textoSecundario}
          />
          <Text
            style={[
              styles.textoPestana,
              pestanaActiva === 'suscritos' && styles.textoPestanaActiva,
            ]}
          >
            Mis suscripciones
          </Text>
          <View
            style={[
              styles.badgePestana,
              pestanaActiva === 'suscritos'
                ? styles.badgePestanaActiva
                : styles.badgePestanaInactiva,
            ]}
          >
            <Text
              style={[
                styles.textoBadgePestana,
                pestanaActiva === 'suscritos'
                  ? styles.textoBadgePestanaActiva
                  : styles.textoBadgePestanaInactiva,
              ]}
            >
              {estudiosSuscritos.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonPestana,
            pestanaActiva === 'creados' && styles.botonPestanaActiva,
          ]}
          onPress={() => setPestanaActiva('creados')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={pestanaActiva === 'creados' ? 'create' : 'create-outline'}
            size={18}
            color={pestanaActiva === 'creados' ? colores.primarioTexto : colores.textoSecundario}
          />
          <Text
            style={[
              styles.textoPestana,
              pestanaActiva === 'creados' && styles.textoPestanaActiva,
            ]}
          >
            Creados por mí
          </Text>
          <View
            style={[
              styles.badgePestana,
              pestanaActiva === 'creados'
                ? styles.badgePestanaActiva
                : styles.badgePestanaInactiva,
            ]}
          >
            <Text
              style={[
                styles.textoBadgePestana,
                pestanaActiva === 'creados'
                  ? styles.textoBadgePestanaActiva
                  : styles.textoBadgePestanaInactiva,
              ]}
            >
              {estudiosCreados.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ======================================================= */}
      {/* VISTA 1: MIS ESTUDIOS SUSCRITOS E HISTORIAL             */}
      {/* ======================================================= */}
      {pestanaActiva === 'suscritos' && (
        <View style={{ flex: 1 }}>
          {/* SUB-FILTROS: TODOS / EN CURSO / COMPLETADOS */}
          <View style={styles.filaFiltros}>
            <TouchableOpacity
              style={[
                styles.chipFiltro,
                filtroSuscritos === 'todos' && styles.chipFiltroActivo,
              ]}
              onPress={() => setFiltroSuscritos('todos')}
            >
              <Text
                style={[
                  styles.textoChipFiltro,
                  filtroSuscritos === 'todos' && styles.textoChipFiltroActivo,
                ]}
              >
                Todos ({estudiosSuscritos.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chipFiltro,
                filtroSuscritos === 'en_curso' && styles.chipFiltroActivo,
              ]}
              onPress={() => setFiltroSuscritos('en_curso')}
            >
              <Text
                style={[
                  styles.textoChipFiltro,
                  filtroSuscritos === 'en_curso' && styles.textoChipFiltroActivo,
                ]}
              >
                📖 En curso ({conteoEnCurso})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chipFiltro,
                filtroSuscritos === 'completados' && styles.chipFiltroActivo,
              ]}
              onPress={() => setFiltroSuscritos('completados')}
            >
              <Text
                style={[
                  styles.textoChipFiltro,
                  filtroSuscritos === 'completados' && styles.textoChipFiltroActivo,
                ]}
              >
                🏆 Historial ({conteoCompletados})
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={listaSuscritosFiltrada}
            keyExtractor={(item) => item.estudio_id || item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={onRefresh}
                tintColor={colores.primario}
              />
            }
            ListEmptyComponent={
              <View style={styles.vacioContenedor}>
                <View style={styles.circuloIconoVacio}>
                  <Ionicons name="book-outline" size={38} color={colores.primario} />
                </View>
                <Text style={styles.vacioTitulo}>
                  {filtroSuscritos === 'completados'
                    ? 'Aún no has completado ningún estudio'
                    : filtroSuscritos === 'en_curso'
                    ? 'No tienes estudios en curso actualmente'
                    : 'Aún no te has suscrito a ningún estudio'}
                </Text>
                <Text style={styles.vacioSubtitulo}>
                  Explora los estudios bíblicos disponibles para comenzar tu plan de crecimiento
                  espiritual y guardarlo en tu historial.
                </Text>
                <TouchableOpacity
                  style={styles.botonExplorar}
                  onPress={() => navigation.navigate('Estudios')}
                >
                  <Ionicons name="compass-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.textoBotonExplorar}>Explorar estudios bíblicos</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => {
              const info =
                item.estudios ||
                ESTUDIOS_SEMILLA.find((s) => s.id === item.estudio_id) || {
                  titulo: 'Estudio Bíblico',
                  tema: 'Crecimiento Espiritual',
                  num_dias: 7,
                  descripcion: '',
                };

              const numDias = info.num_dias || 7;
              const diaActual = Math.min(item.dia_actual || 1, numDias);
              const completado = !!item.completado;
              const porcentaje = completado
                ? 100
                : Math.min(100, Math.round((diaActual / numDias) * 100));

              return (
                <View style={styles.tarjetaSuscrito}>
                  {/* Encabezado con Imagen y Datos */}
                  <TouchableOpacity
                    style={styles.filaInfoSuscrito}
                    onPress={() =>
                      navigation.navigate('EstudioDetalle', {
                        estudioId: item.estudio_id || item.id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    {info.portada_url ? (
                      <Image
                        source={{ uri: info.portada_url }}
                        style={styles.miniaturaPortada}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.miniaturaFallback}>
                        <Ionicons name="book-outline" size={26} color={colores.primario} />
                      </View>
                    )}

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.filaBadges}>
                        {info.tema ? (
                          <View style={styles.chipTema}>
                            <Text style={styles.textoChipTema} numberOfLines={1}>
                              {info.tema}
                            </Text>
                          </View>
                        ) : null}

                        <View
                          style={[
                            styles.chipEstadoSuscrito,
                            completado
                              ? styles.chipEstadoCompletado
                              : styles.chipEstadoEnCurso,
                          ]}
                        >
                          <Ionicons
                            name={completado ? 'checkmark-circle' : 'time'}
                            size={12}
                            color={completado ? '#10B981' : colores.primario}
                          />
                          <Text
                            style={[
                              styles.textoChipEstadoSuscrito,
                              { color: completado ? '#10B981' : colores.primario },
                            ]}
                          >
                            {completado ? 'Completado' : 'En curso'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.tituloSuscrito} numberOfLines={2}>
                        {info.titulo}
                      </Text>

                      {info.perfiles?.nombre_usuario ? (
                        <Text style={styles.autorSuscrito}>
                          Por {info.perfiles.nombre_usuario}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>

                  {/* BARRA DE PROGRESO */}
                  <View style={styles.contenedorProgreso}>
                    <View style={styles.barraFondo}>
                      <View
                        style={[
                          styles.barraRelleno,
                          {
                            width: `${porcentaje}%`,
                            backgroundColor: completado ? '#10B981' : colores.primario,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.filaTextoProgreso}>
                      <Text style={styles.textoProgreso}>
                        {completado
                          ? `Completado al 100% (${numDias} días)`
                          : `Día ${diaActual} de ${numDias} · ${porcentaje}%`}
                      </Text>
                      {item.ultima_actividad && (
                        <Text style={styles.textoFechaActividad}>
                          Historial guardado
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* BOTONES DE ACCIÓN: CONTINUAR, RECOMENDAR, OPCIONES */}
                  <View style={styles.filaBotonesAccion}>
                    <TouchableOpacity
                      style={styles.botonContinuar}
                      onPress={() =>
                        navigation.navigate('EstudioDetalle', {
                          estudioId: item.estudio_id || item.id,
                        })
                      }
                    >
                      <Ionicons
                        name={completado ? 'book-outline' : 'play'}
                        size={15}
                        color={colores.primarioTexto}
                      />
                      <Text style={styles.textoBotonContinuar}>
                        {completado ? 'Repasar estudio' : `Continuar día ${diaActual}`}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botonRecomendar}
                      onPress={() => recomendarEstudio(info, false)}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={16}
                        color={colores.primario}
                      />
                      <Text style={styles.textoBotonRecomendar}>Recomendar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botonDesuscribir}
                      onPress={() =>
                        confirmarDesuscripcion(item.estudio_id || item.id, info.titulo)
                      }
                    >
                      <Ionicons name="trash-outline" size={16} color={colores.textoTenue} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* ======================================================= */}
      {/* VISTA 2: MIS ESTUDIOS CREADOS                           */}
      {/* ======================================================= */}
      {pestanaActiva === 'creados' && (
        <View style={{ flex: 1 }}>
          {/* BOTÓN CREAR NUEVO ESTUDIO */}
          <View style={styles.contenedorBotonCrear}>
            <TouchableOpacity
              style={styles.botonCrearNuevo}
              onPress={() => navigation.navigate('CrearEstudio')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color={colores.primarioTexto} />
              <Text style={styles.textoBotonCrearNuevo}>Crear nuevo estudio bíblico</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={estudiosCreados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={onRefresh}
                tintColor={colores.primario}
              />
            }
            ListEmptyComponent={
              <View style={styles.vacioContenedor}>
                <View style={styles.circuloIconoVacio}>
                  <Ionicons name="create-outline" size={38} color={colores.primario} />
                </View>
                <Text style={styles.vacioTitulo}>Aún no has creado ningún estudio</Text>
                <Text style={styles.vacioSubtitulo}>
                  ¡Dios te ha dado talentos y sabiduría para edificar a otros! Puedes redactar tus
                  propios estudios con reflexiones diarias y compartirlos con toda la comunidad.
                </Text>
                <TouchableOpacity
                  style={styles.botonExplorar}
                  onPress={() => navigation.navigate('CrearEstudio')}
                >
                  <Ionicons name="add" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.textoBotonExplorar}>Crear mi primer estudio</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => {
              const etiqueta = ETIQUETAS_ESTADO[item.estado] || ETIQUETAS_ESTADO.borrador;
              const colorEstado =
                item.estado === 'publicado'
                  ? '#10B981'
                  : item.estado === 'rechazado'
                  ? colores.peligro
                  : item.estado === 'pendiente'
                  ? '#F59E0B'
                  : colores.textoTenue;

              return (
                <View style={styles.tarjeta}>
                  <TouchableOpacity onPress={() => tocarEstudioCreado(item)} activeOpacity={0.7}>
                    <View style={styles.encabezadoTarjeta}>
                      <Text style={styles.titulo}>{item.titulo}</Text>
                      <View style={[styles.chipEstado, { backgroundColor: colorEstado + '22' }]}>
                        <Ionicons name={etiqueta.icono} size={12} color={colorEstado} />
                        <Text style={[styles.textoChipEstado, { color: colorEstado }]}>
                          {etiqueta.texto}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.meta}>
                      {item.num_dias} días{item.tema ? ` · ${item.tema}` : ''}
                    </Text>

                    {item.descripcion ? (
                      <Text style={styles.descripcionCreado} numberOfLines={2}>
                        {item.descripcion}
                      </Text>
                    ) : null}

                    {item.estado === 'rechazado' && item.motivo_rechazo && (
                      <View style={styles.cajaMotivo}>
                        <Text style={styles.textoMotivo}>{item.motivo_rechazo}</Text>
                        <Text style={styles.avisoEditar}>Toca para corregir y volver a enviar</Text>
                      </View>
                    )}

                    {item.solicitud_eliminacion && (
                      <View style={styles.cajaSolicitud}>
                        <Ionicons name="hourglass-outline" size={14} color={colores.peligro} />
                        <Text style={styles.textoSolicitud}>
                          Solicitud de eliminación en revisión
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* FILA DE ACCIONES DEL AUTOR */}
                  <View style={styles.filaAccionesCreador}>
                    {item.estado === 'publicado' && (
                      <TouchableOpacity
                        style={styles.botonRecomendarCreador}
                        onPress={() => recomendarEstudio(item, true)}
                      >
                        <Ionicons
                          name="share-social-outline"
                          size={15}
                          color={colores.primario}
                        />
                        <Text style={styles.textoBotonRecomendarCreador}>
                          Recomendar mi estudio
                        </Text>
                      </TouchableOpacity>
                    )}

                    {(item.estado === 'borrador' || item.estado === 'rechazado') && (
                      <TouchableOpacity
                        style={styles.botonEditarCreado}
                        onPress={() => navigation.navigate('CrearEstudio', { estudioId: item.id })}
                      >
                        <Ionicons name="pencil-outline" size={15} color={colores.primario} />
                        <Text style={styles.textoBotonEditarCreado}>Editar</Text>
                      </TouchableOpacity>
                    )}

                    {!item.solicitud_eliminacion && (
                      <TouchableOpacity
                        style={styles.botonEliminarCreado}
                        onPress={() => tocarBotonEliminarCreado(item)}
                      >
                        <Ionicons name="trash-outline" size={14} color={colores.peligro} />
                        <Text style={styles.textoBotonEliminarCreado}>
                          {item.estado === 'publicado' ? 'Solicitar baja' : 'Eliminar'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* MODAL PARA SOLICITAR ELIMINACIÓN DE ESTUDIO PUBLICADO */}
      <Modal
        visible={modalEliminarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEliminarVisible(false)}
      >
        <View style={styles.fondoModal}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>¿Por qué quieres eliminar este estudio?</Text>
            <Text style={styles.subtituloModal}>
              Como ya está publicado y personas pueden estar realizándolo, un administrador debe
              revisar y aprobar la eliminación.
            </Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej. Encontré un error grave, ya no aplica, lo quiero rehacer..."
              placeholderTextColor={colores.textoTenue}
              value={motivoEliminacion}
              onChangeText={setMotivoEliminacion}
              multiline
              autoFocus
            />
            <View style={styles.filaBotonesModal}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalEliminarVisible(false)}
              >
                <Text style={styles.textoBotonCancelarModal}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonEnviarModal}
                onPress={enviarSolicitudEliminacion}
              >
                <Text style={styles.textoBotonEnviarModal}>Enviar solicitud</Text>
              </TouchableOpacity>
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
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    textoCargando: { marginTop: 12, fontSize: 14 },

    // SELECTOR DE PESTAÑAS
    contenedorSelectorPestanas: {
      flexDirection: 'row',
      backgroundColor: colores.superficie,
      marginHorizontal: 16,
      marginTop: 14,
      marginBottom: 10,
      borderRadius: 14,
      padding: 4,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    botonPestana: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 10,
      gap: 6,
    },
    botonPestanaActiva: {
      backgroundColor: colores.primario,
    },
    textoPestana: {
      fontSize: 13,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    textoPestanaActiva: {
      color: colores.primarioTexto,
    },
    badgePestana: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 2,
    },
    badgePestanaActiva: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    badgePestanaInactiva: {
      backgroundColor: colores.superficieAlterna,
    },
    textoBadgePestana: {
      fontSize: 11,
      fontWeight: '700',
    },
    textoBadgePestanaActiva: {
      color: colores.primarioTexto,
    },
    textoBadgePestanaInactiva: {
      color: colores.textoSecundario,
    },

    // SUB-FILTROS DE SUSCRITOS
    filaFiltros: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 6,
      gap: 8,
    },
    chipFiltro: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    chipFiltroActivo: {
      backgroundColor: colores.superficieAlterna,
      borderColor: colores.primario,
    },
    textoChipFiltro: {
      fontSize: 12,
      color: colores.textoSecundario,
      fontWeight: '500',
    },
    textoChipFiltroActivo: {
      color: colores.primario,
      fontWeight: '700',
    },

    // TARJETA DE ESTUDIO SUSCRITO
    tarjetaSuscrito: {
      backgroundColor: colores.superficie,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    filaInfoSuscrito: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    miniaturaPortada: {
      width: 68,
      height: 68,
      borderRadius: 10,
      backgroundColor: colores.superficieAlterna,
    },
    miniaturaFallback: {
      width: 68,
      height: 68,
      borderRadius: 10,
      backgroundColor: colores.superficieAlterna,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filaBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    chipTema: {
      backgroundColor: colores.superficieAlterna,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    textoChipTema: {
      fontSize: 11,
      color: colores.primario,
      fontWeight: '600',
    },
    chipEstadoSuscrito: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    chipEstadoEnCurso: {
      backgroundColor: 'rgba(60, 52, 137, 0.1)',
    },
    chipEstadoCompletado: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    textoChipEstadoSuscrito: {
      fontSize: 10,
      fontWeight: '700',
    },
    tituloSuscrito: {
      fontSize: 15,
      fontWeight: '700',
      color: colores.texto,
      lineHeight: 20,
    },
    autorSuscrito: {
      fontSize: 11,
      color: colores.textoTenue,
      marginTop: 2,
    },

    // BARRA DE PROGRESO
    contenedorProgreso: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 0.5,
      borderTopColor: colores.borde,
    },
    barraFondo: {
      height: 6,
      backgroundColor: colores.superficieAlterna,
      borderRadius: 3,
      overflow: 'hidden',
    },
    barraRelleno: {
      height: '100%',
      borderRadius: 3,
    },
    filaTextoProgreso: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 5,
    },
    textoProgreso: {
      fontSize: 11,
      fontWeight: '600',
      color: colores.textoSecundario,
    },
    textoFechaActividad: {
      fontSize: 10,
      color: colores.textoTenue,
    },

    // BOTONES DE ACCIÓN PARA SUSCRITO
    filaBotonesAccion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    },
    botonContinuar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colores.primario,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 6,
    },
    textoBotonContinuar: {
      color: colores.primarioTexto,
      fontSize: 12,
      fontWeight: '700',
    },
    botonRecomendar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colores.superficieAlterna,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 5,
      borderWidth: 1,
      borderColor: colores.primario + '33',
    },
    textoBotonRecomendar: {
      color: colores.primario,
      fontSize: 12,
      fontWeight: '600',
    },
    botonDesuscribir: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colores.superficieAlterna,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // VISTA CREADOS
    contenedorBotonCrear: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 4,
    },
    botonCrearNuevo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colores.primario,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      shadowColor: colores.primario,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    textoBotonCrearNuevo: {
      color: colores.primarioTexto,
      fontSize: 14,
      fontWeight: '700',
    },

    // TARJETA CREADOS
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    encabezadoTarjeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    titulo: { fontSize: 16, fontWeight: '700', color: colores.texto, flex: 1 },
    meta: { fontSize: 12, color: colores.textoSecundario, marginTop: 4 },
    descripcionCreado: {
      fontSize: 13,
      color: colores.textoSecundario,
      marginTop: 6,
      lineHeight: 18,
    },
    chipEstado: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    textoChipEstado: { fontSize: 11, fontWeight: '600' },
    cajaMotivo: {
      backgroundColor: colores.superficieAlterna,
      borderRadius: 8,
      padding: 10,
      marginTop: 10,
    },
    textoMotivo: { fontSize: 13, color: colores.texto, fontStyle: 'italic', lineHeight: 18 },
    avisoEditar: { fontSize: 11, color: colores.primario, marginTop: 6, fontWeight: '600' },
    cajaSolicitud: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
    },
    textoSolicitud: { fontSize: 12, color: colores.peligro, fontStyle: 'italic' },

    filaAccionesCreador: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 0.5,
      borderTopColor: colores.borde,
    },
    botonRecomendarCreador: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    textoBotonRecomendarCreador: {
      color: colores.primario,
      fontSize: 12,
      fontWeight: '600',
    },
    botonEditarCreado: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    textoBotonEditarCreado: {
      color: colores.primario,
      fontSize: 12,
      fontWeight: '600',
    },
    botonEliminarCreado: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    textoBotonEliminarCreado: {
      color: colores.peligro,
      fontSize: 12,
      fontWeight: '600',
    },

    // VACÍO
    vacioContenedor: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
    },
    circuloIconoVacio: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colores.superficieAlterna,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    vacioTitulo: {
      fontSize: 16,
      fontWeight: '700',
      color: colores.texto,
      textAlign: 'center',
      marginBottom: 8,
    },
    vacioSubtitulo: {
      fontSize: 13,
      color: colores.textoSecundario,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 20,
    },
    botonExplorar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.primario,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
    },
    textoBotonExplorar: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },

    // MODAL
    fondoModal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: 20,
    },
    cajaModal: {
      backgroundColor: colores.superficie,
      borderRadius: 14,
      padding: 20,
    },
    tituloModal: { fontSize: 17, fontWeight: '700', color: colores.texto, marginBottom: 6 },
    subtituloModal: {
      fontSize: 13,
      color: colores.textoSecundario,
      marginBottom: 14,
      lineHeight: 18,
    },
    inputModal: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colores.texto,
      backgroundColor: colores.fondo,
      minHeight: 90,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    filaBotonesModal: { flexDirection: 'row', gap: 10 },
    botonCancelarModal: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonCancelarModal: { color: colores.texto, fontWeight: '600' },
    botonEnviarModal: {
      flex: 1,
      backgroundColor: colores.peligro,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonEnviarModal: { color: '#fff', fontWeight: '600' },
  });
}