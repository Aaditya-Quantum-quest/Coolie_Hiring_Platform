import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, UserX, UserCheck, Eye, Shield, Star, Download, CheckCircle, XCircle, MapPin, X, Award } from 'lucide-react'
import toast from 'react-hot-toast'

import { adminUsersService } from '../../services/adminService'

const STATUS_STYLE = {
    active: 'status-available',
    approved: 'status-available',
    suspended: 'status-busy',
    pending: 'status-onduty',
    level1_approved: 'status-available',
    under_review: 'status-onduty',
}

const STATUS_LABEL = {
    active: 'Active',
    approved: 'Approved',
    suspended: 'Suspended',
    pending: 'Pending Docs',
    level1_approved: 'KYC Verified',
    under_review: 'Reviewing',
}

export default function AdminCoolies() {
    const [coolies, setCoolies] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchCoolies = async () => {
        try {
            setLoading(true)
            const response = await adminUsersService.getAllCoolies({ status: filterStatus === 'all' ? undefined : filterStatus, station: search })
            if (response.success) {
                const mapped = response.data.map(c => ({
                    id: c.id,
                    displayId: c.coolie_id || 'CL-PENDING',
                    name: c.name,
                    phone: c.phone,
                    station: c.station_name,
                    rating: parseFloat(c.rating_avg) || 0,
                    trips: c.total_trips || 0,
                    status: c.is_suspended ? 'suspended' : (c.verification_status === 'approved' ? 'active' : c.verification_status),
                    verified: c.is_verified,
                    joined: new Date(c.created_at).toLocaleDateString(),
                    badge: c.badge,
                    today: 0,
                    dbId: c.id
                }))
                setCoolies(mapped)
            }
        } catch (error) {
            console.error('Failed to load coolies', error)
            toast.error('Failed to load coolies')
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchCoolies()
        }, 300)
        return () => clearTimeout(timer)
    }, [filterStatus, search])

    const filtered = coolies.filter(c => {
        const matchSearch = search === '' || 
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.displayId.toLowerCase().includes(search.toLowerCase()) ||
            c.station.toLowerCase().includes(search.toLowerCase())
        return matchSearch
    })

    const verifyKYC = async (id) => {
        try {
            await adminUsersService.approveCoolieLevel1(id)
            toast.success('KYC Verified! Ready for Level 2 (Final Approval) ✅')
            setSelected(null)
            fetchCoolies()
        } catch (error) {
            toast.error('Failed to verify KYC')
        }
    }

    const finalApprove = async (id) => {
        try {
            const res = await adminUsersService.approveCoolieLevel2(id)
            toast.success(`🎉 Approved! Coolie ID ${res.coolie_id} generated and emailed.`, { duration: 5000 })
            setSelected(null)
            fetchCoolies()
        } catch (error) {
            toast.error('Final approval failed')
        }
    }

    const toggleSuspend = async (id) => {
        try {
            await adminUsersService.suspendCoolie(id)
            toast.success('Coolie status updated successfully ✅')
            fetchCoolies()
        } catch (error) {
            toast.error('Failed to update coolie status')
        }
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
                                <p className="text-orange-400 font-black text-lg">{coolies.filter(c => c.status === 'pending').length}</p>
                                <p className="text-xs text-slate-400">New Requests</p>
                            </div>
                            <div className="card px-4 py-2 text-center">
                                <p className="text-blue-400 font-black text-lg">{coolies.filter(c => c.status === 'level1_approved').length}</p>
                                <p className="text-xs text-slate-400">Verified KYC</p>
                            </div>
                            <button onClick={() => toast('Exporting...', { icon: '📥' })} className="btn-secondary flex items-center gap-2 text-sm hidden lg:flex">
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
                            {['all', 'active', 'suspended', 'pending', 'level1_approved'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {STATUS_LABEL[f] || f.charAt(0).toUpperCase() + f.slice(1)}
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
                                    {loading ? (
                                        <tr><td colSpan="7" className="py-12 text-center text-slate-400">Loading coolies...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="7" className="py-12 text-center text-slate-400">No coolies found.</td></tr>
                                    ) : (
                                        filtered.map((c, i) => (
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
                                                                {c.badge && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                                                            </div>
                                                            <p className="text-slate-500 text-xs font-mono">{c.displayId}</p>
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
                                                    <span className={`${STATUS_STYLE[c.status] || 'status-busy'} text-xs whitespace-nowrap`}>
                                                        {STATUS_LABEL[c.status] || c.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setSelected(c)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20">
                                                            <Eye size={14} />
                                                        </button>
                                                        {c.status === 'pending' || c.status === 'under_review' ? (
                                                            <button onClick={() => verifyKYC(c.dbId)} className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20" title="Verify KYC">
                                                                <Shield size={14} />
                                                            </button>
                                                        ) : c.status === 'level1_approved' ? (
                                                            <button onClick={() => finalApprove(c.dbId)} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20" title="Final Approval">
                                                                <Award size={14} />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => toggleSuspend(c.dbId)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.status === 'suspended' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                {c.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                                                            </button>
                                                        )}
                                                    </div>
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
                                    <p className="text-slate-400 text-xs font-mono">{selected.displayId}</p>
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
                                    {selected.status === 'pending' || selected.status === 'under_review' ? (
                                        <button onClick={() => verifyKYC(selected.dbId)} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1">
                                            <Shield size={14} /> Verify KYC
                                        </button>
                                    ) : selected.status === 'level1_approved' ? (
                                        <button onClick={() => finalApprove(selected.dbId)} className="btn-success flex-1 text-sm py-2 flex items-center justify-center gap-1">
                                            <Award size={14} /> Final Approve
                                        </button>
                                    ) : null}
                                    <button onClick={() => { toggleSuspend(selected.dbId); setSelected(null) }} className="btn-danger flex-1 text-sm py-2">
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
