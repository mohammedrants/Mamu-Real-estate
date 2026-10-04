// Cinematic hero, adapted from the cinematic-scroll-hero choreography.
//
// 1. Night   — the camera settles, the moon rises, the villa's windows light one by one, the title blooms in.
// 2. Travel  — scroll moves the camera forward through the arched gateway towards the house,
//              each layer at its own depth, while the title grows away.
// 3. Promise — the scene fades to the jaali texture and a two-line statement grows in.
//
// Phones get a still version: the same night scene and a short opening, no scroll-driven travel,
// and the statement as an ordinary section below that fades in once.
import { $, $$, reducedMotion, finePointer, clamp01, isPhone, phoneQuery } from "./shared.js";

const { gsap, ScrollTrigger, SplitText } = window;

// Scroll track, in screens. The track is (INTRO + OUTRO) screens tall; see .hero-track in CSS.
const INTRO = 2.6; // camera travel
const OUTRO = 0.4;
const TRACK = INTRO + OUTRO;
const HERO_TEXT = 0.6; // the title has grown away after this many screens
const introSeg = (p) => clamp01(p / (INTRO / TRACK));
const outroSeg = (e) => (e <= 0.5 ? 0 : Math.min(1, (e - 0.5) / 0.5));
const heroTextSeg = (p) => clamp01(p / (HERO_TEXT / (TRACK - 1)));

const stagger = (e, i, n, gap, span) =>
  n <= 0 ? 0 : clamp01((e * ((n - 1) * gap + span) - i * gap) / span);
const easeIn = gsap.parseEase("power2.in");
const travelEase = gsap.parseEase("sine.inOut");
const growOut = (e, i, n) => {
  const o = easeIn(stagger(e, n - 1 - i, n, 0.083, 0.667));
  return { scale: 1 + o, opacity: 1 - o, blur: 8 * o };
};
const growIn = (e, i, n) => {
  const v = stagger(e, i, n, 0.15, 0.8);
  return { scale: v, opacity: v, blur: (1 - v) * 8 };
};

function splitWords(el) {
  const words = [];
  const nodes = [...el.childNodes];
  el.textContent = "";
  for (const node of nodes) {
    if (node.nodeType !== Node.TEXT_NODE) {
      el.appendChild(node);
      continue;
    }
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) return el.appendChild(document.createTextNode(" "));
      const span = document.createElement("span");
      span.className = "word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = part;
      el.appendChild(span);
      words.push(span);
    });
  }
  return words;
}

/** Scale every word around the centre of the whole heading, so the words bloom out of one point. */
function centreOrigins(words) {
  if (!words.length) return;
  let l = Infinity,
    t = Infinity,
    r = -Infinity,
    b = -Infinity;
  for (const w of words) {
    l = Math.min(l, w.offsetLeft);
    t = Math.min(t, w.offsetTop);
    r = Math.max(r, w.offsetLeft + w.offsetWidth);
    b = Math.max(b, w.offsetTop + w.offsetHeight);
  }
  const cx = (l + r) / 2;
  const cy = (t + b) / 2;
  for (const w of words)
    gsap.set(w, { transformOrigin: `${cx - w.offsetLeft}px ${cy - w.offsetTop}px`, force3D: true });
}

/**
 * @param {HTMLElement} track  the .hero-track section
 * @param {{ scroll: { stop(): void, start(): void, to(t: any, o?: any): void, idle(cb: () => void): () => void },
 *           skipIntro: boolean }} ctx
 */
export function initHero(track, ctx) {
  const title = $("[data-hero-title]", track);
  const statement = $("[data-statement]", track);
  const original = [title.innerHTML, statement.innerHTML];
  let stop = buildHero(track, ctx, isPhone());

  // Rotating a tablet or resizing a window across the breakpoint rebuilds the hero in the other mode.
  const onChange = () => {
    stop();
    [title.innerHTML, statement.innerHTML] = original;
    stop = buildHero(track, { ...ctx, skipIntro: true }, isPhone());
    ScrollTrigger.refresh();
  };
  phoneQuery.addEventListener("change", onChange);
  return () => {
    phoneQuery.removeEventListener("change", onChange);
    stop();
  };
}

function buildHero(track, ctx, phone) {
  const panel = $(".hero-panel", track);
  const scene = $("[data-scene]", track);
  const layers = $$(".layer", scene);
  const pushTargets = layers.map((l) => l.firstElementChild);
  const pushAmounts = layers.map((l) => parseFloat(l.dataset.push || "0"));
  const depths = layers.map((l) => parseFloat(l.dataset.depth || "0"));
  const arch = $("[data-arch]", track);
  const title = $("[data-hero-title]", track);
  const desc = $("[data-hero-desc]", track);
  const cue = $("[data-scroll-cue]", track);
  const actions = $("[data-hero-actions]", track);
  const statement = $("[data-statement]", track);
  const wins = $$(".win", scene);
  const moon = $("[data-moon]", scene);
  const refl = $(".refl", scene);
  const towerLights = $(".tower-lights", scene);

  const state = { textReady: false, progress: 0 };
  const cleanups = [];

  title.setAttribute("aria-label", title.textContent.trim());
  statement.setAttribute("aria-label", statement.textContent.replace(/\s+/g, " ").trim());
  const titleWords = splitWords(title);
  const statementWords = splitWords(statement);
  let descLines = [];
  const descSplit = SplitText.create(desc, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      descLines = self.lines;
      if (state.textReady || reducedMotion) gsap.set(descLines, { yPercent: 0, autoAlpha: 1 });
      else gsap.set(descLines, { yPercent: 100, autoAlpha: 0 });
    },
  });

  /* ---------- Arch geometry, drawn to fit the screen ---------- */
  let origin = { x: 0, y: 0 };
  function layout() {
    const W = scene.clientWidth;
    const H = scene.clientHeight;
    arch.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const ow = Math.min(W * 0.84, H * 0.96);
    const cx = W / 2;
    const ya = phone ? Math.max(H * 0.13, 92) : Math.max(H * 0.1, 70);
    const opening = (w, top) => {
      const l = cx - w / 2;
      const r = cx + w / 2;
      const s = top + w * 0.55;
      const k1 = s - (s - top) * 0.6;
      const k2 = top + (s - top) * 0.22;
      return `M${l} ${H}V${s}C${l} ${k1} ${cx - w * 0.3} ${k2} ${cx} ${top}C${cx + w * 0.3} ${k2} ${r} ${k1} ${r} ${s}V${H}`;
    };
    const edge = opening(ow, ya);
    const wall = `M${-2 * W} ${-2 * H}H${3 * W}V${3 * H}H${-2 * W}Z${edge}Z`;
    $$("[data-arch-wall]", arch).forEach((p) => p.setAttribute("d", wall));
    $("[data-arch-edge]", arch).setAttribute("d", edge);
    $("[data-arch-outer]", arch).setAttribute("d", opening(ow + 28, ya - 18));
    const fin = $("[data-arch-finial]", arch);
    fin.setAttribute("cx", cx);
    fin.setAttribute("cy", ya - 30);

    // The camera travels towards the villa's front door (x 800, y 610 in the 1600×900 scene,
    // which is drawn with xMidYMax slice).
    const s = Math.max(W / 1600, H / 900);
    origin = { x: W / 2, y: H - (900 - 610) * s };
    gsap.set(pushTargets, { transformOrigin: `${origin.x}px ${origin.y}px` });

    centreOrigins(statementWords);
    if (state.textReady) centreOrigins(titleWords);
  }

  /* ---------- Scroll-driven travel ---------- */
  function update() {
    const p = state.progress;
    const intro = introSeg(p);
    const outro = outroSeg(intro);
    if (!state.textReady) return;

    if (reducedMotion) {
      gsap.set(scene, { autoAlpha: 1 - outro });
    } else {
      // the scene has gone dark by the time the statement is half-way in
      const t = travelEase(intro);
      pushTargets.forEach((el, i) => gsap.set(el, { scale: 1 + pushAmounts[i] * t }));
      gsap.set(scene, { autoAlpha: 1 - Math.min(1, outro * 2.2) });
    }

    const heroP = Math.round(heroTextSeg(p) / 0.002) * 0.002;
    titleWords.forEach((w, i) => {
      if (reducedMotion) return gsap.set(w, { autoAlpha: 1 - heroP });
      const v = growOut(heroP, i, titleWords.length);
      gsap.set(w, { scale: v.scale, autoAlpha: v.opacity, filter: `blur(${v.blur.toFixed(2)}px)` });
    });
    descLines.forEach((line, i) => {
      const o = reducedMotion ? heroP : easeIn(stagger(heroP, i, descLines.length, 0.14, 0.7));
      gsap.set(line, { autoAlpha: 1 - o, yPercent: reducedMotion ? 0 : -60 * o });
    });
    gsap.set(cue, { autoAlpha: 1 - Math.min(1, heroP * 3) });

    statementWords.forEach((w, i) => {
      if (reducedMotion) return gsap.set(w, { autoAlpha: outro, scale: 1, filter: "none" });
      const v = growIn(outro, i, statementWords.length);
      gsap.set(w, { scale: v.scale, autoAlpha: v.opacity, filter: `blur(${v.blur.toFixed(2)}px)` });
    });
  }

  if (phone) {
    // The statement is its own section on phones: it fades in once, word by word.
    if (reducedMotion) gsap.set(statementWords, { autoAlpha: 1 });
    else {
      gsap.set(statementWords, { autoAlpha: 0, y: "0.4em" });
      const reveal = ScrollTrigger.create({
        trigger: statement,
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(statementWords, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out",
          }),
      });
      cleanups.push(() => reveal.kill());
    }
  }

  const st = phone
    ? null
    : ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          state.progress = self.progress;
          update();
        },
      });
  if (st) cleanups.push(() => st.kill());

  // Don't strand anyone mid-shot: once past 60% of the travel, finish it for them.
  if (st && !reducedMotion) {
    cleanups.push(
      ctx.scroll.idle(() => {
        if (!state.textReady) return;
        const intro = introSeg(state.progress);
        if (intro > 0.6 && intro < 0.999) {
          ctx.scroll.to(st.start + (st.end - st.start) * (INTRO / TRACK), {
            duration: 1.6,
            easing: (t) => 1 - Math.pow(1 - t, 3),
          });
        }
      }),
    );
  }

  /* ---------- Pointer depth: layers drift against the cursor ---------- */
  if (!reducedMotion && finePointer) {
    const movers = layers.map((l, i) => ({
      x: gsap.quickTo(l, "x", { duration: 1.2, ease: "power3.out" }),
      y: gsap.quickTo(l, "y", { duration: 1.2, ease: "power3.out" }),
      d: depths[i],
    }));
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      movers.forEach((m) => {
        m.x(-nx * m.d * 60);
        m.y(-ny * m.d * 30);
      });
    };
    panel.addEventListener("mousemove", onMove);
    cleanups.push(() => panel.removeEventListener("mousemove", onMove));
  }

  /* ---------- Night falls: the time-based opening shot ---------- */
  function finalState() {
    gsap.set(scene, { autoAlpha: 1 });
    gsap.set(wins, { autoAlpha: 1 });
    gsap.set([refl, towerLights], { autoAlpha: 1 });
  }

  let textTl = null;
  function revealText(animate) {
    gsap.set(title, { autoAlpha: 1 });
    centreOrigins(titleWords);
    const done = () => {
      state.textReady = true;
      gsap.set(titleWords, { willChange: "auto" });
      ctx.scroll.start();
      if (!phone) update();
    };
    if (!animate) {
      gsap.set(titleWords, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)" });
      gsap.set(descLines, { yPercent: 0, autoAlpha: 1 });
      gsap.set([cue, actions], { autoAlpha: 1, y: 0 });
      return done();
    }
    if (phone) {
      // Lighter on phones: no scale or blur, just a quick rise.
      gsap.set(titleWords, { autoAlpha: 0, y: "0.35em" });
      textTl = gsap
        .timeline({ onComplete: done })
        .to(titleWords, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" })
        .to(
          descLines,
          { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.1, ease: "expo.out" },
          "-=0.35",
        )
        .fromTo(actions, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4");
      return;
    }
    gsap.set(titleWords, {
      autoAlpha: 0,
      scale: 0,
      filter: "blur(8px)",
      willChange: "opacity, transform, filter",
    });
    textTl = gsap
      .timeline({ onComplete: done })
      .to(titleWords, {
        autoAlpha: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
      })
      .to(
        descLines,
        { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.14, ease: "expo.out" },
        "-=0.35",
      )
      .to(cue, { autoAlpha: 1, duration: 0.8 }, "-=0.4");
  }

  function playNight() {
    if (reducedMotion || ctx.skipIntro) {
      finalState();
      revealText(false);
      return;
    }
    // The opening never holds the page: the first scroll, swipe or key press finishes it at once.
    const tl = gsap.timeline();
    if (phone) {
      // A shorter opening on phones, about half the length.
      tl.fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power1.inOut" }, 0)
        .fromTo(moon, { y: 40 }, { y: 0, duration: 1.8, ease: "power3.out" }, 0)
        .to(towerLights, { autoAlpha: 1, duration: 0.8 }, 0.2)
        .to(wins, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, 0.35)
        .to(refl, { autoAlpha: 1, duration: 0.8 }, 0.6)
        .add(() => revealText(true), 0.5);
    } else
      tl.fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: "power1.inOut" }, 0)
        .fromTo(
          pushTargets,
          { scale: (i) => 1 + (0.14 * (i + 1)) / layers.length },
          { scale: 1, duration: 3.4, ease: "expo.out" },
          0,
        )
        .fromTo(moon, { y: 70 }, { y: 0, duration: 3.2, ease: "power3.out" }, 0)
        .to(towerLights, { autoAlpha: 1, duration: 1.4, ease: "power1.in" }, 0.4)
        .to(wins, { autoAlpha: 1, duration: 0.4, ease: "power2.out", stagger: 0.12 }, 0.7)
        .to(refl, { autoAlpha: 1, duration: 1.2, ease: "power1.out" }, 1.1)
        .add(() => revealText(true), 1.2);
    const finish = () => {
      if (state.textReady) return;
      tl.progress(1);
      if (textTl) textTl.progress(1);
    };
    const events = ["wheel", "touchmove", "keydown"];
    events.forEach((ev) => window.addEventListener(ev, finish, { passive: true, once: true }));
    cleanups.push(() => {
      tl.kill();
      if (textTl) textTl.kill();
      events.forEach((ev) => window.removeEventListener(ev, finish));
    });
  }

  /* ---------- Boot ---------- */
  if (!phone) gsap.set(statementWords, { autoAlpha: 0, scale: 0, filter: "blur(8px)" });
  gsap.set(title, { autoAlpha: 0 });
  gsap.set([wins, refl, towerLights, cue, actions], { autoAlpha: 0 });
  layout();
  window.addEventListener("resize", layout);
  cleanups.push(() => window.removeEventListener("resize", layout));
  document.fonts.ready.then(() => {
    centreOrigins(statementWords);
    if (state.textReady) centreOrigins(titleWords);
  });

  playNight();

  return () => {
    cleanups.forEach((fn) => fn());
    descSplit.revert();
    gsap.set(
      [scene, moon, title, cue, actions, refl, towerLights, ...wins, ...layers, ...pushTargets],
      {
        clearProps: "all",
      },
    );
  };
}
