import { useState } from "react";
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Music2, Send, CheckCircle2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { STORE } from "@/lib/storeInfo";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

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
              <div className="rounded-2xl border border-stone/15 bg-linen p-5">
                <Mail className="w-5 h-5 text-harvest" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-stone">Email</div>
                <div className="mt-1 font-heading font-semibold text-forest break-all">{STORE.email}</div>
              </div>
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

            <div id="message-form" className="mt-8 scroll-mt-24 rounded-3xl border border-stone/15 bg-linen p-6 sm:p-8">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-harvest">Message us</p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-forest">How can we help?</h3>
                <p className="mt-2 text-sm text-stone">Send us the details and our team will get back to you.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="mb-1.5 block text-sm font-medium text-forest">Name</span><input required name="name" value={form.name} onChange={updateField} className="w-full rounded-xl border border-stone/20 bg-white px-3 py-2.5 text-forest outline-none placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10" placeholder="Your name" /></label>
                  <label className="block"><span className="mb-1.5 block text-sm font-medium text-forest">Email</span><input required type="email" name="email" value={form.email} onChange={updateField} className="w-full rounded-xl border border-stone/20 bg-white px-3 py-2.5 text-forest outline-none placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10" placeholder="you@example.com" /></label>
                </div>
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-forest">Subject</span><input required name="subject" value={form.subject} onChange={updateField} className="w-full rounded-xl border border-stone/20 bg-white px-3 py-2.5 text-forest outline-none placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10" placeholder="How can we help?" /></label>
                <label className="block"><span className="mb-1.5 block text-sm font-medium text-forest">Message</span><textarea required name="message" value={form.message} onChange={updateField} rows="5" className="w-full rounded-xl border border-stone/20 bg-white px-3 py-2.5 text-forest outline-none placeholder:text-stone/60 focus:border-harvest focus:ring-2 focus:ring-harvest/10" placeholder="Tell us a little more..." /></label>
                {submitted && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Thanks, your message has been received.</p>}
                <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-harvest px-5 py-3 text-sm font-semibold text-linen transition-colors hover:bg-harvest-dark"><Send className="h-4 w-4" /> Send message</button>
              </form>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}