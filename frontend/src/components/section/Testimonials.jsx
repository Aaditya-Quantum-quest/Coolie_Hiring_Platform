import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Testimonials() {
    const sectionRef = useRef(null)
    const headerRef = useRef(null)
    const testimonialCardsRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(headerRef.current, { opacity: 0, y: 50 })
            gsap.set(testimonialCardsRef.current, { opacity: 0, y: 100, scale: 0.8 })

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

            // Testimonial cards staggered animation
            gsap.to(testimonialCardsRef.current, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                stagger: 0.2,
                ease: "elastic.out(1, 0.5)",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            })

            // Hover animations for testimonial cards
            testimonialCardsRef.current.forEach((card, index) => {
                if (card) {
                    card.addEventListener('mouseenter', () => {
                        gsap.to(card, { 
                            y: -20, 
                            scale: 1.05, 
                            rotation: 1,
                            duration: 0.4, 
                            ease: "power2.out" 
                        })
                    })
                    card.addEventListener('mouseleave', () => {
                        gsap.to(card, { 
                            y: 0, 
                            scale: 1, 
                            rotation: 0,
                            duration: 0.4, 
                            ease: "power2.out" 
                        })
                    })
                }
            })

            // Stars animation
            const stars = sectionRef.current?.querySelector('.stars')
            if (stars) {
                gsap.from(Array.from(stars.children), {
                    scale: 0,
                    rotation: 180,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                })
            }

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="bg-[#0A0814] py-[100px] px-4 text-center">
            <div className="max-w-6xl mx-auto">
                <div ref={headerRef} className="text-[#A855F7] text-[22px] tracking-[4px] mb-4 stars">★★★★★</div>
                <h2 className="text-[44px] font-bold mb-12">
                    <span className="text-white">Travelers </span>
                    <span className="text-[#A855F7]">Love Us</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-6 text-left">
                    {/* Testimonial 1 */}
                    <div ref={el => testimonialCardsRef.current[0] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] flex flex-col justify-between">
                        <p className="text-[#B0A8CC] text-[15px] italic mb-6">"First time I didn't have to shout for a coolie at NDLS. Booked Ramesh via app, he was waiting right at the platform entry. Life changing for frequent travellers."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#7B2FFF] flex items-center justify-center text-white font-bold">AS</div>
                            <div>
                                <p className="text-white font-bold text-[14px]">Anju S Sharma</p>
                                <p className="text-[#6B6188] text-[12px]">New Delhi</p>
                            </div>
                        </div>
                    </div>
                    {/* Testimonial 2 */}
                    <div ref={el => testimonialCardsRef.current[1] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] flex flex-col justify-between">
                        <p className="text-[#B0A8CC] text-[15px] italic mb-6">"Travelling with kids and heavy bags is a nightmare. CoolieHire made it so easy. Fixed price meant no arguing and the porter was extremely helpful."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#5B1FCC] flex items-center justify-center text-white font-bold">VM</div>
                            <div>
                                <p className="text-white font-bold text-[14px]">Vikram Mehta</p>
                                <p className="text-[#6B6188] text-[12px]">Mumbai Central</p>
                            </div>
                        </div>
                    </div>
                    {/* Testimonial 3 */}
                    <div ref={el => testimonialCardsRef.current[2] = el} className="bg-[#12102A] border border-[#1E1A40] rounded-[14px] p-[28px] flex flex-col justify-between">
                        <p className="text-[#B0A8CC] text-[15px] italic mb-6">"The tracking feature gave me such peace of mind. I could see exactly where my bags were while I was busy with my children. Highly recommend it."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#3a2f6a] flex items-center justify-center text-white font-bold">PI</div>
                            <div>
                                <p className="text-white font-bold text-[14px]">Priya Iyer</p>
                                <p className="text-[#6B6188] text-[12px]">Chennai Central</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
