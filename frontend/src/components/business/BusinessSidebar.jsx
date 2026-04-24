import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import {
    LayoutDashboard, User, MapPin, Star, Bell, Settings, LogOut,
    UtensilsCrossed, BookOpen, Bed, Building2, CalendarDays, Menu, X, ExternalLink
} from 'lucide-react';

const navLinks = {
    both: [
        { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/owner/profile', icon: User, label: 'My Profile' },
        { to: '/owner/location', icon: MapPin, label: 'Location & Map' },
        { to: '/owner/reviews', icon: Star, label: 'Reviews' },
        { to: '/owner/notifications', icon: Bell, label: 'Notifications' },
        { to: '/owner/settings', icon: Settings, label: 'Settings' },
    ],
    restaurant: [
        { to: '/owner/menu', icon: UtensilsCrossed, label: 'Menu Management' },
    ],
    hotel: [
        { to: '/owner/rooms', icon: Bed, label: 'Room Management' },
        { to: '/owner/halls', icon: Building2, label: 'Halls & Banquet' },
    ]
};

const StatusBadge = ({ status }) => {
    const map = {
        approved: 'bg-green-500/20 text-green-400',
        pending: 'bg-yellow-500/20 text-yellow-400',
        rejected: 'bg-red-500/20 text-red-400'
    };
    const icons = { approved: '✅', pending: '⏳', rejected: '❌' };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {icons[status]} {status}
        </span>
    );
};

export default function BusinessSidebar() {
    const { owner, business, logout } = useBusinessAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const typeLinks = business?.type === 'restaurant' ? navLinks.restaurant : navLinks.hotel;
    const allLinks = [...navLinks.both.slice(0, 3), ...typeLinks, ...navLinks.both.slice(3)];

    const handleLogout = () => { logout(); navigate('/business/login'); };

    const SidebarContent = () => (
        <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-card)' }}>
            {/* Header */}
            <div className="p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ backgroundColor: 'rgba(123, 47, 255, 0.2)', color: '#7B2FFF' }}>
                        {business?.name?.[0] || 'B'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{business?.name || 'Business'}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-body)' }}>{owner?.full_name}</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(123, 47, 255, 0.2)', color: '#7B2FFF' }}>
                        {business?.type === 'restaurant' ? '🍽️ Restaurant' : '🏨 Hotel'}
                    </span>
                    <StatusBadge status={business?.status || 'pending'} />
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 overflow-y-auto">
                {allLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                                isActive
                                    ? 'text-white'
                                    : 'hover:text-white'
                            }`
                        }
                        style={({ isActive }) => ({
                            backgroundColor: isActive ? '#7B2FFF' : 'transparent',
                            color: isActive ? 'white' : 'var(--text-body)'
                        })}
                    >
                        <Icon size={16} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                    onClick={() => window.open(`/business/${business?.id}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors mb-2"
                    style={{ border: '1px solid rgba(123, 47, 255, 0.5)', color: '#7B2FFF' }}
                    onMouseEnter={e => { e.target.style.backgroundColor = 'rgba(123, 47, 255, 0.1)'; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; }}
                >
                    <ExternalLink size={12} /> View Public Profile
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={e => { e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; }}
                >
                    <LogOut size={12} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Topbar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{business?.name}</p>
                <button onClick={() => setOpen(true)} className="p-1" style={{ color: 'var(--text-primary)' }}>
                    <Menu size={20} />
                </button>
            </div>

            {/* Mobile Drawer */}
            {open && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1" style={{ color: 'var(--text-body)' }}>
                            <X size={20} />
                        </button>
                        <SidebarContent />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col w-64 shrink-0 min-h-screen fixed left-0 top-0 bottom-0" style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}>
                <SidebarContent />
            </div>
        </>
    );
}
