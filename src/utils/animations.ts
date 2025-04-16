import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fadeInAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
    }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export const springTransition = {
  type: "spring",
  stiffness: 700,
  damping: 30
};

// New animations for enhanced UI
export const staggerContainer = (delayChildren = 0.3, staggerChildren = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren,
      staggerChildren
    }
  }
});

export const pulseAnimation = {
  initial: { scale: 1, opacity: 0.7 },
  animate: { 
    scale: [1, 1.05, 1], 
    opacity: [0.7, 1, 0.7] 
  },
  transition: { 
    duration: 2, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

export const glowAnimation = {
  initial: { boxShadow: "0 0 0 rgba(168, 85, 247, 0)" },
  animate: { 
    boxShadow: [
      "0 0 0 rgba(168, 85, 247, 0)",
      "0 0 15px rgba(168, 85, 247, 0.5)",
      "0 0 0 rgba(168, 85, 247, 0)"
    ]
  },
  transition: { 
    duration: 2, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

export const floatAnimation = {
  initial: { y: 0 },
  animate: { y: [0, -10, 0] },
  transition: { 
    duration: 3, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

export const spinAnimation = {
  initial: { rotate: 0 },
  animate: { rotate: 360 },
  transition: { 
    duration: 3, 
    repeat: Infinity, 
    ease: "linear" 
  }
};

export const backgroundShimmer = {
  initial: { backgroundPosition: "0% 0%" },
  animate: { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] },
  transition: { 
    duration: 5, 
    repeat: Infinity, 
    ease: "linear" 
  }
};

export const shimmerAnimation = {
  initial: { backgroundPosition: "-500px 0" },
  animate: { 
    backgroundPosition: ["500px 0", "-500px 0"],
    transition: { 
      duration: 2, 
      repeat: Infinity,
      ease: "linear" 
    }
  }
};

export const blurInAnimation = {
  initial: { filter: "blur(10px)", opacity: 0 },
  animate: { filter: "blur(0px)", opacity: 1 },
  exit: { filter: "blur(10px)", opacity: 0 },
  transition: { duration: 0.5 }
};

// Interactive transition variations
export const interactiveTransition = {
  fast: {
    type: "spring",
    stiffness: 300,
    damping: 15
  },
  medium: {
    type: "spring",
    stiffness: 200,
    damping: 20
  },
  slow: {
    type: "spring",
    stiffness: 100,
    damping: 25
  }
};

// Page transition variations
export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 }
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.5 }
  }
};

// Add new animations for CookingScreen
export const cookingTransitions = {
  fast: {
    type: "spring",
    stiffness: 300,
    damping: 15
  },
  medium: {
    type: "spring",
    stiffness: 200,
    damping: 20
  },
  slow: {
    type: "spring",
    stiffness: 100,
    damping: 25
  }
};

export const cookingAnimations = {
  glow: {
    animate: { 
      boxShadow: [
        "0 0 10px 2px rgba(168, 85, 247, 0.3)",
        "0 0 15px 5px rgba(168, 85, 247, 0.5)",
        "0 0 10px 2px rgba(168, 85, 247, 0.3)"
      ]
    },
    transition: { 
      duration: 3, 
      repeat: Infinity,
      ease: "easeInOut" 
    }
  },
  pulse: {
    animate: { 
      scale: [1, 1.05, 1], 
      opacity: [0.7, 1, 0.7] 
    },
    transition: { 
      duration: 2, 
      repeat: Infinity,
      ease: "easeInOut" 
    }
  }
};