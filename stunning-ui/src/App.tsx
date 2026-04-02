/**
 * ✦ STUNNING UI — App Router
 * Lazy-loaded pages with Suspense, global aurora effects, scroll to top.
 */
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

/* Lazy-loaded pages */
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const ReportPage = React.lazy(() => import('./pages/ReportPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const RepurposingPage = React.lazy(() => import('./pages/RepurposingPage'));
const AISynthesisPage = React.lazy(() => import('./pages/AISynthesisPage'));
const SharedReportPage = React.lazy(() => import('./pages/SharedReportPage'));

/* Page loading spinner */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
      </div>
    </div>
  );
}

/* Scroll restoration */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/shared/:token" element={<SharedReportPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Protected (no auth guard in demo — just renders) */}
          <Route path="/search" element={<SearchPage />} />
          <Route path="/progress/:id" element={<ProgressPage />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/repurposing" element={<RepurposingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/synthesis" element={<AISynthesisPage />} />

          {/* 404 */}
          <Route path="*" element={
            <div className="flex min-h-screen items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-muted-foreground/20">404</h1>
                <p className="mt-2 text-muted-foreground">Page not found</p>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
