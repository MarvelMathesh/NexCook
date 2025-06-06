"use client";
import { ArrowRight } from "lucide-react";
import { useState, useRef, useId, useEffect } from "react";

interface SlideData {
  title: string;
  button: string;
  src: string;
  description?: string;
  onClick?: () => void;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLDivElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, button, title, description, onClick } = slide;
  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <div
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-500 ease-out w-[min(85vw,400px)] h-[min(85vw,400px)] cursor-pointer"
        onClick={() => {
          if (current === index && onClick) {
            onClick();
          } else {
            handleSlideClick(index);
          }
        }}
        onMouseMove={current === index ? handleMouseMove : undefined}
        onMouseLeave={current === index ? handleMouseLeave : undefined}
        style={{
          transform:
            current !== index
              ? "scale(0.85) rotateY(15deg) translateZ(-50px)"
              : "scale(1) rotateY(0deg) translateZ(0px)",
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 transition-all duration-300 ease-out shadow-2xl"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 40), calc(var(--y) / 40), 0)"
                : "none",
          }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
            style={{
              opacity: current === index ? 0.9 : 0.6,
              filter: current === index ? "blur(0px)" : "blur(1px)",
            }}
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {current === index && (
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent transition-all duration-1000" />
          )}
        </div>

        <article
          className={`relative p-8 transition-all duration-700 ease-out flex flex-col items-center justify-end h-full ${
            current === index ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
          }`}
        >
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-light tracking-wide text-white drop-shadow-lg">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-white/80 font-light leading-relaxed max-w-xs">
                {description}
              </p>
            )}
          </div>
            <div className="flex justify-center mt-6">
            <button 
              className="group relative px-8 py-3 bg-white/95 backdrop-blur-sm text-black font-medium text-sm rounded-full border border-white/20 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={onClick}
            >
              {button}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();
  return (
    <div
      className="relative w-full max-w-6xl mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <div className="relative h-[500px] flex items-center justify-center overflow-visible">
        <div className="flex items-center justify-center relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="absolute transition-all duration-700 ease-out"
              style={{
                transform: `translateX(${(index - current) * 320}px) scale(${
                  current === index ? 1 : 0.8
                }) translateZ(${current === index ? 0 : -100}px)`,
                zIndex: current === index ? 10 : 5 - Math.abs(index - current),
                opacity: Math.abs(index - current) > 2 ? 0 : 1,
              }}
            >
              <Slide
                slide={slide}
                index={index}
                current={current}
                handleSlideClick={handleSlideClick}
              />
            </div>
          ))}
        </div>
      </div>      {/* Slide indicators only */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                current === index 
                  ? "bg-white scale-125" 
                  : "bg-white/40 hover:bg-white/60"
              }`}
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
