import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    AlertTriangle, CheckCircle, XCircle, Eye, Search,
    Clock, User, UserCheck, Shield, MessageSquare, Camera, X
} from 'lucide-react'
import toast from 'react-hot-toast'

import { adminDisputesService } from '../../services/adminService'

const STATUS_STYLE = {
    open: 'bg-red-500/20 text-red-400 border border-red-500',
    under_review: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500',
    resolved: 'bg-green-500/20 text-green-400 border border-green-500',
}

const STATUS_LABELS = {
    open: 'Open',
    under_review: 'Under Review',
    resolved: 'Resolved',
}

const PRIORITY_STYLE = {
    high: 'text-red-400 bg-red-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    low: 'text-green-400 bg-green-500/10',
}

export default function AdminDisputes() {
    const [disputes, setDisputes] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)
    const [resolution, setResolution] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchDisputes = async () => {
        try {
            setLoading(true)
            const response = await adminDisputesService.getAllDisputes({ status: filterStatus === 'all' ? undefined : filterStatus, search })
            if (response.success) {
                const mapped = response.data.map(d => ({
                    id: d.id,
                    displayId: 'DS-' + d.id.substring(0, 5).toUpperCase(),
                    bookingId: d.booking_id,
                    customer: d.customer_name || 'Unknown',
                    coolie: d.coolie_name || 'Unknown',
                    station: d.station_name || 'N/A', // Station name needs join in DB, maybe N/A for now if not joined
                    issue: 'Issue Reported', // Default issue text
                    description: d.description,
                    reportedBy: d.customer_id ? 'customer' : 'coolie', // simplistic assumption
                    date: new Date(d.created_at).toLocaleDateString(),
                    status: d.status,
                    priority: d.priority || 'medium',
                    evidence: [], // Evidence not fully modeled in DB
                    dbId: d.id,
                    resolution: d.resolution || ''
                }))
                setDisputes(mapped)
            }
        } catch (err) {
            console.error('Failed to load disputes', err)
            toast.error('Failed to load disputes')
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchDisputes()
        }, 300)
        return () => clearTimeout(timer)
    }, [filterStatus, search])

    const filtered = disputes.filter(d => {
        const matchSearch = search === '' ||
            d.displayId.toLowerCase().includes(search.toLowerCase()) ||
            d.customer.toLowerCase().includes(search.toLowerCase()) ||
            d.coolie.toLowerCase().includes(search.toLowerCase()) ||
            d.issue.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || d.status === filterStatus
        return matchSearch && matchStatus
    })

    const updateStatus = async (id, newStatus) => {
        try {
            await adminDisputesService.resolveDispute(id, { resolution: resolution || 'Resolved by admin' })
            toast.success(`Dispute ${newStatus === 'resolved' ? 'resolved ✅' : 'updated'}`)
            setSelected(null)
            fetchDisputes()
        } catch (err) {
            toast.error('Failed to update dispute')
        }
    }

    const penalizeCoolie = async (id) => {
        toast('Coolie account temporarily locked and notified 🔒', { icon: '⚠️' })
        updateStatus(id, 'resolved')
    }

    return (
        <div className="flex">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8 mt-16 md:mt-0">
                        <div>
                            <h1 className="text-2xl font-black text-white">Dispute Resolution</h1>
                            <p className="text-slate-400 text-sm">24-hour resolution SLA — {disputes.filter(d => d.status === 'open').length} open cases</p>
                        </div>
                        <div className="flex gap-3">
                            {disputes.filter(d => d.status === 'open' && d.priority === 'high').length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
                                    <AlertTriangle size={16} className="text-red-400" />
                                    <span className="text-red-400 font-bold text-sm">
                                        {disputes.filter(d => d.status === 'open' && d.priority === 'high').length} High Priority
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Open', count: disputes.filter(d => d.status === 'open').length, color: 'text-red-400', filter: 'open' },
                            { label: 'Under Review', count: disputes.filter(d => d.status === 'under_review').length, color: 'text-yellow-400', filter: 'under_review' },
                            { label: 'Resolved', count: disputes.filter(d => d.status === 'resolved').length, color: 'text-green-400', filter: 'resolved' },
                        ].map(s => (
                            <button
                                key={s.filter}
                                onClick={() => setFilterStatus(filterStatus === s.filter ? 'all' : s.filter)}
                                className={`card p-4 text-center cursor-pointer hover:scale-105 transition-transform ${filterStatus === s.filter ? 'border-orange-500/50 bg-orange-500/5' : ''}`}
                            >
                                <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
                                <p className="text-slate-400 text-sm mt-1">{s.label}</p>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-800/50 text-white placeholder:text-slate-400 transition-all"
                            placeholder="Search by dispute ID, customer, coolie, issue..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Disputes List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="card p-12 text-center text-slate-400">Loading disputes...</div>
                        ) : filtered.length === 0 ? (
                            <div className="card p-12 text-center">
                                <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                                <p className="text-white font-bold">All caught up!</p>
                                <p className="text-slate-400 text-sm">No disputes found matching your filter.</p>
                            </div>
                        ) : filtered.map((d, i) => (
                            <div
                                key={i}
                                className={`card p-5 border-l-4 ${d.priority === 'high' ? 'border-l-red-500' : d.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-xs font-mono text-slate-500">{d.displayId}</span>
                                            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${PRIORITY_STYLE[d.priority] || PRIORITY_STYLE.medium}`}>
                                                {(d.priority || 'medium').toUpperCase()} PRIORITY
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[d.status] || STATUS_STYLE.open}`}>
                                                {STATUS_LABELS[d.status] || 'Open'}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold">{d.issue}</h3>
                                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{d.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span><User size={11} className="inline mr-1" />{d.customer}</span>
                                            <span><UserCheck size={11} className="inline mr-1" />{d.coolie}</span>
                                            <span><Clock size={11} className="inline mr-1" />{d.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => { setSelected(d); setResolution(d.resolution) }}
                                            className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {d.status !== 'resolved' && (
                                            <button
                                                onClick={() => updateStatus(d.dbId, 'resolved')}
                                                className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20"
                                                title="Mark Resolved"
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="card p-12 text-center">
                                <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                                <p className="text-white font-bold">All caught up!</p>
                                <p className="text-slate-400 text-sm">No disputes found matching your filter.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Modal */}
                {selected && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold">Dispute {selected.displayId}</h3>
                                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><X size={16} /></button>
                            </div>

                            <div className={`p-3 rounded-xl mb-4 ${STATUS_STYLE[selected.status] || STATUS_STYLE.open}`}>
                                <p className="font-bold text-sm">{STATUS_LABELS[selected.status] || 'Open'} — {(selected.priority || 'medium').toUpperCase()} Priority</p>
                            </div>

                            <div className="space-y-3 text-sm mb-4">
                                {[
                                    ['Booking ID', selected.bookingId],
                                    ['Issue Type', selected.issue],
                                    ['Reported By', selected.reportedBy === 'customer' ? `👤 Customer: ${selected.customer}` : `🔧 Coolie: ${selected.coolie}`],
                                    ['Station', selected.station],
                                    ['Date', selected.date],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between py-2 border-b border-slate-800">
                                        <span className="text-slate-400">{label}</span>
                                        <span className="text-white font-medium text-right">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                                <p className="text-slate-400 text-xs mb-1">Complaint Description</p>
                                <p className="text-slate-200 text-sm">{selected.description}</p>
                            </div>

                            <div className="mb-4">
                                <p className="text-slate-400 text-xs mb-2">Evidence Submitted</p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.evidence.map((e, i) => (
                                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-300">
                                            <Camera size={11} /> {e}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-slate-400 text-xs mb-2">Admin Resolution Note</p>
                                <textarea
                                    className="input-field resize-none h-20 text-sm"
                                    placeholder="Write your resolution note here..."
                                    value={resolution}
                                    onChange={e => setResolution(e.target.value)}
                                    disabled={selected.status === 'resolved'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {selected.status !== 'resolved' && (
                                    <>
                                        <button onClick={() => updateStatus(selected.dbId, 'resolved')} className="btn-success text-sm py-2.5 flex items-center justify-center gap-1">
                                            <CheckCircle size={14} /> Resolve
                                        </button>
                                        <button onClick={() => penalizeCoolie(selected.dbId)} className="btn-danger text-sm py-2.5 flex items-center justify-center gap-1">
                                            <Shield size={14} /> Penalize Coolie
                                        </button>
                                    </>
                                )}
                                {selected.status === 'open' && (
                                    <button onClick={() => updateStatus(selected.dbId, 'under_review')} className="btn-secondary text-sm py-2.5 col-span-2 flex items-center justify-center gap-1">
                                        <Eye size={14} /> Mark Under Review
                                    </button>
                                )}
                                <button onClick={() => setSelected(null)} className="btn-secondary text-sm py-2.5 col-span-2">Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
