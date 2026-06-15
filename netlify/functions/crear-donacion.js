// ============================================================
//  FUNCIÓN 1 · Crear pago con tarjeta (Stripe Checkout)
//  Ruta pública: /.netlify/functions/crear-donacion
//  El front llama aquí cuando el donante pulsa "Donar con tarjeta".
// ============================================================

const Stripe = require("stripe");

exports.handler = async (event) => {
  // CORS para que tu web pueda llamar a esta función
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: "Método no permitido" };

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Falta configurar STRIPE_SECRET_KEY" }) };
    }
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const { importe, nombre, email, dni } = JSON.parse(event.body || "{}");

    // Validación: importe en euros, entre 1 y 10000
    const euros = Number(importe);
    if (!euros || euros < 1) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Importe no válido" }) };
    }
    if (euros > 10000) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Importe demasiado alto. Contacta con la asociación para donaciones mayores." }) };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Tarjeta + Bizum: ambos pasan por Stripe, así que ambos hacen
      // subir la barra automáticamente (vía el webhook).
      // Nota: "bizum" debe estar activado en tu panel de Stripe
      // (Configuración → Métodos de pago → Bizum → Activar).
      payment_method_types: ["card", "bizum"],
      // Email para que Stripe envíe su recibo automático
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Donación · Síndrome de Wolfram" },
            unit_amount: Math.round(euros * 100), // Stripe trabaja en céntimos
          },
          quantity: 1,
        },
      ],
      // Guardamos los datos del donante para el certificado fiscal
      metadata: { nombre: nombre || "", email: email || "", dni: dni || "" },
      // A dónde vuelve el donante tras pagar (cambia TUDOMINIO)
      success_url: "https://TUDOMINIO.es/?donacion=ok",
      cancel_url: "https://TUDOMINIO.es/?donacion=cancelada",
    });

    return { statusCode: 200, headers, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
