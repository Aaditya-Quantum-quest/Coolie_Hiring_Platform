import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Plus, Edit2, Trash2, X, Building2, Upload, Users, CreditCard, Snowflake, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const HallModal = ({ hall, onClose, onSave, authFetch }) => {
    const [form, setForm] = useState(hall || { hall_name: '', capacity: '', price_per_event: '', has_ac: false, has_av_equipment: false, description: '', is_available: true });
    const [photos, setPhotos] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        photos.forEach(p => fd.append('photos', p));
        const url = hall ? `/api/v1/owner/halls/${hall.id}` : '/api/v1/owner/halls';
        const res = await authFetch(url, { method: hall ? 'PUT' : 'POST', body: fd });
        const data = await res.json();
        setSaving(false);
        if (data.success) { toast.success(hall ? 'Hall updated!' : 'Hall added!'); onSave(); onClose(); }
        else toast.error(data.error?.message || 'Failed');
    };

    const Toggle = ({ k, l }) => (
        <div className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-white/5">
            <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>{l}</span>
            <button
                type="button"
                onClick={() => setForm(p => ({ ...p, [k]: !p[k] }))}
                style={{
                    position: 'relative',
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: form[k] ? '#7B2FFF' : '#1e293b',
                    cursor: 'pointer',
                    transition: 'background-color 0.25s',
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        top: '3px',
                        left: form[k] ? 'calc(100% - 19px)' : '3px',
                        width: '16px',
                        height: '16px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    }}
                />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{hall ? 'Edit Hall' : 'Add Hall / Banquet'}</h3>
                    <button onClick={onClose} className="p-1 pl-3 hover:bg-white/10 rounded-lg transition-colors"><X size={20} style={{ color: 'var(--text-body)' }} /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>Hall Name *</label>
                        <input placeholder="e.g. Royal Grand Ballroom" value={form.hall_name} onChange={e => setForm(p => ({ ...p, hall_name: e.target.value }))}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                            style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>Capacity (persons)</label>
                            <input type="number" placeholder="0" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>Price per Event (₹)</label>
                            <input type="number" placeholder="0" value={form.price_per_event} onChange={e => setForm(p => ({ ...p, price_per_event: e.target.value }))}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Toggle k="has_ac" l="AC Available" />
                        <Toggle k="has_av_equipment" l="Projector/AV Equipment" />
                        <Toggle k="is_available" l="Available for Booking" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-body)' }}>Description (optional)</label>
                        <textarea placeholder="Tell us more about the space..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF] resize-none"
                            style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} rows={3} />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-body)' }}>Hall Photos</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer hover:border-[#7B2FFF]/50 hover:bg-[#7B2FFF]/5 transition-all group"
                            style={{ borderColor: 'var(--border-color)' }}>
                            <Upload size={24} className="mb-2 text-[#7B2FFF] transition-transform group-hover:-translate-y-1" />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Upload Hall Photos</span>
                            <span className="text-xs mt-1" style={{ color: 'var(--text-body)' }}>Up to 5 images</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e => setPhotos(Array.from(e.target.files).slice(0, 5))} />
                        </label>
                        {photos.length > 0 && (
                            <p className="text-xs mt-2 font-medium" style={{ color: '#7B2FFF' }}>{photos.length} image(s) selected</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5" style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#7B2FFF]/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ backgroundColor: '#7B2FFF', color: 'white' }}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (hall ? 'Update Hall' : 'Save Hall')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function HallManagement() {
    const { authFetch } = useBusinessAuth();
    const [halls, setHalls] = useState([]);
    const [modal, setModal] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHalls = () => {
        setLoading(true);
        authFetch('/api/v1/owner/halls').then(r => r.json()).then(d => { if (d.success) setHalls(d.data); }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchHalls(); }, []);

    const deleteHall = async (id) => {
        if (!confirm('Delete this hall?')) return;
        await authFetch(`/api/v1/owner/halls/${id}`, { method: 'DELETE' });
        toast.success('Hall deleted'); fetchHalls();
    };

    return (
        <BusinessLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Halls & Banquet</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>Manage your event halls and banquet spaces.</p>
                </div>
                <button onClick={() => setModal({})} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#7B2FFF]/20 transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: '#7B2FFF', color: 'white' }}>
                    <Plus size={18} /> Add Hall
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-[#7B2FFF] animate-spin" />
                    <p className="text-sm" style={{ color: 'var(--text-body)' }}>Loading halls...</p>
                </div>
            ) : halls.length === 0 ? (
                <div className="rounded-2xl text-center py-20" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <Building2 size={48} className="mx-auto mb-4 text-[#7B2FFF] opacity-20" />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No halls added yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>Add your first banquet space to get started.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {halls.map(hall => (
                        <div key={hall.id} className="group rounded-2xl border p-6 transition-all hover:scale-[1.01] hover:shadow-xl"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{hall.hall_name}</h3>
                                    <div className="flex gap-4 text-xs mt-2 items-center" style={{ color: 'var(--text-body)' }}>
                                        {hall.capacity && <span className="flex items-center gap-1.5"><Users size={14} className="text-[#7B2FFF]" /> {hall.capacity} Guests</span>}
                                        {hall.price_per_event && <span className="flex items-center gap-1.5"><CreditCard size={14} className="text-[#7B2FFF]" /> ₹{hall.price_per_event}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setModal(hall)} className="p-2 hover:bg-[#7B2FFF]/10 rounded-lg transition-colors" style={{ color: '#7B2FFF' }}><Edit2 size={16} /></button>
                                    <button onClick={() => deleteHall(hall.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            {hall.description && (
                                <p className="text-sm mb-5 line-clamp-2" style={{ color: 'var(--text-body)' }}>{hall.description}</p>
                            )}

                            <div className="flex gap-2 flex-wrap pt-2">
                                {hall.has_ac && (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-blue-500/20">
                                        <Snowflake size={10} /> AC INCLUDED
                                    </span>
                                )}
                                {hall.has_av_equipment && (
                                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-purple-500/20">
                                        <Video size={10} /> AV SYSTEMS
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${hall.is_available ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                    }`}>
                                    {hall.is_available ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                    {hall.is_available ? 'READY' : 'UNAVAILABLE'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal !== null && <HallModal hall={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} onSave={fetchHalls} authFetch={authFetch} />}
        </BusinessLayout>
    );
}
