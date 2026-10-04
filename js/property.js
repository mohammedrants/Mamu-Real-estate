// Property page: one listing in full, chosen by ?id= in the URL.
import {
  $,
  $$,
  data,
  card,
  formatPrice,
  categoryLabels,
  specsHtml,
  waLink,
  askText,
  reducedMotion,
} from "./shared.js";
import { revealHeadings, riseIn, tilt } from "./motion.js";

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
    document.title = `${item.title}, ${item.location} — Mera Ghar Meri Jannat`;
    const img = $("[data-p-image]", container);
    img.src = item.image;
    img.alt = `Illustration of the ${item.title.toLowerCase()}`;
    $("[data-p-category]", container).textContent = categoryLabels[item.category];
    $("[data-p-price]", container).textContent = formatPrice(item.price);
    $("[data-p-title]", container).textContent = item.title;
    $("[data-p-location]", container).textContent = item.location;
    $("[data-p-specs]", container).innerHTML = specsHtml(item);
    $("[data-p-desc]", container).textContent = item.description || item.note || "";
    $("[data-p-wa]", container).href = waLink(askText(item));

    cleanups.push(
      tilt([$("[data-tilt-media]", container)], { max: 8, "max-glare": 0.22, scale: 1.02 }),
    );
    if (!reducedMotion) {
      const tl = gsap.timeline({ delay: 0.15 });
      tl.from("[data-tilt-media]", {
        autoAlpha: 0,
        scale: 0.94,
        duration: 1.2,
        ease: "expo.out",
      }).from(
        $$(".property-info > *", container),
        {
          autoAlpha: 0,
          y: 24,
          filter: "blur(6px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
        },
        0.2,
      );
      cleanups.push(() => tl.kill());
    }
  }

  const more = $("[data-more]", container);
  more.innerHTML = data.listings
    .filter((l) => l.id !== id)
    .slice(0, 3)
    .map(card)
    .join("");
  const cards = $$(".listing", more);
  cleanups.push(riseIn(cards));
  cleanups.push(tilt(cards));
  cleanups.push(revealHeadings(container));

  return () => cleanups.forEach((fn) => fn && fn());
}
