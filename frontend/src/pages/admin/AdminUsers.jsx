import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Filter, UserX, UserCheck, Eye, Mail, Phone, MapPin, Star, Download, X } from 'lucide-react'
import toast from 'react-hot-toast'

const USERS = [
    { id: 'U-001', name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543210', city: 'Delhi', bookings: 12, rating: 4.8, joined: '12 Jan 2024', status: 'active', firstBooking: true },
    { id: 'U-002', name: 'Rajesh Gupta', email: 'rajesh@email.com', phone: '9812345678', city: 'Mumbai', bookings: 7, rating: 4.5, joined: '23 Feb 2024', status: 'active', firstBooking: false },
    { id: 'U-003', name: 'Anita Patel', email: 'anita@yahoo.com', phone: '9023456789', city: 'Ahmedabad', bookings: 3, rating: 5.0, joined: '5 Mar 2024', status: 'active', firstBooking: false },
    { id: 'U-004', name: 'Vikram Singh', email: 'vikram@gmail.com', phone: '8834567890', city: 'Jaipur', bookings: 1, rating: null, joined: '18 Apr 2024', status: 'active', firstBooking: true },
    { id: 'U-005', name: 'Meena Devi', email: 'meena@outlook.com', phone: '9745678901', city: 'Patna', bookings: 0, rating: null, joined: '2 May 2024', status: 'suspended', firstBooking: false },
    { id: 'U-006', name: 'Suresh Reddy', email: 'suresh@gmail.com', phone: '9856789012', city: 'Hyderabad', bookings: 18, rating: 4.6, joined: '14 Jun 2024', status: 'active', firstBooking: false },
    { id: 'U-007', name: 'Kavitha Nair', email: 'kavita@gmail.com', phone: '9967890123', city: 'Kochi', bookings: 5, rating: 4.9, joined: '28 Jul 2024', status: 'active', firstBooking: false },
    { id: 'U-008', name: 'Arun Kumar', email: 'arun@gmail.com', phone: '7801234567', city: 'Chennai', bookings: 2, rating: 4.0, joined: '10 Aug 2024', status: 'banned', firstBooking: false },
]

export default function AdminUsers() {
    const [users, setUsers] = useState(USERS)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selected, setSelected] = useState(null)

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.id.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'all' || u.status === filterStatus
        return matchSearch && matchStatus
    })

    const toggleSuspend = (id) => {
        setUsers(prev => prev.map(u => {
            if (u.id !== id) return u
            const newStatus = u.status === 'suspended' ? 'active' : 'suspended'
            toast(newStatus === 'suspended' ? `User ${u.name} suspended` : `User ${u.name} reinstated`, { icon: newStatus === 'suspended' ? '🔒' : '✅' })
            return { ...u, status: newStatus }
        }))
    }

    const STATUS_BADGE = {
        active: 'status-available',
        suspended: 'status-busy',
        banned: 'status-onduty',
    }

    return (
        <div className="flex">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-white">Manage Users</h1>
                            <p className="text-slate-400 text-sm">{users.length} total registered customers</p>
                        </div>
                        <button onClick={() => toast('CSV download starting...', { icon: '📥' })} className="btn-secondary flex items-center gap-2 text-sm">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <div className="relative flex-1 min-w-48">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                className="input-field pl-10"
                                placeholder="Search by name, email, or ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'active', 'suspended', 'banned'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatus === f ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/50">
                                    <tr className="text-slate-400">
                                        <th className="py-4 px-4 text-left font-semibold">User</th>
                                        <th className="py-4 px-4 text-left font-semibold">Contact</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden md:table-cell">City</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden lg:table-cell">Bookings</th>
                                        <th className="py-4 px-4 text-left font-semibold hidden lg:table-cell">Joined</th>
                                        <th className="py-4 px-4 text-left font-semibold">Status</th>
                                        <th className="py-4 px-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u, i) => (
                                        <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {u.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-semibold leading-tight">{u.name}</p>
                                                        <p className="text-slate-500 text-xs font-mono">{u.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-slate-300 text-xs">{u.email}</p>
                                                <p className="text-slate-500 text-xs">{u.phone}</p>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 text-xs hidden md:table-cell">
                                                <div className="flex items-center gap-1"><MapPin size={11} />{u.city}</div>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <span className="text-white font-bold">{u.bookings}</span>
                                                {u.bookings === 0 && <span className="text-xs text-slate-500 ml-1">trips</span>}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell">{u.joined}</td>
                                            <td className="py-3 px-4">
                                                <span className={STATUS_BADGE[u.status] + ' text-xs'}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelected(u)}
                                                        className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20"
                                                        title="View"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    {u.status !== 'banned' && (
                                                        <button
                                                            onClick={() => toggleSuspend(u.id)}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.status === 'suspended' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                                                            title={u.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                                                        >
                                                            {u.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
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
                            <div className="py-12 text-center text-slate-400">No users found matching your search.</div>
                        )}
                    </div>

                    {/* User Detail Modal */}
                    {selected && (
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="card p-6 max-w-sm w-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-bold">User Details</h3>
                                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"><X size={16} /></button>
                                </div>
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl mx-auto mb-2">
                                        {selected.name[0]}
                                    </div>
                                    <h4 className="text-white font-bold">{selected.name}</h4>
                                    <p className="text-slate-400 text-sm font-mono">{selected.id}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { label: 'Email', value: selected.email, icon: Mail },
                                        { label: 'Phone', value: selected.phone, icon: Phone },
                                        { label: 'City', value: selected.city, icon: MapPin },
                                        { label: 'Total Bookings', value: selected.bookings, icon: null },
                                        { label: 'Rating Given', value: selected.rating ? `${selected.rating} ⭐` : 'N/A', icon: null },
                                        { label: 'Joined', value: selected.joined, icon: null },
                                    ].map((f, i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-800">
                                            <span className="text-slate-400">{f.label}</span>
                                            <span className="text-white font-medium">{f.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-4">
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
