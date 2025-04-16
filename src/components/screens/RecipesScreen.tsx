import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Clock, Star, Filter } from "lucide-react";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";
import { Card3D } from "../ui/Card3D";
import { CardSpotlight } from "../ui/CardSpotlight";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { containerVariants, itemVariants, springTransition } from "../../utils/animations";
import { HoverCard } from "../ui/HoverCard";
import { GridPattern } from "../ui/GridPattern";
import { GlowingBorder } from "../ui/GlowingBorder";
import { AnimatedSection } from "../ui/AnimatedSection";
import { MovingStars } from "../ui/MovingStars";

export const RecipesScreen = () => {
  const { recipes } = useAppStore();
  const { goToHome, handleRecipeSelect } = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Refs for scroll animations
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Transform scroll progress into header opacity and position
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.2]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -20]);

  const categories = [...new Set(recipes.map(recipe => recipe.category))];

  // Filter recipes by category
  const filteredRecipes = recipes.filter(recipe => !selectedCategory || recipe.category === selectedCategory);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-black pb-24 text-white">
      {/* Animated starry background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <MovingStars 
          quantity={300}
          starColor="#9f7aea"
          maxStarSize={2.2}
          backgroundOpacity={0.2}
        />
      </div>

      {/* Animated background grid pattern - reduced opacity */}
      <div className="fixed inset-0 z-[1] overflow-hidden opacity-20">
        <GridPattern width={40} height={40} />
      </div>

      {/* Gradient overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-black via-transparent to-black"></div>
      
      <div className="relative z-20 px-6">
        {/* Header with scroll animation */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="sticky top-0 z-30 bg-black/60 pt-6 backdrop-blur-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center"
          >
            <HoverCard scale={1.1}>
              <button 
                onClick={goToHome}
                className="mr-4 rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </button>
            </HoverCard>
            <div>
              <h1 className="text-3xl font-bold">Recipe Selection</h1>
              <TextGenerateEffect 
                words="Choose from our curated collection of smart recipes"
                className="text-sm text-gray-300"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <AnimatedSection 
            direction="up" 
            delay={0.4}
            className="mb-8 flex flex-wrap gap-2 pb-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Recipes
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={springTransition}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </motion.button>
            ))}
          </AnimatedSection>
        </motion.div>

        {/* Recipe Cards */}
        {filteredRecipes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredRecipes.map((recipe, index) => (
              <motion.div 
                key={recipe.id} 
                variants={itemVariants}
                transition={{ 
                  delay: index * 0.08,
                  type: "spring",
                  stiffness: 120,
                  damping: 15
                }}
              >
                <HoverCard direction="up" scale={1.03}>
                  <Card3D className="h-full">
                    <CardSpotlight
                      className="h-full cursor-pointer border-0 p-0 transition-all hover:shadow-xl"
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs backdrop-blur-sm">
                              <Clock size={12} />
                              <span>{recipe.cookingTime} min</span>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs backdrop-blur-sm">
                              <Star size={12} className="text-yellow-400" />
                              <span>{recipe.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-purple-500/70 px-2 py-1 text-xs backdrop-blur-sm">
                              <span>×{recipe.timesCooked}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="mb-1 text-xl font-semibold">{recipe.name}</h3>
                        <p className="mb-3 text-xs text-purple-300">{recipe.category}</p>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="mt-4 text-right">
                          <span className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-xs font-medium text-white">
                            Select Recipe
                          </span>
                        </div>
                      </div>
                    </CardSpotlight>
                  </Card3D>
                </HoverCard>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <AnimatedSection direction="up" className="flex h-60 flex-col items-center justify-center rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
            <Filter size={40} className="mb-3 text-gray-400" />
            <h3 className="mb-2 text-xl font-medium">No recipes found</h3>
            <p className="text-gray-400">Try adjusting your filters or search term</p>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};