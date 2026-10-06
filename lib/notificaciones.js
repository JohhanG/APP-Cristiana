import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
 
const CLAVE_RECORDATORIO = 'recordatorio_diario_id';
const CLAVE_HORA_RECORDATORIO = 'recordatorio_diario_hora';
 
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
 
// Pide permiso y guarda el token de este celular en Supabase (para notificaciones remotas futuras)
export async function registrarParaNotificaciones(usuarioId) {
  try {
    if (!Device.isDevice) return;
 
    const { status: estadoActual } = await Notifications.getPermissionsAsync();
    let estadoFinal = estadoActual;
 
    if (estadoActual !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      estadoFinal = status;
    }
 
    if (estadoFinal !== 'granted') return;
 
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
 
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
 
    await supabase.from('tokens_push').upsert(
      { usuario_id: usuarioId, token, actualizado_en: new Date().toISOString() },
      { onConflict: 'usuario_id' }
    );
  } catch (error) {
    console.log('No se pudo registrar para notificaciones:', error.message);
  }
}
 
// Activa un recordatorio diario local (no depende de internet ni de Firebase)
export async function activarRecordatorioDiario(hora, minuto) {
  try {
    const { status: estadoActual } = await Notifications.getPermissionsAsync();
    let estadoFinal = estadoActual;
 
    if (estadoActual !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      estadoFinal = status;
    }
 
    if (estadoFinal !== 'granted') return false;
 
    await desactivarRecordatorioDiario();
 
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tu momento con Dios',
        body: 'Es hora de tu lectura diaria. Toca para abrir la app.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hora,
        minute: minuto,
      },
    });
 
    await AsyncStorage.setItem(CLAVE_RECORDATORIO, id);
    await AsyncStorage.setItem(CLAVE_HORA_RECORDATORIO, JSON.stringify({ hora, minuto }));
    return true;
  } catch (error) {
    console.log('No se pudo activar el recordatorio:', error.message);
    return false;
  }
}
 
export async function desactivarRecordatorioDiario() {
  try {
    const id = await AsyncStorage.getItem(CLAVE_RECORDATORIO);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(CLAVE_RECORDATORIO);
      await AsyncStorage.removeItem(CLAVE_HORA_RECORDATORIO);
    }
  } catch (error) {
    console.log('No se pudo desactivar el recordatorio:', error.message);
  }
}
 
export async function recordatorioEstaActivo() {
  try {
    const id = await AsyncStorage.getItem(CLAVE_RECORDATORIO);
    return !!id;
  } catch {
    return false;
  }
}
 
// Devuelve { hora, minuto } de la hora programada, o null si no hay ninguna activa
export async function obtenerHoraRecordatorio() {
  try {
    const guardado = await AsyncStorage.getItem(CLAVE_HORA_RECORDATORIO);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}