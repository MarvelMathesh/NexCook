import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2, FastForward, ChefHat, Clock, AlertCircle } from "lucide-react";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";
import { GridPattern } from "../ui/GridPattern";
import { HoverCard } from "../ui/HoverCard";
import { AnimatedSection } from "../ui/AnimatedSection";
import { CardSpotlight } from "../ui/CardSpotlight";
import { BackgroundBeams } from "../ui/BackgroundBeams";
import { GlassCard } from "../ui/GlassCard";
import { Sparkles as SparklesEffect } from "../ui/SparklesEffect";
import { springTransition } from "../../utils/animations";

export const CartScreen = () => {
  const { cart, recipes, removeFromCart, updateCartItem, clearCart, startCookingQueue } = useAppStore();
  const { goToRecipes, goToCooking } = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [animatingItemIndex, setAnimatingItemIndex] = useState<number | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  // Refs for scroll-based animations
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Transform values for parallax scrolling effects
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -10]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const handleStartCooking = () => {
    setIsProcessing(true);
    
    // Create a ripple effect animation through the queue items
    cart.forEach((_, index) => {
      setTimeout(() => {
        setAnimatingItemIndex(index);
      }, index * 200);
    });
    
    // Simulating a short delay as if we're processing the request
    setTimeout(() => {
      startCookingQueue();
      goToCooking();
      setIsProcessing(false);
      setAnimatingItemIndex(null);
    }, cart.length * 200 + 500);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate cooking time for all items in cart
  const totalCookingTime = cart.reduce((time, item) => {
    const recipe = recipes.find(r => r.id === item.recipeId);
    return time + (recipe ? recipe.cookingTime * item.quantity : 0);
  }, 0);
  
  // Format cooking time into hours and minutes
  const formatCookingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Enhanced background with Apple Music style */}      <div className="fixed inset-0 z-0">
        <BackgroundBeams />
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black"
        />
        
        {/* Add sparkles to the background */}
        <SparklesEffect id="cart-sparkles" className="absolute inset-0" />
      </div>
      
      {/* Background pattern with parallax effect */}
      <motion.div 
        style={{ y: backgroundY }}
        className="fixed inset-0 z-0 opacity-20"
      >
        <GridPattern width={40} height={40} squared={false} />
      </motion.div>
      
      {/* Confirm clear modal */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mx-4 max-w-md rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="mb-2 text-xl font-semibold">Clear Cooking Queue?</h3>
              <p className="mb-6 text-gray-300">
                This will remove all items from your cooking queue. This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  className="flex-1 rounded-xl border border-white/10 py-3 font-medium text-white hover:bg-white/10"
                  onClick={() => setShowConfirmClear(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 rounded-xl bg-red-500 py-3 font-medium text-white hover:bg-red-600"
                  onClick={() => {
                    clearCart();
                    setShowConfirmClear(false);
                  }}
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ opacity: headerOpacity, y: headerY }}
        className="sticky top-0 z-20 bg-black/20 pt-6 px-4 backdrop-blur-xl border-b border-white/10 mb-8"
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center">
            <HoverCard scale={1.1}>              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={springTransition}
                onClick={goToRecipes}
                className="mr-4 rounded-full bg-white/10 p-3 hover:bg-white/20 backdrop-blur-xl border border-white/20 transition-all duration-300"
              >
                <ArrowLeft size={20} />
              </motion.button>
            </HoverCard>              <div>
              <h1 
                className="text-4xl text-white text-glow font-bold mb-2"
              >
                Cooking Queue
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-sm text-white/70"
              >
                {cart.length === 0 
                  ? "Your queue is empty" 
                  : `${totalItems} item${totalItems !== 1 ? 's' : ''} ready to cook`}
              </motion.p>
            </div>
          </div>

          {cart.length > 0 && (
            <HoverCard direction="left">              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-3 py-2 text-sm text-white/70 hover:text-red-400 backdrop-blur-xl"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </motion.button>
            </HoverCard>
          )}
        </div>
      </motion.div>

      <div className="relative z-10 px-4 pb-24" ref={containerRef}>
        {cart.length === 0 ? (
          <AnimatedSection 
            direction="up" 
            className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-10 text-center backdrop-blur-sm"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="relative z-10"
              >
                <ShoppingCart size={80} className="text-gray-500" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute -inset-4 rounded-full bg-purple-500/20 blur-lg"
              />
            </div>
            <h2 className="mb-2 text-2xl font-medium">Your cooking queue is empty</h2>
            <p className="mb-6 text-gray-400">Add some recipes to your queue to start cooking</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToRecipes}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-medium text-white transition-all"
            >
              Browse Recipes
            </motion.button>
          </AnimatedSection>
        ) : (
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                  <ChefHat size={16} className="text-purple-400" />
                </div>
                <span>Queue Items</span>
              </h2>
              <HoverCard direction="left">
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm text-gray-400 hover:bg-white/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              </HoverCard>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => {
                  const recipe = recipes.find(r => r.id === item.recipeId);
                  if (!recipe) return null;
                  
                  return (
                    <motion.div
                      key={`${item.recipeId}-${index}`}
                      initial={{ opacity: 0, y: 20, x: -20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        x: 0,
                        scale: animatingItemIndex === index ? 1.03 : 1,
                        boxShadow: animatingItemIndex === index ? "0 0 15px rgba(168, 85, 247, 0.5)" : "none"
                      }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      layout
                    >                      <CardSpotlight className="overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
                        <div className="flex items-center gap-4 p-4">
                          <div 
                            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800"
                          >
                            <img 
                              src={recipe.imageUrl} 
                              alt={recipe.name}
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
                            {/* Add sparkle effect to active items */}
                            {animatingItemIndex === index && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-purple-500/10"
                              >
                                <SparklesEffect id={`recipe-${index}`} className="absolute inset-0" />
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-medium">{recipe.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.customization.salt !== 50 && (
                                <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-2 py-1 text-xs backdrop-blur-sm">
                                  Salt: {item.customization.salt}%
                                </span>
                              )}
                              {item.customization.spice !== 50 && (
                                <span className="rounded-full bg-gradient-to-r from-red-500/20 to-red-500/10 px-2 py-1 text-xs backdrop-blur-sm">
                                  Spice: {item.customization.spice}%
                                </span>
                              )}
                              {item.customization.water !== 50 && (
                                <span className="rounded-full bg-gradient-to-r from-blue-500/20 to-blue-500/10 px-2 py-1 text-xs backdrop-blur-sm">
                                  Water: {item.customization.water}%
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <HoverCard direction="up" scale={1.2}>
                              <button
                                onClick={() => item.quantity > 1 && updateCartItem(index, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                            </HoverCard>
                            
                            <motion.span 
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/20 text-center"
                              key={item.quantity}
                              initial={{ scale: 1.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                            >
                              {item.quantity}
                            </motion.span>
                            
                            <HoverCard direction="up" scale={1.2}>
                              <button
                                onClick={() => updateCartItem(index, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                              >
                                <Plus size={14} />
                              </button>
                            </HoverCard>
                          </div>
                          
                          <HoverCard direction="left" scale={1.2}>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          </HoverCard>
                        </div>
                      </CardSpotlight>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
              <AnimatedSection direction="up" delay={0.3} className="mt-6">
              <GlassCard className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h3 className="mb-4 font-semibold text-xl flex items-center gap-2">
                    <Clock size={18} className="text-purple-400" />
                    Queue Summary
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col items-center justify-center bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart size={16} className="text-purple-400" />
                        <span className="text-sm text-white/70">Total Items</span>
                      </div>
                      <span className="text-3xl font-bold">{totalItems}</span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-purple-400" />
                        <span className="text-sm text-white/70">Cooking Time</span>
                      </div>
                      <span className="text-3xl font-bold text-purple-300">{formatCookingTime(totalCookingTime)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/70">Cooking Progress</span>
                      <span className="text-sm text-white/70">0%</span>
                    </div>
                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "0%" }}
                      />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {totalCookingTime > 60 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-500/10 px-4 py-3 border border-yellow-500/20"
                      >
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-yellow-500" />
                        <div>
                          <p className="font-medium text-yellow-200 mb-1">Extended Cooking Time</p>
                          <p className="text-sm text-yellow-200/80">
                            The cooking process will take more than an hour. Make sure you have enough time available.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </AnimatedSection>
              <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative mt-6 w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-4 text-center font-medium text-white shadow-lg shadow-purple-500/25 backdrop-blur-xl border border-purple-400/30 disabled:from-purple-600/70 disabled:to-purple-500/70 disabled:opacity-70"
              onClick={handleStartCooking}
              disabled={isProcessing}
            >
              {/* Animated background on hover */}
              <motion.div 
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_#9333ea_0%,_transparent_50%)]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 2 }}
                transition={{ duration: 0.8 }}
              />
              
              <span className="flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FastForward size={18} />
                    <span>Start Cooking All Items</span>
                  </>
                )}
              </span>
              
              {/* Pulse effect around button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="absolute inset-0 rounded-xl border border-white/20"
              />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};