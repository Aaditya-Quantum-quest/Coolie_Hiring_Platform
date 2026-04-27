import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    Train, Search, Clock, AlertTriangle, CheckCircle, RefreshCw,
    MapPin, Layout, List, Hash, Info, User, ArrowRight, Activity,
    ChevronRight, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
    searchTrain,
    getLiveTrainStatus,
    getLiveTrainSchedule,
    getLiveStation,
    getPNRStatus,
    searchStation,
    getTrainsBetweenStations
} from '../../services/irctcService'

// ── Components ─────────────────────────────────────────────────────────────

/** Responsive 2D Train Diagram */
function TrainDiagram({ trainNo, platform, arr }) {
    const coaches = ['Loco', 'A1', 'A2', 'B1', 'B2', 'B3', 'S1', 'S2', 'S3', 'S4', 'S5', 'GN', 'GN', 'Pantry']
    const coachColors = {
        'Loco': '#f97316', 'A1': '#8b5cf6', 'A2': '#8b5cf6',
        'B1': '#06b6d4', 'B2': '#06b6d4', 'B3': '#06b6d4',
        'S1': '#22c55e', 'S2': '#22c55e', 'S3': '#22c55e', 'S4': '#22c55e', 'S5': '#22c55e',
        'GN': '#94a3b8', 'Pantry': '#f59e0b'
    }

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Train size={14} className="text-orange-400 flex-shrink-0" /> 2D Train Layout
            </h3>
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-1 items-center min-w-max">
                    {coaches.map((c, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div
                                className="rounded-lg text-white font-bold flex items-center justify-center border-2 border-black/20 cursor-pointer hover:scale-110 transition-transform"
                                style={{
                                    background: coachColors[c] || '#475569',
                                    width: c === 'Loco' ? 40 : 30,
                                    height: 40,
                                    fontSize: '9px',
                                    borderRadius: c === 'Loco' ? '6px 16px 16px 6px' : 6,
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed'
                                }}
                                title={c}
                            >{c}</div>
                            <div className="flex gap-0.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500" />
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-0.5 bg-gradient-to-r from-orange-500/50 via-orange-400 to-orange-500/50 rounded-full mt-1" />
            </div>
            {platform && (
                <div className="mt-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1.5 text-xs flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-slate-400">Platform: <span className="text-orange-400 font-bold">{platform}</span></span>
                    {arr && <span className="text-slate-400">Arrival: <span className="text-white font-semibold">{arr}</span></span>}
                </div>
            )}
        </div>
    )
}

/** Loading Spinner */
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-3" />
        <p className="text-slate-400 animate-pulse text-sm">Fetching live railway data...</p>
    </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────

export default function TrainStatus() {
    const [activeTab, setActiveTab] = useState('live')
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(60)

    // Live Status State
    const [trainsBetween, setTrainsBetween] = useState([])
    const [searchingTrains, setSearchingTrains] = useState(false)
    const [liveStatus, setLiveStatus] = useState(null)
    const [fullSchedule, setFullSchedule] = useState(null)
    const [selectedTrain, setSelectedTrain] = useState(null)

    // Journey Search State
    const [fromStationQuery, setFromStationQuery] = useState('')
    const [toStationQuery, setToStationQuery] = useState('')
    const [fromStationSuggestions, setFromStationSuggestions] = useState([])
    const [toStationSuggestions, setToStationSuggestions] = useState([])

    // Station Board State
    const [stationQuery, setStationQuery] = useState('')
    const [stationSuggestions, setStationSuggestions] = useState([])
    const [stationBoard, setStationBoard] = useState(null)
    const [selectedStation, setSelectedStation] = useState(null)

    // PNR State
    const [pnrNo, setPnrNo] = useState('')
    const [pnrStatus, setPnrStatus] = useState(null)

    // ── Handlers ──
    const extractStationCode = (query) => {
        const match = query.match(/\((.*?)\)/);
        return match ? match[1] : query.toUpperCase();
    }

    const handleFindTrains = async () => {
        const fromCode = extractStationCode(fromStationQuery)
        const toCode = extractStationCode(toStationQuery)
        
        if (!fromCode || !toCode || fromCode === toCode) {
            toast.error('Please select different valid stations')
            return
        }

        setSearchingTrains(true)
        setTrainsBetween([])
        try {
            const date = new Date().toISOString().split('T')[0] // Today
            const res = await getTrainsBetweenStations(fromCode, toCode, date)
            if (res.status && res.data) {
                const trainsList = res.data.trains || res.data || []
                setTrainsBetween(trainsList)
                if (trainsList.length === 0) toast('No trains found for this route today')
            } else {
                toast.error(res.message || 'Could not fetch trains')
            }
        } catch (err) {
            toast.error('Service unavailable')
        } finally {
            setSearchingTrains(false)
        }
    }



    useEffect(() => {
        if (stationQuery.length < 3) { setStationSuggestions([]); return }
        const timer = setTimeout(async () => {
            try {
                const res = await searchStation(stationQuery)
                if (res.status && res.data) setStationSuggestions(res.data)
            } catch (err) { console.error(err) }
        }, 500)
        return () => clearTimeout(timer)
    }, [stationQuery])

    // From Station Debounce
    useEffect(() => {
        if (fromStationQuery.length < 2) { setFromStationSuggestions([]); return }
        const timer = setTimeout(async () => {
            try {
                const res = await searchStation(fromStationQuery)
                if (res.status && res.data) setFromStationSuggestions(res.data)
            } catch (err) { console.error(err) }
        }, 500)
        return () => clearTimeout(timer)
    }, [fromStationQuery])

    // To Station Debounce
    useEffect(() => {
        if (toStationQuery.length < 2) { setToStationSuggestions([]); return }
        const timer = setTimeout(async () => {
            try {
                const res = await searchStation(toStationQuery)
                if (res.status && res.data) setToStationSuggestions(res.data)
            } catch (err) { console.error(err) }
        }, 500)
        return () => clearTimeout(timer)
    }, [toStationQuery])

    useEffect(() => {
        if (activeTab === 'live' && liveStatus && countdown > 0) {
            const timer = setInterval(() => setCountdown(c => c - 1), 1000)
            return () => clearInterval(timer)
        } else if (countdown === 0) {
            refreshLiveStatus()
        }
    }, [countdown, activeTab, liveStatus])

    const fetchLiveStatus = async (trainNo) => {
        setLoading(true)
        try {
            const [statusRes, scheduleRes] = await Promise.all([
                getLiveTrainStatus(trainNo),
                getLiveTrainSchedule(trainNo)
            ])
            if (statusRes.status) { setLiveStatus(statusRes.data); setCountdown(60) }
            else toast.error(statusRes.message || 'Train not scheduled today')
            if (scheduleRes.status) setFullSchedule(scheduleRes.data)
        } catch (err) {
            toast.error('Service unavailable, try again')
        } finally { setLoading(false) }
    }

    const refreshLiveStatus = () => {
        if (selectedTrain) fetchLiveStatus(selectedTrain.train_number)
    }

    const fetchStationBoard = async (stationCode) => {
        setLoading(true)
        try {
            const res = await getLiveStation(stationCode, 2)
            if (res.status) setStationBoard(res.data)
            else toast.error('No trains found at this station')
        } catch (err) {
            toast.error('Service unavailable, try again')
        } finally { setLoading(false) }
    }

    const fetchPNR = async () => {
        if (pnrNo.length !== 10) { toast.error('Please enter a valid 10-digit PNR'); return }
        setLoading(true)
        try {
            const res = await getPNRStatus(pnrNo)
            if (res.status) setPnrStatus(res.data)
            else toast.error(res.message || 'PNR not found')
        } catch (err) {
            toast.error('Service unavailable, try again')
        } finally { setLoading(false) }
    }

    // ── UI Helpers ──

    const getStatusTheme = (status) => {
        if (status?.toLowerCase().includes('on time')) return { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', badge: 'On Time', icon: <CheckCircle size={12} /> }
        if (status?.toLowerCase().includes('delayed')) return { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', badge: 'Delayed', icon: <Clock size={12} /> }
        if (status?.toLowerCase().includes('cancelled')) return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', badge: 'Cancelled', icon: <AlertTriangle size={12} /> }
        return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', badge: 'Running', icon: <Activity size={12} /> }
    }

    // ── Render Sections ──

    const renderLiveStatus = () => (
        <div className="space-y-4 sm:space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* From Station */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            className="w-full pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                            placeholder="Current Station (e.g. RMU)..."
                            value={fromStationQuery}
                            onChange={e => setFromStationQuery(e.target.value)}
                        />
                        {fromStationSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-slate-800 border border-slate-700 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                                {fromStationSuggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-2.5 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0 transition-colors"
                                        onClick={() => {
                                            setFromStationQuery(`${s.station_name} (${s.station_code})`)
                                            setFromStationSuggestions([])
                                        }}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white font-semibold text-sm truncate">{s.station_name}</p>
                                            <p className="text-slate-400 text-xs">{s.station_code}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* To Station */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            className="w-full pl-10 sm:pl-12 pr-3 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
                            placeholder="Destination Station (e.g. MB)..."
                            value={toStationQuery}
                            onChange={e => setToStationQuery(e.target.value)}
                        />
                        {toStationSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 bg-slate-800 border border-slate-700 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                                {toStationSuggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-2.5 hover:bg-slate-700 cursor-pointer flex justify-between items-center border-b border-slate-700/50 last:border-0 transition-colors"
                                        onClick={() => {
                                            setToStationQuery(`${s.station_name} (${s.station_code})`)
                                            setToStationSuggestions([])
                                        }}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white font-semibold text-sm truncate">{s.station_name}</p>
                                            <p className="text-slate-400 text-xs">{s.station_code}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleFindTrains}
                    disabled={searchingTrains}
                    className="w-full mt-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-black rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {searchingTrains ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Search size={20} strokeWidth={3} />
                    )}
                    <span>FIND TRAINS</span>
                </button>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {trainsBetween.length > 0 ? (
                    trainsBetween.map((t, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                            onClick={() => {
                                setSelectedTrain(t)
                                fetchLiveStatus(t.train_number)
                            }}
                        >
                            <div className="p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                            <Train size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-900 dark:text-white font-black text-lg leading-none mb-1 group-hover:text-orange-500 transition-colors">
                                                {t.train_name}
                                            </h3>
                                            <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
                                                <Hash size={12} /> {t.train_number}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${getStatusTheme(t.delay).bg} ${getStatusTheme(t.delay).color}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                                        {t.delay || 'On Time'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 relative px-2">
                                    {/* Connection Line */}
                                    <div className="absolute top-[18px] left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-800 -z-0"></div>
                                    
                                    <div className="text-center z-10 bg-white dark:bg-slate-900 pr-2">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{t.departure_time || t.from_sta}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{extractStationCode(fromStationQuery)}</p>
                                    </div>
                                    
                                    <div className="text-center z-10 flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                                            <ChevronRight size={14} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold">{t.duration || 'N/A'}</p>
                                    </div>
                                    
                                    <div className="text-center z-10 bg-white dark:bg-slate-900 pl-2">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{t.arrival_time || t.to_sta}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{extractStationCode(toStationQuery)}</p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                                    {t.classes?.map(c => (
                                        <span key={c} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 text-[10px] font-bold">
                                            {c}
                                        </span>
                                    ))}
                                    <div className="flex-1"></div>
                                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                        <MapPin size={10} />
                                        Route: <span className="text-slate-500 font-bold">{t.route}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : !searchingTrains && (
                    <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-50">
                        <Train size={48} className="text-slate-300" />
                        <p className="text-sm font-bold">Enter stations and find trains</p>
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {liveStatus && !loading && (
                <>
                    {/* Coolie Alert */}
                    {liveStatus.time_to_arrival <= 15 && liveStatus.time_to_arrival > 0 && (
                        <div className="bg-red-500 border border-red-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0">
                                    <AlertTriangle className="text-white" size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-white font-black text-sm sm:text-base leading-tight">🚨 ARRIVING IN {liveStatus.time_to_arrival} MINS</h4>
                                    <p className="text-white/80 font-bold text-xs">PLATFORM {liveStatus.platform_number || 'N/A'}</p>
                                </div>
                            </div>
                            <button className="bg-white text-red-500 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs flex-shrink-0">
                                Notify
                            </button>
                        </div>
                    )}

                    {/* Live Status Card */}
                    <div className={`card p-3 sm:p-5 border ${getStatusTheme(liveStatus.status_as_of).bg}`}>
                        <div className="flex items-start justify-between flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                                    <Train size={18} className="text-orange-400 flex-shrink-0" />
                                    <span className="text-white font-black text-lg sm:text-2xl leading-tight truncate">{liveStatus.train_name}</span>
                                    <span className="text-slate-500 font-mono text-xs sm:text-sm">#{liveStatus.train_number}</span>
                                </div>
                                <p className="text-slate-400 flex items-center gap-1 text-xs sm:text-sm flex-wrap">
                                    <MapPin size={12} className="flex-shrink-0" />
                                    <span>Current:</span>
                                    <span className="text-white font-bold truncate">{liveStatus.current_station_name}</span>
                                </p>
                                <p className="text-slate-500 text-[10px] mt-1">
                                    Last Updated: {liveStatus.last_updated || 'Just now'} •
                                    <button onClick={refreshLiveStatus} className="text-orange-400 ml-1 inline-flex items-center gap-0.5 hover:text-orange-300">
                                        <RefreshCw size={9} /> {countdown}s
                                    </button>
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className={`flex items-center gap-1.5 font-black text-base sm:text-xl ${getStatusTheme(liveStatus.status_as_of).color}`}>
                                    {getStatusTheme(liveStatus.status_as_of).icon}
                                    {getStatusTheme(liveStatus.status_as_of).badge}
                                </div>
                                {liveStatus.delay > 0 && <p className="text-red-400 font-bold text-xs">+{liveStatus.delay} mins</p>}
                            </div>
                        </div>

                        {/* Stats Grid - 2 col on mobile, 4 col on md+ */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                            {[
                                { label: 'Platform', value: liveStatus.platform_number || 'TBA', sub: null, valueClass: 'text-orange-400 font-black text-2xl sm:text-3xl' },
                                { label: 'Arrival', value: liveStatus.upcoming_stations[0]?.eta || liveStatus.sta, sub: `Actual: ${liveStatus.upcoming_stations[0]?.ata || liveStatus.ata || '--'}`, valueClass: 'text-white font-black text-lg sm:text-xl' },
                                { label: 'Next Stop', value: liveStatus.upcoming_stations[0]?.station_name || 'Destination', sub: `ETA: ${liveStatus.upcoming_stations[0]?.eta || '--:--'}`, valueClass: 'text-white font-bold text-xs sm:text-sm truncate' },
                                { label: 'Distance', value: `${liveStatus.distance_from_source} km`, sub: 'From Origin', valueClass: 'text-white font-black text-lg sm:text-xl' },
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center border border-slate-700/50">
                                    <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{item.label}</p>
                                    <p className={item.valueClass}>{item.value}</p>
                                    {item.sub && <p className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5">{item.sub}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <TrainDiagram trainNo={liveStatus.train_number} platform={liveStatus.platform_number} arr={liveStatus.upcoming_stations[0]?.eta} />

                    {/* Full Route Schedule */}
                    {fullSchedule && (
                        <div className="card overflow-hidden">
                            <div className="px-3 sm:px-4 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                                <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                                    <Layout size={14} className="text-orange-400" /> Full Route Schedule
                                </h3>
                                <span className="text-xs text-slate-500">{fullSchedule.length} Stops</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[380px]">
                                    <thead>
                                        <tr className="bg-slate-900/50 text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest">
                                            <th className="px-3 sm:px-4 py-2.5 font-bold">Station</th>
                                            <th className="px-2 sm:px-4 py-2.5 font-bold">Sch.</th>
                                            <th className="px-2 sm:px-4 py-2.5 font-bold">Actual</th>
                                            <th className="px-2 sm:px-4 py-2.5 font-bold">Plt.</th>
                                            <th className="px-2 sm:px-4 py-2.5 font-bold">Dist.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {fullSchedule.map((stop, i) => {
                                            const isCurrent = stop.station_name === liveStatus.current_station_name
                                            const isPassed = stop.has_arrived
                                            return (
                                                <tr key={i} className={`${isCurrent ? 'bg-orange-500/10' : ''} ${isPassed && !isCurrent ? 'opacity-40' : ''}`}>
                                                    <td className="px-3 sm:px-4 py-2.5 sm:py-4">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${isCurrent ? 'bg-orange-500 animate-pulse' : isPassed ? 'bg-slate-500' : 'bg-slate-700'}`} />
                                                            <div className="min-w-0">
                                                                <p className={`text-xs font-bold truncate max-w-[90px] sm:max-w-none ${isCurrent ? 'text-orange-400' : 'text-white'}`}>{stop.station_name}</p>
                                                                <p className="text-[9px] text-slate-500">{stop.station_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-xs text-slate-400 whitespace-nowrap">{stop.sta || '--:--'}</td>
                                                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-xs font-mono text-white whitespace-nowrap">{stop.ata || stop.sta || '--:--'}</td>
                                                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-xs text-orange-400 font-bold">{stop.platform || '--'}</td>
                                                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-[10px] text-slate-500 whitespace-nowrap">{stop.distance}km</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )

    const renderStationBoard = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="relative">
                <Search size={15} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    className="input-field pl-9 sm:pl-10 text-sm"
                    placeholder="Station name or code (e.g. NDLS)..."
                    value={stationQuery}
                    onChange={e => setStationQuery(e.target.value)}
                />
                {stationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-slate-800 border border-slate-700 rounded-xl mt-1 overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                        {stationSuggestions.map((s, i) => (
                            <div
                                key={i}
                                className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-700/50 last:border-0"
                                onClick={() => {
                                    setSelectedStation(s)
                                    setStationQuery(`${s.station_name} (${s.station_code})`)
                                    setStationSuggestions([])
                                    fetchStationBoard(s.station_code)
                                }}
                            >
                                <div className="min-w-0">
                                    <p className="text-white font-bold text-xs sm:text-sm truncate">{s.station_name}</p>
                                    <p className="text-slate-400 text-xs">{s.station_code}</p>
                                </div>
                                <ArrowRight size={13} className="text-orange-500 flex-shrink-0 ml-2" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {loading && <LoadingSpinner />}

            {stationBoard && !loading && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-sm sm:text-base truncate mr-2">
                            {stationBoard.station_name || stationQuery}
                            <span className="text-slate-400 font-normal ml-1 text-xs">(Next 2h)</span>
                        </h3>
                        <span className="text-xs text-slate-500 flex-shrink-0">{stationBoard.trains?.length || 0} trains</span>
                    </div>
                    <div className="grid gap-2 sm:gap-3">
                        {stationBoard.trains?.map((t, i) => (
                            <div
                                key={i}
                                className="card p-3 sm:p-4 hover:border-orange-500/30 cursor-pointer transition-colors active:bg-slate-800/80"
                                onClick={() => {
                                    setActiveTab('live')
                                    setTrainQuery(`${t.train_name} (${t.train_number})`)
                                    fetchLiveStatus(t.train_number)
                                }}
                            >
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                        <Train size={14} className="text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-xs sm:text-sm truncate">{t.train_name}</p>
                                        <p className="text-slate-500 text-[10px] font-mono">#{t.train_number}</p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
                                        <div className="text-center hidden xs:block">
                                            <p className="text-[9px] text-slate-500 uppercase font-bold">Plt.</p>
                                            <p className="text-orange-400 font-black text-sm">{t.platform || 'TBA'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] text-slate-500 uppercase font-bold">Arr.</p>
                                            <p className="text-white font-bold text-xs sm:text-sm">{t.sta || '--:--'}</p>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusTheme(t.delay > 0 ? 'delayed' : 'on time').bg} ${getStatusTheme(t.delay > 0 ? 'delayed' : 'on time').color}`}>
                                            {t.delay > 0 ? `+${t.delay}m` : 'On Time'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    const renderPNRLookup = () => (
        <div className="space-y-4 sm:space-y-6">
            {/* PNR input — stacked on mobile, row on sm+ */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
                {/* Input Container */}
                <div className="flex-1 relative h-11 sm:h-12 md:h-12 lg:h-13"> {/* Responsive height */}
                    <Hash
                        size={{ base: 14, sm: 16, md: 18 }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400/80 pointer-events-none z-10"
                    />
                    <input
                        className="input-field w-full h-full pl-10 sm:pl-11 md:pl-12 pr-4 sm:pr-4 md:pr-5 text-sm sm:text-base rounded-lg border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                        placeholder="Enter 10-digit PNR Number..."
                        value={pnrNo}
                        maxLength={10}
                        onChange={e => setPnrNo(e.target.value.replace(/\D/g, ''))}
                        inputMode="numeric"
                        aria-label="PNR Number"
                        type="tel" // Better for numeric input on mobile
                    />
                </div>

                {/* Button */}
                <button
                    type="button"
                    onClick={fetchPNR}
                    className="btn-primary px-6 sm:px-8 h-11 rounded-lg font-bold text-sm whitespace-nowrap"
                    aria-label="Check PNR Status"
                >
                    Check Status
                </button>
            </div>

            {loading && <LoadingSpinner />}

            {pnrStatus && !loading && (
                <div className="card overflow-hidden">
                    {/* Header */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div>
                                <p className="text-orange-100 text-[10px] uppercase tracking-widest font-bold">PNR Number</p>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-wide">{pnrStatus.pnr}</h3>
                            </div>
                            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-md">
                                <Train size={18} />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1">
                            <div>
                                <p className="text-orange-100 text-[9px] uppercase font-bold">Train</p>
                                <p className="font-bold text-sm">{pnrStatus.train_name} ({pnrStatus.train_number})</p>
                            </div>
                            <div>
                                <p className="text-orange-100 text-[9px] uppercase font-bold">Date</p>
                                <p className="font-bold text-sm">{pnrStatus.doj}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                        {/* Journey endpoints */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="p-3 sm:p-4 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700/50">
                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">From</p>
                                <p className="text-white font-bold text-xs sm:text-sm">{pnrStatus.from_station}</p>
                                <p className="text-slate-500 text-[10px]">{pnrStatus.boarding_station}</p>
                            </div>
                            <div className="p-3 sm:p-4 bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700/50 text-right">
                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">To</p>
                                <p className="text-white font-bold text-xs sm:text-sm">{pnrStatus.to_station}</p>
                                <p className="text-slate-500 text-[10px]">{pnrStatus.reservation_upto}</p>
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="space-y-2">
                            <p className="text-slate-500 text-[10px] uppercase font-bold px-1">Passengers</p>
                            {pnrStatus.passengers?.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-700/50">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white flex-shrink-0">
                                            <User size={12} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-xs sm:text-sm">Passenger {i + 1}</p>
                                            <p className="text-slate-500 text-[10px]">Coach: {p.booking_coach_id || 'TBA'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-orange-400 font-black text-xs sm:text-sm">{p.current_status}</p>
                                        <p className="text-slate-500 text-[10px]">Berth: {p.booking_berth_no || '--'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart status */}
                        <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3">
                            <Info size={14} className="text-blue-400 flex-shrink-0" />
                            <p className="text-xs text-slate-400">
                                Charting: <span className="text-white font-bold">{pnrStatus.chart_prepared ? 'Prepared ✓' : 'Not Prepared'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />

            {/* Main content — respects sidebar offset on md+ */}
            <main className="flex-1 md:ml-64 p-3 sm:p-4 md:p-6">
                {/* Header */}
                <div className="pt-14 md:pt-0 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2 sm:gap-3">
                        <Train size={22} className="text-orange-400 flex-shrink-0" />
                        <span>Live Railway Hub</span>
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Real-time IRCTC data for smarter coolie hiring</p>
                </div>

                {/* Tabs — full width on mobile, fit on larger */}
                <div className="flex p-1 bg-slate-800/50 rounded-xl sm:rounded-2xl mb-4 sm:mb-8 border border-slate-700/50 w-full sm:w-fit">
                    {[
                        { id: 'live', icon: <Activity size={13} />, label: 'Live' },
                        { id: 'station', icon: <List size={13} />, label: 'Station' },
                        { id: 'pnr', icon: <Hash size={13} />, label: 'PNR' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all ${activeTab === tab.id
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            <span className="hidden xs:inline sm:inline">{tab.label === 'Live' ? 'Live Status' : tab.label === 'Station' ? 'Station Board' : 'PNR Status'}</span>
                            <span className="xs:hidden">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl w-full">
                    {activeTab === 'live' && renderLiveStatus()}
                    {activeTab === 'station' && renderStationBoard()}
                    {activeTab === 'pnr' && renderPNRLookup()}
                </div>
            </main>
        </div>
    )
}