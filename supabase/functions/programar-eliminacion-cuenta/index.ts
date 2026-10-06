// Edge Function: programar-eliminacion-cuenta
// En vez de eliminar de inmediato, marca la cuenta para eliminarse en 7 días
// y le manda un correo al dueño real de la cuenta avisándole, con instrucciones
// para cancelar si no fue él/ella quien lo pidió.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DIAS_DE_GRACIA = 7;

Deno.serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Falta autenticación' }), { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: errorUsuario } = await supabaseAdmin.auth.getUser(token);
    if (errorUsuario || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
    }

    const fechaEliminacion = new Date();
    fechaEliminacion.setDate(fechaEliminacion.getDate() + DIAS_DE_GRACIA);

    const { error: errorActualizar } = await supabaseAdmin
      .from('perfiles')
      .update({ eliminacion_programada_en: fechaEliminacion.toISOString() })
      .eq('id', user.id);

    if (errorActualizar) {
      return new Response(JSON.stringify({ error: errorActualizar.message }), { status: 400 });
    }

    // Mandamos el correo de aviso (si falla el correo, igual dejamos la eliminación programada)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && user.email) {
      const fechaLegible = fechaEliminacion.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Maná <onboarding@resend.dev>',
          to: [user.email],
          subject: 'Tu cuenta de Maná se eliminará pronto',
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
              <h2>Solicitud de eliminación de cuenta</h2>
              <p>Se programó la eliminación de tu cuenta de <strong>Maná</strong> para el <strong>${fechaLegible}</strong>.</p>
              <p>Si fuiste tú quien lo pidió, no necesitas hacer nada más — se eliminará automáticamente en esa fecha.</p>
              <p><strong>Si tú NO pediste esto</strong>, entra a la app, ve a tu Perfil, y toca el botón "Cancelar eliminación" antes de esa fecha para conservar tu cuenta.</p>
              <p style="color: #888; font-size: 13px; margin-top: 30px;">Si tienes dudas, contáctanos desde la sección de Ayuda dentro de la app.</p>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ exito: true, fechaEliminacion: fechaEliminacion.toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});