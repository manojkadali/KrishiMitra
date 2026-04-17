import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const PriceForecast = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [commodity, setCommodity] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);
    const [forecast, setForecast] = useState(null);
    const canvasRef = useRef(null);

    const commodities = ['Wheat', 'Rice', 'Cotton', 'Maize', 'Potato', 'Tomato', 'Onion', 'Sugarcane', 'Soybean', 'Mustard', 'Groundnut', 'Chickpea', 'Lentil', 'Chilli', 'Millet'];
    const states = ['Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    useEffect(() => {
        if (forecast && canvasRef.current) drawChart();
    }, [forecast]);

    const fetchForecast = async () => {
        if (!commodity || !state) return alert(t('Select commodity and state'));
        setLoading(true);
        try {
            const res = await api.get(`/api/market/forecast?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}`);
            setForecast(res.data);
        } catch (err) {
            alert(err.response?.data?.msg || t('Error fetching forecast'));
        }
        setLoading(false);
    };

    const drawChart = () => {
        const canvas = canvasRef.current;
        if (!canvas || !forecast) return;
        const ctx = canvas.getContext('2d');
        const { trendData, forecast: fc } = forecast;

        const allData = [...trendData, ...fc.map(f => ({ date: f.date, price: f.predicted_price }))];
        const prices = allData.map(d => d.price);
        const minP = Math.min(...prices) * 0.95;
        const maxP = Math.max(...prices) * 1.05;

        const W = canvas.width = canvas.parentElement.offsetWidth;
        const H = canvas.height = 280;
        const pad = { top: 30, bottom: 40, left: 60, right: 20 };
        const chartW = W - pad.left - pad.right;
        const chartH = H - pad.top - pad.bottom;

        ctx.clearRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (chartH / 4) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
            const price = maxP - ((maxP - minP) / 4) * i;
            ctx.fillStyle = '#9ca3af'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(`₹${Math.round(price)}`, pad.left - 8, y + 4);
        }

        const toX = (i) => pad.left + (i / (allData.length - 1)) * chartW;
        const toY = (p) => pad.top + ((maxP - p) / (maxP - minP)) * chartH;

        // Historical line
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        trendData.forEach((d, i) => {
            const x = toX(i);
            const y = toY(d.price);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Historical dots
        trendData.forEach((d, i) => {
            ctx.fillStyle = '#16a34a';
            ctx.beginPath(); ctx.arc(toX(i), toY(d.price), 3, 0, Math.PI * 2); ctx.fill();
        });

        // Forecast line (dashed)
        ctx.strokeStyle = '#7c3aed';
        ctx.setLineDash([6, 3]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        const startIdx = trendData.length - 1;
        ctx.moveTo(toX(startIdx), toY(trendData[startIdx].price));
        fc.forEach((f, i) => {
            const x = toX(trendData.length + i);
            ctx.lineTo(x, toY(f.predicted_price));
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Forecast dots
        fc.forEach((f, i) => {
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath(); ctx.arc(toX(trendData.length + i), toY(f.predicted_price), 4, 0, Math.PI * 2); ctx.fill();
        });

        // Divider line
        const divX = toX(trendData.length - 1);
        ctx.strokeStyle = '#d1d5db'; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(divX, pad.top); ctx.lineTo(divX, H - pad.bottom); ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#16a34a'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(t('Historical'), pad.left + 5, pad.top - 10);
        ctx.fillStyle = '#7c3aed'; ctx.textAlign = 'right';
        ctx.fillText(t('Forecast'), W - pad.right - 5, pad.top - 10);

        // X-axis labels (first, divider, last)
        ctx.fillStyle = '#9ca3af'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        if (allData.length > 0) {
            ctx.fillText(allData[0].date, toX(0), H - 10);
            ctx.fillText(trendData[trendData.length - 1].date, divX, H - 10);
            ctx.fillText(allData[allData.length - 1].date, toX(allData.length - 1), H - 10);
        }
    };

    const trendColors = { rising: 'text-[#059669]', falling: 'text-red-600', stable: 'text-[#4b6360]' };
    const trendIcons = { rising: '↑', falling: '↓', stable: '→' };
    const recColors = { sell_now: 'bg-[#d1fae5] border-[#6ee7b7] text-green-800', hold: 'bg-yellow-100 border-yellow-300 text-yellow-800' };

    return (
        <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">{t('Price Forecast & Trends')}</h1>
                    <p className="page-subtitle">{t('Analyze price trends and get sell/hold recommendations')}</p>
                </div>

                {/* Controls */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select value={commodity} onChange={e => setCommodity(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                            <option value="">{t('Select commodity...')}</option>
                            {commodities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={state} onChange={e => setState(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                            <option value="">{t('Select state...')}</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={fetchForecast} disabled={loading || !commodity || !state}
                            className="bg-amber-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-500 disabled:opacity-50 transition-colors">
                            {loading ? t('Loading...') : t('Get Forecast')}
                        </button>
                    </div>
                </div>

                {forecast && (
                    <div className="space-y-6">
                        {/* Summary Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <p className="text-xl font-bold text-[#1a2e2a]">₹{forecast.currentPrice?.toLocaleString()}</p>
                                <p className="text-xs text-[#6b7280]">{t('Current Price')}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <p className={`text-xl font-bold ${trendColors[forecast.trend]}`}>
                                    {trendIcons[forecast.trend]} {forecast.trend}
                                </p>
                                <p className="text-xs text-[#6b7280]">{t('Trend')}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <p className="text-xl font-bold text-[#1a2e2a]">₹{forecast.shortTermAvg?.toLocaleString()}</p>
                                <p className="text-xs text-[#6b7280]">{t('Short-term Avg')}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <p className="text-xl font-bold text-[#1a2e2a]">₹{forecast.longTermAvg?.toLocaleString()}</p>
                                <p className="text-xs text-[#6b7280]">{t('Long-term Avg')}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                                <p className={`text-xl font-bold ${forecast.priceChangePercent >= 0 ? 'text-[#059669]' : 'text-red-600'}`}>
                                    {forecast.priceChangePercent > 0 ? '+' : ''}{forecast.priceChangePercent}%
                                </p>
                                <p className="text-xs text-[#6b7280]">{t('Change')}</p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[#374151] mb-4">{t('Price Trend & 4-Week Forecast')}</h3>
                            <canvas ref={canvasRef} className="w-full" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recommendation */}
                            <div className={`border rounded-xl p-6 ${recColors[forecast.recommendation] || 'bg-gray-50 border-gray-200'}`}>
                                <h3 className="text-sm font-semibold mb-2">{t('Sell/Hold Recommendation')}</h3>
                                <p className="text-lg font-bold capitalize mb-2">
                                    {forecast.recommendation === 'sell_now' ? '✓ ' + t('Good Time to Sell') : '⏳ ' + t('Hold — Wait for Better Prices')}
                                </p>
                                <p className="text-sm opacity-80">{forecast.recommendationText}</p>
                            </div>

                            {/* Forecast Table */}
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-[#374151] mb-3">{t('Weekly Forecast')}</h3>
                                <div className="space-y-2">
                                    {forecast.forecast.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                            <span className="text-sm text-[#4b6360]">
                                                {new Date(f.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="text-sm font-medium">₹{f.predicted_price?.toLocaleString()}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${f.confidence === 'High' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {f.confidence}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!forecast && !loading && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                        <p className="text-[#6b7280] text-sm">{t('forecast_empty')}</p>
                    </div>
                )}
            </div>
    );
};

export default PriceForecast;
