import { supabase } from './supabase';

// Llama a la Edge Function "eliminar-cuenta" que borra la cuenta de inmediato
// (manda un correo de aviso justo antes de borrar).
export async function eliminarMiCuenta() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { exito: false, error: 'No hay sesión activa' };
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  try {
    const respuesta = await fetch(`${supabaseUrl}/functions/v1/eliminar-cuenta`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      return { exito: false, error: datos.error || 'No se pudo eliminar la cuenta' };
    }

    await supabase.auth.signOut();
    return { exito: true };
  } catch (error) {
    return { exito: false, error: 'Error de conexión. Revisa tu internet e intenta de nuevo.' };
  }
}