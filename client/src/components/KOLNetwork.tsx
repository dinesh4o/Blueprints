import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface KOLNetworkProps {
  literatureData: any[];
}

export default function KOLNetwork({ literatureData }: KOLNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!literatureData || literatureData.length === 0 || !svgRef.current || !containerRef.current) return;

    // Extract nodes and links
    const nodesMap = new Map<string, { id: string, group: number, radius: number }>();
    const linksMap = new Map<string, { source: string, target: string, value: number }>();

    literatureData.forEach((article, i) => {
      const authors = article.authors || [];
      authors.forEach((author: string) => {
        if (!nodesMap.has(author)) {
          nodesMap.set(author, { id: author, group: i % 5, radius: 5 });
        } else {
          nodesMap.get(author)!.radius += 2; // Increase size for more publications
        }
      });

      // Create links between co-authors
      for (let j = 0; j < authors.length; j++) {
        for (let k = j + 1; k < authors.length; k++) {
          const source = authors[j];
          const target = authors[k];
          // Ensure consistent link ID regardless of order
          const linkId = [source, target].sort().join('-');
          if (linksMap.has(linkId)) {
            linksMap.get(linkId)!.value += 1;
          } else {
            linksMap.set(linkId, { source, target, value: 1 });
          }
        }
      }
    });

    const nodes = Array.from(nodesMap.values());
    const links = Array.from(linksMap.values());

    if (nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = 400;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Add a subtle grid or background if desired
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent');

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(50))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 2));

    const link = svg.append('g')
      .attr('stroke', '#4b5563')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.min(d.radius, 20)) // Cap radius
      .attr('fill', d => color(d.group.toString()));

    node.append('title')
      .text(d => d.id);

    // Add labels for prominent nodes
    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes.filter(d => d.radius > 7)) // Only label nodes with multiple papers
      .join('text')
      .text(d => d.id)
      .attr('font-size', '10px')
      .attr('fill', '#9ca3af')
      .attr('dx', 12)
      .attr('dy', 4);

    // Drag behavior
    const drag = d3.drag<SVGCircleElement, any>()
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
      });

    node.call(drag as any);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr('cy', (d: any) => d.y = Math.max(d.radius, Math.min(height - d.radius, d.y)));

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [literatureData]);

  if (!literatureData || literatureData.length === 0) {
    return <div className="flex items-center justify-center h-[400px] text-muted-foreground">No author data available for network.</div>;
  }

  return (
    <div ref={containerRef} className="w-full h-[400px] relative overflow-hidden rounded-lg bg-black/20 border border-border/50">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-sm font-semibold text-foreground">KOL Network</h3>
        <p className="text-xs text-muted-foreground">Co-authorship Force-Directed Graph</p>
      </div>
    </div>
  );
}
