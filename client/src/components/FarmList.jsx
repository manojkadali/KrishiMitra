import { Link } from 'react-router-dom';

const FarmList = ({ farms, onDelete }) => {
    if (farms.length === 0) {
        return <p className="text-gray-500 mt-4">No farms found. Create one above to get started.</p>;
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Farms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map(farm => (
                    <div key={farm.id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
                        <h4 className="text-lg font-bold text-gray-900">{farm.farm_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            <strong>Crop:</strong> {farm.current_crop} <br />
                            <strong>Area:</strong> {farm.area_acres} Acres <br />
                            <strong>Soil:</strong> {farm.soil_type} {farm.soil_ph && `(pH ${farm.soil_ph})`}
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
                                Delete Farm
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FarmList;
