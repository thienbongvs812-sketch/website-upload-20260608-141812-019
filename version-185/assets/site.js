(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterInput = document.querySelector('[data-card-filter]');
  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var activeChip = '';

  function applyCardFilter() {
    var inputValue = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var chipValue = activeChip.toLowerCase();

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var inputMatch = !inputValue || haystack.indexOf(inputValue) !== -1;
      var chipMatch = !chipValue || haystack.indexOf(chipValue) !== -1;
      card.classList.toggle('is-hidden', !(inputMatch && chipMatch));
    });
  }

  if (filterInput && cards.length) {
    filterInput.addEventListener('input', applyCardFilter);
  }

  chipButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      chipButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });

      button.classList.add('is-active');
      activeChip = button.getAttribute('data-filter-chip') || '';
      applyCardFilter();
    });
  });
}());

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var startButton = document.querySelector('[data-player-start]');
  var hlsInstance = null;
  var attached = false;

  if (!video || !startButton || !streamUrl) {
    return;
  }

  function attachVideo() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    attachVideo();
    video.controls = true;
    startButton.classList.add('is-hidden');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  startButton.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

function initSearchPage() {
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var count = document.querySelector('[data-search-count]');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var data = window.SITE_SEARCH_DATA || [];

  if (!results) {
    return;
  }

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createCard(movie) {
    return ''
      + '<article class="movie-card">'
      + '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">'
      + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
      + '<span class="movie-mask"></span>'
      + '<span class="play-pill">播放</span>'
      + '</a>'
      + '<div class="movie-card-body">'
      + '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>'
      + '<p>' + escapeHtml(movie.description) + '</p>'
      + '<div class="movie-meta">'
      + '<span>' + escapeHtml(movie.year) + '</span>'
      + '<span>' + escapeHtml(movie.region) + '</span>'
      + '<span>' + escapeHtml(movie.type) + '</span>'
      + '</div>'
      + '</div>'
      + '</article>';
  }

  function render(value) {
    var keyword = value.trim().toLowerCase();
    var list = data.filter(function (movie) {
      return !keyword || movie.search.indexOf(keyword) !== -1;
    });

    if (title) {
      title.textContent = keyword ? '搜索结果' : '全部影片';
    }

    if (count) {
      count.textContent = list.length + ' 部影片';
    }

    results.innerHTML = list.slice(0, 240).map(createCard).join('');
  }

  render(query);

  if (input) {
    input.addEventListener('input', function () {
      render(input.value || '');
    });
  }
}
