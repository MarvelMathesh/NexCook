import React from "react";
import { motion } from "framer-motion";
import { Ingredient } from "../types";

export const RecipeIngredientItem = ({ 
  ingredient, 
  index 
}: { 
  ingredient: Ingredient, 
  index: number 
}) => {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition-all"
    >
      <div className="flex items-center gap-2">
        <span 
          className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600/30 text-xs font-medium"
        >
          {index + 1}
        </span>
        <span>{ingredient.name}</span>
      </div>
      <div className="flex items-center">
        <span className="rounded-full bg-black/30 px-2 py-1 text-sm text-gray-300">
          {ingredient.quantity} {ingredient.unit}
        </span>
      </div>
    </motion.li>
  );
};
