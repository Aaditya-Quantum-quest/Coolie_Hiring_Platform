import { useEffect, useRef, useState, useCallback } from "react";

const MESSAGES = [
  "initializing...",
  "loading assets...",
  "fetching data...",
  "building ui...",
  "almost there...",
  "done!",
];

export default function Preloader({ onComplete }) {
  const waveCvsRef = useRef(null);
  const pCvsRef = useRef(null);
  const wrapRef = useRef(null);
  const waveFillRef = useRef(null);
  const rafRef = useRef(null);
  const loadRafRef = useRef(null);
  const waveT = useRef(0);
  const particles = useRef([]);

  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [done, setDone] = useState(false);

  /* ─── Resize particle canvas ─── */
  const resizePCvs = useCallback(() => {
    const cvs = pCvsRef.current;
    const wrap = wrapRef.current;
    if (!cvs || !wrap) return;
    cvs.width = wrap.offsetWidth;
    cvs.height = wrap.offsetHeight;
  }, []);

  /* ─── Draw animated wave ─── */
  const drawWave = useCallback((ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    const t = waveT.current;

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) {
      const y =
        H / 2 +
        Math.sin(x * 0.025 + t) * 7 +
        Math.sin(x * 0.04 + t * 1.4) * 4 +
        Math.cos(x * 0.018 + t * 0.8) * 3;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(99,102,241,0.95)");
    grad.addColorStop(1, "rgba(79,70,229,0.85)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) {
      const y =
        H / 2 +
        Math.sin(x * 0.028 + t * 1.3 + 1) * 4 +
        Math.sin(x * 0.036 + t * 1.1 + 2) * 2.5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = "rgba(165,180,252,0.18)";
    ctx.fill();
  }, []);

  /* ─── Draw floating particles ─── */
  const drawParticles = useCallback((ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    particles.current = particles.current.filter((p) => p.y > -10 && p.alpha > 0);
    particles.current.forEach((p) => {
      p.y -= p.speed;
      p.alpha -= 0.0012;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.alpha)})`;
      ctx.fill();
    });
    if (Math.random() < 0.18 && particles.current.length < 60) {
      particles.current.push({
        x: Math.random() * W,
        y: H + 4,
        r: Math.random() * 2 + 1,
        speed: Math.random() * 0.6 + 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? "99,102,241" : "165,180,252",
      });
    }
  }, []);

  /* ─── Main animation loop ─── */
  const animate = useCallback(() => {
    waveT.current += 0.045;

    const waveCvs = waveCvsRef.current;
    const pCvs = pCvsRef.current;
    if (waveCvs) drawWave(waveCvs.getContext("2d"), waveCvs.width, waveCvs.height);
    if (pCvs) drawParticles(pCvs.getContext("2d"), pCvs.width, pCvs.height);

    rafRef.current = requestAnimationFrame(animate);
  }, [drawWave, drawParticles]);

  /* ─── Progress ticker ─── */
  useEffect(() => {
    const duration = 3600;
    let start = null;
    let prevMsgIdx = 0;

    const step = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const raw = Math.min(elapsed / duration, 1);
      const eased = raw < 0.8 ? raw * 1.1 : 0.88 + (raw - 0.8) * 0.6;
      const p = Math.min(eased, 1);

      setProgress(p);

      const idx = Math.min(Math.floor(p * MESSAGES.length), MESSAGES.length - 1);
      if (idx !== prevMsgIdx) {
        prevMsgIdx = idx;
        setMsgVisible(false);
        setTimeout(() => {
          setMsgIdx(idx);
          setMsgVisible(true);
        }, 200);
      }

      if (p < 1) {
        loadRafRef.current = requestAnimationFrame(step);
      } else {
        // Hold at 100% for a moment before transitioning
        setTimeout(() => {
          setDone(true);
          cancelAnimationFrame(rafRef.current);
          // Add extra delay for smooth transition to homepage
          setTimeout(() => {
            onComplete?.();
          }, 800);
        }, 1200);
      }
    };

    loadRafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(loadRafRef.current);
    };
  }, [onComplete]);

  /* ─── Start render loop & resize ─── */
  useEffect(() => {
    resizePCvs();
    window.addEventListener("resize", resizePCvs);
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("resize", resizePCvs);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, resizePCvs]);

  /* ─── Resize wave canvas when fill width changes ─── */
  useEffect(() => {
    const cvs = waveCvsRef.current;
    const fill = waveFillRef.current;
    if (!cvs || !fill) return;
    cvs.width = fill.parentElement?.offsetWidth * 2 || 600;
    cvs.height = fill.offsetHeight || 48;
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <div
      ref={wrapRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#0f0e17" }}
    >
      {/* Floating particles */}
      <canvas ref={pCvsRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Preloader content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-9 transition-all duration-700
          ${done ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}
      >
        {/* Brand */}
        <div
          className="text-xl font-medium tracking-widest"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          A <span style={{ color: "#6366f1" }}>Helping Hand</span> on Every Platform.
        </div>

        {/* Wave bar */}
        <div className="flex flex-col items-center gap-3 w-72">
          <div
            className="relative w-full overflow-hidden"
            style={{
              height: 48,
              borderRadius: 24,
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Filled portion */}
            <div
              ref={waveFillRef}
              className="absolute top-0 left-0 h-full overflow-hidden transition-[width] duration-100 linear"
              style={{ width: `${pct}%`, borderRadius: 24 }}
            >
              <canvas ref={waveCvsRef} className="absolute inset-0 w-full h-full" />
            </div>
          </div>

          {/* Percentage row */}
          <div className="flex justify-between w-full items-center">
            <span className="text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
              loading
            </span>
            <span className="text-lg font-medium" style={{ color: "#a5b4fc" }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Status message */}
        <div
          className="text-xs tracking-widest transition-opacity duration-300"
          style={{
            color: "rgba(255,255,255,0.35)",
            opacity: msgVisible ? 1 : 0,
          }}
        >
          {MESSAGES[msgIdx]}
        </div>
      </div>
    </div>
  );
}

/*
  ── USAGE ────────────────────────────────────────────────────────────
  In your App.jsx:

  import { useState } from "react";
  import Preloader from "./components/Preloader";
  import MainApp from "./MainApp";

  export default function App() {
    const [loaded, setLoaded] = useState(false);
    return loaded ? <MainApp /> : <Preloader onComplete={() => setLoaded(true)} />;
  }
  ─────────────────────────────────────────────────────────────────────
*/