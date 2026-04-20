import React, { useEffect, useRef } from 'react'
import { Smartphone, Link as LinkIcon, Briefcase, CheckCircle } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorks() {
    const sectionRef = useRef(null)
    const headerRef = useRef(null)
    const cardsRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(headerRef.current, { opacity: 0, y: 50 })
            gsap.set(cardsRef.current, { opacity: 0, y: 60, scale: 0.9 })

            // Header animation
            gsap.to(headerRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            })

            // Cards staggered animation
            gsap.to(cardsRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            })

            // Hover animations for cards
            cardsRef.current.forEach((card, index) => {
                if (card) {
                    card.addEventListener('mouseenter', () => {
                        gsap.to(card, { 
                            y: -10, 
                            scale: 1.05, 
                            duration: 0.3, 
                            ease: "power2.out" 
                        })
                    })
                    card.addEventListener('mouseleave', () => {
                        gsap.to(card, { 
                            y: 0, 
                            scale: 1, 
                            duration: 0.3, 
                            ease: "power2.out" 
                        })
                    })
                }
            })

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="bg-[#0A0814] py-[100px] px-4">
            <div className="max-w-7xl mx-auto">
                <div ref={headerRef} className="mb-12">
                    <span className="inline-block text-[11px] uppercase tracking-[0.1em] text-[#A855F7] border border-[#3a2f6a] rounded-full px-[14px] py-[4px] mb-4">
                        HOW IT WORKS
                    </span>
                    <h2 className="text-[44px] font-bold mb-4">
                        <span className="text-white">How It </span>
                        <span className="text-[#A855F7]">Works</span>
                    </h2>
                    <p className="text-[16px] text-[#B0A8CC]">
                        Simple, transparent, and built for your comfort from booking to destination.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div ref={el => cardsRef.current[0] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-[80px] font-[800] text-[#1A1535] leading-none z-0 select-none">01</div>
                        <div className="relative z-10">
                            <div className="w-[40px] h-[40px] bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-6">
                                <Smartphone size={20} />
                            </div>
                            <h3 className="text-[17px] font-bold text-white mb-2">Open App</h3>
                            <p className="text-[14px] text-[#B0A8CC]">Enter your station and platform details in the CoolieHire app.</p>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div ref={el => cardsRef.current[1] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-[80px] font-[800] text-[#1A1535] leading-none z-0 select-none">02</div>
                        <div className="relative z-10">
                            <div className="w-[40px] h-[40px] bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-6">
                                <LinkIcon size={20} />
                            </div>
                            <h3 className="text-[17px] font-bold text-white mb-2">Match</h3>
                            <p className="text-[14px] text-[#B0A8CC]">System matches you with a verified porter nearby within 30 seconds.</p>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div ref={el => cardsRef.current[2] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-[80px] font-[800] text-[#1A1535] leading-none z-0 select-none">03</div>
                        <div className="relative z-10">
                            <div className="w-[40px] h-[40px] bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-6">
                                <Briefcase size={20} />
                            </div>
                            <h3 className="text-[17px] font-bold text-white mb-2">Luggage Pickup</h3>
                            <p className="text-[14px] text-[#B0A8CC]">Your porter arrives and safely secures your luggage with NFC tags.</p>
                        </div>
                    </div>
                    {/* Card 4 */}
                    <div ref={el => cardsRef.current[3] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-[80px] font-[800] text-[#1A1535] leading-none z-0 select-none">04</div>
                        <div className="relative z-10">
                            <div className="w-[40px] h-[40px] bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-6">
                                <CheckCircle size={20} />
                            </div>
                            <h3 className="text-[17px] font-bold text-white mb-2">Finish & Pay</h3>
                            <p className="text-[14px] text-[#B0A8CC]">Reached your train? Pay securely via UPI through the app dashboard.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
