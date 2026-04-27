import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import { 
    Download, Printer, ChevronLeft, MapPin, 
    Train, Clock, Package, User, Phone, 
    CheckCircle, Shield, CreditCard, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingReceipt() {
    const { id } = useParams(); // booking_ref
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const res = await axios.get(`/api/bookings/${id}`, { withCredentials: true });
                if (res.data.success) {
                    setBooking(res.data.booking);
                }
            } catch (err) {
                console.error('Fetch booking details error:', err);
                toast.error('Failed to load receipt details');
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex bg-[#0A0814] min-h-screen">
                <Sidebar role="customer" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#7B2FFF] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex bg-[#0A0814] min-h-screen">
                <Sidebar role="customer" />
                <div className="flex-1 flex flex-col items-center justify-center text-white">
                    <p className="text-xl mb-4">Receipt not found</p>
                    <button onClick={() => navigate('/customer/history')} className="px-6 py-2 bg-[#7B2FFF] rounded-xl font-bold">Back to Bookings</button>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="flex bg-[#0A0814] min-h-screen">
            <Sidebar role="customer" />
            <main className="flex-1 md:ml-64 p-5 md:p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-[#6B6188] hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </button>
                        <div className="flex gap-3">
                            <button className="p-2.5 rounded-xl bg-[#1E1A40] text-white hover:bg-[#2A245A] transition-colors">
                                <Printer size={20} />
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#7B2FFF] text-white rounded-xl font-bold hover:bg-[#5B1FCC] transition-colors">
                                <Download size={18} />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Receipt Card */}
                    <div className="bg-[#0E0C1E] border border-[#1E1A40] rounded-3xl overflow-hidden shadow-2xl relative">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7B2FFF]/5 blur-[100px] -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 blur-[100px] -z-10"></div>

                        {/* Top Banner */}
                        <div className="bg-gradient-to-r from-[#7B2FFF] to-[#5B1FCC] px-8 py-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-white text-2xl font-black tracking-tight">BOOKING RECEIPT</h1>
                                <p className="text-white/70 text-sm font-medium mt-1 uppercase tracking-widest">Digital Porter Platform</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                                <span className="text-white/70 text-[10px] block uppercase font-bold tracking-tighter">Status</span>
                                <span className="text-white font-black text-lg uppercase">{booking.status}</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Booking Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest mb-1">Booking Ref</span>
                                    <span className="text-white font-bold font-mono text-lg">{booking.booking_ref}</span>
                                </div>
                                <div>
                                    <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest mb-1">OTP</span>
                                    <span className="text-[#7B2FFF] font-black font-mono text-lg tracking-[4px]">{booking.otp}</span>
                                </div>
                                <div>
                                    <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest mb-1">Date Created</span>
                                    <span className="text-white font-semibold text-sm">{formatDate(booking.created_at)}</span>
                                </div>
                                <div>
                                    <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest mb-1">Payment</span>
                                    <span className={`text-xs font-black uppercase px-2 py-1 rounded ${booking.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {booking.payment_status}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-[#1E1A40]" />

                            {/* Customer & Coolie Details */}
                            <div className="grid md:grid-cols-2 gap-10">
                                {/* Left Side: Customer & Luggage */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[#6B6188] text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-widest">
                                            <User size={14} className="text-[#7B2FFF]" />
                                            Customer Details
                                        </h3>
                                        <div className="bg-[#12102A] rounded-2xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6188] text-sm">Name</span>
                                                <span className="text-white font-bold">{booking.customerName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6188] text-sm">Customer ID</span>
                                                <span className="text-white/60 text-xs font-mono">{booking.customer_id?.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[#6B6188] text-sm">Phone</span>
                                                <span className="text-white font-semibold">{booking.customerPhone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[#6B6188] text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-widest">
                                            <Package size={14} className="text-[#7B2FFF]" />
                                            Luggage Info
                                        </h3>
                                        <div className="flex gap-4">
                                            <div className="w-24 h-24 rounded-2xl bg-[#12102A] border border-[#1E1A40] overflow-hidden shrink-0">
                                                {booking.luggage_img_url ? (
                                                    <img src={booking.luggage_img_url} alt="Luggage" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#3a3560]">
                                                        <Package size={32} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest">Size Category</span>
                                                    <span className="text-white font-bold capitalize">{booking.luggage_size}</span>
                                                </div>
                                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1 inline-flex items-center gap-2">
                                                    <Shield size={10} className="text-green-400" />
                                                    <span className="text-green-400 text-[10px] font-black uppercase">Insured Trip</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Coolie & Trip */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[#6B6188] text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-widest">
                                            <Shield size={14} className="text-[#7B2FFF]" />
                                            Porter Details
                                        </h3>
                                        <div className="bg-[#12102A] rounded-2xl p-4 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B2FFF] to-[#5B1FCC] flex items-center justify-center text-white font-black text-xl">
                                                {booking.coolieName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{booking.coolieName}</p>
                                                <div className="flex items-center gap-1.5 text-[#6B6188] text-xs mt-0.5">
                                                    <Phone size={10} />
                                                    <span>{booking.cooliePhone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[#6B6188] text-xs font-bold flex items-center gap-2 mb-4 uppercase tracking-widest">
                                            <Clock size={14} className="text-[#7B2FFF]" />
                                            Timeline
                                        </h3>
                                        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#1E1A40]">
                                            <div className="relative pl-8">
                                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#12102A] border-2 border-[#7B2FFF] flex items-center justify-center z-10">
                                                    <div className="w-2 h-2 rounded-full bg-[#7B2FFF]"></div>
                                                </div>
                                                <p className="text-[#6B6188] text-[10px] uppercase font-bold tracking-tighter">Porter Arrived</p>
                                                <p className="text-white font-semibold text-sm">{formatDate(booking.coolie_arrived_at)}</p>
                                            </div>
                                            <div className="relative pl-8">
                                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#12102A] border-2 border-[#7B2FFF] flex items-center justify-center z-10">
                                                    <div className="w-2 h-2 rounded-full bg-[#7B2FFF]"></div>
                                                </div>
                                                <p className="text-[#6B6188] text-[10px] uppercase font-bold tracking-tighter">Trip Started</p>
                                                <p className="text-white font-semibold text-sm">{formatDate(booking.trip_started_at)}</p>
                                            </div>
                                            <div className="relative pl-8">
                                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#12102A] border-2 border-green-500 flex items-center justify-center z-10">
                                                    <CheckCircle size={14} className="text-green-500" />
                                                </div>
                                                <p className="text-[#6B6188] text-[10px] uppercase font-bold tracking-tighter">Trip Ended</p>
                                                <p className="text-white font-semibold text-sm">{formatDate(booking.trip_ended_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-[#1E1A40]" />

                            {/* Trip Summary Table */}
                            <div className="bg-[#12102A] rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-2 p-6 gap-y-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                                            <MapPin size={16} className="text-orange-400" />
                                        </div>
                                        <div>
                                            <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest">Current Station</span>
                                            <span className="text-white font-bold">{booking.initial_station_name}</span>
                                            <span className="text-[#6B6188] text-xs block">Platform {booking.platform}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <MapPin size={16} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest">Destination Station</span>
                                            <span className="text-white font-bold">{booking.destination_station_name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#7B2FFF]/10 flex items-center justify-center shrink-0">
                                            <Train size={16} className="text-[#7B2FFF]" />
                                        </div>
                                        <div>
                                            <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest">Train Details</span>
                                            <span className="text-white font-bold">{booking.train_name || 'N/A'}</span>
                                            <span className="text-[#6B6188] text-xs block">#{booking.train_no}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#7B2FFF]/10 flex items-center justify-center shrink-0">
                                            <Hash size={16} className="text-[#7B2FFF]" />
                                        </div>
                                        <div>
                                            <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest">Destination</span>
                                            <span className="text-white font-bold">{booking.destination}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#7B2FFF]/10 flex items-center justify-center shrink-0">
                                            <CreditCard size={16} className="text-[#7B2FFF]" />
                                        </div>
                                        <div>
                                            <span className="text-[#6B6188] text-[10px] block uppercase font-bold tracking-widest">Total Amount</span>
                                            <span className="text-green-400 font-black text-xl">₹{booking.amount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / QR */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                                <div className="text-center md:text-left">
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-[2px] mb-2">Authenticated By</p>
                                    <div className="flex items-center gap-4 grayscale opacity-30">
                                        <span className="text-white font-black italic">CoolieHire</span>
                                        <span className="text-white font-black border border-white/50 px-2 text-xs">GOV-INDIA</span>
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded-xl">
                                    {/* Mock QR Code */}
                                    <div className="w-20 h-20 bg-black flex items-center justify-center">
                                        <div className="grid grid-cols-4 gap-1 p-1">
                                            {[...Array(16)].map((_, i) => (
                                                <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cut-line decorative */}
                        <div className="absolute bottom-[240px] left-0 right-0 flex items-center gap-4 px-4 overflow-hidden opacity-20">
                            <div className="w-4 h-8 bg-[#0A0814] rounded-r-full -ml-6 shrink-0"></div>
                            <div className="flex-1 border-t-2 border-dashed border-[#6B6188]"></div>
                            <div className="w-4 h-8 bg-[#0A0814] rounded-l-full -mr-6 shrink-0"></div>
                        </div>
                    </div>

                    <p className="text-center text-[#6B6188] text-xs mt-8">
                        This is a computer-generated receipt. No signature required.
                    </p>
                </div>
            </main>
        </div>
    );
}
