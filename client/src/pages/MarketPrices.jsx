import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import locationsData from '../data/locations.json';

const MarketPrices = () => {
    // Result State
    const [bestMarket, setBestMarket] = useState(null);
    const [otherMarkets, setOtherMarkets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fallbackTriggered, setFallbackTriggered] = useState(false);

    // Dropdown Logic Arrays
    const states = Object.keys(locationsData);

    // Form State (Required)
    const [stateLocation, setStateLocation] = useState('');
    const [district, setDistrict] = useState('');
    const [crop, setCrop] = useState('Wheat');

    // Dynamic Lists
    const currentDistricts = stateLocation ? Object.keys(locationsData[stateLocation]) : [];

    // Handlers
    const handleStateChange = (e) => {
        setStateLocation(e.target.value);
        setDistrict(''); // Reset district when state changes
        setBestMarket(null);
        setOtherMarkets([]);
    };

    const handleDistrictChange = (e) => {
        setDistrict(e.target.value);
        setBestMarket(null);
        setOtherMarkets([]);
    };

    const fetchPrices = async () => {
        if (!stateLocation || !district || !crop) {
            setError("Please select a State, District, and Commodity.");
            return;
        }

        setLoading(true);
        setError(null);
        setFallbackTriggered(false);
        setBestMarket(null);
        setOtherMarkets([]);

        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:5000/api/market/prices?state=${encodeURIComponent(stateLocation)}&district=${encodeURIComponent(district)}&commodity=${encodeURIComponent(crop)}`;

            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.data.bestMarket && (!res.data.otherMarkets || res.data.otherMarkets.length === 0)) {
                setError(`No market data found for ${crop} in ${res.data.fallbackTriggered ? stateLocation : district}.`);
            } else {
                setBestMarket(res.data.bestMarket);
                setOtherMarkets(res.data.otherMarkets || []);
                setFallbackTriggered(res.data.fallbackTriggered);
            }
            
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || err.response?.data?.error || "Failed to fetch market prices from Agmarknet API");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchPrices();
    };

    // Reusable Card Component
    const MarketCard = ({ price, isBest }) => (
        <div className={`rounded-xl shadow-lg border overflow-hidden flex flex-col transition ${isBest ? 'bg-blue-50 border-blue-400 transform scale-105 z-10' : 'bg-white hover:shadow-xl'}`}>
            <div className={`${isBest ? 'bg-blue-600' : 'bg-gray-800'} text-white p-4 flex justify-between items-center`}>
                <div>
                    <h3 className="text-xl font-bold">{price.commodity}</h3>
                    <p className={`${isBest ? 'text-blue-100' : 'text-gray-300'} text-sm font-medium`}>{price.market} Market</p>
                </div>
                {isBest && <span className="bg-yellow-400 text-yellow-900 text-xs font-black uppercase px-3 py-1 rounded-full shadow-sm">Top Price</span>}
            </div>
            <div className="p-5 flex-grow">
                <div className="mb-4 text-center">
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Modal Price</p>
                    <p className={`text-4xl font-extrabold ${isBest ? 'text-blue-700' : 'text-green-600'}`}>₹{price.modal_price}<span className="text-sm text-gray-500 font-medium">/q</span></p>
                </div>
                <div className="flex justify-between border-t border-b py-3 mb-4">
                    <div className="text-center w-1/2 border-r">
                        <p className="text-xs text-gray-500 uppercase font-bold">Min</p>
                        <p className="font-bold text-gray-800">₹{price.min_price}</p>
                    </div>
                    <div className="text-center w-1/2">
                        <p className="text-xs text-gray-500 uppercase font-bold">Max</p>
                        <p className="font-bold text-gray-800">₹{price.max_price}</p>
                    </div>
                </div>
                <p className="text-xs text-center text-gray-400 font-medium pb-2 border-b">Arrival Date: {price.arrival_date}</p>
                
                <div className={`mt-4 p-3 border-l-4 flex items-center shadow-inner rounded-r-lg
                    ${price.advisoryType === 'hold' ? 'bg-orange-50 border-orange-500 text-orange-800' : 
                      price.advisoryType === 'sell' ? 'bg-green-50 border-green-500 text-green-800' : 
                      'bg-gray-50 border-gray-500 text-gray-800'}
                `}>
                    <div>
                        <p className="text-xs uppercase font-bold tracking-wider mb-1 opacity-70">Advisory</p>
                        <p className="font-bold text-sm">{price.advisory}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row md:justify-between items-center bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Market Price Assistant</h1>
                    <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold px-4 py-2 bg-blue-50 rounded transition">&larr; Dashboard</Link>
                </div>

                {/* Filter Form */}
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500 mb-8">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-lg font-bold text-gray-700 mb-4 pb-2 border-b">Target Market Selection</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                            {/* State Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                                <select 
                                    value={stateLocation} 
                                    onChange={handleStateChange} 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition cursor-pointer" 
                                    required
                                >
                                    <option value="" disabled>Select State</option>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* District Dropdown */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                                <select 
                                    value={district} 
                                    onChange={handleDistrictChange} 
                                    disabled={!stateLocation}
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
                                    required
                                >
                                    <option value="" disabled>Select District</option>
                                    {currentDistricts.map(dist => (
                                        <option key={dist} value={dist}>{dist}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Commodity Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Commodity <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={crop} 
                                    onChange={(e) => setCrop(e.target.value)} 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition" 
                                    required 
                                    placeholder="e.g., Wheat, Cotton" 
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button 
                                type="submit" 
                                disabled={loading || !stateLocation || !district || !crop} 
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center min-w-[200px]"
                            >
                                {loading ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div> Fetching Data...</>
                                ) : 'Analyze Market Prices'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notifications Area */}
                {fallbackTriggered && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-md shadow-sm">
                        <p className="font-bold">District Not Found in Live Records</p>
                        <p>No active market data was found today specifically for {district}. Showing statewide optimal results for {stateLocation}.</p>
                    </div>
                )}
                
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm font-medium">{error}</div>}

                {/* Best Market Highlight */}
                {!loading && bestMarket && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
                            <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">🏆</span> Most Profitable Market
                        </h2>
                        <div className="max-w-md mx-auto sm:max-w-none sm:w-[400px]">
                            <MarketCard price={bestMarket} isBest={true} />
                        </div>
                    </div>
                )}

                {/* Other Markets */}
                {!loading && otherMarkets.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-700 mb-6 border-b pb-2">Alternative Nearby Markets</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherMarkets.map((price, idx) => (
                                <MarketCard key={idx} price={price} isBest={false} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketPrices;
