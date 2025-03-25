import React, { useState } from 'react';

const CollaborationPanel = ({ metrics }) => {
  const [activeTab, setActiveTab] = useState('feature-requests');
  
  // Priority options for feature requests
  const priorityOptions = [
    { value: 'low', label: 'Laag', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Hoog', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Kritiek', color: 'bg-red-100 text-red-800' },
  ];
  
  // Mock data for feature requests
  const featureRequests = [
    { id: 1, title: 'Implementeer multi-restaurant ondersteuning', description: 'Voeg ondersteuning toe voor meerdere restaurants onder één account', priority: 'high', status: 'pending', requestedBy: 'Jan Jansen', requestedAt: '2025-03-20' },
    { id: 2, title: 'Integratie met populaire POS systemen', description: 'Voeg integraties toe met de meest gebruikte POS systemen in de horeca', priority: 'medium', status: 'in-progress', requestedBy: 'Piet Pietersen', requestedAt: '2025-03-18' },
    { id: 3, title: 'Geavanceerde reserveringsopties', description: 'Voeg meer opties toe voor het beheren van reserveringen, zoals tafelindeling en speciale verzoeken', priority: 'low', status: 'pending', requestedBy: 'Anna de Vries', requestedAt: '2025-03-15' },
  ];
  
  // Mock data for code reviews
  const codeReviews = [
    { id: 1, title: 'Payment Gateway Implementatie', path: 'src/modules/payments', status: 'pending', createdAt: '2025-03-22', priority: 'high' },
    { id: 2, title: 'Gebruikersauthenticatie Refactoring', path: 'src/auth', status: 'in-progress', createdAt: '2025-03-21', priority: 'medium' },
    { id: 3, title: 'API Endpoint Optimalisaties', path: 'src/api', status: 'completed', createdAt: '2025-03-19', priority: 'low' },
  ];
  
  // Mock data for architectural decisions
  const architecturalDecisions = [
    { id: 1, title: 'Microservices Architectuur', description: 'Beslissing om over te stappen naar een microservices architectuur voor betere schaalbaarheid', decidedAt: '2025-03-10', status: 'implemented', impact: 'high' },
    { id: 2, title: 'GraphQL API Implementatie', description: 'Beslissing om GraphQL te gebruiken voor de API in plaats van REST', decidedAt: '2025-02-28', status: 'in-progress', impact: 'medium' },
    { id: 3, title: 'Containerisatie Strategie', description: 'Beslissing om Docker en Kubernetes te gebruiken voor deployment', decidedAt: '2025-02-15', status: 'implemented', impact: 'high' },
  ];
  
  // Mock data for domain knowledge inputs
  const domainKnowledgeInputs = [
    { id: 1, title: 'Restaurantbeheer Best Practices', category: 'Restaurant Management', addedAt: '2025-03-18', status: 'verified', contributor: 'Chef Michel' },
    { id: 2, title: 'Betalingsverwerkingsregels', category: 'Payment Processing', addedAt: '2025-03-15', status: 'pending-verification', contributor: 'Finance Team' },
    { id: 3, title: 'Voorraadbeheersystemen', category: 'Inventory', addedAt: '2025-03-10', status: 'verified', contributor: 'Operations Manager' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('feature-requests')}
            className={`${
              activeTab === 'feature-requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Feature Requests
          </button>
          <button
            onClick={() => setActiveTab('code-reviews')}
            className={`${
              activeTab === 'code-reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Code Reviews
          </button>
          <button
            onClick={() => setActiveTab('architectural-decisions')}
            className={`${
              activeTab === 'architectural-decisions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Architecturale Beslissingen
          </button>
          <button
            onClick={() => setActiveTab('domain-knowledge')}
            className={`${
              activeTab === 'domain-knowledge'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Domeinkennis Input
          </button>
        </nav>
      </div>

      {/* Feature Requests Tab */}
      {activeTab === 'feature-requests' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nieuwe Feature Request</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Korte beschrijving van de feature"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Gedetailleerde beschrijving van de gewenste functionaliteit"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label>
                  <select
                    id="priority"
                    name="priority"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="requested-by" className="block text-sm font-medium text-gray-700 mb-1">Aangevraagd door</label>
                  <input
                    type="text"
                    name="requested-by"
                    id="requested-by"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Uw naam"
                  />
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Feature Request Indienen
                </button>
              </div>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Feature Requests</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {featureRequests.map((request) => (
                <li key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-md font-medium text-gray-900 truncate">{request.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{request.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="mr-2">Aangevraagd door: {request.requestedBy}</span>
                        <span>Datum: {request.requestedAt}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                        request.priority === 'critical' ? 'bg-red-100 text-red-800' : 
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.priority === 'high' ? 'Hoog' : 
                         request.priority === 'critical' ? 'Kritiek' : 
                         request.priority === 'medium' ? 'Medium' : 'Laag'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                        request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.status === 'pending' ? 'Wachtend' : 
                         request.status === 'in-progress' ? 'In Uitvoering' : 'Voltooid'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Code Reviews Tab */}
      {activeTab === 'code-reviews' && (
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Code Reviews</h3>
            </div>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <input
                    type="text"
                    name="search"
                    id="search-code-reviews"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Zoek code reviews..."
                  />
                </div>
                <div className="ml-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Nieuwe Review Aanvragen
                  </button>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {codeReviews.map((review) => (
                <li key={review.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-md font-medium text-gray-900 truncate">{review.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">Pad: {review.path}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Aangemaakt op: {review.createdAt}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                        review.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {review.priority === 'high' ? 'Hoog' : 
                         review.priority === 'medium' ? 'Medium' : 'Laag'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                        review.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {review.status === 'pending' ? 'Wachtend' : 
                         review.status === 'in-progress' ? 'In Uitvoering' : 'Voltooid'}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Architectural Decisions Tab */}
      {activeTab === 'architectural-decisions' && (
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Architecturale Beslissingen</h3>
            </div>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Nieuwe Beslissing Registreren
              </button>
            </div>
            <ul className="divide-y divide-gray-200">
              {architecturalDecisions.map((decision) => (
                <li key={decision.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-md font-medium text-gray-900 truncate">{decision.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">{decision.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Besloten op: {decision.decidedAt}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        decision.impact === 'high' ? 'bg-orange-100 text-orange-800' : 
                        decision.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Impact: {decision.impact === 'high' ? 'Hoog' : 
                                decision.impact === 'medium' ? 'Medium' : 'Laag'}
                      </span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        decision.status === 'implemented' ? 'bg-green-100 text-green-800' : 
                        decision.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {decision.status === 'implemented' ? 'Geïmplementeerd' : 
                         decision.status === 'in-progress' ? 'In Uitvoering' : 'Gepland'}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Domain Knowledge Input Tab */}
      {activeTab === 'domain-knowledge' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Domeinkennis Toevoegen</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="knowledge-title" className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  name="knowledge-title"
                  id="knowledge-title"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Titel van kennisitem"
                />
              </div>
              <div>
                <label htmlFor="knowledge-category" className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                <select
                  id="knowledge-category"
                  name="knowledge-category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="restaurant-management">Restaurant Management</option>
                  <option value="payment-processing">Payment Processing</option>
                  <option value="inventory">Inventory</option>
                  <option value="reservations">Reservations</option>
                  <option value="user-management">User Management</option>
                  <option value="new">+ Nieuwe categorie toevoegen</option>
                </select>
              </div>
              <div>
                <label htmlFor="knowledge-content" className="block text-sm font-medium text-gray-700 mb-1">Inhoud</label>
                <textarea
                  id="knowledge-content"
                  name="knowledge-content"
                  rows={5}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Gedetailleerde domeinkennis..."
                />
              </div>
              <div>
                <label htmlFor="contributor" className="block text-sm font-medium text-gray-700 mb-1">Bijdrager</label>
                <input
                  type="text"
                  name="contributor"
                  id="contributor"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Uw naam of rol"
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
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recente Domeinkennis Bijdragen</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {domainKnowledgeInputs.map((input) => (
                <li key={input.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-md font-medium text-gray-900 truncate">{input.title}</h4>
                      <p className="mt-1 text-sm text-gray-500">Categorie: {input.category}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="mr-2">Bijdrager: {input.contributor}</span>
                        <span>Toegevoegd op: {input.addedAt}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        input.status === 'verified' ? 'bg-green-100 text-green-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {input.status === 'verified' ? 'Geverifieerd' : 'Verificatie Nodig'}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Bekijken
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;