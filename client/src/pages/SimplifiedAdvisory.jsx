import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SimplifiedAdvisory = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        location: '',
        nitrogen: '',
        phosphorous: '',
        potassium: '',
        temperature: '',
        humidity: '',
        ph: '',
        rainfall: ''
    });
    const [history, setHistory] = useState([]);
    const [currentResult, setCurrentResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherMsg, setWeatherMsg] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/advisories/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error('Error fetching advisory history', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAutoFillWeather = async () => {
        if (!formData.location) {
            setWeatherMsg({ type: 'error', text: "Please enter a city name first." });
            return;
        }
        setWeatherLoading(true);
        setWeatherMsg(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/advisories/weather`, {
                params: { city: formData.location },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const { temperature, humidity, rainfall } = res.data;
            setFormData(prev => ({
                ...prev,
                temperature: temperature.toString(),
                humidity: humidity.toString(),
                rainfall: rainfall.toString()
            }));
            setWeatherMsg({ type: 'success', text: "Weather fetched successfully!" });
            setTimeout(() => setWeatherMsg(null), 3000); // clear success msg after 3s
        } catch (err) {
            setWeatherMsg({ type: 'error', text: err.response?.data?.msg || "Failed to fetch weather data." });
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
            const token = localStorage.getItem('token');
            // We do not need to send 'location' to the backend for NPK advisory storage
            const dataToSubmit = { ...formData };
            delete dataToSubmit.location;

            // Post to the FastAPI model endpoint
            const res = await axios.post('http://127.0.0.1:8000/predict', {
                N: Number(dataToSubmit.nitrogen),
                P: Number(dataToSubmit.phosphorous),
                K: Number(dataToSubmit.potassium),
                temperature: Number(dataToSubmit.temperature),
                humidity: Number(dataToSubmit.humidity),
                ph: Number(dataToSubmit.ph),
                rainfall: Number(dataToSubmit.rainfall)
            });
            setCurrentResult(res.data);
            // fetchHistory(); // History won't be updated by FastAPI, so omitting refresh 
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Failed to generate advisory');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('simplified_advisory_title', 'Crop & Fertilizer Calculator')}</h1>
                <p className="text-lg text-gray-600">Enter your soil and weather data for a customized scientific recommendation</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">🌿 Nitrogen (N)</label>
                                <input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ratio" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">⚗️ Phosphorous (P)</label>
                                <input type="number" name="phosphorous" value={formData.phosphorous} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ratio" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">🪨 Potassium (K)</label>
                                <input type="number" name="potassium" value={formData.potassium} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Ratio" />
                            </div>
                        </div>

                        {/* Location / Auto Weather Fetch */}
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">📍 City Name (Auto-fill Weather)</label>
                            <div className="flex gap-2">
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Mumbai, Delhi" />
                                <button type="button" onClick={handleAutoFillWeather} disabled={weatherLoading} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium whitespace-nowrap">
                                    {weatherLoading ? 'Fetching...' : 'Get Weather'}
                                </button>
                            </div>
                            {weatherMsg && (
                                <p className={`mt-2 text-sm ${weatherMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                    {weatherMsg.text}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">🌡️ Temp (°C)</label>
                                <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 25.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">💧 Humidity (%)</label>
                                <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 70" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">🧪 pH Value</label>
                                <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 6.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">🌧️ Rainfall (mm)</label>
                                <input type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 100" />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transform transition-transform active:scale-95 shadow-lg">
                            {loading ? 'Calculating...' : 'Generate Advisory'}
                        </button>
                    </form>
                </div>

                {/* Results & History */}
                <div className="space-y-6">
                    {/* Live Result Card */}
                    {currentResult && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-xl p-8 border border-green-200 transform transition-all hover:scale-[1.02]">
                            <h2 className="text-2xl font-bold text-green-800 mb-6">Latest Recommendation</h2>
                            <div className="space-y-4">
                                <div className="bg-white bg-opacity-60 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-1">Recommended Crop</p>
                                    <p className="text-2xl font-bold text-gray-800 capitalize">{currentResult.recommended_crop}</p>
                                </div>
                                <div className="bg-white bg-opacity-60 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-1">Top 3 Predictions</p>
                                    <div className="space-y-2 mt-2">
                                        {currentResult.top_predictions && currentResult.top_predictions.map((pred, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                                                <span className="font-semibold capitalize text-gray-700">{pred.crop}</span>
                                                <span className="text-green-600 font-bold">{pred.confidence}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!currentResult && history.length === 0 && (
                        <div className="bg-gray-50 rounded-2xl shadow-inner p-8 border border-gray-200 flex items-center justify-center h-full min-h-[300px]">
                            <p className="text-gray-500 text-center italic">Submit your soil readings to get a customized crop recommendation.</p>
                        </div>
                    )}

                    {/* History List */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 max-h-[400px] overflow-y-auto">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 sticky top-0 bg-white pb-2 border-b">Past Recommendations</h3>
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-green-600">{item.crop_recommendation}</span>
                                            <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-2 text-xs text-gray-500 mb-2">
                                            <span className="bg-gray-100 px-2 py-1 rounded">N:{item.nitrogen}</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">P:{item.phosphorous}</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">K:{item.potassium}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{item.fertilizer_advice}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimplifiedAdvisory;
