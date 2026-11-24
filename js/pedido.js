// Pedido por WhatsApp: arma el texto del mensaje en el campo oculto "text" del formulario.
// El envío lo hace el navegador (GET a wa.me), después de que system.js valida los campos.
(function () {
  const form = document.querySelector('#pedido form');
  if (!form) return;
  const out = form.querySelector('input[name="text"]');
  const note = document.querySelector('[data-pedido-modelo]');
  const val = id => (document.getElementById(id)?.value || '').trim();
  let modelo = '';

  function build() {
    const lines = ['Hola Dpar Diseños, quiero pedir un presupuesto.'];
    if (val('f-nombre')) lines.push('Nombre: ' + val('f-nombre'));
    if (val('f-mueble')) lines.push('Mueble: ' + val('f-mueble'));
    if (modelo) lines.push('Como el trabajo: ' + modelo);
    if (val('f-medidas')) lines.push('Medidas: ' + val('f-medidas'));
    if (val('f-color')) lines.push('Color: ' + val('f-color'));
    if (val('f-zona')) lines.push('Zona: ' + val('f-zona'));
    if (val('f-detalle')) lines.push('Detalles: ' + val('f-detalle'));
    out.value = lines.join('\n');
  }

  form.addEventListener('input', build);
  form.addEventListener('change', build);
  form.addEventListener('submit', build, true);   // capture: runs before system.js checks and the browser sends

  document.querySelectorAll('a[data-mueble]').forEach(a => {
    a.addEventListener('click', () => {
      const sel = document.getElementById('f-mueble');
      if (sel) sel.value = a.dataset.mueble;
      modelo = a.dataset.modelo || '';
      if (note) { note.textContent = 'Elegiste: ' + modelo + '.'; note.hidden = !modelo; }
      build();
    });
  });
  // la galería de trabajos llama a esto con "Quiero uno así"
  window.dpPedidoModelo = m => { modelo = m || ''; build(); };
  build();
})();
