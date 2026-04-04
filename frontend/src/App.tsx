import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages to speed up initial Vite hot start
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const RepurposingPage = lazy(() => import('./pages/RepurposingPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const SharedReportPage = lazy(() => import('./pages/SharedReportPage'));
const PresentationDeckPage = lazy(() => import('./pages/PresentationDeckPage').then(m => ({ default: m.Presentation })));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const RAGChatPage = lazy(() => import('./pages/RAGChatPage'));

// A simple fallback for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden">
            {/* Global Radiant Effect Theme */}
            <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none z-0" />

            <ModeToggle />

            <main className="flex-1 flex flex-col relative z-10">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />


                  {/* Landing page is public — auth check happens on "Start Analysis" */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/shared/:token" element={<SharedReportPage />} />
                  <Route path="/pitch" element={<PresentationDeckPage />} />

                  {/* Protected routes */}
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute>
                        <SearchPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/progress/:id"
                    element={
                      <ProtectedRoute>
                        <ProgressPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report/:id"
                    element={
                      <ProtectedRoute>
                        <ReportPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/repurposing"
                    element={
                      <ProtectedRoute>
                        <RepurposingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/portfolio"
                    element={
                      <ProtectedRoute>
                        <PortfolioPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <ProtectedRoute>
                        <PricingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <ProtectedRoute>
                        <CommunityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rag"
                    element={
                      <ProtectedRoute>
                        <RAGChatPage />
                      </ProtectedRoute>
                    }
                  />

                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
