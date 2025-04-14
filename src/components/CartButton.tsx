import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useAppStore } from "../store";

export const CartButton = () => {
  const { cart, setCurrentScreen, currentScreen } = useAppStore();
  
  // Don't show the cart button on the cart screen or cooking screen
  if (currentScreen === 'cart' || currentScreen === 'cooking' || currentScreen === 'rating') {
    return null;
  }
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed right-16 top-4 z-50 flex items-center gap-1 rounded-full bg-purple-600 px-3 py-2 backdrop-blur-md"
      onClick={() => setCurrentScreen('cart')}
    >
      <ShoppingCart size={18} className="text-white" />
      {cart.length > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-purple-600">
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </div>
      )}
    </motion.button>
  );
};