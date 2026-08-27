import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, GuestRoute, RoleRedirect } from './components/layout/ProtectedRoute.jsx';
import DeviceFrameLayout from './components/layout/DeviceFrameLayout.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

import UserDashboard from './pages/user/home/index.js';
import MyPass from './pages/user/MyPass.jsx';
import MyVisits from './pages/user/MyVisits.jsx';
import UserServices from './pages/user/Services.jsx';
import BeachRules from './pages/user/BeachRules.jsx';
import UserReportIssue from './pages/user/ReportIssue.jsx';
import UserProfile from './pages/user/Profile.jsx';

import Scanner from './pages/admin/Scanner.jsx';
import AdminResidentSearch from './pages/admin/ResidentSearch.jsx';
import RecentEntries from './pages/admin/RecentEntries.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminProfile from './pages/admin/Profile.jsx';

import { MasterLayout } from './pages/master/Dashboard.jsx';
import MasterDashboard from './pages/master/Dashboard.jsx';
import ImportResidents from './pages/master/ImportResidents.jsx';
import ResidentRecords from './pages/master/ResidentRecords.jsx';
import RegisteredResidents from './pages/master/RegisteredResidents.jsx';
import Admins from './pages/master/Admins.jsx';
import ResidentEntries from './pages/master/ResidentEntries.jsx';
import VisitorEntries from './pages/master/VisitorEntries.jsx';
import Analytics from './pages/master/Analytics.jsx';
import MasterReports from './pages/master/Reports.jsx';
import MasterNotifications from './pages/master/Notifications.jsx';
import MasterFeatureSettings from './pages/master/FeatureSettings.jsx';
import MasterTrackUser from './pages/master/TrackUser.jsx';
import MasterActivityLogs from './pages/master/AuditLogs.jsx';
import ServicesManagement from './pages/master/ServicesManagement.jsx';
import TabMaintenance from './pages/master/TabMaintenance.jsx';

import VisitorEntry from './pages/public/VisitorEntry.jsx';
import EntrySuccess from './pages/public/EntrySuccess.jsx';
import PublicIssueReport from './pages/public/PublicIssueReport.jsx';

import { EmergencyProvider } from './context/EmergencyContext.jsx';
import { FeatureProvider } from './context/FeatureContext.jsx';
import AdminEmergencyOverlay from './components/notifications/AdminEmergencyOverlay.jsx';
import VoiceCallOverlay from './components/notifications/VoiceCallOverlay.jsx';
import UserLocationTracker from './components/user/UserLocationTracker.jsx';

export default function App() {
  return (
    <AuthProvider>
      <FeatureProvider>
        <EmergencyProvider>
          <BrowserRouter>
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

                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/admin/scan" element={<Scanner />} />
                  <Route path="/admin/search" element={<AdminResidentSearch />} />
                  <Route path="/admin/recent" element={<RecentEntries />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  <Route path="/admin" element={<Navigate to="/admin/search" replace />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['MASTER_ADMIN']} />}>
                <Route path="/master" element={<MasterLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<MasterDashboard />} />
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
