import React from 'react';
import { ChevronRight } from 'lucide-react';

const types = [
    { key: 'restaurant', icon: '🍽️', label: 'Restaurant', desc: 'Manage your menu, dishes, pricing, and availability near the station.' },
    { key: 'hotel', icon: '🏨', label: 'Hotel', desc: 'Manage your hotel listings, room availability, and guest amenities near the station.' }
];

export default function Step1TypeSelect({ formData, update, onNext }) {
    return (
        <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Select your core service</h2>
                <p className="text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-body)' }}>Choose the primary category that best describes your property to tailor your management dashboard.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {types.map(t => (
                    <button key={t.key} onClick={() => update('business_type', t.key)}
                        className="relative p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 text-center transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            borderColor: formData.business_type === t.key ? '#7B2FFF' : 'var(--border-color)',
                            backgroundColor: formData.business_type === t.key ? 'rgba(123, 47, 255, 0.1)' : 'var(--bg-card2)',
                            minHeight: '180px'
                        }}>
                        {formData.business_type === t.key && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#7B2FFF' }}>
                                <span className="text-white text-xs">✓</span>
                            </div>
                        )}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4" style={{ backgroundColor: formData.business_type === t.key ? '#7B2FFF' : 'var(--bg-card2)' }}>
                            {t.icon}
                        </div>
                        <p className="font-medium text-base sm:text-lg mb-2" style={{ color: formData.business_type === t.key ? '#7B2FFF' : 'var(--text-primary)' }}>{t.label}</p>
                        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-body)' }}>{t.desc}</p>
                    </button>
                ))}
            </div>

            {formData.business_type && (
                <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 flex gap-3 sm:gap-4" style={{ backgroundColor: 'rgba(123, 47, 255, 0.1)', border: '1px solid var(--border-color)' }}>
                    <span className="text-xl sm:text-2xl" style={{ color: '#7B2FFF' }}>ℹ️</span>
                    <p className="text-sm sm:text-base" style={{ color: 'var(--text-body)' }}>{types.find(t => t.key === formData.business_type)?.desc}</p>
                </div>
            )}

            <div className="flex justify-end">
                <button onClick={onNext} disabled={!formData.business_type}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-medium rounded-lg sm:rounded-xl disabled:opacity-40 transition-all duration-200 hover:scale-[1.02] min-h-[44px]"
                    style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                    onMouseEnter={e => { if(!e.target.disabled) e.target.style.backgroundColor = '#5B1FCC'; }}
                    onMouseLeave={e => { e.target.style.backgroundColor = '#7B2FFF'; }}>
                    Next <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
