import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomeScreen } from './components/screens/HomeScreen';
import { RecipesScreen } from './components/screens/RecipesScreen';
import { RecipeDetailScreen } from './components/screens/RecipeDetailScreen';
import { CustomizeScreen } from './components/screens/CustomizeScreen';
import { CookingScreen } from './components/screens/CookingScreen';
import { RatingScreen } from './components/screens/RatingScreen';
import { CartScreen } from './components/screens/CartScreen';
import { ModuleStatusScreen } from './components/screens/ModuleStatusScreen';
import { FirebaseProvider } from './components/FirebaseProvider';

function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/recipes" element={<RecipesScreen />} />
            <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
            <Route path="/customize/:id" element={<CustomizeScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/my-queue" element={<CartScreen />} />
            <Route path="/module-status" element={<ModuleStatusScreen />} />
          </Route>
          
          {/* Full-screen routes outside of the main layout */}
          <Route path="/cooking" element={<CookingScreen />} />
          <Route path="/rating" element={<RatingScreen />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FirebaseProvider>
  );
}

export default App;