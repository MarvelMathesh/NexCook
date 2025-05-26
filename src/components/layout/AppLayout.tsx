import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { GradientBackground } from "../ui/GradientBackground";

export const AppLayout = () => {
  const location = useLocation();
  
  // Pages that should have custom backgrounds or no default background
  const customBgPages = ['/cooking', '/'];
  const shouldShowDefaultBg = !customBgPages.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Default gradient background */}
      {shouldShowDefaultBg && (
        <GradientBackground 
          className="fixed inset-0 z-0" 
          variant="mix" 
          intensity="low"
        />
      )}
      
      {/* Star pattern background */}
      <div className="fixed inset-0 z-0 opacity-30 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px]" />
      
      {/* Main content */}
      <Header />
      
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 min-h-screen pt-[76px]"
      >
        <Outlet />
      </motion.main>
    </div>
  );
};