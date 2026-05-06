import React, { useEffect, useState } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Save, Loader2, Info, Compass, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map clicks and marker placement
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
        </Marker>
    );
}

// Component to recenter map when position changes
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 15);
    }, [center]);
    return null;
}

export default function LocationAndMap() {
    const { authFetch, business } = useBusinessAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [position, setPosition] = useState(null); // [lat, lng]
    
    // Fallback center: India center or Station location if available
    const defaultCenter = [20.5937, 78.9629]; 

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await authFetch('/api/v1/owner/profile');
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
                if (data.profile.latitude && data.profile.longitude) {
                    setPosition([parseFloat(data.profile.latitude), parseFloat(data.profile.longitude)]);
                }
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!position) {
            toast.error('Please select a location on the map');
            return;
        }

        setSaving(true);
        try {
            const res = await authFetch('/api/v1/owner/location', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: position[0],
                    longitude: position[1],
                    // Optionally update address fields if needed, but here we prioritize coords
                    full_address: profile.full_address,
                    city: profile.city,
                    state: profile.state,
                    pincode: profile.pincode
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Location updated successfully!');
            } else {
                toast.error(data.error?.message || 'Update failed');
            }
        } catch (err) {
            console.error('Update location error:', err);
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.loading('Fetching your current location...', { id: 'geo' });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
                toast.success('Location detected!', { id: 'geo' });
            },
            (err) => {
                toast.error('Could not get current location: ' + err.message, { id: 'geo' });
            }
        );
    };

    if (loading) return (
        <BusinessLayout>
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 text-[#7B2FFF] animate-spin" />
                <p className="text-sm" style={{ color: 'var(--text-body)' }}>Loading map...</p>
            </div>
        </BusinessLayout>
    );

    return (
        <BusinessLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Location & Map</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>Pin your exact business location for customers to find you easily.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={useCurrentLocation}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-[#7B2FFF]/10"
                        style={{ borderColor: 'var(--border-color)', color: '#7B2FFF' }}
                    >
                        <Navigation size={16} />
                        Use My Current Device Location
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || !position}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#7B2FFF]/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{ backgroundColor: '#7B2FFF', color: 'white' }}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save Pin Location
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-6 h-[calc(100vh-220px)] min-h-[500px]">
                {/* Map Area */}
                <div className="relative rounded-2xl overflow-hidden border shadow-inner" style={{ borderColor: 'var(--border-color)' }}>
                    <MapContainer 
                        center={position || defaultCenter} 
                        zoom={position ? 15 : 5} 
                        style={{ height: '100%', width: '100%', background: '#0f172a', zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            // Custom dark mode for map (optional via CSS filters)
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                        <ChangeView center={position} />
                    </MapContainer>
                    
                    {/* Map Overlay Instructions */}
                    <div className="absolute top-4 right-4 z-[1000] p-3 rounded-lg bg-[#12102A]/90 backdrop-blur-sm border border-[#1E1A40] max-w-[200px]">
                        <p className="text-[11px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            <Info size={14} className="inline mr-1 text-[#7B2FFF]" />
                            Click anywhere on the map to place the marker at your property location.
                        </p>
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-4 overflow-y-auto pr-2">
                    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Compass size={16} className="text-[#7B2FFF]" />
                            Current Coordinates
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6188] mb-1">Latitude</label>
                                <div className="px-3 py-2 rounded-lg bg-[#1E1A40] text-sm font-mono text-white">
                                    {position ? position[0].toFixed(8) : 'Not selected'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6188] mb-1">Longitude</label>
                                <div className="px-3 py-2 rounded-lg bg-[#1E1A40] text-sm font-mono text-white">
                                    {position ? position[1].toFixed(8) : 'Not selected'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <MapPin size={16} className="text-[#7B2FFF]" />
                            Registered Address
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                            {profile?.full_address}<br/>
                            {profile?.city}, {profile?.state} - {profile?.pincode}
                        </p>
                        <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <p className="text-[10px] text-orange-400 font-medium">
                                <AlertCircle size={10} className="inline mr-1" />
                                Make sure the pin accurately represents the physical address to avoid listing disputes.
                            </p>
                        </div>
                    </div>
                    
                    <a 
                        href="/owner/profile"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold transition-all border border-[#1E1A40] hover:bg-[#1E1A40] text-[#B0A8CC]"
                    >
                        Back to Profile Info
                    </a>
                </div>
            </div>
        </BusinessLayout>
    );
}
