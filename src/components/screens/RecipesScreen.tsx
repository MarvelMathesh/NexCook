import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Star } from "lucide-react";
import { useAppStore } from "../../store";
import { Card3D } from "../ui/Card3D";
import { CardSpotlight } from "../ui/CardSpotlight";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { containerVariants, itemVariants } from "../../utils/animations";

export const RecipesScreen = () => {
  const { recipes, setCurrentScreen, selectRecipe } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(recipes.map(recipe => recipe.category))];

  const filteredRecipes = selectedCategory
    ? recipes.filter(recipe => recipe.category === selectedCategory)
    : recipes;

  const handleRecipeSelect = (recipe) => {
    selectRecipe(recipe);
    setCurrentScreen('recipe-details');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-purple-950 p-6 pb-24 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center"
      >
        <button 
          onClick={() => setCurrentScreen('home')}
          className="mr-4 rounded-full bg-white/10 p-2 hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Recipe Selection</h1>
          <TextGenerateEffect 
            words="Choose from our curated collection of smart recipes"
            className="text-sm text-gray-300"
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex flex-wrap gap-2"
      >
        <button
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedCategory === null
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All Recipes
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-purple-600 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredRecipes.map((recipe) => (
          <motion.div key={recipe.id} variants={itemVariants}>
            <Card3D className="h-full">
              <CardSpotlight
                className="h-full cursor-pointer border-0 p-0 transition-all hover:shadow-xl"
                onClick={() => handleRecipeSelect(recipe)}
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs backdrop-blur-sm">
                        <Clock size={12} />
                        <span>{recipe.cookingTime} min</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs backdrop-blur-sm">
                        <Star size={12} className="text-yellow-400" />
                        <span>{recipe.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-xl font-semibold">{recipe.name}</h3>
                  <p className="mb-3 text-xs text-purple-300">{recipe.category}</p>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="mt-4 text-right">
                    <span className="inline-block rounded-full bg-purple-600 px-4 py-2 text-xs font-medium text-white">
                      Select Recipe
                    </span>
                  </div>
                </div>
              </CardSpotlight>
            </Card3D>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};