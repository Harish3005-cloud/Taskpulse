import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./index.css"
import "./styles/dashboard.css"
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { CommandPaletteProvider } from "./context/CommandPaletteContext";
import { RealTimeProvider } from "./context/RealTimeContext";

import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import AuthSuccessPage from "./pages/AuthSuccessPage";
import InvitePage from "./pages/InvitePage";

// Dashboard Components
import DashboardLayout from "./layouts/DashboardLayout";
import Inbox from "./components/inbox/Inbox";
import MyTasks from "./components/tasks/MyTasks";
import TaskBoard from "./components/projects/TaskBoard";
import ViewsPage from "./components/views/ViewsPage";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";
import TeamTasksView from "./components/tasks/TeamTasksView";
import TaskDetail from "./components/tasks/TaskDetail";
import SettingsPage from "./components/settings/SettingsPage";
import TeamOverview from "./components/team/TeamOverview";
import ProjectDashboard from "./components/projects/ProjectDashboard";
import ProjectDetails from "./components/projects/ProjectDetails";
import CommandCenter from "./components/dashboard/CommandCenter";
import AIPage from "./components/ai/AIPage";

/**
 * Redirects authenticated users away from public pages (/, /login, /signup)
 */
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  
  // Hide navbar on auth pages and anywhere inside the dashboard
  const hideNavbar = ['/login', '/signup', '/auth/success'].includes(location.pathname) || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/invite');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />
        
        <Route path="/dashboard" element={
          <WorkspaceProvider>
            <RealTimeProvider>
              <CommandPaletteProvider>
                <DashboardLayout />
              </CommandPaletteProvider>
            </RealTimeProvider>
          </WorkspaceProvider>
        }>
          {/* Default redirect for /dashboard to /dashboard/command-center */}
          <Route index element={<Navigate to="command-center" replace />} />
          
          <Route path="command-center" element={<CommandCenter />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="my-tasks" element={<MyTasks />} />
          <Route path="projects/:projectId" element={<TaskBoard />} />
          <Route path="views/:viewId" element={<TaskBoard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="settings/*" element={<SettingsPage />} />
          
          {/* Team-specific views */}
          <Route path=":teamSlug" element={<TeamOverview />} />
          <Route path=":teamSlug/tasks" element={<TaskBoard />} />
          <Route path=":teamSlug/projects" element={<ProjectDashboard />} />
          <Route path=":teamSlug/projects/:projectId" element={<ProjectDetails />} />
          <Route path=":teamSlug/views" element={<ViewsPage />} />
          
          <Route path="task/:taskId" element={<TaskDetail />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;