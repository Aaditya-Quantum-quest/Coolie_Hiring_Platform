import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { User, Briefcase, Eye, EyeOff, Upload, CheckCircle, Rocket, Mail, Lock, Phone, MapPin, CreditCard, RefreshCw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { STATIONS } from '../data/mockData'

export default function RegisterPage() {
    const { login } = useApp()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [type, setType] = useState(searchParams.get('type') || 'customer')
    const [step, setStep] = useState(1)
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', address: '',
        station: '', idType: 'Aadhar', idNumber: '', experience: '',
        languages: [], emergencyContact: '',
    })

    const update = (field, val) => setForm(f => ({ ...f, [field]: val }))

    const toggleLang = (lang) => {
        setForm(f => ({
            ...f,
            languages: f.languages.includes(lang)
                ? f.languages.filter(l => l !== lang)
                : [...f.languages, lang]
        }))
    }

    const handleNext = () => {
        if (!form.name || !form.email || !form.phone || !form.password) {
            toast.error('Please fill all required fields')
            return
        }
        setStep(2)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        await new Promise(r => setTimeout(r, 1500))
        login({ name: form.name, email: form.email, id: Date.now(), ...form }, type)
        toast.success(`🎉 Welcome ${form.name}! Account created successfully!`)
        navigate(type === 'customer' ? '/customer' : '/coolie')
        setLoading(false)
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>

            {/* ── Left Visual Panel ── */}
            <div className="reg-left-panel">
                {/* Ambient orbs */}
                <div className="reg-orb reg-orb-1" />
                <div className="reg-orb reg-orb-2" />
                <div className="reg-orb reg-orb-3" />
                <div className="login-grid-overlay" />

                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">C</div>
                    <span className="login-logo-text">CoolieHire</span>
                </div>

                {/* Center visual – floating cards */}
                <div className="reg-visual-area">
                    <div className="reg-stat-card reg-card-1">
                        <CheckCircle size={20} color="var(--accent)" />
                        <div>
                            <p className="reg-stat-num">12K+</p>
                            <p className="reg-stat-label">Active Coolies</p>
                        </div>
                    </div>
                    <div className="reg-stat-card reg-card-2">
                        <Rocket size={20} color="#22c55e" />
                        <div>
                            <p className="reg-stat-num" style={{ color: '#22c55e' }}>98%</p>
                            <p className="reg-stat-label">Job Success</p>
                        </div>
                    </div>
                    <div className="reg-stat-card reg-card-3">
                        <User size={20} color="#eab308" />
                        <div>
                            <p className="reg-stat-num" style={{ color: '#eab308' }}>50K+</p>
                            <p className="reg-stat-label">Happy Customers</p>
                        </div>
                    </div>
                    {/* central glow ring */}
                    <div className="reg-center-glow" />
                </div>

                {/* Tagline */}
                <div className="login-tagline">
                    <h2 className="login-tagline-heading">
                        Start Your<br />
                        <span style={{ color: 'var(--accent)' }}>Journey Today.</span>
                    </h2>
                    <p className="login-tagline-sub">
                        Join thousands who trust CoolieHire for seamless railway luggage assistance across India.
                    </p>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="login-right-panel" style={{ padding: '32px 24px' }}>

                {/* Mobile logo */}
                <div className="login-mobile-logo">
                    <div className="login-logo-icon" style={{ width: '34px', height: '34px', fontSize: '15px' }}>C</div>
                    <span className="login-logo-text" style={{ fontSize: '17px' }}>CoolieHire</span>
                </div>

                <div className="login-form-container">
                    <h1 className="login-heading">Create Account</h1>
                    <p className="login-subheading">Join CoolieHire and start your journey</p>

                    {/* ── Account Type Toggle ── */}
                    <div className="reg-type-toggle">
                        {[
                            { val: 'customer', icon: <User size={16} />, label: 'Customer', sub: 'Hire a coolie' },
                            { val: 'coolie', icon: <Briefcase size={16} />, label: 'Coolie', sub: 'Earn money' },
                        ].map(t => (
                            <button
                                key={t.val}
                                onClick={() => { setType(t.val); setStep(1) }}
                                className={`reg-type-btn ${type === t.val ? 'reg-type-btn-active' : ''}`}
                            >
                                {t.icon}
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ fontWeight: '700', fontSize: '14px' }}>{t.label}</p>
                                    <p style={{ fontSize: '11px', opacity: 0.7 }}>{t.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* ── Coolie Step Progress ── */}
                    {type === 'coolie' && (
                        <div className="reg-progress">
                            {[1, 2].map(s => (
                                <React.Fragment key={s}>
                                    <div className={`reg-step ${step >= s ? 'reg-step-active' : ''}`}>
                                        {step > s
                                            ? <CheckCircle size={13} />
                                            : <span className="reg-step-num">{s}</span>
                                        }
                                        {s === 1 ? 'Basic Info' : 'Work Details'}
                                    </div>
                                    {s < 2 && <div className="reg-step-connector" />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* ══ STEP 1 - Basic Info ══ */}
                    {step === 1 && (
                        <div className="login-form">
                            {/* Name + Phone row */}
                            <div className="reg-row-2">
                                <div className="login-field">
                                    <label className="login-label">Full Name *</label>
                                    <div className="login-input-wrap">
                                        <User size={14} className="login-input-icon" />
                                        <input
                                            className="input-field login-input"
                                            placeholder="Your full name"
                                            value={form.name}
                                            onChange={e => update('name', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label className="login-label">Phone *</label>
                                    <div className="login-input-wrap">
                                        <Phone size={14} className="login-input-icon" />
                                        <input
                                            className="input-field login-input"
                                            placeholder="10-digit mobile"
                                            value={form.phone}
                                            onChange={e => update('phone', e.target.value)}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="login-field">
                                <label className="login-label">Email Address *</label>
                                <div className="login-input-wrap">
                                    <Mail size={14} className="login-input-icon" />
                                    <input
                                        type="email"
                                        className="input-field login-input"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={e => update('email', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="login-field">
                                <label className="login-label">Password *</label>
                                <div className="login-input-wrap">
                                    <Lock size={14} className="login-input-icon" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="input-field login-input"
                                        style={{ paddingRight: '44px' }}
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={e => update('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="login-eye-btn"
                                    >
                                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Emergency Contact (customer only) */}
                            {type === 'customer' && (
                                <div className="login-field">
                                    <label className="login-label">Emergency Contact</label>
                                    <div className="login-input-wrap">
                                        <Phone size={14} className="login-input-icon" />
                                        <input
                                            className="input-field login-input"
                                            placeholder="Emergency contact number"
                                            value={form.emergencyContact}
                                            onChange={e => update('emergencyContact', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            {type === 'coolie' ? (
                                <button onClick={handleNext} className="btn-primary login-submit-btn">
                                    Continue <ArrowRight size={16} />
                                </button>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary login-submit-btn"
                                    >
                                        {loading
                                            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <><Rocket size={15} /> Create Account</>
                                        }
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ══ STEP 2 - Coolie Work Details ══ */}
                    {step === 2 && type === 'coolie' && (
                        <form onSubmit={handleSubmit} className="login-form">

                            {/* Home Station */}
                            <div className="login-field">
                                <label className="login-label">Home Station</label>
                                <div className="login-input-wrap">
                                    <MapPin size={14} className="login-input-icon" />
                                    <select
                                        className="input-field login-input"
                                        value={form.station}
                                        onChange={e => update('station', e.target.value)}
                                    >
                                        <option value="">Select your station</option>
                                        {STATIONS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* ID Type + Number */}
                            <div className="reg-row-2">
                                <div className="login-field">
                                    <label className="login-label">ID Type</label>
                                    <div className="login-input-wrap">
                                        <CreditCard size={14} className="login-input-icon" />
                                        <select
                                            className="input-field login-input"
                                            value={form.idType}
                                            onChange={e => update('idType', e.target.value)}
                                        >
                                            <option>Aadhar</option>
                                            <option>PAN Card</option>
                                            <option>Voter ID</option>
                                            <option>Driving License</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="login-field">
                                    <label className="login-label">ID Number</label>
                                    <div className="login-input-wrap">
                                        <CreditCard size={14} className="login-input-icon" />
                                        <input
                                            className="input-field login-input"
                                            placeholder="ID number"
                                            value={form.idNumber}
                                            onChange={e => update('idNumber', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="login-field">
                                <label className="login-label">Experience</label>
                                <div className="login-input-wrap">
                                    <RefreshCw size={14} className="login-input-icon" />
                                    <select
                                        className="input-field login-input"
                                        value={form.experience}
                                        onChange={e => update('experience', e.target.value)}
                                    >
                                        <option value="">Select experience</option>
                                        <option>Less than 1 year</option>
                                        <option>1-3 years</option>
                                        <option>3-5 years</option>
                                        <option>5-10 years</option>
                                        <option>10+ years</option>
                                    </select>
                                </div>
                            </div>

                            {/* Languages */}
                            <div className="login-field">
                                <label className="login-label">Languages Known</label>
                                <div className="reg-lang-grid">
                                    {['Hindi', 'English', 'Punjabi', 'Bengali', 'Tamil', 'Marathi', 'Telugu'].map(lang => (
                                        <button
                                            type="button"
                                            key={lang}
                                            onClick={() => toggleLang(lang)}
                                            className={`reg-lang-tag ${form.languages.includes(lang) ? 'reg-lang-tag-active' : ''}`}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Upload ID */}
                            <div className="reg-upload-box">
                                <Upload size={22} style={{ color: 'var(--text-muted)', marginBottom: '6px' }} />
                                <p style={{ fontSize: '13px', color: 'var(--text-body)' }}>Upload ID Proof Photo</p>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>JPG, PNG (Max 2MB)</p>
                            </div>

                            {/* Back + Register */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn-secondary"
                                    style={{ flex: 1, padding: '13px' }}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary login-submit-btn"
                                    style={{ flex: 2 }}
                                >
                                    {loading
                                        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <><CheckCircle size={15} /> Register</>
                                    }
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="login-footer-text" style={{ marginTop: '20px' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="login-footer-link">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

