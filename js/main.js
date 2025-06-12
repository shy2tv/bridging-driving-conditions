document.addEventListener("DOMContentLoaded", () => {
  // ————————————————
  // ACTIVE NAV LINK LOGIC
  // ————————————————
  const navLinksAll = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("section[id]"));

  // Determine our "page" (filename or default to index.html)
  let pagePath = window.location.pathname.split("/").pop();
  if (!pagePath) pagePath = "index.html";

  // Find special links
  const homeLink = navLinksAll.find(
    (a) => a.getAttribute("href") === "index.html"
  );
  const contactLink = navLinksAll.find(
    (a) => a.getAttribute("href") === "#contact"
  );
  const pageLink = navLinksAll.find((a) =>
    a.getAttribute("href").endsWith(pagePath)
  );

  // Map each section-id → its nav link (if any)
  const sectionLinkMap = new Map();
  sections.forEach((sec) => {
    const sel = "#" + sec.id;
    const link = navLinksAll.find((a) => {
      const href = a.getAttribute("href");
      return href === sel || href.endsWith(sel);
    });
    if (link) sectionLinkMap.set(sec.id, link);
  });

  // Utility to clear all actives
  function clearActive() {
    navLinksAll.forEach((a) => a.classList.remove("active"));
  }

  // Core logic: choose exactly one link to highlight
  function updateActiveLink() {
    clearActive();
    const scrollY = window.scrollY;
    const offset = 80; // tweak to your navbar height
    const atBottom =
      window.innerHeight + scrollY >= document.body.scrollHeight - 20;

    // 1) bottom of page → Contact
    if (atBottom && contactLink) {
      contactLink.classList.add("active");
      return;
    }

    // 2) section currently in view → that nav link
    for (const sec of sections) {
      const top = sec.offsetTop - offset;
      const bottom = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        const link = sectionLinkMap.get(sec.id);
        if (link) {
          link.classList.add("active");
          return;
        }
      }
    }

    // 3) at very top of index → Home
    if ((pagePath === "index.html" || pagePath === "") && scrollY < offset) {
      if (homeLink) {
        homeLink.classList.add("active");
        return;
      }
    }

    // 4) fallback → current page link
    if (pageLink) {
      pageLink.classList.add("active");
    }
  }

  // initialize + hook
  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink);
  window.addEventListener("hashchange", updateActiveLink);

  // ————————————————
  // FULLSCREEN DEMO LOGIC
  // ————————————————
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
  let currentHistState = false;

  function openFullscreen(imgEl, idx, slides) {
    const normal = imgEl.dataset.normalSrc;
    const hist = imgEl.dataset.histSrc;
    const toggleable = !!normal;
    const isHist = imgEl.dataset.histActive === "true";

    currentCarouselSlides = slides;
    currentFullscreenSlideIndex = idx;
    fullscreenImg.src = imgEl.src;
    fullscreenImg.dataset.normalSrc = normal || "";
    fullscreenImg.dataset.histSrc = hist || "";
    fullscreenImg.dataset.histActive = imgEl.dataset.histActive || "false";
    fullscreenImg.style.animationPlayState =
      imgEl.style.animationPlayState || "running";
    fullscreenCaption.textContent = imgEl
      .closest(".carousel-slide")
      .querySelector(".carousel-caption").textContent;

    if (toggleable) {
      fullscreenHistToggle.style.display = "flex";
      currentHistState = isHist;
      fullscreenHistToggle.classList.toggle("active", isHist);
    } else {
      fullscreenHistToggle.style.display = "none";
      currentHistState = false;
    }
    fullscreenOverlay.style.display = "flex";
  }

  function closeFullscreen() {
    if (currentCarouselSlides) {
      const orig =
        currentCarouselSlides[currentFullscreenSlideIndex].querySelector("img");
      if (orig)
        orig.style.animationPlayState = fullscreenImg.style.animationPlayState;
    }
    fullscreenOverlay.style.display = "none";
    currentCarouselSlides = null;
    currentFullscreenSlideIndex = null;
  }

  function navigateFullscreen(direction) {
    if (!currentCarouselSlides) return;
    let idx = currentFullscreenSlideIndex + direction;
    if (idx < 0) idx = currentCarouselSlides.length - 1;
    if (idx >= currentCarouselSlides.length) idx = 0;

    const slide = currentCarouselSlides[idx];
    const img = slide.querySelector("img");
    if (!img) return;

    const normal = img.dataset.normalSrc;
    const hist = img.dataset.histSrc;
    const target = normal ? (currentHistState ? hist : normal) : img.src;

    fullscreenImg.src = target;
    fullscreenImg.dataset.normalSrc = normal || "";
    fullscreenImg.dataset.histSrc = hist || "";
    fullscreenImg.style.animationPlayState =
      img.style.animationPlayState || "running";
    fullscreenCaption.textContent =
      slide.querySelector(".carousel-caption").textContent;
    currentFullscreenSlideIndex = idx;

    if (normal) {
      fullscreenHistToggle.style.display = "flex";
      fullscreenHistToggle.classList.toggle("active", currentHistState);
    } else {
      fullscreenHistToggle.style.display = "none";
    }
  }

  function toggleFullscreenHist() {
    const normal = fullscreenImg.dataset.normalSrc;
    const hist = fullscreenImg.dataset.histSrc;
    if (!normal) return;

    const now = fullscreenImg.dataset.histActive === "true";
    if (now) {
      fullscreenImg.src = normal;
      fullscreenImg.dataset.histActive = "false";
      fullscreenHistToggle.classList.remove("active");
      currentHistState = false;
    } else {
      fullscreenImg.src = hist;
      fullscreenImg.dataset.histActive = "true";
      fullscreenHistToggle.classList.add("active");
      currentHistState = true;
    }

    if (currentCarouselSlides) {
      const origImg =
        currentCarouselSlides[currentFullscreenSlideIndex].querySelector("img");
      const origToggle =
        currentCarouselSlides[currentFullscreenSlideIndex].querySelector(
          ".hist-toggle"
        );
      if (origImg) {
        origImg.src = fullscreenImg.src;
        origImg.dataset.histActive = fullscreenImg.dataset.histActive;
      }
      if (origToggle) {
        origToggle.classList.toggle("active", currentHistState);
      }
    }
  }

  document.addEventListener(
    "keydown",
    (e) => e.key === "Escape" && closeFullscreen()
  );
  fullscreenContainer.addEventListener("click", (e) => {
    if (e.target === fullscreenContainer) closeFullscreen();
  });
  const closeBtn = fullscreenOverlay.querySelector(".close-fullscreen");
  if (closeBtn)
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeFullscreen();
    });
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
  fullscreenImg.addEventListener("click", function (e) {
    e.stopPropagation();
    const state =
      this.style.animationPlayState === "paused" ? "running" : "paused";
    this.style.animationPlayState = state;
    if (currentCarouselSlides) {
      const orig =
        currentCarouselSlides[currentFullscreenSlideIndex].querySelector("img");
      if (orig) orig.style.animationPlayState = state;
    }
  });

  // ————————————————
  // CAROUSEL LOGIC
  // ————————————————
  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const prevBtn = carousel.querySelector(".prev");
    const nextBtn = carousel.querySelector(".next");
    let current = 0;

    slides.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.width = "100%";
      slide.style.height = "100%";
      slide.style.left = "0";
      slide.style.top = "0";
      slide.style.transform = `translateX(${i * 100}%)`;
    });

    function goTo(i) {
      if (i < 0) i = slides.length - 1;
      if (i >= slides.length) i = 0;
      slides.forEach((s, idx) => {
        s.style.transform = `translateX(${(idx - i) * 100}%)`;
      });
      current = i;
    }

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    slides.forEach((slide, i) => {
      const img = slide.querySelector("img");
      const zoomIcon = slide.querySelector(".zoom-icon");
      const histToggle = slide.querySelector(".hist-toggle");

      if (img) {
        img.addEventListener("click", (e) => {
          if (e.target !== img) return;
          const newState =
            img.style.animationPlayState === "paused" ? "running" : "paused";
          img.style.animationPlayState = newState;
          if (
            fullscreenOverlay.style.display === "flex" &&
            fullscreenImg.src === img.src
          ) {
            fullscreenImg.style.animationPlayState = newState;
          }
        });

        if (zoomIcon) {
          zoomIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            openFullscreen(img, i, slides);
          });
        }

        if (histToggle) {
          histToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const n = img.dataset.normalSrc;
            const h = img.dataset.histSrc;
            const on = img.dataset.histActive === "true";
            if (on) {
              img.src = n;
              img.dataset.histActive = "false";
              histToggle.classList.remove("active");
            } else {
              img.src = h;
              img.dataset.histActive = "true";
              histToggle.classList.add("active");
            }
            if (
              fullscreenOverlay.style.display === "flex" &&
              currentCarouselSlides === slides &&
              currentFullscreenSlideIndex === i
            ) {
              fullscreenImg.src = img.src;
              fullscreenHistToggle.classList.toggle(
                "active",
                img.dataset.histActive === "true"
              );
              currentHistState = img.dataset.histActive === "true";
            }
          });
          img.dataset.histActive = "false";
        }

        img.style.animationPlayState = "running";
        img.onerror = () => console.error("Failed to load image:", img.src);
      }
    });

    goTo(0);
  });

  // ————————————————
  // ARROW DETECTION LOGIC
  // ————————————————
  (function () {
    const rail = document.querySelector(".nav-rail");
    const links = document.querySelector(".nav-links");
    if (!rail || !links) return;
    function upd() {
      const start = links.scrollLeft <= 5;
      const end =
        links.scrollLeft + links.clientWidth + 10 >= links.scrollWidth;
      rail.classList.toggle("at-start", start);
      rail.classList.toggle("at-end", end);
    }
    links.addEventListener("scroll", upd);
    window.addEventListener("resize", upd);
    upd();
    setTimeout(upd, 300);
    setTimeout(upd, 1000);
  })();

  // ————————————————
  // TOOLTIP LOGIC (JS-ONLY FIX)
  // ————————————————
  (function () {
    // for every container, bind its icon ↔ tooltip
    document.querySelectorAll(".tooltip-container").forEach((container) => {
      const icon = container.querySelector(".info-icon");
      const tooltip = container.querySelector(".tooltip");
      if (!icon || !tooltip) return;

      // toggle on click (touch support)
      icon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // close others
        document
          .querySelectorAll(".tooltip-container .tooltip.show")
          .forEach((t) => t !== tooltip && t.classList.remove("show"));
        tooltip.classList.toggle("show");
      });

      // show on hover
      icon.addEventListener("mouseenter", () => {
        // close others
        document
          .querySelectorAll(".tooltip-container .tooltip.show")
          .forEach((t) => t !== tooltip && t.classList.remove("show"));
        tooltip.classList.add("show");
      });

      // hide when leaving the entire container (icon + tooltip)
      container.addEventListener("mouseleave", () => {
        setTimeout(() => {
          // only hide if mouse isn’t over icon or tooltip
          if (!icon.matches(":hover") && !tooltip.matches(":hover")) {
            tooltip.classList.remove("show");
          }
        }, 100);
      });
    });

    // clicking anywhere else closes all
    document.addEventListener("click", () => {
      document
        .querySelectorAll(".tooltip-container .tooltip.show")
        .forEach((t) => t.classList.remove("show"));
    });

    // prevent inside-tooltip clicks from bubbling up
    document
      .querySelectorAll(".tooltip-container .tooltip")
      .forEach((t) => t.addEventListener("click", (e) => e.stopPropagation()));
  })();
});
