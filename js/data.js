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

  // category: "home" (houses & villas) | "residential" (residential plots)
  //         | "commercial" (commercial plots & buildings) | "investment"
  // price in rupees. description shows on the property page. area: { value, unit: "marla" | "kanal" | "sqft" }
  listings: [
    {
      id: "villa-1k", // PLACEHOLDER
      title: "1 Kanal modern villa",
      location: "DHA Phase 6, Lahore",
      category: "home",
      price: 95000000,
      area: { value: 1, unit: "kanal" },
      beds: 5,
      baths: 6,
      image: "assets/img/villa.svg",
      note: "Basement, home theatre, solar",
      description:
        "A modern 1 Kanal villa on a wide road, with a full basement, home theatre and solar system already installed. Five bedrooms with attached baths, double-height lounge and a landscaped front lawn.",
    },
    {
      id: "house-10m", // PLACEHOLDER
      title: "10 Marla double-storey house",
      location: "Bahria Town, Lahore",
      category: "home",
      price: 36500000,
      area: { value: 10, unit: "marla" },
      beds: 5,
      baths: 5,
      image: "assets/img/townhouse.svg",
      note: "Near park and mosque",
      description:
        "A well-kept double-storey family house a short walk from the park and mosque. Five bedrooms, a separate drawing room, and a kitchen with plenty of storage.",
    },
    {
      id: "plot-5m", // PLACEHOLDER
      title: "5 Marla residential plot",
      location: "Lake City, Lahore",
      category: "residential",
      price: 14500000,
      area: { value: 5, unit: "marla" },
      image: "assets/img/plot.svg",
      note: "Possession, all dues clear",
      description:
        "A 5 Marla residential plot with possession, in a developed block with roads, electricity and gas lines in place. All society dues are clear.",
    },
    {
      id: "comm-8m", // PLACEHOLDER
      title: "8 Marla commercial plot",
      location: "Gulberg Greens, Islamabad",
      category: "commercial",
      price: 88000000,
      area: { value: 8, unit: "marla" },
      image: "assets/img/commercial.svg",
      note: "On main boulevard",
      description:
        "An 8 Marla commercial plot right on the main boulevard — strong frontage for shops, a showroom or an office building.",
    },
    {
      id: "apt-invest", // PLACEHOLDER
      title: "2 bed apartment on instalments",
      location: "Gulberg III, Lahore",
      category: "investment",
      price: 18500000,
      area: { value: 1150, unit: "sqft" },
      beds: 2,
      baths: 2,
      image: "assets/img/apartment.svg",
      note: "25% down, 3-year plan",
      description:
        "A 2 bedroom apartment in a building with lift, backup power and parking. Pay 25% down and the rest over three years — good for rental income.",
    },
    {
      id: "farm-4k", // PLACEHOLDER
      title: "4 Kanal farmhouse with pool",
      location: "Bedian Road, Lahore",
      category: "home",
      price: 115000000,
      area: { value: 4, unit: "kanal" },
      beds: 6,
      baths: 7,
      image: "assets/img/farmhouse.svg",
      note: "Lawn, staff quarters",
      description:
        "A 4 Kanal farmhouse with a swimming pool, wide lawns, staff quarters and space for gatherings. Six bedrooms and a covered verandah overlooking the garden.",
    },
  ],
};
