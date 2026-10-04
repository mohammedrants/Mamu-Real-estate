// One init function per page (Barba namespace). Each returns a cleanup function
// that runs before the next page transition.
import {
  $,
  $$,
  data,
  card,
  waLink,
  escapeHtml,
  sealHtml,
  shortlist,
  areaMarla,
  pricePerMarla,
  isPhone,
} from "./shared.js";
import { initHero } from "./hero.js";
import { revealHeadings, drawIcons, riseIn, tilt, inkText, fillSteps } from "./motion.js";

const { gsap, ScrollTrigger } = window;

const run = (fns) => () => fns.forEach((fn) => fn && fn());

/** Newest listings first. */
const byNewest = (a, b) => (b.listed || "").localeCompare(a.listed || "");

export function initHome(container, ctx) {
  const featured = $("[data-featured]", container);
  featured.innerHTML = data.listings.slice().sort(byNewest).slice(0, 3).map(card).join("");
  const cards = $$(".listing", featured);

  // Browse by area: one tile per society, with how many listings it has.
  const groups = new Map();
  data.listings.forEach((l) => {
    const key = `${l.society}|${l.city}`;
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  $("[data-areas]", container).innerHTML = [...groups]
    .map(([key, n]) => {
      const [society, city] = key.split("|");
      return `<li><a class="area-tile" href="properties.html?q=${encodeURIComponent(society)}">
        <span class="area-name">${escapeHtml(society)}</span>
        <span class="area-city">${escapeHtml(city)}</span>
        <span class="area-count">${n} ${n === 1 ? "listing" : "listings"}</span>
      </a></li>`;
    })
    .join("");

  const sell = $("[data-wa-sell]", container);
  if (sell)
    sell.href = waLink(
      "Assalam o Alaikum, I'd like to sell my property. Location: , Size: , Asking price: ",
    );
  const sellSeal = $("[data-sell-seal]", container);
  if (sellSeal) sellSeal.innerHTML = sealHtml("lg");

  return run([
    initHero($("[data-hero]", container), ctx),
    riseIn(cards),
    tilt(cards),
    riseIn($$(".area-tile", container)),
    revealHeadings(container),
    drawIcons($("[data-services]", container)),
    inkText($("[data-ink]", container)),
  ]);
}

export function initProperties(container, ctx, url) {
  return run([
    initListings(container, url, ctx),
    initConverter(container),
    revealHeadings(container),
  ]);
}

export function initServices(container) {
  return run([
    initFaq(container),
    revealHeadings(container),
    tilt($$("[data-tilt-media]", container), { max: 6, "max-glare": 0.18 }),
    riseIn($$(".service-row", container)),
    fillSteps($("[data-steps]", container)),
  ]);
}

export function initAbout(container) {
  return run([revealHeadings(container), inkText($("[data-ink]", container))]);
}

export function initContact(container) {
  return run([initEnquiry(container), revealHeadings(container)]);
}

/* ---------- Buyer FAQ, with FAQPage structured data ---------- */
function initFaq(container) {
  const list = $("[data-faq]", container);
  if (!list) return null;
  list.innerHTML = data.faq
    .map(
      (f, i) => `<details class="faq-item"${i === 0 ? " open" : ""}>
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a)}</p>
      </details>`,
    )
    .join("");
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
  container.appendChild(ld);
  return null;
}

/* ---------- Listings: search, filters, sort and shortlist (properties page) ---------- */
function initListings(container, url, ctx) {
  const list = $("[data-listings]", container);
  const countEl = $("[data-count]", container);
  const emptyEl = $("[data-empty]", container);
  const filters = $("[data-filters]", container);
  const form = $("[data-search]", container);
  const sortEl = $("[data-sort]", container);
  const savedBtn = $("[data-saved-toggle]", container);
  const more = $("[data-filter-more]", container);
  const moreBtn = $("[data-filter-toggle]", container);
  const moreCount = $("[data-filter-count]", container);
  const params = new URL(url, location.href).searchParams;

  const cities = [...new Set(data.listings.map((l) => l.city))].sort();
  $("[data-city-options]", container).insertAdjacentHTML(
    "beforeend",
    cities.map((c) => `<option>${escapeHtml(c)}</option>`).join(""),
  );

  const categories = ["all", "home", "residential", "commercial", "investment"];
  const fresh = () => ({
    category: "all",
    q: "",
    city: "",
    budget: "",
    size: "",
    sort: "newest",
    saved: false,
  });
  let state = {
    ...fresh(),
    category: categories.includes(params.get("category")) ? params.get("category") : "all",
    q: params.get("q") || "",
    saved: params.get("saved") === "1",
  };
  form.q.value = state.q;

  let untilt = () => {};
  let unrise = () => {};

  const inRange = (value, range) => {
    if (!range) return true;
    const [min, max] = range.split("-").map((v) => (v === "" ? NaN : Number(v)));
    return (isNaN(min) || value >= min) && (isNaN(max) || value < max);
  };
  const sorters = {
    newest: byNewest,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "size-desc": (a, b) => areaMarla(b.area) - areaMarla(a.area),
    "rate-asc": (a, b) => pricePerMarla(a) - pricePerMarla(b),
  };

  function render(first) {
    const q = state.q.trim().toLowerCase();
    const saved = shortlist.ids();
    const items = data.listings
      .filter((item) => {
        if (state.saved && !saved.includes(item.id)) return false;
        if (state.category !== "all" && item.category !== state.category) return false;
        if (state.city && item.city !== state.city) return false;
        if (!inRange(item.price, state.budget)) return false;
        if (!inRange(areaMarla(item.area), state.size)) return false;
        if (q && `${item.title} ${item.society} ${item.city}`.toLowerCase().indexOf(q) === -1)
          return false;
        return true;
      })
      .sort(sorters[state.sort] || byNewest);

    untilt();
    unrise();
    list.innerHTML = items.map(card).join("");
    emptyEl.hidden = items.length > 0;
    list.hidden = items.length === 0;
    $("[data-empty-title]", container).textContent = state.saved
      ? "Your shortlist is empty."
      : "Nothing on our list matches that yet.";
    $("[data-empty-text]", container).textContent = state.saved
      ? "Tap the heart on any property to save it here. Your shortlist stays in this browser."
      : "Tell us what you're looking for and we'll send you options as soon as they come in.";

    const noun = items.length === 1 ? "property" : "properties";
    countEl.textContent = items.length
      ? `${items.length} ${noun}${state.saved ? " in your shortlist" : ""}${q ? ` matching “${state.q.trim()}”` : ""}`
      : "";
    $$("[data-filter]", filters).forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === state.category)),
    );
    savedBtn.setAttribute("aria-pressed", String(state.saved));
    const active = ["city", "budget", "size"].filter((k) => state[k]).length;
    moreCount.textContent = active;
    moreCount.hidden = active === 0;

    const cards = $$(".listing", list);
    if (first) unrise = riseIn(cards);
    else
      gsap.fromTo(
        cards,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "opacity,visibility,transform",
        },
      );
    untilt = tilt(cards);
    ScrollTrigger.refresh();
  }

  filters.addEventListener("click", (e) => {
    if (e.target.closest("[data-saved-toggle]")) {
      state.saved = !state.saved;
      return render();
    }
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.category = btn.getAttribute("data-filter");
    render();
  });
  sortEl.addEventListener("change", () => {
    state.sort = sortEl.value;
    render();
  });
  ["city", "budget", "size"].forEach((name) =>
    form[name].addEventListener("change", () => {
      state[name] = form[name].value;
      render();
    }),
  );
  moreBtn.addEventListener("click", () => {
    const open = !more.classList.contains("is-open");
    more.classList.toggle("is-open", open);
    moreBtn.setAttribute("aria-expanded", String(open));
    ScrollTrigger.refresh();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    state.q = form.q.value;
    render();
    // On a phone, put the keyboard away and bring the results into view.
    if (isPhone()) {
      document.activeElement.blur();
      ctx.scroll.to($(".results-bar", container));
    }
  });
  $("[data-reset]", container).addEventListener("click", () => {
    state = fresh();
    form.reset();
    sortEl.value = "newest";
    render();
  });
  // When a property is un-saved while the shortlist view is open, drop it from the grid.
  const unsubscribe = shortlist.subscribe(() => state.saved && render());

  render(true);

  return () => {
    untilt();
    unrise();
    unsubscribe();
  };
}

/* ---------- Marla / kanal converter ---------- */
function initConverter(container) {
  const conv = $("[data-converter]", container);
  if (!conv) return null;
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
  return null;
}

/* ---------- Form validation shared by the enquiry and visit forms ---------- */
export function validate(form, rules) {
  let ok = true;
  Object.entries(rules).forEach(([name, test]) => {
    const input = form[name];
    const valid = test(input.value);
    input.closest(".field").classList.toggle("has-error", !valid);
    input.setAttribute("aria-invalid", String(!valid));
    if (!valid && ok) {
      input.focus();
      ok = false;
    }
    input.addEventListener(
      "input",
      () => {
        input.closest(".field").classList.remove("has-error");
        input.removeAttribute("aria-invalid");
      },
      { once: true },
    );
  });
  return ok;
}

/* ---------- Enquiry form → WhatsApp ---------- */
function initEnquiry(container) {
  const form = $("[data-enquiry]", container);
  if (!form) return null;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validate(form, {
      name: (v) => v.trim().length > 0,
      phone: (v) => /\d{7,}/.test(v.replace(/\D/g, "")),
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
  return null;
}
