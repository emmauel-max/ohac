import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { UnreadCountsProvider } from "./hooks/useUnreadCounts";
import Layout from "./components/Layout/Layout";
import PublicLayout from "./components/PublicLayout/PublicLayout";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import PublicProfile from "./components/PublicProfile";
import Courses from "./components/Courses/Courses";
import Chat from "./components/Chat/Chat";
import Admin from "./components/Admin/Admin";
import Announcements from "./components/Announcements";
import Events from "./components/Events";
import Officers from "./components/Officers";
import LogisticsManagement from "./components/LogisticsManagement";
import CodeOfConduct from "./components/CodeOfConduct";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Faq from "./components/Faq";
import TourGuide from "./components/TourGuide";
import NotificationBridge from "./components/NotificationBridge";
// Public pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Join from "./pages/Join/Join";
import Gallery from "./pages/Gallery/Gallery";
import Contact from "./pages/Contact/Contact";
import logo from "./assets/logo.png";
import splashBg from "./assets/background/splash-screen-background.jpg";
import "./index.css";
import "./styles/linkify.css";
import "./styles/public.css";

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
      {/* ── Public routes (no auth required) ── */}
      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to="/portal" replace />
          ) : (
            <PublicLayout>
              <Home />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/officers"
        element={
          currentUser ? (
            <ProtectedRoute>
              <Officers />
            </ProtectedRoute>
          ) : (
            <PublicLayout>
              <Officers />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/events"
        element={
          currentUser ? (
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          ) : (
            <PublicLayout>
              <Events />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/announcements"
        element={
          currentUser ? (
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          ) : (
            <PublicLayout>
              <Announcements />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/join"
        element={
          <PublicLayout>
            <Join />
          </PublicLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <PublicLayout>
            <Gallery />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />

      {/* ── Auth ── */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/portal" replace /> : <Login />}
      />

      {/* ── Authenticated portal ── */}
      <Route
        path="/portal"
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
        path="/logistics"
        element={
          <ProtectedRoute>
            <LogisticsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/code-of-conduct"
        element={
          <ProtectedRoute>
            <CodeOfConduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <ProtectedRoute>
            <TermsOfService />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <ProtectedRoute>
            <PrivacyPolicy />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faq"
        element={
          <ProtectedRoute>
            <Faq />
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
