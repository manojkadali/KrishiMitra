import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Advisory = () => {
    const { farmId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t, i18n } = useTranslation();

    // Custom Overrides State
    const [mockWeatherActive, setMockWeatherActive] = useState(false);
    const [mockWeather, setMockWeather] = useState({ temperature: 36, humidity: 85, forecastRainfall: 120 });
    const [manualGrowthStage, setManualGrowthStage] = useState('');

    const generateAdvisory = async () => {
        setLoading(true);
        setError('');
        setData(null);
        try {
            const token = localStorage.getItem('token');
            const payload = { farmId };

            if (manualGrowthStage) payload.manualGrowthStage = manualGrowthStage;
            if (mockWeatherActive) payload.mockWeather = mockWeather;

            const res = await axios.post('http://localhost:5000/api/advisories/generate', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error generating advisory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Generate base advisory instantly on load
        generateAdvisory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [farmId]);

    // Voice Web Speech API setup
    const [isSpeaking, setIsSpeaking] = useState(false);

    const speakAdvisory = () => {
        if (!data || !data.advisories || data.advisories.length === 0) return;

        const synth = window.speechSynthesis;
        if (isSpeaking) {
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        // Combine all text securely
        const fullTextToRead = data.advisories.map(a => a.advisory).join('. ');

        const utterance = new SpeechSynthesisUtterance(fullTextToRead);

        // Map i18n codes perfectly to TTS locales
        if (i18n.language === 'hi') utterance.lang = 'hi-IN';
        else if (i18n.language === 'te') utterance.lang = 'te-IN';
        else utterance.lang = 'en-US';

        utterance.onend = () => setIsSpeaking(false);

        synth.speak(utterance);
        setIsSpeaking(true);
    };

    const handleMockWeatherChange = (e) => {
        setMockWeather({ ...mockWeather, [e.target.name]: Number(e.target.value) });
    };

    const getSeverityClasses = (severity) => {
        switch (severity.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-100 border-red-500 text-red-900';
            case 'HIGH': return 'bg-orange-100 border-orange-500 text-orange-900';
            case 'MEDIUM': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
            case 'LOW': return 'bg-gray-100 border-gray-400 text-gray-800';
            default: return 'bg-white border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">{t('Crop Advisory')}</h1>
                    <div className="flex gap-4 items-center">
                        {data && data.advisories.length > 0 && (
                            <button
                                onClick={speakAdvisory}
                                className={`font-semibold px-4 py-2 rounded shadow-sm text-white ${isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isSpeaking ? t('Stop') : t('Listen')}
                            </button>
                        )}
                        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">&larr; {t('Dashboard')}</Link>
                    </div>
                </div>

                {/* Demo Overrides Panel */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-2">Simulate Demo Conditions (Optional)</h3>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex items-center">
                            <input type="checkbox" id="mockWeatherActive" checked={mockWeatherActive} onChange={(e) => setMockWeatherActive(e.target.checked)} className="mr-2" />
                            <label htmlFor="mockWeatherActive" className="text-sm font-medium text-gray-700">Use Mock Weather</label>
                        </div>
                        {mockWeatherActive && (
                            <div className="flex gap-2">
                                <input type="number" name="temperature" value={mockWeather.temperature} onChange={handleMockWeatherChange} placeholder="Temp(C)" className="w-20 p-1 border rounded text-sm" />
                                <input type="number" name="humidity" value={mockWeather.humidity} onChange={handleMockWeatherChange} placeholder="Hum(%)" className="w-20 p-1 border rounded text-sm" />
                                <input type="number" name="forecastRainfall" value={mockWeather.forecastRainfall} onChange={handleMockWeatherChange} placeholder="Rain(mm)" className="w-24 p-1 border rounded text-sm" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <input type="text" value={manualGrowthStage} onChange={(e) => setManualGrowthStage(e.target.value)} placeholder="Manual Stage (e.g. tillering)" className="p-2 border rounded text-sm flex-1" />
                        <button onClick={generateAdvisory} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                            {loading ? 'Generating...' : 'Regenerate Advisory'}
                        </button>
                    </div>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg font-medium">{error}</div>}

                {data && (
                    <>
                        {/* Top Section Summary */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-indigo-500 mb-6">
                            <h2 className="text-xl font-bold mb-4">Advisory Summary</h2>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-red-50 text-red-800 px-4 py-2 rounded-full font-bold border border-red-200">
                                    {data.summary.critical} Critical Alerts
                                </div>
                                <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-full font-bold border border-orange-200">
                                    {data.summary.high} High Priority Alerts
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                <div><strong>Growth Stage:</strong> <span className="capitalize">{data.meta.growthStageUsed}</span></div>
                                {data.weatherUsed ? (
                                    <>
                                        <div><strong>Temp:</strong> {data.weatherUsed.temperature}°C</div>
                                        <div><strong>Humidity:</strong> {data.weatherUsed.humidity}%</div>
                                        <div><strong>Rainfall:</strong> {data.weatherUsed.forecastRainfall}mm</div>
                                    </>
                                ) : (
                                    <div className="col-span-3 text-red-600 font-semibold whitespace-nowrap">Weather Data Unavailable</div>
                                )}
                            </div>
                        </div>

                        {/* Warnings */}
                        {data.warnings && data.warnings.length > 0 && (
                            <div className="mb-6 space-y-2">
                                {data.warnings.map((warn, i) => (
                                    <div key={i} className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-300 flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                        {warn}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Generated Rule Advisories */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Detailed Advice</h3>
                            {data.advisories.length === 0 ? (
                                <p className="text-gray-500">No specific advisories generated for this combination of conditions.</p>
                            ) : (
                                data.advisories.map((adv) => (
                                    <div key={adv.id} className={`p-4 rounded-md border-l-4 shadow-sm ${getSeverityClasses(adv.severity)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold uppercase tracking-wider text-sm">{adv.category}</span>
                                            <span className="font-bold text-xs px-2 py-1 rounded bg-white bg-opacity-50">{adv.severity}</span>
                                        </div>
                                        <p className="mb-2">{adv.advisory}</p>
                                        <p className="text-xs opacity-75 italic block">Source: {adv.source}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Advisory;
