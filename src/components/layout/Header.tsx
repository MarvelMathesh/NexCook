import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Menu, X, User, Bell } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "../../utils/animations";
import { IconButton } from "../ui/IconButton";
import { GlowText } from "../ui/GlowText";
import { useAppStore } from "../../store";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { modules } = useAppStore();
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Check if any module is in critical or warning state
  useEffect(() => {
    const criticalModules = modules.filter(
      m => m.status === "critical" || m.status === "warning"
    );
    setHasNotifications(criticalModules.length > 0);
  }, [modules]);

  // Detect scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Define routes that should have transparent header
  const transparentHeaderRoutes = ['/', '/recipes'];
  const isTransparent = transparentHeaderRoutes.includes(location.pathname) && !isScrolled && !isMobileMenuOpen;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 z-40 w-full px-4 py-3 transition-all duration-300",
          isTransparent 
            ? "bg-transparent"
            : "glass border-b border-white/10"
        )}
      >
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isTransparent ? "bg-primary" : "bg-primary/80"
              )}
            >
              <ChefHat className="text-white" size={20} />
            </motion.div>
            
            <GlowText
              text="NexCook"
              gradient={true}
              as="h1"
              size="xl"
              className="font-semibold tracking-tight"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1">
              {['Home', 'Recipes', 'My Queue'].map((item) => {
                const path = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
                const isActive = location.pathname === path;
                
                return (
                  <li key={item}>
                    <Link to={path}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        className={cn(
                          "rounded-full px-4 py-2 font-medium transition-colors",
                          isActive 
                            ? "bg-white/10 text-white" 
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {item}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notification button */}
            <Link to="/module-status">
              <IconButton 
                variant="glass" 
                size="md"
                className="relative"
              >
                <Bell size={18} />
                {hasNotifications && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500"
                  />
                )}
              </IconButton>
            </Link>
            
            {/* User button */}
            <IconButton variant="glass" size="md">
              <User size={18} />
            </IconButton>
            
            {/* Mobile menu button */}
            <IconButton 
              variant="glass" 
              size="md"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </IconButton>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 mt-[72px] bg-black/95 backdrop-blur-lg"
          >
            <nav className="flex h-full flex-col p-6">
              <ul className="space-y-4">
                {['Home', 'Recipes', 'My Queue', 'Module Status'].map((item) => {
                  const path = item === 'Home' 
                    ? '/' 
                    : `/${item.toLowerCase().replace(' ', '-')}`;
                  const isActive = location.pathname === path;
                  
                  return (
                    <li key={item}>
                      <Link to={path} onClick={() => setIsMobileMenuOpen(false)}>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className={cn(
                            "block rounded-xl px-4 py-3 text-lg font-medium",
                            isActive 
                              ? "bg-primary/20 text-primary" 
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {item}
                        </motion.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              <div className="mt-auto rounded-xl bg-white/5 p-4">
                <p className="text-sm text-white/70">
                  Connected to NexCook Smart Hub
                </p>
                <p className="text-xs text-white/50">
                  Firmware v2.1.4
                </p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};