document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMBER = "971527717243";
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const yearEl = document.getElementById("year");
  const reservationForm = document.getElementById("reservation-form");
  const reservationStatus = document.getElementById("reservation-status");
  const hoverVideos = document.querySelectorAll(".hover-preview");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealTargets = document.querySelectorAll(".reveal-up");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
  }

  const allImages = document.querySelectorAll("img");
  allImages.forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        if (img.classList.contains("brand-logo") && img.dataset.logoTriedPng !== "true") {
          img.dataset.logoTriedPng = "true";
          img.src = "images/logo.png";
          return;
        }

        if (img.dataset.fallbackApplied === "true") {
          return;
        }

        const label = (img.alt || "Add image").replace(/[^a-zA-Z0-9 .,&-]/g, "").slice(0, 30);
        const svg =
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
              <defs>
                <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
                  <stop offset='0%' stop-color='#f5ede2'/>
                  <stop offset='100%' stop-color='#e8dcc9'/>
                </linearGradient>
              </defs>
              <rect width='100%' height='100%' fill='url(#g)'/>
              <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                font-family='Arial, sans-serif' font-size='30' fill='#7f7262'>${label}</text>
            </svg>`
          );

        img.src = svg;
        img.classList.add("is-missing");
        img.dataset.fallbackApplied = "true";
      },
      { once: true }
    );
  });

  const orderLinks = document.querySelectorAll(".js-whatsapp-order");
  orderLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const item = link.getAttribute("data-item") || "I would like to place an order";
      const message = [
        "Hi Tasty Bites,",
        "",
        item,
        "",
        "Please share available options.",
      ].join("\n");
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    });
  });

  hoverVideos.forEach((video) => {
    const playPreview = () => {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Ignore autoplay restrictions for unsupported contexts.
        });
      }
    };

    const stopPreview = () => {
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("mouseenter", playPreview);
    video.addEventListener("mouseleave", stopPreview);
    video.addEventListener("focus", playPreview);
    video.addEventListener("blur", stopPreview);
  });

  if (reservationForm) {
    reservationForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(reservationForm);
      const payload = {
        fullName: (formData.get("fullName") || "").toString().trim(),
        phone: (formData.get("phone") || "").toString().trim(),
        guests: (formData.get("guests") || "").toString().trim(),
        date: (formData.get("date") || "").toString(),
        time: (formData.get("time") || "").toString(),
        message: (formData.get("message") || "").toString().trim(),
      };

      if (!payload.fullName || !payload.phone || !payload.guests || !payload.date || !payload.time) {
        if (reservationStatus) {
          reservationStatus.textContent = "Please complete all required fields before submitting.";
          reservationStatus.classList.add("error");
        }
        return;
      }

      const reservationMessage = [
        "Hi Tasty Bites,",
        "",
        "I want to reserve a table.",
        `Name: ${payload.fullName}`,
        `Phone: ${payload.phone}`,
        `Guests: ${payload.guests}`,
        `Date: ${payload.date}`,
        `Time: ${payload.time}`,
        `Request: ${payload.message || "No special request"}`,
      ].join("\n");

      try {
        const existing = JSON.parse(localStorage.getItem("tastyBitesReservations") || "[]");
        existing.push({ ...payload, submittedAt: new Date().toISOString() });
        localStorage.setItem("tastyBitesReservations", JSON.stringify(existing));
      } catch (error) {
        // If storage fails, continue with WhatsApp submission.
      }

      if (reservationStatus) {
        reservationStatus.textContent = "Reservation request prepared. Opening WhatsApp to send now...";
        reservationStatus.classList.remove("error");
      }

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(reservationMessage)}`;
      window.open(whatsappUrl, "_blank");
      reservationForm.reset();
    });
  }
});
