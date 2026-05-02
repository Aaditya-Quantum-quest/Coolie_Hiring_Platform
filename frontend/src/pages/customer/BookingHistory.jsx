import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import { Clock, Star, Download, Search, Filter, ChevronDown, Eye, Calendar, MapPin, Package, Navigation, X, ClipboardList, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function BookingHistory() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [bookings, setBookings] = useState([])
    const [expanded, setExpanded] = useState(null)

    React.useEffect(() => {
        axios.get('/api/bookings/my-bookings')
            .then(res => {
                if (res.data.success) setBookings(res.data.bookings)
            })
            .catch(err => console.error(err))
    }, [])

    const filtered = bookings.filter(b => {
        const matchSearch = b.coolieName?.toLowerCase().includes(search.toLowerCase()) || b.id?.includes(search)
        const matchFilter = filter === 'all' || b.status === filter
        return matchSearch && matchFilter
    })

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />

            {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
            <main className="flex-1 md:ml-64 p-6 max-[767px]:p-3 max-[767px]:pb-24">

                {/* Header */}
                <div className="pt-12 md:pt-0 mb-6 max-[767px]:mb-4 flex items-center justify-between flex-wrap gap-4 max-[767px]:gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2 max-[767px]:text-lg max-[767px]:gap-1.5">
                            <ClipboardList size={24} className="text-orange-400 max-[767px]:w-[18px] max-[767px]:h-[18px]" />
                            My Bookings
                        </h1>
                        <p className="text-slate-400 text-sm max-[767px]:text-xs">View all your coolie booking history</p>
                    </div>
                    <button
                        onClick={() => toast.success('Downloading booking history...')}
                        className="btn-secondary flex items-center gap-2 py-2 text-sm max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:gap-1 max-[767px]:px-3"
                    >
                        <Download size={14} className="max-[767px]:w-3 max-[767px]:h-3" /> Export
                    </button>
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5 max-[767px]:gap-2 max-[767px]:mb-3">
                    {/* Search */}
                    <div className="relative w-full sm:flex-1 sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 max-[767px]:w-3 max-[767px]:h-3 max-[767px]:left-2.5" />
                        <input
                            className="input-field pl-9 py-2 text-sm w-full max-[767px]:pl-8 max-[767px]:py-2 max-[767px]:text-xs max-[767px]:h-9"
                            placeholder="Search booking or coolie..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Status filter pills — scrollable on mobile */}
                    <div className="flex gap-2 flex-wrap max-[767px]:flex-nowrap max-[767px]:overflow-x-auto max-[767px]:gap-1.5 max-[767px]:pb-1 max-[767px]:scrollbar-none">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap
                                    max-[767px]:px-2.5 max-[767px]:py-1.5 max-[767px]:text-[10px] max-[767px]:rounded-lg flex-shrink-0
                                    ${filter === s ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 max-[767px]:grid-cols-4 max-[767px]:gap-2 max-[767px]:mb-4">
                    {[
                        { label: 'Total', val: bookings.length, color: 'text-white' },
                        { label: 'Completed', val: bookings.filter(b => b.status === 'completed').length, color: 'text-green-400' },
                        { label: 'Pending', val: bookings.filter(b => b.status === 'pending').length, color: 'text-orange-400' },
                        { label: 'Spent', val: `₹${bookings.reduce((a, b) => a + Number(b.amount || 0), 0)}`, color: 'text-blue-400' },
                    ].map(s => (
                        <div key={s.label} className="card p-3 text-center max-[767px]:p-2">
                            <p className={`text-xl font-bold ${s.color} max-[767px]:text-base`}>{s.val}</p>
                            <p className="text-xs text-slate-400 max-[767px]:text-[10px] max-[767px]:leading-tight">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Bookings List ── */}
                <div className="space-y-3 max-[767px]:space-y-2">
                    {filtered.length === 0 ? (
                        <div className="card p-12 text-center max-[767px]:p-8">
                            <p className="text-slate-400 max-[767px]:text-sm">No bookings found</p>
                        </div>
                    ) : filtered.map(b => (
                        <div key={b.id} className="card p-4 max-[767px]:p-3">

                            {/* ── Card top row ── */}
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4 max-[767px]:flex-row max-[767px]:gap-2.5 max-[767px]:items-start">

                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 max-[767px]:w-9 max-[767px]:h-9 max-[767px]:rounded-lg max-[767px]:text-sm">
                                    {b.coolieName?.[0] || 'C'}
                                </div>

                                {/* Info block */}
                                <div className="flex-1 min-w-0">
                                    {/* Name + badge row */}
                                    <div className="flex items-center gap-2 flex-wrap mb-1 max-[767px]:gap-1.5 max-[767px]:mb-0.5">
                                        <span className="text-white font-bold max-[767px]:text-sm">{b.coolieName}</span>
                                        <span className="text-slate-500 text-xs font-mono max-[767px]:text-[10px]">#{b.id}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold max-[767px]:text-[10px] max-[767px]:px-1.5 max-[767px]:py-px ${STATUS_COLORS[b.status] || STATUS_COLORS.pending}`}>
                                            {b.status}
                                        </span>
                                    </div>

                                    {/* Meta info */}
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-2 max-[767px]:mt-1 max-[767px]:gap-x-2.5 max-[767px]:gap-y-1">
                                        <span className="flex items-center gap-1 max-[767px]:text-[10px]">
                                            <Calendar size={11} className="max-[767px]:w-2.5 max-[767px]:h-2.5" />
                                            {b.date}{b.time && ` · ${b.time}`}
                                        </span>
                                        <span className="flex items-center gap-1 max-[767px]:text-[10px]">
                                            <MapPin size={11} className="max-[767px]:w-2.5 max-[767px]:h-2.5" />
                                            {b.station}
                                        </span>
                                        <span className="flex items-center gap-1 max-[767px]:text-[10px]">
                                            <Package size={11} className="max-[767px]:w-2.5 max-[767px]:h-2.5" />
                                            {b.luggageCount} bags
                                        </span>
                                    </div>
                                </div>

                                {/* Amount + expand — right side on mobile */}
                                <div className="flex flex-col items-end gap-1 flex-shrink-0 max-[767px]:gap-0.5">
                                    <p className="text-green-400 font-bold text-lg max-[767px]:text-sm max-[767px]:leading-tight">₹{b.amount}</p>
                                    <p className={`text-xs max-[767px]:text-[10px] ${b.paymentStatus === 'paid' ? 'text-green-400' : 'text-orange-400'}`}>
                                        {b.paymentStatus}
                                    </p>
                                    <button
                                        onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                                        className="mt-1 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all max-[767px]:mt-0.5 max-[767px]:p-1"
                                        aria-label="Toggle details"
                                    >
                                        <ChevronDown size={14} className={`transition-transform max-[767px]:w-3 max-[767px]:h-3 ${expanded === b.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* ── Expanded details ── */}
                            {expanded === b.id && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50 max-[767px]:mt-3 max-[767px]:pt-3">
                                    <div className="grid sm:grid-cols-2 gap-4 max-[767px]:gap-3">

                                        {/* Detail pairs */}
                                        <div className="space-y-2 text-sm max-[767px]:space-y-1.5">
                                            {[
                                                { label: 'Platform', val: b.platform },
                                                { label: 'Initial Stn.', val: b.initialStation || 'N/A' },
                                                { label: 'Dest. Stn.', val: b.station || 'N/A' },
                                                { label: 'Train No.', val: b.trainNo },
                                                { label: 'Train Name', val: b.trainName || 'N/A' },
                                            ].map(({ label, val }) => (
                                                <div key={label} className="flex justify-between max-[767px]:text-xs">
                                                    <span className="text-slate-400">{label}</span>
                                                    <span className="text-white">{val}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between max-[767px]:text-xs">
                                                <span className="text-slate-400">OTP</span>
                                                <span className="text-orange-400 font-mono font-bold tracking-widest max-[767px]:tracking-wider">{b.otp}</span>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-col gap-2 max-[767px]:gap-1.5">
                                            {b.paymentStatus !== 'paid' && b.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => navigate('/customer/payment', { state: { booking: b } })}
                                                    className="btn-secondary !bg-green-500/20 !text-green-400 !border-green-500/30 py-2 text-sm flex items-center justify-center gap-2 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:gap-1.5"
                                                >
                                                    <CreditCard size={14} className="max-[767px]:w-3 max-[767px]:h-3" /> Pay Now
                                                </button>
                                            )}
                                            {(b.status === 'confirmed' || b.status === 'pending') && (
                                                <button
                                                    onClick={() => navigate('/customer/track', { state: { bookingId: b.id, booking: b, coolie: { name: b.coolieName, rating: b.coolieRating, totalBookings: b.coolieTrips, badge: b.coolieBadge } } })}
                                                    className="btn-primary py-2 text-sm flex items-center justify-center gap-2 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:gap-1.5"
                                                >
                                                    <Navigation size={14} className="max-[767px]:w-3 max-[767px]:h-3" /> Track Coolie
                                                </button>
                                            )}
                                            {(b.status === 'completed' || b.status === 'confirmed') && (
                                                <button
                                                    onClick={() => navigate(`/customer/receipt/${b.id}`)}
                                                    className="btn-secondary py-2 text-sm flex items-center justify-center gap-2 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:gap-1.5"
                                                >
                                                    <Eye size={14} className="max-[767px]:w-3 max-[767px]:h-3" /> View Receipt
                                                </button>
                                            )}
                                            {b.status === 'completed' && (!b.rating || b.rating === 0) && (
                                                <button
                                                    onClick={() => navigate('/customer/rate', { state: { booking: b } })}
                                                    className="btn-primary py-2 text-sm flex items-center justify-center gap-2 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:gap-1.5"
                                                >
                                                    <Star size={14} className="max-[767px]:w-3 max-[767px]:h-3" /> Rate Coolie
                                                </button>
                                            )}
                                            {b.rating > 0 && (
                                                <div className="flex items-center gap-1 px-3 py-2 bg-yellow-500/10 rounded-xl justify-center max-[767px]:px-2 max-[767px]:py-1.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={14} className={`max-[767px]:w-3 max-[767px]:h-3 ${s <= b.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                                                    ))}
                                                    <span className="text-xs text-slate-400 ml-1 max-[767px]:text-[10px]">You rated {b.rating}/5</span>
                                                </div>
                                            )}
                                            {b.status === 'pending' && (
                                                <button
                                                    onClick={() => toast.error('Booking cancelled')}
                                                    className="btn-danger py-2 text-sm max-[767px]:py-1.5 max-[767px]:text-xs"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
