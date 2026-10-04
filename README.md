# Mera Ghar Meri Jannat — website

Website for **Mera Ghar Meri Jannat · Real Estate Solutions** — *Your Dream Property Partner*.
Black and gold, after the brand's logo and Facebook cover.

It's a static site (HTML, CSS, vanilla JS), so there's no build step.

## Run it locally

```sh
npx serve .
```

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

Upload the folder to any static host: GitHub Pages, Netlify, Vercel or cPanel hosting.
