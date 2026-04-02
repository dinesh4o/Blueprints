import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, X, Maximize2 } from 'lucide-react';
import * as d3 from 'd3';

interface PathwayNode {
  id: string;
  label: string;
  type: 'drug' | 'target' | 'disease';
  score?: number;
  phase?: string;
}

interface PathwayLink {
  source: string;
  target: string;
  strength: number;
  isDrugToTarget: boolean;
}

const NODE_COLORS: Record<string, string> = {
  drug: '#06b6d4',
  target: '#818cf8',
  disease: '#34d399',
};

const NODE_SIZES: Record<string, number> = {
  drug: 32,
  target: 20,
  disease: 16,
};

function strengthColor(score: number): string {
  if (score >= 7.5) return '#34d399'; // emerald
  if (score >= 5) return '#f59e0b';   // amber
  return '#f43f5e';                   // rose
}

export default function InteractivePathway({ report }: { report: any }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<PathwayNode | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Track actual container dimensions via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setContainerSize((prev) => (prev.w === Math.round(width) && prev.h === Math.round(height) ? prev : { w: Math.round(width), h: Math.round(height) }));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || containerSize.w === 0 || containerSize.h === 0) return;

    const pd = report.pubchem_data || {};
    const drugName = report.molecule || 'Compound';

    // Extract targets from mechanism_of_action text
    const mechText: string = pd.mechanism_of_action || pd.pharmacology || '';
    const rawTargets: string[] = [];
    const bioTermPattern = /([A-Z][A-Za-z0-9-]{2,20}(?:\s+(?:kinase|receptor|pathway|inhibitor|activator|transporter|channel|protein|enzyme|complex))?)/g;
    let m: RegExpExecArray | null;
    while ((m = bioTermPattern.exec(mechText)) !== null && rawTargets.length < 5) {
      const term = m[1].trim();
      if (term.length > 3 && !['This', 'The ', 'For ', 'It ', 'Its'].includes(term.substring(0, 4))) {
        rawTargets.push(term);
      }
    }
    const targets = rawTargets.length > 0 ? rawTargets.slice(0, 5) : ['Primary Target'];

    // Diseases from repurposing candidates
    const candidates = (report.repurposing_candidates || []).slice(0, 8);
    const diseases = candidates.map((c: any) => c.condition);

    // Build nodes
    const nodes: (PathwayNode & d3.SimulationNodeDatum)[] = [
      { id: 'drug-0', label: drugName, type: 'drug' },
    ];
    targets.forEach((t, i) => {
      nodes.push({ id: `target-${i}`, label: t, type: 'target' });
    });
    candidates.forEach((c: any, i: number) => {
      nodes.push({
        id: `disease-${i}`,
        label: c.condition,
        type: 'disease',
        score: c.repurposing_score,
        phase: c.max_phase,
      });
    });

    // Build links
    const links: (PathwayLink & { source: any; target: any })[] = [];
    targets.forEach((_, i) => {
      links.push({
        source: 'drug-0',
        target: `target-${i}`,
        strength: 0.7,
        isDrugToTarget: true,
      });
    });
    candidates.forEach((c: any, di: number) => {
      const ti = di % targets.length;
      links.push({
        source: `target-${ti}`,
        target: `disease-${di}`,
        strength: (c.repurposing_score || 3) / 10,
        isDrugToTarget: false,
      });
    });

    if (nodes.length <= 1) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerSize.w;
    const height = containerSize.h;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Click on background to deselect
    svg.on('click', () => setSelectedTarget(null));

    // Defs: glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'pathway-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120).strength((d: any) => d.strength * 0.4))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => NODE_SIZES[d.type] + 12))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d: any) => {
        if (d.isDrugToTarget) return '#06b6d4';
        // Color by evidence strength for target→disease
        const diseaseNode = nodes.find(n => n.id === (typeof d.target === 'string' ? d.target : d.target.id));
        return strengthColor((diseaseNode?.score || 3));
      })
      .attr('stroke-width', (d: any) => d.isDrugToTarget ? 2.5 : Math.max(1, d.strength * 3))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', (d: any) => d.isDrugToTarget ? '' : '6 3')
      .attr('class', 'pathway-link');

    // Animated particles along links
    const particleGroup = g.append('g');
    links.forEach((linkData, i) => {
      const particle = particleGroup.append('circle')
        .attr('r', 2)
        .attr('fill', (linkData as any).isDrugToTarget ? '#06b6d4' : '#818cf8')
        .attr('opacity', 0.7);

      function animateParticle() {
        particle
          .attr('cx', (linkData.source as any).x || 0)
          .attr('cy', (linkData.source as any).y || 0)
          .transition()
          .duration(2500 + Math.random() * 2000)
          .delay(i * 150)
          .attr('cx', (linkData.target as any).x || 0)
          .attr('cy', (linkData.target as any).y || 0)
          .on('end', animateParticle);
      }
      setTimeout(() => animateParticle(), 1000 + i * 150);
    });

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node outer glow
    node.append('circle')
      .attr('r', (d: any) => NODE_SIZES[d.type] + 6)
      .attr('fill', (d: any) => NODE_COLORS[d.type])
      .attr('opacity', 0.12)
      .attr('filter', 'url(#pathway-glow)');

    // Node circle
    node.append('circle')
      .attr('r', (d: any) => NODE_SIZES[d.type])
      .attr('fill', '#0a0a0b')
      .attr('stroke', (d: any) => NODE_COLORS[d.type])
      .attr('stroke-width', 2)
      .attr('class', 'pathway-node-circle');

    // Drug inner dot
    node.filter((d: any) => d.type === 'drug')
      .append('circle')
      .attr('r', 10)
      .attr('fill', NODE_COLORS.drug)
      .attr('opacity', 0.5);

    // Score badge for diseases
    node.filter((d: any) => d.type === 'disease' && d.score != null)
      .append('text')
      .text((d: any) => d.score.toFixed(1))
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any) => strengthColor(d.score))
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'ui-monospace, monospace');

    // Node labels
    node.append('text')
      .text((d: any) => {
        const label = d.label || '';
        return label.length > 20 ? label.substring(0, 18) + '…' : label;
      })
      .attr('dy', (d: any) => NODE_SIZES[d.type] + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'system-ui, sans-serif');

    // Type labels
    node.append('text')
      .text((d: any) => d.type.toUpperCase())
      .attr('dy', (d: any) => -NODE_SIZES[d.type] - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any) => NODE_COLORS[d.type])
      .attr('font-size', '7px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .attr('opacity', 0.6);

    // Interactivity: hover
    node.selectAll('.pathway-node-circle')
      .on('mouseover', function (_event: any, d: any) {
        d3.select(this).transition().duration(200).attr('stroke-width', 4).attr('r', NODE_SIZES[d.type] + 4);
        setHoveredNode(d);
      })
      .on('mouseout', function (_event: any, d: any) {
        d3.select(this).transition().duration(200).attr('stroke-width', 2).attr('r', NODE_SIZES[d.type]);
        setHoveredNode(null);
      });

    // Click on target node to highlight connected diseases
    node.on('click', function (event: any, d: any) {
      event.stopPropagation();
      if (d.type === 'target') {
        setSelectedTarget((prev: string | null) => prev === d.id ? null : d.id);
      }
    });

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [report, isFullscreen, containerSize]);

  // Apply highlight/dim when selectedTarget changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!selectedTarget) {
      // Reset all opacities
      svg.selectAll('.pathway-link').attr('stroke-opacity', 0.6);
      svg.selectAll('g > g > g').attr('opacity', 1);
      return;
    }

    // Find connected disease IDs
    svg.selectAll('.pathway-link')
      .attr('stroke-opacity', (d: any) => {
        const srcId = typeof d.source === 'string' ? d.source : d.source.id;
        const tgtId = typeof d.target === 'string' ? d.target : d.target.id;
        if (srcId === selectedTarget || tgtId === selectedTarget || srcId === 'drug-0' && tgtId === selectedTarget) return 0.9;
        return 0.08;
      });

    // Dim non-connected nodes
    svg.selectAll('g > g > g')
      .attr('opacity', function (d: any) {
        if (!d || !d.id) return 1;
        if (d.id === selectedTarget || d.id === 'drug-0') return 1;
        // Check if this node is linked to the selected target
        const isConnected = svgRef.current && d3.select(svgRef.current).selectAll('.pathway-link')
          .data()
          .some((link: any) => {
            const srcId = typeof link.source === 'string' ? link.source : link.source.id;
            const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
            return (srcId === selectedTarget && tgtId === d.id) || (tgtId === selectedTarget && srcId === d.id);
          });
        return isConnected ? 1 : 0.12;
      });
  }, [selectedTarget]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-[100] bg-[#000000]' : ''}`}>
      <div
        ref={containerRef}
        className={`relative bg-[#0a0a0b] border border-zinc-800/60 rounded-2xl overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-20px)]' : 'h-[550px]'
        }`}
      >
        <svg ref={svgRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-xl p-3">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{type}</span>
            </div>
          ))}
          <div className="border-l border-zinc-700 pl-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-zinc-500">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-zinc-500">Mid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full bg-rose-400" />
              <span className="text-[10px] text-zinc-500">Low</span>
            </div>
          </div>
        </div>

        {/* Fullscreen toggle */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {selectedTarget && (
            <button
              onClick={() => setSelectedTarget(null)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors"
            >
              Clear Focus
            </button>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <X size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute top-4 left-4 text-[10px] text-zinc-600 space-y-1">
          <p>Drag nodes to rearrange</p>
          <p>Scroll to zoom · Click target to focus</p>
          <p>Edge color = evidence strength</p>
        </div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-4 right-4 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 min-w-[220px] shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }} />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">{hoveredNode.type}</span>
              </div>
              <p className="text-sm font-medium text-zinc-100">{hoveredNode.label}</p>
              {hoveredNode.score != null && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Score:</span>
                  <span className="text-sm font-mono font-bold" style={{ color: strengthColor(hoveredNode.score) }}>
                    {hoveredNode.score.toFixed(1)}/10
                  </span>
                </div>
              )}
              {hoveredNode.phase && (
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Phase:</span>
                  <span className="text-xs font-mono text-zinc-300">{hoveredNode.phase}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
