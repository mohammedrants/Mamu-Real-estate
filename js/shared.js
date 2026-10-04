// Helpers shared by every page: data access, formatting and listing cards.
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

export function formatPrice(rupees) {
  const trim = (n) => String(Math.round(n * 100) / 100);
  if (rupees >= 10000000) return `PKR ${trim(rupees / 10000000)} Crore`;
  if (rupees >= 100000) return `PKR ${trim(rupees / 100000)} Lakh`;
  return `PKR ${rupees.toLocaleString("en-PK")}`;
}

export function formatArea(area) {
  const units = { marla: "Marla", kanal: "Kanal", sqft: "sq ft" };
  return `${area.value.toLocaleString("en-PK")} ${units[area.unit] || area.unit}`;
}

export const categoryLabels = {
  home: "House / villa",
  residential: "Residential plot",
  commercial: "Commercial",
  investment: "Investment",
};

export const icons = {
  bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01"/></svg>',
  bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
  area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4ZM4 9h3M4 14h3M9 4v3M14 4v3"/></svg>',
};

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
  return `Assalam o Alaikum, I'm interested in: ${item.title}, ${item.location} (${formatPrice(item.price)}). Is it still available?`;
}

export const propertyUrl = (item) => `property.html?id=${encodeURIComponent(item.id)}`;

export function card(item) {
  return `
    <li class="listing">
      <div class="listing-media">
        <img src="${escapeHtml(item.image)}" alt="Illustration of the ${escapeHtml(item.title.toLowerCase())}" loading="lazy" width="480" height="320">
        <span class="listing-tag">${categoryLabels[item.category]}</span>
      </div>
      <div class="listing-body">
        <p class="listing-price">${formatPrice(item.price)}</p>
        <h3 class="listing-title"><a class="listing-link" href="${propertyUrl(item)}">${escapeHtml(item.title)}</a></h3>
        <p class="listing-loc">${escapeHtml(item.location)}</p>
        ${item.note ? `<p class="listing-note">${escapeHtml(item.note)}</p>` : ""}
        <ul class="listing-specs">${specsHtml(item)}</ul>
        <div class="listing-cta">
          <a class="btn btn-outline" href="${waLink(askText(item))}" target="_blank" rel="noopener">Ask about this property</a>
        </div>
      </div>
    </li>`;
}
