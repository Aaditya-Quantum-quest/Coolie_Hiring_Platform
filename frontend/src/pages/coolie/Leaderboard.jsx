import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { Star, Award, Trophy, TrendingUp, Medal, MapPin } from 'lucide-react'
import SearchBar from '../../components/ui/SearchBar'

const LEADERBOARD_DATA = [
    { rank: 1, name: 'Ramesh Kumar', id: 'CL-1042', station: 'New Delhi', rating: 4.9, trips: 87, earnings: '₹12,400', badge: '🥇', you: true },
    { rank: 2, name: 'Suresh Yadav', id: 'CL-2034', station: 'New Delhi', rating: 4.8, trips: 79, earnings: '₹10,800', badge: '🥈' },
    { rank: 3, name: 'Mohan Lal', id: 'CL-3077', station: 'New Delhi', rating: 4.7, trips: 71, earnings: '₹9,500', badge: '🥉' },
    { rank: 4, name: 'Raju Singh', id: 'CL-4011', station: 'New Delhi', rating: 4.6, trips: 64, earnings: '₹8,300', badge: '' },
    { rank: 5, name: 'Santosh P.', id: 'CL-5023', station: 'New Delhi', rating: 4.5, trips: 58, earnings: '₹7,600', badge: '' },
    { rank: 6, name: 'Dinesh K.', id: 'CL-6044', station: 'New Delhi', rating: 4.4, trips: 52, earnings: '₹6,900', badge: '' },
    { rank: 7, name: 'Vijay T.', id: 'CL-7055', station: 'New Delhi', rating: 4.3, trips: 47, earnings: '₹6,100', badge: '' },
    { rank: 8, name: 'Anil M.', id: 'CL-8066', station: 'New Delhi', rating: 4.2, trips: 41, earnings: '₹5,400', badge: '' },
    { rank: 9, name: 'Rakesh N.', id: 'CL-9078', station: 'New Delhi', rating: 4.1, trips: 36, earnings: '₹4,700', badge: '' },
    { rank: 10, name: 'Sanjay B.', id: 'CL-0091', station: 'New Delhi', rating: 4.0, trips: 31, earnings: '₹4,000', badge: '' },
]

const STATIONS = ['New Delhi', 'Mumbai CST', 'Chennai Central', 'Howrah', 'Bangalore']

export default function Leaderboard() {
    const [selectedStation, setSelectedStation] = useState('New Delhi')
    const [period, setPeriod] = useState('weekly')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')

    const myRank = LEADERBOARD_DATA.find(d => d.you)

    // Search filters for coolies
    const coolieFilters = [
        { value: 'all', label: 'All Coolies' },
        { value: 'top', label: 'Top Rated' },
        { value: 'active', label: 'Most Active' },
        { value: 'earnings', label: 'Top Earners' }
    ]

    // Filter coolies based on search
    const filteredCoolies = LEADERBOARD_DATA.filter(coolie => {
        const matchesSearch = searchQuery === '' || 
            coolie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.station.toLowerCase().includes(searchQuery.toLowerCase())
        
        if (!matchesSearch) return false

        switch (searchFilter) {
            case 'top':
                return coolie.rating >= 4.7
            case 'active':
                return coolie.trips >= 60
            case 'earnings':
                return parseInt(coolie.earnings.replace(/[₹,]/g, '')) >= 8000
            default:
                return true
        }
    })

    return (
        <div className="flex">
            <Sidebar role="coolie" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
                            <Trophy size={36} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white">Coolie Leaderboard</h1>
                        <p className="text-slate-400 mt-2">Top performers earn Star of the Week badge + ₹100 bonus!</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <SearchBar
                            placeholder="Search coolies by name, ID, station..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onFilter={setSearchFilter}
                            filters={coolieFilters}
                            selectedFilter={searchFilter}
                            showFilters={true}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6 items-center justify-between">
                        <div className="flex gap-2">
                            {['weekly', 'monthly', 'alltime'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                        <select
                            className="input-field w-auto text-sm"
                            value={selectedStation}
                            onChange={e => setSelectedStation(e.target.value)}
                        >
                            {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* My Position Banner */}
                    {myRank && (
                        <div className="card p-5 mb-6 bg-gradient-to-r from-orange-500/20 to-amber-500/10 border-orange-500/40">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                                    <Star size={28} className="text-white fill-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-orange-400 font-bold text-sm">Your Position This Week</p>
                                    <p className="text-white font-black text-xl">Rank #{myRank.rank} — Star of the Week!</p>
                                    <p className="text-slate-400 text-sm">{myRank.trips} trips • {myRank.earnings} earned • {myRank.rating}⭐</p>
                                </div>
                                <div className="text-5xl">{myRank.badge}</div>
                            </div>
                        </div>
                    )}

                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 0, 2].map(idx => {
                            const p = LEADERBOARD_DATA[idx]
                            const heights = ['h-32', 'h-40', 'h-28']
                            const actualHeights = [heights[1], heights[0], heights[2]]
                            return (
                                <div key={p.rank} className={`card p-4 text-center flex flex-col items-center justify-end ${actualHeights[idx]} ${p.you ? 'border-orange-500/50 bg-orange-500/5' : ''}`}>
                                    <div className="text-3xl mb-1">{p.badge || `#${p.rank}`}</div>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-2 ${idx === 0 ? 'bg-gradient-to-br from-gold-500 to-yellow-400 bg-yellow-500' : idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-amber-700 to-amber-800'}`}>
                                        {p.name[0]}
                                    </div>
                                    <p className="text-white font-bold text-xs leading-tight">{p.name}</p>
                                    {p.you && <span className="text-orange-400 text-xs font-bold">(You)</span>}
                                    <p className="text-slate-400 text-xs">{p.trips} trips</p>
                                    <p className="text-green-400 font-bold text-sm">{p.earnings}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Full Leaderboard Table */}
                    <div className="card p-6">
                        <h2 className="text-white font-bold mb-4">Full Rankings — {selectedStation}</h2>
                        <div className="space-y-2">
                            {filteredCoolies.map((porter, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${porter.you ? 'bg-orange-500/10 border border-orange-500/30' : 'hover:bg-slate-800/50'}`}
                                >
                                    {/* Rank */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${porter.rank === 1 ? 'rank-1 text-white' : porter.rank === 2 ? 'rank-2 text-white' : porter.rank === 3 ? 'rank-3 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                        {porter.badge || porter.rank}
                                    </div>

                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${porter.you ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
                                        {porter.name[0]}
                                    </div>

                                    {/* Name */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-semibold text-sm truncate">{porter.name}</p>
                                            {porter.you && <span className="badge text-xs shrink-0">YOU</span>}
                                            {porter.rank === 1 && <span className="text-yellow-400 text-xs font-bold">⭐ Star</span>}
                                        </div>
                                        <p className="text-slate-500 text-xs">{porter.id}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden sm:flex items-center gap-1 text-yellow-400 shrink-0">
                                        <Star size={12} className="fill-yellow-400" />
                                        <span className="text-sm font-bold">{porter.rating}</span>
                                    </div>
                                    <div className="text-center shrink-0 hidden md:block">
                                        <p className="text-white font-bold text-sm">{porter.trips}</p>
                                        <p className="text-slate-500 text-xs">trips</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-green-400 font-bold text-sm">{porter.earnings}</p>
                                        <p className="text-slate-500 text-xs">earned</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-center">
                            <p className="text-slate-400 text-sm">🏆 Top coolie each week earns a <span className="text-yellow-400 font-bold">Star of the Week 🌟</span> badge + <span className="text-green-400 font-bold">₹100 bonus!</span></p>
                            <p className="text-xs text-slate-500 mt-1">Rankings reset every Monday 12:00 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
