(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function setupFilter(scopeId) {
    var grid = document.getElementById(scopeId);
    var input = document.querySelector('[data-filter-input="' + scopeId + '"]');
    var yearSelect = document.querySelector('[data-year-filter="' + scopeId + '"]');
    var empty = document.querySelector('[data-empty-state="' + scopeId + '"]');

    if (!grid || (!input && !yearSelect)) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
        var yearMatches = !year || card.getAttribute('data-year') === year;
        var textMatches = !keyword || text.indexOf(keyword) !== -1 || card.getAttribute('data-year') === keyword;
        var show = yearMatches && textMatches;

        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
  }

  setupFilter('category-grid');

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function movieCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + movie.year + '" data-region="' + escapeHtml(movie.region) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '" data-category="' + escapeHtml(movie.category) + '">' +
      '<a href="' + movie.link + '" class="card-media" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="card-year">' + movie.year + '</span>' +
      '<span class="card-play">▶</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="' + movie.link + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-tags">' + tags + '</div>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + movie.views + '</span></div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var searchResults = document.getElementById('search-results');
  var searchBox = document.querySelector('[data-search-box]');
  var searchEmpty = document.querySelector('[data-search-empty]');

  if (searchResults && searchBox && window.SEARCH_MOVIES) {
    var initialQuery = getQuery();
    searchBox.value = initialQuery;

    function renderSearch() {
      var keyword = searchBox.value.trim().toLowerCase();

      if (!keyword) {
        searchResults.innerHTML = '';
        if (searchEmpty) {
          searchEmpty.textContent = '请输入关键词开始搜索';
          searchEmpty.classList.add('show');
        }
        return;
      }

      var result = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.category,
          movie.year,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();

        return text.indexOf(keyword) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = result.map(movieCard).join('');

      if (searchEmpty) {
        searchEmpty.textContent = result.length ? '' : '没有找到匹配影片';
        searchEmpty.classList.toggle('show', result.length === 0);
      }
    }

    searchBox.addEventListener('input', renderSearch);
    renderSearch();
  }
}());

function initMoviePlayer(videoId, buttonId, videoUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hls = null;

  if (!video) {
    return;
  }

  function attachSource() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else {
      video.src = videoUrl;
    }
  }

  function playVideo() {
    attachSource();

    if (button) {
      button.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (button && video.currentTime === 0) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
