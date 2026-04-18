import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const CropRecommendation = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [tab, setTab] = useState('manual'); // 'manual' | 'farm'
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [inputs, setInputs] = useState({
        nitrogen: '', phosphorous: '', potassium: '',
        temperature: '', humidity: '', ph: '', rainfall: '', soil_type: '',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
        fetchFarms();
    }, [navigate]);

    const fetchFarms = async () => {
        try {
            const res = await api.get('/api/farms');
            setFarms(res.data);
        } catch { /* ignore */ }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/crop-recommend', {
                ...inputs,
                nitrogen: Number(inputs.nitrogen), phosphorous: Number(inputs.phosphorous),
                potassium: Number(inputs.potassium), temperature: Number(inputs.temperature),
                humidity: Number(inputs.humidity), ph: Number(inputs.ph), rainfall: Number(inputs.rainfall),
            });
            setResults(res.data.recommendations);
        } catch (err) {
            alert(err.response?.data?.msg || t('Error getting recommendations'));
        }
        setLoading(false);
    };

    const handleFarmSubmit = async () => {
        if (!selectedFarm) return alert(t('Select a farm first'));
        setLoading(true);
        try {
            const res = await api.post(`/api/crop-recommend/from-farm/${selectedFarm}`);
            setResults(res.data.recommendations);
        } catch (err) {
            alert(err.response?.data?.msg || t('Error getting recommendations'));
        }
        setLoading(false);
    };

    const getMatchColor = (percent) => {
        if (percent >= 80) return 'text-[#065f46] bg-[#ecfdf5] border-green-200';
        if (percent >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
        return 'text-red-700 bg-red-50 border-red-200';
    };

    const getBarColor = (percent) => {
        if (percent >= 80) return 'bg-[#ecfdf5]0';
        if (percent >= 60) return 'bg-yellow-500';
        return 'bg-red-400';
    };

    return (
        <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">{t('Crop Recommendation Engine')}</h1>
                    <p className="page-subtitle">{t('Get intelligent crop suggestions based on your soil and weather conditions')}</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setTab('manual')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-[#065f46] text-white' : 'bg-white border border-gray-300 text-[#374151] hover:bg-gray-50'}`}>
                        {t('Manual Input')}
                    </button>
                    <button onClick={() => setTab('farm')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'farm' ? 'bg-[#065f46] text-white' : 'bg-white border border-gray-300 text-[#374151] hover:bg-gray-50'}`}>
                        {t('From My Farm')}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Input Panel */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-2xl p-6">
                            {tab === 'manual' ? (
                                <form onSubmit={handleManualSubmit} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-[#374151] mb-3">{t('Soil & Weather Data')}</h3>
                                    {[
                                        { key: 'nitrogen', label: t('Nitrogen (N)'), placeholder: 'e.g. 50' },
                                        { key: 'phosphorous', label: t('Phosphorous (P)'), placeholder: 'e.g. 40' },
                                        { key: 'potassium', label: t('Potassium (K)'), placeholder: 'e.g. 40' },
                                        { key: 'temperature', label: t('Temperature (°C)'), placeholder: 'e.g. 28' },
                                        { key: 'humidity', label: t('Humidity (%)'), placeholder: 'e.g. 65' },
                                        { key: 'ph', label: t('pH'), placeholder: 'e.g. 6.5' },
                                        { key: 'rainfall', label: t('Rainfall (mm)'), placeholder: 'e.g. 100' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-medium text-[#4b6360] mb-1">{f.label}</label>
                                            <input type="number" step="any" required placeholder={f.placeholder}
                                                value={inputs[f.key]}
                                                onChange={e => setInputs(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Soil Type (optional)')}</label>
                                        <select value={inputs.soil_type}
                                            onChange={e => setInputs(prev => ({ ...prev, soil_type: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                            <option value="">Select soil type</option>
                                            {['Clay', 'Loamy', 'Sandy', 'Sandy Loam', 'Black', 'Red', 'Alluvial', 'Laterite'].map(s =>
                                                <option key={s} value={s}>{s}</option>
                                            )}
                                        </select>
                                    </div>
                                    <button type="submit" disabled={loading}
                                        className="w-full bg-[#065f46] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors mt-2">
                                        {loading ? t('Analyzing...') : t('Get Recommendations')}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-[#374151]">{t('Select a Farm')}</h3>
                                    {farms.length === 0 ? (
                                        <p className="text-sm text-[#6b7280]">{t('No farms registered. Add a farm from the Dashboard first.')}</p>
                                    ) : (
                                        <>
                                            <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                                                <option value="">{t('Choose a farm...')}</option>
                                                {farms.map(f => (
                                                    <option key={f.id} value={f.id}>{f.farm_name} — {f.current_crop} ({f.soil_type})</option>
                                                ))}
                                            </select>
                                            <button onClick={handleFarmSubmit} disabled={loading || !selectedFarm}
                                                className="w-full bg-[#065f46] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors">
                                                {loading ? t('Analyzing...') : t('Auto-Recommend for Farm')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                        {!results ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <div className="w-16 h-16 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <p className="text-[#6b7280] text-sm">{t('Enter your soil and weather data to get crop recommendations')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-[#374151]">{t('Top Crop Recommendations')}</h3>
                                {results.map((crop, idx) => (
                                    <div key={idx} className={`bg-white border rounded-xl shadow-sm p-5 ${idx === 0 ? 'border-[#6ee7b7] ring-1 ring-[#d1fae5]' : 'border-gray-200'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-gray-100 text-[#4b6360]'}`}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <h4 className="text-base font-semibold text-[#1a2e2a]">{crop.crop}</h4>
                                                    <p className="text-xs text-[#6b7280]">{t('Seasons')}: {crop.seasons.join(', ')} · {t('Yield')}: ~{crop.yieldPerAcre.toLocaleString()} kg/acre</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMatchColor(crop.matchPercent)}`}>
                                                {crop.matchPercent}% {t('Match')}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                                            <div className={`h-2 rounded-full transition-all ${getBarColor(crop.matchPercent)}`} style={{ width: `${crop.matchPercent}%` }} />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">N:</span> <span className="font-medium">{crop.idealConditions.nitrogen}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">P:</span> <span className="font-medium">{crop.idealConditions.phosphorous}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">K:</span> <span className="font-medium">{crop.idealConditions.potassium}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">{t('pH')}:</span> <span className="font-medium">{crop.idealConditions.ph}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">Temp:</span> <span className="font-medium">{crop.idealConditions.temperature}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">Humidity:</span> <span className="font-medium">{crop.idealConditions.humidity}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">Rain:</span> <span className="font-medium">{crop.idealConditions.rainfall}</span></div>
                                            <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#6b7280]">Soil:</span> <span className="font-medium">{crop.soilTypes.join(', ')}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
};

export default CropRecommendation;
