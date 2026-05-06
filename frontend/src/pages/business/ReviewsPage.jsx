import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Star, MessageSquare, Filter, Eye, EyeOff } from 'lucide-react';

export default function ReviewsPage() {
    const { authFetch } = useBusinessAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ avg_rating: '0.0', breakdown: [] });
    const [replyText, setReplyText] = useState({});
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState('');

    const fetchReviews = () => {
        setLoading(true);
        authFetch(`/api/v1/owner/reviews?rating=${ratingFilter}&limit=20`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setReviews(d.data);
                    setStats({ avg_rating: d.avg_rating, breakdown: d.breakdown });
                }
            }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchReviews(); }, [ratingFilter]);

    const submitReply = async (reviewId) => {
        if (!replyText[reviewId]?.trim()) return;
        await authFetch(`/api/v1/owner/reviews/${reviewId}/reply`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply_text: replyText[reviewId] })
        });
        setReplyText(p => ({ ...p, [reviewId]: '' }));
        fetchReviews();
    };

    const toggleVisibility = async (reviewId, current) => {
        await authFetch(`/api/v1/owner/reviews/${reviewId}/visibility`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_visible: !current })
        });
        fetchReviews();
    };

    const maxCount = Math.max(...(stats.breakdown.map(b => parseInt(b.count)) || [1]), 1);

    return (
        <BusinessLayout>
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Reviews & Testimonials</h1>

            {/* Summary */}
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex flex-wrap gap-8 items-start">
                    <div className="text-center">
                        <p className="text-5xl font-black" style={{ color: 'var(--text-primary)' }}>{stats.avg_rating}</p>
                        <div className="flex justify-center gap-1 text-yellow-400 mt-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < Math.round(parseFloat(stats.avg_rating)) ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-body)' }}>Average Rating</p>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const row = stats.breakdown.find(b => parseInt(b.rating) === star);
                            const count = parseInt(row?.count || 0);
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-xs w-6 shrink-0 flex items-center gap-0.5" style={{ color: 'var(--text-body)' }}>{star} <Star size={10} fill="currentColor" /></span>
                                    <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'var(--bg-card2)' }}>
                                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                                    </div>
                                    <span className="text-xs w-6 text-right" style={{ color: 'var(--text-body)' }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['', '5', '4', '3', '2', '1'].map(r => (
                    <button key={r} onClick={() => setRatingFilter(r)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                        style={{
                            backgroundColor: ratingFilter === r ? '#7B2FFF' : 'transparent',
                            color: ratingFilter === r ? 'white' : 'var(--text-body)',
                            borderColor: ratingFilter === r ? '#7B2FFF' : 'var(--border-color)'
                        }}>
                        {r ? `${r}★ only` : 'All'}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" /></div>
            ) : reviews.length === 0 ? (
                <div className="rounded-xl text-center py-20" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <Star size={48} className="mx-auto mb-4 text-gray-600 opacity-20" />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No reviews yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(r => (
                        <div key={r.id} className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'var(--bg-card2)', color: '#7B2FFF' }}>U</div>
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>User #{r.user_id}</p>
                                        <div className="flex gap-0.5 text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                                    <button onClick={() => toggleVisibility(r.id, r.is_visible)}
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${r.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {r.is_visible ? <Eye size={10}/> : <EyeOff size={10}/>}
                                        {r.is_visible ? 'Visible' : 'Hidden'}
                                    </button>
                                </div>
                            </div>
                            {r.review_text && <p className="text-sm mb-3" style={{ color: 'var(--text-body)' }}>{r.review_text}</p>}
                            {r.owner_reply ? (
                                <div className="rounded-lg p-3 border-l-2" style={{ backgroundColor: 'rgba(123, 47, 255, 0.1)', borderLeftColor: '#7B2FFF' }}>
                                    <p className="text-[11px] font-bold mb-1" style={{ color: '#7B2FFF' }}>Your Reply</p>
                                    <p className="text-sm" style={{ color: 'var(--text-body)' }}>{r.owner_reply}</p>
                                </div>
                            ) : (
                                <div className="mt-3">
                                    <textarea value={replyText[r.id] || ''} onChange={e => setReplyText(p => ({ ...p, [r.id]: e.target.value }))}
                                        placeholder="Write a reply..."
                                        className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                                        style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} rows={2} />
                                    <button onClick={() => submitReply(r.id)} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                        style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                                        onMouseEnter={e => e.target.style.backgroundColor = '#5B1FCC'}
                                        onMouseLeave={e => e.target.style.backgroundColor = '#7B2FFF'}>
                                        <MessageSquare size={14} /> Reply
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </BusinessLayout>
    );
}
