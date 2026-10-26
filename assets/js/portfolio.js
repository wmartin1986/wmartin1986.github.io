// willpower.codes — portfolio page: the project detail view.
(() => {
  const cards = [...document.querySelectorAll('.managed-card, .work-card')];

  // ── Masonry ──
  // Each card spans as many 4px grid rows as it is tall, so cards fill left to right in page order.
  if ('ResizeObserver' in window) {
    const ROW = 4;
    const fit = new ResizeObserver((entries) => entries.forEach(({ target }) => {
      const li = target.parentElement;
      const gap = parseFloat(getComputedStyle(li.parentElement).columnGap) || 0;
      li.style.gridRowEnd = 'span ' + Math.ceil((target.getBoundingClientRect().height + gap) / ROW);
    }));
    document.querySelectorAll('.masonry').forEach((grid) => {
      grid.classList.add('masonry--grid');
      grid.querySelectorAll('.work-card > button').forEach((btn) => fit.observe(btn));
    });
  }

  // ── Detail view ──
  const dialog = document.getElementById('lightbox');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const q = (sel) => dialog.querySelector(sel);
  const media = q('[data-lb-media]');
  const pos = q('[data-lb-pos]');
  const meta = q('[data-lb-meta]');
  const title = q('[data-lb-title]');
  const tags = q('[data-lb-tags]');
  const desc = q('[data-lb-desc]');
  const link = q('[data-lb-link]');
  let list = [];
  let index = 0;
  let opener = null;

  function render() {
    const li = list[index];
    const btn = li.querySelector('button');
    const thumb = btn.querySelector('img');
    media.replaceChildren();
    if (btn.dataset.full) {
      const img = new Image();
      img.src = btn.dataset.full;
      img.alt = thumb ? thumb.alt : '';
      img.decoding = 'async';
      media.append(img);
    } else {
      const tile = document.createElement('div');
      tile.className = 'brand-tile';
      tile.innerHTML = '<span class="brand-tile__name"></span><span class="brand-tile__domain"></span>';
      tile.firstChild.textContent = btn.dataset.tileName || '';
      tile.lastChild.textContent = btn.dataset.tileDomain || '';
      media.append(tile);
    }
    pos.textContent = (index + 1) + ' of ' + list.length;
    meta.textContent = li.querySelector('.managed-card__body .meta, .work-card__client').textContent;
    title.textContent = li.querySelector('.managed-card__title, .work-card__title').textContent;
    tags.textContent = li.querySelector('.managed-card__tags, .work-card__tags').textContent;
    desc.innerHTML = li.querySelector('.card-desc').innerHTML;
    if (btn.dataset.url) {
      link.hidden = false;
      link.href = btn.dataset.url;
      link.textContent = 'See it live: ' + (btn.dataset.urlLabel || btn.dataset.url) + ' ↗';
    } else {
      link.hidden = true;
    }
  }

  // Previous/next stay within the card's own section.
  function open(li) {
    list = [...li.closest('[data-group]').querySelectorAll('.managed-card, .work-card')];
    index = list.indexOf(li);
    opener = li.querySelector('button');
    render();
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  const step = (d) => { index = (index + d + list.length) % list.length; render(); };

  cards.forEach((li) => li.querySelector('button').addEventListener('click', () => open(li)));
  q('[data-lb-prev]').addEventListener('click', () => step(-1));
  q('[data-lb-next]').addEventListener('click', () => step(1));
  q('[data-lb-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
})();
