document.addEventListener("DOMContentLoaded", function () {
  const carousels = document.querySelectorAll(".carousel");
  const fullscreenOverlay = document.getElementById("fullscreen");
  const fullscreenContainer = fullscreenOverlay.querySelector(
    ".fullscreen-container"
  );
  const fullscreenVideo = fullscreenOverlay.querySelector("video");
  const fullscreenCaption = fullscreenOverlay.querySelector(
    ".fullscreen-caption"
  );
  const fullscreenPrev = fullscreenOverlay.querySelector(
    ".fullscreen-control.prev"
  );
  const fullscreenNext = fullscreenOverlay.querySelector(
    ".fullscreen-control.next"
  );
  const fullscreenHistToggle = fullscreenOverlay.querySelector(".hist-toggle");

  let currentFullscreenSlideIndex = null;
  let currentCarouselSlides = null;
  let currentHistState = false;

  // Check if device is in landscape mode
  function isLandscape() {
    return (
      window.matchMedia("(orientation: landscape)").matches &&
      window.matchMedia("(max-width: 864px)").matches
    );
  }

  // Auto-hide caption function
  function autoHideCaption(caption) {
    if (!caption || !isLandscape()) return;

    // Remove any existing classes first
    caption.classList.remove("hidden", "show-initial");

    // Show initially
    caption.classList.add("show-initial");

    // Hide after 3 seconds
    setTimeout(() => {
      caption.classList.remove("show-initial");
      caption.classList.add("hidden");
    }, 3000);
  }

  // Show caption temporarily
  function showCaptionTemporarily(caption) {
    if (!caption || !isLandscape()) return;

    caption.classList.remove("hidden");
    caption.classList.add("show-initial");

    setTimeout(() => {
      caption.classList.remove("show-initial");
      caption.classList.add("hidden");
    }, 3000);
  }

  // Simplified event handler - works for both touch and mouse
  function addUniversalListener(element, handler) {
    if (!element) return;

    element.addEventListener("click", handler);
    element.addEventListener("touchend", (e) => {
      e.preventDefault();
      handler(e);
    });
  }

  // --- Fullscreen Logic ---
  function openFullscreen(videoElement, slideIndex, slides) {
    const normalSrc = videoElement.dataset.normalSrc;
    const histSrc = videoElement.dataset.histSrc;
    const isToggleable = !!normalSrc;
    const isHistActive = videoElement.dataset.histActive === "true";

    currentCarouselSlides = slides;
    currentFullscreenSlideIndex = slideIndex;

    fullscreenVideo.src = videoElement.src;
    fullscreenVideo.dataset.normalSrc = normalSrc || "";
    fullscreenVideo.dataset.histSrc = histSrc || "";
    fullscreenVideo.dataset.histActive =
      videoElement.dataset.histActive || "false";

    // Sync video playback
    fullscreenVideo.currentTime = videoElement.currentTime;
    if (!videoElement.paused) {
      fullscreenVideo.play();
    }

    fullscreenCaption.textContent = videoElement
      .closest(".carousel-slide")
      .querySelector(".carousel-caption").textContent;

    if (isToggleable) {
      fullscreenHistToggle.style.display = "flex";
      currentHistState = isHistActive;
      fullscreenHistToggle.classList.toggle("active", currentHistState);
    } else {
      fullscreenHistToggle.style.display = "none";
      currentHistState = false;
    }

    fullscreenOverlay.style.display = "flex";

    // Auto-hide fullscreen caption in landscape
    autoHideCaption(fullscreenCaption);
  }

  function closeFullscreen() {
    const originalSlide = currentCarouselSlides?.[currentFullscreenSlideIndex];
    if (originalSlide) {
      const originalVideo = originalSlide.querySelector("video");
      if (originalVideo) {
        originalVideo.currentTime = fullscreenVideo.currentTime;
        if (!fullscreenVideo.paused) {
          originalVideo.play();
        } else {
          originalVideo.pause();
        }
      }
    }
    fullscreenOverlay.style.display = "none";
    currentCarouselSlides = null;
    currentFullscreenSlideIndex = null;
  }

  function navigateFullscreen(direction) {
    if (!currentCarouselSlides) return;

    let newIndex = currentFullscreenSlideIndex + direction;
    if (newIndex >= currentCarouselSlides.length) newIndex = 0;
    if (newIndex < 0) newIndex = currentCarouselSlides.length - 1;

    const targetSlide = currentCarouselSlides[newIndex];
    const targetVideo = targetSlide.querySelector("video");
    if (!targetVideo) return;

    const normalSrc = targetVideo.dataset.normalSrc;
    const histSrc = targetVideo.dataset.histSrc;
    const isToggleable = !!normalSrc;

    const targetSrc = isToggleable
      ? currentHistState
        ? histSrc
        : normalSrc
      : targetVideo.src;

    fullscreenVideo.src = targetSrc;
    fullscreenVideo.dataset.normalSrc = normalSrc || "";
    fullscreenVideo.dataset.histSrc = histSrc || "";

    // Auto-play after navigation
    fullscreenVideo.play();

    fullscreenCaption.textContent =
      targetSlide.querySelector(".carousel-caption").textContent;
    currentFullscreenSlideIndex = newIndex;

    if (isToggleable) {
      fullscreenHistToggle.style.display = "flex";
      fullscreenHistToggle.classList.toggle("active", currentHistState);
    } else {
      fullscreenHistToggle.style.display = "none";
    }

    // Show caption briefly when navigating
    showCaptionTemporarily(fullscreenCaption);
  }

  function toggleFullscreenHist() {
    const normalSrc = fullscreenVideo.dataset.normalSrc;
    const histSrc = fullscreenVideo.dataset.histSrc;
    if (!normalSrc) return;

    const isHistActive = fullscreenVideo.dataset.histActive === "true";
    const currentTime = fullscreenVideo.currentTime;
    const wasPlaying = !fullscreenVideo.paused;

    if (isHistActive) {
      fullscreenVideo.src = normalSrc;
      fullscreenVideo.dataset.histActive = "false";
      fullscreenHistToggle.classList.remove("active");
      currentHistState = false;
    } else {
      fullscreenVideo.src = histSrc;
      fullscreenVideo.dataset.histActive = "true";
      fullscreenHistToggle.classList.add("active");
      currentHistState = true;
    }

    // Restore playback after source change
    fullscreenVideo.addEventListener("loadedmetadata", function restore() {
      fullscreenVideo.currentTime = currentTime;
      if (wasPlaying) fullscreenVideo.play();
      fullscreenVideo.removeEventListener("loadedmetadata", restore);
    });

    // Sync to carousel
    const originalSlide = currentCarouselSlides?.[currentFullscreenSlideIndex];
    if (originalSlide) {
      const originalVideo = originalSlide.querySelector("video");
      const originalToggle = originalSlide.querySelector(".hist-toggle");

      if (originalVideo) {
        originalVideo.src = fullscreenVideo.src;
        originalVideo.dataset.histActive = fullscreenVideo.dataset.histActive;
      }
      if (originalToggle) {
        originalToggle.classList.toggle("active", currentHistState);
      }
    }
  }

  // --- Event Listeners ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFullscreen();
  });

  fullscreenContainer.addEventListener("click", (e) => {
    if (e.target === fullscreenContainer) closeFullscreen();
  });

  // Fullscreen controls
  addUniversalListener(
    fullscreenOverlay.querySelector(".close-fullscreen"),
    (e) => {
      e.stopPropagation();
      closeFullscreen();
    }
  );

  addUniversalListener(fullscreenPrev, (e) => {
    e.stopPropagation();
    navigateFullscreen(-1);
  });

  addUniversalListener(fullscreenNext, (e) => {
    e.stopPropagation();
    navigateFullscreen(1);
  });

  addUniversalListener(fullscreenHistToggle, (e) => {
    e.stopPropagation();
    toggleFullscreenHist();
  });

  // Fullscreen video play/pause - FIXED
  fullscreenVideo.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent any default browser behavior

    if (fullscreenVideo.paused) {
      fullscreenVideo.play().catch((err) => console.log("Play failed:", err));
    } else {
      fullscreenVideo.pause();
    }
  });

  // Touch support for showing fullscreen caption
  fullscreenVideo.addEventListener("touchstart", (e) => {
    if (isLandscape() && fullscreenCaption.classList.contains("hidden")) {
      e.preventDefault();
      showCaptionTemporarily(fullscreenCaption);
    }
  });

  // --- Carousel Logic ---
  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const prevBtn = carousel.querySelector(".carousel-control.prev");
    const nextBtn = carousel.querySelector(".carousel-control.next");
    let currentSlideIndex = 0;

    slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${index * 100}%)`;
      slide.style.position = "absolute";
      slide.style.width = "100%";
      slide.style.height = "100%";
      slide.style.left = "0";
      slide.style.top = "0";

      // ADD THIS to ensure videos are positioned
      const video = slide.querySelector("video");
      if (video) {
        video.style.position = "absolute";
        video.style.top = "0";
        video.style.left = "0";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "contain";
      }
    });

    function goToSlide(index) {
      if (index < 0 || index >= slides.length) return;

      // Pause all videos in this carousel
      slides.forEach((slide) => {
        const video = slide.querySelector("video");
        if (video) video.pause();
      });

      // Move slides
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - index) * 100}%)`;
      });

      // Play new current video
      const currentVideo = slides[index].querySelector("video");
      if (currentVideo) {
        currentVideo.play().catch((e) => console.log("Play blocked:", e));
      }

      currentSlideIndex = index;

      // Auto-hide caption for the new slide
      const currentCaption = slides[index].querySelector(".carousel-caption");
      autoHideCaption(currentCaption);
    }

    // Carousel navigation
    addUniversalListener(prevBtn, () => {
      const newIndex =
        currentSlideIndex - 1 < 0 ? slides.length - 1 : currentSlideIndex - 1;
      goToSlide(newIndex);
    });

    addUniversalListener(nextBtn, () => {
      const newIndex = (currentSlideIndex + 1) % slides.length;
      goToSlide(newIndex);
    });

    // Individual slide interactions
    slides.forEach((slide, index) => {
      const video = slide.querySelector("video");
      const zoomIcon = slide.querySelector(".zoom-icon");
      const histToggle = slide.querySelector(".hist-toggle");
      const caption = slide.querySelector(".carousel-caption");

      if (video) {
        video.dataset.histActive = "false";

        // Video click for play/pause - FIXED
        video.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault(); // Prevent default browser behavior

          if (video.paused) {
            video.play().catch((err) => console.log("Play failed:", err));
          } else {
            video.pause();
          }
        });

        // Touch support for showing caption
        video.addEventListener("touchstart", (e) => {
          if (
            isLandscape() &&
            caption &&
            caption.classList.contains("hidden")
          ) {
            e.preventDefault();
            showCaptionTemporarily(caption);
          }
        });

        // Zoom functionality
        if (zoomIcon) {
          addUniversalListener(zoomIcon, (e) => {
            e.stopPropagation();
            openFullscreen(video, index, slides);
          });
        }

        // Histogram toggle
        if (histToggle) {
          addUniversalListener(histToggle, (e) => {
            e.stopPropagation();

            const normalSrc = video.dataset.normalSrc;
            const histSrc = video.dataset.histSrc;
            const isHistActive = video.dataset.histActive === "true";
            const currentTime = video.currentTime;
            const wasPlaying = !video.paused;

            if (isHistActive) {
              video.src = normalSrc;
              video.dataset.histActive = "false";
              histToggle.classList.remove("active");
            } else {
              video.src = histSrc;
              video.dataset.histActive = "true";
              histToggle.classList.add("active");
            }

            // Restore video state after source change
            video.addEventListener("loadedmetadata", function restore() {
              video.currentTime = currentTime;
              if (wasPlaying) video.play();
              video.removeEventListener("loadedmetadata", restore);
            });
          });
        }
      }
    });

    // Initialize first slide
    goToSlide(0);
  });

  // Handle orientation change
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      const allCaptions = document.querySelectorAll(
        ".carousel-caption, .fullscreen-caption"
      );

      allCaptions.forEach((caption) => {
        if (isLandscape()) {
          caption.classList.add("hidden");
          caption.classList.remove("show-initial");
        } else {
          caption.classList.remove("hidden", "show-initial");
        }
      });

      // Re-show current caption briefly if in landscape
      if (isLandscape()) {
        // Find current visible slide
        carousels.forEach((carousel) => {
          const currentSlide = carousel.querySelector(
            '.carousel-slide[style*="translateX(0%)"]'
          );
          if (currentSlide) {
            const caption = currentSlide.querySelector(".carousel-caption");
            autoHideCaption(caption);
          }
        });

        // Handle fullscreen caption if visible
        if (fullscreenOverlay.style.display === "flex") {
          autoHideCaption(fullscreenCaption);
        }
      }
    }, 100);
  });

  // Initial setup on load
  if (isLandscape()) {
    // Hide all captions initially
    const allCaptions = document.querySelectorAll(
      ".carousel-caption, .fullscreen-caption"
    );
    allCaptions.forEach((caption) => {
      caption.classList.add("hidden");
    });

    // Show current caption briefly
    carousels.forEach((carousel) => {
      const firstSlide = carousel.querySelector(".carousel-slide");
      if (firstSlide) {
        const caption = firstSlide.querySelector(".carousel-caption");
        autoHideCaption(caption);
      }
    });
  }

  // ——————————————————————————————————————————
  // Any touch anywhere should re-flash then hide the caption
  // ——————————————————————————————————————————
  document.addEventListener("touchstart", (e) => {
    if (!isLandscape()) return;

    // 1) If we’re in fullscreen, target that caption
    if (fullscreenOverlay.style.display === "flex") {
      autoHideCaption(fullscreenCaption);
      return;
    }

    // 2) Otherwise, for each carousel find the “0%” slide and target its caption
    carousels.forEach((carousel) => {
      const activeSlide = Array.from(
        carousel.querySelectorAll(".carousel-slide")
      ).find((slide) => {
        const t = window.getComputedStyle(slide).transform;
        return t === "none" || t.includes("(1, 0, 0, 1, 0, 0)");
      });
      if (activeSlide) {
        const cap = activeSlide.querySelector(".carousel-caption");
        autoHideCaption(cap);
      }
    });
  });
});
