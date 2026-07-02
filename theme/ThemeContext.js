import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

const paletaClara = {
  fondo: '#ffffff',
  superficie: '#f7f7fa',
  superficieAlterna: '#eceaf7',
  texto: '#1a1a1a',
  textoSecundario: '#666666',
  textoTenue: '#999999',
  borde: '#e2e2e6',
  primario: '#3C3489',
  primarioTexto: '#ffffff',
  peligro: '#c0392b',
  barraEstado: 'dark',
};

const paletaOscura = {
  fondo: '#121212',
  superficie: '#1e1e21',
  superficieAlterna: '#2a2640',
  texto: '#f2f2f2',
  textoSecundario: '#b0b0b5',
  textoTenue: '#7d7d82',
  borde: '#33333a',
  primario: '#a49bf0',
  primarioTexto: '#1a1a1a',
  peligro: '#e07a6d',
  barraEstado: 'light',
};

export function ThemeProvider({ children }) {
  const [modoOscuro, setModoOscuro] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('preferencia_tema').then((valor) => {
      if (valor === 'oscuro') setModoOscuro(true);
      setListo(true);
    });
  }, []);

  function alternarTema() {
    const nuevoValor = !modoOscuro;
    setModoOscuro(nuevoValor);
    AsyncStorage.setItem('preferencia_tema', nuevoValor ? 'oscuro' : 'claro');
  }

  const colores = modoOscuro ? paletaOscura : paletaClara;

  if (!listo) return null;

  return (
    <ThemeContext.Provider value={{ colores, modoOscuro, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
