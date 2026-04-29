import { useEffect, useRef, useState, useCallback } from "react";

const MESSAGES = [
  { en: "Initializing elite porter network...", hi: "पोर्टर कुली नेटवर्क सक्रिय हो रहा है..." },
  { en: "Verifying station locations...", hi: "स्टेशन की जानकारी जाँची जा रही है..." },
  { en: "Loading luggage handlers...", hi: "सामान सहायक तैयार हो रहे हैं..." },
  { en: "Fetching real-time data...", hi: "रीयल-टाइम डेटा प्राप्त हो रहा है..." },
  { en: "Building your experience...", hi: "आपका अनुभव तैयार किया जा रहा है..." },
  { en: "Almost ready...", hi: "बस कुछ ही पल में..." },
];

export default function Preloader({ onComplete }) {
  const pCvsRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const loadRafRef = useRef(null);
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

  /* ─── Draw floating particles ─── */
  const drawParticles = useCallback((ctx, W, H) => {
    ctx.clearRect(0, 0, W, H);
    particles.current = particles.current.filter((p) => p.y > -10 && p.alpha > 0);
    particles.current.forEach((p) => {
      p.y -= p.speed;
      p.alpha -= 0.0008;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${Math.max(0, p.alpha)})`;
      ctx.fill();
    });
    if (Math.random() < 0.12 && particles.current.length < 40) {
      particles.current.push({
        x: Math.random() * W,
        y: H + 4,
        r: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.4 + 0.2,
        alpha: Math.random() * 0.25 + 0.05,
        color: Math.random() > 0.5 ? "99,102,241" : "148,163,254",
      });
    }
  }, []);

  /* ─── Main animation loop ─── */
  const animate = useCallback(() => {
    const pCvs = pCvsRef.current;
    if (pCvs) drawParticles(pCvs.getContext("2d"), pCvs.width, pCvs.height);
    rafRef.current = requestAnimationFrame(animate);
  }, [drawParticles]);

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
        setTimeout(() => {
          setDone(true);
          cancelAnimationFrame(rafRef.current);
          setTimeout(() => {
            onComplete?.();
          }, 800);
        }, 1200);
      }
    };

    loadRafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(loadRafRef.current);
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

  const pct = Math.round(progress * 100);

  return (
    <div
      ref={wrapRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#080c18" }}
    >
      {/* Floating particles */}
      <canvas ref={pCvsRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Subtle radial glow behind content */}
      <div
        className="absolute pointer-events-none z-0"
        style={{
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Preloader content */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-700
          ${done ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}
      >
        {/* Icon box */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
            marginBottom: 4,
          }}
        >
          {/* Archive/luggage icon */}
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#818cf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" rx="1" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="font-bold tracking-wide"
            style={{
              color: "#ffffff",
              fontSize: 26,
              letterSpacing: "0.02em",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            <span style={{ color: "#818cf8" }}>Coolie</span>Seva
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
              letterSpacing: "0.03em",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            आपका सामान हमारी जिम्मेदारी
          </div>
        </div>

        {/* Large percentage */}
        <div
          className="flex items-baseline"
          style={{ color: "#ffffff", lineHeight: 1 }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            {pct}
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "rgba(255,255,255,0.55)",
              marginLeft: 2,
              marginBottom: 4,
            }}
          >
            %
          </span>
        </div>

        {/* Thin progress bar */}
        <div
          style={{
            width: 260,
            height: 5,
            borderRadius: 99,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Filled track */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${pct}%`,
              borderRadius: 99,
              background: "linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)",
              transition: "width 0.1s linear",
              boxShadow: "0 0 8px rgba(99,102,241,0.7)",
            }}
          />
          {/* Shimmer on the tip */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(${pct}% - 20px)`,
              width: 20,
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35))",
              borderRadius: 99,
              transition: "left 0.1s linear",
            }}
          />
        </div>

        {/* Status messages */}
        <div
          className="flex flex-col items-center gap-1 transition-opacity duration-300"
          style={{ opacity: msgVisible ? 1 : 0 }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 11,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            {MESSAGES[msgIdx].en}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.28)",
              fontSize: 11,
              letterSpacing: "0.02em",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            {MESSAGES[msgIdx].hi}
          </div>
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