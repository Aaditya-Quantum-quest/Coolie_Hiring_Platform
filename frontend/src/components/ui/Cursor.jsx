import { useEffect, useRef, useState, useCallback } from "react";

export default function CustomCursor() {
  const outerRef = useRef(null);
  const dotRef = useRef(null);
  const canvasRef = useRef(null);
  const trailRef = useRef([]);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const outerPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const TRAIL_LEN = 28;

  // Resize canvas to fill window
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  // Draw the tail on canvas
  const drawTail = useCallback((hovering) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const trail = trailRef.current;
    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i++) {
      const t = i / trail.length;
      const alpha = t * 0.55;
      const width = t * (hovering ? 5 : 3.5);
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  }, []);

  // Animation loop
  const tick = useCallback(() => {
    const outer = outerRef.current;
    const dot = dotRef.current;
    if (!outer || !dot) return;

    const hovering = isHovering;

    // Lerp outer ring toward mouse
    outerPosRef.current.x += (mouseRef.current.x - outerPosRef.current.x) * 0.14;
    outerPosRef.current.y += (mouseRef.current.y - outerPosRef.current.y) * 0.14;

    outer.style.left = `${outerPosRef.current.x}px`;
    outer.style.top = `${outerPosRef.current.y}px`;

    // Add to trail
    trailRef.current.push({ x: outerPosRef.current.x, y: outerPosRef.current.y });
    if (trailRef.current.length > TRAIL_LEN) trailRef.current.shift();

    drawTail(hovering);
    rafRef.current = requestAnimationFrame(tick);
  }, [isHovering, drawTail]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const onMouseMove = (e) => {
      const dot = dotRef.current;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (dot) {
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`*, *::before, *::after { cursor: none !important; }`}</style>

      {/* Tail canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {/* Outer ring */}
      <div
        ref={outerRef}
        className={`fixed pointer-events-none z-[9999] rounded-full border-2 -translate-x-1/2 -translate-y-1/2
          transition-[width,height,border-color,background-color] duration-300 ease-out
          ${isHovering
            ? "w-16 h-16 border-indigo-400/50 bg-indigo-500/10"
            : "w-9 h-9 border-indigo-500/85 bg-transparent"
          }`}
        style={{ top: 0, left: 0 }}
      />

      {/* Center dot */}
      <div
        ref={dotRef}
        className={`fixed pointer-events-none z-[10000] rounded-full bg-indigo-500 -translate-x-1/2 -translate-y-1/2
          transition-[width,height] duration-200
          ${isHovering ? "w-2 h-2" : "w-1.5 h-1.5"}`}
        style={{ top: 0, left: 0 }}
      />
    </>
  );
}