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
  connectFirestoreEmulator,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { Module, Recipe } from "../types";

/**
 * FirebaseService - Manages real-time Firebase sync
 * Handles all Firebase operations with proper error handling and typing
 */
export class FirebaseService {
  private static instance: FirebaseService;
  private db: any;
  private analytics: any;
  private isInitialized: boolean = false;
  
  // Collection references
  private modulesCollection: any;
  private recipesCollection: any;
  private userCollection: any;
  private stateDoc: any;
  
  // Unsubscribe functions for real-time listeners
  private unsubscribeFunctions: (() => void)[] = [];
  
  // Debounce utility to prevent too many writes
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_DELAY = 300;

  private constructor() {}

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase with configuration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
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
      this.analytics = getAnalytics(app);
      this.db = getFirestore(app);

      // Connect to emulator in development (only if explicitly enabled)
      if (import.meta.env.DEV && 
          window.location.hostname === "localhost" && 
          import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
        try {
          connectFirestoreEmulator(this.db, 'localhost', 8080);
          console.log('Connected to Firestore emulator');
        } catch (error) {
          // Emulator connection failed, continue with production
          console.warn('Failed to connect to Firestore emulator, using production:', error);
        }
      }

      // Initialize collection references
      this.modulesCollection = collection(this.db, "modules");
      this.recipesCollection = collection(this.db, "recipes");
      this.userCollection = collection(this.db, "users");
      this.stateDoc = doc(this.userCollection, "appState");

      this.isInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  /**
   * Initialize database with default data if it doesn't exist
   */
  public async initializeDatabase(initialModules: Module[], initialRecipes: Recipe[]): Promise<void> {
    await this.initialize();
    
    try {
      // Check if data already exists
      const stateSnapshot = await getDoc(this.stateDoc);
      
      if (!stateSnapshot.exists()) {
        console.log("Initializing Firebase database with default data...");
        
        // Use a batch for better performance and atomicity
        const batch = writeBatch(this.db);
        
        // Create initial modules collection
        initialModules.forEach(module => {
          const moduleRef = doc(this.modulesCollection, module.id);
          batch.set(moduleRef, module);
        });
        
        // Create initial recipes collection
        initialRecipes.forEach(recipe => {
          const recipeRef = doc(this.recipesCollection, recipe.id);
          batch.set(recipeRef, recipe);
        });
        
        // Create initial app state
        batch.set(this.stateDoc, {
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
          },
          lastUpdated: new Date().toISOString()
        });
        
        // Commit all operations as a single transaction
        await batch.commit();
        console.log("Firebase database initialized successfully");
      } else {
        console.log("Firebase database already exists, skipping initialization");
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Get all modules
   */
  public async getModules(): Promise<Module[]> {
    try {
      await this.initialize();
      
      const querySnapshot = await getDocs(query(this.modulesCollection, orderBy('name')));
      const modules: Module[] = [];
      
      querySnapshot.forEach((doc) => {
        modules.push({ id: doc.id, ...doc.data() } as Module);
      });
      
      return modules;
    } catch (error) {
      console.warn('Firebase modules unavailable, using local data:', error);
      return [];
    }
  }

  /**
   * Get all recipes
   */
  public async getRecipes(): Promise<Recipe[]> {
    try {
      await this.initialize();
      
      const querySnapshot = await getDocs(query(this.recipesCollection, orderBy('name')));
      const recipes: Recipe[] = [];
      
      querySnapshot.forEach((doc) => {
        recipes.push({ id: doc.id, ...doc.data() } as Recipe);
      });
      
      return recipes;
    } catch (error) {
      console.warn('Firebase recipes unavailable, using local data:', error);
      return [];
    }
  }

  /**
   * Get app state
   */
  public async getAppState(): Promise<any> {
    await this.initialize();
    
    try {
      const stateSnapshot = await getDoc(this.stateDoc);
      return stateSnapshot.exists() ? stateSnapshot.data() : null;
    } catch (error) {
      console.error('Failed to get app state:', error);
      return null;
    }
  }

  /**
   * Update a single module
   */
  public async updateModule(module: Module): Promise<void> {
    await this.initialize();
    
    try {
      const moduleRef = doc(this.modulesCollection, module.id);
      await updateDoc(moduleRef, {
        ...module,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update module ${module.id}:`, error);
      throw error;
    }
  }

  /**
   * Update multiple modules in batch
   */
  public async updateModules(modules: Module[]): Promise<void> {
    await this.initialize();
    
    try {
      const batch = writeBatch(this.db);
      
      modules.forEach(module => {
        const moduleRef = doc(this.modulesCollection, module.id);
        batch.update(moduleRef, {
          ...module,
          lastUpdated: new Date().toISOString()
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Failed to update modules:', error);
      throw error;
    }
  }

  /**
   * Update a single recipe
   */
  public async updateRecipe(recipe: Recipe): Promise<void> {
    await this.initialize();
    
    try {
      const recipeRef = doc(this.recipesCollection, recipe.id);
      await updateDoc(recipeRef, {
        ...recipe,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update recipe ${recipe.id}:`, error);
      throw error;
    }
  }

  /**
   * Update app state with debouncing
   */
  public updateAppState(state: any): void {
    const key = 'appState';
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }
    
    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await this.initialize();
        await updateDoc(this.stateDoc, {
          ...state,
          lastUpdated: new Date().toISOString()
        });
        this.debounceTimers.delete(key);
      } catch (error) {
        console.error('Failed to update app state:', error);
      }
    }, this.DEBOUNCE_DELAY);
    
    this.debounceTimers.set(key, timer);
  }

  /**
   * Subscribe to modules changes
   */
  public subscribeToModules(callback: (modules: Module[]) => void): () => void {
    if (!this.isInitialized) {
      console.warn('Firebase not initialized, cannot subscribe to modules');
      return () => {};
    }
    
    const unsubscribe = onSnapshot(
      query(this.modulesCollection, orderBy('name')),
      (querySnapshot) => {
        const modules: Module[] = [];
        querySnapshot.forEach((doc) => {
          modules.push({ id: doc.id, ...doc.data() } as Module);
        });
        callback(modules);
      },
      (error) => {
        console.error('Error in modules subscription:', error);
      }
    );
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to recipes changes
   */
  public subscribeToRecipes(callback: (recipes: Recipe[]) => void): () => void {
    if (!this.isInitialized) {
      console.warn('Firebase not initialized, cannot subscribe to recipes');
      return () => {};
    }
    
    const unsubscribe = onSnapshot(
      query(this.recipesCollection, orderBy('name')),
      (querySnapshot) => {
        const recipes: Recipe[] = [];
        querySnapshot.forEach((doc) => {
          recipes.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        callback(recipes);
      },
      (error) => {
        console.error('Error in recipes subscription:', error);
      }
    );
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to app state changes
   */
  public subscribeToAppState(callback: (state: any) => void): () => void {
    if (!this.isInitialized) {
      console.warn('Firebase not initialized, cannot subscribe to app state');
      return () => {};
    }
    
    const unsubscribe = onSnapshot(
      this.stateDoc,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      },
      (error) => {
        console.error('Error in app state subscription:', error);
      }
    );
    
    this.unsubscribeFunctions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Check connection status
   */
  public isConnected(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup all subscriptions and resources
   */
  public destroy(): void {
    // Unsubscribe from all real-time listeners
    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
    
    // Clear all debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    this.isInitialized = false;
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();