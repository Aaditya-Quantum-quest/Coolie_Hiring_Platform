import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
    User, Briefcase, Eye, EyeOff, Upload, CheckCircle, Rocket,
    Mail, Lock, Phone, MapPin, CreditCard, RefreshCw, ArrowRight,
    ArrowLeft, Zap, Shield, Star, Building2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { STATIONS } from '../data/mockData'

// ─── Load external script once ──────────────────────────────────────────────
function loadScript(src) {
    return new Promise(resolve => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const s = document.createElement('script')
        s.src = src; s.async = true
        s.onload = resolve
        document.head.appendChild(s)
    })
}

// ─── Animated Left Panel ─────────────────────────────────────────────────────
function AnimatedLeftPanel() {
    const canvasRef = useRef(null)
    const panelRef = useRef(null)
    const rafRef = useRef(null)
    const mouseRef = useRef({ x: -9999, y: -9999 })

    useEffect(() => {
        let destroyed = false

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js').then(() => {
            if (destroyed) return
            const gsap = window.gsap
            const canvas = canvasRef.current
            const panel = panelRef.current
            if (!canvas || !panel) return

            let W = panel.clientWidth
            let H = panel.clientHeight
            canvas.width = W
            canvas.height = H
            const ctx = canvas.getContext('2d')

            // ── Particle system ───────────────────────────────────────────
            const COLORS = ['#4facfe', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa']
            const N = 130

            const particles = Array.from({ length: N }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                r: Math.random() * 2.2 + 0.8,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha: Math.random() * 0.6 + 0.3,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.008,
            }))

            // ── Shooting stars ────────────────────────────────────────────
            const shooters = Array.from({ length: 5 }, () => spawnShooter(W, H))
            function spawnShooter(W, H) {
                return {
                    x: Math.random() * W * 0.7,
                    y: Math.random() * H * 0.4,
                    len: Math.random() * 90 + 60,
                    speed: Math.random() * 5 + 4,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
                    alpha: 0,
                    life: 0,
                    maxLife: Math.random() * 60 + 60,
                    delay: Math.random() * 300,
                }
            }

            // ── Aurora waves ──────────────────────────────────────────────
            const auroraWaves = [
                { yBase: 0.30, amp: 55, freq: 0.006, speed: 0.0008, phase: 0, color: 'rgba(99,186,255,', opacity: 0.045 },
                { yBase: 0.48, amp: 70, freq: 0.005, speed: 0.0006, phase: 1.5, color: 'rgba(139,92,246,', opacity: 0.035 },
                { yBase: 0.65, amp: 45, freq: 0.008, speed: 0.001, phase: 3.0, color: 'rgba(52,211,153,', opacity: 0.028 },
            ]

            // ── Pulsing rings ─────────────────────────────────────────────
            const rings = Array.from({ length: 4 }, (_, i) => ({
                x: W * 0.5, y: H * 0.42,
                r: 60 + i * 55,
                phase: i * (Math.PI / 2),
                speed: 0.006 - i * 0.0008,
                color: ['#4facfe', '#a78bfa', '#34d399', '#f472b6'][i],
                opacity: 0.18 - i * 0.03,
            }))

            // ── Energy burst lines ────────────────────────────────────────
            const bursts = Array.from({ length: 12 }, (_, i) => ({
                angle: (i / 12) * Math.PI * 2,
                r: 0,
                maxR: 75 + Math.random() * 40,
                speed: 0.6 + Math.random() * 0.5,
                alpha: 0,
                delay: Math.floor(Math.random() * 180),
                color: COLORS[i % COLORS.length],
            }))

            // ── Central glow orb phase ────────────────────────────────────
            let orbPhase = 0

            // Mouse tracking
            const onMouseMove = (e) => {
                const rect = canvas.getBoundingClientRect()
                mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
            }
            panel.addEventListener('mousemove', onMouseMove)
            panel.addEventListener('mouseleave', () => { mouseRef.current = { x: -9999, y: -9999 } })

            // ── Main render loop ──────────────────────────────────────────
            let frame = 0
            function draw() {
                if (destroyed) return
                rafRef.current = requestAnimationFrame(draw)
                frame++

                // Clear with trail effect
                ctx.fillStyle = 'rgba(4,8,20,0.18)'
                ctx.fillRect(0, 0, W, H)

                const mx = mouseRef.current.x
                const my = mouseRef.current.y

                // ── Aurora waves ──
                auroraWaves.forEach(w => {
                    w.phase += w.speed
                    ctx.beginPath()
                    ctx.moveTo(0, H * w.yBase)
                    for (let x = 0; x <= W; x += 4) {
                        const y = H * w.yBase + Math.sin(x * w.freq + w.phase) * w.amp
                            + Math.sin(x * w.freq * 1.7 + w.phase * 1.3) * (w.amp * 0.4)
                        ctx.lineTo(x, y)
                    }
                    ctx.lineTo(W, H)
                    ctx.lineTo(0, H)
                    ctx.closePath()
                    const grad = ctx.createLinearGradient(0, 0, W, 0)
                    grad.addColorStop(0, w.color + '0)')
                    grad.addColorStop(0.3, w.color + w.opacity + ')')
                    grad.addColorStop(0.7, w.color + w.opacity + ')')
                    grad.addColorStop(1, w.color + '0)')
                    ctx.fillStyle = grad
                    ctx.fill()
                })

                // ── Pulsing rings ──
                orbPhase += 0.012
                rings.forEach((ring, i) => {
                    ring.phase += ring.speed
                    const pulse = 1 + Math.sin(ring.phase) * 0.06
                    const r = ring.r * pulse
                    const osc = 0.5 + Math.sin(ring.phase + i) * 0.5
                    ctx.beginPath()
                    ctx.arc(ring.x, ring.y, r, 0, Math.PI * 2)
                    ctx.strokeStyle = ring.color
                    ctx.lineWidth = 0.8
                    ctx.globalAlpha = ring.opacity * osc
                    ctx.stroke()
                    ctx.globalAlpha = 1
                })

                // ── Central orb glow ──
                const cx = W * 0.5, cy = H * 0.42
                const orbR = 48 + Math.sin(orbPhase) * 6
                const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 2.8)
                orbGrad.addColorStop(0, 'rgba(99,186,255,0.55)')
                orbGrad.addColorStop(0.25, 'rgba(139,92,246,0.25)')
                orbGrad.addColorStop(0.6, 'rgba(52,211,153,0.08)')
                orbGrad.addColorStop(1, 'rgba(0,0,0,0)')
                ctx.beginPath()
                ctx.arc(cx, cy, orbR * 2.8, 0, Math.PI * 2)
                ctx.fillStyle = orbGrad
                ctx.fill()

                // Inner bright core
                const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR)
                coreGrad.addColorStop(0, 'rgba(255,255,255,0.9)')
                coreGrad.addColorStop(0.15, 'rgba(130,200,255,0.7)')
                coreGrad.addColorStop(0.5, 'rgba(99,186,255,0.2)')
                coreGrad.addColorStop(1, 'rgba(0,0,0,0)')
                ctx.beginPath()
                ctx.arc(cx, cy, orbR, 0, Math.PI * 2)
                ctx.fillStyle = coreGrad
                ctx.fill()

                // ── Energy burst lines from center ──
                bursts.forEach(b => {
                    if (b.delay > 0) { b.delay--; return }
                    b.r += b.speed
                    b.alpha = b.r < b.maxR * 0.3
                        ? b.r / (b.maxR * 0.3)
                        : 1 - (b.r - b.maxR * 0.3) / (b.maxR * 0.7)
                    if (b.r >= b.maxR) {
                        b.r = 0; b.alpha = 0; b.delay = Math.floor(Math.random() * 200 + 60)
                    }
                    const bx = cx + Math.cos(b.angle) * b.r
                    const by = cy + Math.sin(b.angle) * b.r
                    ctx.beginPath()
                    ctx.moveTo(cx + Math.cos(b.angle) * 2, cy + Math.sin(b.angle) * 2)
                    ctx.lineTo(bx, by)
                    ctx.strokeStyle = b.color
                    ctx.lineWidth = 0.9
                    ctx.globalAlpha = b.alpha * 0.55
                    ctx.stroke()
                    ctx.globalAlpha = 1

                    // tip dot
                    ctx.beginPath()
                    ctx.arc(bx, by, 1.5, 0, Math.PI * 2)
                    ctx.fillStyle = b.color
                    ctx.globalAlpha = b.alpha * 0.8
                    ctx.fill()
                    ctx.globalAlpha = 1
                })

                // ── Particles ──
                particles.forEach(p => {
                    // Mouse repulsion
                    const dx = p.x - mx, dy = p.y - my
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 110 && dist > 0) {
                        const force = (110 - dist) / 110
                        p.vx += (dx / dist) * force * 0.38
                        p.vy += (dy / dist) * force * 0.38
                    }

                    // Speed limit + damping
                    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
                    if (speed > 1.8) { p.vx *= 1.8 / speed; p.vy *= 1.8 / speed }
                    p.vx *= 0.985; p.vy *= 0.985

                    p.x += p.vx; p.y += p.vy
                    if (p.x < -10) p.x = W + 10
                    if (p.x > W + 10) p.x = -10
                    if (p.y < -10) p.y = H + 10
                    if (p.y > H + 10) p.y = -10

                    p.pulse += p.pulseSpeed
                    const r = p.r * (1 + Math.sin(p.pulse) * 0.35)
                    const a = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3)

                    // Glow halo
                    const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
                    halo.addColorStop(0, p.color + 'cc')
                    halo.addColorStop(0.4, p.color + '44')
                    halo.addColorStop(1, p.color + '00')
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2)
                    ctx.fillStyle = halo
                    ctx.globalAlpha = a * 0.5
                    ctx.fill()

                    // Core dot
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
                    ctx.fillStyle = p.color
                    ctx.globalAlpha = a
                    ctx.fill()
                    ctx.globalAlpha = 1
                })

                // ── Constellation lines ──
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x
                        const dy = particles[i].y - particles[j].y
                        const d = Math.sqrt(dx * dx + dy * dy)
                        if (d < 95) {
                            const a = (1 - d / 95) * 0.18
                            ctx.beginPath()
                            ctx.moveTo(particles[i].x, particles[i].y)
                            ctx.lineTo(particles[j].x, particles[j].y)
                            ctx.strokeStyle = particles[i].color
                            ctx.lineWidth = 0.5
                            ctx.globalAlpha = a
                            ctx.stroke()
                            ctx.globalAlpha = 1
                        }
                    }
                }

                // ── Mouse attraction lines ──
                if (mx > 0 && mx < W) {
                    particles.forEach(p => {
                        const dx = p.x - mx, dy = p.y - my
                        const d = Math.sqrt(dx * dx + dy * dy)
                        if (d < 140) {
                            ctx.beginPath()
                            ctx.moveTo(mx, my)
                            ctx.lineTo(p.x, p.y)
                            ctx.strokeStyle = p.color
                            ctx.lineWidth = 0.6
                            ctx.globalAlpha = (1 - d / 140) * 0.35
                            ctx.stroke()
                            ctx.globalAlpha = 1
                        }
                    })
                }

                // ── Shooting stars ──
                shooters.forEach((s, idx) => {
                    if (s.delay > 0) { s.delay--; return }
                    s.life++
                    s.x += Math.cos(s.angle) * s.speed
                    s.y += Math.sin(s.angle) * s.speed
                    s.alpha = s.life < 12 ? s.life / 12 : s.life > s.maxLife - 12 ? (s.maxLife - s.life) / 12 : 1

                    const tx = s.x - Math.cos(s.angle) * s.len
                    const ty = s.y - Math.sin(s.angle) * s.len
                    const sGrad = ctx.createLinearGradient(tx, ty, s.x, s.y)
                    sGrad.addColorStop(0, 'rgba(255,255,255,0)')
                    sGrad.addColorStop(1, 'rgba(255,255,255,0.9)')
                    ctx.beginPath()
                    ctx.moveTo(tx, ty)
                    ctx.lineTo(s.x, s.y)
                    ctx.strokeStyle = sGrad
                    ctx.lineWidth = 1.5
                    ctx.globalAlpha = s.alpha * 0.85
                    ctx.stroke()
                    ctx.globalAlpha = 1

                    if (s.life >= s.maxLife || s.x > W + 100 || s.y > H + 100) {
                        shooters[idx] = { ...spawnShooter(W, H), delay: Math.random() * 400 + 100 }
                    }
                })
            }
            draw()

            // ── GSAP UI animations ────────────────────────────────────────
            gsap.fromTo('.rlp-logo', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
            gsap.fromTo('.rlp-card', { opacity: 0, y: 40, scale: 0.82 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.14, ease: 'back.out(1.8)', delay: 0.4 })
            gsap.fromTo('.rlp-tagline', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.65 })
            gsap.fromTo('.rlp-badge', { opacity: 0, scale: 0.65 }, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(2.2)', delay: 0.9 })

            gsap.to('.rlp-card-0', { y: -12, duration: 3.0, repeat: -1, yoyo: true, ease: 'sine.inOut' })
            gsap.to('.rlp-card-1', { y: -16, duration: 3.6, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 })
            gsap.to('.rlp-card-2', { y: -10, duration: 2.7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.1 })

            // Count-up
            document.querySelectorAll('.rlp-count').forEach(el => {
                const target = parseFloat(el.dataset.to)
                const suffix = el.dataset.suffix || ''
                gsap.to({ v: 0 }, {
                    v: target, duration: 2.6, ease: 'power2.out', delay: 0.8,
                    onUpdate() { el.textContent = Math.round(this.targets()[0].v).toLocaleString() + suffix }
                })
            })

            const onResize = () => {
                W = panel.clientWidth; H = panel.clientHeight
                canvas.width = W; canvas.height = H
                rings.forEach(r => { r.x = W * 0.5; r.y = H * 0.42 })
            }
            window.addEventListener('resize', onResize)

            panel._cleanup = () => {
                destroyed = true
                cancelAnimationFrame(rafRef.current)
                window.removeEventListener('resize', onResize)
                panel.removeEventListener('mousemove', onMouseMove)
            }
        })

        return () => {
            destroyed = true
            panelRef.current?._cleanup?.()
        }
    }, [])

    const STATS = [
        { icon: <CheckCircle size={17} />, label: 'Active Coolies', to: 12, suffix: 'K+', color: '#4facfe', rgb: '79,172,254' },
        { icon: <Rocket size={17} />, label: 'Job Success', to: 98, suffix: '%', color: '#34d399', rgb: '52,211,153' },
        { icon: <User size={17} />, label: 'Happy Customers', to: 50, suffix: 'K+', color: '#a78bfa', rgb: '167,139,250' },
    ]

    return (
        <div ref={panelRef} style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '40px 36px', minHeight: '100vh',
            background: '#04081400',
            flex: '1 1 50%', width: '50%',
        }}>
            {/* Deep space background */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'radial-gradient(ellipse 120% 80% at 60% 40%, #070d20 0%, #030610 55%, #020408 100%)',
            }} />

            {/* Canvas */}
            <canvas ref={canvasRef} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                zIndex: 1, cursor: 'none',
            }} />

            {/* Vignette */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 45%, rgba(2,4,10,0.75) 100%)',
            }} />
            {/* Bottom fade */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', zIndex: 2, pointerEvents: 'none',
                background: 'linear-gradient(to top, rgba(3,6,16,0.96) 0%, transparent 100%)',
            }} />
            {/* Top fade */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '18%', zIndex: 2, pointerEvents: 'none',
                background: 'linear-gradient(to bottom, rgba(3,6,16,0.8) 0%, transparent 100%)',
            }} />

            {/* ── Logo ── */}
            <div className="rlp-logo" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '44px', height: '44px', borderRadius: '13px',
                    background: 'linear-gradient(135deg,#4facfe 0%,#a78bfa 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '21px', fontWeight: 800, color: '#fff',
                    boxShadow: '0 0 32px rgba(79,172,254,0.5), 0 0 64px rgba(167,139,250,0.2)',
                }}>C</div>
                <div>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', display: 'block', lineHeight: 1 }}>
                        CoolieHire
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(79,172,254,0.7)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Railway Assistance
                    </span>
                </div>
            </div>

            {/* ── Centre content ── */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', flex: 1, justifyContent: 'center' }}>

                {/* Stat Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
                    {STATS.map((s, i) => (
                        <div key={i} className={`rlp-card rlp-card-${i}`} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '13px 18px', borderRadius: '16px',
                            background: `rgba(${s.rgb},0.07)`,
                            border: `1px solid rgba(${s.rgb},0.25)`,
                            backdropFilter: 'blur(20px)',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(${s.rgb},0.05)`,
                            cursor: 'default',
                        }}
                            onMouseEnter={e => window.gsap?.to(e.currentTarget, { scale: 1.04, duration: 0.25, ease: 'power2.out' })}
                            onMouseLeave={e => window.gsap?.to(e.currentTarget, { scale: 1, duration: 0.25, ease: 'power2.out' })}
                        >
                            {/* Icon bubble */}
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                                background: `rgba(${s.rgb},0.15)`,
                                border: `1px solid rgba(${s.rgb},0.3)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: s.color,
                                boxShadow: `0 0 16px rgba(${s.rgb},0.2)`,
                            }}>{s.icon}</div>
                            <div style={{ flex: 1 }}>
                                <p className="rlp-count" data-to={s.to} data-suffix={s.suffix} style={{
                                    fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1,
                                    fontVariantNumeric: 'tabular-nums',
                                    textShadow: `0 0 20px ${s.color}`,
                                }}>0</p>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontWeight: 500, letterSpacing: '0.3px' }}>{s.label}</p>
                            </div>
                            {/* Animated bar */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
                                {[1, 0.6, 0.35].map((o, j) => (
                                    <div key={j} style={{
                                        height: '3px', borderRadius: '2px',
                                        width: `${16 + j * 8}px`,
                                        background: s.color, opacity: o,
                                    }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feature badges row */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                        { icon: <Shield size={11} />, text: 'Verified', color: '#34d399', rgb: '52,211,153' },
                        { icon: <Zap size={11} />, text: 'Instant Booking', color: '#4facfe', rgb: '79,172,254' },
                        { icon: <Star size={11} />, text: '4.9★ Rated', color: '#fbbf24', rgb: '251,191,36' },
                    ].map((b, i) => (
                        <div key={i} className="rlp-badge" style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', borderRadius: '20px',
                            background: `rgba(${b.rgb},0.08)`,
                            border: `1px solid rgba(${b.rgb},0.3)`,
                            color: b.color, fontSize: '11px', fontWeight: 600,
                            boxShadow: `0 0 12px rgba(${b.rgb},0.1)`,
                            backdropFilter: 'blur(12px)',
                        }}>
                            {b.icon} {b.text}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Tagline ── */}
            <div className="rlp-tagline" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                    {['#4facfe', '#a78bfa', '#34d399'].map((c, i) => (
                        <div key={i} style={{ height: '3px', borderRadius: '2px', background: c, width: i === 0 ? '28px' : '10px', opacity: 0.8 }} />
                    ))}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.2, color: '#fff', marginBottom: '10px', letterSpacing: '-0.5px' }}>
                    Start Your<br />
                    <span style={{ background: 'linear-gradient(90deg,#4facfe 0%,#a78bfa 50%,#34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Journey Today.
                    </span>
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '280px', fontWeight: 400 }}>
                    Join thousands who trust CoolieHire for seamless railway luggage assistance across India.
                </p>
            </div>
        </div>
    )
}

// ─── Main RegisterPage ────────────────────────────────────────────────────────
export default function RegisterPage() {
    const { login } = useApp()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [type, setType] = useState(searchParams.get('type') || 'customer')
    const [step, setStep] = useState(1)
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', address: '',
        station: '', idType: 'Aadhar', idNumber: '', experience: '',
        languages: [], emergencyContact: '',
    })

    const update = (field, val) => setForm(f => ({ ...f, [field]: val }))
    const toggleLang = (lang) => setForm(f => ({
        ...f,
        languages: f.languages.includes(lang)
            ? f.languages.filter(l => l !== lang)
            : [...f.languages, lang],
    }))

    const handleNext = () => {
        if (!form.name || !form.email || !form.phone || !form.password) {
            toast.error('Please fill all required fields'); return
        }
        setStep(2)
    }

    const handleGoBack = () => navigate(-1)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        await new Promise(r => setTimeout(r, 1500))
        login({ name: form.name, email: form.email, id: Date.now(), ...form }, type)
        toast.success(`🎉 Welcome ${form.name}! Account created successfully!`)
        navigate(type === 'customer' ? '/customer' : '/coolie')
        setLoading(false)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>

            {/* Go Back Button */}
            <div className="fixed top-4 sm:top-30 left-4 z-50">
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:border-slate-600/50 hover:text-white transition-all duration-200 group"
                    title="Go back to previous page"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:block">Go Back</span>
                </button>
            </div>

            {/* ── Animated Left Panel ── */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-1/2">
                <AnimatedLeftPanel />
            </div>

            {/* ── Right Form Panel ── */}
            <div className="w-full lg:w-1/2 xl:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8" style={{ background: 'var(--bg-dark)' }}>

                {/* Mobile logo */}
                <div className="lg:hidden flex justify-center mb-6">
                    <div className="login-logo-icon" style={{ width: '40px', height: '40px', fontSize: '18px' }}>C</div>
                    <span className="login-logo-text" style={{ fontSize: '20px', marginLeft: '8px' }}>CoolieHire</span>
                </div>

                <div className="login-form-container w-full max-w-md">
                    <h1 className="login-heading text-center lg:text-left">Create Account</h1>
                    <p className="login-subheading text-center lg:text-left">Join CoolieHire and start your journey</p>

                    {/* Account Type Toggle */}
                    <div className="reg-type-toggle">
                        {[
                            { val: 'customer', icon: <User size={16} />, label: 'Customer', sub: 'Hire a coolie' },
                            { val: 'coolie', icon: <Briefcase size={16} />, label: 'Coolie', sub: 'Earn money' },
                        ].map(t => (
                            <button
                                key={t.val}
                                onClick={() => { setType(t.val); setStep(1) }}
                                className={`reg-type-btn ${type === t.val ? 'reg-type-btn-active' : ''}`}
                            >
                                {t.icon}
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: '700', fontSize: '14px' }}>{t.label}</p>
                                    <p style={{ fontSize: '11px', opacity: 0.7 }}>{t.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* ── Coolie: Step Progress + Steps ── */}
                    {type === 'coolie' && (
                        <div className="reg-progress">
                            {[1, 2].map(s => (
                                <React.Fragment key={s}>
                                    <div className={`reg-step ${step >= s ? 'reg-step-active' : ''}`}>
                                        {step > s
                                            ? <CheckCircle size={13} />
                                            : <span className="reg-step-num">{s}</span>
                                        }
                                        {s === 1 ? 'Basic Info' : 'Work Details'}
                                    </div>
                                    {s < 2 && <div className="reg-step-connector" />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                        <div className="login-form space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="login-field">
                                    <label className="login-label">Full Name *</label>
                                    <div className="login-input-wrap">
                                        <User size={14} className="login-input-icon" />
                                        <input className="input-field login-input" placeholder="Your full name"
                                            value={form.name} onChange={e => update('name', e.target.value)} />
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label className="login-label">Phone *</label>
                                    <div className="login-input-wrap">
                                        <Phone size={14} className="login-input-icon" />
                                        <input className="input-field login-input" placeholder="10-digit mobile"
                                            value={form.phone} onChange={e => update('phone', e.target.value)} maxLength={10} />
                                    </div>
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label">Email Address *</label>
                                <div className="login-input-wrap">
                                    <Mail size={14} className="login-input-icon" />
                                    <input type="email" className="input-field login-input" placeholder="your@email.com"
                                        value={form.email} onChange={e => update('email', e.target.value)} />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label">Password *</label>
                                <div className="login-input-wrap">
                                    <Lock size={14} className="login-input-icon" />
                                    <input type={showPass ? 'text' : 'password'} className="input-field login-input"
                                        style={{ paddingRight: '44px' }} placeholder="Min. 8 characters"
                                        value={form.password} onChange={e => update('password', e.target.value)} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="login-eye-btn">
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Emergency Contact (customer only) */}
                            {type === 'customer' && (
                                <div className="login-field">
                                    <label className="login-label">Emergency Contact</label>
                                    <div className="login-input-wrap">
                                        <Phone size={14} className="login-input-icon" />
                                        <input className="input-field login-input" placeholder="Emergency contact number"
                                            value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {type === 'coolie' ? (
                                <button onClick={handleNext} className="btn-primary login-submit-btn">
                                    Continue <ArrowRight size={16} />
                                </button>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <button type="submit" disabled={loading} className="btn-primary login-submit-btn">
                                        {loading
                                            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <><Rocket size={15} /> Create Account</>
                                        }
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 2 && type === 'coolie' && (
                        <form onSubmit={handleSubmit} className="login-form">

                            <div className="login-field">
                                <label className="login-label">Home Station</label>
                                <div className="login-input-wrap">
                                    <MapPin size={14} className="login-input-icon" />
                                    <select className="input-field login-input" value={form.station}
                                        onChange={e => update('station', e.target.value)}>
                                        <option value="">Select your station</option>
                                        {STATIONS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="reg-row-2">
                                <div className="login-field">
                                    <label className="login-label">ID Type</label>
                                    <div className="login-input-wrap">
                                        <CreditCard size={14} className="login-input-icon" />
                                        <select className="input-field login-input" value={form.idType}
                                            onChange={e => update('idType', e.target.value)}>
                                            <option>Aadhar</option>
                                            <option>PAN Card</option>
                                            <option>Voter ID</option>
                                            <option>Driving License</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label className="login-label">ID Number</label>
                                    <div className="login-input-wrap">
                                        <CreditCard size={14} className="login-input-icon" />
                                        <input className="input-field login-input" placeholder="ID number"
                                            value={form.idNumber} onChange={e => update('idNumber', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label">Experience</label>
                                <div className="login-input-wrap">
                                    <RefreshCw size={14} className="login-input-icon" />
                                    <select className="input-field login-input" value={form.experience}
                                        onChange={e => update('experience', e.target.value)}>
                                        <option value="">Select experience</option>
                                        <option>Less than 1 year</option>
                                        <option>1-3 years</option>
                                        <option>3-5 years</option>
                                        <option>5-10 years</option>
                                        <option>10+ years</option>
                                    </select>
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label">Languages Known</label>
                                <div className="reg-lang-grid">
                                    {['Hindi', 'English', 'Punjabi', 'Bengali', 'Tamil', 'Marathi', 'Telugu'].map(lang => (
                                        <button type="button" key={lang} onClick={() => toggleLang(lang)}
                                            className={`reg-lang-tag ${form.languages.includes(lang) ? 'reg-lang-tag-active' : ''}`}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="reg-upload-box">
                                <Upload size={22} style={{ color: 'var(--text-muted)', marginBottom: '6px' }} />
                                <p style={{ fontSize: '13px', color: 'var(--text-body)' }}>Upload ID Proof Photo</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>JPG, PNG (Max 2MB)</p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setStep(1)} className="btn-secondary"
                                    style={{ flex: 1, padding: '13px' }}>
                                    ← Back
                                </button>
                                <button type="submit" disabled={loading} className="btn-primary login-submit-btn" style={{ flex: 2 }}>
                                    {loading
                                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><CheckCircle size={15} /> Register</>
                                    }
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="login-footer-text" style={{ marginTop: '20px' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="login-footer-link">Login here</Link>
                    </p>

                    {/* Business Owner Section */}
                    <div style={{
                        marginTop: '24px',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        border: '1px solid rgba(123, 47, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #7B2FFF 0%, #A855F7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(123, 47, 255, 0.3)',
                            }}>
                                <Building2 size={22} color="white" />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#fff',
                                    marginBottom: '2px',
                                }}>Are you a Business Owner?</p>
                                <p style={{
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.6)',
                                }}>Register your Restaurant or Hotel</p>
                            </div>
                        </div>
                        <Link
                            to="/register/business"
                            style={{
                                padding: '10px 18px',
                                borderRadius: '8px',
                                background: '#7B2FFF',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => {
                                e.target.style.background = '#5B1FCC';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = '#7B2FFF';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Register <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}