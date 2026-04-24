import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = ['#7B2FFF', '#A855F7', '#22c55e', '#ef4444', '#06b6d4', '#eab308'];

const StatCard = ({ icon, label, value, trend }) => (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: 'var(--bg-card2)' }}>{icon}</div>
            {trend !== undefined && (
                <span className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(trend)}%
                </span>
            )}
        </div>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-body)' }}>{label}</p>
    </div>
);

export default function OwnerDashboard() {
    const { authFetch, business, owner } = useBusinessAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch('/api/v1/owner/dashboard')
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.dashboard); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <BusinessLayout>
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
            </div>
        </BusinessLayout>
    );

    const isRestaurant = business?.type === 'restaurant';
    const stats = data?.stats || {};

    return (
        <BusinessLayout>
            {/* Greeting */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {owner?.full_name?.split(' ')[0]} 👋</h1>
                    <p className="mt-1" style={{ color: 'var(--text-body)' }}>Here's what's happening at {business?.name} today.</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    business?.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    business?.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                }`}>
                    {business?.status === 'approved' ? '✅ Approved' : business?.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={isRestaurant ? '🍽️' : '🛏️'} label={isRestaurant ? 'Total Dishes' : 'Room Types'} value={isRestaurant ? stats.total_dishes ?? 0 : stats.total_room_types ?? 0} trend={0} />
                <StatCard icon="📝" label="Total Reviews" value={stats.total_reviews ?? 0} trend={12} />
                <StatCard icon="⭐" label="Average Rating" value={stats.avg_rating ?? '0.0'} trend={0.2} />
                <StatCard icon="👁️" label="Profile Views" value={stats.profile_views >= 1000 ? `${(stats.profile_views / 1000).toFixed(1)}k` : stats.profile_views ?? 0} trend={-3} />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-[1fr_340px] gap-5 mb-8">
                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>{isRestaurant ? 'Dishes by Category' : 'Room Types & Pricing'}</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={isRestaurant ? data?.chartData?.dishesByCategory : data?.chartData?.roomPricing}>
                            <XAxis dataKey={isRestaurant ? 'category' : 'room_type'} tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey={isRestaurant ? 'count' : 'price_per_night'} fill="#7B2FFF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h2 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{isRestaurant ? 'Food Type Distribution' : 'Amenities Coverage'}</h2>
                    {!isRestaurant && (
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm" style={{ color: 'var(--text-body)' }}>Coverage</p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-card2)', color: '#7B2FFF' }}>
                                {data?.chartData?.amenitiesCoverage?.enabled}/{data?.chartData?.amenitiesCoverage?.total}
                            </span>
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={isRestaurant
                                    ? (data?.chartData?.foodTypeDistribution || []).map(d => ({ name: d.food_type, value: parseInt(d.count) }))
                                    : [
                                        { name: 'Enabled', value: data?.chartData?.amenitiesCoverage?.enabled || 0 },
                                        { name: 'Missing', value: (data?.chartData?.amenitiesCoverage?.total || 13) - (data?.chartData?.amenitiesCoverage?.enabled || 0) }
                                    ]}
                                cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value"
                            >
                                {(isRestaurant ? (data?.chartData?.foodTypeDistribution || []) : [0, 1]).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend iconType="circle" iconSize={8} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity + Reviews */}
            <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
                        <a href="/owner/notifications" className="text-xs font-semibold hover:underline" style={{ color: '#7B2FFF' }}>View All</a>
                    </div>
                    {data?.recentActivity?.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--text-body)' }}>No recent activity.</p>
                    ) : (
                        <div className="space-y-3">
                            {(data?.recentActivity || []).slice(0, 5).map((a, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.is_read ? 'bg-[#6B6188]' : 'bg-[#7B2FFF]'}`} />
                                    <div>
                                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{a.message}</p>
                                        <p className="text-[11px]" style={{ color: 'var(--text-body)' }}>{new Date(a.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Latest Reviews</h2>
                        <a href="/owner/reviews" className="text-xs font-semibold hover:underline" style={{ color: '#7B2FFF' }}>Manage</a>
                    </div>
                    {data?.latestReviews?.length === 0 ? (
                        <p className="text-sm" style={{ color: 'var(--text-body)' }}>No reviews yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {(data?.latestReviews || []).map(r => (
                                <div key={r.id} className="pb-4 last:border-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--bg-card2)', color: '#7B2FFF' }}>U</div>
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>User #{r.user_id}</span>
                                        <span className="ml-auto text-yellow-400 text-sm">{'★'.repeat(r.rating)}</span>
                                    </div>
                                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-body)' }}>{r.review_text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </BusinessLayout>
    );
}
