import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import InicioScreen from '../screens/InicioScreen';
import EstudiosScreen from '../screens/EstudiosScreen';
import CrearEstudioScreen from '../screens/CrearEstudioScreen';
import EstudioDetalleScreen from '../screens/EstudioDetalleScreen';
import PerfilScreen from '../screens/PerfilScreen';
import AdminScreen from '../screens/AdminScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PilaInicio() {
  const { colores } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="PantallaInicio" component={InicioScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EstudioDetalle" component={EstudioDetalleScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function PilaEstudios() {
  const { colores } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ListaEstudios" component={EstudiosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CrearEstudio" component={CrearEstudioScreen} options={{ title: 'Crear estudio' }} />
      <Stack.Screen name="EstudioDetalle" component={EstudioDetalleScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function PilaPerfil() {
  const { colores } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="MiPerfil" component={PerfilScreen} options={{ title: 'Mi perfil' }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Estudios pendientes' }} />
      <Stack.Screen name="Usuarios" component={UsuariosScreen} options={{ title: 'Usuarios' }} />
      <Stack.Screen name="EstudioDetalle" component={EstudioDetalleScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { colores, modoOscuro } = useTheme();

  const temaNavegacion = {
    ...(modoOscuro ? DarkTheme : DefaultTheme),
    colors: {
      ...(modoOscuro ? DarkTheme.colors : DefaultTheme.colors),
      background: colores.fondo,
      card: colores.fondo,
      text: colores.texto,
      border: colores.borde,
      primary: colores.primario,
    },
  };

  return (
    <NavigationContainer theme={temaNavegacion}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colores.primario,
          tabBarInactiveTintColor: colores.textoTenue,
          tabBarStyle: {
            backgroundColor: colores.fondo,
            borderTopColor: colores.borde,
          },
          tabBarIcon: ({ color, size }) => {
            let nombreIcono = 'person-outline';
            if (route.name === 'Inicio') nombreIcono = 'home-outline';
            if (route.name === 'Estudios') nombreIcono = 'book-outline';
            return <Ionicons name={nombreIcono} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Inicio" component={PilaInicio} />
        <Tab.Screen name="Estudios" component={PilaEstudios} />
        <Tab.Screen name="Perfil" component={PilaPerfil} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
