import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, UserX, UserCheck, Eye, Shield, Star, Download, CheckCircle, XCircle, MapPin, X, Award } from 'lucide-react'
import toast from 'react-hot-toast'

const COOLIES = [
    { id: 'CL-1042', name: 'Ramesh Kumar', phone: '9876543210', station: 'New Delhi', rating: 4.9, trips: 1248, status: 'active', verified: true, joined: '5 Jan 2019', weekRank: 1, badge: 'Star of Week', today: 7 },
    { id: 'CL-2034', name: 'Suresh Yadav', phone: '9812345678', station: 'New Delhi', rating: 4.8, trips: 1102, status: 'active', verified: true, joined: '20 Mar 2019', weekRank: 2, badge: null, today: 5 },
    { id: 'CL-3077', name: 'Mohan Lal', phone: '9023456789', station: 'Mumbai CST', rating: 4.7, trips: 987, status: 'active', verified: true, joined: '12 Jun 2020', weekRank: 3, badge: null, today: 4 },
    { id: 'CL-4011', name: 'Raju Singh', phone: '8734567890', station: 'Howrah', rating: 3.9, trips: 421, status: 'active', verified: true, joined: '7 Sep 2020', weekRank: null, badge: null, today: 2 },
    { id: 'CL-5023', name: 'Santosh P.', phone: '9645678901', station: 'Chennai Central', rating: 4.5, trips: 678, status: 'suspended', verified: false, joined: '18 Dec 2020', weekRank: null, badge: null, today: 0 },
    { id: 'CL-6044', name: 'Dinesh Kumar', phone: '9756789012', station: 'New Delhi', rating: 4.4, trips: 543, status: 'active', verified: true, joined: '3 Feb 2021', weekRank: null, badge: null, today: 6 },
    { id: 'CL-7055', name: 'Vijay T.', phone: '9867890123', station: 'Bangalore', rating: 4.2, trips: 312, status: 'pending_verification', verified: false, joined: '22 May 2021', weekRank: null, badge: null, today: 0 },
]

const STATUS_STYLE = {
    active: 'status-available',
    suspended: 'status-busy',
    pending_verification: 'status-onduty',
}

const STATUS_LABEL = {
    active: 'Active',
    suspended: 'Suspended',
    pending_verification: 'Pending KYC',
}

export default function AdminCoolies() {
    const [coolies, setCoolies] = useState(COOLIES)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)

    const filtered = coolies.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.id.toLowerCase().includes(search.toLowerCase()) ||
            c.station.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || c.status === filterStatus
        return matchSearch && matchStatus
    })

    const verifyKYC = (id) => {
        setCoolies(prev => prev.map(c => c.id === id ? { ...c, verified: true, status: 'active' } : c))
        toast.success('KYC Verified! Coolie is now Active ✅')
        setSelected(null)
    }

    const toggleSuspend = (id) => {
        setCoolies(prev => prev.map(c => {
            if (c.id !== id) return c
            const newStatus = c.status === 'suspended' ? 'active' : 'suspended'
            toast(newStatus === 'suspended' ? 'Coolie suspended' : 'Coolie reinstated', { icon: newStatus === 'suspended' ? '🔒' : '✅' })
            return { ...c, status: newStatus }
        }))
    }

    return (
        <div className="flex">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-white">Manage Coolies</h1>
                            <p className="text-slate-400 text-sm">{coolies.filter(c => c.status === 'active').length} active porters platform-wide</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="card px-4 py-2 text-center">
                                <p className="text-orange-400 font-black text-lg">{coolies.filter(c => c.status === 'pending_verification').length}</p>
                                <p className="text-xs text-slate-400">Pending KYC</p>
                            </div>
                            <button onClick={() => toast('Exporting...', { icon: '📥' })} className="btn-secondary flex items-center gap-2 text-sm">
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <div className="relative flex-1 min-w-48">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input className="input-field pl-10" placeholder="Search by name, ID, station..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'active', 'suspended', 'pending_verification'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {f === 'pending_verification' ? 'Pending KYC' : f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/50">
                                    <tr className="text-slate-400">
                                        <th className="py-4 px-4 text-left font-semibold">Coolie</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden sm:table-cell">Station</th>
                                        <th className="py-4 px-4 text-left font-semibold">Rating</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden lg:table-cell">Trips</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden lg:table-cell">Today</th>
                                        <th className="py-4 px-4 text-left font-semibold">Status</th>
                                        <th className="py-4 px-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((c, i) => (
                                        <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {c.name[0]}
                                                        </div>
                                                        {c.verified && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                <CheckCircle size={10} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-white font-semibold text-sm leading-tight">{c.name}</p>
                                                            {c.weekRank === 1 && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                                                        </div>
                                                        <p className="text-slate-500 text-xs font-mono">{c.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-xs hidden sm:table-cell">
                                                <div className="flex items-center gap-1"><MapPin size={10} />{c.station}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                    <span className="text-white font-bold text-sm">{c.rating}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 font-bold hidden lg:table-cell">{c.trips.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-green-400 font-bold hidden lg:table-cell">{c.today} trips</td>
                                            <td className="py-3 px-4">
                                                <span className={`${STATUS_STYLE[c.status]} text-xs whitespace-nowrap`}>
                                                    {STATUS_LABEL[c.status]}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setSelected(c)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20">
                                                        <Eye size={14} />
                                                    </button>
                                                    {c.status === 'pending_verification' ? (
                                                        <button onClick={() => verifyKYC(c.id)} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20" title="Verify KYC">
                                                            <Shield size={14} />
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => toggleSuspend(c.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.status === 'suspended' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {c.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length === 0 && (
                            <div className="py-12 text-center text-slate-400">No coolies found.</div>
                        )}
                    </div>

                    {/* Detail Modal */}
                    {selected && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="card p-6 max-w-sm w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold">Coolie Details</h3>
                                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><X size={16} /></button>
                                </div>
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-2">
                                        {selected.name[0]}
                                    </div>
                                    <h4 className="text-white font-bold">{selected.name}</h4>
                                    <p className="text-slate-400 text-xs font-mono">{selected.id}</p>
                                    {selected.verified ? (
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <Shield size={12} className="text-blue-400" />
                                            <span className="text-blue-400 text-xs">KYC Verified</span>
                                        </div>
                                    ) : (
                                        <span className="text-red-400 text-xs">⚠️ KYC Pending</span>
                                    )}
                                </div>
                                <div className="space-y-2 text-sm">
                                    {[
                                        ['Phone', selected.phone],
                                        ['Station', selected.station],
                                        ['Rating', `${selected.rating} ⭐`],
                                        ['Total Trips', selected.trips.toLocaleString()],
                                        ['Joined', selected.joined],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex justify-between py-2 border-b border-slate-800">
                                            <span className="text-slate-400">{label}</span>
                                            <span className="text-white">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    {selected.status === 'pending_verification' && (
                                        <button onClick={() => verifyKYC(selected.id)} className="btn-success flex-1 text-sm py-2 flex items-center justify-center gap-1">
                                            <Shield size={14} /> Verify KYC
                                        </button>
                                    )}
                                    <button onClick={() => { toggleSuspend(selected.id); setSelected(null) }} className="btn-danger flex-1 text-sm py-2">
                                        {selected.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                                    </button>
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
