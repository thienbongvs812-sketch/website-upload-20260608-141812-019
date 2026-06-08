(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
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
            }, 5000);
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

    function initRails() {
        selectAll('[data-rail]').forEach(function (rail) {
            var section = rail.closest('section') || document;
            var prev = section.querySelector('[data-rail-prev]');
            var next = section.querySelector('[data-rail-next]');
            function move(direction) {
                rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
            }
            if (prev) {
                prev.addEventListener('click', function () {
                    move(-1);
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    move(1);
                });
            }
        });
    }

    function initSearchAndFilters() {
        var input = document.querySelector('[data-search-input]');
        var area = document.querySelector('[data-search-area]');
        var empty = document.querySelector('[data-empty-message]');
        var tabs = document.querySelector('[data-filter-tabs]');
        var activeFilter = 'all';
        if (!area) {
            return;
        }
        var cards = selectAll('[data-card]', area);

        function matchesSearch(card, query) {
            if (!query) {
                return true;
            }
            var value = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-meta') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            return value.indexOf(query) !== -1;
        }

        function matchesFilter(card) {
            if (activeFilter === 'all') {
                return true;
            }
            return card.getAttribute('data-bucket') === activeFilter;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var isVisible = matchesSearch(card, query) && matchesFilter(card);
                card.classList.toggle('is-hidden-by-search', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (tabs) {
            selectAll('[data-filter-value]', tabs).forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter-value') || 'all';
                    selectAll('[data-filter-value]', tabs).forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });
        }
        apply();
    }

    function initPlayer(source, poster) {
        var video = document.querySelector('[data-player]');
        var overlay = document.querySelector('[data-play-overlay]');
        var hls = null;
        var started = false;
        if (!video || !source) {
            return;
        }
        if (poster) {
            video.setAttribute('poster', poster);
        }

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', attach);
        }
        video.addEventListener('click', function () {
            if (!started) {
                attach();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initRails();
        initSearchAndFilters();
    });
})();
