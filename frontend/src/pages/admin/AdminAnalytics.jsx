import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, Download, Calendar, IndianRupee, Users, Star, BookOpen, HardHat } from 'lucide-react'
import toast from 'react-hot-toast'

const MONTHLY_REVENUE = [
    { month: 'Sep', revenue: 82000, bookings: 1240, coolies: 2890 },
    { month: 'Oct', revenue: 94000, bookings: 1480, coolies: 3020 },
    { month: 'Nov', revenue: 88000, bookings: 1380, coolies: 3100 },
    { month: 'Dec', revenue: 1_18000, bookings: 1920, coolies: 3340 },
    { month: 'Jan', revenue: 1_28000, bookings: 2150, coolies: 3421 },
    { month: 'Feb', revenue: 1_36000, bookings: 2340, coolies: 3521 },
]

const STATION_BREAKDOWN = [
    { station: 'New Delhi', value: 34 },
    { station: 'Mumbai CST', value: 24 },
    { station: 'Howrah', value: 18 },
    { station: 'Chennai', value: 12 },
    { station: 'Others', value: 12 },
]

const PIE_COLORS = ['#f97316', '#06b6d4', '#22c55e', '#a855f7', '#64748b']

const PAYMENT_METHODS = [
    { method: 'UPI', pct: 48, color: '#f97316' },
    { method: 'Card', pct: 22, color: '#06b6d4' },
    { method: 'Cash', pct: 18, color: '#22c55e' },
    { method: 'Wallet', pct: 12, color: '#a855f7' },
]

const HOURLY_PATTERN = [
    { hour: '6AM', demand: 20 }, { hour: '8AM', demand: 75 },
    { hour: '10AM', demand: 60 }, { hour: '12PM', demand: 45 },
    { hour: '2PM', demand: 80 }, { hour: '4PM', demand: 70 },
    { hour: '6PM', demand: 90 }, { hour: '8PM', demand: 55 },
    { hour: '10PM', demand: 30 }, { hour: '12AM', demand: 10 },
]

const PEAK_STATIONS = [
    { station: 'New Delhi', bookings: 14820, revenue: '₹13.4L', growth: '+18%' },
    { station: 'Mumbai CST', bookings: 10241, revenue: '₹9.2L', growth: '+12%' },
    { station: 'Howrah', bookings: 7824, revenue: '₹7.1L', growth: '+9%' },
    { station: 'Chennai', bookings: 5124, revenue: '₹4.6L', growth: '+15%' },
    { station: 'Bangalore', bookings: 4230, revenue: '₹3.8L', growth: '+22%' },
]

export default function AdminAnalytics() {
    const [period, setPeriod] = useState('monthly')

    const totalRevenue = MONTHLY_REVENUE.reduce((a, d) => a + d.revenue, 0)
    const totalBookings = MONTHLY_REVENUE.reduce((a, d) => a + d.bookings, 0)

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
                            { label: 'Total Revenue (6M)', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, sub: '↑ 22% vs last period', icon: IndianRupee, color: 'from-green-500 to-emerald-500' },
                            { label: 'Total Bookings (6M)', value: totalBookings.toLocaleString(), sub: '↑ 34% growth', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
                            { label: 'Active Coolies', value: '3,521', sub: '↑ 631 past 6 months', icon: Users, color: 'from-orange-500 to-amber-500' },
                            { label: 'Platform Avg Rating', value: '4.72', sub: 'Across all stations', icon: Star, color: 'from-yellow-500 to-orange-500' },
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
                            <h2 className="text-white font-bold mb-4">Revenue & Booking Trend (6 Months)</h2>
                            <ResponsiveContainer width="100%" height={230}>
                                <AreaChart data={MONTHLY_REVENUE}>
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
                                        formatter={(val, name) => [name === 'revenue' ? `₹${(val / 1000).toFixed(0)}K` : val, name === 'revenue' ? 'Revenue' : 'Bookings']}
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
                                    <Pie data={STATION_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                        {STATION_BREAKDOWN.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12 }}
                                        formatter={(val) => [`${val}%`, 'Share']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {STATION_BREAKDOWN.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
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
                            <h2 className="text-white font-bold mb-4">Hourly Demand Pattern</h2>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={HOURLY_PATTERN}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12 }}
                                        formatter={(val) => [`${val}%`, 'Demand Index']}
                                    />
                                    <Bar dataKey="demand" radius={[4, 4, 0, 0]}
                                        fill="#f97316"
                                        label={false}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            <p className="text-xs text-slate-500 mt-2">Peak hours: 6PM–8PM (90%) and 2PM–4PM (80%)</p>
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
                                    {PEAK_STATIONS.map((s, i) => (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3 text-slate-500 font-bold">#{i + 1}</td>
                                            <td className="py-3 text-white font-semibold">{s.station}</td>
                                            <td className="py-3 text-slate-200">{s.bookings.toLocaleString()}</td>
                                            <td className="py-3 text-green-400 font-bold">{s.revenue}</td>
                                            <td className="py-3">
                                                <span className="text-green-400 font-bold">{s.growth}</span>
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
