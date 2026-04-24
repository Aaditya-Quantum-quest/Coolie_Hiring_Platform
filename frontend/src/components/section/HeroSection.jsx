import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
    const navigate = useNavigate()
    const sectionRef = useRef(null)
    const leftColumnRef = useRef(null)
    const rightColumnRef = useRef(null)
    const headingRef = useRef(null)
    const paragraphRef = useRef(null)
    const buttonsRef = useRef(null)
    const cardRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(leftColumnRef.current, { opacity: 0, x: -50 })
            gsap.set(rightColumnRef.current, { opacity: 0, x: 50 })
            gsap.set(cardRef.current, { opacity: 0, y: 30, scale: 0.9 })

            gsap.to(leftColumnRef.current, { opacity: 1, x: 0, duration: 1, ease: "power3.out" })
            gsap.to(rightColumnRef.current, { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: "power3.out" })
            gsap.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.4, ease: "back.out(1.7)" })

            gsap.from(headingRef.current.children, {
                opacity: 0, y: 30, duration: 0.8, stagger: 0.2, delay: 0.3, ease: "power2.out"
            })
            gsap.from(paragraphRef.current, { opacity: 0, y: 20, duration: 0.8, delay: 0.7, ease: "power2.out" })
            gsap.from(buttonsRef.current.children, {
                opacity: 0, y: 20, duration: 0.6, stagger: 0.1, delay: 0.9, ease: "power2.out"
            })

            const buttons = Array.from(buttonsRef.current.children)
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => gsap.to(button, { scale: 1.05, duration: 0.3, ease: "power2.out" }))
                button.addEventListener('mouseleave', () => gsap.to(button, { scale: 1, duration: 0.3, ease: "power2.out" }))
            })

            gsap.to(cardRef.current, { y: -10, duration: 3, repeat: -1, yoyo: true, ease: "power1.inOut" })

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <>
            {/* ─── Responsive styles injected via a <style> tag ─── */}
            <style>{`
                /* ── SHARED ── */
                .hero-section {
                    padding-top: 5rem;
                    padding-bottom: 3rem;
                    padding-left: 1rem;
                    padding-right: 1rem;
                }

                /* ── MOBILE: 320px – 480px ── */
                @media (max-width: 480px) {
                    .hero-section {
                        padding-top: 4rem;
                        padding-bottom: 2.5rem;
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                    .hero-grid {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 1.5rem !important;
                    }
                    .hero-left {
                        order: 1 !important;
                        text-align: center !important;
                    }
                    .hero-right {
                        order: 2 !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .hero-heading {
                        font-size: clamp(1.6rem, 8vw, 2rem) !important;
                        line-height: 1.2 !important;
                    }
                    .hero-para {
                        font-size: 0.82rem !important;
                        line-height: 1.6 !important;
                        max-width: 90% !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .hero-buttons {
                        flex-direction: column !important;
                        align-items: center !important;
                        gap: 0.65rem !important;
                    }
                    .hero-btn {
                        width: 100% !important;
                        max-width: 260px !important;
                        font-size: 0.82rem !important;
                        padding: 0.7rem 1.5rem !important;
                        min-height: 44px !important;
                    }
                    .hero-card {
                        width: 100% !important;
                        max-width: 320px !important;
                        padding: 0.9rem !important;
                    }
                    .card-avatar {
                        width: 2.3rem !important;
                        height: 2.3rem !important;
                        font-size: 0.8rem !important;
                    }
                    .card-name {
                        font-size: 0.8rem !important;
                    }
                    .card-label {
                        font-size: 0.65rem !important;
                    }
                    .card-value {
                        font-size: 0.75rem !important;
                    }
                    .card-map {
                        height: 3.5rem !important;
                    }
                    .card-map-text {
                        font-size: 0.6rem !important;
                    }
                    .card-badge {
                        font-size: 0.6rem !important;
                        padding: 0.2rem 0.45rem !important;
                    }
                }

                /* ── SMALL TABLET: 481px – 600px ── */
                @media (min-width: 481px) and (max-width: 600px) {
                    .hero-section {
                        padding-top: 4.5rem;
                        padding-left: 1.25rem;
                        padding-right: 1.25rem;
                    }
                    .hero-grid {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 2rem !important;
                    }
                    .hero-left {
                        order: 1 !important;
                        text-align: center !important;
                    }
                    .hero-right {
                        order: 2 !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .hero-heading {
                        font-size: clamp(1.9rem, 6vw, 2.3rem) !important;
                    }
                    .hero-para {
                        font-size: 0.88rem !important;
                        max-width: 80% !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .hero-buttons {
                        flex-direction: row !important;
                        justify-content: center !important;
                        flex-wrap: wrap !important;
                        gap: 0.75rem !important;
                    }
                    .hero-btn {
                        font-size: 0.85rem !important;
                        padding: 0.7rem 1.5rem !important;
                        min-height: 44px !important;
                    }
                    .hero-card {
                        max-width: 360px !important;
                    }
                }

                /* ── STANDARD TABLET: 601px – 768px ── */
                @media (min-width: 601px) and (max-width: 768px) {
                    .hero-section {
                        padding-top: 5rem;
                        padding-left: 1.5rem;
                        padding-right: 1.5rem;
                    }
                    .hero-grid {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 2.5rem !important;
                    }
                    .hero-left {
                        order: 1 !important;
                        text-align: center !important;
                    }
                    .hero-right {
                        order: 2 !important;
                        display: flex !important;
                        justify-content: center !important;
                    }
                    .hero-heading {
                        font-size: clamp(2.2rem, 5.5vw, 2.75rem) !important;
                    }
                    .hero-para {
                        font-size: 0.9rem !important;
                        max-width: 70% !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    .hero-buttons {
                        justify-content: center !important;
                        gap: 0.75rem !important;
                    }
                    .hero-btn {
                        font-size: 0.9rem !important;
                        min-height: 44px !important;
                    }
                    .hero-card {
                        max-width: 400px !important;
                    }
                }

                /* ── LARGE TABLET: 769px – 1024px ── */
                @media (min-width: 769px) and (max-width: 1024px) {
                    .hero-section {
                        padding-top: 5.5rem;
                        padding-left: 2rem;
                        padding-right: 2rem;
                    }
                    .hero-grid {
                        display: grid !important;
                        grid-template-columns: 55% 45% !important;
                        gap: 2rem !important;
                        align-items: center !important;
                    }
                    .hero-left {
                        order: 1 !important;
                        text-align: left !important;
                    }
                    .hero-right {
                        order: 2 !important;
                        display: flex !important;
                        justify-content: flex-end !important;
                    }
                    .hero-heading {
                        font-size: clamp(2.4rem, 4.5vw, 3rem) !important;
                    }
                    .hero-para {
                        font-size: 0.92rem !important;
                        max-width: 100% !important;
                        margin-left: 0 !important;
                    }
                    .hero-buttons {
                        justify-content: flex-start !important;
                    }
                    .hero-btn {
                        font-size: 0.9rem !important;
                        min-height: 44px !important;
                    }
                    .hero-card {
                        max-width: 340px !important;
                        width: 100% !important;
                    }
                }

                /* ── LAPTOP & DESKTOP: 1025px+ ── (unchanged) */
                @media (min-width: 1025px) {
                    .hero-section {
                        padding-top: 6rem;
                        padding-bottom: 6rem;
                        padding-left: 2.5rem;
                        padding-right: 2.5rem;
                        margin-left: 5.2rem;
                        margin-right: 5.2rem;
                    }
                    .hero-grid {
                        display: grid !important;
                        grid-template-columns: 60% 40% !important;
                        gap: 3rem !important;
                        align-items: center !important;
                    }
                    .hero-left {
                        order: 1 !important;
                        text-align: left !important;
                    }
                    .hero-right {
                        order: 2 !important;
                        justify-content: flex-end !important;
                    }
                    .hero-heading {
                        font-size: clamp(2.8rem, 4vw, 3.75rem) !important;
                    }
                    .hero-para {
                        font-size: 1rem !important;
                        margin-left: 0 !important;
                    }
                    .hero-buttons {
                        justify-content: flex-start !important;
                    }
                }
            `}</style>

            <section ref={sectionRef} className="hero-section">
                <div ref={undefined} className="hero-grid">

                    {/* LEFT COLUMN */}
                    <div ref={leftColumnRef} className="hero-left space-y-4 sm:space-y-6">
                        <h1
                            ref={headingRef}
                            className="hero-heading font-medium leading-tight"
                        >
                            <span className="text-white block">Hire a Coolie in</span>
                            <span className="text-[#A855F7] block">60 Seconds ⚡</span>
                        </h1>

                        <p
                            ref={paragraphRef}
                            className="hero-para text-[#B0A8CC] leading-relaxed"
                        >
                            The world's first on-demand portal for railway porters. Verified professionals, transparent pricing, and instant tracking.
                        </p>

                        <div
                            ref={buttonsRef}
                            className="hero-buttons flex flex-wrap gap-3 pt-2"
                        >
                            <button
                                onClick={() => navigate('/register')}
                                className="hero-btn bg-[#7B2FFF] text-white px-6 py-3 rounded-full font-medium hover:bg-[#5B1FCC] transition-colors"
                            >
                                Book a Coolie Now
                            </button>
                            <Link
                                to="/login?role=coolie"
                                className="hero-btn bg-transparent border border-[#7B2FFF] text-[#A855F7] px-6 py-3 rounded-full font-medium hover:bg-[#7B2FFF]/10 transition-colors text-center flex items-center justify-center"
                            >
                                Join as Coolie
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT COLUMN — PORTER ASSIGNMENT CARD */}
                    <div ref={rightColumnRef} className="hero-right flex relative">
                        <div
                            ref={cardRef}
                            className="hero-card bg-[#12102A] border border-[#1E1A40] rounded-2xl p-4 sm:p-5 w-full shadow-2xl relative"
                        >
                            {/* Rating badge */}
                            <div className="card-badge absolute top-3 right-3 bg-[#1A1535] border border-[#3a2f6a] text-[#A855F7] text-xs px-2 py-1 rounded-full font-medium">
                                ★ 4.9
                            </div>

                            {/* Top row */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="card-avatar w-10 h-10 rounded-full bg-[#7B2FFF] flex items-center justify-center text-white font-medium text-base shrink-0">
                                    RK
                                </div>
                                <div>
                                    <p className="card-name text-white font-medium text-sm">Ramesh Kumar</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0"></span>
                                        <span className="text-[#22c55e] text-xs font-medium">On the way</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="card-label text-[#6B6188] uppercase tracking-wider text-xs">ETA</span>
                                    <span className="card-value text-[#A855F7] font-medium text-xs sm:text-sm">arriving 2min 34sec</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="card-label text-[#6B6188] uppercase tracking-wider text-xs">Platform</span>
                                    <span className="card-value text-white font-medium text-xs sm:text-sm">PF 4 — NDLS</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="card-label text-[#6B6188] uppercase tracking-wider text-xs">Porter ID</span>
                                    <span className="card-value text-white font-medium text-xs sm:text-sm">#CH-9942</span>
                                </div>
                            </div>

                            {/* Map preview */}
                            <div className="card-map bg-[#0A0814] rounded-lg h-16 relative overflow-hidden flex flex-col justify-center px-4 border border-[#1E1A40]">
                                <div className="w-full border-t-2 border-dashed border-[#3a2f6a] relative">
                                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#7B2FFF] rounded-full shadow-[0_0_8px_#7B2FFF]"></div>
                                </div>
                                <p className="card-map-text text-xs text-[#6B6188] mt-2 uppercase tracking-wider text-center">
                                    Platform Entry → Train Coach
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    )
}