import React from "react";
import { motion } from "framer-motion";
import { ChefHat, ChevronDown, ArrowRight } from "lucide-react";
import { BackgroundBeams } from "../ui/BackgroundBeams";
import { Sparkles } from "../ui/SparklesEffect";
import { FlipWords } from "../ui/FlipWords";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { useAppStore } from "../../store";
import { containerVariants, itemVariants } from "../../utils/animations";

export const HomeScreen = () => {
  const { setCurrentScreen } = useAppStore();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <BackgroundBeams className="absolute inset-0 z-0" />
      
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <ChefHat size={60} className="mx-auto mb-4 text-purple-400" />
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            Nex<span className="text-purple-400">Cook</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-12 max-w-3xl"
        >
          <p className="mb-4 text-xl font-medium text-gray-200">
            The future of cooking is{" "}
            <FlipWords
              words={["automated", "intelligent", "personalized", "futuristic"]}
              className="font-bold text-purple-400"
            />
          </p>
          
          <TextGenerateEffect
            words="Discover a new dimension of culinary experience with our state-of-the-art smart cooking technology."
            className="text-lg text-gray-300"
          />
        </motion.div>

        <Sparkles id="hero-sparkles" className="pointer-events-none absolute inset-0 z-0" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid max-w-5xl grid-cols-1 gap-8 px-4 md:grid-cols-2"
        >
          <motion.div 
            variants={itemVariants}
            className="group rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-md transition-all hover:bg-black/70"
          >
            <h3 className="mb-3 text-xl font-semibold text-white">Intelligent Recipes</h3>
            <p className="mb-4 text-gray-300">Access hundreds of smart recipes optimized for perfect results every time.</p>
            <div className="flex items-center text-purple-400 transition-transform group-hover:translate-x-1">
              <span>Explore recipes</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group rounded-xl border border-white/10 bg-black/50 p-6 backdrop-blur-md transition-all hover:bg-black/70"
          >
            <h3 className="mb-3 text-xl font-semibold text-white">Personalized Cooking</h3>
            <p className="mb-4 text-gray-300">Customize every aspect of your meal from spice levels to cooking techniques.</p>
            <div className="flex items-center text-purple-400 transition-transform group-hover:translate-x-1">
              <span>Start personalizing</span>
              <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 flex flex-col items-center"
          onClick={() => setCurrentScreen('recipes')}
        >
          <span className="mb-2 rounded-full bg-purple-500 px-6 py-3 font-medium text-white transition-all hover:bg-purple-600">
            Start Cooking
          </span>
          <ChevronDown size={24} className="mt-4 animate-bounce text-white/70" />
        </motion.button>
      </div>
    </div>
  );
};