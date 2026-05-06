import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
    Search, MapPin, Clock, Star, Hotel, Utensils,
    RefreshCw, ChevronRight, IndianRupee, Wifi,
    Wind, Car, Building2, Filter
} from 'lucide-react';

import { getAssetUrl } from '../../utils/assets';

function BusinessCard({ biz, onClick }) {
    const isHotel = biz.business_type === 'hotel';
    const rating = parseFloat(biz.avg_rating || 0).toFixed(1);
    const reviews = parseInt(biz.review_count || 0);

    return (
        <div
            onClick={onClick}
            className="card overflow-hidden cursor-pointer hover:border-orange-500/30 hover:scale-[1.01] transition-all duration-200 group"
        >
            {/* Cover Image */}
            <div className="relative h-40 bg-slate-800 overflow-hidden">
                {biz.cover_photo_url ? (
                    <img
                        src={getAssetUrl(biz.cover_photo_url)}
                        alt={biz.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        {isHotel
                            ? <Hotel size={40} className="text-blue-500/40" />
                            : <Utensils size={40} className="text-orange-500/40" />
                        }
                    </div>
                )}

                {/* Type badge */}
                <span className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm
                    ${isHotel ? 'bg-blue-500/80 text-white' : 'bg-orange-500/80 text-white'}`}>
                    {isHotel ? <Hotel size={10} /> : <Utensils size={10} />}
                    {isHotel ? 'Hotel' : 'Restaurant'}
                </span>

                {/* Rating badge */}
                <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-black/60 text-yellow-400 backdrop-blur-sm">
                    <Star size={10} className="fill-yellow-400" />
                    {rating}
                </span>

                {/* Logo overlay */}
                {biz.logo_url && (
                    <img
                        src={getAssetUrl(biz.logo_url)}
                        alt="logo"
                        className="absolute bottom-0 left-3 translate-y-1/2 w-9 h-9 rounded-xl object-cover border-2 border-slate-900 bg-slate-900"
                    />
                )}
            </div>

            {/* Content */}
            <div className={`p-4 ${biz.logo_url ? 'pt-6' : 'pt-4'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-bold text-sm leading-snug line-clamp-1">{biz.business_name}</h3>
                    <ChevronRight size={15} className="text-slate-600 group-hover:text-orange-400 shrink-0 mt-0.5 transition-colors" />
                </div>

                <p className="text-slate-500 text-xs flex items-center gap-1 mb-3">
                    <MapPin size={10} />
                    {biz.city}{biz.state ? `, ${biz.state}` : ''}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {isHotel ? (
                        <>
                            {biz.star_rating > 0 && (
                                <span className="badge text-[10px] px-2 py-0.5 flex items-center gap-1">
                                    <Star size={9} className="text-yellow-400 fill-yellow-400" />
                                    {biz.star_rating} Star
                                </span>
                            )}
                            {(biz.room_types || []).filter(Boolean).slice(0, 2).map(r => (
                                <span key={r} className="badge text-[10px] px-2 py-0.5">{r}</span>
                            ))}
                        </>
                    ) : (
                        <>
                            {biz.food_type && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border
                                    ${biz.food_type === 'veg' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : biz.food_type === 'nonveg' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                    {biz.food_type}
                                </span>
                            )}
                            {(biz.cuisine_types || []).slice(0, 2).map(c => (
                                <span key={c} className="badge text-[10px] px-2 py-0.5">{c}</span>
                            ))}
                            {biz.avg_cost_for_two && (
                                <span className="badge text-[10px] px-2 py-0.5 flex items-center gap-0.5">
                                    <IndianRupee size={9} />{biz.avg_cost_for_two} for 2
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-500 text-[10px]">
                        {reviews > 0 ? `${reviews} review${reviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                    </span>
                    {biz.opening_time && (
                        <span className="text-slate-500 text-[10px] flex items-center gap-1">
                            <Clock size={9} />
                            {biz.opening_time?.slice(0, 5)} – {biz.closing_time?.slice(0, 5)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CustomerBusinesses() {
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [sort, setSort] = useState('rating');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const LIMIT = 18;

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ sort, page, limit: LIMIT });
            if (type !== 'all') params.append('type', type);
            if (search) params.append('search', search);
            const API = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API}/api/v1/public/businesses?${params}`);
            const data = await res.json();
            if (data.success) {
                setBusinesses(data.businesses);
                setTotal(data.total);
            }
        } catch (e) {
            console.error('Failed to load businesses', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPage(1); fetchBusinesses(); }, [type, sort]);
    useEffect(() => { fetchBusinesses(); }, [page]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { setPage(1); fetchBusinesses(); }
    };

    const TYPE_TABS = [
        { value: 'all', label: 'All', icon: Building2 },
        { value: 'restaurant', label: 'Restaurants', icon: Utensils },
        { value: 'hotel', label: 'Hotels', icon: Hotel },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />

            <main className="flex-1 md:ml-64 p-6 max-[767px]:p-3 max-[767px]:pb-24">

                {/* Header */}
                <div className="pt-12 md:pt-0 mb-6 max-[767px]:mb-4 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2 max-[767px]:text-lg">
                            <Building2 size={22} className="text-orange-400" />
                            Hotels &amp; Restaurants
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 max-[767px]:text-xs">
                            Discover verified dining and stay options near railway stations
                        </p>
                    </div>
                    <button
                        onClick={() => { setPage(1); fetchBusinesses(); }}
                        className="btn-secondary flex items-center gap-2 py-2 text-sm"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Type tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {TYPE_TABS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => { setType(value); setPage(1); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all
                                ${type === value
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                            <Icon size={13} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5 max-[767px]:gap-2 max-[767px]:mb-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-800/50 text-white placeholder:text-slate-400 transition-all"
                            placeholder="Search by name, city, or cuisine..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        className="input-field py-2.5 text-sm pr-8 cursor-pointer"
                    >
                        <option value="rating">⭐ Top Rated</option>
                        <option value="newest">🆕 Newest First</option>
                    </select>
                    <button
                        onClick={() => { setPage(1); fetchBusinesses(); }}
                        className="btn-primary flex items-center gap-2 py-2.5 text-sm px-5"
                    >
                        <Filter size={14} /> Search
                    </button>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-slate-500 text-xs mb-4">
                        {total} result{total !== 1 ? 's' : ''} found
                    </p>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="card p-16 text-center">
                        <Building2 size={40} className="text-slate-700 mx-auto mb-3" />
                        <p className="text-white font-semibold text-lg mb-1">No businesses found</p>
                        <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {businesses.map(b => (
                            <BusinessCard
                                key={b.id}
                                biz={b}
                                onClick={() => navigate(`/business/${b.id}`)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {total > LIMIT && (
                    <div className="flex justify-center gap-2 mt-8 flex-wrap">
                        {Array.from({ length: Math.ceil(total / LIMIT) }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all
                                    ${page === p
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
