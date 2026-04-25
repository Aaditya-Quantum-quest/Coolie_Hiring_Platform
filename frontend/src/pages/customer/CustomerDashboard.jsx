import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useApp } from '../../context/AppContext'
import {
    Search, MapPin, AlertTriangle, Star, Clock, ArrowRight,
    TrendingUp, Mic, Navigation, Train, Zap, Map, ClipboardList, X
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import SearchBar from '../../components/ui/SearchBar'

function SOSButton() {
    const { addNotification, setActiveSOS } = useApp()
    const [pressed, setPressed] = useState(false)

    const handleSOS = () => {
        setPressed(true)
        setActiveSOS(true)
        toast.error('🚨 SOS Alert Sent! Admin notified. Help is on the way!', { duration: 6000 })
        addNotification('🚨 SOS triggered — Admin alerted, emergency contact notified')
        setTimeout(() => { setPressed(false); setActiveSOS(false) }, 5000)
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2 py-1 rounded-lg">SOS</span>
            <button
                onClick={handleSOS}
                className={`sos-btn ${pressed ? 'scale-95' : 'hover:scale-105'} transition-transform`}
            >
                <div className="flex flex-col items-center">
                    <AlertTriangle size={20} />
                    <span className="text-xs font-black">SOS</span>
                </div>
            </button>
        </div>
    )
}

function VoiceBooking({ onResult }) {
    const [listening, setListening] = useState(false)

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognition = new SR()
            recognition.lang = 'hi-IN'
            recognition.interimResults = false
            recognition.onstart = () => setListening(true)
            recognition.onend = () => setListening(false)
            recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript
                toast.success(`Voice: "${transcript}"`)
                onResult(transcript)
            }
            recognition.onerror = () => {
                setListening(false)
                toast.error('Voice not supported. Please type.')
            }
            recognition.start()
        } else {
            toast.error('Voice booking not supported in this browser.')
        }
    }

    return (
        <button
            onClick={startListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${listening
                    ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
                }`}
        >
            <Mic size={16} />
            {listening ? 'Listening...' : 'Hindi Voice Book'}
        </button>
    )
}

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                    {icon}
                </div>
                {sub && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">{sub}</span>}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    )
}

export default function CustomerDashboard() {
    const { user, addNotification } = useApp()
    const navigate = useNavigate()
    const [detectedStation, setDetectedStation] = useState(null)
    const [detecting, setDetecting] = useState(false)
    const [stations, setStations] = useState([])
    const [coolies, setCoolies] = useState([])
    const [bookings, setBookings] = useState([])
    const [firstBookingOffer, setFirstBookingOffer] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statRes, coolRes, bookRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/customer/stations'),
                    axios.get('http://localhost:5000/api/customer/coolies'),
                    axios.get('http://localhost:5000/api/bookings/my-bookings')
                ])
                if (statRes.data.success) setStations(statRes.data.stations)
                if (coolRes.data.success) setCoolies(coolRes.data.coolies)
                if (bookRes.data.success) setBookings(bookRes.data.bookings)
            } catch (err) {
                console.error(err)
            }
        }
        loadData()
    }, [])

    const detectStation = () => {
        setDetecting(true)
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                // Mock: find nearest station
                const s = stations.length > 0 ? stations[0] : { name: 'New Delhi Railway Station' }
                setDetectedStation(s)
                toast.success(`📍 Station detected: ${s.name}!`)
                setDetecting(false)
            },
            () => {
                const s = stations.length > 0 ? stations[0] : { name: 'New Delhi Railway Station' }
                setDetectedStation(s)
                toast.success(`📍 Station detected: ${s.name} (Mock)`)
                setDetecting(false)
            }
        )
    }

    useEffect(() => { if (stations.length > 0 && !detectedStation) detectStation() }, [stations])

    // Search filters for coolies
    const coolieFilters = [
        { value: 'all', label: 'All Coolies' },
        { value: 'available', label: 'Available Now' },
        { value: 'rating', label: 'Top Rated' },
        { value: 'price', label: 'Lowest Price' }
    ]

    // Filter coolies based on search
    const filteredCoolies = coolies.filter(coolie => coolie.status === 'available').filter(coolie => {
        const matchesSearch = searchQuery === '' || 
            coolie.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.station?.toLowerCase().includes(searchQuery.toLowerCase())
        
        if (!matchesSearch) return false

        switch (searchFilter) {
            case 'available':
                return coolie.status === 'available'
            case 'rating':
                return coolie.rating >= 4.5
            case 'price':
                return coolie.basePrice <= 150
            default:
                return true
        }
    })

    // Filter bookings based on search
    const filteredBookings = bookings.filter(booking => {
        return searchQuery === '' ||
            booking.coolieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.date.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const myBookings = filteredBookings.slice(0, 3)
    const completed = myBookings.filter(b => b.status === 'completed').length

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />

            <main className="flex-1 md:ml-64 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-12 md:pt-0">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span> 👋
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {detectedStation ? (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} className="text-orange-400" />
                                    Auto-detected: <span className="text-orange-400 font-semibold">{detectedStation.name}</span>
                                </span>
                            ) : 'Detecting your station...'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <VoiceBooking onResult={(t) => toast(`Voice: ${t}`)} />
                        <button onClick={() => navigate('/customer/book')} className="btn-primary flex items-center gap-2">
                            <Zap size={16} /> Book Now
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar
                        placeholder="Search coolies, bookings, platforms..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onFilter={setSearchFilter}
                        filters={coolieFilters}
                        selectedFilter={searchFilter}
                        showFilters={true}
                    />
                </div>

                {/* First Booking Offer Banner */}
                {firstBookingOffer && (
                    <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🎉</span>
                            <div>
                                <p className="text-white font-bold">First Booking Offer!</p>
                                <p className="text-slate-300 text-sm">Get <span className="text-orange-400 font-bold">₹10 OFF</span> on your first coolie booking!</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/customer/book')} className="btn-primary text-sm py-2">Book Now</button>
                            <button onClick={() => setFirstBookingOffer(false)} className="text-slate-400 hover:text-white p-1"><X size={16} /></button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={<Clock size={18} />} label="Total Bookings" value={bookings.length} color="from-orange-500 to-amber-500" sub="+2 this week" />
                    <StatCard icon={<Star size={18} />} label="Avg Rating Given" value="4.8★" color="from-yellow-500 to-orange-500" />
                    <StatCard icon={<TrendingUp size={18} />} label="Total Spent" value="₹310" color="from-green-500 to-emerald-500" sub="This month" />
                    <StatCard icon={<MapPin size={18} />} label="Stations Used" value="2" color="from-blue-500 to-cyan-500" />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Available Coolies */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Available Coolies Nearby</h2>
                            <Link to="/customer/book" className="text-orange-400 text-sm hover:underline flex items-center gap-1">
                                View all <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {filteredCoolies.slice(0, 3).map(coolie => (
                                <div key={coolie.id} className="card p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {coolie.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-white font-semibold">{coolie.name}</p>
                                            <span className="badge text-xs">{coolie.badge}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" />{coolie.rating}</span>
                                            <span>{coolie.totalBookings} trips</span>
                                            <span><MapPin size={10} className="inline" /> {coolie.station}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="status-available">🟢 Available</span>
                                            <span className="text-xs text-slate-400">Base: <span className="text-orange-400 font-semibold">₹{coolie.basePrice}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button onClick={() => navigate('/customer/book', { state: { coolie } })} className="btn-primary text-xs py-2 px-4">
                                            Book
                                        </button>
                                        <button onClick={() => navigate('/customer/track')} className="btn-secondary text-xs py-2 px-4">
                                            Track
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="space-y-4">
                        {/* Quick Links */}
                        <div className="card p-4">
                            <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: <Train size={18} className="text-orange-400" />, label: 'Train Status', path: '/customer/trains' },
                                    { icon: <Map size={18} className="text-cyan-400" />, label: 'Station Map', path: '/customer/map' },
                                    { icon: <ClipboardList size={18} className="text-blue-400" />, label: 'My Bookings', path: '/customer/history' },
                                    { icon: <Star size={18} className="text-yellow-400" />, label: 'Give Rating', path: '/customer/rate' },
                                ].map(qa => (
                                    <button
                                        key={qa.path}
                                        onClick={() => navigate(qa.path)}
                                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-800/50 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent transition-all"
                                    >
                                        {qa.icon}
                                        <span className="text-xs text-slate-400">{qa.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <div className="card p-4">
                            <h3 className="text-white font-semibold mb-3">Recent Bookings</h3>
                            <div className="space-y-3">
                                {myBookings.slice(0, 3).map(b => (
                                    <div key={b.id} className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0">
                                        <div className={`w-2 h-8 rounded-full ${b.status === 'completed' ? 'bg-green-500' :
                                                b.status === 'confirmed' ? 'bg-blue-500' : 'bg-orange-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{b.coolieName}</p>
                                            <p className="text-slate-500 text-xs">{b.date} • ₹{b.amount}</p>
                                        </div>
                                        <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-medium ${b.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-orange-500/20 text-orange-400'
                                            }`}>{b.status}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/customer/history" className="text-orange-400 text-xs hover:underline mt-2 block">View all bookings →</Link>
                        </div>
                    </div>
                </div>
            </main>

            <SOSButton />
        </div>
    )
}
