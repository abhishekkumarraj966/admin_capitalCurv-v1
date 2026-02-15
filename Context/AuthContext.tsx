'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as authApi from '@/services/authApi';

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
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    isAuthenticated: boolean;
    // Password Reset & Profile
    forgotPassword: (email: string) => Promise<any>;
    verifyOtp: (email: string, otp: string) => Promise<any>;
    resetPassword: (data: any) => Promise<any>;
    changePassword: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const checkAuth = React.useCallback(async () => {
        const token = localStorage.getItem('adminAccessToken');
        const isAuthPage = pathname?.startsWith('/auth');

        if (!token) {
            setIsLoading(false);
            if (!isAuthPage) {
                router.push('/auth/signin');
            }
            return;
        }

        try {
            const response = await authApi.getAdminProfile();
            const result = response.result;
            const userData = result.admin || result;

            if (result.permissions && userData) {
                userData.permissions = result.permissions;
            }

            setUser(userData);
        } catch (error: any) {
            console.error('Failed to fetch profile:', error);

            // Try to refresh token if it was a 401
            if (error.response?.status === 401) {
                const rt = localStorage.getItem('adminRefreshToken');
                if (rt) {
                    try {
                        const refreshRes = await authApi.refreshToken(rt);
                        if (refreshRes.success && refreshRes.result?.accessToken) {
                            localStorage.setItem('adminAccessToken', refreshRes.result.accessToken);
                            // Retry profile fetch once
                            const retryRes = await authApi.getAdminProfile();
                            const retryResult = retryRes.result;
                            const retryUserData = retryResult.admin || retryResult;
                            if (retryResult.permissions && retryUserData) {
                                retryUserData.permissions = retryResult.permissions;
                            }
                            setUser(retryUserData);
                            return;
                        }
                    } catch (refreshErr) {
                        console.error('Token refresh failed:', refreshErr);
                    }
                }
            }

            // If refresh fails or not 401, logout
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
            const response = await authApi.adminLogin({ email, password });
            const { result } = response;

            if (result && result.accessToken) {
                localStorage.setItem('adminAccessToken', result.accessToken);
                if (result.refreshToken) {
                    localStorage.setItem('adminRefreshToken', result.refreshToken);
                }

                const userData = result.admin || result;
                if (result.permissions && userData) {
                    userData.permissions = result.permissions;
                }

                setUser(userData);
                router.push('/wp-admin/admin');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.adminLogout();
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            setUser(null);
            router.push('/auth/signin');
        }
    };

    const forgotPassword = async (email: string) => {
        return await authApi.forgotPassword(email);
    };

    const verifyOtp = async (email: string, otp: string) => {
        return await authApi.verifyOtp(email, otp);
    };

    const resetPassword = async (data: any) => {
        return await authApi.resetPassword(data);
    };

    const changePassword = async (data: any) => {
        return await authApi.changePassword(data);
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            checkAuth,
            isAuthenticated: !!user,
            forgotPassword,
            verifyOtp,
            resetPassword,
            changePassword
        }}>
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
