(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-nav-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var nav = document.querySelector("[data-mobile-nav]");
        if (nav) {
          nav.classList.toggle("is-open");
        }
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(
        hero.querySelectorAll("[data-hero-slide]"),
      );
      var dots = Array.prototype.slice.call(
        hero.querySelectorAll("[data-hero-dot]"),
      );
      var index = 0;
      var timer = null;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot) {
          dot.classList.toggle(
            "active",
            Number(dot.getAttribute("data-hero-dot")) === index,
          );
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

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    document.querySelectorAll("[data-card-search]").forEach(function (input) {
      if (initialQuery && !input.value) {
        input.value = initialQuery;
      }

      function applyFilter() {
        var scope = input.closest("section") || document;
        var query = input.value.trim().toLowerCase();
        scope.querySelectorAll("[data-card]").forEach(function (card) {
          var text = (
            card.getAttribute("data-card-text") ||
            card.textContent ||
            ""
          ).toLowerCase();
          card.classList.toggle(
            "is-hidden",
            query && text.indexOf(query) === -1,
          );
        });
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    });
  });
})();
