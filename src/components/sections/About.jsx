import { Heart, Sprout, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Image } from "@/components/ui/image";
import { IMAGES } from "@/lib/storeInfo";

const VALUES = [
  { icon: Sprout, title: "Support local producers", text: "We partner with small, independent New Zealand makers — from wild-meat pies to real A2 cow's milk." },
  { icon: Heart, title: "Community first", text: "We serve and strengthen the communities within 50 kilometres of Pegasus." },
  { icon: MapPin, title: "Convenient essentials", text: "Everyday groceries, healthier choices, and specialty finds — all under one roof." },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-linen py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <Image src={IMAGES.storefront} alt="Pegasus General Store storefront at dawn" fittingType="fill" className="w-full h-[420px] sm:h-[520px]" />
              </div>
              <div className="absolute -bottom-6 -right-2 sm:right-6 rounded-2xl bg-forest text-linen px-6 py-4 shadow-lg max-w-[220px]">
                <div className="font-heading font-bold text-lg">Est. 2024</div>
                <div className="text-sm text-linen/80 mt-1">Proudly owned & operated by Rahul & Shai</div>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Who we are</span>
              <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-4xl text-forest text-balance">
                More than a shop — the digital front porch of the village.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 font-body text-lg text-stone leading-relaxed">
                Pegasus General Store is proudly owned and operated by Rahul and Shai, who took over the business in 2024 with a shared vision: to create a local store that combines convenience, quality, and community connection.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-4 font-body text-stone leading-relaxed">
                Rahul brings a background in sales and supermarket retail with Woolworths, while Shai has over 50 years of experience owning and operating businesses in the retail and hospitality sectors. What began as a traditional convenience store has evolved into a destination for everyday essentials and carefully selected specialty products — artisan foods, sourdough breads, gluten-free baked goods, and unique products from small producers across Canterbury and New Zealand.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 font-body text-stone leading-relaxed">
                At Pegasus General Store, we're more than just a place to shop — we're proud to be part of the community we serve.
              </p>
              <p className="mt-4 font-heading font-semibold text-forest">— Rahul & Shai, Directors</p>
            </Reveal>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={0.25 + i * 0.08}>
                  <div className="rounded-2xl border border-stone/15 bg-white/50 p-5 h-full">
                    <v.icon className="w-6 h-6 text-harvest" />
                    <div className="mt-3 font-heading font-semibold text-forest text-sm">{v.title}</div>
                    <p className="mt-1.5 text-sm text-stone leading-relaxed">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}