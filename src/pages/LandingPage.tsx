import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Activity, FileText, Sparkles, BrainCircuit, Send } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Hero section fading out as we scroll down
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.25], [0, -100]);
  const textScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.9]);

  // Features title appearing
  const featureOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const featureY = useTransform(scrollYProgress, [0.2, 0.4], [50, 0]);

  // Floating Glass Cards settling into place (Scattered -> Grid)
  // Card 1: Top Left
  const c1X = useTransform(scrollYProgress, [0, 0.4], ["-30vw", "0vw"]);
  const c1Y = useTransform(scrollYProgress, [0, 0.4], ["15vh", "0vh"]);
  const c1R = useTransform(scrollYProgress, [0, 0.4], [-25, 0]);

  // Card 2: Top Right
  const c2X = useTransform(scrollYProgress, [0, 0.4], ["30vw", "0vw"]);
  const c2Y = useTransform(scrollYProgress, [0, 0.4], ["35vh", "0vh"]);
  const c2R = useTransform(scrollYProgress, [0, 0.4], [15, 0]);

  // Card 3: Bottom Left
  const c3X = useTransform(scrollYProgress, [0, 0.4], ["-20vw", "0vw"]);
  const c3Y = useTransform(scrollYProgress, [0, 0.4], ["45vh", "0vh"]);
  const c3R = useTransform(scrollYProgress, [0, 0.4], [20, 0]);

  // Card 4: Bottom Right
  const c4X = useTransform(scrollYProgress, [0, 0.4], ["35vw", "0vw"]);
  const c4Y = useTransform(scrollYProgress, [0, 0.4], ["10vh", "0vh"]);
  const c4R = useTransform(scrollYProgress, [0, 0.4], [-15, 0]);

  const handleStartAnalysis = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/search');
    }, 1500);
  };

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-[#f8fafc] dark:bg-[#000000] overflow-x-hidden font-sans selection:bg-zinc-800">
      
      {/* Navigation Transition Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
              className="absolute inset-0 bg-white dark:bg-[#000000] z-40"
            />
            <motion.div
              initial={{ x: "-50vw", y: "50vh", scale: 0.5, opacity: 0 }}
              animate={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{ x: -300, y: -200, rotate: -45, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" }}
                style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                className="absolute"
              >
                <Send className="w-24 h-24 text-zinc-400 dark:text-zinc-200 drop-shadow-2xl" strokeWidth={1} fill="currentColor" />
              </motion.div>
              <motion.div
                initial={{ x: 0, y: 0, rotate: 0 }}
                animate={{ x: 300, y: 200, rotate: 45, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" }}
                style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}
                className="absolute"
              >
                <Send className="w-24 h-24 text-zinc-400 dark:text-zinc-200 drop-shadow-2xl" strokeWidth={1} fill="currentColor" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none mix-blend-overlay [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

        {/* Hero Section */}
        <motion.div
          style={{ opacity: textOpacity, y: textY, scale: textScale }}
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6"
        >
          <div className="pointer-events-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-medium tracking-wide mb-8 shadow-sm dark:shadow-2xl">
              <Sparkles size={14} className="text-blue-500 dark:text-zinc-400" />
              NEXT-GEN DISCOVERY ENGINE
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tighter text-zinc-900 dark:text-white leading-[1.1] mb-8 max-w-4xl">
              Autonomous <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-zinc-400 dark:to-zinc-700">
                Research Platform
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl text-center mb-10 font-light leading-relaxed">
              Analyze clinical trials, literature, and regulatory data in seconds using advanced multi-agent orchestrations.
            </p>
            
            <button
              onClick={handleStartAnalysis}
              className="h-14 px-10 text-sm tracking-wide font-medium bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-full transition-all duration-300 shadow-[0_0_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105"
            >
              Start Analysis
            </button>
          </div>
        </motion.div>

        {/* Features Title */}
        <motion.div
          style={{ opacity: featureOpacity, y: featureY }}
          className="absolute top-[10%] md:top-[15%] flex flex-col items-center z-10 w-full px-6 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-zinc-900 dark:text-white tracking-tight">Unified Intelligence</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 text-base md:text-lg font-light max-w-xl">Watch as scattered data points converge into a structured, actionable pipeline.</p>
        </motion.div>

        {/* Floating Glassmorphic Features Grid */}
        <div className="absolute inset-0 flex items-center justify-center z-10 mt-[15vh] md:mt-24 pointer-events-none px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl pointer-events-auto">
            
            {/* Feature 1 */}
            <motion.div style={{ x: c1X, y: c1Y, rotate: c1R }} className="w-full">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="h-full">
                <div className="bg-white/80 dark:bg-[#09090b]/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 backdrop-blur-2xl p-8 rounded-3xl flex flex-col h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-500 group">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Search className="text-blue-600 dark:text-zinc-200 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Instant Search</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">Query millions of data points instantly across global databases and private registries with deep semantic understanding.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div style={{ x: c2X, y: c2Y, rotate: c2R }} className="w-full">
              <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="h-full">
                <div className="bg-white/80 dark:bg-[#09090b]/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 backdrop-blur-2xl p-8 rounded-3xl flex flex-col h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-500 group">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-500">
                    <BrainCircuit className="text-blue-600 dark:text-zinc-200 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">AI Synthesis</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">Multi-agent systems synthesize complex pharmacological papers and disparate data into actionable insights.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div style={{ x: c3X, y: c3Y, rotate: c3R }} className="w-full">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="h-full">
                <div className="bg-white/80 dark:bg-[#09090b]/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 backdrop-blur-2xl p-8 rounded-3xl flex flex-col h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-500 group">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Activity className="text-blue-600 dark:text-zinc-200 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Real-time Data</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">Live tracking and dynamic monitoring of competitive clinical trials and shifting regulatory pathways.</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div style={{ x: c4X, y: c4Y, rotate: c4R }} className="w-full">
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="h-full">
                <div className="bg-white/80 dark:bg-[#09090b]/80 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 backdrop-blur-2xl p-8 rounded-3xl flex flex-col h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-colors duration-500 group">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-500">
                    <FileText className="text-blue-600 dark:text-zinc-200 w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight">Structured Reports</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">Automated generation of submission-ready evaluation reports, detailed target profiles, and viability scores.</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
