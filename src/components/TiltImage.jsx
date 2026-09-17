import { useRef, useState } from "react";
import { Image } from "@/components/ui/image";

export default function TiltImage({ src, alt, className, fittingType = "fill" }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: "perspective(900px) rotateY(0deg) rotateX(0deg)", transition: "transform 0.5s ease" });

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) scale(1.02)`,
      transition: "transform 0.12s ease-out",
    });
  }

  function onLeave() {
    setStyle({ transform: "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)", transition: "transform 0.6s ease" });
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={style} className={className}>
      <Image src={src} alt={alt} fittingType={fittingType} className="w-full h-full object-cover" />
    </div>
  );
}