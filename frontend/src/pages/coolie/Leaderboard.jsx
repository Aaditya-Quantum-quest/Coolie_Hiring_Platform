import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Star, Sparkles } from 'lucide-react'
import SearchBar from '../../components/ui/SearchBar'
import { useApp } from '../../context/AppContext'
import { coolieLeaderboardService } from '../../services/coolieService'

export default function Leaderboard() {
    const { user } = useApp()
    const [selectedStation, setSelectedStation] = useState('New Delhi')
    const [period, setPeriod] = useState('weekly')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [leaderboardData, setLeaderboardData] = useState([])
    const [myRank, setMyRank] = useState(null)

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                setLoading(true)
                let response
                if (period === 'weekly') {
                    response = await coolieLeaderboardService.getWeeklyLeaderboard()
                } else if (period === 'monthly') {
                    response = await coolieLeaderboardService.getMonthlyLeaderboard()
                } else {
                    response = await coolieLeaderboardService.getAllTimeLeaderboard()
                }

                if (response.success && response.data) {
                    const transformedData = response.data.leaderboard.map(item => ({
                        rank: item.rank,
                        name: item.name,
                        id: item.coolieCode,
                        station: selectedStation,
                        rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
                        trips: item.weeklyXP || 50,
                        earnings: `₹${(item.weeklyXP * 10).toLocaleString()}`,
                        badge: item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : '',
                        you: item.isMe || false,
                    }))
                    setLeaderboardData(transformedData)
                    setMyRank(response.data.myRank)
                }
            } catch (error) {
                console.error('Error fetching leaderboard data:', error)
                setLeaderboardData([
                    { rank: 1, name: 'Suresh Yadav', id: 'CL-2034', station: 'New Delhi', rating: 4.9, trips: 87, earnings: '₹12,400', badge: '🥇' },
                    { rank: 2, name: 'Mohan Lal', id: 'CL-3077', station: 'New Delhi', rating: 4.8, trips: 79, earnings: '₹10,800', badge: '🥈' },
                    { rank: 3, name: 'Raju Singh', id: 'CL-4011', station: 'New Delhi', rating: 4.7, trips: 71, earnings: '₹9,500', badge: '🥉' },
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboardData()
        const interval = setInterval(fetchLeaderboardData, 60000)
        return () => clearInterval(interval)
    }, [period, selectedStation])

    const STATIONS = ['New Delhi', 'Mumbai CST', 'Chennai Central', 'Howrah', 'Bangalore']

    const leaderboardWithMe = leaderboardData.map(d => ({
        ...d,
        you: !!(user?.coolie_id && d.id === user.coolie_id),
    }))

    const myRankEntry = leaderboardWithMe.find(d => d.you)

    const coolieFilters = [
        { value: 'all', label: 'All Coolies' },
        { value: 'top', label: 'Top Rated' },
        { value: 'active', label: 'Most Active' },
        { value: 'earnings', label: 'Top Earners' },
    ]

    const filteredCoolies = leaderboardWithMe.filter(coolie => {
        const matchesSearch =
            searchQuery === '' ||
            coolie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.station.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false
        switch (searchFilter) {
            case 'top': return coolie.rating >= 4.7
            case 'active': return coolie.trips >= 60
            case 'earnings': return parseInt(coolie.earnings.replace(/[₹,]/g, '')) >= 8000
            default: return true
        }
    })

    // Podium order: 2nd left, 1st center, 3rd right
    const podiumOrder = [1, 0, 2]
    const top3 = leaderboardWithMe.slice(0, 3)

    return (
        <div className="flex" style={{ background: '#0d1117', minHeight: '100vh' }}>
            <Sidebar role="coolie" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6" style={{ background: '#0d1117' }}>
                <div className="max-w-2xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* ── Header ── */}
                            <div className="text-center mb-7">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                    style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}
                                >
                                    <Sparkles size={28} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Coolie Leaderboard</h1>
                                <p className="text-slate-400 mt-1 text-sm">Top performers earn Star of the Week badge + ₹100 bonus!</p>
                            </div>

                            {/* ── Search + Filters row ── */}
                            <div
                                className="flex items-center gap-3 mb-5 p-3 rounded-2xl"
                                style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <div className="relative flex-1 min-w-0">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-800/50 text-white placeholder:text-slate-400 transition-all"
                                        placeholder="Search coolies by name, ID, station..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {/* Filter icon */}
                                <button className="shrink-0 p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                    </svg>
                                </button>
                                {/* Period pills */}
                                <div className="flex gap-1 shrink-0">
                                    {[['weekly', 'Weekly'], ['monthly', 'Monthly'], ['alltime', 'All Time']].map(([val, label]) => (
                                        <button
                                            key={val}
                                            onClick={() => setPeriod(val)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                            style={period === val
                                                ? { background: '#f97316', color: '#fff' }
                                                : { background: 'transparent', color: '#64748b' }
                                            }
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {/* Station dropdown */}
                                <select
                                    className="text-xs font-medium rounded-lg px-3 py-1.5 outline-none shrink-0"
                                    style={{ background: '#1e2535', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
                                    value={selectedStation}
                                    onChange={e => setSelectedStation(e.target.value)}
                                >
                                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* ── My Position Banner ── */}
                            {myRankEntry && (
                                <div
                                    className="flex items-center gap-4 p-4 rounded-2xl mb-5"
                                    style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                                        <Star size={22} className="text-white fill-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-orange-400 font-bold text-xs uppercase tracking-wide">Your Position This Week</p>
                                        <p className="text-white font-black text-lg">Rank #{myRankEntry.rank}</p>
                                        <p className="text-slate-400 text-xs">{myRankEntry.trips} trips · {myRankEntry.earnings} earned · {myRankEntry.rating}⭐</p>
                                    </div>
                                </div>
                            )}

                            {/* ── Podium ── */}
                            {top3.length >= 3 && (
                                <div className="flex items-end justify-center gap-3 mb-6" style={{ minHeight: 220 }}>
                                    {podiumOrder.map((idx, col) => {
                                        const p = top3[idx]
                                        if (!p) return null
                                        const isFirst = p.rank === 1
                                        const isSecond = p.rank === 2
                                        const isThird = p.rank === 3

                                        // Avatar color: #1 and #3 = orange, #2 = dark slate
                                        const avatarBg = isSecond
                                            ? 'linear-gradient(135deg,#334155,#1e293b)'
                                            : 'linear-gradient(135deg,#f97316,#ea580c)'

                                        const rankBadgeStyle = {
                                            background: '#f97316',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: 22,
                                            height: 22,
                                            fontSize: 11,
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            top: -11,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            boxShadow: '0 2px 8px rgba(249,115,22,0.5)',
                                        }

                                        return (
                                            <div
                                                key={p.rank}
                                                className="relative flex flex-col items-center text-center"
                                                style={{
                                                    flex: isFirst ? '0 0 180px' : '0 0 140px',
                                                    paddingTop: isFirst ? 0 : 32,
                                                }}
                                            >
                                                <div
                                                    className="relative flex flex-col items-center justify-center rounded-2xl p-4 w-full"
                                                    style={{
                                                        background: '#161b27',
                                                        border: isFirst ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(255,255,255,0.07)',
                                                        paddingTop: isFirst ? 28 : 20,
                                                        paddingBottom: 18,
                                                    }}
                                                >
                                                    {/* Rank badge on top edge */}
                                                    <div style={rankBadgeStyle}>{p.rank}</div>

                                                    {/* Star icon top-right (only #1) */}
                                                    {isFirst && (
                                                        <div style={{ position: 'absolute', top: 10, right: 12 }}>
                                                            <Star size={14} style={{ color: '#f97316' }} />
                                                        </div>
                                                    )}

                                                    {/* Avatar circle */}
                                                    <div
                                                        className="flex items-center justify-center font-black text-white mb-3"
                                                        style={{
                                                            width: isFirst ? 72 : 52,
                                                            height: isFirst ? 72 : 52,
                                                            borderRadius: '50%',
                                                            background: avatarBg,
                                                            fontSize: isFirst ? 26 : 20,
                                                            boxShadow: isFirst ? '0 4px 20px rgba(249,115,22,0.4)' : 'none',
                                                        }}
                                                    >
                                                        {p.name[0]}
                                                    </div>

                                                    {/* Name */}
                                                    <p className="font-black text-white mb-0.5" style={{ fontSize: isFirst ? 15 : 12 }}>
                                                        {p.name}
                                                    </p>
                                                    {p.you && <span className="text-orange-400 text-xs font-bold">(You)</span>}

                                                    {/* Trips */}
                                                    <p className="text-slate-500 mb-2" style={{ fontSize: 11 }}>{p.trips} trips</p>

                                                    {/* Earnings pill */}
                                                    <div
                                                        className="font-bold"
                                                        style={{
                                                            fontSize: isFirst ? 13 : 12,
                                                            color: '#4ade80',
                                                            background: 'rgba(74,222,128,0.08)',
                                                            border: '1px solid rgba(74,222,128,0.2)',
                                                            borderRadius: 8,
                                                            padding: '3px 12px',
                                                        }}
                                                    >
                                                        {p.earnings}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* ── Full Rankings Table ── */}
                            <div
                                className="rounded-2xl p-5"
                                style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-white font-bold text-base">Full Rankings</h2>
                                    <span className="text-slate-500 text-sm">|</span>
                                    <span className="text-slate-400 text-sm">{selectedStation}</span>
                                </div>

                                <div className="space-y-2">
                                    {filteredCoolies.map((porter, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                                            style={porter.you
                                                ? { background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)' }
                                                : { background: 'transparent' }
                                            }
                                        >
                                            {/* Rank badge */}
                                            {porter.rank === 1 ? (
                                                <div
                                                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                                                >
                                                    <Star size={14} className="text-white fill-white" />
                                                </div>
                                            ) : (
                                                <div
                                                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                                                    style={{ background: '#1e2535', color: '#64748b' }}
                                                >
                                                    {porter.rank}
                                                </div>
                                            )}

                                            {/* Avatar */}
                                            <div
                                                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                                style={{
                                                    background: porter.rank === 1
                                                        ? 'linear-gradient(135deg,#f97316,#ea580c)'
                                                        : porter.rank === 3
                                                            ? 'linear-gradient(135deg,#f97316,#c2410c)'
                                                            : 'linear-gradient(135deg,#334155,#1e293b)',
                                                }}
                                            >
                                                {porter.name[0]}
                                            </div>

                                            {/* Name + ID */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-semibold text-sm truncate">{porter.name}</p>
                                                    {porter.rank === 1 && (
                                                        <span
                                                            className="text-xs font-bold px-1.5 py-0.5 rounded"
                                                            style={{ background: 'rgba(249,115,22,0.2)', color: '#f97316', fontSize: 10 }}
                                                        >
                                                            Star
                                                        </span>
                                                    )}
                                                    {porter.you && (
                                                        <span className="text-orange-400 text-xs font-bold">YOU</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-xs">{porter.id}</p>
                                            </div>

                                            {/* Rating */}
                                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                                                <Star size={11} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-yellow-400 text-xs font-bold">{porter.rating}</span>
                                            </div>

                                            {/* Trips */}
                                            <div className="text-center shrink-0 hidden md:block" style={{ minWidth: 36 }}>
                                                <p className="text-white font-bold text-sm">{porter.trips}</p>
                                                <p className="text-slate-500 text-xs">trips</p>
                                            </div>

                                            {/* Earnings */}
                                            <div className="text-right shrink-0">
                                                <p className="text-green-400 font-bold text-sm">{porter.earnings}</p>
                                                <p className="text-slate-500 text-xs">earned</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div
                                    className="mt-5 p-4 rounded-xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <p className="text-slate-400 text-xs">
                                        🏆 Top coolie each week earns a{' '}
                                        <span className="text-yellow-400 font-bold">Star of the Week 🌟</span> badge +{' '}
                                        <span className="text-green-400 font-bold">₹100 bonus!</span>
                                    </p>
                                    <p className="text-slate-600 text-xs mt-1">Rankings reset every Monday 12:00 AM</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}