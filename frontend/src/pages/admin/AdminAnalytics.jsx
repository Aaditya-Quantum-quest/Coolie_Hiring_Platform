import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Download, Calendar, IndianRupee, Users, Star, BookOpen, HardHat } from 'lucide-react'
import toast from 'react-hot-toast'

import { adminAnalyticsService, adminDashboardService } from '../../services/adminService'

const PIE_COLORS = ['#f97316', '#06b6d4', '#22c55e', '#a855f7', '#64748b']

const PAYMENT_METHODS = [
    { method: 'UPI', pct: 68, color: '#f97316' },
    { method: 'Card', pct: 20, color: '#06b6d4' },
    { method: 'Cash', pct: 12, color: '#22c55e' }
]

export default function AdminAnalytics() {
    const [period, setPeriod] = useState('monthly')
    const [analytics, setAnalytics] = useState({
        total_customers: 0,
        total_coolies: 0,
        total_bookings: 0,
        total_revenue: 0
    })
    const [revenueData, setRevenueData] = useState([])
    const [stationData, setStationData] = useState([])
    const [pieData, setPieData] = useState([])
    const [hourlyPattern, setHourlyPattern] = useState([])

    React.useEffect(() => {
        const fetchAll = async () => {
            try {
                const [statsRes, revRes, stationRes] = await Promise.all([
                    adminAnalyticsService.getAnalytics(),
                    adminAnalyticsService.getRevenueAnalytics(),
                    adminAnalyticsService.getStationPerformance()
                ])
                if (statsRes.success) setAnalytics(statsRes.data)
                
                if (revRes.success) {
                    const mappedRev = revRes.data.map(d => ({
                        month: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        revenue: parseInt(d.revenue),
                        bookings: Math.floor(parseInt(d.revenue) / 100) // mock bookings count
                    }))
                    setRevenueData(mappedRev)
                }

                if (stationRes.success) {
                    const stData = stationRes.data.map(s => ({
                        station: s.name || 'Unknown',
                        bookings: parseInt(s.bookings),
                        revenue: `₹${s.revenue}`,
                        growth: '+10%' // Mock
                    }))
                    setStationData(stData)
                    
                    const totalBks = stData.reduce((a, b) => a + b.bookings, 0)
                    if (totalBks > 0) {
                        setPieData(stData.slice(0, 5).map(s => ({
                            station: s.station,
                            value: Math.round((s.bookings / totalBks) * 100)
                        })))
                    }
                }

                const hourlyRes = await adminDashboardService.getRevenueData()
                if (hourlyRes.data?.success) {
                    const mappedHourly = hourlyRes.data.data.map(d => ({
                        hour: d.time,
                        demand: d.bookings
                    }))
                    setHourlyPattern(mappedHourly)
                }
            } catch (err) {
                console.error('Analytics Error', err)
            }
        }
        fetchAll()
    }, [period])

    const totalRevenue = analytics.total_revenue
    const totalBookings = analytics.total_bookings

    return (
        <div className="flex">
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-white">Analytics & Reports</h1>
                            <p className="text-slate-400 text-sm">Platform-wide insights • Last updated now</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex gap-2">
                                {['weekly', 'monthly', 'yearly'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => toast('Generating PDF report...', { icon: '📊' })} className="btn-secondary flex items-center gap-2 text-sm">
                                <Download size={16} /> Report
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total Revenue (All Time)', value: `₹${(totalRevenue).toLocaleString()}`, sub: 'Platform earnings', icon: IndianRupee, color: 'from-green-500 to-emerald-500' },
                            { label: 'Total Bookings (All Time)', value: parseInt(totalBookings).toLocaleString(), sub: 'Trips completed', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
                            { label: 'Total Coolies', value: parseInt(analytics.total_coolies).toLocaleString(), sub: 'Registered porters', icon: Users, color: 'from-orange-500 to-amber-500' },
                            { label: 'Total Customers', value: parseInt(analytics.total_customers).toLocaleString(), sub: 'Platform users', icon: Star, color: 'from-yellow-500 to-orange-500' },
                        ].map((k, i) => (
                            <div key={i} className="card p-5">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${k.color} flex items-center justify-center mb-3`}>
                                    <k.icon size={24} className="text-white" />
                                </div>
                                <p className="text-2xl font-black text-white">{k.value}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{k.label}</p>
                                <p className="text-green-400 text-xs mt-1">{k.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
                        {/* Revenue Trend */}
                        <div className="lg:col-span-2 card p-6">
                            <h2 className="text-white font-bold mb-4">Revenue Trend</h2>
                            <ResponsiveContainer width="100%" height={230}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                    <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #f97316', borderRadius: 12 }}
                                        labelStyle={{ color: '#f1f5f9' }}
                                        formatter={(val, name) => [name === 'revenue' ? `₹${val}` : val, name === 'revenue' ? 'Revenue' : 'Bookings']}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#f97316" fill="url(#revGrad)" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
                                    <Area yAxisId="right" type="monotone" dataKey="bookings" stroke="#06b6d4" fill="url(#bookGrad)" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Station Share Pie */}
                        <div className="card p-6">
                            <h2 className="text-white font-bold mb-4">Bookings by Station</h2>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12 }}
                                        formatter={(val) => [`${val}%`, 'Share']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {pieData.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className="text-slate-300 flex-1">{s.station}</span>
                                        <span className="text-white font-bold">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Hourly Demand Heatmap */}
                        <div className="card p-6">
                            <h2 className="text-white font-bold mb-4">Today's Hourly Demand</h2>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={hourlyPattern}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12 }}
                                        formatter={(val) => [val, 'Bookings']}
                                    />
                                    <Bar dataKey="demand" radius={[4, 4, 0, 0]}
                                        fill="#f97316"
                                        label={false}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-slate-500 mt-2">Live heatmap of platform traffic</p>
                        </div>

                        {/* Payment Methods */}
                        <div className="card p-6">
                            <h2 className="text-white font-bold mb-4">Payment Method Distribution</h2>
                            <div className="space-y-4">
                                {PAYMENT_METHODS.map((p, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{p.method}</span>
                                            <span className="font-bold" style={{ color: p.color }}>{p.pct}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-3 rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                <p className="text-xs text-orange-400">💡 UPI is the dominant payment method — optimize UPI flow for better conversion</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Stations Table */}
                    <div className="card p-6">
                        <h2 className="text-white font-bold mb-4">Top Performing Stations</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700">
                                        <th className="py-3 text-left font-medium">#</th>
                                        <th className="py-3 text-left font-medium">Station</th>
                                        <th className="py-3 text-left font-medium">Total Bookings</th>
                                        <th className="py-3 text-left font-medium">Revenue (6M)</th>
                                        <th className="py-3 text-left font-medium">MoM Growth</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stationData.map((s, i) => (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 text-slate-500 font-bold">#{i + 1}</td>
                                            <td className="py-3 text-white font-semibold">{s.station}</td>
                                            <td className="py-3 text-slate-200">{s.bookings.toLocaleString()}</td>
                                            <td className="py-3 text-green-400 font-bold">{s.revenue}</td>
                                            <td className="py-3">
                                                <span className={`font-bold ${s.bookings > 10 ? 'text-green-400' : 'text-slate-400'}`}>
                                                    {s.bookings > 10 ? '+10%' : '0%'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
