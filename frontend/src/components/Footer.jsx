import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-[#070511] border-t border-[#1E1A40] py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-white font-bold text-[16px]">
                    CoolieHire
                </div>
                <div className="flex items-center gap-6 text-[13px] text-[#6B6188]">
                    <Link to="/" className="hover:text-white transition-colors">Terms</Link>
                    <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
                    <Link to="/" className="hover:text-white transition-colors">Support</Link>
                    <Link to="/" className="hover:text-white transition-colors">Contact</Link>
                </div>
                <div className="text-[13px] text-[#6B6188]">
                    © 2024 CoolieHire
                </div>
            </div>
        </footer>
    )
}
