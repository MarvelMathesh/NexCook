import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useAppStore } from "../../store";
import { useNavigation } from "../../hooks/useNavigation";

export const CartScreen = () => {
  const { cart, recipes, removeFromCart, updateCartItem, clearCart, startCookingQueue } = useAppStore();
  const { goToRecipes, goToCooking } = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartCooking = () => {
    setIsProcessing(true);
    // Simulating a short delay as if we're processing the request
    setTimeout(() => {
      startCookingQueue();
      goToCooking();
      setIsProcessing(false);
    }, 1000);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-purple-950 px-4 py-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center"
      >
        <button 
          onClick={goToRecipes}
          className="mr-4 rounded-full bg-white/10 p-2 hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Your Cooking Queue</h1>
          <p className="text-sm text-gray-300">
            {cart.length === 0 
              ? "Your queue is empty" 
              : `${totalItems} item${totalItems !== 1 ? 's' : ''} ready to cook`}
          </p>
        </div>
      </motion.div>

      {cart.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-10 text-center backdrop-blur-sm"
        >
          <ShoppingCart size={60} className="mb-4 text-gray-500" />
          <h2 className="mb-2 text-xl font-medium">Your cooking queue is empty</h2>
          <p className="mb-6 text-gray-400">Add some recipes to your queue to start cooking</p>
          <button 
            onClick={goToRecipes}
            className="rounded-full bg-purple-600 px-6 py-3 font-medium text-white transition-all hover:bg-purple-700"
          >
            Browse Recipes
          </button>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold">Queue Items</h2>
            <button
              onClick={clearCart}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {cart.map((item, index) => {
              const recipe = recipes.find(r => r.id === item.recipeId);
              if (!recipe) return null;
              
              return (
                <motion.div
                  key={`${item.recipeId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm"
                >
                  <div 
                    className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800"
                    style={{ backgroundImage: `url(${recipe.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                  
                  <div className="flex-grow">
                    <h3 className="font-medium">{recipe.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.customization.salt !== 50 && (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                          Salt: {item.customization.salt}%
                        </span>
                      )}
                      {item.customization.spice !== 50 && (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                          Spice: {item.customization.spice}%
                        </span>
                      )}
                      {item.customization.water !== 50 && (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                          Water: {item.customization.water}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => item.quantity > 1 && updateCartItem(index, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    
                    <span className="w-5 text-center">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateCartItem(index, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm">
            <div className="mb-3 flex justify-between">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="mb-3 flex justify-between font-medium">
              <span>Estimated Cooking Time</span>
              <span>{cart.reduce((time, item) => {
                const recipe = recipes.find(r => r.id === item.recipeId);
                return time + (recipe ? recipe.cookingTime * item.quantity : 0);
              }, 0)} min</span>
            </div>
          </div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 w-full rounded-xl bg-purple-600 py-4 text-center font-medium text-white disabled:opacity-70"
            onClick={handleStartCooking}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Start Cooking All Items"}
          </motion.button>
        </div>
      )}
    </div>
  );
};