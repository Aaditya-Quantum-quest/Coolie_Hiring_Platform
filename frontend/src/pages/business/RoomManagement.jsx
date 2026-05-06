import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Plus, Edit2, Trash2, X, Bed, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ROOM_TYPES_LIST = ['Single Bed Room', 'Double Bed Room', 'Twin Room', 'Suite / Deluxe Room', 'Dormitory / Shared Room', 'Hall / Banquet Hall'];

const toggleTrackStyle = (on) => ({
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    backgroundColor: on ? '#7B2FFF' : '#1e293b',
    cursor: 'pointer',
    transition: 'background-color 0.25s',
    flexShrink: 0,
});

const toggleThumbStyle = (on) => ({
    position: 'absolute',
    top: '3px',
    left: on ? 'calc(100% - 19px)' : '3px',
    width: '16px',
    height: '16px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
});

const smallToggleTrackStyle = (on) => ({
    position: 'relative',
    width: '36px',
    height: '20px',
    borderRadius: '10px',
    border: '1px solid var(--border-color)',
    backgroundColor: on ? '#7B2FFF' : '#1e293b',
    cursor: 'pointer',
    transition: 'background-color 0.25s',
    flexShrink: 0,
});

const smallToggleThumbStyle = (on) => ({
    position: 'absolute',
    top: '2px',
    left: on ? 'calc(100% - 16px)' : '2px',
    width: '14px',
    height: '14px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
});

const RoomModal = ({ room, onClose, onSave, authFetch }) => {
    const [form, setForm] = useState(room || {
        room_type: ROOM_TYPES_LIST[0],
        price_per_night: '',
        total_rooms_of_type: '',
        extra_bed_available: false,
        extra_bed_charge: '',
        description: '',
        is_available: true,
    });
    const [photos, setPhotos] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        photos.forEach(p => fd.append('photos', p));
        const url = room ? `/api/v1/owner/rooms/${room.id}` : '/api/v1/owner/rooms';
        const res = await authFetch(url, { method: room ? 'PUT' : 'POST', body: fd });
        const data = await res.json();
        setSaving(false);
        if (data.success) {
            toast.success(room ? 'Room updated!' : 'Room added!');
            onSave();
            onClose();
        } else {
            toast.error(data.error?.message || 'Failed');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {room ? 'Edit Room Type' : 'Add Room Type'}
                    </h3>
                    <button onClick={onClose} className="p-1 pl-3 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} style={{ color: 'var(--text-body)' }} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">

                    {/* Room Type */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                            style={{ color: 'var(--text-body)' }}>Room Type Category</label>
                        <select
                            value={form.room_type}
                            onChange={e => setForm(p => ({ ...p, room_type: e.target.value }))}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                            style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                            {ROOM_TYPES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Price + Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                style={{ color: 'var(--text-body)' }}>Price per Night (₹)</label>
                            <input
                                type="number" placeholder="0.00"
                                value={form.price_per_night}
                                onChange={e => setForm(p => ({ ...p, price_per_night: e.target.value }))}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                style={{ color: 'var(--text-body)' }}>Total Capacity</label>
                            <input
                                type="number" placeholder="e.g. 2"
                                value={form.total_rooms_of_type}
                                onChange={e => setForm(p => ({ ...p, total_rooms_of_type: e.target.value }))}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>
                    </div>

                    {/* Extra Bed Toggle */}
                    <div>
                        <div className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-white/5">
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Allow Extra Bed</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-body)' }}>Additional charges may apply</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, extra_bed_available: !p.extra_bed_available }))}
                                style={toggleTrackStyle(form.extra_bed_available)}>
                                <span style={toggleThumbStyle(form.extra_bed_available)} />
                            </button>
                        </div>

                        {form.extra_bed_available && (
                            <div className="mt-3">
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                                    style={{ color: 'var(--text-body)' }}>Extra Bed Charge (₹)</label>
                                <input
                                    type="number" placeholder="Charge per night"
                                    value={form.extra_bed_charge}
                                    onChange={e => setForm(p => ({ ...p, extra_bed_charge: e.target.value }))}
                                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF]"
                                    style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            </div>
                        )}
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                            style={{ color: 'var(--text-body)' }}>Room Photo</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer hover:border-[#7B2FFF]/50 hover:bg-[#7B2FFF]/5 transition-all group"
                            style={{ borderColor: 'var(--border-color)' }}>
                            <Upload size={24} className="mb-2 text-[#7B2FFF] transition-transform group-hover:-translate-y-1" />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Click to upload</span>
                            <span className="text-xs mt-1" style={{ color: 'var(--text-body)' }}>PNG, JPG up to 5MB</span>
                            <input type="file" accept="image/*" multiple className="hidden"
                                onChange={e => setPhotos(Array.from(e.target.files))} />
                        </label>
                        {photos.length > 0 && (
                            <p className="text-xs mt-2 font-medium" style={{ color: '#7B2FFF' }}>
                                {photos.length} photo(s) selected
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                            style={{ color: 'var(--text-body)' }}>Description</label>
                        <textarea
                            placeholder="Tell us more about the room..."
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-1 focus:ring-[#7B2FFF] resize-none"
                            style={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            rows={2} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5"
                        style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#7B2FFF]/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ backgroundColor: '#7B2FFF', color: 'white' }}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Room Type'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function RoomManagement() {
    const { authFetch } = useBusinessAuth();
    const [rooms, setRooms] = useState([]);
    const [modal, setModal] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRooms = () => {
        setLoading(true);
        authFetch('/api/v1/owner/rooms')
            .then(r => r.json())
            .then(d => { if (d.success) setRooms(d.data); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchRooms(); }, []);

    const toggleAvail = async (room) => {
        await authFetch(`/api/v1/owner/rooms/${room.id}/availability`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_available: !room.is_available }),
        });
        fetchRooms();
    };

    const deleteRoom = async (id) => {
        if (!confirm('Delete this room type?')) return;
        await authFetch(`/api/v1/owner/rooms/${id}`, { method: 'DELETE' });
        toast.success('Room deleted');
        fetchRooms();
    };

    return (
        <BusinessLayout>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Room Management</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>
                        Manage your room types, pricing, and availability.
                    </p>
                </div>
                <button
                    onClick={() => setModal({})}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#7B2FFF]/20 transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: '#7B2FFF', color: 'white' }}>
                    <Plus size={18} /> Add Room Type
                </button>
            </div>

            {/* States */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 text-[#7B2FFF] animate-spin" />
                    <p className="text-sm" style={{ color: 'var(--text-body)' }}>Loading rooms...</p>
                </div>
            ) : rooms.length === 0 ? (
                <div className="rounded-2xl text-center py-20"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <Bed size={48} className="mx-auto mb-4 text-[#7B2FFF] opacity-20" />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No room types added yet</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>Add your first room type to get started!</p>
                </div>
            ) : (
                <div className="rounded-2xl border overflow-hidden shadow-xl"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b"
                                    style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                                    {['#', 'Room Type', 'Price/Night', 'Capacity', 'Extra Bed', 'Status', 'Actions'].map(h => (
                                        <th key={h}
                                            className="text-left px-6 py-4 font-bold text-[10px] uppercase tracking-wider"
                                            style={{ color: 'var(--text-body)' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                                {rooms.map((room, i) => (
                                    <tr key={room.id} className="transition-colors hover:bg-white/5">
                                        <td className="px-6 py-4 text-xs font-medium"
                                            style={{ color: 'var(--text-body)' }}>{i + 1}</td>
                                        <td className="px-6 py-4 font-bold"
                                            style={{ color: 'var(--text-primary)' }}>{room.room_type}</td>
                                        <td className="px-6 py-4 font-black"
                                            style={{ color: '#7B2FFF' }}>₹{room.price_per_night}</td>
                                        <td className="px-6 py-4 text-xs"
                                            style={{ color: 'var(--text-body)' }}>{room.total_rooms_of_type || '—'} Guests</td>
                                        <td className="px-6 py-4">
                                            {room.extra_bed_available
                                                ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">YES</span>
                                                : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">NO</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleAvail(room)}
                                                style={smallToggleTrackStyle(room.is_available)}>
                                                <span style={smallToggleThumbStyle(room.is_available)} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setModal(room)}
                                                    className="p-1.5 hover:bg-[#7B2FFF]/10 rounded-lg transition-colors"
                                                    style={{ color: '#7B2FFF' }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteRoom(room.id)}
                                                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modal !== null && (
                <RoomModal
                    room={Object.keys(modal).length ? modal : null}
                    onClose={() => setModal(null)}
                    onSave={fetchRooms}
                    authFetch={authFetch}
                />
            )}
        </BusinessLayout>
    );
}