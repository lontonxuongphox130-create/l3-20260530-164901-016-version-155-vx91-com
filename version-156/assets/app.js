(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      });
    });

    initHero();
    initFilters();
    initPlayers();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    restart();
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    var list = document.querySelector("[data-card-list]");
    if (!root || !list) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(root.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    selects.forEach(function (select) {
      var name = select.getAttribute("data-filter-select");
      var value = params.get(name);
      if (value) {
        select.value = value;
      }
    });
    var genreParam = params.get("genre");
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var filterValues = {};
      selects.forEach(function (select) {
        filterValues[select.getAttribute("data-filter-select")] = select.value;
      });
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        Object.keys(filterValues).forEach(function (key) {
          var value = filterValues[key];
          if (value && card.getAttribute("data-" + key) !== value) {
            matched = false;
          }
        });
        if (genreParam && haystack.indexOf(genreParam.toLowerCase()) === -1) {
          matched = false;
        }
        card.classList.toggle("is-filtered", !matched);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function initPlayers() {
    document.querySelectorAll(".player-panel").forEach(function (panel) {
      var video = panel.querySelector("video[data-src]");
      var trigger = panel.querySelector("[data-player-trigger]");
      if (!video) {
        return;
      }
      var started = false;
      function start() {
        if (!started) {
          started = true;
          bindHls(video, video.getAttribute("data-src"));
        }
        if (trigger) {
          trigger.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      if (trigger) {
        trigger.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
    });
  }

  function bindHls(video, src) {
    if (!src) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }
    video.src = src;
  }
})();
