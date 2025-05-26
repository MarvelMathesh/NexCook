import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Clock, Star, TrendingUp } from "lucide-react";
import { cn } from "../../utils/animations";
import { Button } from "./Button";

interface CarouselItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cookingTime: number;
  rating?: number;
  timesCooked?: number;
  category: string;
}

interface FeaturedCarouselProps {
  items: CarouselItem[];
  onItemClick: (id: string) => void;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  className?: string;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  items,
  onItemClick,
  autoPlay = true,
  autoPlayDelay = 6000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoPlayDelay);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, items.length, autoPlayDelay]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    
    // Resume auto-play after user interaction
    setTimeout(() => setIsAutoPlaying(autoPlay), 3000);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % items.length);
  };

  const prevSlide = () => {
    goToSlide(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  };

  if (!items.length) return null;

  const currentItem = items[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn("relative mx-auto max-w-7xl overflow-hidden rounded-3xl", className)}
    >      {/* Main carousel container */}
      <div className="relative h-[400px] w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background image with parallax effect */}
            <motion.div
              className="absolute inset-0 w-full h-full"
              style={{ x: springX }}
            >
              <img
                src={currentItem.imageUrl}
                alt={currentItem.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>            {/* Content overlay */}
            <div className="relative z-10 flex h-full items-center">
              <div className="max-w-xl p-6 md:p-8">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-4"
                >
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-400/30 px-4 py-2 text-sm text-purple-300 backdrop-blur-md">
                    <TrendingUp size={16} />
                    <span>Featured Recipe</span>
                    {currentItem.timesCooked && (
                      <span className="text-purple-200">• {currentItem.timesCooked}× cooked</span>
                    )}
                  </div>
                </motion.div>                <motion.h2
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-3 text-3xl font-bold text-white md:text-4xl"
                >
                  {currentItem.name}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mb-4 text-md text-white/80 leading-relaxed max-w-md"
                >
                  {currentItem.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mb-6 flex items-center gap-4"
                >                  <div className="flex items-center gap-2 text-white/70">
                    <Clock size={18} />
                    <span className="text-md">{currentItem.cookingTime} min</span>
                  </div>
                  {currentItem.rating && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Star size={18} className="text-yellow-400 fill-current" />
                      <span className="text-md">{currentItem.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
                    {currentItem.category}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Button
                    onClick={() => onItemClick(currentItem.id)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    trailingIcon={<Play size={18} />}
                    size="md"
                  >
                    Start Cooking
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <>            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={prevSlide}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full"
            >
              <ChevronLeft size={24} className="text-white" />
            </motion.button>            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={nextSlide}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full"
            >
              <ChevronRight size={24} className="text-white" />
            </motion.button>
          </>
        )}

        {/* Dots indicator */}
        {items.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2"
          >
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </motion.div>
        )}

        {/* Progress bar for auto-play */}
        {isAutoPlaying && items.length > 1 && (
          <motion.div
            key={currentIndex}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: autoPlayDelay / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 w-full origin-left bg-gradient-to-r from-purple-500 to-pink-500"
          />        )}
      </div>
    </motion.div>
  );
};
