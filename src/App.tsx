import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeScreen } from './components/screens/HomeScreen';
import { RecipesScreen } from './components/screens/RecipesScreen';
import { RecipeDetailScreen } from './components/screens/RecipeDetailScreen';
import { CustomizeScreen } from './components/screens/CustomizeScreen';
import { CookingScreen } from './components/screens/CookingScreen';
import { RatingScreen } from './components/screens/RatingScreen';
import { CartScreen } from './components/screens/CartScreen';
import { ModuleStatusPanel } from './components/ModuleStatusPanel';
import { CartButton } from './components/CartButton';
import { FirebaseProvider } from './components/FirebaseProvider';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <FirebaseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/recipes" element={<RecipesScreen />} />
            <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
            <Route path="/customize/:id" element={<CustomizeScreen />} />
            <Route path="/cooking" element={<CookingScreen />} />
            <Route path="/rating" element={<RatingScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Components */}
          <ModuleStatusPanel />
          <CartButton />
        </BrowserRouter>
      </FirebaseProvider>
    </div>
  );
}

export default App;