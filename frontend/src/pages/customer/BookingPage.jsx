import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useApp } from '../../context/AppContext'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
    MapPin, Star, CheckCircle, X, Camera,
    Zap, TrendingDown, Navigation, Package, Hash,
    Train, Clock, Trophy, Crown
} from 'lucide-react'
import { useGlobalSocket } from '../../context/SocketContext'
import useGeolocation from '../../hooks/useGeolocation'
import { searchTrain, searchStation } from '../../services/railApiService'



/* ─── Main Page ─────────────────────────────────────────────── */
export default function BookingPage() {
    const { addNotification } = useApp()
    const navigate = useNavigate()
    const location = useLocation()
    const preselectedCoolie = location.state?.coolie

    const [form, setForm] = useState({
        initialStation: '',
        station: '',
        platform: '',
        trainNo: '',
        trainName: '',
        dateTime: '',
        customAmount: '',
        luggageCount: 1,
        luggageImgUrl: '',
    })
    const [preview, setPreview] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchingInitialStation, setSearchingInitialStation] = useState(false)
    const [searchingStation, setSearchingStation] = useState(false)
    const [searchingTrain, setSearchingTrain] = useState(false)
    const [booked, setBooked] = useState(false)
    const [otp] = useState(Math.floor(1000 + Math.random() * 9000))

    // Search Suggestions
    const [initialStationSuggestions, setInitialStationSuggestions] = useState([])
    const [stationSuggestions, setStationSuggestions] = useState([])
    const [trainSuggestions, setTrainSuggestions] = useState([])

    // Debounced Initial Station Search
    useEffect(() => {
        if (form.initialStation.length < 2) {
            setInitialStationSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            setSearchingInitialStation(true)
            try {
                const res = await searchStation(form.initialStation)
                if (res.status && res.data) setInitialStationSuggestions(res.data)
            } catch (err) { console.error(err) }
            finally { setSearchingInitialStation(false) }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.initialStation])

    // Debounced Destination Station Search
    useEffect(() => {
        if (form.station.length < 2) {
            setStationSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            setSearchingStation(true)
            try {
                const res = await searchStation(form.station)
                if (res.status && res.data) setStationSuggestions(res.data)
            } catch (err) { console.error(err) }
            finally { setSearchingStation(false) }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.station])

    // Debounced Train Search
    useEffect(() => {
        if (form.trainNo.length < 3) {
            setTrainSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            setSearchingTrain(true)
            try {
                const res = await searchTrain(form.trainNo)
                if (res.status && res.data) {
                    setTrainSuggestions(res.data)
                    if (res.data.length === 1) {
                        update('trainName', res.data[0].train_name)
                    }
                }
            } catch (err) { console.error(err) }
            finally { setSearchingTrain(false) }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.trainNo])

    // Real-time coolie fetching
    const [priceTable, setPriceTable] = useState(null)
    const [availCoolies, setAvailCoolies] = useState([])
    const { socket, connected } = useGlobalSocket()
    const { location: geoLoc, startWatching } = useGeolocation()

    useEffect(() => {
        startWatching();

        // Auto-set current date and time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        update('dateTime', formattedDateTime);
    }, [startWatching]);

    useEffect(() => {
        axios.get('/api/config/pricing', { withCredentials: true })
            .then(res => {
                if (res.data.success) setPriceTable(res.data.priceTable)
            })
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        const fetchCoolies = async () => {
            try {
                let url = '/api/customer/coolies';
                if (geoLoc) url = `/api/location/nearby?lat=${geoLoc.lat}&lng=${geoLoc.lng}`;
                const res = await axios.get(url, { withCredentials: true });
                if (res.data.success) {
                    setAvailCoolies(res.data.coolies.filter(c => c.status === 'available'));
                }
            } catch (err) {
                console.error('API fetch failed:', err);
            }
        };
        fetchCoolies();
    }, [geoLoc]);

    useEffect(() => {
        if (socket && connected) {
            socket.on('nearby:coolies-update', (updatedCoolies) => {
                if (updatedCoolies && updatedCoolies.length > 0) {
                    setAvailCoolies(updatedCoolies);
                }
            });
        }
        return () => {
            if (socket) socket.off('nearby:coolies-update');
        };
    }, [socket, connected]);

    const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }))

    const handlePhoto = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Show preview
        setPreview(URL.createObjectURL(file))
        setAnalyzing(true)

        try {
            // Upload to backend
            const formData = new FormData()
            formData.append('luggage_photo', file)

            const res = await axios.post('/api/bookings/upload-luggage', formData, {
                withCredentials: true
            })

            if (res.data.success) {
                update('luggageImgUrl', res.data.url)
                toast.success('Luggage photo uploaded!')
            }
        } catch (err) {
            console.error('Upload failed:', err)
            toast.error('Failed to upload luggage photo')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleSubmit = async () => {
        if (!form.station || !form.platform || !form.dateTime || !form.trainName) {
            toast.error('Please fill trip details (Station, Platform, Train)')
            return
        }

        if (!form.luggageImgUrl) {
            toast.error('Please upload a luggage photo of your bags')
            return
        }

        const finalAmount = form.customAmount ? parseInt(form.customAmount) : 100;

        setSubmitting(true)

        try {
            const bookingData = {
                station: form.station,
                initialStation: form.initialStation,
                platform: form.platform,
                amount: finalAmount,
                trainNo: form.trainNo,
                trainName: form.trainName,
                dateTime: form.dateTime,
                luggageCount: form.luggageCount,
                luggageImgUrl: form.luggageImgUrl
            }

            const res = await axios.post('/api/bookings', bookingData, { withCredentials: true });

            if (res.data.success) {
                setBooked(true)
                addNotification(`🎉 Booking confirmed! OTP: ${res.data.booking.otp}`)

                // Store the booking ref for the receipt
                const bookingRef = res.data.booking.booking_ref;

                // Auto navigate to history after delay
                setTimeout(() => {
                    navigate('/customer/history')
                }, 3000)
            }
        } catch (err) {
            console.error('Booking failed:', err)
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    /* ── Booked Success Screen ── */
    if (booked) {
        return (
            <div className="flex bg-[#0A0814] min-h-screen">
                <Sidebar role="customer" />
                <main className="flex-1 md:ml-64 flex items-center justify-center p-6">
                    <div className="text-center max-w-sm w-full">
                        <div className="text-7xl mb-4">🎉</div>
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-green-400 mb-1">Booking Confirmed!</h2>
                            <p className="text-[#6B6188] mb-5">Your porter is on the way</p>
                            <div className="bg-[#12102A] rounded-xl p-4 mb-4">
                                <p className="text-[#6B6188] text-sm mb-1">Your OTP (Share with porter)</p>
                                <p className="text-5xl font-black text-[#7B2FFF] tracking-[12px] font-mono">{otp}</p>
                            </div>
                            <div className="space-y-2 text-sm text-left mb-5">
                                <div className="flex justify-between"><span className="text-[#6B6188]">Platform</span><span className="text-white">{form.platform}</span></div>
                                <div className="flex justify-between"><span className="text-[#6B6188]">Price Paid</span><span className="text-green-400 font-bold">₹{form.customAmount || 100}</span></div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/customer/track')} className="flex-1 py-2.5 rounded-xl bg-[#7B2FFF] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#5B1FCC] transition-colors">
                                    <Navigation size={14} /> Track Porter
                                </button>
                                <button onClick={() => navigate('/customer')} className="flex-1 py-2.5 rounded-xl border border-[#1E1A40] text-[#B0A8CC] text-sm hover:border-[#7B2FFF] transition-colors">
                                    Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-5 md:p-7 max-[767px]:p-3 max-[767px]:pb-24">
                <div className="max-w-6xl mx-auto">

                    {/* ── Main Form ── */}
                    <div className="max-w-2xl mx-auto space-y-5">

                        {/* Trip Details */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 mt-16 md:mt-0 max-[767px]:p-4">
                            <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4 max-[767px]:text-base">
                                <span className="w-5 h-5 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                    <MapPin size={11} className="text-[#7B2FFF]" />
                                </span>
                                Trip Details
                            </h2>

                            <div className="grid grid-cols-2 gap-3 mb-3 max-[767px]:grid-cols-1 max-[767px]:gap-4">
                                {/* Initial Station */}
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Current Station</label>
                                    <div className="relative">
                                        <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                                        <input
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-10 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                            placeholder="e.g. Rampur"
                                            value={form.initialStation}
                                            onChange={e => update('initialStation', e.target.value)}
                                        />
                                        {searchingInitialStation && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {initialStationSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 z-50 bg-[#1E1A40] border border-[#7B2FFF]/30 rounded-xl mt-1 overflow-hidden shadow-2xl">
                                                {initialStationSuggestions.map((s, i) => (
                                                    <div key={i} className="px-3 py-2 hover:bg-[#7B2FFF]/20 cursor-pointer text-white text-xs border-b border-[#1E1A40] last:border-0"
                                                        onClick={() => {
                                                            update('initialStation', `${s.station_name} (${s.station_code})`)
                                                            setInitialStationSuggestions([])
                                                        }}
                                                    >
                                                        <span className="font-bold">{s.station_name}</span> ({s.station_code})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Destination Station */}
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Destination Station</label>
                                    <div className="relative">
                                        <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                                        <input
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-10 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                            placeholder="e.g. Moradabad"
                                            value={form.station}
                                            onChange={e => update('station', e.target.value)}
                                        />
                                        {searchingStation && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {stationSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 z-50 bg-[#1E1A40] border border-[#7B2FFF]/30 rounded-xl mt-1 overflow-hidden shadow-2xl">
                                                {stationSuggestions.map((s, i) => (
                                                    <div key={i} className="px-3 py-2 hover:bg-[#7B2FFF]/20 cursor-pointer text-white text-xs border-b border-[#1E1A40] last:border-0"
                                                        onClick={() => {
                                                            update('station', `${s.station_name} (${s.station_code})`)
                                                            setStationSuggestions([])
                                                        }}
                                                    >
                                                        <span className="font-bold">{s.station_name}</span> ({s.station_code})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Platform */}
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Platform No.</label>
                                    <input
                                        className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                        placeholder="04"
                                        value={form.platform}
                                        onChange={e => update('platform', e.target.value)}
                                    />
                                </div>

                                {/* Train No */}
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Train Number</label>
                                    <div className="relative">
                                        <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                        <input
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-10 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                            placeholder="ELITE-102"
                                            value={form.trainNo}
                                            onChange={e => update('trainNo', e.target.value)}
                                        />
                                        {searchingTrain && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {trainSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 z-50 bg-[#1E1A40] border border-[#7B2FFF]/30 rounded-xl mt-1 overflow-hidden shadow-2xl">
                                                {trainSuggestions.map((t, i) => (
                                                    <div key={i} className="px-3 py-2 hover:bg-[#7B2FFF]/20 cursor-pointer text-white text-xs border-b border-[#1E1A40] last:border-0"
                                                        onClick={() => {
                                                            update('trainNo', t.train_number)
                                                            update('trainName', t.train_name)
                                                            setTrainSuggestions([])
                                                        }}
                                                    >
                                                        <span className="font-bold">{t.train_name}</span> (#{t.train_number})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Train Name */}
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Train Name</label>
                                    <div className="relative">
                                        <Train size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                        <input
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                            placeholder="Shatabdi Express"
                                            value={form.trainName}
                                            onChange={e => update('trainName', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Date & Time</label>
                                    <div className="relative">
                                        <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6188]" />
                                        <input
                                            type="datetime-local"
                                            readOnly
                                            className="w-full bg-[#12102A]/50 border border-[#1E1A40] rounded-xl pl-8 pr-3 py-2.5 text-[#6B6188] text-sm outline-none cursor-not-allowed transition-colors"
                                            value={form.dateTime}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Luggage Photo Section */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-xl p-4">
                            <h2 className="text-white font-bold text-xs flex items-center gap-1.5 mb-3">
                                <span className="w-4 h-4 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                    <Camera size={9} className="text-[#7B2FFF]" />
                                </span>
                                Luggage Photo (Mandatory)
                            </h2>
                            <div className="flex flex-col xs:flex-row gap-3">
                                {/* Preview / Upload */}
                                <div className="bg-[#12102A] border border-[#1E1A40] rounded-lg overflow-hidden w-full xs:w-32 h-32 flex-shrink-0">
                                    {preview ? (
                                        <div className="relative h-full w-full">
                                            <img src={preview} alt="luggage" className="w-full h-full object-cover" />
                                            {analyzing && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer h-full w-full gap-1">
                                            <Camera size={16} className="text-[#3a3560]" />
                                            <span className="text-[#6B6188] text-[9px] tracking-wide">NO PHOTO</span>
                                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                                        </label>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-2">
                                    <p className="text-[#6B6188] text-[10px] leading-relaxed">
                                        Take a photo of your luggage to help the porter identify you easily.
                                    </p>
                                    <label className="flex items-center justify-center gap-1 py-1.5 rounded-md border border-[#7B2FFF]/40 text-[#A855F7] text-[10px] font-semibold cursor-pointer hover:bg-[#7B2FFF]/10 transition-colors">
                                        <Camera size={10} />
                                        <span>Take Photo</span>
                                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Custom Amount Section */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5 max-[767px]:p-4">
                            <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4 max-[767px]:text-base">
                                <span className="w-5 h-5 rounded bg-[#7B2FFF]/20 flex items-center justify-center">
                                    <Trophy size={11} className="text-[#7B2FFF]" />
                                </span>
                                Custom Amount
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] text-[#6B6188] uppercase tracking-wider mb-1.5 block">Enter Your Desired Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B2FFF] font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10000"
                                            step="10"
                                            className="w-full bg-[#12102A] border border-[#1E1A40] rounded-xl pl-12 pr-3 py-3 text-white text-lg font-bold outline-none focus:border-[#7B2FFF] placeholder-[#3a3560] transition-colors"
                                            placeholder="Enter custom amount..."
                                            value={form.customAmount}
                                            onChange={e => {
                                                const value = e.target.value
                                                update('customAmount', value)
                                                if (value && value > 0) {
                                                    // Update nothing else
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-[#12102A] rounded-xl p-3 border border-[#1E1A40]">
                                    <p className="text-[10px] text-[#6B6188] mb-2">💡 <strong>Pro Tip:</strong> Enter your desired amount and we'll try to match it with available porters!</p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[#6B6188]">Suggested Range:</span>
                                        {priceTable && (
                                            <span className="text-[#7B2FFF] font-bold">
                                                ₹{priceTable['medium']?.floor} - ₹{priceTable['medium']?.base + 50}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-2xl p-5">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-4 rounded-xl bg-[#7B2FFF] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#5B1FCC] transition-colors disabled:opacity-60"
                            >
                                {submitting
                                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><CheckCircle size={18} /> Submit Booking Request</>
                                }
                            </button>
                        </div>

                    </div> {/* ✅ closes max-w-2xl mx-auto space-y-5 */}
                </div>     {/* ✅ closes max-w-6xl mx-auto */}
            </main>
        </div>
    )
}
