import React, { useState, useEffect } from 'react';
import OverviewPanel from './panels/OverviewPanel';
import AgentPerformancePanel from './panels/AgentPerformancePanel';
import KnowledgeBankPanel from './panels/KnowledgeBankPanel';
import CollaborationPanel from './panels/CollaborationPanel';
import PlanningPanel from './panels/PlanningPanel';

// Mock data for development - would be replaced with actual API calls
const mockMetrics = {
  codeProduction: {
    daily: [120, 145, 132, 165, 178, 156, 199],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  codeQuality: {
    score: 87,
    trend: [82, 84, 83, 86, 85, 87],
  },
  testCoverage: {
    overall: 78,
    components: {
      'Dashboard Module': 85,
      'AI Engine': 72,
      'Integration Hub': 81,
      'Payment System': 76,
    },
  },
  componentProgress: {
    'Dashboard Module': 75,
    'AI Engine': 60,
    'Integration Hub': 90,
    'Payment System': 45,
  },
  activeTasks: [
    { id: 1, name: 'Implement payment gateway', status: 'in-progress', priority: 'high', assignedTo: 'agent', progress: 65 },
    { id: 2, name: 'Fix reservation bug', status: 'in-progress', priority: 'critical', assignedTo: 'agent', progress: 80 },
    { id: 3, name: 'Update user documentation', status: 'pending', priority: 'medium', assignedTo: 'human', progress: 20 },
    { id: 4, name: 'Optimize database queries', status: 'in-progress', priority: 'high', assignedTo: 'agent', progress: 40 },
  ],
  agentPerformance: {
    codeGenerationSpeed: [45, 42, 48, 46, 50, 53, 55],
    promptEfficiency: [0.65, 0.68, 0.67, 0.72, 0.75, 0.74, 0.78],
    humanInterventions: [8, 7, 6, 5, 6, 4, 3],
    selfImprovementTrend: [10, 15, 18, 25, 30, 32, 38],
    timeLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
  },
  knowledgeBank: {
    vectorHealth: 92,
    retrievalEffectiveness: 84,
    knowledgeGaps: [
      { category: 'Payment Processing', severity: 'medium', count: 5 },
      { category: 'Inventory Management', severity: 'low', count: 3 },
      { category: 'User Authentication', severity: 'high', count: 7 },
      { category: 'Reporting', severity: 'low', count: 2 },
    ],
    domainKnowledge: {
      'Restaurant Management': 85,
      'Payment Processing': 70,
      'Inventory': 90,
      'Reservations': 95,
      'User Management': 80,
    },
  },
  sprintPlanning: {
    currentSprint: {
      name: 'Sprint 23',
      progress: 68,
      startDate: '2025-03-15',
      endDate: '2025-03-28',
      tasks: {
        completed: 12,
        inProgress: 8,
        pending: 5,
      },
    },
    upcomingSprints: [
      { name: 'Sprint 24', startDate: '2025-03-29', endDate: '2025-04-11', taskCount: 18 },
      { name: 'Sprint 25', startDate: '2025-04-12', endDate: '2025-04-25', taskCount: 15 },
    ],
  },
  dependencies: [
    { id: 1, name: 'Payment API Integration', status: 'blocked', blockedBy: 'API Key Approval' },
    { id: 2, name: 'User Authentication', status: 'on-track', dependencies: ['Database Schema Update'] },
    { id: 3, name: 'Reporting Module', status: 'at-risk', dependencies: ['Data Aggregation Service'] },
  ],
};

const AutoDevDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [metrics, setMetrics] = useState(mockMetrics);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, these would be actual API calls
        // const metricsResponse = await fetch('/api/metrics');
        // const metricsData = await metricsResponse.json();
        // setMetrics(metricsData);
        
        // Using mock data for now
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Navigation items
  const navItems = [
    { id: 'overview', name: 'Overzicht', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'agent-performance', name: 'Agent Prestaties', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'knowledge-bank', name: 'Kennisbank', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'collaboration', name: 'Samenwerking', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'planning', name: 'Planning', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">BrasserieBot</h1>
          <p className="text-sm text-gray-600">AutoDev Dashboard</p>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.id} className="px-2">
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find((item) => item.id === activeSection)?.name || 'Dashboard'}
            </h2>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeSection === 'overview' && <OverviewPanel metrics={metrics} />}
              {activeSection === 'agent-performance' && <AgentPerformancePanel metrics={metrics} />}
              {activeSection === 'knowledge-bank' && <KnowledgeBankPanel metrics={metrics} />}
              {activeSection === 'collaboration' && <CollaborationPanel metrics={metrics} />}
              {activeSection === 'planning' && <PlanningPanel metrics={metrics} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AutoDevDashboard;
