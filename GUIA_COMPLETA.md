# 🎈 GUÍA COMPLETA · Web de donaciones AEIASW

Esta guía te lleva desde cero hasta tener la web **cobrando con tarjeta y Bizum**,
con la barra que sube sola. Sigue los pasos EN ORDEN. No necesitas saber programar:
es crear cuentas, copiar y pegar.

> ⏱️ Tiempo total estimado: 1-2 horas (sin contar la espera de verificación de Stripe).
> 💡 Consejo: haz primero TODO en modo prueba de Stripe. Solo al final pasas a real.

---

## 🗂️ QUÉ HAY EN ESTE PAQUETE

```
web-wolfram-completa/
├── index.html                  ← La web (front). Ya está terminada.
├── og-wolfram.jpg              ← Imagen que se ve al compartir en Facebook.
├── 01_esquema_supabase.sql     ← La base de datos. Se pega en Supabase.
├── netlify.toml                ← Configuración de Netlify.
├── package.json                ← Lista de programas que necesita el back.
├── netlify/functions/
│   ├── crear-donacion.js       ← Crea el pago en Stripe.
│   └── stripe-webhook.js       ← Recibe el pago y sube la barra sola.
├── LEEME.md                    ← Resumen rápido.
└── GUIA_COMPLETA.md            ← Esta guía.
```

---

## PASO 0 · Lo que necesitas antes de empezar

Crea estas cuentas (todas tienen plan gratuito):
- [ ] Cuenta de **GitHub** (github.com) — para guardar el código.
- [ ] Cuenta de **Netlify** (netlify.com) — para publicar la web. Entra con GitHub.
- [ ] Cuenta de **Supabase** (supabase.com) — la base de datos. Entra con GitHub.
- [ ] Cuenta de **Stripe** (stripe.com) a nombre de AEIASW — para cobrar.
- [ ] Tener **VS Code** instalado y **Git**.

---

## PASO 1 · Abrir el proyecto en VS Code

1. Descomprime este paquete en una carpeta (ej. `web-wolfram`).
2. Abre VS Code → File → Open Folder → elige esa carpeta.
3. Ya puedes ver todos los archivos a la izquierda.

Para probar la web tal cual (sin pagos aún): abre `index.html` en el navegador
(doble clic). Verás la web entera funcionando; el botón de donar dirá "muy pronto".

---

## PASO 2 · Subir el código a GitHub

En la terminal de VS Code (Terminal → New Terminal):

```bash
git init
git add .
git commit -m "Web donaciones AEIASW"
```

Luego crea un repositorio nuevo en github.com (botón "New"), y conéctalo:

```bash
git remote add origin https://github.com/TU_USUARIO/web-wolfram.git
git branch -M main
git push -u origin main
```

---

## PASO 3 · Publicar en Netlify (con dirección gratis)

1. En netlify.com → "Add new site" → "Import an existing project" → GitHub.
2. Elige tu repositorio `web-wolfram`.
3. Deja todo por defecto y pulsa "Deploy".
4. En 1 minuto tendrás una web en una dirección tipo `algo-random.netlify.app`.
   ¡Ya está online! (aún sin cobrar, eso es el siguiente bloque).

> Aquí ya puedes enseñar la web. El dominio propio lo conectas cuando quieras (Paso 9).

---

## PASO 4 · Crear la base de datos (Supabase)

1. En supabase.com → New project (ponle nombre, ej. "wolfram-donaciones").
2. Cuando esté listo, ve a **SQL Editor** → New query.
3. Abre el archivo `01_esquema_supabase.sql`, copia TODO su contenido, pégalo y pulsa **Run**.
4. Comprueba en **Table Editor** que aparecen las tablas `campaign` y `donations`.
5. Ve a **Project Settings → API** y copia estos 3 datos (los necesitas luego):
   - **Project URL**
   - **anon public** (clave pública)
   - **service_role** (clave SECRETA — ¡no la compartas nunca!)

6. Pon tu objetivo: Table Editor → `campaign` → fila 1 → edita `objetivo` a `2000`.

---

## PASO 5 · Crear la cuenta de Stripe (modo prueba primero)

1. AEIASW crea la cuenta en stripe.com con su CIF y datos de la asociación.
2. **No esperes a la verificación todavía:** Stripe funciona en MODO PRUEBA desde el inicio.
3. Arriba a la derecha, activa el interruptor **"Modo de prueba" (Test mode)**.
4. Ve a **Desarrolladores → Claves de API** y copia:
   - **Clave secreta de prueba** (empieza por `sk_test_...`)
5. Activa **Bizum**: Configuración → Métodos de pago → busca Bizum → Activar.
   (En modo prueba puede aparecer limitado; no pasa nada, con tarjeta basta para probar.)

---

## PASO 6 · Conectar las funciones del back en Netlify

1. En Netlify → tu sitio → **Site configuration → Environment variables** → Add:

   | Nombre                  | Valor                                          |
   |-------------------------|------------------------------------------------|
   | `STRIPE_SECRET_KEY`     | tu `sk_test_...` (de prueba, por ahora)        |
   | `STRIPE_WEBHOOK_SECRET` | lo rellenas en el Paso 7                        |
   | `SUPABASE_URL`          | el Project URL de Supabase                      |
   | `SUPABASE_SERVICE_KEY`  | la clave `service_role` de Supabase (secreta)   |

2. En `netlify/functions/crear-donacion.js`, busca `TUDOMINIO.es` (2 sitios) y
   cámbialo por tu dirección de Netlify (ej. `algo-random.netlify.app`).
3. Guarda, y sube los cambios:
   ```bash
   git add . && git commit -m "config back" && git push
   ```
   Netlify se actualiza solo en 1 minuto.

---

## PASO 7 · Conectar el webhook de Stripe (esto hace subir la barra sola)

1. En Stripe (modo prueba) → **Desarrolladores → Webhooks → Add endpoint**.
2. URL: `https://TU-DIRECCION.netlify.app/.netlify/functions/stripe-webhook`
3. Evento: selecciona `checkout.session.completed`.
4. Tras crearlo, copia el **Signing secret** (`whsec_...`).
5. Pégalo en la variable `STRIPE_WEBHOOK_SECRET` de Netlify (Paso 6) → vuelve a desplegar.

---

## PASO 8 · Activar los interruptores del front y PROBAR

1. En `index.html`, al principio del `<script>`, cambia:
   ```js
   const STRIPE_ACTIVO = true;        // estaba en false
   const BARRA_AUTOMATICA = true;     // estaba en false
   const SUPABASE_URL = "https://XXXX.supabase.co";   // tu Project URL
   const SUPABASE_ANON_KEY = "...";    // tu clave anon public
   ```
2. Guarda y sube (`git add . && git commit -m "activar pagos" && git push`).
3. **Prueba el flujo completo** en tu web de Netlify:
   - Pulsa Donar → elige importe → datos → "Continuar al pago".
   - Usa la tarjeta de prueba: **4242 4242 4242 4242**, fecha futura, CVC cualquiera.
   - Al terminar, vuelve a la web y comprueba que **la barra ha subido sola**.
   - En Supabase → `donations` debe aparecer la donación.

✅ Si la barra sube, ¡todo funciona! Solo falta pasar a dinero real.

---

## PASO 9 · Pasar a REAL (cuando Stripe verifique a AEIASW)

1. AEIASW completa la verificación de Stripe (datos fiscales + banco). Stripe la aprueba.
2. En Stripe, **desactiva el Modo de prueba** (interruptor arriba a la derecha).
3. Copia ahora las claves REALES (`sk_live_...`) y crea de nuevo el webhook en modo real
   (repite Paso 7 pero sin modo prueba; te da un nuevo `whsec_...`).
4. En Netlify, actualiza las variables `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`
   con las versiones reales.
5. Vuelve a desplegar. **A partir de aquí cobra de verdad.**

---

## PASO 10 · Dominio propio (recomendado)

1. Compra un dominio (ej. en Nominalia, ~10€/año). Sugerencia: algo como
   `cumplewolfram.org` o `ayudawolfram.es`.
2. En Netlify → Domain settings → Add custom domain → sigue las instrucciones
   (te dirá qué poner en el panel DNS de donde compraste el dominio).
3. Cuando el dominio esté activo, cambia `TUDOMINIO.es` por el real en:
   - `crear-donacion.js` (success_url y cancel_url)
   - las etiquetas `og:image` y `twitter:image` de `index.html`
   Y sube `og-wolfram.jpg` a la raíz (ya va en el paquete).
4. Sube los cambios. Listo.

---

## ⚠️ SEGURIDAD (muy importante)

- Las claves `service_role` y `sk_live` son las llaves de la caja fuerte.
  SOLO van en las variables de entorno de Netlify. NUNCA en `index.html` ni en GitHub.
- En el `index.html` solo va la clave `anon public` de Supabase (esa sí es segura
  para el front, solo permite leer la barra).

## 📋 PENDIENTE CON AEIASW (no es código)

- Confirmar que declaran los donativos en el **Modelo 182** ante Hacienda
  (necesario para que el certificado fiscal sea válido).
- Confirmar consentimiento por escrito de la Dra. Esteban para foto + nombre.
- Tener listo el envío del **certificado de donación** a cada donante (los datos
  quedan guardados en Supabase → `donations`: nombre, email, DNI, importe).

---

## ✅ PRUEBA FINAL OBLIGATORIA (hazla 2-3 días antes del evento)

No publiques sin pasar esta lista en modo prueba. Si los 6 puntos dan ✅, estáis listos:

1. [ ] Abro la web en Netlify y **la barra muestra "0 € de 2000 €"** (no se queda en blanco).
2. [ ] Pulso Donar, elijo 20 €, pongo email y DNI, "Continuar al pago" → **se abre Stripe**.
3. [ ] Pago con la tarjeta de prueba **4242 4242 4242 4242** (fecha futura, CVC cualquiera).
4. [ ] Vuelvo a la web y, en menos de 15 segundos, **la barra sube a 20 €**.
5. [ ] En Supabase → tabla `donations`, **aparece mi donación** con nombre, email y DNI.
6. [ ] En Stripe → Desarrolladores → Webhooks, el evento aparece como **"Succeeded"** (verde).

> Si el punto 4 o 6 falla, el problema casi siempre es el webhook (Paso 7):
> revisa que la URL es exacta y que el `whsec_...` está bien pegado en Netlify.

Cuando los 6 estén ✅, repite el flujo pasando a REAL (Paso 9) y haz UNA donación
real de 1 € con tu tarjeta para confirmar que el dinero llega a la cuenta de AEIASW.
Esa es tu prueba definitiva.

---

## 🆘 Si algo falla

- La barra no sube → revisa que el webhook (Paso 7) apunta a la URL correcta y que
  el evento es `checkout.session.completed`.
- El pago no abre → revisa que `STRIPE_SECRET_KEY` está bien en Netlify.
- Error de permisos en Supabase → revisa que usaste la clave `service_role` en el back.
- Recuerda volver a desplegar en Netlify tras cambiar cualquier variable.
