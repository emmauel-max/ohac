import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout/PublicLayout";
import Announcements from "./components/Announcements";
import Events from "./components/Events";
import Officers from "./components/Officers";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Courses from "./components/Courses/Courses";
import Chat from "./components/Chat/Chat";
import Admin from "./components/Admin/Admin";
import LogisticsManagement from "./components/LogisticsManagement";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import CodeOfConduct from "./components/CodeOfConduct";
import Faq from "./components/Faq";
import { AuthProvider } from "./hooks/AuthProvider";
import { useAuth } from "./hooks/useAuth";
// Public pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Join from "./pages/Join/Join";
import Gallery from "./pages/Gallery/Gallery";
import Contact from "./pages/Contact/Contact";
import "./index.css";
import "./styles/linkify.css";
import "./styles/public.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <PublicLayout>
        <div style={{ padding: "2rem 1rem", textAlign: "center" }}>Checking sign-in status…</div>
      </PublicLayout>
    );
  }
  return currentUser ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
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
          <PublicLayout>
            <Officers />
          </PublicLayout>
        }
      />
      <Route
        path="/events"
        element={
          <PublicLayout>
            <Events />
          </PublicLayout>
        }
      />
      <Route
        path="/announcements"
        element={
          <PublicLayout>
            <Announcements />
          </PublicLayout>
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
      <Route
        path="/portal"
        element={
          <RequireAuth>
            <PublicLayout>
              <Dashboard />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <PublicLayout>
              <Profile />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/courses"
        element={
          <RequireAuth>
            <PublicLayout>
              <Courses />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/chat"
        element={
          <RequireAuth>
            <PublicLayout>
              <Chat />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <PublicLayout>
              <Admin />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/logistics"
        element={
          <RequireAuth>
            <PublicLayout>
              <LogisticsManagement />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <RequireAuth>
            <PublicLayout>
              <PrivacyPolicy />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <RequireAuth>
            <PublicLayout>
              <TermsOfService />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/code-of-conduct"
        element={
          <RequireAuth>
            <PublicLayout>
              <CodeOfConduct />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/faq"
        element={
          <RequireAuth>
            <PublicLayout>
              <Faq />
            </PublicLayout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
