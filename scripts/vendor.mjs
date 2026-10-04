// Copies the browser builds of the animation libraries into vendor/, so the
// site runs as plain static files (no bundler) on any host.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = {
  "gsap/dist/gsap.min.js": "gsap.min.js",
  "gsap/dist/ScrollTrigger.min.js": "ScrollTrigger.min.js",
  "gsap/dist/SplitText.min.js": "SplitText.min.js",
  "lenis/dist/lenis.min.js": "lenis.min.js",
  "lenis/dist/lenis.css": "lenis.css",
  "@barba/core/dist/barba.umd.js": "barba.umd.js",
  "vanilla-tilt/dist/vanilla-tilt.min.js": "vanilla-tilt.min.js",
};

mkdirSync(join(root, "vendor"), { recursive: true });
for (const [from, to] of Object.entries(files)) {
  copyFileSync(join(root, "node_modules", from), join(root, "vendor", to));
  console.log(`vendor/${to}`);
}
