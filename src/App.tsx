import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { UnreadCountsProvider } from "./hooks/useUnreadCounts";
import Layout from "./components/Layout/Layout";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";
import Courses from "./components/Courses/Courses";
import Chat from "./components/Chat/Chat";
import Admin from "./components/Admin/Admin";
import Announcements from "./components/Announcements";
import Events from "./components/Events";
import TourGuide from "./components/TourGuide";
import NotificationBridge from "./components/NotificationBridge";
import logo from "./assets/logo.png";
import splashBg from "./assets/background/splash-screen-background.jpg";
import "./index.css";
import "./styles/linkify.css";

const loadingStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  flexDirection: "column",
  gap: "1rem",
  backgroundImage: `linear-gradient(rgba(26, 42, 26, 0.7), rgba(26, 58, 26, 0.85)), url(${splashBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  color: "white",
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={loadingStyle}>
        <img
          src={logo}
          alt="OHAC logo"
          style={{ width: "64px", height: "64px", objectFit: "contain" }}
        />
        <p style={{ fontSize: "1.1rem", letterSpacing: "0.1em" }}>OHAC Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={loadingStyle}>
        <img
          src={logo}
          alt="OHAC logo"
          style={{ width: "64px", height: "64px", objectFit: "contain" }}
        />
        <p style={{ fontSize: "1.1rem", letterSpacing: "0.1em" }}>OHAC Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:uid"
        element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UnreadCountsProvider>
          <TourGuide />
          <NotificationBridge />
          <AppRoutes />
        </UnreadCountsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
