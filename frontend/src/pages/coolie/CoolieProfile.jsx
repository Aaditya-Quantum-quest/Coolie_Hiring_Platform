import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import {
    User, Phone, MapPin, Shield, Star, Edit3, Camera,
    Check, X, CreditCard, Download, QrCode, Award, Zap, Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import { coolieProfileService } from '../../services/coolieService'

export default function CoolieProfile() {
    const { user } = useApp()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState({
        name: user?.name || 'Coolie',
        id: user?.coolie_id || 'PENDING',
        badge: user?.badge || 'New Member',
        station: user?.station_name || 'N/A',
        stationZone: 'Zone: Indian Railways',
        platforms: user?.working_platforms || [],
        age: user?.age || '—',
        languages: user?.languages_spoken || [],
        memberSince: user?.created_at
            ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—',
        rating: user?.rating_avg || 0,
        totalTrips: user?.total_trips || 0,
        xp: 0,
        level: 1,
        nextLevelXP: 250,
        verified: user?.is_verified || false,
        verifiedDate: '—',
        platformCoverage: 'Platform access is determined based on your registered working platforms.',
        bankName: '—',
        bankBranch: '—',
        bankAccount: '—',
        ifsc: '—',
        upiId: '—',
        aadhaar_number: '—',
        secondary_doc_type: '—',
        secondary_doc_number: '—',
        aadhaar_front_url: '',
        aadhaar_back_url: '',
        secondary_doc_front_url: '',
        secondary_doc_back_url: '',
        passport_photo_url: '',
    })

    useEffect(() => {
        const fetchProfileData = async () => {
            // ── FIX: Resolve coolieId properly and validate before calling API ──
            const coolieId = user?.coolie_id || user?.id

            // Guard: skip if user not loaded yet, or ID is missing/invalid
            if (!user || !coolieId || coolieId === 'pending-id' || coolieId === 'undefined') {
                setLoading(false)
                return
            }

            // Guard: coolie_id must be a non-empty string or number
            if (typeof coolieId !== 'string' && typeof coolieId !== 'number') {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                console.log('DEBUG: Fetching full profile...')
                const response = await coolieProfileService.getFullProfile()

                if (response.success && response.data) {
                    const data = response.data
                    setProfile(prev => ({
                        ...prev,
                        name: data.name || user?.name || 'Coolie',
                        id: data.coolie_id || user?.coolie_id || 'PENDING',
                        badge: data.badge || user?.badge || 'New Member',
                        station: data.station_name || user?.station_name || 'N/A',
                        platforms: data.working_platforms || user?.working_platforms || [],
                        age: data.age || user?.age || '—',
                        languages: data.languages_spoken || user?.languages_spoken || [],
                        memberSince: data.created_at
                            ? new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                            : '—',
                        rating: Number(data.rating_avg) || 0,
                        totalTrips: data.total_trips || 0,
                        bankName: data.bank_name || '—',
                        bankAccount: data.account_number || '—',
                        ifsc: data.ifsc_code || '—',
                        upiId: data.upi_id || '—',
                        aadhaar_number: data.aadhaar_number || '—',
                        secondary_doc_type: data.secondary_doc_type || '—',
                        secondary_doc_number: data.secondary_doc_number || '—',
                        aadhaar_front_url: data.aadhaar_front_url || '',
                        aadhaar_back_url: data.aadhaar_back_url || '',
                        secondary_doc_front_url: data.secondary_doc_front_url || '',
                        secondary_doc_back_url: data.secondary_doc_back_url || '',
                        passport_photo_url: data.passport_photo_url || '',
                        verifiedDate: data.level2_approved_at 
                            ? new Date(data.level2_approved_at).toLocaleDateString()
                            : data.created_at 
                            ? new Date(data.created_at).toLocaleDateString()
                            : '—'
                    }))
                }
            } catch (error) {
                console.error('Error fetching profile data:', error)

                // ── FIX: Show specific error message based on status code ──
                const status = error.response?.status
                if (status === 422) {
                    console.error('422: Unprocessable Entity — coolieId sent was:', coolieId)
                    toast.error('Profile ID format is invalid. Please contact support.')
                } else if (status === 404) {
                    toast.error('Profile not found.')
                } else {
                    toast.error('Failed to load profile data')
                }

                if (error.response?.data?.error) {
                    console.error('Backend error:', error.response.data.error)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProfileData()
    }, [user]) // Re-runs when user object becomes available

    const [editingField, setEditingField] = useState(null)
    const [editVal, setEditVal] = useState('')

    const startEdit = (field, value) => {
        setEditingField(field)
        setEditVal(value)
    }

    const saveEdit = async () => {
        const coolieId = user?.coolie_id || user?.id
        if (!coolieId || coolieId === 'pending-id' || coolieId === 'undefined') {
            toast.error('Invalid coolie ID')
            return
        }

        try {
            const updateData = { [editingField]: editVal }
            await coolieProfileService.updateProfile(coolieId, updateData)
            setProfile(p => ({ ...p, [editingField]: editVal }))
            setEditingField(null)
            toast.success('Updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        }
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

    const XPDisplay = () => {
        const currentXP = profile.xp
        const currentLevel = profile.level
        const nextLevelXP = profile.nextLevelXP
        const xpProgress = ((currentXP - (currentLevel - 1) * 250) / 250) * 100
        const xpToNext = nextLevelXP - currentXP

        return (
            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold flex items-center gap-2 text-sm">
                        <Zap size={15} className="text-yellow-400" /> Experience Points
                    </h2>
                    <button
                        onClick={() => startEdit('xp', currentXP.toString())}
                        className="text-[10px] text-[#A855F7] font-semibold hover:text-white transition-colors flex items-center gap-1"
                    >
                        <Edit3 size={11} /> Edit XP
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#12102A] rounded-xl p-4 border border-[#1E1A40]">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider">Current Level</p>
                                <p className="text-3xl font-black text-yellow-400">Lv.{currentLevel}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider">Total XP</p>
                                <p className="text-2xl font-black text-white">{currentXP.toLocaleString()}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[#6B6188] text-[10px]">Level Progress</p>
                                <p className="text-[#A855F7] text-[10px] font-semibold">{xpToNext} XP to Lv.{currentLevel + 1}</p>
                            </div>
                            <div className="w-full bg-[#1E1A40] rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-[#7B2FFF] to-[#A855F7] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(xpProgress, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#1E1A40] rounded-lg p-3 border border-[#7B2FFF]/20">
                            <p className="text-[#6B6188] text-[10px] mb-1">XP Rate</p>
                            <p className="text-white font-bold text-lg">+25 per trip</p>
                        </div>
                        <div className="bg-[#1E1A40] rounded-lg p-3 border border-[#7B2FFF]/20">
                            <p className="text-[#6B6188] text-[10px] mb-1">Next Milestone</p>
                            <p className="text-[#A855F7] font-bold text-lg">Lv.{currentLevel + 5}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── FIX: Show a clear message if user context is not ready ──
    if (!user) {
        return (
            <div className="flex bg-[#0A0814] min-h-screen">
                <Sidebar role="coolie" />
                <div className="ml-0 md:ml-64 flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2FFF] mx-auto mb-4"></div>
                        <p className="text-[#6B6188] text-sm">Loading user session...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="coolie" />
            <div className="ml-0 md:ml-64 flex-1 p-5 md:p-8">
                <div className="max-w-5xl mx-auto space-y-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2FFF]"></div>
                        </div>
                    ) : (
                        <>
                            {/* ── HERO HEADER ── */}
                            <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex gap-5 flex-1 items-start">
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#3a2060] to-[#1E1A40] flex items-center justify-center text-white text-3xl font-black border-2 border-[#7B2FFF]/40 overflow-hidden">
                                            <img
                                                src={profile.passport_photo_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`}
                                                alt="avatar"
                                                className="w-full h-full object-cover"
                                                onError={e => { e.target.style.display = 'none' }}
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

                                        <div className="flex gap-6 mt-3">
                                            <div>
                                                <p className="text-yellow-400 font-black text-lg leading-none">★ {Number(profile.rating).toFixed(1)}</p>
                                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider mt-0.5">Rating</p>
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-lg leading-none">{profile.totalTrips.toLocaleString()}</p>
                                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider mt-0.5">Total Trips</p>
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-lg leading-none">{profile.age} years</p>
                                                <p className="text-[#6B6188] text-[10px] uppercase tracking-wider mt-0.5">Age</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Card */}
                                <div className="bg-[#12102A] border border-[#1E1A40] rounded-2xl p-4 flex flex-col items-center min-w-[160px]">
                                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mb-2">
                                        <div className="w-20 h-20 grid grid-cols-7 gap-px p-1">
                                            {Array.from({ length: 49 }, (_, i) => (
                                                <div key={i} className={`rounded-[1px] ${[0, 1, 2, 3, 4, 5, 6, 7, 13, 14, 20, 21, 27, 28, 34, 35, 41, 42, 43, 44, 45, 46, 47, 48, 8, 15, 22, 29, 36, 10, 17, 24, 31, 38].includes(i) ? 'bg-black' : 'bg-white'}`} />
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

                                {/* ── XP SYSTEM ── */}
                                <XPDisplay />

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
                                            <Field label="Age" field="age" editable />
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-[#6B6188] uppercase tracking-wider mb-2">Languages Spoken</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(profile.languages || []).map(lang => (
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

                                    <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3 mb-4">
                                        <p className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1">Station</p>
                                        <p className="text-white font-bold text-sm">{profile.station}</p>
                                        <p className="text-[#6B6188] text-[11px]">{profile.stationZone}</p>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-[11px] text-[#6B6188] uppercase tracking-wider mb-2">Working Platforms</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['01', '02', '04', '05', '06', '08', '10', '12', '14', '16'].map(pf => (
                                                <button
                                                    key={pf}
                                                    onClick={() => togglePlatform(pf)}
                                                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${profile.platforms.includes(pf)
                                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                            : 'bg-[#12102A] text-[#6B6188] border border-[#1E1A40] hover:border-[#7B2FFF]/40'
                                                        }`}
                                                >
                                                    {pf}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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

                                {/* ── IDENTITY + ACHIEVEMENTS ── */}
                                <div className="space-y-4">
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

                                    {/* ── DOCUMENTS SECTION ── */}
                                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                                        <h2 className="text-white font-bold flex items-center gap-2 text-sm mb-4">
                                            <Shield size={15} className="text-orange-400" /> Verification Documents
                                        </h2>
                                        
                                        <div className="space-y-4">
                                            {/* Aadhaar Info */}
                                            <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] text-[#6B6188] uppercase tracking-wider">Aadhaar Card</p>
                                                    <p className="text-white text-xs font-mono">{profile.aadhaar_number}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="aspect-[3/2] rounded-lg bg-[#0A0814] overflow-hidden border border-[#1E1A40] relative group">
                                                        <img src={profile.aadhaar_front_url} alt="Aadhaar Front" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <a href={profile.aadhaar_front_url} target="_blank" rel="noreferrer" className="text-white text-[10px] font-bold">VIEW FRONT</a>
                                                        </div>
                                                    </div>
                                                    <div className="aspect-[3/2] rounded-lg bg-[#0A0814] overflow-hidden border border-[#1E1A40] relative group">
                                                        <img src={profile.aadhaar_back_url} alt="Aadhaar Back" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <a href={profile.aadhaar_back_url} target="_blank" rel="noreferrer" className="text-white text-[10px] font-bold">VIEW BACK</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Secondary Doc Info */}
                                            <div className="bg-[#12102A] border border-[#1E1A40] rounded-xl p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-[10px] text-[#6B6188] uppercase tracking-wider">{profile.secondary_doc_type.replace('_', ' ')}</p>
                                                    <p className="text-white text-xs font-mono">{profile.secondary_doc_number}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="aspect-[3/2] rounded-lg bg-[#0A0814] overflow-hidden border border-[#1E1A40] relative group">
                                                        <img src={profile.secondary_doc_front_url} alt="Doc Front" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <a href={profile.secondary_doc_front_url} target="_blank" rel="noreferrer" className="text-white text-[10px] font-bold">VIEW FRONT</a>
                                                        </div>
                                                    </div>
                                                    <div className="aspect-[3/2] rounded-lg bg-[#0A0814] overflow-hidden border border-[#1E1A40] relative group">
                                                        <img src={profile.secondary_doc_back_url} alt="Doc Back" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <a href={profile.secondary_doc_back_url} target="_blank" rel="noreferrer" className="text-white text-[10px] font-bold">VIEW BACK</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}