import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PAYMENT = ['Cash', 'UPI', 'Debit/Credit Card', 'Net Banking', 'Digital Wallet'];
const CUISINES = ['Indian', 'Chinese', 'Italian', 'Continental', 'South Indian', 'North Indian', 'Fast Food', 'Mughlai', 'Street Food', 'Bakery', 'Cafe', 'Seafood', 'Biryani', 'Other'];
const DINING = ['Dine-In', 'Takeaway', 'Home Delivery'];
const AMENITIES = ['Free WiFi', 'Parking', 'Swimming Pool', 'On-site Restaurant', 'Room Service', 'Laundry Service', 'AC in Rooms', 'Hot Water/Geyser', 'CCTV/Security', '24/7 Reception', 'Lift/Elevator', 'Conference Room', 'Power Backup'];
const ROOM_TYPES = ['Single Bed Room', 'Double Bed Room', 'Twin Room', 'Suite / Deluxe Room', 'Dormitory / Shared Room', 'Hall / Banquet Hall'];

const Input = ({ label, required, ...props }) => (
    <div>
        <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{label}{required && ' *'}</label>
        <input {...props} className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none transition-colors min-h-[44px]"
            style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
    </div>
);

const Toggle = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm sm:text-base" style={{ color: 'var(--text-body)' }}>{label}</span>
        <button type="button" onClick={() => onChange(!value)}
            className="w-11 sm:w-12 h-6 sm:h-7 rounded-full transition-colors relative min-h-[28px]"
            style={{ backgroundColor: value ? '#7B2FFF' : 'var(--border-color)' }}>
            <span className={`absolute top-0.5 sm:top-1 w-4 sm:w-5 h-4 sm:h-5 rounded-full transition-transform shadow ${value ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'}`} style={{ backgroundColor: 'white' }} />
        </button>
    </div>
);

const SectionHeader = ({ emoji, title }) => (
    <div className="mb-6 sm:mb-8 pb-3 sm:pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h3 className="font-medium text-lg sm:text-xl flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>{emoji} {title}</h3>
    </div>
);

export default function Step2Form({ formData, update, onBack, onNext }) {
    const [dish, setDish] = useState('');
    const isRestaurant = formData.business_type === 'restaurant';

    const toggleArr = (field, val) => {
        const arr = formData[field] || [];
        update(field, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    };

    const addDishTag = (e) => {
        if (e.key === 'Enter' && dish.trim()) {
            e.preventDefault();
            update('specialty_dishes', [...(formData.specialty_dishes || []), dish.trim()]);
            setDish('');
        }
    };

    const PillCheck = ({ options, field }) => (
        <div className="flex flex-wrap gap-2 sm:gap-3">
            {options.map(o => (
                <button key={o} type="button" onClick={() => toggleArr(field, o)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all min-h-[32px]"
                    style={{
                        backgroundColor: formData[field]?.includes(o) ? '#7B2FFF' : 'transparent',
                        color: formData[field]?.includes(o) ? 'white' : 'var(--text-body)',
                        borderColor: formData[field]?.includes(o) ? '#7B2FFF' : 'var(--border-color)'
                    }}>{o}</button>
            ))}
        </div>
    );

    return (
        <div className="p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
            <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>Tell us about your property</h2>
                <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--text-body)' }}>Provide essential details to list your business.</p>
            </div>

            {/* Basic Info */}
            <section>
                <SectionHeader emoji="ℹ️" title="Basic Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Property Name" required placeholder="e.g. Hotel Sunrise" value={formData.business_name} onChange={e => update('business_name', e.target.value)} />
                    <Input label="Owner Full Name" required placeholder="e.g. Jane Doe" value={formData.full_name} onChange={e => update('full_name', e.target.value)} />
                    <Input label="Business Email" required type="email" placeholder="contact@business.com" value={formData.email} onChange={e => update('email', e.target.value)} />
                    <Input label="GST / Registration No." placeholder="Optional" value={formData.gst_number} onChange={e => update('gst_number', e.target.value)} />
                    <div className="sm:col-span-2">
                        <Input label="Account Password" required type="password" placeholder="Min 8 characters" value={formData.password} onChange={e => update('password', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm sm:text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Property Description</label>
                        <textarea rows={3} maxLength={500} value={formData.description} onChange={e => update('description', e.target.value)}
                            className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none resize-none min-h-[100px]"
                            style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            placeholder="Describe your property..." />
                        <p className="text-right text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{(formData.description || '').length}/500</p>
                    </div>
                </div>
            </section>

            {/* Location */}
            <section>
                <SectionHeader emoji="📍" title="Location Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <Input label="Street Address" required placeholder="e.g. 123 Station Road" value={formData.full_address} onChange={e => update('full_address', e.target.value)} />
                    </div>
                    <Input label="City" required placeholder="City" value={formData.city} onChange={e => update('city', e.target.value)} />
                    <Input label="State" required placeholder="State" value={formData.state} onChange={e => update('state', e.target.value)} />
                    <Input label="Pincode" placeholder="123456" value={formData.pincode} onChange={e => update('pincode', e.target.value)} />
                    <Input label="Nearest Station ID" placeholder="Station ID" value={formData.nearest_station_id} onChange={e => update('nearest_station_id', e.target.value)} />
                </div>
            </section>

            {/* Contact */}
            <section>
                <SectionHeader emoji="📞" title="Contact Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Primary Phone" required placeholder="+91 9999999999" value={formData.phone_primary} onChange={e => update('phone_primary', e.target.value)} />
                    <Input label="Alternate Phone" placeholder="Optional" value={formData.phone_alternate} onChange={e => update('phone_alternate', e.target.value)} />
                    <Input label="WhatsApp" placeholder="Optional" value={formData.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} />
                    <Input label="Website URL" type="url" placeholder="https://" value={formData.website_url} onChange={e => update('website_url', e.target.value)} />
                </div>
            </section>

            {/* Working Hours */}
            <section>
                <SectionHeader emoji="🕐" title="Working Hours" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                    <Input label="Opening Time" type="time" value={formData.opening_time} onChange={e => update('opening_time', e.target.value)} />
                    <Input label="Closing Time" type="time" value={formData.closing_time} onChange={e => update('closing_time', e.target.value)} />
                </div>
                <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Days Open</label>
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                    {DAYS.map(d => (
                        <button key={d} type="button" onClick={() => toggleArr('days_open', d)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all min-h-[32px]`}
                            style={{
                                backgroundColor: formData.days_open?.includes(d) ? '#7B2FFF' : 'transparent',
                                color: formData.days_open?.includes(d) ? 'white' : 'var(--text-body)',
                                borderColor: formData.days_open?.includes(d) ? '#7B2FFF' : 'var(--border-color)'
                            }}>{d}</button>
                    ))}
                    <button type="button" onClick={() => update('days_open', DAYS)} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border border-dashed min-h-[32px]" style={{ borderColor: '#7B2FFF', color: '#7B2FFF' }}>Select All</button>
                </div>
                <Toggle label="Closed on Holidays?" value={formData.closed_on_holidays} onChange={v => update('closed_on_holidays', v)} />
            </section>

            {/* Payment */}
            <section>
                <SectionHeader emoji="💳" title="Payment Modes" />
                <PillCheck options={PAYMENT} field="payment_modes" />
            </section>

            {/* Restaurant-specific */}
            {isRestaurant && (
                <section>
                    <SectionHeader emoji="🍽️" title="Restaurant Details" />
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Cuisine Types</label>
                            <PillCheck options={CUISINES} field="cuisine_types" />
                        </div>
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Food Type</label>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                {[['veg', '🟢 Pure Veg'], ['non-veg', '🔴 Non-Veg'], ['both', '🟡 Both']].map(([v, l]) => (
                                    <button key={v} type="button" onClick={() => update('food_type', v)}
                                        className={`flex-1 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base font-medium min-h-[44px]`}
                                        style={{
                                            backgroundColor: formData.food_type === v ? '#7B2FFF' : 'transparent',
                                            color: formData.food_type === v ? 'white' : 'var(--text-body)',
                                            borderColor: formData.food_type === v ? '#7B2FFF' : 'var(--border-color)'
                                        }}>{l}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Specialty Dishes (press Enter to add)</label>
                            <input value={dish} onChange={e => setDish(e.target.value)} onKeyDown={addDishTag}
                                placeholder="Type dish name + Enter..." className="w-full rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base outline-none mb-2 min-h-[44px]"
                                style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                {formData.specialty_dishes?.map(d => (
                                    <span key={d} className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm flex items-center gap-1" style={{ backgroundColor: 'rgba(123, 47, 255, 0.2)', color: '#7B2FFF' }}>
                                        {d} <button onClick={() => update('specialty_dishes', formData.specialty_dishes.filter(x => x !== d))} className="hover:text-red-500">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Dining Options</label>
                            <PillCheck options={DINING} field="dining_options" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Avg Cost for Two (₹)" type="number" value={formData.avg_cost_for_two} onChange={e => update('avg_cost_for_two', e.target.value)} />
                            <Input label="Seating Capacity" type="number" value={formData.seating_capacity} onChange={e => update('seating_capacity', e.target.value)} />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            {[['has_ac', 'AC Available'], ['has_parking', 'Parking'], ['has_wifi', 'WiFi'], ['has_family_seating', 'Family Seating'], ['has_private_dining', 'Private Dining']].map(([k, l]) => (
                                <Toggle key={k} label={l} value={formData[k]} onChange={v => update(k, v)} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Hotel-specific */}
            {!isRestaurant && (
                <section>
                    <SectionHeader emoji="🏨" title="Hotel Details" />
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Star Rating (Self-declared)</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button key={n} type="button" onClick={() => update('star_rating', n)}
                                        className={`text-2xl sm:text-3xl transition-transform hover:scale-110 ${n <= formData.star_rating ? 'text-yellow-400' : ''}`}
                                        style={{ color: n <= formData.star_rating ? undefined : 'var(--border-color)' }}>★</button>
                                ))}
                                <span className="text-sm sm:text-base ml-2" style={{ color: 'var(--text-body)' }}>{formData.star_rating > 0 ? `${formData.star_rating} Star` : 'Not rated'}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Room Types & Base Pricing</label>
                            <div className="space-y-3">
                                {ROOM_TYPES.map(rt => {
                                    const existing = formData.room_types?.find(r => r.room_type === rt);
                                    return (
                                        <div key={rt} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-2 sm:py-3">
                                            <input type="checkbox" checked={!!existing} className="w-4 h-4 sm:w-5 sm:h-5" style={{ accentColor: '#7B2FFF' }}
                                                onChange={e => {
                                                    if (e.target.checked) update('room_types', [...(formData.room_types || []), { room_type: rt, price_per_night: '' }]);
                                                    else update('room_types', formData.room_types.filter(r => r.room_type !== rt));
                                                }} />
                                            <span className="text-sm sm:text-base flex-1" style={{ color: 'var(--text-body)' }}>{rt}</span>
                                            {existing && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>₹</span>
                                                    <input type="number" placeholder="Price/night" value={existing.price_per_night}
                                                        onChange={e => update('room_types', formData.room_types.map(r => r.room_type === rt ? { ...r, price_per_night: e.target.value } : r))}
                                                        className="rounded px-2 sm:px-3 py-1 sm:py-1.5 w-24 sm:w-28 text-sm sm:text-base outline-none min-h-[36px]"
                                                        style={{ backgroundColor: 'var(--bg-alt)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Check-in Time" type="time" value={formData.check_in_time} onChange={e => update('check_in_time', e.target.value)} />
                            <Input label="Check-out Time" type="time" value={formData.check_out_time} onChange={e => update('check_out_time', e.target.value)} />
                            <Input label="Total Rooms" type="number" value={formData.total_rooms} onChange={e => update('total_rooms', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm sm:text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Amenities</label>
                            <PillCheck options={AMENITIES} field="amenities" />
                        </div>
                    </div>
                </section>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 sm:pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={onBack} className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium transition-colors min-h-[44px]"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-body)' }}>
                    <ChevronLeft size={18} /> Back to Step 1
                </button>
                <button type="button" onClick={onNext} className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium transition-colors min-h-[44px]"
                    style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                    onMouseEnter={e => e.target.style.backgroundColor = '#5B1FCC'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#7B2FFF'}>
                    Continue to Final Step <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
