import React from "react";
import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { Carousel } from "../ui/Carousel";
import { useNavigation } from "../../hooks/useNavigation";

export const HomeScreen = () => {
  const { goToRecipes, handleRecipeSelect } = useNavigation();

  // Premium recipe showcase data using available images
  const recipeSlides = [
    {
      title: "Masoor Dal",
      button: "View Recipe",
      description: "Comfort food redefined with precise temperature control",
      src: "/assets/images/masoor-dal.jpg",
      onClick: () => handleRecipeSelect("1") // Assuming recipe IDs start from "1"
    },
    {
      title: "Spinach Soup",
      button: "View Recipe", 
      description: "Nutrient-rich blend with optimal texture preservation",
      src: "/assets/images/spinach-soup.jpg",
      onClick: () => handleRecipeSelect("2")
    },
    {
      title: "Tomato Soup",
      button: "View Recipe",
      description: "Classic flavors enhanced by smart cooking technology",
      src: "/assets/images/tomato-soup.jpg",
      onClick: () => handleRecipeSelect("3")
    },
    {
      title: "Tur Dal",
      button: "View Recipe",
      description: "Traditional recipe with modern precision",
      src: "/assets/images/tur-dal.jpg",
      onClick: () => handleRecipeSelect("4")
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Subtle ambient lighting effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent" />
      
      {/* Main content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        
        {/* Hero Section - Apple-style minimal */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          
          {/* Brand Identity */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <ChefHat size={64} className="mx-auto text-white/90" />
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight text-white mb-6">
              Nex<span className="font-light text-purple-300">Cook</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-light text-white/70 max-w-2xl mx-auto leading-relaxed">
              The future of culinary excellence.
            </p>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-base font-light text-white/50 mt-4 max-w-xl mx-auto"
            >
              Precision cooking technology meets artisanal flavors
            </motion.p>
          </motion.div>

          {/* Featured Recipes Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-3">
                Signature Recipes
              </h2>
              <p className="text-white/60 font-light">
                Curated collection of premium dishes
              </p>
            </div>
            
            <Carousel slides={recipeSlides} />
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-16 text-center"
          >
            <motion.button
              onClick={goToRecipes}
              className="group relative px-10 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white font-light text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Explore All Recipes</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
            
            <p className="text-white/40 text-sm font-light mt-4">
              Begin your culinary journey
            </p>
          </motion.div>

        </section>

        {/* Minimalist Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="py-8 text-center"
        >
          <p className="text-white/30 text-xs font-light tracking-wide">
            NexCook © 2025 • Precision in Every Dish
          </p>
        </motion.footer>

      </div>
    </div>
  );
};