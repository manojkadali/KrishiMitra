import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

// ── Soil Health Score Calculator ─────────────────────────────────────────────
const calcSoilHealth = (n, p, k, ph) => {
    const nV = parseFloat(n); const pV = parseFloat(p);
    const kV = parseFloat(k); const phV = parseFloat(ph);
    if (isNaN(nV) && isNaN(pV) && isNaN(kV) && isNaN(phV)) return null;

    // N — optimal 40-80 kg/ha
    const nScore = !isNaN(nV)
        ? nV >= 40 && nV <= 80 ? 25
        : nV < 40 ? Math.round((nV / 40) * 25)
        : Math.max(0, Math.round(25 - ((nV - 80) / 80) * 12))
        : 0;

    // P — optimal 30-60 kg/ha
    const pScore = !isNaN(pV)
        ? pV >= 30 && pV <= 60 ? 25
        : pV < 30 ? Math.round((pV / 30) * 25)
        : Math.max(0, Math.round(25 - ((pV - 60) / 60) * 12))
        : 0;

    // K — optimal 100-200 kg/ha
    const kScore = !isNaN(kV)
        ? kV >= 100 && kV <= 200 ? 25
        : kV < 100 ? Math.round((kV / 100) * 25)
        : Math.max(0, Math.round(25 - ((kV - 200) / 200) * 12))
        : 0;

    // pH — optimal 6.0-7.5
    const phScore = !isNaN(phV) && phV > 0
        ? phV >= 6.0 && phV <= 7.5 ? 25
        : phV < 6.0 ? Math.max(0, Math.round(25 - (6.0 - phV) * 9))
        : Math.max(0, Math.round(25 - (phV - 7.5) * 9))
        : 0;

    const total = Math.min(100, nScore + pScore + kScore + phScore);
    const label = total >= 75 ? 'Good' : total >= 50 ? 'Fair' : 'Poor';
    const color = total >= 75 ? '#15803d' : total >= 50 ? '#d97706' : '#dc2626';
    const textColor = total >= 75 ? 'text-[#065f46]' : total >= 50 ? 'text-amber-600' : 'text-red-600';
    const bgColor = total >= 75 ? 'bg-[#ecfdf5]' : total >= 50 ? 'bg-amber-50' : 'bg-red-50';

    return { total, label, color, textColor, bgColor, breakdown: { nScore, pScore, kScore, phScore } };
};

// ── Circular SVG Progress ────────────────────────────────────────────────────
const SoilGauge = ({ score, color }) => {
    const r = 52;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
        <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
                cx="65" cy="65" r={r} fill="none"
                stroke={color} strokeWidth="10"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 65 65)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
            <text x="65" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill={color}>{score}</text>
            <text x="65" y="76" textAnchor="middle" fontSize="11" fill="#9ca3af">/100</text>
        </svg>
    );
};

// ── Nutrient Bar ─────────────────────────────────────────────────────────────
const NutrientBar = ({ label, score, hint }) => {
    const pct = (score / 25) * 100;
    const barColor = pct >= 90 ? 'bg-[#ecfdf5]0' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#374151]">{label}</span>
                <span className="text-gray-400">{score}/25</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
    );
};

const SimplifiedAdvisory = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        location: '', nitrogen: '', phosphorous: '',
        potassium: '', temperature: '', humidity: '', ph: '', rainfall: ''
    });
    const [history, setHistory] = useState([]);
    const [currentResult, setCurrentResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherMsg, setWeatherMsg] = useState(null);
    const [activeTab, setActiveTab] = useState('result'); // 'result' | 'history'

    const soilHealth = calcSoilHealth(
        formData.nitrogen, formData.phosphorous,
        formData.potassium, formData.ph
    );

    useEffect(() => { fetchHistory(); }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/api/advisories/history');
            setHistory(res.data);
        } catch { /* silent */ }
    };

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAutoFillWeather = async () => {
        if (!formData.location) {
            setWeatherMsg({ type: 'error', text: 'Please enter a city name first.' });
            return;
        }
        setWeatherLoading(true);
        setWeatherMsg(null);
        try {
            const res = await api.get('/api/advisories/weather', { params: { city: formData.location } });
            const { temperature, humidity, rainfall } = res.data;
            setFormData(prev => ({
                ...prev,
                temperature: temperature.toString(),
                humidity: humidity.toString(),
                rainfall: rainfall.toString()
            }));
            setWeatherMsg({ type: 'success', text: `Weather data fetched for ${formData.location}.` });
            setTimeout(() => setWeatherMsg(null), 3500);
        } catch (err) {
            setWeatherMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to fetch weather data.' });
        } finally {
            setWeatherLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setCurrentResult(null);
        try {
            const payload = { ...formData };
            delete payload.location;
            const res = await api.post('/api/advisories/simplified', payload);
            setCurrentResult(res.data);
            setActiveTab('result');
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Failed to generate advisory.');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#059669] focus:border-transparent outline-none transition';
    const labelCls = 'block text-xs font-semibold text-[#4b6360] mb-1.5 uppercase tracking-wide';

    return (
        <div className="page-content">
                
                <div className="page-header flex items-center justify-between">
                    <div>
                        <h1 className="page-title">{t('Crop Advisory')}</h1>
                        <p className="page-subtitle">
                            {t('Enter your soil readings to receive a crop recommendation based on NPK values, pH, and weather conditions.')}
                        </p>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* ── Left: Input Form ────────────────────────────────────── */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* NPK Row */}
                        <div>
                            <p className={labelCls}>{t('Soil Nutrients (kg/ha)')}</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { name: 'nitrogen', label: t('Nitrogen (N)'), placeholder: '40–80' },
                                    { name: 'phosphorous', label: t('Phosphorous (P)'), placeholder: '30–60' },
                                    { name: 'potassium', label: t('Potassium (K)'), placeholder: '100–200' },
                                ].map(f => (
                                    <div key={f.name}>
                                        <label className="block text-xs text-[#6b7280] mb-1">{f.label}</label>
                                        <input type="number" name={f.name} value={formData[f.name]}
                                            onChange={handleChange} required placeholder={f.placeholder}
                                            className={inputCls} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* pH */}
                        <div>
                            <label className={labelCls}>{t('Soil pH')}</label>
                            <input type="number" step="0.1" name="ph" value={formData.ph}
                                onChange={handleChange} required placeholder="Optimal: 6.0 – 7.5"
                                className={inputCls} />
                        </div>

                        {/* Weather Section */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className={labelCls}>{t('Weather Data')}</p>
                            <div className="flex gap-2 mb-3">
                                <input type="text" name="location" value={formData.location}
                                    onChange={handleChange} placeholder="City name (e.g. Hyderabad)"
                                    className={`flex-1 ${inputCls}`} />
                                <button type="button" onClick={handleAutoFillWeather}
                                    disabled={weatherLoading}
                                    className="flex-shrink-0 bg-[#065f46] hover:bg-[#059669] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                                    {weatherLoading ? t('Fetching...') : t('Auto-fill')}
                                </button>
                            </div>
                            {weatherMsg && (
                                <p className={`text-xs mb-3 ${weatherMsg.type === 'success' ? 'text-[#059669]' : 'text-red-500'}`}>
                                    {weatherMsg.text}
                                </p>
                            )}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { name: 'temperature', label: t('Temperature (°C)'), placeholder: 'e.g. 25' },
                                    { name: 'humidity', label: t('Humidity (%)'), placeholder: 'e.g. 70' },
                                    { name: 'rainfall', label: t('Rainfall (mm)'), placeholder: 'e.g. 100' },
                                ].map(f => (
                                    <div key={f.name}>
                                        <label className="block text-xs text-[#6b7280] mb-1">{f.label}</label>
                                        <input type="number" step="0.1" name={f.name} value={formData[f.name]}
                                            onChange={handleChange} required placeholder={f.placeholder}
                                            className={inputCls} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full bg-[#065f46] hover:bg-[#059669] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors">
                            {loading ? t('Analyzing...') : t('Generate Advisory')}
                        </button>
                    </form>
                </div>

                {/* ── Right: Soil Health + Results ────────────────────────── */}
                <div className="p-6 space-y-5">

                    {/* Soil Health Score */}
                    {soilHealth && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">
                                {t('Soil Health Score')}
                            </p>
                            <div className="flex items-center gap-5">
                                <SoilGauge score={soilHealth.total} color={soilHealth.color} />
                                <div className="flex-1 space-y-2.5">
                                    <div className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${soilHealth.bgColor} ${soilHealth.textColor}`}>
                                        {soilHealth.label === 'Good' ? t('Good Soil Condition') : soilHealth.label === 'Fair' ? t('Fair Soil Condition') : t('Poor Soil Condition')}
                                    </div>
                                    <div className="space-y-2">
                                        <NutrientBar label={t('Nitrogen')} score={soilHealth.breakdown.nScore} />
                                        <NutrientBar label={t('Phosphorous')} score={soilHealth.breakdown.pScore} />
                                        <NutrientBar label={t('Potassium')} score={soilHealth.breakdown.kScore} />
                                        <NutrientBar label="pH" score={soilHealth.breakdown.phScore} />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                {t('soil_score_note')}
                            </p>
                        </div>
                    )}

                    {/* Result / History Tabs */}
                    <div>
                        <div className="flex border-b border-gray-200 mb-4">
                            {['result', 'history'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                                        activeTab === tab
                                            ? 'border-green-600 text-[#065f46]'
                                            : 'border-transparent text-[#6b7280] hover:text-[#374151]'
                                    }`}>
                                    {tab === 'result' ? t('Latest Result') : `${t('History')} (${history.length})`}
                                </button>
                            ))}
                        </div>

                        {/* Latest Result */}
                        {activeTab === 'result' && (
                            <>
                                {currentResult ? (
                                    <div className="border border-green-200 bg-[#ecfdf5] rounded-xl p-5">
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-[#065f46] uppercase tracking-wide mb-1">{t('Recommended Crop')}</p>
                                            <p className="text-xl font-bold text-[#1a2e2a]">{currentResult.crop_recommendation}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#065f46] uppercase tracking-wide mb-1">{t('Fertilizer & Care Advice')}</p>
                                            <p className="text-sm text-[#374151] leading-relaxed bg-white border border-green-100 rounded-lg px-4 py-3">
                                                {currentResult.fertilizer_advice}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-400">
                                        <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm">Submit soil readings to see your crop recommendation here.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* History Tab */}
                        {activeTab === 'history' && (
                            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                                {history.length === 0 ? (
                                    <p className="text-center text-sm text-gray-400 py-8">No advisory history yet.</p>
                                ) : history.map(item => (
                                    <div key={item.id} className="border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-sm font-semibold text-[#065f46]">{item.crop_recommendation}</span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                {new Date(item.created_at).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                                            {[`N:${item.nitrogen}`, `P:${item.phosphorous}`, `K:${item.potassium}`, `pH:${item.ph}`].map(tag => (
                                                <span key={tag} className="text-xs bg-gray-100 text-[#4b6360] px-2 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-[#6b7280] mt-1.5 leading-relaxed">{item.fertilizer_advice}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
        );
};

export default SimplifiedAdvisory;
