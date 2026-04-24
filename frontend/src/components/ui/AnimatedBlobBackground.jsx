import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedBlobBackground({ children }) {
    const containerRef = useRef(null);
    const blobCanvasRef = useRef(null);
    const particleCanvasRef = useRef(null);
    const svgRef = useRef(null);
    const cursorOuterRef = useRef(null);
    const cursorInnerRef = useRef(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const panel = containerRef.current;
        const blobC = blobCanvasRef.current;
        const partC = particleCanvasRef.current;
        const svgEl = svgRef.current;
        const curO = cursorOuterRef.current;
        const curI = cursorInnerRef.current;

        if (!panel || !blobC || !partC || !svgEl) return;

        const bc = blobC.getContext('2d');
        const pc = partC.getContext('2d');

        /* ── SIZE ── */
        function resize() {
            if (!panel || !blobC || !partC || !svgEl) return;
            const w = panel.offsetWidth;
            const h = panel.offsetHeight;
            blobC.width = partC.width = w;
            blobC.height = partC.height = h;
            svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svgEl.style.width = w + 'px';
            svgEl.style.height = h + 'px';
        }
        resize();
        window.addEventListener('resize', resize);

        /* ── MOUSE ── */
        let mx = panel.offsetWidth / 2, my = panel.offsetHeight / 2;
        let bx = mx, by = my;
        let vx = 0, vy = 0;
        let inside = false;

        const handleMouseMove = (e) => {
            const r = panel.getBoundingClientRect();
            mx = e.clientX - r.left;
            my = e.clientY - r.top;
            if (curO && curI) {
                curO.style.left = curI.style.left = mx + 'px';
                curO.style.top = curI.style.top = my + 'px';
            }
            trail.push({ x: mx, y: my, life: 1, r: Math.random() * 6 + 3 });
        };

        const handleMouseEnter = () => {
            inside = true;
            if (curO && curI) {
                curO.style.opacity = '1';
                curI.style.opacity = '1';
            }
        };

        const handleMouseLeave = () => {
            inside = false;
            if (curO && curI) {
                curO.style.opacity = '0';
                curI.style.opacity = '0';
            }
        };

        panel.addEventListener('mousemove', handleMouseMove);
        panel.addEventListener('mouseenter', handleMouseEnter);
        panel.addEventListener('mouseleave', handleMouseLeave);

        /* ── BLOB GEOMETRY ── */
        const N = 14;
        const R = 130;

        function blobPts(cx, cy, t, tx, ty) {
            const pts = [];
            for (let i = 0; i < N; i++) {
                const a = (i / N) * Math.PI * 2;
                const dx = Math.cos(a), dy = Math.sin(a);
                let r = R
                    + Math.sin(a * 2 + t * 0.7) * 28
                    + Math.cos(a * 3 - t * 0.5) * 18
                    + Math.sin(a * 1.5 + t * 1.1) * 10
                    + Math.sin(a * 5 + t * 0.9) * 6;
                const dist = Math.hypot(tx - cx, ty - cy);
                const pull = Math.max(0, 1 - dist / 280);
                const ang = Math.atan2(ty - cy, tx - cx);
                r += (dx * Math.cos(ang) + dy * Math.sin(ang)) * pull * 50;
                pts.push({ x: cx + dx * r, y: cy + dy * r });
            }
            return pts;
        }

        function drawBlob(pts, alpha, g) {
            bc.beginPath();
            for (let i = 0; i < pts.length; i++) {
                const p0 = pts[(i - 1 + N) % N];
                const p1 = pts[i];
                const p2 = pts[(i + 1) % N];
                if (i === 0) bc.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
                bc.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
            }
            bc.closePath();
            bc.fillStyle = g;
            bc.globalAlpha = alpha;
            bc.fill();
            bc.globalAlpha = 1;
        }

        /* ── TRAIL & RINGS ── */
        let trail = [];
        let rings = [];
        const ringInterval = setInterval(() => rings.push({ x: bx, y: by, r: R * 0.5, maxR: R * 2.4, alpha: 0.35 }), 2500);

        /* ── PARTICLES ── */
        const PCOUNT = 38;
        const particles = [];
        for (let i = 0; i < PCOUNT; i++) {
            particles.push({
                x: Math.random() * panel.offsetWidth,
                y: Math.random() * panel.offsetHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: Math.random() * 1.8 + 0.5,
                a: Math.random() * 0.5 + 0.15,
                pulse: Math.random() * Math.PI * 2,
                col: Math.random() > 0.5 ? '0,212,255' : '162,89,255',
            });
        }

        /* ── WANDER ── */
        let wanderX = panel.offsetWidth / 2;
        let wanderY = panel.offsetHeight / 2;
        function newWander() {
            wanderX = 80 + Math.random() * (panel.offsetWidth - 160);
            wanderY = 80 + Math.random() * (panel.offsetHeight - 180);
        }
        newWander();
        const wanderInterval = setInterval(newWander, 3500);

        /* ── MAIN LOOP ── */
        let t = 0, morphT = 0;
        let animationFrameId;

        function tick() {
            animationFrameId = requestAnimationFrame(tick);
            t += 0.016;
            morphT += 0.013;

            const W = panel.offsetWidth, H = panel.offsetHeight;
            const tx = inside ? mx : wanderX;
            const ty = inside ? my : wanderY;

            vx += (tx - bx) * 0.022; vx *= 0.88;
            vy += (ty - by) * 0.022; vy *= 0.88;
            bx += vx; by += vy;

            bc.clearRect(0, 0, W, H);

            const haloG = bc.createRadialGradient(bx, by, 0, bx, by, R * 2.2);
            haloG.addColorStop(0, 'rgba(90,60,200,0.22)');
            haloG.addColorStop(0.5, 'rgba(60,40,180,0.10)');
            haloG.addColorStop(1, 'rgba(0,0,0,0)');
            const hPts = blobPts(bx, by, t * 0.6, tx, ty);
            bc.save();
            bc.filter = 'blur(30px)';
            drawBlob(hPts, 1, haloG);
            bc.filter = 'none';
            bc.restore();

            const midG = bc.createRadialGradient(bx - 20, by - 30, 0, bx, by, R * 1.5);
            midG.addColorStop(0, 'rgba(130, 80, 255, 0.85)');
            midG.addColorStop(0.6, 'rgba(70, 50, 200, 0.65)');
            midG.addColorStop(1, 'rgba(30, 20, 120, 0.1)');
            bc.shadowBlur = 50;
            bc.shadowColor = 'rgba(100,60,255,0.5)';
            drawBlob(blobPts(bx, by, t, tx, ty), 0.82, midG);
            bc.shadowBlur = 0;

            const innG = bc.createRadialGradient(bx - 30, by - 40, 0, bx, by, R * 0.8);
            innG.addColorStop(0, 'rgba(180,140,255,0.6)');
            innG.addColorStop(1, 'rgba(80,60,200,0)');
            drawBlob(blobPts(bx - 10, by - 15, t * 0.75 + 1, tx, ty), 0.3, innG);

            const tealG = bc.createRadialGradient(W * 0.65, H * 0.05, 0, W * 0.65, H * 0.05, 160);
            tealG.addColorStop(0, 'rgba(0,200,220,0.35)');
            tealG.addColorStop(1, 'rgba(0,0,0,0)');
            bc.save(); bc.filter = 'blur(40px)';
            bc.globalAlpha = 1;
            bc.fillStyle = tealG;
            bc.fillRect(0, 0, W, H);
            bc.filter = 'none'; bc.restore();

            pc.clearRect(0, 0, W, H);

            rings = rings.filter(rg => rg.alpha > 0 && rg.r < rg.maxR);
            rings.forEach(rg => {
                rg.r += 1.3;
                rg.alpha -= 0.006;
                pc.beginPath();
                pc.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
                pc.strokeStyle = `rgba(0,180,220,${rg.alpha})`;
                pc.lineWidth = 1;
                pc.stroke();
            });

            trail = trail.filter(p => p.life > 0);
            trail.forEach(p => {
                p.life -= 0.055;
                pc.beginPath();
                pc.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
                pc.fillStyle = `rgba(0,200,255,${p.life * 0.16})`;
                pc.fill();
            });

            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.pulse += 0.04;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                
                const dd = Math.hypot(bx - p.x, by - p.y);
                if (dd < 220) { p.x += (bx - p.x) / dd * 0.2; p.y += (by - p.y) / dd * 0.2; }
                
                const a = p.a * (0.6 + Math.sin(p.pulse) * 0.4);
                pc.beginPath();
                pc.arc(p.x, p.y, p.r * (0.8 + Math.sin(p.pulse) * 0.25), 0, Math.PI * 2);
                pc.fillStyle = `rgba(${p.col},${a})`;
                pc.fill();
                
                particles.forEach((p2, j) => {
                    if (j <= i) return;
                    const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (d2 < 80) {
                        pc.beginPath();
                        pc.moveTo(p.x, p.y);
                        pc.lineTo(p2.x, p2.y);
                        pc.strokeStyle = `rgba(0,180,255,${(1 - d2 / 80) * 0.08})`;
                        pc.lineWidth = 0.6;
                        pc.stroke();
                    }
                });
            });
        }

        tick();

        return () => {
            window.removeEventListener('resize', resize);
            panel.removeEventListener('mousemove', handleMouseMove);
            panel.removeEventListener('mouseenter', handleMouseEnter);
            panel.removeEventListener('mouseleave', handleMouseLeave);
            clearInterval(ringInterval);
            clearInterval(wanderInterval);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isMobile]);

    return (
        <div 
            ref={containerRef} 
            className="relative w-full h-full overflow-hidden"
            style={{ 
                background: 'radial-gradient(ellipse at 30% 20%, #0a1e3a 0%, #050d1a 70%)',
                cursor: 'none'
            }}
        >
            <style>{`
                @keyframes twinkle {
                    from { opacity: 0.05; }
                    to { opacity: 0.55; }
                }
            `}</style>

            {!isMobile && (
                <>
                    <canvas ref={blobCanvasRef} className="absolute inset-0 w-full h-full z-10" />
                    <canvas ref={particleCanvasRef} className="absolute inset-0 w-full h-full z-20 pointer-events-none" />
                    <svg ref={svgRef} className="absolute inset-0 w-full h-full z-30 pointer-events-none" />
                    
                    <div 
                        ref={cursorOuterRef} 
                        className="absolute w-8 h-8 rounded-full border border-cyan-400/50 pointer-events-none z-[100] transition-[width,height] duration-200"
                        style={{ transform: 'translate(-50%, -50%)', opacity: 0 }}
                    />
                    <div 
                        ref={cursorInnerRef} 
                        className="absolute w-[5px] h-[5px] rounded-full bg-[#00d4ff] shadow-[0_0_10px_#00d4ff] pointer-events-none z-[101]"
                        style={{ transform: 'translate(-50%, -50%)', opacity: 0 }}
                    />

                    <div className="absolute inset-0 pointer-events-none z-0">
                        {Array.from({ length: 60 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full"
                                style={{
                                    width: `${Math.random() * 2.5 + 0.5}px`,
                                    height: `${Math.random() * 2.5 + 0.5}px`,
                                    background: Math.random() > 0.7 ? '#00d4ff' : '#fff',
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    opacity: Math.random() * 0.5 + 0.15,
                                    animation: `twinkle ${2 + Math.random() * 3}s ${Math.random() * 2}s ease-in-out infinite alternate`,
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="relative z-40 h-full w-full">
                {children}
            </div>
        </div>
    );
}
