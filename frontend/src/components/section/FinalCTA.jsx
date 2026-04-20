import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function FinalCTA() {
    const navigate = useNavigate()
    const sectionRef = useRef(null)
    const contentRef = useRef(null)
    const buttonsRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(contentRef.current, { opacity: 0, y: 80, scale: 0.9 })
            gsap.set(buttonsRef.current, { opacity: 0, y: 40 })

            // Content animation with bounce effect
            gsap.to(contentRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.8)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            })

            // Buttons staggered animation
            gsap.to(buttonsRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                delay: 0.3,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            })

            // Button hover animations
            buttonsRef.current.forEach((button, index) => {
                if (button) {
                    button.addEventListener('mouseenter', () => {
                        gsap.to(button, { 
                            scale: 1.1, 
                            rotation: index === 0 ? 2 : -2,
                            duration: 0.3, 
                            ease: "power2.out" 
                        })
                    })
                    button.addEventListener('mouseleave', () => {
                        gsap.to(button, { 
                            scale: 1, 
                            rotation: 0,
                            duration: 0.3, 
                            ease: "power2.out" 
                        })
                    })
                }
            })

            // Continuous pulse animation for primary button
            if (buttonsRef.current[0]) {
                gsap.to(buttonsRef.current[0], {
                    boxShadow: "0 0 20px rgba(123, 47, 255, 0.6)",
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut"
                })
            }

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="bg-[#0E0C1E] py-[100px] px-4 text-center">
            <div ref={contentRef} className="max-w-3xl mx-auto">
                <h2 className="text-[52px] font-bold mb-4 leading-tight">
                    <span className="text-white">Ready to Travel </span>
                    <br className="hidden md:block" />
                    <span className="text-[#A855F7]">Stress Free?</span>
                </h2>
                <p className="text-[16px] text-[#B0A8CC] mb-8">
                    Join 500,000+ happy travelers and make your next station journey a breeze.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button ref={el => buttonsRef.current[0] = el} onClick={() => navigate('/register')} className="bg-[#7B2FFF] text-white px-8 py-3 rounded-full font-bold hover:bg-[#5B1FCC] transition-colors">
                        Book a Coolie Now
                    </button>
                    <button ref={el => buttonsRef.current[1] = el} className="bg-transparent border border-[#7B2FFF] text-[#A855F7] px-8 py-3 rounded-full font-bold hover:bg-[#7B2FFF]/10 transition-colors">
                        Download the App
                    </button>
                </div>
            </div>
        </section>
    )
}
