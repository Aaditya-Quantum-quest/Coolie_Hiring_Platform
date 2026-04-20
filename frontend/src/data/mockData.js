// Mock data for the app
export const STATIONS = [
    { id: 1, name: 'New Delhi Railway Station', lat: 28.6414, lng: 77.2194 },
    { id: 2, name: 'Mumbai CSMT', lat: 18.9402, lng: 72.8352 },
    { id: 3, name: 'Howrah Junction', lat: 22.5839, lng: 88.3427 },
    { id: 4, name: 'Chennai Central', lat: 13.0827, lng: 80.2707 },
    { id: 5, name: 'Bareilly Station', lat: 28.3670, lng: 79.4304 },
    { id: 6, name: 'Kanpur Central', lat: 26.4527, lng: 80.3469 },
]

export const COOLIES = [
    {
        id: 1, name: 'Ramesh Kumar', phone: '9876543210', age: 35,
        station: 'New Delhi Railway Station', stationId: 1,
        platform: 'Platform 1-5', rating: 4.8, totalBookings: 234,
        badge: '⭐ Star Coolie', status: 'available',
        photo: null, idProof: 'Aadhar', basePrice: 80,
        languages: ['Hindi', 'English'], experience: '5 years',
        lat: 28.6420, lng: 77.2200,
    },
    {
        id: 2, name: 'Suresh Yadav', phone: '9765432109', age: 28,
        station: 'New Delhi Railway Station', stationId: 1,
        platform: 'Platform 6-12', rating: 4.6, totalBookings: 189,
        badge: '🏅 Verified Pro', status: 'available',
        photo: null, idProof: 'Aadhar', basePrice: 70,
        languages: ['Hindi'], experience: '3 years',
        lat: 28.6410, lng: 77.2185,
    },
    {
        id: 3, name: 'Mohan Lal', phone: '9654321098', age: 42,
        station: 'New Delhi Railway Station', stationId: 1,
        platform: 'All Platforms', rating: 4.9, totalBookings: 412,
        badge: '👑 Legend', status: 'busy',
        photo: null, idProof: 'Voter ID', basePrice: 100,
        languages: ['Hindi', 'Punjabi', 'English'], experience: '10 years',
        lat: 28.6430, lng: 77.2210,
    },
    {
        id: 4, name: 'Deepak Singh', phone: '9543210987', age: 31,
        station: 'Mumbai CSMT', stationId: 2,
        platform: 'Platform 1-8', rating: 4.5, totalBookings: 156,
        badge: '✅ Trusted', status: 'available',
        photo: null, idProof: 'Aadhar', basePrice: 90,
        languages: ['Hindi', 'Marathi'], experience: '4 years',
        lat: 18.9405, lng: 72.8355,
    },
]

export const BOOKINGS = [
    {
        id: 'BK001', customerId: 1, coolieId: 1, coolieName: 'Ramesh Kumar',
        station: 'New Delhi Railway Station', platform: 'Platform 3',
        destination: 'Exit Gate A', luggageSize: 'medium', luggageCount: 3,
        date: '2026-02-25', time: '14:30', amount: 100,
        status: 'completed', paymentStatus: 'paid', rating: 5,
        otp: '4521', trainNo: '12301'
    },
    {
        id: 'BK002', customerId: 1, coolieId: 2, coolieName: 'Suresh Yadav',
        station: 'New Delhi Railway Station', platform: 'Platform 7',
        destination: 'Parking Lot', luggageSize: 'small', luggageCount: 1,
        date: '2026-02-24', time: '09:15', amount: 60,
        status: 'confirmed', paymentStatus: 'paid', rating: null,
        otp: '7832', trainNo: '12001'
    },
    {
        id: 'BK003', customerId: 1, coolieId: 1, coolieName: 'Ramesh Kumar',
        station: 'New Delhi Railway Station', platform: 'Platform 1',
        destination: 'Auto Stand', luggageSize: 'large', luggageCount: 5,
        date: '2026-02-26', time: '16:00', amount: 150,
        status: 'pending', paymentStatus: 'pending', rating: null,
        otp: '2341', trainNo: '12951'
    },
]

export const PRICE_TABLE = {
    small: { label: 'Small (1-2 bags)', base: 50, maxDiscount: 10, floor: 40 },
    medium: { label: 'Medium (3-4 bags)', base: 100, maxDiscount: 20, floor: 80 },
    large: { label: 'Large (5+ bags)', base: 150, maxDiscount: 20, floor: 130 },
    heavy: { label: 'Very Heavy / Trolley', base: 200, maxDiscount: 20, floor: 180 },
}

export const TRAINS = [
    { no: '12301', name: 'Rajdhani Express', from: 'New Delhi', to: 'Howrah', platform: 3, status: 'On Time', arr: '14:45', delay: 0 },
    { no: '12001', name: 'Shatabdi Express', from: 'New Delhi', to: 'Mumbai', platform: 7, status: 'Delayed', arr: '09:45', delay: 30 },
    { no: '12951', name: 'Mumbai Rajdhani', from: 'New Delhi', to: 'Mumbai Central', platform: 1, status: 'On Time', arr: '17:30', delay: 0 },
    { no: '12259', name: 'Duronto Express', from: 'New Delhi', to: 'Sealdah', platform: 5, status: 'On Time', arr: '20:15', delay: 0 },
    { no: '12555', name: 'Gorakhdham Express', from: 'Anand Vihar', to: 'Gorakhpur', platform: 2, status: 'Delayed', arr: '11:30', delay: 45 },
]

export const FESTIVAL_SURGES = {
    'Diwali': 30,
    'Holi': 25,
    'Dussehra': 20,
    'Exam Season': 15,
    'Summer Rush': 20,
}

export const LEADERBOARD = [
    { rank: 1, name: 'Mohan Lal', station: 'New Delhi', bookings: 52, rating: 4.9, badge: '👑 Legend', bonus: '₹100' },
    { rank: 2, name: 'Ramesh Kumar', station: 'New Delhi', bookings: 48, rating: 4.8, badge: '⭐ Star Coolie', bonus: '₹50' },
    { rank: 3, name: 'Deepak Singh', station: 'Mumbai CSMT', bookings: 41, rating: 4.5, badge: '✅ Trusted', bonus: '₹25' },
    { rank: 4, name: 'Suresh Yadav', station: 'New Delhi', bookings: 38, rating: 4.6, badge: '🏅 Verified Pro', bonus: '-' },
    { rank: 5, name: 'Rajesh Gupta', station: 'Howrah', bookings: 35, rating: 4.4, badge: '✅ Trusted', bonus: '-' },
]

export const BUSY_HOURS = [
    [1, 1, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 3, 3, 2, 2, 3, 4, 3, 2, 2, 1, 1], // Mon
    [1, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 2, 3, 3, 2, 2, 3, 4, 3, 2, 2, 1, 1], // Tue
    [1, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 2, 3, 3, 2, 3, 3, 4, 3, 2, 2, 1, 1], // Wed
    [1, 0, 0, 0, 0, 1, 2, 4, 3, 2, 2, 2, 3, 4, 3, 2, 3, 4, 4, 3, 2, 2, 2, 1], // Thu
    [1, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 2, 3, 4, 3, 2, 3, 4, 4, 3, 2, 2, 2, 1], // Fri
    [2, 1, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 4, 4, 3, 3, 3, 4, 4, 4, 3, 2, 2, 1], // Sat
    [2, 1, 0, 0, 0, 1, 2, 3, 2, 3, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 1], // Sun
]
