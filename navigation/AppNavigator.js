import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

import InicioScreen from '../screens/InicioScreen';
import EstudiosScreen from '../screens/EstudiosScreen';
import BibliaScreen from '../screens/BibliaScreen';
import PerfilScreen from '../screens/PerfilScreen';
import AdminScreen from '../screens/AdminScreen';
import CrearEstudioScreen from '../screens/CrearEstudioScreen';
import EstudioDetalleScreen from '../screens/EstudioDetalleScreen';
import UsuariosScreen from '../screens/UsuariosScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import MisEstudiosScreen from '../screens/MisEstudiosScreen';
import VersiculosFavoritosScreen from '../screens/VersiculosFavoritosScreen';
import AyudaScreen from '../screens/AyudaScreen';
import NotasScreen from '../screens/NotasScreen';
import NotaDetalleScreen from '../screens/NotaDetalleScreen';
import LineaDeTiempoScreen from '../screens/LineaDeTiempoScreen';
import DiarioOracionScreen from '../screens/DiarioOracionScreen';
import EstadoAnimoScreen from '../screens/EstadoAnimoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONOS_TAB = {
  Inicio: { activo: 'home', inactivo: 'home-outline' },
  Estudios: { activo: 'book', inactivo: 'book-outline' },
  Biblia: { activo: 'reader', inactivo: 'reader-outline' },
  Panel: { activo: 'shield-checkmark', inactivo: 'shield-checkmark-outline' },
  Perfil: { activo: 'person', inactivo: 'person-outline' },
};

function Pestanas() {
  const { colores } = useTheme();
  const [miRol, setMiRol] = useState(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    async function verificarRol() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
        setMiRol(data?.rol || 'lector');
      }
      setListo(true);
    }
    verificarRol();
  }, []);

  const tienePanel = miRol === 'admin' || miRol === 'revisor';

  if (!listo) return null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoTenue,
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const iconos = ICONOS_TAB[route.name];
          const nombreIcono = focused ? iconos.activo : iconos.inactivo;
          return <Ionicons name={nombreIcono} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Estudios" component={EstudiosScreen} options={{ title: 'Estudios' }} />
      <Tab.Screen name="Biblia" component={BibliaScreen} />
      {tienePanel && (
        <Tab.Screen name="Panel" component={AdminScreen} options={{ title: 'Panel' }} />
      )}
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colores } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colores.superficie },
          headerTintColor: colores.texto,
          headerTitleStyle: { color: colores.texto },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Pestanas" component={Pestanas} options={{ headerShown: false }} />
        <Stack.Screen
          name="CrearEstudio"
          component={CrearEstudioScreen}
          options={{ title: 'Crear estudio' }}
        />
        <Stack.Screen
          name="EstudioDetalle"
          component={EstudioDetalleScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Favoritos"
          component={FavoritosScreen}
          options={{ title: 'Mis favoritos' }}
        />
        <Stack.Screen
          name="MisEstudios"
          component={MisEstudiosScreen}
          options={{ title: 'Mis estudios' }}
        />
        <Stack.Screen
          name="VersiculosFavoritos"
          component={VersiculosFavoritosScreen}
          options={{ title: 'Mis versículos' }}
        />
        <Stack.Screen
          name="Ayuda"
          component={AyudaScreen}
          options={{ title: 'Ayuda y soporte' }}
        />
        <Stack.Screen
          name="Usuarios"
          component={UsuariosScreen}
          options={{ title: 'Usuarios' }}
        />
        <Stack.Screen
          name="Notas"
          component={NotasScreen}
          options={{ title: 'Mis apuntes' }}
        />
        <Stack.Screen
          name="NotaDetalle"
          component={NotaDetalleScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="LineaDeTiempo"
          component={LineaDeTiempoScreen}
          options={{ title: 'Tu camino con Dios' }}
        />
        <Stack.Screen
          name="DiarioOracion"
          component={DiarioOracionScreen}
          options={{ title: 'Diario de oración' }}
        />
        <Stack.Screen
          name="EstadoAnimo"
          component={EstadoAnimoScreen}
          options={{ title: '¿Cómo te sientes?' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}