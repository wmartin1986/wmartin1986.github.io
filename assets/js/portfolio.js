// willpower.codes — portfolio page: category filters and the project detail view.
(() => {
  const chips = [...document.querySelectorAll('[data-filter]')];
  const managedGroup = document.querySelector('[data-group="managed"]');
  const workGroup = document.querySelector('[data-group="work"]');
  const managedCards = [...document.querySelectorAll('.managed-card')];
  const workCards = [...document.querySelectorAll('.work-card')];
  const workTitle = document.querySelector('[data-work-title]');
  const workCount = document.querySelector('[data-work-count]');
  const totalEl = document.querySelector('[data-count-total]');

  // ── Filters ──
  const countFor = (f) => {
    if (f === 'all') return managedCards.length + workCards.length;
    if (f === 'managed') return managedCards.length;
    return workCards.filter((c) => c.dataset.cat === f).length;
  };
  const labelFor = (chip) => chip.firstChild.textContent.trim();
  chips.forEach((chip) => { chip.querySelector('.chip__count').textContent = countFor(chip.dataset.filter); });
  if (totalEl) totalEl.textContent = countFor('all');

  function applyFilter(f) {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
    managedGroup.hidden = !(f === 'all' || f === 'managed');
    workGroup.hidden = f === 'managed';
    let shown = 0;
    workCards.forEach((c) => {
      const on = f === 'all' || c.dataset.cat === f;
      c.hidden = !on;
      if (on) shown += 1;
    });
    workTitle.textContent = f === 'all' ? 'Design & build work' : labelFor(chips.find((c) => c.dataset.filter === f));
    workCount.textContent = shown + (shown === 1 ? ' piece' : ' pieces');
  }
  chips.forEach((chip) => chip.addEventListener('click', () => applyFilter(chip.dataset.filter)));
  applyFilter('all');

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

  function open(li) {
    const group = li.classList.contains('managed-card') ? managedCards : workCards;
    list = group.filter((c) => !c.hidden);
    index = list.indexOf(li);
    opener = li.querySelector('button');
    render();
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  const step = (d) => { index = (index + d + list.length) % list.length; render(); };

  [...managedCards, ...workCards].forEach((li) => li.querySelector('button').addEventListener('click', () => open(li)));
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
