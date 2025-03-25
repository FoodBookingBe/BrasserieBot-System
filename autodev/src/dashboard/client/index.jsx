import React from 'react';
import { createRoot } from 'react-dom/client';
import AutoDevDashboard from '../components/AutoDevDashboard.jsx';
import './styles.css';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

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

// Initialize the dashboard
const initDashboard = async () => {
  try {
    // In a real implementation, we would fetch data from the API
    // const response = await fetch('/api/metrics');
    // const metrics = await response.json();
    
    // For now, use mock data
    const metrics = mockMetrics;
    
    // Render the dashboard
    const container = document.getElementById('dashboard-root');
    const root = createRoot(container);
    root.render(<AutoDevDashboard />);
    
    // Set up socket connection for real-time updates
    const socket = io();
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('metrics', (updatedMetrics) => {
      console.log('Received updated metrics:', updatedMetrics);
      // In a real implementation, we would update the state with the new metrics
    });
    
    socket.on('event', (event) => {
      console.log('Received event:', event);
      // In a real implementation, we would update the state with the new event
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
};

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);