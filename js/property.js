// Property page: one listing in full, chosen by ?id= in the URL.
import {
  $,
  $$,
  data,
  card,
  formatPrice,
  formatArea,
  formatAreaAlt,
  pricePerMarla,
  categoryLabels,
  statusLabels,
  locationOf,
  specsHtml,
  sealHtml,
  saveButtonHtml,
  icons,
  escapeHtml,
  waLink,
  askText,
  reducedMotion,
  isPhone,
} from "./shared.js";
import { revealHeadings, riseIn, tilt } from "./motion.js";
import { validate } from "./views.js";

const { gsap } = window;

export function initProperty(container, ctx, url) {
  const id = new URL(url, location.href).searchParams.get("id");
  const item = data.listings.find((l) => l.id === id);
  const cleanups = [];

  if (!item) {
    $("[data-property]", container).hidden = true;
    $("[data-p-missing]", container).hidden = false;
    document.title = "Property not found — Mera Ghar Meri Jannat";
  } else {
    fill(container, item);
    cleanups.push(initGallery(container, item));
    cleanups.push(initCalculator(container, item));
    cleanups.push(initVisit(container, item));
    cleanups.push(initShare(container, item));
    cleanups.push(initMap(container, item));
    cleanups.push(
      tilt([$("[data-tilt-media]", container)], { max: 5, "max-glare": 0.18, scale: 1.01 }),
    );
    addStructuredData(container, item);

    // The phone contact bar asks about this listing while it's open.
    const barWa = $("[data-m-bar-wa]");
    if (barWa) {
      const general = barWa.href;
      barWa.href = waLink(askText(item));
      cleanups.push(() => (barWa.href = general));
    }

    if (!reducedMotion) {
      const phone = isPhone();
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from($("[data-gallery]", container), {
        autoAlpha: 0,
        y: 20,
        duration: phone ? 0.7 : 1.1,
        ease: "expo.out",
      }).from(
        $$(".property-info > *", container),
        {
          autoAlpha: 0,
          y: phone ? 12 : 20,
          filter: phone ? "none" : "blur(6px)",
          duration: phone ? 0.5 : 0.8,
          ease: "power3.out",
          stagger: phone ? 0.04 : 0.06,
          clearProps: "filter",
        },
        0.15,
      );
      cleanups.push(() => tl.kill());
    }
  }

  // Similar properties: same category first, then the rest.
  const others = data.listings
    .filter((l) => l.id !== id)
    .sort((a, b) => (b.category === item?.category) - (a.category === item?.category));
  const more = $("[data-more]", container);
  more.innerHTML = others.slice(0, 3).map(card).join("");
  const cards = $$(".listing", more);
  cleanups.push(riseIn(cards));
  cleanups.push(tilt(cards));
  cleanups.push(revealHeadings(container));

  return () => cleanups.forEach((fn) => fn && fn());
}

function fill(container, item) {
  const set = (sel, text) => ($(sel, container).textContent = text);
  document.title = `${item.title}, ${locationOf(item)} — Mera Ghar Meri Jannat`;
  set("[data-p-crumb]", item.title);
  set("[data-p-category]", categoryLabels[item.category]);
  set("[data-p-title]", item.title);
  set("[data-p-location]", locationOf(item));
  set("[data-p-price]", formatPrice(item.price));
  set(
    "[data-p-rate]",
    item.category === "investment" ? "" : `${formatPrice(pricePerMarla(item))} per marla`,
  );
  set("[data-p-status]", statusLabels[item.status] || "");
  set("[data-p-desc]", item.description || item.note || "");
  set("[data-p-place]", `${locationOf(item)}, Pakistan`);
  $("[data-p-specs]", container).innerHTML = specsHtml(item);
  $("[data-p-wa]", container).href = waLink(askText(item));
  $("[data-p-save]", container).innerHTML = saveButtonHtml(item, "save-btn-wide");
  $("[data-p-save] .save-btn", container).insertAdjacentHTML("beforeend", "<span>Save</span>");

  const badge = $("[data-p-badge]", container);
  if (item.badge) {
    badge.textContent = item.badge;
    badge.hidden = false;
  }
  if (item.verified) {
    $("[data-p-verified]", container).hidden = false;
    $("[data-p-seal]", container).innerHTML = sealHtml("md");
  }

  const facts = [
    ["Type", categoryLabels[item.category]],
    ["Area", `${formatArea(item.area)} (${formatAreaAlt(item.area)})`],
    ["Price", formatPrice(item.price)],
    item.category === "investment" ? null : ["Price per marla", formatPrice(pricePerMarla(item))],
    ["Status", statusLabels[item.status] || "—"],
    item.beds ? ["Bedrooms", item.beds] : null,
    item.baths ? ["Bathrooms", item.baths] : null,
    ["Society / area", item.society],
    ["City", item.city],
    ["Papers", item.verified ? "Checked by our team" : "Being verified — ask us"],
    item.listed
      ? [
          "Listed",
          new Date(item.listed).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        ]
      : null,
  ].filter(Boolean);
  $("[data-p-facts]", container).innerHTML = facts
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${escapeHtml(String(v))}</dd></div>`)
    .join("");

  const features = item.features || [];
  $("[data-p-features-block]", container).hidden = features.length === 0;
  $("[data-p-features]", container).innerHTML = features
    .map((f) => `<li>${icons.check}${escapeHtml(f)}</li>`)
    .join("");
}

/* ---------- Gallery with thumbnails and a full-screen view ---------- */
function initGallery(container, item) {
  const images = item.images && item.images.length ? item.images : [item.image];
  const main = $("[data-gallery-main]", container);
  const thumbs = $("[data-gallery-thumbs]", container);
  const count = $("[data-gallery-count]", container);
  const box = $("[data-lightbox]", container);
  const boxImg = $("[data-lightbox-img]", container);
  const caption = $("[data-lightbox-caption]", container);
  const label = (i) =>
    /plan/.test(images[i])
      ? "Illustrative plan"
      : `Illustration of the ${item.title.toLowerCase()}`;
  let current = 0;

  function show(i) {
    current = (i + images.length) % images.length;
    main.src = images[current];
    main.alt = label(current);
    count.textContent = images.length > 1 ? `${current + 1} / ${images.length}` : "";
    $$("button", thumbs).forEach((b, n) => b.setAttribute("aria-pressed", String(n === current)));
    if (box.open) {
      boxImg.src = images[current];
      boxImg.alt = label(current);
      caption.textContent = `${label(current)} — ${current + 1} of ${images.length}`;
    }
  }

  thumbs.innerHTML =
    images.length > 1
      ? images
          .map(
            (src, i) =>
              `<button type="button" class="thumb" aria-label="Show image ${i + 1}" aria-pressed="false"><img src="${escapeHtml(src)}" alt="" width="120" height="80" loading="lazy"></button>`,
          )
          .join("")
      : "";
  const onThumb = (e) => {
    const b = e.target.closest(".thumb");
    if (b) show($$(".thumb", thumbs).indexOf(b));
  };
  thumbs.addEventListener("click", onThumb);

  const open = () => {
    box.showModal();
    show(current);
  };
  const onKey = (e) => {
    if (!box.open) return;
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft") show(current - 1);
  };
  $("[data-gallery-open]", container).addEventListener("click", open);
  $("[data-lightbox-next]", container).addEventListener("click", () => show(current + 1));
  $("[data-lightbox-prev]", container).addEventListener("click", () => show(current - 1));
  $("[data-lightbox-close]", container).addEventListener("click", () => box.close());
  box.addEventListener("click", (e) => e.target === box && box.close());
  document.addEventListener("keydown", onKey);
  $$(".lightbox-btn", box).forEach((b) => (b.hidden = images.length < 2));

  show(0);
  return () => {
    document.removeEventListener("keydown", onKey);
    if (box.open) box.close();
  };
}

/* ---------- Instalment calculator ---------- */
function initCalculator(container, item) {
  const form = $("[data-calc]", container);
  form.price.value = item.price;
  const down = $("[data-calc-down]", container);
  const monthly = $("[data-calc-monthly]", container);
  function update() {
    const price = Math.max(0, Number(form.price.value) || 0);
    const pct = Number(form.down.value);
    const months = Number(form.years.value) * 12;
    form.downOut.value = `${pct}%`;
    down.textContent = formatPrice((price * pct) / 100);
    monthly.textContent = formatPrice((price * (100 - pct)) / 100 / months);
  }
  form.addEventListener("input", update);
  form.addEventListener("submit", (e) => e.preventDefault());
  update();
  return null;
}

/* ---------- Book a visit → WhatsApp ---------- */
function initVisit(container, item) {
  const form = $("[data-visit]", container);
  const today = new Date();
  form.day.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate(form, { name: (v) => v.trim().length > 0, day: (v) => v.length > 0 })) return;
    const day = new Date(form.day.value).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const text = [
      "Assalam o Alaikum, I'd like to visit this property:",
      `${item.title}, ${locationOf(item)} (${formatPrice(item.price)})`,
      `Name: ${form.name.value.trim()}`,
      `Preferred: ${day}, ${form.time.value}`,
    ].join("\n");
    window.open(waLink(text), "_blank", "noopener");
  });
  return null;
}

/* ---------- Share: the phone's share sheet, or copy the link ---------- */
function initShare(container, item) {
  const btn = $("[data-p-share]", container);
  const label = $("[data-share-label]", btn);
  let timer = 0;
  btn.addEventListener("click", async () => {
    const shareData = {
      title: item.title,
      text: `${item.title} — ${formatPrice(item.price)}`,
      url: location.href,
    };
    try {
      if (navigator.share) return await navigator.share(shareData);
      await navigator.clipboard.writeText(location.href);
      label.textContent = "Link copied";
    } catch {
      label.textContent = "Copy the address bar link";
    }
    clearTimeout(timer);
    timer = setTimeout(() => (label.textContent = "Share"), 2500);
  });
  return () => clearTimeout(timer);
}

/* ---------- Map: only loads from Google when asked ---------- */
function initMap(container, item) {
  const box = $("[data-map]", container);
  $("[data-map-load]", box).addEventListener("click", () => {
    const q = encodeURIComponent(`${locationOf(item)}, Pakistan`);
    box.classList.add("is-loaded");
    box.innerHTML = `<iframe title="Map of ${escapeHtml(locationOf(item))}" src="https://maps.google.com/maps?q=${q}&z=13&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  });
  return null;
}

/* ---------- Structured data for this listing ---------- */
function addStructuredData(container, item) {
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: item.title,
    description: item.description,
    datePosted: item.listed,
    url: location.href,
    image: (item.images || []).map((src) => new URL(src, location.href).href),
    offers: { "@type": "Offer", price: item.price, priceCurrency: "PKR" },
    contentLocation: { "@type": "Place", name: locationOf(item) },
  });
  container.appendChild(ld);
}
