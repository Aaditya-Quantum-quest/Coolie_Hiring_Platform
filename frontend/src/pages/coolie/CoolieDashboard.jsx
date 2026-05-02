import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    CheckCircle, XCircle, Clock, Star, Package,
    MapPin, Activity, AlertTriangle, Luggage, User, Train
} from 'lucide-react'
import toast from 'react-hot-toast'
import SearchBar from '../../components/ui/SearchBar'
import useGeolocation from '../../hooks/useGeolocation'
import { useGlobalSocket } from '../../context/SocketContext'
import LocationPermissionModal from '../../components/location/LocationPermissionModal'
import { useApp } from '../../context/AppContext'
import { coolieDashboardService, coolieStatusService } from '../../services/coolieService'
import { getLiveStation } from '../../services/railApiService'

/* ── Mock Data ───────────────────────────────────────────────── */
const INITIAL_REQUESTS = [
    {
        id: 'BK-1847', customer: 'Anish Sharma', tag: 'REGULAR',
        platform: 'Platform 4', bags: '3 bags',
        to: 'Main Exit (Gate 2)',
        price: 180, timer: 60,
    },
    {
        id: 'BK-1848', customer: 'Sunita Devi', tag: 'ASSISTED',
        platform: 'Platform 12', bags: '1 bag + Wheelchair',
        to: 'Platform 1 (Transfer)',
        price: 250, timer: 45,
    },
]

const COMPLETED = [
    { label: 'Exit Gate 1',        time: 'Completed 24m ago', amount: 120 },
    { label: 'Platform 8 Transfer', time: 'Completed 1h 05m ago', amount: 340 },
]

/* ── Request Card ────────────────────────────────────────────── */
function RequestCard({ req, onAccept, onReject }) {
    const [timeLeft, setTimeLeft] = useState(req.timer)

    useEffect(() => {
        if (timeLeft <= 0) { onReject(req.id); return }
        const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        return () => clearTimeout(t)
    }, [timeLeft])

    const urgent = timeLeft <= 15

    return (
        <div className={`bg-[#0E0C1E] border rounded-2xl p-4 transition-all ${urgent ? 'border-red-500/50' : 'border-[#1E1A40]'}`}>
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white font-bold border border-[#7B2FFF]/20">
                        {req.customer[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-white font-bold text-sm">{req.customer}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                req.tag === 'ASSISTED'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-[#7B2FFF]/20 text-[#A855F7] border border-[#7B2FFF]/30'
                            }`}>{req.tag}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B6188] mt-0.5">
                            <span className="flex items-center gap-1"><MapPin size={9} /> {req.platform}</span>
                            <span className="flex items-center gap-1"><Package size={9} /> {req.bags}</span>
                        </div>
                        <p className="text-[11px] text-[#A855F7] mt-0.5">To: {req.to}</p>
                    </div>
                </div>

                {/* Price + Timer */}
                <div className="text-right shrink-0">
                    <p className="text-[9px] text-[#6B6188] uppercase tracking-wider">Offer Price</p>
                    <p className={`text-2xl font-black ${urgent ? 'text-red-400' : 'text-[#7B2FFF]'}`}>₹{req.price}</p>
                </div>
            </div>

            {/* Timer bar */}
            <div className="w-full bg-[#1E1A40] rounded-full h-1 mb-3">
                <div
                    className={`h-1 rounded-full transition-all ${urgent ? 'bg-red-500' : 'bg-[#7B2FFF]'}`}
                    style={{ width: `${(timeLeft / req.timer) * 100}%` }}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => onReject(req.id)}
                    className="flex-1 py-2 rounded-xl border border-[#1E1A40] text-[#6B6188] text-sm font-semibold hover:border-red-500/50 hover:text-red-400 transition-all"
                >
                    Reject
                </button>
                <button
                    onClick={() => onAccept(req.id)}
                    className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all"
                >
                    Accept ({timeLeft}s)
                </button>
            </div>
        </div>
    )
}

/* ── Active Job Card ─────────────────────────────────────────── */
function ActiveJobCard({ job, onComplete }) {
    const [otp, setOtp] = useState('')
    const [otpVerified, setOtpVerified] = useState(false)
    const verifyOtp = async () => {
        if (otp === String(job.otp)) { 
            try {
                await coolieDashboardService.updateStatus(job.id, 'in_progress');
                setOtpVerified(true); 
                toast.success('OTP Verified! Job started ✅') 
            } catch (error) {
                console.error('Error starting job:', error);
                toast.error('Failed to start job');
            }
        } else {
            toast.error('Wrong OTP!')
        }
    }

    return (
        <div className="bg-[#0E0C1E] border border-red-500/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">On Duty</span>
                <span className="text-[#6B6188] text-xs font-mono ml-1">{job.id}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E1A40] flex items-center justify-center text-white font-bold">{job.customer[0]}</div>
                <div className="flex-1">
                    <p className="text-white font-bold text-sm">{job.customer}</p>
                    <p className="text-[#6B6188] text-xs">{job.platform} → {job.to}</p>
                </div>
                <p className="text-green-400 font-black text-xl">₹{job.price}</p>
            </div>
            {!otpVerified ? (
                <div className="bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 rounded-xl p-3">
                    <p className="text-[#A855F7] text-xs font-semibold mb-2">🔑 Enter OTP from Customer</p>
                    <div className="flex gap-2">
                        <input maxLength={4} className="flex-1 bg-[#12102A] border border-[#1E1A40] rounded-lg px-3 py-2 text-white text-center font-mono tracking-widest outline-none focus:border-[#7B2FFF]"
                            placeholder="- - - -" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                        <button onClick={verifyOtp} className="px-4 rounded-lg bg-[#7B2FFF] text-white font-bold text-sm hover:bg-[#5B1FCC]">Verify</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-2.5 flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={14} /> OTP Verified — Job in progress!
                    </div>
                    <button onClick={() => onComplete(job.id)} className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600">
                        ✓ Mark as Complete
                    </button>
                </div>
            )}
        </div>
    )
}

/* ── Main Dashboard ──────────────────────────────────────────── */
export default function CoolieDashboard() {
    const [requests, setRequests] = useState([])
    const [activeJob, setActiveJob] = useState(null)
    const [completedToday, setCompletedToday] = useState([])
    const [shiftSeconds, setShiftSeconds] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')
    const [stats, setStats] = useState({
        totalEarnings: 0,
        tripsToday: 0,
        avgRating: 0,
        pending: 0
    })
    const [loading, setLoading] = useState(true)
    const [stationBoard, setStationBoard] = useState([])
    const [loadingBoard, setLoadingBoard] = useState(false)

    // Live Tracking Hooks
    const { location, permission, startWatching, stopWatching } = useGeolocation()
    const { socket, connected } = useGlobalSocket()
    const [showLocationModal, setShowLocationModal] = useState(false)
    const { user, shiftStartTime, setShiftStartTime, coolieStatus, setCoolieStatus } = useApp()
    const coolieId = user?.coolie_id || user?.id || 'pending-id'

    // Handle Location Updates
    useEffect(() => {
        if (coolieStatus !== 'offline' && location && socket && connected) {
            socket.emit('coolie:location-update', {
                coolieId,
                lat: location.lat,
                lng: location.lng,
                bookingId: activeJob ? activeJob.id : null
            })
        }
    }, [location, coolieStatus, socket, connected, activeJob])

    // Real-time Booking Updates
    useEffect(() => {
        if (socket && connected) {
            socket.on('booking:new-request', (data) => {
                console.log('New booking request received via socket:', data);
                // Prepend to requests list if not already there
                setRequests(prev => {
                    if (prev.find(r => r.id === data.id)) return prev;
                    return [data, ...prev];
                });
                toast.success('New Booking Request! 🔔', { duration: 6000 });
                
                // Play notification sound if possible
                try { new Audio('/assets/notification.mp3').play(); } catch(e) {}
            });

            return () => {
                socket.off('booking:new-request');
            };
        }
    }, [socket, connected]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async (isInitial = false) => {
            if (!coolieId || coolieId === 'pending-id') return;
            
            try {
                if (isInitial) setLoading(true);
                
                // Use consolidated endpoint to prevent 429 Too Many Requests
                const response = await coolieDashboardService.getOverview(coolieId);
                
                if (response.success && response.data) {
                    const { stats: statsData, activeJobs: activeData, completedToday: completedData, upcomingRequests: requestsData, is_online: isOnline } = response.data;
                    
                    if (statsData) setStats(statsData);
                    setActiveJob(activeData?.[0] || null);
                    setCompletedToday(completedData || []);
                    setRequests(requestsData || []);
                    
                    // Update global status carefully
                    if (activeData && activeData.length > 0) {
                        setCoolieStatus('onduty');
                    } else if (coolieStatus !== 'onduty') {
                        setCoolieStatus(isOnline ? 'available' : 'offline');
                    }
                    
                    // Sync timer if needed
                    if (isOnline && !shiftStartTime) {
                        setShiftStartTime(Date.now());
                    }
                }
                
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                if (isInitial) setLoading(false);
            }
        };
        
        fetchDashboardData(true); // Initial load with spinner
        
        // Fetch station board
        const fetchBoard = async () => {
            const stationCode = user?.station_code || 'NDLS';
            setLoadingBoard(true);
            try {
                const res = await getLiveStation(stationCode, 2);
                if (res.status) setStationBoard(res.data.trains || []);
            } catch (err) {
                console.error('Error fetching station board:', err);
            } finally {
                setLoadingBoard(false);
            }
        };
        fetchBoard();
        
        // Set up periodic refresh
        const interval = setInterval(() => {
            fetchDashboardData(false); // Background refresh without spinner
            fetchBoard();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [coolieId, user?.station_code]);

    // Shift clock - Calculates duration from persistent start time
    useEffect(() => {
        // Run once immediately
        if (shiftStartTime) {
            const initialDiff = Math.floor((Date.now() - shiftStartTime) / 1000);
            setShiftSeconds(initialDiff > 0 ? initialDiff : 0);
        }

        const t = setInterval(() => {
            if (shiftStartTime) {
                const diff = Math.floor((Date.now() - shiftStartTime) / 1000);
                // Prevent negative numbers or weird jumps
                setShiftSeconds(diff > 0 ? diff : 0);
            } else {
                setShiftSeconds(0);
            }
        }, 1000)
        return () => clearInterval(t)
    }, [shiftStartTime])

    const formatShift = (s) => {
        const h = String(Math.floor(s / 3600)).padStart(2, '0')
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
        const sec = String(s % 60).padStart(2, '0')
        return `${h}:${m}:${sec}`
    }

    const toggleStatus = async () => {
        if (coolieStatus === 'available' || coolieStatus === 'onduty') { 
            try {
                await coolieStatusService.goOffline(coolieId);
                setCoolieStatus('offline')
                stopWatching()
                setShiftStartTime(null) // Reset shift start time on go offline
                if (socket && connected) socket.emit('coolie:go-offline', { coolieId })
                toast('You are now offline', { icon: '💤' }) 
            } catch (error) {
                console.error('Error going offline:', error);
                toast.error('Failed to go offline');
            }
        }
        else { 
            // Going online
            if (permission === 'granted') {
                try {
                    await coolieStatusService.goOnline(coolieId, location?.lat, location?.lng);
                    startWatching()
                    setCoolieStatus('available')
                    if (!shiftStartTime) setShiftStartTime(Date.now()) // Set shift start time only if not already set
                    if (socket && connected && location) {
                        socket.emit('coolie:go-online', { coolieId, lat: location.lat, lng: location.lng })
                    }
                    toast.success('You are AVAILABLE! 🔔')
                } catch (error) {
                    console.error('Error going online:', error);
                    toast.error('Failed to go online');
                }
            } else {
                setShowLocationModal(true)
            }
        }
    }

    const handleEnableLocation = () => {
        startWatching()
        setShowLocationModal(false)
        if (permission === 'denied') {
            toast.error('Please allow location in browser settings')
        } else {
            setCoolieStatus('available')
            toast.success('You are AVAILABLE! 🔔')
        }
    }

    const handleAccept = async (id) => {
        try {
            await coolieDashboardService.updateStatus(id, 'confirmed');
            const req = requests.find(r => r.id === id)
            setActiveJob({ ...req, status: 'confirmed' })
            setRequests([])
            setCoolieStatus('onduty')
            toast.success('Booking Accepted! 🏃')
        } catch (error) {
            console.error('Error accepting booking:', error);
            toast.error('Failed to accept booking');
        }
    }

    const handleReject = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id))
        toast('Request rejected', { icon: '❌' })
    }

    // Search filters for requests
    const requestFilters = [
        { value: 'all', label: 'All Requests' },
        { value: 'urgent', label: 'Urgent Only' },
        { value: 'high', label: 'High Value' },
        { value: 'regular', label: 'Regular Jobs' }
    ]

    // Filter requests based on search
    const filteredRequests = requests.filter(req => {
        const matchesSearch = searchQuery === '' || 
            req.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.tag.toLowerCase().includes(searchQuery.toLowerCase())
        
        if (!matchesSearch) return false

        switch (searchFilter) {
            case 'urgent':
                return req.timer <= 30
            case 'high':
                return req.price >= 200
            case 'regular':
                return req.tag === 'REGULAR'
            default:
                return true
        }
    })

    // Filter completed jobs based on search
    const filteredCompleted = completedToday.filter(job => {
        return searchQuery === '' ||
            job.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.time.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const handleComplete = async (id) => {
        try {
            await coolieDashboardService.updateStatus(id, 'completed');
            const newEntry = { label: `Job #${activeJob.id}`, time: 'Completed just now', amount: activeJob.price }
            setCompletedToday(prev => [newEntry, ...prev])
            setActiveJob(null)
            setCoolieStatus('available')
            toast.success('Job completed! ✅')
        } catch (error) {
            console.error('Error completing job:', error);
            toast.error('Failed to complete job');
        }
    }

    const STATS = [
        { label: 'TOTAL EARNINGS', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: <Activity className="text-green-400" size={20} />, change: '+12%', color: 'text-green-400' },
        { label: 'TRIPS TODAY',    value: String(stats.tripsToday).padStart(2, '0'), icon: <CheckCircle className="text-[#A855F7]" size={20} />, color: 'text-[#A855F7]' },
        { label: 'AVG RATING',     value: stats.avgRating.toFixed(2),   icon: <Star className="text-yellow-400" size={20} />, color: 'text-yellow-400' },
        { label: 'PENDING',        value: String(stats.pending).padStart(2,'0'), icon: <Clock className="text-[#7B2FFF]" size={20} />, color: 'text-[#7B2FFF]' },
    ]

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="coolie" />
            <main className="flex-1 md:ml-64 p-5 md:p-7">
                <div className="max-w-6xl mx-auto space-y-5">

                    {/* ── Search Bar ── */}
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4">
                        <SearchBar
                            placeholder="Search requests, customers, platforms..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onFilter={setSearchFilter}
                            filters={requestFilters}
                            selectedFilter={searchFilter}
                            showFilters={true}
                        />
                    </div>

                    {/* ── Hero Header ── */}
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2FFF]"></div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                                            coolieStatus === 'available' || coolieStatus === 'onduty' 
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                                coolieStatus === 'available' || coolieStatus === 'onduty' ? 'bg-green-400' : 'bg-red-400'
                                            }`} /> 
                                            {coolieStatus === 'available' ? 'Available' : coolieStatus === 'onduty' ? 'On Duty' : 'Offline'}
                                        </span>
                                        <span className="text-[#6B6188] text-[11px] font-mono">#{user?.coolie_id || 'PENDING'}</span>
                                    </div>
                                    <h1 className="text-white text-3xl font-black leading-tight">{user?.name || 'Coolie'}</h1>
                                    <p className="text-[#6B6188] text-sm flex items-center gap-1 mt-1">
                                        <MapPin size={12} /> {user?.station_name || 'New Delhi Railway Station'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#6B6188] text-[10px] uppercase tracking-widest mb-1">Today's Shift</p>
                                    <p className="text-white font-black text-3xl font-mono tracking-wider">{formatShift(shiftSeconds)}</p>
                                    <button
                                        onClick={toggleStatus}
                                        className={`mt-2 text-[11px] px-3 py-1 rounded-full font-bold border transition-all ${
                                            coolieStatus === 'available' || coolieStatus === 'onduty'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                : 'bg-[#1E1A40] text-[#6B6188] border-[#1E1A40] hover:border-[#7B2FFF]'
                                        }`}
                                    >
                                        {coolieStatus === 'offline' ? '● Go Online' : '● Online — Tap to go offline'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {STATS.map((s, i) => (
                            <div key={i} className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="p-2 rounded-xl bg-white/5">{s.icon}</span>
                                    {s.change && (
                                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full font-bold">{s.change}</span>
                                    )}
                                </div>
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-[#6B6188] text-[10px] uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Two-Column Main ── */}
                    <div className="grid lg:grid-cols-[1fr_300px] gap-5">

                        {/* ══ LEFT — Incoming Requests ══ */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-white font-bold text-lg">Incoming Requests</h2>
                                <span className="flex items-center gap-1.5 text-green-400 text-[11px] font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE UPDATES
                                </span>
                            </div>

                            {activeJob && <ActiveJobCard job={activeJob} onComplete={handleComplete} />}

                            {filteredRequests.length === 0 && !activeJob && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-10 text-center">
                                    <div className="text-4xl mb-3">
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2FFF] mx-auto"></div>
                                        ) : <Luggage className="text-[#6B6188] mx-auto" size={48} />}
                                    </div>
                                    <p className="text-[#6B6188]">
                                        {loading ? 'Loading requests...' :
                                            searchQuery ? 'No requests found matching your search criteria' : 
                                            (coolieStatus === 'offline' ? 'You are offline. Go online to receive requests.' : 'Waiting for new booking requests...')}
                                    </p>
                                    {coolieStatus === 'offline' && !searchQuery && !loading && (
                                        <button onClick={toggleStatus} className="mt-4 px-6 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-bold text-sm hover:bg-[#5B1FCC]">
                                            Go Online
                                        </button>
                                    )}
                                </div>
                            )}

                            {filteredRequests.map(req => (
                                <RequestCard key={req.id} req={req} onAccept={handleAccept} onReject={handleReject} />
                            ))}

                            {/* ── Station Live Board ── */}
                            <div className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-white font-bold text-lg">Station Arrivals (Next 2h)</h2>
                                    <span className="text-[10px] text-[#6B6188] uppercase tracking-widest font-bold">{user?.station_name || 'New Delhi'}</span>
                                </div>
                                {loadingBoard ? (
                                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2FFF] mx-auto"></div>
                                    </div>
                                ) : stationBoard.length === 0 ? (
                                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-8 text-center text-[#6B6188] text-sm">
                                        No trains scheduled in the next 2 hours.
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {stationBoard.slice(0, 5).map((t, i) => (
                                            <div key={i} className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4 flex items-center gap-4 hover:border-[#7B2FFF]/30 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                                    <Train size={18} className="text-orange-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-bold text-sm truncate">{t.train_name}</p>
                                                    <p className="text-[#6B6188] text-[10px] font-mono">#{t.train_number} • {t.sta || '--:--'}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[#6B6188] text-[9px] uppercase font-bold mb-0.5">Platform</p>
                                                    <p className="text-orange-400 font-black text-lg">{t.platform || 'TBA'}</p>
                                                </div>
                                                <div className="shrink-0 pl-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${t.delay > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                                                        {t.delay > 0 ? `+${t.delay}m` : 'On Time'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ══ RIGHT PANEL ══ */}
                        <div className="space-y-4">

                            {/* Profile Card */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 text-center">
                                <div className="relative inline-block mb-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white font-black text-2xl border-2 border-[#7B2FFF]/30">
                                        {user?.name?.[0] || 'C'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-[#0E0C1E]">
                                        <CheckCircle size={10} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-white font-bold">{user?.name || 'Coolie'}</p>
                                <p className="text-[#6B6188] text-[11px] uppercase tracking-widest mt-0.5">Gold Tier Partner</p>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                        <p className="text-[#6B6188] text-[10px] uppercase tracking-wider">Level</p>
                                        <p className="text-white font-black text-xl mt-0.5">42</p>
                                    </div>
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                        <p className="text-[#6B6188] text-[10px] uppercase tracking-wider">XP</p>
                                        <p className="text-white font-black text-xl mt-0.5">8.4k</p>
                                    </div>
                                </div>
                            </div>

                            {/* Completed Today */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl overflow-hidden">
                                <p className="text-[#6B6188] text-[10px] uppercase tracking-widest px-4 pt-4 pb-2 font-semibold">Completed Today</p>
                                <div className="divide-y divide-[#1E1A40]">
                                    {filteredCompleted.slice(0, 3).map((c, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                                                <CheckCircle size={14} className="text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-semibold truncate">{c.label}</p>
                                                <p className="text-[#6B6188] text-[10px]">{c.time}</p>
                                            </div>
                                            <p className="text-green-400 font-black text-sm shrink-0">₹{c.amount}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Safety Alert */}
                            <div className="bg-[#0E0C1E] border border-red-900/40 rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertTriangle size={16} className="text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Safety First</p>
                                        <p className="text-[#6B6188] text-[11px] mt-1 leading-relaxed">
                                            Please use the trolleys for luggage over 30kg and maintain platform speed limits for passenger safety.
                                        </p>
                                        <button className="mt-2 text-[#7B2FFF] text-[11px] font-bold uppercase tracking-wider hover:text-[#A855F7] transition-colors">
                                            Read Guidelines →
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {showLocationModal && (
                <LocationPermissionModal 
                    onEnable={handleEnableLocation}
                    onStayOffline={() => setShowLocationModal(false)}
                    isDenied={permission === 'denied'}
                />
            )}
        </div>
    )
}
