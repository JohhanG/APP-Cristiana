import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/ThemeContext';
 
export default function LoginScreen() {
  const { colores } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [esRegistro, setEsRegistro] = useState(false);
 
  async function iniciarSesion() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) Alert.alert('Error al iniciar sesión', error.message);
  }
 
  async function registrarse() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresa tu correo y contraseña');
      return;
    }
    setCargando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'appcristiana://' },
    });
    setCargando(false);
    if (error) {
      Alert.alert('Error al registrarte', error.message);
      return;
    }
    Alert.alert('Listo', 'Revisa tu correo para confirmar la cuenta si es necesario.');
  }

  async function olvideContrasena() {
    if (!email) {
      Alert.alert('Falta tu correo', 'Escribe tu correo arriba y luego toca "Olvidé mi contraseña"');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mi App Cristiana</Text>
      <Text style={styles.subtitulo}>
        {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión para continuar'}
      </Text>
 
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor={colores.textoTenue}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colores.textoTenue}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
 
      <TouchableOpacity
        style={styles.boton}
        onPress={esRegistro ? registrarse : iniciarSesion}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color={colores.primarioTexto} />
        ) : (
          <Text style={styles.textoBoton}>{esRegistro ? 'Registrarme' : 'Entrar'}</Text>
        )}
      </TouchableOpacity>
 
      {!esRegistro && (
        <TouchableOpacity onPress={olvideContrasena} disabled={cargando}>
          <Text style={styles.enlaceSecundario}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => setEsRegistro(!esRegistro)}>
        <Text style={styles.enlace}>
          {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
 
function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colores.fondo },
    titulo: { fontSize: 26, fontWeight: '600', textAlign: 'center', marginBottom: 8, color: colores.texto },
    subtitulo: { fontSize: 15, color: colores.textoSecundario, textAlign: 'center', marginBottom: 32 },
    input: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 15,
      color: colores.texto,
      backgroundColor: colores.superficie,
    },
    boton: {
      backgroundColor: colores.primario,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    textoBoton: { color: colores.primarioTexto, fontSize: 16, fontWeight: '600' },
    enlace: { textAlign: 'center', color: colores.primario, marginTop: 20, fontSize: 14 },
    enlaceSecundario: { textAlign: 'center', color: colores.textoSecundario, marginTop: 14, fontSize: 13 },
  });
}