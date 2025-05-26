import { useState, useRef, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Star, Filter, Search, Grid3X3, List, TrendingUp, ChefHat } from "lucide-react";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";
import { CardSpotlight } from "../ui/CardSpotlight";
import { containerVariants, itemVariants, springTransition } from "../../utils/animations";
import { GridPattern } from "../ui/GridPattern";
import { AnimatedSection } from "../ui/AnimatedSection";
import { BackgroundBeams } from "../ui/BackgroundBeams";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { GlowText } from "../ui/GlowText";

export const RecipesScreen = () => {
  const { recipes } = useAppStore();
  const { goToHome, handleRecipeSelect } = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "cookingTime" | "popularity">("popularity");
  
  // Refs for scroll animations
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Transform scroll progress into header opacity and position
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -10]);

  // Get categories with recipe counts (real-time from Firebase)
  const categories = useMemo(() => {
    const categoryMap = new Map();
    recipes.forEach(recipe => {
      const count = categoryMap.get(recipe.category) || 0;
      categoryMap.set(recipe.category, count + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }, [recipes]);

  // Filter and sort recipes (real-time from Firebase data)
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });

    // Sort recipes based on selected criteria
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "cookingTime":
        filtered.sort((a, b) => a.cookingTime - b.cookingTime);
        break;
      case "popularity":
        filtered.sort((a, b) => (b.timesCooked || 0) - (a.timesCooked || 0));
        break;
    }

    return filtered;
  }, [recipes, selectedCategory, searchQuery, sortBy]);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden pb-24">
      {/* Futuristic animated background */}
      <div className="fixed inset-0 z-0">
        <BackgroundBeams />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />
      </div>

      {/* Animated background grid pattern */}
      <div className="fixed inset-0 z-[1] overflow-hidden opacity-20">
        <GridPattern width={40} height={40} />
      </div>
      
      {/* Gradient overlay */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
      
      <div className="relative z-20">
        {/* Enhanced header with glassmorphism - full width */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="sticky top-0 z-30 w-full bg-black/20 pt-6 backdrop-blur-xl border-b border-white/10"
        >
          <div className="px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.button 
                    onClick={goToHome}
                    className="rounded-full bg-white/10 p-3 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </motion.button>
                  <div>
                    <GlowText
                      text="Recipe Collection"
                      as="h1"
                      size="4xl"
                      gradient={true}
                      className="font-bold mb-2"
                    />
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="text-white/70"
                    >
                      Discover perfectly crafted recipes
                    </motion.p>
                  </div>
                </div>
                
                {/* View mode toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "primary" : "glass"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-xl"
                  >
                    <Grid3X3 size={16} />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "primary" : "glass"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-xl"
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>

              {/* Enhanced search and filter controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search bar with glassmorphism */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search recipes, ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                >
                  <option value="popularity" className="bg-black">Most Popular</option>
                  <option value="rating" className="bg-black">Highest Rated</option>
                  <option value="cookingTime" className="bg-black">Quickest</option>
                  <option value="name" className="bg-black">A-Z</option>
                </select>

                {/* Filter button */}
                <Button
                  variant="glass"
                  size="md"
                  className="rounded-xl backdrop-blur-xl"
                  leadingIcon={<Filter size={16} />}
                >
                  Filter
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content area with padding */}
        <div className="px-6">
          {/* Category pills with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <ChefHat size={20} className="text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Categories</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                  !selectedCategory
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Recipes ({recipes.length})
              </motion.button>
              
              {categories.map((category: any) => (
                <motion.button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                    selectedCategory === category.name
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50 text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name} ({category.count})
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recipe grid with enhanced glassmorphic cards */}
          <AnimatedSection>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1 max-w-4xl mx-auto"
              }`}
            >
              <AnimatePresence>
                {filteredAndSortedRecipes.map((recipe: any, index: number) => (
                  <motion.div
                    key={recipe.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ ...springTransition, delay: index * 0.1 }}
                    layout
                  >
                    {viewMode === "grid" ? (
                      <CardSpotlight className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/15 hover:to-white/10 transition-all duration-300">
                        <div 
                          onClick={() => handleRecipeSelect(recipe)}
                          className="relative"
                        >
                          <div className="relative h-52 w-full overflow-hidden">
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            
                            <div className="absolute top-3 right-3 flex gap-2">
                              {recipe.timesCooked > 50 && (
                                <div className="flex h-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 backdrop-blur-md">
                                  <TrendingUp size={14} className="text-orange-400 mr-1" />
                                  <span className="text-xs text-orange-300">Hot</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="absolute bottom-3 left-3 flex items-center gap-3">
                              <div className="flex items-center gap-1 text-white/90">
                                <Clock size={14} />
                                <span className="text-sm">{recipe.cookingTime} min</span>
                              </div>
                              <div className="flex items-center gap-1 text-white/90">
                                <Star size={14} className="text-yellow-400 fill-current" />
                                <span className="text-sm">{recipe.rating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {recipe.name}
                            </h3>
                            <p className="mb-3 text-sm text-white/60 line-clamp-2">
                              {recipe.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                                {recipe.category}
                              </span>
                              {recipe.timesCooked > 0 && (
                                <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 text-xs text-purple-300">
                                  {recipe.timesCooked}× cooked
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardSpotlight>
                    ) : (
                      // List view with horizontal glassmorphic cards
                      <GlassCard
                        hover={true}
                        onClick={() => handleRecipeSelect(recipe)}
                        className="cursor-pointer bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl hover:from-white/15 hover:to-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center p-4">
                          <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl">
                            <img
                              src={recipe.imageUrl}
                              alt={recipe.name}
                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                          
                          <div className="flex flex-grow flex-col justify-center p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-xl font-semibold text-white">{recipe.name}</h4>
                              <div className="flex items-center gap-2">
                                {recipe.timesCooked > 50 && (
                                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-2 py-1 text-xs text-orange-300">
                                    <TrendingUp size={12} />
                                    <span>Trending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="mb-3 text-white/60 line-clamp-2">{recipe.description}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-white/70">
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{recipe.cookingTime} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star size={14} className="text-yellow-400 fill-current" />
                                  <span>{recipe.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                                <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                                  {recipe.category}
                                </span>
                              </div>
                              
                              {recipe.timesCooked > 0 && (
                                <div className="text-sm text-white/50">
                                  {recipe.timesCooked}× cooked
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty state */}
            {filteredAndSortedRecipes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <GlassCard className="mx-auto max-w-md bg-white/5 backdrop-blur-xl">
                  <div className="p-8">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-full bg-white/10 p-4">
                        <Search size={32} className="text-white/60" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-white">No recipes found</h3>
                    <p className="text-white/60 mb-4">
                      Try adjusting your search or filter criteria to find more recipes.
                    </p>
                    <Button
                      variant="glass"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(null);
                      }}
                      className="backdrop-blur-xl"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};
