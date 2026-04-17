import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const Farms = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        farm_name: '', area_acres: '', soil_type: '', current_crop: '',
        soil_ph: '', irrigation_type: '', sowing_date: '', previous_crop: '',
        latitude: '', longitude: '', district: '', state: '',
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
        fetchFarms();
    }, [navigate]);

    const fetchFarms = async () => {
        try {
            const res = await api.get('/api/farms');
            setFarms(res.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...formData };
            ['soil_ph', 'latitude', 'longitude'].forEach(key => {
                if (payload[key] === '') payload[key] = null;
                else payload[key] = Number(payload[key]);
            });
            if (payload.area_acres) payload.area_acres = Number(payload.area_acres);

            const res = await api.post('/api/farms', payload);
            setFarms([res.data, ...farms]);
            setFormData({
                farm_name: '', area_acres: '', soil_type: '', current_crop: '',
                soil_ph: '', irrigation_type: '', sowing_date: '', previous_crop: '',
                latitude: '', longitude: '', district: '', state: '',
            });
            setShowForm(false);
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || t('Error adding farm'));
        }
    };

    const deleteFarm = async (id) => {
        if (!window.confirm(t('Are you sure you want to delete this farm?'))) return;
        try {
            await api.delete(`/api/farms/${id}`);
            setFarms(farms.filter(f => f.id !== id));
        } catch (err) {
            alert(err.response?.data?.msg || t('Error deleting farm'));
        }
    };

    const soilTypes = ['Clay', 'Loamy', 'Sandy', 'Sandy Loam', 'Black', 'Red', 'Alluvial', 'Laterite'];
    const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Canal', 'Rainfed'];
    const cropOptions = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean', 'Mustard', 'Potato', 'Tomato', 'Onion', 'Chilli', 'Millet', 'Sorghum', 'Lentil', 'Chickpea', 'Turmeric', 'Banana'];

    return (
        <div className="page-content">
                <div className="flex items-center justify-between page-header">
                    <div>
                        <h1 className="page-title">{t('My Farms')}</h1>
                        <p className="page-subtitle">{t('Manage your registered farms')}</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            showForm ? 'bg-gray-200 text-[#374151] hover:bg-gray-300' : 'bg-[#065f46] text-white hover:bg-green-600'
                        }`}>
                        {showForm ? t('Cancel') : t('+ Add New Farm')}
                    </button>
                </div>

                {/* Add Farm Form */}
                {showForm && (
                    <div className="glass-card rounded-2xl p-6 mb-6">
                        <h3 className="text-base font-semibold text-[#1a2e2a] mb-4">{t('Add New Farm')}</h3>
                        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={onSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                {/* Required fields */}
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Farm Name')} *</label>
                                    <input type="text" name="farm_name" value={formData.farm_name} onChange={onChange} required
                                        placeholder="e.g. My Rice Field"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Area (Acres)')} *</label>
                                    <input type="number" step="0.1" name="area_acres" value={formData.area_acres} onChange={onChange} required
                                        placeholder="e.g. 5"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Soil Type')} *</label>
                                    <select name="soil_type" value={formData.soil_type} onChange={onChange} required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]">
                                        <option value="">{t('Select soil type')}</option>
                                        {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Current Crop')} *</label>
                                    <select name="current_crop" value={formData.current_crop} onChange={onChange} required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]">
                                        <option value="">{t('Select crop')}</option>
                                        {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Soil pH')} (3-9)</label>
                                    <input type="number" step="0.1" min="3" max="9" name="soil_ph" value={formData.soil_ph} onChange={onChange}
                                        placeholder="e.g. 6.5"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Irrigation Type')}</label>
                                    <select name="irrigation_type" value={formData.irrigation_type} onChange={onChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]">
                                        <option value="">{t('Select irrigation')}</option>
                                        {irrigationTypes.map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Sowing Date')}</label>
                                    <input type="date" name="sowing_date" value={formData.sowing_date} onChange={onChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Previous Crop')}</label>
                                    <select name="previous_crop" value={formData.previous_crop} onChange={onChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]">
                                        <option value="">{t('Select previous crop')}</option>
                                        {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <h4 className="text-xs font-bold text-[#374151] mb-1">{t('Location')} (provide Lat/Lon OR District/State)</h4>
                                <p className="text-xs text-[#6b7280] mb-3">{t('location_hint')}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Latitude')}</label>
                                        <input type="number" step="any" name="latitude" value={formData.latitude} onChange={onChange}
                                            placeholder="e.g. 17.3850"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('Longitude')}</label>
                                        <input type="number" step="any" name="longitude" value={formData.longitude} onChange={onChange}
                                            placeholder="e.g. 78.4867"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('District')}</label>
                                        <input type="text" name="district" value={formData.district} onChange={onChange}
                                            placeholder="e.g. Hyderabad"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#4b6360] mb-1">{t('State')}</label>
                                        <input type="text" name="state" value={formData.state} onChange={onChange}
                                            placeholder="e.g. Telangana"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit"
                                className="w-full bg-[#065f46] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                                {t('Save Farm')}
                            </button>
                        </form>
                    </div>
                )}

                {/* Farms List */}
                {loading ? (
                    <p className="text-sm text-[#6b7280]">{t('Loading farms...')}</p>
                ) : farms.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 bg-[#ecfdf5] rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <h3 className="text-base font-semibold text-[#1a2e2a] mb-1">{t('No farms yet')}</h3>
                        <p className="text-sm text-[#6b7280] mb-4">{t('Click Add New Farm above to register your first farm')}</p>
                        <button onClick={() => setShowForm(true)}
                            className="bg-[#065f46] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                            {t('+ Add Your First Farm')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {farms.map(farm => (
                            <div key={farm.id} className="glass-card rounded-2xl border-l-4 border-l-[#059669] p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="text-base font-semibold text-[#1a2e2a]">{farm.farm_name}</h4>
                                    <button onClick={() => deleteFarm(farm.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors p-1" title={t('Delete')}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Crop')}</span><span className="font-medium text-[#1a2e2a]">{farm.current_crop}</span></div>
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Area')}</span><span className="font-medium">{farm.area_acres} {t('acres')}</span></div>
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Soil')}</span><span className="font-medium">{farm.soil_type}</span></div>
                                    {farm.soil_ph && <div className="flex justify-between"><span className="text-[#6b7280]">pH</span><span className="font-medium">{farm.soil_ph}</span></div>}
                                    {farm.irrigation_type && <div className="flex justify-between"><span className="text-[#6b7280]">{t('Irrigation')}</span><span className="font-medium">{farm.irrigation_type}</span></div>}
                                    {farm.sowing_date && <div className="flex justify-between"><span className="text-[#6b7280]">{t('Sowed')}</span><span className="font-medium">{new Date(farm.sowing_date).toLocaleDateString('en-IN')}</span></div>}
                                    {farm.district && <div className="flex justify-between"><span className="text-[#6b7280]">{t('Location')}</span><span className="font-medium text-xs">{farm.district}, {farm.state}</span></div>}
                                    {farm.latitude && <div className="flex justify-between"><span className="text-[#6b7280]">{t('Coordinates')}</span><span className="font-medium text-xs">{farm.latitude}, {farm.longitude}</span></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
    );
};

export default Farms;
