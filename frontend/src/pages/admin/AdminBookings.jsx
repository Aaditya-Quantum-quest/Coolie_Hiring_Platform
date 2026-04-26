import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Eye, Download, MapPin, Star, Package, Clock, Filter, X, CheckCircle, AlertTriangle } from 'lucide-react'
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
                
                // Fetch stats only when viewing 'all' and no search to populate counters
                if (filterStatus === 'all' && !search) {
                    const stats = { total: response.data.length, completed: 0, active: 0, pending: 0, disputed: 0 }
                    response.data.forEach(b => {
                        if (stats[b.status] !== undefined) {
                            stats[b.status]++
                        }
                    })
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
        const timer = setTimeout(() => {
            fetchBookings()
        }, 300)
        return () => clearTimeout(timer)
    }, [filterStatus, search])

    const filtered = bookings

    const totalRevenue = filtered.filter(b => b.status === 'completed').reduce((a, b) => a + b.amount, 0)

    return (
        <div className="flex">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-white">Manage Bookings</h1>
                            <p className="text-slate-400 text-sm">Showing {filtered.length} bookings • ₹{totalRevenue} in completed revenue</p>
                        </div>
                        <button onClick={() => toast('Downloading report...', { icon: '📥' })} className="btn-secondary flex items-center gap-2 text-sm">
                            <Download size={16} /> Export
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {[
                            { label: 'Total', count: totalStats.total, color: 'text-white', filter: 'all' },
                            { label: 'Completed', count: totalStats.completed, color: 'text-green-400', filter: 'completed' },
                            { label: 'Active', count: totalStats.active, color: 'text-red-400', filter: 'active' },
                            { label: 'Pending', count: totalStats.pending, color: 'text-yellow-400', filter: 'pending' },
                            { label: 'Disputed', count: totalStats.disputed, color: 'text-red-400 font-black', filter: 'disputed' },
                        ].map(c => (
                            <button
                                key={c.filter}
                                onClick={() => setFilterStatus(c.filter)}
                                className={`card p-4 text-center cursor-pointer hover:scale-105 transition-transform ${filterStatus === c.filter ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                            >
                                <p className={`text-2xl font-black ${c.color}`}>{c.count}</p>
                                <p className="text-slate-400 text-xs mt-1">{c.label}</p>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input className="input-field pl-10" placeholder="Search by booking ID, customer, coolie, station..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/50">
                                    <tr className="text-slate-400">
                                        <th className="py-4 px-4 text-left font-semibold">Booking</th>
                                        <th className="py-4 px-4 text-left font-semibold">Customer</th>
                                        <th className="py-4 px-4 text-left font-semibold">Coolie</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden md:table-cell">Station</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden lg:table-cell">Luggage</th>
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
                                                <td className="py-3 px-4 text-slate-200">{b.customer}</td>
                                                <td className="py-3 px-4 text-slate-300">{b.coolie}</td>
                                                <td className="py-3 px-4 text-slate-400 text-xs hidden md:table-cell">
                                                    <div className="flex items-center gap-1"><MapPin size={10} />{b.station}</div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-400 text-xs hidden lg:table-cell">
                                                    <div className="flex items-center gap-1"><Package size={10} />{b.luggage}</div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={STATUS_STYLE[b.status] || STATUS_STYLE.pending}>{STATUS_LABELS[b.status] || b.status}</span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <p className={`font-bold ${b.status === 'cancelled' ? 'text-slate-500 line-through' : 'text-green-400'}`}>₹{b.amount}</p>
                                                    <p className="text-xs text-slate-500">{b.payment}</p>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button onClick={() => setSelected(b)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center ml-auto hover:bg-blue-500/20">
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

                    {/* Detail Modal */}
                    {selected && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="card p-6 max-w-md w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold">Booking Details</h3>
                                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><X size={16} /></button>
                                </div>
                                <div className="space-y-3 text-sm">
                                    {[
                                        ['Booking ID', selected.id],
                                        ['Customer', selected.customer],
                                        ['Coolie', selected.coolie],
                                        ['Station', selected.station],
                                        ['From → To', `${selected.from} → ${selected.to}`],
                                        ['Luggage', selected.luggage],
                                        ['Amount', `₹${selected.amount}`],
                                        ['Payment', selected.payment],
                                        ['Date', selected.date],
                                        ['Status', STATUS_LABELS[selected.status]],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex justify-between py-2 border-b border-slate-800">
                                            <span className="text-slate-400">{label}</span>
                                            <span className="text-white font-medium text-right">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    {selected.status === 'disputed' && (
                                        <button onClick={() => toast('Redirecting to disputes...', { icon: '⚠️' })} className="btn-danger flex-1 text-sm py-2">
                                            Resolve Dispute
                                        </button>
                                    )}
                                    <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm py-2">Close</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
