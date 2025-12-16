// API Configuration
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api',
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

// API request helper with automatic token refresh
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
        let response = await fetch(url, config);
        
        console.log('API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });
        
        // If unauthorized and we have a refresh token, try to refresh
        if (response.status === 401 && tokens.refresh && endpoint !== API_CONFIG.ENDPOINTS.TOKEN_REFRESH) {
            console.log('Access token expired, attempting refresh...');
            
            try {
                // Try to refresh the token
                const refreshResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOKEN_REFRESH}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh: tokens.refresh })
                });
                
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    setTokens(refreshData.access, tokens.refresh);
                    
                    // Retry the original request with new token
                    config.headers['Authorization'] = `Bearer ${refreshData.access}`;
                    response = await fetch(url, config);
                    
                    console.log('Retried with new token:', {
                        status: response.status,
                        ok: response.ok
                    });
                } else {
                    // Refresh failed, clear tokens and redirect to login
                    clearTokens();
                    window.location.href = '#!/login';
                    throw {
                        status: 401,
                        message: 'Session expired. Please login again.',
                        details: { code: 'session_expired' }
                    };
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                clearTokens();
                window.location.href = '#!/login';
                throw {
                    status: 401,
                    message: 'Session expired. Please login again.',
                    details: { code: 'session_expired' }
                };
            }
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            // For validation errors (400), DRF returns field errors directly in the response
            // For other errors, check for error/message fields
            const errorMessage = data.error || data.message || data.detail || 'Request failed';
            
            throw {
                status: response.status,
                message: errorMessage,
                details: data
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
