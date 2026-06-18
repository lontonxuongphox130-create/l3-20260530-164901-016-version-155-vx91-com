(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var toggle = $('[data-menu-toggle]');
        var panel = $('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        var panels = $all('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.parentElement ? $('[data-search-scope]', panel.parentElement) : null;
            if (!scope) {
                scope = $('[data-search-scope]');
            }
            if (!scope) {
                return;
            }
            var input = $('[data-search-input]', panel);
            var filters = $all('[data-filter]', panel);
            var reset = $('[data-reset-filter]', panel);
            var cards = $all('.movie-card', scope);
            var counter = panel.parentElement ? $('[data-result-count]', panel.parentElement) : null;

            function apply() {
                var query = normalize(input ? input.value : '');
                var activeFilters = {};
                filters.forEach(function (select) {
                    activeFilters[select.getAttribute('data-filter')] = normalize(select.value);
                });
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    var ok = !query || haystack.indexOf(query) !== -1;
                    Object.keys(activeFilters).forEach(function (key) {
                        var value = activeFilters[key];
                        if (value && normalize(card.dataset[key]) !== value) {
                            ok = false;
                        }
                    });
                    card.classList.toggle('is-hidden-by-filter', !ok);
                    if (ok) {
                        shown += 1;
                    }
                });
                if (counter) {
                    counter.textContent = '当前显示 ' + shown + ' 部影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            filters.forEach(function (select) {
                select.addEventListener('change', apply);
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    filters.forEach(function (select) {
                        select.value = '';
                    });
                    apply();
                });
            }
            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get('q');
            if (queryParam && input) {
                input.value = queryParam;
            }
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
})();
