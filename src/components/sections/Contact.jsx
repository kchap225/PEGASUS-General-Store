import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Music2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { STORE } from "@/lib/storeInfo";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Find us</span>
            <h2 className="mt-3 font-heading font-extrabold text-3xl sm:text-4xl text-forest text-balance">Come say kia ora</h2>
            <p className="mt-4 font-body text-lg text-stone leading-relaxed">We're right on Pegasus Main Street — pop in for essentials, a chat, or to pick up your pre-order.</p>
          </div>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-stone/15 h-[360px] lg:h-full min-h-[360px]">
              {/* @ts-ignore */}
              <MapContainer center={[STORE.coords.lat, STORE.coords.lng]} zoom={14} scrollWheelZoom={false} className="w-full h-full">
                {/* @ts-ignore */}
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {/* @ts-ignore */}
                <CircleMarker center={[STORE.coords.lat, STORE.coords.lng]} radius={12} pathOptions={{ color: "#D97706", fillColor: "#D97706", fillOpacity: 0.5 }}>
                  <Popup>{STORE.name}<br />{STORE.address}</Popup>
                </CircleMarker>
              </MapContainer>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-4">
              <a href={STORE.phoneHref} className="rounded-2xl border border-stone/15 bg-linen p-5 hover:border-harvest transition-colors block">
                <Phone className="w-5 h-5 text-harvest" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone">Call us</div>
                <div className="mt-1 font-heading font-semibold text-forest">{STORE.phone}</div>
              </a>
              <a href={`mailto:${STORE.email}`} className="rounded-2xl border border-stone/15 bg-linen p-5 hover:border-harvest transition-colors block">
                <Mail className="w-5 h-5 text-harvest" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone">Email</div>
                <div className="mt-1 font-heading font-semibold text-forest break-all">{STORE.email}</div>
              </a>
              <div className="rounded-2xl border border-stone/15 bg-linen p-5 sm:col-span-2">
                <MapPin className="w-5 h-5 text-harvest" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone">Visit</div>
                <div className="mt-1 font-heading font-semibold text-forest">{STORE.address}</div>
              </div>
              <div className="rounded-2xl border border-stone/15 bg-linen p-5 sm:col-span-2">
                <Clock className="w-5 h-5 text-harvest" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone">Opening hours</div>
                <ul className="mt-2 space-y-1.5">
                  {STORE.hours.map((h) => (
                    <li key={h.day} className="flex justify-between text-forest">
                      <span className="font-medium">{h.day}</span>
                      <span className="text-stone">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <a href={STORE.social.facebook} target="_blank" rel="noreferrer" className="flex-1 rounded-2xl border border-stone/15 bg-linen p-4 flex items-center justify-center gap-2 text-forest hover:border-harvest transition-colors">
                <Facebook className="w-5 h-5 text-harvest" /> <span className="text-sm font-medium">Facebook</span>
              </a>
              <a href={STORE.social.instagram} target="_blank" rel="noreferrer" className="flex-1 rounded-2xl border border-stone/15 bg-linen p-4 flex items-center justify-center gap-2 text-forest hover:border-harvest transition-colors">
                <Instagram className="w-5 h-5 text-harvest" /> <span className="text-sm font-medium">Instagram</span>
              </a>
              <a href={STORE.social.tiktok} target="_blank" rel="noreferrer" className="flex-1 rounded-2xl border border-stone/15 bg-linen p-4 flex items-center justify-center gap-2 text-forest hover:border-harvest transition-colors">
                <Music2 className="w-5 h-5 text-harvest" /> <span className="text-sm font-medium">TikTok</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}