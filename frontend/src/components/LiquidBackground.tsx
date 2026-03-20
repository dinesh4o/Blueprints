import { useEffect, useRef } from "react";

export function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const drawLiquidBlob = (xCenter: number, yCenter: number, baseRadius: number, color: string, tOffset: number) => {
        const x = xCenter + Math.sin(time * 0.8 + tOffset) * (width * 0.15);
        const y = yCenter + Math.cos(time * 0.6 + tOffset) * (height * 0.15);
        const r = baseRadius + Math.sin(time * 1.2 + tOffset) * (baseRadius * 0.2);

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };

      // Silver/zinc thematic glowing liquid blobs with very soft opacity
      drawLiquidBlob(width * 0.4, height * 0.3, width * 0.4, "rgba(212, 212, 216, 0.08)", 0);
      drawLiquidBlob(width * 0.6, height * 0.6, width * 0.45, "rgba(161, 161, 170, 0.07)", 2);
      drawLiquidBlob(width * 0.5, height * 0.5, width * 0.5, "rgba(82, 82, 91, 0.06)", 4);
      drawLiquidBlob(width * 0.3, height * 0.7, width * 0.35, "rgba(228, 228, 231, 0.05)", 1.5);
      
      const gradient = ctx.createLinearGradient(0, height, width, height - Math.sin(time)*100);
      gradient.addColorStop(0, "rgba(113, 113, 122, 0.03)");
      gradient.addColorStop(0.5, "rgba(212, 212, 216, 0.04)");
      gradient.addColorStop(1, "rgba(63, 63, 70, 0)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for(let i=0; i<=width; i+=40) {
        ctx.lineTo(i, height * 0.5 + Math.sin(i*0.005 + time)*100 + Math.cos(i*0.002 - time)*50);
      }
      ctx.lineTo(width, height);
      ctx.fill();

      time += 0.015;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-60">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(15,15,17,1)_80%)]" />
    </div>
  );
}

