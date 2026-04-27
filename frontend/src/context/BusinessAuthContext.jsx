import React, { createContext, useContext, useState, useEffect } from 'react';

const BusinessAuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || 'https://coolie-hiring-platform.onrender.com';

export const BusinessAuthProvider = ({ children }) => {
    const [owner, setOwner] = useState(null);
    const [business, setBusiness] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('businessToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            const ownerData = JSON.parse(localStorage.getItem('businessOwner') || 'null');
            const businessData = JSON.parse(localStorage.getItem('businessData') || 'null');
            setOwner(ownerData);
            setBusiness(businessData);
        }
        setLoading(false);
    }, []);

    const login = (tokenVal, ownerData, businessData) => {
        localStorage.setItem('businessToken', tokenVal);
        localStorage.setItem('businessOwner', JSON.stringify(ownerData));
        localStorage.setItem('businessData', JSON.stringify(businessData));
        setToken(tokenVal);
        setOwner(ownerData);
        setBusiness(businessData);
    };

    const logout = () => {
        localStorage.removeItem('businessToken');
        localStorage.removeItem('businessOwner');
        localStorage.removeItem('businessData');
        setToken(null);
        setOwner(null);
        setBusiness(null);
    };

    const authFetch = (url, options = {}) => {
        return fetch(`${API}${url}`, {
            ...options,
            headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
        });
    };

    return (
        <BusinessAuthContext.Provider value={{ owner, business, token, loading, login, logout, authFetch, API }}>
            {children}
        </BusinessAuthContext.Provider>
    );
};

export const useBusinessAuth = () => useContext(BusinessAuthContext);
