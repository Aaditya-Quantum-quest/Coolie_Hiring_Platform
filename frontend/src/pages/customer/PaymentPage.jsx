import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import {
    CreditCard, CheckCircle, Lock,
    Shield, Loader, Star, Building2, Zap
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-6 max-w-xs w-full text-center space-y-4">
                <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/50 flex items-center justify-center mx-auto">
                        <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-lg animate-bounce">🎉</div>
                </div>
                <div>
                    <h2 className="text-lg font-black text-white mb-0.5">Payment Successful!</h2>
                    <p className="text-[#6B6188] text-xs">Your booking is confirmed</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-3">
                    <p className="text-2xl font-black text-green-400">₹{amount}</p>
                    <p className="text-xs text-[#6B6188] mt-0.5">
                        Transaction ID: TXN{Date.now().toString().slice(-8)}
                    </p>
                </div>
                <button
                    onClick={onDone}
                    className="w-full py-2.5 rounded-xl bg-[#7B2FFF] text-white text-sm font-bold hover:bg-[#5B1FCC] transition-colors"
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
                await axios.post(`/api/bookings/${booking.id}/pay`)
            } else {
                await new Promise(r => setTimeout(r, 2000))
            }
            setProcessing(false)
            setSuccess(true)
        } catch {
            setProcessing(false)
            toast.error('Payment failed. Please try again.')
        }
    }

    const METHODS = [
        { id: 'upi', icon: Zap, label: 'UPI', sub: 'Instant & Mobile-first' },
        { id: 'card', icon: CreditCard, label: 'Cards', sub: 'Debit or Credit Card' },
        { id: 'netbanking', icon: Building2, label: 'Net Banking', sub: 'Secure Bank Portal' },
    ]

    /* shared input class */
    const inp = "w-full bg-[#12102A] border border-[#1E1A40] rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="customer" />

            <main className="flex-1 md:ml-64 p-3 md:p-5 pb-24 md:pb-5">
                <div className="max-w-4xl mx-auto">

                    {/* Page Header */}
                    <div className="pt-12 md:pt-0 mb-4">
                        <h1 className="text-white text-base md:text-xl font-black">Payment</h1>
                        <p className="text-[#6B6188] text-xs mt-0.5">Complete your booking securely</p>
                    </div>

                    {/* Two-column on lg, single column below */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start">

                        {/* ══ Booking Summary — shows on top for mobile ══ */}
                        <div className="w-full lg:w-72 lg:shrink-0 bg-[#0E0C1E] border border-[#1E1A40] rounded-xl overflow-hidden lg:sticky lg:top-4 lg:order-2">
                            <div className="px-4 py-3 border-b border-[#1E1A40]">
                                <h3 className="text-white font-bold text-xs">Booking Summary</h3>
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Porter Info */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white font-black text-sm border border-[#7B2FFF]/20 shrink-0">
                                        {booking.coolie[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-xs">{booking.coolie}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            <span className="flex items-center gap-0.5 bg-yellow-400/10 text-yellow-400 rounded-full px-1.5 py-0.5 text-[9px] font-bold">
                                                <Star size={8} fill="currentColor" /> {booking.coolieRating}
                                            </span>
                                            <span className="text-[#6B6188] text-[9px] truncate">{booking.badge}</span>
                                        </div>
                                    </div>
                                    {/* Amount inline on mobile */}
                                    <div className="lg:hidden text-right shrink-0">
                                        <p className="text-[#7B2FFF] font-black text-lg">₹{booking.finalPrice}</p>
                                        <p className="text-[#6B6188] text-[9px]">Total</p>
                                    </div>
                                </div>

                                {/* Route */}
                                <div className="flex items-start gap-2.5">
                                    <div className="flex flex-col items-center pt-1 shrink-0">
                                        <div className="w-2 h-2 rounded-full border-2 border-[#7B2FFF] bg-[#7B2FFF]/20" />
                                        <div className="w-px h-5 bg-[#1E1A40] my-0.5" />
                                        <div className="w-2 h-2 rounded-full border-2 border-[#A855F7] bg-[#A855F7]/20" />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div>
                                            <p className="text-[#6B6188] text-[9px] uppercase tracking-wider">Pickup</p>
                                            <p className="text-white text-xs font-semibold">{booking.pickup}</p>
                                        </div>
                                        <div>
                                            <p className="text-[#6B6188] text-[9px] uppercase tracking-wider">Drop-Off</p>
                                            <p className="text-white text-xs font-semibold">{booking.dropoff}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="border-t border-[#1E1A40] pt-3 space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-[#6B6188]">Base Price</span>
                                        <span className="text-[#B0A8CC] font-medium">₹{booking.basePrice}</span>
                                    </div>
                                    {booking.discount > 0 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[#6B6188]">Discount</span>
                                            <span className="text-green-400 font-medium">-₹{booking.discount}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total — desktop only */}
                                <div className="hidden lg:flex items-end justify-between border-t border-[#1E1A40] pt-3">
                                    <div>
                                        <p className="text-white font-black text-xs">Total Amount</p>
                                        <p className="text-[#6B6188] text-[9px] mt-0.5">Incl. all taxes</p>
                                    </div>
                                    <p className="text-[#7B2FFF] font-black text-2xl">₹{booking.finalPrice}</p>
                                </div>

                                {/* Badge */}
                                <div className="border-t border-[#1E1A40] pt-3 flex items-center justify-center gap-1.5 text-[#6B6188]">
                                    <Shield size={11} />
                                    <span className="text-[9px] font-semibold uppercase tracking-widest">PCI-DSS Compliant</span>
                                </div>
                            </div>
                        </div>

                        {/* ══ Payment Form ══ */}
                        <div className="flex-1 space-y-3 lg:order-1">

                            {/* Method Tabs */}
                            <div className="grid grid-cols-3 gap-2">
                                {METHODS.map(m => {
                                    const Icon = m.icon
                                    const active = method === m.id
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => { setMethod(m.id); setVerified(false) }}
                                            className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left
                                                ${active
                                                    ? 'border-[#7B2FFF] bg-[#7B2FFF]/10'
                                                    : 'border-[#1E1A40] bg-[#0E0C1E] hover:border-[#7B2FFF]/40'
                                                }`}
                                        >
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2
                                                ${active ? 'bg-[#7B2FFF]/20' : 'bg-[#12102A]'}`}>
                                                <Icon size={14} className={active ? 'text-[#7B2FFF]' : 'text-[#A855F7]'} />
                                            </div>
                                            <p className={`font-bold text-xs ${active ? 'text-white' : 'text-[#B0A8CC]'}`}>
                                                {m.label}
                                            </p>
                                            <p className="text-[#6B6188] text-[10px] mt-0.5 hidden sm:block">{m.sub}</p>
                                            {active && <div className="mt-2 w-full h-0.5 bg-[#7B2FFF] rounded-full" />}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* ── UPI ── */}
                            {method === 'upi' && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-bold text-xs flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-md bg-[#7B2FFF]/20 flex items-center justify-center">
                                                <Zap size={12} className="text-[#7B2FFF]" />
                                            </div>
                                            Enter UPI ID
                                        </h3>
                                        <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">Live</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className={`${inp} flex-1`}
                                            placeholder="username@bankname"
                                            value={upiId}
                                            onChange={e => { setUpiId(e.target.value); setVerified(false) }}
                                        />
                                        <button
                                            onClick={handleVerify}
                                            disabled={verifying || verified}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                                ${verified
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                                    : 'bg-[#1E1A40] text-[#A855F7] border border-[#7B2FFF]/30 hover:bg-[#7B2FFF]/20'
                                                }`}
                                        >
                                            {verifying
                                                ? <span className="w-3 h-3 border-2 border-[#7B2FFF]/40 border-t-[#7B2FFF] rounded-full animate-spin inline-block" />
                                                : verified ? '✓ Verified' : 'Verify'
                                            }
                                        </button>
                                    </div>

                                    <p className="text-[#6B6188] text-[10px] leading-relaxed flex items-start gap-1.5">
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#7B2FFF]/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="w-1 h-1 rounded-full bg-[#7B2FFF]" />
                                        </span>
                                        Payment request sent to your mobile app. Complete within{' '}
                                        <span className="text-white font-bold">{formatTime(countdown)}</span>.
                                    </p>
                                </div>
                            )}

                            {/* ── Card ── */}
                            {method === 'card' && (
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-xl p-4 space-y-2.5">
                                    <h3 className="text-white font-bold text-xs flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-md bg-[#7B2FFF]/20 flex items-center justify-center">
                                            <CreditCard size={12} className="text-[#7B2FFF]" />
                                        </div>
                                        Card Details
                                    </h3>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            className={`${inp} pr-8`}
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNum}
                                            onChange={e => setCardNum(formatCard(e.target.value))}
                                        />
                                        <CreditCard size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3560]" />
                                    </div>

                                    <input
                                        type="text"
                                        className={inp}
                                        placeholder="Name on Card"
                                        value={cardName}
                                        onChange={e => setCardName(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            className={inp}
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
                                            className={inp}
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
                                <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-xl p-4 space-y-2.5">
                                    <h3 className="text-white font-bold text-xs flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-md bg-[#7B2FFF]/20 flex items-center justify-center">
                                            <Building2 size={12} className="text-[#7B2FFF]" />
                                        </div>
                                        Select Your Bank
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bk => (
                                            <button
                                                key={bk}
                                                className="py-2 rounded-lg bg-[#12102A] border border-[#1E1A40] text-[#B0A8CC] text-xs font-semibold hover:border-[#7B2FFF]/50 hover:text-white transition-all"
                                            >
                                                {bk}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Pay Button ── */}
                            <div className="space-y-1.5">
                                <button
                                    onClick={handlePay}
                                    disabled={processing}
                                    className="w-full py-3 rounded-xl bg-[#7B2FFF] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#5B1FCC] transition-colors disabled:opacity-60 shadow-lg shadow-[#7B2FFF]/20"
                                >
                                    {processing ? (
                                        <><Loader size={16} className="animate-spin" /> Processing...</>
                                    ) : (
                                        <><Lock size={14} /> Pay ₹{booking.finalPrice} Securely</>
                                    )}
                                </button>
                                <p className="text-center text-[#3a3560] text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-1">
                                    <Shield size={9} /> 128-Bit SSL Encrypted Connection
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
