import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProjectsByManager, getProjectKPIs, getAllUsers } from '../../services/database';
import {
  FolderKanban,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectKPIs, setProjectKPIs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, employeesData] = await Promise.all([
        getProjectsByManager(currentUser.uid),
        getAllUsers()
      ]);

      setProjects(projectsData);
      setEmployees(employeesData.filter(u => u.role === 'employee'));

      // Load KPIs for each project
      const kpis = await Promise.all(
        projectsData.map(project => getProjectKPIs(project.id))
      );
      setProjectKPIs(kpis.filter(kpi => kpi !== null));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalBudget = () => {
    return projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  };

  const getTotalSpent = () => {
    return projectKPIs.reduce((sum, kpi) => sum + (kpi.totalSpent || 0), 0);
  };

  const getTotalResources = () => {
    const uniqueEmployees = new Set();
    projects.forEach(project => {
      project.allocations?.forEach(alloc => {
        uniqueEmployees.add(alloc.employeeId);
      });
    });
    return uniqueEmployees.size;
  };

  const getBudgetUtilizationData = () => {
    return projectKPIs.map(kpi => ({
      name: kpi.name?.substring(0, 15) + '...' || 'Project',
      budget: kpi.budget || 0,
      spent: kpi.totalSpent || 0,
      utilization: kpi.budgetUtilization || 0
    }));
  };

  const getResourceAllocationData = () => {
    return projectKPIs.slice(0, 5).map(kpi => ({
      name: kpi.name?.substring(0, 15) + '...' || 'Project',
      resources: kpi.resourceCount || 0,
      allocation: kpi.totalAllocation || 0
    }));
  };

  const getOverAllocatedEmployees = () => {
    const employeeAllocations = {};

    projects.forEach(project => {
      project.allocations?.forEach(alloc => {
        if (!employeeAllocations[alloc.employeeId]) {
          employeeAllocations[alloc.employeeId] = {
            name: alloc.employeeName || 'Employee',
            total: 0
          };
        }
        employeeAllocations[alloc.employeeId].total +=
          alloc.allocationPercentage || 0;
      });
    });

    return Object.values(employeeAllocations).filter(emp => emp.total > 100);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const overAllocated = getOverAllocatedEmployees();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Project Manager Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage projects, resources, and track performance
        </p>
      </div>

      {/* Alerts */}
      {overAllocated.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900">
                Resource Over-Allocation Detected
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                {overAllocated.length} employee(s) are allocated over 100%:
              </p>
              <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                {overAllocated.map((emp, idx) => (
                  <li key={idx}>
                    {emp.name} - {emp.total.toFixed(0)}% allocated
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {projects.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {projects.filter(p => p.status === 'active').length} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderKanban className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${(getTotalBudget() / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${(getTotalSpent() / 1000).toFixed(0)}k spent
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {getTotalResources()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Across all projects
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {((getTotalSpent() / getTotalBudget()) * 100 || 0).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Budget utilization</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Utilization by Project
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getBudgetUtilizationData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              <Bar dataKey="spent" fill="#10b981" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Allocation */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resource Allocation per Project
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getResourceAllocationData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resources" fill="#8b5cf6" name="Resources" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Projects
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resources
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => {
                const kpi = projectKPIs.find(k => k.id === project.id);
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {project.description?.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>${project.budget?.toLocaleString() || 0}</div>
                      {kpi && (
                        <div className="text-xs text-gray-500">
                          {kpi.budgetUtilization.toFixed(0)}% used
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.allocations?.length || 0} employees
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        to{' '}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
