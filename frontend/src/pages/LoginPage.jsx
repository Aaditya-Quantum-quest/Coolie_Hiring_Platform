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
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)', position: 'relative' }}>
            {/* Go Back Button - Responsive positioning */}
            <div className="fixed top-4 left-4 z-50 md:top-6 md:left-6 lg:top-24 lg:left-8">
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:border-slate-600/50 hover:text-white transition-all duration-200 group shadow-lg"
                    title="Go back to previous page"
                >
                    <ArrowLeft size={16} className="md:w-[18px] md:h-[18px] transition-transform group-hover:-translate-x-1" />
                    <span className="text-xs md:text-sm font-medium">Go Back</span>
                </button>
            </div>

            {/* ── Left Visual Panel ── */}
            <div className="login-left-panel hidden lg:flex">
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
            <div className="login-right-panel w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
                {/* Mobile Logo - Only show on small screens */}
                <div className="login-mobile-logo lg:hidden absolute top-16 left-1/2 transform -translate-x-1/2 sm:top-20">
                    <div className="login-logo-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>C</div>
                    <span className="login-logo-text" style={{ fontSize: '20px' }}>CoolieSeva</span>
                </div>

                <div className="login-form-container w-full max-w-md mt-20 sm:mt-24 lg:mt-0">
                    <h1 className="login-heading text-2xl sm:text-3xl md:text-4xl">Welcome Back</h1>
                    <p className="login-subheading text-sm sm:text-base">Login to your CoolieSeva account</p>

                    {/* ── Role Selector ── */}
                    <div className="login-role-selector grid grid-cols-3 gap-2 sm:gap-3">
                        {(['customer', 'coolie', 'admin']).map(r => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`login-role-btn flex flex-col items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 ${role === r ? 'login-role-btn-active' : ''}`}
                            >
                                <span className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto">
                                    {ROLE_ICONS[r]}
                                </span>
                                <span className="text-xs sm:text-sm capitalize">{r}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleLogin} className="login-form space-y-4 sm:space-y-5">

                        {/* Email / Coolie ID */}
                        <div className="login-field">
                            <label className="login-label text-xs sm:text-sm">
                                {role === 'coolie' ? 'Coolie ID' : 'Email Address'}
                            </label>
                            <div className="login-input-wrap">
                                <Mail size={15} className="login-input-icon" />
                                <input
                                    type={role === 'coolie' ? 'text' : 'email'}
                                    className="input-field login-input text-sm sm:text-base"
                                    placeholder={role === 'coolie' ? 'e.g. CL-NDLS-X8F4K2' : 'your@email.com'}
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="login-field">
                            <label className="login-label text-xs sm:text-sm">Password</label>
                            <div className="login-input-wrap">
                                <Lock size={15} className="login-input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    className="input-field login-input text-sm sm:text-base"
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
                            <button type="button" className="login-forgot-btn text-xs sm:text-sm">
                                Forgot Password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary login-submit-btn w-full py-3 sm:py-4 text-sm sm:text-base"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="hidden sm:inline">Login as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                    <span className="sm:hidden">Login</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {role === 'coolie' && (
                        <div className="login-demo-panel mt-4 sm:mt-5">
                            <p className="login-demo-title text-xs sm:text-sm">
                                <Zap size={11} /> Coolie Login Info
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.6 }} className="sm:text-xs">
                                Coolies log in with their <strong style={{ color: 'var(--text-body)' }}>Coolie ID</strong> (e.g. CL-NDLS-X8F4K2) which is assigned via email after admin approval.
                            </p>
                        </div>
                    )}

                    <div className="login-footer-section mt-6 sm:mt-8">
                        <p className="login-footer-text text-xs sm:text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="login-footer-link">Register here</Link>
                        </p>
                        <p className="login-footer-text text-xs sm:text-sm" style={{ marginTop: '10px' }}>
                            Are you a business?{' '}
                            <Link to="/business/login" className="login-footer-link" style={{ color: '#a78bfa' }}>Business Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
