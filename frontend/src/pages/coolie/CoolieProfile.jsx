import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    User, Phone, MapPin, Shield, Star, Edit3, Camera,
    Check, X, CreditCard, Download, QrCode, Award, Zap, Package
} from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_PROFILE = {
    name: 'Ramesh Kumar',
    id: 'CL-1042',
    badge: 'Star of the Week',
    phone: '+91 98765-43210',
    altPhone: '+91 98765-01234',
    station: 'New Delhi Railway Station (NDLS)',
    stationZone: 'Zone: Northern Railway',
    platforms: ['01', '02', '04', '05', '12', '16'],
    experience: 'Senior Porter (8.5 Years)',
    languages: ['Hindi', 'English', 'Bengali'],
    memberSince: '14 March 2016',
    rating: 4.8,
    totalTrips: 1248,
    expYears: '8yr',
    verified: true,
    verifiedDate: 'Feb 12, 2024',
    platformCoverage: 'Authorized access to all 16 platforms with specialized handling for heavy baggage and parcel cargo sections.',
    bankName: 'State Bank of India',
    bankBranch: 'Main Branch, New Delhi',
    bankAccount: '**** **** **** 8291',
    ifsc: 'SBIN0081234',
    upiId: 'ramesh.k@okaxis',
}

export default function CoolieProfile() {
    const [profile, setProfile] = useState(INITIAL_PROFILE)
    const [editingField, setEditingField] = useState(null)
    const [editVal, setEditVal] = useState('')

    const startEdit = (field, value) => {
        setEditingField(field)
        setEditVal(value)
    }

    const saveEdit = () => {
        setProfile(p => ({ ...p, [editingField]: editVal }))
        setEditingField(null)
        toast.success('Updated successfully!')
    }

    const cancelEdit = () => {
        setEditingField(null)
        setEditVal('')
    }

    const togglePlatform = (pf) => {
        setProfile(p => ({
            ...p,
            platforms: p.platforms.includes(pf)
                ? p.platforms.filter(x => x !== pf)
                : [...p.platforms, pf]
        }))
    }

    const Field = ({ label, field, editable = false }) => {
        const val = profile[field]
        const isEditing = editingField === field
        return (
            <div>
                <p className="text-[11px] text-[#6B6188] uppercase tracking-wider mb-1">{label}</p>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            autoFocus
                            className="flex-1 bg-[#1E1A40] border border-[#7B2FFF] rounded-lg px-3 py-1.5 text-white text-sm outline-none"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                        />
                        <button onClick={saveEdit} className="w-7 h-7 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/40 transition-colors">
                            <Check size={13} />
                        </button>
                        <button onClick={cancelEdit} className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-colors">
                            <X size={13} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between group">
                        <p className="text-white text-sm font-semibold">{val}</p>
                        {editable && (
                            <button
                                onClick={() => startEdit(field, val)}
                                className="opacity-0 group-hover:opacity-100 text-[#6B6188] hover:text-[#A855F7] transition-all"
                            >
                                <Edit3 size={13} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="coolie" />
            <div className="ml-0 md:ml-64 flex-1 p-5 md:p-8">
                <div className="max-w-5xl mx-auto space-y-5">

                    {/* ── HERO HEADER ── */}
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
                        {/* Avatar + Info */}
                        <div className="flex gap-5 flex-1 items-start">
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white text-3xl font-black border-2 border-[#7B2FFF]/40 overflow-hidden">
                                    <img
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=Ramesh`}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                        onError={e => { e.target.style.display='none' }}
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-[#7B2FFF] text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full">
                                    ✓
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-yellow-400 text-[11px] font-semibold flex items-center gap-1">
                                        <Star size={11} fill="currentColor" /> {profile.badge}
                                    </span>
                                </div>
                                <h1 className="text-white text-2xl font-black leading-tight">{profile.name}</h1>
                                <p className="text-[#6B6188] text-xs mt-0.5 font-mono">PORTER {profile.id}</p>

                                {/* Stats Row */}
                                <div className="flex gap-6 mt-3">
                                    <div>
                                        <p className="text-yellow-400 font-black text-lg leading-none">★ {profile.rating}</p>
                                        <p className="text-[#6B6188] text-[10px] uppercase tracking-wider mt-0.5">Rating</p>
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg leading-none">{profile.totalTrips.toLocaleString()}</p>
                                        <p className="text-[#6B6188] text-[10px] uppercase tracking-wider mt-0.5">Total Trips</p>
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-lg leading-none">{profile.expYears}</p>
                                        <p className="text-[#6B6188] text-[10px] uppercase tracking-wider mt-0.5">Experience</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Card */}
                        <div className="bg-[#12102A] border border-[#1E1A40] rounded-2xl p-4 flex flex-col items-center min-w-[160px]">
                            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mb-2">
                                <div className="w-20 h-20 grid grid-cols-7 gap-px p-1">
                                    {Array.from({ length: 49 }, (_, i) => (
                                        <div key={i} className={`rounded-[1px] ${[0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,15,22,29,36,10,17,24,31,38].includes(i) ? 'bg-black' : 'bg-white'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-white text-xs font-bold mb-0.5">Quick Identity Scan</p>
                            <p className="text-[#6B6188] text-[10px] text-center mb-3">Scan to verify Credentials</p>
                            <button
                                onClick={() => toast.success('QR Downloaded!')}
                                className="flex items-center gap-1.5 text-[#A855F7] text-[11px] font-semibold hover:text-white transition-colors"
                            >
                                <Download size={12} /> Download QR
                            </button>
                        </div>
                    </div>

                    {/* ── MAIN GRID ── */}
                    <div className="grid md:grid-cols-2 gap-5">

                        {/* ── PERSONAL INFORMATION ── */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                                    <User size={15} className="text-orange-400" /> Personal Information
                                </h2>
                                <button
                                    onClick={() => startEdit('name', profile.name)}
                                    className="text-[10px] text-[#A855F7] font-semibold hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <Edit3 size={11} /> Edit Info
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Full Name" field="name" editable />
                                    <Field label="Phone" field="phone" editable />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Alternate Phone" field="altPhone" editable />
                                    <Field label="Experience" field="experience" />
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#6B6188] uppercase tracking-wider mb-2">Languages Spoken</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.languages.map(lang => (
                                            <span key={lang} className="text-[11px] bg-[#7B2FFF]/20 text-[#A855F7] border border-[#7B2FFF]/30 px-2.5 py-0.5 rounded-full font-medium">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <Field label="Member Since" field="memberSince" />
                            </div>
                        </div>

                        {/* ── WORK DETAILS ── */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                            <h2 className="text-white font-bold flex items-center gap-2 text-sm mb-4">
                                <span className="text-orange-400">🚉</span> Work Details
                            </h2>

                            {/* Station Block */}
                            <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3 mb-4">
                                <p className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1">Station</p>
                                <p className="text-white font-bold text-sm">{profile.station}</p>
                                <p className="text-[#6B6188] text-[11px]">{profile.stationZone}</p>
                            </div>

                            {/* Working Platforms */}
                            <div className="mb-3">
                                <p className="text-[11px] text-[#6B6188] uppercase tracking-wider mb-2">Working Platforms</p>
                                <div className="flex flex-wrap gap-2">
                                    {['01','02','04','05','06','08','10','12','14','16'].map(pf => (
                                        <button
                                            key={pf}
                                            onClick={() => togglePlatform(pf)}
                                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                                profile.platforms.includes(pf)
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'bg-[#12102A] text-[#6B6188] border border-[#1E1A40] hover:border-[#7B2FFF]/40'
                                            }`}
                                        >
                                            {pf}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Platform Coverage */}
                            <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                <p className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1">Platform Coverage</p>
                                <p className="text-[#B0A8CC] text-[12px] leading-relaxed">{profile.platformCoverage}</p>
                            </div>
                        </div>

                        {/* ── PAYMENT DETAILS ── */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                            <h2 className="text-white font-bold flex items-center gap-2 text-sm mb-4">
                                <CreditCard size={15} className="text-orange-400" /> Payment Details
                            </h2>

                            {/* Bank Block */}
                            <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3 mb-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#1E1A40] flex items-center justify-center text-blue-400 shrink-0">
                                    <CreditCard size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-bold">{profile.bankName}</p>
                                    <p className="text-[#6B6188] text-[11px]">{profile.bankBranch}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#6B6188] text-[10px]">ACCOUNT NUMBER</p>
                                    <p className="text-white text-xs font-mono font-semibold">{profile.bankAccount}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                    <p className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1">IFSC Code</p>
                                    <p className="text-white text-sm font-mono font-semibold">{profile.ifsc}</p>
                                </div>
                                <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                    <p className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1">UPI ID</p>
                                    <p className="text-white text-sm font-mono font-semibold">{profile.upiId}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── IDENTITY VERIFIED + ACHIEVEMENTS ── */}
                        <div className="space-y-4">
                            {/* Identity Verified */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center shrink-0">
                                        <Shield size={24} className="text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-sm">Identity Verified</p>
                                        <p className="text-[#6B6188] text-[11px] mt-0.5 leading-relaxed">
                                            Biometric and government ID checks were completed on {profile.verifiedDate}.
                                        </p>
                                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] bg-green-500/10 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                                            ● ACTIVE STATUS
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Achievements */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                                <h2 className="text-white font-bold text-sm mb-3 text-center uppercase tracking-widest">Recent Achievements</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3 flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <span className="text-xl">😊</span>
                                        </div>
                                        <p className="text-white text-xs font-bold text-center">92% Safe Handling</p>
                                    </div>
                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3 flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                            <Zap size={20} className="text-orange-400" fill="currentColor" />
                                        </div>
                                        <p className="text-white text-xs font-bold text-center">Fast Delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
