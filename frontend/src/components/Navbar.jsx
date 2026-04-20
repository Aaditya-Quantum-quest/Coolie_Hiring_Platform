import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
    Menu, X, Bell, LogOut, User, ChevronDown,
    Briefcase, Shield, Home, MapPin
} from 'lucide-react'

export default function Navbar() {
    const { user, role, logout, notifications } = useApp()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const notifRef = useRef()

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const dashboardLink = role === 'customer' ? '/customer' : role === 'coolie' ? '/coolie' : '/admin'

    return (
        <nav className="sticky top-0 z-[1000] bg-[#070511] border-b border-[#1E1A40]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-[20px] font-bold text-white">
                            CoolieHire
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">

                        {!user && (
                            <>
                                <Link to="/login" className="text-white hover:text-white transition-colors text-[14px] font-medium">Login</Link>
                                <Link to="/register" className="bg-white text-[#0A0814] rounded-full text-sm py-2 px-5 font-semibold hover:bg-gray-200 transition-colors">Register Free</Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Link to={dashboardLink} className="text-[#B0A8CC] hover:text-[#FFFFFF] transition-colors text-[14px] font-medium">Dashboard</Link>

                                {/* Notifications */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => setNotifOpen(!notifOpen)}
                                        className="relative p-2 rounded-xl text-[#B0A8CC] hover:text-white transition-all"
                                    >
                                        <Bell size={20} />
                                        {notifications.length > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </button>
                                    {notifOpen && (
                                        <div className="absolute right-0 top-12 w-80 bg-[#12102A] rounded-2xl shadow-2xl p-2 border border-[#1E1A40]">
                                            <p className="text-xs text-[#6B6188] px-3 py-1 font-semibold uppercase tracking-wider">Notifications</p>
                                            {notifications.length === 0 ? (
                                                <p className="text-[#6B6188] text-sm px-3 py-4 text-center">No notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} className="px-3 py-2 rounded-xl hover:bg-[#1E1A40] transition-colors">
                                                        <p className="text-sm text-white">{n.msg}</p>
                                                        <p className="text-xs text-[#6B6188] mt-1">{n.time.toLocaleTimeString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* User menu */}
                                <div className="flex items-center gap-2 bg-[#12102A] border border-[#1E1A40] rounded-full px-3 py-2">
                                    <div className="w-7 h-7 rounded-full bg-[#7B2FFF] flex items-center justify-center text-white text-xs font-bold">
                                        {user.name?.[0] || 'U'}
                                    </div>
                                    <span className="text-sm text-[#B0A8CC] font-medium hidden lg:block">{user.name}</span>
                                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest ${role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                        role === 'coolie' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-[#7B2FFF]/20 text-[#A855F7]'
                                        }`}>{role}</span>
                                    <button onClick={handleLogout} className="ml-2 text-[#B0A8CC] hover:text-red-400 transition-colors">
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-xl text-[#B0A8CC] hover:text-white transition-all"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden bg-[#12102A] border border-[#1E1A40] rounded-2xl mb-4 p-3 space-y-1 absolute left-4 right-4 mt-2">
                        {/* <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#B0A8CC] hover:bg-[#1E1A40] hover:text-white transition-all" onClick={() => setMenuOpen(false)}>
                            <Home size={16} />Find Work
                        </Link>
                        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#B0A8CC] hover:bg-[#1E1A40] hover:text-white transition-all" onClick={() => setMenuOpen(false)}>
                            <Briefcase size={16} />Hire Talent
                        </Link>
                        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#B0A8CC] hover:bg-[#1E1A40] hover:text-white transition-all" onClick={() => setMenuOpen(false)}>
                            <MapPin size={16} />Resources
                        </Link>
                        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#B0A8CC] hover:bg-[#1E1A40] hover:text-white transition-all" onClick={() => setMenuOpen(false)}>
                            <Shield size={16} />Pricing
                        </Link> */}
                        {!user ? (
                            <>
                                <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#FFFFFF] hover:bg-[#1E1A40] hover:text-white transition-all" onClick={() => setMenuOpen(false)}>
                                    <User size={16} />Login
                                </Link>
                                <Link to="/register" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#0A0814] bg-white hover:bg-gray-200 transition-all font-semibold" onClick={() => setMenuOpen(false)}>
                                    Register Free
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to={dashboardLink} className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#B0A8CC] hover:bg-[#1E1A40] hover:text-white transition-all" onClick={() => setMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full">
                                    <LogOut size={16} />Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            {/* Floating Live Badge */}
            <div className="absolute -bottom-5 left-8 z-50">
                <div className="inline-flex items-center gap-2 bg-[#7B2FFF] rounded-full px-4 py-1.5 shadow-lg">
                    <span className="text-[12px] font-bold text-white uppercase tracking-wider">● LIVE — 2,433</span>
                </div>
            </div>
        </nav>
    )
}
