import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import * as Updates from 'expo-updates';
import { supabase } from './lib/supabase';
import LoginScreen from './screens/LoginScreen';
import NuevaContrasenaScreen from './screens/NuevaContrasenaScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { registrarParaNotificaciones } from './lib/notificaciones';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lee los parámetros que Supabase manda dentro del enlace del correo
// (vienen después del # como access_token=...&type=recovery, etc.)
function extraerParametrosDeUrl(url) {
  if (!url) return {};
  const fragmento = url.split('#')[1] || url.split('?')[1] || '';
  const parametros = {};
  fragmento.split('&').forEach((par) => {
    const [clave, valor] = par.split('=');
    if (clave) parametros[clave] = decodeURIComponent(valor || '');
  });
  return parametros;
}

function AppInterno() {
  const { colores } = useTheme();
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modoRecuperacion, setModoRecuperacion] = useState(false);
  const [necesitaOnboarding, setNecesitaOnboarding] = useState(false);
  const [revisandoOnboarding, setRevisandoOnboarding] = useState(false);

  const procesarEnlace = async (url) => {
    if (!url) return;
    const { access_token, refresh_token, type } = extraerParametrosDeUrl(url);

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (!error && type === 'recovery') {
        setModoRecuperacion(true);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    Linking.getInitialURL().then(procesarEnlace);
    const suscripcionLinking = Linking.addEventListener('url', ({ url }) => procesarEnlace(url));

    return () => {
      listener.subscription.unsubscribe();
      suscripcionLinking.remove();
    };
  }, []);

  useEffect(() => {
    if (sesion?.user?.id) {
      registrarParaNotificaciones(sesion.user.id);
      verificarOnboarding(sesion.user.id);
    }
  }, [sesion]);

  async function verificarOnboarding(usuarioId) {
    try {
      const local = await AsyncStorage.getItem('onboarding_completado_' + usuarioId);
      if (local === 'true') {
        setNecesitaOnboarding(false);
        return;
      }
    } catch {}

    setRevisandoOnboarding(true);
    try {
      const { data } = await supabase
        .from('perfiles')
        .select('onboarding_completado')
        .eq('id', usuarioId)
        .maybeSingle();

      const completado = !!data?.onboarding_completado;
      setNecesitaOnboarding(!completado);
      if (completado) {
        AsyncStorage.setItem('onboarding_completado_' + usuarioId, 'true').catch(() => {});
      }
    } catch {
      setNecesitaOnboarding(false);
    } finally {
      setRevisandoOnboarding(false);
    }
  }

  useEffect(() => {
    verificarActualizaciones();
  }, []);

  async function verificarActualizaciones() {
    if (__DEV__) return;

    try {
      const resultado = await Updates.checkForUpdateAsync();
      if (resultado.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert(
          'Actualización disponible',
          'Hay una nueva versión de la app lista para instalar. ¿Quieres aplicarla ahora?',
          [
            { text: 'Más tarde', style: 'cancel' },
            {
              text: 'Actualizar ahora',
              onPress: async () => {
                await Updates.reloadAsync();
              },
            },
          ]
        );
      }
    } catch (error) {
      // Si no hay internet o falla la revisión, simplemente no molestamos al usuario
    }
  }

  if (cargando || (sesion && revisandoOnboarding)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={colores.barraEstado === 'light' ? 'light-content' : 'dark-content'} backgroundColor={colores.fondo} />
      {modoRecuperacion ? (
        <NuevaContrasenaScreen onListo={() => setModoRecuperacion(false)} />
      ) : sesion && necesitaOnboarding ? (
        <OnboardingScreen onListo={() => setNecesitaOnboarding(false)} />
      ) : sesion ? (
        <AppNavigator />
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInterno />
    </ThemeProvider>
  );
}