import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import { useApp } from '../../context/AppContext'
import { 
    User, Mail, Phone, MapPin, Camera, Save, 
    ChevronRight, Shield, Calendar, IdCard, 
    Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import { customerService } from '../../services/customerService'
import toast from 'react-hot-toast'

export default function CustomerProfile() {
    const { user: authUser, setUser: setAuthUser } = useApp()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editMode, setEditMode] = useState(false)
    
    // Form state
    const [phone, setPhone] = useState('')
    const [city, setCity] = useState('')
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const res = await customerService.getProfile()
            if (res.success) {
                setProfile(res.customer)
                setPhone(res.customer.phone || '')
                setCity(res.customer.city || '')
                setPhotoPreview(res.customer.profile_photo_url ? res.customer.profile_photo_url : null)
            }
        } catch (err) {
            console.error('Fetch profile error:', err)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB')
                return
            }
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const formData = new FormData()
            formData.append('phone', phone)
            formData.append('city', city)
            if (photoFile) {
                formData.append('profile_photo', photoFile)
            }

            const res = await customerService.updateProfile(formData)
            if (res.success) {
                toast.success('Profile updated successfully!')
                setProfile(res.customer)
                setAuthUser({ ...authUser, ...res.customer })
                setEditMode(false)
            }
        } catch (err) {
            console.error('Update profile error:', err)
            toast.error(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />

            <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <User className="text-orange-500" />
                                My Profile
                            </h1>
                            <p className="text-slate-400 mt-1">Manage your account information and preferences</p>
                        </div>
                        <button
                            onClick={() => editMode ? handleSave() : setEditMode(true)}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                                editMode 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : editMode ? (
                                <Save size={18} />
                            ) : (
                                <User size={18} />
                            )}
                            {saving ? 'Saving...' : editMode ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column: Photo & Stats */}
                        <div className="space-y-6">
                            <div className="card p-6 flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-slate-600" />
                                        )}
                                    </div>
                                    {editMode && (
                                        <button 
                                            onClick={() => fileInputRef.current.click()}
                                            className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white border-4 border-slate-900 hover:scale-110 transition-transform"
                                        >
                                            <Camera size={18} />
                                        </button>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoChange} 
                                        className="hidden" 
                                        accept="image/*" 
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-white mt-4">{profile?.name}</h2>
                                <p className="text-slate-400 text-sm">Customer ID: <span className="text-orange-500 font-mono">U-{profile?.id?.substring(0, 5).toUpperCase()}</span></p>
                                
                                <div className="w-full h-px bg-slate-800 my-6"></div>
                                
                                <div className="grid grid-cols-2 gap-4 w-full text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-white">{profile?.total_bookings || 0}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">Bookings</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{profile?.avg_rating || '0.0'}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">Rating</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-5 space-y-4">
                                <h3 className="text-white font-bold text-sm uppercase tracking-widest text-slate-500">Security</h3>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Shield size={18} className="text-green-500" />
                                    <span className="text-sm">Account Verified</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar size={18} className="text-blue-500" />
                                    <span className="text-sm">Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="card p-8">
                                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                                
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-2">Full Name</label>
                                            <div className="flex items-center gap-3 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 cursor-not-allowed">
                                                <User size={18} />
                                                <span>{profile?.name}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-2">Email Address</label>
                                            <div className="flex items-center gap-3 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 cursor-not-allowed">
                                                <Mail size={18} />
                                                <span>{profile?.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-2">Phone Number</label>
                                            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                                                editMode 
                                                ? 'bg-slate-800 border-orange-500/50 focus-within:border-orange-500' 
                                                : 'bg-slate-800/50 border-slate-700'
                                            }`}>
                                                <Phone size={18} className={editMode ? 'text-orange-400' : 'text-slate-500'} />
                                                <input 
                                                    type="tel" 
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    disabled={!editMode}
                                                    placeholder="Enter phone number"
                                                    className="bg-transparent border-none outline-none text-white w-full disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-500 mb-2">Primary City</label>
                                            <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                                                editMode 
                                                ? 'bg-slate-800 border-orange-500/50 focus-within:border-orange-500' 
                                                : 'bg-slate-800/50 border-slate-700'
                                            }`}>
                                                <MapPin size={18} className={editMode ? 'text-orange-400' : 'text-slate-500'} />
                                                <input 
                                                    type="text" 
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    disabled={!editMode}
                                                    placeholder="e.g. New Delhi"
                                                    className="bg-transparent border-none outline-none text-white w-full disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex items-center gap-3 text-sm text-slate-500 bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
                                        <AlertCircle size={18} className="text-orange-500" />
                                        <p>Your ID and Email cannot be changed as they are linked to your official account registration.</p>
                                    </div>
                                </div>
                            </div>

                            {editMode && (
                                <div className="flex items-center justify-end gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <button 
                                        onClick={() => {
                                            setEditMode(false)
                                            setPhone(profile.phone || '')
                                            setCity(profile.city || '')
                                            setPhotoPreview(profile.profile_photo_url ? profile.profile_photo_url : null)
                                            setPhotoFile(null)
                                        }}
                                        className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
