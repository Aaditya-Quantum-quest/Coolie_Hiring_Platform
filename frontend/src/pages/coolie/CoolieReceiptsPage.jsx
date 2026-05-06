import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useApp } from '../../context/AppContext'
import { 
    Receipt, Download, Calendar, MapPin, Clock, 
    CheckCircle, TrendingUp, Users, Star,
    ArrowRight, X, Search
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CoolieReceiptsPage() {
    const { user } = useApp()
    const [receipts, setReceipts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedReceipt, setSelectedReceipt] = useState(null)
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalTrips: 0,
        avgRating: 0,
        thisMonthEarnings: 0
    })

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const response = await axios.get('/api/bookings/my-bookings', { withCredentials: true })
                if (response.data.success) {
                    // Transform bookings into receipts
                    const receiptData = response.data.bookings.map(booking => ({
                        ...booking,
                        receiptId: `RCP-${booking.id}`,
                        receiptDate: booking.date,
                        amount: booking.amount,
                        paymentStatus: booking.paymentStatus,
                        status: booking.status,
                        customerName: booking.customerName,
                        tripStart: booking.trip_started_at,
                        tripEnd: booking.trip_ended_at,
                        startingPosition: booking.startingPosition,
                        endPosition: booking.endPosition,
                        trainDetails: {
                            trainNo: booking.trainNo,
                            trainName: booking.trainName
                        },
                        luggage: {
                            count: booking.luggageCount,
                            imageUrl: booking.luggageImgUrl
                        }
                    }))
                    setReceipts(receiptData)
                    
                    // Calculate stats
                    const completedTrips = response.data.bookings.filter(b => b.status === 'completed')
                    const totalEarnings = completedTrips.reduce((sum, b) => sum + (b.amount || 0), 0)
                    const avgRating = completedTrips.reduce((sum, b) => sum + (b.rating || 0), 0) / completedTrips.length || 1
                    
                    const thisMonth = new Date().getMonth()
                    const thisMonthEarnings = completedTrips
                        .filter(b => new Date(b.trip_ended_at).getMonth() === thisMonth)
                        .reduce((sum, b) => sum + (b.amount || 0), 0)
                    
                    setStats({
                        totalEarnings,
                        totalTrips: completedTrips.length,
                        avgRating: avgRating.toFixed(1),
                        thisMonthEarnings
                    })
                }
            } catch (error) {
                console.error('Error fetching receipts:', error)
                toast.error('Failed to load receipts')
            } finally {
                setLoading(false)
            }
        }

        fetchReceipts()
    }, [])

    const filteredReceipts = receipts.filter(receipt => {
        const matchesSearch = receipt.receiptId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          receipt.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          receipt.status.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesFilter = filterStatus === 'all' || receipt.status === filterStatus
        
        return matchesSearch && matchesFilter
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10'
            case 'in_progress': return 'text-blue-400 bg-blue-400/10'
            case 'accepted': return 'text-yellow-400 bg-yellow-400/10'
            case 'pending': return 'text-gray-400 bg-gray-400/10'
            case 'cancelled': return 'text-red-400 bg-red-400/10'
            default: return 'text-gray-400 bg-gray-400/10'
        }
    }

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'text-green-400'
            case 'pending': return 'text-yellow-400'
            default: return 'text-gray-400'
        }
    }

    const downloadReceipt = async (receipt) => {
        try {
            // Create receipt content
            const receiptContent = `
========================================
COOLIESEVA RECEIPT
========================================

Receipt ID: ${receipt.receiptId}
Date: ${receipt.receiptDate}
Status: ${receipt.status.toUpperCase()}

COOLIE INFORMATION:
Name: ${user.name}
Customer: ${receipt.customerName}

TRIP DETAILS:
From: ${receipt.startingPosition}
To: ${receipt.endPosition}
Train: ${receipt.trainDetails.trainNo} - ${receipt.trainDetails.trainName}
Luggage: ${receipt.luggage.count} items

FINANCIAL DETAILS:
Amount: ₹${receipt.amount}
Payment Status: ${receipt.paymentStatus?.toUpperCase() || 'PENDING'}

TIMESTAMP:
Trip Started: ${receipt.tripStart || 'Not started'}
Trip Ended: ${receipt.tripEnd || 'Not completed'}

========================================
Thank you for your service!
========================================
            `
            
            // Create and download file
            const blob = new Blob([receiptContent], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${receipt.receiptId}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            
            toast.success('Receipt downloaded successfully!')
        } catch (error) {
            console.error('Error downloading receipt:', error)
            toast.error('Failed to download receipt')
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Sidebar role="coolie" />
                <div className="w-full md:ml-64 flex-1 p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar role="coolie" />
            <div className="w-full md:ml-64 flex-1 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">My Earnings & Receipts</h1>
                        <p className="text-slate-400 text-sm">
                            View your trip history, earnings, and download receipts
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total Earnings</span>
                                <TrendingUp size={16} className="text-green-400" />
                            </div>
                            <p className="text-2xl font-bold text-green-400">₹{stats.totalEarnings}</p>
                        </div>
                        
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total Trips</span>
                                <Users size={16} className="text-blue-400" />
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{stats.totalTrips}</p>
                        </div>
                        
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Avg Rating</span>
                                <Star size={16} className="text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-400">{stats.avgRating}</p>
                        </div>
                        
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">This Month</span>
                                <Calendar size={16} className="text-purple-400" />
                            </div>
                            <p className="text-2xl font-bold text-purple-400">₹{stats.thisMonthEarnings}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card mb-6 p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search receipts..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                {['all', 'completed', 'in_progress', 'accepted', 'pending', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                            filterStatus === status
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Receipts List */}
                    <div className="space-y-4">
                        {filteredReceipts.length === 0 ? (
                            <div className="card p-8 text-center">
                                <Receipt size={48} className="text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-400 text-sm">No receipts found</p>
                                <p className="text-slate-500 text-xs mt-2">
                                    {searchQuery && 'Try adjusting your search or filters'}
                                </p>
                            </div>
                        ) : (
                            filteredReceipts.map(receipt => (
                                <div key={receipt.receiptId} className="card p-4 sm:p-6 hover:shadow-lg transition-shadow">
                                    {/* Receipt Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <Receipt size={16} className="text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{receipt.receiptId}</h3>
                                                <p className="text-slate-400 text-xs">{receipt.receiptDate}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(receipt.status)}`}>
                                                {receipt.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`text-xs font-semibold ${getPaymentStatusColor(receipt.paymentStatus)}`}>
                                                {receipt.paymentStatus?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Trip Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin size={14} />
                                                <span className="text-xs">Route</span>
                                            </div>
                                            <p className="text-white text-sm font-medium">
                                                {receipt.startingPosition} → {receipt.endPosition}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar size={14} />
                                                <span className="text-xs">Train</span>
                                            </div>
                                            <p className="text-white text-sm font-medium">
                                                {receipt.trainDetails.trainNo} - {receipt.trainDetails.trainName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Service Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Customer</p>
                                            <p className="text-white text-sm font-medium">{receipt.customerName}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Luggage</p>
                                            <p className="text-white text-sm font-medium">{receipt.luggage.count} items</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Amount</p>
                                            <p className="text-green-400 text-sm font-bold">₹{receipt.amount}</p>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Trip Started</p>
                                            <p className="text-white text-sm">
                                                {receipt.tripStart ? new Date(receipt.tripStart).toLocaleString() : 'Not started'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-1">Trip Ended</p>
                                            <p className="text-white text-sm">
                                                {receipt.tripEnd ? new Date(receipt.tripEnd).toLocaleString() : 'Not completed'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                        <button
                                            onClick={() => setSelectedReceipt(receipt)}
                                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                                        >
                                            <Receipt size={14} />
                                            View Details
                                        </button>
                                        
                                        <button
                                            onClick={() => downloadReceipt(receipt)}
                                            disabled={receipt.status !== 'completed'}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                                        >
                                            <Download size={14} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Detail Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-lg">Receipt Details</h3>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Receipt Header */}
                            <div className="text-center mb-6 p-4 bg-slate-800/50 rounded-lg">
                                <h2 className="text-2xl font-bold text-green-400 mb-2">COOLIESEVA</h2>
                                <p className="text-slate-400 text-sm">Official Receipt</p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Receipt size={20} className="text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">{selectedReceipt.receiptId}</p>
                                        <p className="text-slate-400 text-xs">{selectedReceipt.receiptDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Calendar size={16} className="text-blue-400" />
                                        Trip Information
                                    </h4>
                                    <div className="space-y-3 pl-4 border-l-2 border-slate-700">
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Starting Point:</span>
                                            <span className="text-white font-medium">{selectedReceipt.startingPosition}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Destination:</span>
                                            <span className="text-white font-medium">{selectedReceipt.endPosition}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Train Number:</span>
                                            <span className="text-white font-medium">{selectedReceipt.trainDetails.trainNo}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Train Name:</span>
                                            <span className="text-white font-medium">{selectedReceipt.trainDetails.trainName}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Trip Started:</span>
                                            <span className="text-white font-medium">
                                                {selectedReceipt.tripStart ? new Date(selectedReceipt.tripStart).toLocaleString() : 'Not started'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Trip Ended:</span>
                                            <span className="text-white font-medium">
                                                {selectedReceipt.tripEnd ? new Date(selectedReceipt.tripEnd).toLocaleString() : 'Not completed'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-400" />
                                        Service & Payment
                                    </h4>
                                    <div className="space-y-3 pl-4 border-l-2 border-slate-700">
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Coolie Name:</span>
                                            <span className="text-white font-medium">{user.name}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Customer Name:</span>
                                            <span className="text-white font-medium">{selectedReceipt.customerName}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Luggage Items:</span>
                                            <span className="text-white font-medium">{selectedReceipt.luggage.count} items</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Service Amount:</span>
                                            <span className="text-green-400 font-bold text-lg">₹{selectedReceipt.amount}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Payment Status:</span>
                                            <span className={`font-bold ${
                                                selectedReceipt.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'
                                            }`}>
                                                {selectedReceipt.paymentStatus?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Booking Status:</span>
                                            <span className={`font-semibold ${getStatusColor(selectedReceipt.status)}`}>
                                                {selectedReceipt.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-800">
                                <button
                                    onClick={() => downloadReceipt(selectedReceipt)}
                                    disabled={selectedReceipt.status !== 'completed'}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:opacity-50 text-white font-medium transition-colors"
                                >
                                    <Download size={16} />
                                    Download Receipt
                                </button>
                                <button
                                    onClick={() => setSelectedReceipt(null)}
                                    className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
