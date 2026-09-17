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
  coords: { lat: -43.3453, lng: 172.6404 },
  social: {
    facebook: "https://www.facebook.com/pegasusgeneralstore",
    instagram: "https://www.instagram.com/pegasusgeneralstore",
    tiktok: "https://www.tiktok.com/@pegasusgeneralstore",
  },
  serviceAreas: ["Pegasus", "Ravenswood", "Woodend", "Kaiapoi", "Rangiora", "Waikuku", "Amberley", "Christchurch Northern Suburbs"],
};

export const IMAGES = {
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
  const isOpen = h >= open && h < close;
  return {
    open: isOpen,
    label: isOpen ? "Open now" : "Closed",
    next: isOpen ? `Closes ${fmtHour(close)}` : `Opens ${fmtHour(open)}`,
  };
}