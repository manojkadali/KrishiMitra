import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const YieldPrediction = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [weather, setWeather] = useState(null);

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

    const predict = async () => {
        if (!selectedFarm) return;
        setLoading(true);
        try {
            const res = await api.post(`/api/yield/predict/${selectedFarm}`);
            setPrediction(res.data.prediction);
            setWeather(res.data.weather);
        } catch (err) {
            alert(err.response?.data?.msg || t('Error predicting yield'));
        }
        setLoading(false);
    };

    const impactIcon = (impact) => {
        if (impact === 'positive') return { icon: '✓', color: 'text-[#059669] bg-[#ecfdf5]' };
        if (impact === 'negative') return { icon: '✗', color: 'text-red-600 bg-red-50' };
        return { icon: '—', color: 'text-[#4b6360] bg-gray-50' };
    };

    return (
        <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">{t('Yield & Harvest Prediction')}</h1>
                    <p className="page-subtitle">{t('Estimate expected yield and optimal harvest window for your crops')}</p>
                </div>

                {/* Farm Selection */}
                <div className="glass-card rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                            <option value="">{t('Select a farm...')}</option>
                            {farms.map(f => (
                                <option key={f.id} value={f.id}>{f.farm_name} — {f.current_crop} ({f.area_acres} acres)</option>
                            ))}
                        </select>
                        <button onClick={predict} disabled={loading || !selectedFarm}
                            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors">
                            {loading ? t('Calculating...') : t('Predict Yield')}
                        </button>
                    </div>
                </div>

                {prediction && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Prediction */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Yield Card */}
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-[#1a2e2a]">{t('Predicted Yield')}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        prediction.confidence === 'High' ? 'bg-[#d1fae5] text-[#065f46]' :
                                        prediction.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {prediction.confidence === 'High' ? t('High Confidence') : prediction.confidence === 'Medium' ? t('Medium Confidence') : prediction.confidence + ' ' + t('Confidence')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center bg-[#ecfdf5] rounded-xl p-4">
                                        <p className="text-2xl font-bold text-[#065f46]">{prediction.predicted_yield_kg.toLocaleString()}</p>
                                        <p className="text-xs text-[#6b7280] mt-1">{t('Total Yield')} ({prediction.unit})</p>
                                    </div>
                                    <div className="text-center bg-blue-50 rounded-xl p-4">
                                        <p className="text-2xl font-bold text-blue-700">{prediction.yield_per_acre.toLocaleString()}</p>
                                        <p className="text-xs text-[#6b7280] mt-1">{prediction.unit}/Acre</p>
                                    </div>
                                    <div className="text-center bg-purple-50 rounded-xl p-4">
                                        <p className="text-2xl font-bold text-purple-700">{prediction.yield_percentage}%</p>
                                        <p className="text-xs text-[#6b7280] mt-1">{t('Of Optimal')}</p>
                                    </div>
                                    <div className="text-center bg-amber-50 rounded-xl p-4">
                                        <p className="text-2xl font-bold text-amber-700">{prediction.area_acres}</p>
                                        <p className="text-xs text-[#6b7280] mt-1">{t('Acres')}</p>
                                    </div>
                                </div>

                                {/* Yield Bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-xs text-[#6b7280] mb-1">
                                        <span>{t('Minimum')}</span>
                                        <span>{t('Your Prediction')}</span>
                                        <span>{t('Optimal')} ({prediction.optimal_yield_per_acre.toLocaleString()} {prediction.unit}/{t('Acres').toLowerCase()})</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-4 relative">
                                        <div className={`h-4 rounded-full transition-all ${
                                            prediction.yield_percentage >= 85 ? 'bg-[#ecfdf5]0' :
                                            prediction.yield_percentage >= 65 ? 'bg-yellow-500' : 'bg-red-400'
                                        }`} style={{ width: `${Math.min(prediction.yield_percentage, 100)}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Factors Analysis */}
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4">{t('Yield Impact Factors')}</h3>
                                <div className="space-y-3">
                                    {prediction.factors.map((f, idx) => {
                                        const { icon, color } = impactIcon(f.impact);
                                        return (
                                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
                                                    {icon}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-[#1a2e2a]">{f.factor}</p>
                                                    <p className="text-xs text-[#6b7280] mt-0.5">{f.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Harvest Window */}
                            {prediction.harvest_window_start && (
                                <div className="glass-card rounded-2xl border border-[#d1fae5] p-5">
                                    <h3 className="text-sm font-semibold text-[#065f46] mb-3">{t('Harvest Window')}</h3>
                                    <div className="bg-[#ecfdf5] rounded-lg p-4 text-center mb-3">
                                        <p className="text-sm text-[#4b6360]">{t('Expected between')}</p>
                                        <p className="text-base font-bold text-[#065f46] mt-1">
                                            {new Date(prediction.harvest_window_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            {' — '}
                                            {new Date(prediction.harvest_window_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <p className="text-xs text-[#6b7280] text-center">Typical harvest period: {prediction.harvest_days} {t('days')} from sowing</p>
                                </div>
                            )}

                            {/* Crop Info */}
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-3">{t('Crop Details')}</h3>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Crop', value: prediction.crop },
                                        { label: 'Area', value: `${prediction.area_acres} acres` },
                                        { label: t('Optimal Yield'), value: `${prediction.optimal_yield_per_acre.toLocaleString()} ${prediction.unit}/acre` },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-[#6b7280]">{item.label}</span>
                                            <span className="font-medium">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weather */}
                            {weather && (
                                <div className="glass-card rounded-2xl p-5">
                                    <h3 className="text-sm font-semibold text-[#374151] mb-3">Current Weather</h3>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-orange-50 rounded-lg p-2">
                                            <p className="text-lg font-bold text-orange-600">{weather.temperature}°</p>
                                            <p className="text-xs text-[#6b7280]">Temp</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-2">
                                            <p className="text-lg font-bold text-blue-600">{weather.humidity}%</p>
                                            <p className="text-xs text-[#6b7280]">Humidity</p>
                                        </div>
                                        <div className="bg-cyan-50 rounded-lg p-2">
                                            <p className="text-lg font-bold text-cyan-600">{weather.forecastRainfall || 0}mm</p>
                                            <p className="text-xs text-[#6b7280]">Rain</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!prediction && !loading && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <p className="text-[#6b7280] text-sm">{t('yield_empty')}</p>
                    </div>
                )}
            </div>
        );
};

export default YieldPrediction;
