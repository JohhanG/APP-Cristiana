import { supabase } from './supabase';
 
// Colores disponibles para resaltar (nombre -> valor hex con transparencia)
export const COLORES_RESALTADO = {
  amarillo: '#FDE68A',
  verde: '#BBF7D0',
  rosado: '#FBCFE8',
  azul: '#BFDBFE',
};
 
// Carga favoritos/resaltados del capítulo actual, para pintarlos al mostrar el texto
export async function cargarInteraccionesCapitulo(libroNumero, capitulo, version) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
 
  const { data, error } = await supabase
    .from('versiculos_interacciones')
    .select('verso, favorito, color_resaltado')
    .eq('usuario_id', user.id)
    .eq('libro', libroNumero)
    .eq('capitulo', capitulo)
    .eq('version', version);
 
  if (error || !data) return {};
 
  const mapa = {};
  data.forEach((fila) => {
    mapa[fila.verso] = { favorito: fila.favorito, color_resaltado: fila.color_resaltado };
  });
  return mapa;
}
 
// Guarda (o borra si ya no queda nada marcado) la interacción de un versículo
export async function guardarInteraccionVersiculo({
  libroNumero,
  capitulo,
  verso,
  version,
  texto,
  referencia,
  favorito,
  colorResaltado,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { exito: false, error: 'Necesitas iniciar sesión' };
 
  if (!favorito && !colorResaltado) {
    await supabase
      .from('versiculos_interacciones')
      .delete()
      .eq('usuario_id', user.id)
      .eq('libro', libroNumero)
      .eq('capitulo', capitulo)
      .eq('verso', verso)
      .eq('version', version);
    return { exito: true };
  }
 
  const { error } = await supabase.from('versiculos_interacciones').upsert(
    {
      usuario_id: user.id,
      libro: libroNumero,
      capitulo,
      verso,
      version,
      texto,
      referencia,
      favorito: !!favorito,
      color_resaltado: colorResaltado || null,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: 'usuario_id,libro,capitulo,verso,version' }
  );
 
  if (error) return { exito: false, error: error.message };
  return { exito: true };
}
 
// Lista completa de versículos marcados como favoritos, para la pantalla de "Mis versículos"
export async function cargarVersiculosFavoritos() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
 
  const { data, error } = await supabase
    .from('versiculos_interacciones')
    .select('*')
    .eq('usuario_id', user.id)
    .eq('favorito', true)
    .order('actualizado_en', { ascending: false });
 
  if (error) return [];
  return data || [];
}