(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) return;
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
          restart();
        });
      });

      show(0);
      restart();
    }

    var searchInput = document.querySelector("[data-card-search]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var genreFilter = document.querySelector("[data-genre-filter]");
    var countTarget = document.querySelector("[data-visible-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

    function includesValue(source, value) {
      return !value || (source || "").toLowerCase().indexOf(value.toLowerCase()) !== -1;
    }

    function applyFilters() {
      if (!cards.length) return;
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var region = regionFilter ? regionFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var genre = genreFilter ? genreFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute("data-search") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardGenre = card.getAttribute("data-genre") || "";
        var matched = includesValue(searchText, keyword) && includesValue(cardRegion, region) && includesValue(cardType, type) && includesValue(cardYear, year) && includesValue(cardGenre, genre);
        card.hidden = !matched;
        if (matched) visible += 1;
      });

      if (countTarget) {
        countTarget.textContent = visible ? "匹配 " + visible + " 部影片" : "未找到匹配影片";
      }
    }

    [searchInput, regionFilter, typeFilter, yearFilter, genreFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });
})();
