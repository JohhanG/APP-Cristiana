import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';
 
// Abre la galería, deja elegir una imagen, la sube a Supabase Storage,
// y devuelve la URL pública lista para guardar en la base de datos.
// aspecto: [ancho, alto] del recorte. Por defecto 16:9 (para imágenes de estudios).
// Para fotos de perfil, pasa [1, 1] (cuadrada).
export async function elegirYSubirImagen(carpeta, aspecto = [16, 9]) {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) {
    return { exito: false, error: 'Necesitas dar permiso para acceder a tus fotos' };
  }
 
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.6,
    allowsEditing: true,
    aspect: aspecto,
  });
 
  if (resultado.canceled) {
    return { exito: false, cancelado: true };
  }
 
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { exito: false, error: 'Necesitas iniciar sesión' };
  }
 
  try {
    const uri = resultado.assets[0].uri;
 
    // Leemos el archivo como base64 y lo convertimos a ArrayBuffer.
    // Este es el método que Supabase recomienda para React Native — más confiable
    // que Blob/fetch, que a veces falla en builds ya compilados (no en modo desarrollo).
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bufferArchivo = decode(base64);
 
    const extension = uri.split('.').pop().toLowerCase() || 'jpg';
    const nombreArchivo = `${user.id}/${carpeta}/${Date.now()}.${extension}`;
 
    const { error: errorSubida } = await supabase.storage
      .from('estudios-imagenes')
      .upload(nombreArchivo, bufferArchivo, {
        contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      });
 
    if (errorSubida) {
      return { exito: false, error: errorSubida.message };
    }
 
    const { data: urlPublica } = supabase.storage
      .from('estudios-imagenes')
      .getPublicUrl(nombreArchivo);
 
    return { exito: true, url: urlPublica.publicUrl };
  } catch (error) {
    return { exito: false, error: 'No se pudo subir la imagen: ' + error.message };
  }
}