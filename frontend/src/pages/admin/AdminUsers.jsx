import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Filter, UserX, UserCheck, Eye, Mail, Phone, MapPin, Star, Download, X } from 'lucide-react'
import toast from 'react-hot-toast'

import { adminUsersService } from '../../services/adminService'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [banModalOpen, setBanModalOpen] = useState(false)
    const [banReason, setBanReason] = useState('')
    const [targetUser, setTargetUser] = useState(null)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await adminUsersService.getAllCustomers()
            if (res && res.success && Array.isArray(res.data)) {
                const mapped = res.data.map(u => ({
                    id: u.id,
                    displayId: 'U-' + String(u.id || '').substring(0, 5).toUpperCase(),
                    name: u.name || 'Unknown User',
                    email: u.email || 'N/A',
                    phone: u.phone || 'N/A',
                    city: u.city || 'N/A',
                    bookings: u.total_bookings || 0,
                    rating: u.avg_rating || null,
                    joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
                    status: u.is_banned ? 'banned' : (u.is_active ? 'active' : 'suspended'),
                    photo: u.profile_photo_url,
                    bannedReason: u.banned_reason
                }))
                setUsers(mapped)
            } else {
                console.warn('Unexpected API response structure:', res);
                setUsers([])
            }
        } catch (err) {
            console.error('Failed to load users:', err)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchUsers()
    }, [])

    const filtered = users.filter(u => {
        const searchLower = search.toLowerCase()
        const matchSearch = search === '' ||
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower) ||
            u.displayId.toLowerCase().includes(searchLower) ||
            u.city.toLowerCase().includes(searchLower) ||
            u.status.toLowerCase().includes(searchLower)
            
        const matchStatus = filterStatus === 'all' || u.status === filterStatus
        return matchSearch && matchStatus
    })

    const handleBanToggle = async (user) => {
        if (user.status === 'banned') {
            if (!window.confirm(`Are you sure you want to unban ${user.name}?`)) return;
            try {
                await adminUsersService.banCustomer(user.id, { ban: false })
                toast.success('User reinstated successfully')
                fetchUsers()
                if (selected?.id === user.id) setSelected(null)
            } catch (err) {
                toast.error('Failed to unban user')
            }
        } else {
            setTargetUser(user)
            setBanModalOpen(true)
        }
    }

    const confirmBan = async () => {
        if (!banReason || banReason.trim().length < 5) {
            toast.error('Please provide a reason (min 5 chars)')
            return
        }
        try {
            await adminUsersService.banCustomer(targetUser.id, { ban: true, reason: banReason })
            toast.success(`User ${targetUser.name} has been banned`)
            setBanModalOpen(false)
            setBanReason('')
            setTargetUser(null)
            fetchUsers()
            if (selected?.id === targetUser.id) setSelected(null)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to ban user')
        }
    }

    const STATUS_BADGE = {
        active: 'status-available',
        suspended: 'status-busy',
        banned: 'status-onduty',
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8 mt-16 md:mt-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white">Manage Users</h1>
                            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{users.length} total registered customers</p>
                        </div>
                        <button
                            onClick={() => toast('CSV download starting...', { icon: '📥' })}
                            className="btn-secondary flex items-center gap-2 text-xs sm:text-sm self-start sm:self-auto px-3 py-2"
                        >
                            <Download size={15} /> Export CSV
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
                        <div className="relative flex-1 min-w-0">
                            <input
                                className="input-field pl-9 w-full text-sm"
                                placeholder="Search by name, email, or ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Status filter pills — scroll horizontally on xs */}
                        <div className="flex gap-2 overflow-x-auto pb-0.5 sm:pb-0 shrink-0">
                            {['all', 'active', 'suspended', 'banned'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${filterStatus === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[560px]">
                                <thead className="bg-slate-800/50">
                                    <tr className="text-slate-400">
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm">User</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm">Contact</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm hidden md:table-cell">City</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm hidden lg:table-cell">Bookings</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm hidden lg:table-cell">Rating</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm hidden lg:table-cell">Joined</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-left font-semibold text-xs sm:text-sm">Status</th>
                                        <th className="py-3 sm:py-4 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="8" className="py-12 text-center text-slate-400 text-sm">Loading users...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="8" className="py-12 text-center text-slate-400 text-sm">No users found.</td></tr>
                                    ) : (
                                        filtered.map((u, i) => (
                                            <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                                {/* User */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        {u.photo ? (
                                                            <img src={u.photo} alt={u.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shrink-0 border border-slate-700" />
                                                        ) : (
                                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                                {u.name[0]}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-white font-semibold leading-tight text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[140px]">{u.name}</p>
                                                            <p className="text-slate-500 text-[10px] font-mono">{u.displayId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Contact */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                                    <p className="text-slate-300 text-[11px] sm:text-xs truncate max-w-[120px] sm:max-w-none">{u.email}</p>
                                                    <p className="text-slate-500 text-[10px] sm:text-xs">{u.phone}</p>
                                                </td>
                                                {/* City — hidden on mobile */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-400 text-xs hidden md:table-cell">
                                                    <div className="flex items-center gap-1"><MapPin size={11} />{u.city}</div>
                                                </td>
                                                {/* Bookings — hidden on mobile/tablet */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4 hidden lg:table-cell">
                                                    <span className="text-white font-bold text-sm">{u.bookings}</span>
                                                    {u.bookings === 0 && <span className="text-xs text-slate-500 ml-1">trips</span>}
                                                </td>
                                                {/* Rating — hidden on mobile/tablet */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4 hidden lg:table-cell">
                                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                                        <Star size={12} fill="currentColor" />
                                                        {u.rating || '0.0'}
                                                    </div>
                                                </td>
                                                {/* Joined — hidden on mobile/tablet */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-500 text-xs hidden lg:table-cell">{u.joined}</td>
                                                {/* Status */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                                    <span className={STATUS_BADGE[u.status] + ' text-[10px] sm:text-xs'}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                {/* Actions */}
                                                <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                                                    <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                                        <button
                                                            onClick={() => setSelected(u)}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"
                                                            title="View"
                                                        >
                                                            <Eye size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBanToggle(u)}
                                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${u.status === 'banned' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                                            title={u.status === 'banned' ? 'Unban User' : 'Ban User'}
                                                        >
                                                            {u.status === 'banned' ? <UserCheck size={13} /> : <UserX size={13} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* User Detail Modal */}
                    {selected && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                            <div className="card p-4 sm:p-6 w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold text-sm sm:text-base">User Details</h3>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="text-center mb-4">
                                    {selected.photo ? (
                                        <img src={selected.photo} alt={selected.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-slate-700 shadow-lg" />
                                    ) : (
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-2">
                                            {selected.name[0]}
                                        </div>
                                    )}
                                    <h4 className="text-white font-bold text-sm sm:text-base">{selected.name}</h4>
                                    <p className="text-slate-400 text-xs font-mono">{selected.displayId}</p>
                                </div>
                                <div className="space-y-1 text-xs sm:text-sm">
                                    {[
                                        { label: 'Email', value: selected.email, icon: Mail },
                                        { label: 'Phone', value: selected.phone, icon: Phone },
                                        { label: 'City', value: selected.city, icon: MapPin },
                                        { label: 'Total Bookings', value: selected.bookings, icon: null },
                                        { label: 'Rating Given', value: selected.rating ? `${selected.rating} ⭐` : 'N/A', icon: null },
                                        { label: 'Joined', value: selected.joined, icon: null },
                                        ...(selected.status === 'banned' ? [{ label: 'Ban Reason', value: selected.bannedReason || 'No reason provided', icon: null }] : []),
                                    ].map((f, i) => (
                                        <div key={i} className={`flex justify-between py-2 border-b border-slate-800 gap-2 ${f.label === 'Ban Reason' ? 'flex-col' : 'items-center'}`}>
                                            <span className="text-slate-400 shrink-0">{f.label}</span>
                                            <span className={`text-white font-medium text-right break-all ${f.label === 'Ban Reason' ? 'text-red-400 bg-red-500/10 p-2 rounded-lg mt-1 text-left break-words' : ''}`}>{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 sm:gap-3 mt-4">
                                    <button
                                        onClick={() => handleBanToggle(selected)}
                                        className={`${selected.status === 'banned' ? 'btn-secondary text-green-400' : 'btn-danger'} flex-1 text-xs sm:text-sm py-2`}
                                    >
                                        {selected.status === 'banned' ? 'Unban User' : 'Ban User'}
                                    </button>
                                    <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-xs sm:text-sm py-2">Close</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ban Reason Modal */}
                    {banModalOpen && targetUser && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4">
                            <div className="card p-4 sm:p-6 w-full max-w-md mx-auto border border-red-500/20 shadow-2xl shadow-red-500/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <UserX size={18} className="text-red-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-white font-bold text-sm sm:text-lg truncate">Ban {targetUser.name}</h3>
                                        <p className="text-slate-400 text-[10px] sm:text-xs">This will restrict account access and notify the user.</p>
                                    </div>
                                </div>

                                <div className="mb-4 sm:mb-6">
                                    <label className="block text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">Reason for Banning</label>
                                    <textarea
                                        className="input-field min-h-[100px] sm:min-h-[120px] py-3 resize-none w-full text-sm"
                                        placeholder="Type the reason here (e.g., Multiple policy violations, Fraudulent activity...)"
                                        value={banReason}
                                        onChange={e => setBanReason(e.target.value)}
                                        autoFocus
                                    />
                                    <p className="text-slate-500 text-[10px] mt-2 italic">* This reason will be sent to the user via email.</p>
                                </div>

                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={() => { setBanModalOpen(false); setBanReason(''); setTargetUser(null); }}
                                        className="btn-secondary flex-1 py-2.5 sm:py-3 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmBan}
                                        className="btn-danger flex-1 py-2.5 sm:py-3 font-bold text-sm"
                                        disabled={banReason.trim().length < 5}
                                    >
                                        Confirm Ban
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