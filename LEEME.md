# Web AEIASW · Cumpleaños solidario — Paquete completo

Todo el proyecto, front + back, listo para subir a Netlify.
Funciona desde ya como web informativa; el pago se activa cuando tengáis Stripe.

## Archivos

- **index.html** — la web completa (diseño, barra, modal de donación). Ya funciona.
- **netlify/functions/** — el back (Stripe + Supabase). Se activa al final.
- **01_esquema_supabase.sql** — la base de datos. Se pega en Supabase.
- **package.json / netlify.toml** — configuración para Netlify.
- **GUIA_PASO_A_PASO.md** — el manual detallado de montaje.

## Estado actual

- La web se puede subir y enseñar ya.
- El botón "Donar" abre el formulario (importe + datos), pero al continuar
  muestra un aviso de "disponible muy pronto" porque Stripe aún no está activo.

## Cómo ACTIVAR el pago cuando tengáis Stripe (3 cambios)

Todo está controlado por interruptores al principio del `<script>` de `index.html`:

1. **Activar el pago:** cambia `const STRIPE_ACTIVO = false;` a `true`.
2. **Activar la barra automática:** cambia `const BARRA_AUTOMATICA = false;` a `true`
   y rellena `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
3. **Montar el back:** sigue la `GUIA_PASO_A_PASO.md` (Supabase + variables en Netlify).

Mientras tanto, con los interruptores en `false`, la web es 100% segura y funcional
como página informativa.

## Orden recomendado

1. Sube esto a Netlify y compruébalo (con la dirección gratis .netlify.app).
2. Cuando quieras, conecta un dominio propio (recomendado para dar confianza).
3. AEIASW abre Stripe → montáis el back en modo test → probáis con tarjeta 4242...
4. Stripe verificado → claves reales → interruptores a `true` → ¡a recaudar!
