import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RouteLoadingState from './components/RouteLoadingState';
import { AuthProvider } from './hooks/useAuth';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const DepartmentWorkspace = lazy(() => import('./components/DepartmentWorkspace'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const WorkWithUs = lazy(() => import('./pages/WorkWithUs'));
const PositionDetail = lazy(() => import('./pages/PositionDetail'));
const ApplicationForm = lazy(() => import('./pages/ApplicationForm'));
const Team = lazy(() => import('./pages/Team'));
const Departments = lazy(() => import('./pages/Departments'));
const Projects = lazy(() => import('./pages/Projects'));
const Meetings = lazy(() => import('./pages/Meetings'));
const MeetingForm = lazy(() => import('./pages/MeetingForm'));
const MeetingDetail = lazy(() => import('./pages/MeetingDetail'));
const MeetingCalendar = lazy(() => import('./pages/MeetingCalendar'));
const Documents = lazy(() => import('./pages/Documents'));
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'));
const KnowledgeBase = lazy(() => import('./pages/KnowledgeBase'));
const KnowledgeDetail = lazy(() => import('./pages/KnowledgeDetail'));
const Research = lazy(() => import('./pages/Research'));
const ResearchDetail = lazy(() => import('./pages/ResearchDetail'));
const RecruitmentDashboard = lazy(() => import('./pages/RecruitmentDashboard'));
const ApplicantDetail = lazy(() => import('./pages/ApplicantDetail'));
const Reports = lazy(() => import('./pages/Reports'));
const Search = lazy(() => import('./pages/Search'));
const MessagesPage = lazy(() => import('./pages/Messages'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

const placeholderRoutes = [
  'departments', 'calendar', 'meetings', 'profile',
];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteLoadingState />}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/work-with-us" element={<WorkWithUs />} />
            <Route path="/work-with-us/application" element={<ApplicationForm />} />
            <Route path="/work-with-us/:positionId" element={<PositionDetail />} />
            <Route path="/work-with-us/:positionId/apply" element={<ApplicationForm />} />

            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="team" element={<Team />} />
              <Route path="departments" element={<Departments />} />
              <Route path="departments/:departmentId" element={<DepartmentWorkspace />} />
              <Route path="projects" element={<Projects />} />
              <Route path="tasks" element={<Projects />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="meetings/new" element={<MeetingForm />} />
              <Route path="meetings/:meetingId" element={<MeetingDetail />} />
              <Route path="meetings/:meetingId/edit" element={<MeetingForm editMode />} />
              <Route path="calendar" element={<MeetingCalendar />} />
              <Route path="documents" element={<Documents />} />
              <Route path="documents/:documentId" element={<DocumentDetail />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="knowledge-base/:articleId" element={<KnowledgeDetail />} />
              <Route path="research" element={<Research />} />
              <Route path="research/:researchId" element={<ResearchDetail />} />
              <Route path="recruitment" element={<RecruitmentDashboard />} />
              <Route path="recruitment/:applicantId" element={<ApplicantDetail />} />
              <Route path="reports" element={<ProtectedRoute scope="reports"><Reports /></ProtectedRoute>} />
              <Route path="search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
              <Route path="audit" element={<ProtectedRoute scope="activities"><Settings initialTab="Audit Log" /></ProtectedRoute>} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<Settings />} />
              {placeholderRoutes.filter((route) => !['departments', 'projects', 'tasks', 'documents', 'knowledge-base', 'research', 'recruitment', 'messages', 'notifications', 'calendar', 'meetings'].includes(route)).map((route) => (
                <Route
                  key={route}
                  path={route}
                  element={<PlaceholderPage title={route.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())} />}
                />
              ))}
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
