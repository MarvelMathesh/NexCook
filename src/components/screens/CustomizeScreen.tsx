import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Droplets, Flame, Salad as Salt, Utensils, ShoppingBag } from "lucide-react";
import { useAppStore } from "../../store";

export const CustomizeScreen = () => {
  const { selectedRecipe, customization, updateCustomization, setCurrentScreen, startCooking, addToCart } = useAppStore();
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
    addToCart(selectedRecipe.id, quantity, { ...customization });
    setAddToCartAnimation(true);
    setTimeout(() => setAddToCartAnimation(false), 500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-purple-950 px-4 py-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center"
      >
        <button 
          onClick={() => setCurrentScreen('recipe-details')}
          className="mr-4 rounded-full bg-white/10 p-2 hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Customize Recipe</h1>
          <p className="text-sm text-gray-300">
            Adjust parameters for {selectedRecipe.name}
          </p>
        </div>
      </motion.div>

      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <Salt size={20} className="text-purple-400" />
            <h3 className="text-xl font-medium">Salt Level</h3>
          </div>
          
          <div className="mb-2 flex justify-between text-sm">
            <span>Low</span>
            <span>Recommended</span>
            <span>High</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={customization.salt}
            onChange={(e) => updateCustomization('salt', parseInt(e.target.value))}
            className="w-full appearance-none rounded-lg bg-white/20 h-2 accent-purple-500"
          />
          
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Less sodium</span>
            <span>{customization.salt}%</span>
            <span>More flavor</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <Flame size={20} className="text-purple-400" />
            <h3 className="text-xl font-medium">Spice Level</h3>
          </div>
          
          <div className="mb-2 flex justify-between text-sm">
            <span>Mild</span>
            <span>Medium</span>
            <span>Hot</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={customization.spice}
            onChange={(e) => updateCustomization('spice', parseInt(e.target.value))}
            className="w-full appearance-none rounded-lg bg-white/20 h-2 accent-purple-500"
          />
          
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Kid friendly</span>
            <span>{customization.spice}%</span>
            <span>Extra spicy</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <Droplets size={20} className="text-purple-400" />
            <h3 className="text-xl font-medium">Water Content</h3>
          </div>
          
          <div className="mb-2 flex justify-between text-sm">
            <span>Thick</span>
            <span>Standard</span>
            <span>Thin</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={customization.water}
            onChange={(e) => updateCustomization('water', parseInt(e.target.value))}
            className="w-full appearance-none rounded-lg bg-white/20 h-2 accent-purple-500"
          />
          
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Concentrated</span>
            <span>{customization.water}%</span>
            <span>Diluted</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <Utensils size={20} className="text-purple-400" />
            <h3 className="text-xl font-medium">Recipe Preview</h3>
          </div>

          <div className="flex flex-col gap-2">
            <div className="rounded-lg bg-black/30 p-4">
              <h4 className="mb-2 font-medium">{selectedRecipe.name}</h4>
              <p className="text-sm text-gray-300">
                {
                  customization.salt > 75 
                    ? "This recipe will be saltier than usual. " 
                    : customization.salt < 25 
                      ? "This recipe will be less salty than usual. " 
                      : ""
                }
                {
                  customization.spice > 75 
                    ? "Spice level will be quite hot. " 
                    : customization.spice < 25 
                      ? "This will be very mild with minimal spice. " 
                      : ""
                }
                {
                  customization.water > 75 
                    ? "The consistency will be more liquid than standard. " 
                    : customization.water < 25 
                      ? "The dish will have a thicker consistency. " 
                      : ""
                }
              </p>
            </div>
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
              onClick={startCooking}
            >
              Cook Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};