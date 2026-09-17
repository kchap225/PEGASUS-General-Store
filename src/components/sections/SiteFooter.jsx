import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, MessageSquare, MapPin } from "lucide-react";
import { STORE } from "@/lib/storeInfo";

function weatherInfo(code) {
  if (code === 0) return { label: "Clear", Icon: Sun };
  if (code <= 3) return { label: "Partly cloudy", Icon: Cloud };
  if (code <= 48) return { label: "Foggy", Icon: Cloud };
  if (code <= 67) return { label: "Rainy", Icon: CloudRain };
  if (code <= 77) return { label: "Snowy", Icon: CloudSnow };
  if (code <= 82) return { label: "Showers", Icon: CloudRain };
  return { label: "Breezy", Icon: Wind };
}

export default function SiteFooter() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-43.345&longitude=172.64&current=temperature_2m,weather_code&timezone=Pacific/Auckland")
      .then((r) => r.json())
      .then((d) => setWeather(d?.current || null))
      .catch(() => {});
  }, []);

  const w = weather ? weatherInfo(weather.weather_code) : null;

  return (
    <footer className="bg-forest text-linen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="font-heading font-extrabold text-xl">{STORE.name}</div>
            <p className="mt-3 text-linen/70 font-body leading-relaxed max-w-xs">{STORE.tagline} Serving North Canterbury with everyday essentials and artisan foods.</p>
            <div className="mt-5 flex items-start gap-2 text-linen/80 text-sm">
              <MapPin className="w-4 h-4 text-harvest mt-0.5 flex-shrink-0" />
              {STORE.address}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Pegasus weather</div>
            <div className="mt-4 rounded-2xl bg-linen/10 p-5 flex items-center gap-4">
              {w ? (
                <>
                  <w.Icon className="w-10 h-10 text-harvest" />
                  <div>
                    <div className="font-heading font-bold text-2xl">{Math.round(weather.temperature_2m)}°C</div>
                    <div className="text-linen/70 text-sm">{w.label} in Pegasus</div>
                  </div>
                </>
              ) : (
                <div className="text-linen/60 text-sm">Loading weather…</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Message the store</div>
            <p className="mt-3 text-linen/70 font-body leading-relaxed">Got a question, a product request, or a new supplier collaboration in mind? We'd love to hear from you.</p>
            <a href={`mailto:${STORE.email}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-harvest px-5 py-2.5 text-sm font-semibold text-linen hover:bg-harvest-dark transition-colors">
              <MessageSquare className="w-4 h-4" /> Message us
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-linen/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center">
            {STORE.serviceAreas.map((a, i) => (
              <span key={a} className="text-xs text-linen/50">
                {i > 0 && <span className="text-linen/30 mr-2">·</span>}{a}
              </span>
            ))}
          </div>
          <div className="text-xs text-linen/50">© {new Date().getFullYear()} {STORE.name}. Made with care in North Canterbury.</div>
        </div>
      </div>
    </footer>
  );
}