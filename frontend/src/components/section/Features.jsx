import React, { useEffect, useRef } from 'react'
import { Shield, Globe, MapPin, CreditCard, UserCheck, LifeBuoy, Calendar, Heart } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Features() {
    const sectionRef = useRef(null)
    const headerRef = useRef(null)
    const featureCardsRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(headerRef.current, { opacity: 0, y: 50 })
            gsap.set(featureCardsRef.current, { opacity: 0, y: 80, rotationX: 15 })

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

            // Feature cards staggered animation with 3D effect
            gsap.to(featureCardsRef.current, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 1,
                stagger: {
                    amount: 0.8,
                    from: "start"
                },
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            })

            // Hover animations for feature cards
            featureCardsRef.current.forEach((card, index) => {
                if (card) {
                    const icon = card.querySelector('.feature-icon')
                    
                    card.addEventListener('mouseenter', () => {
                        gsap.to(card, { 
                            y: -15, 
                            scale: 1.05, 
                            rotationY: 5,
                            duration: 0.4, 
                            ease: "power2.out" 
                        })
                        if (icon) {
                            gsap.to(icon, {
                                rotation: 360,
                                scale: 1.2,
                                duration: 0.6,
                                ease: "power2.out"
                            })
                        }
                    })
                    
                    card.addEventListener('mouseleave', () => {
                        gsap.to(card, { 
                            y: 0, 
                            scale: 1, 
                            rotationY: 0,
                            duration: 0.4, 
                            ease: "power2.out" 
                        })
                        if (icon) {
                            gsap.to(icon, {
                                rotation: 0,
                                scale: 1,
                                duration: 0.6,
                                ease: "power2.out"
                            })
                        }
                    })
                }
            })

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="bg-[#0E0C1E] py-[100px] px-4">
            <div className="max-w-7xl mx-auto">
                <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
                    <div>
                        <span className="inline-block text-[11px] uppercase tracking-[0.1em] text-[#A855F7] border border-[#3a2f6a] rounded-full px-[14px] py-[4px] mb-4">
                            UNIQUE FEATURES
                        </span>
                        <h2 className="text-[44px] font-bold leading-tight">
                            <span className="text-white block">Built for the</span>
                            <span className="text-[#A855F7] block">Indian Traveler</span>
                        </h2>
                    </div>
                    <p className="text-[16px] text-[#B0A8CC] max-w-sm">
                        The most advanced platform for railway porters ever created.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Row 1 */}
                    <div ref={el => featureCardsRef.current[0] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <Shield size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Insurance Cover</h3>
                        <p className="text-[13px] text-[#B0A8CC]">Every bag is insured up to ₹2,000 against any accidental damage or loss.</p>
                    </div>
                    <div ref={el => featureCardsRef.current[1] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <Globe size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Multi-lingual</h3>
                        <p className="text-[13px] text-[#B0A8CC]">Support for 12+ Indian languages to ensure smooth communication with porters.</p>
                    </div>
                    <div ref={el => featureCardsRef.current[2] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <MapPin size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Live Tracking</h3>
                        <p className="text-[13px] text-[#B0A8CC]">Real-time GPS tracking of your luggage and porter until you reach your seat.</p>
                    </div>
                    <div ref={el => featureCardsRef.current[3] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <CreditCard size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Flat Pricing</h3>
                        <p className="text-[13px] text-[#B0A8CC]">No more bargaining. Get clear, fixed quotes based on weight and distance.</p>
                    </div>

                    {/* Row 2 */}
                    <div ref={el => featureCardsRef.current[4] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <UserCheck size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Verified IDs</h3>
                        <p className="text-[13px] text-[#B0A8CC]">Every porter is background-checked and registered with Indian Railways.</p>
                    </div>
                    <div ref={el => featureCardsRef.current[5] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <LifeBuoy size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">On-call SOS</h3>
                        <p className="text-[13px] text-[#B0A8CC]">Immediate physical intervention team at every major station for any emergency.</p>
                    </div>
                    <div ref={el => featureCardsRef.current[6] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <Calendar size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Pre-Booking</h3>
                        <p className="text-[13px] text-[#B0A8CC]">Book your porter up to 7 days in advance to ensure availability during rush hours.</p>
                    </div>
                    <div ref={el => featureCardsRef.current[7] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[20px]">
                        <div className="feature-icon w-[36px] h-[36px] bg-[#1A1535] rounded-full flex items-center justify-center text-[#7B2FFF] mb-4">
                            <Heart size={18} />
                        </div>
                        <h3 className="text-[15px] font-bold text-white mb-2">Porter Welfare</h3>
                        <p className="text-[13px] text-[#B0A8CC]">We ensure 85% of booking fees go directly to porters with added health benefits.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
