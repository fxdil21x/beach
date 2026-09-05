import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, GuestRoute, RoleRedirect } from './components/layout/ProtectedRoute.jsx';
import DeviceFrameLayout from './components/layout/DeviceFrameLayout.jsx';
import { AppShellSkeleton } from './components/ui/Skeleton.jsx';

import Login from './pages/auth/Login.jsx';
const Register = lazy(() => import('./pages/auth/Register.jsx'));

// ── Lazy-loaded User Pages ──
const UserDashboard = lazy(() => import('./pages/user/home/index.js'));
const MyVisits = lazy(() => import('./pages/user/MyVisits.jsx'));
const UserServices = lazy(() => import('./pages/user/Services.jsx'));
const BeachRules = lazy(() => import('./pages/user/BeachRules.jsx'));
const UserReportIssue = lazy(() => import('./pages/user/ReportIssue.jsx'));
const UserProfile = lazy(() => import('./pages/user/Profile.jsx'));

// ── Lazy-loaded Admin Pages ──
const Scanner = lazy(() => import('./pages/admin/Scanner.jsx'));
const AdminResidentSearch = lazy(() => import('./pages/admin/ResidentSearch.jsx'));
const RecentEntries = lazy(() => import('./pages/admin/RecentEntries.jsx'));
const AdminReports = lazy(() => import('./pages/admin/Reports.jsx'));
const AdminProfile = lazy(() => import('./pages/admin/Profile.jsx'));

// ── Master Admin Layout & Pages ──
import MasterLayout from './pages/master/MasterLayout.jsx';
const MasterDashboard = lazy(() => import('./pages/master/Dashboard.jsx'));
const ImportResidents = lazy(() => import('./pages/master/ImportResidents.jsx'));
const ResidentRecords = lazy(() => import('./pages/master/ResidentRecords.jsx'));
const RegisteredResidents = lazy(() => import('./pages/master/RegisteredResidents.jsx'));
const Admins = lazy(() => import('./pages/master/Admins.jsx'));
const ResidentEntries = lazy(() => import('./pages/master/ResidentEntries.jsx'));
const VisitorEntries = lazy(() => import('./pages/master/VisitorEntries.jsx'));
const Analytics = lazy(() => import('./pages/master/Analytics.jsx'));
const MasterReports = lazy(() => import('./pages/master/Reports.jsx'));
const MasterNotifications = lazy(() => import('./pages/master/Notifications.jsx'));
const MasterFeatureSettings = lazy(() => import('./pages/master/FeatureSettings.jsx'));
const MasterTrackUser = lazy(() => import('./pages/master/TrackUser.jsx'));
const MasterActivityLogs = lazy(() => import('./pages/master/AuditLogs.jsx'));
const ServicesManagement = lazy(() => import('./pages/master/ServicesManagement.jsx'));
const TabMaintenance = lazy(() => import('./pages/master/TabMaintenance.jsx'));
const Appearance = lazy(() => import('./pages/master/Appearance.jsx'));

// ── Lazy-loaded Public Pages ──
const VisitorEntry = lazy(() => import('./pages/public/VisitorEntry.jsx'));
const EntrySuccess = lazy(() => import('./pages/public/EntrySuccess.jsx'));
const PublicIssueReport = lazy(() => import('./pages/public/PublicIssueReport.jsx'));

import { EmergencyProvider } from './context/EmergencyContext.jsx';
import { FeatureProvider } from './context/FeatureContext.jsx';
import AdminEmergencyOverlay from './components/notifications/AdminEmergencyOverlay.jsx';
import VoiceCallOverlay from './components/notifications/VoiceCallOverlay.jsx';
import UserLocationTracker from './components/user/UserLocationTracker.jsx';

import UserLayout from './pages/user/UserLayout.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';

export default function App() {
  return (
    <AuthProvider>
      <FeatureProvider>
        <EmergencyProvider>
          <BrowserRouter>
            <Suspense fallback={<AppShellSkeleton />}>
              <Routes>
              <Route path="/" element={<RoleRedirect />} />

              <Route element={<DeviceFrameLayout />}>
                <Route element={<GuestRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route path="/entry" element={<VisitorEntry />} />
                <Route path="/entry/success" element={<EntrySuccess />} />
                <Route path="/report" element={<PublicIssueReport />} />

                {/* User Portal Layout with persistent BottomNavigation */}
                <Route element={<UserLayout />}>
                  <Route path="/user/home" element={<UserDashboard />} />
                  <Route path="/user/search" element={<Navigate to="/user/home" replace />} />
                  <Route path="/user/beach-rules" element={<BeachRules />} />
                  <Route path="/user/report" element={<UserReportIssue />} />

                  <Route element={<ProtectedRoute roles={['USER']} />}>
                    <Route path="/user/register" element={<Navigate to="/user/home" replace />} />
                    <Route path="/user/my-pass" element={<Navigate to="/user/home" replace />} />
                    <Route path="/user/my-visits" element={<MyVisits />} />
                    <Route path="/user/services" element={<UserServices />} />
                    <Route path="/user/profile" element={<UserProfile />} />
                  </Route>
                </Route>

                {/* Admin Portal Layout with persistent BottomNavigation */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/scan" element={<Scanner />} />
                    <Route path="/admin/search" element={<AdminResidentSearch />} />
                    <Route path="/admin/recent" element={<RecentEntries />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/admin" element={<Navigate to="/admin/search" replace />} />
                  </Route>
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['MASTER_ADMIN']} />}>
                <Route path="/master" element={<MasterLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<MasterDashboard />} />
                  <Route path="appearance" element={<Appearance />} />
                  <Route path="tab-maintenance" element={<TabMaintenance />} />
                  <Route path="services" element={<ServicesManagement />} />
                  <Route path="features" element={<MasterFeatureSettings />} />
                  <Route path="track-user" element={<MasterTrackUser />} />
                  <Route path="import" element={<ImportResidents />} />
                  <Route path="resident-records" element={<ResidentRecords />} />
                  <Route path="registered-residents" element={<RegisteredResidents />} />
                  <Route path="admins" element={<Admins />} />
                  <Route path="resident-entries" element={<ResidentEntries />} />
                  <Route path="visitor-entries" element={<VisitorEntries />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="activity-logs" element={<MasterActivityLogs />} />
                  <Route path="audit-logs" element={<Navigate to="/master/activity-logs" replace />} />
                  <Route path="notifications" element={<MasterNotifications />} />
                  <Route path="reports" element={<MasterReports />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

            {/* Global overlays — MUST be inside BrowserRouter so router hooks work */}
            <AdminEmergencyOverlay />
            <VoiceCallOverlay />
            <UserLocationTracker />
          </BrowserRouter>
        </EmergencyProvider>
      </FeatureProvider>
    </AuthProvider>
  );
}
