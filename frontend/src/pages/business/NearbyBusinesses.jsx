import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://coolie-hiring-platform.onrender.com';

const BusinessCard = ({ biz, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-xl border border-[#E5EEFF] shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
        <div className="relative h-44 bg-[#DCE9FF] overflow-hidden">
            {biz.cover_photo_url ? (
                <img src={`${API}${biz.cover_photo_url}`} alt={biz.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">{biz.business_type === 'hotel' ? '🏨' : '🍽️'}</div>
            )}
            <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${biz.business_type === 'hotel' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                {biz.business_type === 'hotel' ? '🏨 Hotel' : '🍽️ Restaurant'}
            </span>
        </div>
        <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[#0b1c30] text-sm leading-snug">{biz.business_name}</h3>
                <span className="text-yellow-400 font-bold text-sm shrink-0">★ {parseFloat(biz.avg_rating).toFixed(1)}</span>
            </div>
            <p className="text-[#757684] text-xs mb-2 line-clamp-1">📍 {biz.full_address || biz.city}</p>
            {biz.business_type === 'restaurant' && biz.cuisine_types?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {biz.cuisine_types.slice(0, 3).map(c => (
                        <span key={c} className="px-2 py-0.5 bg-[#EFF4FF] text-[#00288E] rounded-full text-[10px]">{c}</span>
                    ))}
                </div>
            )}
            {biz.business_type === 'hotel' && biz.room_types?.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {biz.room_types.filter(Boolean).slice(0, 2).map(r => (
                        <span key={r} className="px-2 py-0.5 bg-[#EFF4FF] text-[#00288E] rounded-full text-[10px]">{r}</span>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default function NearbyBusinesses() {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('all');
    const [sort, setSort] = useState('rating');
    const [search, setSearch] = useState('');
    const [station, setStation] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(`${API}/api/v1/public/stations/${stationId}/businesses?type=${type}&sort=${sort}&search=${search}`)
            .then(r => r.json())
            .then(d => { if (d.success) setBusinesses(d.businesses); })
            .finally(() => setLoading(false));
    }, [stationId, type, sort, search]);

    useEffect(() => {
        fetch(`${API}/api/v1/public/stations`).then(r => r.json()).then(d => {
            if (d.success) { const s = d.stations.find(s => s.id == stationId); if (s) setStation(s.name); }
        });
    }, [stationId]);

    return (
        <div className="min-h-screen bg-[#f8f9ff]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="bg-white border-b border-[#E5EEFF] px-5 py-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-xl font-bold text-[#0b1c30]">Hotels & Restaurants near {station || `Station #${stationId}`}</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-5">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or cuisine..."
                            className="w-full border border-[#C4C5D5] rounded-lg pl-8 pr-3 py-2 text-sm outline-none focus:border-[#00288E]" />
                    </div>
                    <div className="flex gap-2">
                        {[['all', 'All'], ['restaurant', '🍽️ Restaurants'], ['hotel', '🏨 Hotels']].map(([v, l]) => (
                            <button key={v} onClick={() => setType(v)}
                                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${type === v ? 'bg-[#00288E] text-white border-[#00288E]' : 'border-[#C4C5D5] text-[#444653] hover:border-[#00288E]'}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="border border-[#C4C5D5] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#00288E] bg-white">
                        <option value="rating">Sort: Rating</option>
                        <option value="newest">Sort: Newest</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-[#00288E] border-t-transparent rounded-full animate-spin" /></div>
                ) : businesses.length === 0 ? (
                    <div className="text-center py-32">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-[#0b1c30] font-semibold text-lg">No businesses found</p>
                        <p className="text-[#757684] text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <p className="text-[#757684] text-sm mb-4">{businesses.length} result{businesses.length !== 1 ? 's' : ''} found</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {businesses.map(b => <BusinessCard key={b.id} biz={b} onClick={() => navigate(`/business/${b.id}`)} />)}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
