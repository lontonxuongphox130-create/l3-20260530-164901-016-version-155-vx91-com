import { H as Hls } from "./hls.js";

const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function setupMobileNavigation() {
  const toggle = select("[data-mobile-toggle]");
  const nav = select("[data-mobile-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.textContent = nav.classList.contains("open") ? "×" : "☰";
  });
}

function setupMovieSearch() {
  const input = select("[data-movie-search]");
  const cards = selectAll("[data-movie-card]");
  const counter = select("[data-result-count]");
  if (!input || cards.length === 0) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q");
  if (initialQuery) {
    input.value = initialQuery;
  }
  const applyFilter = () => {
    const query = normalize(input.value);
    let visible = 0;
    cards.forEach((card) => {
      const text = normalize(`${card.dataset.title || ""} ${card.dataset.meta || ""} ${card.textContent || ""}`);
      const matched = !query || text.includes(query);
      card.classList.toggle("is-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (counter) {
      counter.textContent = `${visible} 部影片`;
    }
  };
  input.addEventListener("input", applyFilter);
  applyFilter();
}

function setupPlayers() {
  selectAll("video[data-src]").forEach((video) => {
    const shell = video.closest(".player-shell");
    const overlay = shell ? select("[data-play-overlay]", shell) : null;
    const source = video.dataset.src;
    let initialized = false;
    let hlsInstance = null;

    const initialize = () => {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.addEventListener("error", () => {
        if (shell) {
          shell.dataset.playerState = "error";
        }
      });
    };

    const start = async () => {
      initialize();
      if (shell) {
        shell.classList.add("has-started");
      }
      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    };

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", () => {
      if (!initialized) {
        start();
      }
    });
    video.addEventListener("play", () => {
      if (shell) {
        shell.classList.add("has-started");
      }
    });
    window.addEventListener("beforeunload", () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

function setupSmoothHash() {
  selectAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = select(link.getAttribute("href"));
      if (!target) {
        return;
      }
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  setupMovieSearch();
  setupPlayers();
  setupSmoothHash();
});
