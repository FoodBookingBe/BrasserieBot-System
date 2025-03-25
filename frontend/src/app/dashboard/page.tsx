'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Dashboard components
const Sidebar = () => {
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center mb-8">
        <span className="text-2xl font-bold">BrasserieBot</span>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="flex items-center p-2 rounded-md bg-blue-700 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/restaurants" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Restaurants
            </Link>
          </li>
          <li>
            <Link href="/dashboard/menus" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Menus
            </Link>
          </li>
          <li>
            <Link href="/dashboard/orders" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Orders
            </Link>
          </li>
          <li>
            <Link href="/dashboard/suppliers" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Suppliers
            </Link>
          </li>
          <li>
            <Link href="/dashboard/payments" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Payments
            </Link>
          </li>
          <li>
            <Link href="/dashboard/ai-advisor" className="flex items-center p-2 rounded-md hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Advisor
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="mt-auto pt-8">
        <Link href="/dashboard/settings" className="flex items-center p-2 rounded-md hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
        <button className="flex items-center p-2 rounded-md hover:bg-gray-700 w-full mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
  return (
    <header className="bg-white shadow-sm px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <span className="ml-2 text-gray-700">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Dashboard page
export default function Dashboard() {
  // Mock data for dashboard
  const stats = [
    { label: 'Total Revenue', value: '€24,345', change: '+12.5%', positive: true },
    { label: 'Orders', value: '356', change: '+8.2%', positive: true },
    { label: 'Customers', value: '189', change: '+5.7%', positive: true },
    { label: 'Avg. Order Value', value: '€68.38', change: '-2.3%', positive: false },
  ];
  
  const recentOrders = [
    { id: 'ORD-001', customer: 'Alice Johnson', total: '€78.50', status: 'Completed', date: '2025-03-24' },
    { id: 'ORD-002', customer: 'Bob Smith', total: '€124.00', status: 'Preparing', date: '2025-03-24' },
    { id: 'ORD-003', customer: 'Carol Williams', total: '€45.75', status: 'Pending', date: '2025-03-23' },
    { id: 'ORD-004', customer: 'David Brown', total: '€92.30', status: 'Completed', date: '2025-03-23' },
    { id: 'ORD-005', customer: 'Eva Davis', total: '€56.20', status: 'Delivered', date: '2025-03-22' },
  ];
  
  const aiInsights = [
    'Your lunch menu is performing 15% better than dinner. Consider expanding lunch options.',
    'Supplier payments for produce are 8% higher than industry average. Review contracts.',
    'Customer retention has improved by 12% this month. Your loyalty program is working!',
    'Tuesday evenings show consistently low traffic. Consider a weekday special promotion.',
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                  <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Recent Orders</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm font-medium text-blue-600">{order.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.customer}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.total}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-purple-100 text-purple-800'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center">
                  <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all orders →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">AI Insights</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  Powered by Claude
                </span>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600">{insight}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link href="/dashboard/ai-advisor" className="btn-primary w-full text-center">
                    Get More Insights
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}