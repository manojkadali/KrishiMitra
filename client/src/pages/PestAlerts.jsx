import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const PestAlerts = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [farmCount, setFarmCount] = useState(0);
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('all');
    const [filter, setFilter] = useState('all'); // all, CRITICAL, HIGH, MEDIUM

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
        fetchFarms();
    }, [navigate]);

    const fetchFarms = async () => {
        try {
            const res = await api.get('/api/farms');
            setFarms(res.data);
        } catch { /* ignore */ }
    };

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            let res;
            if (selectedFarm === 'all') {
                res = await api.get('/api/pest-alerts/all');
                setAlerts(res.data.alerts);
                setFarmCount(res.data.farmCount);
            } else {
                res = await api.get(`/api/pest-alerts/farm/${selectedFarm}`);
                setAlerts(res.data.alerts);
                setFarmCount(1);
            }
        } catch (err) {
            alert(err.response?.data?.msg || t('Error fetching alerts'));
        }
        setLoading(false);
    };

    const severityConfig = {
        CRITICAL: { color: 'bg-red-50 border-red-300 text-red-800', badge: 'bg-red-100 text-red-700', icon: '🚨' },
        HIGH: { color: 'bg-orange-50 border-orange-300 text-orange-800', badge: 'bg-orange-100 text-orange-700', icon: '⚠️' },
        MEDIUM: { color: 'bg-yellow-50 border-yellow-300 text-yellow-800', badge: 'bg-yellow-100 text-yellow-700', icon: '🔔' },
        LOW: { color: 'bg-blue-50 border-blue-300 text-blue-800', badge: 'bg-blue-100 text-blue-700', icon: 'ℹ️' },
    };

    const typeConfig = {
        fungal: { label: t('Fungal'), color: 'bg-purple-100 text-purple-700' },
        bacterial: { label: t('Bacterial'), color: 'bg-red-100 text-red-700' },
        viral: { label: t('Viral'), color: 'bg-pink-100 text-pink-700' },
        pest: { label: t('Pest'), color: 'bg-orange-100 text-orange-700' },
        abiotic: { label: t('Abiotic'), color: 'bg-gray-100 text-[#374151]' },
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

    const countBySeverity = (sev) => alerts.filter(a => a.severity === sev).length;

    return (
        <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">{t('Pest & Disease Alerts')}</h1>
                    <p className="page-subtitle">{t('Proactive weather-based warnings for your crops')}</p>
                </div>

                {/* Controls */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                            <option value="all">{t('All My Farms')}</option>
                            {farms.map(f => (
                                <option key={f.id} value={f.id}>{f.farm_name} — {f.current_crop}</option>
                            ))}
                        </select>
                        <button onClick={fetchAlerts} disabled={loading}
                            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-500 disabled:opacity-50 transition-colors">
                            {loading ? t('Scanning...') : t('Scan for Alerts')}
                        </button>
                    </div>
                </div>

                {alerts.length > 0 && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            {[
                                { sev: 'CRITICAL', label: t('Critical'), color: 'bg-red-50 border-red-200 text-red-700' },
                                { sev: 'HIGH', label: t('High'), color: 'bg-orange-50 border-orange-200 text-orange-700' },
                                { sev: 'MEDIUM', label: t('Medium'), color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                                { sev: 'LOW', label: t('Low'), color: 'bg-blue-50 border-blue-200 text-blue-700' },
                            ].map(s => (
                                <button key={s.sev} onClick={() => setFilter(filter === s.sev ? 'all' : s.sev)}
                                    className={`border rounded-xl p-4 text-center transition-all ${s.color} ${filter === s.sev ? 'ring-2 ring-offset-1' : ''}`}>
                                    <p className="text-2xl font-bold">{countBySeverity(s.sev)}</p>
                                    <p className="text-xs font-medium">{s.label}</p>
                                </button>
                            ))}
                        </div>

                        {/* Alerts List */}
                        <div className="space-y-3">
                            {filteredAlerts.map((alert, idx) => {
                                const sev = severityConfig[alert.severity] || severityConfig.MEDIUM;
                                const type = typeConfig[alert.alert_type] || typeConfig.abiotic;
                                return (
                                    <div key={idx} className={`border rounded-xl p-5 ${sev.color}`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{sev.icon}</span>
                                                <div>
                                                    <h4 className="text-sm font-semibold">{alert.pest_disease}</h4>
                                                    {alert.farm_name && <p className="text-xs opacity-75">{t('Farm')}: {alert.farm_name}</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.color}`}>{type.label}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sev.badge}`}>{alert.severity}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed">{alert.message}</p>
                                        {alert.weather_snapshot && (
                                            <div className="flex gap-4 mt-3 text-xs opacity-75">
                                                <span>Temp: {alert.weather_snapshot.temperature}°C</span>
                                                <span>Humidity: {alert.weather_snapshot.humidity}%</span>
                                                <span>Rain: {alert.weather_snapshot.rainfall}mm</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {!loading && alerts.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <p className="text-[#6b7280] text-sm">{t('scan_empty')}</p>
                    </div>
                )}
            </div>
    );
};

export default PestAlerts;
