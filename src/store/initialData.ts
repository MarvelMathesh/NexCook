import { Module, Recipe } from "../types";

export const initialModules: Module[] = [
  // Dispensing Modules
  {
    id: "spice-dispenser",
    name: "Spice Dispenser",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 20,
    unit: "g",
    status: "normal",
    icon: "Utensils",
    moduleType: "dispenser",
    operationMode: "batch"
  },
  {
    id: "hopper-dispenser",
    name: "Vegetable Hopper",
    currentLevel: 500,
    maxLevel: 500,
    threshold: 100,
    unit: "g",
    status: "normal",
    icon: "Soup",
    moduleType: "dispenser",
    operationMode: "batch"
  },
  {
    id: "water-dispenser",
    name: "Water Dispenser",
    currentLevel: 2000,
    maxLevel: 2000,
    threshold: 500,
    unit: "ml",
    status: "normal",
    icon: "Droplets",
    moduleType: "dispenser",
    operationMode: "continuous"
  },
  {
    id: "oil-dispenser",
    name: "Oil Dispenser",
    currentLevel: 300,
    maxLevel: 300,
    threshold: 50,
    unit: "ml",
    status: "normal",
    icon: "Droplets",
    moduleType: "dispenser",
    operationMode: "batch"
  },
  
  // Processing Modules
  {
    id: "grinding-unit",
    name: "Grinding Unit",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 10,
    unit: "%",
    status: "normal",
    icon: "CoffeeIcon",
    moduleType: "processor",
    operationMode: "timed"
  },
  {
    id: "chopping-unit",
    name: "Chopping Unit",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 10,
    unit: "%",
    status: "normal",
    icon: "Utensils",
    moduleType: "processor",
    operationMode: "timed"
  },
  
  // Heating Modules
  {
    id: "heating-element",
    name: "Heating Element",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 10,
    unit: "%",
    status: "normal",
    icon: "Flame",
    moduleType: "heater",
    operationMode: "continuous"
  },
  {
    id: "boiling-water",
    name: "Boiling Water Unit",
    currentLevel: 1000,
    maxLevel: 1000,
    threshold: 200,
    unit: "ml",
    status: "normal",
    icon: "Flame",
    moduleType: "heater",
    operationMode: "batch"
  },
  {
    id: "steaming-unit",
    name: "Steaming Unit",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 15,
    unit: "%",
    status: "normal",
    icon: "Cloud",
    moduleType: "heater",
    operationMode: "timed"
  },
  
  // Cleaning Module
  {
    id: "cleaning-system",
    name: "Cleaning System",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 20,
    unit: "%",
    status: "normal",
    icon: "Droplets",
    moduleType: "cleaner",
    operationMode: "batch"
  }
];

export const initialRecipes: Recipe[] = [
  {
    id: "tomato-soup",
    name: "Tomato Soup",
    category: "Soups",
    description: "A classic comfort food made with ripe tomatoes, aromatic herbs, and a hint of cream.",
    cookingTime: 15,    ingredients: [
      {
        id: "tomatoes",
        name: "Fresh Tomatoes",
        quantity: 200,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "chop",
            duration: 30,
            speed: 50
          }
        ]
      },
      {
        id: "water-tomato",
        name: "Water",
        quantity: 300,
        unit: "ml",
        moduleId: "water-dispenser"
      },
      {
        id: "spices-tomato",
        name: "Spice Mix (Cumin, Coriander, Black Pepper)",
        quantity: 10,
        unit: "g",
        moduleId: "spice-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "grind",
            duration: 15,
            speed: 70
          }
        ]
      },
      {
        id: "oil-tomato",
        name: "Cooking Oil",
        quantity: 15,
        unit: "ml",
        moduleId: "oil-dispenser"
      },
      {
        id: "hot-water-tomato",
        name: "Hot Water",
        quantity: 150,
        unit: "ml",
        moduleId: "boiling-water"
      },
      {
        id: "salt-tomato",
        name: "Salt",
        quantity: 5,
        unit: "g",
        moduleId: "spice-dispenser"
      }
    ],    steps: [
      "Dispensing and chopping fresh tomatoes",
      "Grinding spices to optimal texture",
      "Heating oil in the cooking chamber",
      "Sautéing chopped tomatoes with oil",
      "Adding water and bringing to boil",
      "Adding hot water for perfect consistency",
      "Steam enhancement for rich flavor development",
      "Simmering with ground spices for enhanced taste",
      "Final blending for smooth consistency",
      "System cleaning and sanitization"
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
    cookingTime: 12,    ingredients: [
      {
        id: "spinach",
        name: "Fresh Spinach",
        quantity: 150,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "chop",
            duration: 20,
            speed: 60
          }
        ]
      },
      {
        id: "water-spinach",
        name: "Water",
        quantity: 250,
        unit: "ml",
        moduleId: "water-dispenser"
      },
      {
        id: "spices-spinach",
        name: "Spice Mix (Garam Masala, Turmeric)",
        quantity: 5,
        unit: "g",
        moduleId: "spice-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "grind",
            duration: 10,
            speed: 60
          }
        ]
      },
      {
        id: "oil-spinach",
        name: "Cooking Oil",
        quantity: 10,
        unit: "ml",
        moduleId: "oil-dispenser"
      },
      {
        id: "hot-water-spinach",
        name: "Hot Water",
        quantity: 100,
        unit: "ml",
        moduleId: "boiling-water"
      },
      {
        id: "garlic-spinach",
        name: "Fresh Garlic",
        quantity: 15,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "mince",
            duration: 10,
            speed: 70
          }
        ]
      }
    ],    steps: [
      "Dispensing fresh spinach from hopper",
      "Steaming spinach to retain nutrients",
      "Chopping steamed spinach finely",
      "Dispensing and mincing fresh garlic",
      "Grinding spices for aromatic blend",
      "Heating oil for proper tempering",
      "Sautéing garlic and spices in heated oil",
      "Adding chopped spinach to the mixture",
      "Adding water and bringing to boil",
      "Adding hot water for perfect consistency",
      "Blending all ingredients smoothly",
      "Final seasoning and taste adjustment",
      "System cleaning and sanitization"
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
    cookingTime: 20,    ingredients: [
      {
        id: "turdal",
        name: "Tur Dal (Pigeon Peas)",
        quantity: 100,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "coarse_grind",
            duration: 10,
            speed: 30
          }
        ]
      },
      {
        id: "water-turdal",
        name: "Water",
        quantity: 400,
        unit: "ml",
        moduleId: "water-dispenser"
      },
      {
        id: "boiling-water-turdal",
        name: "Boiling Water",
        quantity: 100,
        unit: "ml",
        moduleId: "boiling-water"
      },
      {
        id: "spices-turdal",
        name: "Spice Mix (Turmeric, Cumin, Mustard Seeds)",
        quantity: 15,
        unit: "g",
        moduleId: "spice-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "fine_grind",
            duration: 20,
            speed: 80
          }
        ]
      },
      {
        id: "oil-turdal",
        name: "Cooking Oil",
        quantity: 20,
        unit: "ml",
        moduleId: "oil-dispenser"
      },
      {
        id: "onions-turdal",
        name: "Fresh Onions",
        quantity: 60,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "chop",
            duration: 15,
            speed: 45
          }
        ]
      },
      {
        id: "curry-leaves-turdal",
        name: "Fresh Curry Leaves",
        quantity: 10,
        unit: "g",
        moduleId: "hopper-dispenser"
      },
      {
        id: "tomato-turdal",
        name: "Fresh Tomatoes",
        quantity: 50,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "chop",
            duration: 10,
            speed: 50
          }
        ]
      }
    ],    steps: [
      "Dispensing and coarse grinding tur dal",
      "Preparing water and bringing to boil",
      "Fine grinding spices for tempering",
      "Chopping onions for flavor base",
      "Chopping fresh tomatoes",
      "Heating oil for spice tempering",
      "Adding mustard seeds and curry leaves",
      "Sautéing onions until golden brown",
      "Adding chopped tomatoes and cooking",
      "Adding ground spices to the mixture",
      "Adding coarse ground dal with water",
      "Cooking lentils to perfect tenderness",
      "Steam finishing for enhanced texture",
      "Final seasoning and taste adjustment",
      "System deep cleaning and sanitization"
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
    cookingTime: 18,    ingredients: [
      {
        id: "masoordal",
        name: "Masoor Dal (Red Lentils)",
        quantity: 100,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "light_grind",
            duration: 5,
            speed: 40
          }
        ]
      },
      {
        id: "water-masoordal",
        name: "Water",
        quantity: 350,
        unit: "ml",
        moduleId: "water-dispenser"
      },
      {
        id: "boiling-water-masoordal",
        name: "Boiling Water",
        quantity: 150,
        unit: "ml",
        moduleId: "boiling-water"
      },
      {
        id: "spices-masoordal",
        name: "Spice Mix (Turmeric, Red Chili, Coriander)",
        quantity: 12,
        unit: "g",
        moduleId: "spice-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "medium_grind",
            duration: 15,
            speed: 65
          }
        ]
      },
      {
        id: "oil-masoordal",
        name: "Cooking Oil",
        quantity: 18,
        unit: "ml",
        moduleId: "oil-dispenser"
      },
      {
        id: "onions-masoordal",
        name: "Onions",
        quantity: 75,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "chop",
            duration: 25,
            speed: 55
          }
        ]
      },
      {
        id: "ginger-garlic-masoordal",
        name: "Ginger-Garlic Paste",
        quantity: 20,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "grinding-unit",
            operation: "paste",
            duration: 30,
            speed: 90
          }
        ]
      },
      {
        id: "green-chilies-masoordal",
        name: "Green Chilies",
        quantity: 15,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "slit",
            duration: 5,
            speed: 30
          }
        ]
      },
      {
        id: "cilantro-masoordal",
        name: "Fresh Cilantro",
        quantity: 20,
        unit: "g",
        moduleId: "hopper-dispenser",
        processingSteps: [
          {
            moduleId: "chopping-unit",
            operation: "chop",
            duration: 10,
            speed: 40
          }
        ]
      }
    ],    steps: [
      "Dispensing and light grinding masoor dal",
      "Preparing water for dal cooking",
      "Medium grinding spices for flavor",
      "Chopping onions for tempering base",
      "Making ginger-garlic paste",
      "Slitting green chilies carefully",
      "Chopping fresh cilantro for garnish",
      "Heating oil for aromatic tempering",
      "Adding ground dal to boiling water",
      "Cooking lentils to perfect consistency",
      "Preparing tempering with onions and spices",
      "Adding ginger-garlic paste to tempering",
      "Adding ground spices and green chilies",
      "Combining tempering with cooked dal",
      "Steam finishing for enhanced flavor",
      "Final garnish with fresh cilantro",
      "Complete system washing and cleaning"
    ],imageUrl: "/assets/images/masoor-dal.jpg",
    rating: 4.4,
    timesCooked: 112
  }
];