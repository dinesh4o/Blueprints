import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "iconify-icon";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export function Presentation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal Observer
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".fade-up, .scale-in").forEach((el) => observer.observe(el));

    // Horizontal Scroll
    const updateScroll = () => {
      if (!containerRef.current || !trackRef.current || !progressRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const scrollProgress = Math.abs(rect.top) / (rect.height - window.innerHeight);
        const maxScroll = trackRef.current.scrollWidth - window.innerWidth;
        trackRef.current.style.transform = `translate3d(-${scrollProgress * maxScroll}px, 0, 0)`;
        progressRef.current.style.width = `${scrollProgress * 100}%`;
      } else if (rect.top > 0) {
        trackRef.current.style.transform = `translate3d(0, 0, 0)`;
        progressRef.current.style.width = `0%`;
      } else if (rect.bottom < window.innerHeight) {
        const maxScroll = trackRef.current.scrollWidth - window.innerWidth;
        trackRef.current.style.transform = `translate3d(-${maxScroll}px, 0, 0)`;
        progressRef.current.style.width = `100%`;
      }
    };
    window.addEventListener("scroll", updateScroll);

    // Expansion Level Sequences
    const expandContainer = document.getElementById("expansion-container");
    if (expandContainer) {
      const expandTl = gsap.timeline({
        scrollTrigger: {
          trigger: expandContainer,
          start: "top 60%",
          end: "bottom 80%",
          scrub: 1,
        },
      });

      expandTl
        .to(".seq-node:nth-of-type(1)", { opacity: 1, y: 0, duration: 1 })
        .to(".seq-line:nth-of-type(1)", { scaleY: 1, duration: 1.5, ease: "none" })
        .to(".seq-line-h:nth-of-type(1)", { scaleX: 1, duration: 1, ease: "power1.inOut" }, "-=0.5")
        .to(
          ".seq-node:nth-of-type(2), .seq-node:nth-of-type(3)",
          { opacity: 1, y: 0, duration: 1, stagger: 0.2 },
          "-=0.2"
        )
        .to(
          ".seq-line:nth-of-type(2), .seq-line:nth-of-type(3)",
          { scaleY: 1, duration: 1.5, ease: "none", stagger: 0.1 }
        )
        .to(".seq-line-h:nth-of-type(2)", { scaleX: 1, duration: 1, ease: "power1.inOut" }, "-=0.5")
        .to(
          ".seq-node:nth-of-type(4), .seq-node:nth-of-type(5), .seq-node:nth-of-type(6)",
          { opacity: 1, y: 0, duration: 1, stagger: 0.15 },
          "-=0.2"
        );
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <div className="bg-[#000] text-gray-200 overflow-x-hidden select-none font-sans presentation-root">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Core Animations */
        .presentation-root {
          --brand-bg: #000;
        }
        .bg-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .schema-card-enhanced {
          background-color: #161616;
          background-image: linear-gradient(#161616, #161616), linear-gradient(to bottom right, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.05));
          background-origin: padding-box, border-box;
          background-clip: padding-box, border-box;
          border: 1px solid transparent;
        }
        .schema-card-enhanced:hover {
          background-color: #1c1c1c;
          background-image: linear-gradient(#1c1c1c, #1c1c1c), linear-gradient(to bottom right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.15));
        }
        .schema-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.18) 58%, rgba(0, 0, 0, 0.42) 80%, rgba(0, 0, 0, 0.72) 100%);
          z-index: 10;
        }
        @keyframes core-pulse-anim {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 40px rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.1); }
          50% { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 80px rgba(255,255,255,0.7), inset 0 0 40px rgba(255,255,255,0.3); }
        }
        @keyframes radar-pull-anim {
          0% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
          10% { opacity: 0.2; }
          80% { opacity: 0.6; border-width: 1px; }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; border-width: 3px; }
        }
        @keyframes gravity-well-anim {
          0% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1.1) rotate(calc(var(--rot) * -1)); opacity: 0; filter: blur(4px); }
          15% { opacity: 1; filter: blur(0px); transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(0deg); }
          60% { transform: translate(calc(-50% + var(--tx)*0.6), calc(-50% + var(--ty)*0.6)) scale(0.85) rotate(var(--rot)); opacity: 1; filter: blur(0px); }
          85% { transform: translate(calc(-50% + var(--tx)*0.2), calc(-50% + var(--ty)*0.2)) scale(0.4) rotate(calc(var(--rot) * 2)); opacity: 0.8; filter: blur(2px); }
          100% { transform: translate(-50%, -50%) scale(0) rotate(calc(var(--rot) * 3)); opacity: 0; filter: blur(8px); }
        }
        .anim-bar-1 { animation: barPulse1 2s ease-in-out infinite alternate; }
        .anim-bar-2 { animation: barPulse2 2.5s ease-in-out infinite alternate; }
        .anim-bar-3 { animation: barPulse3 1.8s ease-in-out infinite alternate; }
        .anim-bar-4 { animation: barPulse4 2.2s ease-in-out infinite alternate; }
        .anim-bar-5 { animation: barPulse5 2.7s ease-in-out infinite alternate; }
        @keyframes barPulse1 { 0% { height: 30%; } 100% { height: 70%; } }
        @keyframes barPulse2 { 0% { height: 60%; } 100% { height: 95%; } }
        @keyframes barPulse3 { 0% { height: 40%; } 100% { height: 80%; } }
        @keyframes barPulse4 { 0% { height: 75%; } 100% { height: 45%; } }
        @keyframes barPulse5 { 0% { height: 50%; } 100% { height: 85%; } }

        .typewriter-text {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid #fff;
          width: 17ch;
          animation: type 5s steps(17, end) infinite, blink 0.8s step-end infinite;
        }
        @keyframes type {
          0%, 10% { width: 0; }
          40%, 90% { width: 17ch; }
          100% { width: 0; }
        }
        @keyframes blink { 0%, 100% { border-color: transparent; } 50% { border-color: #fff; } }
      `}} />

      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center border-b border-white/5">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="text-center z-10 p-6">
          <motion.div
            initial={{ filter: "blur(20px)", opacity: 0, y: 30 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
                Blueprints Pitch Deck
              </span>
            </div>
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent pb-4">
              Blueprints Platform
            </h1>
            <p className="text-xl md:text-2xl text-neutral-400 font-light mt-4 max-w-2xl mx-auto">
              Accelerating drug repurposing through AI-driven target discovery, clinical intelligence, and predictive analytics.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Primitives Map to Capabilities */}
      <section className="bg-black z-10 pt-32 pb-32 relative px-6" id="capabilities">
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-20">
          <div className="flex items-center gap-6 mb-20 fade-up">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">
              Platform Architecture
            </h2>
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-[10px] font-mono text-neutral-500">
              CORE_CAPABILITIES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group fade-up" style={{ perspective: "1200px" }}>
              <div className="relative p-10 rounded-3xl bg-[#0a0a0a] border border-white/[0.1] h-full flex flex-col hover:border-emerald-500/50 transition-colors duration-500">
                <div className="text-[9px] font-mono text-neutral-500 border border-white/10 px-2 py-1 rounded w-max mb-6">01</div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Knowledge Graph Engine</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-1">
                  Synthesizing billion-scale biological, chemical, and clinical data points to discover hidden therapeutic relationships.
                </p>
                <div className="w-full bg-white/5 h-[3px] overflow-hidden"><div className="w-1/3 bg-emerald-500 h-full" /></div>
              </div>
            </div>

            <div className="relative group fade-up md:mt-12" style={{ perspective: "1200px", transitionDelay: "100ms" }}>
              <div className="relative p-10 rounded-3xl bg-[#0a0a0a] border border-white/[0.1] h-full flex flex-col hover:border-blue-500/50 transition-colors duration-500">
                <div className="text-[9px] font-mono text-neutral-500 border border-white/10 px-2 py-1 rounded w-max mb-6">02</div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Clinical Trial Optimization</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-1">
                  Optimizing trial parameters using historical success data to reduce phase failure rates and accelerate timelines.
                </p>
                <div className="flex gap-1 h-8 items-end mt-auto">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`w-1 bg-blue-500/50 anim-bar-${i}`} />)}
                </div>
              </div>
            </div>

            <div className="relative group fade-up md:mt-24" style={{ perspective: "1200px", transitionDelay: "200ms" }}>
              <div className="relative p-10 rounded-3xl bg-[#0a0a0a] border border-white/[0.1] h-full flex flex-col hover:border-indigo-500/50 transition-colors duration-500">
                <div className="text-[9px] font-mono text-neutral-500 border border-white/10 px-2 py-1 rounded w-max mb-6">03</div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">Efficacy Prediction</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-1">
                  Leveraging deep learning to evaluate binding affinities and generate high-confidence drug-target interactions.
                </p>
                <div className="font-mono text-xs text-indigo-400 mt-auto opacity-75">
                  &gt; eval_model() <br/> &gt; 94.2% ACCURACY
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Mechanics */}
      <section className="bg-black relative" style={{ height: "2400px" }} id="h-scroll-section" ref={containerRef}>
        <div className="sticky overflow-hidden flex h-screen top-0 items-center">
          <div className="absolute top-12 left-6 md:left-12 z-20 flex items-center gap-4">
            <div className="w-12 h-px bg-white/20"></div>
            <span className="text-[10px] font-mono text-white uppercase tracking-widest">Executive Summary</span>
          </div>

          <div className="absolute bottom-12 left-6 md:left-12 z-20 w-48 h-1 bg-white/10 rounded-full">
            <div className="h-full bg-white transition-all ease-out" id="h-scroll-progress" ref={progressRef}></div>
          </div>

          <div className="flex pl-[10vw] pr-[20vw] gap-8 items-center" id="h-scroll-track" ref={trackRef} style={{ width: "max-content" }}>
            {[
              { id: "01", title: "The Problem", desc: "Drug development is broken. 90% of clinical trials fail, costing $2.5B+ and taking 10+ years per approved drug." },
              { id: "02", title: "The Solution", desc: "De-risking pipelines by systematically predicting new therapeutic applications for already-approved compounds." },
              { id: "03", title: "Value Proposition", desc: "Slashing R&D timelines from years to months, while significantly reducing toxicity risks via known safety profiles." },
              { id: "04", title: "Business Model", desc: "Tiered B2B SaaS access for biotech research teams, complemented by milestone-driven proprietary co-development partnerships." },
            ].map((card, i) => (
              <div key={i} className="schema-card-enhanced w-[85vw] md:w-[450px] aspect-square rounded-[2rem] p-10 flex flex-col relative overflow-hidden shadow-2xl flex-shrink-0 group border border-white/5">
                <span className="text-6xl font-light text-white/5 absolute top-6 right-8 font-mono group-hover:text-white/10">{card.id}</span>
                <div className="mt-auto relative z-10">
                  <h3 className="text-2xl font-semibold mb-4 tracking-tight">{card.title}</h3>
                  <p className="text-sm text-neutral-400">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity (TAM, SAM, SOM) */}
      <section className="bg-[#050505] py-32 relative flex flex-col items-center justify-center overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 bg-grid opacity-5"></div>
        <div className="text-center z-40 mb-16 px-6 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 mb-6">
            <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">Market Opportunity</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Vast Addressable Market</h2>
          <p className="max-w-xl mx-auto text-neutral-400 font-light">
            Capitalizing on the exponentially growing intersection of Artificial Intelligence and Biopharma R&D.
          </p>
        </div>

        <div className="relative z-30 w-full flex justify-center mt-6 p-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full border border-white/10 bg-white/[0.02] flex flex-col items-center justify-start pt-8 md:pt-12 relative group"
          >
            <div className="text-center mb-4 md:mb-8">
              <div className="text-[10px] md:text-sm font-mono text-neutral-500 uppercase tracking-widest mb-1">TAM - Global Pharma R&D</div>
              <div className="text-2xl md:text-4xl font-bold bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">$250B</div>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-[200px] h-[200px] md:w-[440px] md:h-[440px] rounded-full border border-blue-500/30 bg-blue-500/[0.05] flex flex-col items-center justify-start pt-6 md:pt-10 group-hover:border-blue-500/50 transition-colors"
            >
              <div className="text-center mb-4 md:mb-8">
                <div className="text-[10px] md:text-sm font-mono text-blue-400 uppercase tracking-widest mb-1">SAM - AI in Drug Discovery</div>
                <div className="text-xl md:text-3xl font-bold text-white">$50B</div>
              </div>

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="w-[100px] h-[100px] md:w-[260px] md:h-[260px] rounded-full border-[2px] border-emerald-500/50 bg-emerald-500/[0.1] shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col items-center justify-center group-hover:bg-emerald-500/[0.15] transition-colors relative"
              >
                <div className="absolute top-4 md:top-10 text-center">
                  <div className="text-[8px] md:text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">SOM - Repurposing</div>
                  <div className="text-lg md:text-3xl font-bold text-white">$5.5B</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gravity Well Convergence */}
      <section className="bg-black py-40 relative flex flex-col items-center justify-center overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-grid opacity-10"></div>
        <div className="text-center z-40 mb-16 px-6 fade-up">
          <h2 className="text-5xl font-semibold tracking-tight mb-4">Unified Data Ecosystem</h2>
          <p className="max-w-lg mx-auto text-neutral-400 font-light">
            Ingesting fragmented global data—FDA trial registries, PubMed literature, and proprietary assays—into a continuously learning knowledge core.
          </p>
        </div>

        <div className="relative w-[640px] h-[640px] flex items-center justify-center scale-75 md:scale-100 z-30">
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-white/20 border rounded-full pointer-events-none" style={{ animation: "radar-pull-anim 4s infinite" }}></div>
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-white/20 border rounded-full pointer-events-none" style={{ animation: "radar-pull-anim 4s infinite 1.33s" }}></div>

          <div className="absolute top-1/2 left-1/2" style={{ animation: "core-pulse-anim 2s infinite" }}>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_60px_#fff]">
              <span className="text-black font-bold font-mono text-sm tracking-tight">&gt;_</span>
            </div>
          </div>

          {[
            { x: -240, y: -240, r: 15, d: 0.2 },
            { x: 300, y: -180, r: -20, d: 0.6 },
            { x: -180, y: 260, r: 30, d: 1.0 },
            { x: 220, y: 220, r: -10, d: 1.4 },
            { x: -320, y: 20, r: 25, d: 1.8 }
          ].map((el, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md"
                 style={{
                   "--tx": `${el.x}px`, "--ty": `${el.y}px`, "--rot": `${el.r}deg`,
                   animation: "gravity-well-anim 4.8s cubic-bezier(0.5, 0, 0.8, 1) infinite both",
                   animationDelay: `${el.d}s`
                 } as any}>
              <div className="w-8 h-1 bg-white/40 rounded"></div>
              <div className="w-12 h-1 bg-white/20 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="bg-black pt-32 pb-16 relative overflow-hidden border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10 flex flex-col items-center fade-up">
          <h2 className="text-4xl md:text-6xl text-white font-mono typewriter-text mb-6">
            &gt; schedule_demo()
          </h2>
          <p className="text-neutral-400 font-light mb-10 max-w-lg">
            Partner with Blueprints to accelerate your pipeline and discover the next generation of breakthrough therapies.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform">
              Book a Presentation
            </button>
          </div>
        </div>
        <div className="text-center mt-32 text-xs font-mono text-neutral-600 opacity-50">
          Blueprints Systems © {new Date().getFullYear()} // System Version 4.0
        </div>
      </footer>
    </div>
  );
}
