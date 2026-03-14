  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { Search, Activity, FileText, Sparkles, BrainCircuit, Send } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { motion, AnimatePresence } from 'framer-motion';
  import { useAuth } from '../contexts/AuthContext';

  export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isNavigating, setIsNavigating] = useState(false);

    const glassStyle = "bg-background/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]";

    const handleStartAnalysis = () => {
      if (!user) {
        // Not logged in → redirect to login
        navigate('/login');
        return;
      }
      // Logged in → animate and go to search
      setIsNavigating(true);
      setTimeout(() => {
        navigate('/search');
      }, 1500);
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full min-h-screen overflow-hidden">
        
        <AnimatePresence>
          {isNavigating && (
            <motion.div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
              
              {/* Overlay to conceal transition to next page */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.1 }}
                className="absolute inset-0 bg-background z-40"
              />

              <motion.div
                initial={{ x: "-50vw", y: "50vh", scale: 0.5, opacity: 0 }}
                animate={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-50 flex items-center justify-center"
              >
                {/* Left half of plane */}
                <motion.div
                  initial={{ x: 0, y: 0, rotate: 0 }}
                  animate={{ x: -300, y: -200, rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" }}
                  style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                  className="absolute"
                >
                  <Send className="w-24 h-24 text-primary drop-shadow-2xl" strokeWidth={1.5} fill="currentColor" />
                </motion.div>
                
                {/* Right half of plane */}
                <motion.div
                  initial={{ x: 0, y: 0, rotate: 0 }}
                  animate={{ x: 300, y: 200, rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" }}
                  style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
                  className="absolute"
                >
                  <Send className="w-24 h-24 text-primary drop-shadow-2xl" strokeWidth={1.5} fill="currentColor" />
                </motion.div>
              </motion.div>
              
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Elements Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-[15%] left-[10%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
          >
            <div className="p-2 bg-primary/20 rounded-full"><Search className="text-primary w-5 h-5"/></div>
            <span className="font-semibold text-sm text-foreground">Instant Search</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 25, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={`absolute top-[25%] right-[12%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
          >
            <div className="p-2 bg-primary/20 rounded-full"><BrainCircuit className="text-primary w-5 h-5"/></div>
            <span className="font-semibold text-sm text-foreground">AI Synthesis</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className={`absolute bottom-[20%] left-[15%] p-4 rounded-2xl flex flex-col gap-2 w-48 ${glassStyle}`}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-full"><Activity className="text-primary w-4 h-4"/></div>
              <span className="font-semibold text-xs text-foreground">Real-time Data</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary" animate={{ width: ["0%", "100%", "0%"] }} transition={{ duration: 4, repeat: Infinity }} />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className={`absolute bottom-[25%] right-[10%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
          >
            <div className="p-2 bg-primary/20 rounded-full"><FileText className="text-primary w-5 h-5"/></div>
            <span className="font-semibold text-sm text-foreground">Structured Reports</span>
          </motion.div>
        </div>

        <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-4">
              <Sparkles size={16} />
              Next Gen Discovery
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Autonomous <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Research Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Analyze clinical trials, literature, and regulatory data in seconds using agentic workflows.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={handleStartAnalysis}
              className="h-16 px-10 text-xl font-semibold shadow-[0_0_40px_-10px_rgba(102,16,242,0.8)] rounded-full hover:scale-105 transition-transform"
            >
              Start Analysis
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

