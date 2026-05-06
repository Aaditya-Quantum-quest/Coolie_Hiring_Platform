/**
 * Utility to get the correct URL for an asset (image, etc.)
 * Handles both relative paths (stored in DB) and absolute URLs
 */
export const getAssetUrl = (url) => {
    if (!url) return null;
    
    // If it's already a full URL, return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Otherwise, prepend the API base URL
    const API = import.meta.env.VITE_API_URL || '';
    
    // Clean up potential double slashes
    const baseUrl = API.replace(/\/$/, '');
    const path = url.replace(/^\//, '');
    
    return `${baseUrl}/${path}`;
};
