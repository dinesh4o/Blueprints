import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import ProgressPage from './pages/ProgressPage';
import ReportPage from './pages/ReportPage';
import PortfolioPage from './pages/PortfolioPage';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
          {/* Global Radiant Effect Theme */}
          <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none z-0" />
          
          <ModeToggle />
          
          <main className="flex-1 flex flex-col relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/progress/:id" element={<ProgressPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
