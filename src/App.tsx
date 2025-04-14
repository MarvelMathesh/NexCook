import React from 'react';
import { useAppStore } from './store';
import { HomeScreen } from './components/screens/HomeScreen';
import { RecipesScreen } from './components/screens/RecipesScreen';
import { RecipeDetailScreen } from './components/screens/RecipeDetailScreen';
import { CustomizeScreen } from './components/screens/CustomizeScreen';
import { CookingScreen } from './components/screens/CookingScreen';
import { RatingScreen } from './components/screens/RatingScreen';
import { CartScreen } from './components/screens/CartScreen';
import { ModuleStatusPanel } from './components/ModuleStatusPanel';
import { CartButton } from './components/CartButton';

function App() {
  const { currentScreen } = useAppStore();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Current Screen */}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'recipes' && <RecipesScreen />}
      {currentScreen === 'recipe-details' && <RecipeDetailScreen />}
      {currentScreen === 'customize' && <CustomizeScreen />}
      {currentScreen === 'cooking' && <CookingScreen />}
      {currentScreen === 'rating' && <RatingScreen />}
      {currentScreen === 'cart' && <CartScreen />}

      {/* Global Components */}
      <ModuleStatusPanel />
      <CartButton />
    </div>
  );
}

export default App;