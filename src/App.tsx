import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import OverallEmployees from './pages/OverallEmployees';
import EmployeeDetails from './pages/EmployeeDetails';
import EditEmployee from './pages/EditEmployee';
import ActiveEmployees from './pages/ActiveEmployees';
import NewJoiner from './pages/NewJoiner';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LeavePermission from './pages/LeavePermission';

import Attendance from './pages/Attendance';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes wrapped with Layout and Auth Guard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Admin/HR Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Admin', 'HR Manager', 'admin']} />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="employees" element={<OverallEmployees />} />
                <Route path="employees/:id" element={<EmployeeDetails />} />
                <Route path="employees/:id/edit" element={<EditEmployee />} />
                <Route path="active-employees" element={<ActiveEmployees />} />
                <Route path="new-joiners" element={<NewJoiner />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Shared Routes */}
              <Route path="leave-permission" element={<LeavePermission />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
