import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [role, setRole] = useState(null) // 'customer' | 'coolie' | 'admin'
    const [notifications, setNotifications] = useState([])
    const [activeSOS, setActiveSOS] = useState(false)

    const login = (userData, userRole) => {
        setUser(userData)
        setRole(userRole)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('role', userRole)
    }

    const logout = () => {
        setUser(null)
        setRole(null)
        localStorage.removeItem('user')
        localStorage.removeItem('role')
    }

    const addNotification = (msg) => {
        const id = Date.now()
        setNotifications(prev => [{ id, msg, time: new Date() }, ...prev.slice(0, 9)])
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000)
    }

    return (
        <AppContext.Provider value={{ user, role, notifications, activeSOS, login, logout, addNotification, setActiveSOS }}>
            {children}
        </AppContext.Provider>
    )
}
