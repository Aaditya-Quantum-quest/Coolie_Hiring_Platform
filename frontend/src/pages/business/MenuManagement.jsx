import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Starter', 'Main Course', 'Dessert', 'Beverage', 'Snack', 'Bread', 'Rice', 'Other'];

const AddDishModal = ({ dish, onClose, onSave, authFetch }) => {
    const [form, setForm] = useState(dish || { dish_name: '', category: 'Starter', food_type: 'veg', price: '', description: '', is_available: true, is_best_seller: false });
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (photo) fd.append('photo', photo);
        const url = dish ? `/api/v1/owner/dishes/${dish.id}` : '/api/v1/owner/dishes';
        const res = await authFetch(url, { method: dish ? 'PUT' : 'POST', body: fd });
        const data = await res.json();
        setSaving(false);
        if (data.success) { toast.success(dish ? 'Dish updated!' : 'Dish added!'); onSave(); onClose(); }
        else toast.error(data.error?.message || 'Failed');
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-[#E5EEFF]">
                    <h3 className="font-bold text-[#0b1c30]">{dish ? 'Edit Dish' : 'Add New Dish'}</h3>
                    <button onClick={onClose}><X size={18} className="text-[#757684]" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <input placeholder="Dish Name *" value={form.dish_name} onChange={e => setForm(p => ({ ...p, dish_name: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E]" />
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E]">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-2">
                        {[['veg', '🟢 Veg'], ['non-veg', '🔴 Non-Veg'], ['egg', '🟡 Egg']].map(([v, l]) => (
                            <button key={v} type="button" onClick={() => setForm(p => ({ ...p, food_type: v }))}
                                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${form.food_type === v ? 'bg-[#00288E] text-white border-[#00288E]' : 'border-[#C4C5D5] text-[#444653]'}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-sm">₹</span>
                        <input type="number" placeholder="Price *" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:border-[#00288E]" />
                    </div>
                    <textarea placeholder="Description (optional, max 300 chars)" maxLength={300} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E] resize-none" rows={2} />
                    <div>
                        <label className="block text-xs text-[#757684] mb-1">Dish Photo (max 2MB)</label>
                        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} className="w-full text-sm" />
                    </div>
                    <div className="flex gap-4">
                        {[['is_available', 'Available'], ['is_best_seller', '🔥 Best Seller']].map(([k, l]) => (
                            <label key={k} className="flex items-center gap-2 text-sm text-[#444653] cursor-pointer">
                                <input type="checkbox" checked={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} className="w-4 h-4 accent-[#00288E]" />
                                {l}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-[#E5EEFF]">
                    <button onClick={onClose} className="flex-1 py-2 border border-[#C4C5D5] rounded-lg text-sm text-[#444653] hover:border-[#00288E] transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-[#00288E] text-white rounded-lg text-sm font-semibold disabled:opacity-60 hover:bg-[#001a6b] transition-colors">
                        {saving ? 'Saving...' : 'Save Dish'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function MenuManagement() {
    const { authFetch } = useBusinessAuth();
    const [dishes, setDishes] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [foodType, setFoodType] = useState('');
    const [modal, setModal] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDishes = () => {
        setLoading(true);
        authFetch(`/api/v1/owner/dishes?search=${search}&category=${category}&food_type=${foodType}`)
            .then(r => r.json()).then(d => { if (d.success) setDishes(d.data); }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchDishes(); }, [search, category, foodType]);

    const toggleAvailability = async (dish) => {
        await authFetch(`/api/v1/owner/dishes/${dish.id}/availability`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_available: !dish.is_available }) });
        fetchDishes();
    };

    const deleteDish = async (id) => {
        if (!confirm('Delete this dish?')) return;
        await authFetch(`/api/v1/owner/dishes/${id}`, { method: 'DELETE' });
        toast.success('Dish deleted'); fetchDishes();
    };

    return (
        <BusinessLayout>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0b1c30]">Menu Management</h1>
                    <p className="text-[#757684] text-sm mt-1">Manage your dishes, pricing, and availability.</p>
                </div>
                <button onClick={() => setModal({})} className="flex items-center gap-2 px-4 py-2.5 bg-[#00288E] text-white rounded-lg text-sm font-semibold hover:bg-[#001a6b] transition-colors">
                    <Plus size={16} /> Add Dish
                </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[180px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..." className="w-full border border-[#C4C5D5] rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[#00288E]" />
                </div>
                <select value={category} onChange={e => setCategory(e.target.value)} className="border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E] bg-white">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={foodType} onChange={e => setFoodType(e.target.value)} className="border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E] bg-white">
                    <option value="">Any Type</option>
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="egg">Egg</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#00288E] border-t-transparent rounded-full animate-spin" /></div>
            ) : dishes.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-4xl mb-3">🍽️</p>
                    <p className="text-[#0b1c30] font-semibold mb-1">No dishes added yet</p>
                    <p className="text-[#757684] text-sm">Add your first dish to get started!</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {dishes.map(dish => (
                        <div key={dish.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex ${!dish.is_available ? 'opacity-70' : 'border-[#E5EEFF]'}`}
                            style={{ borderLeft: `4px solid ${dish.food_type === 'veg' ? '#22c55e' : dish.food_type === 'egg' ? '#f59e0b' : '#ef4444'}` }}>
                            {dish.photo_url && <img src={`http://localhost:5000${dish.photo_url}`} alt={dish.dish_name} className="w-24 h-full object-cover shrink-0" />}
                            <div className="flex-1 p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#757684]">{dish.category}</p>
                                        <p className="font-bold text-[#0b1c30]">{dish.dish_name}</p>
                                    </div>
                                    <p className="text-[#00288E] font-black text-base shrink-0">₹{dish.price}</p>
                                </div>
                                {dish.description && <p className="text-[#757684] text-xs mt-1 line-clamp-2">{dish.description}</p>}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {dish.is_best_seller && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold">🔥 Best Seller</span>}
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button onClick={() => toggleAvailability(dish)}
                                            className={`relative w-9 h-5 rounded-full transition-colors ${dish.is_available ? 'bg-[#00288E]' : 'bg-[#C4C5D5]'}`}>
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${dish.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </button>
                                        <span className="text-[11px] text-[#757684]">{dish.is_available ? 'Available' : 'Sold Out'}</span>
                                        <button onClick={() => setModal(dish)} className="text-[#757684] hover:text-[#00288E] transition-colors"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteDish(dish.id)} className="text-[#757684] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal !== null && <AddDishModal dish={Object.keys(modal).length ? modal : null} onClose={() => setModal(null)} onSave={fetchDishes} authFetch={authFetch} />}
        </BusinessLayout>
    );
}
