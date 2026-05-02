import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Building2, Hotel, Utensils, CheckCircle, XCircle, Clock, Shield, Search, ChevronDown, RefreshCw, Eye, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { adminBusinessesService } from '../../services/adminService';

const STATUS_COLOR = {
    pending: '#f59e0b',
    level1_approved: '#3b82f6',
    fully_approved: '#22c55e',
    rejected: '#ef4444',
};
const STATUS_LABEL = {
    pending: 'Pending',
    level1_approved: 'Level 1 ✓',
    fully_approved: 'Fully Approved',
    rejected: 'Rejected',
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminBusinesses() {
    const [businesses, setBusinesses] = useState([]);
    const [stats, setStats] = useState({ pending: 0, level1_approved: 0, fully_approved: 0, rejected: 0, restaurants: 0, hotels: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selected, setSelected] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [acting, setActing] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [bData, sData] = await Promise.all([
                adminBusinessesService.getAllBusinesses({ status: statusFilter, type: typeFilter, search }),
                adminBusinessesService.getStats()
            ]);
            if (bData.success) setBusinesses(bData.data);
            if (sData.success) setStats(sData.stats);
        } catch (e) { toast.error('Failed to load businesses'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, [statusFilter, typeFilter]);

    const act = async (id, actionType, body = {}) => {
        setActing(true);
        try {
            let d;
            if (actionType === 'approve-level1') d = await adminBusinessesService.approveLevel1(id);
            else if (actionType === 'approve-level2') d = await adminBusinessesService.approveLevel2(id);
            else if (actionType === 'reject') d = await adminBusinessesService.rejectBusiness(id, body.rejection_reason);

            if (d && d.success) {
                toast.success(d.message || 'Action successful');
                fetchAll();
                setSelected(null);
                setRejectModal(null);
            } else toast.error(d?.error?.message || 'Action failed');
        } catch (e) { toast.error(e.response?.data?.message || 'Network error'); }
        finally { setActing(false); }
    };

    const handleViewDetail = async (b) => {
        try {
            setSelected({ ...b, loading: true });
            const res = await adminBusinessesService.getBusinessDetails(b.id);
            if (res.success) {
                // The backend returns { success: true, business: { ... } }
                setSelected({ ...b, ...res.business, loading: false });
            }
        } catch (error) {
            toast.error('Failed to load full details');
            setSelected({ ...b, loading: false });
        }
    };

    const pieData = [
        { name: 'Pending', value: parseInt(stats.pending) || 0, color: '#f59e0b' },
        { name: 'L1 Approved', value: parseInt(stats.level1_approved) || 0, color: '#3b82f6' },
        { name: 'Fully Approved', value: parseInt(stats.fully_approved) || 0, color: '#22c55e' },
        { name: 'Rejected', value: parseInt(stats.rejected) || 0, color: '#ef4444' },
    ];
    const barData = [
        { name: 'Restaurants', count: parseInt(stats.restaurants) || 0 },
        { name: 'Hotels', count: parseInt(stats.hotels) || 0 },
    ];

    const filtered = businesses.filter(b =>
        (!search || b.business_name?.toLowerCase().includes(search.toLowerCase()) || b.owner_email?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex min-h-screen" style={{ background: '#07080f' }}>
            <Sidebar role="admin" />
            <div className="ml-0 md:ml-64 flex-1 p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto mt-16 md:mt-0">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                                <Building2 size={22} className="text-purple-400" /> Business Management
                            </h1>
                            <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage hotel & restaurant registrations — Level 1 & Level 2 approval</p>
                        </div>
                        <button onClick={fetchAll} className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm whitespace-nowrap">
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
                        {[
                            { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: Clock },
                            { label: 'Level 1 Done', value: stats.level1_approved, color: '#3b82f6', icon: Shield },
                            { label: 'Fully Live', value: stats.fully_approved, color: '#22c55e', icon: CheckCircle },
                            { label: 'Rejected', value: stats.rejected, color: '#ef4444', icon: XCircle },
                        ].map(s => (
                            <div key={s.label} className="card p-3 sm:p-4">
                                <s.icon size={18} style={{ color: s.color }} className="mb-2" />
                                <p className="text-xl sm:text-2xl font-black text-white">{s.value || 0}</p>
                                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6">
                        <div className="card p-3 sm:p-4">
                            <h2 className="text-white font-bold text-sm mb-3">Verification Status</h2>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-2">
                                {pieData.map(e => (
                                    <div key={e.name} className="flex items-center gap-1.5">
                                        <div style={{ background: e.color }} className="w-2.5 h-2.5 rounded-full" />
                                        <span className="text-slate-400 text-xs">{e.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="card p-3 sm:p-4">
                            <h2 className="text-white font-bold text-sm mb-3">By Business Type</h2>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }} />
                                    <Bar dataKey="count" fill="#7B2FFF" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card p-3 sm:p-4 mb-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && fetchAll()}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 outline-none focus:border-purple-500/50"
                                />
                            </div>
                            <div className="flex gap-2 sm:gap-3">
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 sm:flex-none bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm px-3 py-2.5 outline-none">
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="level1_approved">Level 1 Approved</option>
                                    <option value="fully_approved">Fully Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex-1 sm:flex-none bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm px-3 py-2.5 outline-none">
                                    <option value="">All Types</option>
                                    <option value="restaurant">Restaurant</option>
                                    <option value="hotel">Hotel</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-slate-800 text-slate-500 text-xs">
                                        <th className="py-3 px-4 text-left font-medium">Business</th>
                                        <th className="py-3 px-4 text-left font-medium">Type</th>
                                        <th className="py-3 px-4 text-left font-medium">Owner</th>
                                        <th className="py-3 px-4 text-left font-medium">Status</th>
                                        <th className="py-3 px-4 text-left font-medium">Level</th>
                                        <th className="py-3 px-4 text-left font-medium">Registered</th>
                                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={7} className="py-12 text-center text-slate-500">Loading...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="py-12 text-center text-slate-500">No businesses found</td></tr>
                                    ) : filtered.map(b => (
                                        <tr key={b.id} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {b.logo_url
                                                        ? <img src={b.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                                        : <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0">{b.business_name?.[0]}</div>
                                                    }
                                                    <div className="min-w-0">
                                                        <p className="text-white font-semibold text-xs truncate">{b.business_name}</p>
                                                        <p className="text-slate-500 text-[10px]">{b.city}, {b.state}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                                                    {b.business_type === 'hotel'
                                                        ? <Hotel size={12} className="text-blue-400 shrink-0" />
                                                        : <Utensils size={12} className="text-orange-400 shrink-0" />
                                                    }
                                                    {b.business_type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <p className="text-slate-300 text-xs">{b.owner_name}</p>
                                                <p className="text-slate-500 text-[10px] truncate max-w-[140px]">{b.owner_email}</p>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap" style={{ background: STATUS_COLOR[b.verification_status] + '22', color: STATUS_COLOR[b.verification_status] }}>
                                                    {STATUS_LABEL[b.verification_status] || b.verification_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-slate-400 text-xs">L{b.verification_level || 0}</span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 text-[10px] whitespace-nowrap">
                                                {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => handleViewDetail(b)} className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors" title="View Details">
                                                        <Eye size={14} />
                                                    </button>
                                                    {b.verification_status === 'pending' && (
                                                        <>
                                                            <button onClick={() => act(b.id, 'approve-level1')} disabled={acting} title="Approve Level 1"
                                                                className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                                                                <Check size={14} />
                                                            </button>
                                                            <button onClick={() => { setRejectModal(b); setRejectReason(''); }} disabled={acting} title="Reject"
                                                                className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {b.verification_status === 'level1_approved' && (
                                                        <button onClick={() => act(b.id, 'approve-level2')} disabled={acting} title="Approve Level 2 (Super Admin)"
                                                            className="w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                                            <Shield size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Detail Modal — FIXED: added missing closing </div> for the outer modal wrapper */}
            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setSelected(null)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold text-base sm:text-lg truncate pr-3">{selected.business_name}</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white shrink-0"><X size={18} /></button>
                        </div>
                        <div className="space-y-3 text-sm">
                            {selected.loading ? (
                                <div className="py-8 flex flex-col items-center justify-center gap-2">
                                    <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                    <p className="text-slate-500 text-xs">Loading full details...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Media Section */}
                                    {(selected.logo_url || selected.cover_photo_url) && (
                                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                            {selected.logo_url && (
                                                <div className="shrink-0">
                                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 font-semibold">Logo</p>
                                                    <div className="w-20 h-20 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                                                        <img 
                                                            src={selected.logo_url.startsWith('http') ? selected.logo_url : `${API_BASE}${selected.logo_url}`} 
                                                            alt="Logo" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Logo'; }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {selected.cover_photo_url && (
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-1.5 font-semibold">Cover Photo</p>
                                                    <div className="h-20 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                                                        <img 
                                                            src={selected.cover_photo_url.startsWith('http') ? selected.cover_photo_url : `${API_BASE}${selected.cover_photo_url}`} 
                                                            alt="Cover" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x150?text=No+Cover'; }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Gallery Section */}
                                    {selected.photos?.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-2 font-semibold">Gallery ({selected.photos.length})</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {selected.photos.map((p, i) => (
                                                    <div key={i} className="w-24 h-16 rounded-lg border border-white/10 overflow-hidden bg-white/5 shrink-0">
                                                        <img 
                                                            src={p.photo_url.startsWith('http') ? p.photo_url : `${API_BASE}${p.photo_url}`} 
                                                            alt={`Gallery ${i}`} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Image'; }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                    {[
                                        ['Type', selected.business_type ? selected.business_type.charAt(0).toUpperCase() + selected.business_type.slice(1) : '—'],
                                        ['Business Name', selected.business_name || '—'],
                                        ['Description', selected.description || 'N/A'],
                                        ['GST Number', selected.gst_number || 'N/A'],
                                        ['Year Established', selected.year_established || '—'],
                                        ['Full Address', selected.full_address || '—'],
                                        ['City', selected.city || '—'],
                                        ['State', selected.state || '—'],
                                        ['Pincode', selected.pincode || '—'],
                                        ['Opening Time', selected.opening_time || '—'],
                                        ['Closing Time', selected.closing_time || '—'],
                                        ['Days Open', Array.isArray(selected.days_open) ? selected.days_open.join(', ') : selected.days_open || '—'],
                                        ['Closed on Holidays', selected.closed_on_holidays != null ? (selected.closed_on_holidays ? 'Yes' : 'No') : '—'],
                                        ['Payment Modes', Array.isArray(selected.payment_modes) ? selected.payment_modes.join(', ') : selected.payment_modes || '—'],
                                        ['Owner', selected.owner_name || selected.full_name || '—'],
                                        ['Owner Email', selected.owner_email || selected.email || '—'],
                                        ['Owner Phone', selected.owner_phone || selected.phone_primary || '—'],
                                        ['Status', STATUS_LABEL[selected.verification_status] || selected.verification_status || '—'],
                                        ['Verification Level', `Level ${selected.verification_level ?? 0}`],
                                        ['Active', selected.is_active != null ? (selected.is_active ? 'Yes' : 'No') : '—'],
                                        ['Profile Views', selected.profile_views ?? '—'],
                                        ['Admin Reviewed At', selected.admin_reviewed_at ? new Date(selected.admin_reviewed_at).toLocaleString() : '—'],
                                        ['Registered At', selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'],
                                        ['L1 Approved At', selected.level1_approved_at ? new Date(selected.level1_approved_at).toLocaleString() : '—'],
                                        ['L2 Approved At', selected.level2_approved_at ? new Date(selected.level2_approved_at).toLocaleString() : '—'],
                                        ['Rejection Reason', selected.rejection_reason || '—'],
                                    ].filter(([, v]) => v !== undefined).map(([k, v]) => (
                                        <div key={k} className="flex gap-2 sm:gap-3">
                                            <span className="text-slate-500 w-28 sm:w-36 shrink-0 text-xs sm:text-sm">{k}</span>
                                            <span className="text-slate-200 text-xs sm:text-sm break-all">{v}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 mt-6">
                                {selected.verification_status === 'pending' && (
                                    <>
                                        <button onClick={() => act(selected.id, 'approve-level1')} disabled={acting || selected.loading}
                                            className="flex-1 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-medium text-xs sm:text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                            <Check size={16} /> Approve L1
                                        </button>
                                        <button onClick={() => { setRejectModal(selected); setSelected(null); }} disabled={acting || selected.loading}
                                            className="flex-1 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-xs sm:text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                            <X size={16} /> Reject
                                        </button>
                                    </>
                                )}
                                {selected.verification_status === 'level1_approved' && (
                                    <button onClick={() => act(selected.id, 'approve-level2')} disabled={acting || selected.loading}
                                        className="w-full py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-xs sm:text-sm hover:bg-blue-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                        <Shield size={16} /> Approve L2 (Super Admin)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 sm:p-6 w-full max-w-md">
                        <h2 className="text-white font-bold mb-1 text-base sm:text-lg">Reject Business</h2>
                        <p className="text-slate-400 text-xs sm:text-sm mb-4">Provide a reason for rejecting <strong>{rejectModal.business_name}</strong>:</p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Invalid GST number, incomplete documents..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none outline-none focus:border-red-500/50 mb-4"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setRejectModal(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-slate-400 text-sm hover:bg-white/10">Cancel</button>
                            <button onClick={() => act(rejectModal.id, 'reject', { rejection_reason: rejectReason })} disabled={acting || !rejectReason.trim()}
                                className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/30 disabled:opacity-40">
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}