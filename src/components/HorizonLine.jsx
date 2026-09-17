import { motion, useScroll } from "framer-motion";

export default function HorizonLine() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] origin-left horizon-line z-[60]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}