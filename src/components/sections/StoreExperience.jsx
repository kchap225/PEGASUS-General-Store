import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import { Image } from "@/components/ui/image";
import { Sparkles, Store as StoreIcon, Heart, ArrowRight } from "lucide-react";

/**
 * "We look like this. But we treat you like this."
 *
 * Storytelling section celebrating the charm of an honest, down-to-earth
 * village general store paired with the warmth, care, and quality of artisan hospitality.
 *
 * Left side: Real photos taken right inside Pegasus General Store.
 * Right side: The warm, artisan culinary experience & community feeling.
 */

const REAL_STORE_PHOTOS = [
  {
    src: "/images/real/1000018146.jpg",
    title: "Our Snack & Pantry Shelves",
    subtitle: "Ouma rusks, Nik Naks & everyday favourites",
  },
  {
    src: "/images/real/1000018164.jpg",
    title: "Bellbird Sourdough",
    subtitle: "Delivered fresh from Woolston with locally milled flour",
  },
  {
    src: "/images/real/1000018170.jpg",
    title: "Canterbury's Choice A2 Milk",
    subtitle: "Real whole milk from local Canterbury dairy farmers",
  },
  {
    src: "/images/real/1000018184.jpg",
    title: "Village Counter Essentials",
    subtitle: "Energy bars, sweets & cold drinks ready on the go",
  },
  {
    src: "/images/real/1000018154.jpg",
    title: "Specialty Sauces & Braai",
    subtitle: "Hard-to-find international imports & BBQ goods",
  },
];

const TREAT_PHOTOS = [
  {
    src: "/images/hero-interior.jpg",
    title: "Golden Hour in the Village",
    subtitle: "Warm timber shelves, personal service, a familiar face",
  },
  {
    src: "/images/ready-meals.jpg",
    title: "Wholesome Pre-Made Meals",
    subtitle: "Crafted with local ingredients, made with care",
  },
  {
    src: "/images/gf-bakery.jpg",
    title: "Artisan Pastries & Treats",
    subtitle: "Fresh croissants, berry tarts & gluten-free delights",
  },
  {
    src: "/images/sourdough.jpg",
    title: "Oven-Fresh Bread Daily",
    subtitle: "Steaming golden crusts from Canterbury bakers",
  },
];

export default function StoreExperience() {
  const [realIdx, setRealIdx] = useState(0);
  const [treatIdx, setTreatIdx] = useState(0);

  return (
    <section className="bg-linen py-16 sm:py-24 border-b border-stone/15 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-harvest">
              <StoreIcon className="w-3.5 h-3.5" />
              The Pegasus Philosophy
            </span>
            <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-5xl text-forest tracking-tight text-balance">
              An honest village store with a heart of gold.
            </h2>
            <p className="mt-4 font-body text-base sm:text-lg text-stone leading-relaxed">
              We may look like your humble neighborhood general store on the outside — but step in, and you’re treated like family with the finest local produce North Canterbury has to offer.
            </p>
          </div>
        </Reveal>

        {/* Feature Banner: Exact Reference Tribute */}
        <Reveal delay={0.1}>
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-stone/20 bg-forest">
            <div className="relative group">
              <img
                src="/images/we-look-like-this-banner.jpg"
                alt="Pegasus General Store: We look like this, but we treat you like this"
                className="w-full h-auto object-cover max-h-[580px] mx-auto"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-harvest">Pegasus General Store</div>
                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-linen mt-1">
                    Everyday essentials. Local foods. A place to connect.
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 bg-linen/95 text-forest text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full shadow-md">
                  <Heart className="w-3.5 h-3.5 text-harvest fill-harvest" />
                  Local Food · Good People
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Interactive Comparison: Real Store Photos vs. The Pegasus Treatment */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">

          {/* LEFT: "We look like this" (Real store photos) */}
          <Reveal delay={0.15}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-stone/15 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-stone">
                  <span className="w-2 h-2 rounded-full bg-forest" />
                  The Real Shelves
                </span>
                <span className="text-xs font-heading font-medium text-stone/70">
                  Photo {realIdx + 1} of {REAL_STORE_PHOTOS.length}
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-forest tracking-tight">
                "We look like this."
              </h3>
              <p className="mt-2 text-stone text-sm font-body">
                Real shelves, real prices, and aisles packed full of South African rusks, braai seasonings, Bellbird bread, local Canterbury milk, and everyday staples.
              </p>

              {/* Main Photo with transition */}
              <div className="relative mt-6 rounded-2xl overflow-hidden bg-forest/5 aspect-[4/3] group shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={REAL_STORE_PHOTOS[realIdx].src}
                    src={REAL_STORE_PHOTOS[realIdx].src}
                    alt={REAL_STORE_PHOTOS[realIdx].title}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 via-forest/40 to-transparent p-4 text-linen">
                  <div className="font-heading font-bold text-sm sm:text-base">
                    {REAL_STORE_PHOTOS[realIdx].title}
                  </div>
                  <div className="text-xs text-linen/80 mt-0.5">
                    {REAL_STORE_PHOTOS[realIdx].subtitle}
                  </div>
                </div>
              </div>

              {/* Thumbnail Selector */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                {REAL_STORE_PHOTOS.map((photo, i) => (
                  <button
                    key={photo.src}
                    onClick={() => setRealIdx(i)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      realIdx === i ? "border-harvest ring-2 ring-harvest/30 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={photo.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* RIGHT: "But we treat you like this" (Artisan care & warmth) */}
          <Reveal delay={0.25}>
            <div className="bg-forest text-linen rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-harvest">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Village Treatment
                </span>
                <span className="text-xs font-heading font-medium text-linen/60">
                  Experience {treatIdx + 1} of {TREAT_PHOTOS.length}
                </span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-linen tracking-tight">
                "But we treat you like this."
              </h3>
              <p className="mt-2 text-linen/75 text-sm font-body">
                Freshly baked breads, farm-fresh eggs, hand-selected wines, and warm hospitality that makes every neighbor feel right at home.
              </p>

              {/* Main Photo with transition */}
              <div className="relative mt-6 rounded-2xl overflow-hidden bg-forest/40 aspect-[4/3] group shadow-inner">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={TREAT_PHOTOS[treatIdx].src}
                    src={TREAT_PHOTOS[treatIdx].src}
                    alt={TREAT_PHOTOS[treatIdx].title}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent p-4 text-linen">
                  <div className="font-heading font-bold text-sm sm:text-base">
                    {TREAT_PHOTOS[treatIdx].title}
                  </div>
                  <div className="text-xs text-linen/80 mt-0.5">
                    {TREAT_PHOTOS[treatIdx].subtitle}
                  </div>
                </div>
              </div>

              {/* Thumbnail Selector */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {TREAT_PHOTOS.map((photo, i) => (
                  <button
                    key={photo.src}
                    onClick={() => setTreatIdx(i)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      treatIdx === i ? "border-harvest ring-2 ring-harvest/30 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img src={photo.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

        </div>

        {/* Bottom Callout Bar */}
        <Reveal delay={0.3}>
          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-stone/15 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="text-center sm:text-left">
              <div className="font-heading font-bold text-lg sm:text-xl text-forest">
                Come see for yourself on Pegasus Main Street
              </div>
              <p className="font-body text-sm text-stone mt-1">
                Open 7 days a week · 60 Pegasus Main Street, Pegasus 7612
              </p>
            </div>
            <a
              href="#range"
              className="inline-flex items-center gap-2 rounded-full bg-forest text-linen px-6 py-3 text-sm font-semibold hover:bg-forest/90 transition-colors shadow-md shrink-0"
            >
              Explore Our Shelves <ArrowRight className="w-4 h-4 text-harvest" />
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
