import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { authFetch } = useBusinessAuth();
    const [pw, setPw] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [saving, setSaving] = useState(false);

    const changePw = async () => {
        if (pw.new_password !== pw.confirm_password) { toast.error('Passwords do not match'); return; }
        if (pw.new_password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setSaving(true);
        const res = await authFetch('/api/v1/business/auth/change-password', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ old_password: pw.old_password, new_password: pw.new_password })
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) { toast.success('Password changed!'); setPw({ old_password: '', new_password: '', confirm_password: '' }); }
        else toast.error(data.error?.message || 'Failed');
    };

    const Input = ({ label, ...props }) => (
        <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
            <input {...props} className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
    );

    return (
        <BusinessLayout>
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Account Settings</h1>
            <div className="max-w-lg space-y-6">
                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h2 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
                    <div className="space-y-4">
                        <Input label="Current Password" type="password" value={pw.old_password} onChange={e => setPw(p => ({ ...p, old_password: e.target.value }))} />
                        <Input label="New Password" type="password" value={pw.new_password} onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))} />
                        <Input label="Confirm New Password" type="password" value={pw.confirm_password} onChange={e => setPw(p => ({ ...p, confirm_password: e.target.value }))} />
                        <button onClick={changePw} disabled={saving} className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
                            style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#5B1FCC'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#7B2FFF'}>
                            {saving ? 'Saving...' : 'Update Password'}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <h2 className="font-bold mb-2" style={{ color: '#ef4444' }}>Danger Zone</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-body)' }}>Deactivating your listing will remove it from public search results immediately.</p>
                    <button onClick={() => { if (confirm('Are you sure you want to deactivate your listing?')) toast.error('Feature requires admin action'); }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        style={{ border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444' }}
                        onMouseEnter={e => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}>
                        Deactivate My Business Listing
                    </button>
                </div>
            </div>
        </BusinessLayout>
    );
}
