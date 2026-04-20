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
            // Initial state
            gsap.set(leftColumnRef.current, { opacity: 0, x: -50 })
            gsap.set(rightColumnRef.current, { opacity: 0, x: 50 })
            gsap.set(cardRef.current, { opacity: 0, y: 30, scale: 0.9 })

            // Entrance animations
            gsap.to(leftColumnRef.current, {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: "power3.out"
            })

            gsap.to(rightColumnRef.current, {
                opacity: 1,
                x: 0,
                duration: 1,
                delay: 0.2,
                ease: "power3.out"
            })

            gsap.to(cardRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                delay: 0.4,
                ease: "back.out(1.7)"
            })

            // Staggered text animation
            gsap.from(headingRef.current.children, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.2,
                delay: 0.3,
                ease: "power2.out"
            })

            gsap.from(paragraphRef.current, {
                opacity: 0,
                y: 20,
                duration: 0.8,
                delay: 0.7,
                ease: "power2.out"
            })

            gsap.from(buttonsRef.current.children, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.9,
                ease: "power2.out"
            })

            // Hover animations for buttons
            const buttons = Array.from(buttonsRef.current.children)
            buttons.forEach(button => {
                button.addEventListener('mouseenter', () => {
                    gsap.to(button, { scale: 1.05, duration: 0.3, ease: "power2.out" })
                })
                button.addEventListener('mouseleave', () => {
                    gsap.to(button, { scale: 1, duration: 0.3, ease: "power2.out" })
                })
            })

            // Card float animation
            gsap.to(cardRef.current, {
                y: -10,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            })

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[60%_40%] gap-12 items-center">
                {/* LEFT COLUMN */}
                <div ref={leftColumnRef} className="space-y-6">
                    <h1 ref={headingRef} className="text-[64px] font-bold leading-tight">
                        <span className="text-white block">Hire a Coolie in</span>
                        <span className="text-[#A855F7] block">60 Seconds ⚡</span>
                    </h1>
                    <p ref={paragraphRef} className="text-[16px] text-[#B0A8CC] max-w-lg leading-relaxed">
                        The world's first on-demand portal for railway porters. Verified professionals, transparent pricing, and instant tracking.
                    </p>
                    <div ref={buttonsRef} className="flex flex-wrap gap-4 pt-4">
                        <button onClick={() => navigate('/register')} className="bg-[#7B2FFF] text-white px-8 py-3 rounded-full font-bold hover:bg-[#5B1FCC] transition-colors">
                            Book a Coolie Now
                        </button>
                        <Link to="/login?role=coolie" className="bg-transparent border border-[#7B2FFF] text-[#A855F7] px-8 py-3 rounded-full font-bold hover:bg-[#7B2FFF]/10 transition-colors">
                            Join as Coolie
                        </Link>
                    </div>
                </div>

                {/* RIGHT COLUMN — PORTER ASSIGNMENT CARD */}
                <div ref={rightColumnRef} className="flex justify-center lg:justify-end relative">
                    <div ref={cardRef} className="bg-[#12102A] border border-[#1E1A40] rounded-[16px] p-[20px] w-full max-w-sm shadow-2xl relative">
                        {/* Rating badge top right */}
                        <div className="absolute top-4 right-4 bg-[#1A1535] border border-[#3a2f6a] text-[#A855F7] text-[11px] px-2 py-1 rounded-full font-bold">
                            ★ 4.9
                        </div>

                        {/* Top row */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-[#7B2FFF] flex items-center justify-center text-white font-bold text-lg">
                                RK
                            </div>
                            <div>
                                <p className="text-white font-bold text-[16px]">Ramesh Kumar</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[#22c55e] text-[12px] font-semibold">On the way</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-[14px]">
                                <span className="text-[#6B6188] uppercase tracking-wider text-[12px]">ETA</span>
                                <span className="text-[#A855F7] font-semibold">arriving 2min 34sec</span>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="text-[#6B6188] uppercase tracking-wider text-[12px]">Platform</span>
                                <span className="text-white font-semibold">PF 4 — NDLS</span>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="text-[#6B6188] uppercase tracking-wider text-[12px]">Porter ID</span>
                                <span className="text-white font-semibold">#CH-9942</span>
                            </div>
                        </div>

                        {/* Map preview block */}
                        <div className="bg-[#0A0814] rounded-[8px] h-[80px] relative overflow-hidden flex flex-col justify-center px-4 border border-[#1E1A40]">
                            <div className="w-full border-t-2 border-dashed border-[#3a2f6a] relative">
                                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#7B2FFF] rounded-full shadow-[0_0_8px_#7B2FFF]"></div>
                            </div>
                            <p className="text-[11px] text-[#6B6188] mt-3 uppercase tracking-widest text-center">Platform Entry → Train Coach</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
