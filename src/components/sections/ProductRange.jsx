import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import TiltImage from "@/components/TiltImage";
import { IMAGES } from "@/lib/storeInfo";

const DEPARTMENTS = [
  {
    name: "The Artisan Pantry",
    blurb: "Cereals, baking ingredients, sauces, dressings & oils, rice, pasta, stocks & broths, confectionery and cookies.",
    brands: "Swastik · Red Kitchen · Swole Foods",
    image: IMAGES.pantry,
  },
  {
    name: "The Bakery",
    blurb: "Sourdough breads, authentic French pastries and gluten-free baked goods fresh from local ovens.",
    brands: "Bellbird Bakery · DeBoere Bakery · TGF Gluten Free",
    image: IMAGES.sourdough,
  },
  {
    name: "Specialty Meats",
    blurb: "South African favourites — biltong, boerewors, sosaties and marinated steaks.",
    brands: "Safari Meats",
    image: IMAGES.biltong,
  },
  {
    name: "Wine & Drinks",
    blurb: "A curated cellar of local Canterbury wines alongside everyday drinks and refreshments.",
    brands: "North Canterbury vineyards",
    image: IMAGES.wine,
  },
  {
    name: "Ready Meals",
    blurb: "Healthy convenience foods and ready-made meals with quality, nutrition and great taste for busy households.",
    brands: "Red Kitchen · Swole Foods · West Coast Pies",
    image: IMAGES.readyMeals,
  },
  {
    name: "Gluten-Free Bakery",
    blurb: "A dedicated range of gluten-free baked goods, pastries and treats that don't compromise on taste.",
    brands: "TGF Gluten Free Bakery",
    image: IMAGES.gfBakery,
  },
];

const ALSO = ["Dairy & Eggs", "Frozen", "Household Essentials", "Post & Pharmacy"];

export default function ProductRange() {
  return (
    <section id="range" className="scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">What we sell</span>
            <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-4xl text-forest text-balance">
              The marketplace canvas
            </h2>
            <p className="mt-4 font-body text-lg text-stone leading-relaxed">
              A curated range that spans everyday essentials and carefully selected specialty products. Browse by department — and know you can pick up both milk and a high-end local Pinot Noir in the same visit.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {DEPARTMENTS.map((d, i) => (
            <Reveal key={d.name} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-3xl overflow-hidden border border-stone/15 bg-linen hover:shadow-xl transition-shadow duration-500">
                <div className="relative h-56 overflow-hidden">
                  <TiltImage src={d.image} alt={d.name} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <h3 className="absolute bottom-4 left-5 right-5 font-heading font-bold text-xl text-linen drop-shadow">{d.name}</h3>
                </div>
                <div className="p-6">
                  <p className="font-body text-stone leading-relaxed">{d.blurb}</p>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-harvest-dark">{d.brands}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-stone">Also in store:</span>
            {ALSO.map((a) => (
              <span key={a} className="rounded-full bg-forest/5 text-forest/80 text-sm font-medium px-4 py-1.5">{a}</span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 rounded-3xl bg-forest text-linen p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-heading font-bold text-2xl">Pre-order your favourites</h3>
              <p className="mt-2 text-linen/80 max-w-xl">Skip the wait — place a Click & Collect pre-order for sourdough, gluten-free bakes, ready meals and limited releases, then pick up at your convenience.</p>
            </div>
            <Link to="/click-and-collect" className="inline-flex items-center gap-2 rounded-full bg-harvest px-6 py-3 text-sm font-semibold text-linen hover:bg-harvest-dark transition-colors whitespace-nowrap">
              Start a pre-order <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}