// API Configuration
export const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    TIMEOUT: 30000,
    ENDPOINTS: {
        // Auth endpoints
        LOGIN: '/auth/login/',
        REGISTER: '/auth/register/',
        LOGOUT: '/auth/logout/',
        PROFILE: '/auth/profile/',
        CHANGE_PASSWORD: '/auth/change-password/',
        DELETE_ACCOUNT: '/auth/delete-account/',
        TOKEN_REFRESH: '/auth/token/refresh/',
    }
};

// Token management
export const getTokens = () => {
    return {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token')
    };
};

export const setTokens = (access, refresh) => {
    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

// API request helper
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    console.log('API Request:', {
        url,
        method: options.method || 'GET',
        headers: options.headers
    });
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    // Add authorization header if access token exists
    const tokens = getTokens();
    if (tokens.access) {
        defaultHeaders['Authorization'] = `Bearer ${tokens.access}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, config);
        
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error || data.message || 'Request failed',
                details: data.details || data
            };
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw {
                status: 0,
                message: 'Cannot connect to server. Please make sure the backend is running.',
                details: error.message
            };
        }
        
        throw error;
    }
};
