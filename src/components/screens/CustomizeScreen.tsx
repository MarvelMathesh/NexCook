import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Droplets, Flame, Salad as Salt, Utensils, ShoppingBag, Info, RotateCcw, CheckCircle2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";
import { GridPattern } from "../ui/GridPattern";
import { GlowingBorder } from "../ui/GlowingBorder";
import { HoverCard } from "../ui/HoverCard";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { AnimatedSection } from "../ui/AnimatedSection";
import { CardSpotlight } from "../ui/CardSpotlight";

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
      return "bg-white/30 backdrop-blur-md";
    }
    return "bg-black/30 backdrop-blur-sm";
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black to-purple-950 px-4 py-6 text-white">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 opacity-30">
        <GridPattern width={40} height={40} />
      </div>
      
      {/* Gradient overlay based on current flavor profile */}
      <div className={`pointer-events-none fixed inset-0 z-0 bg-gradient-to-b ${getMoodGradient()} opacity-10`} />
      
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-0 right-0 top-20 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-green-500/80 py-2 text-white backdrop-blur-sm"
          >
            <CheckCircle2 size={16} />
            <span>Added to cooking queue</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 flex items-center"
      >
        <HoverCard scale={1.1}>
          <button 
            onClick={() => goToRecipeDetails(selectedRecipe.id)}
            className="mr-4 rounded-full bg-white/10 p-2 hover:bg-white/20"
          >
            <ArrowLeft size={20} />
          </button>
        </HoverCard>
        <div>
          <h1 className="text-3xl font-bold">Customize Recipe</h1>
          <TextGenerateEffect 
            words={`Adjust parameters for ${selectedRecipe.name}`}
            className="text-sm text-gray-300"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          className="ml-auto rounded-full bg-white/10 p-2 transition-all hover:bg-white/20"
          onClick={handleReset}
        >
          <RotateCcw size={18} />
        </motion.button>
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
                    <div className="flex items-center gap-1 px-3 py-1 text-xs">
                      <Salt size={12} />
                      <span>{customization.salt}% Salt</span>
                    </div>
                  </GlowingBorder>
                  
                  <GlowingBorder size="sm" glowColor={getMoodGradient()}>
                    <div className="flex items-center gap-1 px-3 py-1 text-xs">
                      <Flame size={12} />
                      <span>{customization.spice}% Spice</span>
                    </div>
                  </GlowingBorder>
                  
                  <GlowingBorder size="sm" glowColor={getMoodGradient()}>
                    <div className="flex items-center gap-1 px-3 py-1 text-xs">
                      <Droplets size={12} />
                      <span>{customization.water}% Water</span>
                    </div>
                  </GlowingBorder>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </AnimatedSection>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 overflow-hidden rounded-2xl border border-white/10 transition-all ${getSliderBackgroundColor('salt')}`}
          onMouseEnter={() => setActiveSlider('salt')}
          onMouseLeave={() => setActiveSlider(null)}
        >
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500">
                <Salt size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-medium">Salt Level</h3>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: activeSlider === 'salt' ? 1 : 0, 
                  scale: activeSlider === 'salt' ? 1 : 0 
                }}
                className="ml-auto flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs"
              >
                <Info size={12} />
                <span>Affects overall flavor intensity</span>
              </motion.div>
            </div>
            
            <motion.div 
              className="mb-2 flex justify-between text-sm"
              animate={{ scale: resetAnimation ? 0.95 : 1 }}
            >
              <span>Low</span>
              <span>Recommended</span>
              <span>High</span>
            </motion.div>
            
            <div className="relative">
              <motion.div 
                animate={{ 
                  width: `${customization.salt}%`,
                  background: activeSlider === 'salt' 
                    ? "linear-gradient(to right, #f59e0b, #d97706)" 
                    : "linear-gradient(to right, #9333ea, #7e22ce)"
                }}
                className="absolute h-2 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={customization.salt}
                onChange={(e) => updateCustomization('salt', parseInt(e.target.value))}
                className="relative z-10 h-2 w-full appearance-none rounded-lg bg-transparent accent-amber-500"
                onFocus={() => setActiveSlider('salt')}
              />
            </div>
            
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Less sodium</span>
              <span className="font-medium text-white">{customization.salt}%</span>
              <span>More flavor</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-8 overflow-hidden rounded-2xl border border-white/10 transition-all ${getSliderBackgroundColor('spice')}`}
          onMouseEnter={() => setActiveSlider('spice')}
          onMouseLeave={() => setActiveSlider(null)}
        >
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
                <Flame size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-medium">Spice Level</h3>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: activeSlider === 'spice' ? 1 : 0, 
                  scale: activeSlider === 'spice' ? 1 : 0 
                }}
                className="ml-auto flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs"
              >
                <Info size={12} />
                <span>Controls heat and spiciness</span>
              </motion.div>
            </div>
            
            <motion.div 
              className="mb-2 flex justify-between text-sm"
              animate={{ scale: resetAnimation ? 0.95 : 1 }}
            >
              <span>Mild</span>
              <span>Medium</span>
              <span>Hot</span>
            </motion.div>
            
            <div className="relative">
              <motion.div 
                animate={{ 
                  width: `${customization.spice}%`,
                  background: activeSlider === 'spice' 
                    ? "linear-gradient(to right, #ef4444, #dc2626)" 
                    : "linear-gradient(to right, #9333ea, #7e22ce)"
                }}
                className="absolute h-2 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={customization.spice}
                onChange={(e) => updateCustomization('spice', parseInt(e.target.value))}
                className="relative z-10 h-2 w-full appearance-none rounded-lg bg-transparent accent-red-500"
                onFocus={() => setActiveSlider('spice')}
              />
            </div>
            
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Kid friendly</span>
              <span className="font-medium text-white">{customization.spice}%</span>
              <span>Extra spicy</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-8 overflow-hidden rounded-2xl border border-white/10 transition-all ${getSliderBackgroundColor('water')}`}
          onMouseEnter={() => setActiveSlider('water')}
          onMouseLeave={() => setActiveSlider(null)}
        >
          <div className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500">
                <Droplets size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-medium">Water Content</h3>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: activeSlider === 'water' ? 1 : 0, 
                  scale: activeSlider === 'water' ? 1 : 0 
                }}
                className="ml-auto flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs"
              >
                <Info size={12} />
                <span>Affects consistency and texture</span>
              </motion.div>
            </div>
            
            <motion.div 
              className="mb-2 flex justify-between text-sm"
              animate={{ scale: resetAnimation ? 0.95 : 1 }}
            >
              <span>Thick</span>
              <span>Standard</span>
              <span>Thin</span>
            </motion.div>
            
            <div className="relative">
              <motion.div 
                animate={{ 
                  width: `${customization.water}%`,
                  background: activeSlider === 'water' 
                    ? "linear-gradient(to right, #0ea5e9, #0284c7)" 
                    : "linear-gradient(to right, #9333ea, #7e22ce)"
                }}
                className="absolute h-2 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={customization.water}
                onChange={(e) => updateCustomization('water', parseInt(e.target.value))}
                className="relative z-10 h-2 w-full appearance-none rounded-lg bg-transparent accent-cyan-500"
                onFocus={() => setActiveSlider('water')}
              />
            </div>
            
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Concentrated</span>
              <span className="font-medium text-white">{customization.water}%</span>
              <span>Diluted</span>
            </div>
          </div>
        </motion.div>

        <AnimatedSection direction="up" delay={0.4} className="mb-8">
          <CardSpotlight className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
                  <Utensils size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-medium">Recipe Preview</h3>
              </div>

              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-black/20 p-4 backdrop-blur-sm">
                  <motion.h4 
                    className="mb-2 font-medium"
                    animate={{ 
                      color: [
                        'rgb(255, 255, 255)',
                        `rgb(${255 - customization.salt * 0.5}, ${255 - customization.spice * 0.5}, ${255 - customization.water * 0.5})`,
                        'rgb(255, 255, 255)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >{selectedRecipe.name}</motion.h4>
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">Your customized recipe will have:</p>
                    <ul className="space-y-1 pl-4">
                      {customization.salt > 75 && <li className="list-disc text-amber-400">Higher salt content for enhanced flavor</li>}
                      {customization.salt < 25 && <li className="list-disc text-blue-400">Reduced sodium for a lighter taste</li>}
                      {customization.spice > 75 && <li className="list-disc text-red-400">Significant heat for spice lovers</li>}
                      {customization.spice < 25 && <li className="list-disc text-green-400">Minimal spice suitable for all palates</li>}
                      {customization.water > 75 && <li className="list-disc text-blue-400">More liquid for a thinner consistency</li>}
                      {customization.water < 25 && <li className="list-disc text-amber-400">Reduced water for a thicker texture</li>}
                      {(customization.salt >= 25 && customization.salt <= 75) && 
                       (customization.spice >= 25 && customization.spice <= 75) && 
                       (customization.water >= 25 && customization.water <= 75) && 
                       <li className="list-disc text-purple-400">Balanced profile with standard cooking parameters</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardSpotlight>
        </AnimatedSection>
      </div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 80 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-black/80 p-4 backdrop-blur-lg"
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="flex items-center justify-between">
            <GlowingBorder size="sm" glowColor="from-purple-500/40 to-purple-400/40" animate={false}>
              <div className="flex w-24 items-center justify-center gap-2 px-1 py-2">
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <span className="text-lg font-bold">-</span>
                </motion.button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <span className="text-lg font-bold">+</span>
                </motion.button>
              </div>
            </GlowingBorder>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex h-12 w-1/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 text-white backdrop-blur-sm"
              onClick={handleAddToCart}
              animate={addToCartAnimation ? { scale: [1, 1.1, 1] } : {}}
            >
              <ShoppingBag size={18} />
              <span className="font-medium">Add to Cart</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="h-12 w-1/3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-3 font-medium text-white"
              onClick={handleStartCooking}
            >
              Cook Now
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};