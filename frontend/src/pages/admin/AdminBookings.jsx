import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    Search, Eye, Download, MapPin, Star, Package,
    Clock, X, CheckCircle, AlertTriangle, ChevronDown, ChevronUp,
    User, CreditCard, Calendar, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminBookingsService } from '../../services/adminService'

const STATUS_STYLE = {
    completed: 'status-available',
    active: 'status-onduty',
    pending: 'status-busy',
    cancelled: 'bg-slate-700 text-slate-400 rounded-full px-3 py-1 text-xs font-semibold',
    disputed: 'bg-red-500/20 text-red-400 border border-red-500 rounded-full px-3 py-1 text-xs font-semibold',
}

const STATUS_LABELS = {
    completed: 'Completed',
    active: 'Active',
    pending: 'Pending',
    cancelled: 'Cancelled',
    disputed: 'Disputed',
}

/* ─── Mobile booking card ─── */
function BookingCard({ b, onView }) {
    const [expanded, setExpanded] = useState(false)
    const isDisputed = b.status === 'disputed'

    return (
        <div className={`card mb-3 overflow-hidden ${isDisputed ? 'border border-red-500/30 bg-red-500/5' : ''}`}>
            {/* Main row */}
            <div className="flex items-start gap-3 p-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-white font-mono text-xs font-bold">{b.id}</p>
                        {isDisputed && <AlertTriangle size={12} className="text-red-400 shrink-0" />}
                    </div>
                    <p className="text-slate-300 text-sm font-medium truncate">{b.customer}</p>
                    <p className="text-slate-500 text-xs">{b.date}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={STATUS_STYLE[b.status] || STATUS_STYLE.pending}>
                        {STATUS_LABELS[b.status] || b.status}
                    </span>
                    <p className={`text-sm font-bold ${b.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-green-400'}`}>
                        ₹{b.amount}
                    </p>
                </div>
            </div>

            {/* Quick info strip */}
            <div className="flex items-center gap-3 px-4 pb-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1"><User size={10} />{b.coolie}</span>
                <span className="flex items-center gap-1"><MapPin size={10} />{b.station}</span>
            </div>

            {/* Expand / actions */}
            <div className="border-t border-slate-800 px-4 py-2 flex items-center justify-between">
                <button
                    onClick={() => setExpanded(p => !p)}
                    className="text-slate-400 text-xs flex items-center gap-1"
                >
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expanded ? 'Less' : 'More details'}
                </button>
                <button
                    onClick={() => onView(b)}
                    className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"
                >
                    <Eye size={14} />
                </button>
            </div>

            {expanded && (
                <div className="border-t border-slate-800 px-4 py-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Route</span>
                        <span className="text-white font-medium">
                            {b.initialStation} → {b.station}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Payment</span>
                        <span className="text-white">{b.payment}</span>
                    </div>
                    {isDisputed && (
                        <button
                            onClick={() => toast('Redirecting to disputes...', { icon: '⚠️' })}
                            className="w-full mt-2 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-500/20"
                        >
                            <AlertTriangle size={12} /> Resolve Dispute
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default function AdminBookings() {
    const [bookings, setBookings] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [totalStats, setTotalStats] = useState({ total: 0, completed: 0, active: 0, pending: 0, disputed: 0 })

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const response = await adminBookingsService.getAllBookings({ status: filterStatus, search })
            if (response.success) {
                setBookings(response.data)
                if (filterStatus === 'all' && !search) {
                    const stats = { total: response.data.length, completed: 0, active: 0, pending: 0, disputed: 0 }
                    response.data.forEach(b => { if (stats[b.status] !== undefined) stats[b.status]++ })
                    setTotalStats(stats)
                }
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load bookings')
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        const timer = setTimeout(fetchBookings, 300)
        return () => clearTimeout(timer)
    }, [filterStatus, search])

    const filtered = bookings
    const totalRevenue = filtered.filter(b => b.status === 'completed').reduce((a, b) => a + b.amount, 0)

    const statCards = [
        { label: 'Total', count: totalStats.total, color: 'text-white', filter: 'all' },
        { label: 'Completed', count: totalStats.completed, color: 'text-green-400', filter: 'completed' },
        { label: 'Active', count: totalStats.active, color: 'text-orange-400', filter: 'active' },
        { label: 'Pending', count: totalStats.pending, color: 'text-yellow-400', filter: 'pending' },
        { label: 'Disputed', count: totalStats.disputed, color: 'text-red-400', filter: 'disputed' },
    ]

    return (
        <div className="flex min-h-screen">
            <Sidebar role="admin" />

            <div className="w-full md:ml-64 flex-1 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8 mt-16 md:mt-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white">Manage Bookings</h1>
                            <p className="text-slate-400 text-sm">
                                {filtered.length} bookings &nbsp;•&nbsp; ₹{totalRevenue.toLocaleString()} completed revenue
                            </p>
                        </div>
                        <button
                            onClick={() => toast('Downloading report...', { icon: '📥' })}
                            className="btn-secondary flex items-center gap-2 text-sm self-start sm:self-auto"
                        >
                            <Download size={15} />
                            <span>Export</span>
                        </button>
                    </div>

                    {/* ── Stat cards — 2-col on mobile, 5-col on md+ ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-5">
                        {statCards.map(c => (
                            <button
                                key={c.filter}
                                onClick={() => setFilterStatus(c.filter)}
                                className={`card p-3 sm:p-4 text-center hover:scale-105 transition-transform ${filterStatus === c.filter ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                            >
                                <p className={`text-xl sm:text-2xl font-black ${c.color}`}>{c.count}</p>
                                <p className="text-slate-400 text-xs mt-1">{c.label}</p>
                            </button>
                        ))}
                    </div>

                    {/* ── Search ── */}
                    <div className="relative mb-4 sm:mb-5">
                        {/* <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /> */}
                        <input
                            className="input-field pl-9 w-full text-sm"
                            placeholder="Search by booking ID, customer, coolie, station..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* ── Mobile card list (< md) ── */}
                    <div className="md:hidden">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">Loading bookings...</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">No bookings found.</div>
                        ) : (
                            filtered.map((b, i) => (
                                <BookingCard key={i} b={b} onView={setSelected} />
                            ))
                        )}
                    </div>

                    {/* ── Desktop table (≥ md) ── */}
                    <div className="hidden md:block card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/50">
                                    <tr className="text-slate-400">
                                        <th className="py-4 px-4 text-left font-semibold">Booking</th>
                                        <th className="py-4 px-4 text-left font-semibold">Customer</th>
                                        <th className="py-4 px-4 text-left font-semibold">Coolie</th>
                                        <th className="py-4 px-4 text-left font-semibold">Station</th>

                                        <th className="py-4 px-4 text-left font-semibold">Status</th>
                                        <th className="py-4 px-4 text-right font-semibold">Amount</th>
                                        <th className="py-4 px-4 text-right font-semibold">View</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-slate-400">Loading bookings...</td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-slate-400">No bookings found.</td>
                                        </tr>
                                    ) : (
                                        filtered.map((b, i) => (
                                            <tr
                                                key={i}
                                                className={`border-t border-slate-800 hover:bg-slate-800/30 transition-colors ${b.status === 'disputed' ? 'bg-red-500/5' : ''}`}
                                            >
                                                <td className="py-3 px-4">
                                                    <p className="text-white font-mono text-xs font-bold">{b.id}</p>
                                                    <p className="text-slate-500 text-xs">{b.date}</p>
                                                </td>
                                                <td className="py-3 px-4 text-slate-200 max-w-[130px]">
                                                    <span className="truncate block">{b.customer}</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-300 max-w-[120px]">
                                                    <span className="truncate block">{b.coolie}</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-400 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        <span className="truncate max-w-[100px]">{b.station}</span>
                                                    </div>
                                                </td>

                                                <td className="py-3 px-4">
                                                    <span className={STATUS_STYLE[b.status] || STATUS_STYLE.pending}>
                                                        {STATUS_LABELS[b.status] || b.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <p className={`font-bold ${b.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-green-400'}`}>
                                                        ₹{b.amount}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{b.payment}</p>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => setSelected(b)}
                                                        className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center ml-auto hover:bg-blue-500/20"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Detail Modal — bottom sheet on mobile, centered on sm+ ── */}
                    {selected && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <div className={`card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto ${selected.status === 'disputed' ? 'border border-red-500/30' : ''}`}>
                                {/* drag handle */}
                                <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-white font-bold">Booking Details</h3>
                                        {selected.status === 'disputed' && (
                                            <AlertTriangle size={15} className="text-red-400" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Status badge */}
                                <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-800/50">
                                    <span className="text-slate-400 text-sm">Status</span>
                                    <span className={STATUS_STYLE[selected.status] || STATUS_STYLE.pending}>
                                        {STATUS_LABELS[selected.status] || selected.status}
                                    </span>
                                </div>

                                {/* Details list */}
                                <div className="space-y-0 text-sm mb-5">
                                    {[
                                        ['Booking ID', selected.id, null],
                                        ['Customer', selected.customer, <User size={13} />],
                                        ['Coolie', selected.coolie, <User size={13} />],
                                        ['Station', selected.station, <MapPin size={13} />],
                                        ['Route', `${selected.initialStation} → ${selected.station}`, <ArrowRight size={13} />],
                                        ['Amount', `₹${selected.amount}`, null],
                                        ['Payment', selected.payment, <CreditCard size={13} />],
                                        ['Date', selected.date, <Calendar size={13} />],
                                    ].map(([label, value, icon]) => (
                                        <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-800 last:border-0 gap-3">
                                            <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                                                {icon}{label}
                                            </span>
                                            <span className="text-white font-medium text-right truncate">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className={`grid gap-2 ${selected.status === 'disputed' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {selected.status === 'disputed' && (
                                        <button
                                            onClick={() => toast('Redirecting to disputes...', { icon: '⚠️' })}
                                            className="btn-danger text-sm py-2.5 flex items-center justify-center gap-1.5"
                                        >
                                            <AlertTriangle size={14} /> Resolve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="btn-secondary text-sm py-2.5"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}