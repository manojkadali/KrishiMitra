import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const FarmMap = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
        loadLeaflet();
        fetchFarms();
    }, [navigate]);

    const loadLeaflet = () => {
        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
        // Load Leaflet JS
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => setLeafletLoaded(true);
            document.head.appendChild(script);
        } else {
            setLeafletLoaded(true);
        }
    };

    const fetchFarms = async () => {
        try {
            const res = await api.get('/api/farms');
            setFarms(res.data);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => {
        if (!leafletLoaded || !mapRef.current) return;
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const L = window.L;
        const farmsWithLocation = farms.filter(f => f.latitude && f.longitude);

        // Default center: India
        let center = [20.5937, 78.9629];
        let zoom = 5;

        if (farmsWithLocation.length > 0) {
            center = [farmsWithLocation[0].latitude, farmsWithLocation[0].longitude];
            zoom = 8;
        }

        const map = L.map(mapRef.current).setView(center, zoom);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 18,
        }).addTo(map);

        // Add markers for each farm
        farmsWithLocation.forEach(farm => {
            const marker = L.marker([farm.latitude, farm.longitude]).addTo(map);

            const popupContent = `
                <div style="min-width:180px">
                    <strong style="font-size:14px">${farm.farm_name}</strong><br/>
                    <span style="color:#666;font-size:12px">
                        Crop: ${farm.current_crop}<br/>
                        Area: ${farm.area_acres} acres<br/>
                        Soil: ${farm.soil_type}<br/>
                        ${farm.district ? `District: ${farm.district}<br/>` : ''}
                        ${farm.state ? `State: ${farm.state}` : ''}
                    </span>
                </div>
            `;
            marker.bindPopup(popupContent);
            marker.on('click', () => setSelectedFarm(farm));
        });

        // Fit bounds if multiple farms
        if (farmsWithLocation.length > 1) {
            const bounds = L.latLngBounds(farmsWithLocation.map(f => [f.latitude, f.longitude]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [leafletLoaded, farms]);

    const farmsWithLocation = farms.filter(f => f.latitude && f.longitude);
    const farmsWithoutLocation = farms.filter(f => !f.latitude || !f.longitude);

    return (
        <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">{t('Farm Map')}</h1>
                    <p className="page-subtitle">{t('Visualize all your farms on an interactive map')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Map */}
                    <div className="lg:col-span-3">
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div ref={mapRef} style={{ height: '500px', width: '100%' }} className="z-0" />
                        </div>
                        {farmsWithoutLocation.length > 0 && (
                            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs text-yellow-700">
                                    {farmsWithoutLocation.length} {t('farm(s) without coordinates')}:
                                    {' '}{farmsWithoutLocation.map(f => f.farm_name).join(', ')}.
                                    {t('Add latitude/longitude to display on map.')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Farm List Sidebar */}
                    <div className="lg:col-span-1 space-y-3">
                        <div className="glass-card rounded-2xl p-4">
                            <h3 className="text-sm font-semibold text-[#374151] mb-3">
                                My Farms ({farms.length})
                            </h3>
                            {loading ? (
                                <p className="text-sm text-[#6b7280]">{t('Loading farms map...')}</p>
                            ) : farms.length === 0 ? (
                                <p className="text-sm text-[#6b7280]">{t('No farms registered yet.')}</p>
                            ) : (
                                <div className="space-y-2 max-h-[450px] overflow-y-auto">
                                    {farms.map(farm => (
                                        <button key={farm.id}
                                            onClick={() => {
                                                setSelectedFarm(farm);
                                                if (farm.latitude && farm.longitude && mapInstanceRef.current) {
                                                    mapInstanceRef.current.setView([farm.latitude, farm.longitude], 12);
                                                }
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                                                selectedFarm?.id === farm.id
                                                    ? 'bg-[#ecfdf5] border-[#6ee7b7]'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}>
                                            <p className="font-medium text-[#1a2e2a]">{farm.farm_name}</p>
                                            <p className="text-xs text-[#6b7280] mt-0.5">
                                                {farm.current_crop} · {farm.area_acres} {t('acres')} · {farm.soil_type}
                                            </p>
                                            {farm.district && <p className="text-xs text-gray-400">{farm.district}, {farm.state}</p>}
                                            {!farm.latitude && <span className="text-xs text-yellow-600">{t('No coordinates')}</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedFarm && (
                            <div className="glass-card rounded-2xl border border-[#d1fae5] p-4">
                                <h3 className="text-sm font-semibold text-[#065f46] mb-2">{t('Selected Farm')}</h3>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Name')}</span><span className="font-medium">{selectedFarm.farm_name}</span></div>
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Crop')}</span><span className="font-medium">{selectedFarm.current_crop}</span></div>
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Area')}</span><span className="font-medium">{selectedFarm.area_acres} {t('acres')}</span></div>
                                    <div className="flex justify-between"><span className="text-[#6b7280]">{t('Soil')}</span><span className="font-medium">{selectedFarm.soil_type}</span></div>
                                    {selectedFarm.irrigation_type && <div className="flex justify-between"><span className="text-[#6b7280]">Irrigation</span><span className="font-medium">{selectedFarm.irrigation_type}</span></div>}
                                    {selectedFarm.soil_ph && <div className="flex justify-between"><span className="text-[#6b7280]">pH</span><span className="font-medium">{selectedFarm.soil_ph}</span></div>}
                                    {selectedFarm.latitude && <div className="flex justify-between"><span className="text-[#6b7280]">{t('Lat/Lon')}</span><span className="font-medium text-xs">{selectedFarm.latitude}, {selectedFarm.longitude}</span></div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
};

export default FarmMap;
