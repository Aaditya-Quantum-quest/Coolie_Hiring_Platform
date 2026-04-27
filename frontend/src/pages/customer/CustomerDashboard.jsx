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
        /* Moved slightly higher on mobile so it doesn't clash with bottom nav */
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2 max-[767px]:bottom-20 max-[767px]:right-4">
            <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2 py-1 rounded-lg max-[767px]:text-[10px] max-[767px]:px-1.5 max-[767px]:py-0.5">SOS</span>
            <button
                onClick={handleSOS}
                className={`sos-btn max-[767px]:w-12 max-[767px]:h-12 ${pressed ? 'scale-95' : 'hover:scale-105'} transition-transform`}
            >
                <div className="flex flex-col items-center">
                    <AlertTriangle size={20} className="max-[767px]:w-4 max-[767px]:h-4" />
                    <span className="text-xs font-black max-[767px]:text-[10px]">SOS</span>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                max-[767px]:px-3 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:gap-1.5
                ${listening
                    ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse'
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20'
                }`}
        >
            <Mic size={16} className="max-[767px]:w-3.5 max-[767px]:h-3.5" />
            {/* Hide label on very small screens — icon is enough */}
            <span className="max-[400px]:hidden">{listening ? 'Listening...' : 'Hindi Voice'}</span>
            <span className="hidden max-[400px]:inline">{listening ? '...' : 'Voice'}</span>
        </button>
    )
}

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="card p-5 max-[767px]:p-3">
            <div className="flex items-start justify-between mb-3 max-[767px]:mb-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white max-[767px]:w-8 max-[767px]:h-8 max-[767px]:rounded-lg`}>
                    {React.cloneElement(icon, { size: 18, className: 'max-[767px]:w-4 max-[767px]:h-4' })}
                </div>
                {sub && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-lg max-[767px]:text-[10px] max-[767px]:px-1.5 max-[767px]:py-0.5">{sub}</span>}
            </div>
            <p className="text-2xl font-bold text-white max-[767px]:text-lg max-[767px]:leading-tight">{value}</p>
            <p className="text-sm text-slate-400 max-[767px]:text-[10px] max-[767px]:leading-tight mt-0.5">{label}</p>
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
                    axios.get('https://coolie-hiring-platform.onrender.com/api/customer/stations'),
                    axios.get('https://coolie-hiring-platform.onrender.com/api/customer/coolies'),
                    axios.get('https://coolie-hiring-platform.onrender.com/api/bookings/my-bookings')
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

    const coolieFilters = [
        { value: 'all', label: 'All Coolies' },
        { value: 'available', label: 'Available Now' },
        { value: 'rating', label: 'Top Rated' },
        { value: 'price', label: 'Lowest Price' }
    ]

    const filteredCoolies = coolies.filter(coolie => coolie.status === 'available').filter(coolie => {
        const matchesSearch = searchQuery === '' ||
            coolie.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coolie.station?.toLowerCase().includes(searchQuery.toLowerCase())
        if (!matchesSearch) return false
        switch (searchFilter) {
            case 'available': return coolie.status === 'available'
            case 'rating': return coolie.rating >= 4.5
            case 'price': return coolie.basePrice <= 150
            default: return true
        }
    })

    const filteredBookings = bookings.filter(booking => {
        return searchQuery === '' ||
            booking.coolieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.date.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const myBookings = filteredBookings.slice(0, 3)
    const totalSpent = bookings.reduce((sum, b) => sum + Number(b.amount || 0), 0)
    const ratedBookings = bookings.filter(b => b.rating > 0)
    const avgRatingGiven = ratedBookings.length > 0
        ? (ratedBookings.reduce((sum, b) => sum + Number(b.rating), 0) / ratedBookings.length).toFixed(1)
        : '0.0'
    const uniqueStations = new Set(bookings.map(b => b.station)).size

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />

            <main className="flex-1 md:ml-64 p-6
    max-[767px]:p-3        
    max-[767px]:pb-28       
">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-12 md:pt-0
        max-[767px]:gap-2   
        max-[767px]:mb-4  
        max-[767px]:pt-16   
    ">
                    <div>
                        <h1 className="text-2xl font-bold text-white
                max-[767px]:text-lg     
            ">
                            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}!</span> 👋
                        </h1>
                        <p className="text-slate-400 text-sm mt-1
                max-[767px]:text-xs    
                max-[767px]:mt-0.5    
            ">
                            {detectedStation ? (
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} className="text-orange-400
                            max-[767px]:w-3 max-[767px]:h-3   
                        " />
                                    <span className="text-orange-400 font-semibold">{detectedStation.name}</span>
                                </span>
                            ) : 'Detecting your station...'}
                        </p>
                    </div>

                    {/* CTA buttons row */}
                    <div className="flex items-center gap-2
            max-[767px]:gap-1.5   
        ">
                        <VoiceBooking onResult={(t) => toast(`Voice: ${t}`)} />
                        <button
                            onClick={() => navigate('/customer/book')}
                            className="btn-primary flex items-center gap-2
                    max-[767px]:gap-1.5     {/* [MOBILE] tighter icon-text gap inside button */}
                    max-[767px]:text-xs     {/* [MOBILE] shrink button label font */}
                    max-[767px]:py-1.5      {/* [MOBILE] reduce vertical padding 8px → 6px */}
                    max-[767px]:px-3        {/* [MOBILE] reduce horizontal padding */}
                "
                        >
                            <Zap size={16} className="
                    max-[767px]:w-3.5 max-[767px]:h-3.5   {/* [MOBILE] shrink icon to match smaller button */}
                " />
                            Book Now
                        </button>
                    </div>
                </div>

                {/* ── Search Bar ── */}
                <div className="mb-6
        max-[767px]:mb-3   {/* [MOBILE] reduce bottom margin 24px → 12px */}
    ">
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

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8
        max-[767px]:gap-2   {/* [MOBILE] tighten card gap 16px → 8px */}
        max-[767px]:mb-4    {/* [MOBILE] reduce bottom margin 32px → 16px */}
    ">
                    <StatCard icon={<Clock size={18} />} label="Total Bookings" value={bookings.length} color="from-orange-500 to-amber-500" />
                    <StatCard icon={<Star size={18} />} label="Avg Rating Given" value={`${avgRatingGiven}★`} color="from-yellow-500 to-orange-500" />
                    <StatCard icon={<TrendingUp size={18} />} label="Total Spent" value={`₹${totalSpent}`} color="from-green-500 to-emerald-500" />
                    <StatCard icon={<MapPin size={18} />} label="Stations Used" value={uniqueStations} color="from-blue-500 to-cyan-500" />
                </div>

                {/* ── Main grid ── */}
                <div className="grid lg:grid-cols-3 gap-6
        max-[767px]:gap-3   {/* [MOBILE] tighten gap between coolie list and right panel */}
    ">

                    {/* Available Coolies */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4
                max-[767px]:mb-2   {/* [MOBILE] reduce section title bottom margin 16px → 8px */}
            ">
                            <h2 className="text-lg font-bold text-white
                    max-[767px]:text-sm  
                ">Available Coolies Nearby</h2>
                            <Link to="/customer/book" className="text-orange-400 text-sm hover:underline flex items-center gap-1
                    max-[767px]:text-xs  
                ">
                                View all <ArrowRight size={14} className="
                        max-[767px]:w-3 max-[767px]:h-3  
                    " />
                            </Link>
                        </div>

                        <div className="space-y-3
                max-[767px]:space-y-2   {/* [MOBILE] tighten vertical gap between coolie cards 12px → 8px */}
            ">
                            {filteredCoolies.slice(0, 3).map(coolie => (
                                <div key={coolie.id} className="card p-4 flex items-center gap-4
                        max-[767px]:p-3       {/* [MOBILE] reduce card padding 16px → 12px */}
                        max-[767px]:gap-2.5   {/* [MOBILE] tighten avatar-to-info gap */}
                    ">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0
                            max-[767px]:w-9          {/* [MOBILE] shrink avatar 48px → 36px */}
                            max-[767px]:h-9
                            max-[767px]:rounded-lg   {/* [MOBILE] slightly smaller radius */}
                            max-[767px]:text-sm      {/* [MOBILE] shrink initial letter font */}
                        ">
                                        {coolie.name[0]}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap
                                max-[767px]:gap-1   {/* [MOBILE] tighten name + badge gap */}
                            ">
                                            <p className="text-white font-semibold
                                    max-[767px]:text-sm   {/* [MOBILE] shrink coolie name font */}
                                ">{coolie.name}</p>
                                            <span className="badge text-xs
                                    max-[767px]:text-[10px]   {/* [MOBILE] shrink badge font */}
                                    max-[767px]:px-1.5        {/* [MOBILE] reduce badge horizontal padding */}
                                    max-[767px]:py-px         {/* [MOBILE] reduce badge vertical padding */}
                                ">{coolie.badge}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap
                                max-[767px]:gap-2          {/* [MOBILE] tighten meta info gaps */}
                                max-[767px]:text-[10px]    {/* [MOBILE] shrink meta text (rating, trips) */}
                                max-[767px]:mt-0.5         {/* [MOBILE] reduce top margin 4px → 2px */}
                            ">
                                            <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" />{coolie.rating}</span>
                                            <span>{coolie.totalBookings} trips</span>
                                            <span className="hidden sm:inline"><MapPin size={10} className="inline" /> {coolie.station}</span>
                                            {/* [MOBILE] station hidden on mobile — saves space, still visible sm+ */}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2
                                max-[767px]:mt-1   {/* [MOBILE] reduce top margin 8px → 4px */}
                            ">
                                            <span className="status-available
                                    max-[767px]:text-[10px]   {/* [MOBILE] shrink status badge font */}
                                ">🟢 Available</span>
                                            <span className="text-xs text-slate-400
                                    max-[767px]:text-[10px]   {/* [MOBILE] shrink price label font */}
                                ">
                                                Base: <span className="text-orange-400 font-semibold">₹{coolie.basePrice}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col gap-2 flex-shrink-0
                            max-[767px]:gap-1.5   {/* [MOBILE] tighten gap between Book and Track buttons */}
                        ">
                                        <button
                                            onClick={() => navigate('/customer/book', { state: { coolie } })}
                                            className="btn-primary text-xs py-2 px-4
                                    max-[767px]:py-1.5      {/* [MOBILE] reduce vertical padding */}
                                    max-[767px]:px-3        {/* [MOBILE] reduce horizontal padding */}
                                    max-[767px]:text-[11px] {/* [MOBILE] slightly smaller font */}
                                "
                                        >
                                            Book
                                        </button>
                                        <button
                                            onClick={() => navigate('/customer/track')}
                                            className="btn-secondary text-xs py-2 px-4
                                    max-[767px]:py-1.5      {/* [MOBILE] reduce vertical padding */}
                                    max-[767px]:px-3        {/* [MOBILE] reduce horizontal padding */}
                                    max-[767px]:text-[11px] {/* [MOBILE] slightly smaller font */}
                                "
                                        >
                                            Track
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="space-y-4
            max-[767px]:space-y-3   {/* [MOBILE] tighten gap between Quick Actions and Recent Bookings cards */}
        ">

                        {/* Quick Actions */}
                        <div className="card p-4
                max-[767px]:p-3   {/* [MOBILE] reduce card padding 16px → 12px */}
            ">
                            <h3 className="text-white font-semibold mb-3
                    max-[767px]:text-sm   {/* [MOBILE] shrink card heading */}
                    max-[767px]:mb-2      {/* [MOBILE] reduce heading bottom margin */}
                ">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2
                    max-[767px]:gap-1.5   {/* [MOBILE] tighten quick action button grid gap */}
                ">
                                {[
                                    { icon: <Train size={18} className="text-orange-400" />, label: 'Train Status', path: '/customer/trains' },
                                    { icon: <Map size={18} className="text-cyan-400" />, label: 'Station Map', path: '/customer/map' },
                                    { icon: <ClipboardList size={18} className="text-blue-400" />, label: 'My Bookings', path: '/customer/history' },
                                    { icon: <Star size={18} className="text-yellow-400" />, label: 'Give Rating', path: '/customer/rate' },
                                ].map(qa => (
                                    <button
                                        key={qa.path}
                                        onClick={() => navigate(qa.path)}
                                        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-800/50 hover:bg-orange-500/10 hover:border-orange-500/30 border border-transparent transition-all
                                max-[767px]:p-2          {/* [MOBILE] reduce button padding 12px → 8px */}
                                max-[767px]:gap-0.5      {/* [MOBILE] tighten icon-label gap */}
                                max-[767px]:rounded-lg   {/* [MOBILE] slightly smaller radius */}
                            "
                                    >
                                        {React.cloneElement(qa.icon, {
                                            size: 18,
                                            className: `${qa.icon.props.className} max-[767px]:w-4 max-[767px]:h-4`
                                        })}
                                        <span className="text-xs text-slate-400 text-center
                                max-[767px]:text-[10px]      
                                max-[767px]:leading-tight    
                            ">{qa.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <div className="card p-4
                max-[767px]:p-3   {/* [MOBILE] reduce card padding 16px → 12px */}
            ">
                            <h3 className="text-white font-semibold mb-3
                    max-[767px]:text-sm   {/* [MOBILE] shrink card heading */}
                    max-[767px]:mb-2      {/* [MOBILE] reduce heading bottom margin */}
                ">Recent Bookings</h3>
                            <div className="space-y-3
                    max-[767px]:space-y-2   {/* [MOBILE] tighten gap between booking rows */}
                ">
                                {myBookings.slice(0, 3).map(b => (
                                    <div key={b.id} className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0
                            max-[767px]:gap-2      {/* [MOBILE] tighten row gap */}
                            max-[767px]:py-1.5     {/* [MOBILE] reduce row vertical padding */}
                        ">
                                        <div className={`w-2 h-8 rounded-full flex-shrink-0
                                max-[767px]:h-6   {/* [MOBILE] shrink status bar height 32px → 24px */}
                                ${b.status === 'completed' ? 'bg-green-500' :
                                                b.status === 'confirmed' ? 'bg-blue-500' : 'bg-orange-500'}
                            `} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate
                                    max-[767px]:text-xs   {/* [MOBILE] shrink coolie name font */}
                                ">{b.coolieName}</p>
                                            <p className="text-slate-500 text-xs
                                    max-[767px]:text-[10px]   {/* [MOBILE] shrink date + amount font */}
                                ">{b.date} • ₹{b.amount}</p>
                                        </div>
                                        <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-medium flex-shrink-0
                                max-[767px]:text-[10px]   {/* [MOBILE] shrink status badge font */}
                                max-[767px]:px-1.5        {/* [MOBILE] reduce badge horizontal padding */}
                                max-[767px]:py-px         {/* [MOBILE] reduce badge vertical padding */}
                                ${b.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                b.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-orange-500/20 text-orange-400'}
                            `}>
                                            {b.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/customer/history" className="text-orange-400 text-xs hover:underline mt-2 block
                    max-[767px]:text-[11px]   
                ">
                                View all bookings →
                            </Link>
                        </div>
                    </div>
                </div >
            </main >

            <SOSButton />
        </div >
    )
}