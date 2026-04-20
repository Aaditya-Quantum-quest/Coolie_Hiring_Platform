import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { COOLIES } from '../../data/mockData'
import { Navigation, Clock, Phone, MessageSquare, Star, Navigation2, KeyRound, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Fix leaflet default marker
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const coolieIcon = L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#3b82f6,#06b6d4);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5)">👷</div>`,
    className: '', iconSize: [36, 36], iconAnchor: [18, 18],
})

const customerIcon = L.divIcon({
    html: `<div style="background:linear-gradient(135deg,#f97316,#ea580c);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;border:3px solid white;box-shadow:0 4px 12px rgba(249,115,22,0.5)">🧍</div>`,
    className: '', iconSize: [36, 36], iconAnchor: [18, 18],
})

const CUSTOMER_POS = [28.6410, 77.2190]

export default function TrackCoolie() {
    const coolie = COOLIES[0]
    const [cooliePos, setCooliePos] = useState([coolie.lat, coolie.lng])
    const [eta, setEta] = useState(180)
    const [status, setStatus] = useState('On the way')
    const [otpVerified, setOtpVerified] = useState(false)
    const [enteredOtp, setEnteredOtp] = useState(['', '', '', ''])
    const otpRefs = [useRef(), useRef(), useRef(), useRef()]
    const CORRECT_OTP = ['4', '5', '2', '1']

    // Simulate coolie moving toward customer
    useEffect(() => {
        const interval = setInterval(() => {
            setCooliePos(prev => {
                const latDiff = CUSTOMER_POS[0] - prev[0]
                const lngDiff = CUSTOMER_POS[1] - prev[1]
                const dist = Math.sqrt(latDiff ** 2 + lngDiff ** 2)
                if (dist < 0.001) {
                    setStatus('Arrived!')
                    clearInterval(interval)
                    return prev
                }
                return [prev[0] + latDiff * 0.02, prev[1] + lngDiff * 0.02]
            })
            setEta(prev => Math.max(0, prev - 3))
        }, 1500)
        return () => clearInterval(interval)
    }, [])

    const handleOtpInput = (i, val) => {
        if (!/^\d?$/.test(val)) return
        const newOtp = [...enteredOtp]
        newOtp[i] = val
        setEnteredOtp(newOtp)
        if (val && i < 3) otpRefs[i + 1].current?.focus()
    }

    const verifyOtp = () => {
        if (enteredOtp.join('') === CORRECT_OTP.join('')) {
            setOtpVerified(true)
            toast.success('✅ OTP Verified! Luggage handover confirmed. Work started!')
        } else {
            toast.error('❌ Wrong OTP. Try: 4521')
        }
    }

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-6">
                <div className="pt-12 md:pt-0 mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Navigation2 size={24} className="text-orange-400" /> Track Your Coolie</h1>
                    <p className="text-slate-400 text-sm">Live location tracking via GPS</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="card overflow-hidden" style={{ height: 450 }}>
                            <MapContainer
                                center={[28.6415, 77.2192]}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                />
                                {/* Coolie */}
                                <Marker position={cooliePos} icon={coolieIcon}>
                                    <Popup>
                                        <div style={{ fontFamily: 'Inter, sans-serif' }}>
                                            <strong>👷 {coolie.name}</strong>
                                            <br /><span style={{ color: '#f97316' }}>ETA: {formatTime(eta)}</span>
                                        </div>
                                    </Popup>
                                </Marker>
                                {/* Customer */}
                                <Marker position={CUSTOMER_POS} icon={customerIcon}>
                                    <Popup><strong>📍 You are here</strong></Popup>
                                </Marker>
                                {/* Route line */}
                                <Polyline positions={[cooliePos, CUSTOMER_POS]} color="#f97316" weight={3} dashArray="8 4" />
                                {/* Radius */}
                                <Circle center={CUSTOMER_POS} radius={50} color="#f97316" fillOpacity={0.1} />
                            </MapContainer>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">🗺 Live tracking updates every 1.5 seconds</p>
                    </div>

                    {/* Info Panel */}
                    <div className="space-y-4">
                        {/* Coolie Card */}
                        <div className="card p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                                    {coolie.name[0]}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{coolie.name}</p>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs text-slate-400">{coolie.rating} • {coolie.totalBookings} trips</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`text-sm font-bold text-center py-2 rounded-xl ${status === 'Arrived!' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/10 text-orange-400'
                                } mb-3`}>
                                {status === 'Arrived!' ? (
                                    <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-sm">
                                        <CheckCircle2 size={18} /> Coolie Has Arrived!
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-orange-400 font-bold text-sm">
                                        <Navigation size={16} className="animate-pulse" /> {status}
                                    </div>
                                )}
                            </div>
                            {status !== 'Arrived!' && (
                                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-slate-400 mb-1">Estimated Time</p>
                                    <p className={`text-3xl font-mono font-black ${eta < 30 ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>{formatTime(eta)}</p>
                                </div>
                            )}
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => toast.success('Calling coolie...')} className="flex-1 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/30 text-sm font-semibold hover:bg-green-500/20 transition-all flex items-center justify-center gap-1">
                                    <Phone size={14} /> Call
                                </button>
                                <button onClick={() => toast.success('Message sent!')} className="flex-1 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-sm font-semibold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1">
                                    <MessageSquare size={14} /> Message
                                </button>
                            </div>
                        </div>

                        {/* OTP Handover */}
                        <div className="card p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><KeyRound size={16} className="text-orange-400" /> OTP Handover</h3>
                            {otpVerified ? (
                                <div className="text-center py-2">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 size={36} className="text-green-400" />
                                    </div>
                                    <p className="text-green-400 font-bold">Handover Confirmed!</p>
                                    <p className="text-slate-400 text-sm">Work has started</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-400 text-xs mb-3">Enter the 4-digit OTP from your booking to confirm luggage handover</p>
                                    <div className="flex gap-2 mb-3 justify-center">
                                        {enteredOtp.map((d, i) => (
                                            <input
                                                key={i}
                                                ref={otpRefs[i]}
                                                className="otp-input"
                                                maxLength={1}
                                                value={d}
                                                onChange={e => handleOtpInput(i, e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Backspace' && !d && i > 0) otpRefs[i - 1].current?.focus()
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <button onClick={verifyOtp} className="btn-primary w-full py-2 text-sm">Verify OTP</button>
                                    <p className="text-xs text-slate-600 text-center mt-2">Demo OTP: 4521</p>
                                </>
                            )}
                        </div>

                        {/* Booking Info */}
                        <div className="card p-4 text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">Booking ID</span><span className="text-white font-mono">BK003</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Platform</span><span className="text-white">Platform 1</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Destination</span><span className="text-white">Auto Stand</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Amount</span><span className="text-green-400 font-bold">₹150</span></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
