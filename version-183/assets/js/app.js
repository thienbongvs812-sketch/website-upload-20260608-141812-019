(function () {
  'use strict';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initHeader() {
    var header = qs('[data-header]');
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (header) {
      var update = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
    }

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function initSearchPage() {
    var main = qs('[data-page="search"]');
    if (!main) {
      return;
    }

    var query = getQueryValue('q').trim().toLowerCase();
    var input = qs('[data-search-input]', main);
    var summary = qs('[data-search-summary]', main);
    var cards = qsa('[data-search]', main);

    if (input) {
      input.value = getQueryValue('q');
    }

    var matched = 0;
    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var visible = !query || haystack.indexOf(query) !== -1;
      card.hidden = !visible;
      if (visible) {
        matched += 1;
      }
    });

    if (summary) {
      if (query) {
        summary.textContent = '关键词“' + getQueryValue('q') + '”找到 ' + matched + ' 个相关结果。';
      } else {
        summary.textContent = '当前展示完整片库，可输入关键词筛选影片、类型、地区、年份或标签。';
      }
    }
  }

  function initMoviePlayer() {
    var player = qs('[data-player]');
    if (!player) {
      return;
    }

    var video = qs('.movie-player', player);
    var overlay = qs('[data-player-toggle]', player);
    var loading = qs('[data-player-loading]', player);
    var errorBox = qs('[data-player-error]', player);

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function setLoading(value) {
      if (loading) {
        loading.hidden = !value;
      }
    }

    function showError(message) {
      setLoading(false);
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }
    }

    function clearError() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }
    }

    function bindNativeSource() {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setLoading(false);
        clearError();
      }, { once: true });
    }

    if (!source) {
      showError('未找到播放源');
      return;
    }

    setLoading(true);

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setLoading(false);
        clearError();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          showError('播放源网络异常，正在尝试重新加载');
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          showError('媒体加载异常，正在尝试恢复播放');
          hlsInstance.recoverMediaError();
        } else {
          showError('当前浏览器无法加载此播放源');
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      bindNativeSource();
    } else {
      bindNativeSource();
      video.addEventListener('error', function () {
        showError('当前浏览器不支持此 HLS 播放源');
      });
    }

    function togglePlay() {
      if (video.paused) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            showError('浏览器阻止了自动播放，请再次点击播放按钮');
          });
        }
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', function (event) {
      if (event.target === video) {
        togglePlay();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initSearchPage();
    initMoviePlayer();
  });
})();
