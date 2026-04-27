import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import {
    Star, ArrowLeft, CheckCircle, ThumbsUp, ThumbsDown,
    Camera, Send, Award, Smile, Heart
} from 'lucide-react'
import toast from 'react-hot-toast'
import Confetti from 'react-confetti'
import axios from 'axios'

const POSITIVE_TAGS = ['Punctual', 'Helpful', 'Strong', 'Honest', 'Polite', 'Careful with luggage', 'Knows station well']
const NEGATIVE_TAGS = ['Late arrival', 'Rude behavior', 'Careless', 'Overcharged attempt', 'Not helpful']

const StarRating = ({ value, onChange }) => {
    const [hover, setHover] = useState(0)
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(star)}
                    className="transition-transform hover:scale-125"
                >
                    <Star
                        size={40}
                        className={`transition-colors ${star <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                    />
                </button>
            ))}
        </div>
    )
}

const RATING_LABELS = ['', 'Very Bad 😠', 'Bad 😞', 'Okay 😐', 'Good 😊', 'Excellent! 🤩']

export default function RatingPage() {
    const navigate = useNavigate()
    const locState = useLocation().state || {}
    const b = locState.booking

    // Provide a fallback mock if navigated directly
    const COOLIE = b ? {
        name: b.coolieName,
        id: b.coolieId || 'N/A',
        image: null,
        totalRatings: b.coolieTrips || 0,
        avgRating: b.coolieRating || 0,
        badge: b.coolieBadge,
        bookingId: b.id,
        date: `${b.date} ${b.time}`,
        amount: `₹${b.amount}`,
        station: b.station,
    } : {
        name: 'Your Coolie', id: 'N/A', totalRatings: 234, avgRating: 4.8, badge: '', bookingId: 'BK-2024-1847', date: 'Today, 4:15 PM', amount: '₹90', station: 'New Delhi Railway Station'
    }

    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [tip, setTip] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a star rating!')
            return
        }

        setSubmitting(true)
        try {
            if (b && b.id !== 'BK-2024-1847') {
                const text = selectedTags.length > 0 ? `Tags: ${selectedTags.join(', ')}. ${comment}` : comment
                await axios.post(`https://coolie-hiring-platform-backend.onrender.com/api/bookings/${b.id}/rate`, {
                    rating,
                    review_text: text
                })
            } else {
                await new Promise(r => setTimeout(r, 1000))
            }
            setSubmitted(true)
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000)
        } catch (error) {
            toast.error('Failed to submit rating')
        } finally {
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex">
                <Sidebar role="customer" />
                {showConfetti && <Confetti numberOfPieces={300} recycle={false} />}
                <div className="ml-0 md:ml-64 flex-1 min-h-screen flex items-center justify-center p-6">
                    <div className="card p-10 max-w-md w-full text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center mx-auto">
                            <Award size={48} className="text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Thanks for Rating! 🙏</h2>
                            <p className="text-slate-400 mt-2 text-sm">Your feedback helps improve service quality for all travelers.</p>
                        </div>
                        <div className="flex justify-center gap-1">
                            {[...Array(rating)].map((_, i) => (
                                <Star key={i} size={28} className="text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        {tip > 0 && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                                <p className="text-green-400 font-bold">✓ Tip of ₹{tip} sent to {COOLIE.name}!</p>
                                <p className="text-xs text-slate-400 mt-1">You're awesome! 🎉</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            <button onClick={() => navigate('/customer')} className="btn-primary w-full">
                                Back to Dashboard
                            </button>
                            <button onClick={() => navigate('/customer/history')} className="btn-secondary w-full">
                                View Booking History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex">
            <Sidebar role="customer" />
            <div className="ml-0 md:ml-64 flex-1 min-h-screen p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white">Rate Your Experience</h1>
                            <p className="text-slate-400 text-sm">Booking {COOLIE.bookingId} • {COOLIE.date}</p>
                        </div>
                    </div>

                    {/* Coolie Card */}
                    <div className="card p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-2xl">
                                    {COOLIE.name[0]}
                                </div>
                                <span className="absolute -top-2 -right-2 text-lg">⭐</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-lg">{COOLIE.name}</h3>
                                <p className="text-slate-400 text-sm">{COOLIE.id} • {COOLIE.station}</p>
                                <span className="badge text-xs mt-1 inline-block">{COOLIE.badge}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black gradient-text">{COOLIE.amount}</p>
                                <p className="text-xs text-slate-400">Amount paid</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-3">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-slate-300">{COOLIE.avgRating} avg from {COOLIE.totalRatings} reviews</span>
                        </div>
                    </div>

                    {/* Overall Star Rating */}
                    <div className="card p-6 mb-6 text-center">
                        <h2 className="text-white font-bold text-lg mb-2">How was your experience?</h2>
                        <p className="text-slate-400 text-sm mb-6">Tap a star to rate</p>
                        <div className="flex justify-center mb-4">
                            <StarRating value={rating} onChange={setRating} />
                        </div>
                        {rating > 0 && (
                            <p className="text-xl font-bold gradient-text animate-pulse">
                                {RATING_LABELS[rating]}
                            </p>
                        )}
                    </div>

                    {/* Quick Tags */}
                    {rating > 0 && (
                        <div className="card p-6 mb-6 slide-in">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                {rating >= 4
                                    ? <><ThumbsUp size={18} className="text-green-400" /> What did you like?</>
                                    : <><ThumbsDown size={18} className="text-red-400" /> What went wrong?</>
                                }
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {(rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS).map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag)
                                            ? rating >= 4
                                                ? 'bg-green-500/20 border border-green-500 text-green-400'
                                                : 'bg-red-500/20 border border-red-500 text-red-400'
                                            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Written Review */}
                    <div className="card p-6 mb-6">
                        <h3 className="text-white font-bold mb-3">Write a Review (Optional)</h3>
                        <textarea
                            className="input-field resize-none h-28"
                            placeholder="Share details about your experience with this coolie..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            maxLength={300}
                        />
                        <p className="text-slate-500 text-xs text-right mt-1">{comment.length}/300</p>
                    </div>

                    {/* Tip Section */}
                    {rating >= 4 && (
                        <div className="card p-6 mb-6 slide-in">
                            <h3 className="text-white font-bold mb-1 flex items-center gap-2"><Heart size={18} className="text-pink-400" /> Leave a Tip</h3>
                            <p className="text-slate-400 text-sm mb-4">Show appreciation for great service</p>
                            <div className="flex gap-3 flex-wrap">
                                {[0, 10, 20, 30, 50].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTip(t)}
                                        className={`flex-1 min-w-16 py-3 rounded-xl border font-bold transition-all ${tip === t
                                            ? 'border-green-500 bg-green-500/20 text-green-400'
                                            : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        {t === 0 ? 'No Tip' : `₹${t}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        className="btn-primary w-full flex items-center justify-center gap-3 text-base py-4"
                    >
                        <Send size={18} />
                        Submit Rating
                        {tip > 0 && <span className="text-sm opacity-80">+ ₹{tip} tip</span>}
                    </button>

                    <p className="text-center text-slate-500 text-xs mt-4">
                        Your review will be public and help other travelers choose wisely.
                    </p>
                </div>
            </div>
        </div>
    )
}
