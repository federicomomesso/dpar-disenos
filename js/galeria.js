// Galería de "Trabajos realizados": cada tarjeta abre un <dialog> con todas las fotos del proyecto.
// Las fotos pasan con scroll horizontal nativo (scroll-snap: se desliza con el dedo en el celular),
// con botones y flechas del teclado en la PC. "Quiero uno así" cierra la galería y elige el mueble en el pedido.
(function () {
  const dlg = document.querySelector('dialog.gal');
  const dataEl = document.getElementById('proyectos');
  if (!dlg || !dataEl || typeof dlg.showModal !== 'function') return;
  const proyectos = JSON.parse(dataEl.textContent);
  const track = dlg.querySelector('.gal__track');
  const title = dlg.querySelector('.gal__title');
  const count = dlg.querySelector('.gal__count');
  const prev = dlg.querySelector('[data-gal-prev]');
  const next = dlg.querySelector('[data-gal-next]');
  const pedir = dlg.querySelector('[data-gal-pedir]');
  let actual = null, opener = null;

  const index = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  function update() {
    if (!actual) return;
    const i = Math.min(index(), actual.fotos.length - 1);
    count.textContent = 'Foto ' + (i + 1) + ' de ' + actual.fotos.length;
    prev.disabled = i <= 0;
    next.disabled = i >= actual.fotos.length - 1;
  }
  function go(step) {
    track.scrollTo({ left: (index() + step) * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function open(i, from) {
    actual = proyectos[i];
    opener = from;
    title.textContent = actual.t;
    track.innerHTML = '';
    actual.fotos.forEach((f, k) => {
      const fig = document.createElement('figure');
      fig.className = 'gal__slide';
      const img = new Image();
      img.src = f.src; img.alt = f.alt; img.width = f.w; img.height = f.h;
      img.decoding = 'async';
      if (k > 0) img.loading = 'lazy';
      fig.appendChild(img);
      track.appendChild(fig);
    });
    document.documentElement.classList.add('gal-open');
    dlg.showModal();
    track.scrollLeft = 0;
    update();
    track.focus({ preventScroll: true });
  }

  document.querySelectorAll('a[data-gal]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); open(+a.dataset.gal, a); });
  });
  dlg.querySelector('.gal__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('gal-open');
    if (opener) opener.focus({ preventScroll: true });
  });
  // a click on the dark backdrop (outside the panel) closes it
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  pedir.addEventListener('click', () => {
    const sel = document.getElementById('f-mueble');
    if (sel && actual) sel.value = actual.m;
    const note = document.querySelector('[data-pedido-modelo]');
    if (note && actual) { note.textContent = 'Elegiste: ' + actual.t + '.'; note.hidden = false; }
    window.dpPedidoModelo && window.dpPedidoModelo(actual ? actual.t : '');
    opener = null;
    dlg.close();
  });
})();
