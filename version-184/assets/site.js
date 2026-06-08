(function() {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      const isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        window.clearInterval(timer);
        showSlide(Number(dot.dataset.heroDot));
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  document.querySelectorAll('[data-filter-root]').forEach(function(root) {
    const input = root.querySelector('[data-filter-input]');
    const year = root.querySelector('[data-filter-year]');
    const type = root.querySelector('[data-filter-type]');
    const list = root.parentElement.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    const cards = Array.from(list.children);

    function applyFilter() {
      const query = input ? input.value.trim().toLowerCase() : '';
      const yearValue = year ? year.value : '';
      const typeValue = type ? type.value : '';

      cards.forEach(function(card) {
        const text = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre
        ].join(' ').toLowerCase();
        const matchQuery = !query || text.includes(query);
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const matchType = !typeValue || card.dataset.type === typeValue;
        card.classList.toggle('is-filter-hidden', !(matchQuery && matchYear && matchType));
      });
    }

    [input, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  const searchRoot = document.querySelector('[data-search-page]');
  if (searchRoot && window.MOVIE_SEARCH_INDEX) {
    const input = searchRoot.querySelector('[data-search-input]');
    const type = searchRoot.querySelector('[data-search-type]');
    const year = searchRoot.querySelector('[data-search-year]');
    const button = searchRoot.querySelector('[data-search-button]');
    const results = searchRoot.querySelector('[data-search-results]');
    const count = searchRoot.querySelector('[data-search-count]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function(char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function renderCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + escapeHtml(movie.href) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="play-dot">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <h2><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h2>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '    <a class="text-link" href="' + escapeHtml(movie.href) + '">立即播放</a>',
        '  </div>',
        '</article>'
      ].join('\n');
    }

    function applySearch() {
      const query = input.value.trim().toLowerCase();
      const typeValue = type.value;
      const yearValue = year.value;
      const matched = window.MOVIE_SEARCH_INDEX.filter(function(movie) {
        const text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.tags
        ].join(' ').toLowerCase();
        const queryOk = !query || text.includes(query);
        const typeOk = !typeValue || movie.type === typeValue;
        const yearOk = !yearValue || movie.year === yearValue;
        return queryOk && typeOk && yearOk;
      }).slice(0, 240);

      results.innerHTML = matched.map(renderCard).join('\n');
      count.textContent = matched.length ? '已显示 ' + matched.length + ' 条结果' : '暂无匹配结果';
    }

    [input, type, year].forEach(function(control) {
      control.addEventListener('input', applySearch);
      control.addEventListener('change', applySearch);
    });
    button.addEventListener('click', applySearch);
    applySearch();
  }
}());
