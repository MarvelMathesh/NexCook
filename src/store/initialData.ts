import { Module, Recipe } from "../types";
import { CoffeeIcon, Droplets, Flame, Soup, Utensils } from "lucide-react";

export const initialModules: Module[] = [
  {
    id: "water",
    name: "Water Dispenser",
    currentLevel: 2000,
    maxLevel: 2000,
    threshold: 500,
    unit: "ml",
    status: "normal",
    icon: "Droplets"
  },
  {
    id: "spice",
    name: "Spice Dispenser",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 20,
    unit: "g",
    status: "normal",
    icon: "Utensils"
  },
  {
    id: "ingredients",
    name: "Solid Ingredient Hopper",
    currentLevel: 500,
    maxLevel: 500,
    threshold: 100,
    unit: "g",
    status: "normal",
    icon: "Soup"
  },
  {
    id: "mixer",
    name: "Blender/Mixer",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 10,
    unit: "%",
    status: "normal",
    icon: "CoffeeIcon"
  },
  {
    id: "cooktop",
    name: "Cooktop",
    currentLevel: 100,
    maxLevel: 100,
    threshold: 10,
    unit: "%",
    status: "normal",
    icon: "Flame"
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
        moduleId: "ingredients"
      },
      {
        id: "water-tomato",
        name: "Water",
        quantity: 300,
        unit: "ml",
        moduleId: "water"
      },
      {
        id: "spices-tomato",
        name: "Spice Mix",
        quantity: 10,
        unit: "g",
        moduleId: "spice"
      }
    ],
    steps: [
      "Heating water to optimal temperature",
      "Adding tomatoes and spices",
      "Blending ingredients to perfect consistency",
      "Simmering the soup for enhanced flavor",
      "Final seasoning adjustments"
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
        moduleId: "ingredients"
      },
      {
        id: "water-spinach",
        name: "Water",
        quantity: 250,
        unit: "ml",
        moduleId: "water"
      },
      {
        id: "spices-spinach",
        name: "Spice Mix",
        quantity: 5,
        unit: "g",
        moduleId: "spice"
      }
    ],
    steps: [
      "Heating water to optimal temperature",
      "Adding spinach and spices",
      "Blending ingredients to smooth consistency",
      "Simmering for enhanced flavor",
      "Final seasoning adjustments"
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
        moduleId: "ingredients"
      },
      {
        id: "water-turdal",
        name: "Water",
        quantity: 400,
        unit: "ml",
        moduleId: "water"
      },
      {
        id: "spices-turdal",
        name: "Spice Mix",
        quantity: 15,
        unit: "g",
        moduleId: "spice"
      }
    ],
    steps: [
      "Heating water to optimal temperature",
      "Adding pre-soaked lentils and spices",
      "Cooking lentils to perfect tenderness",
      "Simmering for enhanced flavor",
      "Final seasoning and tempering"
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
        moduleId: "ingredients"
      },
      {
        id: "water-masoordal",
        name: "Water",
        quantity: 350,
        unit: "ml",
        moduleId: "water"
      },
      {
        id: "spices-masoordal",
        name: "Spice Mix",
        quantity: 12,
        unit: "g",
        moduleId: "spice"
      }
    ],
    steps: [
      "Heating water to optimal temperature",
      "Adding pre-soaked lentils and spices",
      "Cooking lentils to perfect tenderness",
      "Simmering for enhanced flavor",
      "Final seasoning and tempering"
    ],
    imageUrl: "/assets/images/masoor-dal.jpg",
    rating: 4.4,
    timesCooked: 112
  }
];