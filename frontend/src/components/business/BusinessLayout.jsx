import React from 'react';
import BusinessSidebar from './BusinessSidebar';
import { useBusinessAuth } from '../../context/BusinessAuthContext';
import { Navigate } from 'react-router-dom';

export default function BusinessLayout({ children }) {
    const { token, loading } = useBusinessAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-dark)' }}>
            <div className="w-8 h-8 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!token) return <Navigate to="/business/login" replace />;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-dark)', fontFamily: 'Quicksand, system-ui, sans-serif' }}>
            <BusinessSidebar />
            <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
                <div className="p-5 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
