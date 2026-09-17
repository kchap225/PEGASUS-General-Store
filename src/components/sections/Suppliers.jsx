import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Image } from "@/components/ui/image";
import { api } from "@/api/client";

const FALLBACK = [
  { name: "Bellbird Bakery", region: "Christchurch", story: "Artisan bakers crafting sourdough and French-style pastries with a focus on natural fermentation and local flour.", product_range: "Sourdough breads, French pastries", image_url: "/images/sourdough.jpg" },
  { name: "Safari Meats", region: "Christchurch", story: "Specialist South African butchers bringing authentic flavours to Canterbury — biltong, boerewors and marinated specialities.", product_range: "Biltong, boerewors, sosaties, marinated steaks", image_url: "/images/biltong.jpg" },
  { name: "TGF Gluten Free Bakery", region: "Christchurch", story: "A dedicated gluten-free bakery producing treats and baked goods that never compromise on taste or texture.", product_range: "Gluten-free baked goods, pastries", image_url: "/images/gf-bakery.jpg" },
  { name: "Goodtime Pies", region: "Christchurch", story: "Handmade savoury pies packed with quality ingredients and bold, honest flavour.", product_range: "Wild meat pies, gourmet pies", image_url: "/images/ready-meals.jpg" },
  { name: "DeBoere Bakery", region: "Christchurch", story: "Traditional baking with a South African heart — breads and treats made the old-fashioned way.", product_range: "Specialty breads, baked treats", image_url: "/images/sourdough.jpg" },
  { name: "Oxford Eggs", region: "North Canterbury", story: "Free-range eggs from happy hens raised on the Canterbury plains.", product_range: "Free-range eggs", image_url: "/images/pantry.jpg" },
  { name: "A2 Milk", region: "North Canterbury", story: "Real cow's milk that's significantly easier to digest — naturally A2 protein, nothing added.", product_range: "A2 fresh milk", image_url: "/images/pantry.jpg" },
  { name: "West Coast Pies", region: "West Coast, South Island", story: "West Coast heritage baking with hearty, comforting pies made to a classic recipe.", product_range: "Traditional pies", image_url: "/images/ready-meals.jpg" },
  { name: "Red Kitchen", region: "Auckland", story: "Ready-made meals crafted for quality, nutrition and great taste for busy households.", product_range: "Ready meals", image_url: "/images/ready-meals.jpg" },
  { name: "Swole Foods", region: "Auckland", story: "Innovative healthy convenience foods and protein-led ready meals.", product_range: "Healthy ready meals", image_url: "/images/ready-meals.jpg" },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.suppliers.list("-created_date", 50)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSuppliers(list.length ? list : FALLBACK);
      })
      .catch(() => setSuppliers(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="suppliers" className="scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">How we source</span>
            <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-4xl text-forest text-balance">
              The people behind the produce
            </h2>
            <p className="mt-4 font-body text-lg text-stone leading-relaxed">
              We value trust, provenance and shared values. That's why we partner with small, local and artisanal businesses — and we're always on the lookout for innovative products and new collaborations.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {suppliers.map((s, i) => (
            <Reveal key={s.name + i} delay={(i % 3) * 0.08}>
              <div className="group h-full rounded-3xl overflow-hidden border border-stone/15 bg-linen hover:shadow-lg transition-shadow duration-500">
                <div className="h-44 overflow-hidden bg-forest/5">
                  {s.image_url ? (
                    <Image src={s.image_url} alt={s.name} fittingType="fill" className="w-full h-full group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-forest/10 to-harvest/10">
                      <span className="font-heading font-bold text-2xl text-forest/30">{s.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-harvest-dark text-xs font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> {s.region}
                  </div>
                  <h3 className="mt-2 font-heading font-bold text-xl text-forest">{s.name}</h3>
                  <p className="mt-2 font-body text-stone text-sm leading-relaxed">{s.story}</p>
                  <div className="mt-4 pt-4 border-t border-stone/15 text-sm font-medium text-forest/80">{s.product_range}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {loading && <p className="text-center text-stone mt-8">Loading our suppliers…</p>}
      </div>
    </section>
  );
}