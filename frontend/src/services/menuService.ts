import type { MenuItem } from '@/components/MenuItemCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    if (!response.ok) {
      throw new Error('Failed to fetch menu items');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
}

export async function placeOrder(items: {id: string, quantity: number}[]): Promise<{success: boolean}> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}