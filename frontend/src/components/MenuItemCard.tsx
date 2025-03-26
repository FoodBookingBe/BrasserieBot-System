'use client';
import { useState } from 'react';
import Image from 'next/image';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
};

export default function MenuItemCard({ item, onAdd }: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
      {item.imageUrl && (
        <div className="relative w-full h-40">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{item.name}</h3>
          <span className="font-semibold">€{item.price.toFixed(2)}</span>
        </div>
        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
        
        <div className="flex items-center mt-4">
          <div className="flex items-center border rounded-md">
            <button 
              className="px-3 py-1"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="px-3 py-1">{quantity}</span>
            <button 
              className="px-3 py-1"
              onClick={() => setQuantity(q => q + 1)}
            >
              +
            </button>
          </div>
          <button 
            className="ml-4 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition"
            onClick={() => {
              for (let i = 0; i < quantity; i++) {
                onAdd(item);
              }
            }}
          >
            Toevoegen
          </button>
        </div>
      </div>
    </div>
  );
}