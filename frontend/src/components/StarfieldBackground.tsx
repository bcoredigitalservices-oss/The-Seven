"use client";

import { useEffect, useRef } from "react";

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);
    resize();

    // ── Stars ──────────────────────────────────────────────────────
    const NUM_STARS = 480;
    type Star = { x: number; y: number; z: number; pz: number };
    const stars: Star[] = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      z: Math.random() * 1200,
      pz: 0,
    }));

    let animationId: number;

    const render = () => {
      // Deep space background
      ctx.fillStyle = "#030308";
      ctx.fillRect(0, 0, width, height);

      // Subtle nebula vignette — deep blue
      const nebula = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.75);
      nebula.addColorStop(0, "transparent");
      nebula.addColorStop(0.45, "rgba(10, 30, 100, 0.08)");
      nebula.addColorStop(0.75, "rgba(5, 15, 60, 0.35)");
      nebula.addColorStop(1, "rgba(2, 5, 30, 0.7)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      // Stars — 3-D warp
      const cx = width / 2;
      const cy = height / 2;
      const speed = 2.4;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0) {
          s.x = Math.random() * width - cx;
          s.y = Math.random() * height - cy;
          s.z = 1200;
          s.pz = s.z;
        }

        const scale = 1200;
        const px  = (s.x / s.z)  * scale + cx;
        const py  = (s.y / s.z)  * scale + cy;
        const ppx = (s.x / s.pz) * scale + cx;
        const ppy = (s.y / s.pz) * scale + cy;

        const progress = 1 - s.z / 1200;
        const size  = progress * 2.2;
        const alpha = progress * 0.9;

        // Trail — blue-tinted
        ctx.strokeStyle = `rgba(160, 210, 255, ${alpha * 0.35})`;
        ctx.lineWidth   = size * 0.5;
        ctx.beginPath();
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Dot — cool white-blue
        ctx.fillStyle = `rgba(200, 225, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
