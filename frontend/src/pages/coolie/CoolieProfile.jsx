import React, { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Sidebar from '../../components/Sidebar'
import {
    User, Phone, MapPin, Shield, Star, Edit3, Camera,
    Check, X, CreditCard, Download, Briefcase, Share2, Zap, Package , ShieldCheck , Plus , Mail , Globe , Calendar , Clock , Building2, FileText , Eye, Image
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import { coolieProfileService } from '../../services/coolieService'

export default function CoolieProfile() {
    const {     user } = useApp()

    const downloadQR = () => {
        const canvas = document.getElementById('coolie-qr-canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            let downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `Coolie_QR_${user?.coolie_id || 'profile'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success('QR Code downloaded!');
        }
    };

    const [loading, setLoading] = useState(true)
    const calculateAge = (dob) => {
        if (!dob) return '—'
        const birthDate = new Date(dob)
        const diff = Date.now() - birthDate.getTime()
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    }

    const [profile, setProfile] = useState({
        name: user?.name || 'Coolie',
        id: user?.coolie_id || 'PENDING',
        station: user?.station_name || 'N/A',
        stationZone: 'Zone: Indian Railways',
        platforms: user?.working_platforms || [],
        age: user?.age || (user?.date_of_birth ? calculateAge(user.date_of_birth) : '—'),
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
        phone: user?.phone || '—',
        altPhone: user?.alt_phone || '—',
        dateOfBirth: user?.date_of_birth || '—',
        address: user?.address || '—',
        city: user?.city || '—',
        state: user?.state || '—',
        pincode: user?.pincode || '—',
        stationCode: user?.station_code || '—',
        gender: user?.gender || '—',
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
                    console.log('DEBUG: Profile data received:', data)
                    console.log('DEBUG: date_of_birth:', data.date_of_birth)
                    console.log('DEBUG: age:', data.age)
                    console.log('DEBUG: calculated age:', calculateAge(data.date_of_birth))
                    setProfile(prev => ({
                        ...prev,
                        name: data.name || user?.name || 'Coolie',
                        id: data.coolie_id || user?.coolie_id || 'PENDING',
                        station: data.station_name || user?.station_name || 'N/A',
                        platforms: data.working_platforms || user?.working_platforms || [],
                        age: data.age || (data.date_of_birth ? calculateAge(data.date_of_birth) : (user?.age || '—')),
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
                                : '—',
                        phone: data.phone || user?.phone || '—',
                        altPhone: data.alt_phone || user?.alt_phone || '—',
                        dateOfBirth: data.date_of_birth || user?.date_of_birth || '—',
                        address: data.address || user?.address || '—',
                        city: data.city || user?.city || '—',
                        state: data.state || user?.state || '—',
                        pincode: data.pincode || user?.pincode || '—',
                        stationCode: data.station_code || user?.station_code || '—',
                        gender: data.gender || user?.gender || '—',
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
    const [langInput, setLangInput] = useState('')
    const [platformInput, setPlatformInput] = useState('')
    const [fullscreenDoc, setFullscreenDoc] = useState(null)

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

        const fieldMap = {
            phone: 'phone',
            altPhone: 'alt_phone',
        }
        const backendField = fieldMap[editingField] || editingField
        const whitelist = ['phone', 'alt_phone']
        if (!whitelist.includes(backendField)) {
            toast.error('This field cannot be updated')
            return
        }

        try {
            const updateData = { [backendField]: editVal }
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

    const saveLanguages = async (newLanguages) => {
        const coolieId = user?.coolie_id || user?.id
        if (!coolieId || coolieId === 'pending-id' || coolieId === 'undefined') {
            toast.error('Invalid coolie ID')
            return
        }
        try {
            await coolieProfileService.updateProfile(coolieId, { languages_spoken: newLanguages })
            setProfile(p => ({ ...p, languages: newLanguages }))
            toast.success('Languages updated!')
        } catch (error) {
            console.error('Error updating languages:', error)
            toast.error('Failed to update languages')
        }
    }

    const savePlatforms = async (newPlatforms) => {
        const coolieId = user?.coolie_id || user?.id
        if (!coolieId || coolieId === 'pending-id' || coolieId === 'undefined') {
            toast.error('Invalid coolie ID')
            return
        }
        try {
            await coolieProfileService.updateProfile(coolieId, { working_platforms: newPlatforms })
            setProfile(p => ({ ...p, platforms: newPlatforms }))
            toast.success('Platforms updated!')
        } catch (error) {
            console.error('Error updating platforms:', error)
            toast.error('Failed to update platforms')
        }
    }

    const addLanguage = () => {
        const lang = langInput.trim()
        if (!lang) return
        if (profile.languages.includes(lang)) {
            toast.error('Language already added')
            return
        }
        const updated = [...profile.languages, lang]
        setLangInput('')
        saveLanguages(updated)
    }

    const removeLanguage = (lang) => {
        const updated = profile.languages.filter(l => l !== lang)
        saveLanguages(updated)
    }

    const addPlatform = () => {
        const pf = platformInput.trim()
        if (!pf) return
        if (profile.platforms.includes(pf)) {
            toast.error('Platform already added')
            return
        }
        const updated = [...profile.platforms, pf]
        setPlatformInput('')
        savePlatforms(updated)
    }

    const removePlatform = (pf) => {
        const updated = profile.platforms.filter(p => p !== pf)
        savePlatforms(updated)
    }

    const openFullscreen = (doc) => {
        if (doc.url) {
            setFullscreenDoc(doc)
        }
    }

    const closeFullscreen = () => {
        setFullscreenDoc(null)
    }

    // ESC key handler for fullscreen document
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && fullscreenDoc) {
                closeFullscreen()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [fullscreenDoc])

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
        <div className="flex bg-[#0A0814] min-h-screen text-slate-300 font-sans selection:bg-[#7B2FFF] selection:text-white">
            <Sidebar role="coolie" />
            
            <main className="flex-1 md:ml-64 p-4 md:p-10 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-[#7B2FFF]/20 border-t-[#7B2FFF] rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-[#7B2FFF]/10 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-10 pb-24">
                        {/* ── HERO SECTION ── */}
                        <div className="relative group">
                            {/* Dynamic Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#7B2FFF]/20 to-[#A855F7]/20 blur-[120px] rounded-[3rem] -z-10 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
                            
                            <div className="bg-[#1C1C2D]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-14 flex flex-col lg:flex-row items-center lg:items-end gap-12 relative overflow-hidden shadow-2xl">
                                
                                {/* Profile Image */}
                                <div className="relative shrink-0">
                                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[6px] border-[#2D2D44] overflow-hidden bg-[#12102A] shadow-[0_0_50px_rgba(123,47,255,0.3)] transition-all duration-700 group-hover:scale-105 group-hover:rotate-2">
                                        <img
                                            src={profile.passport_photo_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#7B2FFF] rounded-full border-4 border-[#1C1C2D] flex items-center justify-center text-white hover:bg-[#9D5BFF] hover:scale-110 transition-all shadow-xl z-20">
                                        <Camera size={20} />
                                    </button>
                                </div>

                                {/* Name & Quick Stats */}
                                <div className="flex-1 text-center lg:text-left">
                                    <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
                                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-sm">{profile.name}</h1>
                                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-1.5 rounded-full">
                                            <ShieldCheck size={16} className="text-green-400" />
                                            <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em]">Verified Elite</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10 text-slate-400 font-medium">
                                        <span className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                            <MapPin size={20} className="text-[#A855F7]" /> 
                                            {profile.station}
                                        </span>
                                        <span className="flex items-center gap-2.5 bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-400/20 font-black">
                                            <Star size={20} fill="currentColor" /> 
                                            {Number(profile.rating).toFixed(1)} Rating
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                        <button 
                                            onClick={() => toast.success('Profile link copied!')}
                                            className="px-10 py-4 bg-[#2D2D44] hover:bg-[#3D3D5A] text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all hover:-translate-y-1 active:translate-y-0"
                                        >
                                            <Share2 size={20} /> Share ID
                                        </button>
                                    </div>
                                </div>

                                {/* Verification QR Card */}
                                <div className="lg:absolute lg:right-10 lg:top-1/2 lg:-translate-y-1/2 flex flex-col items-center bg-[#12102A]/80 backdrop-blur-2xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl group/qr hover:border-[#7B2FFF]/50 transition-all duration-500">
                                     <div className="p-3 bg-white rounded-[1.5rem] shadow-inner mb-4 group-hover/qr:scale-105 transition-transform duration-500">
                                        <QRCodeCanvas 
                                            id="coolie-qr-canvas"
                                            value={`${window.location.origin}/verify/coolie/${profile.id}`}
                                            size={120}
                                            level="H"
                                            includeMargin={false}
                                        />
                                     </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">PORTER ID: {profile.id}</p>
                                    <button 
                                        onClick={downloadQR} 
                                        className="w-full py-3 bg-[#7B2FFF]/10 hover:bg-[#7B2FFF] text-[#7B2FFF] hover:text-white border border-[#7B2FFF]/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all group/dl"
                                    >
                                        <Download size={16} className="group-hover/dl:animate-bounce" /> Save Digital ID
                                    </button>
                                </div>
                            </div>
                        </div>

                    {/* ── MAIN CONTENT GRID ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                        
                        {/* LEFT COLUMN: CORE INFO */}
                        <div className="xl:col-span-2 space-y-10">
                            
                            {/* Performance & XP */}
                            <div className="relative overflow-hidden">
                                <XPDisplay />
                            </div>

                            {/* Work & Personal Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                
                                {/* Work Details Card */}
                                <div className="bg-[#14142B] border border-white/5 rounded-[2.5rem] p-10 group/card hover:bg-[#1C1C35] transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-[#7B2FFF]/10 flex items-center justify-center text-[#7B2FFF] group-hover/card:scale-110 transition-transform">
                                            <Package size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Work Details</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Zone</p>
                                            <p className="text-white font-black text-xl tracking-tight">{profile.station}</p>
                                            <p className="text-[#7B2FFF] text-[10px] font-bold uppercase">{profile.stationZone || 'Main Terminal'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deliveries</p>
                                            <p className="text-white font-black text-xl tracking-tight">{profile.totalTrips.toLocaleString()}+</p>
                                            <p className="text-green-400 text-[10px] font-bold uppercase">99% Success</p>
                                        </div>
                                    </div>
                                    <div className="mt-10 pt-10 border-t border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Platform Coverage</p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.platforms.map(pf => (
                                                <span key={pf} className="relative group/pf w-10 h-10 rounded-xl bg-[#0A0814] border border-white/5 flex items-center justify-center text-xs font-black text-white hover:border-[#7B2FFF] hover:text-[#7B2FFF] cursor-default transition-all">
                                                    {pf}
                                                    <button
                                                        onClick={() => removePlatform(pf)}
                                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/pf:opacity-100 transition-opacity"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                            <div className="flex items-center gap-1">
                                                <input
                                                    value={platformInput}
                                                    onChange={e => setPlatformInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && addPlatform()}
                                                    placeholder="Add"
                                                    className="w-16 h-10 rounded-xl bg-[#0A0814] border border-white/10 text-white text-xs font-bold text-center outline-none focus:border-[#7B2FFF] placeholder:text-[10px] placeholder:text-slate-600"
                                                />
                                                <button
                                                    onClick={addPlatform}
                                                    className="w-10 h-10 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Info Card */}
                                <div className="bg-[#14142B] border border-white/5 rounded-[2.5rem] p-10 group/card hover:bg-[#1C1C35] transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7] group-hover/card:scale-110 transition-transform">
                                            <User size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Personal Profile</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {/* Name — read only */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</p>
                                                <p className="text-white font-bold">{profile.name}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <User size={14} />
                                            </div>
                                        </div>

                                        {/* Email — read only */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                                                <p className="text-white font-bold">{user?.email || profile.email || '—'}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Mail size={14} />
                                            </div>
                                        </div>

                                        {/* Phone — editable */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                                                {editingField === 'phone' ? (
                                                    <div className="flex items-center gap-2 mt-1">
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
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-white font-bold">{profile.phone}</p>
                                                        <button
                                                            onClick={() => startEdit('phone', profile.phone === '—' ? '' : profile.phone)}
                                                            className="text-[#6B6188] hover:text-[#A855F7] transition-all"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Phone size={14} />
                                            </div>
                                        </div>

                                        {/* Alt Phone — read only (display only) */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alternate Phone</p>
                                                <p className="text-white font-bold">{profile.altPhone}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Phone size={14} />
                                            </div>
                                        </div>

                                        {/* DOB — read only */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date of Birth</p>
                                                <p className="text-white font-bold">{profile.dateOfBirth !== '—' ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN') : '—'}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Calendar size={14} />
                                            </div>
                                        </div>

                                        {/* Age & Gender — read only */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Age & Gender</p>
                                                <p className="text-white font-bold">{profile.age} Years • {profile.gender ? (profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)) : (user?.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : '—')}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Calendar size={14} />
                                            </div>
                                        </div>

                                        {/* Address — read only */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</p>
                                                <p className="text-white font-bold text-sm">{profile.address}</p>
                                                <p className="text-[#6B6188] text-xs">{profile.city}, {profile.state} — {profile.pincode}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <MapPin size={14} />
                                            </div>
                                        </div>

                                        {/* Station Code — read only */}
                                        <div className="flex justify-between items-center group/item">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Station Code</p>
                                                <p className="text-white font-bold">{profile.stationCode}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <MapPin size={14} />
                                            </div>
                                        </div>

                                        {/* Languages — editable add/remove */}
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Languages Spoken</p>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {profile.languages.map(lang => (
                                                    <span key={lang} className="relative group/lang inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1A40] border border-white/10 text-white text-xs font-semibold">
                                                        {lang}
                                                        <button
                                                            onClick={() => removeLanguage(lang)}
                                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={langInput}
                                                    onChange={e => setLangInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && addLanguage()}
                                                    placeholder="Add language..."
                                                    className="flex-1 bg-[#0A0814] border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder:text-slate-600"
                                                />
                                                <button
                                                    onClick={addLanguage}
                                                    className="w-9 h-9 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/20 flex items-center justify-center text-[#7B2FFF] hover:bg-[#7B2FFF] hover:text-white transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: STATUS & PAYMENTS */}
                        <div className="space-y-10">
                            
                            {/* Verification Status Card */}
                            <div className="bg-gradient-to-br from-[#7B2FFF] to-[#5D46FF] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                                
                                <div className="flex items-center gap-4 mb-8">
                                    <Shield size={28} className="drop-shadow-lg" />
                                    <h2 className="text-2xl font-black tracking-tight">Identity Status</h2>
                                </div>
                                
                                <div className="space-y-6 relative z-10">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Background Check</span>
                                            <Check size={16} />
                                        </div>
                                        <p className="text-xl font-black">CLEARED</p>
                                        <p className="text-[10px] opacity-70 font-bold uppercase mt-1">Verified on {profile.verifiedDate}</p>
                                    </div>
                                    
                                </div>
                            </div>

                            {/* Payment Methods Card */}
                            <div className="bg-[#14142B] border border-white/5 rounded-[2.5rem] p-10 group/card hover:bg-[#1C1C35] transition-all duration-500">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-400/10 flex items-center justify-center text-orange-400 group-hover/card:scale-110 transition-transform">
                                            <CreditCard size={24} />
                                        </div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Payments</h2>
                                    </div>
                                    <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Bank Account */}
                                    <div className="bg-[#1C1C35] border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-[#7B2FFF]/50 transition-all cursor-pointer">
                                        <div className="w-14 h-14 rounded-2xl bg-[#12102A] flex items-center justify-center text-slate-400">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-black text-sm uppercase tracking-tight">{profile.bankName}</p>
                                            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">**** {profile.bankAccount.slice(-4)}</p>
                                        </div>
                                        <div className="bg-green-500/10 text-green-400 text-[8px] font-black px-2 py-1 rounded-full border border-green-500/20">ACTIVE</div>
                                    </div>

                                    {/* UPI ID */}
                                    <div className="bg-[#1C1C35] border border-white/10 rounded-3xl p-6 flex items-center gap-5 hover:border-[#7B2FFF]/50 transition-all cursor-pointer">
                                        <div className="w-14 h-14 rounded-2xl bg-[#12102A] flex items-center justify-center text-slate-400">
                                            <Zap size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-black text-sm uppercase tracking-tight">Instant UPI</p>
                                            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">{profile.upiId || 'PENDING'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── DOCUMENTS SECTION ── */}
                    <div className="bg-[#14142B] border border-white/5 rounded-[3rem] p-10 md:p-14 group/docs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-[#7B2FFF]/10 flex items-center justify-center text-[#7B2FFF] group-hover/docs:rotate-6 transition-transform">
                                    <FileText size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">Identity Documents</h2>
                                    <p className="text-slate-500 font-medium">Official Government Verification Proofs</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Aadhaar Front', url: profile.aadhaar_front_url },
                                { label: 'Aadhaar Back', url: profile.aadhaar_back_url },
                                { label: 'Secondary Proof', url: profile.secondary_doc_front_url },
                                { label: 'License Copy', url: profile.secondary_doc_back_url }
                            ].map((doc, i) => (
                                <div key={i} className="group/item relative aspect-[1.4/1] rounded-[2rem] bg-[#0A0814] border border-white/5 overflow-hidden cursor-pointer hover:border-[#7B2FFF]/50 transition-all duration-500" onClick={() => openFullscreen(doc)}>
                                    {doc.url ? (
                                        <img src={doc.url} alt={doc.label} className="w-full h-full object-cover opacity-40 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-700 group-hover/item:text-slate-400 transition-colors">
                                            <Image size={40} strokeWidth={1.5} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Preview</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0814] via-transparent to-transparent opacity-90 group-hover/item:opacity-0 transition-opacity duration-500 flex items-end p-8">
                                        <p className="text-white font-black text-xs uppercase tracking-widest">{doc.label}</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#7B2FFF]/20 opacity-0 group-hover/item:opacity-100 backdrop-blur-sm transition-all duration-500">
                                        <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-50 group-hover/item:scale-100 transition-transform duration-500">
                                            <Eye size={24} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    </div>
                )}
            </main>

            {/* ── FULLSCREEN DOCUMENT VIEWER ── */}
            {fullscreenDoc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={closeFullscreen} />
                    <div className="relative z-10 max-w-xl max-h-[85vh] w-full">
                        <div className="bg-[#1C1C35] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#7B2FFF]/10 flex items-center justify-center text-[#7B2FFF]">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white">{fullscreenDoc.label}</h3>
                                        <p className="text-slate-400 text-xs">Click outside or press ESC to close</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeFullscreen}
                                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            
                            {/* Document Image */}
                            <div className="p-4 bg-black/20">
                                <div className="relative w-full">
                                    <img
                                        src={fullscreenDoc.url}
                                        alt={fullscreenDoc.label}
                                        className="w-full h-auto max-h-[65vh] object-contain rounded-lg"
                                    />
                                </div>
                            </div>
                            
                            {/* Footer Actions */}
                            <div className="flex items-center justify-between p-4 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <a
                                        href={fullscreenDoc.url}
                                        download={`${fullscreenDoc.label.replace(/\s+/g, '_')}.jpg`}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#7B2FFF]/10 hover:bg-[#7B2FFF]/20 text-[#7B2FFF] rounded-lg text-sm font-semibold transition-all"
                                    >
                                        <Download size={14} />
                                        Download
                                    </a>
                                </div>
                                <button
                                    onClick={closeFullscreen}
                                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EDITING OVERLAY ── */}
            {editingField && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={cancelEdit} />
                    <div className="bg-[#1C1C35] border border-white/10 rounded-[3rem] p-10 md:p-14 max-w-xl w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-[#7B2FFF]/10 flex items-center justify-center text-[#7B2FFF]">
                                <Edit3 size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Update Profile</h3>
                                <p className="text-slate-500 font-medium text-sm">Modifying {editingField.replace('_', ' ')}</p>
                            </div>
                        </div>
                        
                        <input
                            autoFocus
                            className="w-full bg-[#0A0814] border-2 border-white/5 rounded-2xl px-8 py-6 text-xl text-white font-black outline-none focus:border-[#7B2FFF] transition-all mb-10 shadow-inner"
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            placeholder={`Enter new ${editingField}...`}
                        />
                        
                        <div className="grid grid-cols-2 gap-6">
                            <button 
                                onClick={cancelEdit} 
                                className="py-5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Discard
                            </button>
                            <button 
                                onClick={saveEdit} 
                                className="py-5 bg-[#5D46FF] hover:bg-[#725DFF] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#5D46FF]/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}