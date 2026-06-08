document.addEventListener("DOMContentLoaded", function () {
  var video = document.querySelector("video[data-m3u8]");
  var button = document.querySelector("[data-play-button]");

  if (!video || !button) {
    return;
  }

  var shell = video.closest(".video-shell");
  var streamUrl = video.getAttribute("data-m3u8");
  var hlsInstance = null;

  function attachStream() {
    if (!streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    attachStream();
    video.controls = true;

    if (shell) {
      shell.classList.add("playing");
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        if (shell) {
          shell.classList.remove("playing");
        }
      });
    }
  }

  button.addEventListener("click", startPlayback);

  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("playing");
    }
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0 && shell) {
      shell.classList.remove("playing");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
});
