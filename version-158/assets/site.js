(function () {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  function toggleNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('is-open'));
  }

  function initHeroSlider() {
    const stage = document.querySelector('[data-hero-stage]');
    if (!stage) return;
    const slides = Array.from(stage.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(stage.querySelectorAll('[data-hero-dot]'));
    const prev = stage.querySelector('[data-hero-prev]');
    const next = stage.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function start() {
      stop();
      timer = window.setInterval(() => render(index + 1), 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    prev?.addEventListener('click', () => {
      render(index - 1);
      start();
    });
    next?.addEventListener('click', () => {
      render(index + 1);
      start();
    });
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        render(Number(dot.dataset.heroDot || '0'));
        start();
      });
    });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', start);
    render(0);
    start();
  }

  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach((item) => io.observe(item));
  }

  function initPlayer() {
    const video = document.querySelector('[data-m3u8]');
    if (!video) return;
    const source = video.dataset.m3u8;
    const playButton = document.querySelector('[data-player-play]');
    const overlayBtn = playButton;

    function bindSource() {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          maxBufferLength: 20,
          backBufferLength: 10,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          playButton?.classList.add('ready');
        });
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          console.warn('HLS error', event, data);
        });
        video.dataset.hlsLoaded = '1';
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.hlsLoaded = '1';
        return;
      }

      video.insertAdjacentHTML(
        'afterend',
        '<p class="player-fallback">当前浏览器不支持 HLS 播放，请使用支持 m3u8 的浏览器。</p>'
      );
    }

    const setup = () => {
      if (!video.dataset.hlsLoaded) bindSource();
      video.play().catch(() => {});
      playButton?.remove();
      overlayBtn?.remove();
    };

    playButton?.addEventListener('click', setup);
    video.addEventListener('click', () => {
      if (video.paused) {
        setup();
      }
    });
    // Preload the source so the video is ready when the user presses play.
    bindSource();
  }

  function initSearch() {
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    const summary = document.querySelector('[data-search-summary]');
    if (!input || !results || !summary || !window.MOVIES) return;

    const state = {
      query: '',
      filter: 'all',
    };

    function matches(movie, query, filter) {
      const q = query.trim().toLowerCase();
      const haystack = [
        movie.title,
        movie.region,
        movie.genre,
        movie.oneLine,
        ...(movie.tags || []),
        movie.year,
      ].join(' ').toLowerCase();
      const keywordOk = !q || haystack.includes(q);
      if (!keywordOk) return false;
      if (filter === 'all') return true;
      return haystack.includes(String(filter).toLowerCase());
    }

    function render() {
      const filtered = window.MOVIES.filter((movie) => matches(movie, state.query, state.filter));
      summary.textContent = `共找到 ${filtered.length} 部影片，当前展示前 ${Math.min(filtered.length, 48)} 部。`;
      results.innerHTML = filtered.slice(0, 48).map((movie) => `
        <article class="movie-card">
          <a class="movie-link" href="${movie.url}">
            <div class="poster-wrap">
              <img src="${movie.poster}" alt="${movie.title} 海报" loading="lazy">
              <div class="poster-overlay">
                <span class="badge">${movie.year}</span>
                <span class="badge badge-soft">${movie.region}</span>
              </div>
            </div>
            <div class="movie-body">
              <h3>${movie.title}</h3>
              <p class="movie-meta">${movie.genre}</p>
              <p class="movie-line">${movie.oneLine}</p>
              <div class="movie-footer">
                <span class="rating">★ ${movie.rating}</span>
                <span class="play-link">查看详情</span>
              </div>
            </div>
          </a>
        </article>
      `).join('');
    }

    input.addEventListener('input', () => {
      state.query = input.value;
      render();
    });

    document.querySelectorAll('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach((el) => el.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.filter = btn.dataset.filter || 'all';
        render();
      });
    });

    render();
  }

  function initBackToTop() {
    const btn = document.querySelector('[data-back-top]');
    if (!btn) return;
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  ready(() => {
    toggleNav();
    initHeroSlider();
    initReveal();
    initPlayer();
    initSearch();
    initBackToTop();
  });
})();
