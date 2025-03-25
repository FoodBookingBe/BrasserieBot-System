'use client';

import { useState } from 'react';
import Link from 'next/link';

// Reuse sidebar component from dashboard
const Sidebar = () => {
  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="flex items-center mb-8">
        <span className="text-2xl font-bold">BrasserieBot</span>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="flex items-center p-2 rounded-md hover:bg-gray-700">
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
            <Link href="/dashboard/ai-advisor" className="flex items-center p-2 rounded-md bg-blue-700 text-white">
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
        <h1 className="text-2xl font-bold text-gray-800">AI Business Advisor</h1>
        
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Notifications">
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

// AI Advisor page
export default function AiAdvisor() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState('');
  
  // Mock categories for AI advice
  const categories = [
    { name: 'Menu Optimization', icon: '🍽️' },
    { name: 'Staff Scheduling', icon: '👥' },
    { name: 'Pricing Strategy', icon: '💰' },
    { name: 'Inventory Management', icon: '📦' },
    { name: 'Marketing Ideas', icon: '📣' },
    { name: 'Cost Reduction', icon: '📉' },
  ];
  
  // Mock recent insights
  const recentInsights = [
    {
      title: 'Menu Analysis',
      description: 'Your seafood dishes have 28% higher profit margins than meat dishes. Consider featuring more seafood options in your specials.',
      date: '2025-03-22',
    },
    {
      title: 'Staff Optimization',
      description: 'Based on customer traffic patterns, you could reduce staffing on Monday evenings by 15% without impacting service quality.',
      date: '2025-03-20',
    },
    {
      title: 'Supplier Recommendation',
      description: 'Switching your dairy supplier to LocalFarms could save you €320 monthly while maintaining product quality.',
      date: '2025-03-18',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call to AI service
    setTimeout(() => {
      // Mock response
      const responses = [
        "Based on your sales data, I recommend introducing a prix fixe menu option for weekday lunches. Restaurants with similar customer demographics have seen a 22% increase in weekday lunch revenue with this approach. Consider a 2-course option at €24.95 and a 3-course option at €32.95, featuring your highest-margin dishes.",
        "Your inventory data shows you're overstocking on fresh herbs by approximately 18%. I recommend reducing your herb orders and implementing a just-in-time ordering system with your supplier. This could save approximately €120 per week while reducing waste.",
        "Analysis of your customer feedback indicates that wait times during Friday and Saturday evenings are negatively impacting satisfaction scores. Consider adding one additional server during peak hours (7-9pm) on these days to improve service speed and customer experience."
      ];
      
      // Select a random response
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setAdvice(randomResponse);
      setIsLoading(false);
    }, 2000);
  };

  const handleCategoryClick = (category: string) => {
    // Set predefined prompts based on category
    const prompts = {
      'Menu Optimization': 'How can I optimize my menu for better profitability?',
      'Staff Scheduling': 'What is the optimal staffing schedule based on our customer traffic?',
      'Pricing Strategy': 'How should I price my menu items to maximize revenue?',
      'Inventory Management': 'How can I reduce waste and optimize my inventory?',
      'Marketing Ideas': 'What marketing strategies would work best for my restaurant?',
      'Cost Reduction': 'Where can I reduce costs without affecting quality?'
    };
    
    setPrompt(prompts[category as keyof typeof prompts]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Advisor Chat */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-gray-800">Ask Claude for Business Advice</h2>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">SUGGESTED TOPICS</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category, index) => (
                        <button
                          key={index}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 flex items-center"
                          onClick={() => handleCategoryClick(category.name)}
                        >
                          <span className="mr-1">{category.icon}</span> {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {advice && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{advice}</p>
                          <div className="mt-3 flex justify-end space-x-2">
                            <button className="text-xs text-gray-500 hover:text-gray-700">Save</button>
                            <button className="text-xs text-gray-500 hover:text-gray-700">Share</button>
                            <button className="text-xs text-gray-500 hover:text-gray-700">Export</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask for business advice, insights, or recommendations..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows={4}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className={`absolute bottom-3 right-3 p-2 rounded-full ${
                          isLoading || !prompt.trim() 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        aria-label="Send message"
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Recent Insights */}
            <div>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">Recent Insights</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {recentInsights.map((insight, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="text-md font-medium text-gray-800 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <p className="text-xs text-gray-400">{insight.date}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                      View All Insights
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}