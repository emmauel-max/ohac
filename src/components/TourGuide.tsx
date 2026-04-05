import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./TourGuide.css";

interface TourStep {
  id: string;
  title: string;
  description: string;
}

const TOUR_STORAGE_PREFIX = "ohac:tour:done:";

const tourSteps: TourStep[] = [
  {
    id: "menu-toggle",
    title: "Open Navigation",
    description:
      "Use this button to open the main menu quickly, especially on mobile screens.",
  },
  {
    id: "sidebar-nav",
    title: "Main Sections",
    description:
      "These links move you between Dashboard, Courses, Chat, Events, and Announcements.",
  },
  {
    id: "dashboard-hero",
    title: "Dashboard Snapshot",
    description:
      "This area shows your greeting and role details so you can orient yourself at a glance.",
  },
  {
    id: "quick-links-section",
    title: "Quick Access",
    description:
      "Jump directly to key features from these shortcuts instead of browsing the full menu.",
  },
  {
    id: "announcements-section",
    title: "Latest Updates",
    description:
      "Stay current with announcements and open the full announcements page from here.",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function TourGuide() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const storageKey = useMemo(
    () => `${TOUR_STORAGE_PREFIX}${currentUser?.uid ?? "anonymous"}`,
    [currentUser?.uid]
  );

  const activeStep = tourSteps[currentStepIndex];

  const markTourDone = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, "1");
  }, [storageKey]);

  const closeTour = useCallback(
    (markDone: boolean) => {
      if (markDone) {
        markTourDone();
      }
      setIsOpen(false);
      setCurrentStepIndex(0);
      setRect(null);
      document.body.classList.remove("tour-scroll-lock");
    },
    [markTourDone]
  );

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handleStartTour = () => startTour();
    window.addEventListener("ohac:start-tour", handleStartTour);
    return () => window.removeEventListener("ohac:start-tour", handleStartTour);
  }, [startTour]);

  useEffect(() => {
    const handleResetTour = () => {
      window.localStorage.removeItem(storageKey);
      setIsOpen(false);
      setCurrentStepIndex(0);
      setRect(null);
    };

    window.addEventListener("ohac:reset-tour", handleResetTour);
    return () => window.removeEventListener("ohac:reset-tour", handleResetTour);
  }, [storageKey]);

  useEffect(() => {
    if (!currentUser || location.pathname !== "/portal") return;
    const seen = window.localStorage.getItem(storageKey) === "1";
    if (!seen) {
      startTour();
    }
  }, [currentUser, location.pathname, storageKey, startTour]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add("tour-scroll-lock");

    const updateHighlight = () => {
      const element = document.querySelector<HTMLElement>(`[data-tour-id="${activeStep.id}"]`);
      if (!element) {
        setRect(null);
        return;
      }

      const newRect = element.getBoundingClientRect();
      setRect(newRect);
    };

    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, true);

    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight, true);
      document.body.classList.remove("tour-scroll-lock");
    };
  }, [activeStep.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (activeStep.id === "sidebar-nav") {
      window.dispatchEvent(new Event("ohac:open-sidebar"));
    }
  }, [activeStep.id, isOpen]);

  if (!isOpen) return null;

  const isLastStep = currentStepIndex === tourSteps.length - 1;
  const isMobile = window.innerWidth < 768;
  const stepCounter = `${currentStepIndex + 1} / ${tourSteps.length}`;

  const cardTop = rect
    ? clamp(rect.bottom + 14, 16, window.innerHeight - (isMobile ? 250 : 220))
    : 80;
  const cardLeft = rect ? clamp(rect.left, 12, window.innerWidth - (isMobile ? 320 : 390)) : 12;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label="Feature tour">
      {rect && (
        <div
          className="tour-highlight"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
        />
      )}

      <div className="tour-tooltip" style={{ top: cardTop, left: cardLeft }}>
        <div className="tour-header">
          <strong>{activeStep.title}</strong>
          <span>{stepCounter}</span>
        </div>
        <p>{activeStep.description}</p>
        <div className="tour-actions">
          <button className="tour-secondary" onClick={() => closeTour(true)}>
            Skip Tour
          </button>
          <div className="tour-primary-actions">
            <button
              className="tour-secondary"
              onClick={() => setCurrentStepIndex((index) => Math.max(index - 1, 0))}
              disabled={currentStepIndex === 0}
            >
              Back
            </button>
            {isLastStep ? (
              <button className="tour-primary" onClick={() => closeTour(true)}>
                Finish
              </button>
            ) : (
              <button
                className="tour-primary"
                onClick={() => setCurrentStepIndex((index) => Math.min(index + 1, tourSteps.length - 1))}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
