import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Eye, EyeOff, User, Briefcase, Shield, Zap, Mail, Lock, ArrowRight, Train, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

const ROLE_ICONS = {
    customer: <User size={18} />,
    coolie: <Briefcase size={18} />,
    admin: <Shield size={18} />,
}

export default function LoginPage() {
    const { login } = useApp()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [role, setRole] = useState(searchParams.get('role') || 'customer')
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleGoBack = () => navigate(-1)

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) {
            toast.error('Please enter your credentials')
            return
        }
        setLoading(true)
        try {
            let res
            if (role === 'customer') {
                res = await axios.post('/api/auth/customer/login', {
                    email: form.email,
                    password: form.password,
                }, { withCredentials: true })
            } else if (role === 'coolie') {
                res = await axios.post('/api/auth/coolie/login', {
                    coolie_id: form.email, // coolies login with their Coolie ID
                    password: form.password,
                }, { withCredentials: true })
            } else if (role === 'admin') {
                res = await axios.post('/api/v1/admin/login', {
                    email: form.email,
                    password: form.password,
                }, { withCredentials: true })
            }

            if (res.data.success) {
                login(res.data.user, role)
                toast.success(`Welcome back, ${res.data.user.name}! 🎉`)
                navigate(role === 'customer' ? '/customer' : role === 'coolie' ? '/coolie' : '/admin')
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.'
            toast.error(`❌ ${msg}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)' }}>
            {/* Go Back Button */}
            <div className="fixed top-24 left-4 z-50">
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:border-slate-600/50 hover:text-white transition-all duration-200 group"
                    title="Go back to previous page"
                >
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-medium">Go Back</span>
                </button>
            </div>

            {/* ── Left Visual Panel ── */}
            <div className="login-left-panel">
                <div className="login-orb login-orb-1" />
                <div className="login-orb login-orb-2" />
                <div className="login-orb login-orb-3" />
                <div className="login-grid-overlay" />

                <div className="login-logo">
                    <div className="login-logo-icon">C</div>
                    <span className="login-logo-text">CoolieSeva</span>
                </div>

                <div className="login-center-visual">
                    <div className="login-visual-ring login-ring-1" />
                    <div className="login-visual-ring login-ring-2" />
                    <div className="login-visual-ring login-ring-3" />
                    <div className="login-visual-core">
                        <Train size={48} color="white" />
                    </div>
                </div>

                <div className="login-tagline">
                    <h2 className="login-tagline-heading">
                        Your Station.<br />
                        <span style={{ color: 'var(--accent)' }}>Our Coolies.</span>
                    </h2>
                    <p className="login-tagline-sub">
                        India's most trusted platform for hiring railway coolies. Fast, safe, and always on time.
                    </p>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="login-right-panel">
                <div className="login-mobile-logo">
                    <div className="login-logo-icon" style={{ width: '34px', height: '34px', fontSize: '15px' }}>C</div>
                    <span className="login-logo-text" style={{ fontSize: '17px' }}>CoolieSeva</span>
                </div>

                <div className="login-form-container">
                    <h1 className="login-heading">Welcome Back</h1>
                    <p className="login-subheading">Login to your CoolieSeva account</p>

                    {/* ── Role Selector ── */}
                    <div className="login-role-selector">
                        {(['customer', 'coolie', 'admin']).map(r => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`login-role-btn ${role === r ? 'login-role-btn-active' : ''}`}
                            >
                                {ROLE_ICONS[r]}
                                <span>{r}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleLogin} className="login-form">

                        {/* Email / Coolie ID */}
                        <div className="login-field">
                            <label className="login-label">
                                {role === 'coolie' ? 'Coolie ID' : 'Email Address'}
                            </label>
                            <div className="login-input-wrap">
                                <Mail size={15} className="login-input-icon" />
                                <input
                                    type={role === 'coolie' ? 'text' : 'email'}
                                    className="input-field login-input"
                                    placeholder={role === 'coolie' ? 'e.g. CL-NDLS-X8F4K2' : 'your@email.com'}
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="login-field">
                            <label className="login-label">Password</label>
                            <div className="login-input-wrap">
                                <Lock size={15} className="login-input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input-field login-input"
                                    style={{ paddingRight: '44px' }}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="login-eye-btn"
                                >
                                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot password */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                            <button type="button" className="login-forgot-btn">
                                Forgot Password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary login-submit-btn"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {role === 'coolie' && (
                        <div className="login-demo-panel">
                            <p className="login-demo-title">
                                <Zap size={11} /> Coolie Login Info
                            </p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }}>
                                Coolies log in with their <strong style={{ color: 'var(--text-body)' }}>Coolie ID</strong> (e.g. CL-NDLS-X8F4K2) which is assigned via email after admin approval.
                            </p>
                        </div>
                    )}

                    <div className="login-footer-section">
                        <p className="login-footer-text">
                            Don't have an account?{' '}
                            <Link to="/register" className="login-footer-link">Register here</Link>
                        </p>
                        <p className="login-footer-text" style={{ marginTop: '10px' }}>
                            Are you a business?{' '}
                            <Link to="/business/login" className="login-footer-link" style={{ color: '#a78bfa' }}>Business Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
