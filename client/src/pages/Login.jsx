import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        alert('Google Sign-In is coming soon. The backend OAuth endpoint will be connected here.');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel — hero branding */}
            <div className="hidden lg:flex lg:w-[55%] gradient-hero flex-col justify-between p-14 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full animate-float" />
                <div className="absolute -bottom-32 -left-16 w-64 h-64 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-14 animate-fade-in">
                        <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 animate-glow">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-white font-extrabold text-2xl tracking-tight">KrishiMitra</span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-white leading-tight mb-5 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        {t('Smart farming starts here.')}
                    </h2>
                    <p className="text-emerald-200/90 text-lg leading-relaxed max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {t('login_desc')}
                    </p>
                </div>

                <div className="relative z-10 space-y-3.5">
                    {[
                        { label: t('Crop & Fertilizer Advisory'), desc: t('NPK, pH & weather-based precision guidance') },
                        { label: t('AI Disease Detection'), desc: t('Instant leaf image analysis with treatment plans') },
                        { label: t('Live Market Prices'), desc: t('Agmarknet data across 7,000+ Indian mandis') },
                    ].map((item, idx) => (
                        <div key={item.label} className="flex items-center gap-3.5 bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 animate-slide-in-right" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                            <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">{item.label}</p>
                                <p className="text-emerald-300/70 text-xs">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — login form */}
            <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 bg-[#f0f4f3]">
                <div className="w-full max-w-[380px] animate-fade-in-up">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2.5 mb-10 lg:hidden">
                        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-[#065f46] text-xl tracking-tight">KrishiMitra</span>
                    </div>

                    <h1 className="text-[28px] font-extrabold text-[#1a2e2a] mb-1.5 tracking-tight">{t('Welcome back')}</h1>
                    <p className="text-sm text-[#4b6360] mb-8">
                        {t("Don't have an account?")}{' '}
                        <Link to="/register" className="text-[#059669] font-semibold hover:text-[#065f46] transition-colors">
                            {t('Create one free')}
                        </Link>
                    </p>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-1.5 border-[#d4ddd9] rounded-xl bg-white hover:bg-[#f8faf9] text-[#1a2e2a] font-semibold text-sm transition-all shadow-sm hover:shadow mb-6"
                    >
                        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#d4ddd9]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-[#f0f4f3] text-[#9ba8a3] font-medium">{t('or sign in with email')}</span>
                        </div>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-[#4b6360] mb-2 uppercase tracking-wider">{t('Email')}</label>
                            <input
                                name="email" type="email" required
                                value={email} onChange={onChange}
                                className="input-field"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#4b6360] mb-2 uppercase tracking-wider">{t('Password')}</label>
                            <input
                                name="password" type="password" required
                                value={password} onChange={onChange}
                                className="input-field"
                                placeholder="Enter your password"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-shake">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-[15px]"
                        >
                            {loading ? t('Signing in...') : t('Sign In')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
