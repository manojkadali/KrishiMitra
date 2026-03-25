import { useState } from 'react';
import axios from 'axios';

const FarmForm = ({ token, onFarmAdded }) => {
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
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error adding farm');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Farm</h3>
            {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Farm Name *</label>
                    <input type="text" name="farm_name" value={farm_name} onChange={onChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Area (Acres) *</label>
                    <input type="number" step="0.1" name="area_acres" value={area_acres} onChange={onChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Soil Type *</label>
                    <input type="text" name="soil_type" value={soil_type} onChange={onChange} required className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Crop *</label>
                    <input type="text" name="current_crop" value={current_crop} onChange={onChange} required placeholder="e.g. Wheat, Rice" className="mt-1 p-2 w-full border rounded" />
                </div>

                {/* Optionals */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Soil pH (Optional)</label>
                    <input type="number" step="0.1" name="soil_ph" value={soil_ph} onChange={onChange} placeholder="3 - 9" className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Irrigation Type</label>
                    <input type="text" name="irrigation_type" value={irrigation_type} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sowing Date</label>
                    <input type="date" name="sowing_date" value={sowing_date} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Previous Crop</label>
                    <input type="text" name="previous_crop" value={previous_crop} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                </div>

                {/* Location Logic (Require either Lat/Lon OR District/State) */}
                <div className="col-span-1 md:col-span-2 mt-4 bg-gray-50 p-4 rounded">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Location Requirements (Provide Lat/Lon OR District/State)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600">Latitude</label>
                            <input type="number" step="any" name="latitude" value={latitude} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Longitude</label>
                            <input type="number" step="any" name="longitude" value={longitude} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">District</label>
                            <input type="text" name="district" value={district} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">State</label>
                            <input type="text" name="state" value={state} onChange={onChange} className="mt-1 p-2 w-full border rounded" />
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4">
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">Save Farm</button>
                </div>
            </form>
        </div>
    );
};

export default FarmForm;
