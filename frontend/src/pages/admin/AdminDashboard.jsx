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
import { adminDashboardService, adminUsersService } from '../../services/adminService'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
    active: 'status-onduty',
    pending: 'status-busy',
    completed: 'status-available',
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [liveBookings, setLiveBookings] = useState([])
    const [chartData, setChartData] = useState([])
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeCoolies: 0,
        todayBookings: 0,
        todayRevenue: 0,
        openDisputes: 0,
        avgRating: 0
    })
    const [stationCoverage, setStationCoverage] = useState([])
    const [urgentDisputes, setUrgentDisputes] = useState(0)
    const [pendingCoolies, setPendingCoolies] = useState([])
    const [loading, setLoading] = useState(true)
    const [tick, setTick] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel
                const [statsResponse, bookingsResponse, revenueResponse, coverageResponse, disputesResponse, pendingCooliesResponse] = await Promise.all([
                    adminDashboardService.getStats().catch(() => ({ success: false })),
                    adminDashboardService.getLiveBookings().catch(() => ({ success: false })),
                    adminDashboardService.getRevenueData().catch(() => ({ success: false })),
                    adminDashboardService.getStationCoverage().catch(() => ({ success: false })),
                    adminDashboardService.getUrgentDisputes().catch(() => ({ success: false })),
                    adminUsersService.getPendingCoolies().catch(() => ({ success: false }))
                ]);

                // Update state with fetched data
                if (statsResponse?.success) {
                    setStats({
                        totalUsers: statsResponse.data?.totalUsers || 0,
                        usersToday: statsResponse.data?.usersToday || 0,
                        activeCoolies: statsResponse.data?.activeCoolies || 0,
                        onlineCoolies: statsResponse.data?.onlineCoolies || 0,
                        todayBookings: statsResponse.data?.todayBookings || 0,
                        hourBookings: statsResponse.data?.hourBookings || 0,
                        todayRevenue: statsResponse.data?.todayRevenue || 0,
                        revenueChange: statsResponse.data?.revenueChange || 0,
                        openDisputes: statsResponse.data?.openDisputes || 0,
                        urgentDisputes: statsResponse.data?.urgentDisputes || 0,
                        avgRating: statsResponse.data?.avgRating || 0
                    });
                }

                if (bookingsResponse?.success) {
                    setLiveBookings(bookingsResponse.data || []);
                }

                if (revenueResponse?.success) {
                    setChartData(revenueResponse.data || []);
                }

                if (coverageResponse?.success) {
                    setStationCoverage(coverageResponse.data || []);
                }

                if (disputesResponse?.success) {
                    setUrgentDisputes(disputesResponse.data?.count || 0);
                }

                if (pendingCooliesResponse?.success) {
                    setPendingCoolies(pendingCooliesResponse.data || []);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                toast.error('Failed to load dashboard data');

                // Set fallback data on error
                setStats({
                    totalUsers: 0, usersToday: 0, activeCoolies: 0, onlineCoolies: 0,
                    todayBookings: 0, hourBookings: 0, todayRevenue: 0, revenueChange: 0,
                    openDisputes: 0, urgentDisputes: 0, avgRating: 0
                });
                setLiveBookings([]);
                setChartData([]);
                setStationCoverage([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Set up periodic refresh
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

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


    const STAT_CARDS = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: '+128 today', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Active Coolies', value: stats.activeCoolies.toLocaleString(), change: '↑ 87 online now', icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: "Today's Bookings", value: stats.todayBookings.toLocaleString(), change: '+234 this hour', icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, change: '↑ 12% vs yesterday', icon: IndianRupee, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Open Disputes', value: stats.openDisputes, change: `${urgentDisputes} urgent`, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
        { label: 'Avg Rating', value: `${stats.avgRating.toFixed(2)} ⭐`, change: 'Platform-wide', icon: CheckCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ]

    return (
        <div className="flex min-h-screen">
            <Sidebar role="admin" />

            {/* Main content: offset by sidebar on md+, full width on mobile */}
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2FFF]"></div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8 mt-16 md:mt-0">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black text-white">Admin Dashboard</h1>
                                    <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2 mt-0.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
                                        Live — All systems operational
                                    </p>
                                </div>
                                <div className="flex gap-2 sm:gap-3 flex-wrap">
                                    <button className="btn-secondary flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2">
                                        <Bell size={14} className="sm:w-4 sm:h-4" />
                                        <span>Alerts ({stats.openDisputes})</span>
                                    </button>
                                    <button className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2">
                                        <Shield size={14} className="sm:w-4 sm:h-4" />
                                        <span>System Health</span>
                                    </button>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-4 md:mb-6">
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

                            {/* Stat Cards — 2 cols on xs, 3 on sm, 6 on xl */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
                                {STAT_CARDS.map((s, i) => (
                                    <div key={i} className="card p-3 sm:p-4">
                                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}>
                                            <s.icon size={16} className={`sm:w-[18px] sm:h-[18px] ${s.color}`} />
                                        </div>
                                        <p className="text-lg sm:text-xl font-black text-white leading-tight truncate">{s.value}</p>
                                        <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5 truncate">{s.label}</p>
                                        <p className="text-green-400 text-[10px] sm:text-xs mt-1 font-medium truncate">{s.change}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Live Bookings + Pending Approvals */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">

                                {/* Live Bookings Feed */}
                                <div className="lg:col-span-2 card p-4 sm:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                                            <Activity size={16} className="sm:w-[18px] sm:h-[18px] text-orange-400" />
                                            Live Booking Feed
                                        </h2>
                                        <button
                                            onClick={() => navigate('/admin/bookings')}
                                            className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                        >
                                            View all <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    {/* Scrollable table wrapper for small screens */}
                                    <div className="overflow-x-auto -mx-1 px-1">
                                        <table className="w-full text-xs sm:text-sm min-w-[520px]">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-800">
                                                    <th className="py-2 sm:py-3 text-left font-medium">Booking ID</th>
                                                    <th className="py-2 sm:py-3 text-left font-medium">Customer</th>
                                                    <th className="py-2 sm:py-3 text-left font-medium">Coolie</th>
                                                    <th className="py-2 sm:py-3 text-left font-medium">Station</th>
                                                    <th className="py-2 sm:py-3 text-left font-medium">Status</th>
                                                    <th className="py-2 sm:py-3 text-right font-medium">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {liveBookings.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                                            No live bookings found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredBookings.slice(0, 8).map((b, i) => (
                                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                            <td className="py-2 sm:py-3 font-mono text-slate-400 text-[10px] sm:text-xs">{b.id}</td>
                                                            <td className="py-2 sm:py-3 text-slate-200 font-medium">{b.customer}</td>
                                                            <td className="py-2 sm:py-3 text-slate-300">{b.coolie}</td>
                                                            <td className="py-2 sm:py-3 text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin size={11} className="shrink-0" />
                                                                    <span className="truncate max-w-[80px] sm:max-w-none">{b.station}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-2 sm:py-3">
                                                                <span className={`badge text-[10px] sm:text-xs ${b.status === 'active'
                                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                                    : b.status === 'pending'
                                                                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                                        : 'bg-green-500/20 text-green-400 border-green-500/30'
                                                                    }`}>
                                                                    {b.status === 'active' ? '🔴 Active' : b.status === 'pending' ? '🟡 Pending' : '🟢 Done'}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 sm:py-3 text-right text-green-400 font-bold">₹{b.amount}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Pending Approvals Widget */}
                                <div className="card p-4 sm:p-6 border-orange-500/20 bg-orange-500/5">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <h2 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                                            <Shield size={16} className="sm:w-[18px] sm:h-[18px] text-orange-400" />
                                            Pending Approvals
                                        </h2>
                                        <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-black rounded-md">
                                            {pendingCoolies.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        {pendingCoolies.length === 0 ? (
                                            <div className="text-center py-8 sm:py-10">
                                                <CheckCircle size={32} className="text-green-500/30 mx-auto mb-2" />
                                                <p className="text-slate-500 text-xs">All clear! No pending requests.</p>
                                            </div>
                                        ) : (
                                            pendingCoolies.slice(0, 5).map((pc, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/30 transition-all cursor-pointer group"
                                                    onClick={() => navigate('/admin/coolies')}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {pc.name[0]}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-white font-bold text-xs sm:text-sm group-hover:text-orange-400 transition-colors truncate">{pc.name}</p>
                                                            <p className="text-slate-500 text-[10px] truncate">
                                                                {pc.station_name} • {pc.verification_status === 'level1_approved' ? 'KYC Done' : 'New'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-600 group-hover:text-orange-400 shrink-0 ml-2" />
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {pendingCoolies.length > 5 && (
                                        <button
                                            onClick={() => navigate('/admin/coolies')}
                                            className="w-full py-2.5 sm:py-3 mt-4 text-xs font-bold text-orange-400 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-all"
                                        >
                                            View all {pendingCoolies.length} requests
                                        </button>
                                    ) || pendingCoolies.length > 0 && (
                                        <button
                                            onClick={() => navigate('/admin/coolies')}
                                            className="w-full py-2.5 sm:py-3 mt-4 text-xs font-bold text-orange-400 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-all"
                                        >
                                            Process approvals
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                {[
                                    { label: 'Manage Users', icon: Users, path: '/admin/users', color: 'from-blue-500 to-cyan-500' },
                                    { label: 'Manage Coolies', icon: UserCheck, path: '/admin/coolies', color: 'from-green-500 to-emerald-500' },
                                    { label: 'View Bookings', icon: BookOpen, path: '/admin/bookings', color: 'from-orange-500 to-amber-500' },
                                    { label: 'Analytics', icon: TrendingUp, path: '/admin/analytics', color: 'from-purple-500 to-violet-500' },
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => navigate(action.path)}
                                        className="card p-4 sm:p-5 flex flex-col items-center gap-2 sm:gap-3 hover:scale-105 transition-transform cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                                            <action.icon size={18} className="sm:w-[22px] sm:h-[22px] text-white" />
                                        </div>
                                        <p className="text-white font-semibold text-xs sm:text-sm text-center">{action.label}</p>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}