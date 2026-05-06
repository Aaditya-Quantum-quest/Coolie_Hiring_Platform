import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Navigation, Star, ArrowLeft, ChevronRight, Phone, Mail, Store, CreditCard } from 'lucide-react';

import { getAssetUrl } from '../../utils/assets';

export default function BusinessDetail() {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');

    useEffect(() => {
        const API = import.meta.env.VITE_API_URL || '';
        fetch(`${API}/api/v1/public/businesses/${businessId}`)
            .then(r => r.json())
            .then(d => { if (d.success) setData(d); })
            .finally(() => setLoading(false));
    }, [businessId]);

    if (loading) return (
        <div className="min-h-screen bg-[#0A0814] flex items-center justify-center font-sans">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-800 border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
                </div>
            </div>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-[#0A0814] flex flex-col items-center justify-center font-sans">
            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🏜️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Business Not Found</h2>
            <p className="text-slate-400 mb-6 text-center max-w-md">We couldn't locate the business you're looking for. It may have been removed or the URL is incorrect.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all hover:-translate-y-1 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                Go Back
            </button>
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
        <div className="min-h-screen bg-[#0A0814] text-slate-300 font-sans pb-20 selection:bg-orange-500/30 selection:text-orange-200">
            {/* Nav */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <ArrowLeft size={18} />
                </button>
                <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white tracking-widest uppercase">
                    {isRestaurant ? 'Restaurant' : 'Hotel'}
                </div>
            </div>

            {/* Hero */}
            <div className="relative h-[45vh] md:h-[55vh] bg-[#12102A] overflow-hidden">
                {business.cover_photo_url ? (
                    <img src={getAssetUrl(business.cover_photo_url)} alt={business.business_name} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-[#12102A]">
                        <span className="text-8xl md:text-9xl opacity-20 drop-shadow-2xl">{isRestaurant ? '🍽️' : '🏨'}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0814] via-[#0A0814]/60 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 mb-3 drop-shadow-sm">{business.business_name}</h1>
                                <div className="flex items-center gap-3 md:gap-5 mt-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-yellow-400 font-bold text-sm">{avg_rating || 'New'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                        <span>{reviews.length} Reviews</span>
                                    </div>
                                    {business.station_name && (
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                            <span>Near <span className="text-white font-medium">{business.station_name}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {business.latitude && business.longitude && (
                                <button onClick={openMaps} className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all hover:-translate-y-1 active:scale-95">
                                    <Navigation size={18} className="group-hover:animate-bounce" /> Get Directions
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6 md:mt-10">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold capitalize transition-all whitespace-nowrap ${tab === t
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-700/50 hover:text-white'}`}>
                            {t}
                        </button>
                    ))}
                </div>

                {tab === 'overview' && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-[#12102A]/80 backdrop-blur-xl rounded-3xl border border-[#1E1A40] p-6 md:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full" />
                                <h3 className="text-xl font-bold text-white mb-4">About the Place</h3>
                                <p className="text-slate-400 leading-relaxed text-[15px]">{business.description || 'Welcome to our establishment. We pride ourselves on providing the best experience for travelers and locals alike.'}</p>

                                {business.payment_modes?.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-800/50">
                                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <CreditCard size={16} className="text-orange-400" /> Accepted Payments
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {business.payment_modes.map(p => (
                                                <span key={p} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 shadow-inner">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#12102A]/80 backdrop-blur-xl rounded-3xl border border-[#1E1A40] p-6 relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none" />
                                <h3 className="text-lg font-bold text-white mb-5">Quick Info</h3>
                                <div className="space-y-4">
                                    {business.full_address && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                                <MapPin size={18} className="text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Address</p>
                                                <p className="text-sm text-slate-300">{business.full_address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {business.opening_time && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                                <Clock size={18} className="text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Hours</p>
                                                <p className="text-sm text-slate-300 font-medium">{business.opening_time} – {business.closing_time}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                                            <Phone size={18} className="text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Contact</p>
                                            <p className="text-sm text-slate-300 font-medium">{business.phone_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'menu' && isRestaurant && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {details?.dishes?.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#12102A]/50 rounded-3xl border border-[#1E1A40] border-dashed">
                                <span className="text-5xl opacity-30 mb-4">🍽️</span>
                                <p className="text-slate-400 font-medium">Menu is being updated.</p>
                            </div>
                        ) : (
                            details?.dishes?.map(d => (
                                <div key={d.id} className={`group bg-[#12102A] rounded-2xl border ${!d.is_available ? 'opacity-50 border-slate-800' : 'border-[#1E1A40] hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]'} transition-all overflow-hidden flex flex-col relative`}>
                                    {d.is_best_seller && (
                                        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-md text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                                            🔥 Best Seller
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 z-10 w-6 h-6 rounded-md bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                        <div className={`w-3 h-3 rounded-sm ${d.food_type === 'veg' ? 'bg-green-500' : d.food_type === 'egg' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                    </div>

                                    <div className="h-40 bg-slate-800 relative overflow-hidden">
                                        {d.photo_url ? (
                                            <img src={getAssetUrl(d.photo_url)} alt={d.dish_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">🍲</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#12102A] to-transparent opacity-80" />
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col relative -mt-6">
                                        <div className="flex justify-between items-start gap-3 mb-1">
                                            <h4 className="font-bold text-white text-lg leading-tight">{d.dish_name}</h4>
                                            <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 text-lg shrink-0">₹{d.price}</p>
                                        </div>
                                        <p className="text-purple-400/80 text-xs font-medium uppercase tracking-wider mb-3">{d.category}</p>
                                        {d.description && <p className="text-slate-400 text-sm mt-auto line-clamp-2">{d.description}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'rooms' && !isRestaurant && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {details?.room_types?.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-[#12102A]/50 rounded-3xl border border-[#1E1A40] border-dashed">
                                <span className="text-5xl opacity-30 mb-4">🛏️</span>
                                <p className="text-slate-400 font-medium">Room details are being updated.</p>
                            </div>
                        ) : (
                            details?.room_types?.map(r => (
                                <div key={r.id} className="bg-[#12102A] rounded-3xl border border-[#1E1A40] overflow-hidden group hover:border-orange-500/30 transition-colors">
                                    <div className="h-48 bg-slate-800 relative overflow-hidden">
                                        {r.photos?.length > 0 ? (
                                            <img src={getAssetUrl(r.photos[0])} alt={r.room_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">🏨</div>
                                        )}
                                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white font-bold">
                                            {r.room_type}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-slate-400 text-sm mb-1">Starting from</p>
                                                <p className="font-black text-3xl text-white">₹{r.price_per_night}<span className="text-slate-500 text-sm font-medium"> /night</span></p>
                                            </div>
                                            <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-orange-500 transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                        {r.extra_bed_available && (
                                            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs text-purple-300 font-medium flex items-center gap-2 inline-flex">
                                                <div className="w-2 h-2 rounded-full bg-purple-400" /> Extra bed +₹{r.extra_bed_charge}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'reviews' && (
                    <div className="max-w-3xl mx-auto space-y-5">
                        {reviews.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-[#12102A]/50 rounded-3xl border border-[#1E1A40] border-dashed">
                                <span className="text-5xl opacity-30 mb-4">💬</span>
                                <p className="text-slate-400 font-medium">Be the first to review this place!</p>
                            </div>
                        ) : (
                            reviews.map(r => (
                                <div key={r.id} className="bg-[#12102A]/80 backdrop-blur-md rounded-2xl border border-[#1E1A40] p-6 hover:bg-[#12102A] transition-colors">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/20 text-lg">
                                            {r.user_id ? r.user_id.toString().charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">User #{r.user_id}</p>
                                            <div className="flex gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="ml-auto text-xs text-slate-500 font-medium bg-slate-800/50 px-3 py-1 rounded-full">{new Date(r.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {r.review_text && <p className="text-slate-300 text-[15px] leading-relaxed ml-16">{r.review_text}</p>}
                                    {r.owner_reply && (
                                        <div className="mt-5 ml-16 bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 relative">
                                            <div className="absolute top-0 left-4 -translate-y-1/2 w-4 h-4 bg-[#12102A] border-t border-l border-purple-500/10 rotate-45" />
                                            <p className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center"><Store size={10} /></div> Owner's Reply
                                            </p>
                                            <p className="text-sm text-slate-300">{r.owner_reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'location' && (
                    <div className="bg-[#12102A] rounded-3xl border border-[#1E1A40] p-2 overflow-hidden">
                        <div className="h-[400px] bg-slate-800 rounded-2xl relative flex flex-col items-center justify-center">
                            {business.latitude && business.longitude ? (
                                <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2-dark/256/0/0/0.png')] bg-cover opacity-30" />
                            ) : null}

                            <div className="relative z-10 flex flex-col items-center gap-4 bg-[#0A0814]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl text-center max-w-sm mx-4">
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                                    <MapPin size={32} className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Location</h3>
                                    <p className="text-slate-400 text-sm mb-6">{business.full_address || `${business.city}, ${business.state} ${business.pincode}`}</p>
                                </div>
                                <button onClick={openMaps} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors">
                                    <Navigation size={16} /> Open in Google Maps
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
