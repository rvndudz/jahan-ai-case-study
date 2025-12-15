import { API_CONFIG, apiRequest, getTokens, setTokens, clearTokens } from './api';

// Transform backend user data to frontend format (camelCase)
const transformUserFromBackend = (backendUser) => {
    if (!backendUser) return null;
    
    return {
        id: backendUser.id,
        fullName: backendUser.full_name,
        email: backendUser.email,
        country: backendUser.country,
        countryCode: backendUser.country_code,
        phone: backendUser.phone,
        dateOfBirth: backendUser.date_of_birth,
        gender: backendUser.gender,
        dateJoined: backendUser.date_joined
    };
};

const transformUserToBackend = (frontendUser) => {
    if (!frontendUser) return null;
    
    return {
        full_name: frontendUser.fullName,
        email: frontendUser.email,
        country: frontendUser.country,
        country_code: frontendUser.countryCode,
        phone: frontendUser.phone,
        date_of_birth: frontendUser.dateOfBirth,
        gender: frontendUser.gender
    };
};

class AuthService {
    constructor() {
        this.currentUser = null;
    }

    /**
     * Login user with email and password
     */
    async login(email, password, remember = false) {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            // Store tokens
            setTokens(response.access, response.refresh);
            
            // Store user data
            this.currentUser = transformUserFromBackend(response.user);
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            return {
                success: true,
                user: this.currentUser,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
                method: 'POST',
                body: JSON.stringify({
                    email: userData.email,
                    username: userData.username || userData.email.split('@')[0],
                    password: userData.password,
                    password2: userData.password2,
                    full_name: userData.fullName
                })
            });
            
            // Store tokens
            setTokens(response.access, response.refresh);
            
            // Store user data
            this.currentUser = transformUserFromBackend(response.user);
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            return {
                success: true,
                user: this.currentUser,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Registration failed',
                details: error.details
            };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            const tokens = getTokens();
            if (tokens.refresh) {
                await apiRequest(API_CONFIG.ENDPOINTS.LOGOUT, {
                    method: 'POST',
                    body: JSON.stringify({ refresh: tokens.refresh })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearTokens();
            this.currentUser = null;
        }
    }

    /**
     * Get current user from storage
     */
    getCurrentUser() {
        if (!this.currentUser) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                this.currentUser = JSON.parse(userStr);
            }
        }
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const tokens = getTokens();
        return !!tokens.access;
    }

    /**
     * Get user profile from server
     */
    async getProfile() {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.PROFILE, {
                method: 'GET'
            });
            
            this.currentUser = transformUserFromBackend(response.user);
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            return {
                success: true,
                user: this.currentUser
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to get profile'
            };
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userData) {
        try {
            const backendData = transformUserToBackend(userData);
            
            const response = await apiRequest(API_CONFIG.ENDPOINTS.PROFILE, {
                method: 'PUT',
                body: JSON.stringify(backendData)
            });
            
            this.currentUser = transformUserFromBackend(response.user);
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            return {
                success: true,
                user: this.currentUser,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to update profile',
                details: error.details
            };
        }
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
