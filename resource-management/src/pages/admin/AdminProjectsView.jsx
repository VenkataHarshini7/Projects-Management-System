import { useState, useEffect } from 'react';
import { getAllProjects, getAllUsers } from '../../services/database';
import { Search, TrendingUp, Calendar, Users, DollarSign } from 'lucide-react';

const AdminProjectsView = () => {
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        getAllProjects(),
        getAllUsers()
      ]);

      setProjects(projectsData);

      // Create a map of managers
      const managersMap = {};
      usersData
        .filter(u => u.role === 'project_manager' || u.role === 'admin')
        .forEach(user => {
          managersMap[user.id] = user.fullName;
        });
      setManagers(managersMap);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getTotalExpenses = (project) => {
    if (!project.expenses) return 0;
    return project.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-blue-600';
    if (progress >= 25) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
        <p className="text-gray-600 mt-1">
          View and monitor all projects across the organization
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const totalExpenses = getTotalExpenses(project);
          const budgetUtilization = project.budget > 0
            ? (totalExpenses / project.budget) * 100
            : 0;
          const progress = project.progress || 0;
          const managerName = managers[project.managerId] || 'Unknown Manager';

          return (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manager: {managerName}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-1 text-gray-600">
                    <TrendingUp size={14} />
                    <span>Progress</span>
                  </div>
                  <span className="font-semibold text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {/* Budget */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={14} />
                    <span>Budget</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${project.budget?.toLocaleString() || 0}
                  </span>
                </div>

                {/* Spent */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 ml-6">Spent</span>
                  <span className="font-medium text-gray-900">
                    ${totalExpenses.toLocaleString()}
                  </span>
                </div>

                {/* Budget Utilization */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 ml-6 text-xs">Utilization</span>
                    <span className="font-medium text-gray-900 text-xs">
                      {budgetUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        budgetUtilization > 90
                          ? 'bg-red-600'
                          : budgetUtilization > 70
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-2 text-gray-600 pt-2">
                  <Calendar size={14} />
                  <span className="text-xs">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : 'N/A'}{' '}
                    to{' '}
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>

                {/* Resources */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} />
                    <span>Resources</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {project.allocations?.length || 0}
                  </span>
                </div>
              </div>

              {/* Last Updated */}
              {project.lastProgressUpdate && (
                <div className="mt-4 pt-3 border-t text-xs text-gray-500">
                  Last updated:{' '}
                  {new Date(project.lastProgressUpdate).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Projects</p>
            <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.status === 'completed').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">On Hold</p>
            <p className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status === 'on-hold').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectsView;
