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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

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

  useEffect(() => {
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);

      if (user) {
        const { data } = await supabase
          .from('perfiles')
          .select('nombre_usuario, rol')
          .eq('id', user.id)
          .single();
        if (data) {
          setNombreUsuario(data.nombre_usuario);
          setEsAdmin(data.rol === 'admin');
        }
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
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

      <View style={styles.encabezadoPerfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {(nombreUsuario || usuario?.email || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nombreUsuario}>{nombreUsuario || 'Sin nombre'}</Text>
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

      {esAdmin && (
        <View style={styles.seccion}>
          <TouchableOpacity
            style={styles.filaAjuste}
            onPress={() => navigation.navigate('Admin')}
          >
            <View style={styles.filaIconoTexto}>
              <Ionicons name="checkmark-done-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
              <Text style={styles.textoAjuste}>Estudios pendientes</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
          </TouchableOpacity>

          <View style={{ height: 0.5, backgroundColor: colores.borde }} />

          <TouchableOpacity
            style={styles.filaAjuste}
            onPress={() => navigation.navigate('Usuarios')}
          >
            <View style={styles.filaIconoTexto}>
              <Ionicons name="people-outline" size={20} color={colores.primario} style={{ marginRight: 10 }} />
              <Text style={styles.textoAjuste}>Usuarios</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={18} color={colores.peligro} style={{ marginRight: 6 }} />
        <Text style={styles.textoCerrarSesion}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
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
    avatarTexto: { fontSize: 28, fontWeight: '600', color: colores.primario },
    nombreUsuario: { fontSize: 19, fontWeight: '600', color: colores.texto },
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
    filaIconoTexto: { flexDirection: 'row', alignItems: 'center' },
    textoAjuste: { fontSize: 15, color: colores.texto },
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
  });
}
