import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
    Users, UserCheck, BookOpen, IndianRupee, TrendingUp,
    AlertTriangle, CheckCircle, Clock, Shield, Activity,
    MapPin, Bell, ChevronRight, Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../../components/ui/SearchBar'

const CHART_DATA = [
    { time: '6AM', bookings: 12, revenue: 840 },
    { time: '8AM', bookings: 38, revenue: 2660 },
    { time: '10AM', bookings: 54, revenue: 3780 },
    { time: '12PM', bookings: 67, revenue: 4690 },
    { time: '2PM', bookings: 82, revenue: 5740 },
    { time: '4PM', bookings: 91, revenue: 6370 },
    { time: '6PM', bookings: 78, revenue: 5460 },
    { time: '8PM', bookings: 45, revenue: 3150 },
]

const LIVE_BOOKINGS = [
    { id: 'BK-1901', customer: 'Arjun K.', coolie: 'Ramesh K.', station: 'New Delhi', status: 'active', amount: 90 },
    { id: 'BK-1902', customer: 'Priya M.', coolie: 'Suresh Y.', station: 'Howrah', status: 'pending', amount: 120 },
    { id: 'BK-1903', customer: 'Deepak T.', coolie: 'Mohan L.', station: 'Mumbai CST', status: 'completed', amount: 150 },
    { id: 'BK-1904', customer: 'Sunita R.', coolie: 'Raju S.', station: 'Chennai', status: 'active', amount: 80 },
    { id: 'BK-1905', customer: 'Vikas G.', coolie: 'Dinesh K.', station: 'New Delhi', status: 'pending', amount: 110 },
]

const STATUS_STYLES = {
    active: 'status-onduty',
    pending: 'status-busy',
    completed: 'status-available',
}

const STAT_CARDS = [
    { label: 'Total Users', value: '50,241', change: '+128 today', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Coolies', value: '3,421', change: '↑ 87 online now', icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: "Today's Bookings", value: '1,847', change: '+234 this hour', icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: "Today's Revenue", value: '₹1,28,940', change: '↑ 12% vs yesterday', icon: IndianRupee, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Open Disputes', value: '14', change: '3 urgent', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Avg Rating', value: '4.72 ⭐', change: 'Platform-wide', icon: CheckCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
]

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [liveBookings, setLiveBookings] = useState(LIVE_BOOKINGS)
    const [tick, setTick] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')

    useEffect(() => {
        const t = setInterval(() => setTick(x => x + 1), 5000)
        return () => clearInterval(t)
    }, [])

    // Search filters for bookings
    const bookingFilters = [
        { value: 'all', label: 'All Bookings' },
        { value: 'active', label: 'Active Only' },
        { value: 'pending', label: 'Pending Only' },
        { value: 'completed', label: 'Completed Only' }
    ]

    // Filter bookings based on search
    const filteredBookings = liveBookings.filter(booking => {
        const matchesSearch = searchQuery === '' || 
            booking.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.coolie.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.station.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase())
        
        if (!matchesSearch) return false

        switch (searchFilter) {
            case 'active':
                return booking.status === 'active'
            case 'pending':
                return booking.status === 'pending'
            case 'completed':
                return booking.status === 'completed'
            default:
                return true
        }
    })

    return (
        <div className="flex">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                                Live — All systems operational
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn-secondary flex items-center gap-2 text-sm">
                                <Bell size={16} /> Alerts (3)
                            </button>
                            <button className="btn-primary flex items-center gap-2 text-sm">
                                <Shield size={16} /> System Health
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <SearchBar
                            placeholder="Search bookings, customers, coolies, stations..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onFilter={setSearchFilter}
                            filters={bookingFilters}
                            selectedFilter={searchFilter}
                            showFilters={true}
                        />
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                        {STAT_CARDS.map((s, i) => (
                            <div key={i} className="card p-4">
                                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                                    <s.icon size={18} className={s.color} />
                                </div>
                                <p className="text-xl font-black text-white leading-tight">{s.value}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                                <p className="text-green-400 text-xs mt-1 font-medium">{s.change}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-bold">Today's Booking Activity</h2>
                                <span className="badge text-xs">LIVE</span>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={CHART_DATA}>
                                    <defs>
                                        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #f97316', borderRadius: 12 }}
                                        labelStyle={{ color: '#f1f5f9' }}
                                    />
                                    <Area type="monotone" dataKey="bookings" stroke="#f97316" fill="url(#adminGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Quick Stats Panel */}
                        <div className="space-y-3">
                            <div className="card p-4">
                                <p className="text-slate-400 text-xs mb-1">Platform Commission (Today)</p>
                                <p className="text-3xl font-black gradient-text">₹12,894</p>
                                <p className="text-green-400 text-xs mt-1">↑ 18% vs yesterday</p>
                            </div>
                            <div className="card p-4">
                                <p className="text-slate-400 text-xs mb-2">Station Coverage</p>
                                <div className="space-y-2">
                                    {[
                                        { station: 'New Delhi', coolies: 847, pct: 90 },
                                        { station: 'Mumbai CST', coolies: 612, pct: 72 },
                                        { station: 'Howrah', coolies: 411, pct: 54 },
                                    ].map(s => (
                                        <div key={s.station}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-300">{s.station}</span>
                                                <span className="text-orange-400 font-bold">{s.coolies}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full">
                                                <div className="progress-bar h-1.5 rounded-full" style={{ width: `${s.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card p-4 bg-red-500/5 border-red-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} className="text-red-400" />
                                    <p className="text-red-400 font-bold text-sm">Urgent Disputes</p>
                                </div>
                                <p className="text-2xl font-black text-white">3</p>
                                <button onClick={() => navigate('/admin/disputes')} className="text-xs text-orange-400 mt-2 flex items-center gap-1 hover:text-orange-300">
                                    Review now <ChevronRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Bookings Feed */}
                    <div className="card p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold flex items-center gap-2">
                                <Activity size={18} className="text-orange-400" /> Live Booking Feed
                            </h2>
                            <button onClick={() => navigate('/admin/bookings')} className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
                                View all <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800">
                                        <th className="py-3 text-left font-medium">Booking ID</th>
                                        <th className="py-3 text-left font-medium">Customer</th>
                                        <th className="py-3 text-left font-medium">Coolie</th>
                                        <th className="py-3 text-left font-medium">Station</th>
                                        <th className="py-3 text-left font-medium">Status</th>
                                        <th className="py-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((b, i) => (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 font-mono text-slate-400 text-xs">{b.id}</td>
                                            <td className="py-3 text-slate-200 font-medium">{b.customer}</td>
                                            <td className="py-3 text-slate-300">{b.coolie}</td>
                                            <td className="py-3 text-slate-400 flex items-center gap-1"><MapPin size={12} />{b.station}</td>
                                            <td className="py-3">
                                                <span className={STATUS_STYLES[b.status]}>
                                                    {b.status === 'active' ? '🔴 Active' : b.status === 'pending' ? '🟡 Pending' : '🟢 Done'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-green-400 font-bold">₹{b.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Manage Users', icon: Users, path: '/admin/users', color: 'from-blue-500 to-cyan-500' },
                            { label: 'Manage Coolies', icon: UserCheck, path: '/admin/coolies', color: 'from-green-500 to-emerald-500' },
                            { label: 'View Bookings', icon: BookOpen, path: '/admin/bookings', color: 'from-orange-500 to-amber-500' },
                            { label: 'Analytics', icon: TrendingUp, path: '/admin/analytics', color: 'from-purple-500 to-violet-500' },
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="card p-5 flex flex-col items-center gap-3 hover:scale-105 transition-transform cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                                    <action.icon size={22} className="text-white" />
                                </div>
                                <p className="text-white font-semibold text-sm">{action.label}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
