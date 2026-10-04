// Helpers shared by every page: data access, formatting, the shortlist and listing cards.
import "./data.js";

export const data = window.MGMJ;
export const biz = data.business;

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
export const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function waLink(text) {
  const url = `https://wa.me/${biz.whatsapp}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}

/** Fill phone, WhatsApp, email and social links inside `root`. */
export function fillBusiness(root = document) {
  $$("[data-field]", root).forEach((el) => {
    const value = biz[el.getAttribute("data-field")];
    if (value) el.textContent = value;
  });
  $$("[data-tel]", root).forEach((el) => (el.href = `tel:${biz.phone}`));
  $$("[data-wa]", root).forEach(
    (el) => (el.href = waLink("Assalam o Alaikum, I found you on your website.")),
  );
  $$("[data-mail]", root).forEach((el) => (el.href = `mailto:${biz.email}`));
  $$("[data-fb]", root).forEach((el) => (el.href = biz.facebook));
  $$("[data-yt]", root).forEach((el) => (el.href = biz.youtube));
  $$("[data-year]", root).forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------- Money and land ---------- */

export function formatPrice(rupees) {
  const trim = (n) => String(Math.round(n * 100) / 100);
  if (rupees >= 10000000) return `PKR ${trim(rupees / 10000000)} Crore`;
  if (rupees >= 100000) return `PKR ${trim(rupees / 100000)} Lakh`;
  return `PKR ${Math.round(rupees).toLocaleString("en-PK")}`;
}

/** Society marla (225 sq ft), used for price-per-marla and size filters. */
export const MARLA_SQFT = 225;
export function areaSqft(area) {
  if (area.unit === "kanal") return area.value * 20 * MARLA_SQFT;
  if (area.unit === "marla") return area.value * MARLA_SQFT;
  return area.value;
}
export const areaMarla = (area) => areaSqft(area) / MARLA_SQFT;

export function formatArea(area) {
  const units = { marla: "Marla", kanal: "Kanal", sqft: "sq ft" };
  return `${area.value.toLocaleString("en-PK")} ${units[area.unit] || area.unit}`;
}

/** The other unit people will ask about: sq ft for marla/kanal, marla for sq ft. */
export function formatAreaAlt(area) {
  if (area.unit === "sqft")
    return `≈ ${(Math.round(areaMarla(area) * 10) / 10).toLocaleString("en-PK")} Marla`;
  return `${Math.round(areaSqft(area)).toLocaleString("en-PK")} sq ft`;
}

export const pricePerMarla = (item) => item.price / areaMarla(item.area);

export const categoryLabels = {
  home: "House / villa",
  residential: "Residential plot",
  commercial: "Commercial",
  investment: "Investment",
};

export const statusLabels = {
  possession: "Possession",
  ready: "Ready to move",
  "under-construction": "Under construction",
  "on-instalments": "On instalments",
};

export const locationOf = (item) => `${item.society}, ${item.city}`;

/* ---------- Icons and the "papers checked" seal ---------- */

export const icons = {
  bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01"/></svg>',
  bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4ZM4 9h3M4 14h3M9 4v3M14 4v3"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.5-7-11.5a7 7 0 0 1 14 0C19 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.3 3.9 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4c3.4 0 5.7 3.3 4.5 6.7C19.5 15.4 12 20 12 20Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
};

/** A circular gold stamp: the brand's promise that the papers have been checked. */
let sealCount = 0;
export function sealHtml(size = "sm") {
  const arc = `seal-arc-${++sealCount}`;
  return `<span class="seal seal-${size}" role="img" aria-label="Papers checked">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs><path id="${arc}" d="M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0"/></defs>
      <circle cx="50" cy="50" r="47" class="seal-ring"/>
      <circle cx="50" cy="50" r="27" class="seal-inner"/>
      <text class="seal-text" textLength="224" lengthAdjust="spacing"><textPath href="#${arc}" startOffset="0">PAPERS CHECKED · PAPERS CHECKED ·</textPath></text>
      <path d="m38 51 8 8 16-17" class="seal-tick"/>
    </svg>
    <span class="seal-urdu" lang="ur" dir="rtl">تصدیق شدہ</span>
  </span>`;
}

export function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

export function specsHtml(item) {
  const specs = [];
  if (item.beds) specs.push(`<li>${icons.bed}${item.beds} bed</li>`);
  if (item.baths) specs.push(`<li>${icons.bath}${item.baths} bath</li>`);
  specs.push(`<li>${icons.area}${formatArea(item.area)}</li>`);
  return specs.join("");
}

export function askText(item) {
  return `Assalam o Alaikum, I'm interested in: ${item.title}, ${locationOf(item)} (${formatPrice(item.price)}). Is it still available?`;
}

export const propertyUrl = (item) => `property.html?id=${encodeURIComponent(item.id)}`;

/* ---------- Shortlist (saved in this browser only) ---------- */

const SHORTLIST_KEY = "mgmj-shortlist";
const listeners = new Set();

function readShortlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((id) => data.listings.some((l) => l.id === id)) : [];
  } catch {
    return [];
  }
}
let saved = readShortlist();

export const shortlist = {
  ids: () => saved.slice(),
  has: (id) => saved.includes(id),
  toggle(id) {
    saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    try {
      localStorage.setItem(SHORTLIST_KEY, JSON.stringify(saved));
    } catch {
      /* storage unavailable: the shortlist lasts until the tab closes */
    }
    listeners.forEach((fn) => fn(saved.slice()));
    return saved.includes(id);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function saveButtonHtml(item, extraClass = "") {
  const on = shortlist.has(item.id);
  return `<button type="button" class="save-btn ${extraClass}" data-save="${escapeHtml(item.id)}" aria-pressed="${on}" aria-label="${on ? "Remove from" : "Save to"} shortlist: ${escapeHtml(item.title)}">${icons.heart}</button>`;
}

/** One delegated click handler for every save button on the page. */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-save]");
  if (!btn) return;
  e.preventDefault();
  const item = data.listings.find((l) => l.id === btn.dataset.save);
  const on = shortlist.toggle(btn.dataset.save);
  $$(`[data-save="${CSS.escape(btn.dataset.save)}"]`).forEach((b) => {
    b.setAttribute("aria-pressed", String(on));
    if (item)
      b.setAttribute("aria-label", `${on ? "Remove from" : "Save to"} shortlist: ${item.title}`);
  });
});

/* ---------- Listing card ---------- */

export function card(item) {
  const cover = (item.images && item.images[0]) || item.image;
  const perMarla =
    item.category === "investment"
      ? ""
      : `<span class="listing-rate">${formatPrice(pricePerMarla(item))} / marla</span>`;
  return `
    <li class="listing">
      <div class="listing-media">
        <img src="${escapeHtml(cover)}" alt="Illustration of the ${escapeHtml(item.title.toLowerCase())}" loading="lazy" width="480" height="320">
        <span class="listing-tag">${categoryLabels[item.category]}</span>
        ${item.badge ? `<span class="listing-badge">${escapeHtml(item.badge)}</span>` : ""}
        ${saveButtonHtml(item)}
      </div>
      ${item.verified ? sealHtml("sm") : ""}
      <div class="listing-body">
        <p class="listing-price">${formatPrice(item.price)} ${perMarla}</p>
        <h3 class="listing-title"><a class="listing-link" href="${propertyUrl(item)}">${escapeHtml(item.title)}</a></h3>
        <p class="listing-loc">${icons.pin}${escapeHtml(locationOf(item))}</p>
        <ul class="listing-specs">${specsHtml(item)}<li class="listing-alt">${formatAreaAlt(item.area)}</li></ul>
        <div class="listing-foot">
          <span class="listing-status">${statusLabels[item.status] || ""}</span>
          <a class="listing-ask" href="${waLink(askText(item))}" target="_blank" rel="noopener">Ask on WhatsApp</a>
        </div>
      </div>
    </li>`;
}
