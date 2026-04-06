import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.scss";
import "./styles/simplebar-overrides.scss";
import { DashboardFullscreen } from "@pages/DashboardFullscreen";
import { WidgetFullscreen } from "@pages/WidgetFullscreen";
import { DashboardPage } from "@pages/DashboardPage";
import { VideoPage } from "@pages/VideoPage";
import { DashboardsPage } from "@pages/DashboardsPage";
import { TemplatesPage } from "@pages/TemplatesPage";
import { VideosPage } from "@pages/VideosPage";
import { SettingsPage } from "@pages/SettingsPage";
import { SupportPage } from "@pages/SupportPage";
import { AuthProvider } from "@contexts/AuthContext";
import { ProtectedRoute } from "@routes/ProtectedRoute";
import { LoginForm } from "@auth/LoginForm";
import { RegisterForm } from "@auth/RegisterForm";
import { EditDashboardPage } from "@pages/EditDashboardPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboards"
            element={
              <ProtectedRoute>
                <DashboardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <TemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <VideosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create_dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit_dashboard/:dashboardId"
            element={
              <ProtectedRoute>
                <EditDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-fullscreen"
            element={
              <ProtectedRoute>
                <DashboardFullscreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/widget-fullscreen"
            element={
              <ProtectedRoute>
                <WidgetFullscreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:videoId"
            element={
              <ProtectedRoute>
                <VideoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:videoId/view"
            element={
              <ProtectedRoute>
                <VideoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <ProtectedRoute>
                <DashboardsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
