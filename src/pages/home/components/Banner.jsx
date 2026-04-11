import { useState, useEffect } from "react";
import styles from "./Banner.module.css";

const images = [
  {
    url: "/Component.png",
  },
  {
    url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80",
  },
  {
    url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % images.length);
        setAnimating(false);
      }, 600);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => {
    if (index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 600);
  };

  return (
    <div className="w-full h-[calc(55vh-80px)] sm:h-[calc(50vh-80px)] md:h-[calc(90vh-64px)] bg-black flex items-center justify-center relative overflow-hidden">
      <div className="relative w-full h-full overflow-hidden">
        

        {/* Image */}
        <img
          key={`img-${current}`}
          src={images[current].url}
          alt={`Slide ${current + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-600 ${
            animating ? styles.slideOutLeft : styles.slideIn
          }`}
        />

        {/* Overlay */}
        <div className={`absolute inset-0 z-20 ${styles.overlay}`} />

        {/* Dots Navigation */}
        <div className="absolute bottom-[6%] md:bottom-[12%] left-1/2 -translate-x-1/2 z-40 flex gap-3 items-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-500 border-0 outline-none ${
                i === current 
                ? "w-4 h-4 shadow-lg" 
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
              }`}
              style={{
                backgroundColor: i === current ? "#E97C35" : undefined,
              }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : "false"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}