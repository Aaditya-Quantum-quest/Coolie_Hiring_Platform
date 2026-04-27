import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/section/HeroSection'
import StatsBar from '../components/section/StatsBar'
import HowItWorks from '../components/section/HowItWorks'
import Features from '../components/section/Features'
import Testimonials from '../components/section/Testimonials'
import FinalCTA from '../components/section/FinalCTA'
import Footer from '../components/Footer'

export default function HomePage() {
    const navigate = useNavigate()
    
    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <div className="min-h-screen bg-[#0A0814] font-sans text-[#B0A8CC]">
            
            <Navbar />
            <HeroSection />
            <StatsBar />
            <HowItWorks />
            <Features />
            <Testimonials />
            <FinalCTA />
            <Footer />
        </div>
    )
}
