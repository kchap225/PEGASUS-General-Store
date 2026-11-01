import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, ChevronDown } from "lucide-react";
import { STORE, getStoreStatus, getTodayHours } from "@/lib/storeInfo";

export default function Hero() {
  const status = getStoreStatus();
  const todayHours = getTodayHours();

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden bg-forest h-[100svh]"
    >
      {/* Full-screen background */}
      <img
        src="/images/hero-banner.png"
        alt="Pegasus General Store — From Storefront to Community Market"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        fetchPriority="high"
      />

      {/* Soft dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Top ribbon — keeps navbar readable */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

      {/* ── Centre content ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center"
      >
        {/* Logo text */}
        <h1 className="font-heading font-extrabold text-white tracking-[0.18em] text-5xl sm:text-7xl lg:text-8xl drop-shadow-lg">
          PEGASUS
        </h1>
        <p className="mt-2 font-heading font-light tracking-[0.5em] text-white/80 text-sm sm:text-base uppercase">
          General&nbsp;Store
        </p>

        {/* Side taglines — restored from the original hero design, restyled
            as clean pills instead of the highlighted ovals in the reference. */}
        <span className="hidden xl:block absolute left-10 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm whitespace-nowrap">
          We look like this
        </span>
        <span className="hidden xl:block absolute right-10 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm whitespace-nowrap">
          We treat you like this
        </span>

        {/* Description */}
        <p className="mt-7 max-w-xl font-body text-white/90 text-sm sm:text-base leading-relaxed drop-shadow">
          Your local store, supporting local communities. Serving North Canterbury
          with everyday essentials, artisan foods, and quality products sourced from
          New Zealand&apos;s finest small producers.
        </p>

        {/* CTA buttons */}
        <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            to="/click-and-collect"
            className="inline-flex items-center gap-2 rounded-full bg-harvest px-7 py-3 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-harvest-dark"
          >
            Shop Pre-Orders <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#range"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-forest"
          >
            View Product Range
          </a>
        </div>
      </motion.div>

      {/* Open status — bottom left */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white sm:left-8">
        <span className={`h-2 w-2 rounded-full ${status.open ? "animate-pulse bg-emerald-400" : "bg-white/60"}`} />
        {status.label} · {status.next}
      </div>

      {/* Hours card — bottom right */}
      <div className="absolute bottom-6 right-6 z-10 rounded-2xl bg-linen/90 px-5 py-3 text-left shadow-lg backdrop-blur sm:right-8">
        <div className="flex items-center gap-2 text-forest">
          <Clock className="h-4 w-4 text-harvest" />
          <span className="text-sm font-semibold">Open today {todayHours.time}</span>
        </div>
        <div className="mt-0.5 text-xs text-stone">{STORE.addressShort}</div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white transition-colors hover:text-harvest"
        aria-label="Scroll to about section"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
