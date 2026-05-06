import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Bell, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
    const { authFetch } = useBusinessAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifs = () => {
        authFetch('/api/v1/owner/notifications').then(r => r.json())
            .then(d => { if (d.success) setNotifications(d.notifications); }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchNotifs(); }, []);

    const markRead = async (id) => {
        await authFetch(`/api/v1/owner/notifications/${id}/read`, { method: 'PATCH' });
        fetchNotifs();
    };

    const markAll = async () => {
        await authFetch('/api/v1/owner/notifications/read-all', { method: 'PATCH' });
        fetchNotifs();
    };

    return (
        <BusinessLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
                {notifications.some(n => !n.is_read) && (
                    <button onClick={markAll} className="text-sm font-semibold hover:underline" style={{ color: '#7B2FFF' }}>Mark all as read</button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" /></div>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl text-center py-20" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <Bell size={48} className="mx-auto mb-4 text-[#7B2FFF] opacity-20" />
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(n => (
                        <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                            className={`rounded-xl border shadow-sm p-4 flex gap-4 cursor-pointer transition-all hover:scale-[1.01] ${!n.is_read ? 'border-[#7B2FFF]/30' : ''}`}
                            style={{ 
                                backgroundColor: !n.is_read ? 'rgba(123, 47, 255, 0.1)' : 'var(--bg-card)',
                                borderColor: !n.is_read ? 'rgba(123, 47, 255, 0.3)' : 'var(--border-color)'
                            }}>
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-[#7B2FFF]' : 'bg-[#6B6188]'}`} />
                            <div className="flex-1">
                                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                                <p className="text-[11px] mt-1" style={{ color: 'var(--text-body)' }}>{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </BusinessLayout>
    );
}
