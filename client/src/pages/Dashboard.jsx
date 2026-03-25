import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SimplifiedAdvisory from './SimplifiedAdvisory';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-green-700 p-4 shadow-md text-white flex justify-between items-center overflow-x-auto gap-4">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-extrabold tracking-wide hidden sm:block">KrishiMitra </h1>
                    <Link to="/market-prices" className="font-semibold hover:underline bg-green-800 px-3 py-1 rounded">{t('Market Prices')}</Link>
                    <Link to="/disease-detection" className="font-semibold hover:underline bg-green-800 px-3 py-1 rounded">{t('Disease Detection')}</Link>
                </div>
                <div className="flex items-center gap-4">
                    <select onChange={changeLanguage} value={i18n.language} className="bg-white text-gray-900 text-sm rounded p-1">
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="te">తెలుగు</option>
                    </select>
                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-2 flex rounded font-bold transition">
                        {t('Logout')}
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <SimplifiedAdvisory />
            </main>
        </div>
    );
};

export default Dashboard;
