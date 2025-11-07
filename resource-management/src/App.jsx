import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ConfigCheck from './pages/ConfigCheck';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ProjectsManagement from './pages/manager/ProjectsManagement';
import ResourceManagement from './pages/manager/ResourceManagement';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';

function AppRoutes() {
  const { currentUser, userProfile } = useAuth();

  // Redirect to appropriate dashboard based on role
  const getDefaultRoute = () => {
    if (!currentUser) return '/login';

    switch (userProfile?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'project_manager':
        return '/manager/dashboard';
      case 'employee':
        return '/employee/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/config-check" element={<ConfigCheck />} />
      <Route
        path="/login"
        element={
          currentUser ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        }
      />
      <Route
        path="/signup"
        element={
          currentUser ? <Navigate to={getDefaultRoute()} replace /> : <Signup />
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                <p className="text-gray-600 mt-2">
                  Detailed reports and analytics coming soon
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Project Manager Routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['project_manager']}>
            <Layout>
              <ManagerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/projects"
        element={
          <ProtectedRoute allowedRoles={['project_manager']}>
            <Layout>
              <ProjectsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/resources"
        element={
          <ProtectedRoute allowedRoles={['project_manager']}>
            <Layout>
              <ResourceManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute allowedRoles={['project_manager']}>
            <Layout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                <p className="text-gray-600 mt-2">
                  Detailed reports and analytics coming soon
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <EmployeeProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/projects"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
                <p className="text-gray-600 mt-2">
                  View your project assignments on the Dashboard
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <p className="text-xl text-gray-600 mt-4">Page not found</p>
              <a
                href="/"
                className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
