'use client';
import { useState, useEffect } from 'react';
import MenuItemCard from '@/components/MenuItemCard';
import { fetchMenuItems, placeOrder } from '@/services/menuService';
import type { MenuItem } from '@/components/MenuItemCard';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{item: MenuItem, quantity: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await fetchMenuItems();
        setMenuItems(items);
      } catch (err) {
        setError('Kon menu niet laden. Probeer het later opnieuw.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenu();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.item.id === item.id 
            ? {...i, quantity: i.quantity + 1} 
            : i
        );
      }
      return [...prev, {item, quantity: 1}];
    });
  };

  const handlePlaceOrder = async () => {
    try {
      const orderItems = cart.map(({item, quantity}) => ({
        id: item.id,
        quantity
      }));
      await placeOrder(orderItems);
      alert('Bestelling succesvol geplaatst!');
      setCart([]);
    } catch (err) {
      alert('Bestelling plaatsen mislukt. Probeer opnieuw.');
      console.error(err);
    }
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.item.price * item.quantity), 
    0
  );

  if (isLoading) return <div className="p-6 text-center">Menu laden...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Menu</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {menuItems.map(item => (
          <MenuItemCard 
            key={item.id} 
            item={item} 
            onAdd={addToCart}
          />
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <h2 className="font-bold text-lg mb-2">Jouw Bestelling</h2>
          <div className="max-h-40 overflow-y-auto mb-2">
            {cart.map(({item, quantity}) => (
              <div key={item.id} className="flex justify-between py-1">
                <span>
                  {quantity}x {item.name}
                </span>
                <span>€{(item.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Totaal:</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="w-full mt-4 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            onClick={handlePlaceOrder}
          >
            Bestelling Plaatsen
          </button>
        </div>
      )}
    </div>
  );
}