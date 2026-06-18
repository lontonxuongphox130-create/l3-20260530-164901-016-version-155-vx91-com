(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const drop = document.querySelector('.category-drop');
  const dropButton = document.querySelector('.category-drop-button');

  if (drop && dropButton) {
    dropButton.addEventListener('click', function () {
      drop.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dots button'));
  let heroIndex = 0;
  let heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      window.clearInterval(heroTimer);
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  const quickSearch = document.querySelector('[data-quick-search]');
  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = quickSearch.querySelector('input');
      const value = input ? input.value.trim() : '';
      const target = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.location.href = target;
    });
  }

  const filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    const cards = Array.from(filterRoot.querySelectorAll('.movie-card'));
    const keyword = document.querySelector('[data-filter-keyword]');
    const year = document.querySelector('[data-filter-year]');
    const region = document.querySelector('[data-filter-region]');
    const category = document.querySelector('[data-filter-category]');
    const empty = document.querySelector('[data-empty-hint]');

    const params = new URLSearchParams(window.location.search);
    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function matchCard(card) {
      const q = keyword ? keyword.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const r = region ? region.value : '';
      const c = category ? category.value : '';
      const text = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.textContent
      ].join(' ').toLowerCase();

      if (q && text.indexOf(q) === -1) {
        return false;
      }
      if (y && card.dataset.year !== y) {
        return false;
      }
      if (r && card.dataset.region !== r) {
        return false;
      }
      if (c && card.dataset.category !== c) {
        return false;
      }
      return true;
    }

    function applyFilters() {
      let visible = 0;
      cards.forEach(function (card) {
        const show = matchCard(card);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [keyword, year, region, category].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function attachVideo(card) {
    const video = card.querySelector('video');
    const button = card.querySelector('.play-layer');

    if (!video || !button) {
      return;
    }

    const src = video.getAttribute('data-video') || '';
    let ready = false;

    function prepare() {
      if (ready || !src) {
        return;
      }
      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            card.classList.add('error');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    }

    function begin() {
      prepare();
      const playPromise = video.play();
      card.classList.add('playing');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          card.classList.remove('playing');
        });
      }
    }

    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function () {
      card.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        card.classList.remove('playing');
      }
    });
  }

  document.querySelectorAll('.player-card').forEach(attachVideo);
}());
