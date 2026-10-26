// willpower.codes — shared behavior: nav, scroll reveal, hero search demo, service demos, testimonials.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // ── Scroll reveal ──
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
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
      ['MIG', 'Platform migration & re-platforming', 'Drupal · WordPress · Shopify · headless', 'Service'],
      ['DSC', 'Technical discovery & scoping', 'Requirements, architecture, and estimates', 'Service'],
      ['PM', 'Projects I’ve managed', 'Denver International Airport, E-470, Colorado AG, and more', 'Portfolio'],
      ['OPS', 'WebOps after launch', 'Updates, monitoring, and triage', 'Service']
    ] },
    { text: 'connect salesforce and hubspot to our site', results: [
      ['PCU', 'Project C.U.R.E.', 'WordPress with HubSpot, Salesforce, Classy, and Stripe', 'Project'],
      ['NCV', 'Native Campervans', 'Store automation into Airtable and Salesforce', 'Project'],
      ['CRM', 'CRM & marketing automation', 'Salesforce · HubSpot · Zapier · n8n', 'Service']
    ] },
    { text: 'launch an online store our team can run', results: [
      ['HPD', 'Hale Pet Door', 'Store build, wholesale storefronts, ERP, and ShipStation', 'Project'],
      ['B&B', 'Button & Bug', 'Shopify 2.0 storefront, SEO, and owner training', 'Case study'],
      ['ECM', 'Shopify & e-commerce', 'Storefronts, marketplaces, and checkout', 'Service']
    ] },
    { text: 'audit our site for wcag 2.2 aa', results: [
      ['A11', 'Accessibility audit & remediation', 'WCAG 2.2 AA · manual and automated testing', 'Service'],
      ['QA', 'Release QA checklist', 'Accessibility review on every launch', 'Process'],
      ['CWV', 'Performance & SEO baseline', 'Core Web Vitals, structured data, and AI search', 'Service']
    ] },
    { text: 'build a custom web app for our team', results: [
      ['E470', 'E-470', 'Live highway camera web app', 'Project'],
      ['CAG', 'Colorado Attorney General', 'Custom training platform on WordPress', 'Project'],
      ['AI', 'AI tooling for teams', 'Workflow automation with Claude and GPT', 'Service']
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
    if (reduceMotion) paint(checks.length);
    else { let t = 0; paint(0); whileVisible(audit, 900, () => { t = (t + 1) % 9; paint(t); }); }
  }

  // ── AI agent demo ──
  const agent = document.querySelector('[data-agent]');
  if (agent) {
    const steps = agent.querySelectorAll('.step');
    const out = agent.querySelector('[data-agent-out]');
    const paint = (step) => {
      steps.forEach((s, i) => {
        s.classList.toggle('is-done', i < step);
        s.classList.toggle('is-running', i === step && step < steps.length);
      });
      if (step >= steps.length) {
        if (!out.firstChild) out.innerHTML = '<div class="agent__result"><strong>Draft scope ready for review</strong><span>Sent to <span class="mono">#proposals</span></span></div>';
      } else {
        out.replaceChildren();
      }
    };
    if (reduceMotion) paint(steps.length);
    else { let t = 3; paint(t); whileVisible(agent, 900, () => { t = (t + 1) % 8; paint(t); }); }
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
