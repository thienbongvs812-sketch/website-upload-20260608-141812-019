(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var form = panel.querySelector("[data-filter-form]");
        var input = panel.querySelector("[data-filter-input]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var countNode = panel.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && input) {
            input.value = query;
        }

        function update() {
            var keyword = normalize(input ? input.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.category,
                    card.textContent
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var matchesType = !type || normalize(card.dataset.type) === type;
                var isVisible = matchesKeyword && matchesYear && matchesType;
                card.classList.toggle("is-hidden", !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = String(visible);
            }
        }

        [input, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });

        if (form) {
            form.addEventListener("reset", function () {
                window.setTimeout(update, 0);
            });
        }

        update();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var message = player.querySelector("[data-player-message]");
            var source = video ? video.dataset.source : "";
            var hls = null;
            var loaded = false;

            if (!video || !source) {
                if (message) {
                    message.textContent = "当前页面没有可用视频";
                }
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || "";
                }
            }

            function attachSource() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                setMessage("正在加载视频...");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage("");
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setMessage("网络加载异常，正在重试...");
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setMessage("媒体解析异常，正在恢复...");
                            hls.recoverMediaError();
                        } else {
                            setMessage("视频暂时无法加载，请稍后再试。");
                            hls.destroy();
                        }
                    });
                    return Promise.resolve();
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    setMessage("");
                    return Promise.resolve();
                }

                setMessage("当前浏览器不支持此视频播放，请使用现代浏览器访问。");
                return Promise.reject(new Error("HLS is not supported"));
            }

            function play() {
                attachSource().then(function () {
                    return video.play();
                }).then(function () {
                    player.classList.add("is-playing");
                    setMessage("");
                }).catch(function () {
                    if (loaded) {
                        setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
                    }
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
