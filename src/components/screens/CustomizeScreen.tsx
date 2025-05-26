import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Droplets, Flame, Salad as Salt, Utensils, ShoppingBag, Info, RotateCcw, CheckCircle2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";
import { BackgroundBeams } from "../ui/BackgroundBeams";
import { Sparkles } from "../ui/SparklesEffect";
import { GlowingBorder } from "../ui/GlowingBorder";
import { HoverCard } from "../ui/HoverCard";
import { AnimatedSection } from "../ui/AnimatedSection";
import { CardSpotlight } from "../ui/CardSpotlight";
import { GridPattern } from "../ui/GridPattern";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";

export const CustomizeScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { recipes, selectedRecipe, selectRecipe, customization, updateCustomization, startCooking, addToCart } = useAppStore();
  const { goToRecipeDetails, goToCooking } = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const [addToCartAnimation, setAddToCartAnimation] = useState(false);
  const [resetAnimation, setResetAnimation] = useState(false);
  const [activeSlider, setActiveSlider] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset scroll position on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load recipe by ID if not already selected
  useEffect(() => {
    if ((!selectedRecipe || selectedRecipe.id !== id) && id) {
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        selectRecipe(recipe);
      }
    }
  }, [id, recipes, selectedRecipe, selectRecipe]);

  if (!selectedRecipe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>No recipe selected. Please go back and select a recipe.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(selectedRecipe.id, quantity, { ...customization });
    setAddToCartAnimation(true);
    setShowSuccess(true);
    setTimeout(() => {
      setAddToCartAnimation(false);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  };

  const handleStartCooking = () => {
    startCooking();
    goToCooking();
  };

  const handleReset = () => {
    setResetAnimation(true);
    setTimeout(() => {
      updateCustomization('salt', 50);
      updateCustomization('spice', 50);
      updateCustomization('water', 50);
      setResetAnimation(false);
    }, 300);
  };

  // Calculate a "mood" based on customization settings
  const getMood = () => {
    const saltLevel = customization.salt > 70 ? "salty" : customization.salt < 30 ? "bland" : "balanced";
    const spiceLevel = customization.spice > 70 ? "spicy" : customization.spice < 30 ? "mild" : "medium";
    const waterLevel = customization.water > 70 ? "soupy" : customization.water < 30 ? "thick" : "standard";
    
    return `${saltLevel}-${spiceLevel}-${waterLevel}`;
  };

  // Get gradient colors based on customization mood
  const getMoodGradient = () => {
    const mood = getMood();
    
    if (mood.includes("salty") && mood.includes("spicy")) return "from-amber-500 to-red-600";
    if (mood.includes("bland") && mood.includes("mild")) return "from-blue-400 to-purple-500";
    if (mood.includes("spicy")) return "from-orange-500 to-red-500";
    if (mood.includes("salty")) return "from-yellow-400 to-amber-500";
    if (mood.includes("soupy")) return "from-blue-400 to-cyan-500";
    if (mood.includes("thick")) return "from-amber-700 to-orange-600";
    
    return "from-purple-600 to-blue-500";
  };

  const getSliderBackgroundColor = (type: string) => {
    if (activeSlider === type) {
      return "bg-white/20 backdrop-blur-xl border-white/30";
    }
    return "bg-black/20 backdrop-blur-md border-white/10";
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Enhanced background with Apple Music style */}
      <div className="fixed inset-0 z-0">
        <BackgroundBeams />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black"
        />
        
        {/* Add sparkles to the background */}
        <Sparkles id="customize-sparkles" className="absolute inset-0" />
      </div>
      
      {/* Background pattern with enhanced glassmorphism */}
      <div className="fixed inset-0 z-0 opacity-20">
        <GridPattern width={40} height={40} squared={false} />
      </div>
      
      {/* Gradient overlay based on current flavor profile */}
      <div className={`pointer-events-none fixed inset-0 z-0 bg-gradient-to-b ${getMoodGradient()} opacity-15`} />
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-0 right-0 top-20 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-green-500/80 py-3 px-6 text-white backdrop-blur-xl border border-green-400/30"
          >
            <CheckCircle2 size={16} />
            <span>Added to cooking queue</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative z-10 px-4 py-6">
        {/* Enhanced header with Apple Music styling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center"
        >
          <HoverCard scale={1.1}>
            <motion.button 
              onClick={() => goToRecipeDetails(selectedRecipe.id)}
              className="mr-4 rounded-full bg-white/10 p-3 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </HoverCard>
          
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Customize Recipe
              </span>
            </motion.h1>
            <TextGenerateEffect 
              words={`Adjust parameters for ${selectedRecipe.name}`}
              className="text-sm text-white/70"
            />
          </div>
          
          <HoverCard scale={1.1}>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full bg-white/10 p-3 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all duration-300"
              onClick={handleReset}
            >
              <RotateCcw size={18} />
            </motion.button>
          </HoverCard>
        </motion.div>

        <div className="relative z-20 mx-auto max-w-3xl">
          {/* Recipe image with 3D tilt effect */}
          <AnimatedSection direction="down" delay={0.1} className="mb-8">
            <CardSpotlight className="overflow-hidden rounded-2xl border border-white/10">
              <div 
                className="relative h-48 w-full overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedRecipe.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-4">
                  <div className="flex flex-wrap gap-2">
                    <GlowingBorder size="sm" glowColor={getMoodGradient()}>
                      <div className="flex items-center gap-1 px-3 py-1 text-xs bg-black/50 backdrop-blur-sm rounded-lg">
                        <Salt size={12} />
                        <span>{customization.salt}% Salt</span>
                      </div>
                    </GlowingBorder>
                    
                    <GlowingBorder size="sm" glowColor={getMoodGradient()}>
                      <div className="flex items-center gap-1 px-3 py-1 text-xs bg-black/50 backdrop-blur-sm rounded-lg">
                        <Flame size={12} />
                        <span>{customization.spice}% Spice</span>
                      </div>
                    </GlowingBorder>
                    
                    <GlowingBorder size="sm" glowColor={getMoodGradient()}>
                      <div className="flex items-center gap-1 px-3 py-1 text-xs bg-black/50 backdrop-blur-sm rounded-lg">
                        <Droplets size={12} />
                        <span>{customization.water}% Water</span>
                      </div>
                    </GlowingBorder>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </AnimatedSection>
          
          {/* Salt Level Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`mb-8 overflow-hidden rounded-2xl border transition-all duration-300 ${getSliderBackgroundColor('salt')}`}
            onMouseEnter={() => setActiveSlider('salt')}
            onMouseLeave={() => setActiveSlider(null)}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <motion.div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Salt size={20} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Salt Level</h3>
                  <p className="text-sm text-white/60">Controls overall flavor intensity</p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: activeSlider === 'salt' ? 1 : 0, 
                    scale: activeSlider === 'salt' ? 1 : 0 
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm"
                >
                  <Info size={12} />
                  <span>Tip: Higher salt enhances all flavors</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="mb-3 flex justify-between text-sm font-medium"
                animate={{ scale: resetAnimation ? 0.95 : 1 }}
              >
                <span className="text-blue-400">Low</span>
                <span className="text-purple-400">Recommended</span>
                <span className="text-amber-400">High</span>
              </motion.div>
              
              <div className="relative mb-4">
                <div className="absolute h-3 w-full rounded-full bg-white/10" />
                <motion.div 
                  animate={{ 
                    width: `${customization.salt}%`,
                    background: activeSlider === 'salt' 
                      ? "linear-gradient(to right, #fbbf24, #f59e0b, #d97706)" 
                      : "linear-gradient(to right, #8b5cf6, #7c3aed)"
                  }}
                  className="absolute h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customization.salt}
                  onChange={(e) => updateCustomization('salt', parseInt(e.target.value))}
                  className="relative z-10 h-3 w-full appearance-none rounded-full bg-transparent accent-amber-500 cursor-pointer"
                  onFocus={() => setActiveSlider('salt')}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Less sodium</span>
                <motion.span 
                  className="font-bold text-white px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                  key={customization.salt}
                >
                  {customization.salt}%
                </motion.span>
                <span>More flavor</span>
              </div>
            </div>
          </motion.div>

          {/* Spice Level Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mb-8 overflow-hidden rounded-2xl border transition-all duration-300 ${getSliderBackgroundColor('spice')}`}
            onMouseEnter={() => setActiveSlider('spice')}
            onMouseLeave={() => setActiveSlider(null)}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <motion.div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <Flame size={20} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Spice Level</h3>
                  <p className="text-sm text-white/60">Controls heat and spiciness</p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: activeSlider === 'spice' ? 1 : 0, 
                    scale: activeSlider === 'spice' ? 1 : 0 
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm"
                >
                  <Info size={12} />
                  <span>Tip: Start low and build up gradually</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="mb-3 flex justify-between text-sm font-medium"
                animate={{ scale: resetAnimation ? 0.95 : 1 }}
              >
                <span className="text-green-400">Mild</span>
                <span className="text-yellow-400">Medium</span>
                <span className="text-red-400">Hot</span>
              </motion.div>
              
              <div className="relative mb-4">
                <div className="absolute h-3 w-full rounded-full bg-white/10" />
                <motion.div 
                  animate={{ 
                    width: `${customization.spice}%`,
                    background: activeSlider === 'spice' 
                      ? "linear-gradient(to right, #ef4444, #dc2626, #b91c1c)" 
                      : "linear-gradient(to right, #8b5cf6, #7c3aed)"
                  }}
                  className="absolute h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customization.spice}
                  onChange={(e) => updateCustomization('spice', parseInt(e.target.value))}
                  className="relative z-10 h-3 w-full appearance-none rounded-full bg-transparent accent-red-500 cursor-pointer"
                  onFocus={() => setActiveSlider('spice')}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Kid friendly</span>
                <motion.span 
                  className="font-bold text-white px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                  key={customization.spice}
                >
                  {customization.spice}%
                </motion.span>
                <span>Extra spicy</span>
              </div>
            </div>
          </motion.div>

          {/* Water Content Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mb-8 overflow-hidden rounded-2xl border transition-all duration-300 ${getSliderBackgroundColor('water')}`}
            onMouseEnter={() => setActiveSlider('water')}
            onMouseLeave={() => setActiveSlider(null)}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <motion.div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Droplets size={20} className="text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Water Content</h3>
                  <p className="text-sm text-white/60">Affects consistency and texture</p>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: activeSlider === 'water' ? 1 : 0, 
                    scale: activeSlider === 'water' ? 1 : 0 
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm"
                >
                  <Info size={12} />
                  <span>Tip: Consistency affects mouthfeel</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="mb-3 flex justify-between text-sm font-medium"
                animate={{ scale: resetAnimation ? 0.95 : 1 }}
              >
                <span className="text-orange-400">Thick</span>
                <span className="text-blue-400">Standard</span>
                <span className="text-cyan-400">Thin</span>
              </motion.div>
              
              <div className="relative mb-4">
                <div className="absolute h-3 w-full rounded-full bg-white/10" />
                <motion.div 
                  animate={{ 
                    width: `${customization.water}%`,
                    background: activeSlider === 'water' 
                      ? "linear-gradient(to right, #0ea5e9, #0284c7, #0369a1)" 
                      : "linear-gradient(to right, #8b5cf6, #7c3aed)"
                  }}
                  className="absolute h-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customization.water}
                  onChange={(e) => updateCustomization('water', parseInt(e.target.value))}
                  className="relative z-10 h-3 w-full appearance-none rounded-full bg-transparent accent-cyan-500 cursor-pointer"
                  onFocus={() => setActiveSlider('water')}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>Concentrated</span>
                <motion.span 
                  className="font-bold text-white px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.3 }}
                  key={customization.water}
                >
                  {customization.water}%
                </motion.span>
                <span>Diluted</span>
              </div>
            </div>
          </motion.div>

          {/* Recipe Preview Section */}
          <AnimatedSection direction="up" delay={0.4} className="mb-8">
            <CardSpotlight className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <motion.div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Utensils size={20} className="text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold">Recipe Preview</h3>
                    <p className="text-sm text-white/60">Your customized cooking profile</p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
                  <motion.h4 
                    className="mb-3 text-lg font-medium"
                    animate={{ 
                      color: [
                        'rgb(255, 255, 255)',
                        `rgb(${255 - customization.salt * 0.5}, ${255 - customization.spice * 0.5}, ${255 - customization.water * 0.5})`,
                        'rgb(255, 255, 255)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {selectedRecipe.name} - Custom Profile
                  </motion.h4>
                  
                  <div className="text-sm text-gray-300">
                    <p className="mb-3 font-medium text-white/80">Your recipe will feature:</p>
                    <ul className="space-y-2">
                      {customization.salt > 75 && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-amber-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Higher salt content for enhanced flavor depth
                        </motion.li>
                      )}
                      {customization.salt < 25 && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-blue-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          Reduced sodium for a lighter, healthier taste
                        </motion.li>
                      )}
                      {customization.spice > 75 && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-red-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          Significant heat perfect for spice enthusiasts
                        </motion.li>
                      )}
                      {customization.spice < 25 && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-green-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                          Minimal spice suitable for sensitive palates
                        </motion.li>
                      )}
                      {customization.water > 75 && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-blue-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          More liquid for a lighter, soup-like consistency
                        </motion.li>
                      )}
                      {customization.water < 25 && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-amber-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          Reduced water for a thicker, richer texture
                        </motion.li>
                      )}
                      {(customization.salt >= 25 && customization.salt <= 75) && 
                       (customization.spice >= 25 && customization.spice <= 75) && 
                       (customization.water >= 25 && customization.water <= 75) && (
                        <motion.li 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-purple-400"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                          Perfectly balanced profile with traditional cooking parameters
                        </motion.li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardSpotlight>
          </AnimatedSection>
        </div>

        {/* Enhanced Bottom Action Bar */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10"
        >
          <div className="mx-auto flex w-full max-w-lg items-center justify-between p-4 gap-4">
            {/* Quantity Controls */}
            <GlowingBorder size="sm" glowColor="from-purple-500/40 to-purple-400/40" animate={false}>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl backdrop-blur-sm">
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <span className="text-lg font-bold">-</span>
                </motion.button>
                <span className="w-8 text-center font-medium text-lg">{quantity}</span>
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <span className="text-lg font-bold">+</span>
                </motion.button>
              </div>
            </GlowingBorder>
            
            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 px-4 text-white font-medium backdrop-blur-sm border border-purple-400/30 shadow-lg"
              onClick={handleAddToCart}
              animate={addToCartAnimation ? { scale: [1, 1.1, 1] } : {}}
            >
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </motion.button>
            
            {/* Start Cooking Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 py-3 px-4 font-medium text-white backdrop-blur-sm border border-pink-400/30 shadow-lg"
              onClick={handleStartCooking}
            >
              Cook Now
            </motion.button>
          </div>
        </motion.div>    </div>
    </div>
  );
};
