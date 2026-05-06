import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState('request') // 'request' | 'verify' | 'success'
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({ email: '', userType: 'customer' })
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [emailFromToken, setEmailFromToken] = useState('')

    const handleGoBack = () => navigate(-1)

    const handleRequestReset = async (e) => {
        e.preventDefault()
        if (!form.email) {
            toast.error('Please enter your email address')
            return
        }

        setLoading(true)
        try {
            const res = await axios.post('/api/auth/forgot-password', {
                email: form.email,
                userType: form.userType
            }, { withCredentials: true })

            if (res.data.success) {
                toast.success('Password reset OTP sent to your email!')
                setStep('verify')
                setEmailFromToken(form.email)
            } else {
                toast.error(res.data.message || 'Failed to send reset OTP')
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reset OTP'
            toast.error(`❌ ${msg}`)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAndReset = async (e) => {
        e.preventDefault()
        if (!otp || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            const res = await axios.post('/api/auth/reset-password', {
                token: otp,
                newPassword: newPassword
            }, { withCredentials: true })

            if (res.data.success) {
                toast.success('Password reset successfully! You can now login.')
                setStep('success')
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
            } else {
                toast.error(res.data.message || 'Failed to reset password')
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password'
            toast.error(`❌ ${msg}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-dark)', position: 'relative' }}>
            {/* Go Back Button */}
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

            {/* Left Visual Panel */}
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
                        <Lock size={48} color="white" />
                    </div>
                </div>

                <div className="login-tagline">
                    <h2 className="login-tagline-heading">
                        Password<br />
                        <span style={{ color: 'var(--accent)' }}>Recovery.</span>
                    </h2>
                    <p className="login-tagline-sub">
                        Securely reset your password and regain access to your account.
                    </p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="login-right-panel w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8">
                {/* Mobile Logo - Only show on small screens */}
                <div className="login-mobile-logo lg:hidden absolute top-16 left-1/2 transform -translate-x-1/2 sm:top-20">
                    <div className="login-logo-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>C</div>
                    <span className="login-logo-text" style={{ fontSize: '20px' }}>CoolieSeva</span>
                </div>

                <div className="login-form-container w-full max-w-md mt-20 sm:mt-24 lg:mt-0">
                    <h1 className="login-heading text-2xl sm:text-3xl md:text-4xl">
                        {step === 'request' && 'Request Password Reset'}
                        {step === 'verify' && 'Enter Reset Code'}
                        {step === 'success' && 'Password Reset!'}
                    </h1>
                    <p className="login-subheading text-sm sm:text-base">
                        {step === 'request' && 'Enter your email to receive a reset code'}
                        {step === 'verify' && 'Check your email for the OTP and enter your new password'}
                        {step === 'success' && 'Your password has been successfully reset'}
                    </p>

                    {/* Step 1: Request Reset */}
                    {step === 'request' && (
                        <form onSubmit={handleRequestReset} className="login-form space-y-4 sm:space-y-5">
                            {/* User Type */}
                            <div className="login-field">
                                <label className="login-label text-xs sm:text-sm">Account Type</label>
                                <div className="login-input-wrap">
                                    <Mail size={15} className="login-input-icon" />
                                    <select
                                        className="input-field login-input text-sm sm:text-base w-full"
                                        value={form.userType}
                                        onChange={e => setForm(f => ({ ...f, userType: e.target.value }))}
                                        required
                                    >
                                        <option value="customer">Customer Account</option>
                                        <option value="coolie">Coolie Account</option>
                                    </select>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="login-field">
                                <label className="login-label text-xs sm:text-sm">Email Address</label>
                                <div className="login-input-wrap">
                                    <Mail size={15} className="login-input-icon" />
                                    <input
                                        type="email"
                                        className="input-field login-input text-sm sm:text-base"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        required
                                    />
                                </div>
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
                                        <span className="hidden sm:inline">Send Reset Code</span>
                                        <span className="sm:hidden">Send Code</span>
                                        <Mail size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify & Reset */}
                    {step === 'verify' && (
                        <form onSubmit={handleVerifyAndReset} className="login-form space-y-4 sm:space-y-5">
                            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-xs sm:text-sm text-blue-300">
                                    <strong>Reset code sent to:</strong> {emailFromToken}
                                </p>
                            </div>

                            {/* OTP */}
                            <div className="login-field">
                                <label className="login-label text-xs sm:text-sm">Reset Code (OTP)</label>
                                <div className="login-input-wrap">
                                    <Mail size={15} className="login-input-icon" />
                                    <input
                                        type="text"
                                        className="input-field login-input text-sm sm:text-base"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="login-field">
                                <label className="login-label text-xs sm:text-sm">New Password</label>
                                <div className="login-input-wrap">
                                    <Lock size={15} className="login-input-icon" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="input-field login-input text-sm sm:text-base"
                                        style={{ paddingRight: '44px' }}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
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

                            {/* Confirm Password */}
                            <div className="login-field">
                                <label className="login-label text-xs sm:text-sm">Confirm Password</label>
                                <div className="login-input-wrap">
                                    <Lock size={15} className="login-input-icon" />
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        className="input-field login-input text-sm sm:text-base"
                                        style={{ paddingRight: '44px' }}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
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
                                        <span className="hidden sm:inline">Reset Password</span>
                                        <span className="sm:hidden">Reset</span>
                                        <CheckCircle size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successfully!</h2>
                            <p className="text-slate-400 mb-6">
                                You can now login with your new password.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="btn-primary w-full py-3 sm:py-4 text-sm sm:text-base"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="login-footer-section mt-6 sm:mt-8">
                        <p className="login-footer-text text-xs sm:text-sm">
                            Remember your password?{' '}
                            <Link to="/login" className="login-footer-link">Back to Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
