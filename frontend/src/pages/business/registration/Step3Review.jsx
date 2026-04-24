import React, { useState } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';

export default function Step3Review({ formData, onBack, onSubmit }) {
    const [agreed, setAgreed] = useState(false);
    const [declared, setDeclared] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        await onSubmit();
        setLoading(false);
    };

    const Row = ({ label, value }) => value ? (
        <div className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-2 last:border-0 gap-1 sm:gap-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="text-sm sm:text-base" style={{ color: 'var(--text-body)' }}>{label}</span>
            <span className="text-sm sm:text-base font-medium text-right max-w-full sm:max-w-[60%]" style={{ color: 'var(--text-primary)' }}>{value}</span>
        </div>
    ) : null;

    return (
        <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-center sm:text-left mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm font-medium uppercase tracking-wider mb-2" style={{ color: '#7B2FFF' }}>Step 3 of 3</p>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Review & Submit</h2>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-body)' }}>Please verify your property details before submitting for final approval.</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl sm:rounded-2xl p-5 sm:p-6" style={{ border: '1px solid var(--border-color)' }}>
                    <h3 className="font-medium text-lg sm:text-xl flex items-center gap-2 mb-4 sm:mb-6" style={{ color: 'var(--text-primary)' }}>🏪 General Information</h3>
                    <div className="space-y-2 sm:space-y-1">
                        <Row label="Property Name" value={formData.business_name} />
                        <Row label="Property Type" value={formData.business_type === 'restaurant' ? 'Restaurant' : 'Hotel'} />
                        <Row label="Owner Name" value={formData.full_name} />
                        <Row label="Email" value={formData.email} />
                        <Row label="Phone" value={formData.phone_primary} />
                        <Row label="Address" value={[formData.full_address, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')} />
                    </div>
                </div>

                {formData.business_type === 'hotel' && formData.room_types?.length > 0 && (
                    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-6" style={{ border: '1px solid var(--border-color)' }}>
                        <h3 className="font-medium text-lg sm:text-xl mb-4 sm:mb-6" style={{ color: 'var(--text-primary)' }}>🛏️ Pricing & Capacity</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm sm:text-base">
                                <thead><tr style={{ color: 'var(--text-body)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th className="text-left py-2 sm:py-3 font-medium">Room Type</th>
                                    <th className="text-right py-2 sm:py-3 font-medium">Price/Night</th>
                                </tr></thead>
                                <tbody>
                                    {formData.room_types.map(r => (
                                        <tr key={r.room_type} className="last:border-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td className="py-2 sm:py-3" style={{ color: 'var(--text-body)' }}>{r.room_type}</td>
                                            <td className="py-2 sm:py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>₹{r.price_per_night}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {formData.business_type === 'restaurant' && formData.specialty_dishes?.length > 0 && (
                    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-6" style={{ border: '1px solid var(--border-color)' }}>
                        <h3 className="font-medium text-lg sm:text-xl mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>🍽️ Specialty Dishes</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {formData.specialty_dishes.map(d => (
                                <span key={d} className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm" style={{ backgroundColor: 'rgba(123, 47, 255, 0.2)', color: '#7B2FFF' }}>{d}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5" style={{ accentColor: '#7B2FFF' }} />
                        <span className="text-sm sm:text-base" style={{ color: 'var(--text-body)' }}>I agree to the <span className="underline" style={{ color: '#7B2FFF' }}>Terms and Conditions</span> and Privacy Policy.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5" style={{ accentColor: '#7B2FFF' }} />
                        <span className="text-sm sm:text-base" style={{ color: 'var(--text-body)' }}>I declare that all information provided is accurate and authorized by the business entity.</span>
                    </label>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 sm:mt-10 pt-6 sm:pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button onClick={onBack} className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium transition-colors min-h-[44px]"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-body)' }}>
                    <ChevronLeft size={18} /> Back to Edit
                </button>
                <button onClick={handleSubmit} disabled={!agreed || !declared || loading}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium disabled:opacity-40 transition-colors min-h-[44px]"
                    style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#5B1FCC'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#7B2FFF'}>
                    {loading ? 'Submitting...' : <><CheckCircle size={18} /> Submit for Approval</>}
                </button>
            </div>
        </div>
    );
}
