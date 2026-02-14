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

type SignInFormData = z.infer<typeof signInSchema>;

export default function SigninPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInFormData) => {
        setError(null);
        setLoading(true);

        try {
            await login(data.email, data.password);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) { // Keeping as any for now to avoid extensive type casting for axios error structure
            console.error('Login error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/wp-admin/admin');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-black overflow-hidden relative font-sans">
            {/* Left Side - Hero / Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-16 overflow-hidden"
                style={{ background: 'linear-gradient(264.84deg, #037260 6.78%, #036958 24.2%, #024C40 55.04%, #023B32 91.68%)' }}>

                {/* Decorative Background Elements - Subtle Animation */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg w-full">
                    <div className="mb-10 p-6 bg-white/10 w-fit rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl transform transition-transform hover:scale-105 duration-500">
                        <Image
                            src="/assets/img/auth/Logo.png"
                            alt="Logo"
                            width={120}
                            height={120}
                            className="object-contain drop-shadow-lg"
                            priority
                        />
                    </div>
                    <h1 className="text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-sm">
                        Welcome <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">Back!</span>
                    </h1>
                    <p className="text-lg text-emerald-50 mb-10 leading-relaxed font-light opacity-90">
                        Empower your business with our advanced admin dashboard. Manage, monitor, and scale with confidence.
                    </p>

                    <div className="grid grid-cols-2 gap-6 text-sm font-medium text-emerald-50/90">
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <span>Real-time Analytics</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <span>User Management</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <span>Secure Access</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative bg-gray-50/50 dark:bg-black">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                    {/* Logo for Mobile/Tablet (Visible only on smaller screens) */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Image
                            src="/assets/img/auth/Logo.png"
                            alt="Logo"
                            width={80}
                            height={80}
                            className="object-contain drop-shadow-md"
                        />
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">Sign In</h2>
                        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    <form className="mt-10 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        className={`block w-full pl-11 pr-4 py-3.5 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 dark:border-gray-800 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-900'} rounded-xl focus:outline-none focus:ring-2 sm:text-sm dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-700`}
                                        placeholder="Enter your email"
                                        {...register('email')}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        className={`block w-full pl-11 pr-12 py-3.5 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-gray-200 dark:border-gray-800 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-900'} rounded-xl focus:outline-none focus:ring-2 sm:text-sm dark:text-white transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-700`}
                                        placeholder="••••••••"
                                        {...register('password')}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-emerald-600 focus:outline-none transition-colors p-1"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer transition-colors"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 dark:text-red-400 text-sm flex items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-pulse">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center text-base">
                                        Sign In
                                        <svg className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 dark:bg-black text-gray-500 dark:text-gray-500 rounded-full">
                                    Protected by Administrative Security
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 text-center w-full text-xs text-gray-400 dark:text-gray-600">
                    &copy; {new Date().getFullYear()} Admin Dashboard. All rights reserved.
                </div>
            </div>
        </div>
    );
}