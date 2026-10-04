(function () {
  "use strict";

  var data = window.MGMJ;
  var biz = data.business;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function waLink(text) {
    var url = "https://wa.me/" + biz.whatsapp;
    return text ? url + "?text=" + encodeURIComponent(text) : url;
  }

  // ---------- Business details ----------
  $$("[data-field]").forEach(function (el) {
    var value = biz[el.getAttribute("data-field")];
    if (value) el.textContent = value;
  });
  $$("[data-tel]").forEach(function (el) { el.href = "tel:" + biz.phone; });
  $$("[data-wa]").forEach(function (el) { el.href = waLink("Assalam o Alaikum, I found you on your website."); });
  $$("[data-mail]").forEach(function (el) { el.href = "mailto:" + biz.email; });
  $$("[data-fb]").forEach(function (el) { el.href = biz.facebook; });
  $$("[data-yt]").forEach(function (el) { el.href = biz.youtube; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---------- Header and mobile nav ----------
  var header = $("[data-header]");
  var nav = $("[data-nav]");
  var toggle = $("[data-nav-toggle]");

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setNav(false);
      toggle.focus();
    }
  });

  // ---------- Hero gates ----------
  var portal = $(".portal");
  // Open once the arch is properly in view, so phone visitors see it too.
  if (portal) {
    var open = function () { setTimeout(function () { portal.classList.add("is-open"); }, 350); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { open(); io.disconnect(); }
      }, { threshold: 0.45 });
      io.observe(portal);
    } else {
      open();
    }
  }

  // ---------- Formatting ----------
  function formatPrice(rupees) {
    if (rupees >= 10000000) return "PKR " + trim(rupees / 10000000) + " Crore";
    if (rupees >= 100000) return "PKR " + trim(rupees / 100000) + " Lakh";
    return "PKR " + rupees.toLocaleString("en-PK");
  }
  function trim(n) { return String(Math.round(n * 100) / 100); }

  function formatArea(area) {
    var units = { marla: "Marla", kanal: "Kanal", sqft: "sq ft" };
    var label = units[area.unit] || area.unit;
    return area.value.toLocaleString("en-PK") + " " + label;
  }

  var categoryLabels = {
    home: "House / villa",
    residential: "Residential plot",
    commercial: "Commercial",
    investment: "Investment",
  };

  var icons = {
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5a1.5 1.5 0 1 0 0-.01"/></svg>',
    bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/></svg>',
    area: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4ZM4 9h3M4 14h3M9 4v3M14 4v3"/></svg>',
  };

  // ---------- Listings ----------
  var list = $("[data-listings]");
  var countEl = $("[data-count]");
  var emptyEl = $("[data-empty]");
  var state = { category: "all", q: "" };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function card(item) {
    var specs = [];
    if (item.beds) specs.push("<li>" + icons.bed + item.beds + " bed</li>");
    if (item.baths) specs.push("<li>" + icons.bath + item.baths + " bath</li>");
    specs.push("<li>" + icons.area + formatArea(item.area) + "</li>");
    var ask = "Assalam o Alaikum, I'm interested in: " + item.title + ", " + item.location + " (" + formatPrice(item.price) + "). Is it still available?";

    return (
      '<li class="listing">' +
        '<div class="listing-media">' +
          '<img src="' + escapeHtml(item.image) + '" alt="Illustration of the ' + escapeHtml(item.title.toLowerCase()) + '" loading="lazy" width="480" height="320">' +
          '<span class="listing-tag">' + categoryLabels[item.category] + "</span>" +
        "</div>" +
        '<div class="listing-body">' +
          '<p class="listing-price">' + formatPrice(item.price) + "</p>" +
          '<h3 class="listing-title">' + escapeHtml(item.title) + "</h3>" +
          '<p class="listing-loc">' + escapeHtml(item.location) + "</p>" +
          (item.note ? '<p class="listing-note">' + escapeHtml(item.note) + "</p>" : "") +
          '<ul class="listing-specs">' + specs.join("") + "</ul>" +
          '<div class="listing-cta"><a class="btn btn-outline" href="' + waLink(ask) + '" target="_blank" rel="noopener">Ask about this property</a></div>' +
        "</div>" +
      "</li>"
    );
  }

  function render() {
    var q = state.q.trim().toLowerCase();
    var items = data.listings.filter(function (item) {
      if (state.category !== "all" && item.category !== state.category) return false;
      if (q && (item.title + " " + item.location).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });

    list.innerHTML = items.map(card).join("");
    emptyEl.hidden = items.length > 0;
    list.hidden = items.length === 0;

    var noun = items.length === 1 ? "property" : "properties";
    countEl.textContent = items.length
      ? "Showing " + items.length + " " + noun + (q ? " matching “" + state.q.trim() + "”" : "")
      : "";

    $$("[data-filter]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-filter") === state.category));
    });
  }

  $("[data-filters]").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-filter]");
    if (!btn) return;
    state.category = btn.getAttribute("data-filter");
    render();
  });

  $("[data-reset]").addEventListener("click", function () {
    state = { category: "all", q: "" };
    $("[data-search]").reset();
    render();
  });

  $("[data-search]").addEventListener("submit", function (e) {
    e.preventDefault();
    var form = e.currentTarget;
    state.category = form.category.value;
    state.q = form.q.value;
    render();
    $("#properties").scrollIntoView();
  });

  render();

  // ---------- Area converter ----------
  var conv = $("[data-converter]");
  var out = $("[data-converter-out]");
  var unitNames = {
    marla: "Marla",
    kanal: "Kanal",
    sqft: "Square feet",
    sqyd: "Square yards",
    sqm: "Square metres",
    acre: "Acre",
  };

  function sqftPer(unit, marla) {
    switch (unit) {
      case "marla": return marla;
      case "kanal": return marla * 20;
      case "sqft": return 1;
      case "sqyd": return 9;
      case "sqm": return 10.7639;
      case "acre": return 43560;
    }
  }

  function fmt(n) {
    if (!isFinite(n)) return "—";
    var digits = n >= 100 ? 0 : n >= 1 ? 2 : 4;
    return Number(n.toFixed(digits)).toLocaleString("en-PK", { maximumFractionDigits: digits });
  }

  function convert() {
    var value = parseFloat(conv.value.value);
    var unit = conv.unit.value;
    var marla = parseFloat(conv.querySelector("input[name=marla]:checked").value);
    if (isNaN(value) || value < 0) {
      out.innerHTML = '<div><dt>Enter a size</dt><dd>—</dd></div>';
      return;
    }
    var sqft = value * sqftPer(unit, marla);
    out.innerHTML = Object.keys(unitNames).map(function (u) {
      return '<div' + (u === unit ? ' class="is-source"' : "") + "><dt>" + unitNames[u] + "</dt><dd>" + fmt(sqft / sqftPer(u, marla)) + "</dd></div>";
    }).join("");
  }
  conv.addEventListener("input", convert);
  conv.addEventListener("change", convert);
  conv.addEventListener("submit", function (e) { e.preventDefault(); });
  convert();

  // ---------- Enquiry → WhatsApp ----------
  var enquiry = $("[data-enquiry]");
  enquiry.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = enquiry;
    var ok = true;
    ["name", "phone"].forEach(function (name) {
      var input = f[name];
      var valid = name === "phone" ? /\d{7,}/.test(input.value.replace(/\D/g, "")) : input.value.trim().length > 0;
      input.closest(".field").classList.toggle("has-error", !valid);
      input.setAttribute("aria-invalid", String(!valid));
      if (!valid && ok) { input.focus(); ok = false; }
    });
    if (!ok) return;

    var lines = [
      "Assalam o Alaikum, Mera Ghar Meri Jannat.",
      "Name: " + f.name.value.trim(),
      "Phone: " + f.phone.value.trim(),
      "I want to: " + f.intent.value,
    ];
    if (f.details.value.trim()) lines.push("Details: " + f.details.value.trim());
    if (f.message.value.trim()) lines.push(f.message.value.trim());
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
  ["name", "phone"].forEach(function (name) {
    enquiry[name].addEventListener("input", function () {
      this.closest(".field").classList.remove("has-error");
      this.removeAttribute("aria-invalid");
    });
  });
})();
