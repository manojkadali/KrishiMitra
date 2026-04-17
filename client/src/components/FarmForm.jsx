import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const FarmForm = ({ token, onFarmAdded }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        farm_name: '',
        area_acres: '',
        soil_type: '',
        current_crop: '',
        soil_ph: '',
        irrigation_type: '',
        sowing_date: '',
        previous_crop: '',
        latitude: '',
        longitude: '',
        district: '',
        state: ''
    });

    const [error, setError] = useState('');

    const {
        farm_name, area_acres, soil_type, current_crop,
        soil_ph, irrigation_type, sowing_date, previous_crop,
        latitude, longitude, district, state
    } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            // Clean up empty strings to nulls for optional fields
            const payload = { ...formData };
            ['soil_ph', 'latitude', 'longitude'].forEach(key => {
                if (payload[key] === '') payload[key] = null;
            });

            const res = await axios.post('http://localhost:5000/api/farms', payload, config);
            onFarmAdded(res.data);
            setFormData({
                farm_name: '', area_acres: '', soil_type: '', current_crop: '',
                soil_ph: '', irrigation_type: '', sowing_date: '', previous_crop: '',
                latitude: '', longitude: '', district: '', state: ''
            });
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || t('Error adding farm'));
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('Add New Farm')}</h3>
            {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Farm Name')} *</label>
                    <input type="text" name="farm_name" value={farm_name} onChange={onChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Area (Acres)')} *</label>
                    <input type="number" step="0.1" name="area_acres" value={area_acres} onChange={onChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Soil Type')} *</label>
                    <input type="text" name="soil_type" value={soil_type} onChange={onChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Current Crop')} *</label>
                    <input type="text" name="current_crop" value={current_crop} onChange={onChange} required placeholder="e.g. Wheat, Rice" className="mt-1 p-2 w-full border rounded" />
                </div>

                {/* Optionals */}
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Soil pH')} (Optional)</label>
                    <input type="number" step="0.1" name="soil_ph" value={soil_ph} onChange={onChange} placeholder="3 - 9" className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Irrigation Type')}</label>
                    <input type="text" name="irrigation_type" value={irrigation_type} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Sowing Date')}</label>
                    <input type="date" name="sowing_date" value={sowing_date} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#374151]">{t('Previous Crop')}</label>
                    <input type="text" name="previous_crop" value={previous_crop} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                </div>

                {/* Location Logic (Require either Lat/Lon OR District/State) */}
                <div className="col-span-1 md:col-span-2 mt-4 bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-bold text-[#374151] mb-2">{t('location_hint')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[#4b6360]">{t('Latitude')}</label>
                            <input type="number" step="any" name="latitude" value={latitude} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-[#4b6360]">{t('Longitude')}</label>
                            <input type="number" step="any" name="longitude" value={longitude} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-[#4b6360]">{t('District')}</label>
                            <input type="text" name="district" value={district} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-[#4b6360]">{t('State')}</label>
                            <input type="text" name="state" value={state} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4">
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-[#065f46]">{t('Save Farm')}</button>
                </div>
            </form>
        </div>
    );
};

export default FarmForm;
