import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function BusinessLogin() {
    const { login, API } = useBusinessAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/api/v1/business/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!data.success) { setError(data.error?.message || 'Login failed'); setLoading(false); return; }
            login(data.token, data.owner, data.business);
            navigate('/owner/dashboard');
        } catch {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-dark)', fontFamily: 'Quicksand, sans-serif' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="text-3xl mb-2">🏪</div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Business Portal</h1>
                    <p className="mt-1" style={{ color: 'var(--text-body)' }}>Sign in to your business account</p>
                </div>
                <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    {error && (
                        <div className="rounded-xl p-3 mb-5 text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Business Email</label>
                            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                                style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm outline-none transition-colors"
                                    style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                    placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-body)' }}>
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-60"
                            style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                            onMouseEnter={e => e.target.style.backgroundColor = '#5B1FCC'}
                            onMouseLeave={e => e.target.style.backgroundColor = '#7B2FFF'}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-body)' }}>
                        New business? <a href="/register/business" className="font-semibold hover:underline" style={{ color: '#7B2FFF' }}>Register here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
