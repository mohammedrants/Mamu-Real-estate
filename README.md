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

| Command                | What it does                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`          | Local server on port 3000 that reloads on save (Vite).                         |
| `npm start`            | Serves the folder exactly as it'll be deployed, on port 3000 (no live reload). |
| `npm run format`       | Formats HTML, CSS, JS, JSON and Markdown with Prettier.                        |
| `npm run format:check` | Checks the formatting without changing files.                                  |

The page loads its scripts as ES modules, so open it through one of these servers. Double-clicking `index.html` won't load the listings.

## Edit the content

Every business detail and listing is in **`js/data.js`**:

- `business`: phone, WhatsApp number, email, YouTube and Facebook links.
- `listings`: the properties shown on the site. The current ones are **samples**. Replace them with real properties (title, location, category, price in rupees, area, beds and baths, image).

Listing categories match the services on the cover: `home` (houses & villas), `residential` (residential plots), `commercial` and `investment`.

## What's on the page

- An arched gateway in the hero whose gold jaali doors open onto a villa at night (it respects reduced-motion settings).
- Property search and filters.
- A Marla / Kanal / sq ft converter, with both the 225 and 272.25 sq ft marla.
- An enquiry form that opens WhatsApp with the message already written.

## Assets

- `assets/svg/logo.svg`: the logo redrawn as a vector (crescent, bird, house, tree, towers).
- `assets/svg/jaali.svg`, `jaali-faint.svg`: the lattice pattern.
- `assets/img/*.svg`: property illustrations, to use until real photos are added. Photos (`.jpg`/`.webp`) can go in `assets/img/`; point each listing's `image` at its photo.

## Deploy

Upload the folder to any static host: GitHub Pages, Netlify, Vercel or cPanel hosting. Leave out `node_modules/`. Only `index.html`, `css/`, `js/` and `assets/` are needed. On Vercel or Netlify, set no build command and use the repository root as the output directory.
