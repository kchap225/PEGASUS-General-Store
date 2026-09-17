import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Wheat, Clock } from "lucide-react";
import { STORE, getStoreStatus, IMAGES } from "@/lib/storeInfo";
import { Image } from "@/components/ui/image";

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
    <section id="top" className="relative min-h-[100svh] flex items-stretch">
      <div className="grid md:grid-cols-2 w-full">
        <div className="flex items-center bg-linen grain px-6 sm:px-12 lg:px-20 py-28 md:py-0">
          <div className="max-w-lg">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-forest/5 text-forest/70 text-xs font-semibold tracking-wider uppercase px-3 py-1.5"
            >
              <span className={`w-2 h-2 rounded-full ${status.open ? "bg-emerald-500 animate-pulse" : "bg-stone"}`} />
              {status.label} · {status.next}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-forest leading-[1.05] text-balance"
            >
              Your local store, supporting local communities.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 font-body text-lg text-stone leading-relaxed"
            >
              Serving North Canterbury with everyday essentials, artisan foods, and quality products sourced from New Zealand's finest small producers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/click-and-collect" className="inline-flex items-center gap-2 rounded-full bg-harvest px-6 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark transition-colors">
                Shop Pre-Orders <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#range" className="inline-flex items-center gap-2 rounded-full border border-forest/20 px-6 py-3 text-sm font-semibold text-forest hover:bg-forest hover:text-linen transition-colors">
                View Product Range
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex items-start gap-3 rounded-2xl bg-white/60 border border-stone/15 p-4"
            >
              <Wheat className="w-5 h-5 text-harvest flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone">Today at the store</div>
                <div className="text-forest font-medium mt-0.5">{arrival}</div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="relative min-h-[42vh] md:min-h-full overflow-hidden">
          <Image src={IMAGES.heroInterior} alt="Inside Pegasus General Store at golden hour" fittingType="fill" className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent" />
          <div className="absolute bottom-6 right-6 rounded-2xl bg-linen/90 backdrop-blur px-5 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-forest">
              <Clock className="w-4 h-4 text-harvest" />
              <span className="text-sm font-semibold">Open today {STORE.hours[0].time}</span>
            </div>
            <div className="text-xs text-stone mt-0.5">{STORE.addressShort}</div>
          </div>
        </div>
      </div>
    </section>
  );
}