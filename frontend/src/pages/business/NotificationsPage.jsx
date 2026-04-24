import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';

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
                <h1 className="text-2xl font-bold text-[#0b1c30]">Notifications</h1>
                {notifications.some(n => !n.is_read) && (
                    <button onClick={markAll} className="text-sm text-[#00288E] font-semibold hover:underline">Mark all as read</button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#00288E] border-t-transparent rounded-full animate-spin" /></div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E5EEFF] text-center py-20">
                    <p className="text-4xl mb-3">🔔</p>
                    <p className="text-[#0b1c30] font-semibold">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(n => (
                        <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                            className={`bg-white rounded-xl border shadow-sm p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md ${!n.is_read ? 'border-[#00288E]/30 bg-[#EFF4FF]' : 'border-[#E5EEFF]'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-[#00288E]' : 'bg-[#C4C5D5]'}`} />
                            <div className="flex-1">
                                <p className="text-sm text-[#0b1c30]">{n.message}</p>
                                <p className="text-[11px] text-[#757684] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </BusinessLayout>
    );
}
