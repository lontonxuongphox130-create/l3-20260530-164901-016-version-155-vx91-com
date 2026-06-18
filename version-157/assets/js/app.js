(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-site-search]");
      var typeFilter = scope.querySelector("[data-type-filter]");
      var yearFilter = scope.querySelector("[data-year-filter]");
      var sortSelect = scope.querySelector("[data-sort]");
      var grid = scope.querySelector("[data-card-grid]");
      var counter = scope.querySelector("[data-result-count]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

      if (!cards.length) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var queryParam = params.get("q");
      if (queryParam && input && !input.value) {
        input.value = queryParam;
      }

      function matches(card) {
        var query = normalize(input ? input.value : "");
        var typeValue = typeFilter ? typeFilter.value : "all";
        var yearValue = yearFilter ? yearFilter.value : "all";
        var haystack = normalize(card.getAttribute("data-search"));
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passType = typeValue === "all" || type === typeValue;
        var passYear = yearValue === "all" || year === yearValue;
        return passQuery && passType && passYear;
      }

      function sortCards(list) {
        if (!sortSelect || !grid) {
          return list;
        }
        var mode = sortSelect.value;
        return list.slice().sort(function (a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year-num")) - Number(a.getAttribute("data-year-num"));
          }
          if (mode === "score") {
            return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
          }
          if (mode === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          return Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
        });
      }

      function apply() {
        var sorted = sortCards(cards);
        if (grid) {
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (counter) {
          counter.textContent = "当前显示 " + visible + " 部，共 " + cards.length + " 部";
        }
      }

      [input, typeFilter, yearFilter, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-hls-src]"));
    videos.forEach(function (video) {
      var source = video.getAttribute("data-hls-src");
      var shell = video.closest("[data-player]");
      var loaded = false;
      var hls = null;

      function loadSource() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        }
      }

      function playVideo() {
        loadSource();
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (shell) {
        Array.prototype.slice.call(shell.querySelectorAll("[data-play-button]")).forEach(function (button) {
          button.addEventListener("click", playVideo);
        });
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
      });
      video.addEventListener("pause", function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("loadedmetadata", function () {
        if (hls && hls.startLoad) {
          hls.startLoad();
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
