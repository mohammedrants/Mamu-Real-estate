// Home page: hero, listings, converter, enquiry and the section motion.
import { $, $$, data, card, waLink } from "./shared.js";
import { initHero } from "./hero.js";
import { revealHeadings, drawIcons, riseIn, tilt, inkText, fillSteps } from "./motion.js";

const { gsap } = window;

export function initHome(container, ctx) {
  const cleanups = [];
  const hero = $("[data-hero]", container);
  if (hero) cleanups.push(initHero(hero, ctx));

  cleanups.push(initListings(container, ctx));
  cleanups.push(initConverter(container));
  cleanups.push(initEnquiry(container));

  cleanups.push(revealHeadings(container));
  cleanups.push(drawIcons($("[data-services]", container)));
  cleanups.push(fillSteps($("[data-steps]", container)));
  cleanups.push(inkText($("[data-ink]", container)));

  return () => cleanups.forEach((fn) => fn && fn());
}

function initListings(container, ctx) {
  const list = $("[data-listings]", container);
  const countEl = $("[data-count]", container);
  const emptyEl = $("[data-empty]", container);
  const filters = $("[data-filters]", container);
  const search = $("[data-search]", container);
  let state = { category: "all", q: "" };
  let untilt = () => {};
  let unrise = () => {};

  function render(first) {
    const q = state.q.trim().toLowerCase();
    const items = data.listings.filter((item) => {
      if (state.category !== "all" && item.category !== state.category) return false;
      if (q && `${item.title} ${item.location}`.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    untilt();
    unrise();
    list.innerHTML = items.map(card).join("");
    emptyEl.hidden = items.length > 0;
    list.hidden = items.length === 0;

    const noun = items.length === 1 ? "property" : "properties";
    countEl.textContent = items.length
      ? `Showing ${items.length} ${noun}${q ? ` matching “${state.q.trim()}”` : ""}`
      : "";
    $$("[data-filter]", filters).forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === state.category)),
    );

    const cards = $$(".listing", list);
    if (first) unrise = riseIn(cards);
    else
      gsap.from(cards, { autoAlpha: 0, y: 24, duration: 0.6, ease: "power3.out", stagger: 0.06 });
    untilt = tilt(cards);
    window.ScrollTrigger.refresh();
  }

  const onFilter = (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.category = btn.getAttribute("data-filter");
    render();
  };
  const onReset = () => {
    state = { category: "all", q: "" };
    search.reset();
    render();
  };
  const onSearch = (e) => {
    e.preventDefault();
    state.category = search.category.value;
    state.q = search.q.value;
    render();
    ctx.scroll.to("#properties");
  };

  filters.addEventListener("click", onFilter);
  $("[data-reset]", container).addEventListener("click", onReset);
  search.addEventListener("submit", onSearch);
  render(true);

  return () => {
    untilt();
    unrise();
  };
}

function initConverter(container) {
  const conv = $("[data-converter]", container);
  const out = $("[data-converter-out]", container);
  const names = {
    marla: "Marla",
    kanal: "Kanal",
    sqft: "Square feet",
    sqyd: "Square yards",
    sqm: "Square metres",
    acre: "Acre",
  };
  const sqftPer = (unit, marla) =>
    ({ marla, kanal: marla * 20, sqft: 1, sqyd: 9, sqm: 10.7639, acre: 43560 })[unit];
  const fmt = (n) => {
    if (!isFinite(n)) return "—";
    const digits = n >= 100 ? 0 : n >= 1 ? 2 : 4;
    return Number(n.toFixed(digits)).toLocaleString("en-PK", { maximumFractionDigits: digits });
  };

  function convert() {
    const value = parseFloat(conv.value.value);
    const unit = conv.unit.value;
    const marla = parseFloat(conv.querySelector("input[name=marla]:checked").value);
    if (isNaN(value) || value < 0) {
      out.innerHTML = "<div><dt>Enter a size</dt><dd>—</dd></div>";
      return;
    }
    const sqft = value * sqftPer(unit, marla);
    out.innerHTML = Object.keys(names)
      .map(
        (u) =>
          `<div${u === unit ? ' class="is-source"' : ""}><dt>${names[u]}</dt><dd>${fmt(sqft / sqftPer(u, marla))}</dd></div>`,
      )
      .join("");
  }
  conv.addEventListener("input", convert);
  conv.addEventListener("change", convert);
  conv.addEventListener("submit", (e) => e.preventDefault());
  convert();
  return () => {};
}

function initEnquiry(container) {
  const form = $("[data-enquiry]", container);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "phone"].forEach((name) => {
      const input = form[name];
      const valid =
        name === "phone"
          ? /\d{7,}/.test(input.value.replace(/\D/g, ""))
          : input.value.trim().length > 0;
      input.closest(".field").classList.toggle("has-error", !valid);
      input.setAttribute("aria-invalid", String(!valid));
      if (!valid && ok) {
        input.focus();
        ok = false;
      }
    });
    if (!ok) return;

    const lines = [
      "Assalam o Alaikum, Mera Ghar Meri Jannat.",
      `Name: ${form.name.value.trim()}`,
      `Phone: ${form.phone.value.trim()}`,
      `I want to: ${form.intent.value}`,
    ];
    if (form.details.value.trim()) lines.push(`Details: ${form.details.value.trim()}`);
    if (form.message.value.trim()) lines.push(form.message.value.trim());
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
  ["name", "phone"].forEach((name) =>
    form[name].addEventListener("input", function () {
      this.closest(".field").classList.remove("has-error");
      this.removeAttribute("aria-invalid");
    }),
  );
  return () => {};
}
