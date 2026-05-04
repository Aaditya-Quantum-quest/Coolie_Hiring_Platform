import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
    Home, Search, MapPin, CreditCard, Clock, Star, Train,
    Map, User, LogOut, ChevronLeft, ChevronRight,
    Briefcase, DollarSign, Award, BarChart2, Users,
    AlertTriangle, Menu, X, Zap, Building2, Store
} from 'lucide-react'

const CUSTOMER_ITEMS = [
    { path: '/customer', icon: Home, label: 'Dashboard' },
    { path: '/customer/book', icon: Search, label: 'Book Coolie' },
    { path: '/customer/track', icon: MapPin, label: 'Track Coolie' },
    { path: '/customer/trains', icon: Train, label: 'Train Status' },
    { path: '/customer/map', icon: Map, label: 'Station Map' },
    { path: '/customer/businesses', icon: Store, label: 'Hotels & Restaurants' },
    { path: '/customer/history', icon: Clock, label: 'My Bookings' },
    { path: '/customer/profile', icon: User, label: 'My Profile' },
    { path: '/customer/payment', icon: CreditCard, label: 'Payments' },
    { path: '/customer/rate', icon: Star, label: 'Rate & Review' },
]

const COOLIE_ITEMS = [
    { path: '/coolie', icon: Home, label: 'Dashboard' },
    { path: '/coolie/profile', icon: User, label: 'My Profile' },
    { path: '/coolie/earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/coolie/leaderboard', icon: Award, label: 'Leaderboard' },
]

const ADMIN_ITEMS = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/coolies', icon: Briefcase, label: 'Coolies' },
    { path: '/admin/businesses', icon: Building2, label: 'Businesses' },
    { path: '/admin/bookings', icon: Clock, label: 'Bookings' },
    { path: '/admin/disputes', icon: AlertTriangle, label: 'Disputes' },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
]

const ROLE_CONFIG = {
    customer: {
        gradient: 'linear-gradient(135deg,#f97316,#f59e0b)',
        glow: 'rgba(249,115,22,0.35)',
        accent: '#f97316',
        accentRgb: '249,115,22',
        label: 'Customer',
        ring: '#f97316',
    },
    coolie: {
        gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
        glow: 'rgba(59,130,246,0.35)',
        accent: '#3b82f6',
        accentRgb: '59,130,246',
        label: 'Porter',
        ring: '#3b82f6',
    },
    admin: {
        gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)',
        glow: 'rgba(168,85,247,0.35)',
        accent: '#a855f7',
        accentRgb: '168,85,247',
        label: 'Admin',
        ring: '#a855f7',
    },
}

// ── FIX: hasRun ref ensures GSAP entrance fires only once ──
function useGSAP(cb) {
    const hasRun = useRef(false)
    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true
        if (window.gsap) { cb(window.gsap); return }
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'
        s.onload = () => cb(window.gsap)
        document.head.appendChild(s)
    }, [])
}

function SidebarContent({ collapsed, cfg, items, user, coolieStatus, shiftStartTime, shiftSeconds, formatShift, timeStr, dateStr, role, hoveredPath, setHoveredPath, setMobileOpen, handleItemEnter, handleItemLeave, handleLogout, orb1Ref, orb2Ref, glowLineRef, logoRef, itemsRef }) {
    const location = useLocation()
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>



            {/* ── ambient orbs ── */}
            <div ref={orb1Ref} style={{
                position: 'absolute', top: -40, left: -40,
                width: 160, height: 160, borderRadius: '50%',
                background: cfg.glow,
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
            }} />
            <div ref={orb2Ref} style={{
                position: 'absolute', bottom: 80, right: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: cfg.glow.replace('0.35', '0.2'),
                filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
            }} />

            {/* ── animated vertical glow line ── */}
            <div ref={glowLineRef} style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: 1,
                background: `linear-gradient(to bottom, transparent, ${cfg.accent}, transparent)`,
                opacity: 0.4, pointerEvents: 'none', zIndex: 1,
            }} />

            {/* ── LOGO ── */}
            <div ref={logoRef} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '20px 0' : '20px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', zIndex: 2, flexShrink: 0,
            }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: cfg.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 20px ${cfg.glow}, 0 4px 12px rgba(0,0,0,0.4)`,
                    position: 'relative',
                }}>
                    <Zap size={18} color="#fff" fill="#fff" />
                    <div style={{
                        position: 'absolute', inset: -4, borderRadius: 16,
                        border: `1px solid ${cfg.accent}`,
                        opacity: 0.4,
                        animation: 'ringPulse 2s ease-in-out infinite',
                    }} />
                </div>
                {!collapsed && (
                    <div>
                        <div style={{
                            fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
                            color: '#fff', fontFamily: "'Syne', sans-serif", lineHeight: 1,
                        }}>
                            Coolie<span style={{ color: cfg.accent }}>Hire</span>
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', marginTop: 2 }}>
                            SMART PORTER NETWORK
                        </div>
                    </div>
                )}
            </div>

            {/* ── USER CARD ── */}
            {!collapsed && (
                <div style={{
                    margin: '14px 14px 0',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid rgba(${cfg.accentRgb},0.15)`,
                    backdropFilter: 'blur(10px)',
                    position: 'relative', zIndex: 2, flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: cfg.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, color: '#fff',
                            boxShadow: `0 0 12px ${cfg.glow}`,
                            overflow: 'hidden'
                        }}>
                            {user?.profile_photo_url ? (
                                <img src={user.profile_photo_url} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.name?.[0] || 'U'
                            )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: 10, color: cfg.accent, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {cfg.label}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{dateStr}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: coolieStatus === 'offline' ? '#ef4444' : '#22c55e',
                            boxShadow: `0 0 6px ${coolieStatus === 'offline' ? '#ef4444' : '#22c55e'}`,
                            flexShrink: 0
                        }} />
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {role === 'coolie' ? coolieStatus : 'Online'} · ACTIVE
                        </div>
                    </div>
                    {role === 'coolie' && coolieStatus !== 'offline' && shiftStartTime && (
                        <div style={{
                            marginTop: 10, padding: '8px 10px', borderRadius: 10,
                            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 8, color: '#22c55e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Current Shift</p>
                                <p style={{ fontSize: 14, color: '#fff', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{formatShift(shiftSeconds)}</p>
                            </div>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={12} color="#22c55e" />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── NAV ── */}
            <nav style={{
                flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden',
                position: 'relative', zIndex: 2,
                scrollbarWidth: 'none',
                display: 'flex', flexDirection: 'column',
            }}>
                <style>{`
                @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.15);opacity:0.1} }
                @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                nav::-webkit-scrollbar { display:none }
            `}</style>

                {items.map((item, i) => {
                    const active = location.pathname === item.path
                    const Icon = item.icon
                    const isHovered = hoveredPath === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            ref={el => itemsRef.current[i] = el}
                            onClick={() => setMobileOpen(false)}
                            onMouseEnter={e => { setHoveredPath(item.path); handleItemEnter(e.currentTarget) }}
                            onMouseLeave={e => { setHoveredPath(null); handleItemLeave(e.currentTarget) }}
                            style={{
                                display: 'flex', alignItems: 'center',
                                gap: collapsed ? 0 : 11,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: collapsed ? '11px' : '10px 12px',
                                borderRadius: 12, marginBottom: 3,
                                position: 'relative', textDecoration: 'none',
                                transition: 'background 0.2s, box-shadow 0.2s',
                                background: active
                                    ? `linear-gradient(90deg, rgba(${cfg.accentRgb},0.18), rgba(${cfg.accentRgb},0.05))`
                                    : isHovered
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'transparent',
                                boxShadow: active ? `inset 0 0 0 1px rgba(${cfg.accentRgb},0.2)` : 'none',
                                overflow: 'hidden',
                            }}
                            title={collapsed ? item.label : ''}
                        >
                            {active && (
                                <div style={{
                                    position: 'absolute', inset: 0, pointerEvents: 'none',
                                    background: `linear-gradient(90deg,transparent,rgba(${cfg.accentRgb},0.08),transparent)`,
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2.4s linear infinite',
                                }} />
                            )}
                            {active && (
                                <div style={{
                                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                    width: 3, borderRadius: 99,
                                    background: cfg.gradient,
                                    boxShadow: `0 0 10px ${cfg.glow}`,
                                }} />
                            )}
                            <div style={{
                                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: active ? `rgba(${cfg.accentRgb},0.2)` : 'rgba(255,255,255,0.05)',
                                transition: 'background 0.2s, box-shadow 0.2s',
                                boxShadow: active ? `0 0 12px rgba(${cfg.accentRgb},0.4)` : 'none',
                            }}>
                                <Icon size={15} color={active ? cfg.accent : 'rgba(255,255,255,0.45)'} strokeWidth={active ? 2.2 : 1.8} />
                            </div>
                            {!collapsed && (
                                <span style={{
                                    fontSize: 13, fontWeight: active ? 600 : 400,
                                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                                    fontFamily: "'DM Sans',sans-serif",
                                    letterSpacing: '-0.01em',
                                    flex: 1,
                                    transition: 'color 0.2s',
                                }}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* ── BOTTOM ── */}
            <div style={{
                padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', zIndex: 2, flexShrink: 0,
            }}>
                {!collapsed && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr',
                        gap: 6, marginBottom: 10,
                    }}>
                        {[
                            { label: 'Bookings', value: user?.total_bookings || 0 },
                            { label: 'Rating', value: (user?.avg_rating || '0.0') + '★' },
                        ].map(s => (
                            <div key={s.label} style={{
                                padding: '8px 10px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.06em' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    onMouseEnter={e => handleItemEnter(e.currentTarget)}
                    onMouseLeave={e => handleItemLeave(e.currentTarget)}
                    style={{
                        display: 'flex', alignItems: 'center',
                        gap: collapsed ? 0 : 10,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        width: '100%', padding: collapsed ? '11px' : '10px 12px',
                        borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.06)',
                        transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                >
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(239,68,68,0.12)',
                    }}>
                        <LogOut size={15} color='#f87171' strokeWidth={1.8} />
                    </div>
                    {!collapsed && (
                        <span style={{ fontSize: 13, color: '#f87171', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
                            Sign Out
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}


export default function Sidebar({ role = 'customer' }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout, coolieStatus, shiftStartTime } = useApp()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [hoveredPath, setHoveredPath] = useState(null)
    const [time, setTime] = useState(new Date())
    const [shiftSeconds, setShiftSeconds] = useState(0)

    const sidebarRef = useRef(null)
    const logoRef = useRef(null)
    const itemsRef = useRef([])
    const orb1Ref = useRef(null)
    const orb2Ref = useRef(null)
    const toggleRef = useRef(null)
    const glowLineRef = useRef(null)

    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.customer
    const items = role === 'admin' ? ADMIN_ITEMS : role === 'coolie' ? COOLIE_ITEMS : CUSTOMER_ITEMS

    /* live clock */
    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(id)
    }, [])

    /* shift clock for coolies */
    useEffect(() => {
        if (role === 'coolie' && shiftStartTime) {
            const updateShift = () => {
                const diff = Math.floor((Date.now() - shiftStartTime) / 1000)
                setShiftSeconds(diff > 0 ? diff : 0)
            }
            updateShift()
            const id = setInterval(updateShift, 1000)
            return () => clearInterval(id)
        } else {
            setShiftSeconds(0)
        }
    }, [role, shiftStartTime])

    const formatShift = (s) => {
        const h = String(Math.floor(s / 3600)).padStart(2, '0')
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
        const sec = String(s % 60).padStart(2, '0')
        return `${h}:${m}:${sec}`
    }

    /* ── GSAP entrance — runs once only ── */
    useGSAP(gsap => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.fromTo(sidebarRef.current,
            { x: -80, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6 }
        )
            .fromTo(logoRef.current,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 }, '-=0.3'
            )
            .fromTo(itemsRef.current.filter(Boolean),
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, stagger: 0.06 }, '-=0.2'
            )

        /* orb float animations */
        if (orb1Ref.current) {
            gsap.to(orb1Ref.current, {
                y: '+=18', x: '+=8', duration: 4,
                yoyo: true, repeat: -1, ease: 'sine.inOut'
            })
        }
        if (orb2Ref.current) {
            gsap.to(orb2Ref.current, {
                y: '-=14', x: '-=6', duration: 3.2,
                yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.8
            })
        }

        /* glow line pulse */
        if (glowLineRef.current) {
            gsap.to(glowLineRef.current, {
                opacity: 0.15, duration: 1.8,
                yoyo: true, repeat: -1, ease: 'sine.inOut'
            })
        }
    })

    /* ── collapse animation ── */
    const handleCollapse = () => {
        if (!window.gsap) { setCollapsed(c => !c); return }
        const next = !collapsed
        window.gsap.to(sidebarRef.current, {
            width: next ? 72 : 256,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => setCollapsed(next)
        })
        setCollapsed(next)
    }

    /* ── nav item hover ── */
    const handleItemEnter = (el) => {
        if (!window.gsap || !el) return
        window.gsap.to(el, { x: 4, duration: 0.2, ease: 'power2.out' })
    }
    const handleItemLeave = (el) => {
        if (!window.gsap || !el) return
        window.gsap.to(el, { x: 0, duration: 0.2, ease: 'power2.out' })
    }

    /* ── logout ── */
    const handleLogout = () => {
        if (window.gsap) {
            window.gsap.to(sidebarRef.current, {
                x: -80, opacity: 0, duration: 0.4, ease: 'power2.in',
                onComplete: () => { logout(); navigate('/') }
            })
        } else { logout(); navigate('/') }
    }

    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

    const contentProps = {
        collapsed, cfg, items, user, coolieStatus, shiftStartTime, shiftSeconds, formatShift,
        timeStr, dateStr, role, hoveredPath, setHoveredPath, setMobileOpen,
        handleItemEnter, handleItemLeave, handleLogout,
        orb1Ref, orb2Ref, glowLineRef, logoRef, itemsRef,
    }

    return (
        <>
            {/* ── DESKTOP ── */}
            <div
                ref={sidebarRef}
                style={{
                    display: 'flex',
                    position: 'fixed', top: 0, left: 0, height: '100%', zIndex: 50,
                    width: collapsed ? 72 : 256,
                    background: 'linear-gradient(180deg,#0f1729 0%,#0d1424 60%,#0a1020 100%)',
                    borderRight: `1px solid rgba(${cfg.accentRgb},0.12)`,
                    boxShadow: `4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(${cfg.accentRgb},0.08)`,
                    transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                    flexDirection: 'column',
                    fontFamily: "'DM Sans',sans-serif",
                }}
                className="md-sidebar"
            >
                <SidebarContent {...contentProps} />

                {/* collapse toggle */}
                <button
                    ref={toggleRef}
                    onClick={handleCollapse}
                    style={{
                        position: 'absolute', top: 72, right: -14,
                        width: 28, height: 28, borderRadius: '50%',
                        background: cfg.gradient,
                        border: '2px solid #0f1729',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10,
                        boxShadow: `0 0 16px ${cfg.glow}`,
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {collapsed
                        ? <ChevronRight size={13} color="#fff" strokeWidth={2.5} />
                        : <ChevronLeft size={13} color="#fff" strokeWidth={2.5} />
                    }
                </button>
            </div>

            {/* ── MOBILE TOGGLE ── */}
            <button
                onClick={() => setMobileOpen(true)}
                style={{
                    position: 'fixed', top: 16, left: 16, zIndex: 50,
                    width: 42, height: 42, borderRadius: 12,
                    background: '#0f1729',
                    border: `1px solid rgba(${cfg.accentRgb},0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: `0 0 20px ${cfg.glow}`,
                }}
                className="mobile-toggle"
            >
                <Menu size={18} color={cfg.accent} />
            </button>

            {/* ── MOBILE SIDEBAR ── */}
            {mobileOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex' }}>
                    <div style={{
                        width: 264, height: '100%',
                        background: 'linear-gradient(180deg,#0f1729 0%,#0a1020 100%)',
                        borderRight: `1px solid rgba(${cfg.accentRgb},0.15)`,
                        position: 'relative',
                    }}>
                        <button
                            onClick={() => setMobileOpen(false)}
                            style={{
                                position: 'absolute', top: 16, right: 16, zIndex: 10,
                                width: 30, height: 30, borderRadius: 8,
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={14} color='rgba(255,255,255,0.6)' />
                        </button>
                        <SidebarContent {...contentProps} />
                    </div>
                    <div
                        style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                        onClick={() => setMobileOpen(false)}
                    />
                </div>
            )}

            {/* ── RESPONSIVE SHOW/HIDE ── */}
            <style>{`
        @media(min-width:768px){
          .md-sidebar { display:flex !important; }
          .mobile-toggle { display:none !important; }
        }
        @media(max-width:767px){
          .md-sidebar { display:none !important; }
        }
      `}
            </style>
        </>
    )
}