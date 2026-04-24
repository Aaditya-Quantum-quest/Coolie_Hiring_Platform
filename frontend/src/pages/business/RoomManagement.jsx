import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ROOM_TYPES_LIST = ['Single Bed Room', 'Double Bed Room', 'Twin Room', 'Suite / Deluxe Room', 'Dormitory / Shared Room', 'Hall / Banquet Hall'];

const RoomModal = ({ room, onClose, onSave, authFetch }) => {
    const [form, setForm] = useState(room || { room_type: ROOM_TYPES_LIST[0], price_per_night: '', total_rooms_of_type: '', extra_bed_available: false, extra_bed_charge: '', description: '', is_available: true });
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
        if (data.success) { toast.success(room ? 'Room updated!' : 'Room added!'); onSave(); onClose(); }
        else toast.error(data.error?.message || 'Failed');
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-[#E5EEFF] sticky top-0 bg-white">
                    <h3 className="font-bold text-[#0b1c30]">{room ? 'Edit Room Type' : 'Add Room Type'}</h3>
                    <button onClick={onClose}><X size={18} className="text-[#757684]" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-[#0b1c30] mb-1">Room Type Category</label>
                        <select value={form.room_type} onChange={e => setForm(p => ({ ...p, room_type: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00288E]">
                            {ROOM_TYPES_LIST.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-[#0b1c30] mb-1">Price per Night (₹)</label>
                            <input type="number" placeholder="0.00" value={form.price_per_night} onChange={e => setForm(p => ({ ...p, price_per_night: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00288E]" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#0b1c30] mb-1">Total Capacity</label>
                            <input type="number" placeholder="e.g. 2" value={form.total_rooms_of_type} onChange={e => setForm(p => ({ ...p, total_rooms_of_type: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00288E]" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#0b1c30]">Allow Extra Bed</p>
                                <p className="text-xs text-[#757684]">Additional charges may apply</p>
                            </div>
                            <button type="button" onClick={() => setForm(p => ({ ...p, extra_bed_available: !p.extra_bed_available }))}
                                className={`w-11 h-6 rounded-full transition-colors relative ${form.extra_bed_available ? 'bg-[#00288E]' : 'bg-[#C4C5D5]'}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${form.extra_bed_available ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {form.extra_bed_available && (
                            <input type="number" placeholder="Extra bed charge per night (₹)" value={form.extra_bed_charge} onChange={e => setForm(p => ({ ...p, extra_bed_charge: e.target.value }))} className="mt-2 w-full border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E]" />
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[#0b1c30] mb-1">Room Photo</label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#C4C5D5] rounded-xl p-6 cursor-pointer hover:border-[#00288E] transition-colors">
                            <span className="text-2xl mb-1">📤</span>
                            <span className="text-[#00288E] text-sm font-medium">Click to upload</span>
                            <span className="text-[#757684] text-xs">PNG, JPG up to 5MB</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e => setPhotos(Array.from(e.target.files))} />
                        </label>
                        {photos.length > 0 && <p className="text-xs text-[#757684] mt-1">{photos.length} photo(s) selected</p>}
                    </div>
                    <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E] resize-none" rows={2} />
                </div>
                <div className="flex gap-3 p-5 border-t border-[#E5EEFF]">
                    <button onClick={onClose} className="flex-1 py-2 border border-[#C4C5D5] rounded-lg text-sm text-[#444653] hover:border-[#00288E] transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-[#00288E] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#001a6b] transition-colors">
                        {saving ? 'Saving...' : 'Save Room Type'}
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
        authFetch('/api/v1/owner/rooms').then(r => r.json()).then(d => { if (d.success) setRooms(d.data); }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchRooms(); }, []);

    const toggleAvail = async (room) => {
        await authFetch(`/api/v1/owner/rooms/${room.id}/availability`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: !room.is_available }) });
        fetchRooms();
    };

    const deleteRoom = async (id) => {
        if (!confirm('Delete this room type?')) return;
        await authFetch(`/api/v1/owner/rooms/${id}`, { method: 'DELETE' });
        toast.success('Room deleted'); fetchRooms();
    };

    return (
        <BusinessLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0b1c30]">Room Management</h1>
                    <p className="text-[#757684] text-sm mt-1">Manage your room types, pricing, and availability.</p>
                </div>
                <button onClick={() => setModal({})} className="flex items-center gap-2 px-4 py-2.5 bg-[#00288E] text-white rounded-lg text-sm font-semibold hover:bg-[#001a6b] transition-colors">
                    <Plus size={16} /> Add Room Type
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#00288E] border-t-transparent rounded-full animate-spin" /></div>
            ) : rooms.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E5EEFF] text-center py-20">
                    <p className="text-4xl mb-3">🛏️</p>
                    <p className="text-[#0b1c30] font-semibold mb-1">No room types added yet</p>
                    <p className="text-[#757684] text-sm">Add your first room type to get started!</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-[#E5EEFF] shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#EFF4FF] text-[#444653]">
                            <tr>
                                {['#', 'Room Type', 'Price/Night', 'Total Rooms', 'Extra Bed', 'Available', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5EEFF]">
                            {rooms.map((room, i) => (
                                <tr key={room.id} className="hover:bg-[#f8f9ff] transition-colors">
                                    <td className="px-4 py-3 text-[#757684]">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium text-[#0b1c30]">{room.room_type}</td>
                                    <td className="px-4 py-3 font-bold text-[#00288E]">₹{room.price_per_night}</td>
                                    <td className="px-4 py-3 text-[#444653]">{room.total_rooms_of_type || '—'}</td>
                                    <td className="px-4 py-3">{room.extra_bed_available ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-[#757684]">No</span>}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggleAvail(room)}
                                            className={`relative w-9 h-5 rounded-full transition-colors ${room.is_available ? 'bg-[#00288E]' : 'bg-[#C4C5D5]'}`}>
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${room.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => setModal(room)} className="text-[#757684] hover:text-[#00288E]"><Edit2 size={14} /></button>
                                            <button onClick={() => deleteRoom(room.id)} className="text-[#757684] hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal !== null && <RoomModal room={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} onSave={fetchRooms} authFetch={authFetch} />}
        </BusinessLayout>
    );
}
