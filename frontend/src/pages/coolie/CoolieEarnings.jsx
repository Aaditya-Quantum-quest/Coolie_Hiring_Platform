import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { IndianRupee, TrendingUp, Download, Calendar, Award, Star, Clock, Sun, ThumbsUp, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { coolieEarningsService } from '../../services/coolieService'
import { useApp } from '../../context/AppContext'

export default function CoolieEarnings() {
    const { user } = useApp()
    const [period, setPeriod] = useState('weekly')
    const [loading, setLoading] = useState(true)
    const [weeklyData, setWeeklyData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const [transactions, setTransactions] = useState([])
    const [stats, setStats] = useState({
        totalWeek: 0,
        totalMonth: 0,
        totalTrips: 0,
        todayEarnings: 0,
        todayTrips: 0,
        tipsReceived: 0
    })

    // Fetch earnings data
    useEffect(() => {
        const fetchEarningsData = async () => {
            const coolieId = user?.coolie_id || user?.id;
            if (!coolieId || coolieId === 'pending-id') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Fetch all data in parallel
                const [weeklyResponse, monthlyResponse, transactionsResponse, summaryResponse] = await Promise.all([
                    coolieEarningsService.getEarnings(coolieId, 'weekly').catch(() => ({ data: { weeklyData: [], totalWeek: 0, totalTrips: 0 } })),
                    coolieEarningsService.getEarnings(coolieId, 'monthly').catch(() => ({ data: { monthlyData: [], totalMonth: 0 } })),
                    coolieEarningsService.getTransactions(coolieId).catch(() => ({ data: [] })),
                    coolieEarningsService.getWeeklySummary(coolieId).catch(() => ({ data: { todayEarnings: 0, todayTrips: 0, tipsReceived: 0 } }))
                ]);
                
                // Update state with fetched data
                setWeeklyData(weeklyResponse.data?.weeklyData || []);
                setMonthlyData(monthlyResponse.data?.monthlyData || []);
                setTransactions(transactionsResponse.data || []);
                
                setStats({
                    totalWeek: weeklyResponse.data?.totalWeek || 0,
                    totalMonth: monthlyResponse.data?.totalMonth || 0,
                    totalTrips: weeklyResponse.data?.totalTrips || 0,
                    todayEarnings: summaryResponse.data?.todayEarnings || 0,
                    todayTrips: summaryResponse.data?.todayTrips || 0,
                    tipsReceived: summaryResponse.data?.tipsReceived || 0
                });
                
            } catch (error) {
                console.error('Error fetching earnings data:', error);
                toast.error('Failed to load earnings data');
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsData();
        
        // Set up periodic refresh
        const interval = setInterval(fetchEarningsData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [user]);

    const totalWeek = stats.totalWeek
    const totalMonth = stats.totalMonth
    const totalTrips = stats.totalTrips

    const SUMMARY_CARDS = [
        { label: 'This Week', value: `₹${totalWeek.toLocaleString()}`, sub: `${totalTrips} trips`, icon: IndianRupee, color: 'from-green-500 to-emerald-500' },
        { label: 'This Month', value: `₹${totalMonth.toLocaleString()}`, sub: '127 trips', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
        { label: 'Today', value: `₹${stats.todayEarnings.toLocaleString()}`, sub: `${stats.todayTrips} trips`, icon: Sun, color: 'from-orange-500 to-amber-500' },
        { label: 'Tips Received', value: `₹${stats.tipsReceived.toLocaleString()}`, sub: 'This week', icon: ThumbsUp, color: 'from-purple-500 to-violet-500' },
    ]

    return (
        <div className="flex">
            <Sidebar role="coolie" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-5xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2FFF]"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-white">My Earnings</h1>
                                    <p className="text-slate-400 text-sm">Track your income and transactions</p>
                                </div>
                        <button
                            onClick={() => toast('Statement downloaded! 📄', { icon: '📥' })}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Download size={16} /> Download Statement
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {SUMMARY_CARDS.map((c, i) => (
                            <div key={i} className="card p-5">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                                    <c.icon size={24} className="text-white" />
                                </div>
                                <p className="text-2xl font-black text-white">{c.value}</p>
                                <p className="text-slate-400 text-xs mt-1">{c.label}</p>
                                <p className="text-slate-500 text-xs">{c.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-bold">Earnings Overview</h2>
                                <div className="flex gap-2">
                                    {['weekly', 'monthly'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPeriod(p)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                        >
                                            {p.charAt(0).toUpperCase() + p.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={period === 'weekly' ? weeklyData : monthlyData}>
                                    <defs>
                                        <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey={period === 'weekly' ? 'day' : 'week'} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #f97316', borderRadius: 12 }}
                                        labelStyle={{ color: '#f1f5f9' }}
                                        itemStyle={{ color: '#f97316' }}
                                        formatter={(val) => [`₹${val}`, 'Earnings']}
                                    />
                                    <Area type="monotone" dataKey="earnings" stroke="#f97316" fill="url(#earnGrad)" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Trip Stats */}
                        <div className="card p-6">
                            <h2 className="text-white font-bold mb-4">Weekly Trips</h2>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #06b6d4', borderRadius: 12 }}
                                        labelStyle={{ color: '#f1f5f9' }}
                                        itemStyle={{ color: '#06b6d4' }}
                                    />
                                    <Bar dataKey="trips" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Achievement Banner */}
                    <div className="card p-5 mb-6 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-yellow-500/30">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                                <Trophy size={28} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-yellow-400 font-black">Star of the Week!</h3>
                                <p className="text-slate-400 text-sm">You completed 12 trips on Saturday — your best day this week. ₹100 bonus credited!</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-yellow-400 font-black text-2xl">+₹100</p>
                                <p className="text-xs text-slate-400">Weekly Bonus</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="card p-6">
                        <h2 className="text-white font-bold mb-4">Recent Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800">
                                        <th className="py-3 text-left font-medium">Transaction</th>
                                        <th className="py-3 text-left font-medium">Customer</th>
                                        <th className="py-3 text-left font-medium">Method</th>
                                        <th className="py-3 text-left font-medium">Time</th>
                                        <th className="py-3 text-right font-medium">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-400">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((t, i) => (
                                            <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 font-mono text-slate-400 text-xs">{t.id || `TXN${String(i + 1).padStart(3, '0')}`}</td>
                                                <td className="py-3 text-slate-200">{t.customer || 'Customer'}</td>
                                                <td className="py-3">
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-xs">{t.method || 'UPI'}</span>
                                                </td>
                                                <td className="py-3 text-slate-400 text-xs">{t.date || 'Recent'}</td>
                                                <td className="py-3 text-right text-green-400 font-bold">+₹{t.amount || 0}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
