import React from "react";
import { motion } from "framer-motion";

/* ───── animation ───── */
const fade = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};
const M = ({ children, d = 0, className = "" }: { children: React.ReactNode; d?: number; className?: string }) => (
  <motion.div variants={fade} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} custom={d} className={className}>{children}</motion.div>
);

/* big section number */
const SN = ({ n, label }: { n: string; label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-4xl md:text-5xl font-extrabold text-white/[0.07] leading-none font-mono">{n}</span>
    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{label}</span>
  </div>
);

/* table helper */
const T = ({ headers, rows, className = "" }: { headers: string[]; rows: (string | React.ReactNode)[][]; className?: string }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-base border-collapse">
      <thead>
        <tr>{headers.map((h, i) => <th key={i} className="text-left text-[10px] font-mono uppercase tracking-widest text-neutral-500 pb-2 pr-4 whitespace-nowrap">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-white/5">
            {row.map((cell, j) => <td key={j} className={`py-2 pr-4 whitespace-nowrap text-xs ${j === 0 ? "text-white font-medium" : "text-neutral-400"}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export function Presentation() {
  return (
    <div className="bg-[#0f172a] text-white overflow-x-hidden select-none font-sans h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth">

      {/* ════════ HERO ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col items-center justify-center px-6 text-center border-b border-white/5">
        <motion.div initial={{ opacity: 0, filter: "blur(16px)", y: 40 }} animate={{ opacity: 1, filter: "blur(0)", y: 0 }} transition={{ duration: 1.4, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">Phoenix Blueprint — Pitch Deck</span>
          </div>
          <h1 className="text-5xl md:text-[5rem] leading-[0.95] font-extrabold tracking-tighter bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent max-w-5xl mx-auto">
            AI‑Powered Drug Repurposing
          </h1>
          <p className="mt-8 text-lg md:text-2xl text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed">
            8 specialized agents. One scored report.<br className="hidden md:block" /> Affordable SaaS for every researcher.
          </p>
        </motion.div>
      </section>

      {/* ════════ 01 · MARKET ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="01" label="Market Analysis & Competitors" /></M>

          <M d={1}>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
              ₹1.2 – 1.9 Lakh Crore<br /><span className="text-neutral-500">by ~2033</span>
            </h2>
            <p className="mt-4 text-lg text-neutral-400 max-w-2xl">Global AI‑in‑drug‑discovery market. 20–30 % CAGR. Drug optimization & repurposing is the largest segment.</p>
          </M>

          <div className="mt-16 space-y-3">
            <M d={2}>
              <div className="border-l-2 border-rose-500/60 pl-6">
                <h3 className="text-xl md:text-2xl font-bold">Enterprise Players</h3>
                <p className="text-neutral-400 mt-2 text-base">Recursion · BenevolentAI · Insilico · Atomwise · Lantern — earn from pharma collabs & own pipelines, <span className="text-white font-semibold">not self‑serve SaaS</span>.</p>
              </div>
            </M>
            <M d={3}>
              <div className="border-l-2 border-amber-500/60 pl-6">
                <h3 className="text-xl md:text-2xl font-bold">Academic / Nonprofit</h3>
                <p className="text-neutral-400 mt-2 text-base">RepurposeDrugs · DrugRepurposing Online · ACID — free but fragmented, single‑method, <span className="text-white font-semibold">no integrated workflow</span>.</p>
              </div>
            </M>
            <M d={4}>
              <div className="border-l-2 border-emerald-500/60 pl-6">
                <h3 className="text-xl md:text-2xl font-bold">The Gap We Fill</h3>
                <p className="text-neutral-400 mt-2 text-base">Individual researchers & small teams need a <span className="text-white font-semibold">unified, reliable platform with real data sources at an affordable monthly price</span>.</p>
              </div>
            </M>
          </div>
        </div>
      </section>

      {/* ════════ 02 · PRODUCT NOVELTY ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="02" label="Product Novelty" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">8 Agents → One Score</h2></M>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { head: "8 Specialized Agents", body: "Clinical, literature, regulatory, target, molecular, patent, market, synthesis — querying authoritative databases, fused into one scored report." },
              { head: "Phoenix Score", body: "Blends clinical evidence + market potential. Most tools stop at 'scientific evidence only' and never quantify commercial viability." },
              { head: "Adversarial Debate", body: "Advocate / Skeptic / Judge + transparent citations from real APIs. Reduces hallucination vs generic LLM chat." },
              { head: "Differentiated Bundle", body: "Biomarker→drug pipeline, up‑to‑6‑drug DDI, head‑to‑head comparison, MDPI‑style PDF export — all in one SaaS." },
            ].map((f, i) => (
              <M key={i} d={i + 2}>
                <h3 className="text-xl md:text-2xl font-bold">{f.head}</h3>
                <p className="text-neutral-400 mt-2 text-base leading-relaxed">{f.body}</p>
              </M>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 03 · TAM / SAM / SOM — CONCENTRIC CIRCLES ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <M><SN n="03" label="TAM / SAM / SOM (₹)" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">Market Opportunity</h2></M>
          <M d={2}><p className="text-lg text-neutral-400 max-w-2xl mb-12">All figures in Indian Rupees — capturing the AI × Biopharma R&D intersection.</p></M>
        </div>

        <div className="w-full flex justify-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} viewport={{ once: true }}
            className="w-[320px] h-[320px] md:w-[620px] md:h-[620px] rounded-full border border-white/10 bg-white/[0.02] flex flex-col items-center justify-start pt-8 md:pt-14 relative group"
          >
            <div className="text-center mb-2 md:mb-6">
              <div className="text-[10px] md:text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1">TAM — Global AI Drug Discovery</div>
              <div className="text-2xl md:text-4xl font-extrabold bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">₹1.2–1.9 Lakh Cr</div>
              <div className="text-[10px] text-neutral-600 mt-1">by early‑2030s · 20–30 % CAGR</div>
            </div>

            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} viewport={{ once: true }}
              className="w-[216px] h-[216px] md:w-[440px] md:h-[440px] rounded-full border border-blue-500/30 bg-blue-500/[0.05] flex flex-col items-center justify-start pt-6 md:pt-10 group-hover:border-blue-500/50 transition-colors"
            >
              <div className="text-center mb-2 md:mb-6">
                <div className="text-[10px] md:text-xs font-mono text-blue-400 uppercase tracking-widest mb-1">SAM — SaaS Repurposing Tools</div>
                <div className="text-xl md:text-3xl font-extrabold text-white">₹10K–20K Cr/yr</div>
                <div className="text-[10px] text-neutral-600 mt-1">by ~2030 · academics, biotechs, CROs</div>
              </div>

              <motion.div initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 1, delay: 0.6, ease: "easeOut" }} viewport={{ once: true }}
                className="w-[110px] h-[110px] md:w-[260px] md:h-[260px] rounded-full border-2 border-emerald-500/50 bg-emerald-500/[0.1] shadow-[0_0_60px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center group-hover:bg-emerald-500/[0.15] transition-colors"
              >
                <div className="text-center">
                  <div className="text-[8px] md:text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">SOM — Our Target</div>
                  <div className="text-lg md:text-3xl font-extrabold text-white">₹50–200 Cr</div>
                  <div className="text-[10px] text-neutral-600 mt-1">ARR · 3–5 yr · 0.5–1 % SAM</div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════ 04 · SUBSCRIPTION TIERS ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <M><SN n="04" label="Subscription Model" /></M>
          <M d={1}><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-[1.1]">Self‑Serve SaaS First</h2></M>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">

            {/* ── Explorer ── */}
            <M d={2} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Tier 1</div>
              <h3 className="text-base font-extrabold mt-0.5">Explorer</h3>
              <div className="text-2xl font-extrabold mt-1 mb-0.5">₹0<span className="text-xs font-normal text-neutral-500">/mo</span></div>
              <p className="text-[10px] text-neutral-500 mb-3">Freemium — taste the product</p>
              <div className="space-y-1 text-xs flex-1">
                {[
                  ["Reports", "3/mo"], ["Chat", "10/mo"], ["Agents", "5 of 8"],
                  ["PDF / Debate", "—"], ["Phoenix Score", "Simplified"],
                  ["Share / History", "— / Last 5"],
                ].map(([f, v], i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-400">{f}</span>
                    <span className={v === "—" ? "text-neutral-600" : "text-white"}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-neutral-500">
                Cost/user <span className="text-white">₹1.71/mo</span> · 700 users = <span className="text-emerald-400 font-bold">₹1,197/mo</span>
              </div>
            </M>

            {/* ── Researcher ── */}
            <M d={3} className="rounded-xl border-2 border-blue-500/50 bg-blue-500/[0.04] p-4 flex flex-col relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-black text-[9px] font-bold uppercase tracking-widest rounded-full">Popular</div>
              <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Tier 2</div>
              <h3 className="text-base font-extrabold mt-0.5">Researcher</h3>
              <div className="text-2xl font-extrabold mt-1 mb-0.5">₹999<span className="text-xs font-normal text-neutral-500">/mo</span></div>
              <p className="text-[10px] text-neutral-500 mb-3">Full access — individual & small labs</p>
              <div className="space-y-1 text-xs flex-1">
                {[
                  ["Reports", "30/mo"], ["Chat", "100/mo"], ["Agents", "All 8"],
                  ["PDF Export", "✓"], ["Debate", "Advocate/Skeptic/Judge"],
                  ["Phoenix Score", "Full"], ["Share", "Public link"],
                  ["History", "Last 100"], ["DDI / H2H", "✓ / ✓"],
                ].map(([f, v], i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-400">{f}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-neutral-500">
                Cost <span className="text-white">₹61.10/mo</span> · Margin <span className="text-emerald-400 font-bold">93.9%</span>
              </div>
            </M>

            {/* ── Organization ── */}
            <M d={4} className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.03] p-4 flex flex-col">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Tier 3</div>
              <h3 className="text-base font-extrabold mt-0.5">Organization</h3>
              <div className="text-2xl font-extrabold mt-1 mb-0.5">₹3,999<span className="text-xs font-normal text-neutral-500">/seat/mo</span></div>
              <p className="text-[10px] text-neutral-500 mb-3">~$48 · Min 5 seats · teams</p>
              <div className="space-y-1 text-xs flex-1">
                {[
                  ["Reports", "200/seat/mo"], ["Chat", "500/seat/mo"],
                  ["All Researcher +", "✓"], ["Team / RBAC", "✓"],
                  ["Private Pipelines", "✓"], ["REST API", "✓"],
                  ["History", "12mo rolling"], ["Priority Queue", "Dedicated"],
                  ["Branding / SLA", "White‑label / 99.5%"],
                ].map(([f, v], i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-neutral-400">{f}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-neutral-500">
                Cost/seat <span className="text-white">₹113.40/mo</span> · 50 seats = <span className="text-emerald-400 font-bold">₹5,670/mo</span>
              </div>
            </M>

          </div>
        </div>
      </section>

      {/* ════════ 04a · TPM / RPM ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="border border-amber-500/20 bg-amber-500/[0.03] rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-amber-500/20 text-amber-400 rounded">Internal — Jury Reference</span>
              <h3 className="text-2xl md:text-3xl font-extrabold">TPM & RPM Budget</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Tokens Per Report</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">Input tokens (6 calls)</span><span className="text-white font-mono">~6,500</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">Output tokens (6 calls)</span><span className="text-white font-mono">~2,300</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">Total / report</span><span className="text-white font-bold font-mono">~8,800</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">Chat message</span><span className="text-white font-mono">~800 / msg</span></div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Requests Per Report</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">LLM calls / report</span><span className="text-white font-mono">6</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">External API calls</span><span className="text-white font-mono">~8–12</span></div>
                  <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-neutral-400">Total / report</span><span className="text-white font-bold font-mono">~14–18</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Groq Rate Limits vs. Projected Load</div>
              <T headers={["Scenario", "Concurrent", "TPM", "RPM", "Limit", "Headroom"]} rows={[
                ["Demo Day", "3", "~26K", "~18", "100K / 100", <span className="text-emerald-400 font-bold">~74K spare</span>],
                ["Y1 peak (1K)", "~8/min", "~70K", "~48", "100K / 100", <span className="text-emerald-400 font-bold">~30K spare</span>],
                ["Y2 peak (2.5K)", "~20/min", "~176K", "~120", "Multi‑key", <span className="text-amber-400 font-bold">2 keys</span>],
                ["Y3+ (6K)", "~50/min", "~440K", "~300", "Enterprise", <span className="text-amber-400 font-bold">Groq ent.</span>],
              ]} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { value: "8,800", label: "Tokens / report", color: "text-white" },
                { value: "6", label: "LLM calls / report", color: "text-white" },
                { value: "100K", label: "Groq TPM limit", color: "text-blue-400" },
                { value: "~11", label: "Max concurrent (1 key)", color: "text-emerald-400" },
              ].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg border border-white/10 bg-slate-800/60">
                  <div className={`text-lg font-extrabold font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-neutral-500 text-center">Single key handles Y1. Y2+ scales with key pooling. No risk at demo day.</p>
          </div>
        </div>
      </section>

      {/* ════════ 04b · FEATURE COMPARISON ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <M><div className="flex items-center gap-3 mb-4">
            <span className="text-4xl md:text-5xl font-extrabold text-white/[0.07] leading-none font-mono">VS</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Feature Comparison — Competitors</span>
          </div></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">7/7. They score 0.5.</h2></M>
          <M d={2}><p className="text-lg text-neutral-400 max-w-2xl mb-12">Head‑to‑head against the biggest names in AI drug discovery. <span className="text-white font-semibold">✓ = 1 pt, ▲ = 0.5 pt, ✗ = 0</span></p></M>

          <M d={3} className="overflow-x-auto">
            <table className="w-full text-base border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-neutral-500 pb-3 pr-4 w-8">#</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-neutral-500 pb-3 pr-4">Feature</th>
                  {["Recursion", "BenevolentAI", "Insilico", "Atomwise", "Lantern"].map(c => (
                    <th key={c} className="text-center text-[10px] font-mono uppercase tracking-widest text-neutral-600 pb-3 px-2">{c}</th>
                  ))}
                  <th className="text-center text-[10px] font-mono uppercase tracking-widest text-emerald-400 pb-3 px-2">Luvara</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { n: "1", f: "8‑agent parallel architecture (7+ databases)", scores: [0, 0, 0, 0, 0, 1] },
                  { n: "2", f: "Phoenix Score (clinical + commercial)", scores: [0, 0, 0, 0, 0, 1] },
                  { n: "3", f: "Adversarial AI Debate (advocate/skeptic/judge)", scores: [0, 0, 0, 0, 0, 1] },
                  { n: "4", f: "Biomarker → Drug reverse pipeline", scores: [0, 0.5, 0.5, 0, 0.5, 1] },
                  { n: "5", f: "Multi‑drug DDI checker (up to 6)", scores: [0, 0, 0, 0, 0, 1] },
                  { n: "6", f: "3D Visualization", scores: [0.5, 0, 1, 1, 0, 1] },
                  { n: "7", f: "Head‑to‑head compound comparison (twin molecule)", scores: [0, 0, 0, 0, 0, 1] },
                ] as const).map((row, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="py-3 pr-4 text-neutral-600 font-mono text-xs">{row.n}</td>
                    <td className="py-3 pr-4 text-white font-medium">{row.f}</td>
                    {row.scores.map((s, j) => (
                      <td key={j} className={`py-3 px-2 text-center text-lg ${j === 5 ? "font-bold" : ""}`}>
                        {s === 1 ? <span className="text-emerald-400">✓</span> : s === 0.5 ? <span className="text-amber-400">▲</span> : <span className="text-red-500/70">✗</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </M>

          {/* ── Mystery Features — Blurred Reveal ── */}
          <M d={4} className="mt-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-violet-500/20 text-violet-400 rounded">Coming Soon</span>
              <h3 className="text-xl md:text-2xl font-extrabold">Next Round Features</h3>
            </div>

            <div className="relative rounded-2xl border border-violet-500/20 bg-violet-500/[0.02] overflow-hidden">
              {/* Blurred rows */}
              <div className="select-none" style={{ filter: "blur(6px)", WebkitFilter: "blur(6px)" }}>
                <table className="w-full text-base border-collapse">
                  <tbody>
                    {[
                      "Real‑time clinical trial matching with patient cohort filters",
                      "AI‑generated IND filing draft (regulatory pre‑submission)",
                      "Genomic variant → drug sensitivity prediction engine",
                      "Multi‑language report generation (12 languages)",
                      "Collaborative annotation & team review workflows",
                    ].map((f, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-4 px-6 text-neutral-600 font-mono text-xs w-8">{8 + i}</td>
                        <td className="py-4 px-6 text-white/60">{f}</td>
                        {[0, 0, 0, 0, 0].map((_, j) => (
                          <td key={j} className="py-4 px-2 text-center text-red-500/40">✗</td>
                        ))}
                        <td className="py-4 px-2 text-center text-emerald-400">✓</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/40 via-black/60 to-black/40 backdrop-blur-[2px]">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-3">
                    ?
                  </div>
                  <div className="text-sm md:text-base font-bold text-white/80">5 more features in development</div>
                  <div className="text-xs text-neutral-500 mt-1 font-mono uppercase tracking-widest">Reveal in Round 2</div>
                </motion.div>
              </div>
            </div>
          </M>
        </div>
      </section>

      {/* ════════ 05 · COST PER REPORT ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="05" label="Cost‑Per‑Report Calculation" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">₹0.57 Per Report</h2></M>

          <M d={2} className="mt-5">
            <h3 className="text-xl font-bold mb-4">LLM Token Usage Per Pipeline Run</h3>
            <T headers={["Agent Call", "Model", "Input Tokens", "Output Tokens", "Cost/Call"]} rows={[
              ["PlannerAgent", "llama‑3.3‑70b", "~800", "~400", "$0.00079"],
              ["SynthesisAgent", "llama‑3.3‑70b", "~3,200", "~800", "$0.00252"],
              ["Advocate", "llama‑3.3‑70b", "~600", "~300", "$0.00059"],
              ["Skeptic", "llama‑3.3‑70b", "~600", "~300", "$0.00059"],
              ["Judge", "llama‑3.3‑70b", "~900", "~200", "$0.00069"],
              ["Market Estimates", "llama‑3.1‑8b", "~400", "~300", "$0.00004"],
              [<span className="text-white font-bold">Total per report</span>, "", <span className="text-white font-bold">~6,500 in</span>, <span className="text-white font-bold">~2,300 out</span>, <span className="text-emerald-400 font-bold">$0.0052</span>],
            ]} />
          </M>

          <M d={3} className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">Groq Paid Pricing</div>
              <div className="text-sm text-neutral-400 space-y-1">
                <div><span className="text-white font-mono text-xs">llama‑3.3‑70b‑versatile</span> — $0.59/M input, $0.79/M output</div>
                <div><span className="text-white font-mono text-xs">llama‑3.1‑8b‑instant</span> — $0.05/M input, $0.08/M output</div>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">SSE Chat Cost (Per Message)</div>
              <div className="text-sm text-neutral-400">~500 input + ~300 output on 70b = <span className="text-white font-bold">$0.00053/message</span></div>
            </div>
          </M>

          <M d={4} className="mt-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] text-center">
            <div className="text-sm text-neutral-400 mb-2">Total Cost Per Report (with ~3 chat messages avg)</div>
            <div className="text-2xl md:text-3xl font-extrabold">$0.0052 + (3 × $0.00053) = <span className="text-emerald-400">$0.0068 ≈ ₹0.57</span></div>
          </M>
        </div>
      </section>

      {/* ════════ 06 · INFRASTRUCTURE COSTS ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="06" label="Infrastructure Costs (Monthly)" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">₹8,250/mo Fixed</h2></M>

          <M d={2} className="mt-5">
            <T headers={["Service", "Tier", "Monthly Cost"]} rows={[
              ["Groq API", "On‑Demand (pay‑per‑token)", "Variable (see above)"],
              ["MongoDB Atlas", "M10 Dedicated (production)", "$57/mo (~₹4,750)"],
              ["Railway/Render (Backend)", "Pro", "$20/mo (~₹1,670)"],
              ["Vercel (Frontend)", "Pro", "$20/mo (~₹1,670)"],
              ["Domain + SSL", "Annual amortized", "$2/mo (~₹165)"],
              ["Monitoring (Sentry/LogRocket)", "Free tier", "$0"],
              [<span className="text-white font-bold">Fixed infra total</span>, "", <span className="text-emerald-400 font-bold">$99/mo (₹8,250)</span>],
            ]} />
          </M>
        </div>
      </section>

      {/* ════════ 07 · REVENUE — YEAR 1 & 2 ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="07" label="Revenue Projections" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">97.4% Gross Margin<br /><span className="text-neutral-500">Year 1</span></h2></M>

          {/* Year 1 */}
          <M d={2} className="mt-5">
            <h3 className="text-lg md:text-xl font-bold mb-4">Year 1 <span className="text-neutral-500 font-normal">(1,000 customers)</span></h3>
            <T headers={["Line Item", "Monthly", "Annual"]} rows={[
              [<span className="text-xs font-mono text-neutral-500 uppercase">Revenue</span>, "", ""],
              ["Explorer (850 × ₹0)", "₹0", "₹0"],
              ["Organization (150 seats × ₹3,999)", "₹5,99,850", "₹71,98,200"],
              [<span className="text-white font-bold">Total Revenue</span>, <span className="text-white font-bold">₹5,99,850</span>, <span className="text-white font-bold">₹71,98,200</span>],
              [<span className="text-xs font-mono text-neutral-500 uppercase">Costs</span>, "", ""],
              ["Groq — Explorer (850 × ₹1.34)", "₹1,139", "₹13,668"],
              ["Groq — Organization (150 × ₹42.12)", "₹6,318", "₹75,816"],
              ["Infrastructure (fixed)", "₹8,255", "₹99,060"],
              [<span className="text-white font-bold">Total Costs</span>, <span className="text-white font-bold">₹15,712</span>, <span className="text-white font-bold">₹1,88,544</span>],
              [<span className="text-emerald-400 font-bold">Gross Profit</span>, <span className="text-emerald-400 font-bold">₹5,84,138</span>, <span className="text-emerald-400 font-bold">₹70,09,656</span>],
              [<span className="text-emerald-400 font-bold">Gross Margin</span>, <span className="text-emerald-400 font-bold">97.4%</span>, ""],
            ]} />
          </M>

          {/* Year 2 */}
          <M d={3} className="mt-6">
            <h3 className="text-lg md:text-xl font-bold mb-4">Year 2 <span className="text-neutral-500 font-normal">(2,500 customers)</span></h3>
            <T headers={["Line Item", "Monthly", "Annual"]} rows={[
              [<span className="text-xs font-mono text-neutral-500 uppercase">Revenue</span>, "", ""],
              ["Organization (450 seats × ₹3,999)", "₹17,99,550", "₹2,15,94,600"],
              [<span className="text-xs font-mono text-neutral-500 uppercase">Costs</span>, "", ""],
              ["Groq — Explorer (2,050 × ₹1.34)", "₹2,747", "₹32,964"],
              ["Groq — Organization (450 × ₹42.12)", "₹18,954", "₹2,27,448"],
              ["Infrastructure (MongoDB M30 + scaling)", "₹16,500", "₹1,98,000"],
              ["Support staff (1 part‑time)", "₹25,000", "₹3,00,000"],
              [<span className="text-white font-bold">Total Costs</span>, <span className="text-white font-bold">₹63,201</span>, <span className="text-white font-bold">₹7,58,412</span>],
              [<span className="text-emerald-400 font-bold">Gross Profit</span>, <span className="text-emerald-400 font-bold">₹17,36,349</span>, <span className="text-emerald-400 font-bold">₹2,08,36,188</span>],
              [<span className="text-emerald-400 font-bold">Gross Margin</span>, <span className="text-emerald-400 font-bold">96.5%</span>, ""],
            ]} />
          </M>
        </div>
      </section>

      {/* ════════ 08 · 5‑YEAR SUMMARY ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <M><SN n="08" label="5‑Year Summary Dashboard" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">₹29.6 Cr ARR<br /><span className="text-neutral-500">by Year 5</span></h2></M>

          <M d={2} className="mt-5">
            <T headers={["Metric", "Y1", "Y2", "Y3", "Y4", "Y5"]} rows={[
              ["Total Customers", "1,000", "2,500", "6,000", "12,000", "22,000"],
              ["Paid Seats", "150", "450", "1,320", "3,000", "6,160"],
              ["Org Accounts", "30", "90", "220", "500", "880"],
              ["MRR", "₹6.0L", "₹18.0L", "₹52.8L", "₹1.2Cr", "₹2.46Cr"],
              [<span className="text-white font-bold">ARR</span>, <span className="text-white font-bold">₹72.0L</span>, <span className="text-white font-bold">₹2.16Cr</span>, <span className="text-white font-bold">₹6.33Cr</span>, <span className="text-white font-bold">₹14.4Cr</span>, <span className="text-white font-bold">₹29.6Cr</span>],
              ["Total Costs/yr", "₹1.9L", "₹7.6L", "₹41.4L", "₹1.17Cr", "₹2.41Cr"],
              [<span className="text-emerald-400 font-bold">Net Profit/yr</span>, <span className="text-emerald-400">₹70.1L</span>, <span className="text-emerald-400">₹2.08Cr</span>, <span className="text-emerald-400">₹5.92Cr</span>, <span className="text-emerald-400">₹13.2Cr</span>, <span className="text-emerald-400">₹27.2Cr</span>],
              [<span className="text-emerald-400 font-bold">Gross Margin</span>, "97.4%", "96.5%", "93.5%", "91.9%", "91.9%"],
              ["ARPU (paid only)", "₹3,999/mo", "₹3,999/mo", "₹3,999/mo", "₹3,999/mo", "₹3,999/mo"],
              ["LTV (24mo, 85% ret)", "₹81,580", "₹81,580", "₹81,580", "₹81,580", "₹81,580"],
            ]} />
          </M>
        </div>
      </section>

      {/* ════════ 09 · WHY DRUG REPURPOSING ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="09" label="Why Drug Repurposing" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">10–17 Years → 3–12 Years</h2></M>

          <div className="mt-6 space-y-3">
            <M d={2}>
              <h3 className="text-xl md:text-2xl font-bold">Cut Timelines by 6–7 Years</h3>
              <p className="text-neutral-400 mt-2 text-base">Safety data & manufacturing already exist. Costs drop dramatically vs de‑novo.</p>
            </M>
            <M d={3}>
              <h3 className="text-xl md:text-2xl font-bold">Higher Phase II / III Success Rates</h3>
              <p className="text-neutral-400 mt-2 text-base">Safety and dosing already partly known — phase failure drops significantly.</p>
            </M>
            <M d={4}>
              <h3 className="text-xl md:text-2xl font-bold">#1 Segment in AI Drug Discovery</h3>
              <p className="text-neutral-400 mt-2 text-base">"Drug optimization and repurposing" is the <span className="text-white font-semibold">largest application slice</span> within AI‑driven drug discovery market reports.</p>
            </M>
          </div>

          <M d={5} className="mt-12 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
            <p className="text-lg font-semibold text-center">Repurposing is <span className="text-emerald-400">scientifically attractive</span> and <span className="text-emerald-400">economically efficient</span>.</p>
          </M>
        </div>
      </section>

      {/* ════════ 10 · TARGET CONSUMERS ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="10" label="Target Consumers" /></M>

          <div className="mt-4 space-y-4">
            <M d={1}>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-xs font-mono text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase">Primary</span>
                <h3 className="text-xl md:text-2xl font-bold">PhD students · Postdocs · Clinicians · Biotech founders · Data scientists</h3>
              </div>
              <p className="text-neutral-400 mt-2 text-base pl-0 md:pl-[5.5rem]">Directly use the UI to generate and interpret reports.</p>
            </M>
            <M d={2}>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-xs font-mono text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">Secondary</span>
                <h3 className="text-xl md:text-2xl font-bold">Lab heads · Pharma R&D managers · CRO leads · Regulatory consultants</h3>
              </div>
              <p className="text-neutral-400 mt-2 text-base pl-0 md:pl-[5.5rem]">Consume Phoenix reports & scores for portfolio, trial‑design or filing decisions.</p>
            </M>
            <M d={3}>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-xs font-mono text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">Tertiary</span>
                <h3 className="text-xl md:text-2xl font-bold">Patients · Hospitals · Payers · Public‑health bodies</h3>
              </div>
              <p className="text-neutral-400 mt-2 text-base pl-0 md:pl-[5.5rem]">Benefit indirectly from faster, cheaper, de‑risked repurposed therapies.</p>
            </M>
          </div>
        </div>
      </section>

      {/* ════════ 11 · IMPACTS ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="11" label="Impacts & Benefits" /></M>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {[
              { head: "Days → Minutes", body: "Compress days of manual trial / literature / patent / market searching into a single multi‑agent run." },
              { head: "6–7 Years Saved", body: "Repurposing slashes cost & time — safety data and manufacturing already available." },
              { head: "10× More Hypotheses", body: "AI literature mining, target prediction & market analysis lets you evaluate far more candidates." },
              { head: "De‑risked Therapies", body: "Known safety profiles reduce toxicity risk. Phoenix Score quantifies both clinical & commercial viability." },
            ].map((b, i) => (
              <M key={i} d={i + 1}>
                <h3 className="text-xl md:text-2xl font-bold">{b.head}</h3>
                <p className="text-neutral-400 mt-2 text-base leading-relaxed">{b.body}</p>
              </M>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 12 · FEASIBILITY ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="12" label="Feasibility & Viability" /></M>

          <div className="mt-4 space-y-4">
            <M d={1}>
              <h3 className="text-xl md:text-2xl font-bold">Technical Feasibility</h3>
              <p className="text-neutral-400 mt-2 text-base">Core stack (React + Vite, Node/Express, MongoDB, Groq LLMs, LangGraph) is proven. Challenges are <span className="text-white font-semibold">engineering problems, not research impossibilities</span>.</p>
            </M>
            <M d={2}>
              <h3 className="text-xl md:text-2xl font-bold">Business Viability</h3>
              <p className="text-neutral-400 mt-2 text-base">Market is <span className="text-white font-semibold">large & fast‑growing, double‑digit CAGR</span>. A self‑serve product at ₹3,999/seat needs only a few hundred paying teams globally. <span className="text-white font-semibold">97.4% gross margin at Year 1</span>.</p>
            </M>
            <M d={3}>
              <h3 className="text-xl md:text-2xl font-bold">Risk Mitigation</h3>
              <p className="text-neutral-400 mt-2 text-base">API changes, regulatory shifts, competition → mitigated by <span className="text-white font-semibold">modular architecture</span>, "decision support" positioning, niche segments first.</p>
            </M>
          </div>
        </div>
      </section>

      {/* ════════ 13 · TECH STACK ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="13" label="Tech Stack" /></M>
          <M d={1}><h2 className="text-xl md:text-2xl font-extrabold tracking-tight leading-[1.15]">React + Vite · Node/Express · MongoDB · Groq + Llama · LangGraph</h2></M>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            {[
              { head: "React + Vite", body: "Modern, fast dev experience. Complex dashboards & report visualizations." },
              { head: "Node / Express", body: "I/O‑heavy API orchestration — calling many external scientific APIs in parallel." },
              { head: "MongoDB", body: "Semi‑structured data: reports, agent logs, annotations, collections. Scales easily." },
              { head: "Groq + Llama 3.x", body: "Low‑latency inference, strong reasoning at lower cost. Critical for multi‑agent workflows." },
              { head: "LangChain / LangGraph", body: "Robust graphs of tools + models + retrievers — 8 agents + Synthesis Lead + debate." },
            ].map((t, i) => (
              <M key={i} d={i + 2}>
                <h3 className="text-xl md:text-2xl font-bold">{t.head}</h3>
                <p className="text-neutral-400 mt-2 text-base leading-relaxed">{t.body}</p>
              </M>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 14 · n8n ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="14" label="n8n Integration" /></M>
          <M d={1}><h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">Website → Automation Node</h2></M>

          <M d={2}><p className="mt-6 text-lg text-neutral-400 max-w-2xl">n8n lets power users plug Phoenix into existing workflows — Notion, Slack, email, CRMs, LIMS — <span className="text-white font-semibold">without custom code</span>.</p></M>

          <M d={3} className="mt-10 p-4 rounded-xl border border-white/10 bg-white/[0.02] font-mono text-base max-w-xl space-y-2">
            <div><span className="text-emerald-400 font-bold">trigger:</span> <span className="text-neutral-400">New compound in Google Sheet</span></div>
            <div><span className="text-blue-400 font-bold">action:</span> <span className="text-neutral-400">Phoenix Blueprint generates report</span></div>
            <div><span className="text-amber-400 font-bold">output:</span> <span className="text-neutral-400">Summary posted to #research Slack</span></div>
          </M>

          <M d={4}><p className="mt-6 text-neutral-400 text-base">Turns Phoenix from "a website you visit" into <span className="text-white font-semibold">"a node in their automation graph"</span> — increases stickiness and usage.</p></M>
        </div>
      </section>

      {/* ════════ 15 · DEMO DAY ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="15" label="Demo Day — 3 Laptops" /></M>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { laptop: "Laptop 1", title: "Core Flow", color: "blue", items: ["Enter a drug → agents run", "Phoenix Score + evidence breakdown", "Drill into trials, literature, patents, market"] },
              { laptop: "Laptop 2", title: "Advanced Tools", color: "emerald", items: ["Biomarker → drug search", "DDI checker (multi‑drug)", "Head‑to‑head comparison", "Community gallery & saved collections"] },
              { laptop: "Laptop 3", title: "Output & Integrations", color: "violet", items: ["MDPI‑style PDF export", "n8n automation demo", "Email / Slack delivery", "Pre‑computed backup reports"] },
            ].map((l, i) => (
              <M key={i} d={i + 1} className={`p-7 rounded-2xl border border-${l.color}-500/30 bg-white/[0.02]`}>
                <div className={`text-xs font-mono text-${l.color}-400 uppercase tracking-widest`}>{l.laptop}</div>
                <h3 className="text-2xl font-bold mt-2 mb-4">{l.title}</h3>
                <ul className="space-y-2">
                  {l.items.map((item, j) => <li key={j} className="text-neutral-400 text-sm">▸ {item}</li>)}
                </ul>
              </M>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 16 · COVID CASE STUDY ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 bg-[#1e293b] border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="16" label="Case Study — COVID‑19" /></M>
          <M d={1}><h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-[1.1]">98 Days That Changed Medicine</h2></M>

          <M d={2} className="mt-4 p-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]">
            <p className="text-sm font-semibold">In 2020, researchers identified Dexamethasone as a life‑saving COVID treatment in <span className="text-amber-400">98 days</span> — the fastest drug repurposing in history.</p>
          </M>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { value: "98 Days", label: "Trial → result" },
              { value: "176", label: "UK hospitals" },
              { value: "40K+", label: "Patients enrolled" },
              { value: "£40M+", label: "Total cost" },
            ].map((s, i) => (
              <M key={i} d={i + 3} className="text-center p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="text-xl md:text-2xl font-extrabold">{s.value}</div>
                <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1">{s.label}</div>
              </M>
            ))}
          </div>

          <M d={7} className="mt-4">
            <p className="text-neutral-400 text-sm"><span className="text-white font-semibold">Hundreds of scientists</span> manually mapping trials, sifting publications, cross‑referencing drug–target interactions. WHO ran it in parallel across <span className="text-white font-semibold">35 countries, 500+ hospitals</span>.</p>
          </M>
          <M d={8} className="mt-3">
            <h3 className="text-lg font-bold">The Bottleneck Was Correlation, Not Science</h3>
            <p className="text-neutral-400 mt-2 text-base">Dexamethasone had <span className="text-white font-semibold">60+ years of safety data</span>. The 98 days were spent <span className="text-white font-semibold">manually connecting dots that already existed</span> across fragmented databases.</p>
          </M>

          <M d={9} className="mt-4">
            <h3 className="text-lg font-bold mb-2">What Phoenix Does in Minutes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { step: "Clinical", work: "Maps all phase I/II/III trials" },
                { step: "Literature", work: "Scans 85K+ papers" },
                { step: "Safety", work: "DDI & adverse events" },
                { step: "Market", work: "Off‑patent, cost, generics" },
              ].map((s, i) => (
                <div key={i} className="p-2 rounded-lg border border-white/10 bg-white/[0.02]">
                  <div className="text-[10px] font-mono text-blue-400 mb-0.5">{s.step}</div>
                  <p className="text-xs text-neutral-400">{s.work}</p>
                </div>
              ))}
            </div>
          </M>
        </div>
      </section>

      {/* ════════ 16b · COVID — RESULTS ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col justify-center py-8 md:py-12 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <M><SN n="16" label="COVID — Drugs Found" /></M>

          <div className="space-y-2">
            {[
              { drug: "Dexamethasone", detail: "₹20 steroid, 60yr safety → reduced severe mortality 33%", time: "98 days", color: "emerald" },
              { drug: "Baricitinib", detail: "JAK inhibitor → reduced mortality 38%, FDA EUA", time: "~8 months", color: "blue" },
              { drug: "Remdesivir", detail: "Failed Ebola antiviral → first FDA‑approved COVID treatment", time: "~6 months", color: "violet" },
              { drug: "Tocilizumab", detail: "IL‑6 blocker → WHO recommended for severe COVID", time: "~12 months", color: "amber" },
            ].map((d, i) => (
              <M key={i} d={i + 1} className={`flex items-center gap-4 p-3 rounded-xl border border-${d.color}-500/20 bg-${d.color}-500/[0.03]`}>
                <div className="min-w-[120px]">
                  <span className={`text-sm font-extrabold text-${d.color}-400`}>{d.drug}</span>
                  <div className="text-[10px] text-neutral-600">{d.time}</div>
                </div>
                <p className="text-xs text-neutral-400">{d.detail}</p>
              </M>
            ))}
          </div>

          <M d={5} className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.03]">
                <div className="text-[10px] font-mono text-rose-400 uppercase tracking-widest mb-1">Without Phoenix</div>
                <div className="text-2xl font-extrabold">98 Days</div>
                <div className="text-neutral-400 text-xs mt-1">176 hospitals · 200+ scientists · £40M+</div>
              </div>
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03]">
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">With Phoenix</div>
                <div className="text-2xl font-extrabold">Minutes</div>
                <div className="text-neutral-400 text-xs mt-1">8 agents · automated correlation · one report</div>
              </div>
            </div>
          </M>

          <M d={6} className="mt-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04]">
            <p className="text-sm font-semibold text-center">The correlation that took <span className="text-rose-400">98 days and hundreds of scientists</span> — Phoenix automates <span className="text-emerald-400">in minutes</span>.</p>
          </M>
        </div>
      </section>

      {/* ════════ CTA / FOOTER ════════ */}
      <section className="min-h-[100dvh] snap-start flex flex-col items-center justify-center px-6 text-center">
        <M>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent max-w-3xl mx-auto">
            Let's Talk
          </h2>
        </M>
        <M d={1}><p className="mt-6 text-lg text-neutral-400 max-w-lg mx-auto">Partner with Phoenix Blueprint to accelerate your pipeline and discover breakthrough repurposed therapies.</p></M>
        <M d={2}>
          <button className="mt-10 px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform">
            Book a Presentation
          </button>
        </M>
        <div className="mt-12 text-xs font-mono text-neutral-700">
          Phoenix Blueprint © {new Date().getFullYear()}
        </div>
      </section>
    </div>
  );
}
