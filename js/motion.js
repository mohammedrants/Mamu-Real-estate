// Scroll reveals and 3D tilt used across pages. Each helper returns a cleanup
// function so a page can tear its motion down before a Barba transition.
import { $$, reducedMotion, finePointer } from "./shared.js";

const { gsap, ScrollTrigger, SplitText, VanillaTilt } = window;

/** Headings marked data-reveal sharpen in word by word, the hero's vocabulary at a smaller scale. */
export function revealHeadings(root) {
  if (reducedMotion) return () => {};
  const splits = [];
  const triggers = $$("[data-reveal]", root).map((el) => {
    const split = SplitText.create(el, { type: "words" });
    splits.push(split);
    gsap.set(split.words, { autoAlpha: 0, y: "0.25em", filter: "blur(8px)" });
    return ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () =>
        gsap.to(split.words, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
        }),
    });
  });
  return () => {
    triggers.forEach((t) => t.kill());
    splits.forEach((s) => s.revert());
  };
}

/** Line icons draw themselves in, as if inked in gold. */
export function drawIcons(list) {
  if (!list || reducedMotion) return () => {};
  const items = $$("li", list);
  items.forEach((li) => {
    $$("path, rect, circle", li.querySelector(".icon")).forEach((p) => {
      if (p.hasAttribute("stroke-dasharray")) return gsap.set(p, { autoAlpha: 0 });
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
  });
  const st = ScrollTrigger.create({
    trigger: list,
    start: "top 80%",
    once: true,
    onEnter: () => {
      items.forEach((li, i) => {
        const shapes = $$("path, rect, circle", li.querySelector(".icon"));
        gsap.to(shapes, {
          strokeDashoffset: 0,
          autoAlpha: 1,
          duration: 1.4,
          ease: "power2.inOut",
          delay: i * 0.15,
        });
      });
    },
  });
  return () => st.kill();
}

/** Cards rise in as their row reaches the viewport. */
export function riseIn(cards) {
  if (reducedMotion || !cards.length) return () => {};
  gsap.set(cards, { autoAlpha: 0, y: 48 });
  const triggers = ScrollTrigger.batch(cards, {
    start: "top 92%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.1,
        overwrite: true,
      }),
  });
  return () => triggers.forEach((t) => t.kill());
}

/** Gold-glare 3D tilt on hover (desktop pointers only). */
export function tilt(elements, options = {}) {
  if (reducedMotion || !finePointer || !VanillaTilt) return () => {};
  const els = elements.filter(Boolean);
  VanillaTilt.init(els, {
    max: 6,
    speed: 700,
    perspective: 1100,
    glare: true,
    "max-glare": 0.16,
    gyroscope: false,
    ...options,
  });
  // Vanilla-Tilt queues a reset for the next frame on mouseleave, and that reset throws if the
  // instance has been destroyed meanwhile. Neutralise what it would call, then destroy.
  return () =>
    els.forEach((el) => {
      const t = el.vanillaTilt;
      if (!t) return;
      const noop = () => {};
      t.onMouseEnter = t.updateElementPosition = t.update = t.setTransition = noop;
      t.destroy();
    });
}

/** A scrubbed "ink" effect: words of a paragraph light up as it scrolls through. */
export function inkText(el) {
  if (!el || reducedMotion) return () => {};
  const split = SplitText.create(el, { type: "words" });
  const tween = gsap.fromTo(
    split.words,
    { opacity: 0.18 },
    {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
    },
  );
  return () => {
    tween.scrollTrigger && tween.scrollTrigger.kill();
    tween.kill();
    split.revert();
  };
}

/** Process steps: the gold line between numbers fills as you scroll, lighting each step it reaches. */
export function fillSteps(list) {
  if (!list || reducedMotion) return () => {};
  const steps = $$("li", list);
  const n = steps.length;
  const st = ScrollTrigger.create({
    trigger: list,
    start: "top 75%",
    end: "bottom 60%",
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress * n;
      steps.forEach((li, i) => {
        li.style.setProperty("--fill", Math.min(1, Math.max(0, p - i)).toFixed(3));
        li.classList.toggle("is-lit", p > i);
      });
    },
  });
  steps.forEach((li) => li.style.setProperty("--fill", "0"));
  return () => {
    st.kill();
    steps.forEach((li) => {
      li.style.removeProperty("--fill");
      li.classList.remove("is-lit");
    });
  };
}
