import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';
import locations from '../data/locations.json';

const SoilLabLocator = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [labs, setLabs] = useState([]);
    const [searchedBy, setSearchedBy] = useState(null);
    const [searchMethod, setSearchMethod] = useState('location'); // 'location' or 'state'
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [geoStatus, setGeoStatus] = useState('');
    const [instructions, setInstructions] = useState(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [selectedLab, setSelectedLab] = useState(null);

    const states = Object.keys(locations).sort();
    const districts = state ? Object.keys(locations[state] || {}).sort() : [];

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    const searchByLocation = () => {
        if (!navigator.geolocation) {
            setGeoStatus('Geolocation not supported by your browser');
            return;
        }
        setGeoStatus(t('Detecting your location...'));
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setGeoStatus(`Location: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
                try {
                    const res = await api.get('/api/soil-labs/search', {
                        params: { latitude: pos.coords.latitude, longitude: pos.coords.longitude, limit: 15 }
                    });
                    setLabs(res.data.labs);
                    setSearchedBy(res.data.searchedBy);
                } catch (err) {
                    setGeoStatus(t('Failed to search labs. Please try by state.'));
                }
                setLoading(false);
            },
            () => {
                setGeoStatus(t('Location access denied. Please try searching by state.'));
                setLoading(false);
            }
        );
    };

    const searchByState = async () => {
        if (!state) return;
        setLoading(true);
        try {
            const res = await api.get('/api/soil-labs/search', {
                params: { state, district, limit: 15 }
            });
            setLabs(res.data.labs);
            setSearchedBy(res.data.searchedBy);
        } catch (err) {
            console.error('Search error:', err);
        }
        setLoading(false);
    };

    const loadInstructions = async () => {
        if (instructions) {
            setShowInstructions(!showInstructions);
            return;
        }
        try {
            const res = await api.get('/api/soil-labs/sample-instructions');
            setInstructions(res.data);
            setShowInstructions(true);
        } catch (err) {
            console.error('Failed to load instructions:', err);
        }
    };

    const typeColor = (type) => type === 'government' ? 'bg-[#d1fae5] text-green-800' : 'bg-blue-100 text-blue-800';

    return (
        <div className="page-content">
                <div className="flex items-center justify-between page-header">
                    <div>
                        <h1 className="page-title">🧪 {t('Soil Test Lab Locator')}</h1>
                        <p className="page-subtitle">{t('Find the nearest soil testing labs for your farm')}</p>
                    </div>
                    <button
                        onClick={loadInstructions}
                        className="btn-secondary text-sm"
                    >
                        📋 {t('How to Collect Sample')}
                    </button>
                </div>

                {/* Sample Collection Instructions */}
                {showInstructions && instructions && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-amber-900 text-lg">{instructions.title}</h3>
                            <button onClick={() => setShowInstructions(false)} className="text-amber-700 hover:text-amber-900">✕</button>
                        </div>
                        <ol className="space-y-2 mb-4">
                            {instructions.steps.map((s) => (
                                <li key={s.step} className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-sm font-bold">{s.step}</span>
                                    <span className="text-amber-900">{s.instruction}</span>
                                </li>
                            ))}
                        </ol>
                        <h4 className="font-semibold text-amber-800 mb-2">💡 {t('Tips')}:</h4>
                        <ul className="list-disc ml-5 space-y-1 text-amber-800 text-sm">
                            {instructions.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                )}

                {/* Search Methods */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setSearchMethod('location')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                searchMethod === 'location' ? 'bg-green-600 text-white' : 'bg-gray-100 text-[#374151] hover:bg-gray-200'
                            }`}
                        >
                            📍 {t('Use My Location')}
                        </button>
                        <button
                            onClick={() => setSearchMethod('state')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                searchMethod === 'state' ? 'bg-green-600 text-white' : 'bg-gray-100 text-[#374151] hover:bg-gray-200'
                            }`}
                        >
                            🗺️ {t('Search by State/District')}
                        </button>
                    </div>

                    {searchMethod === 'location' ? (
                        <div>
                            <p className="text-[#4b6360] text-sm mb-3">{t('gps_desc')}</p>
                            <button
                                onClick={searchByLocation}
                                disabled={loading}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-[#065f46] disabled:opacity-50 font-medium"
                            >
                                {loading ? t('Searching...') : '🔍 ' + t('Find Nearest Labs')}
                            </button>
                            {geoStatus && <p className="text-sm text-[#6b7280] mt-2">{geoStatus}</p>}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-[#374151] mb-1">State</label>
                                <select
                                    value={state}
                                    onChange={(e) => { setState(e.target.value); setDistrict(''); }}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#059669]"
                                >
                                    <option value="">{t('Select State')}</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-[#374151] mb-1">District (optional)</label>
                                <select
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#059669]"
                                    disabled={!state}
                                >
                                    <option value="">{t('All Districts')}</option>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={searchByState}
                                disabled={loading || !state}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-[#065f46] disabled:opacity-50 font-medium"
                            >
                                {loading ? t('Searching...') : '🔍 ' + t('Search')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Results */}
                {labs.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                            Found {labs.length} lab{labs.length !== 1 ? 's' : ''}
                            {searchedBy === 'coordinates' && ' (sorted by distance)'}
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {labs.map((lab, i) => (
                                <div
                                    key={i}
                                    className={`bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer border-2 ${
                                        selectedLab === i ? 'border-[#059669]' : 'border-transparent'
                                    }`}
                                    onClick={() => setSelectedLab(selectedLab === i ? null : i)}
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-800 text-sm leading-snug">{lab.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(lab.type)}`}>
                                                {lab.type === 'government' ? '🏛️ ' + t('Govt') : '🏢 ' + t('Private')}
                                            </span>
                                        </div>
                                        <p className="text-[#6b7280] text-xs mb-2">
                                            {lab.state !== 'Multiple' ? `${lab.district}, ${lab.state}` : 'Pan-India'}
                                        </p>
                                        {lab.distance_km != null && (
                                            <span className="inline-block bg-[#ecfdf5] text-[#065f46] px-2 py-0.5 rounded-full text-xs font-medium mb-2">
                                                📏 {lab.distance_km} {t('km away')}
                                            </span>
                                        )}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {lab.services.slice(0, 4).map((s, j) => (
                                                <span key={j} className="bg-gray-100 text-[#4b6360] px-2 py-0.5 rounded text-xs">{s}</span>
                                            ))}
                                            {lab.services.length > 4 && (
                                                <span className="text-gray-400 text-xs">+{lab.services.length - 4} {t('more')}</span>
                                            )}
                                        </div>
                                        {/* Expanded details */}
                                        {selectedLab === i && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                                                <p><span className="font-medium text-[#374151]">📍 {t('Address')}:</span> {lab.address}</p>
                                                <p><span className="font-medium text-[#374151]">📞 {t('Phone')}:</span> <a href={`tel:${lab.phone}`} className="text-[#059669] hover:underline">{lab.phone}</a></p>
                                                <p><span className="font-medium text-[#374151]">💰 {t('Fee')}:</span> {lab.sampleFee}</p>
                                                <p><span className="font-medium text-[#374151]">⏱️ {t('Turnaround')}:</span> {lab.turnaround}</p>
                                                <p><span className="font-medium text-[#374151]">🔬 {t('All Services')}:</span> {lab.services.join(', ')}</p>
                                                {lab.lat && lab.state !== 'Multiple' && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${lab.lat},${lab.lon}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                                                    >
                                                        🗺️ {t('Open in Google Maps')}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && labs.length === 0 && searchedBy && (
                    <div className="text-center py-12 text-[#6b7280]">
                        <p className="text-4xl mb-3">🔬</p>
                        <p>{t('No labs found for this area. Try a broader search or use GPS location.')}</p>
                    </div>
                )}

                {!loading && !searchedBy && (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-5xl mb-3">🧪</p>
                        <p className="text-lg">{t('Search for soil testing labs near you')}</p>
                        <p className="text-sm mt-1">{t('Use GPS or select your state to find government and private labs')}</p>
                    </div>
                )}
            </div>
    );
};

export default SoilLabLocator;
