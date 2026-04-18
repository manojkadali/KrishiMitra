import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FarmList = ({ farms, onDelete }) => {
    const { t } = useTranslation();
    if (farms.length === 0) {
        return <p className="text-[#6b7280] mt-4">{t('No farms yet')}</p>;
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('My Farms')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm, idx) => (
                    <div key={farm.id} className={`glass-card rounded-2xl p-6 border-t-4 border-[#059669] hover-lift card-shine animate-fade-in stagger-${Math.min(idx + 1, 6)}`}>
                        <h4 className="text-lg font-bold text-[#1a2e2a]">{farm.farm_name}</h4>
                        <p className="text-sm text-[#4b6360] mt-1">
                            <strong>{t('Crop')}:</strong> {farm.current_crop} <br />
                            <strong>{t('Area')}:</strong> {farm.area_acres} Acres <br />
                            <strong>{t('Soil')}:</strong> {farm.soil_type} {farm.soil_ph && `(pH ${farm.soil_ph})`}
                        </p>

                        <div className="mt-4 flex flex-col space-y-2">
                            <Link
                                to={`/advisory/${farm.id}`}
                                className="text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                            >
                                Generate Advisory
                            </Link>
                            <button
                                onClick={() => onDelete(farm.id)}
                                className="text-center bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded transition"
                            >
                                {t('Delete Farm')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FarmList;
