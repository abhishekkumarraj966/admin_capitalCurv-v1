'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

const API_URL = 'https://curv-backend-new.onrender.com/api/v1';

interface Permissions {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    block?: boolean;
}

interface UserPermissions {
    userManagement?: Permissions;
    adminManagement?: Permissions;
    collegeManagement?: Permissions;
    accountTypeManagement?: Permissions;
    addOns?: Permissions;
    stages?: Permissions;
    ringtoneManagement?: Permissions;
    courseManagement?: Permissions;
    influencerManagement?: Permissions;
    tradingRuleManagement?: Permissions;
    faqManagement?: Permissions;
    blogManagement?: Permissions;
    transactionManagement?: Permissions;
    kycManagement?: Permissions;
    supportManagement?: Permissions;
    [key: string]: Permissions | undefined;
}

interface User {
    _id: string;
    email: string;
    adminName: string;
    isSuperAdmin?: boolean;
    role?: string;
    permissions?: UserPermissions;
    status?: string;
    accountBalance?: number;
    lastLogin?: string;
    // Add other user properties as needed
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Helper to get headers with token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminAccessToken');
        console.log('Using token for headers:', token); // Debug log
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
            },
        };
    };

    const checkAuth = React.useCallback(async () => {
        const token = localStorage.getItem('adminAccessToken');
        const isAuthPage = pathname?.startsWith('/auth');

        console.log('checkAuth running. Token present:', !!token, 'Path:', pathname);

        if (!token) {
            setIsLoading(false);
            if (!isAuthPage) {
                router.push('/auth/signin');
            }
            return;
        }

        try {
            console.log('Fetching profile from:', `${API_URL}/admin/profile`);
            const response = await axios.get(`${API_URL}/admin/profile`, getAuthHeaders());

            // Based on login response structure: { result: { admin: ... } } or { result: ... }
            const result = response.data.result;
            const userData = result.admin || result;

            // Should merge permissions if they are separate in result
            if (result.permissions && userData) {
                userData.permissions = result.permissions;
            }

            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error status:', err.response.status);
            }
            // If profile fetch fails (likely 401), clear auth and redirect
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            setUser(null);
            if (!isAuthPage) {
                router.push('/auth/signin');
            }
        } finally {
            setIsLoading(false);
        }
    }, [pathname, router]);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/admin/login`, {
                email,
                password,
            });

            const { result } = response.data;

            if (result && result.accessToken) {
                localStorage.setItem('adminAccessToken', result.accessToken);
                if (result.refreshToken) {
                    localStorage.setItem('adminRefreshToken', result.refreshToken);
                }

                if (result.admin) {
                    setUser(result.admin);
                } else {
                    await checkAuth();
                }

                router.push('/wp-admin/admin');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw to be handled by the UI (e.g., show error message)
        }
    };

    const logout = async () => {
        try {
            // Attempt to call logout endpoint
            await axios.post(`${API_URL}/admin/logout`, {}, getAuthHeaders());
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            // Always clear local state
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            setUser(null);
            router.push('/auth/signin');
        }
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
