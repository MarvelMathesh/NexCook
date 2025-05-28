import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  writeBatch,
  DocumentData,
  connectFirestoreEmulator, // Add for local development if needed
} from "firebase/firestore";
import { Module, Recipe, CartItem, CookingQueue } from "../types";

// Firebase configuration - using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCnNvHUEllFKgsNgo3_uFU9LRelKGdDxCw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexcook-ab40a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexcook-ab40a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexcook-ab40a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "55101686719",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:55101686719:web:b49bbc253499c65244570a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VZVJYHM8GK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Uncomment for local development with emulator
// if (window.location.hostname === "localhost") {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

// Collection references
const modulesCollection = collection(db, "modules");
const recipesCollection = collection(db, "recipes");
const userCollection = collection(db, "users");
const stateDoc = doc(userCollection, "appState");

// Add a debounce utility to prevent too many writes
const debounce = (func: Function, timeout = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
};

// Firebase Data Service
export const firebaseService = {
  // Initialize the database with default data if it doesn't exist
  async initializeDatabase(initialModules: Module[], initialRecipes: Recipe[]) {
    try {
      // Check if data already exists
      const stateSnapshot = await getDoc(stateDoc);
      
      if (!stateSnapshot.exists()) {
        console.log("Initializing Firebase database with default data...");
        
        // Use a batch for better performance and atomicity
        const batch = writeBatch(db);
        
        // Create initial modules collection
        initialModules.forEach(module => {
          const moduleRef = doc(modulesCollection, module.id);
          batch.set(moduleRef, module);
        });
        
        // Create initial recipes collection
        initialRecipes.forEach(recipe => {
          const recipeRef = doc(recipesCollection, recipe.id);
          batch.set(recipeRef, recipe);
        });
          // Create initial app state
        batch.set(stateDoc, {
          cart: [],
          customization: {
            salt: 50,
            spice: 50,
            water: 50,
            oil: 50,
            temperature: 50,
            grinding: 50,
            chopping: 50,
          },
          cookingQueue: {
            items: [],
            currentItem: 0,
            status: 'idle'
          }
        });
        
        // Commit all operations as a single transaction
        await batch.commit();
        console.log("Firebase database initialized successfully");
      } else {
        console.log("Firebase database already initialized");
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      // Implement better error handling here
    }
  },
  
  // Modules
  async getModules(): Promise<Module[]> {
    try {
      // Create listener to modules collection
      return new Promise((resolve) => {
        onSnapshot(modulesCollection, (snapshot) => {
          const modules: Module[] = [];
          snapshot.forEach((doc) => {
            modules.push(doc.data() as Module);
          });
          resolve(modules);
        });
      });
    } catch (error) {
      console.error("Error getting modules:", error);
      return [];
    }
  },
  
  // Update module with debounce to prevent excessive writes
  updateModule: debounce(async (moduleId: string, moduleData: Partial<Module>) => {
    try {
      const moduleRef = doc(modulesCollection, moduleId);
      await updateDoc(moduleRef, moduleData);
      console.log(`Module ${moduleId} updated successfully`);
    } catch (error) {
      console.error("Error updating module:", error);
    }
  }, 500),
  
  // Add batch update for multiple modules
  async updateModulesBatch(updates: {id: string, data: Partial<Module>}[]) {
    try {
      if (updates.length === 0) return;
      
      const batch = writeBatch(db);
      
      updates.forEach(update => {
        const moduleRef = doc(modulesCollection, update.id);
        batch.update(moduleRef, update.data);
      });
      
      await batch.commit();
      console.log(`Batch updated ${updates.length} modules successfully`);
    } catch (error) {
      console.error("Error batch updating modules:", error);
      // Add more robust error handling
      // Consider retrying failed operations or implementing a queue
    }
  },
  
  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    try {
      return new Promise((resolve) => {
        onSnapshot(recipesCollection, (snapshot) => {
          const recipes: Recipe[] = [];
          snapshot.forEach((doc) => {
            recipes.push(doc.data() as Recipe);
          });
          resolve(recipes);
        });
      });
    } catch (error) {
      console.error("Error getting recipes:", error);
      return [];
    }
  },
  
  async updateRecipe(recipeId: string, recipeData: Partial<Recipe>) {
    try {
      const recipeRef = doc(recipesCollection, recipeId);
      await updateDoc(recipeRef, recipeData);
      console.log(`Recipe ${recipeId} updated successfully`);
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  },
  
  // App State
  async getAppState() {
    try {
      return new Promise((resolve) => {
        onSnapshot(stateDoc, (snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.data());
          } else {
            resolve({});
          }
        });
      });
    } catch (error) {
      console.error("Error getting app state:", error);
      return {};
    }
  },
  
  async updateCart(cart: CartItem[]) {
    try {
      await updateDoc(stateDoc, { cart });
      console.log("Cart updated successfully");
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  },
  
  async updateCookingQueue(cookingQueue: CookingQueue) {
    try {
      await updateDoc(stateDoc, { cookingQueue });
      console.log("Cooking queue updated successfully");
    } catch (error) {
      console.error("Error updating cooking queue:", error);
    }
  },
  
  async updateCustomization(customization: { salt: number; spice: number; water: number }) {
    try {
      await updateDoc(stateDoc, { customization });
      console.log("Customization updated successfully");
    } catch (error) {
      console.error("Error updating customization:", error);
    }
  },
  
  // Subscribe to real-time updates
  subscribeToModules(callback: (modules: Module[]) => void) {
    return onSnapshot(modulesCollection, (snapshot) => {
      const modules: Module[] = [];
      snapshot.forEach((doc) => {
        modules.push(doc.data() as Module);
      });
      callback(modules);
    });
  },
  
  subscribeToRecipes(callback: (recipes: Recipe[]) => void) {
    return onSnapshot(recipesCollection, (snapshot) => {
      const recipes: Recipe[] = [];
      snapshot.forEach((doc) => {
        recipes.push(doc.data() as Recipe);
      });
      callback(recipes);
    });
  },
  
  subscribeToAppState(callback: (state: DocumentData) => void) {
    return onSnapshot(stateDoc, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  },
  
  // Add a method to sync Zustand state to Firebase when offline connectivity is restored
  syncOfflineChanges(zustandState: any) {
    // This would be implemented with IndexedDB or similar for offline storage
    // and then sync when online status is detected
    // For simplicity, we'll just update directly for now
    if (navigator.onLine) {
      if (zustandState.modules) {
        // Update modules
        zustandState.modules.forEach((module: Module) => {
          this.updateModule(module.id, module);
        });
      }
      
      if (zustandState.cart) {
        this.updateCart(zustandState.cart);
      }
      
      // ...and so on for other state
    }
  },

  // Force update database with new module system (for development/migration)
  async forceUpdateDatabase(initialModules: Module[], initialRecipes: Recipe[]) {
    try {
      console.log("Force updating Firebase database with new 10-module system...");
      
      // Use a batch for better performance and atomicity
      const batch = writeBatch(db);
      
      // Update all modules
      initialModules.forEach(module => {
        const moduleRef = doc(modulesCollection, module.id);
        batch.set(moduleRef, module, { merge: false }); // Use merge: false to completely replace
      });
      
      // Update all recipes
      initialRecipes.forEach(recipe => {
        const recipeRef = doc(recipesCollection, recipe.id);
        batch.set(recipeRef, recipe, { merge: false }); // Use merge: false to completely replace
      });
      
      // Update app state with new customization structure
      batch.set(stateDoc, {
        cart: [],
        customization: {
          salt: 50,
          spice: 50,
          water: 50,
          oil: 50,
          temperature: 50,
          grinding: 50,
          chopping: 50,
        },
        cookingQueue: {
          items: [],
          currentItem: 0,
          status: 'idle'
        }
      }, { merge: false });
      
      // Commit all operations as a single transaction
      await batch.commit();
      console.log("Firebase database force updated successfully with 10-module system!");
      return true;
    } catch (error) {
      console.error("Error force updating database:", error);
      return false;
    }
  },
};

// Add event listeners outside of the service object
window.addEventListener('online', () => {
  console.log('Application is online. Syncing any offline changes...');
  // Implement sync logic here
});

window.addEventListener('offline', () => {
  console.log('Application is offline. Changes will be queued.');
});