import React from 'react';
import { Line, Bar } from 'react-chartjs-2';

const AgentPerformancePanel = ({ metrics }) => {
  // Agent performance chart data
  const agentPerformanceData = {
    labels: metrics.agentPerformance.timeLabels,
    datasets: [
      {
        label: 'Code Generatie Snelheid (LOC/min)',
        data: metrics.agentPerformance.codeGenerationSpeed,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Prompt Efficiëntie',
        data: metrics.agentPerformance.promptEfficiency,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        yAxisID: 'y1',
      },
    ],
  };

  // Human interventions chart data
  const humanInterventionsData = {
    labels: metrics.agentPerformance.timeLabels,
    datasets: [
      {
        label: 'Menselijke Interventies',
        data: metrics.agentPerformance.humanInterventions,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Self-improvement trend chart data
  const selfImprovementData = {
    labels: metrics.agentPerformance.timeLabels,
    datasets: [
      {
        label: 'Zelf-verbetering Score',
        data: metrics.agentPerformance.selfImprovementTrend,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code Generation Speed & Prompt Efficiency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Code Generatie & Prompt Efficiëntie</h3>
          <div className="h-64">
            <Line 
              data={agentPerformanceData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'LOC/min'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 1,
                    title: {
                      display: true,
                      text: 'Efficiëntie Ratio'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                }
              }} 
            />
          </div>
        </div>
        
        {/* Human Interventions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Menselijke Interventies</h3>
          <div className="h-64">
            <Bar 
              data={humanInterventionsData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Aantal Interventies'
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Self-Improvement Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Zelf-verbetering Trend</h3>
        <div className="h-64">
          <Line 
            data={selfImprovementData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Verbetering Score'
                  }
                }
              }
            }} 
          />
        </div>
      </div>
      
      {/* Performance Metrics Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gedetailleerde Prestatie Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huidige Waarde</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vorige Waarde</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verandering</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Code Generatie Snelheid</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 1]} LOC/min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 2]} LOC/min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 1] > 
                    metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 2] 
                      ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(((metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 1] - 
                       metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 2]) / 
                       metrics.agentPerformance.codeGenerationSpeed[metrics.agentPerformance.codeGenerationSpeed.length - 2]) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Prompt Efficiëntie</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 1] * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 2] * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 1] > 
                    metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 2] 
                      ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(((metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 1] - 
                       metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 2]) / 
                       metrics.agentPerformance.promptEfficiency[metrics.agentPerformance.promptEfficiency.length - 2]) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Menselijke Interventies</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 1]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 2]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 1] < 
                    metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 2] 
                      ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(((metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 1] - 
                       metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 2]) / 
                       metrics.agentPerformance.humanInterventions[metrics.agentPerformance.humanInterventions.length - 2]) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Zelf-verbetering</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 1]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 2]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 1] > 
                    metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 2] 
                      ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {(((metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 1] - 
                       metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 2]) / 
                       metrics.agentPerformance.selfImprovementTrend[metrics.agentPerformance.selfImprovementTrend.length - 2]) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentPerformancePanel;