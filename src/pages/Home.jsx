import Navbar from '@/components/Navbar';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import ProductRange from '@/components/sections/ProductRange';
import Suppliers from '@/components/sections/Suppliers';
import NewsEvents from '@/components/sections/NewsEvents';
import ServicePillar from '@/components/sections/ServicePillar';
import Contact from '@/components/sections/Contact';
import SiteFooter from '@/components/sections/SiteFooter';

export default function Home() {
  return (
    <div className="min-h-screen bg-linen text-forest">
      <Navbar />
      <main>
        <Hero />
        <About />
        <ProductRange />
        <Suppliers />
        <NewsEvents />
        <ServicePillar />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
