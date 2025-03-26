'use client';
import { useState } from 'react';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('new');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bestellingen Beheer</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'new' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          Nieuwe Bestellingen
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'preparing' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('preparing')}
        >
          In Bereiding
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Voltooide Bestellingen
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {activeTab === 'new' && <NewOrders />}
        {activeTab === 'preparing' && <PreparingOrders />}
        {activeTab === 'completed' && <CompletedOrders />}
      </div>
    </div>
  );
}

function NewOrders() {
  return <div>Nieuwe bestellingen lijst</div>;
}

function PreparingOrders() {
  return <div>Bestellingen in bereiding</div>;
}

function CompletedOrders() {
  return <div>Voltooide bestellingen</div>;
}