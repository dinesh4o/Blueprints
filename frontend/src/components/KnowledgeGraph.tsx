import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  label: string;
  type: 'drug' | 'target' | 'disease' | 'pathway' | 'trial';
  score?: number;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
  label?: string;
}

interface KnowledgeGraphProps {
  drugName: string;
  data: {
    targets?: Array<{ name: string; score?: number }>;
    diseases?: Array<{ name: string; score?: number; phase?: string }>;
    pathways?: string[];
    trials?: Array<{ id: string; phase?: string }>;
  };
}

const NODE_COLORS: Record<string, string> = {
  drug: '#818cf8',
  target: '#f472b6',
  disease: '#34d399',
  pathway: '#fbbf24',
  trial: '#60a5fa',
};

const NODE_SIZES: Record<string, number> = {
  drug: 28,
  target: 16,
  disease: 18,
  pathway: 14,
  trial: 12,
};

export function KnowledgeGraph({ drugName, data }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Build nodes and links
    const nodes: (GraphNode & d3.SimulationNodeDatum)[] = [];
    const links: (GraphLink & { source: any; target: any })[] = [];

    // Central drug node
    nodes.push({ id: 'drug-0', label: drugName, type: 'drug' });

    // Targets
    (data.targets || []).slice(0, 8).forEach((t, i) => {
      const id = `target-${i}`;
      nodes.push({ id, label: t.name, type: 'target', score: t.score });
      links.push({ source: 'drug-0', target: id, strength: t.score || 0.5, label: 'binds' });
    });

    // Diseases
    (data.diseases || []).slice(0, 10).forEach((d, i) => {
      const id = `disease-${i}`;
      nodes.push({ id, label: d.name, type: 'disease', score: d.score });
      // Link diseases to the drug and to related targets
      links.push({ source: 'drug-0', target: id, strength: d.score || 0.4, label: d.phase || 'indicated' });
      // Also link to a random target if available
      if (data.targets && data.targets.length > 0) {
        const targetIdx = i % Math.min(data.targets.length, 8);
        links.push({ source: `target-${targetIdx}`, target: id, strength: 0.3 });
      }
    });

    // Pathways
    (data.pathways || []).slice(0, 6).forEach((p, i) => {
      const id = `pathway-${i}`;
      nodes.push({ id, label: p, type: 'pathway' });
      // Link to targets
      if (data.targets && data.targets.length > 0) {
        const targetIdx = i % Math.min(data.targets.length, 8);
        links.push({ source: `target-${targetIdx}`, target: id, strength: 0.25 });
      }
    });

    // Trials
    (data.trials || []).slice(0, 6).forEach((t, i) => {
      const id = `trial-${i}`;
      nodes.push({ id, label: t.id, type: 'trial' });
      links.push({ source: 'drug-0', target: id, strength: 0.35, label: t.phase });
    });

    if (nodes.length <= 1) return;

    // Create zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    // Gradient definitions
    const defs = svg.append('defs');
    
    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Animated gradient for links
    const grad = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#818cf8').attr('stop-opacity', 0.6);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#34d399').attr('stop-opacity', 0.2);

    // Force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100).strength((d: any) => d.strength * 0.4))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => NODE_SIZES[d.type] + 10))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#71717a')
      .attr('stroke-width', (d: any) => Math.max(1, d.strength * 3))
      .attr('stroke-opacity', 0.6)
      .attr('stroke-dasharray', '4 2');

    // Animated particles along links
    const particleGroup = g.append('g');
    
    links.forEach((linkData, i) => {
      const particle = particleGroup.append('circle')
        .attr('r', 2)
        .attr('fill', '#818cf8')
        .attr('opacity', 0.8);

      function animateParticle() {
        particle
          .attr('cx', (linkData.source as any).x || 0)
          .attr('cy', (linkData.source as any).y || 0)
          .transition()
          .duration(2000 + Math.random() * 2000)
          .delay(i * 200)
          .attr('cx', (linkData.target as any).x || 0)
          .attr('cy', (linkData.target as any).y || 0)
          .on('end', animateParticle);
      }
      
      // Start after simulation settles
      setTimeout(() => animateParticle(), 1000 + i * 200);
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
      .attr('opacity', 0.1)
      .attr('filter', 'url(#glow)');

    // Node circle
    node.append('circle')
      .attr('r', (d: any) => NODE_SIZES[d.type])
      .attr('fill', '#0a0a0b')
      .attr('stroke', (d: any) => NODE_COLORS[d.type])
      .attr('stroke-width', 2)
      .on('mouseover', function (event, d: any) {
        d3.select(this).transition().duration(200).attr('stroke-width', 4).attr('r', NODE_SIZES[d.type] + 4);
        setHoveredNode(d);
      })
      .on('mouseout', function (event, d: any) {
        d3.select(this).transition().duration(200).attr('stroke-width', 2).attr('r', NODE_SIZES[d.type]);
        setHoveredNode(null);
      });

    // Node icon (inner circle)
    node.filter((d: any) => d.type === 'drug')
      .append('circle')
      .attr('r', 8)
      .attr('fill', (d: any) => NODE_COLORS[d.type])
      .attr('opacity', 0.6);

    // Node labels
    node.append('text')
      .text((d: any) => {
        const label = d.label || '';
        return label.length > 18 ? label.substring(0, 16) + '…' : label;
      })
      .attr('dy', (d: any) => NODE_SIZES[d.type] + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a1a1aa')
      .attr('font-size', '10px')
      .attr('font-family', 'system-ui, sans-serif');

    // Type labels
    node.append('text')
      .text((d: any) => d.type.toUpperCase())
      .attr('dy', -NODE_SIZES[(nodes[0] as any)?.type] - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: any) => NODE_COLORS[d.type])
      .attr('font-size', '7px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '1px')
      .attr('opacity', 0.6);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [drugName, data, isFullscreen]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-[100] bg-[#000000]' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-medium text-zinc-100">Knowledge Graph</h3>
          <span className="text-xs text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full">Interactive</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <X size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Graph */}
      <div
        ref={containerRef}
        className={`relative bg-[#0a0a0b] border border-zinc-800/60 rounded-2xl overflow-hidden ${
          isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px]'
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
        </div>

        {/* Hovered node tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-4 right-4 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 min-w-[200px] shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }} />
                <span className="text-xs text-zinc-400 uppercase tracking-wider">{hoveredNode.type}</span>
              </div>
              <p className="text-sm font-medium text-zinc-100">{hoveredNode.label}</p>
              {hoveredNode.score !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Score:</span>
                  <span className="text-sm font-mono text-indigo-400">{hoveredNode.score.toFixed(2)}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="absolute top-4 left-4 text-[10px] text-zinc-600 space-y-1">
          <p>Drag nodes to rearrange</p>
          <p>Scroll to zoom</p>
          <p>Hover for details</p>
        </div>
      </div>
    </div>
  );
}
