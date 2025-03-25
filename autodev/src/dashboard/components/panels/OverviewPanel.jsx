import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

const OverviewPanel = ({ metrics }) => {
  // Component progress chart data
  const componentProgressData = {
    labels: Object.keys(metrics.componentProgress),
    datasets: [
      {
        label: 'Voortgang (%)',
        data: Object.values(metrics.componentProgress),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Code production chart data
  const codeProductionData = {
    labels: metrics.codeProduction.labels,
    datasets: [
      {
        label: 'Code Productie (LOC)',
        data: metrics.codeProduction.daily,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Code Productie</h3>
          <div className="text-3xl font-bold text-blue-600">{metrics.codeProduction.daily[metrics.codeProduction.daily.length - 1]} LOC</div>
          <div className="text-sm text-gray-500">Vandaag</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Code Kwaliteit</h3>
          <div className="text-3xl font-bold text-green-600">{metrics.codeQuality.score}%</div>
          <div className="text-sm text-gray-500">Gemiddelde score</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Test Coverage</h3>
          <div className="text-3xl font-bold text-yellow-600">{metrics.testCoverage.overall}%</div>
          <div className="text-sm text-gray-500">Totale dekking</div>
        </div>
      </div>
      
      {/* Component Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ontwikkelingsvoortgang per Component</h3>
        <div className="h-64">
          <Bar 
            data={componentProgressData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Voortgang (%)'
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }} 
          />
        </div>
      </div>
      
      {/* Active Tasks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actieve Taken</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taak</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioriteit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toegewezen aan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voortgang</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.activeTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                      task.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.status === 'in-progress' ? 'In Uitvoering' : 
                       task.status === 'pending' ? 'Wachtend' : 'Voltooid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' : 
                      task.priority === 'critical' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority === 'high' ? 'Hoog' : 
                       task.priority === 'critical' ? 'Kritiek' : 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.assignedTo === 'agent' ? 'AutoDev Agent' : 'Mens'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          task.progress < 30 ? 'bg-red-600' : 
                          task.progress < 70 ? 'bg-yellow-600' : 
                          'bg-green-600'
                        }`} 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{task.progress}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Code Production Trend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Code Productie Trend</h3>
        <div className="h-64">
          <Line 
            data={codeProductionData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Regels Code'
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;