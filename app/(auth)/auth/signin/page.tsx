'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useAuth } from '@/Context/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
    otp: z.string().length(5, 'OTP must be 5 digits'),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignInFormData = z.infer<typeof signInSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type ViewMode = 'login' | 'forgot-password' | 'verify-otp' | 'reset-password';

export default function SigninPage() {
    const router = useRouter();
    const { login, isAuthenticated, forgotPassword, verifyOtp, resetPassword } = useAuth();

    const [view, setView] = useState<ViewMode>('login');
    const [emailForReset, setEmailForReset] = useState('');
    const [securityToken, setSecurityToken] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const loginForm = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });
    const forgotForm = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });
    const verifyForm = useForm<VerifyOtpFormData>({ resolver: zodResolver(verifyOtpSchema) });
    const resetForm = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

    const onLoginSubmit = async (data: SignInFormData) => {
        setError(null);
        setLoading(true);
        try {
            await login(data.email, data.password);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const onForgotSubmit = async (data: ForgotPasswordFormData) => {
        setError(null);
        setLoading(true);
        try {
            const res = await forgotPassword(data.email);
            if (res.success) {
                setEmailForReset(data.email);
                setSuccessMessage(res.message || 'OTP sent to your email');
                setView('verify-otp');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const onVerifySubmit = async (data: VerifyOtpFormData) => {
        setError(null);
        setLoading(true);
        try {
            const res = await verifyOtp(emailForReset, data.otp);
            if (res.success && res.result?.securityToken) {
                setSecurityToken(res.result.securityToken);
                setSuccessMessage('OTP verified successfully');
                setView('reset-password');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const onResetSubmit = async (data: ResetPasswordFormData) => {
        setError(null);
        setLoading(true);
        try {
            const res = await resetPassword({
                email: emailForReset,
                securityToken,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });
            if (res.success) {
                setSuccessMessage('Password reset successful. You can now login.');
                setView('login');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && view === 'login') {
            router.push('/wp-admin/admin');
        }
    }, [isAuthenticated, router, view]);

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-black overflow-hidden relative font-sans">
            {/* Left Side - Hero / Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-16 overflow-hidden"
                style={{ background: 'linear-gradient(264.84deg, #037260 6.78%, #036958 24.2%, #024C40 55.04%, #023B32 91.68%)' }}>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg w-full">
                    <div className="mb-10 p-6 bg-white/10 w-fit rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl transform transition-transform hover:scale-105 duration-500">
                        <Image src="/assets/img/auth/Logo.png" alt="Logo" width={120} height={120} className="object-contain drop-shadow-lg" priority />
                    </div>
                    <h1 className="text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-sm">
                        Welcome <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">Admin</span>
                    </h1>
                    <p className="text-lg text-emerald-50 mb-10 leading-relaxed font-light opacity-90">
                        Securely manage your platform with advanced analytical tools and administrative controls.
                    </p>

                    <div className="grid grid-cols-2 gap-6 text-sm font-medium text-emerald-50/90">
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <span>Analytics</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <span>Users</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Forms */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-gray-50/50 dark:bg-black">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    <div className="lg:hidden flex justify-center mb-8">
                        <Image src="/assets/img/auth/Logo.png" alt="Logo" width={80} height={80} className="object-contain drop-shadow-md" />
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {view === 'login' && 'Sign In'}
                            {view === 'forgot-password' && 'Reset Password'}
                            {view === 'verify-otp' && 'Verify OTP'}
                            {view === 'reset-password' && 'New Password'}
                        </h2>
                        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                            {view === 'login' && 'Welcome back! Please enter your details.'}
                            {view === 'forgot-password' && 'Enter your email to receive a reset OTP.'}
                            {view === 'verify-otp' && `OTP sent to ${emailForReset}`}
                            {view === 'reset-password' && 'Create a strong new password for your account.'}
                        </p>
                    </div>

                    {/* Login View */}
                    {view === 'login' && (
                        <form className="mt-10 space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                                        </div>
                                        <input
                                            type="email"
                                            className={`block w-full pl-11 pr-4 py-3.5 border ${loginForm.formState.errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-800'} rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
                                            placeholder="admin@example.com"
                                            {...loginForm.register('email')}
                                        />
                                    </div>
                                    {loginForm.formState.errors.email && <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className={`block w-full pl-11 pr-12 py-3.5 border ${loginForm.formState.errors.password ? 'border-red-300' : 'border-gray-200 dark:border-gray-800'} rounded-xl bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white transition-all`}
                                            placeholder="••••••••"
                                            {...loginForm.register('password')}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-emerald-600 transition-colors">
                                            {showPassword ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input type="checkbox" className="h-4 w-4 text-emerald-600 border-gray-300 rounded mr-2" />
                                    Remember me
                                </label>
                                <button type="button" onClick={() => setView('forgot-password')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">Forgot password?</button>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2">
                                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {/* Forgot Password View */}
                    {view === 'forgot-password' && (
                        <form className="mt-10 space-y-6" onSubmit={forgotForm.handleSubmit(onForgotSubmit)}>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className={`block w-full px-4 py-3.5 border ${forgotForm.formState.errors.email ? 'border-red-300' : 'border-gray-200 dark:border-gray-800'} rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all`}
                                    placeholder="Enter your registered email"
                                    {...forgotForm.register('email')}
                                />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2">
                                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
                            </button>

                            <button type="button" onClick={() => setView('login')} className="w-full text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">Back to Login</button>
                        </form>
                    )}

                    {/* Verify OTP View */}
                    {view === 'verify-otp' && (
                        <form className="mt-10 space-y-6" onSubmit={verifyForm.handleSubmit(onVerifySubmit)}>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">5-Digit OTP Code</label>
                                <input
                                    type="text"
                                    maxLength={5}
                                    className={`block w-full px-4 py-3.5 border text-center text-2xl tracking-[1em] font-mono ${verifyForm.formState.errors.otp ? 'border-red-300' : 'border-gray-200 dark:border-gray-800'} rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all`}
                                    placeholder="00000"
                                    {...verifyForm.register('otp')}
                                />
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2">
                                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify OTP'}
                            </button>

                            <button type="button" onClick={() => setView('forgot-password')} className="w-full text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">Resend OTP</button>
                        </form>
                    )}

                    {/* Reset Password View */}
                    {view === 'reset-password' && (
                        <form className="mt-10 space-y-6" onSubmit={resetForm.handleSubmit(onResetSubmit)}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        className="block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                                        placeholder="Min. 6 characters"
                                        {...resetForm.register('newPassword')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="block w-full px-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                                        placeholder="Repeat new password"
                                        {...resetForm.register('confirmPassword')}
                                    />
                                    {resetForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2">
                                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Messages */}
                    {error && (
                        <div className="text-red-500 dark:text-red-400 text-sm flex items-center bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20 animate-in fade-in slide-in-from-top-2">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}
                    {successMessage && !error && (
                        <div className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 animate-in fade-in slide-in-from-top-2">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {successMessage}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">Protected by Admin Security Layer</p>
                    </div>
                </div>

                <div className="absolute bottom-6 text-center w-full text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} Capital Curv Admin.
                </div>
            </div>
        </div>
    );
}