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
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
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

// Collection references
const modulesCollection = collection(db, "modules");
const recipesCollection = collection(db, "recipes");
const userCollection = collection(db, "users");
const stateDoc = doc(userCollection, "appState");
const cookingHistoryCollection = collection(db, "cookingHistory");

// Add a debounce utility to prevent too many writes
const debounce = (func: Function, timeout = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
};

// Firebase Data Service with improved real-time sync
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
          batch.set(moduleRef, {
            ...module,
            lastUpdated: serverTimestamp(),
          });
        });
        
        // Create initial recipes collection
        initialRecipes.forEach(recipe => {
          const recipeRef = doc(recipesCollection, recipe.id);
          batch.set(recipeRef, {
            ...recipe,
            lastUpdated: serverTimestamp(),
          });
        });
        
        // Create initial app state
        batch.set(stateDoc, {
          cart: [],
          customization: {
            salt: 50,
            spice: 50,
            water: 50,
          },
          cookingQueue: {
            items: [],
            currentItem: 0,
            status: 'idle'
          },
          lastUpdated: serverTimestamp(),
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
  
  // Enhanced Modules Methods
  async getModules(): Promise<Module[]> {
    try {
      // Get all documents from modules collection
      const snapshot = await getDocs(modulesCollection);
      const modules: Module[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Remove Firestore timestamp from the returned data
        const { lastUpdated, ...moduleData } = data;
        modules.push(moduleData as Module);
      });
      
      console.log(`Firebase: Retrieved ${modules.length} modules`);
      return modules;
    } catch (error) {
      console.error("Error getting modules:", error);
      return [];
    }
  },
  
  // Update module with debounce to prevent excessive writes
  updateModule: debounce(async (moduleId: string, moduleData: Partial<Module>) => {
    try {
      const moduleRef = doc(modulesCollection, moduleId);
      await updateDoc(moduleRef, {
        ...moduleData,
        lastUpdated: serverTimestamp(),
      });
      console.log(`Module ${moduleId} updated successfully`);
    } catch (error) {
      console.error("Error updating module:", error);
    }
  }, 300), // Reduced debounce time for more responsive updates
  
  // Add batch update for multiple modules
  async updateModulesBatch(updates: {id: string, data: Partial<Module>}[]) {
    try {
      if (updates.length === 0) return;
      
      const batch = writeBatch(db);
      
      updates.forEach(update => {
        const moduleRef = doc(modulesCollection, update.id);
        batch.update(moduleRef, {
          ...update.data,
          lastUpdated: serverTimestamp(),
        });
      });
      
      await batch.commit();
      console.log(`Batch updated ${updates.length} modules successfully`);
    } catch (error) {
      console.error("Error batch updating modules:", error);
      // Add more robust error handling
      // Consider retrying failed operations or implementing a queue
    }
  },
  
  // Force reinitialize modules - useful when module definitions change
  async forceReinitializeModules(initialModules: Module[]) {
    try {
      console.log("Force reinitializing Firebase modules with complete set...");
      
      // Use a batch for better performance and atomicity
      const batch = writeBatch(db);
      
      // Update all modules in Firebase
      initialModules.forEach(module => {
        const moduleRef = doc(modulesCollection, module.id);
        batch.set(moduleRef, {
          ...module,
          lastUpdated: serverTimestamp(),
        });
      });
      
      // Commit all operations as a single transaction
      await batch.commit();
      console.log(`Successfully reinitialized ${initialModules.length} modules in Firebase`);
    } catch (error) {
      console.error("Error reinitializing modules:", error);
    }
  },
  
  // Enhanced Recipes Methods with search capabilities
  async getRecipes(): Promise<Recipe[]> {
    try {
      // Create a query that orders recipes by name
      const recipesQuery = query(recipesCollection, orderBy("name"));
      
      return new Promise((resolve) => {
        onSnapshot(recipesQuery, (snapshot) => {
          const recipes: Recipe[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Remove Firestore timestamp from the returned data
            const { lastUpdated, ...recipeData } = data;
            recipes.push(recipeData as Recipe);
          });
          resolve(recipes);
        });
      });
    } catch (error) {
      console.error("Error getting recipes:", error);
      return [];
    }
  },
  
  // Get a single recipe with real-time updates
  getRecipeWithRealTimeUpdates(
    recipeId: string,
    onSuccess: (recipe: Recipe) => void,
    onError: (error: string) => void
  ) {
    try {
      // Get document reference for the specific recipe
      const recipeRef = doc(recipesCollection, recipeId);
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(recipeRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const recipeData = docSnap.data() as Recipe;
            onSuccess({ ...recipeData, id: docSnap.id });
          } else {
            onError("Recipe not found");
          }
        },
        (error) => {
          console.error("Error fetching recipe:", error);
          onError("Failed to load recipe data");
        }
      );
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up recipe listener:", error);
      onError("Failed to set up recipe listener");
      // Return empty function as fallback
      return () => {};
    }
  },
  
  // Search recipes by name, category, or ingredients
  async searchRecipes(searchTerm: string): Promise<Recipe[]> {
    try {
      // Get all recipes first (in a real app, this would use Firebase's full-text search capabilities)
      const recipesSnapshot = await getDocs(recipesCollection);
      const recipes: Recipe[] = [];
      
      recipesSnapshot.forEach((doc) => {
        const data = doc.data();
        // Remove Firestore timestamp from the returned data
        const { lastUpdated, ...recipeData } = data;
        recipes.push(recipeData as Recipe);
      });
      
      // Filter recipes based on search term
      if (!searchTerm) return recipes;
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(lowerSearchTerm) ||
        recipe.category.toLowerCase().includes(lowerSearchTerm) ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(lowerSearchTerm)
        )
      );
    } catch (error) {
      console.error("Error searching recipes:", error);
      return [];
    }
  },
  
  async updateRecipe(recipeId: string, recipeData: Partial<Recipe>) {
    try {
      const recipeRef = doc(recipesCollection, recipeId);
      await updateDoc(recipeRef, {
        ...recipeData,
        lastUpdated: serverTimestamp(),
      });
      console.log(`Recipe ${recipeId} updated successfully`);
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  },
  
  // Enhanced App State
  async getAppState() {
    try {
      return new Promise((resolve) => {
        onSnapshot(stateDoc, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            // Remove Firestore timestamp from the returned data
            const { lastUpdated, ...stateData } = data;
            resolve(stateData);
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
      await updateDoc(stateDoc, { 
        cart,
        lastUpdated: serverTimestamp(),
      });
      console.log("Cart updated successfully");
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  },
  
  async updateCookingQueue(cookingQueue: CookingQueue) {
    try {
      await updateDoc(stateDoc, { 
        cookingQueue,
        lastUpdated: serverTimestamp(),
      });
      console.log("Cooking queue updated successfully");
    } catch (error) {
      console.error("Error updating cooking queue:", error);
    }
  },
  
  async updateCustomization(customization: { salt: number; spice: number; water: number }) {
    try {
      await updateDoc(stateDoc, { 
        customization,
        lastUpdated: serverTimestamp(),
      });
      console.log("Customization updated successfully");
    } catch (error) {
      console.error("Error updating customization:", error);
    }
  },
  
  // Cooking History Methods
  async addCookingHistory(recipeId: string, customization: any, rating: number) {
    try {
      await addDoc(cookingHistoryCollection, {
        recipeId,
        customization,
        rating,
        timestamp: serverTimestamp(),
      });
      console.log("Cooking history added successfully");
    } catch (error) {
      console.error("Error adding cooking history:", error);
    }
  },
  
  async getCookingHistory(limit = 10) {
    try {
      const historyQuery = query(
        cookingHistoryCollection, 
        orderBy("timestamp", "desc"), 
        limit(limit)
      );
      
      const snapshot = await getDocs(historyQuery);
      const history: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
        });
      });
      
      return history;
    } catch (error) {
      console.error("Error getting cooking history:", error);
      return [];
    }
  },
  
  // Real-time Subscription Methods
  subscribeToModules(callback: (modules: Module[]) => void) {
    const modulesQuery = query(modulesCollection, orderBy("name"));
    
    return onSnapshot(modulesQuery, (snapshot) => {
      const modules: Module[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Remove Firestore timestamp from the returned data
        const { lastUpdated, ...moduleData } = data;
        modules.push(moduleData as Module);
      });
      callback(modules);
    });
  },
  
  subscribeToRecipes(callback: (recipes: Recipe[]) => void) {
    const recipesQuery = query(recipesCollection, orderBy("name"));
    
    return onSnapshot(recipesQuery, (snapshot) => {
      const recipes: Recipe[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Remove Firestore timestamp from the returned data
        const { lastUpdated, ...recipeData } = data;
        recipes.push(recipeData as Recipe);
      });
      callback(recipes);
    });
  },
  
  subscribeToAppState(callback: (state: DocumentData) => void) {
    return onSnapshot(stateDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Remove Firestore timestamp from the returned data
        const { lastUpdated, ...stateData } = data;
        callback(stateData);
      }
    });
  },
  
  // Offline Data Handling
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
  
  // System status check
  async checkSystemStatus() {
    try {
      // Ping Firestore to check connectivity
      const testDoc = doc(db, "system", "status");
      await getDoc(testDoc);
      return { online: true, message: "Connected to Firebase" };
    } catch (error) {
      return { online: false, message: "Unable to connect to Firebase" };
    }
  }
};

// Add event listeners outside of the service object
window.addEventListener('online', () => {
  console.log('Application is online. Syncing any offline changes...');
  // Implement sync logic here
});

window.addEventListener('offline', () => {
  console.log('Application is offline. Changes will be queued.');
});