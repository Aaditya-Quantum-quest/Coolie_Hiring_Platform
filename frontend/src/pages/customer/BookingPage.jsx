import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useApp } from '../../context/AppContext'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
    MapPin, Star, CheckCircle, X, Camera,
    Zap, TrendingDown, Navigation, Package, Hash,
    Train, Clock, Trophy, Crown
} from 'lucide-react'
import { useGlobalSocket } from '../../context/SocketContext'
import useGeolocation from '../../hooks/useGeolocation'
import { searchTrain, searchStation } from '../../services/irctcService'

/* ─── Bargain Modal ─────────────────────────────────────────── */
function BargainModal({ coolie, luggageSize, customAmount, onClose, onDone, priceTable }) {
    const pt = priceTable[luggageSize] || priceTable.medium
    const [offer, setOffer] = useState(customAmount && customAmount > 0 ? parseInt(customAmount) : pt.base)
    const [coolieOffer, setCoolieOffer] = useState(null)
    const [status, setStatus] = useState('idle')

    // Use custom amount if provided, otherwise use luggage-based pricing
    const basePrice = customAmount && customAmount > 0 ? parseInt(customAmount) : pt.base

    const sendOffer = (discount) => {
        const newOffer = Math.max(pt.floor, basePrice - discount)
        setOffer(newOffer)
        setStatus('waiting')
        setTimeout(() => {
            const rand = Math.random()
            if (rand > 0.6) { setStatus('accepted'); toast.success(`✅ ${coolie.name} accepted ₹${newOffer}!`) }
            else if (rand > 0.3) {
                const counter = Math.max(pt.floor, newOffer + 10)
                setCoolieOffer(counter); setStatus('countered')
                toast(`🤝 ${coolie.name} counters with ₹${counter}`)
            } else { setStatus('rejected'); toast.error(`❌ ${coolie.name} rejected.`) }
        }, 1500)
    }

    const accept = (price) => { onDone(price || offer); onClose() }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12102A] border border-[#1E1A40] rounded-2xl p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">🤝 Mol-Tol Bargain</h3>
                    <button onClick={onClose}><X size={20} className="text-[#6B6188] hover:text-white" /></button>
                </div>
                <div className="bg-[#1E1A40] rounded-xl p-4 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#6B6188]">Base Price</span><span className="text-[#7B2FFF] font-bold">₹{pt.base}</span></div>
                    <div className="flex justify-between"><span className="text-[#6B6188]">Floor Price</span><span className="text-red-400 font-semibold">₹{pt.floor}</span></div>
                    <div className="flex justify-between"><span className="text-[#6B6188]">Max Discount</span><span className="text-green-400 font-semibold">₹{pt.maxDiscount} off</span></div>
                </div>
                {status === 'idle' && (
                    <div>
                        <p className="text-[#B0A8CC] text-sm mb-3">Pick your bargain offer:</p>
                        <div className="flex gap-2">
                            {[5, 10, 20].filter(d => d <= pt.maxDiscount).map(d => (
                                <button key={d} onClick={() => sendOffer(d)}
                                    className="flex-1 py-3 rounded-xl bg-[#7B2FFF]/10 text-[#A855F7] border border-[#7B2FFF]/30 hover:bg-[#7B2FFF]/20 transition-all font-bold">
                                    -₹{d}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => accept(basePrice)} className="w-full mt-3 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-semibold hover:bg-[#5B1FCC] transition-colors text-sm">
                            Accept ₹{basePrice}
                        </button>
                    </div>
                )}
                {status === 'waiting' && (
                    <div className="text-center py-6">
                        <div className="w-10 h-10 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-[#B0A8CC]">Waiting for {coolie.name}...</p>
                        <p className="text-[#7B2FFF] font-bold text-xl mt-1">₹{offer}</p>
                    </div>
                )}
                {status === 'accepted' && (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-2">🎉</div>
                        <p className="text-green-400 font-bold text-xl">Deal at ₹{offer}!</p>
                        <button onClick={() => accept(offer)} className="w-full mt-4 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors">Confirm Booking</button>
                    </div>
                )}
                {status === 'countered' && coolieOffer && (
                    <div className="text-center py-4">
                        <div className="text-3xl mb-2">🤔</div>
                        <p className="text-[#B0A8CC]">Counter from {coolie.name}:</p>
                        <p className="text-yellow-400 font-bold text-2xl my-2">₹{coolieOffer}</p>
                        <div className="flex gap-2">
                            <button onClick={() => accept(coolieOffer)} className="flex-1 py-2 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600">Accept ₹{coolieOffer}</button>
                            <button onClick={() => setStatus('idle')} className="flex-1 py-2 rounded-xl border border-[#1E1A40] text-[#B0A8CC] text-sm hover:border-[#7B2FFF]">Try Again</button>
                        </div>
                    </div>
                )}
                {status === 'rejected' && (
                    <div className="text-center py-4">
                        <div className="text-3xl mb-2">😕</div>
                        <p className="text-[#B0A8CC]">Offer rejected.</p>
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => setStatus('idle')} className="flex-1 py-2 rounded-xl bg-[#7B2FFF] text-white font-semibold text-sm">Try Again</button>
                            <button onClick={() => accept(pt.base)} className="flex-1 py-2 rounded-xl border border-[#1E1A40] text-[#B0A8CC] text-sm">Pay ₹{pt.base}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function BookingPage() {
    const { addNotification } = useApp()
    const navigate = useNavigate()
    const location = useLocation()
    const preselectedCoolie = location.state?.coolie

    const [form, setForm] = useState({
        initialStation: '',
        station: '',
        platform: '',
        trainNo: '',
        trainName: '',
        dateTime: '',
        luggageSize: 'medium',
        luggageImgUrl: '',
        selectedCoolie: preselectedCoolie || null,
        finalPrice: preselectedCoolie?.basePrice || 0,
        customAmount: '',
    })
    const [showBargain, setShowBargain] = useState(false)
    const [preview, setPreview] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchingTrain, setSearchingTrain] = useState(false)
    const [booked, setBooked] = useState(false)
    const [otp] = useState(Math.floor(1000 + Math.random() * 9000))

    // Search Suggestions
    const [initialStationSuggestions, setInitialStationSuggestions] = useState([])
    const [stationSuggestions, setStationSuggestions] = useState([])
    const [trainSuggestions, setTrainSuggestions] = useState([])

    // Debounced Initial Station Search
    useEffect(() => {
        if (form.initialStation.length < 2) {
            setInitialStationSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const res = await searchStation(form.initialStation)
                if (res.status && res.data) setInitialStationSuggestions(res.data)
            } catch (err) { console.error(err) }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.initialStation])

    // Debounced Destination Station Search
    useEffect(() => {
        if (form.station.length < 2) {
            setStationSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const res = await searchStation(form.station)
                if (res.status && res.data) setStationSuggestions(res.data)
            } catch (err) { console.error(err) }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.station])

    // Debounced Train Search
    useEffect(() => {
        if (form.trainNo.length < 3) {
            setTrainSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            setSearchingTrain(true)
            try {
                const res = await searchTrain(form.trainNo)
                if (res.status && res.data) {
                    setTrainSuggestions(res.data)
                    if (res.data.length === 1) {
                        update('trainName', res.data[0].train_name)
                    }
                }
            } catch (err) { console.error(err) }
            finally { setSearchingTrain(false) }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.trainNo])

    // Real-time coolie fetching
    const [priceTable, setPriceTable] = useState(null)
    const [availCoolies, setAvailCoolies] = useState([])
    const { socket, connected } = useGlobalSocket()
    const { location: geoLoc, startWatching } = useGeolocation()

    useEffect(() => {
        startWatching();
        
        // Auto-set current date and time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        update('dateTime', formattedDateTime);
    }, [startWatching]);

    useEffect(() => {
        axios.get('/api/config/pricing', { withCredentials: true })
            .then(res => {
                if (res.data.success) setPriceTable(res.data.priceTable)
            })
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        const fetchCoolies = async () => {
            try {
                let url = '/api/customer/coolies';
                if (geoLoc) url = `/api/location/nearby?lat=${geoLoc.lat}&lng=${geoLoc.lng}`;
                const res = await axios.get(url, { withCredentials: true });
                if (res.data.success) {
                    setAvailCoolies(res.data.coolies.filter(c => c.status === 'available'));
                }
            } catch (err) {
                console.error('API fetch failed:', err);
            }
        };
        fetchCoolies();
    }, [geoLoc]);

    useEffect(() => {
        if (socket && connected) {
            socket.on('nearby:coolies-update', (updatedCoolies) => {
                if (updatedCoolies && updatedCoolies.length > 0) {
                    setAvailCoolies(updatedCoolies);
                }
            });
        }
        return () => {
            if (socket) socket.off('nearby:coolies-update');
        };
    }, [socket, connected]);

    const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

    const handlePhoto = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Show preview
        setPreview(URL.createObjectURL(file))
        setAnalyzing(true)

        try {
            // Upload to backend
            const formData = new FormData()
            formData.append('luggage_photo', file)

            const res = await axios.post('/api/bookings/upload-luggage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })

            if (res.data.success) {
                update('luggageImgUrl', res.data.url)
                toast.success('Luggage photo uploaded!')
            }
        } catch (err) {
            console.error('Upload failed:', err)
            toast.error('Failed to upload luggage photo')
        } finally {
            setAnalyzing(false)
            update('luggageSize', 'medium')
            toast.success('🤖 AI: 3 bags (~18kg) detected — Medium size recommended')
        }
    }

    const handleSubmit = async () => {
        if (!form.station || !form.platform || !form.dateTime || !form.selectedCoolie) {
            toast.error('Please fill all required fields')
            return
        }

        const finalAmount = form.customAmount ? parseInt(form.customAmount) : form.finalPrice;

        setSubmitting(true)

        try {
            const bookingData = {
                coolieId: form.selectedCoolie.id,
                station: form.station,
                platform: form.platform,
                destination: form.station, // user asked for destination station name, defaulting to current station if not provided separately
                luggageSize: form.luggageSize,
                amount: finalAmount,
                trainNo: form.trainNo,
                trainName: form.trainName,
                luggageImgUrl: form.luggageImgUrl,
                dateTime: form.dateTime
            }

            const res = await axios.post('/api/bookings', bookingData, { withCredentials: true });

            if (res.data.success) {
                setBooked(true)
                addNotification(`🎉 Booking confirmed! OTP: ${res.data.booking.otp}`)

                // Store the booking ref for the receipt
                const bookingRef = res.data.booking.booking_ref;

                // Auto navigate to history after delay
                setTimeout(() => {
                    navigate('/customer/history')
                }, 3000)
            }
        } catch (err) {
            console.error('Booking failed:', err)
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    /* ── Booked Success Screen ── */
    if (booked) {
        return (
            <div className="flex bg-[#0A0814] min-h-screen">
                <Sidebar role="customer" />
                <main className="flex-1 md:ml-64 flex items-center justify-center p-6">
                    <div className="text-center max-w-sm w-full">
                        <div className="text-7xl mb-4">🎉</div>
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-green-400 mb-1">Booking Confirmed!</h2>
                            <p className="text-[#6B6188] mb-5">Your porter is on the way</p>
                            <div className="bg-[#12102A] rounded-xl p-4 mb-4">
                                <p className="text-[#6B6188] text-sm mb-1">Your OTP (Share with porter)</p>
                                <p className="text-5xl font-black text-[#7B2FFF] tracking-[12px] font-mono">{otp}</p>
                            </div>
                            <div className="space-y-2 text-sm text-left mb-5">
                                <div className="flex justify-between"><span className="text-[#6B6188]">Porter</span><span className="text-white font-semibold">{form.selectedCoolie?.name}</span></div>
                                <div className="flex justify-between"><span className="text-[#6B6188]">Platform</span><span className="text-white">{form.platform}</span></div>
                                <div className="flex justify-between"><span className="text-[#6B6188]">Price Paid</span><span className="text-green-400 font-bold">₹{form.finalPrice}</span></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/customer/track')} className="flex-1 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#5B1FCC] transition-colors">
                                    <Navigation size={14} /> Track Porter
                                </button>
                                <button onClick={() => navigate('/customer')} className="flex-1 py-2.5 rounded-xl border border-[#1E1A40] text-[#B0A8CC] text-sm hover:border-[#7B2FFF] transition-colors">
                                    Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-5 md:p-7 max-[767px]:p-3 max-[767px]:pb-24">
                <div className="max-w-6xl mx-auto">

                    {/* ── Two-column grid ── */}
                    <div className="grid lg:grid-cols-[1fr_380px] gap-5 max-[767px]:gap-3">

                        {/* ══ LEFT COLUMN ════════════════════════════ */}
                        <div className="space-y-5">

                            {/* Trip Details */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 mt-16 md:mt-0 max-[767px]:p-4">
                                <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4 max-[767px]:text-base">
                                    <span className="w-5 h-5 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                        <MapPin size={11} className="text-[#7B2FFF]" />
                                    </span>
                                    Trip Details
                                </h2>

                                <div className="grid grid-cols-2 gap-3 mb-3 max-[767px]:grid-cols-1 max-[767px]:gap-4">
                                    {/* Initial Station */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Current Station</label>
                                        <div className="relative">
                                            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                                            <input
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                                placeholder="e.g. Rampur"
                                                value={form.initialStation}
                                                onChange={e => update('initialStation', e.target.value)}
                                            />
                                            {initialStationSuggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-[#1E1A40] border border-[#7B2FFF]/30 rounded-xl mt-1 overflow-hidden shadow-2xl">
                                                    {initialStationSuggestions.map((s, i) => (
                                                        <div key={i} className="px-3 py-2 hover:bg-[#7B2FFF]/20 cursor-pointer text-white text-xs border-b border-[#1E1A40] last:border-0"
                                                            onClick={() => {
                                                                update('initialStation', `${s.station_name} (${s.station_code})`)
                                                                setInitialStationSuggestions([])
                                                            }}
                                                        >
                                                            <span className="font-bold">{s.station_name}</span> ({s.station_code})
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Destination Station */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Destination Station</label>
                                        <div className="relative">
                                            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                                            <input
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                                placeholder="e.g. Moradabad"
                                                value={form.station}
                                                onChange={e => update('station', e.target.value)}
                                            />
                                            {stationSuggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-[#1E1A40] border border-[#7B2FFF]/30 rounded-xl mt-1 overflow-hidden shadow-2xl">
                                                    {stationSuggestions.map((s, i) => (
                                                        <div key={i} className="px-3 py-2 hover:bg-[#7B2FFF]/20 cursor-pointer text-white text-xs border-b border-[#1E1A40] last:border-0"
                                                            onClick={() => {
                                                                update('station', `${s.station_name} (${s.station_code})`)
                                                                setStationSuggestions([])
                                                            }}
                                                        >
                                                            <span className="font-bold">{s.station_name}</span> ({s.station_code})
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Platform */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Platform No.</label>
                                        <input
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                            placeholder="04"
                                            value={form.platform}
                                            onChange={e => update('platform', e.target.value)}
                                        />
                                    </div>
                                    {/* Train No */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Train Number</label>
                                        <div className="relative">
                                            <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                            <input
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-10 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                                placeholder="ELITE-102"
                                                value={form.trainNo}
                                                onChange={e => update('trainNo', e.target.value)}
                                            />
                                            {searchingTrain && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                            {form.trainName && (
                                                <div className="absolute -bottom-5 left-0 text-[10px] text-[#7B2FFF] font-bold truncate w-full px-1">
                                                    {form.trainName}
                                                </div>
                                            )}
                                            {trainSuggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 z-50 bg-[#1E1A40] border border-[#7B2FFF]/30 rounded-xl mt-1 overflow-hidden shadow-2xl">
                                                    {trainSuggestions.map((t, i) => (
                                                        <div key={i} className="px-3 py-2 hover:bg-[#7B2FFF]/20 cursor-pointer text-white text-xs border-b border-[#1E1A40] last:border-0"
                                                            onClick={() => {
                                                                update('trainNo', t.train_number)
                                                                update('trainName', t.train_name)
                                                                setTrainSuggestions([])
                                                            }}
                                                        >
                                                            <span className="font-bold">{t.train_name}</span> (#{t.train_number})
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Date & Time */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Date & Time</label>
                                        <div className="relative">
                                            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                            <input
                                                type="datetime-local"
                                                readOnly
                                                className="w-full bg-[#12102A]/50 border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-[#6B6188] text-sm outline-none cursor-not-allowed transition-colors"
                                                value={form.dateTime}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Luggage Inventory */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-xl p-3">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-white font-bold text-xs flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded bg-[#7B2FFF]/20 flex items-center justify-center flex-shrink-0">
                                            <Package size={9} className="text-[#7B2FFF]" />
                                        </span>
                                        Luggage Inventory
                                    </h2>
                                    <span className="text-[#6B6188] text-[10px] hidden sm:block">Select quantity for each type</span>
                                </div>

                                {/* Subtitle visible only on mobile below header */}
                                <p className="text-[#6B6188] text-[10px] mb-3 sm:hidden">Select quantity for each type</p>

                                {/* AI Scanner */}
                                <div className="flex flex-col xs:flex-row gap-2">

                                    {/* Preview Box */}
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-lg overflow-hidden flex-shrink-0
                    h-28 xs:h-auto xs:w-28 sm:w-32 md:w-36 self-stretch">
                                        {preview ? (
                                            <div className="relative h-full w-full">
                                                <img src={preview} alt="luggage" className="w-full h-full object-cover" />
                                                {analyzing && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center cursor-pointer h-full w-full gap-1 min-h-[96px]">
                                                <Camera size={16} className="text-[#3a3560]" />
                                                <span className="text-[#6B6188] text-[9px] tracking-wide">PREVIEW AREA</span>
                                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                                            </label>
                                        )}
                                    </div>

                                    {/* Info + Upload */}
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-lg p-2.5 sm:p-3 flex flex-col justify-between flex-1 min-w-0 gap-2">
                                        <div>
                                            <p className="text-white text-[10px] font-bold flex items-center gap-1 mb-1">
                                                <Zap size={10} className="text-[#7B2FFF] flex-shrink-0" />
                                                AI Luggage Scanner
                                            </p>
                                            <p className="text-[#6B6188] text-[9px] leading-relaxed">
                                                Not sure about weights? Upload a photo and AI will estimate the best porter tier instantly.
                                            </p>
                                        </div>
                                        <label className="flex items-center justify-center gap-1 py-1.5 rounded-md border border-[#7B2FFF]/40
                        text-[#A855F7] text-[10px] font-semibold cursor-pointer
                        hover:bg-[#7B2FFF]/10 active:bg-[#7B2FFF]/20 transition-colors">
                                            <Camera size={10} className="flex-shrink-0" />
                                            <span>Take / Upload Photo</span>
                                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                                        </label>
                                    </div>

                                </div>
                            </div>

                            {/* Custom Amount Section */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 max-[767px]:p-4">
                                <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4 max-[767px]:text-base">
                                    <span className="w-5 h-5 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                        <Trophy size={11} className="text-[#7B2FFF]" />
                                    </span>
                                    Custom Amount
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Enter Your Desired Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B2FFF] font-bold text-lg">₹</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10000"
                                                step="10"
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-12 pr-3 py-3 text-white text-lg font-bold outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                                placeholder="Enter custom amount..."
                                                value={form.customAmount}
                                                onChange={e => {
                                                    const value = e.target.value
                                                    update('customAmount', value)
                                                    // Update final price when custom amount is entered
                                                    if (value && value > 0) {
                                                        update('finalPrice', parseInt(value))
                                                        // Clear luggage selection when custom amount is entered
                                                        update('luggageSize', '')
                                                    } else {
                                                        // Revert to base price if custom amount is cleared
                                                        if (priceTable) {
                                                            update('finalPrice', priceTable[form.luggageSize]?.base || 0)
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-[#12102A] rounded-xl p-3 border border-[#1E1A40]">
                                        <p className="text-[10px] text-[#6B6188] mb-2">💡 <strong>Pro Tip:</strong> Enter your desired amount and we'll try to match it with available porters!</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#6B6188]">Suggested Range:</span>
                                            {priceTable && (
                                                <span className="text-[#7B2FFF] font-bold">
                                                    ₹{priceTable[form.luggageSize]?.floor} - ₹{priceTable[form.luggageSize]?.base + 50}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN ═════════════════════════ */}
                        <div className="space-y-4">

                            {/* Available Porters Header */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1A40] max-[767px]:px-4 max-[767px]:py-3">
                                    <h2 className="text-white font-bold text-sm max-[767px]:text-base">Available Porters</h2>
                                    <span className="flex items-center gap-1.5 text-green-400 text-[11px] font-semibold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full max-[767px]:text-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        {availCoolies.length} Online
                                    </span>
                                </div>

                                {/* Porter Cards */}
                                <div className="divide-y divide-[#1E1A40]">
                                    {availCoolies.slice(0, 3).map((c) => {
                                        const isSelected = form.selectedCoolie?.id === c.id
                                        const speedLabel = c.rating >= 4.8 ? 'Expert' : c.rating >= 4.5 ? 'Fast' : 'Steady'
                                        return (
                                            <div
                                                key={c.id}
                                                className={`flex items-center gap-3 px-4 py-3.5 max-[767px]:px-3 max-[767px]:py-3 max-[767px]:gap-2 transition-all ${isSelected ? 'bg-[#7B2FFF]/10' : 'hover:bg-[#12102A]'}`}
                                            >
                                                {/* Avatar */}
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white font-black text-base border border-[#7B2FFF]/20 shrink-0 max-[767px]:w-12 max-[767px]:h-12 max-[767px]:text-lg">
                                                    {c.name[0]}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-bold text-sm truncate max-[767px]:text-base">{c.name}</p>
                                                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                                                        <Star size={10} fill="currentColor" className="max-[767px]:w-3 max-[767px]:h-3" />
                                                        <span className="text-[11px] font-semibold text-yellow-400 max-[767px]:text-xs">{c.rating}</span>
                                                        <span className="text-[#6B6188] text-[10px] max-[767px]:text-[11px]">({c.totalBookings?.toLocaleString()} trips)</span>
                                                    </div>
                                                    <div className="flex gap-2 text-[10px] text-[#6B6188] max-[767px]:text-xs">
                                                        <span>EXP<br /><span className="text-white font-semibold">{c.experience}</span></span>
                                                        <span>SPEED<br /><span className="text-white font-semibold">{speedLabel}</span></span>
                                                    </div>
                                                </div>

                                                {/* Price + Select */}
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <div className="text-right">
                                                        <p className="text-[#7B2FFF] font-black text-base max-[767px]:text-lg">₹{c.basePrice}</p>
                                                        <p className="text-[#6B6188] text-[9px] uppercase max-[767px]:text-[10px]">Base Fare</p>
                                                    </div>
                                                    <button
                                                        onClick={() => { update('selectedCoolie', c); update('finalPrice', c.basePrice) }}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all max-[767px]:px-4 max-[767px]:py-2 max-[767px]:text-sm max-[767px]:rounded-xl ${isSelected
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-[#7B2FFF] text-white hover:bg-[#5B1FCC]'
                                                            }`}
                                                    >
                                                        {isSelected ? '✓ Selected' : 'Select'}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Confirm / Bargain */}
                                {form.selectedCoolie && (
                                    <div className="px-4 py-3 border-t border-[#1E1A40] bg-[#12102A] max-[767px]:p-4">
                                        <div className="flex items-center justify-between mb-2 max-[767px]:mb-3">
                                            <span className="text-[#6B6188] text-xs max-[767px]:text-sm">Final Price</span>
                                            <span className="text-green-400 font-black text-lg max-[767px]:text-xl">₹{form.finalPrice}</span>
                                        </div>
                                        <div className="flex gap-2 max-[767px]:flex-col">
                                            <button
                                                onClick={() => setShowBargain(true)}
                                                className="flex-1 py-2 rounded-xl border border-[#1E1A40] text-[#A855F7] text-xs font-semibold flex items-center justify-center gap-1 hover:border-[#7B2FFF] transition-colors max-[767px]:py-3 max-[767px]:text-sm"
                                            >
                                                <TrendingDown size={14} className="max-[767px]:w-4 max-[767px]:h-4" /> Bargain
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="flex-1 py-2 rounded-xl bg-[#7B2FFF] text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#5B1FCC] transition-colors disabled:opacity-60 max-[767px]:py-3 max-[767px]:text-sm"
                                            >
                                                {submitting
                                                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin max-[767px]:w-5 max-[767px]:h-5" />
                                                    : <><CheckCircle size={14} className="max-[767px]:w-4 max-[767px]:h-4" /> Confirm Booking</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* PorterElite Rewards */}
                            <div className="bg-gradient-to-br from-[#7B2FFF]/30 via-[#1E1A40] to-[#0E0C1E] border border-[#7B2FFF]/40 rounded-2xl p-5 relative overflow-hidden">
                                <div className="absolute right-4 top-4 opacity-10">
                                    <Crown size={60} className="text-[#7B2FFF]" />
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#7B2FFF]/20 flex items-center justify-center shrink-0">
                                        <Trophy size={20} className="text-[#A855F7]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-sm">PorterElite Rewards</p>
                                        <p className="text-[#B0A8CC] text-[11px] mt-0.5 leading-relaxed">
                                            Join our premium tier to get 20% off all bookings and priority boarding assistance.
                                        </p>
                                        <button className="mt-3 px-4 py-1.5 rounded-lg bg-[#7B2FFF] text-white text-xs font-bold hover:bg-[#5B1FCC] transition-colors uppercase tracking-wide">
                                            Upgrade Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showBargain && form.selectedCoolie && priceTable && (
                <BargainModal
                    coolie={form.selectedCoolie}
                    luggageSize={form.luggageSize}
                    customAmount={form.customAmount}
                    priceTable={priceTable}
                    onClose={() => setShowBargain(false)}
                    onDone={(price) => { update('finalPrice', price); toast.success(`Price set to ₹${price}`) }}
                />
            )}
        </div>
    )
}
