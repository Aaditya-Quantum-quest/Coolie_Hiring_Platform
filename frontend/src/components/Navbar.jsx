import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Menu, X, Bell, LogOut, User } from 'lucide-react'

export default function Navbar() {
    const { user, role, logout, notifications } = useApp()
    const navigate = useNavigate()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const notifRef = useRef()

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    // Close notification dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/')
        setMenuOpen(false)
    }

    const dashboardLink =
        role === 'customer' ? '/customer' :
            role === 'coolie' ? '/coolie' : '/admin'

    const roleColors = {
        admin: 'bg-purple-500/20 text-purple-400',
        coolie: 'bg-blue-500/20 text-blue-400',
        customer: 'bg-[#7B2FFF]/20 text-[#A855F7]',
    }

    return (
        <>
            {/* Navbar */}
            <nav className="sticky top-0 z-[1000] bg-[#070511] border-b border-[#1E1A40]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-xl font-semibold text-white tracking-tight">
                                CoolieSeva
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-4">
                            {!user ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-[#B0A8CC] hover:text-white transition-colors text-sm font-medium px-3 py-2"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="inline-flex items-center justify-center bg-white text-[#0A0814] rounded-full text-sm h-9 px-5 font-medium hover:bg-gray-100 transition-colors whitespace-nowrap leading-none"
                                    >
                                        Register Free
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to={dashboardLink}
                                        className="text-[#B0A8CC] hover:text-white transition-colors text-sm font-medium px-3 py-2"
                                    >
                                        Dashboard
                                    </Link>

                                    {/* Notifications */}
                                    <div className="relative" ref={notifRef}>
                                        <button
                                            onClick={() => setNotifOpen(!notifOpen)}
                                            className="relative p-2 rounded-xl text-[#B0A8CC] hover:text-white hover:bg-[#1E1A40] transition-all"
                                            aria-label="Notifications"
                                        >
                                            <Bell size={20} />
                                            {notifications.length > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                                            )}
                                        </button>

                                        {notifOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-80 bg-[#12102A] rounded-2xl shadow-2xl border border-[#1E1A40] overflow-hidden z-50">
                                                <p className="text-xs text-[#6B6188] px-4 py-2.5 font-semibold uppercase tracking-wider border-b border-[#1E1A40]">
                                                    Notifications
                                                </p>
                                                {notifications.length === 0 ? (
                                                    <p className="text-[#6B6188] text-sm px-4 py-6 text-center">
                                                        No notifications
                                                    </p>
                                                ) : (
                                                    <div className="max-h-64 overflow-y-auto">
                                                        {notifications.map(n => (
                                                            <div
                                                                key={n.id}
                                                                className="px-4 py-3 hover:bg-[#1E1A40] transition-colors border-b border-[#1E1A40]/50 last:border-0"
                                                            >
                                                                <p className="text-sm text-white">{n.msg}</p>
                                                                <p className="text-xs text-[#6B6188] mt-1">
                                                                    {n.time.toLocaleTimeString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* User pill */}
                                    <div className="flex items-center gap-2 bg-[#12102A] border border-[#1E1A40] rounded-full pl-1.5 pr-3 py-1.5">
                                        <div className="w-7 h-7 rounded-full bg-[#7B2FFF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm text-[#B0A8CC] font-medium hidden lg:block truncate max-w-[90px]">
                                            {user.name}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider whitespace-nowrap ${roleColors[role] || roleColors.customer}`}>
                                            {role}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="ml-1 text-[#B0A8CC] hover:text-red-400 transition-colors flex-shrink-0"
                                            aria-label="Logout"
                                        >
                                            <LogOut size={15} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden p-2 rounded-xl text-[#B0A8CC] hover:text-white hover:bg-[#1E1A40] transition-all"
                            onClick={() => setMenuOpen(prev => !prev)}
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Live badge — sits flush below navbar */}
                <div className="relative h-0 overflow-visible">
                    <div className="absolute left-4 sm:left-8 -top-3">
                        <div className="inline-flex items-center gap-1.5 bg-[#7B2FFF] rounded-full px-3 py-1 shadow-lg shadow-purple-900/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-xs font-semibold text-white uppercase tracking-wider">
                                LIVE — 2,433
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile dropdown — rendered outside nav to avoid clipping */}
            {menuOpen && (
                <div className="md:hidden fixed top-16 left-0 right-0 z-[999] px-4 pt-2 pb-4">
                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-2xl shadow-2xl p-2 space-y-1">
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-[#1E1A40] transition-all text-sm font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <User size={16} className="text-[#B0A8CC]" />
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full text-center px-4 py-3 rounded-xl bg-white text-[#0A0814] hover:bg-gray-100 transition-all font-medium text-sm"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Register Free
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* User info row */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E1A40] mb-1">
                                    <div className="w-8 h-8 rounded-full bg-[#7B2FFF] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                        {user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-white font-medium truncate">{user.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${roleColors[role] || roleColors.customer}`}>
                                            {role}
                                        </span>
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="ml-auto flex items-center gap-1.5 text-xs text-[#B0A8CC]">
                                            <Bell size={14} />
                                            <span>{notifications.length}</span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to={dashboardLink}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#B0A8CC] hover:bg-[#1E1A40] hover:text-white transition-all text-sm font-medium"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full text-sm font-medium"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}