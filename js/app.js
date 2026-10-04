// Entry point: smooth scroll (Lenis + ScrollTrigger), the persistent header,
// and Barba page transitions between all pages.
import { $, $$, fillBusiness, reducedMotion } from "./shared.js";
import { initHome, initProperties, initServices, initAbout, initContact } from "./views.js";
import { initProperty } from "./property.js";

const { gsap, ScrollTrigger, SplitText, Lenis, barba } = window;
gsap.registerPlugin(ScrollTrigger, SplitText);

const header = $("[data-header]");

/* ---------- Smooth scroll ---------- */
const lenis = reducedMotion ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, autoRaf: false });
if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const scroll = {
  to(target, opts = {}) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    const offset = typeof target === "number" ? 0 : -(header.offsetHeight + 12);
    if (lenis)
      return lenis.scrollTo(typeof target === "number" ? target : el, {
        offset,
        duration: 1.4,
        ...opts,
      });
    if (typeof target === "number") return window.scrollTo(0, target);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + offset);
  },
  stop() {
    if (lenis) lenis.stop();
    else document.documentElement.style.overflow = "hidden";
  },
  start() {
    if (lenis) lenis.start();
    else document.documentElement.style.overflow = "";
  },
  /** Run `cb` once scrolling has been idle for 180ms; returns an unsubscribe function. */
  idle(cb) {
    let timer = 0;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(cb, 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  },
};

/* ---------- Header: compact state, progress hairline, mobile menu ---------- */
const nav = $("[data-nav]");
const toggle = $("[data-nav-toggle]");
const progress = $("[data-progress]");

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
}
window.addEventListener("scroll", onScroll, { passive: true });

function setNav(open) {
  toggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
  header.classList.toggle("is-open", open);
}
toggle.addEventListener("click", () => setNav(toggle.getAttribute("aria-expanded") !== "true"));
nav.addEventListener("click", (e) => e.target.closest("a") && setNav(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    setNav(false);
    toggle.focus();
  }
});

/* ---------- In-page links scroll smoothly; links to other pages go through Barba ---------- */
const pagePath = (url) => url.pathname.replace(/index\.html$/, "");
const isSamePage = (url) =>
  url.origin === location.origin &&
  pagePath(url) === pagePath(location) &&
  url.search === location.search;

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href*='#']");
  if (!a || a.classList.contains("skip-link") || a.target === "_blank") return;
  const url = new URL(a.href, location.href);
  if (!isSamePage(url) || url.hash.length < 2 || !document.querySelector(url.hash)) return;
  e.preventDefault();
  scroll.to(url.hash);
});

/* ---------- Page views ---------- */
const views = {
  home: initHome,
  properties: initProperties,
  services: initServices,
  about: initAbout,
  contact: initContact,
  property: initProperty,
};

/** The header persists across pages, so mark the current section in it after each transition. */
function markNav(namespace) {
  const section = namespace === "property" ? "properties" : namespace;
  $$("[data-nav-link]").forEach((a) => {
    if (a.dataset.navLink === section) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
let destroyView = null;

function initView(container, url, { skipIntro = false } = {}) {
  fillBusiness(container);
  markNav(container.dataset.barbaNamespace);
  const init = views[container.dataset.barbaNamespace];
  destroyView = init ? init(container, { scroll, skipIntro }, url) : null;
  onScroll();
  ScrollTrigger.refresh();
}

function jumpToHash(hash) {
  if (!hash || hash.length < 2) return;
  const el = document.querySelector(hash);
  if (!el) return;
  // A new page has just been swapped in: let Lenis and ScrollTrigger measure it first.
  ScrollTrigger.refresh();
  if (lenis) lenis.resize();
  scroll.to(el, { immediate: true, force: true });
}

/* ---------- Curtain transition ---------- */
const curtainEl = $("[data-curtain]");
const curtainPanel = $(".curtain-panel", curtainEl);
const curtainLogo = $(".curtain-logo", curtainEl);

function cover() {
  return new Promise((resolve) => {
    if (reducedMotion)
      return gsap.timeline({ onComplete: resolve }).to(curtainEl, { autoAlpha: 1, duration: 0.2 });
    gsap
      .timeline({ onComplete: resolve })
      .set(curtainEl, { autoAlpha: 1 })
      .set(curtainPanel, { transformOrigin: "50% 100%" })
      .fromTo(curtainPanel, { scaleY: 0 }, { scaleY: 1, duration: 0.8, ease: "expo.inOut" })
      .fromTo(
        curtainLogo,
        { autoAlpha: 0, y: 24, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" },
        "-=0.3",
      );
  });
}

function reveal() {
  return new Promise((resolve) => {
    if (reducedMotion)
      return gsap.timeline({ onComplete: resolve }).to(curtainEl, { autoAlpha: 0, duration: 0.2 });
    gsap
      .timeline({ onComplete: resolve })
      .to(curtainLogo, { autoAlpha: 0, y: -18, duration: 0.4, ease: "power2.in" })
      .set(curtainPanel, { transformOrigin: "50% 0%" })
      .to(curtainPanel, { scaleY: 0, duration: 0.85, ease: "expo.inOut" }, "-=0.05")
      .set(curtainEl, { autoAlpha: 0 });
  });
}

barba.init({
  preventRunning: true,
  timeout: 8000,
  prevent: ({ el }) => {
    if (!el || el.hasAttribute("data-no-barba")) return true;
    const url = new URL(el.href, location.href);
    return url.hash.length > 1 && isSamePage(url);
  },
  transitions: [
    {
      name: "curtain",
      async leave() {
        setNav(false);
        await cover();
        if (destroyView) destroyView();
        destroyView = null;
        ScrollTrigger.getAll().forEach((t) => t.kill());
      },
      async enter({ current, next }) {
        // Barba only removes the outgoing page after this hook. Take it out of the layout now,
        // otherwise every ScrollTrigger on the new page is measured with the old page above it
        // and starts (or never starts) in the wrong place.
        current.container.style.display = "none";
        // Barba has already pushed the clicked URL; read it from location, because some static
        // hosts redirect "page.html?x" to "/page" and Barba's next.url then loses the query.
        const url = new URL(location.href);
        scroll.start();
        window.scrollTo(0, 0);
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(0, { immediate: true, force: true });
        }
        initView(next.container, url.href, { skipIntro: url.hash.length > 1 });
        jumpToHash(url.hash);
        await reveal();
      },
      after() {
        // Re-measure once the old page is gone and fonts and images have settled.
        if (lenis) lenis.resize();
        ScrollTrigger.refresh();
      },
    },
  ],
});

/* ---------- First load ---------- */
fillBusiness(document);
initView($("[data-barba='container']"), location.href, { skipIntro: location.hash.length > 1 });
if (location.hash.length > 1) {
  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    jumpToHash(location.hash);
  });
}
