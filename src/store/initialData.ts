import { Module, Recipe } from "../types";

export const initialModules: Module[] = [
  // Liquid Dispensing Systems
  {
    id: "water-dispense",
    name: "Water Dispense Module",
    currentLevel: 2000,
    maxLevel: 2000,
    threshold: 500,
    unit: "ml",
    status: "normal",
    icon: "Droplets"
  },
  {
    id: "oil-dispense",
    name: "Oil Dispense Module",
    currentLevel: 500,
    maxLevel: 500,
    threshold: 100,
    unit: "ml",
    status: "normal",
    icon: "Droplets"
  },
  {
    id: "boiling-water",
    name: "Boiling Water Module",
    currentLevel: 1500,
    maxLevel: 1500,
    threshold: 300,
    unit: "ml",
    status: "normal",
    icon: "Flame"
  },

  // Solid Ingredient Systems
  {
    id: "spice-dispense",
    name: "Spice Dispense Module",
    currentLevel: 200,
    maxLevel: 200,
    threshold: 40,
    unit: "g",
    status: "normal",
    icon: "Utensils"
  },
  {
    id: "hopper-dispense",
    name: "Hopper Dispense Module",
    currentLevel: 1000,
    maxLevel: 1000,
    threshold: 200,
    unit: "g",
    status: "normal",
    icon: "Soup"
  },
  // Processing Modules
  {
    id: "grinding",
    name: "Grinding Module",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 15,
    unit: "%",
    status: "normal",
    icon: "CoffeeIcon"
  },
  {
    id: "chopping",
    name: "Chopping Module",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 15,
    unit: "%",
    status: "normal",
    icon: "Scissors"
  },
  {
    id: "stirring",
    name: "Stirring Operation Module",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 10,
    unit: "%",
    status: "normal",
    icon: "Wind"
  },
  // Thermal Processing
  {
    id: "heating",
    name: "Heating Module",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 20,
    unit: "%",
    status: "normal",
    icon: "Thermometer"
  },
  {
    id: "steaming",
    name: "Steaming Vegetable Module",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 15,
    unit: "%",
    status: "normal",
    icon: "Sparkles"
  },

  // Maintenance Module
  {
    id: "cleaning",
    name: "Cleaning Operation Module",
    currentLevel: 100,
    maxLevel: 100,    threshold: 25,
    unit: "%",
    status: "normal",
    icon: "Shield"
  }
];

export const initialRecipes: Recipe[] = [
  {
    id: "tomato-soup",
    name: "Tomato Soup",
    category: "Soups",
    description: "A classic comfort food made with ripe tomatoes, aromatic herbs, and a hint of cream.",
    cookingTime: 15,
    ingredients: [
      {
        id: "tomatoes",
        name: "Fresh Tomatoes",
        quantity: 200,
        unit: "g",
        moduleId: "hopper-dispense"
      },
      {
        id: "water-tomato",
        name: "Hot Water",
        quantity: 300,
        unit: "ml",
        moduleId: "boiling-water"
      },
      {
        id: "spices-tomato",
        name: "Spice Mix",
        quantity: 10,
        unit: "g",
        moduleId: "spice-dispense"
      },
      {
        id: "oil-tomato",
        name: "Cooking Oil",
        quantity: 15,
        unit: "ml",
        moduleId: "oil-dispense"
      }
    ],
    steps: [
      "Activating boiling water module for optimal temperature",
      "Dispensing fresh tomatoes from hopper module",
      "Chopping tomatoes using precision chopping module",
      "Heating oil in cooking chamber using heating module",
      "Adding spices through automated spice dispense system",
      "Stirring ingredients using intelligent stirring operation",
      "Grinding spices for enhanced flavor release",
      "Steaming vegetables for perfect texture",
      "Final temperature control and consistency check",
      "Cleaning operation initiated for next recipe"
    ],
    imageUrl: "/assets/images/tomato-soup.jpg",
    rating: 4.5,
    timesCooked: 128
  },
  {
    id: "spinach-soup",
    name: "Spinach Soup",
    category: "Soups",
    description: "A nutrient-rich soup packed with fresh spinach, light cream, and aromatic spices.",
    cookingTime: 12,
    ingredients: [
      {
        id: "spinach",
        name: "Fresh Spinach",
        quantity: 150,
        unit: "g",
        moduleId: "hopper-dispense"
      },
      {
        id: "water-spinach",
        name: "Water",
        quantity: 250,
        unit: "ml",
        moduleId: "water-dispense"
      },
      {
        id: "spices-spinach",
        name: "Spice Mix",
        quantity: 5,
        unit: "g",
        moduleId: "spice-dispense"
      },
      {
        id: "oil-spinach",
        name: "Olive Oil",
        quantity: 12,
        unit: "ml",
        moduleId: "oil-dispense"
      }
    ],
    steps: [
      "Dispensing fresh spinach from hopper module",
      "Chopping spinach leaves using precision chopping module",
      "Activating water dispense for cooking liquid",
      "Heating oil using controlled heating module",
      "Grinding spices for aromatic base",
      "Steaming spinach for optimal nutrition retention",
      "Stirring operation for perfect consistency",
      "Final heating adjustment for serving temperature",
      "System cleaning operation for hygiene maintenance"
    ],
    imageUrl: "/assets/images/spinach-soup.jpg",
    rating: 4.2,
    timesCooked: 85
  },
  {
    id: "tur-dal",
    name: "Tur Dal",
    category: "Lentil Recipes",
    description: "A hearty lentil preparation with aromatic spices and a rich texture.",
    cookingTime: 20,
    ingredients: [
      {
        id: "turdal",
        name: "Tur Dal",
        quantity: 100,
        unit: "g",
        moduleId: "hopper-dispense"
      },
      {
        id: "water-turdal",
        name: "Boiling Water",
        quantity: 400,
        unit: "ml",
        moduleId: "boiling-water"
      },
      {
        id: "spices-turdal",
        name: "Spice Mix",
        quantity: 15,
        unit: "g",
        moduleId: "spice-dispense"
      },
      {
        id: "oil-turdal",
        name: "Ghee/Oil",
        quantity: 20,
        unit: "ml",
        moduleId: "oil-dispense"
      }
    ],
    steps: [
      "Dispensing pre-soaked tur dal from hopper module",
      "Activating boiling water module for cooking",
      "Grinding spices for enhanced flavor profile",
      "Heating oil using precision heating module",
      "Adding spices through automated spice dispense",
      "Steaming dal for perfect tenderness",
      "Stirring operation for consistent cooking",
      "Chopping garnish ingredients for presentation",
      "Final heating and temperature stabilization",
      "Automated cleaning cycle for module maintenance"
    ],
    imageUrl: "/assets/images/tur-dal.jpg",
    rating: 4.7,
    timesCooked: 156
  },
  {
    id: "masoor-dal",
    name: "Masoor Dal",
    category: "Lentil Recipes",
    description: "A simple yet flavorful red lentil preparation with a blend of spices.",
    cookingTime: 18,
    ingredients: [
      {
        id: "masoordal",
        name: "Masoor Dal",
        quantity: 100,
        unit: "g",
        moduleId: "hopper-dispense"
      },
      {
        id: "water-masoordal",
        name: "Water",
        quantity: 350,
        unit: "ml",
        moduleId: "water-dispense"
      },
      {
        id: "spices-masoordal",
        name: "Spice Mix",
        quantity: 12,
        unit: "g",
        moduleId: "spice-dispense"
      },
      {
        id: "oil-masoordal",
        name: "Cooking Oil",
        quantity: 18,
        unit: "ml",
        moduleId: "oil-dispense"
      }
    ],
    steps: [
      "Dispensing masoor dal from automated hopper module",
      "Water dispense activation for cooking medium",
      "Grinding spices using precision grinding module",
      "Heating oil in cooking chamber",
      "Adding ground spices through spice dispense system",
      "Steaming lentils for optimal texture",
      "Stirring operation for even cooking distribution",
      "Chopping fresh herbs for garnish preparation",
      "Final heating phase for serving readiness",
      "Comprehensive cleaning operation cycle"
    ],
    imageUrl: "/assets/images/masoor-dal.jpg",
    rating: 4.4,
    timesCooked: 112
  }
];