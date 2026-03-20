import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function IndicationMatrix({ clinicalData }: { clinicalData: any[] }) {
  const data = useMemo(() => {
    if (!clinicalData || clinicalData.length === 0) return [];

    const conditionMap = new Map<string, { count: number, maxPhase: number, name: string }>();

    clinicalData.forEach(trial => {
      const condition = trial.condition || 'Unknown';
      let phaseNum = 0;
      if (trial.phase?.includes('4')) phaseNum = 4;
      else if (trial.phase?.includes('3')) phaseNum = 3;
      else if (trial.phase?.includes('2')) phaseNum = 2;
      else if (trial.phase?.includes('1')) phaseNum = 1;

      if (conditionMap.has(condition)) {
        const existing = conditionMap.get(condition)!;
        existing.count += 1;
        existing.maxPhase = Math.max(existing.maxPhase, phaseNum);
      } else {
        conditionMap.set(condition, { count: 1, maxPhase: phaseNum, name: condition });
      }
    });

    return Array.from(conditionMap.values())
      .map(item => ({
        ...item,
        // Add some jitter to y-axis (count) if there are many with same count, or just use count
        y: item.count,
        x: item.maxPhase || 0.5, // 0.5 for unknown phase
        z: item.count * 100 // Bubble size
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 conditions
  }, [clinicalData]);

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No matching clinical trials or established indications found.</div>;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 border border-border p-3 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="font-semibold text-foreground mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">Trials: <span className="text-foreground font-medium">{data.count}</span></p>
          <p className="text-sm text-muted-foreground">Max Phase: <span className="text-foreground font-medium">{data.maxPhase || 'Not determined'}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Phase" 
            domain={[0, 4.5]} 
            ticks={[1, 2, 3, 4]} 
            tickFormatter={(val) => `Phase ${val}`}
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Trial Count" 
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            label={{ value: 'Number of Trials', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Volume" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Indications" data={data} fill="#06b6d4" fillOpacity={0.6}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.maxPhase >= 3 ? '#10b981' : '#06b6d4'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
