import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Clock, Star, ChefHat, Thermometer, Utensils, ShoppingBag, Heart, Share, Play, PauseCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { useNavigation } from "../../hooks/useNavigation";
import { PaymentQRModal } from "../PaymentQRModal";
import { RecipeIngredientItem } from "../RecipeIngredientItem";
import { GridPattern } from "../ui/GridPattern";
import { GlowingBorder } from "../ui/GlowingBorder";
import { AnimatedSection } from "../ui/AnimatedSection";
import { springTransition } from "../../utils/animations";

export const RecipeDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { recipes, selectedRecipe, selectRecipe, customization, addToCart } = useAppStore();
  const { goToRecipes, goToCustomize } = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const [addToCartAnimation, setAddToCartAnimation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  // Refs for scroll-based animations
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Create scroll-linked animations
  const imageScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -60]);
  
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
    addToCart(selectedRecipe.id, quantity, customization);
    setAddToCartAnimation(true);
    setTimeout(() => setAddToCartAnimation(false), 500);
  };
  
  const handleCustomizeClick = () => {
    // Show payment modal instead of going directly to customize
    setShowPaymentModal(true);
  };
  
  const handlePaymentComplete = () => {
    // Close modal and proceed to customize screen
    setShowPaymentModal(false);
    goToCustomize(selectedRecipe.id);
  };

  // Calculate a mock price based on cooking time and ingredients count
  const recipePrice = Number(
    (selectedRecipe?.cookingTime * 0.5 + selectedRecipe?.ingredients.length * 1.25).toFixed(2)
  );

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-black text-white">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 opacity-30">
        <GridPattern width={32} height={32} squared={false} />
      </div>
      
      {/* Hero Image with Parallax Effect */}
      <motion.div 
        ref={imageRef}
        className="relative h-[40vh] w-full sm:h-[50vh] lg:h-[60vh]"
        style={{ scale: imageScale, opacity: imageOpacity }}
      >
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={selectedRecipe.imageUrl}
            alt={selectedRecipe.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />
        
        {/* Fixed header */}
        <motion.div 
          className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-4"
          style={{ y: headerY }}
        >
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={springTransition}
            className="rounded-full bg-black/50 p-2 backdrop-blur-sm"
            onClick={goToRecipes}
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ ...springTransition, delay: 0.1 }}
              className="rounded-full bg-black/50 p-2 backdrop-blur-sm"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ ...springTransition, delay: 0.2 }}
              className="rounded-full bg-black/50 p-2 backdrop-blur-sm"
            >
              <Share size={20} />
            </motion.button>
          </div>
        </motion.div>
        
        {/* Center play button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={springTransition}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/80 p-6 backdrop-blur-md"
          onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
        >
          {isPreviewPlaying ? <PauseCircle size={32} /> : <Play size={32} />}
        </motion.button>
        
        {/* Recipe title on image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 p-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              {selectedRecipe.name}
            </h1>
            <GlowingBorder size="sm" glowColor="from-yellow-400 to-orange-500">
              <div className="flex items-center gap-1 px-3 py-1">
                <Star className="text-yellow-400" size={16} />
                <span className="font-bold">{selectedRecipe.rating.toFixed(1)}</span>
              </div>
            </GlowingBorder>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 text-lg text-purple-300 drop-shadow-lg"
          >
            {selectedRecipe.category}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Content section with scaled rounded top corners */}
      <div className="relative z-10 -mt-10 rounded-t-[2rem] bg-gradient-to-b from-black to-purple-950/20 px-6 pt-10 pb-32">
        {/* Recipe information */}
        <AnimatedSection direction="up" delay={0.2} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
                <Clock size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">{selectedRecipe.cookingTime} min</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
                <ChefHat size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">Easy</span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
                <Thermometer size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">340 kcal</span>
              </div>
            </div>
            <GlowingBorder size="sm">
              <div className="px-3 py-1">
                <span className="font-bold">${recipePrice}</span>
              </div>
            </GlowingBorder>
          </div>
        </AnimatedSection>
        
        <AnimatedSection direction="up" delay={0.3} className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Description</h2>
          <motion.p 
            className="leading-relaxed text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {selectedRecipe.description}
            {/* Extended description for better UX */}
            {" "}This recipe has been optimized for NexCook's advanced cooking technology, ensuring perfect results every time. The precise temperature control and ingredient dispensing system guarantees consistent flavor and texture.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.5}>
          <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
            <Utensils size={18} className="text-purple-400" />
            <span>Ingredients</span>
          </h2>
          
          <ul className="mb-8 space-y-2">
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <RecipeIngredientItem 
                key={ingredient.id} 
                ingredient={ingredient} 
                index={index} 
              />
            ))}
          </ul>
        </AnimatedSection>

        <AnimatedSection direction="up" delay={0.7} className="mb-12">
          <h2 className="mb-3 text-xl font-semibold">Cooking Process</h2>
          
          <div className="mb-8 space-y-4">
            {selectedRecipe.steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-purple-600/20" />
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-purple-700 text-sm font-medium">
                    {index + 1}
                  </div>
                  {index < selectedRecipe.steps.length - 1 && (
                    <div className="absolute top-8 left-1/2 h-full w-0.5 -translate-x-1/2 bg-purple-700/30" />
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-gray-300">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Bottom action bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-black/90 p-4 backdrop-blur-lg"
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Replace the GlowingBorder with a simple div to remove the rotating animation */}
            <div className="flex w-24 items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-black/40 px-1 py-2 backdrop-blur-sm">
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
              onClick={handleCustomizeClick}
            >
              Customize & Cook
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Payment QR Modal */}
      <PaymentQRModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        recipeName={selectedRecipe?.name || ""}
        amount={recipePrice}
      />
    </div>
  );
};