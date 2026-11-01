import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, UserRound } from "lucide-react";
import { supabase } from "@/api/client";

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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track Supabase Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.user_metadata?.role === 'admin';
  const accountHref = isAdmin ? '/admin' : user ? '/account' : '/login';
  const accountLabel = isAdmin ? 'Admin' : user ? 'My Account' : 'Login';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/15 bg-harvest-dark/95 shadow-sm backdrop-blur-md" : "bg-transparent"}`}>
      <nav className="w-full px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex flex-col leading-none">
          <span className="text-white font-heading font-extrabold text-xl sm:text-2xl tracking-tight drop-shadow-lg">
            Pegasus General Store
          </span>
        </a>
        <div className="hidden md:ml-auto md:flex items-center gap-7">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-white/90 drop-shadow-sm transition-colors hover:text-harvest">
              {l.label}
            </a>
          ))}
          <Link to="/click-and-collect" className="inline-flex items-center gap-2 rounded-full bg-harvest px-5 py-2 text-sm font-semibold text-linen hover:bg-harvest-dark transition-colors">
            <ShoppingBag className="w-4 h-4" /> Click &amp; Collect
          </Link>
          <Link to={accountHref} className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 drop-shadow-sm transition-colors hover:text-harvest">
            <UserRound className="h-4 w-4" /> {accountLabel}
          </Link>
        </div>
        <button className="p-2 text-white md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className={`md:hidden border-t px-5 py-4 flex flex-col gap-3 ${scrolled ? "border-white/15 bg-harvest-dark" : "border-white/15 bg-forest/80"}`}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-medium py-1 text-white/90">
              {l.label}
            </a>
          ))}
          <Link to="/click-and-collect" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-harvest px-5 py-2.5 text-sm font-semibold text-linen">
            <ShoppingBag className="w-4 h-4" /> Click &amp; Collect
          </Link>
          <Link to={accountHref} onClick={() => setOpen(false)} className="inline-flex items-center gap-2 font-medium py-1 text-white/90">
            <UserRound className="h-4 w-4" /> {accountLabel}
          </Link>
        </div>
      )}
    </header>
  );
}
