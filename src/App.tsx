import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout/PublicLayout";
import Announcements from "./components/Announcements";
import Events from "./components/Events";
import Officers from "./components/Officers";
// Public pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Join from "./pages/Join/Join";
import Gallery from "./pages/Gallery/Gallery";
import Contact from "./pages/Contact/Contact";
import "./index.css";
import "./styles/linkify.css";
import "./styles/public.css";

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
