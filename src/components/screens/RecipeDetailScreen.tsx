import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Star, ChefHat, Thermometer, Utensils, ShoppingBag } from "lucide-react";
import { useAppStore } from "../../store";

export const RecipeDetailScreen = () => {
  const { selectedRecipe, setCurrentScreen, customization, addToCart } = useAppStore();
  const [quantity, setQuantity] = useState(1);
  const [addToCartAnimation, setAddToCartAnimation] = useState(false);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-purple-950 text-white">
      <div className="relative h-72 w-full">
        <img
          src={selectedRecipe.imageUrl}
          alt={selectedRecipe.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent py-10" />
        
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-4 top-4 rounded-full bg-black/50 p-2 backdrop-blur-sm"
          onClick={() => setCurrentScreen('recipes')}
        >
          <ArrowLeft size={20} />
        </motion.button>
      </div>

      <div className="relative -mt-16 rounded-t-[2rem] bg-black px-6 pt-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-3xl font-bold">{selectedRecipe.name}</h1>
            <div className="flex items-center">
              <Star className="mr-1 text-yellow-400" size={16} />
              <span className="text-sm">{selectedRecipe.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="mb-4 text-purple-400">{selectedRecipe.category}</p>
          
          <div className="mb-6 flex gap-4">
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">{selectedRecipe.cookingTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <ChefHat size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">Easy</span>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">340 kcal</span>
            </div>
          </div>
          
          <p className="text-gray-300">{selectedRecipe.description}</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
            <Utensils size={18} />
            <span>Ingredients</span>
          </h2>
          
          <ul className="mb-8 space-y-2">
            {selectedRecipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                <span>{ingredient.name}</span>
                <span className="text-sm text-gray-400">{ingredient.quantity} {ingredient.unit}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-24"
        >
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
            <span>Cooking Process</span>
          </h2>
          
          <div className="mb-8 space-y-4">
            {selectedRecipe.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-700 text-sm font-medium">
                  {index + 1}
                </div>
                <div className="mt-1">
                  <p className="text-gray-300">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-black/80 p-4 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex w-1/3 items-center justify-center gap-2 rounded-lg bg-white/5 p-2">
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex h-12 w-1/3 items-center justify-center gap-2 rounded-xl bg-purple-600/80 text-white backdrop-blur-sm"
              onClick={handleAddToCart}
              animate={addToCartAnimation ? { scale: [1, 1.1, 1] } : {}}
            >
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </motion.button>
            
            <button
              className="h-12 w-1/3 rounded-xl bg-purple-600 py-3 font-medium text-white"
              onClick={() => setCurrentScreen('customize')}
            >
              Customize & Cook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};