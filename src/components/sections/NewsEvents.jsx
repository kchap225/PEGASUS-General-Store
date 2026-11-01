import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Image } from "@/components/ui/image";
import { newsEventsApi } from "@/api/client";
import { IMAGES } from "@/lib/storeInfo";

const FALLBACK = [
  { title: "Fresh sourdough every Tuesday & Friday", date: "2026-09-08", description: "Bellbird Bakery loaves land on our shelves by 7:30 AM. Pre-order yours to guarantee a loaf.", image_url: IMAGES.sourdough, category: "New Arrival" },
  { title: "New Safari Meats biltong range in store", date: "2026-09-05", description: "Authentic South African biltong, boerewors and sosaties — freshly stocked this week.", image_url: IMAGES.biltong, category: "New Arrival" },
  { title: "Gluten-free pastry drop from TGF", date: "2026-09-03", description: "A new batch of gluten-free croissants and tarts arrived this morning. Limited quantities.", image_url: IMAGES.gfBakery, category: "New Arrival" },
  { title: "Community market day — Saturday morning", date: "2026-09-13", description: "Meet some of our local producers in store, sample their goods, and pick up something special.", image_url: IMAGES.pantry, category: "Event" },
  { title: "Ready meals restocked — Red Kitchen & Swole", date: "2026-09-01", description: "Healthy ready-made meals back in the chiller. Great for busy weeknights.", image_url: IMAGES.readyMeals, category: "New Arrival" },
];

function fmtDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
  } catch {
    return d;
  }
}

export default function NewsEvents() {
  const [items, setItems] = useState([]);
  const scrollerRef = useRef(null);

  useEffect(() => {
    newsEventsApi.list("-date", 20)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setItems(list.length ? list : FALLBACK);
      })
      .catch(() => setItems(FALLBACK));
  }, []);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section id="news" className="scroll-mt-20 bg-linen py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">The digital noticeboard</span>
              <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-4xl text-forest text-balance">News & events</h2>
              <p className="mt-4 font-body text-lg text-stone leading-relaxed">What's arriving, what's on, and what's worth the trip.</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button onClick={() => scrollBy(-1)} className="rounded-full border border-stone/30 p-2.5 text-forest hover:bg-forest hover:text-linen transition-colors" aria-label="Scroll left"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => scrollBy(1)} className="rounded-full border border-stone/30 p-2.5 text-forest hover:bg-forest hover:text-linen transition-colors" aria-label="Scroll right"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </Reveal>
      </div>

      <div ref={scrollerRef} className="no-scrollbar mt-12 flex justify-start gap-6 overflow-x-auto px-5 sm:justify-center sm:px-8 snap-x snap-mandatory pb-4">
        {items.map((item, i) => (
          <article key={i} className="snap-start flex-shrink-0 w-[300px] sm:w-[360px] rounded-3xl overflow-hidden border border-stone/15 bg-white shadow-sm hover:shadow-lg transition-shadow">
            <div className="h-44 overflow-hidden">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.title} fittingType="fill" className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-forest/5" />
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-harvest/10 text-harvest-dark font-semibold px-3 py-1">{item.category || "News"}</span>
                <span className="flex items-center gap-1 text-stone"><CalendarDays className="w-3.5 h-3.5" />{fmtDate(item.date)}</span>
              </div>
              <h3 className="mt-3 font-heading font-bold text-lg text-forest leading-snug">{item.title}</h3>
              <p className="mt-2 font-body text-stone text-sm leading-relaxed">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}