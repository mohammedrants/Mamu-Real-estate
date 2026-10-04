/*
 * Mera Ghar Meri Jannat — site content.
 *
 * Every business detail on the site comes from this file. Contact details
 * are from the Facebook page. Listings marked PLACEHOLDER are samples —
 * replace them with real properties before going live.
 */
window.MGMJ = {
  business: {
    name: "Mera Ghar Meri Jannat",
    urdu: "میرا گھر میری جنت",
    tagline: "Your Dream Property Partner",
    phoneDisplay: "+92 311 4101892",
    phone: "+923114101892",
    whatsapp: "923114101892", // assumed to be the same number as the phone
    email: "dreamproperties64@gmail.com",
    youtube: "https://www.youtube.com/@MeraGharMeriJannat1",
    facebook: "https://www.facebook.com/profile.php?id=61590870142852",
  },

  /*
   * Listing fields
   *   category  "home" (houses & villas) | "residential" (plots) | "commercial" | "investment"
   *   price     in rupees
   *   area      { value, unit: "marla" | "kanal" | "sqft" }
   *   status    "possession" | "ready" | "under-construction" | "on-instalments"
   *   badge     optional short label on the card, e.g. "New", "Instalments"
   *   verified  true once ownership, dues and NOCs have been checked — shows the gold seal
   *   listed    date the listing went up (YYYY-MM-DD), used for "Newest" sorting
   *   images    first image is the cover; add real photos (jpg/webp) here
   *   features  short amenity names shown on the property page
   */
  listings: [
    {
      id: "villa-1k", // PLACEHOLDER
      title: "1 Kanal modern villa",
      society: "DHA Phase 6",
      city: "Lahore",
      category: "home",
      price: 95000000,
      area: { value: 1, unit: "kanal" },
      beds: 5,
      baths: 6,
      status: "ready",
      badge: "New",
      verified: true,
      listed: "2026-09-28",
      images: ["assets/img/villa.svg", "assets/img/plan-house.svg"],
      note: "Basement, home theatre, solar",
      features: [
        "Basement",
        "Home theatre",
        "Solar system",
        "Servant quarter",
        "Double-height lounge",
        "Front lawn",
        "Car porch for 3",
      ],
      description:
        "A modern 1 Kanal villa on a wide road, with a full basement, home theatre and solar system already installed. Five bedrooms with attached baths, double-height lounge and a landscaped front lawn.",
    },
    {
      id: "house-10m", // PLACEHOLDER
      title: "10 Marla double-storey house",
      society: "Bahria Town",
      city: "Lahore",
      category: "home",
      price: 36500000,
      area: { value: 10, unit: "marla" },
      beds: 5,
      baths: 5,
      status: "ready",
      verified: true,
      listed: "2026-09-12",
      images: ["assets/img/townhouse.svg", "assets/img/plan-house.svg"],
      note: "Near park and mosque",
      features: [
        "Near park",
        "Near mosque",
        "Drawing room",
        "Separate dining",
        "Car porch",
        "Gas and electricity",
      ],
      description:
        "A well-kept double-storey family house a short walk from the park and mosque. Five bedrooms, a separate drawing room, and a kitchen with plenty of storage.",
    },
    {
      id: "plot-5m", // PLACEHOLDER
      title: "5 Marla residential plot",
      society: "Lake City",
      city: "Lahore",
      category: "residential",
      price: 14500000,
      area: { value: 5, unit: "marla" },
      status: "possession",
      verified: true,
      listed: "2026-09-30",
      images: ["assets/img/plot.svg", "assets/img/plan-plot.svg"],
      note: "Possession, all dues clear",
      features: [
        "Possession",
        "All dues clear",
        "Developed block",
        "Gas and electricity lines",
        "Near main gate",
      ],
      description:
        "A 5 Marla residential plot with possession, in a developed block with roads, electricity and gas lines in place. All society dues are clear.",
    },
    {
      id: "comm-8m", // PLACEHOLDER
      title: "8 Marla commercial plot",
      society: "Gulberg Greens",
      city: "Islamabad",
      category: "commercial",
      price: 88000000,
      area: { value: 8, unit: "marla" },
      status: "possession",
      badge: "Main boulevard",
      verified: true,
      listed: "2026-08-21",
      images: ["assets/img/commercial.svg", "assets/img/plan-plot.svg"],
      note: "On main boulevard",
      features: ["Boulevard frontage", "Commercial approval", "Corner access", "Possession"],
      description:
        "An 8 Marla commercial plot right on the main boulevard — strong frontage for shops, a showroom or an office building.",
    },
    {
      id: "apt-invest", // PLACEHOLDER
      title: "2 bed apartment on instalments",
      society: "Gulberg III",
      city: "Lahore",
      category: "investment",
      price: 18500000,
      area: { value: 1150, unit: "sqft" },
      beds: 2,
      baths: 2,
      status: "on-instalments",
      badge: "Instalments",
      verified: false,
      listed: "2026-09-18",
      images: ["assets/img/apartment.svg", "assets/img/plan-apartment.svg"],
      note: "25% down, 3-year plan",
      features: ["Lift", "Backup power", "Basement parking", "Security", "Park view"],
      description:
        "A 2 bedroom apartment in a building with lift, backup power and parking. Pay 25% down and the rest over three years — good for rental income.",
    },
    {
      id: "farm-4k", // PLACEHOLDER
      title: "4 Kanal farmhouse with pool",
      society: "Bedian Road",
      city: "Lahore",
      category: "home",
      price: 115000000,
      area: { value: 4, unit: "kanal" },
      beds: 6,
      baths: 7,
      status: "ready",
      verified: true,
      listed: "2026-07-30",
      images: ["assets/img/farmhouse.svg", "assets/img/plan-house.svg"],
      note: "Lawn, staff quarters",
      features: [
        "Swimming pool",
        "Wide lawns",
        "Staff quarters",
        "Covered verandah",
        "Event space",
        "Boundary wall",
      ],
      description:
        "A 4 Kanal farmhouse with a swimming pool, wide lawns, staff quarters and space for gatherings. Six bedrooms and a covered verandah overlooking the garden.",
    },
  ],

  // Questions buyers ask most. Shown on the Services page (and marked up for search engines).
  faq: [
    {
      q: "What documents should I check before buying a plot?",
      a: "At minimum: the allotment letter or file, the latest society dues clearance, the NOC for transfer, and the seller's CNIC matching the society's record. For property outside societies, the fard and registry from the land record office. We check all of these for you before any token money is paid.",
    },
    {
      q: "What is a marla, and why do sizes differ between societies?",
      a: "A marla is a unit of land area. Most housing societies count 1 marla as 225 sq ft, while older revenue records use 272.25 sq ft — so a '10 marla' plot can mean different sizes. Our area converter on the Properties page shows both.",
    },
    {
      q: "How much token money (bayana) is normal?",
      a: "It is usually a small percentage of the price, agreed in writing with a clear deadline for the full payment and transfer. Never pay a token before the papers have been verified.",
    },
    {
      q: "Can I buy from abroad as an overseas Pakistani?",
      a: "Yes. We send video walk-throughs, verify the documents on the ground, and keep you updated on WhatsApp. Transfers can be completed through a power of attorney or on a short visit.",
    },
    {
      q: "Do you charge buyers a commission?",
      a: "We tell you our fee before the first visit, so there are no surprises at the end. Call or message us and we'll explain it for your specific deal.",
    },
  ],
};
