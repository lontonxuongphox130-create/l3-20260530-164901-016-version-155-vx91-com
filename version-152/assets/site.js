
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setActiveNav() {
    const path = location.pathname.replace(/\/+$|^\//g, '/');
    $$('.nav a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (!href || href === '#') return;
      if (path === href || path.endsWith(href)) a.classList.add('active');
    });
  }

  function initBackTop() {
    const btn = $('#backTop');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const onScroll = () => { btn.classList.toggle('hidden', window.scrollY < 450); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initHero() {
    const hero = $('[data-hero-carousel]');
    if (!hero) return;
    const slides = $$('.hero-slide', hero);
    const indicators = $$('.hero-dot', hero);
    const title = $('[data-hero-title]', hero);
    const lead = $('[data-hero-lead]', hero);
    const cta = $('[data-hero-cta]', hero);
    const meta = $('[data-hero-meta]', hero);
    const poster = $('[data-hero-poster]', hero);
    let index = 0;
    let timer = null;

    function activate(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === index));
      indicators.forEach((d, idx) => d.classList.toggle('active', idx === index));
      const active = slides[index];
      if (!active) return;
      if (title) title.textContent = active.dataset.title || '';
      if (lead) lead.textContent = active.dataset.lead || '';
      if (cta) cta.href = active.dataset.href || '#';
      if (meta) meta.textContent = active.dataset.meta || '';
      if (poster) poster.style.setProperty('--poster-bg', active.dataset.posterBg || 'linear-gradient(135deg, #111827, #334155)');
    }

    function start() {
      stop();
      timer = window.setInterval(() => activate(index + 1), 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    indicators.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        activate(idx);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function filterCards(list, query) {
    const q = (query || '').trim().toLowerCase();
    list.forEach((card) => {
      if (!q) {
        card.classList.remove('hidden');
        return;
      }
      const hay = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genres,
        card.dataset.tags,
        card.textContent,
      ].join(' ').toLowerCase();
      card.classList.toggle('hidden', !hay.includes(q));
    });
  }

  function initLiveSearch() {
    const input = $('[data-live-search]');
    const cards = $$('[data-search-card]');
    const count = $('[data-search-count]');
    if (!input || !cards.length) return;
    const update = () => {
      filterCards(cards, input.value);
      if (count) count.textContent = String(cards.filter((c) => !c.classList.contains('hidden')).length);
    };
    input.addEventListener('input', update);
    update();
  }

  function initDatasetSearch() {
    const app = $('[data-search-app]');
    if (!app || !window.MOVIE_DATA) return;
    const input = $('[data-search-input]', app);
    const results = $('[data-search-results]', app);
    const count = $('[data-search-count]', app);
    const total = $('[data-search-total]', app);
    const chips = $$('.chip', app);
    const sortSel = $('[data-sort-select]', app);
    const category = app.dataset.category || '';

    let activeChip = '';

    const sorted = () => {
      let arr = window.MOVIE_DATA.slice();
      if (category) arr = arr.filter((x) => x.primary_slug === category || x.genres.includes(category));
      const q = (input?.value || '').trim().toLowerCase();
      if (q) {
        arr = arr.filter((x) => {
          const hay = [x.title, x.year, x.type, x.region, x.genres.join(' '), x.tags.join(' '), x.one_line].join(' ').toLowerCase();
          return hay.includes(q);
        });
      }
      if (activeChip) {
        arr = arr.filter((x) => x.genres.includes(activeChip) || x.tags.includes(activeChip));
      }
      if (sortSel) {
        const val = sortSel.value;
        if (val === 'year-desc') arr.sort((a, b) => Number(b.year) - Number(a.year) || b.score - a.score);
        else if (val === 'year-asc') arr.sort((a, b) => Number(a.year) - Number(b.year) || b.score - a.score);
        else if (val === 'score-desc') arr.sort((a, b) => b.score - a.score || Number(b.year) - Number(a.year));
      }
      return arr;
    };

    const render = () => {
      const arr = sorted();
      if (count) count.textContent = String(arr.length);
      if (total) total.textContent = String(window.MOVIE_DATA.length);
      results.innerHTML = arr.slice(0, 120).map((x) => {
        const bg = pickBg(x.title + x.region + x.year);
        return `
          <a class="movie-card" href="${x.url}" data-search-card data-title="${esc(x.title)}" data-year="${esc(x.year)}" data-type="${esc(x.type)}" data-region="${esc(x.region)}" data-genres="${esc(x.genres.join(' '))}" data-tags="${esc(x.tags.join(' '))}">
            <div class="poster" style="--poster-bg:${bg}">
              <span class="poster-meta">${esc(x.year)} · ${esc(x.type)}</span>
              <div class="poster-number">${esc(x.code)}</div>
            </div>
            <div class="movie-body">
              <h3 class="movie-title">${esc(x.title)}</h3>
              <p class="movie-desc">${esc(x.one_line || '')}</p>
              <div class="movie-foot"><span>${esc(x.region)}</span><span>热度 ${x.score}</span></div>
              <div class="movie-tags">${x.genres.slice(0, 3).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</div>
            </div>
          </a>
        `;
      }).join('');
    };

    function esc(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function pickBg(seed) {
      const palettes = [
        'linear-gradient(135deg, #0f172a, #4c1d95)',
        'linear-gradient(135deg, #111827, #7f1d1d)',
        'linear-gradient(135deg, #0b1120, #1d4ed8)',
        'linear-gradient(135deg, #111827, #0f766e)',
        'linear-gradient(135deg, #0f172a, #ec4899)',
        'linear-gradient(135deg, #111827, #92400e)',
        'linear-gradient(135deg, #0b1020, #1e40af)',
        'linear-gradient(135deg, #111827, #14532d)',
      ];
      let h = 0;
      for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      return palettes[h % palettes.length];
    }

    input?.addEventListener('input', render);
    sortSel?.addEventListener('change', render);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        activeChip = chip.dataset.genre || '';
        render();
      });
    });
    const reset = $('[data-chip-reset]', app);
    if (reset) reset.addEventListener('click', () => {
      activeChip = '';
      chips.forEach((c) => c.classList.remove('active'));
      render();
    });
    render();
  }

  function initHashJump() {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  function init() {
    setActiveNav();
    initBackTop();
    initHero();
    initLiveSearch();
    initDatasetSearch();
    initHashJump();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
