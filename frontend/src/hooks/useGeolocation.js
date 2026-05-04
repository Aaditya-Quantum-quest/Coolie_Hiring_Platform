import { useState, useRef, useCallback } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState('unknown'); // 'unknown' | 'granted' | 'denied' | 'prompt'
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    // Try Permissions API first for a cleaner permission state read
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setPermission('denied');
          setError('Location permission denied in browser settings.');
          return;
        }
        // For 'prompt' or 'granted', trigger getCurrentPosition to show the browser prompt
        requestLocation();
        result.addEventListener('change', () => {
          if (result.state === 'denied') {
            setPermission('denied');
            stopWatching();
          } else if (result.state === 'granted') {
            setPermission('granted');
          }
        });
      }).catch(() => {
        // Permissions API not supported or failed, fall back directly
        requestLocation();
      });
    } else {
      requestLocation();
    }

    function requestLocation() {
      // First, use getCurrentPosition to explicitly trigger the permission dialog
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setPermission('granted');
          setError(null);
          // Now start watching
          beginWatch();
        },
        (err) => {
          setPermission('denied');
          setError(err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }

    function beginWatch() {
      if (watchIdRef.current !== null) return; // already watching
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
    }
  }, [stopWatching]);

  return { location, permission, error, startWatching, stopWatching };
};

export default useGeolocation;
