import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getProjectsByManager,
  createProject,
  updateProject,
  deleteProject,
  addProjectExpense
} from '../../services/database';
import { Plus, Edit, Trash2, DollarSign, Calendar } from 'lucide-react';

const ProjectsManagement = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'labor',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getProjectsByManager(currentUser.uid);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddProjectModal = () => {
    setEditingProject(null);
    setProjectForm({
      name: '',
      description: '',
      budget: '',
      startDate: '',
      endDate: '',
      status: 'active'
    });
    setShowProjectModal(true);
  };

  const openEditProjectModal = (project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name || '',
      description: project.description || '',
      budget: project.budget || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      status: project.status || 'active'
    });
    setShowProjectModal(true);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    try {
      const projectData = {
        ...projectForm,
        budget: Number(projectForm.budget),
        managerId: currentUser.uid
      };

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        alert('Project updated successfully!');
      } else {
        await createProject(projectData);
        alert('Project created successfully!');
      }

      setShowProjectModal(false);
      loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await deleteProject(projectId);
      alert('Project deleted successfully!');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const openExpenseModal = (project) => {
    setSelectedProject(project);
    setExpenseForm({
      description: '',
      amount: '',
      category: 'labor',
      date: new Date().toISOString().split('T')[0]
    });
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    try {
      await addProjectExpense(selectedProject.id, {
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date
      });

      alert('Expense added successfully!');
      setShowExpenseModal(false);
      loadProjects();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
    }
  };

  const getTotalExpenses = (project) => {
    if (!project.expenses) return 0;
    return project.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage project budgets and timelines
          </p>
        </div>
        <button
          onClick={openAddProjectModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const totalExpenses = getTotalExpenses(project);
          const budgetUtilization = project.budget > 0
            ? (totalExpenses / project.budget) * 100
            : 0;

          return (
            <div key={project.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {project.description}
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

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold text-gray-900">
                    ${project.budget?.toLocaleString() || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-semibold text-gray-900">
                    ${totalExpenses.toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Utilization:</span>
                    <span className="font-semibold text-gray-900">
                      {budgetUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
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

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : 'N/A'}{' '}
                  -{' '}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : 'N/A'}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Resources:</span>
                  <span className="font-semibold text-gray-900">
                    {project.allocations?.length || 0} employees
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openEditProjectModal(project)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => openExpenseModal(project)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                >
                  <DollarSign size={16} />
                  Add Expense
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>

            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget *
                  </label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, budget: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={projectForm.status}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, startDate: e.target.value })
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
                    value={projectForm.endDate}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add Expense to {selectedProject?.name}
            </h2>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="labor">Labor</option>
                    <option value="materials">Materials</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;
