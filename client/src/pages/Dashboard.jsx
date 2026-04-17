import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GovernmentSchemes from '../components/GovernmentSchemes';

const featureCards = [
    {
        title: 'Crop & Fertilizer Advisory',
        descKey: 'advisory_desc',
        path: '/advisory',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        accent: 'border-l-green-600',
        iconBg: 'bg-[#ecfdf5] text-[#065f46]',
    },
    {
        title: 'Crop Recommendation',
        descKey: 'crop_rec_desc',
        path: '/crop-recommend',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
        accent: 'border-l-emerald-600',
        iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
        title: 'Plant Disease Detection',
        descKey: 'disease_det_desc',
        path: '/disease-detection',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        accent: 'border-l-blue-600',
        iconBg: 'bg-blue-50 text-blue-700',
    },
    {
        title: 'Pest & Disease Alerts',
        descKey: 'pest_alert_desc',
        path: '/pest-alerts',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        accent: 'border-l-orange-600',
        iconBg: 'bg-orange-50 text-orange-700',
    },
    {
        title: 'Irrigation Scheduler',
        descKey: 'irrigation_desc',
        path: '/irrigation',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
        ),
        accent: 'border-l-cyan-600',
        iconBg: 'bg-cyan-50 text-cyan-700',
    },
    {
        title: 'Yield Prediction',
        descKey: 'yield_desc',
        path: '/yield-prediction',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        accent: 'border-l-purple-600',
        iconBg: 'bg-purple-50 text-purple-700',
    },
    {
        title: 'Market Prices',
        descKey: 'market_desc',
        path: '/market-prices',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        accent: 'border-l-amber-600',
        iconBg: 'bg-amber-50 text-amber-700',
    },
    {
        title: 'Price Forecast',
        descKey: 'forecast_desc',
        path: '/price-forecast',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        accent: 'border-l-yellow-600',
        iconBg: 'bg-yellow-50 text-yellow-700',
    },
    {
        title: 'Farm Map',
        descKey: 'map_desc',
        path: '/farm-map',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        accent: 'border-l-teal-600',
        iconBg: 'bg-teal-50 text-teal-700',
    },
    {
        title: 'Reports & Export',
        descKey: 'report_desc',
        path: '/reports',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        accent: 'border-l-indigo-600',
        iconBg: 'bg-indigo-50 text-indigo-700',
    },
    {
        title: 'Soil Test Labs',
        descKey: 'soil_lab_desc',
        path: '/soil-labs',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        ),
        accent: 'border-l-pink-600',
        iconBg: 'bg-pink-50 text-pink-700',
    },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return t('Good morning');
        if (h < 17) return t('Good afternoon');
        return t('Good evening');
    };

    return (
        <div className="page-content">

                {/* Welcome Banner */}
                <div className="mb-8 flex items-start justify-between animate-fade-in-down">
                    <div>
                        <h1 className="page-title">
                            {getGreeting()}, {user.name || t('Farmer')}
                        </h1>
                        <p className="page-subtitle mt-1">{today}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-[#059669] bg-[#ecfdf5] border border-[#d1fae5] rounded-xl px-4 py-2 font-semibold animate-scale-in">
                        <span className="w-2 h-2 bg-[#059669] rounded-full animate-pulse"></span>
                        {t('All services operational')}
                    </div>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {featureCards.map((card, i) => (
                        <Link
                            key={card.title}
                            to={card.path}
                            className={`glass-card card-shine border-l-4 ${card.accent} rounded-2xl p-5 hover:-translate-y-1.5 transition-all duration-300 group animate-fade-in stagger-${Math.min(i + 1, 11)}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 ${card.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                                {card.icon}
                            </div>
                            <h3 className="text-sm font-bold text-[#1a2e2a] mb-1.5 group-hover:text-[#059669] transition-colors">
                                {t(card.title)}
                            </h3>
                            <p className="text-xs text-[#4b6360] leading-relaxed">
                                {t(card.descKey)}
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Main Content: Info & Tips */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GovernmentSchemes />

                    {/* Quick Tips */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-[#ecfdf5] text-[#065f46] rounded-full flex items-center justify-center border border-[#d1fae5]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-[#1a2e2a]">{t('Seasonal Farming Tips')}</h3>
                        </div>
                        <ul className="space-y-4 flex-1">
                            {[
                                { title: 'Soil Testing', textKey: 'soil_testing_tip' },
                                { title: 'Disease Prevention', textKey: 'disease_prevention_tip' },
                                { title: 'Market Research', textKey: 'market_research_tip' },
                                { title: 'Record Keeping', textKey: 'record_keeping_tip' },
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f0f4f3] transition-colors border border-transparent hover:border-[#e5e7eb]">
                                    <span className="text-[#059669] mt-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-[#1a2e2a]">{t(tip.title)}</p>
                                        <p className="text-sm text-[#4b6360] mt-0.5">{t(tip.textKey)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
};

export default Dashboard;
