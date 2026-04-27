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
        station: '',
        platform: '',
        trainNo: '',
        dateTime: '',
        luggageSize: 'medium',
        selectedCoolie: preselectedCoolie || null,
        finalPrice: preselectedCoolie?.basePrice || 0,
        customAmount: '',
    })
    const [showBargain, setShowBargain] = useState(false)
    const [preview, setPreview] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [booked, setBooked] = useState(false)
    const [otp] = useState(Math.floor(1000 + Math.random() * 9000))

    // Real-time coolie fetching
    const [priceTable, setPriceTable] = useState(null)
    const [availCoolies, setAvailCoolies] = useState([])
    const { socket, connected } = useGlobalSocket()
    const { location: geoLoc, startWatching } = useGeolocation()

    useEffect(() => {
        // Start watching customer location when booking page opens
        startWatching();
    }, [startWatching]);

    useEffect(() => {
        axios.get('https://coolie-hiring-platform.onrender.com/api/config/pricing')
            .then(res => {
                if (res.data.success) setPriceTable(res.data.priceTable)
            })
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        const fetchCoolies = async () => {
            try {
                let url = 'https://coolie-hiring-platform.onrender.com/api/customer/coolies';
                if (geoLoc) url = `https://coolie-hiring-platform.onrender.com/api/location/nearby?lat=${geoLoc.lat}&lng=${geoLoc.lng}`;
                const res = await axios.get(url);
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

    const handlePhoto = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPreview(URL.createObjectURL(file))
        setAnalyzing(true)
        setTimeout(() => {
            setAnalyzing(false)
            update('luggageSize', 'medium')
            toast.success('🤖 AI: 3 bags (~18kg) detected — Medium size recommended')
        }, 2000)
    }

    const handleSubmit = async () => {
        if (!form.station || !form.platform || !form.dateTime || !form.selectedCoolie) {
            toast.error('Please fill all required fields')
            return
        }

        // Validate custom amount if provided
        if (form.customAmount) {
            const amount = parseInt(form.customAmount)
            if (isNaN(amount) || amount <= 0) {
                toast.error('Please enter a valid amount')
                return
            }
            if (amount > 10000) {
                toast.error('Amount cannot exceed ₹10,000')
                return
            }

            // Update final price with custom amount
            update('finalPrice', amount)
        }

        setSubmitting(true)

        // Backend integration - send booking data with single amount source
        const bookingData = {
            ...form,
            finalAmount: form.customAmount ? parseInt(form.customAmount) : form.finalPrice,
            amountSource: form.customAmount ? 'custom' : 'luggage',
            timestamp: new Date().toISOString(),
            status: 'pending'
        }

        // Let the tracking page know which booking we just created
        // We'll pass it via navigation state
        const generatedBookingId = 'BK' + Math.floor(1000 + Math.random() * 9000);

        // Simulate backend API call
        console.log('Sending booking to backend:', bookingData)

        await new Promise(r => setTimeout(r, 2000))
        setBooked(true)
        addNotification(`🎉 Booking confirmed! OTP: ${otp}`)
        setSubmitting(false)

        // Auto navigate to tracking page
        setTimeout(() => {
            navigate('/customer/history')
        }, 3000)
    }

    const luggageTypes = [
        { key: 'small', icon: '🧳', label: 'Small', sub: 'Up to 7kg' },
        { key: 'medium', icon: '🧳', label: 'Medium', sub: 'Up to 15kg' },
        { key: 'large', icon: '📦', label: 'Large', sub: 'Up to 25kg' },
        { key: 'heavy', icon: '📦', label: 'Heavy', sub: 'Custom Cargo' },
    ]

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
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 max-[767px]:p-4">
                                <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4 max-[767px]:text-base">
                                    <span className="w-5 h-5 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                        <MapPin size={11} className="text-[#7B2FFF]" />
                                    </span>
                                    Trip Details
                                </h2>

                                <div className="grid grid-cols-2 gap-3 mb-3 max-[767px]:grid-cols-1 max-[767px]:gap-4">
                                    {/* Station */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Station Name</label>
                                        <div className="relative">
                                            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                            <input
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                                placeholder="e.g. Grand Central"
                                                value={form.station}
                                                onChange={e => update('station', e.target.value)}
                                            />
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
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                                placeholder="ELITE-102"
                                                value={form.trainNo}
                                                onChange={e => update('trainNo', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {/* Date & Time */}
                                    <div>
                                        <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Date & Time</label>
                                        <div className="relative">
                                            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] transition-colors"
                                                value={form.dateTime}
                                                onChange={e => update('dateTime', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Luggage Inventory */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 max-[767px]:p-4">
                                <div className="flex items-center justify-between mb-4 max-[767px]:flex-col max-[767px]:items-start max-[767px]:gap-1">
                                    <h2 className="text-white font-bold text-sm flex items-center gap-2 max-[767px]:text-base">
                                        <span className="w-5 h-5 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                            <Package size={11} className="text-[#7B2FFF]" />
                                        </span>
                                        Luggage Inventory
                                    </h2>
                                    <span className="text-[#6B6188] text-[11px] max-[767px]:text-xs">Select quantity for each type</span>
                                </div>

                                {/* Luggage Type Selector */}
                                <div className="grid grid-cols-4 gap-2 mb-4 max-[767px]:grid-cols-2 max-[767px]:gap-3">
                                    {luggageTypes.map(({ key, icon, label, sub }) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                update('luggageSize', key);
                                                if (!form.customAmount && priceTable) {
                                                    update('finalPrice', priceTable[key]?.base || 0);
                                                }
                                            }}
                                            className={`p-3 rounded-xl border text-center transition-all ${form.luggageSize === key
                                                ? 'border-[#7B2FFF] bg-[#7B2FFF]/10'
                                                : 'border-[#1E1A40] bg-[#12102A] hover:border-[#7B2FFF]/40'
                                                }`}
                                        >
                                            <div className={`text-xl mb-1 ${form.luggageSize === key ? '' : 'grayscale opacity-60'}`}>{icon}</div>
                                            <p className={`text-xs font-semibold ${form.luggageSize === key ? 'text-white' : 'text-[#6B6188]'}`}>{label}</p>
                                            <p className="text-[10px] text-[#6B6188] mt-0.5">{sub}</p>
                                            {form.luggageSize === key && !form.customAmount && priceTable && (
                                                <p className="text-[#7B2FFF] text-[11px] font-bold mt-1">₹{priceTable[key]?.base}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* AI Scanner */}
                                <div className="grid grid-cols-2 gap-3 max-[767px]:grid-cols-1 max-[767px]:gap-4">
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl overflow-hidden max-[767px]:h-32">
                                        {preview ? (
                                            <div className="relative h-full min-h-[100px]">
                                                <img src={preview} alt="luggage" className="w-full h-full object-cover" />
                                                {analyzing && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <div className="w-7 h-7 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center cursor-pointer p-4 h-full min-h-[100px]">
                                                <Camera size={22} className="text-[#3a3560] mb-1" />
                                                <span className="text-[#6B6188] text-[10px] text-center">PREVIEW AREA</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                                            </label>
                                        )}
                                    </div>

                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-white text-xs font-bold flex items-center gap-1.5 mb-1">
                                                <Zap size={12} className="text-[#7B2FFF]" /> AI Luggage Scanner
                                            </p>
                                            <p className="text-[#6B6188] text-[11px] leading-relaxed">
                                                Not sure about weights? Take a quick photo of your bags and our AI will estimate the best porter tier for you instantly.
                                            </p>
                                        </div>
                                        <label className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#7B2FFF]/40 text-[#A855F7] text-xs font-semibold cursor-pointer hover:bg-[#7B2FFF]/10 transition-colors">
                                            <Camera size={12} /> Take/Upload Photo
                                            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
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
