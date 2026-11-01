import { HeartPulse, Megaphone } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Image } from "@/components/ui/image";

const SERVICES = [
  {
    icon: HeartPulse,
    title: "Pharmacy Lines",
    text: "Essential over-the-counter remedies, health and first-aid essentials, and everyday pharmacy needs — so the basics are always close to home.",
    meta: "OTC remedies & health essentials",
    image: "/images/pharmacy.png",
  },
  {
    icon: Megaphone,
    title: "Community Noticeboard",
    text: "A real pin-board for the village — local events, lost & found, community groups and local services. Bring your notice in and we'll pin it up.",
    meta: "Pin your notice in store",
    image: "/images/noticeboard.png",
  },
];

export default function ServicePillar() {
  return (
    <section className="bg-linen py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">The service pillar</span>
            <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-4xl text-forest text-balance">
              Pharmacy &amp; community
            </h2>
            <p className="mt-4 font-body text-lg text-stone leading-relaxed">
              More than groceries — we're a vital utility hub for Pegasus and the surrounding communities.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-6 lg:gap-8 max-w-2xl">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-stone/15 bg-white overflow-hidden flex flex-col">
                {s.image ? (
                  <div className="h-44 overflow-hidden">
                    <Image src={s.image} alt={s.title} fittingType="fill" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="h-44 bg-forest/5 flex items-center justify-center">
                    <s.icon className="w-12 h-12 text-harvest" strokeWidth={1.2} />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <s.icon className="w-5 h-5 text-harvest" />
                    <h3 className="font-heading font-bold text-xl text-forest">{s.title}</h3>
                  </div>
                  <p className="mt-3 font-body text-stone leading-relaxed flex-1">{s.text}</p>
                  <div className="mt-4 inline-block w-fit rounded-full bg-harvest/10 text-harvest-dark text-xs font-semibold px-3 py-1.5">{s.meta}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}