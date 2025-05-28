import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';
import { useAppStore } from '../store/appStore';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { selectRecipe } = useAppStore(); // Still maintain state for selected recipe

  return {
    goToHome: () => navigate('/'),
    goToRecipes: () => navigate('/recipes'),
    goToRecipeDetails: (recipeId: string) => {
      navigate(`/recipe/${recipeId}`);
    },
    goToCustomize: (recipeId: string) => {
      navigate(`/customize/${recipeId}`);
    },
    goToCooking: () => navigate('/cooking'),
    goToRating: () => navigate('/rating'),
    goToCart: () => navigate('/cart'),
    handleRecipeSelect: (recipe: Recipe | null) => {
      if (recipe) {
        selectRecipe(recipe); // Update state
        navigate(`/recipe/${recipe.id}`);
      }
    }
  };
};
