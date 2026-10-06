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

export default function NuevaContrasenaScreen({ onListo }) {
  const { colores } = useTheme();
  const styles = crearEstilos(colores);

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmar) {
      Alert.alert('No coinciden', 'Las contraseñas no son iguales');
      return;
    }

    setGuardando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setGuardando(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Listo', 'Tu contraseña fue actualizada. Ya puedes iniciar sesión con ella.');
    onListo();
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Nueva contraseña</Text>
      <Text style={styles.subtitulo}>Escribe tu nueva contraseña para tu cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        placeholderTextColor={colores.textoTenue}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor={colores.textoTenue}
        secureTextEntry
        value={confirmar}
        onChangeText={setConfirmar}
      />

      <TouchableOpacity style={styles.boton} onPress={guardar} disabled={guardando}>
        {guardando ? (
          <ActivityIndicator color={colores.primarioTexto} />
        ) : (
          <Text style={styles.textoBoton}>Guardar contraseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colores.fondo },
    titulo: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 8, color: colores.texto },
    subtitulo: { fontSize: 14, color: colores.textoSecundario, textAlign: 'center', marginBottom: 28 },
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
  });
}