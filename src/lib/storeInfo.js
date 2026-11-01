export const STORE = {
  name: "Pegasus General Store",
  tagline: "Your local store, supporting local communities.",
  address: "60 Pegasus Main Street, Pegasus 7612, New Zealand",
  addressShort: "60 Pegasus Main Street, Pegasus",
  phone: "+64 3 312 6699",
  phoneHref: "tel:+6433126699",
  email: "hello@pegasusgeneralstore.co.nz",
  hours: [
    { day: "Monday – Friday", time: "7:00 AM – 8:00 PM" },
    { day: "Saturday", time: "7:00 AM – 8:00 PM" },
    { day: "Sunday", time: "8:00 AM – 6:00 PM" },
  ],
  // weekday 0=Sun ... 6=Sat -> [openHour, closeHour] 24h
  openHours: { 0: [8, 18], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 20], 5: [7, 20], 6: [7, 20] },
  // 60 Pegasus Main Street, Pegasus 7612 — geocoded, not the previous
  // Flaxton/Rangiora point that put the map pin in the wrong place.
  coords: { lat: -43.31228, lng: 172.69609 },
  // 'auto' (default): status is worked out from openHours. 'open' / 'closed'
  // let an admin override it in the Admin panel, e.g. for a holiday closure.
  statusOverride: 'auto',
  social: {
    facebook: "https://www.facebook.com/pegasusgeneralstore",
    instagram: "https://www.instagram.com/pegasusgeneralstore",
    tiktok: "https://www.tiktok.com/@pegasusgeneralstore",
  },
  serviceAreas: ["Pegasus", "Ravenswood", "Woodend", "Kaiapoi", "Rangiora", "Waikuku", "Amberley", "Christchurch Northern Suburbs"],
};

export const IMAGES = {
  heroBanner: "/images/hero-banner.png",
  heroInterior: "/images/hero-interior.jpg",
  storefront: "/images/storefront.jpg",
  sourdough: "/images/sourdough.jpg",
  wine: "/images/wine.jpg",
  postParcel: "/images/post-parcel.jpg",
  pantry: "/images/pantry.jpg",
  biltong: "/images/biltong.jpg",
  gfBakery: "/images/gf-bakery.jpg",
  readyMeals: "/images/ready-meals.jpg",
};

function fmtHour(h) {
  const hr = Math.floor(h);
  const suffix = hr >= 12 ? "PM" : "AM";
  const hr12 = hr % 12 || 12;
  return `${hr12} ${suffix}`;
}

export function getStoreStatus(now = new Date()) {
  const day = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const [open, close] = STORE.openHours[day] || [7, 20];
  if (STORE.statusOverride === 'open') {
    return { open: true, label: "Open now", next: `Closes ${fmtHour(close)}` };
  }
  if (STORE.statusOverride === 'closed') {
    return { open: false, label: "Closed", next: `Opens ${fmtHour(open)}` };
  }
  const isOpen = h >= open && h < close;
  return {
    open: isOpen,
    label: isOpen ? "Open now" : "Closed",
    next: isOpen ? `Closes ${fmtHour(close)}` : `Opens ${fmtHour(open)}`,
  };
}

// Today's hours row, so the hero card never shows Monday–Friday hours on
// a Sunday (the old code always used STORE.hours[0]).
export function getTodayHours(now = new Date()) {
  const day = now.getDay();
  // hours rows are grouped: Mon–Fri, Saturday, Sunday
  const row = day === 0 ? STORE.hours[2] : day === 6 ? STORE.hours[1] : STORE.hours[0];
  return row || STORE.hours[0];
}

// Apply settings saved by the Admin panel. Called at module load for a
// local-storage override, and again after an admin save so the storefront
// in the same session picks the change up without a reload.
export function applyStoreSettings(settings = {}) {
  if (!settings || typeof settings !== 'object') return;
  if (settings.address) STORE.address = settings.address;
  if (settings.addressShort) STORE.addressShort = settings.addressShort;
  if (settings.phone) STORE.phone = settings.phone;
  if (settings.phoneHref) STORE.phoneHref = settings.phoneHref;
  if (settings.email) STORE.email = settings.email;
  if (Array.isArray(settings.hours) && settings.hours.length) STORE.hours = settings.hours;
  if (settings.openHours && typeof settings.openHours === 'object') STORE.openHours = settings.openHours;
  if (settings.coords && Number.isFinite(Number(settings.coords.lat)) && Number.isFinite(Number(settings.coords.lng))) {
    STORE.coords = { lat: Number(settings.coords.lat), lng: Number(settings.coords.lng) };
  }
  if (settings.statusOverride) STORE.statusOverride = settings.statusOverride;
}

export function readLocalStoreSettings() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem('pegasus_store_settings');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

applyStoreSettings(readLocalStoreSettings());