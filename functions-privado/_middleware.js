// Acceso privado mientras el cliente revisa la web: pide usuario y clave (HTTP Basic Auth) en cada página.
// Los valores salen de los secretos del proyecto en Cloudflare (ACCESO_USUARIO, ACCESO_CLAVE).
// Si faltan, la web queda cerrada. Para abrirla al público: borrar esta carpeta "functions" y volver a publicar.
export async function onRequest(context) {
  const { request, env, next } = context;
  // trim: a secret piped in from PowerShell arrives with a line break (and maybe a BOM) at its ends
  const clean = v => (v || '').replace(/^﻿/, '').trim();
  const user = clean(env.ACCESO_USUARIO), pass = clean(env.ACCESO_CLAVE);
  const denied = (msg) => new Response(msg, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dpar Disenos - vista previa", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
  if (!user || !pass) return denied('Vista previa cerrada.');

  const auth = request.headers.get('Authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  if (scheme !== 'Basic' || !encoded) return denied('Ingresá usuario y clave.');
  let given = '';
  try { given = new TextDecoder().decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))); } catch { return denied('Ingresá usuario y clave.'); }
  const i = given.indexOf(':');
  const ok = await same(given.slice(0, i), user) & await same(given.slice(i + 1), pass);
  if (i < 0 || !ok) return denied('Usuario o clave incorrectos.');

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');   // que Google no la indexe mientras es privada
  out.headers.set('Cache-Control', 'private, no-store');
  return out;
}

// comparación en tiempo constante (hash de ambos lados)
async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(v => crypto.subtle.digest('SHA-256', enc.encode(v))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0;
  for (let k = 0; k < u.length; k++) d |= u[k] ^ v[k];
  return d === 0;
}
