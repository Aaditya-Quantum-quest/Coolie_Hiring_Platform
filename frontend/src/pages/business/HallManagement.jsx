import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
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
        <div className="flex items-center justify-between">
            <span className="text-sm text-[#444653]">{l}</span>
            <button type="button" onClick={() => setForm(p => ({ ...p, [k]: !p[k] }))}
                className={`w-11 h-6 rounded-full relative transition-colors ${form[k] ? 'bg-[#00288E]' : 'bg-[#C4C5D5]'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${form[k] ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-[#E5EEFF]">
                    <h3 className="font-bold text-[#0b1c30]">{hall ? 'Edit Hall' : 'Add Hall / Banquet'}</h3>
                    <button onClick={onClose}><X size={18} className="text-[#757684]" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <input placeholder="Hall Name *" value={form.hall_name} onChange={e => setForm(p => ({ ...p, hall_name: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00288E]" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Capacity (persons)" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} className="border border-[#C4C5D5] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00288E]" />
                        <input type="number" placeholder="Price per Event (₹)" value={form.price_per_event} onChange={e => setForm(p => ({ ...p, price_per_event: e.target.value }))} className="border border-[#C4C5D5] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00288E]" />
                    </div>
                    <Toggle k="has_ac" l="AC Available" />
                    <Toggle k="has_av_equipment" l="Projector/AV Equipment" />
                    <Toggle k="is_available" l="Available for Booking" />
                    <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E] resize-none" rows={2} />
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#C4C5D5] rounded-xl p-5 cursor-pointer hover:border-[#00288E] transition-colors">
                        <span className="text-xl mb-1">📤</span>
                        <span className="text-[#00288E] text-sm font-medium">Upload Hall Photos</span>
                        <span className="text-[#757684] text-xs">Up to 5 images</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => setPhotos(Array.from(e.target.files).slice(0, 5))} />
                    </label>
                </div>
                <div className="flex gap-3 p-5 border-t border-[#E5EEFF]">
                    <button onClick={onClose} className="flex-1 py-2 border border-[#C4C5D5] rounded-lg text-sm text-[#444653]">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-[#00288E] text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                        {saving ? 'Saving...' : 'Save Hall'}
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0b1c30]">Halls & Banquet</h1>
                    <p className="text-[#757684] text-sm mt-1">Manage your event halls and banquet spaces.</p>
                </div>
                <button onClick={() => setModal({})} className="flex items-center gap-2 px-4 py-2.5 bg-[#00288E] text-white rounded-lg text-sm font-semibold hover:bg-[#001a6b] transition-colors">
                    <Plus size={16} /> Add Hall
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#00288E] border-t-transparent rounded-full animate-spin" /></div>
            ) : halls.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E5EEFF] text-center py-20">
                    <p className="text-4xl mb-3">🏛️</p>
                    <p className="text-[#0b1c30] font-semibold">No halls added yet</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {halls.map(hall => (
                        <div key={hall.id} className="bg-white rounded-xl border border-[#E5EEFF] shadow-sm p-5">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div>
                                    <p className="font-bold text-[#0b1c30]">{hall.hall_name}</p>
                                    <div className="flex gap-3 text-xs text-[#757684] mt-1">
                                        {hall.capacity && <span>👥 {hall.capacity} persons</span>}
                                        {hall.price_per_event && <span>₹{hall.price_per_event}/event</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => setModal(hall)} className="text-[#757684] hover:text-[#00288E]"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteHall(hall.id)} className="text-[#757684] hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {hall.has_ac && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-medium">❄️ AC</span>}
                                {hall.has_av_equipment && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-medium">📽️ AV</span>}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${hall.is_available ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {hall.is_available ? '✅ Available' : '❌ Unavailable'}
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
