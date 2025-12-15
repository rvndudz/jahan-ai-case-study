import { API_CONFIG, apiRequest, getTokens, setTokens, clearTokens } from './api';

// Transform backend user data to frontend format (camelCase)
const transformUserFromBackend = (backendUser) => {
    if (!backendUser) return null;
    
    return {
        id: backendUser.id,
        username: backendUser.username,
        fullName: backendUser.full_name,
        email: backendUser.email,
        country: backendUser.country,
        countryCode: backendUser.country_code,
        phone: backendUser.phone,
        dateOfBirth: backendUser.date_of_birth,
        gender: backendUser.gender,
        dateJoined: backendUser.date_joined,
        
        // Settings
        themeMode: backendUser.theme_mode,
        accentColor: backendUser.accent_color,
        fontFamily: backendUser.font_family,
        fontSize: backendUser.font_size,
        compactMode: backendUser.compact_mode,
        showTooltips: backendUser.show_tooltips,
        animations: backendUser.animations,
        emailAlerts: backendUser.email_alerts,
        pushNotifications: backendUser.push_notifications,
        smsAlerts: backendUser.sms_alerts,
        digestFrequency: backendUser.digest_frequency,
        securityAlerts: backendUser.security_alerts,
        mentions: backendUser.mentions,
        weeklySummary: backendUser.weekly_summary,
        productUpdates: backendUser.product_updates,
        dndEnabled: backendUser.dnd_enabled,
        dndStartTime: backendUser.dnd_start_time,
        dndEndTime: backendUser.dnd_end_time,
        profileSearchable: backendUser.profile_searchable,
        messagesFromAnyone: backendUser.messages_from_anyone,
        showOnlineStatus: backendUser.show_online_status,
        twoFactorEnabled: backendUser.two_factor_enabled,
        loginAlerts: backendUser.login_alerts,
        analyticsEnabled: backendUser.analytics_enabled,
        personalizedAds: backendUser.personalized_ads
    };
};

const transformUserToBackend = (frontendUser) => {
    if (!frontendUser) return null;
    
    // Format date to YYYY-MM-DD if it exists
    let dateOfBirth = frontendUser.dateOfBirth;
    if (dateOfBirth) {
        // If it's a Date object, convert to YYYY-MM-DD
        if (dateOfBirth instanceof Date) {
            const year = dateOfBirth.getFullYear();
            const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0');
            const day = String(dateOfBirth.getDate()).padStart(2, '0');
            dateOfBirth = `${year}-${month}-${day}`;
        } else if (typeof dateOfBirth === 'string') {
            // If it's already a string, parse and reformat to ensure YYYY-MM-DD
            const date = new Date(dateOfBirth);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dateOfBirth = `${year}-${month}-${day}`;
            }
        }
    }
    
    return {
        username: frontendUser.username,
        full_name: frontendUser.fullName,
        email: frontendUser.email,
        country: frontendUser.country,
        country_code: frontendUser.countryCode,
        phone: frontendUser.phone,
        date_of_birth: dateOfBirth || null,
        gender: frontendUser.gender,
        
        // Settings
        theme_mode: frontendUser.themeMode,
        accent_color: frontendUser.accentColor,
        font_family: frontendUser.fontFamily,
        font_size: frontendUser.fontSize,
        compact_mode: frontendUser.compactMode,
        show_tooltips: frontendUser.showTooltips,
        animations: frontendUser.animations,
        email_alerts: frontendUser.emailAlerts,
        push_notifications: frontendUser.pushNotifications,
        sms_alerts: frontendUser.smsAlerts,
        digest_frequency: frontendUser.digestFrequency,
        security_alerts: frontendUser.securityAlerts,
        mentions: frontendUser.mentions,
        weekly_summary: frontendUser.weeklySummary,
        product_updates: frontendUser.productUpdates,
        dnd_enabled: frontendUser.dndEnabled,
        dnd_start_time: frontendUser.dndStartTime,
        dnd_end_time: frontendUser.dndEndTime,
        profile_searchable: frontendUser.profileSearchable,
        messages_from_anyone: frontendUser.messagesFromAnyone,
        show_online_status: frontendUser.showOnlineStatus,
        two_factor_enabled: frontendUser.twoFactorEnabled,
        login_alerts: frontendUser.loginAlerts,
        analytics_enabled: frontendUser.analyticsEnabled,
        personalized_ads: frontendUser.personalizedAds
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

    /**
     * Change user password
     */
    async changePassword(oldPassword, newPassword, newPassword2) {
        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
                method: 'POST',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                    new_password2: newPassword2
                })
            });
            
            return {
                success: true,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to change password',
                details: error.details
            };
        }
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
