// ============================================================
//  FUNCIÓN 2 · Webhook de Stripe (confirma pago → suma a la barra)
//  Ruta: /.netlify/functions/stripe-webhook
//  Stripe llama aquí automáticamente cuando un pago se completa.
//  Aquí es donde la barra "sube sola".
// ============================================================

const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  // La cabecera puede llegar en minúsculas o no, según el proxy. Cubrimos ambas.
  const sig = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];

  // IMPORTANTE: Stripe verifica la firma sobre el body CRUDO (tal cual llegó).
  // Netlify a veces entrega el body codificado en base64 (isBase64Encoded=true).
  // Si no lo decodificamos, la verificación falla SIEMPRE y la barra no sube.
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  let stripeEvent;
  try {
    // Verifica que el aviso viene de verdad de Stripe (seguridad)
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Firma no válida: ${err.message}` };
  }

  // Solo nos interesa cuando un pago se completa
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const euros = (session.amount_total || 0) / 100;
    const meta = session.metadata || {};
    // Detecta si pagó con tarjeta o Bizum (para guardarlo bien)
    const metodo = Array.isArray(session.payment_method_types) && session.payment_method_types.includes("bizum") && session.payment_method_types.length === 1
      ? "bizum"
      : "tarjeta";

    // Cliente Supabase con clave SECRETA (service_role): puede escribir
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 1) Registrar la donación (stripe_id evita contar dos veces el mismo pago)
    const { error: errDon } = await supabase.from("donations").insert({
      importe: euros,
      metodo: metodo,
      nombre: meta.nombre || null,
      email: meta.email || null,
      dni: meta.dni || null,
      stripe_id: session.id,
    });

    // Si ya existía (duplicado), no sumamos otra vez: respondemos OK y salimos
    if (errDon && errDon.code === "23505") {
      return { statusCode: 200, body: "Pago ya registrado" };
    }
    // Si hubo otro error al guardar, avisamos a Stripe (reintentará el envío)
    if (errDon) {
      return { statusCode: 500, body: `Error guardando donación: ${errDon.message}` };
    }

    // 2) Sumar el importe al total de la barra de forma ATÓMICA
    //    (una función SQL que suma sin riesgo de que dos pagos se pisen)
    const { error: errSum } = await supabase.rpc("sumar_donacion", { cantidad: euros });

    if (errSum) {
      return { statusCode: 500, body: `Error actualizando barra: ${errSum.message}` };
    }
  }

  return { statusCode: 200, body: "ok" };
};
