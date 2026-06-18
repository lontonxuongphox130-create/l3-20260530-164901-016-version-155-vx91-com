(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initFilters() {
    var scopes = document.querySelectorAll("[data-filter-scope]");
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function apply() {
        var q = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-keywords")
          ].join(" "));
          var okText = !q || haystack.indexOf(q) !== -1;
          var okType = !type || normalize(card.getAttribute("data-type")) === type;
          var okRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
          var ok = okText && okType && okRegion;
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, typeSelect, regionSelect].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (input && params.has("q")) {
        input.value = params.get("q") || "";
      }
      apply();
    });
  }

  function attachVideo(video, url) {
    if (!video || !url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  }

  window.SitePlayer = {
    init: function (videoId, url, buttonId) {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video) {
        return;
      }

      attachVideo(video, url);

      function start() {
        if (button) {
          button.classList.add("is-hidden");
        }
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
  };

  ready(function () {
    initMenu();
    initFilters();
  });
}());
