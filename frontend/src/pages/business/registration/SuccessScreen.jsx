import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuccessScreen() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-dark)', fontFamily: 'Quicksand, sans-serif' }}>
            <div className="rounded-2xl p-10 max-w-md w-full text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#7B2FFF' }}>
                    <CheckCircle size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Registration Submitted!</h2>
                <p className="mb-6" style={{ color: 'var(--text-body)' }}>Your application is currently under review by our team.</p>
                <div className="rounded-xl p-4 mb-8 text-left" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                    <div className="flex gap-3">
                        <span className="text-lg">⏳</span>
                        <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Review Timeline</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>This process typically takes 24–48 hours. We will notify you via email once approved.</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => navigate('/business/login')}
                    className="w-full py-3 font-semibold rounded-lg transition-colors"
                    style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#5B1FCC'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#7B2FFF'}>
                    Go to Login
                </button>
            </div>
        </div>
    );
}
