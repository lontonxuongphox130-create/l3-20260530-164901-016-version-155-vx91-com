(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var siteNav = document.querySelector(".site-nav");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startSlides() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
      startSlides();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(current - 1);
      startSlides();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startSlides();
    });
  }

  startSlides();

  var searchInput = document.querySelector(".catalog-search");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid .movie-card"));
  var empty = document.querySelector(".empty-state");
  var activeFilter = "all";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(searchInput ? searchInput.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var kind = card.getAttribute("data-kind") || "movie";
      var matchText = !keyword || haystack.indexOf(keyword) !== -1;
      var matchKind = activeFilter === "all" || kind === activeFilter;
      var keep = matchText && matchKind;
      card.hidden = !keep;
      if (keep) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applyFilters();
    });
  });
}());
