// willpower.codes — shared behavior: nav, theme toggle, platform ticker, hero search demo, service demos, testimonials.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Light/dark theme ──
  // The choice is applied before paint by the inline script in <head>; this keeps the button in sync.
  const themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const sync = () => {
      const dark = root.dataset.theme === 'dark';
      themeBtn.setAttribute('aria-pressed', String(dark));
      if (themeMeta) themeMeta.content = dark ? '#13110E' : '#F7F6F2';
    };
    themeBtn.addEventListener('click', () => {
      if (root.dataset.theme === 'dark') delete root.dataset.theme;
      else root.dataset.theme = 'dark';
      try { localStorage.setItem('wpTheme', root.dataset.theme || 'light'); } catch (e) { /* storage blocked */ }
      sync();
    });
    sync();
  }

  // ── Mobile menu ──
  const header = document.getElementById('site-header');
  const toggle = header && header.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    header.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }));
  }

  // ── Platform ticker pause (WCAG 2.2.2: moving content needs a pause control) ──
  const ticker = document.querySelector('[data-ticker]');
  const tickerPause = ticker && ticker.querySelector('[data-ticker-pause]');
  if (tickerPause) {
    tickerPause.addEventListener('click', () => {
      const paused = ticker.classList.toggle('is-paused');
      tickerPause.setAttribute('aria-pressed', String(paused));
      tickerPause.setAttribute('aria-label', paused ? 'Play scrolling list' : 'Pause scrolling list');
    });
  }

  // Runs `fn` on an interval only while `el` is on screen and the tab is visible.
  function whileVisible(el, ms, fn) {
    if (!el) return;
    let timer = null;
    let onScreen = false;
    const sync = () => {
      const run = onScreen && !document.hidden;
      if (run && !timer) timer = setInterval(fn, ms);
      if (!run && timer) { clearInterval(timer); timer = null; }
    };
    new IntersectionObserver((entries) => { onScreen = entries[0].isIntersecting; sync(); }).observe(el);
    document.addEventListener('visibilitychange', sync);
  }

  // ── Hero search demo ──
  const typedEl = document.querySelector('[data-palette-typed]');
  const listEl = document.querySelector('[data-palette-list]');
  const countEl = document.querySelector('[data-palette-count]');
  const queries = [
    { text: 'migrate our drupal site to a modern stack', results: [
      ['MIG', 'Platform migration & re-platforming', 'Drupal · WordPress · Shopify · Webflow', 'Service'],
      ['DSC', 'Technical discovery & scoping', 'Requirements, architecture, and estimates', 'Service'],
      ['OPS', 'WebOps after launch', 'Updates, monitoring, and triage', 'Service']
    ] },
    { text: 'connect salesforce and hubspot to our site', results: [
      ['CRM', 'CRM & marketing automation', 'Salesforce · HubSpot · Klaviyo', 'Service'],
      ['API', 'Custom integrations', 'REST and GraphQL APIs, webhooks, and Stripe', 'Service'],
      ['AUT', 'Workflow automation', 'Zapier · Make · n8n', 'Service']
    ] },
    { text: 'launch an online store our team can run', results: [
      ['B&B', 'Button & Bug', 'Shopify 2.0 storefront, SEO, and owner training', 'Case study'],
      ['LC', 'Little Colorado', 'Shopify, Amazon, Google Ads, and email', 'Case study'],
      ['ECM', 'Shopify & e-commerce', 'Storefronts, marketplaces, and checkout', 'Service']
    ] },
    { text: 'audit our site for wcag 2.2 aa', results: [
      ['A11', 'Accessibility audit & remediation', 'WCAG 2.2 AA · manual and automated testing', 'Service'],
      ['QA', 'Release QA checklist', 'Accessibility review on every launch', 'Process'],
      ['CWV', 'Performance & SEO baseline', 'Core Web Vitals, structured data, and AI search', 'Service']
    ] },
    { text: 'build a custom web app for our team', results: [
      ['APP', 'Custom web apps', 'Portals, dashboards, and internal tools', 'Service'],
      ['AI', 'AI tools & automation', 'Internal tools and customer-facing AI', 'Service'],
      ['DSC', 'Technical discovery & scoping', 'Requirements, architecture, and estimates', 'Service']
    ] }
  ];

  function renderResults(q) {
    listEl.replaceChildren(...q.results.map((r, i) => {
      const li = document.createElement('li');
      li.className = 'result';
      li.style.animationDelay = (i * 70) + 'ms';
      li.innerHTML = '<span class="result__icon"></span><span class="result__text"><span class="result__title"></span><span class="result__meta"></span></span><span class="result__kind"></span>';
      li.querySelector('.result__icon').textContent = r[0];
      li.querySelector('.result__title').textContent = r[1];
      li.querySelector('.result__meta').textContent = r[2];
      li.querySelector('.result__kind').textContent = r[3];
      return li;
    }));
    countEl.textContent = q.results.length + ' results';
  }

  function renderSkeleton() {
    const li = document.createElement('li');
    li.className = 'skeleton';
    li.innerHTML = '<span></span><span></span><span></span>';
    listEl.replaceChildren(li);
    countEl.textContent = 'Searching…';
  }

  if (typedEl && listEl && !reduceMotion) {
    let qi = 0, n = 0, hold = 0;
    typedEl.textContent = '';
    renderSkeleton();
    whileVisible(typedEl, 48, () => {
      const q = queries[qi];
      if (n < q.text.length) {
        if (n === 0) renderSkeleton();
        n += 1;
        typedEl.textContent = q.text.slice(0, n);
        if (n === q.text.length) { renderResults(q); hold = 0; }
        return;
      }
      hold += 1;
      if (hold > 80) { qi = (qi + 1) % queries.length; n = 0; typedEl.textContent = ''; }
    });
  }

  // ── Accessibility audit demo ──
  const audit = document.querySelector('[data-audit]');
  if (audit) {
    const checks = audit.querySelectorAll('.check');
    const bar = audit.querySelector('[data-audit-bar]');
    const status = audit.querySelector('[data-audit-status]');
    const paint = (step) => {
      const done = Math.min(step, checks.length);
      checks.forEach((c, i) => {
        c.classList.toggle('is-done', i < done);
        c.classList.toggle('is-active', i === done && done < checks.length);
      });
      bar.style.width = (done / checks.length * 100) + '%';
      if (done >= checks.length) {
        if (!status.querySelector('.pill-pass')) status.innerHTML = '<span class="pill-pass">Passed · ready to ship</span>';
      } else {
        status.textContent = 'Auditing… ' + done + ' of ' + checks.length;
      }
    };
    // Five checks, then a long rest on the passed state so the card isn't always busy.
    if (reduceMotion) paint(checks.length);
    else { let t = 0; paint(0); whileVisible(audit, 1000, () => { t = (t + 1) % 14; paint(t); }); }
  }

  // ── AI agent demo ──
  // Alternates an internal tool with a customer-facing one. Step labels stay short so the card keeps one height.
  const agent = document.querySelector('[data-agent]');
  if (agent) {
    const steps = agent.querySelectorAll('.step');
    const out = agent.querySelector('[data-agent-out]');
    const runs = [
      { label: 'Internal agent', file: 'rfp-intake.pdf', result: 'Draft scope ready for review', note: 'Sent to #proposals',
        steps: ['Parse the RFP document', 'Extract requirements & deadlines', 'Map requirements to services', 'Flag risks & open questions', 'Draft scope & estimate ranges'] },
      { label: 'Customer assistant', file: 'live-chat', result: 'Answer sent to the customer', note: 'Resolved in 6 seconds',
        steps: ['Read the customer’s question', 'Look up the order in your store', 'Check the shipping status', 'Draft a reply in your voice', 'Hand off to staff if needed'] }
    ];
    const load = (run) => {
      agent.querySelector('[data-agent-label]').textContent = run.label;
      agent.querySelector('[data-agent-file]').textContent = run.file;
      out.querySelector('[data-agent-result]').textContent = run.result;
      out.querySelector('[data-agent-note]').textContent = run.note;
      steps.forEach((s, i) => { s.lastChild.textContent = run.steps[i]; });
    };
    const paint = (step) => {
      steps.forEach((s, i) => {
        s.classList.toggle('is-done', i < step);
        s.classList.toggle('is-running', i === step && step < steps.length);
      });
      out.classList.toggle('is-shown', step >= steps.length);
    };
    if (reduceMotion) paint(steps.length);
    else {
      const CYCLE = steps.length + 8; // run the steps, then rest on the result
      let t = 0, r = 0;
      paint(t);
      whileVisible(agent, 1100, () => {
        t += 1;
        if (t >= CYCLE) { t = 0; r = (r + 1) % runs.length; load(runs[r]); }
        paint(t);
      });
    }
  }

  // ── Testimonials carousel ──
  const carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    const slides = carousel.querySelectorAll('.quote');
    const dots = carousel.querySelectorAll('[data-carousel-dot]');
    const stage = carousel.querySelector('[data-carousel-stage]');
    const pauseBtn = carousel.querySelector('[data-carousel-pause]');
    const DURATION = 8000;
    let index = 0, progress = 0, paused = reduceMotion, hovering = false, last = 0;

    const show = (i) => {
      index = (i + slides.length) % slides.length;
      progress = 0;
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === index);
        s.setAttribute('aria-hidden', String(k !== index));
      });
      dots.forEach((d, k) => {
        d.setAttribute('aria-current', String(k === index));
        d.querySelector('.dot-btn__fill').style.width = '0%';
      });
    };
    const setPaused = (p) => {
      paused = p;
      pauseBtn.setAttribute('aria-pressed', String(p));
      pauseBtn.setAttribute('aria-label', p ? 'Play testimonials' : 'Pause testimonials');
      stage.setAttribute('aria-live', p ? 'polite' : 'off');
    };
    const frame = (now) => {
      const dt = last ? now - last : 0;
      last = now;
      if (!paused && !hovering && !document.hidden) {
        progress += dt / DURATION;
        if (progress >= 1) show(index + 1);
        dots[index].querySelector('.dot-btn__fill').style.width = (progress * 100) + '%';
      }
      requestAnimationFrame(frame);
    };

    carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => show(index - 1));
    carousel.querySelector('[data-carousel-next]').addEventListener('click', () => show(index + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
    pauseBtn.addEventListener('click', () => setPaused(!paused));
    carousel.addEventListener('mouseenter', () => { hovering = true; });
    carousel.addEventListener('mouseleave', () => { hovering = false; });
    carousel.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) hovering = true; });
    carousel.addEventListener('focusout', (e) => { if (!carousel.contains(e.relatedTarget)) hovering = false; });

    show(0);
    setPaused(paused);
    requestAnimationFrame(frame);
  }
})();
