import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';

const KnowledgeBankPanel = ({ metrics }) => {
  // Knowledge domain chart data
  const knowledgeDomainData = {
    labels: Object.keys(metrics.knowledgeBank.domainKnowledge),
    datasets: [
      {
        label: 'Domeinkennis Score',
        data: Object.values(metrics.knowledgeBank.domainKnowledge),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(139, 92, 246, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
      },
    ],
  };

  // Knowledge gaps chart data
  const knowledgeGapsData = {
    labels: metrics.knowledgeBank.knowledgeGaps.map(gap => gap.category),
    datasets: [
      {
        label: 'Kennislacunes',
        data: metrics.knowledgeBank.knowledgeGaps.map(gap => gap.count),
        backgroundColor: metrics.knowledgeBank.knowledgeGaps.map(gap => 
          gap.severity === 'high' ? 'rgba(239, 68, 68, 0.6)' : 
          gap.severity === 'medium' ? 'rgba(245, 158, 11, 0.6)' : 
          'rgba(16, 185, 129, 0.6)'
        ),
        borderColor: metrics.knowledgeBank.knowledgeGaps.map(gap => 
          gap.severity === 'high' ? 'rgba(239, 68, 68, 1)' : 
          gap.severity === 'medium' ? 'rgba(245, 158, 11, 1)' : 
          'rgba(16, 185, 129, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vector Database Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vector Database Gezondheid</h3>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">{metrics.knowledgeBank.vectorHealth}%</span>
                </div>
                <div className="absolute top-0 right-0 -mr-2 -mt-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">Retrieval Effectiviteit:</span>
                  <span className="ml-2 text-sm font-medium text-blue-600">{metrics.knowledgeBank.retrievalEffectiveness}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Domain Knowledge Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Domeinkennis Distributie</h3>
          <div className="h-64">
            <Doughnut 
              data={knowledgeDomainData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Knowledge Gaps */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Kennislacunes Identificatie</h3>
        <div className="h-64">
          <Bar 
            data={knowledgeGapsData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Aantal Lacunes'
                  }
                }
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const gap = metrics.knowledgeBank.knowledgeGaps[context.dataIndex];
                      return `${context.dataset.label}: ${context.raw} (${gap.severity})`;
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>
      
      {/* Knowledge Management Interface */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Kennisbank Management</h3>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Zoeken</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Zoek in kennisbank..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-48">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Alle categorieën</option>
                {Object.keys(metrics.knowledgeBank.domainKnowledge).map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Add Knowledge Form */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-2">Kennis Toevoegen/Bijwerken</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Titel van kennisitem"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                <select
                  id="add-category"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {Object.keys(metrics.knowledgeBank.domainKnowledge).map((domain) => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                  <option value="new">+ Nieuwe categorie toevoegen</option>
                </select>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
                <textarea
                  id="content"
                  name="content"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Voer kennisinhoud in..."
                />
              </div>
              <div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kennis Toevoegen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBankPanel;