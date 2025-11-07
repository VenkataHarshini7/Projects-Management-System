import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployeeAllocations, getEmployeeUtilization } from '../../services/database';
import { FolderKanban, TrendingUp, Clock, Award } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const EmployeeDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [allocationsData, utilizationData] = await Promise.all([
        getEmployeeAllocations(currentUser.uid),
        getEmployeeUtilization(currentUser.uid)
      ]);

      setAllocations(allocationsData);
      setUtilization(utilizationData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAllocationData = () => {
    return allocations.map((alloc) => ({
      name: alloc.projectName,
      value: alloc.allocationPercentage
    }));
  };

  const getUtilizationColor = () => {
    const total = utilization?.totalAllocation || 0;
    if (total > 100) return 'text-red-600';
    if (total > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationStatus = () => {
    const total = utilization?.totalAllocation || 0;
    if (total > 100) return 'Over-allocated';
    if (total > 80) return 'Highly utilized';
    if (total > 50) return 'Well utilized';
    return 'Under-utilized';
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {userProfile?.fullName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your current projects and utilization
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {utilization?.projectCount || 0}
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
              <p className="text-sm font-medium text-gray-600">Total Allocation</p>
              <p
                className={`text-3xl font-bold mt-2 ${getUtilizationColor()}`}
              >
                {utilization?.totalAllocation?.toFixed(0) || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available Capacity
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {Math.max(utilization?.availableCapacity || 0, 0).toFixed(0)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-lg font-bold mt-2 ${getUtilizationColor()}`}>
                {getUtilizationStatus()}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Profile Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {userProfile?.department || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Designation</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {userProfile?.designation || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Joining Date</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {userProfile?.joiningDate
                ? new Date(userProfile.joiningDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Skills</p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {userProfile?.skills?.length || 0} skills
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Allocation Distribution
          </h2>
          {allocations.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getAllocationData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getAllocationData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No project allocations yet
            </div>
          )}
        </div>

        {/* Project Allocations Bar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Project Allocations
          </h2>
          {allocations.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getAllocationData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Allocation %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Allocation %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No project allocations yet
            </div>
          )}
        </div>
      </div>

      {/* Project Assignments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Project Assignments
        </h2>
        {allocations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.projectId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {allocation.projectName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {allocation.allocationPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {allocation.role || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {allocation.startDate
                          ? new Date(allocation.startDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        to{' '}
                        {allocation.endDate
                          ? new Date(allocation.endDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            You are not currently assigned to any projects
          </p>
        )}
      </div>

      {/* Skills & Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Skills
          </h2>
          {userProfile?.skills && userProfile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userProfile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Certifications
          </h2>
          {userProfile?.certifications && userProfile.certifications.length > 0 ? (
            <div className="space-y-2">
              {userProfile.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="text-sm font-medium text-gray-900">{cert}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No certifications added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
