(() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const menuButton = qs('[data-menu-toggle]');
  const mobilePanel = qs('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  qsa('[data-site-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = qs('input[name="q"]', form);
      if (!input) {
        return;
      }
      const value = input.value.trim();
      if (!value) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyLocalFilter(form) {
    const input = qs('input[type="search"]', form);
    const list = qs('[data-card-list]') || document;
    const cards = qsa('.movie-card, .rank-row', list);
    const value = normalize(input ? input.value : '');
    cards.forEach((card) => {
      const text = normalize(card.getAttribute('data-search') || card.textContent);
      card.classList.toggle('is-hidden-card', value && !text.includes(value));
    });
  }

  qsa('[data-local-filter]').forEach((form) => {
    const input = qs('input[type="search"]', form);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (input && query) {
      input.value = query;
      applyLocalFilter(form);
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      applyLocalFilter(form);
    });
    if (input) {
      input.addEventListener('input', () => applyLocalFilter(form));
    }
  });

  qsa('[data-filter-value]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = normalize(button.getAttribute('data-filter-value'));
      const list = qs('[data-card-list]') || document;
      const cards = qsa('.movie-card, .rank-row', list);
      qsa('[data-filter-value]').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      cards.forEach((card) => {
        const text = normalize(card.getAttribute('data-search') || card.textContent);
        card.classList.toggle('is-hidden-card', value && !text.includes(value));
      });
    });
  });

  qsa('[data-hero]').forEach((hero) => {
    const slides = qsa('.hero-slide', hero);
    const thumbs = qsa('.hero-thumb', hero);
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
    };
    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 5200);
    };
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        show(i);
        play();
      });
    });
    show(0);
    play();
  });

  function startPlayer(box) {
    const video = qs('video', box);
    if (!video) {
      return;
    }
    const mediaUrl = video.getAttribute('data-stream');
    const mask = qs('.video-mask', box);
    if (mask) {
      mask.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    if (!video.getAttribute('src') && mediaUrl) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.setAttribute('src', mediaUrl);
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.setAttribute('src', mediaUrl);
      }
    }
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {});
    }
  }

  qsa('[data-player]').forEach((box) => {
    qsa('.player-start, .video-mask', box).forEach((control) => {
      control.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(box);
      });
    });
    const video = qs('video', box);
    if (video) {
      video.addEventListener('click', () => {
        if (!video.getAttribute('src')) {
          startPlayer(box);
        }
      });
    }
  });
})();
