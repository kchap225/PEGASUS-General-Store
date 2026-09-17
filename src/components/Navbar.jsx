import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import { STORE } from "@/lib/storeInfo";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Our Range", href: "#range" },
  { label: "Suppliers", href: "#suppliers" },
  { label: "News", href: "#news" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-linen/90 backdrop-blur-md border-b border-stone/15 shadow-sm" : "bg-transparent"}`}>
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="font-heading font-extrabold tracking-tight text-lg text-forest">
          {STORE.name}
        </a>
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-forest/80 hover:text-harvest transition-colors">
              {l.label}
            </a>
          ))}
          <Link to="/click-and-collect" className="inline-flex items-center gap-2 rounded-full bg-harvest px-5 py-2 text-sm font-semibold text-linen hover:bg-harvest-dark transition-colors">
            <ShoppingBag className="w-4 h-4" /> Click & Collect
          </Link>
        </div>
        <button className="md:hidden p-2 text-forest" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-linen border-t border-stone/15 px-5 py-4 flex flex-col gap-3">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-forest/80 font-medium py-1">
              {l.label}
            </a>
          ))}
          <Link to="/click-and-collect" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-harvest px-5 py-2.5 text-sm font-semibold text-linen">
            <ShoppingBag className="w-4 h-4" /> Click & Collect
          </Link>
        </div>
      )}
    </header>
  );
}