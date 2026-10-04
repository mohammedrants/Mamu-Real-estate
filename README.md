# Mera Ghar Meri Jannat — website

Website for **Mera Ghar Meri Jannat · Real Estate Solutions** — _Your Dream Property Partner_.
Black and gold, after the brand's logo and Facebook cover.

It's a static site (HTML, CSS, vanilla JS), so there's no build step.

## Run it locally

You need [Node.js](https://nodejs.org) 20.19 or newer (`.nvmrc` pins 22; run `nvm use` if you have nvm).

```sh
npm install
npm run dev
```

This opens http://localhost:3000, and the page reloads whenever you save a file.

| Command                | What it does                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Local server on port 3000 that reloads on save (Vite).                                              |
| `npm start`            | Serves the folder exactly as it'll be deployed, on port 3000 (no live reload).                      |
| `npm run format`       | Formats HTML, CSS, JS, JSON and Markdown with Prettier.                                             |
| `npm run format:check` | Checks the formatting without changing files.                                                       |
| `npm run vendor`       | Copies the animation libraries from `node_modules/` into `vendor/` (also runs after `npm install`). |

The page loads its scripts as ES modules, so open it through one of these servers. Double-clicking `index.html` won't load the listings.

## Edit the content

Every business detail and listing is in **`js/data.js`**:

- `business`: phone, WhatsApp number, email, YouTube and Facebook links.
- `listings`: the properties shown on the site. The current ones are **samples**. Replace them with real properties (title, location, category, price in rupees, area, beds and baths, image, and a `description` for the property page).

Listing categories match the services on the cover: `home` (houses & villas), `residential` (residential plots), `commercial` and `investment`.

## Pages

| Page                 | What's on it                                                                            |
| -------------------- | --------------------------------------------------------------------------------------- |
| `index.html`         | Cinematic hero, search, featured properties, services overview, our promise             |
| `properties.html`    | All listings with search and filters, and the Marla / Kanal / sq ft converter           |
| `property.html?id=…` | One property in full: price, specs, description, WhatsApp and call buttons              |
| `services.html`      | The four services in detail, with what we check for each, and the four-step process     |
| `about.html`         | Who we are, our promise and the YouTube channel                                         |
| `contact.html`       | Phone, WhatsApp, email and an enquiry form that opens WhatsApp with the message written |

Every page except Contact ends with a call-to-action band, and they all share one header and footer.

**Home page hero:** a night scene seen through a gold Mughal arch. The moon rises, the villa's windows light up one by one and the title blooms in. Scrolling moves the camera through the arch towards the house, then the scene fades to the statement "Every property checked. Every step explained."

**Motion:** headings sharpen in word by word, service icons draw themselves in gold, the line between the four steps fills as you scroll, the promise quote inks in, property cards tilt in 3D on hover, and moving between pages drops a gold-edged curtain with the logo. Everything respects the visitor's reduced-motion setting.

### Animation libraries

| Library                                                     | Used for                                               |
| ----------------------------------------------------------- | ------------------------------------------------------ |
| [GSAP](https://gsap.com) + ScrollTrigger + SplitText        | All timelines, scroll-driven motion and word splitting |
| [Lenis](https://lenis.darkroom.engineering)                 | Smooth scrolling (synced to ScrollTrigger)             |
| [Barba.js](https://barba.js.org)                            | Curtain transitions between pages                      |
| [Vanilla-Tilt](https://micku7zu.github.io/vanilla-tilt.js/) | 3D tilt and gold glare on property cards               |

They're copied into `vendor/` as plain browser files, so the site still needs no build step.

### Code layout

| File             | What's in it                                                              |
| ---------------- | ------------------------------------------------------------------------- |
| `js/data.js`     | Business details and listings                                             |
| `js/app.js`      | Entry point: Lenis, header, in-page links, Barba transitions              |
| `js/hero.js`     | Night scene and scroll-driven camera on the home page                     |
| `js/views.js`    | One init function per page: listings and filters, converter, enquiry form |
| `js/property.js` | Property page                                                             |
| `js/motion.js`   | Shared scroll reveals and tilt                                            |
| `js/shared.js`   | Formatting helpers and the listing card                                   |

## Assets

- `assets/svg/logo.svg`: the logo redrawn as a vector (crescent, bird, house, tree, towers).
- `assets/svg/jaali.svg`, `jaali-faint.svg`: the lattice pattern.
- `assets/img/*.svg`: property illustrations, to use until real photos are added. Photos (`.jpg`/`.webp`) can go in `assets/img/`; point each listing's `image` at its photo.

## Deploy

Upload the folder to any static host: GitHub Pages, Netlify, Vercel or cPanel hosting. Leave out `node_modules/`. Only the `.html` files, `css/`, `js/`, `vendor/` and `assets/` are needed. On Vercel or Netlify, set no build command and use the repository root as the output directory.
