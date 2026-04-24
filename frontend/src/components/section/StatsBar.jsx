import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function StatsBar() {
    const sectionRef = useRef(null)
    const statItemsRef = useRef([])

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(statItemsRef.current, { opacity: 0, y: 50 })

            // Scroll-triggered animation
            gsap.to(statItemsRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            })

            // Counter animation for numbers
            const counters = [
                { element: statItemsRef.current[0]?.querySelector('.stat-number'), end: 50000, suffix: '+' },
                { element: statItemsRef.current[1]?.querySelector('.stat-number'), end: 120, suffix: '+' },
                { element: statItemsRef.current[2]?.querySelector('.stat-number'), end: 4.9, suffix: '/5', decimal: true },
                { element: statItemsRef.current[3]?.querySelector('.stat-number'), end: 24, suffix: '/7' }
            ]

            counters.forEach((counter, index) => {
                if (counter.element) {
                    gsap.fromTo(counter.element, 
                        { textContent: counter.decimal ? '0.0' : '0' },
                        {
                            duration: 2,
                            textContent: counter.decimal ? counter.end.toFixed(1) : counter.end,
                            ease: "power2.out",
                            snap: { textContent: 1 },
                            scrollTrigger: {
                                trigger: sectionRef.current,
                                start: "top 80%",
                                toggleActions: "play none none reverse"
                            },
                            onUpdate: function() {
                                const progress = this.progress();
                                const current = counter.decimal ? 
                                    (counter.end * progress).toFixed(1) : 
                                    Math.floor(counter.end * progress);
                                counter.element.textContent = current + counter.suffix;
                            },
                        }
                    )
                }
            })

        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} className="bg-[#0E0C1E] py-10 sm:py-12 lg:py-16 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
                <div ref={el => statItemsRef.current[0] = el}>
                    <p className="stat-number text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">50,000+</p>
                    <p className="text-xs sm:text-sm text-[#6B6188] uppercase tracking-wider font-normal mt-2">SUCCESSFUL TRIPS</p>
                </div>
                <div ref={el => statItemsRef.current[1] = el}>
                    <p className="stat-number text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">120+</p>
                    <p className="text-xs sm:text-sm text-[#6B6188] uppercase tracking-wider font-normal mt-2">STATIONS LIVE</p>
                </div>
                <div ref={el => statItemsRef.current[2] = el}>
                    <p className="stat-number text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">4.9/5</p>
                    <p className="text-xs sm:text-sm text-[#6B6188] uppercase tracking-wider font-normal mt-2">AVERAGE RATING</p>
                </div>
                <div ref={el => statItemsRef.current[3] = el}>
                    <p className="stat-number text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">24/7</p>
                    <p className="text-xs sm:text-sm text-[#6B6188] uppercase tracking-wider font-normal mt-2">HUMAN SUPPORT</p>
                </div>
            </div>
        </section>
    )
}
