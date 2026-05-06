import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    Search, UserX, UserCheck, Eye, Shield, Star, Download,
    CheckCircle, MapPin, X, Award, Filter, ChevronDown, ChevronUp,
    Phone, Calendar, Activity, Mail, User, Zap, Building2, Landmark, CreditCard, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAssetUrl } from '../../utils/assets';
import { adminUsersService } from '../../services/adminService'
import { useApp } from '../../context/AppContext'

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

/* ─── Compact mobile card ─── */
function CoolieCard({ c, onView, onVerifyKYC, onFinalApprove, onToggleSuspend, onDelete, adminRole }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className="card mb-3 overflow-hidden">
            {/* header row */}
            <div className="flex items-center gap-3 p-4">
                <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                        {c.name[0]}
                    </div>
                    {c.verified && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={10} className="text-white" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                    </div>
                    <p className="text-slate-500 text-xs font-mono">{c.displayId}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`${STATUS_STYLE[c.status] || 'status-busy'} text-xs whitespace-nowrap`}>
                        {STATUS_LABEL[c.status] || c.status}
                    </span>
                    <button
                        onClick={() => setExpanded(p => !p)}
                        className="w-7 h-7 rounded-lg bg-slate-700 text-slate-400 flex items-center justify-center"
                    >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {/* quick info strip */}
            <div className="flex items-center gap-4 px-4 pb-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={10} />{c.station}</span>
                <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" />{c.rating}</span>
                <span>{c.trips.toLocaleString()} trips</span>
            </div>

            {/* expandable actions */}
            {expanded && (
                <div className="border-t border-slate-800 px-4 py-3 flex flex-wrap gap-2">
                    <button
                        onClick={() => onView(c)}
                        className="flex-1 min-w-[80px] py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-500/20"
                    >
                        <Eye size={13} /> View
                    </button>

                    {(c.status === 'pending' || c.status === 'under_review') && adminRole === 'admin' && (
                        <button
                            onClick={() => onVerifyKYC(c.dbId)}
                            className="flex-1 min-w-[80px] py-2 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-500/20"
                        >
                            <Shield size={13} /> KYC
                        </button>
                    )}

                    {c.status === 'level1_approved' && adminRole === 'super_admin' && (
                        <button
                            onClick={() => onFinalApprove(c.dbId)}
                            className="flex-1 min-w-[80px] py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-green-500/20"
                        >
                            <Award size={13} /> Approve
                        </button>
                    )}

                    {(c.status === 'active' || c.status === 'suspended') && (
                        <button
                            onClick={() => onToggleSuspend(c.dbId)}
                            className={`flex-1 min-w-[80px] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 ${c.status === 'suspended' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                        >
                            {c.status === 'suspended' ? <><UserCheck size={13} /> Reinstate</> : <><UserX size={13} /> Suspend</>}
                        </button>
                    )}

                    {adminRole === 'super_admin' && (
                        <button
                            onClick={() => onDelete(c)}
                            className="flex-1 min-w-[80px] py-2 rounded-xl bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1 hover:bg-red-600"
                        >
                            <Trash2 size={13} /> Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default function AdminCoolies() {
    const { user } = useApp()
    const adminRole = user?.adminRole || 'admin'
    const [coolies, setCoolies] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    const fetchCoolies = async () => {
        try {
            setLoading(true)
            const response = await adminUsersService.getAllCoolies({
                status: filterStatus === 'all' ? undefined : filterStatus,
                station: search,
            })
            if (response.success) {
                const mapped = response.data.map(c => ({
                    ...c,
                    displayId: c.coolie_id || 'CL-PENDING',
                    station: c.station_name,
                    rating: parseFloat(c.rating_avg) || 0,
                    trips: c.total_trips || 0,
                    status: c.is_suspended
                        ? 'suspended'
                        : c.verification_status === 'approved'
                            ? 'active'
                            : c.verification_status,
                    verified: c.is_verified,
                    joined: new Date(c.created_at).toLocaleDateString(),
                    dbId: c.id,
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

    const handleViewDetail = async (c) => {
        try {
            setSelected({ ...c, loading: true })
            const res = await adminUsersService.getCoolieDetails(c.dbId)
            if (res.success) {
                setSelected({
                    ...c,
                    ...res.data,
                    loading: false
                })
            }
        } catch (error) {
            toast.error('Failed to load full details')
            setSelected(null)
        }
    }

    React.useEffect(() => {
        const timer = setTimeout(fetchCoolies, 300)
        return () => clearTimeout(timer)
    }, [filterStatus, search])

    const filtered = coolies.filter(c => {
        if (search === '') return true
        const q = search.toLowerCase()
        return (
            c.name.toLowerCase().includes(q) ||
            c.displayId.toLowerCase().includes(q) ||
            c.station.toLowerCase().includes(q)
        )
    })

    const verifyKYC = async (id) => {
        try {
            await adminUsersService.approveCoolieLevel1(id)
            toast.success('KYC Verified! Ready for Level 2 ✅')
            setSelected(null)
            fetchCoolies()
        } catch {
            toast.error('Failed to verify KYC')
        }
    }

    const finalApprove = async (id) => {
        try {
            const res = await adminUsersService.approveCoolieLevel2(id)
            toast.success(`🎉 Approved! Coolie ID ${res.coolie_id} generated.`, { duration: 5000 })
            setSelected(null)
            fetchCoolies()
        } catch {
            toast.error('Final approval failed')
        }
    }

    const toggleSuspend = async (id) => {
        try {
            await adminUsersService.suspendCoolie(id)
            toast.success('Coolie status updated ✅')
            fetchCoolies()
        } catch {
            toast.error('Failed to update coolie status')
        }
    }

    const handleDeleteCoolie = async (c) => {
        if (!window.confirm(`🚨 DANGER: Are you sure you want to PERMANENTLY delete coolie "${c.name}"? This will remove all their bookings, XP, and history. This action cannot be undone.`)) return
        
        try {
            const res = await adminUsersService.deleteCoolie(c.dbId)
            if (res.success) {
                toast.success(res.message)
                setSelected(null)
                fetchCoolies()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete coolie')
        }
    }

    const filterTabs = ['all', 'active', 'suspended', 'pending', 'level1_approved']

    return (
        <div className="flex min-h-screen">
            <Sidebar role="admin" />

            {/* main content — ml-64 on desktop, full width on mobile */}
            <div className="w-full md:ml-64 flex-1 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 mt-16 md:mt-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white">Manage Coolies</h1>
                            <p className="text-slate-400 text-sm">
                                {coolies.filter(c => c.status === 'active').length} active porters platform-wide
                            </p>
                        </div>

                        {/* stat chips + export */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="card px-3 py-2 text-center">
                                <p className="text-orange-400 font-black text-base sm:text-lg leading-tight">
                                    {coolies.filter(c => c.status === 'pending').length}
                                </p>
                                <p className="text-xs text-slate-400">New Requests</p>
                            </div>
                            <div className="card px-3 py-2 text-center">
                                <p className="text-blue-400 font-black text-base sm:text-lg leading-tight">
                                    {coolies.filter(c => c.status === 'level1_approved').length}
                                </p>
                                <p className="text-xs text-slate-400">Verified KYC</p>
                            </div>
                            <button
                                onClick={() => toast('Exporting...', { icon: '📥' })}
                                className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
                            >
                                <Download size={15} />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Search + Filter Row ── */}
                    <div className="mb-4 sm:mb-6 space-y-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-800/50 text-white placeholder:text-slate-400 transition-all"
                                    placeholder="Search by name, ID, station..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {/* mobile filter toggle */}
                            <button
                                onClick={() => setShowFilters(p => !p)}
                                className={`sm:hidden w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${showFilters ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                            >
                                <Filter size={16} />
                            </button>
                        </div>

                        {/* filter chips — always visible on sm+, toggle on mobile */}
                        <div className={`flex gap-2 flex-wrap ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
                            {filterTabs.map(f => (
                                <button
                                    key={f}
                                    onClick={() => { setFilterStatus(f); setShowFilters(false) }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${filterStatus === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {STATUS_LABEL[f] || f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Mobile card list (< md) ── */}
                    <div className="md:hidden">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400 text-sm">Loading coolies...</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-sm">No coolies found.</div>
                        ) : (
                            filtered.map((c, i) => (
                                <CoolieCard
                                    key={i}
                                    c={c}
                                    onView={handleViewDetail}
                                    onVerifyKYC={verifyKYC}
                                    onFinalApprove={finalApprove}
                                    onToggleSuspend={toggleSuspend}
                                    onDelete={handleDeleteCoolie}
                                    adminRole={adminRole}
                                />
                            ))
                        )}
                    </div>

                    {/* ── Desktop / tablet table (≥ md) ── */}
                    <div className="hidden md:block card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/50">
                                    <tr className="text-slate-400">
                                        <th className="py-4 px-4 text-left font-semibold">Coolie</th>
                                        <th className="py-4 px-4 text-left font-semibold">Station</th>
                                        <th className="py-4 px-4 text-left font-semibold">Rating</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden lg:table-cell">Trips</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden xl:table-cell">Today</th>
                                        <th className="py-4 px-4 text-left font-semibold">Status</th>
                                        <th className="py-4 px-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-slate-400">
                                                Loading coolies...
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-slate-400">
                                                No coolies found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((c, i) => (
                                            <tr
                                                key={i}
                                                className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors"
                                            >
                                                {/* Name + avatar */}
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
                                                                <p className="text-white font-semibold text-sm leading-tight">
                                                                    {c.name}
                                                                </p>
                                                            </div>
                                                            <p className="text-slate-500 text-xs font-mono">{c.displayId}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Station */}
                                                <td className="py-3 px-4 text-slate-400 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        <span className="max-w-[120px] truncate">{c.station}</span>
                                                    </div>
                                                </td>

                                                {/* Rating */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                        <span className="text-white font-bold text-sm">{c.rating}</span>
                                                    </div>
                                                </td>

                                                {/* Trips (lg+) */}
                                                <td className="py-3 px-4 text-slate-200 font-bold hidden lg:table-cell">
                                                    {c.trips.toLocaleString()}
                                                </td>

                                                {/* Today (xl+) */}
                                                <td className="py-3 px-4 text-green-400 font-bold hidden xl:table-cell">
                                                    {c.today} trips
                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-4">
                                                    <span className={`${STATUS_STYLE[c.status] || 'status-busy'} text-xs whitespace-nowrap`}>
                                                        {STATUS_LABEL[c.status] || c.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewDetail(c)}
                                                            className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"
                                                            title="View details"
                                                        >
                                                            <Eye size={14} />
                                                        </button>

                                                        {(c.status === 'pending' || c.status === 'under_review') && adminRole === 'admin' && (
                                                            <button
                                                                onClick={() => verifyKYC(c.dbId)}
                                                                className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"
                                                                title="Verify KYC"
                                                            >
                                                                <Shield size={14} />
                                                            </button>
                                                        )}

                                                        {c.status === 'level1_approved' && adminRole === 'super_admin' && (
                                                            <button
                                                                onClick={() => finalApprove(c.dbId)}
                                                                className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center hover:bg-green-500/20"
                                                                title="Final Approval"
                                                            >
                                                                <Award size={14} />
                                                            </button>
                                                        )}

                                                        {(c.status === 'active' || c.status === 'suspended') && (
                                                            <button
                                                                onClick={() => toggleSuspend(c.dbId)}
                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.status === 'suspended' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                                                title={c.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                                                            >
                                                                {c.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                                                            </button>
                                                        )}

                                                        {adminRole === 'super_admin' && (
                                                            <button
                                                                onClick={() => handleDeleteCoolie(c)}
                                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20"
                                                                title="PERMANENT DELETE"
                                                            >
                                                                <Trash2 size={14} />
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

                    {/* ── Detail Modal ── */}
                    {selected && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                            {/* bottom-sheet on mobile, centered card on sm+ */}
                            <div className="card w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto">
                                {/* drag handle — mobile only */}
                                <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold">Coolie Details</h3>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Avatar + name */}
                                <div className="text-center mb-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-2">
                                        {selected.name[0]}
                                    </div>
                                    <h4 className="text-white font-bold">{selected.name}</h4>
                                    <p className="text-slate-400 text-xs font-mono mb-1">{selected.displayId}</p>
                                    {selected.verified ? (
                                        <div className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-full">
                                            <Shield size={11} /> KYC Verified
                                        </div>
                                    ) : (
                                        <span className="text-red-400 text-xs">⚠️ KYC Pending</span>
                                    )}
                                </div>

                                {selected.loading ? (
                                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                        <p className="text-slate-500 text-sm">Loading full profile...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Details grid */}
                                        <div className="grid grid-cols-1 gap-x-6 gap-y-0 text-sm mb-6">
                                            {[
                                                ['Email', selected.email, <Mail size={13} />],
                                                ['Phone', selected.phone, <Phone size={13} />],
                                                ['Alt Phone', selected.alt_phone || 'N/A', <Phone size={13} />],
                                                ['DOB', selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString() : 'N/A', <Calendar size={13} />],
                                                ['Gender', selected.gender, <User size={13} />],
                                                ['Station', `${selected.station_name} (${selected.station_code})`, <MapPin size={13} />],
                                                ['Address', `${selected.address}, ${selected.city}, ${selected.state} - ${selected.pincode}`, <MapPin size={13} />],
                                                ['Age', selected.age, <Activity size={13} />],
                                                ['Languages', Array.isArray(selected.languages_spoken) ? selected.languages_spoken.join(', ') : selected.languages_spoken, <Zap size={13} />],
                                                ['Bank Name', selected.bank_name || 'N/A', <Building2 size={13} />],
                                                ['IFSC', selected.ifsc_code || 'N/A', <Landmark size={13} />],
                                                ['UPI ID', selected.upi_id || 'N/A', <CreditCard size={13} />],
                                                ['Joined', new Date(selected.created_at).toLocaleDateString(), <Calendar size={13} />],
                                            ].map(([label, value, icon]) => (
                                                <div key={label} className="flex justify-between items-start py-2.5 border-b border-slate-800 last:border-0">
                                                    <span className="text-slate-400 flex items-center gap-1.5 shrink-0">{icon}{label}</span>
                                                    <span className="text-white font-medium text-right ml-4">{value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Documents Section */}
                                        <div className="mb-8">
                                            <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                                                <Shield size={14} className="text-orange-400" /> Documents & Photos
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { label: 'Passport Photo', url: selected.passport_photo_url },
                                                    { label: 'Aadhaar Front', url: selected.aadhaar_front_url },
                                                    { label: 'Aadhaar Back', url: selected.aadhaar_back_url },
                                                    { label: 'Secondary ID Front', url: selected.secondary_doc_front_url },
                                                    { label: 'Secondary ID Back', url: selected.secondary_doc_back_url },
                                                ].map((doc, idx) => doc.url && (
                                                    <div key={idx} className="space-y-1.5">
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{doc.label}</p>
                                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block group">
                                                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group-hover:border-orange-500/50 transition-all">
                                                                <img src={getAssetUrl(doc.url)} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            </div>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Action buttons — responsive grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(selected.status === 'pending' || selected.status === 'under_review') && adminRole === 'admin' && (
                                        <button
                                            onClick={() => verifyKYC(selected.dbId)}
                                            className="btn-primary col-span-2 text-sm py-2.5 flex items-center justify-center gap-1.5"
                                        >
                                            <Shield size={14} /> Verify KYC
                                        </button>
                                    )}

                                    {selected.status === 'level1_approved' && adminRole === 'super_admin' && (
                                        <button
                                            onClick={() => finalApprove(selected.dbId)}
                                            className="btn-success col-span-2 text-sm py-2.5 flex items-center justify-center gap-1.5"
                                        >
                                            <Award size={14} /> Final Approve
                                        </button>
                                    )}

                                    <button
                                        onClick={() => { toggleSuspend(selected.dbId); setSelected(null) }}
                                        className={`text-sm py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5 ${selected.status === 'suspended' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'btn-danger'}`}
                                    >
                                        {selected.status === 'suspended'
                                            ? <><UserCheck size={14} /> Reinstate</>
                                            : <><UserX size={14} /> Suspend</>}
                                    </button>

                                    {adminRole === 'super_admin' && (
                                        <button
                                            onClick={() => handleDeleteCoolie(selected)}
                                            className="btn-danger text-sm py-2.5 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Trash2 size={14} /> Permanent Delete
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