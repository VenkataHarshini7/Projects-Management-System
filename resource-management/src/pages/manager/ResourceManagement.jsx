import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getProjectsByManager,
  getAllUsers,
  allocateResource,
  removeResourceAllocation,
  updateResourceAllocation,
  getEmployeeUtilization
} from '../../services/database';
import { UserPlus, UserMinus, Edit2, AlertCircle } from 'lucide-react';

const ResourceManagement = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [employeeUtilizations, setEmployeeUtilizations] = useState({});
  const [loading, setLoading] = useState(true);

  const [allocationForm, setAllocationForm] = useState({
    employeeId: '',
    allocationPercentage: '',
    role: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        getProjectsByManager(currentUser.uid),
        getAllUsers()
      ]);

      const employeesList = usersData.filter((u) => u.role === 'employee');
      setProjects(projectsData);
      setEmployees(employeesList);

      // Load utilization for all employees
      const utilizations = {};
      await Promise.all(
        employeesList.map(async (emp) => {
          try {
            const util = await getEmployeeUtilization(emp.id);
            utilizations[emp.id] = util;
          } catch (error) {
            console.error(`Error loading utilization for ${emp.id}:`, error);
          }
        })
      );
      setEmployeeUtilizations(utilizations);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAllocationModal = (project, allocation = null) => {
    setSelectedProject(project);
    setEditingAllocation(allocation);

    if (allocation) {
      setAllocationForm({
        employeeId: allocation.employeeId,
        allocationPercentage: allocation.allocationPercentage,
        role: allocation.role || '',
        startDate: allocation.startDate || '',
        endDate: allocation.endDate || ''
      });
    } else {
      setAllocationForm({
        employeeId: '',
        allocationPercentage: '',
        role: '',
        startDate: '',
        endDate: ''
      });
    }

    setShowAllocationModal(true);
  };

  const handleAllocationSubmit = async (e) => {
    e.preventDefault();

    try {
      const employee = employees.find((emp) => emp.id === allocationForm.employeeId);

      const allocationData = {
        employeeId: allocationForm.employeeId,
        employeeName: employee?.fullName || 'Unknown',
        allocationPercentage: Number(allocationForm.allocationPercentage),
        role: allocationForm.role,
        startDate: allocationForm.startDate,
        endDate: allocationForm.endDate
      };

      if (editingAllocation) {
        await updateResourceAllocation(
          selectedProject.id,
          editingAllocation.employeeId,
          allocationData
        );
        alert('Allocation updated successfully!');
      } else {
        await allocateResource(selectedProject.id, allocationData);
        alert('Resource allocated successfully!');
      }

      setShowAllocationModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving allocation:', error);
      alert('Error saving allocation');
    }
  };

  const handleRemoveAllocation = async (projectId, employeeId) => {
    if (!window.confirm('Are you sure you want to remove this allocation?')) {
      return;
    }

    try {
      await removeResourceAllocation(projectId, employeeId);
      alert('Allocation removed successfully!');
      loadData();
    } catch (error) {
      console.error('Error removing allocation:', error);
      alert('Error removing allocation');
    }
  };

  const getUtilizationColor = (percentage) => {
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (percentage) => {
    if (percentage > 100) return 'bg-red-100';
    if (percentage > 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
        <p className="text-gray-600 mt-1">
          Allocate and manage employees across projects
        </p>
      </div>

      {/* Employee Availability Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Employee Availability
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => {
            const utilization = employeeUtilizations[employee.id];
            const totalAllocation = utilization?.totalAllocation || 0;
            const availableCapacity = 100 - totalAllocation;

            return (
              <div
                key={employee.id}
                className={`p-4 rounded-lg border-2 ${
                  totalAllocation > 100
                    ? 'border-red-200 bg-red-50'
                    : totalAllocation > 80
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {employee.fullName}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.designation}</p>
                  </div>
                  {totalAllocation > 100 && (
                    <AlertCircle className="text-red-600" size={20} />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allocated:</span>
                    <span
                      className={`font-semibold ${getUtilizationColor(
                        totalAllocation
                      )}`}
                    >
                      {totalAllocation.toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.max(availableCapacity, 0).toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        totalAllocation > 100
                          ? 'bg-red-600'
                          : totalAllocation > 80
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{
                        width: `${Math.min(totalAllocation, 100)}%`
                      }}
                    />
                  </div>

                  <div className="text-xs text-gray-600">
                    {utilization?.projectCount || 0} project(s)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects with Allocations */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {project.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {project.description}
                </p>
              </div>
              <button
                onClick={() => openAllocationModal(project)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <UserPlus size={18} />
                Allocate Resource
              </button>
            </div>

            {/* Allocations Table */}
            <div className="mt-4">
              {!project.allocations || project.allocations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No resources allocated to this project yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Load
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {project.allocations.map((allocation) => {
                        const utilization =
                          employeeUtilizations[allocation.employeeId];
                        const totalLoad = utilization?.totalAllocation || 0;

                        return (
                          <tr
                            key={allocation.employeeId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {allocation.employeeName}
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
                                  ? new Date(
                                      allocation.startDate
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                to{' '}
                                {allocation.endDate
                                  ? new Date(
                                      allocation.endDate
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getUtilizationBgColor(
                                  totalLoad
                                )} ${getUtilizationColor(totalLoad)}`}
                              >
                                {totalLoad.toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    openAllocationModal(project, allocation)
                                  }
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveAllocation(
                                      project.id,
                                      allocation.employeeId
                                    )
                                  }
                                  className="text-red-600 hover:text-red-900"
                                  title="Remove"
                                >
                                  <UserMinus size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingAllocation ? 'Edit Allocation' : 'Allocate Resource'} to{' '}
              {selectedProject?.name}
            </h2>

            <form onSubmit={handleAllocationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  value={allocationForm.employeeId}
                  onChange={(e) =>
                    setAllocationForm({
                      ...allocationForm,
                      employeeId: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={editingAllocation !== null}
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => {
                    const utilization = employeeUtilizations[emp.id];
                    const available = 100 - (utilization?.totalAllocation || 0);
                    return (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} - {available.toFixed(0)}% available
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocation Percentage * (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={allocationForm.allocationPercentage}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        allocationPercentage: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role in Project
                  </label>
                  <input
                    type="text"
                    value={allocationForm.role}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        role: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Developer, Designer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={allocationForm.startDate}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        startDate: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={allocationForm.endDate}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        endDate: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAllocation ? 'Update Allocation' : 'Allocate Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
