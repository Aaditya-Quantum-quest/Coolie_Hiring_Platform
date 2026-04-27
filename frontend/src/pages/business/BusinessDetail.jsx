import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Navigation } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://coolie-hiring-platform.onrender.com';

export default function BusinessDetail() {
    const { businessId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');

    useEffect(() => {
        fetch(`${API}/api/v1/public/businesses/${businessId}`)
            .then(r => r.json())
            .then(d => { if (d.success) setData(d); })
            .finally(() => setLoading(false));
    }, [businessId]);

    if (loading) return (
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="w-8 h-8 border-2 border-[#00288E] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            <p className="text-[#757684]">Business not found</p>
        </div>
    );

    const { business, details, reviews, avg_rating } = data;
    const isRestaurant = business.business_type === 'restaurant';

    const openMaps = () => {
        if (business.latitude && business.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`, '_blank');
        }
    };

    const TABS = ['overview', isRestaurant ? 'menu' : 'rooms', 'reviews', 'location'];

    return (
        <div className="min-h-screen bg-[#f8f9ff]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Hero */}
            <div className="relative h-64 bg-[#DCE9FF] overflow-hidden">
                {business.cover_photo_url ? (
                    <img src={`${API}${business.cover_photo_url}`} alt={business.business_name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-8xl">{isRestaurant ? '🍽️' : '🏨'}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                    <h1 className="text-2xl font-bold text-white">{business.business_name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isRestaurant ? 'bg-orange-500' : 'bg-blue-600'} text-white`}>
                            {isRestaurant ? '🍽️ Restaurant' : '🏨 Hotel'}
                        </span>
                        <span className="text-yellow-300 font-bold text-sm">★ {avg_rating}</span>
                        <span className="text-white/80 text-xs">{reviews.length} reviews</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-5">
                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white rounded-xl border border-[#E5EEFF] p-1 shadow-sm">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-[#00288E] text-white' : 'text-[#444653] hover:bg-[#EFF4FF]'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <div className="space-y-5">
                        <div className="bg-white rounded-xl border border-[#E5EEFF] p-5 shadow-sm">
                            <p className="text-[#444653] text-sm leading-relaxed">{business.description || 'No description provided.'}</p>
                            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                                {business.full_address && <div className="flex gap-2"><MapPin size={14} className="text-[#00288E] shrink-0 mt-0.5" /><span className="text-[#444653]">{business.full_address}</span></div>}
                                {business.opening_time && <div className="flex gap-2"><Clock size={14} className="text-[#00288E] shrink-0 mt-0.5" /><span className="text-[#444653]">{business.opening_time} – {business.closing_time}</span></div>}
                            </div>
                            {business.payment_modes?.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs font-bold text-[#757684] uppercase tracking-wider mb-2">Payment Modes</p>
                                    <div className="flex flex-wrap gap-2">{business.payment_modes.map(p => <span key={p} className="px-2 py-0.5 bg-[#EFF4FF] text-[#00288E] rounded-full text-xs">{p}</span>)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {tab === 'menu' && isRestaurant && (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {details?.dishes?.length === 0 ? <p className="text-[#757684] col-span-2 text-center py-10">No dishes listed yet.</p> :
                            details?.dishes?.map(d => (
                                <div key={d.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex ${!d.is_available ? 'opacity-60' : 'border-[#E5EEFF]'}`}
                                    style={{ borderLeft: `4px solid ${d.food_type === 'veg' ? '#22c55e' : d.food_type === 'egg' ? '#f59e0b' : '#ef4444'}` }}>
                                    {d.photo_url && <img src={`${API}${d.photo_url}`} alt={d.dish_name} className="w-20 h-20 object-cover shrink-0" />}
                                    <div className="p-3 flex-1">
                                        <div className="flex justify-between gap-2">
                                            <p className="font-bold text-[#0b1c30] text-sm">{d.dish_name}</p>
                                            <p className="font-black text-[#00288E] text-sm shrink-0">₹{d.price}</p>
                                        </div>
                                        <p className="text-[#757684] text-[11px] mt-0.5">{d.category}</p>
                                        {d.is_best_seller && <span className="mt-1 inline-block px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold">🔥 Best Seller</span>}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}

                {tab === 'rooms' && !isRestaurant && (
                    <div className="space-y-4">
                        {details?.room_types?.length === 0 ? <p className="text-[#757684] text-center py-10">No rooms listed yet.</p> :
                            details?.room_types?.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-[#E5EEFF] shadow-sm p-5">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-[#0b1c30]">{r.room_type}</h3>
                                        <p className="font-black text-[#00288E] text-lg">₹{r.price_per_night}<span className="text-[#757684] text-xs font-normal">/night</span></p>
                                    </div>
                                    {r.extra_bed_available && <p className="text-xs text-[#757684] mt-1">Extra bed available (+₹{r.extra_bed_charge})</p>}
                                    {r.photos?.length > 0 && (
                                        <div className="flex gap-2 mt-3 overflow-x-auto">
                                            {r.photos.map((p, i) => <img key={i} src={`${API}${p}`} alt="" className="w-24 h-16 object-cover rounded-lg shrink-0" />)}
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}

                {tab === 'reviews' && (
                    <div className="space-y-4">
                        {reviews.length === 0 ? <p className="text-[#757684] text-center py-10">No reviews yet.</p> :
                            reviews.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-[#E5EEFF] shadow-sm p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-[#EFF4FF] flex items-center justify-center font-bold text-[#00288E] text-sm">U</div>
                                        <div>
                                            <p className="font-medium text-[#0b1c30] text-sm">User #{r.user_id}</p>
                                            <p className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}</p>
                                        </div>
                                        <p className="ml-auto text-[11px] text-[#757684]">{new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {r.review_text && <p className="text-[#444653] text-sm">{r.review_text}</p>}
                                    {r.owner_reply && (
                                        <div className="mt-3 bg-[#EFF4FF] rounded-lg p-3 border-l-2 border-[#00288E]">
                                            <p className="text-[11px] font-bold text-[#00288E] mb-1">Owner's Reply</p>
                                            <p className="text-sm text-[#444653]">{r.owner_reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}

                {tab === 'location' && (
                    <div className="bg-white rounded-xl border border-[#E5EEFF] shadow-sm p-5">
                        <p className="font-bold text-[#0b1c30] mb-3">📍 Business Location</p>
                        {business.full_address && <p className="text-[#444653] text-sm mb-4">{business.full_address}, {business.city}, {business.state} {business.pincode}</p>}
                        {business.station_name && <p className="text-[#757684] text-sm mb-5">Nearest Station: <span className="font-semibold text-[#0b1c30]">{business.station_name}</span></p>}
                        <button onClick={openMaps} className="flex items-center gap-2 px-5 py-2.5 bg-[#00288E] text-white rounded-lg text-sm font-semibold hover:bg-[#001a6b] transition-colors">
                            <Navigation size={14} /> 🗺️ Find Best Route
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
