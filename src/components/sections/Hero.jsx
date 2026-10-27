import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, ChevronDown } from "lucide-react";
import { STORE, getStoreStatus, IMAGES } from "@/lib/storeInfo";

const ARRIVALS = [
  "Fresh sourdough loaves landed at 7:30 AM",
  "New Safari Meats biltong just stocked",
  "TGF gluten-free pastries arrived this morning",
  "Local Oxford eggs — fresh today",
];

export default function Hero() {
  const status = getStoreStatus();
  const arrival = ARRIVALS[new Date().getDay() % ARRIVALS.length];

  return (
    /* Section IS the image container — no inner wrapper, so no white gap */
    <section
      id="top"
      className="relative w-full overflow-hidden bg-forest h-[100svh]"
    >
      <img
        src={IMAGES.heroBanner}
        alt="Pegasus General Store — From Storefront to Community Market"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        fetchpriority="high"
      />

      {/* Subtle darkening overlay so CTAs stay legible */}
      <div className="absolute inset-0 bg-forest/15" />


      {/* Top ribbon — strong dark fade so navbar links are clearly readable */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-forest/90 via-forest/50 to-transparent" />

      {/* Bottom gradient — deep forest green fade */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-forest via-forest/50 to-transparent" />

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-4 px-5 sm:bottom-14 sm:flex-row sm:justify-center sm:gap-4"
      >
        <Link
          to="/click-and-collect"
          className="inline-flex items-center gap-2 rounded-full bg-harvest px-7 py-3 text-sm font-semibold text-linen shadow-xl transition-colors hover:bg-harvest-dark"
        >
          Shop Pre-Orders <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="#range"
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-forest/20 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-forest"
        >
          View Product Range
        </a>
      </motion.div>

      {/* Open status — bottom left */}
      <div className="absolute bottom-6 left-6 z-10 hidden items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white sm:flex sm:left-8">
        <span className={`h-2 w-2 rounded-full ${status.open ? "animate-pulse bg-emerald-400" : "bg-white/60"}`} />
        {status.label} · {status.next}
      </div>

      {/* Hours card — bottom right */}
      <div className="absolute bottom-6 right-6 z-10 rounded-2xl bg-linen/90 px-5 py-3 text-left shadow-lg backdrop-blur sm:right-8">
        <div className="flex items-center gap-2 text-forest">
          <Clock className="h-4 w-4 text-harvest" />
          <span className="text-sm font-semibold">Open today {STORE.hours[0].time}</span>
        </div>
        <div className="mt-0.5 text-xs text-stone">{STORE.addressShort}</div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-white transition-colors hover:text-harvest sm:block"
        aria-label="Scroll to about section"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
