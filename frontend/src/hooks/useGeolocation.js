import { useState, useRef, useCallback } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState('unknown'); // 'unknown' | 'granted' | 'denied' | 'prompt'
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermission('granted');
        setError(null);
      },
      (err) => {
        setPermission('denied');
        setError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { location, permission, error, startWatching, stopWatching };
};

export default useGeolocation;
