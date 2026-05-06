import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-[#070511] border-t border-[#1E1A40] py-4 sm:py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="text-white font-medium text-sm sm:text-base">
                    CoolieSeva
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#6B6188]">
                    <Link to="/" className="hover:text-white transition-colors font-medium">Terms</Link>
                    <Link to="/" className="hover:text-white transition-colors font-medium">Privacy</Link>
                    <Link to="/" className="hover:text-white transition-colors font-medium">Support</Link>
                    <Link to="/" className="hover:text-white transition-colors font-medium">Contact</Link>
                </div>
                <div className="text-xs sm:text-sm text-[#6B6188] font-normal">
                    © 2025 CoolieSeva
                </div>
            </div>
        </footer>
    )
}
