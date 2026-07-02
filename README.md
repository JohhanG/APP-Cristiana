# Mi App Cristiana

App móvil de estudios bíblicos hecha con React Native + Expo + Supabase.

## Requisitos

- Node.js instalado (versión 18 o más reciente): https://nodejs.org
- La app **Expo Go** instalada en tu celular (búscala en Play Store o App Store)
- Una cuenta de Supabase con las tablas ya creadas (ver `esquema_estudios_biblicos.sql`)

## Pasos para correr el proyecto

1. Descomprime esta carpeta y abre una terminal dentro de ella

2. Instala las dependencias:
   ```
   npm install
   ```

3. Copia el archivo `.env.example` y renómbralo a `.env`, luego pon tus datos reales de Supabase:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
   ```
   (Los encuentras en Supabase → Settings → API)

4. Inicia el proyecto:
   ```
   npx expo start
   ```

5. Escanea el código QR que aparece en la terminal con la app **Expo Go** en tu celular (Android: desde la app Expo Go: iOS: desde la cámara)

## Qué incluye este proyecto

- `App.js` — punto de entrada, revisa si hay sesión activa
- `screens/LoginScreen.js` — registro e inicio de sesión
- `screens/EstudiosScreen.js` — lista de estudios bíblicos publicados
- `screens/CrearEstudioScreen.js` — formulario para crear un estudio de varios días
- `screens/EstudioDetalleScreen.js` — ver y avanzar día a día en un estudio
- `lib/supabase.js` — conexión con tu base de datos
- `navigation/AppNavigator.js` — navegación entre pantallas

## Siguientes pasos sugeridos

- Agregar pantalla de perfil de usuario
- Conectar una API bíblica (ej. bible-api.com) para autocompletar el texto al escribir la referencia
- Agregar "likes" y comentarios (las tablas ya existen en Supabase)
- Cuando esté lista para publicar: `npx eas build -p android` para generar el APK
