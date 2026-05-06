import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { Navigation, Star, Navigation2, CheckCircle2, Loader, MapPin, Flag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGlobalSocket } from '../../context/SocketContext'

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

// Status flow steps
const STATUS_STEPS = ['confirmed', 'arrived', 'in_progress', 'completed']
const STATUS_LABELS = {
    confirmed: 'Confirmed',
    arrived: 'Coolie Arrived',
    in_progress: 'Trip Started',
    completed: 'Completed',
}

export default function TrackCoolie() {
    const locState = useLocation().state || {}
    const navigate = useNavigate()
    const [coolie, setCoolie] = useState(locState.coolie || null)
    const bookingId = locState.bookingId || locState.booking?.booking_ref || locState.booking?.id || 'BK003'
    const booking = locState.booking || {}

    const [cooliePos, setCooliePos] = useState([28.6420, 77.2200])
    const [eta, setEta] = useState(180)
    const [bookingStatus, setBookingStatus] = useState(booking.status || 'confirmed')
    const [enteredOtp, setEnteredOtp] = useState(['', '', '', ''])
    const [verifying, setVerifying] = useState(false)
    const [completing, setCompleting] = useState(false)
    const otpRefs = [useRef(), useRef(), useRef(), useRef()]

    const { socket, connected } = useGlobalSocket()

    useEffect(() => {
        if (!coolie) {
            axios.get('/api/customer/coolies', { withCredentials: true })
                .then(res => {
                    if (res.data.success && res.data.coolies.length > 0) {
                        const c = res.data.coolies[0]
                        setCoolie(c)
                        if (c.lat && c.lng) setCooliePos([c.lat, c.lng])
                    }
                })
                .catch(err => console.error(err))
        } else if (coolie.lat && coolie.lng) {
            setCooliePos([coolie.lat, coolie.lng])
        }
    }, [coolie])

    // Real-time socket events
    useEffect(() => {
        if (!socket || !connected) return

        socket.emit('customer:request-tracking', { bookingId })

        socket.on('coolie:location-changed', (data) => {
            setCooliePos([data.lat, data.lng])
            const latDiff = CUSTOMER_POS[0] - data.lat
            const lngDiff = CUSTOMER_POS[1] - data.lng
            setEta(Math.floor(Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 10000))
        })

        // Step 4: Coolie confirms arrival
        socket.on('booking:coolie-arrived', () => {
            setBookingStatus('arrived')
            setEta(0)
            toast.success('🎉 Your coolie has arrived! Enter OTP to start the trip.', { duration: 6000 })
        })

        // Step 5: Trip started (OTP verified)
        socket.on('booking:trip-started', () => {
            setBookingStatus('in_progress')
            toast.success('✅ Trip started! Porter is heading to your destination.')
        })

        // Step 6: Trip completed
        socket.on('booking:completed', () => {
            setBookingStatus('completed')
        })

        return () => {
            socket.emit('customer:stop-tracking', { bookingId })
            socket.off('coolie:location-changed')
            socket.off('booking:coolie-arrived')
            socket.off('booking:trip-started')
            socket.off('booking:completed')
        }
    }, [socket, connected, bookingId])

    const handleOtpInput = (i, val) => {
        if (!/^\d?$/.test(val)) return
        const newOtp = [...enteredOtp]
        newOtp[i] = val
        setEnteredOtp(newOtp)
        if (val && i < 3) otpRefs[i + 1].current?.focus()
    }

    const handleOtpKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !enteredOtp[i] && i > 0) {
            otpRefs[i - 1].current?.focus()
        }
    }

    // Step 5: Verify OTP → calls backend → sets in_progress
    const verifyOtp = async () => {
        const otpStr = enteredOtp.join('')
        if (otpStr.length !== 4) {
            toast.error('Please enter the complete 4-digit OTP')
            return
        }
        setVerifying(true)
        try {
            const res = await axios.post(
                `/api/bookings/${bookingId}/verify-otp-and-start`,
                { otp: otpStr },
                { withCredentials: true }
            )
            if (res.data.success) {
                setBookingStatus('in_progress')
                toast.success('✅ OTP Verified! Trip has started!')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.')
        } finally {
            setVerifying(false)
        }
    }

    // Step 6: Mark destination reached → calls backend → navigate to payment
    const handleCompleteTrip = async () => {
        setCompleting(true)
        try {
            const res = await axios.post(
                `/api/bookings/${bookingId}/complete`,
                {},
                { withCredentials: true }
            )
            if (res.data.success) {
                setBookingStatus('completed')
                toast.success('🎉 Trip completed! Redirecting to payment...')
                setTimeout(() => {
                    navigate('/customer/payment', { state: { booking: { ...booking, ...res.data.booking } } })
                }, 2000)
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete trip.')
        } finally {
            setCompleting(false)
        }
    }

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
    const stepIndex = STATUS_STEPS.indexOf(bookingStatus)

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-6 max-[767px]:p-3 max-[767px]:pb-24">
                <div className="pt-12 md:pt-0 mb-4">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 max-[767px]:text-lg">
                        <Navigation2 size={24} className="text-orange-400" />
                        Track Your Coolie
                    </h1>
                    <p className="text-slate-400 text-sm max-[767px]:text-xs">Booking #{bookingId} • Live GPS tracking</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
                    {STATUS_STEPS.map((step, i) => {
                        const done = i < stepIndex
                        const active = i === stepIndex
                        return (
                            <React.Fragment key={step}>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                                    done ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    active ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' :
                                    'bg-slate-800/50 text-slate-500 border-slate-700/30'
                                }`}>
                                    {done && <CheckCircle2 size={11} />}
                                    {STATUS_LABELS[step]}
                                </div>
                                {i < 3 && <div className={`h-px flex-1 min-w-[12px] ${i < stepIndex ? 'bg-green-500/40' : 'bg-slate-700/40'}`} />}
                            </React.Fragment>
                        )
                    })}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 max-[767px]:gap-3">
                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="card overflow-hidden h-[420px] max-[767px]:h-[280px]">
                            <MapContainer
                                center={[28.6415, 77.2192]}
                                zoom={16}
                                style={{ height: '100%', width: '100%', zIndex: 0 }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap'
                                />
                                {coolie && (
                                    <Marker position={cooliePos} icon={coolieIcon}>
                                        <Popup>
                                            <strong>👷 {coolie.name}</strong><br />
                                            <span style={{ color: '#f97316' }}>ETA: {formatTime(eta)}</span>
                                        </Popup>
                                    </Marker>
                                )}
                                <Marker position={CUSTOMER_POS} icon={customerIcon}>
                                    <Popup><strong>📍 You are here</strong></Popup>
                                </Marker>
                                <Polyline positions={[cooliePos, CUSTOMER_POS]} color="#f97316" weight={3} dashArray="8 4" />
                                <Circle center={CUSTOMER_POS} radius={50} color="#f97316" fillOpacity={0.1} />
                            </MapContainer>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">🗺 Live tracking updates every 1.5 seconds</p>
                    </div>

                    {/* Info Panel */}
                    <div className="space-y-4 max-[767px]:space-y-3">

                        {/* Coolie Card */}
                        {coolie && (
                            <div className="card p-4 max-[767px]:p-3">
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

                                {/* Status Badge */}
                                <div className={`text-sm font-bold text-center py-2 rounded-xl mb-3 ${
                                    bookingStatus === 'arrived' ? 'bg-green-500/20 text-green-400' :
                                    bookingStatus === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                    bookingStatus === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-orange-500/10 text-orange-400'
                                }`}>
                                    {bookingStatus === 'arrived' && '✅ Coolie Has Arrived!'}
                                    {bookingStatus === 'in_progress' && '🏃 Trip In Progress'}
                                    {bookingStatus === 'completed' && '🎉 Trip Completed!'}
                                    {bookingStatus === 'confirmed' && (
                                        <div className="flex items-center justify-center gap-2">
                                            <Navigation size={16} className="animate-pulse" /> On the Way
                                        </div>
                                    )}
                                </div>

                                {/* ETA */}
                                {bookingStatus === 'confirmed' && (
                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-slate-400 mb-1">Estimated Time</p>
                                        <p className={`text-3xl font-mono font-black ${eta < 30 ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>
                                            {formatTime(eta)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 5: OTP Verification (shown when coolie arrives) */}
                        {bookingStatus === 'arrived' && (
                            <div className="card p-4 border border-purple-500/40">
                                <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">🔑 Enter Your OTP</p>
                                <p className="text-slate-400 text-xs mb-3">The 4-digit OTP you received after booking</p>
                                <div className="flex gap-2 justify-center mb-3">
                                    {enteredOtp.map((d, i) => (
                                        <input
                                            key={i}
                                            ref={otpRefs[i]}
                                            maxLength={1}
                                            className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-xl text-white text-xl text-center font-mono tracking-widest outline-none focus:border-purple-500 transition-colors"
                                            value={d}
                                            onChange={e => handleOtpInput(i, e.target.value)}
                                            onKeyDown={e => handleOtpKeyDown(i, e)}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={verifyOtp}
                                    disabled={verifying || enteredOtp.join('').length !== 4}
                                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {verifying ? <><Loader size={14} className="animate-spin" /> Verifying...</> : '✅ Verify & Start Trip'}
                                </button>
                            </div>
                        )}

                        {/* STEP 6: Complete Trip (shown when trip is in_progress) */}
                        {bookingStatus === 'in_progress' && (
                            <div className="card p-4 border border-blue-500/40">
                                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">🏃 Trip In Progress</p>
                                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                                    Your porter is carrying your luggage. Press the button below once you've reached your destination.
                                </p>
                                <button
                                    onClick={handleCompleteTrip}
                                    disabled={completing}
                                    className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {completing
                                        ? <><Loader size={14} className="animate-spin" /> Processing...</>
                                        : <><Flag size={14} /> I've Reached My Destination</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* STEP 7: Completed — redirect to payment */}
                        {bookingStatus === 'completed' && (
                            <div className="card p-4 border border-green-500/40 text-center">
                                <CheckCircle2 size={40} className="text-green-400 mx-auto mb-2" />
                                <p className="text-green-400 font-bold mb-1">Trip Completed!</p>
                                <p className="text-slate-400 text-xs mb-4">Redirecting to payment...</p>
                                <button
                                    onClick={() => navigate('/customer/payment', { state: { booking } })}
                                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-colors"
                                >
                                    Go to Payment →
                                </button>
                            </div>
                        )}

                        {/* Location Info */}
                        {booking.platform && (
                            <div className="card p-3">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <MapPin size={12} className="text-orange-400" />
                                    <span>Platform {booking.platform} • {booking.destination_station_name || booking.station}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
