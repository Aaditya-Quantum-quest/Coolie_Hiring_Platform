import React, { useState, useEffect, useRef } from 'react';
import {
    Store, Hotel, ChevronRight, ChevronLeft, Check,
    Building2, Utensils, MapPin, Phone, Clock, CreditCard,
    Image, Star, Wifi, Car, Wind, Users, UtensilsCrossed,
    Globe, FileText, Hash, Mail, Lock, User, Sparkles,
    ArrowRight, Shield, Zap, CheckCircle2, Upload, Plus
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://coolie-hiring-platform.onrender.com';

// ─── Animated background orbs ────────────────────────────────────────────────
function BgOrbs() {
    return (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{
                position: 'absolute', top: '-10%', left: '-5%',
                width: '45vw', height: '45vw', maxWidth: 500, maxHeight: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(123,47,255,0.18) 0%, transparent 70%)',
                animation: 'orbFloat1 12s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-5%',
                width: '40vw', height: '40vw', maxWidth: 450, maxHeight: 450,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                animation: 'orbFloat2 15s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute', top: '40%', right: '20%',
                width: '25vw', height: '25vw', maxWidth: 300, maxHeight: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
                animation: 'orbFloat1 18s ease-in-out infinite reverse'
            }} />
        </div>
    );
}

// ─── Global styles injected once ─────────────────────────────────────────────
const GLOBAL_STYLES = `
    @keyframes orbFloat1 {
        0%, 100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(3%,5%) scale(1.05); }
        66% { transform: translate(-2%,3%) scale(0.97); }
    }
    @keyframes orbFloat2 {
        0%, 100% { transform: translate(0,0) scale(1); }
        50% { transform: translate(-4%,-3%) scale(1.08); }
    }
    @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulseGlow {
        0%,100% { box-shadow: 0 0 0 0 rgba(123,47,255,0.35); }
        50%      { box-shadow: 0 0 0 8px rgba(123,47,255,0); }
    }
    .fs-fade  { animation: fadeSlideUp 0.4s ease both; }
    .fs-fade1 { animation: fadeSlideUp 0.4s 0.08s ease both; }
    .fs-fade2 { animation: fadeSlideUp 0.4s 0.16s ease both; }
    .fs-fade3 { animation: fadeSlideUp 0.4s 0.24s ease both; }

    .br-input {
        width: 100%; background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
        padding: 10px 14px; color: #fff; font-size: 0.875rem; outline: none;
        transition: border-color 0.2s, background 0.2s;
        font-family: 'DM Sans', sans-serif; box-sizing: border-box;
    }
    .br-input:focus { border-color: #7B2FFF; background: rgba(123,47,255,0.06); }
    .br-input::placeholder { color: rgba(255,255,255,0.22); }
    .br-input option { background: #0d0b1e; }

    .br-chip {
        padding: 5px 13px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
        border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.45);
        cursor: pointer; transition: all 0.16s; user-select: none; letter-spacing: 0.02em;
        display: inline-flex; align-items: center; gap: 4px;
    }
    .br-chip:hover  { border-color: rgba(123,47,255,0.45); color: #c4b5fd; }
    .br-chip.active { background: rgba(123,47,255,0.18); border-color: #7B2FFF; color: #c4b5fd; }

    .br-type-card {
        border: 1px solid rgba(255,255,255,0.09); border-radius: 16px;
        padding: 24px 18px; cursor: pointer; text-align: center;
        background: rgba(255,255,255,0.02);
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
    }
    .br-type-card:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(123,47,255,0.12); }
    .br-type-card.selected {
        border-color: #7B2FFF !important;
        box-shadow: 0 0 0 1px #7B2FFF, 0 8px 28px rgba(123,47,255,0.22);
        animation: pulseGlow 2s ease infinite;
    }

    .br-btn-primary {
        background: linear-gradient(90deg, #7B2FFF 0%, #a855f7 50%, #7B2FFF 100%);
        background-size: 200% auto;
        border: none; border-radius: 12px; padding: 12px 28px;
        color: #fff; font-weight: 700; font-size: 0.875rem; cursor: pointer;
        display: inline-flex; align-items: center; gap: 7px;
        font-family: 'DM Sans', sans-serif;
        transition: background-position 0.4s, transform 0.15s, box-shadow 0.15s;
    }
    .br-btn-primary:hover { background-position: right center; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(123,47,255,0.4); }
    .br-btn-primary:active { transform: translateY(0); }
    .br-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .br-btn-secondary {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; padding: 12px 22px; color: rgba(255,255,255,0.55);
        font-weight: 600; font-size: 0.875rem; cursor: pointer;
        display: inline-flex; align-items: center; gap: 6px;
        font-family: 'DM Sans', sans-serif; transition: background 0.2s;
    }
    .br-btn-secondary:hover { background: rgba(255,255,255,0.08); }

    .br-glass {
        background: rgba(255,255,255,0.03); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.07); border-radius: 16px;
    }
    .br-section-divider {
        border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 24px 0;
    }
    .br-upload-zone {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 7px; padding: 20px 12px; cursor: pointer;
        border: 1.5px dashed rgba(123,47,255,0.3); border-radius: 10px;
        background: rgba(123,47,255,0.03); transition: border-color 0.2s, background 0.2s;
    }
    .br-upload-zone:hover { border-color: rgba(123,47,255,0.6); background: rgba(123,47,255,0.07); }
`;

// ─── Shared small components ──────────────────────────────────────────────────
function Field({ label, icon: Icon, children, hint }) {
    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {Icon && <Icon size={11} style={{ color: '#7B2FFF' }} />}
                {label}
            </label>
            {children}
            {hint && <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)', marginTop: 4 }}>{hint}</p>}
        </div>
    );
}

function TextInput({ icon: Icon, style: extraStyle, ...props }) {
    return (
        <div style={{ position: 'relative' }}>
            {Icon && <Icon size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />}
            <input className="br-input" style={{ paddingLeft: Icon ? 34 : 14, ...extraStyle }} {...props} />
        </div>
    );
}

function Textarea({ ...props }) {
    return <textarea className="br-input" style={{ resize: 'vertical', minHeight: 80 }} {...props} />;
}

function ToggleGroup({ options, selected, onChange, multi = true }) {
    const arr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
    const toggle = (v) => {
        if (!multi) { onChange(v); return; }
        onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    };
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {options.map(o => (
                <span key={o} className={`br-chip ${arr.includes(o) ? 'active' : ''}`} onClick={() => toggle(o)}>{o}</span>
            ))}
        </div>
    );
}

function SectionHeader({ icon: Icon, title }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(123,47,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} style={{ color: '#a78bfa' }} />
            </div>
            <span style={{ fontSize: '0.72rem', fontweight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.09em', textTransform: 'uppercase' }}>{title}</span>
        </div>
    );
}

function Grid({ cols = 2, children }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${cols === 2 ? 170 : 130}px, 1fr))`, gap: 14 }}>
            {children}
        </div>
    );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ formData, update, onNext }) {
    const types = [
        { id: 'restaurant', icon: Utensils, title: 'Restaurant', desc: 'Cafés, dhabas, fine dining, cloud kitchens', accent: '#f97316', bg: 'rgba(249,115,22,0.1)' },
        { id: 'hotel', icon: Hotel, title: 'Hotel', desc: 'Guest houses, lodges, boutique hotels, resorts', accent: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
    ];
    return (
        <div className="fs-fade" style={{ padding: 'clamp(24px,5vw,40px) clamp(18px,5vw,36px)' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(123,47,255,0.1)', border: '1px solid rgba(123,47,255,0.22)', borderRadius: 20, padding: '4px 14px', marginBottom: 18 }}>
                    <Sparkles size={12} style={{ color: '#a78bfa' }} />
                    <span style={{ fontSize: '0.68rem', fontweight: 600, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Step 1 of 3</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.25rem,4vw,1.75rem)', fontweight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                    What type of business<br />are you registering?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Choose the category that best fits your establishment</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, maxWidth: 500, margin: '0 auto 32px' }}>
                {types.map(t => (
                    <div key={t.id} className={`br-type-card ${formData.business_type === t.id ? 'selected' : ''}`} onClick={() => update('business_type', t.id)}
                        style={{ background: formData.business_type === t.id ? `linear-gradient(135deg, ${t.bg}, rgba(123,47,255,0.06))` : 'rgba(255,255,255,0.02)' }}>
                        <div style={{ width: 54, height: 54, borderRadius: 14, margin: '0 auto 14px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.accent}30` }}>
                            <t.icon size={24} style={{ color: t.accent }} />
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: 6 }}>{t.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.77rem', lineHeight: 1.55 }}>{t.desc}</div>
                        {formData.business_type === t.id && (
                            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#7B2FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={12} color="#fff" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button className="br-btn-primary" onClick={onNext} disabled={!formData.business_type}
                    style={{ fontSize: '0.9rem', padding: '13px 36px', opacity: formData.business_type ? 1 : 0.35 }}>
                    Continue <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ formData, update, onBack, onNext }) {
    const isRestaurant = formData.business_type === 'restaurant';
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const PAYMENT = ['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet'];
    const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Fast Food', 'Street Food', 'Mughlai', 'Italian', 'Bengali'];
    const DINING = ['Dine-in', 'Takeaway', 'Delivery', 'Catering'];
    const AMENITIES = ['Room Service', 'Laundry', 'Airport Transfer', 'Spa', 'Restaurant', 'Bar', 'Gym', 'Pool', 'Concierge'];
    const ROOM_TYPES = ['Single', 'Double', 'Suite', 'Deluxe', 'Family Room'];

    return (
        <div className="fs-fade" style={{ padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,28px)' }}>
            {/* Step header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRestaurant ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.12)' }}>
                    {isRestaurant ? <Utensils size={18} style={{ color: '#f97316' }} /> : <Hotel size={18} style={{ color: '#3b82f6' }} />}
                </div>
                <div>
                    <div style={{ fontSize: '0.65rem', fontweight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Step 2 of 3</div>
                    <h2 style={{ fontSize: 'clamp(1.05rem,3vw,1.35rem)', fontweight: 600, color: '#fff' }}>Business Details</h2>
                </div>
            </div>

            {/* Basic Info */}
            <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={Building2} title="Basic Information" />
                <div style={{ display: 'grid', gap: 14 }}>
                    <Grid>
                        <Field label="Business Name" icon={Store}><TextInput icon={Store} placeholder="Sharma's Kitchen" value={formData.business_name} onChange={e => update('business_name', e.target.value)} /></Field>
                        <Field label="Owner / Manager" icon={User}><TextInput icon={User} placeholder="Full name" value={formData.full_name} onChange={e => update('full_name', e.target.value)} /></Field>
                    </Grid>
                    <Grid>
                        <Field label="Email" icon={Mail}><TextInput icon={Mail} type="email" placeholder="business@email.com" value={formData.email} onChange={e => update('email', e.target.value)} /></Field>
                        <Field label="Password" icon={Lock}><TextInput icon={Lock} type="password" placeholder="Min 8 characters" value={formData.password} onChange={e => update('password', e.target.value)} /></Field>
                    </Grid>
                    <Grid>
                        <Field label="GST Number" icon={Hash}><TextInput icon={Hash} placeholder="22AAAAA0000A1Z5" value={formData.gst_number} onChange={e => update('gst_number', e.target.value)} /></Field>
                        <Field label="Year Established" icon={FileText}><TextInput icon={FileText} type="number" placeholder="2015" value={formData.year_established} onChange={e => update('year_established', e.target.value)} /></Field>
                    </Grid>
                    <Field label="Description">
                        <Textarea placeholder="Tell customers what makes your business special..." value={formData.description} onChange={e => update('description', e.target.value)} />
                    </Field>
                </div>
            </div>

            <hr className="br-section-divider" />

            {/* Location */}
            <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={MapPin} title="Location" />
                <div style={{ display: 'grid', gap: 14 }}>
                    <Field label="Full Address"><TextInput icon={MapPin} placeholder="Shop/Floor, Building, Street" value={formData.full_address} onChange={e => update('full_address', e.target.value)} /></Field>
                    <Grid cols={3}>
                        <Field label="City"><TextInput placeholder="City" value={formData.city} onChange={e => update('city', e.target.value)} /></Field>
                        <Field label="State"><TextInput placeholder="State" value={formData.state} onChange={e => update('state', e.target.value)} /></Field>
                        <Field label="Pincode"><TextInput placeholder="110001" value={formData.pincode} onChange={e => update('pincode', e.target.value)} /></Field>
                    </Grid>
                </div>
            </div>

            <hr className="br-section-divider" />

            {/* Contact */}
            <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={Phone} title="Contact" />
                <div style={{ display: 'grid', gap: 14 }}>
                    <Grid>
                        <Field label="Primary Phone"><TextInput icon={Phone} type="tel" placeholder="+91 98765 43210" value={formData.phone_primary} onChange={e => update('phone_primary', e.target.value)} /></Field>
                        <Field label="WhatsApp"><TextInput icon={Phone} type="tel" placeholder="+91 98765 43210" value={formData.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} /></Field>
                    </Grid>
                    <Grid>
                        <Field label="Alternate Phone"><TextInput icon={Phone} type="tel" placeholder="Optional" value={formData.phone_alternate} onChange={e => update('phone_alternate', e.target.value)} /></Field>
                        <Field label="Website"><TextInput icon={Globe} placeholder="https://yourbusiness.com" value={formData.website_url} onChange={e => update('website_url', e.target.value)} /></Field>
                    </Grid>
                </div>
            </div>

            <hr className="br-section-divider" />

            {/* Hours */}
            <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={Clock} title="Hours & Availability" />
                <div style={{ display: 'grid', gap: 14 }}>
                    <Grid>
                        <Field label="Opening Time"><TextInput icon={Clock} type="time" value={formData.opening_time} onChange={e => update('opening_time', e.target.value)} /></Field>
                        <Field label="Closing Time"><TextInput icon={Clock} type="time" value={formData.closing_time} onChange={e => update('closing_time', e.target.value)} /></Field>
                    </Grid>
                    <Field label="Days Open"><ToggleGroup options={DAYS} selected={formData.days_open} onChange={v => update('days_open', v)} /></Field>
                </div>
            </div>

            <hr className="br-section-divider" />

            {/* Payment */}
            <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={CreditCard} title="Payment Modes" />
                <ToggleGroup options={PAYMENT} selected={formData.payment_modes} onChange={v => update('payment_modes', v)} />
            </div>

            <hr className="br-section-divider" />

            {/* Restaurant specifics */}
            {isRestaurant && (
                <div style={{ marginBottom: 24 }}>
                    <SectionHeader icon={UtensilsCrossed} title="Restaurant Details" />
                    <div style={{ display: 'grid', gap: 14 }}>
                        <Field label="Food Type"><ToggleGroup options={['Veg', 'Non-Veg', 'Both']} selected={formData.food_type ? [formData.food_type] : []} onChange={v => update('food_type', v)} multi={false} /></Field>
                        <Field label="Cuisine Types"><ToggleGroup options={CUISINES} selected={formData.cuisine_types} onChange={v => update('cuisine_types', v)} /></Field>
                        <Field label="Dining Options"><ToggleGroup options={DINING} selected={formData.dining_options} onChange={v => update('dining_options', v)} /></Field>
                        <Grid>
                            <Field label="Avg Cost for Two (₹)"><TextInput type="number" placeholder="500" value={formData.avg_cost_for_two} onChange={e => update('avg_cost_for_two', e.target.value)} /></Field>
                            <Field label="Seating Capacity"><TextInput type="number" placeholder="40" value={formData.seating_capacity} onChange={e => update('seating_capacity', e.target.value)} /></Field>
                        </Grid>
                        <Field label="Facilities">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {[{ k: 'has_ac', l: 'AC', I: Wind }, { k: 'has_parking', l: 'Parking', I: Car }, { k: 'has_wifi', l: 'WiFi', I: Wifi }, { k: 'has_family_seating', l: 'Family Section', I: Users }, { k: 'has_private_dining', l: 'Private Dining', I: UtensilsCrossed }].map(({ k, l, I }) => (
                                    <span key={k} className={`br-chip ${formData[k] ? 'active' : ''}`} onClick={() => update(k, !formData[k])}><I size={10} />{l}</span>
                                ))}
                            </div>
                        </Field>
                    </div>
                </div>
            )}

            {/* Hotel specifics */}
            {!isRestaurant && (
                <div style={{ marginBottom: 24 }}>
                    <SectionHeader icon={Hotel} title="Hotel Details" />
                    <div style={{ display: 'grid', gap: 14 }}>
                        <Grid>
                            <Field label="Total Rooms"><TextInput type="number" placeholder="20" value={formData.total_rooms} onChange={e => update('total_rooms', e.target.value)} /></Field>
                            <Field label="Star Rating">
                                <div style={{ display: 'flex', gap: 6, paddingTop: 6 }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <Star key={n} size={22} onClick={() => update('star_rating', n)} style={{ cursor: 'pointer', color: n <= formData.star_rating ? '#f59e0b' : 'rgba(255,255,255,0.15)', fill: n <= formData.star_rating ? '#f59e0b' : 'transparent', transition: 'all 0.15s' }} />
                                    ))}
                                </div>
                            </Field>
                        </Grid>
                        <Grid>
                            <Field label="Check-in Time"><TextInput icon={Clock} type="time" value={formData.check_in_time} onChange={e => update('check_in_time', e.target.value)} /></Field>
                            <Field label="Check-out Time"><TextInput icon={Clock} type="time" value={formData.check_out_time} onChange={e => update('check_out_time', e.target.value)} /></Field>
                        </Grid>
                        <Field label="Room Types"><ToggleGroup options={ROOM_TYPES} selected={formData.room_types} onChange={v => update('room_types', v)} /></Field>
                        <Field label="Amenities"><ToggleGroup options={AMENITIES} selected={formData.amenities} onChange={v => update('amenities', v)} /></Field>
                        <Field label="Facilities">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {[{ k: 'has_ac', l: 'AC', I: Wind }, { k: 'has_parking', l: 'Parking', I: Car }, { k: 'has_wifi', l: 'WiFi', I: Wifi }, { k: 'extra_bed_available', l: 'Extra Bed', I: Plus }].map(({ k, l, I }) => (
                                    <span key={k} className={`br-chip ${formData[k] ? 'active' : ''}`} onClick={() => update(k, !formData[k])}><I size={10} />{l}</span>
                                ))}
                            </div>
                        </Field>
                        {formData.extra_bed_available && (
                            <Field label="Extra Bed Charge (₹/night)"><TextInput type="number" placeholder="500" value={formData.extra_bed_charge} onChange={e => update('extra_bed_charge', e.target.value)} /></Field>
                        )}
                    </div>
                </div>
            )}

            <hr className="br-section-divider" />

            {/* Media */}
            <div style={{ marginBottom: 24 }}>
                <SectionHeader icon={Image} title="Media" />
                <Grid>
                    <Field label="Logo" hint="Recommended: 400×400px">
                        <label className="br-upload-zone">
                            <Upload size={18} style={{ color: '#7B2FFF' }} />
                            <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{formData.logo ? formData.logo.name : 'Click to upload logo'}</span>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => update('logo', e.target.files[0])} />
                        </label>
                    </Field>
                    <Field label="Cover Photo" hint="Recommended: 1200×400px">
                        <label className="br-upload-zone">
                            <Image size={18} style={{ color: '#7B2FFF' }} />
                            <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{formData.cover ? formData.cover.name : 'Click to upload cover'}</span>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => update('cover', e.target.files[0])} />
                        </label>
                    </Field>
                </Grid>
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', paddingTop: 4 }}>
                <button className="br-btn-secondary" onClick={onBack}><ChevronLeft size={15} /> Back</button>
                <button className="br-btn-primary" onClick={onNext}>Review <ChevronRight size={15} /></button>
            </div>
        </div>
    );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ formData, onBack, onSubmit }) {
    const [submitting, setSubmitting] = useState(false);
    const handle = async () => { setSubmitting(true); await onSubmit(); setSubmitting(false); };

    const ReviewRow = ({ label, value, icon: Icon }) => {
        if (!value || (Array.isArray(value) && !value.length)) return null;
        const text = Array.isArray(value) ? value.join(', ') : String(value);
        return (
            <div style={{ display: 'flex', gap: 9, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.045)' }}>
                {Icon && <Icon size={13} style={{ color: '#7B2FFF', flexShrink: 0, marginTop: 3 }} />}
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.28)', fontweight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.78)', wordBreak: 'break-word' }}>{text}</div>
                </div>
            </div>
        );
    };

    const sections = [
        {
            title: 'Business Info', icon: Building2, rows: [
                { label: 'Type', value: formData.business_type, icon: Store },
                { label: 'Business Name', value: formData.business_name, icon: Store },
                { label: 'Owner', value: formData.full_name, icon: User },
                { label: 'Email', value: formData.email, icon: Mail },
                { label: 'GST', value: formData.gst_number, icon: Hash },
                { label: 'Year', value: formData.year_established, icon: FileText },
                { label: 'Description', value: formData.description },
            ]
        },
        {
            title: 'Location & Contact', icon: MapPin, rows: [
                { label: 'Address', value: [formData.full_address, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '), icon: MapPin },
                { label: 'Primary Phone', value: formData.phone_primary, icon: Phone },
                { label: 'WhatsApp', value: formData.whatsapp_number, icon: Phone },
                { label: 'Website', value: formData.website_url, icon: Globe },
            ]
        },
        {
            title: 'Hours & Payments', icon: Clock, rows: [
                { label: 'Timings', value: (formData.opening_time && formData.closing_time) ? `${formData.opening_time} – ${formData.closing_time}` : null, icon: Clock },
                { label: 'Days Open', value: formData.days_open, icon: Clock },
                { label: 'Payment Modes', value: formData.payment_modes, icon: CreditCard },
            ]
        },
    ];

    return (
        <div className="fs-fade" style={{ padding: 'clamp(20px,4vw,32px) clamp(16px,4vw,28px)' }}>
            <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: '0.65rem', fontweight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Step 3 of 3</div>
                <h2 style={{ fontSize: 'clamp(1.05rem,3vw,1.35rem)', fontweight: 600, color: '#fff', marginBottom: 4 }}>Review & Submit</h2>
                <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.8rem' }}>Double-check everything before going live</p>
            </div>

            <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
                {sections.map(s => (
                    <div key={s.title} className="br-glass" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(123,47,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon size={12} style={{ color: '#a78bfa' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontweight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.title}</span>
                        </div>
                        {s.rows.map((r, i) => <ReviewRow key={i} {...r} />)}
                    </div>
                ))}
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 24 }}>
                {[{ I: Shield, t: 'Secure & Encrypted' }, { I: Zap, t: 'Instant Activation' }, { I: CheckCircle2, t: 'Verified Listings' }].map(({ I, t }) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <I size={12} style={{ color: '#7B2FFF' }} />
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{t}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="br-btn-secondary" onClick={onBack}><ChevronLeft size={15} /> Back</button>
                <button className="br-btn-primary" onClick={handle} disabled={submitting} style={{ minWidth: 170, justifyContent: 'center' }}>
                    {submitting
                        ? <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Submitting…</>
                        : <><CheckCircle2 size={15} /> Submit Registration</>
                    }
                </button>
            </div>
        </div>
    );
}

// ─── Success ──────────────────────────────────────────────────────────────────
function SuccessView() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', maxWidth: 380 }}>
                <div className="fs-fade" style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(123,47,255,0.15)', border: '2px solid #7B2FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulseGlow 2s ease infinite' }}>
                    <CheckCircle2 size={30} style={{ color: '#a78bfa' }} />
                </div>
                <h2 className="fs-fade1" style={{ fontSize: '1.6rem', fontweight: 600, color: '#fff', marginBottom: 10 }}>Registration Submitted!</h2>
                <p className="fs-fade2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', lineHeight: 1.65 }}>
                    Your business is under review. We'll verify and activate your listing within 24–48 hours.
                </p>
            </div>
        </div>
    );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function BusinessRegister() {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        business_type: '', business_name: '', full_name: '', email: '', password: '',
        gst_number: '', description: '', year_established: '',
        latitude: '', longitude: '', full_address: '', city: '', state: '', pincode: '', nearest_station_id: '',
        phone_primary: '', phone_alternate: '', whatsapp_number: '', website_url: '',
        opening_time: '', closing_time: '', days_open: [], closed_on_holidays: false, payment_modes: [],
        cuisine_types: [], food_type: '', specialty_dishes: [], dining_options: [],
        avg_cost_for_two: '', seating_capacity: '',
        has_ac: false, has_parking: false, has_wifi: false, has_family_seating: false, has_private_dining: false,
        total_rooms: '', star_rating: 0, check_in_time: '', check_out_time: '',
        extra_bed_available: false, extra_bed_charge: '', amenities: [], room_types: [],
        logo: null, cover: null, gallery: []
    });

    const update = (field, value) => setFormData(p => ({ ...p, [field]: value }));

    const handleSubmit = async () => {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (k === 'logo' || k === 'cover') { if (v) fd.append(k, v); }
            else if (k === 'gallery') { v.forEach(f => fd.append('gallery', f)); }
            else if (Array.isArray(v) || typeof v === 'object') fd.append(k, JSON.stringify(v));
            else fd.append(k, v);
        });
        try {
            const res = await fetch(`${API}/api/v1/business/auth/register`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) setSubmitted(true);
        } catch (err) {
            console.error(err);
            setSubmitted(true);
        }
    };

    const STEPS = [{ label: 'Type', pct: 33 }, { label: 'Details', pct: 66 }, { label: 'Review', pct: 100 }];

    const rootStyle = { backgroundColor: '#070511', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", position: 'relative' };

    if (submitted) return <div style={rootStyle}><style>{GLOBAL_STYLES}</style><BgOrbs /><SuccessView /></div>;

    return (
        <div style={rootStyle}>
            <style>{GLOBAL_STYLES}</style>
            <BgOrbs />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 660, margin: '0 auto', padding: 'clamp(16px,4vw,40px) clamp(12px,4vw,20px)' }}>

                {/* Header */}
                <div className="fs-fade" style={{ textAlign: 'center', marginBottom: 'clamp(20px,4vw,32px)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(123,47,255,0.09)', border: '1px solid rgba(123,47,255,0.2)', borderRadius: 24, padding: '5px 16px', marginBottom: 16 }}>
                        <Sparkles size={12} style={{ color: '#a78bfa' }} />
                        <span style={{ fontSize: '0.68rem', fontweight: 600, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Business Portal</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(1.6rem,5vw,2.4rem)', fontweight: 600, lineHeight: 1.12, marginBottom: 10,
                        background: 'linear-gradient(135deg, #fff 30%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Register Your Business
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 'clamp(0.8rem,2.5vw,0.9rem)', maxWidth: 400, margin: '0 auto' }}>
                        Join thousands of restaurants & hotels managing growth on CoolieSeva
                    </p>
                </div>

                {/* Progress stepper */}
                <div className="fs-fade1 br-glass" style={{ padding: 'clamp(14px,3vw,20px)', marginBottom: 'clamp(14px,3vw,20px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                        {STEPS.map((s, i) => (
                            <React.Fragment key={i}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                                        background: i < step ? '#7B2FFF' : i === step - 1 ? 'rgba(123,47,255,0.18)' : 'rgba(255,255,255,0.05)',
                                        border: i === step - 1 ? '2px solid #7B2FFF' : '2px solid transparent'
                                    }}>
                                        {i < step - 1
                                            ? <Check size={13} color="#fff" />
                                            : <span style={{ fontSize: '0.72rem', fontweight: 600, color: i === step - 1 ? '#c4b5fd' : 'rgba(255,255,255,0.22)' }}>{i + 1}</span>
                                        }
                                    </div>
                                    <span style={{ fontSize: '0.62rem', fontweight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: i <= step - 1 ? '#a78bfa' : 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap' }}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 20, borderRadius: 2, transition: 'background 0.4s', background: i < step - 1 ? '#7B2FFF' : 'rgba(255,255,255,0.06)' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div style={{ width: '100%', height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#7B2FFF,#a855f7)', width: `${STEPS[step - 1].pct}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 14px rgba(123,47,255,0.6)' }} />
                    </div>
                </div>

                {/* Form card */}
                <div className="fs-fade2 br-glass" style={{ overflow: 'hidden' }}>
                    {step === 1 && <Step1 formData={formData} update={update} onNext={() => setStep(2)} />}
                    {step === 2 && <Step2 formData={formData} update={update} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
                    {step === 3 && <Step3 formData={formData} onBack={() => setStep(2)} onSubmit={handleSubmit} />}
                </div>

                <p className="fs-fade3" style={{ textAlign: 'center', marginTop: 18, fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)' }}>
                    By registering, you agree to CoolieSeva's Terms of Service & Privacy Policy
                </p>
            </div>
        </div>
    );
}