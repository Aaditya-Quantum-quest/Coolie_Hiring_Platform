import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    })
    const [role, setRole] = useState(() => localStorage.getItem('role') || null)
    const [notifications, setNotifications] = useState([])
    const [shiftStartTime, setShiftStartTime] = useState(() => {
        const saved = localStorage.getItem('shiftStartTime')
        return saved ? parseInt(saved) : null
    })
    const [coolieStatus, setCoolieStatus] = useState(() => localStorage.getItem('coolieStatus') || 'offline')

    // Sync to localStorage on change
    React.useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user))
        else localStorage.removeItem('user')
    }, [user])

    React.useEffect(() => {
        if (role) localStorage.setItem('role', role)
        else localStorage.removeItem('role')
    }, [role])

    React.useEffect(() => {
        if (shiftStartTime) localStorage.setItem('shiftStartTime', shiftStartTime.toString())
        else localStorage.removeItem('shiftStartTime')
    }, [shiftStartTime])

    React.useEffect(() => {
        if (coolieStatus) localStorage.setItem('coolieStatus', coolieStatus)
        else localStorage.removeItem('coolieStatus')
    }, [coolieStatus])

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
        localStorage.removeItem('token') // Also clear the token if stored separately
    }

    const addNotification = (msg) => {
        const id = Date.now()
        setNotifications(prev => [{ id, msg, time: new Date() }, ...prev.slice(0, 9)])
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 8000)
    }

    return (
        <AppContext.Provider value={{ 
            user, role, notifications, shiftStartTime, coolieStatus,
            setUser, setRole, login, logout, addNotification, setShiftStartTime, setCoolieStatus
        }}>
            {children}
        </AppContext.Provider>
    )
}
