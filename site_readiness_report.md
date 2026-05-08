# OHAC Website — Site Readiness Report

## Executive Summary
This document provides an overview of the current readiness state for the **Oguaa Hall Army Cadet (OHAC)** Progressive Web Application (PWA). The site is functional and successfully builds for production, but there are some technical debt items (primarily linting and chunk size warnings) to address prior to a full public release.

## Application Architecture & Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Backend & Hosting**: Firebase (Firestore for public data, Firebase Hosting)
- **PWA Support**: Vite PWA Plugin enabled

## Readiness Checklist

### 1. Build Status: ✅ Passed with Warnings
The application successfully compiles and builds.
- **Build Time:** ~1.89s
- **Warning:** Vite reported that some chunks are larger than 500 kB after minification (e.g., `index-[hash].js` is ~769 kB). 
  - *Recommendation:* Consider using dynamic `import()` for route-level code splitting or adjusting the Rollup `output.codeSplitting` strategy to improve initial load performance.

### 2. Linting & Code Quality: ❌ Failed (Action Required)
Running `npm run lint` reported **10 problems (8 errors, 2 warnings)**.
- **Errors (Fast Refresh):** Files like `src/hooks/useAuth.tsx`, `src/hooks/useUnreadCounts.tsx`, and `src/utils/linkify.tsx` are throwing `react-refresh/only-export-components` errors. Fast Refresh requires files exporting components to not mix with utility function exports. 
  - *Recommendation:* Separate constants/functions from component files.
- **Warnings (Hooks):** There are warnings related to `react-hooks/exhaustive-deps` (e.g., `useEffect` dependencies) and calling `setState()` inside an effect (`react-hooks/set-state-in-effect`) in files like `src/components/layout/GuidedTour.tsx`.
  - *Recommendation:* Refactor effects to ensure safe dependency management and prevent unintended re-renders.

### 3. Routing & Pages: ✅ Configured
Based on the project structure, the following routes are implemented:
- `/` (Home)
- `/about`
- `/officers`
- `/events`
- `/announcements`
- `/join`
- `/gallery`
- `/contact`

### 4. Backend Integration (Firebase): ✅ Configured
- **Firestore Rules:** Configured to allow unauthenticated reads for `announcements`, `events`, and `officers`, while restricting writes to authenticated users with the `admin` role.
- **Environment Variables:** Development relies on `.env.local` to populate Firebase credentials securely.

### 5. PWA Functionality: ✅ Configured
The site is set up as an installable Progressive Web App with service-worker caching via the `vite-plugin-pwa` integration.

## Next Steps for Launch
1. **Fix Linting Errors:** Resolve the React Fast Refresh errors to ensure a healthy development environment and prevent potential runtime module issues.
2. **Optimize Bundle Size:** Implement route-based code-splitting to bring the main JS bundle under the 500 kB threshold.
3. **Environment Setup Verification:** Ensure all production environment variables are properly injected into Firebase Hosting/GitHub Actions prior to deployment.
4. **Final QA:** Perform a final manual QA on all public routes (`/about`, `/join`, etc.) to confirm Firestore data loads correctly for unauthenticated users.

---
*Report generated on:* 2026-05-08
