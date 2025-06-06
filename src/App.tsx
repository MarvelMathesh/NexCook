import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { NotificationProvider } from './components/ui/NotificationProvider';
import { AmbientSoundProvider } from './components/ui/AmbientSoundProvider';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { RecipesScreen } from './components/screens/RecipesScreen';
import { RecipeDetailScreen } from './components/screens/RecipeDetailScreen';
import { CustomizeScreen } from './components/screens/CustomizeScreen';
import { CookingScreen } from './components/screens/CookingScreen';
import { RatingScreen } from './components/screens/RatingScreen';
import { CartScreen } from './components/screens/CartScreen';

// Global Components
import { ModuleStatusPanel } from './components/ModuleStatusPanel';
import { CartButton } from './components/CartButton';
import { SystemStatusIndicator } from './components/ui/SystemStatusIndicator';
import { ErrorNotifications } from './components/ui/ErrorNotifications';
import { SoundToggle } from './components/ui/SoundToggle';

/**
 * Main App Component with Clean Architecture
 * - Initializes all services on startup
 * - Provides error boundaries and loading states
 * - Manages global UI state and navigation
 */
function App() {
  const { 
    isInitialized, 
    initializeApp, 
    currentScreen,
    errors,
    isOnline 
  } = useAppStore();
  
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize the application
  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(
          error instanceof Error 
            ? error.message 
            : 'Failed to initialize application'
        );
      }
    };

    init();
  }, [initializeApp]);

  // Show loading screen during initialization
  if (!isInitialized && !initError) {
    return (
      <LoadingScreen 
        message="Initializing cooking system..."
        details={[
          "Connecting to hardware",
          "Loading recipes",
          "Checking module status",
          "Syncing with cloud"
        ]}
      />
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Initialization Failed
          </h1>
          <p className="text-gray-300 mb-6">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <ErrorBoundary>
      <AmbientSoundProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-black text-white relative">
            <BrowserRouter>
              {/* Main Content */}
              <main className="relative z-10">
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
              </main>

              {/* Global UI Components */}
              <GlobalComponents />
            </BrowserRouter>
          </div>
        </NotificationProvider>
      </AmbientSoundProvider>
    </ErrorBoundary>
  );
}

/**
 * Global Components that appear on all screens
 */
function GlobalComponents() {
  const { currentScreen, errors, isOnline } = useAppStore();
  
  // Don't show global components on certain screens
  const hideGlobalComponents = ['cooking'].includes(currentScreen);
  
  if (hideGlobalComponents) {
    return (
      <>
        <SystemStatusIndicator />
        <ErrorNotifications />
      </>
    );
  }
  return (
    <>
      {/* Sound Toggle */}
      <SoundToggle />
      
      {/* Module Status Panel */}
      <ModuleStatusPanel />
      
      {/* Cart Button */}
      <CartButton />
      
      {/* System Status Indicator */}
      <SystemStatusIndicator />
      
      {/* Error Notifications */}
      <ErrorNotifications />
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;