document.addEventListener("DOMContentLoaded", function () {
  // Architecture image zoom functionality
  const archImg = document.querySelector(".architecture-image");
  const zoomIcon = document.querySelector(".zoom-icon");
  const fullscreenOverlay = document.getElementById("architecture-fullscreen");
  const closeFullscreen = fullscreenOverlay.querySelector(".close-fullscreen");

  function openFullscreen() {
    fullscreenOverlay.style.display = "block";
  }

  function closeFullscreenHandler() {
    fullscreenOverlay.style.display = "none";
  }

  if (zoomIcon) {
    zoomIcon.addEventListener("click", openFullscreen);
  }

  if (archImg) {
    archImg.addEventListener("click", openFullscreen);
  }

  if (closeFullscreen) {
    closeFullscreen.addEventListener("click", closeFullscreenHandler);
  }

  fullscreenOverlay.addEventListener("click", function (e) {
    if (
      e.target === fullscreenOverlay ||
      e.target.classList.contains("fullscreen-container")
    ) {
      closeFullscreenHandler();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeFullscreenHandler();
    }
  });
});
