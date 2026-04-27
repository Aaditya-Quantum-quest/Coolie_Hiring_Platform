import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import {
    CreditCard, Smartphone, CheckCircle, Lock,
    Shield, Loader, Star, MapPin, Building2, Zap, QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'

const BOOKING = {
    id: 'BK-2024-1847',
    coolie: 'Rajesh Kumar',
    coolieRating: 4.8,
    coolieTrips: 1240,
    badge: 'Verified Elite Porter',
    pickup: 'New Delhi Rly Stn',
    dropoff: 'Main Exit Gate',
    basePrice: 100,
    discount: 10,
    finalPrice: 90,
}

/* ── Payment Success Overlay ─────────────────────────────── */
function PaymentSuccess({ amount, onDone }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-8 max-w-sm w-full text-center space-y-5
                max-[767px]:p-6 max-[767px]:space-y-4 max-[767px]:rounded-xl">
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-green-500/15 border-2 border-green-500/50 flex items-center justify-center mx-auto
                        max-[767px]:w-18 max-[767px]:h-18">
                        <CheckCircle size={48} className="text-green-400 max-[767px]:w-10 max-[767px]:h-10" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-2xl animate-bounce max-[767px]:text-xl">🎉</div>
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white mb-1 max-[767px]:text-xl">Payment Successful!</h2>
                    <p className="text-[#6B6188] text-sm max-[767px]:text-xs">Your booking is confirmed</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-4 max-[767px]:p-3">
                    <p className="text-3xl font-black text-green-400 max-[767px]:text-2xl">₹{amount}</p>
                    <p className="text-sm text-[#6B6188] mt-1 max-[767px]:text-xs">Transaction ID: TXN{Date.now().toString().slice(-8)}</p>
                </div>
                <button
                    onClick={onDone}
                    className="w-full py-3 rounded-xl bg-[#7B2FFF] text-white font-bold hover:bg-[#5B1FCC] transition-colors max-[767px]:py-2.5 max-[767px]:text-sm"
                >
                    View Booking Details
                </button>
            </div>
        </div>
    )
}

/* ── Main Component ──────────────────────────────────────── */
export default function PaymentPage() {
    const navigate = useNavigate()
    const locState = useLocation().state || {}

    const b = locState.booking
    const booking = b ? {
        id: b.id,
        coolie: b.coolieName,
        coolieRating: b.coolieRating,
        coolieTrips: b.coolieTrips,
        badge: b.coolieBadge,
        pickup: b.station,
        dropoff: b.destination,
        basePrice: b.amount,
        discount: 0,
        finalPrice: b.amount,
    } : BOOKING

    const [method, setMethod] = useState('upi')
    const [upiId, setUpiId] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(false)
    const [cardNum, setCardNum] = useState('')
    const [cardName, setCardName] = useState('')
    const [cardExp, setCardExp] = useState('')
    const [cardCvv, setCardCvv] = useState('')
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)
    const [countdown, setCountdown] = useState(300)

    useEffect(() => {
        if (method !== 'upi') return
        const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
        return () => clearInterval(t)
    }, [method])

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
    const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

    const handleVerify = () => {
        if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID'); return }
        setVerifying(true)
        setTimeout(() => { setVerifying(false); setVerified(true); toast.success('UPI ID verified!') }, 1500)
    }

    const handlePay = async () => {
        if (method === 'upi' && !upiId.includes('@')) { toast.error('Enter a valid UPI ID'); return }
        if (method === 'card' && (cardNum.replace(/\s/g, '').length < 16 || !cardName || !cardExp || !cardCvv)) {
            toast.error('Fill all card details'); return
        }
        setProcessing(true)
        try {
            if (booking.id !== 'BK-2024-1847') {
                await axios.post(`https://coolie-hiring-platform.onrender.com/api/bookings/${booking.id}/pay`)
            } else {
                await new Promise(r => setTimeout(r, 2000))
            }
            setProcessing(false)
            setSuccess(true)
        } catch (error) {
            setProcessing(false)
            toast.error('Payment failed. Please try again.')
        }
    }

    const METHODS = [
        { id: 'upi', icon: <Zap size={20} className="text-[#7B2FFF]" />, label: 'UPI', sub: 'Instant & Mobile-first' },
        { id: 'card', icon: <CreditCard size={20} className="text-[#A855F7]" />, label: 'Cards', sub: 'Debit or Credit Card' },
        { id: 'netbanking', icon: <Building2 size={20} className="text-[#A855F7]" />, label: 'Net Banking', sub: 'Secure Bank Portal' },
    ]

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="customer" />

            <main className="flex-1 md:ml-64 p-5 md:p-8 max-[767px]:p-3 max-[767px]:pb-24">
                <div className="max-w-5xl mx-auto">

                    {/* Page title — mobile only */}
                    <div className="hidden max-[767px]:block pt-12 mb-4">
                        <h1 className="text-white text-lg font-black">Payment</h1>
                        <p className="text-[#6B6188] text-xs mt-0.5">Complete your booking securely</p>
                    </div>

                    {/* ── Two-column layout (desktop) / single column (mobile) ── */}
                    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start max-[767px]:gap-4">

                        {/* ══ On mobile: show summary FIRST (top), then payment form below ══ */}

                        {/* ══ RIGHT — Booking Summary ══ (rendered first in DOM for mobile reorder) */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl overflow-hidden sticky top-6
                            lg:order-2 max-[767px]:rounded-xl max-[767px]:static">
                            <div className="px-5 py-4 border-b border-[#1E1A40] max-[767px]:px-4 max-[767px]:py-3">
                                <h3 className="text-white font-bold text-sm max-[767px]:text-xs">Booking Summary</h3>
                            </div>

                            <div className="p-5 space-y-4 max-[767px]:p-4 max-[767px]:space-y-3">
                                {/* Porter Info */}
                                <div className="flex items-center gap-3 max-[767px]:gap-2.5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white font-black text-lg border border-[#7B2FFF]/20 shrink-0
                                        max-[767px]:w-9 max-[767px]:h-9 max-[767px]:rounded-lg max-[767px]:text-sm">
                                        {booking.coolie[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-sm max-[767px]:text-xs">{booking.coolie}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            <span className="flex items-center gap-0.5 bg-yellow-400/10 text-yellow-400 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                                                <Star size={9} fill="currentColor" /> {booking.coolieRating}
                                            </span>
                                            <span className="text-[#6B6188] text-[10px] truncate">{booking.badge}</span>
                                        </div>
                                    </div>
                                    {/* Amount shown inline on mobile to save space */}
                                    <div className="hidden max-[767px]:block text-right shrink-0">
                                        <p className="text-[#7B2FFF] font-black text-xl">₹{booking.finalPrice}</p>
                                        <p className="text-[#6B6188] text-[9px]">Total</p>
                                    </div>
                                </div>

                                {/* Route — compact on mobile */}
                                <div className="space-y-3 max-[767px]:space-y-2">
                                    <div className="flex items-start gap-3 max-[767px]:gap-2">
                                        <div className="flex flex-col items-center pt-1">
                                            <div className="w-3 h-3 rounded-full border-2 border-[#7B2FFF] bg-[#7B2FFF]/20 max-[767px]:w-2.5 max-[767px]:h-2.5" />
                                            <div className="w-px h-6 bg-[#1E1A40] my-0.5 max-[767px]:h-4" />
                                            <div className="w-3 h-3 rounded-full border-2 border-[#A855F7] bg-[#A855F7]/20 max-[767px]:w-2.5 max-[767px]:h-2.5" />
                                        </div>
                                        <div className="space-y-3 flex-1 max-[767px]:space-y-1.5">
                                            <div>
                                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider max-[767px]:text-[9px]">Pickup</p>
                                                <p className="text-white text-sm font-semibold max-[767px]:text-xs">{booking.pickup}</p>
                                            </div>
                                            <div>
                                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider max-[767px]:text-[9px]">Drop-Off</p>
                                                <p className="text-white text-sm font-semibold max-[767px]:text-xs">{booking.dropoff}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="border-t border-[#1E1A40] pt-4 space-y-2.5 max-[767px]:pt-3 max-[767px]:space-y-2">
                                    <div className="flex justify-between text-sm max-[767px]:text-xs">
                                        <span className="text-[#6B6188]">Base Price</span>
                                        <span className="text-[#B0A8CC] font-medium">₹{booking.basePrice}</span>
                                    </div>
                                    {booking.discount > 0 && (
                                        <div className="flex justify-between text-sm max-[767px]:text-xs">
                                            <span className="text-[#6B6188]">Promotional Discount</span>
                                            <span className="text-green-400 font-medium">-₹{booking.discount}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total — hidden on mobile (shown inline above) */}
                                <div className="flex items-end justify-between border-t border-[#1E1A40] pt-4 max-[767px]:hidden">
                                    <div>
                                        <p className="text-white font-black text-base">Total Amount</p>
                                        <p className="text-[#6B6188] text-[10px] mt-0.5">Inclusive of all taxes</p>
                                    </div>
                                    <p className="text-[#7B2FFF] font-black text-3xl">₹{booking.finalPrice}</p>
                                </div>

                                {/* PCI-DSS Badge */}
                                <div className="border-t border-[#1E1A40] pt-4 flex items-center justify-center gap-2 text-[#6B6188] max-[767px]:pt-3">
                                    <Shield size={13} className="max-[767px]:w-3 max-[767px]:h-3" />
                                    <span className="text-[10px] font-semibold uppercase tracking-widest max-[767px]:text-[9px]">PCI-DSS Compliant</span>
                                </div>
                            </div>
                        </div>

                        {/* ══ LEFT — Payment Form ══ */}
                        <div className="space-y-5 lg:order-1 max-[767px]:space-y-3">

                            {/* Heading — hidden on mobile (shown at top of page) */}
                            <div className="max-[767px]:hidden">
                                <h1 className="text-white text-2xl font-black">Choose Payment Method</h1>
                                <p className="text-[#6B6188] text-sm mt-1">Select your preferred way to complete the transaction securely.</p>
                            </div>

                            {/* 3 Method Tabs */}
                            <div className="grid grid-cols-3 gap-3 max-[767px]:gap-2">
                                {METHODS.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => { setMethod(m.id); setVerified(false) }}
                                        className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left
                                            max-[767px]:p-3 max-[767px]:rounded-xl
                                            ${method === m.id
                                                ? 'border-[#7B2FFF] bg-[#7B2FFF]/10'
                                                : 'border-[#1E1A40] bg-[#0E0C1E] hover:border-[#7B2FFF]/40'
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3
                                            max-[767px]:w-7 max-[767px]:h-7 max-[767px]:rounded-lg max-[767px]:mb-2
                                            ${method === m.id ? 'bg-[#7B2FFF]/20' : 'bg-[#12102A]'}`}>
                                            {React.cloneElement(m.icon, { size: 20, className: `${m.icon.props.className} max-[767px]:w-4 max-[767px]:h-4` })}
                                        </div>
                                        <p className={`font-bold text-sm max-[767px]:text-xs ${method === m.id ? 'text-white' : 'text-[#B0A8CC]'}`}>
                                            {m.label}
                                        </p>
                                        {/* Hide sub-label on mobile */}
                                        <p className="text-[#6B6188] text-[11px] mt-0.5 max-[767px]:hidden">{m.sub}</p>
                                        {method === m.id && (
                                            <div className="mt-3 w-full h-0.5 bg-[#7B2FFF] rounded-full max-[767px]:mt-2" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* ── UPI Input ── */}
                            {method === 'upi' && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 space-y-4
                                    max-[767px]:p-4 max-[767px]:space-y-3 max-[767px]:rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-bold text-sm flex items-center gap-2 max-[767px]:text-xs max-[767px]:gap-1.5">
                                            <div className="w-7 h-7 rounded-lg bg-[#7B2FFF]/20 flex items-center justify-center max-[767px]:w-6 max-[767px]:h-6 max-[767px]:rounded-md">
                                                <Zap size={14} className="text-[#7B2FFF] max-[767px]:w-3 max-[767px]:h-3" />
                                            </div>
                                            Enter UPI ID
                                        </h3>
                                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider max-[767px]:text-[9px] max-[767px]:px-1.5">Live</span>
                                    </div>

                                    {/* UPI Input Row */}
                                    <div className="flex gap-2 max-[767px]:gap-1.5">
                                        <input
                                            type="text"
                                            className="flex-1 bg-[#12102A] border border-[#1E1A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors
                                                max-[767px]:px-3 max-[767px]:py-2.5 max-[767px]:text-xs max-[767px]:rounded-lg"
                                            placeholder="username@bankname"
                                            value={upiId}
                                            onChange={e => { setUpiId(e.target.value); setVerified(false) }}
                                        />
                                        <button
                                            onClick={handleVerify}
                                            disabled={verifying || verified}
                                            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                                max-[767px]:px-3 max-[767px]:py-2.5 max-[767px]:text-xs max-[767px]:rounded-lg
                                                ${verified
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                                    : 'bg-[#1E1A40] text-[#A855F7] border border-[#7B2FFF]/30 hover:bg-[#7B2FFF]/20'
                                                }`}
                                        >
                                            {verifying
                                                ? <span className="w-4 h-4 border-2 border-[#7B2FFF]/40 border-t-[#7B2FFF] rounded-full animate-spin inline-block max-[767px]:w-3 max-[767px]:h-3" />
                                                : verified ? '✓ Verified' : 'Verify'
                                            }
                                        </button>
                                    </div>

                                    <p className="text-[#6B6188] text-xs leading-relaxed flex items-start gap-2 max-[767px]:text-[10px] max-[767px]:gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-[#7B2FFF]/20 flex items-center justify-center shrink-0 mt-0.5 max-[767px]:w-3 max-[767px]:h-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#7B2FFF] max-[767px]:w-1 max-[767px]:h-1" />
                                        </span>
                                        Payment request will be sent to your mobile app. Complete within{' '}
                                        <span className="text-white font-bold">{formatTime(countdown)}</span>.
                                    </p>
                                </div>
                            )}

                            {/* ── Card Input ── */}
                            {method === 'card' && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 space-y-3
                                    max-[767px]:p-4 max-[767px]:space-y-2.5 max-[767px]:rounded-xl">
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2 max-[767px]:text-xs max-[767px]:gap-1.5">
                                        <div className="w-7 h-7 rounded-lg bg-[#7B2FFF]/20 flex items-center justify-center max-[767px]:w-6 max-[767px]:h-6">
                                            <CreditCard size={14} className="text-[#7B2FFF] max-[767px]:w-3 max-[767px]:h-3" />
                                        </div>
                                        Card Details
                                    </h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] pr-12 transition-colors
                                                max-[767px]:px-3 max-[767px]:py-2.5 max-[767px]:text-xs max-[767px]:rounded-lg max-[767px]:pr-10"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNum}
                                            onChange={e => setCardNum(formatCard(e.target.value))}
                                        />
                                        <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a3560] max-[767px]:w-3.5 max-[767px]:h-3.5 max-[767px]:right-3" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors
                                            max-[767px]:px-3 max-[767px]:py-2.5 max-[767px]:text-xs max-[767px]:rounded-lg"
                                        placeholder="Name on Card"
                                        value={cardName}
                                        onChange={e => setCardName(e.target.value)}
                                    />
                                    <div className="grid grid-cols-2 gap-3 max-[767px]:gap-2">
                                        <input
                                            type="text"
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors
                                                max-[767px]:px-3 max-[767px]:py-2.5 max-[767px]:text-xs max-[767px]:rounded-lg"
                                            placeholder="MM/YY"
                                            maxLength={5}
                                            value={cardExp}
                                            onChange={e => {
                                                let v = e.target.value.replace(/\D/g, '')
                                                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4)
                                                setCardExp(v)
                                            }}
                                        />
                                        <input
                                            type="password"
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors
                                                max-[767px]:px-3 max-[767px]:py-2.5 max-[767px]:text-xs max-[767px]:rounded-lg"
                                            placeholder="CVV"
                                            maxLength={3}
                                            value={cardCvv}
                                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* ── Net Banking ── */}
                            {method === 'netbanking' && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 space-y-3
                                    max-[767px]:p-4 max-[767px]:space-y-2.5 max-[767px]:rounded-xl">
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2 max-[767px]:text-xs max-[767px]:gap-1.5">
                                        <div className="w-7 h-7 rounded-lg bg-[#7B2FFF]/20 flex items-center justify-center max-[767px]:w-6 max-[767px]:h-6">
                                            <Building2 size={14} className="text-[#7B2FFF] max-[767px]:w-3 max-[767px]:h-3" />
                                        </div>
                                        Select Your Bank
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2 max-[767px]:gap-1.5">
                                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(b => (
                                            <button key={b} className="py-2.5 rounded-xl bg-[#12102A] border border-[#1E1A40] text-[#B0A8CC] text-xs font-semibold hover:border-[#7B2FFF]/50 hover:text-white transition-all
                                                max-[767px]:py-2 max-[767px]:text-[11px] max-[767px]:rounded-lg">
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Pay Button ── */}
                            <div className="space-y-2 max-[767px]:space-y-1.5">
                                <button
                                    onClick={handlePay}
                                    disabled={processing}
                                    className="w-full py-4 rounded-2xl bg-[#7B2FFF] text-white font-bold text-base flex items-center justify-center gap-3 hover:bg-[#5B1FCC] transition-colors disabled:opacity-60 shadow-lg shadow-[#7B2FFF]/20
                                        max-[767px]:py-3 max-[767px]:text-sm max-[767px]:gap-2 max-[767px]:rounded-xl"
                                >
                                    {processing ? (
                                        <><Loader size={20} className="animate-spin max-[767px]:w-4 max-[767px]:h-4" /> Processing...</>
                                    ) : (
                                        <><Lock size={18} className="max-[767px]:w-4 max-[767px]:h-4" /> Pay ₹{booking.finalPrice} Securely</>
                                    )}
                                </button>
                                <p className="text-center text-[#3a3560] text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 max-[767px]:text-[9px] max-[767px]:tracking-[0.15em]">
                                    <Shield size={10} className="max-[767px]:w-2.5 max-[767px]:h-2.5" /> 128-Bit SSL Encrypted Connection
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {success && (
                <PaymentSuccess
                    amount={booking.finalPrice}
                    onDone={() => navigate('/customer/history')}
                />
            )}
        </div>
    )
}