document.addEventListener("DOMContentLoaded", function () {
  // Active section tracking for navigation
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  // Set initial active state based on URL hash or scroll position
  function setInitialActive() {
    const hash = window.location.hash;
    if (hash) {
      const sectionLink = document.querySelector(
        `.nav-links a[href="${hash}"]`
      );
      if (sectionLink) {
        navLinks.forEach((link) => link.classList.remove("active"));
        sectionLink.classList.add("active");
      }
    } else {
      // If at the top of the page, highlight Home
      if (window.scrollY < 100) {
        navLinks.forEach((link) => link.classList.remove("active"));
        document
          .querySelector('.nav-links a[href="index.html"]')
          .classList.add("active");
      } else {
        // Call updateActiveLink to set based on scroll position
        updateActiveLink();
      }
    }
  }

  // Update active nav link based on scroll position
  function updateActiveLink() {
    let currentSectionId = "";
    let isAtTop = window.scrollY < 100; // Check if at the top of the page

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        currentSectionId = "#" + section.getAttribute("id");
      }
    });

    // First remove active class from all links
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    const homeLink = document.querySelector('.nav-links a[href="index.html"]');

    // If we're at a specific section, highlight that section's link
    if (currentSectionId) {
      const sectionLink = document.querySelector(
        `.nav-links a[href="${currentSectionId}"]`
      );
      if (sectionLink) {
        sectionLink.classList.add("active");
        // Make sure Home is not active when a section is active
        if (homeLink) homeLink.classList.remove("active");
      }
    }
    // Otherwise, if we're at the top of the page, highlight Home
    else if (isAtTop) {
      if (homeLink) homeLink.classList.add("active");
    }

    // --- NEW: force-activate #contact when scrolled to the end -------------
    const contactLink = document.querySelector('.nav-links a[href="#contact"]');
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 20; // 20 px slack

    if (nearBottom && contactLink) {
      navLinks.forEach((link) => link.classList.remove("active"));
      contactLink.classList.add("active");
      return; // nothing else to do
    }
  }

  // Initialize active state
  setInitialActive();

  // Listen for scroll events to update active state
  const carousels = document.querySelectorAll(".carousel");
  const fullscreenOverlay = document.getElementById("fullscreen");
  const fullscreenContainer = fullscreenOverlay.querySelector(
    ".fullscreen-container"
  );
  const fullscreenImg = fullscreenOverlay.querySelector("img");
  const fullscreenCaption = fullscreenOverlay.querySelector(
    ".fullscreen-caption"
  );
  const fullscreenPrev = fullscreenOverlay.querySelector(
    ".fullscreen-control.prev"
  );
  const fullscreenNext = fullscreenOverlay.querySelector(
    ".fullscreen-control.next"
  );
  const fullscreenHistToggle = fullscreenOverlay.querySelector(
    ".hist-toggle.fullscreen"
  );

  let currentFullscreenSlideIndex = null;
  let currentCarouselSlides = null;
  let currentHistState = false; // false = normal, true = hist

  // --- Fullscreen Logic ---

  function openFullscreen(imgElement, slideIndex, slides) {
    const normalSrc = imgElement.dataset.normalSrc;
    const histSrc = imgElement.dataset.histSrc;
    const isToggleable = !!normalSrc; // Check if toggle attributes exist
    const isHistActive = imgElement.dataset.histActive === "true";

    currentCarouselSlides = slides;
    currentFullscreenSlideIndex = slideIndex;

    // Set image source and data attributes for fullscreen
    fullscreenImg.src = imgElement.src;
    fullscreenImg.dataset.normalSrc = normalSrc || "";
    fullscreenImg.dataset.histSrc = histSrc || "";
    fullscreenImg.dataset.histActive = imgElement.dataset.histActive || "false";
    fullscreenImg.style.animationPlayState =
      imgElement.style.animationPlayState || "running"; // Preserve state
    fullscreenCaption.textContent = imgElement
      .closest(".carousel-slide")
      .querySelector(".carousel-caption").textContent;

    // Show/hide and update histogram toggle in fullscreen
    if (isToggleable) {
      fullscreenHistToggle.style.display = "flex";
      currentHistState = isHistActive;
      fullscreenHistToggle.classList.toggle("active", currentHistState);
    } else {
      fullscreenHistToggle.style.display = "none";
      currentHistState = false; // Reset for non-toggleable images
    }

    fullscreenOverlay.style.display = "flex"; // Use flex to center container
  }

  function closeFullscreen() {
    // Sync animation state back before closing
    const originalSlide = currentCarouselSlides
      ? currentCarouselSlides[currentFullscreenSlideIndex]
      : null;
    if (originalSlide) {
      const originalImg = originalSlide.querySelector("img");
      if (originalImg) {
        originalImg.style.animationPlayState =
          fullscreenImg.style.animationPlayState;
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
    const targetImg = targetSlide.querySelector("img");
    if (!targetImg) return;

    const normalSrc = targetImg.dataset.normalSrc;
    const histSrc = targetImg.dataset.histSrc;
    const isToggleable = !!normalSrc;

    // Maintain current histogram state if the next image is toggleable, otherwise use normal
    const targetSrc = isToggleable
      ? currentHistState
        ? histSrc
        : normalSrc
      : targetImg.src;

    fullscreenImg.src = targetSrc;
    fullscreenImg.dataset.normalSrc = normalSrc || "";
    fullscreenImg.dataset.histSrc = histSrc || "";
    fullscreenImg.style.animationPlayState =
      targetImg.style.animationPlayState || "running";
    fullscreenCaption.textContent =
      targetSlide.querySelector(".carousel-caption").textContent;
    currentFullscreenSlideIndex = newIndex;

    // Show/hide and update histogram toggle in fullscreen
    if (isToggleable) {
      fullscreenHistToggle.style.display = "flex";
      // Update toggle state based on the *maintained* state (currentHistState)
      fullscreenHistToggle.classList.toggle("active", currentHistState);
    } else {
      fullscreenHistToggle.style.display = "none";
    }
  }

  function toggleFullscreenHist() {
    const normalSrc = fullscreenImg.dataset.normalSrc;
    const histSrc = fullscreenImg.dataset.histSrc;
    if (!normalSrc) return; // Not toggleable

    // Use data attribute to determine state
    const isHistActive = fullscreenImg.dataset.histActive === "true";

    if (isHistActive) {
      // Switch to normal
      fullscreenImg.src = normalSrc;
      fullscreenImg.dataset.histActive = "false";
      fullscreenHistToggle.classList.remove("active");
      currentHistState = false;
    } else {
      // Switch to histogram
      fullscreenImg.src = histSrc;
      fullscreenImg.dataset.histActive = "true";
      fullscreenHistToggle.classList.add("active");
      currentHistState = true;
    }

    // Sync back to the corresponding carousel slide immediately
    const originalSlide = currentCarouselSlides[currentFullscreenSlideIndex];
    if (originalSlide) {
      const originalImg = originalSlide.querySelector("img");
      const originalToggle = originalSlide.querySelector(".hist-toggle");

      if (originalImg) {
        originalImg.src = fullscreenImg.src;
        originalImg.dataset.histActive = fullscreenImg.dataset.histActive;
      }

      if (originalToggle) {
        if (currentHistState) {
          originalToggle.classList.add("active");
        } else {
          originalToggle.classList.remove("active");
        }
      }
    }
  }

  // Fullscreen Event Listeners
  document.addEventListener(
    "keydown",
    (e) => e.key === "Escape" && closeFullscreen()
  );

  // Handle clicks on the overlay background only
  fullscreenContainer.addEventListener("click", (e) => {
    if (e.target === fullscreenContainer) {
      closeFullscreen();
    }
  });

  // Separate close button handler - using direct click like histogram toggle
  const closeButton = fullscreenOverlay.querySelector(".close-fullscreen");
  if (closeButton) {
    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      closeFullscreen();
    });
  }

  // Use touch-friendly listeners for controls
  fullscreenPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateFullscreen(-1);
  });
  fullscreenNext.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateFullscreen(1);
  });
  fullscreenHistToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullscreenHist();
  });

  // Fullscreen image click for play/pause
  fullscreenImg.addEventListener("click", function (e) {
    e.stopPropagation();
    const newState =
      this.style.animationPlayState === "paused" ? "running" : "paused";
    this.style.animationPlayState = newState;
    // Sync state back immediately
    const originalSlide = currentCarouselSlides
      ? currentCarouselSlides[currentFullscreenSlideIndex]
      : null;
    if (originalSlide) {
      const originalImg = originalSlide.querySelector("img");
      if (originalImg) originalImg.style.animationPlayState = newState;
    }
  });

  // --- Carousel Logic ---
  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide")); // Use Array.from for easier indexing
    const prevBtn = carousel.querySelector(".prev");
    const nextBtn = carousel.querySelector(".next");
    let currentSlideIndex = 0;

    // Initialize slides positioning for carousel effect
    slides.forEach((slide, index) => {
      slide.style.transform = `translateX(${index * 100}%)`; // Correctly escaped template literal
      slide.style.position = "absolute"; // Ensure absolute positioning for translation
      slide.style.width = "100%";
      slide.style.height = "100%";
      slide.style.left = "0";
      slide.style.top = "0";
    });

    function goToSlide(index) {
      if (index < 0 || index >= slides.length) return; // Boundary check
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${(i - index) * 100}%)`; // Correctly escaped template literal
      });
      currentSlideIndex = index;
    }

    // Carousel Navigation
    prevBtn.addEventListener("click", () =>
      goToSlide(
        currentSlideIndex - 1 < 0 ? slides.length - 1 : currentSlideIndex - 1
      )
    );
    nextBtn.addEventListener("click", () =>
      goToSlide((currentSlideIndex + 1) % slides.length)
    );

    // Individual Slide Interactions
    slides.forEach((slide, index) => {
      const img = slide.querySelector("img");
      const zoomIcon = slide.querySelector(".zoom-icon");
      const histToggle = slide.querySelector(".hist-toggle");

      if (img) {
        // Play/Pause
        img.addEventListener("click", function (e) {
          // Prevent interfering with other clicks
          if (e.target !== img) return;
          const newState =
            this.style.animationPlayState === "paused" ? "running" : "paused";
          this.style.animationPlayState = newState;
          // Sync if this image is currently in fullscreen
          if (
            fullscreenOverlay.style.display === "flex" &&
            fullscreenImg.src === this.src
          ) {
            fullscreenImg.style.animationPlayState = newState;
          }
        });

        // Zoom Icon
        if (zoomIcon) {
          zoomIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            openFullscreen(img, index, slides);
          });
        }

        // Histogram Toggle
        if (histToggle) {
          histToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const normalSrc = img.dataset.normalSrc;
            const histSrc = img.dataset.histSrc;

            // Add a data attribute to track if histogram is active
            const isHistActive = img.dataset.histActive === "true";

            if (isHistActive) {
              // Switch to normal
              img.src = normalSrc;
              img.dataset.histActive = "false";
              histToggle.classList.remove("active");
            } else {
              // Switch to histogram
              img.src = histSrc;
              img.dataset.histActive = "true";
              histToggle.classList.add("active");
            }

            // Sync if this image is currently in fullscreen
            if (
              fullscreenOverlay.style.display === "flex" &&
              currentCarouselSlides === slides &&
              currentFullscreenSlideIndex === index
            ) {
              fullscreenImg.src = img.src;
              fullscreenImg.dataset.histActive = img.dataset.histActive;
              currentHistState = img.dataset.histActive === "true";

              if (currentHistState) {
                fullscreenHistToggle.classList.add("active");
              } else {
                fullscreenHistToggle.classList.remove("active");
              }
            }
          });

          // Initialize histogram state attribute
          img.dataset.histActive = "false";
        }
        // Initialize animation state
        img.style.animationPlayState = "running";

        // Error/Load handlers (optional but good practice)
        img.onerror = () => console.error("Failed to load image:", img.src);
        // img.onload = () => console.log('Loaded image:', img.src);
      }
    });
    // Initialize first slide view
    goToSlide(0);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  /*
   * This is a complete rewrite of the arrow detection code
   * that works with the most basic approach possible
   */

  // Get elements
  const navRail = document.querySelector(".nav-rail");
  const navLinks = document.querySelector(".nav-links");

  // Exit if elements don't exist
  if (!navRail || !navLinks) {
    console.warn("Navigation elements not found");
    return;
  }

  // Very simple function to update arrow classes
  function updateArrowVisibility() {
    // Check start position (with 5px margin for safety)
    const isAtStart = navLinks.scrollLeft <= 5;

    // Check end position (with 10px margin for safety)
    const isNearEnd =
      navLinks.scrollLeft + navLinks.clientWidth + 10 >= navLinks.scrollWidth;

    // Update classes directly
    if (isAtStart) {
      navRail.classList.add("at-start");
    } else {
      navRail.classList.remove("at-start");
    }

    if (isNearEnd) {
      navRail.classList.add("at-end");
    } else {
      navRail.classList.remove("at-end");
    }

    // Check if we're at the bottom of the page
  }

  // Add main event listeners
  navLinks.addEventListener("scroll", updateArrowVisibility);
  window.addEventListener("resize", updateArrowVisibility);

  // Run on page load
  updateArrowVisibility();

  // Run again after a delay to make sure layout is complete
  setTimeout(updateArrowVisibility, 300);
  setTimeout(updateArrowVisibility, 1000);
});

document.addEventListener("DOMContentLoaded", function () {
  // Get all navigation links
  const navLinks = document.querySelectorAll(".nav-links a");
  const homeLink = document.querySelector('.nav-links a[href="index.html"]');

  // Check if we're on a page that has sections to scroll to
  const hasSections = document.querySelectorAll("section[id]").length > 0;

  // First, handle page-level active state
  const currentPage = window.location.pathname;
  const currentHash = window.location.hash;

  // Initially remove active class from all links
  navLinks.forEach((link) => link.classList.remove("active"));

  // If we have a hash in the URL, prioritize that
  let activeSet = false;
  if (currentHash) {
    const hashLink = document.querySelector(
      `.nav-links a[href$="${currentHash}"]`
    );
    if (hashLink) {
      hashLink.classList.add("active");
      activeSet = true;
    }
  } else if (homeLink && window.scrollY < 100) {
    // If at the top of the page and no hash, activate Home
    homeLink.classList.add("active");
    activeSet = true;
  }

  // If no hash match or no hash, find the matching page
  if (!activeSet) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      // Skip hash-only links for this check
      if (href.startsWith("#")) return;

      const linkPath = new URL(link.href, window.location.origin).pathname;

      // Match the current page
      if (
        currentPage.endsWith(linkPath) ||
        (currentPage.endsWith("/") && linkPath.endsWith("index.html"))
      ) {
        link.classList.add("active");
        activeSet = true;
      }
    });
  }

  // If we're on a page with sections, set up scroll tracking
  if (hasSections) {
    const sections = document.querySelectorAll("section[id]");

    // Function to update active state based on scroll position
    function updateActiveOnScroll() {
      // Check if we're at the top of the page
      if (window.scrollY < 100) {
        // At the top, highlight Home
        if (homeLink) {
          navLinks.forEach((link) => link.classList.remove("active"));
          homeLink.classList.add("active");
          return;
        }
      }

      let currentSectionId = "";
      const scrollPosition = window.scrollY + 100; // Add offset for navbar

      // Find the current section
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          currentSectionId = section.getAttribute("id");
        }
      });

      // Special case for when scrolled to bottom of page
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

      if (nearBottom) {
        // Find the last section with an ID
        const lastSection = sections[sections.length - 1];
        currentSectionId = lastSection.getAttribute("id");
      }

      // Only update if we found a section
      if (currentSectionId) {
        let sectionLinkFound = false;

        navLinks.forEach((link) => {
          const href = link.getAttribute("href");

          // Check for both direct and page-prefixed section links
          if (
            href &&
            (href === `#${currentSectionId}` ||
              href.endsWith(`#${currentSectionId}`))
          ) {
            // Remove active from all links first
            navLinks.forEach((l) => l.classList.remove("active"));
            // Set this link as active
            link.classList.add("active");
            sectionLinkFound = true;
          }
        });

        // If no link was found for this section, do nothing
        // This preserves the Home active state if no section matches
      }
    }

    // Listen for scroll events
    window.addEventListener("scroll", updateActiveOnScroll);

    // Initialize active section on page load
    updateActiveOnScroll();
  }

  // Add click handlers for smooth scrolling to sections
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Only handle same-page section links
      if (href && href.startsWith("#")) {
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          e.preventDefault();

          // Smooth scroll to section
          window.scrollTo({
            top: targetSection.offsetTop - 80, // Offset for navbar
            behavior: "smooth",
          });

          // Update active state manually
          navLinks.forEach((l) => l.classList.remove("active"));
          this.classList.add("active");

          // Update the URL hash without triggering page jump
          history.pushState(null, null, href);
        }
      }
    });
  });
});
