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
        <section ref={sectionRef} className="bg-[#0A0814] py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div ref={headerRef} className="mb-8 sm:mb-12 text-center lg:text-left">
                    <span className="inline-block text-xs uppercase tracking-wider text-[#A855F7] border border-[#3a2f6a] rounded-full px-4 py-1 mb-4 font-normal">
                        HOW IT WORKS
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-3 sm:mb-4">
                        <span className="text-white">How It </span>
                        <span className="text-[#A855F7]">Works</span>
                    </h2>
                    <p className="text-sm sm:text-base text-[#B0A8CC] max-w-xl mx-auto lg:mx-0 font-normal">
                        Simple, transparent, and built for your comfort from booking to destination.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Card 1 */}
                    <div ref={el => cardsRef.current[0] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-5xl sm:text-6xl lg:text-7xl font-medium text-[#1A1535] leading-none z-0 select-none">01</div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-4 sm:mb-6">
                                <Smartphone size={18} />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-white mb-2">Open App</h3>
                            <p className="text-sm text-[#B0A8CC] font-normal">Enter your station and platform details in the CoolieSeva app.</p>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div ref={el => cardsRef.current[1] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-5xl sm:text-6xl lg:text-7xl font-medium text-[#1A1535] leading-none z-0 select-none">02</div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-4 sm:mb-6">
                                <LinkIcon size={18} />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-white mb-2">Match</h3>
                            <p className="text-sm text-[#B0A8CC] font-normal">System matches you with a verified porter nearby within 30 seconds.</p>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div ref={el => cardsRef.current[2] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-5xl sm:text-6xl lg:text-7xl font-medium text-[#1A1535] leading-none z-0 select-none">03</div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-4 sm:mb-6">
                                <Briefcase size={18} />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-white mb-2">Luggage Pickup</h3>
                            <p className="text-sm text-[#B0A8CC] font-normal">Your porter arrives and safely secures your luggage with NFC tags.</p>
                        </div>
                    </div>
                    {/* Card 4 */}
                    <div ref={el => cardsRef.current[3] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-5xl sm:text-6xl lg:text-7xl font-medium text-[#1A1535] leading-none z-0 select-none">04</div>
                        <div className="relative z-10">
                            <div className="w-10 h-10 bg-[#7B2FFF] rounded-full flex items-center justify-center text-white mb-4 sm:mb-6">
                                <CheckCircle size={18} />
                            </div>
                            <h3 className="text-base sm:text-lg font-medium text-white mb-2">Finish & Pay</h3>
                            <p className="text-sm text-[#B0A8CC] font-normal">Reached your train? Pay securely via UPI through the app dashboard.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
