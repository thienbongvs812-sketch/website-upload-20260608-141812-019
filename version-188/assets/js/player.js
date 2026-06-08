function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var cover = document.getElementById(config.coverId);
  var source = config.source;
  var loaded = false;
  var hlsInstance = null;

  if (!video || !cover || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      loaded = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      loaded = true;
      return;
    }

    video.src = source;
    loaded = true;
  }

  function start() {
    loadSource();
    cover.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        cover.classList.remove("is-hidden");
      });
    }
  }

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
}
