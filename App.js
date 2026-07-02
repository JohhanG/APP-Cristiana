import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { supabase } from './lib/supabase';
import LoginScreen from './screens/LoginScreen';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

function AppInterno() {
  const { colores } = useTheme();
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={colores.barraEstado === 'light' ? 'light-content' : 'dark-content'} backgroundColor={colores.fondo} />
      {sesion ? <AppNavigator /> : <LoginScreen />}
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
