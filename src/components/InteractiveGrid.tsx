"use client";

import React, { useEffect, useRef } from "react";

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation loop and states
  const animationFrameIdRef = useRef<number | null>(null);
  const isLoopRunningRef = useRef(false);
  const isMouseActiveRef = useRef(false);
  const mouseInfluenceRef = useRef(0);
  
  // Mouse coords: target position (actual input) and current position (lerped)
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      triggerAnimation();
    };

    const triggerAnimation = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      isMouseActiveRef.current = true;
      triggerAnimation();
    };

    const handleMouseLeave = () => {
      isMouseActiveRef.current = false;
      triggerAnimation();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX;
        mouseRef.current.targetY = e.touches[0].clientY;
        isMouseActiveRef.current = true;
        triggerAnimation();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = e.touches[0].clientX;
        mouseRef.current.targetY = e.touches[0].clientY;
        isMouseActiveRef.current = true;
        triggerAnimation();
      }
    };

    const handleTouchEnd = () => {
      isMouseActiveRef.current = false;
      triggerAnimation();
    };

    // Set initial size
    handleResize();

    // Register event listeners on window
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    const SPACING = 38;
    const GLOW_RADIUS = 120;

    function tick() {
      if (!canvas || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Lerp mouse positions
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.1;
      m.y += (m.targetY - m.y) * 0.1;

      // Lerp mouse influence value
      const targetInfluence = isMouseActiveRef.current ? 1 : 0;
      mouseInfluenceRef.current += (targetInfluence - mouseInfluenceRef.current) * 0.08;

      const influence = mouseInfluenceRef.current;

      // Define grid count boundaries
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;

      ctx.clearRect(0, 0, width, height);

      // Helper function to build grid path
      const buildGridPath = () => {
        ctx.beginPath();
        
        // Horizontal lines
        for (let r = 0; r < rows; r++) {
          const y = r * SPACING - SPACING / 2;
          ctx.moveTo(-SPACING / 2, y);
          ctx.lineTo(width + SPACING / 2, y);
        }

        // Vertical lines
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING - SPACING / 2;
          ctx.moveTo(x, -SPACING / 2);
          ctx.lineTo(x, height + SPACING / 2);
        }
      };

      // 1. Draw static background grid
      buildGridPath();
      ctx.strokeStyle = "rgba(0, 110, 255, 0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Draw glow overlay centered at cursor
      if (influence > 0.001) {
        buildGridPath();
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, GLOW_RADIUS);
        grad.addColorStop(0, `rgba(0, 110, 255, ${0.45 * influence})`);
        grad.addColorStop(1, "rgba(0, 110, 255, 0)");
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Sleep animation check
      const isMouseLerped = Math.abs(m.targetX - m.x) < 0.1 && Math.abs(m.targetY - m.y) < 0.1;
      const isInfluenceDone = Math.abs(targetInfluence - influence) < 0.001;

      if (!isMouseActiveRef.current && isMouseLerped && isInfluenceDone) {
        isLoopRunningRef.current = false;
        animationFrameIdRef.current = null;
      } else {
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none block"
    />
  );
}
