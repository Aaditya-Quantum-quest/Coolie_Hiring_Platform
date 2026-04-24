import React from 'react';
import { MapPin, ShieldAlert } from 'lucide-react';

export default function LocationPermissionModal({ onEnable, onStayOffline, isDenied }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#12102A] border border-[#1E1A40] rounded-2xl p-6 w-full max-w-sm text-center">
                <div className="w-16 h-16 rounded-full bg-[#7B2FFF]/20 flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-[#A855F7]" />
                </div>
                
                <h3 className="text-white font-bold text-lg mb-2">
                    {isDenied ? 'Location Access Denied' : 'Location Access Needed'}
                </h3>
                
                <p className="text-[#B0A8CC] text-sm mb-6 leading-relaxed">
                    {isDenied 
                        ? 'To receive nearby bookings, you must allow location access in your browser settings. Then, refresh the page.'
                        : 'To receive nearby bookings and let customers track you, please allow location access. Online coolies get 3x more bookings!'
                    }
                </p>

                {isDenied && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex flex-col gap-2 text-left">
                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                            <ShieldAlert size={14} /> How to enable:
                        </div>
                        <ol className="text-[#6B6188] text-xs space-y-1 list-decimal list-inside">
                            <li>Click the 🔒 icon in the address bar</li>
                            <li>Find "Location" and change to "Allow"</li>
                            <li>Refresh this page</li>
                        </ol>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {!isDenied && (
                        <button 
                            onClick={onEnable} 
                            className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors"
                        >
                            📍 Enable Location
                        </button>
                    )}
                    {isDenied && (
                        <button 
                            onClick={() => window.location.reload()} 
                            className="w-full py-3 rounded-xl bg-[#7B2FFF] text-white font-bold hover:bg-[#5B1FCC] transition-colors"
                        >
                            🔄 Try Again
                        </button>
                    )}
                    <button 
                        onClick={onStayOffline} 
                        className="w-full py-3 rounded-xl border border-[#1E1A40] text-[#B0A8CC] font-semibold hover:border-[#7B2FFF] transition-colors"
                    >
                        Stay Offline
                    </button>
                </div>
            </div>
        </div>
    );
}
