import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
import {
  activarRecordatorioDiario,
  desactivarRecordatorioDiario,
  recordatorioEstaActivo,
  obtenerHoraRecordatorio,
} from '../lib/notificaciones';
import { eliminarMiCuenta } from '../lib/cuenta';
import { elegirYSubirImagen } from '../lib/subirImagen';
import ModalNovedades from '../components/ModalNovedades';
import { VERSION_ACTUAL } from '../constants/novedades';

const HORARIOS_DISPONIBLES = [];
for (let h = 5; h <= 22; h++) {
  HORARIOS_DISPONIBLES.push({ hora: h, minuto: 0 });
  HORARIOS_DISPONIBLES.push({ hora: h, minuto: 30 });
}

function formatearHora(hora, minuto) {
  const h12 = hora % 12 === 0 ? 12 : hora % 12;
  const ampm = hora < 12 ? 'AM' : 'PM';
  const minutoTexto = minuto === 0 ? '00' : String(minuto);
  return `${h12}:${minutoTexto} ${ampm}`;
}

export default function PerfilScreen({ navigation }) {
  const { colores, modoOscuro, alternarTema } = useTheme();
  const [usuario, setUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [esAdmin, setEsAdmin] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [recordatorioActivo, setRecordatorioActivo] = useState(false);
  const [horaRecordatorio, setHoraRecordatorio] = useState(null);
  const [modalHoraVisible, setModalHoraVisible] = useState(false);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreEditado, setNombreEditado] = useState('');
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [mostrarEliminarCuenta, setMostrarEliminarCuenta] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [modalNovedadesVisible, setModalNovedadesVisible] = useState(false);

  async function cambiarFotoPerfil() {
    setSubiendoFoto(true);
    const resultado = await elegirYSubirImagen('perfiles', [1, 1]);
    setSubiendoFoto(false);

    if (resultado.cancelado) return;
    if (!resultado.exito) {
      Alert.alert('Error', resultado.error);
      return;
    }

    const { error } = await supabase
      .from('perfiles')
      .update({ foto_url: resultado.url })
      .eq('id', usuario.id);

    if (error) {
      Alert.alert('Error', 'La imagen se subió pero no se pudo guardar: ' + error.message);
      return;
    }

    setFotoUrl(resultado.url);
  }

  async function confirmarEliminarCuenta() {
    if (textoConfirmacion.trim().toUpperCase() !== 'ELIMINAR') {
      Alert.alert('Confirmación incorrecta', 'Escribe la palabra ELIMINAR (en mayúsculas) para confirmar');
      return;
    }

    setEliminandoCuenta(true);
    const resultado = await eliminarMiCuenta();
    setEliminandoCuenta(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.error);
      return;
    }
    // Al eliminar la cuenta, App.js detecta que ya no hay sesión y regresa sola al login
  }

  async function guardarNombre() {
  if (!nombreEditado.trim()) {
    Alert.alert('El nombre no puede estar vacío');
    return;
  }
  setGuardandoNombre(true);
  const { error } = await supabase
    .from('perfiles')
    .update({ nombre_usuario: nombreEditado.trim() })
    .eq('id', usuario.id);
  setGuardandoNombre(false);
 
  if (error) {
    // Si la base de datos rechaza el nombre por estar duplicado, el mensaje viene
    // en inglés y muy técnico (ej. "duplicate key value violates unique constraint..."),
    // así que lo traducimos a algo que la persona realmente entienda.
    const esNombreDuplicado =
      error.code === '23505' || error.message?.toLowerCase().includes('duplicate');
 
    Alert.alert(
      'Error',
      esNombreDuplicado
        ? 'Ese nombre de usuario ya lo está usando otra persona. Elige otro diferente.'
        : error.message
    );
    return;
  }
  setNombreUsuario(nombreEditado.trim());
  setEditandoNombre(false);
}

  function alternarRecordatorio(valor) {
    if (valor) {
      setModalHoraVisible(true);
    } else {
      setRecordatorioActivo(false);
      setHoraRecordatorio(null);
      desactivarRecordatorioDiario();
    }
  }

  async function elegirHora(hora, minuto) {
    const activado = await activarRecordatorioDiario(hora, minuto);
    setModalHoraVisible(false);
    if (activado) {
      setRecordatorioActivo(true);
      setHoraRecordatorio({ hora, minuto });
    } else {
      Alert.alert('No se pudo activar', 'Revisa que le hayas dado permiso de notificaciones a la app en los ajustes de tu celular.');
    }
  }

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);

      if (user) {
        const { data } = await supabase
          .from('perfiles')
          .select('nombre_usuario, rol, foto_url')
          .eq('id', user.id)
          .single();
        if (data) {
          setNombreUsuario(data.nombre_usuario);
          setNombreEditado(data.nombre_usuario);
          setEsAdmin(data.rol === 'admin' || data.rol === 'revisor');
          setFotoUrl(data.foto_url || null);
        }
      }

      const activo = await recordatorioEstaActivo();
      setRecordatorioActivo(activo);
      if (activo) {
        const hora = await obtenerHoraRecordatorio();
        setHoraRecordatorio(hora);
      }
      setCargandoPerfil(false);
    }
    cargar();
  }, []);

  async function cambiarPassword() {
    if (nuevaPassword.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      Alert.alert('No coinciden', 'Las contraseñas no son iguales');
      return;
    }

    setGuardandoPassword(true);
    const { error } = await supabase.auth.updateUser({ password: nuevaPassword });
    setGuardandoPassword(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Listo', 'Tu contraseña se actualizó correctamente');
    setNuevaPassword('');
    setConfirmarPassword('');
    setMostrarCambioPassword(false);
  }

  async function cerrarSesion() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  const styles = crearEstilos(colores);

  if (cargandoPerfil) {
    return (
      <View style={[styles.centrado, { backgroundColor: colores.fondo }]}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 }}
      >

      <View style={styles.encabezadoPerfil}>
        <TouchableOpacity style={styles.avatar} onPress={cambiarFotoPerfil} disabled={subiendoFoto}>
          {subiendoFoto ? (
            <ActivityIndicator color={colores.primario} />
          ) : fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatarImagen} />
          ) : (
            <Text style={styles.avatarTexto}>
              {(nombreUsuario || usuario?.email || '?').charAt(0).toUpperCase()}
            </Text>
          )}
          <View style={styles.iconoCamara}>
            <Ionicons name="camera" size={14} color={colores.primarioTexto} />
          </View>
        </TouchableOpacity>

        {editandoNombre ? (
          <View style={styles.filaEdicionNombre}>
            <TextInput
              style={styles.inputNombre}
              value={nombreEditado}
              onChangeText={setNombreEditado}
              autoFocus
              maxLength={30}
            />
            <TouchableOpacity onPress={guardarNombre} disabled={guardandoNombre} style={{ marginLeft: 8 }}>
              {guardandoNombre ? (
                <ActivityIndicator size="small" color={colores.primario} />
              ) : (
                <Ionicons name="checkmark-circle" size={26} color={colores.primario} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNombreEditado(nombreUsuario);
                setEditandoNombre(false);
              }}
              style={{ marginLeft: 6 }}
            >
              <Ionicons name="close-circle" size={26} color={colores.textoTenue} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.filaEdicionNombre} onPress={() => setEditandoNombre(true)}>
            <Text style={styles.nombreUsuario}>{nombreUsuario || 'Sin nombre'}</Text>
            <Ionicons name="pencil" size={15} color={colores.textoTenue} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}

        <Text style={styles.correo}>{usuario?.email}</Text>
      </View>

      <View style={styles.seccion}>
        <View style={styles.filaAjuste}>
          <View style={styles.filaIconoTexto}>
            <Ionicons
              name={modoOscuro ? 'moon' : 'sunny'}
              size={20}
              color={colores.primario}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.textoAjuste}>Modo oscuro</Text>
          </View>
          <Switch
            value={modoOscuro}
            onValueChange={alternarTema}
            trackColor={{ false: '#ccc', true: colores.primario }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.seccion}>
        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => recordatorioActivo && setModalHoraVisible(true)}
          activeOpacity={recordatorioActivo ? 0.6 : 1}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="notifications-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <View>
              <Text style={styles.textoAjuste}>Recordatorio diario</Text>
              {recordatorioActivo && horaRecordatorio && (
                <Text style={styles.subtextoAjuste}>
                  Todos los días a las {formatearHora(horaRecordatorio.hora, horaRecordatorio.minuto)} · toca para cambiar
                </Text>
              )}
            </View>
          </View>
          <Switch
            value={recordatorioActivo}
            onValueChange={alternarRecordatorio}
            trackColor={{ false: '#ccc', true: colores.primario }}
            thumbColor="#fff"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => setMostrarCambioPassword(!mostrarCambioPassword)}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="lock-closed-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Cambiar contraseña</Text>
          </View>
          <Ionicons
            name={mostrarCambioPassword ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colores.textoSecundario}
          />
        </TouchableOpacity>

        {mostrarCambioPassword && (
          <View style={styles.formularioPassword}>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              placeholderTextColor={colores.textoTenue}
              secureTextEntry
              value={nuevaPassword}
              onChangeText={setNuevaPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar nueva contraseña"
              placeholderTextColor={colores.textoTenue}
              secureTextEntry
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
            />
            <TouchableOpacity
              style={styles.botonGuardarPassword}
              onPress={cambiarPassword}
              disabled={guardandoPassword}
            >
              {guardandoPassword ? (
                <ActivityIndicator color={colores.primarioTexto} />
              ) : (
                <Text style={styles.textoBotonGuardarPassword}>Guardar contraseña</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.seccion}>
        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('LineaDeTiempo')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="footsteps-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Tu camino con Dios</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>

        <View style={{ height: 0.5, backgroundColor: colores.borde }} />

        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('DiarioOracion')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="hand-left-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Diario de oración</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>

        <View style={{ height: 0.5, backgroundColor: colores.borde }} />

        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('MisEstudios')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="book-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Mis estudios</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>

        <View style={{ height: 0.5, backgroundColor: colores.borde }} />

        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('Favoritos')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="heart-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Mis favoritos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>

        <View style={{ height: 0.5, backgroundColor: colores.borde }} />

        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('VersiculosFavoritos')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="bookmark-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Mis versículos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>

        <View style={{ height: 0.5, backgroundColor: colores.borde }} />

        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('Notas')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="create-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Mis apuntes</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>
      </View>

      <View style={styles.seccion}>
        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => navigation.navigate('Ayuda')}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="help-circle-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Ayuda y soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>

        <View style={{ height: 0.5, backgroundColor: colores.borde }} />

        <TouchableOpacity
          style={styles.filaAjuste}
          onPress={() => setModalNovedadesVisible(true)}
        >
          <View style={styles.filaIconoTexto}>
            <Ionicons name="sparkles-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
            <Text style={styles.textoAjuste}>Novedades de la versión (v{VERSION_ACTUAL})</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </TouchableOpacity>
      </View>

      {esAdmin && (
        <View style={styles.seccion}>
          <View style={styles.filaAjuste}>
            <View style={styles.filaIconoTexto}>
              <Ionicons name="shield-checkmark" size={20} color={colores.primario} style={{ marginRight: 10 }} />
              <Text style={styles.textoAjuste}>Administración disponible en la pestaña "Panel"</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={18} color={colores.peligro} style={{ marginRight: 6 }} />
        <Text style={styles.textoCerrarSesion}>Cerrar sesión</Text>
      </TouchableOpacity>

      {!mostrarEliminarCuenta ? (
        <TouchableOpacity
          style={styles.botonMostrarEliminarCuenta}
          onPress={() => setMostrarEliminarCuenta(true)}
        >
          <Text style={styles.textoEliminarCuentaTenue}>Eliminar mi cuenta</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.cajaEliminarCuenta}>
          <Text style={styles.tituloEliminarCuenta}>Esto no se puede deshacer</Text>
          <Text style={styles.textoEliminarCuenta}>
            Se eliminará tu cuenta, tus estudios, favoritos, versículos guardados, apuntes y todo tu progreso, y te
            llegará un correo de confirmación. Escribe{' '}
            <Text style={{ fontWeight: '700' }}>ELIMINAR</Text> para confirmar.
          </Text>
          <TextInput
            style={styles.inputConfirmacion}
            placeholder="ELIMINAR"
            placeholderTextColor={colores.textoTenue}
            value={textoConfirmacion}
            onChangeText={setTextoConfirmacion}
            autoCapitalize="characters"
          />
          <View style={styles.filaBotonesEliminarCuenta}>
            <TouchableOpacity
              style={styles.botonCancelarEliminarCuenta}
              onPress={() => {
                setMostrarEliminarCuenta(false);
                setTextoConfirmacion('');
              }}
            >
              <Text style={styles.textoCancelarEliminarCuenta}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonConfirmarEliminarCuenta}
              onPress={confirmarEliminarCuenta}
              disabled={eliminandoCuenta}
            >
              {eliminandoCuenta ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.textoConfirmarEliminarCuenta}>Eliminar mi cuenta</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={modalHoraVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalHoraVisible(false)}
      >
        <TouchableOpacity style={styles.fondoModal} activeOpacity={1} onPress={() => setModalHoraVisible(false)}>
          <View style={styles.cajaModal}>
            <Text style={styles.tituloModal}>¿A qué hora quieres tu recordatorio?</Text>
            <FlatList
              data={HORARIOS_DISPONIBLES}
              keyExtractor={(item) => `${item.hora}-${item.minuto}`}
              numColumns={3}
              renderItem={({ item }) => {
                const seleccionado =
                  horaRecordatorio?.hora === item.hora && horaRecordatorio?.minuto === item.minuto;
                return (
                  <TouchableOpacity
                    style={[styles.celdaHora, seleccionado && styles.celdaHoraActiva]}
                    onPress={() => elegirHora(item.hora, item.minuto)}
                  >
                    <Text style={[styles.textoCeldaHora, seleccionado && styles.textoCeldaHoraActiva]}>
                      {formatearHora(item.hora, item.minuto)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <ModalNovedades
        visible={modalNovedadesVisible}
        onCerrar={() => setModalNovedadesVisible(false)}
        onExplorar={(featureId) => {
          setModalNovedadesVisible(false);
          if (featureId === 'situacion') {
            navigation.navigate('Devocionales');
          } else if (featureId === 'estudios') {
            navigation.navigate('Estudios');
          } else if (featureId === 'biblia_genesis') {
            navigation.navigate('Biblia');
          }
        }}
      />

    </ScrollView>
  </SafeAreaView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: colores.fondo },
    centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    encabezadoPerfil: { alignItems: 'center', marginBottom: 28 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatarImagen: { width: 72, height: 72, borderRadius: 36 },
    iconoCamara: {
      position: 'absolute',
      right: -2,
      bottom: 10,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colores.primario,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colores.fondo,
    },
    avatarTexto: { fontSize: 28, fontWeight: '600', color: colores.primario },
    nombreUsuario: { fontSize: 19, fontWeight: '600', color: colores.texto },
    filaEdicionNombre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    inputNombre: {
      fontSize: 19,
      fontWeight: '600',
      color: colores.texto,
      borderBottomWidth: 1,
      borderBottomColor: colores.primario,
      minWidth: 140,
      textAlign: 'center',
      paddingVertical: 2,
    },
    correo: { fontSize: 13, color: colores.textoSecundario, marginTop: 2 },
    seccion: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      marginBottom: 14,
      overflow: 'hidden',
    },
    filaAjuste: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    filaIconoTexto: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    textoAjuste: { fontSize: 15, color: colores.texto },
    subtextoAjuste: { fontSize: 11, color: colores.textoTenue, marginTop: 2 },
    formularioPassword: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 0.5,
      borderTopColor: colores.borde,
      paddingTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      marginBottom: 10,
      color: colores.texto,
      backgroundColor: colores.fondo,
    },
    botonGuardarPassword: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoBotonGuardarPassword: { color: colores.primarioTexto, fontWeight: '600' },
    botonCerrarSesion: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 14,
      marginTop: 10,
    },
    textoCerrarSesion: { color: colores.peligro, fontWeight: '600', fontSize: 15 },
    botonMostrarEliminarCuenta: { alignItems: 'center', padding: 10, marginTop: 4 },
    textoEliminarCuentaTenue: { color: colores.textoTenue, fontSize: 13 },
    cajaEliminarCuenta: {
      backgroundColor: colores.peligro + '15',
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    tituloEliminarCuenta: { fontSize: 15, fontWeight: '700', color: colores.peligro, marginBottom: 6 },
    textoEliminarCuenta: { fontSize: 13, color: colores.texto, lineHeight: 19, marginBottom: 12 },
    inputConfirmacion: {
      borderWidth: 1,
      borderColor: colores.peligro,
      borderRadius: 8,
      padding: 10,
      fontSize: 14,
      color: colores.texto,
      backgroundColor: colores.fondo,
      marginBottom: 12,
      textAlign: 'center',
      fontWeight: '700',
    },
    filaBotonesEliminarCuenta: { flexDirection: 'row', gap: 10 },
    botonCancelarEliminarCuenta: {
      flex: 1,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoCancelarEliminarCuenta: { color: colores.texto, fontWeight: '600' },
    botonConfirmarEliminarCuenta: {
      flex: 1,
      backgroundColor: colores.peligro,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    textoConfirmarEliminarCuenta: { color: '#fff', fontWeight: '700', fontSize: 13 },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    cajaModal: {
      backgroundColor: colores.superficie,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      padding: 16,
      maxHeight: '70%',
    },
    tituloModal: { fontSize: 16, fontWeight: '700', color: colores.texto, marginBottom: 14, textAlign: 'center' },
    celdaHora: {
      flex: 1,
      margin: 4,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: colores.superficieAlterna,
      justifyContent: 'center',
      alignItems: 'center',
    },
    celdaHoraActiva: { backgroundColor: colores.primario },
    textoCeldaHora: { color: colores.texto, fontWeight: '600', fontSize: 13 },
    textoCeldaHoraActiva: { color: colores.primarioTexto },
  });
}