import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import { Train, Search, Clock, AlertTriangle, CheckCircle, RefreshCw, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

// 2D Train Diagram
function TrainDiagram({ trainNo, trainsList }) {
    const train = trainsList.find(t => t.no === trainNo)
    if (!train) return null

    const coaches = ['Loco', 'A1', 'A2', 'B1', 'B2', 'B3', 'S1', 'S2', 'S3', 'S4', 'S5', 'GN', 'GN', 'Pantry']
    const coachColors = {
        'Loco': '#f97316', 'A1': '#8b5cf6', 'A2': '#8b5cf6',
        'B1': '#06b6d4', 'B2': '#06b6d4', 'B3': '#06b6d4',
        'S1': '#22c55e', 'S2': '#22c55e', 'S3': '#22c55e', 'S4': '#22c55e', 'S5': '#22c55e',
        'GN': '#94a3b8', 'Pantry': '#f59e0b'
    }

    return (
        <div className="card p-4 mb-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Train size={16} className="text-orange-400" /> 2D Train Layout</h3>
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 items-center min-w-max">
                    {coaches.map((c, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div
                                className="rounded-lg text-white text-xs font-bold flex items-center justify-center border-2 border-black/20 cursor-pointer hover:scale-110 transition-transform"
                                style={{
                                    background: coachColors[c] || '#475569',
                                    width: c === 'Loco' ? 52 : 40,
                                    height: 52,
                                    borderRadius: c === 'Loco' ? '8px 20px 20px 8px' : 8,
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed'
                                }}
                                title={c}
                            >{c}</div>
                            <div className="flex gap-1 mt-1">
                                <div className="w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                                <div className="w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                            </div>
                        </div>
                    ))}
                </div>
                {/* Track */}
                <div className="h-1 bg-gradient-to-r from-orange-500/50 via-orange-400 to-orange-500/50 rounded-full mt-1" />
            </div>
            <div className="flex gap-3 flex-wrap mt-3">
                {[['Loco', '#f97316', 'Engine'], ['AC', '#8b5cf6', 'AC Coaches'], ['Sleeper', '#22c55e', 'Sleeper'], ['General', '#94a3b8', 'General'], ['Pantry', '#f59e0b', 'Pantry']].map(([k, c, label]) => (
                    <div key={k} className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
                        <span className="text-slate-400">{label}</span>
                    </div>
                ))}
            </div>
            {train && (
                <div className="mt-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 text-sm">
                    <span className="text-slate-400">Your platform: </span>
                    <span className="text-orange-400 font-bold">Platform {train.platform}</span>
                    <span className="text-slate-400 ml-3">Arrival: </span>
                    <span className="text-white font-semibold">{train.arr}</span>
                </div>
            )}
        </div>
    )
}

export default function TrainStatus() {
    const [searchNo, setSearchNo] = useState('')
    const [searched, setSearched] = useState(null)
    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    const fetchTrains = async () => {
        setLoading(true)
        try {
            const res = await axios.get('https://coolie-hiring-platform-backend.onrender.com/api/config/trains')
            if (res.data.success) {
                setTrains(res.data.trains)
                setLastUpdated(new Date())
            }
        } catch (error) {
            console.error('Error fetching trains:', error)
            toast.error('Failed to load train data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrains()
    }, [])

    const search = async () => {
        if (!searchNo.trim()) return
        setLoading(true)
        await new Promise(r => setTimeout(r, 800))
        const found = trains.find(t => t.no === searchNo.trim() || t.name.toLowerCase().includes(searchNo.toLowerCase()))
        setSearched(found || null)
        if (!found) toast.error('Train not found. Try: 12301, 12001, 12951')
        setLoading(false)
    }

    const refresh = async () => {
        await fetchTrains()
        toast.success('Train data refreshed!')
    }

    const getStatusColor = (s) => s === 'On Time' ? 'text-green-400' : 'text-red-400'
    const getStatusBg = (s) => s === 'On Time' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-6">
                <div className="pt-12 md:pt-0 mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Train size={26} className="text-orange-400" /> Train Status & Platform</h1>
                    <p className="text-slate-400 text-sm">Live train arrivals powered by Railway API</p>
                </div>

                {/* Search */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                            className="input-field pl-10"
                            placeholder="Enter train number (e.g. 12301) or name..."
                            value={searchNo}
                            onChange={e => setSearchNo(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && search()}
                        />
                    </div>
                    <button onClick={search} disabled={loading} className="btn-primary px-6 flex items-center gap-2">
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
                        Search
                    </button>
                    <button onClick={refresh} className="btn-secondary px-4" title="Refresh">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Search result */}
                {searched && (
                    <div className={`card p-5 mb-6 border ${getStatusBg(searched.status)}`}>
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Train size={20} className="text-orange-400" />
                                    <span className="text-white font-bold text-lg">{searched.name}</span>
                                    <span className="text-slate-500 font-mono text-sm">#{searched.no}</span>
                                </div>
                                <p className="text-slate-400 text-sm">{searched.from} → {searched.to}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-bold ${getStatusColor(searched.status)}`}>{searched.status}</span>
                                {searched.delay > 0 && <p className="text-red-400 text-sm">+{searched.delay} min late</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-400">Platform</p>
                                <p className="text-orange-400 font-black text-2xl">{searched.platform}</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-400">Arrival</p>
                                <p className="text-white font-bold text-lg">{searched.arr}</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                <p className="text-xs text-slate-400">Delay</p>
                                <p className={`font-bold text-lg ${searched.delay > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {searched.delay > 0 ? `+${searched.delay}m` : 'None'}
                                </p>
                            </div>
                        </div>
                        {searched.delay >= 30 && (
                            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
                                <p className="text-yellow-300 text-sm">⚠️ Train is delayed by {searched.delay} minutes. Your coolie booking has been auto-rescheduled.</p>
                            </div>
                        )}
                        <TrainDiagram trainNo={searched.no} trainsList={trains} />
                        <button onClick={() => { setSearched(null); toast.success(`Coolies at Platform ${searched.platform} shown!`) }} className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
                            <MapPin size={14} /> Find Coolies at Platform {searched.platform}
                        </button>
                    </div>
                )}

                {/* All Trains */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-bold">Live Arrivals — New Delhi Station</h2>
                        <span className="text-xs text-slate-500">Updated: {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                    <div className="space-y-3">
                        {trains.map(train => (
                            <div key={train.no} className="card p-4 cursor-pointer hover:border-orange-500/30" onClick={() => { setSearched(train); setSearchNo(train.no) }}>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <Train size={22} className="text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-bold">{train.name}</span>
                                            <span className="text-slate-500 font-mono text-sm">#{train.no}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm">{train.from} → {train.to}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500">Platform</p>
                                            <p className="text-orange-400 font-bold">{train.platform}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500">Arrival</p>
                                            <p className="text-white font-semibold">{train.arr}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBg(train.status)} ${getStatusColor(train.status)}`}>
                                            {train.status === 'On Time' ? <CheckCircle size={12} className="inline mr-1" /> : <AlertTriangle size={12} className="inline mr-1" />}
                                            {train.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
