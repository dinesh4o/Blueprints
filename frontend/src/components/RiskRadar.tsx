import { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, TrendingUp, Target, Activity, Beaker, Scale } from 'lucide-react';

interface RiskDimension {
  dimension: string;
  score: number;
  fullMark: number;
  icon: string;
  detail: string;
}

interface RiskRadarProps {
  drugName: string;
  clinicalScore?: number;
  safetyScore?: number;
  marketScore?: number;
  ipScore?: number;
  evidenceScore?: number;
  noveltyScore?: number;
  useColor?: boolean;
}

export function RiskRadar({
  drugName,
  clinicalScore = 0,
  safetyScore = 0,
  marketScore = 0,
  ipScore = 0,
  evidenceScore = 0,
  noveltyScore = 0,
  useColor = true,
}: RiskRadarProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const dimensions: RiskDimension[] = [
    { dimension: 'Clinical', score: Math.min(clinicalScore, 10), fullMark: 10, icon: '🏥', detail: 'Phase progression & trial volume' },
    { dimension: 'Safety', score: Math.min(safetyScore, 10), fullMark: 10, icon: '🛡️', detail: 'Adverse event profile & toxicity' },
    { dimension: 'Market', score: Math.min(marketScore, 10), fullMark: 10, icon: '📈', detail: 'TAM, CAGR & market opportunity' },
    { dimension: 'IP Freedom', score: Math.min(ipScore, 10), fullMark: 10, icon: '⚖️', detail: 'Patent landscape & FTO' },
    { dimension: 'Evidence', score: Math.min(evidenceScore, 10), fullMark: 10, icon: '📚', detail: 'Literature density & citations' },
    { dimension: 'Novelty', score: Math.min(noveltyScore, 10), fullMark: 10, icon: '✨', detail: 'Mechanism uniqueness & differentiation' },
  ];

  const overallScore = (dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length).toFixed(1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span>{data.icon}</span>
            <span className="text-sm font-medium text-zinc-100">{data.dimension}</span>
          </div>
          <p className="text-xs text-zinc-400">{data.detail}</p>
          <p className="text-lg font-mono font-bold text-indigo-400 mt-1">{data.score.toFixed(1)}<span className="text-zinc-600 text-xs">/10</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Risk-Benefit Radar
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Multi-dimensional assessment for {drugName}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-mono font-bold text-indigo-400">{overallScore}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Overall</span>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={dimensions} cx="50%" cy="50%">
            <PolarGrid strokeDasharray="3 3" stroke="#27272a" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: '#52525b', fontSize: 9 }}
              tickCount={6}
              axisLine={false}
            />
            <Radar
              name={drugName}
              dataKey="score"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 4, fill: '#818cf8', stroke: '#0a0a0b', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#a78bfa', stroke: '#0a0a0b', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension pills */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {dimensions.map((d, i) => {
          const pct = (d.score / d.fullMark) * 100;
          const color = useColor
            ? (pct >= 70 ? 'text-emerald-400 bg-emerald-400' : pct >= 40 ? 'text-amber-400 bg-amber-400' : 'text-rose-400 bg-rose-400')
            : 'text-zinc-400 bg-zinc-500';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="bg-zinc-800/40 border border-zinc-800/60 rounded-lg p-2.5 flex items-center gap-2"
            >
              <span className="text-sm">{d.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-zinc-500 truncate">{d.dimension}</div>
                <div className="h-1 w-full bg-zinc-800 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${color.split(' ')[1]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <span className={`text-xs font-mono font-bold ${color.split(' ')[0]}`}>{d.score.toFixed(1)}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
