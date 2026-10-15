import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';

// Official pages
import OfficialDashboard from './pages/official/Dashboard';
import Profile from './pages/official/Profile';
import CompetencyAnalysis from './pages/official/CompetencyAnalysis';
import LearningPath from './pages/official/LearningPath';
import Courses from './pages/official/Courses';
import LearningMaterials from './pages/official/LearningMaterials';
import QuizList from './pages/official/Quiz';
import QuizAttempt from './pages/official/QuizAttempt';
import Results from './pages/official/Results';
import Progress from './pages/official/Progress';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Officials from './pages/admin/Officials';
import CompetencyManagement from './pages/admin/CompetencyManagement';
import AdminCourses from './pages/admin/AdminCourses';
import Analytics from './pages/admin/Analytics';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Official routes */}
      <Route element={<ProtectedRoute requiredRole="OFFICIAL"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<OfficialDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/competency" element={<CompetencyAnalysis />} />
        <Route path="/learning-path" element={<LearningPath />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/materials" element={<LearningMaterials />} />
        <Route path="/quiz" element={<QuizList />} />
        <Route path="/quiz/:id" element={<QuizAttempt />} />
        <Route path="/results" element={<Results />} />
        <Route path="/progress" element={<Progress />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute requiredRole="ADMIN"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/officials" element={<Officials />} />
        <Route path="/admin/competencies" element={<CompetencyManagement />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/analytics" element={<Analytics />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
