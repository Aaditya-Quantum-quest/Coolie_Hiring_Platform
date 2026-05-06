import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { User, Building2, Phone, Mail, MapPin, Globe, Calendar, Camera, Save, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssetUrl } from '../../utils/assets';

export default function OwnerProfile() {
    const { authFetch, business, API } = useBusinessAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form states
    const [formData, setFormData] = useState({});
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    useEffect(() => {
        if (!editMode) {
            setLogoPreview(null);
            setCoverPreview(null);
        }
    }, [editMode]);

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name === 'logo') setLogoPreview(reader.result);
                else setCoverPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await authFetch('/api/v1/owner/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
                setFormData(data.profile);
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // We use FormData for potential image uploads
            const body = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'days_open' || key === 'payment_modes') {
                    body.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    body.append(key, formData[key]);
                }
            });

            const res = await authFetch('/api/v1/owner/profile', {
                method: 'PUT',
                body: body // Fetch handles FormData headers
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message || 'Profile updated and sent for review!');
                setEditMode(false);
                fetchProfile();
            } else {
                toast.error(data.error?.message || 'Update failed');
            }
        } catch (err) {
            console.error('Update profile error:', err);
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <BusinessLayout>
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 text-[#7B2FFF] animate-spin" />
                <p className="text-sm" style={{ color: 'var(--text-body)' }}>Loading your profile...</p>
            </div>
        </BusinessLayout>
    );

    const isRestaurant = profile?.type === 'restaurant';

    const Section = ({ title, icon: Icon, children }) => (
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Icon size={18} className="text-[#7B2FFF]" />
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            </div>
            {children}
        </div>
    );

    const InfoItem = ({ label, value, name, type = "text", editMode }) => (
        <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>{label}</label>
            {editMode ? (
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                    style={{ backgroundColor: 'var(--bg-card2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
            ) : (
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value || 'Not provided'}</p>
            )}
        </div>
    );

    return (
        <BusinessLayout>
            {/* Header / Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-8 h-48 md:h-64 group" style={{ border: '1px solid var(--border-color)' }}>
                <img
                    src={coverPreview || (profile?.cover_photo_url ? getAssetUrl(profile.cover_photo_url) : "https://images.unsplash.com/photo-1517248135467-4c7ed9d421bb?auto=format&fit=crop&q=80&w=2000")}
                    alt="Cover"
                    className="w-full h-full object-cover transition-all"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {editMode && (
                    <label className="absolute top-4 right-4 cursor-pointer bg-white/20 hover:bg-white/40 backdrop-blur-md p-2.5 rounded-full transition-all group z-10">
                        <Camera size={20} className="text-white" />
                        <input type="file" name="cover" onChange={handleFileChange} className="hidden" accept="image/*" />
                    </label>
                )}

                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end gap-6">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-[#1e293b] shadow-2xl bg-[#1e293b] relative group">
                            <img
                                src={logoPreview || (profile?.logo_url ? getAssetUrl(profile.logo_url) : `https://ui-avatars.com/api/?name=${profile?.business_name}&background=7B2FFF&color=fff&size=200`)}
                                alt="Logo"
                                className="w-full h-full object-cover"
                            />
                            {editMode && (
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                    <input type="file" name="logo" onChange={handleFileChange} className="hidden" accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 mb-2">
                        <h1 className="text-2xl md:text-3xl font-black text-white">{profile?.business_name}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#7B2FFF] text-white uppercase tracking-tighter">
                                {isRestaurant ? '🍽️ Restaurant' : '🏨 Hotel'}
                            </span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${profile?.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    profile?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {profile?.status === 'approved' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {profile?.status?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className="btn-secondary flex items-center gap-2 px-6 py-2.5 text-sm md:mb-2 bg-[#1e293b] hover:bg-[#2d3a4f] text-white border-0"
                    >
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Business Details */}
                <div className="lg:col-span-2">
                    <Section title="General Information" icon={Building2}>
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                            <InfoItem label="Business Name" value={profile?.business_name} name="business_name" editMode={false} />
                            <InfoItem label="GST Number" value={profile?.gst_number} name="gst_number" editMode={false} />
                            <InfoItem label="Established Year" value={profile?.year_established} name="year_established" editMode={false} type="number" />
                            <InfoItem label="Nearest Station" value={profile?.station ? `${profile.station.name} (${profile.station.code})` : 'Not set'} editMode={false} />
                        </div>
                        <div className="mt-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>Description</label>
                            {editMode ? (
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                    style={{ backgroundColor: 'var(--bg-card2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                />
                            ) : (
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{profile?.description || 'No description provided.'}</p>
                            )}
                        </div>
                    </Section>

                    <Section title="Address & Location" icon={MapPin}>
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                            <div className="sm:col-span-2">
                                <InfoItem label="Full Address" value={profile?.full_address} name="full_address" editMode={false} />
                            </div>
                            <InfoItem label="City" value={profile?.city} name="city" editMode={false} />
                            <InfoItem label="State" value={profile?.state} name="state" editMode={false} />
                            <InfoItem label="Pincode" value={profile?.pincode} name="pincode" editMode={false} />
                            <InfoItem label="Coordinates" value={profile?.latitude && profile?.longitude ? `${profile.latitude}, ${profile.longitude}` : 'Not set'} editMode={false} />
                        </div>
                        {!editMode && (
                            <a href="/owner/location" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#7B2FFF] hover:underline">
                                <MapPin size={14} /> Update on Map
                            </a>
                        )}
                    </Section>

                    <Section title="Operation Details" icon={Clock}>
                        <div className="grid sm:grid-cols-3 gap-6">
                            <InfoItem label="Opening Time" value={profile?.opening_time} name="opening_time" editMode={editMode} type="time" />
                            <InfoItem label="Closing Time" value={profile?.closing_time} name="closing_time" editMode={editMode} type="time" />
                            <div className="mb-4">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>Closed on Holidays</label>
                                {editMode ? (
                                    <select
                                        name="closed_on_holidays"
                                        value={formData.closed_on_holidays ? "true" : "false"}
                                        onChange={e => setFormData(prev => ({ ...prev, closed_on_holidays: e.target.value === "true" }))}
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                        style={{ backgroundColor: 'var(--bg-card2)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                ) : (
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{profile?.closed_on_holidays ? 'Yes' : 'No'}</p>
                                )}
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Right Column: Owner Info */}
                <div className="space-y-6">
                    <Section title="Owner Details" icon={User}>
                        <InfoItem label="Full Name" value={profile?.full_name} name="full_name" editMode={false} />
                        <InfoItem label="Email Address" value={profile?.email} name="email" editMode={false} />
                        <InfoItem label="Primary Phone" value={profile?.phone_primary} name="phone_primary" editMode={editMode} />
                        <InfoItem label="WhatsApp Number" value={profile?.whatsapp_number} name="whatsapp_number" editMode={editMode} />
                    </Section>

                    {editMode && (
                        <div className="sticky bottom-6 flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#7B2FFF]/20 transition-all hover:scale-[1.02]"
                                style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </BusinessLayout>
    );
}
