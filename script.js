/* ==========================================================
   Younes Baskati — Portfolio | script.js (Vanilla JS)
   ========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("header");
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var mobileQuery = window.matchMedia("(max-width: 899px)");

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open && mobileQuery.matches ? "hidden" : "";
  }

  // Keep the off-screen menu out of the tab order on mobile.
  function syncMenuAccess() {
    var hidden = mobileQuery.matches && !navMenu.classList.contains("open");
    if (hidden) { navMenu.setAttribute("inert", ""); } else { navMenu.removeAttribute("inert"); }
    if (!mobileQuery.matches) { setMenu(false); }
  }

  navToggle.addEventListener("click", function () {
    setMenu(!navMenu.classList.contains("open"));
    syncMenuAccess();
    if (navMenu.classList.contains("open")) { navLinks[0].focus(); }
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); syncMenuAccess(); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("open")) {
      setMenu(false); syncMenuAccess(); navToggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      setMenu(false); syncMenuAccess();
    }
  });

  if (mobileQuery.addEventListener) { mobileQuery.addEventListener("change", syncMenuAccess); }
  else if (mobileQuery.addListener) { mobileQuery.addListener(syncMenuAccess); }
  syncMenuAccess();

  /* ---------- Smooth scrolling (with header offset + focus) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (id.length < 2) { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (history.pushState) { history.pushState(null, "", id); }
      if (!target.hasAttribute("tabindex")) { target.setAttribute("tabindex", "-1"); }
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Sticky header effect ---------- */
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 20); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link on scroll ---------- */
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      var on = link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", on);
      if (on) { link.setAttribute("aria-current", "page"); } else { link.removeAttribute("aria-current"); }
    });
  }

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { setActive(entry.target.id); } });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
  setActive("home");

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  // Small stagger for siblings inside the same grid/list.
  revealEls.forEach(function (el) {
    var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); }) : [];
    var i = siblings.indexOf(el);
    if (i > 0) { el.style.setProperty("--delay", Math.min(i * 0.08, 0.4) + "s"); }
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Dynamic year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Image fallbacks (photo & logos) ---------- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    var wrapper = img.parentElement;
    function fail() { wrapper.classList.add("no-image"); }
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) { fail(); }
  });

  /* ---------- Projects empty-state typing effect ---------- */
  var typedEl = document.getElementById("emptyTyped");
  if (typedEl) {
    var text = "echo \"Projects Coming Soon\"";
    if (reduceMotion) {
      typedEl.textContent = text;
    } else {
      var idx = 0;
      var started = false;
      var type = function () {
        typedEl.textContent = text.slice(0, ++idx);
        if (idx < text.length) { setTimeout(type, 70); }
      };
      if ("IntersectionObserver" in window) {
        var tio = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting && !started) { started = true; type(); tio.disconnect(); }
        }, { threshold: 0.4 });
        tio.observe(typedEl);
      } else { typedEl.textContent = text; }
    }
  }
})();