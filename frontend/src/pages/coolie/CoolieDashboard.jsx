import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    CheckCircle, XCircle, Clock, Star, Package,
    MapPin, Activity, AlertTriangle, Luggage, User
} from 'lucide-react'
import toast from 'react-hot-toast'

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
    const CORRECT_OTP = '4521'

    const verifyOtp = () => {
        if (otp === CORRECT_OTP) { setOtpVerified(true); toast.success('OTP Verified! Job started ✅') }
        else toast.error('Wrong OTP!')
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
    const [status, setStatus] = useState('available')
    const [requests, setRequests] = useState(INITIAL_REQUESTS)
    const [activeJob, setActiveJob] = useState(null)
    const [completedToday, setCompletedToday] = useState(COMPLETED)
    const [shiftSeconds, setShiftSeconds] = useState(6 * 3600 + 42 * 60 + 15)

    // Shift clock
    useEffect(() => {
        const t = setInterval(() => setShiftSeconds(s => s + 1), 1000)
        return () => clearInterval(t)
    }, [])

    const formatShift = (s) => {
        const h = String(Math.floor(s / 3600)).padStart(2, '0')
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
        const sec = String(s % 60).padStart(2, '0')
        return `${h}:${m}:${sec}`
    }

    const toggleStatus = () => {
        if (status === 'available') { setStatus('offline'); toast('You are now offline', { icon: '💤' }) }
        else { setStatus('available'); toast.success('You are AVAILABLE! 🔔') }
    }

    const handleAccept = (id) => {
        const req = requests.find(r => r.id === id)
        setActiveJob({ ...req })
        setRequests([])
        setStatus('onduty')
        toast.success('Booking Accepted! 🏃')
    }

    const handleReject = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id))
        toast('Request rejected', { icon: '❌' })
    }

    const handleComplete = () => {
        const newEntry = { label: `Job #${activeJob.id}`, time: 'Completed just now', amount: activeJob.price }
        setCompletedToday(prev => [newEntry, ...prev])
        setActiveJob(null)
        setStatus('available')
        toast.success('Job completed! ✅')
    }

    const STATS = [
        { label: 'TOTAL EARNINGS', value: '₹1,240', icon: '💰', change: '+12%', color: 'text-green-400' },
        { label: 'TRIPS TODAY',    value: '08',     icon: '🔁', color: 'text-[#A855F7]' },
        { label: 'AVG RATING',     value: '4.92',   icon: '⭐', color: 'text-yellow-400' },
        { label: 'PENDING',        value: String(requests.length).padStart(2,'0'), icon: '🕐', color: 'text-[#7B2FFF]' },
    ]

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="coolie" />
            <main className="flex-1 md:ml-64 p-5 md:p-7">
                <div className="max-w-6xl mx-auto space-y-5">

                    {/* ── Hero Header ── */}
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Active Duty
                                    </span>
                                    <span className="text-[#6B6188] text-[11px] font-mono">#CL-1042</span>
                                </div>
                                <h1 className="text-white text-3xl font-black leading-tight">Ramesh Kumar</h1>
                                <p className="text-[#6B6188] text-sm flex items-center gap-1 mt-1">
                                    <MapPin size={12} /> New Delhi Railway Station
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#6B6188] text-[10px] uppercase tracking-widest mb-1">Today's Shift</p>
                                <p className="text-white font-black text-3xl font-mono tracking-wider">{formatShift(shiftSeconds)}</p>
                                <button
                                    onClick={toggleStatus}
                                    className={`mt-2 text-[11px] px-3 py-1 rounded-full font-bold border transition-all ${
                                        status === 'available' || status === 'onduty'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                            : 'bg-[#1E1A40] text-[#6B6188] border-[#1E1A40] hover:border-[#7B2FFF]'
                                    }`}
                                >
                                    {status === 'offline' ? '● Go Online' : '● Online — Tap to go offline'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {STATS.map((s, i) => (
                            <div key={i} className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xl">{s.icon}</span>
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

                            {requests.length === 0 && !activeJob && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-10 text-center">
                                    <div className="text-4xl mb-3">🕐</div>
                                    <p className="text-[#6B6188]">
                                        {status === 'offline' ? 'You are offline. Go online to receive requests.' : 'Waiting for new booking requests...'}
                                    </p>
                                    {status === 'offline' && (
                                        <button onClick={toggleStatus} className="mt-4 px-6 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-bold text-sm hover:bg-[#5B1FCC]">
                                            Go Online
                                        </button>
                                    )}
                                </div>
                            )}

                            {requests.map(req => (
                                <RequestCard key={req.id} req={req} onAccept={handleAccept} onReject={handleReject} />
                            ))}
                        </div>

                        {/* ══ RIGHT PANEL ══ */}
                        <div className="space-y-4">

                            {/* Profile Card */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 text-center">
                                <div className="relative inline-block mb-3">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white font-black text-2xl border-2 border-[#7B2FFF]/30">
                                        R
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-[#0E0C1E]">
                                        <CheckCircle size={10} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-white font-bold">Ramesh Kumar</p>
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
                                    {completedToday.slice(0, 3).map((c, i) => (
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
        </div>
    )
}
