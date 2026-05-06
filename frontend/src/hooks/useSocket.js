import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// Production: set VITE_API_URL=https://coolie-hiring-platform.onrender.com in frontend/.env
// Development: connects directly to Express backend on port 5000
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useSocket = (autoConnect = true) => {
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (autoConnect && !socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                withCredentials: true,
                autoConnect: true,
                reconnection: true,
            });

            socketRef.current.on('connect', () => {
                setConnected(true);
            });

            socketRef.current.on('disconnect', () => {
                setConnected(false);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [autoConnect]);

    return { socket: socketRef.current, connected };
};

export default useSocket;
