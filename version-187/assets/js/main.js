document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")));
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  var searchInput = document.querySelector("[data-search-input]");
  var searchCount = document.querySelector("[data-search-count]");
  var scope = document.querySelector("[data-search-scope]") || document;
  var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function updateCount(visible) {
    if (searchCount) {
      searchCount.textContent = cards.length ? visible + " / " + cards.length : "";
    }
  }

  if (searchInput && cards.length) {
    updateCount(cards.length);

    searchInput.addEventListener("input", function () {
      var query = normalize(searchInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.textContent
        ].join(" "));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      updateCount(visible);
    });
  }
});
