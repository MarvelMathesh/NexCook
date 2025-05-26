import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles as SparklesIcon, ArrowRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { BackgroundBeams } from "../ui/BackgroundBeams";
import { FeaturedCarousel } from "../ui/FeaturedCarousel";
import { Sparkles as SparklesEffect } from "../ui/SparklesEffect";

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { recipes, modules } = useAppStore();
  const [featuredRecipes, setFeaturedRecipes] = useState<any[]>([]);
  const [hasModuleWarnings, setHasModuleWarnings] = useState(false);

  // Get featured recipes for carousel (top 5 most popular)
  useEffect(() => {
    if (recipes.length > 0) {
      const featured = [...recipes]
        .filter(recipe => recipe.timesCooked && recipe.timesCooked > 0)
        .sort((a, b) => (b.timesCooked || 0) - (a.timesCooked || 0))
        .slice(0, 5);
      
      setFeaturedRecipes(featured);
    }
  }, [recipes]);

  // Check if any modules need attention (real-time from Firebase)
  useEffect(() => {
    const moduleWarnings = modules.some(
      (module: any) => module.status === "critical" || module.status === "warning"
    );
    
    setHasModuleWarnings(moduleWarnings);
  }, [modules]);

  return (
    <div className="relative min-h-screen overflow-hidden">      {/* Futuristic animated background with sparkles */}
      <div className="fixed inset-0 z-0">
        <BackgroundBeams />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />
        
        {/* Add sparkles to the background */}
        <SparklesEffect id="home-sparkles" className="absolute inset-0" />
      </div>
      
      {/* Main content */}
      <div className="container relative z-10 mx-auto px-4 py-4">
        
        {/* Compact Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div 
              className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-2 text-sm"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >              <span className="inline-flex items-center gap-2 text-white/90">
                <SparklesIcon size={16} className="text-purple-400" />
                <span>Welcome to the future of cooking</span>
              </span>
            </motion.div>
            
            <motion.h1 
              className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-white">Nex</span>
              <motion.span
                animate={{ 
                  color: ['#a855f7', '#ec4899', '#06b6d4', '#a855f7'],
                  textShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(236, 72, 153, 0.8)',
                    '0 0 20px rgba(6, 182, 212, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 0.8)'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Cook
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mx-auto mb-6 max-w-2xl text-lg text-white/70"
            >
              Your intelligent cooking companion. Perfectly prepared meals, personalized to your taste.
            </motion.p>
            
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                rounded="xl"
                glow={true}
                onClick={() => navigate('/recipes')}
                trailingIcon={<ArrowRight size={18} />}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Explore Recipes
              </Button>
              
              {hasModuleWarnings && (
                <Button
                  variant="outline"
                  size="lg"
                  rounded="xl"
                  onClick={() => navigate('/module-status')}
                  className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 backdrop-blur-xl"
                >
                  Check Module Status
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Featured Recipes Carousel - More compact */}
        {featuredRecipes.length > 0 && (
          <FeaturedCarousel
            items={featuredRecipes}
            onItemClick={(id) => navigate(`/recipe/${id}`)}
            className="mb-6"
          />
        )}
        
        {/* Module status card - More compact */}
        <AnimatePresence>
          {hasModuleWarnings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <GlassCard 
                variant="highlight" 
                className="mx-auto max-w-4xl border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                    <AlertTriangle size={20} className="text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-md font-semibold text-amber-100">System Alert</h3>
                    <p className="text-sm text-amber-200/80">
                      One or more cooking modules need attention. Check module status to ensure uninterrupted cooking.
                    </p>
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => navigate('/module-status')}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/30"
                  >
                    View Details
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
