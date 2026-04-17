import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const navSections = [
    {
        title: 'Overview',
        links: [
            { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { path: '/farms', label: 'My Farms', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ],
    },
    {
        title: 'Crop Intelligence',
        links: [
            { path: '/advisory', label: 'Crop Advisory', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { path: '/crop-recommend', label: 'Crop Recommendation', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { path: '/disease-detection', label: 'Disease Detection', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { path: '/pest-alerts', label: 'Pest Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        ],
    },
    {
        title: 'Farm Management',
        links: [
            { path: '/irrigation', label: 'Irrigation Scheduler', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707' },
            { path: '/yield-prediction', label: 'Yield Prediction', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { path: '/farm-map', label: 'Farm Map', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
        ],
    },
    {
        title: 'Market & Finance',
        links: [
            { path: '/market-prices', label: 'Market Prices', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { path: '/price-forecast', label: 'Price Forecast', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        ],
    },
    {
        title: 'Tools',
        links: [
            { path: '/soil-labs', label: 'Soil Test Labs', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
            { path: '/disease-history', label: 'Disease History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { path: '/reports', label: 'Reports & Export', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { path: '/roadmap', label: 'Roadmap & Vision', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
        ],
    },
];

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [mobileOpen, setMobileOpen] = useState(false);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* ── Top Header Bar ──────────────────────────────────── */}
            <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-lg border-b border-[#d4ddd9] flex items-center px-4 lg:px-8">
                {/* Mobile hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 text-[#4b6360]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileOpen
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        }
                    </svg>
                </button>

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2.5 mr-auto group">
                    <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                        <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div className="hidden sm:block">
                        <span className="font-bold text-[#065f46] text-base tracking-tight">KrishiMitra</span>
                        <span className="block text-[10px] text-[#4b6360] -mt-0.5 font-medium">{t('Smart Farming Platform')}</span>
                    </div>
                </Link>

                {/* Right controls */}
                <div className="flex items-center gap-3">
                    <select
                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                        value={i18n.language}
                        className="bg-[#f0f4f3] text-[#065f46] text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#d4ddd9] outline-none cursor-pointer hover:border-[#059669] transition-colors"
                    >
                        <option value="en">EN</option>
                        <option value="hi">HI</option>
                        <option value="te">TE</option>
                    </select>

                    {user.name && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#f0f4f3] rounded-lg">
                            <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-medium text-[#1a2e2a]">{user.name}</span>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('Logout')}
                    </button>
                </div>
            </header>

            {/* ── Desktop Sidebar ─────────────────────────────────── */}
            <aside className="hidden lg:flex fixed top-16 left-0 bottom-0 w-[260px] bg-white border-r border-[#d4ddd9] flex-col z-40 overflow-y-auto">
                <nav className="flex-1 py-4 px-3 space-y-5">
                    {navSections.map((section) => (
                        <div key={section.title}>
                            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9ba8a3]">
                                {t(section.title)}
                            </p>
                            <div className="space-y-0.5">
                                {section.links.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group relative ${
                                            isActive(link.path)
                                                ? 'bg-[#ecfdf5] text-[#065f46] shadow-sm nav-link-active'
                                                : 'text-[#4b6360] hover:bg-[#f0f4f3] hover:text-[#065f46] hover:translate-x-0.5'
                                        }`}
                                    >
                                        <svg className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isActive(link.path) ? 'text-[#059669] scale-110' : 'text-[#9ba8a3] group-hover:text-[#059669] group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={link.icon} />
                                        </svg>
                                        {t(link.label, link.label)}
                                        {isActive(link.path) && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#059669] pulse-dot" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-[#d4ddd9]">
                    <div className="bg-gradient-to-br from-[#ecfdf5] to-[#d1fae5] rounded-xl p-3.5 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-default">
                        <p className="text-[11px] font-bold text-[#065f46] mb-1">{t('Need Help?')}</p>
                        <p className="text-[10px] text-[#4b6360] leading-relaxed">{t('Check our farming tips on the dashboard for seasonal guidance.')}</p>
                    </div>
                </div>
            </aside>

            {/* ── Mobile Overlay ──────────────────────────────────── */}
            {mobileOpen && (
                <>
                    <div className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 overflow-y-auto shadow-2xl animate-slide-in">
                        <div className="flex items-center justify-between p-4 border-b border-[#d4ddd9]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <span className="font-bold text-[#065f46]">KrishiMitra</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="py-3 px-3 space-y-4">
                            {navSections.map((section) => (
                                <div key={section.title}>
                                    <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9ba8a3]">
                                        {t(section.title)}
                                    </p>
                                    {section.links.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                isActive(link.path)
                                                    ? 'bg-[#ecfdf5] text-[#065f46]'
                                                    : 'text-[#4b6360] hover:bg-[#f0f4f3]'
                                            }`}
                                        >
                                            <svg className={`w-4 h-4 ${isActive(link.path) ? 'text-[#059669]' : 'text-[#9ba8a3]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={link.icon} />
                                            </svg>
                                            {t(link.label, link.label)}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </nav>
                    </aside>
                </>
            )}
        </>
    );
};

export default Navbar;
