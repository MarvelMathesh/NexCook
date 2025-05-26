import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Star, ChefHat, Thermometer, Utensils, ShoppingBag, Heart, Share, Sparkles, TrendingUp, Users, Bookmark } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";
import { PaymentQRModal } from "../PaymentQRModal";
import { RecipeIngredientItem } from "../RecipeIngredientItem";
import { GridPattern } from "../ui/GridPattern";
import { GlowingBorder } from "../ui/GlowingBorder";
import { CardSpotlight } from "../ui/CardSpotlight";
import { GlassCard } from "../ui/GlassCard";
import { HoverCard } from "../ui/HoverCard";
import { Sparkles as SparklesEffect } from "../ui/SparklesEffect";
import { springTransition } from "../../utils/animations";
import { firebaseService } from "../../services/firebase";

export const RecipeDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { recipes, selectedRecipe, selectRecipe, customization, addToCart } = useAppStore();
  const { goToRecipes, goToCustomize } = useNavigation();  const [quantity, setQuantity] = useState(1);
  const [addToCartAnimation, setAddToCartAnimation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeRecipe, setRealtimeRecipe] = useState(selectedRecipe);  const [showSuccess, setShowSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"overview" | "ingredients" | "steps">("overview");
  
  // Set up real-time Firebase listener for recipe data
  useEffect(() => {
    if (!id) return;
    
    setIsLoading(true);
    
    const unsubscribe = firebaseService.getRecipeWithRealTimeUpdates(
      id,
      (updatedRecipe) => {
        setRealtimeRecipe(updatedRecipe);
        selectRecipe(updatedRecipe);
        setIsLoading(false);
      },
      (error) => {
        console.error("Recipe real-time update error:", error);
        setIsLoading(false);
        // Fallback to local recipe data
        const recipe = recipes.find(r => r.id === id);
        if (recipe) {
          setRealtimeRecipe(recipe);
          selectRecipe(recipe);
        }
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id, selectRecipe]);
  
  // Load recipe by ID if not already selected (fallback)
  useEffect(() => {
    if ((!selectedRecipe || selectedRecipe.id !== id) && id && !realtimeRecipe) {
      const recipe = recipes.find(r => r.id === id);
      if (recipe) {
        selectRecipe(recipe);
        setRealtimeRecipe(recipe);
      }
    }
  }, [id, recipes, selectedRecipe, selectRecipe, realtimeRecipe]);

  // Use realtime recipe data if available, otherwise fall back to selected recipe
  const currentRecipe = realtimeRecipe || selectedRecipe;
  // Loading state with enhanced design
  if (isLoading || !currentRecipe) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />
        
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-purple-500/30 border-t-purple-500"
            />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/70"
            >
              Loading recipe details...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }
  const handleAddToCart = () => {
    if (!currentRecipe) return;
    addToCart(currentRecipe.id, quantity, customization);
    setAddToCartAnimation(true);
    setShowSuccess(true);
    setTimeout(() => {
      setAddToCartAnimation(false);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  };
  
  const handleCustomizeClick = () => {
    // Show payment modal instead of going directly to customize
    setShowPaymentModal(true);
  };
  
  const handlePaymentComplete = () => {
    // Close modal and proceed to customize screen
    setShowPaymentModal(false);
    if (currentRecipe) {
      goToCustomize(currentRecipe.id);
    }
  };

  // Calculate a mock price based on cooking time and ingredients count
  const recipePrice = Number(
    ((currentRecipe?.cookingTime || 0) * 0.5 + (currentRecipe?.ingredients?.length || 0) * 1.25).toFixed(2)
  );
  return (
    <div className="relative min-h-screen w-full text-white">      {/* Enhanced futuristic animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/50 to-black" />
      </div>
      
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 opacity-20">
        <GridPattern width={40} height={40} squared={false} />
      </div>
      
      {/* Success notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-0 right-0 top-20 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-green-500/80 py-2 text-white backdrop-blur-sm"
          >
            <Sparkles size={16} />
            <span>Added to cooking queue</span>
          </motion.div>
        )}
      </AnimatePresence>
        {/* Hero Image with enhanced styling */}
      <motion.div 
        className="relative h-[50vh] w-full sm:h-[60vh] lg:h-[70vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={currentRecipe.imageUrl}
            alt={currentRecipe.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
        
        {/* Enhanced gradient overlays for better Apple Music aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
          {/* Floating sparkles effect */}
        <SparklesEffect id="recipe-sparkles" className="absolute inset-0" />
        
        {/* Fixed header with glassmorphism */}
        <motion.div 
          className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HoverCard scale={1.1}>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={springTransition}
              className="rounded-full bg-black/50 border border-white/20 p-3 backdrop-blur-xl"
              onClick={goToRecipes}
            >
              <ArrowLeft size={20} />
            </motion.button>
          </HoverCard>
          
          <div className="flex gap-2">
            <HoverCard scale={1.1}>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ ...springTransition, delay: 0.1 }}
                className="rounded-full bg-black/50 border border-white/20 p-3 backdrop-blur-xl"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
              </motion.button>
            </HoverCard>
            
            <HoverCard scale={1.1}>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ ...springTransition, delay: 0.2 }}
                className="rounded-full bg-black/50 border border-white/20 p-3 backdrop-blur-xl"
              >
                <Share size={20} />
              </motion.button>
            </HoverCard>
          </div>        </motion.div>
        
        {/* Recipe title with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 p-6"
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <motion.h1 
                className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {currentRecipe.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex items-center gap-3 mb-2"
              >
                <span className="rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-white/20 px-4 py-2 text-lg text-purple-200 backdrop-blur-xl">
                  {currentRecipe.category}
                </span>
                {currentRecipe.timesCooked && currentRecipe.timesCooked > 50 && (
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-400/30 px-3 py-2 text-sm text-orange-200 backdrop-blur-xl">
                    <TrendingUp size={16} />
                    <span>Trending</span>
                  </div>
                )}
              </motion.div>
            </div>
            
            <GlowingBorder size="md" glowColor="from-yellow-400 to-orange-500">
              <div className="flex items-center gap-2 px-4 py-3 bg-black/30 backdrop-blur-xl">
                <Star className="text-yellow-400" size={20} />
                <span className="font-bold text-xl">{currentRecipe.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </GlowingBorder>
          </div>
        </motion.div>
      </motion.div>      {/* Enhanced content section with glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 -mt-16 rounded-t-[2.5rem] bg-gradient-to-b from-black/95 via-black/90 to-purple-950/30 backdrop-blur-xl border-t border-white/10 px-6 pt-12 pb-40"
      >
        {/* View mode tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 flex justify-center"
        >
          <div className="flex rounded-2xl bg-black/40 border border-white/10 p-1 backdrop-blur-xl">
            {[
              { id: "overview", label: "Overview", icon: <Sparkles size={16} /> },
              { id: "ingredients", label: "Ingredients", icon: <Utensils size={16} /> },
              { id: "steps", label: "Steps", icon: <ChefHat size={16} /> }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === tab.id
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg"
                    : "text-white/60 hover:text-white/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {viewMode === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Enhanced recipe information cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Clock size={20} className="text-blue-400" />, label: "Cook Time", value: `${currentRecipe.cookingTime} min` },
                  { icon: <ChefHat size={20} className="text-green-400" />, label: "Difficulty", value: "Easy" },
                  { icon: <Thermometer size={20} className="text-red-400" />, label: "Calories", value: "340 kcal" },
                  { icon: <Users size={20} className="text-purple-400" />, label: "Popularity", value: `${currentRecipe.timesCooked || 0}×` }
                ].map((item, index) => (
                  <CardSpotlight key={index} className="overflow-hidden border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                    <div className="p-4 text-center">
                      <div className="mb-2 flex justify-center">{item.icon}</div>
                      <p className="text-xs text-white/60 mb-1">{item.label}</p>
                      <p className="font-semibold text-white">{item.value}</p>
                    </div>
                  </CardSpotlight>
                ))}
              </div>

              {/* Enhanced description */}
              <GlassCard className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                    <Bookmark size={18} className="text-purple-400" />
                    Description
                  </h2>
                  <motion.p 
                    className="leading-relaxed text-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {currentRecipe.description}
                    {" "}This recipe has been optimized for NexCook's advanced cooking technology, ensuring perfect results every time. The precise temperature control and ingredient dispensing system guarantees consistent flavor and texture.
                  </motion.p>
                </div>
              </GlassCard>

              {/* Price and actions preview */}
              <GlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-400/20">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Premium Recipe</h3>
                      <p className="text-sm text-white/60">Unlock full customization and cooking guidance</p>
                    </div>
                    <div className="text-right">
                      <GlowingBorder size="sm" glowColor="from-green-400 to-emerald-500">
                        <div className="px-4 py-2 bg-black/30">
                          <span className="text-2xl font-bold text-white">${recipePrice}</span>
                        </div>
                      </GlowingBorder>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {viewMode === "ingredients" && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                    <Utensils size={18} className="text-purple-400" />
                    <span>Ingredients ({currentRecipe.ingredients?.length || 0})</span>
                  </h2>
                  
                  <ul className="space-y-3">
                    {currentRecipe.ingredients?.map((ingredient, index) => (
                      <RecipeIngredientItem 
                        key={ingredient.id} 
                        ingredient={ingredient} 
                        index={index} 
                      />
                    )) || []}
                  </ul>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {viewMode === "steps" && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10">
                <div className="p-6">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                    <ChefHat size={18} className="text-purple-400" />
                    Cooking Process
                  </h2>
                  
                  <div className="space-y-6">
                    {currentRecipe.steps?.map((step, index) => (
                      <motion.div 
                        key={index} 
                        className="flex gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30" />
                          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-700 text-sm font-medium border border-purple-400/30">
                            {index + 1}
                          </div>
                          {index < (currentRecipe.steps?.length || 0) - 1 && (
                            <div className="absolute top-10 left-1/2 h-6 w-0.5 -translate-x-1/2 bg-gradient-to-b from-purple-500/50 to-transparent" />
                          )}
                        </div>
                        <div className="flex-1 mt-2">
                          <p className="text-gray-300 leading-relaxed">{step}</p>
                        </div>
                      </motion.div>
                    )) || []}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>      {/* Enhanced bottom action bar with Apple Music styling */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-black/95 border-t border-white/10 p-6 backdrop-blur-2xl"
      >
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Enhanced quantity selector */}
            <GlassCard className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
              <div className="flex items-center gap-3 px-4 py-2">
                <motion.button 
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(168, 85, 247, 0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  <span className="text-lg font-bold">-</span>
                </motion.button>
                
                <motion.span 
                  key={quantity}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="min-w-[3rem] text-center text-lg font-semibold text-white"
                >
                  {quantity}
                </motion.span>
                
                <motion.button 
                  whileHover={{ scale: 1.2, backgroundColor: "rgba(168, 85, 247, 0.3)" }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <span className="text-lg font-bold">+</span>
                </motion.button>
              </div>
            </GlassCard>
            
            {/* Enhanced action buttons */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 text-white shadow-lg shadow-purple-500/25 backdrop-blur-xl border border-purple-400/30"
              onClick={handleAddToCart}
              animate={addToCartAnimation ? { scale: [1, 1.1, 1] } : {}}
            >
              <ShoppingBag size={20} />
              <span className="font-semibold">Add to Cart</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 text-white shadow-lg shadow-pink-500/25 backdrop-blur-xl border border-pink-400/30"
              onClick={handleCustomizeClick}
            >
              <ChefHat size={20} />
              <span className="font-semibold">Customize</span>
            </motion.button>
          </div>
          
          {/* Price summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/20 px-4 py-3 backdrop-blur-xl"
          >
            <span className="text-sm text-white/70">Total for {quantity} serving{quantity > 1 ? 's' : ''}</span>
            <span className="text-xl font-bold text-emerald-400">${(recipePrice * quantity).toFixed(2)}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Payment QR Modal */}
      <PaymentQRModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        recipeName={currentRecipe?.name || ""}
        amount={recipePrice}
      />
    </div>
  );
};