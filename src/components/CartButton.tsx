import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';

export function CartButton() {
  const { cart, navigateToScreen } = useAppStore();
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems === 0) {
    return null;
  }

  const handleCartClick = () => {
    navigate('/cart');
    navigateToScreen('cart');
  };

  return (
    <button
      onClick={handleCartClick}
      className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      </div>
    </button>
  );
}