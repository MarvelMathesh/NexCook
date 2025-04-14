import React from "react";
import { motion } from "framer-motion";
import { ChefHat, Star } from "lucide-react";
import { useAppStore } from "../../store";
import { Sparkles } from "../ui/SparklesEffect";

export const RatingScreen = () => {
  const { selectedRecipe, ratingValue, setRating, setCurrentScreen, resetCooking } = useAppStore();

  const handleSubmitRating = () => {
    // Here we would save the rating to the recipe in a real app
    setTimeout(() => {
      resetCooking();
      setCurrentScreen('home');
    }, 1000);
  };

  if (!selectedRecipe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>No recipe selected.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-black to-purple-950 px-4 py-16 text-white">
      <Sparkles id="rating-sparkles" className="absolute inset-0" />
      
      <div className="relative z-10 mx-auto max-w-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-purple-600"
        >
          <ChefHat size={40} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-3xl font-bold"
        >
          Enjoy Your Meal!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-gray-300"
        >
          How would you rate your {selectedRecipe.name}?
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1"
                onClick={() => setRating(star)}
              >
                <Star
                  size={36}
                  className={`${
                    star <= ratingValue
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-500"
                  } transition-colors`}
                />
              </motion.button>
            ))}
          </div>
          <p className="mt-4 text-gray-300">
            {ratingValue === 0
              ? "Tap to rate"
              : ratingValue === 1
              ? "Could be better"
              : ratingValue === 2
              ? "It was okay"
              : ratingValue === 3
              ? "Good"
              : ratingValue === 4
              ? "Great!"
              : "Excellent!"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <button
            onClick={handleSubmitRating}
            className="w-full rounded-xl bg-purple-600 py-3 font-medium text-white transition-all hover:bg-purple-700"
            disabled={ratingValue === 0}
          >
            Submit Rating
          </button>
          
          <button
            onClick={() => {
              resetCooking();
              setCurrentScreen('home');
            }}
            className="w-full rounded-xl border border-white/20 bg-transparent py-3 text-white transition-all hover:bg-white/10"
          >
            Skip Rating
          </button>
        </motion.div>
      </div>
    </div>
  );
};