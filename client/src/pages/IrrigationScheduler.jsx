import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const IrrigationScheduler = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState('');
    const [loading, setLoading] = useState(false);
    const [schedule, setSchedule] = useState(null);
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

    const generateSchedule = async () => {
        if (!selectedFarm) return;
        setLoading(true);
        try {
            const res = await api.post(`/api/irrigation/schedule/${selectedFarm}`);
            setSchedule(res.data.schedule);
            setWeather(res.data.weather);
        } catch (err) {
            alert(err.response?.data?.msg || t('Error generating schedule'));
        }
        setLoading(false);
    };

    const stageColors = {
        seedling: 'bg-blue-100 text-blue-700',
        vegetative: 'bg-[#d1fae5] text-[#065f46]',
        flowering: 'bg-yellow-100 text-yellow-700',
        maturity: 'bg-orange-100 text-orange-700',
    };

    return (
        <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">{t('Irrigation Scheduler')}</h1>
                    <p className="page-subtitle">{t('Smart watering schedule based on your crop, soil, and weather conditions')}</p>
                </div>

                {/* Farm Selection */}
                <div className="glass-card rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                            <option value="">{t('Select a farm...')}</option>
                            {farms.map(f => (
                                <option key={f.id} value={f.id}>{f.farm_name} — {f.current_crop} ({f.irrigation_type || 'No irrigation set'})</option>
                            ))}
                        </select>
                        <button onClick={generateSchedule} disabled={loading || !selectedFarm}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors">
                            {loading ? t('Generating...') : t('Generate Schedule')}
                        </button>
                    </div>
                    {farms.length === 0 && <p className="text-sm text-[#6b7280] mt-3">{t('No farms registered. Add a farm from the Dashboard first.')}</p>}
                </div>

                {schedule && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Summary Cards */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="glass-card rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4">{t('Schedule Summary')}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Crop</span>
                                        <span className="font-medium">{schedule.crop}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">{t('Growth Stage')}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageColors[schedule.growthStage] || 'bg-gray-100 text-[#374151]'}`}>
                                            {schedule.growthStage}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">{t('Days Since Sowing')}</span>
                                        <span className="font-medium">{schedule.daysSinceSowing}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">Irrigation Type</span>
                                        <span className="font-medium capitalize">{schedule.irrigationType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">{t('Water Need/Day')}</span>
                                        <span className="font-medium">{schedule.dailyWaterNeedMM} mm</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">{t('Water/Session')}</span>
                                        <span className="font-medium">{schedule.waterPerSessionMM} mm</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#6b7280]">{t('Interval')}</span>
                                        <span className="font-medium">Every {schedule.intervalDays} day{schedule.intervalDays > 1 ? 's' : ''}</span>
                                    </div>
                                    {schedule.estimatedHarvestDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#6b7280]">{t('Est. Harvest')}</span>
                                            <span className="font-medium">{new Date(schedule.estimatedHarvestDate).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {schedule.isCriticalNow && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-red-700">{t('Critical Water Stage')}</p>
                                    <p className="text-xs text-red-600 mt-1">Your crop is in the {schedule.criticalStage} stage — the most water-sensitive period. Do not miss irrigation!</p>
                                </div>
                            )}

                            {schedule.weatherNote && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-blue-700">{t('Weather Advisory')}</p>
                                    <p className="text-xs text-blue-600 mt-1">{schedule.weatherNote}</p>
                                </div>
                            )}

                            {weather && (
                                <div className="glass-card rounded-2xl p-5">
                                    <h3 className="text-sm font-semibold text-[#374151] mb-3">{t('Current Weather')}</h3>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-orange-50 rounded-lg p-2">
                                            <p className="text-lg font-bold text-orange-600">{weather.temperature}°</p>
                                            <p className="text-xs text-[#6b7280]">{t('Temp')}</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-2">
                                            <p className="text-lg font-bold text-blue-600">{weather.humidity}%</p>
                                            <p className="text-xs text-[#6b7280]">{t('Humidity')}</p>
                                        </div>
                                        <div className="bg-cyan-50 rounded-lg p-2">
                                            <p className="text-lg font-bold text-cyan-600">{weather.forecastRainfall || 0}mm</p>
                                            <p className="text-xs text-[#6b7280]">{t('Rain')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Schedule Timeline */}
                        <div className="lg:col-span-2">
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-sm font-semibold text-[#374151] mb-4">{t('4-Week Irrigation Schedule')}</h3>
                                <div className="space-y-2">
                                    {schedule.schedule.map((item, idx) => (
                                        <div key={idx}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${
                                                item.status === 'skip'
                                                    ? 'bg-gray-50 border-gray-200'
                                                    : idx === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${item.status === 'skip' ? 'bg-gray-300' : 'bg-blue-500'}`} />
                                                <div>
                                                    <p className="text-sm font-medium text-[#1a2e2a]">
                                                        {new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-[#6b7280]">{item.note}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                item.status === 'skip' ? 'bg-gray-200 text-[#4b6360]' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {item.status === 'skip' ? t('Skip') : `${item.waterAmountMM} mm`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
};

export default IrrigationScheduler;
