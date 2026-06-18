(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var searchParams = new URLSearchParams(window.location.search);
  var initialQuery = searchParams.get('q') || '';
  var searchInput = document.querySelector('[data-filter-search]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function cardMatchesYear(card, value) {
    if (value === 'all') {
      return true;
    }
    var year = parseInt(card.getAttribute('data-year') || '0', 10);
    if (value === 'older') {
      return year <= 2022;
    }
    return String(year) === value;
  }

  function applyFilters() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : 'all';
    var type = typeSelect ? typeSelect.value : 'all';
    var year = yearSelect ? yearSelect.value : 'all';

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }
      if (region !== 'all' && cardRegion.indexOf(region) === -1) {
        matched = false;
      }
      if (type !== 'all' && cardType.indexOf(type) === -1) {
        matched = false;
      }
      if (!cardMatchesYear(card, year)) {
        matched = false;
      }
      card.classList.toggle('is-hidden', !matched);
    });
  }

  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }
  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });
  if (cards.length) {
    applyFilters();
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-player-overlay]');
    var button = shell.querySelector('[data-play-button]');
    var stream = shell.getAttribute('data-stream');
    var hls = null;
    var attached = false;

    function attach() {
      if (!video || !stream || attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      attached = true;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
