import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';

const PlanningPanel = ({ metrics }) => {
  // Sprint tasks chart data
  const sprintTasksData = {
    labels: ['Voltooid', 'In Uitvoering', 'Wachtend'],
    datasets: [
      {
        label: 'Taken',
        data: [
          metrics.sprintPlanning.currentSprint.tasks.completed,
          metrics.sprintPlanning.currentSprint.tasks.inProgress,
          metrics.sprintPlanning.currentSprint.tasks.pending,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(209, 213, 219, 0.6)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(209, 213, 219, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  // Calculate days remaining in sprint
  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining(metrics.sprintPlanning.currentSprint.endDate);

  return (
    <div className="space-y-6">
      {/* Current Sprint Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Huidige Sprint: {metrics.sprintPlanning.currentSprint.name}</h3>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            {daysRemaining} dagen resterend
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Sprint Voortgang</span>
                  <span className="text-sm font-medium text-blue-600">{metrics.sprintPlanning.currentSprint.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      metrics.sprintPlanning.currentSprint.progress < 30 ? 'bg-red-600' : 
                      metrics.sprintPlanning.currentSprint.progress < 70 ? 'bg-yellow-600' : 
                      'bg-green-600'
                    }`} 
                    style={{ width: `${metrics.sprintPlanning.currentSprint.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.sprintPlanning.currentSprint.tasks.completed}</div>
                  <div className="text-sm text-gray-500">Voltooid</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.sprintPlanning.currentSprint.tasks.inProgress}</div>
                  <div className="text-sm text-gray-500">In Uitvoering</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">{metrics.sprintPlanning.currentSprint.tasks.pending}</div>
                  <div className="text-sm text-gray-500">Wachtend</div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 mt-auto">
                <div>Start: {formatDate(metrics.sprintPlanning.currentSprint.startDate)}</div>
                <div>Einde: {formatDate(metrics.sprintPlanning.currentSprint.endDate)}</div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="h-48">
              <Doughnut 
                data={sprintTasksData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Allocation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Taak Toewijzing</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taak</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toegewezen aan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioriteit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voortgang</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.activeTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.assignedTo === 'agent' ? 'AutoDev Agent' : 'Mens'}
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Roadmap Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Roadmap Visualisatie</h3>
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-between">
              <div>
                <span className="bg-white px-3 py-1 text-sm font-medium text-gray-900 rounded-full">
                  Nu
                </span>
              </div>
              <div>
                <span className="bg-white px-3 py-1 text-sm font-medium text-gray-900 rounded-full">
                  Q2 2025
                </span>
              </div>
              <div>
                <span className="bg-white px-3 py-1 text-sm font-medium text-gray-900 rounded-full">
                  Q3 2025
                </span>
              </div>
              <div>
                <span className="bg-white px-3 py-1 text-sm font-medium text-gray-900 rounded-full">
                  Q4 2025
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Current Sprint */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-900">{metrics.sprintPlanning.currentSprint.name}</h4>
                <span className="text-sm text-gray-500">
                  {formatDate(metrics.sprintPlanning.currentSprint.startDate)} - {formatDate(metrics.sprintPlanning.currentSprint.endDate)}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Voortgang: {metrics.sprintPlanning.currentSprint.progress}%</span>
                  <span>{metrics.sprintPlanning.currentSprint.tasks.completed + metrics.sprintPlanning.currentSprint.tasks.inProgress + metrics.sprintPlanning.currentSprint.tasks.pending} taken</span>
                </div>
              </div>
            </div>
            
            {/* Upcoming Sprints */}
            {metrics.sprintPlanning.upcomingSprints.map((sprint, index) => (
              <div key={sprint.name} className={`bg-gray-50 p-4 rounded-lg border-l-4 ${index === 0 ? 'border-yellow-500' : 'border-gray-300'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium text-gray-900">{sprint.name}</h4>
                  <span className="text-sm text-gray-500">
                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>Planning</span>
                    <span>{sprint.taskCount} geplande taken</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dependency Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Dependency Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afhankelijkheden</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.dependencies.map((dependency) => (
                <tr key={dependency.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dependency.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dependency.status === 'blocked' ? 'bg-red-100 text-red-800' : 
                      dependency.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {dependency.status === 'blocked' ? 'Geblokkeerd' : 
                       dependency.status === 'at-risk' ? 'Risico' : 'Op Schema'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dependency.blockedBy ? (
                      <span className="text-red-600">Geblokkeerd door: {dependency.blockedBy}</span>
                    ) : dependency.dependencies ? (
                      <ul className="list-disc list-inside">
                        {dependency.dependencies.map((dep, index) => (
                          <li key={index}>{dep}</li>
                        ))}
                      </ul>
                    ) : (
                      'Geen afhankelijkheden'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Beheren
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanningPanel;