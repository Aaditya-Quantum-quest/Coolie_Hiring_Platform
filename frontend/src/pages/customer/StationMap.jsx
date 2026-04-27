import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { MapPin, Users, Clock, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import SearchBar from '../../components/ui/SearchBar'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeCoolieIcon = (status) => L.divIcon({
    html: `<div style="background:${status === 'available' ? '#22c55e' : status === 'busy' ? '#eab308' : '#ef4444'};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3)">👷</div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 16],
})

const PLATFORMS = [
    { no: 1, bounds: [[28.6412, 77.2185], [28.6415, 77.2195]], color: '#f97316' },
    { no: 2, bounds: [[28.6416, 77.2185], [28.6419, 77.2195]], color: '#06b6d4' },
    { no: 3, bounds: [[28.6420, 77.2185], [28.6423, 77.2195]], color: '#8b5cf6' },
    { no: 4, bounds: [[28.6424, 77.2185], [28.6427, 77.2195]], color: '#22c55e' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

const heatColor = (val) => {
    if (val === 0) return 'bg-slate-800'
    if (val === 1) return 'heat-low'
    if (val === 2) return 'heat-medium'
    if (val === 3) return 'heat-high'
    return 'heat-peak'
}

export default function StationMap() {
    const [stations, setStations] = useState([])
    const [coolies, setCoolies] = useState([])
    const [busyHours, setBusyHours] = useState(Array.from({ length: 7 }, () => Array(24).fill(0)))
    const [selectedStation, setSelectedStation] = useState(null)
    const [tab, setTab] = useState('map') // map | heatmap
    const [searchQuery, setSearchQuery] = useState('')
    const [searchFilter, setSearchFilter] = useState('all')

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statRes, coolRes, busyRes] = await Promise.all([
                    axios.get('https://coolie-hiring-platform-backend.onrender.com/api/customer/stations'),
                    axios.get('https://coolie-hiring-platform-backend.onrender.com/api/customer/coolies'),
                    axios.get('https://coolie-hiring-platform-backend.onrender.com/api/config/busy-hours')
                ])
                if (statRes.data.success) {
                    setStations(statRes.data.stations)
                    if (statRes.data.stations.length > 0) setSelectedStation(statRes.data.stations[0])
                }
                if (coolRes.data.success) setCoolies(coolRes.data.coolies)
                if (busyRes.data.success) setBusyHours(busyRes.data.busyHours)
            } catch (err) {
                console.error(err)
            }
        }
        loadData()
    }, [])

    // Search filters for stations
    const stationFilters = [
        { value: 'all', label: 'All Stations' },
        { value: 'major', label: 'Major Stations' },
        { value: 'available', label: 'Available Coolies' },
        { value: 'busy', label: 'High Traffic' }
    ]

    // Filter stations based on search
    const filteredStations = stations.filter(station => {
        const matchesSearch = searchQuery === '' ||
            station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            station.code.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        switch (searchFilter) {
            case 'major':
                return station.name.includes('Delhi') || station.name.includes('Mumbai') || station.name.includes('Howrah')
            case 'available':
                return coolies.filter(c => c.station === station.name && c.status === 'available').length > 0
            case 'busy':
                return station.traffic === 'high'
            default:
                return true
        }
    })

    return (
        <div className="min-h-screen bg-slate-900 flex">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-6 max-[767px]:p-3 max-[767px]:pb-24">
                <div className="pt-12 md:pt-0 mb-6 max-[767px]:mb-4">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 max-[767px]:text-lg max-[767px]:gap-1.5">
                        <MapPin size={26} className="text-orange-400 max-[767px]:w-[18px] max-[767px]:h-[18px]" />
                        Station Map & Heatmap
                    </h1>
                    <p className="text-slate-400 text-sm max-[767px]:text-xs">Interactive station map with platform guide & busy hour analysis</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <SearchBar
                        placeholder="Search stations, platforms, routes..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onFilter={setSearchFilter}
                        filters={stationFilters}
                        selectedFilter={searchFilter}
                        showFilters={true}
                    />
                </div>

                {/* Station Selector */}
                {selectedStation && (
                    <div className="flex gap-2 mb-4 flex-wrap max-[767px]:mb-3 max-[767px]:gap-1.5">
                        {filteredStations.slice(0, 4).map(s => (
                            <button key={s.id} onClick={() => setSelectedStation(s)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all max-[767px]:px-2.5 max-[767px]:py-1.5 max-[767px]:text-[11px] max-[767px]:rounded-lg ${selectedStation.id === s.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}>
                                {s.name.split(' ')[0]}...
                            </button>
                        ))}
                    </div>
                )}

                {/* Tab Toggle */}
                <div className="flex gap-2 mb-4 max-[767px]:mb-3">
                    <button onClick={() => setTab('map')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all max-[767px]:px-3 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:rounded-lg ${tab === 'map' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <Layers size={14} className="max-[767px]:w-3.5 max-[767px]:h-3.5" /> Station Map
                    </button>
                    <button onClick={() => setTab('heatmap')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all max-[767px]:px-3 max-[767px]:py-1.5 max-[767px]:text-xs max-[767px]:rounded-lg ${tab === 'heatmap' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        <Clock size={14} className="max-[767px]:w-3.5 max-[767px]:h-3.5" /> Busy Hour Heatmap
                    </button>
                </div>

                {tab === 'map' ? (selectedStation &&
                    <div className="grid lg:grid-cols-3 gap-6 max-[767px]:gap-3">
                        <div className="lg:col-span-2 card overflow-hidden h-[480px] max-[767px]:h-[350px]">
                            <MapContainer center={[selectedStation.lat, selectedStation.lng]} zoom={17} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

                                {/* Platform overlays */}
                                {PLATFORMS.map(p => (
                                    <Rectangle
                                        key={p.no}
                                        bounds={p.bounds}
                                        pathOptions={{ color: p.color, fillOpacity: 0.2, weight: 2 }}
                                    >
                                        <Popup><strong>Platform {p.no}</strong></Popup>
                                    </Rectangle>
                                ))}

                                {/* Coolie markers */}
                                {coolies.filter(c => c.station === selectedStation.name).map(c => (
                                    <Marker key={c.id} position={[c.lat, c.lng]} icon={makeCoolieIcon(c.status)}>
                                        <Popup>
                                            <div style={{ fontFamily: 'Inter, sans-serif', minWidth: 140 }}>
                                                <strong>{c.name}</strong>
                                                <br />⭐ {c.rating} • {c.totalBookings} trips
                                                <br /><span style={{ color: c.status === 'available' ? '#22c55e' : '#eab308' }}>● {c.status}</span>
                                                <br />₹{c.basePrice} base price
                                                <br /><button
                                                    style={{ marginTop: 6, background: '#f97316', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 8, cursor: 'pointer', width: '100%' }}
                                                    onClick={() => toast.success(`Booking ${c.name}...`)}
                                                >Book Now</button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>

                        <div className="space-y-4 max-[767px]:space-y-3">
                            {/* Legend */}
                            <div className="card p-4 max-[767px]:p-3">
                                <h3 className="text-white font-semibold mb-3 max-[767px]:mb-2 max-[767px]:text-sm">Map Legend</h3>
                                <div className="space-y-2 text-sm max-[767px]:space-y-1.5 max-[767px]:text-xs">
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500 max-[767px]:w-3 max-[767px]:h-3" /><span className="text-slate-300">Available Coolie</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500 max-[767px]:w-3 max-[767px]:h-3" /><span className="text-slate-300">Busy (Request Received)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500 max-[767px]:w-3 max-[767px]:h-3" /><span className="text-slate-300">On Duty</span></div>
                                    {PLATFORMS.map(p => (
                                        <div key={p.no} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-sm max-[767px]:w-3 max-[767px]:h-3" style={{ background: p.color }} />
                                            <span className="text-slate-300">Platform {p.no}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Available Coolies */}
                            <div className="card p-4 max-[767px]:p-3">
                                <h3 className="text-white font-semibold mb-3 max-[767px]:mb-2 max-[767px]:text-sm">
                                    Coolies at {selectedStation.name.split(' ')[0]}
                                </h3>
                                <div className="space-y-2 max-[767px]:space-y-1">
                                    {coolies.filter(c => c.station === selectedStation.name).map(c => (
                                        <div key={c.id} className="flex items-center gap-2 py-2 border-b border-slate-700/50 last:border-0 max-[767px]:py-1.5">
                                            <div className={`w-2 h-2 rounded-full ${c.status === 'available' ? 'bg-green-500' : c.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium max-[767px]:text-xs">{c.name}</p>
                                                <p className="text-xs text-slate-500 max-[767px]:text-[10px]">⭐{c.rating} • ₹{c.basePrice}</p>
                                            </div>
                                            <span className={`text-xs capitalize max-[767px]:text-[10px] ${c.status === 'available' ? 'text-green-400' : c.status === 'busy' ? 'text-yellow-400' : 'text-red-400'}`}>{c.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Busy Hour Heatmap */
                    <div className="card p-5 max-[767px]:p-3">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2 max-[767px]:text-sm max-[767px]:mb-3">
                            <Clock size={18} className="text-orange-400 max-[767px]:w-4 max-[767px]:h-4" /> Busy Hour Heatmap — Station Activity
                        </h3>
                        <div className="overflow-x-auto max-[767px]:pb-2">
                            <div className="min-w-max">
                                <div className="flex gap-1 mb-1">
                                    <div className="w-10 max-[767px]:w-8" />
                                    {HOURS.map((h, i) => (
                                        i % 3 === 0 && <div key={i} className="text-xs text-slate-500 w-6 text-center max-[767px]:text-[10px] max-[767px]:w-5">{h.slice(0, 2)}</div>
                                    ))}
                                </div>
                                {busyHours.map((row, di) => (
                                    <div key={di} className="flex items-center gap-1 mb-1">
                                        <div className="w-10 text-xs text-slate-400 font-medium max-[767px]:text-[10px] max-[767px]:w-8">{DAYS[di]}</div>
                                        {row.map((val, hi) => (
                                            <div
                                                key={hi}
                                                className={`w-6 h-6 rounded-sm cursor-pointer transition-transform hover:scale-125 max-[767px]:w-5 max-[767px]:h-5 ${heatColor(val)}`}
                                                title={`${DAYS[di]} ${HOURS[hi]}: ${['Low', 'Low', 'Medium', 'High', 'Peak'][val]} traffic`}
                                            />
                                        ))}
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 mt-4 flex-wrap max-[767px]:gap-2 max-[767px]:mt-3">
                                    {[['Low', 'heat-low'], ['Medium', 'heat-medium'], ['High', 'heat-high'], ['Peak', 'heat-peak'], ['Closed', 'bg-slate-800']].map(([l, c]) => (
                                        <div key={l} className="flex items-center gap-1">
                                            <div className={`w-4 h-4 rounded-sm max-[767px]:w-3 max-[767px]:h-3 ${c}`} />
                                            <span className="text-xs text-slate-400 max-[767px]:text-[10px]">{l}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 max-[767px]:mt-3 max-[767px]:p-2.5">
                            <p className="text-blue-300 text-sm max-[767px]:text-xs max-[767px]:leading-snug">💡 <strong>Best time to travel:</strong> Weekday mornings (6-8am) and early afternoons (1-3pm) have the most coolies available with shortest wait times.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
