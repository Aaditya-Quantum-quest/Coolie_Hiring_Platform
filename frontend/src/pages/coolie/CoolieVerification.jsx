import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShieldCheck, Star, MapPin, Award, User, CheckCircle, Train, Activity } from 'lucide-react'
import axios from 'axios'
import { getAssetUrl } from '../../utils/assets'

export default function CoolieVerification() {
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [coolie, setCoolie] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                const res = await axios.get(`/api/coolies/verify/${id}`)
                if (res.data.success) {
                    setCoolie(res.data.data)
                }
            } catch (err) {
                console.error(err)
                setError('Profile not found or invalid QR code')
            } finally {
                setLoading(false)
            }
        }
        fetchPublicProfile()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0814] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2FFF]"></div>
            </div>
        )
    }

    if (error || !coolie) {
        return (
            <div className="min-h-screen bg-[#0A0814] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
                    <MapPin size={40} className="text-red-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Invalid Profile</h1>
                <p className="text-[#6B6188] mb-6 max-w-xs">{error || 'This QR code does not belong to an active Coolie in our system.'}</p>
                <Link to="/" className="px-6 py-2.5 rounded-xl bg-[#1E1A40] text-white font-bold hover:bg-[#2E2850] transition-all">Go Back</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0A0814] text-white selection:bg-[#7B2FFF]/30">
            <div className="max-w-md mx-auto pt-10 pb-20 px-6">
                
                {/* ── VERIFIED BADGE ── */}
                <div className="flex justify-center mb-8">
                    <div className="bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                        <ShieldCheck size={18} className="text-[#A855F7]" />
                        <span className="text-[#A855F7] text-xs font-black uppercase tracking-widest">Officially Verified</span>
                    </div>
                </div>

                {/* ── PROFILE HEADER ── */}
                <div className="relative mb-10 text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#7B2FFF] to-[#1E1A40] p-[2px] shadow-[0_0_40px_rgba(123,47,255,0.2)]">
                            <div className="w-full h-full rounded-[22px] bg-[#0E0C1E] flex items-center justify-center overflow-hidden">
                                {coolie.profile_img_url ? (
                                    <img src={getAssetUrl(coolie.profile_img_url)} alt={coolie.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-[#6B6188]" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl border-4 border-[#0A0814] flex items-center justify-center shadow-lg">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black mb-1 tracking-tight">{coolie.name}</h1>
                    <p className="text-[#A855F7] font-mono text-sm tracking-widest mb-1">{coolie.coolie_id}</p>
                    <div className="flex items-center justify-center gap-1.5 text-[#6B6188] text-xs">
                        <MapPin size={12} className="text-[#7B2FFF]" />
                        {coolie.station_name}
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-black text-sm">{coolie.rating_avg.toFixed(1)}</span>
                        </div>
                        <p className="text-[#6B6188] text-[9px] uppercase font-bold tracking-wider">Rating</p>
                    </div>
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-3 text-center">
                        <p className="text-white font-black text-sm mb-1">{coolie.total_trips}</p>
                        <p className="text-[#6B6188] text-[9px] uppercase font-bold tracking-wider">Trips</p>
                    </div>
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-3 text-center">
                        <p className="text-white font-black text-sm mb-1">{coolie.age || 25}</p>
                        <p className="text-[#6B6188] text-[9px] uppercase font-bold tracking-wider">Age</p>
                    </div>
                </div>

                {/* ── DETAILS ── */}
                <div className="space-y-4">
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <Award size={20} className="text-orange-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Professional Porter</p>
                            <p className="text-[#6B6188] text-xs">Certified Indian Railways Porter</p>
                        </div>
                    </div>

                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <Activity size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{coolie.is_online ? 'Currently Active' : 'Offline'}</p>
                            <p className="text-[#6B6188] text-xs">Real-time status tracking active</p>
                        </div>
                    </div>

                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Train size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Working Platforms</p>
                            <p className="text-[#6B6188] text-xs">{coolie.working_platforms?.join(', ') || 'All Platforms'}</p>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="mt-12 text-center">
                    <p className="text-[#6B6188] text-xs mb-6 px-10">This profile is cryptographically signed and verified by Coolie Hiring System.</p>
                    <Link to="/login" className="w-full block py-3.5 rounded-2xl bg-gradient-to-r from-[#7B2FFF] to-[#5B1FCC] text-white font-black text-sm shadow-[0_10px_30px_rgba(123,47,255,0.3)] hover:shadow-[0_15px_40px_rgba(123,47,255,0.4)] transition-all">
                        Book a Coolie Now
                    </Link>
                </div>
            </div>
        </div>
    )
}
