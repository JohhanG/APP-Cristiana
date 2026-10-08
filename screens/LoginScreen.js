import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';

const CLAVE_RECORDAR_ACTIVO = 'login_recordar_activo';
const CLAVE_RECORDAR_EMAIL = 'login_recordar_email';
const CLAVE_RECORDAR_PASSWORD = 'login_recordar_password';

export default function LoginScreen() {
  const { colores } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [recordarCuenta, setRecordarCuenta] = useState(true);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    cargarDatosRecordados();
  }, []);

  async function cargarDatosRecordados() {
    try {
      const activo = await AsyncStorage.getItem(CLAVE_RECORDAR_ACTIVO);
      if (activo === 'true') {
        const emailGuardado = await AsyncStorage.getItem(CLAVE_RECORDAR_EMAIL);
        const passwordGuardado = await AsyncStorage.getItem(CLAVE_RECORDAR_PASSWORD);
        if (emailGuardado) setEmail(emailGuardado);
        if (passwordGuardado) setPassword(passwordGuardado);
        setRecordarCuenta(true);
      } else if (activo === 'false') {
        setRecordarCuenta(false);
      }
    } catch (e) {
      console.warn('Error cargando credenciales recordadas:', e);
    }
  }

  async function guardarOQuitarCredenciales(correo, contrasena, recordar) {
    try {
      if (recordar) {
        await AsyncStorage.setItem(CLAVE_RECORDAR_ACTIVO, 'true');
        await AsyncStorage.setItem(CLAVE_RECORDAR_EMAIL, correo.trim());
        await AsyncStorage.setItem(CLAVE_RECORDAR_PASSWORD, contrasena);
      } else {
        await AsyncStorage.setItem(CLAVE_RECORDAR_ACTIVO, 'false');
        await AsyncStorage.removeItem(CLAVE_RECORDAR_EMAIL);
        await AsyncStorage.removeItem(CLAVE_RECORDAR_PASSWORD);
      }
    } catch (e) {
      console.warn('Error gestionando almacenamiento de credenciales:', e);
    }
  }

  async function iniciarSesion() {
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setCargando(false);

    if (error) {
      Alert.alert('Error al iniciar sesión', error.message);
      return;
    }

    // Guardar o limpiar según la casilla "Recordar"
    await guardarOQuitarCredenciales(email, password, recordarCuenta);
  }

  async function registrarse() {
    if (!email.trim() || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: 'appcristiana://',
      },
    });
    setCargando(false);

    if (error) {
      Alert.alert('Error al registrarte', error.message);
      return;
    }

    if (recordarCuenta) {
      await guardarOQuitarCredenciales(email, password, true);
    }

    Alert.alert(
      'Listo',
      'Revisa tu correo para confirmar la cuenta. Cuando inicies sesión, te ayudaremos a personalizar tu perfil.'
    );
  }

  async function olvideContrasena() {
    if (!email.trim()) {
      Alert.alert('Falta tu correo', 'Escribe tu correo arriba y luego toca "Olvidé mi contraseña"');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'appcristiana://',
    });
    setCargando(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    Alert.alert('Correo enviado', 'Revisa tu correo y toca el enlace para crear una nueva contraseña.');
  }

  const styles = crearEstilos(colores);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContenedor}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Maná</Text>
          <Text style={styles.subtitulo}>
            {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión para continuar'}
          </Text>

          {/* Campo Correo */}
          <View style={styles.campoInput}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={colores.textoTenue}
              style={styles.iconoInput}
            />
            <TextInput
              style={styles.inputConIcono}
              placeholder="Correo electrónico"
              placeholderTextColor={colores.textoTenue}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Campo Contraseña con ojo para ver/ocultar */}
          <View style={styles.campoInput}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colores.textoTenue}
              style={styles.iconoInput}
            />
            <TextInput
              style={styles.inputConIcono}
              placeholder="Contraseña"
              placeholderTextColor={colores.textoTenue}
              secureTextEntry={!mostrarPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.botonOjo}
              onPress={() => setMostrarPassword(!mostrarPassword)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colores.textoTenue}
              />
            </TouchableOpacity>
          </View>

          {/* Opciones de Iniciar Sesión: Recordar cuenta/contraseña y Olvidé contraseña */}
          {!esRegistro && (
            <View style={styles.filaOpciones}>
              <TouchableOpacity
                style={styles.opcionRecordar}
                activeOpacity={0.7}
                onPress={() => setRecordarCuenta(!recordarCuenta)}
              >
                <Ionicons
                  name={recordarCuenta ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={recordarCuenta ? colores.primario : colores.textoTenue}
                />
                <Text style={styles.textoRecordar}>Recordar mis datos</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={olvideContrasena} disabled={cargando}>
                <Text style={styles.enlaceSecundario}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botón Principal */}
          <TouchableOpacity
            style={styles.boton}
            onPress={esRegistro ? registrarse : iniciarSesion}
            disabled={cargando}
            activeOpacity={0.85}
          >
            {cargando ? (
              <ActivityIndicator color={colores.primarioTexto} />
            ) : (
              <Text style={styles.textoBoton}>
                {esRegistro ? 'Registrarme' : 'Entrar'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Alternar Registro / Inicio de sesión */}
          <TouchableOpacity
            onPress={() => setEsRegistro(!esRegistro)}
            style={{ marginTop: 22 }}
          >
            <Text style={styles.enlace}>
              {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    scrollContenedor: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colores.fondo,
    },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 18,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: 1,
      borderColor: colores.borde,
    },
    titulo: {
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 6,
      color: colores.texto,
      letterSpacing: -0.3,
    },
    subtitulo: {
      fontSize: 14,
      color: colores.textoSecundario,
      textAlign: 'center',
      marginBottom: 26,
    },
    campoInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,
      marginBottom: 14,
      backgroundColor: colores.fondo,
      paddingHorizontal: 12,
    },
    iconoInput: {
      marginRight: 8,
    },
    inputConIcono: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: colores.texto,
    },
    botonOjo: {
      padding: 6,
    },
    filaOpciones: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 2,
    },
    opcionRecordar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    textoRecordar: {
      fontSize: 13,
      color: colores.textoSecundario,
      fontWeight: '500',
    },
    boton: {
      backgroundColor: colores.primario,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      shadowColor: colores.primario,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 2,
    },
    textoBoton: {
      color: colores.primarioTexto,
      fontSize: 16,
      fontWeight: '700',
    },
    enlace: {
      textAlign: 'center',
      color: colores.primario,
      fontSize: 14,
      fontWeight: '600',
    },
    enlaceSecundario: {
      textAlign: 'right',
      color: colores.primario,
      fontSize: 12.5,
      fontWeight: '500',
    },
  });
}