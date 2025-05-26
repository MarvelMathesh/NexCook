import { useLocation, useNavigate } from "react-router-dom";
import { Home, ChefHat, ShoppingCart, Sliders } from "lucide-react";
import { FloatingNavigation } from "../ui/FloatingNavigation";
import { useAppStore } from "../../store";

export const MainNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useAppStore();
  
  // Hide navigation on certain screens
  const hiddenPaths = ['/cooking', '/rating'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }
  
  // Get active route
  const getActiveId = () => {
    const path = location.pathname;
    
    if (path === '/') return 'home';
    if (path === '/recipes') return 'recipes';
    if (path === '/cart' || path === '/my-queue') return 'cart';
    if (path === '/module-status') return 'modules';
    
    return '';
  };
  
  // Navigation items
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={20} />,
      onClick: () => navigate('/')
    },
    {
      id: 'recipes',
      label: 'Recipes',
      icon: <ChefHat size={20} />,
      onClick: () => navigate('/recipes')
    },
    {
      id: 'cart',
      label: 'My Queue',
      icon: (
        <div className="relative">
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <div className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </div>
          )}
        </div>
      ),
      onClick: () => navigate('/cart')
    },
    {
      id: 'modules',
      label: 'Module Status',
      icon: <Sliders size={20} />,
      onClick: () => navigate('/module-status')
    },
  ];

  return (
    <FloatingNavigation 
      items={navItems} 
      activeId={getActiveId()}
    />
  );
};