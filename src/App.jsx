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
import { ScenariosPage } from "@pages/ScenariosPage";
import { MyScenariosPage } from "@pages/MyScenariosPage";

function App() {
  const protectedRoutes = [
    { path: "/", element: <DashboardsPage /> },
    { path: "/dashboards", element: <DashboardsPage /> },
    { path: "/templates", element: <TemplatesPage /> },
    { path: "/my-scenarios", element: <MyScenariosPage /> },
    { path: "/scenarios", element: <ScenariosPage /> },
    { path: "/videos", element: <VideosPage /> },
    { path: "/settings", element: <SettingsPage /> },
    { path: "/support", element: <SupportPage /> },
    { path: "/create_dashboard", element: <DashboardPage /> },
    { path: "/edit_dashboard/:dashboardId", element: <EditDashboardPage /> },
    { path: "/dashboard-fullscreen", element: <DashboardFullscreen /> },
    { path: "/widget-fullscreen", element: <WidgetFullscreen /> },
    { path: "/video/:videoId", element: <VideoPage /> },
    { path: "/video/:videoId/view", element: <VideoPage /> },
    { path: "*", element: <DashboardsPage /> },
  ];

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              // element={<ProtectedRoute>{element}</ProtectedRoute>}
              element={element}
            />
          ))}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
