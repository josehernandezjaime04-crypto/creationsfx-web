(function () {
  const IMG = 'assets/img/productos/';
  const V = '?v=2'; // cambia al regenerar fotos para saltar la caché
  const WHATSAPP = '34620555833';
  const EMAIL = 'creationsfx2020@gmail.com';
  const line = document.body.dataset.line;
  const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function priceLabel(p) {
    if (p.bajoPedido) return 'Bajo pedido';
    if (p.precio) return euro.format(p.precio);
    return 'Precio a consultar';
  }

  fetch('data/productos.json', { cache: 'no-cache' })
    .then((r) => r.json())
    .then(render)
    .catch(() => {
      $('lineGroups').innerHTML = '<p class="noscript">No se ha podido cargar el catálogo. Escríbenos a ' + EMAIL + '.</p>';
    });

  function render(data) {
    const L = data.lineas[line];
    const P = data.productos;

    // Grupos de productos
    $('lineGroups').innerHTML = L.grupos.map((g, gi) => `
      <section class="pgroup" id="grupo-${gi + 1}">
        <div class="pgroup-head reveal">
          <h2>${esc(g.titulo)}</h2>
          <span>${g.productos.length} ${g.productos.length === 1 ? 'producto' : 'productos'}</span>
        </div>
        <div class="pgrid${g.productos.length === 4 ? ' pgrid-4' : ''}">
          ${g.productos.map((id) => card(id, P[id])).join('')}
        </div>
      </section>`).join('');

    $('groupLinks').innerHTML = L.grupos.length > 1
      ? L.grupos.map((g, gi) => `<a href="#grupo-${gi + 1}">${esc(g.titulo)}</a>`).join('')
      : '';

    // Otras líneas
    $('otherLines').innerHTML = Object.entries(data.lineas)
      .filter(([k]) => k !== line)
      .map(([k, o]) => {
        const n = o.grupos.reduce((s, g) => s + g.productos.length, 0);
        return `
        <a href="${k}.html" class="cat-card reveal">
          <img src="${o.imagen}" alt="" loading="lazy">
          <div class="cat-info">
            <span class="cat-num">${o.num}</span>
            <h3>${esc(o.titulo)}</h3>
            <span class="cat-count">${n} productos</span>
          </div>
        </a>`;
      }).join('');

    document.querySelectorAll('#lineGroups .reveal, #otherLines .reveal').forEach((el) => window.cfxReveal && window.cfxReveal(el));

    document.querySelectorAll('.pcard').forEach((b) => b.addEventListener('click', () => open(b.dataset.id)));

    // Ficha
    const dlg = $('ficha');
    let current = null;
    let choice = null;

    function open(id, fromHash) {
      const p = P[id];
      if (!p) return;
      current = { id, p };
      choice = null;

      $('fichaMarca').textContent = p.marca || L.titulo;
      $('fichaNombre').textContent = p.nombre;
      $('fichaPrecio').textContent = priceLabel(p);
      $('fichaPrecio').classList.toggle('is-price', !!p.precio && !p.bajoPedido);
      $('fichaResumen').textContent = p.resumen || '';
      $('fichaDesc').textContent = p.descripcion || '';
      $('fichaDesc').hidden = !p.descripcion;
      $('fichaAviso').textContent = p.aviso || '';
      $('fichaAviso').hidden = !p.aviso;

      const specs = Object.entries(p.ficha || {});
      $('fichaSpecs').innerHTML = specs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
      $('fichaSpecs').hidden = !specs.length;

      const opt = p.opciones;
      $('fichaOpciones').innerHTML = opt
        ? `<p>${esc(opt.titulo)}</p><div class="chips">${opt.valores.map((v) => `<button type="button" class="chip" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div>`
        : '';
      $('fichaOpciones').querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
        $('fichaOpciones').querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c));
        choice = c.dataset.v;
        updateLinks();
      }));
      if (opt && opt.valores.length === 1) $('fichaOpciones').querySelector('.chip').click();

      showImg(0);
      $('fichaThumbs').innerHTML = p.imagenes.length > 1
        ? p.imagenes.map((f, i) => `<button type="button" data-i="${i}" aria-label="Imagen ${i + 1}"><img src="${IMG + f + V}" alt=""></button>`).join('')
        : '';
      $('fichaThumbs').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => showImg(+b.dataset.i)));
      markThumb(0);

      updateLinks();
      if (!fromHash) history.replaceState(null, '', '#' + id);
      if (!dlg.open) dlg.showModal();
      $('fichaNombre').focus({ preventScroll: true });
      document.body.classList.add('modal-open');
      dlg.querySelector('.ficha-info').scrollTop = 0;
    }

    function showImg(i) {
      $('fichaImg').src = IMG + current.p.imagenes[i] + V;
      $('fichaImg').alt = current.p.nombre;
      markThumb(i);
    }
    function markThumb(i) {
      $('fichaThumbs').querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
    }

    function updateLinks() {
      const p = current.p;
      const opt = p.opciones ? ` (${p.opciones.titulo.toLowerCase()}: ${choice || 'por decidir'})` : '';
      const msg = `Hola, me interesa ${p.nombre}${opt}. ¿Me podéis dar precio y disponibilidad?`;
      $('fichaWhats').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
      $('fichaMail').href = `mailto:${EMAIL}?subject=${encodeURIComponent('Pedido: ' + p.nombre)}&body=${encodeURIComponent(msg)}`;
    }

    function close() { dlg.close(); }
    $('fichaClose').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
      history.replaceState(null, '', location.pathname + location.search);
    });

    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (P[id]) open(id, true);
    };
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  function card(id, p) {
    const first = p.imagenes[0];
    return `
      <button type="button" class="pcard reveal" data-id="${id}">
        <span class="pcard-img"><img src="${IMG + first + V}" alt="${esc(p.nombre)}" loading="lazy"></span>
        <span class="pcard-body">
          ${p.marca ? `<span class="pcard-marca">${esc(p.marca)}</span>` : ''}
          <span class="pcard-name">${esc(p.nombre)}</span>
          <span class="pcard-resumen">${esc(p.resumen || '')}</span>
          <span class="pcard-foot">
            <span class="pcard-price${p.precio && !p.bajoPedido ? ' is-price' : ''}">${priceLabel(p)}</span>
            <span class="pcard-more">Ver ficha →</span>
          </span>
        </span>
      </button>`;
  }
})();
