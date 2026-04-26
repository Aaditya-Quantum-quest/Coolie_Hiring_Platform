import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import { Clock, Star, Download, Search, Filter, ChevronDown, Eye, Calendar, MapPin, Package, Navigation, X, ClipboardList } from 'lucide-react'
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

    React.useEffect(() => {
        axios.get('https://coolie-hiring-platform-backend.onrender.com/api/bookings/my-bookings')
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
            <main className="flex-1 md:ml-64 p-6">
                <div className="pt-12 md:pt-0 mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ClipboardList size={24} className="text-orange-400" /> My Bookings</h1>
                        <p className="text-slate-400 text-sm">View all your coolie booking history</p>
                    </div>
                    <button onClick={() => toast.success('Downloading booking history...')} className="btn-secondary flex items-center gap-2 py-2 text-sm">
                        <Download size={14} /> Export
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                        <input className="input-field pl-9 py-2 text-sm" placeholder="Search booking or coolie..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total', val: bookings.length, color: 'text-white' },
                        { label: 'Completed', val: bookings.filter(b => b.status === 'completed').length, color: 'text-green-400' },
                        { label: 'Pending', val: bookings.filter(b => b.status === 'pending').length, color: 'text-orange-400' },
                        { label: 'Spent', val: `₹${bookings.reduce((a, b) => a + Number(b.amount || 0), 0)}`, color: 'text-blue-400' },
                    ].map(s => (
                        <div key={s.label} className="card p-3 text-center">
                            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-xs text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Bookings List */}
                <div className="space-y-3">
                    {filtered.length === 0 ? (
                        <div className="card p-12 text-center">
                            <p className="text-slate-400">No bookings found</p>
                        </div>
                    ) : filtered.map(b => (
                        <div key={b.id} className="card p-4">
                            <div className="flex items-start gap-4 flex-wrap">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {b.coolieName?.[0] || 'C'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-white font-bold">{b.coolieName}</span>
                                        <span className="text-slate-500 text-xs font-mono">#{b.id}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Calendar size={11} /> {b.date} {b.time && `at ${b.time}`}</span>
                                        <span className="flex items-center gap-1"><MapPin size={11} /> {b.station}</span>
                                        <span className="flex items-center gap-1"><Package size={11} /> {b.luggageCount} bags ({b.luggageSize})</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="text-right">
                                        <p className="text-green-400 font-bold">₹{b.amount}</p>
                                        <p className={`text-xs ${b.paymentStatus === 'paid' ? 'text-green-400' : 'text-orange-400'}`}>{b.paymentStatus}</p>
                                    </div>
                                    <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} className="p-2 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-all">
                                        <ChevronDown size={16} className={`transition-transform ${expanded === b.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {expanded === b.id && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Platform</span><span className="text-white">{b.platform}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Destination</span><span className="text-white">{b.destination}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Train No.</span><span className="text-white">{b.trainNo}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">OTP</span><span className="text-orange-400 font-mono font-bold tracking-widest">{b.otp}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {b.status === 'confirmed' && (
                                                <button onClick={() => navigate('/customer/track')} className="btn-primary py-2 text-sm flex items-center gap-2"><Navigation size={14} /> Track Coolie</button>
                                            )}
                                            {b.status === 'completed' && !b.rating && (
                                                <button onClick={() => navigate('/customer/rate')} className="btn-primary py-2 text-sm flex items-center gap-2"><Star size={14} /> Rate Coolie</button>
                                            )}
                                            {b.rating && (
                                                <div className="flex items-center gap-1 px-3 py-2 bg-yellow-500/10 rounded-xl">
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= b.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />)}
                                                    <span className="text-xs text-slate-400 ml-1">You rated {b.rating}/5</span>
                                                </div>
                                            )}
                                            {b.status === 'pending' && (
                                                <button onClick={() => toast.error('Booking cancelled')} className="btn-danger py-2 text-sm">Cancel Booking</button>
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
