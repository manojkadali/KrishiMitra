/**
 * Soil Test Lab Locator Service
 * Database of government and private soil testing labs across India.
 * Uses farmer location (lat/lon or state/district) to find nearest labs.
 */

// Comprehensive database of soil testing labs across major states
const SOIL_LABS = [
    // Andhra Pradesh
    { name: 'Regional Soil Testing Lab, Guntur', type: 'government', state: 'Andhra Pradesh', district: 'Guntur', address: 'Agriculture Research Station Campus, Lam, Guntur - 522034', phone: '0863-2354580', lat: 16.3067, lon: 80.4365, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free (Govt Scheme)', turnaround: '7-15 days' },
    { name: 'Soil Testing Lab, Tirupati', type: 'government', state: 'Andhra Pradesh', district: 'Tirupati', address: 'RARS Campus, Tirupati - 517502', phone: '0877-2248155', lat: 13.6288, lon: 79.4192, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'Acharya N G Ranga Agricultural University Lab', type: 'government', state: 'Andhra Pradesh', district: 'Guntur', address: 'ANGRAU Campus, Guntur', phone: '0863-2346100', lat: 16.3012, lon: 80.4428, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals'], sampleFee: '₹50-200', turnaround: '7-10 days' },

    // Telangana
    { name: 'State Soil Testing Lab, Hyderabad', type: 'government', state: 'Telangana', district: 'Hyderabad', address: 'Dept of Agriculture, Rajendranagar, Hyderabad - 500030', phone: '040-24015141', lat: 17.3216, lon: 78.4071, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'PJTSAU Soil Testing Lab', type: 'government', state: 'Telangana', district: 'Hyderabad', address: 'Rajendranagar, Hyderabad - 500030', phone: '040-24015000', lat: 17.3270, lon: 78.4028, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Soil Health Card'], sampleFee: 'Free', turnaround: '7-15 days' },
    { name: 'District Soil Testing Lab, Warangal', type: 'government', state: 'Telangana', district: 'Warangal', address: 'Agriculture Office Complex, Warangal - 506002', phone: '0870-2578900', lat: 17.9784, lon: 79.5941, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-20 days' },

    // Tamil Nadu
    { name: 'Dept of Soil Science, TNAU', type: 'government', state: 'Tamil Nadu', district: 'Coimbatore', address: 'Tamil Nadu Agricultural University, Coimbatore - 641003', phone: '0422-6611200', lat: 11.0129, lon: 76.9347, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals', 'Water Analysis'], sampleFee: '₹50-500', turnaround: '7-14 days' },
    { name: 'District Soil Testing Lab, Chennai', type: 'government', state: 'Tamil Nadu', district: 'Chennai', address: 'Salt Cottage Farm, Chennai - 600005', phone: '044-25360433', lat: 13.0604, lon: 80.2496, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'Soil Testing Lab, Madurai', type: 'government', state: 'Tamil Nadu', district: 'Madurai', address: 'Agricultural Research Station, Madurai - 625104', phone: '0452-2422955', lat: 9.9252, lon: 78.1198, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Karnataka
    { name: 'UAS Soil Testing Lab, Bangalore', type: 'government', state: 'Karnataka', district: 'Bangalore', address: 'University of Agricultural Sciences, GKVK, Bangalore - 560065', phone: '080-23330153', lat: 13.0789, lon: 77.5769, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Water Analysis'], sampleFee: '₹100-300', turnaround: '7-14 days' },
    { name: 'District Soil Testing Lab, Dharwad', type: 'government', state: 'Karnataka', district: 'Dharwad', address: 'UAS Campus, Dharwad - 580005', phone: '0836-2747483', lat: 15.4589, lon: 75.0078, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Maharashtra
    { name: 'State Soil Testing Lab, Pune', type: 'government', state: 'Maharashtra', district: 'Pune', address: 'Dept of Agriculture, Shivajinagar, Pune - 411005', phone: '020-25512729', lat: 18.5308, lon: 73.8474, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'MPKV Soil Testing Lab, Rahuri', type: 'government', state: 'Maharashtra', district: 'Ahmednagar', address: 'Mahatma Phule Krishi Vidyapeeth, Rahuri - 413722', phone: '02426-243219', lat: 19.3847, lon: 74.6491, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals'], sampleFee: '₹50-200', turnaround: '7-14 days' },
    { name: 'District Soil Testing Lab, Nagpur', type: 'government', state: 'Maharashtra', district: 'Nagpur', address: 'Agriculture Office, Civil Lines, Nagpur - 440001', phone: '0712-2533000', lat: 21.1458, lon: 79.0882, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-20 days' },
    { name: 'District Soil Testing Lab, Akola', type: 'government', state: 'Maharashtra', district: 'Akola', address: 'Dr. PDKV Campus, Akola - 444104', phone: '0724-2258022', lat: 20.7002, lon: 77.0082, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Gujarat
    { name: 'State Soil Testing Lab, Ahmedabad', type: 'government', state: 'Gujarat', district: 'Ahmedabad', address: 'Dept of Agriculture, Sector 10, Gandhinagar', phone: '079-23257656', lat: 23.2156, lon: 72.6369, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'AAU Soil Testing Lab, Anand', type: 'government', state: 'Gujarat', district: 'Anand', address: 'Anand Agricultural University, Anand - 388110', phone: '02692-261310', lat: 22.5645, lon: 72.9289, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Water Analysis'], sampleFee: '₹50-250', turnaround: '7-14 days' },

    // Madhya Pradesh
    { name: 'JNKVV Soil Testing Lab, Jabalpur', type: 'government', state: 'Madhya Pradesh', district: 'Jabalpur', address: 'JNKVV Campus, Jabalpur - 482004', phone: '0761-2681706', lat: 23.2117, lon: 79.9506, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: '₹50-200', turnaround: '7-14 days' },
    { name: 'District Soil Testing Lab, Bhopal', type: 'government', state: 'Madhya Pradesh', district: 'Bhopal', address: 'Agriculture Complex, Bhopal - 462004', phone: '0755-2551234', lat: 23.2599, lon: 77.4126, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Rajasthan
    { name: 'State Soil Testing Lab, Jaipur', type: 'government', state: 'Rajasthan', district: 'Jaipur', address: 'Dept of Agriculture, Pant Krishi Bhawan, Jaipur - 302005', phone: '0141-2227225', lat: 26.9124, lon: 75.7873, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'MPUAT Soil Testing Lab, Udaipur', type: 'government', state: 'Rajasthan', district: 'Udaipur', address: 'MPUAT Campus, Udaipur - 313001', phone: '0294-2471101', lat: 24.5854, lon: 73.7125, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals'], sampleFee: '₹50-300', turnaround: '7-14 days' },

    // Uttar Pradesh
    { name: 'State Soil Testing Lab, Lucknow', type: 'government', state: 'Uttar Pradesh', district: 'Lucknow', address: 'Agriculture Directorate, Lucknow - 226001', phone: '0522-2237440', lat: 26.8467, lon: 80.9462, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },
    { name: 'CSAUAT Soil Testing Lab, Kanpur', type: 'government', state: 'Uttar Pradesh', district: 'Kanpur', address: 'CSAUAT Campus, Kanpur - 208002', phone: '0512-2534156', lat: 26.4870, lon: 80.3495, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Water Analysis'], sampleFee: '₹50-200', turnaround: '7-14 days' },
    { name: 'BHU Soil Science Lab, Varanasi', type: 'government', state: 'Uttar Pradesh', district: 'Varanasi', address: 'Institute of Agricultural Sciences, BHU, Varanasi - 221005', phone: '0542-2368993', lat: 25.2677, lon: 82.9913, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals'], sampleFee: '₹100-500', turnaround: '7-14 days' },

    // Punjab
    { name: 'PAU Soil Testing Lab, Ludhiana', type: 'government', state: 'Punjab', district: 'Ludhiana', address: 'Punjab Agricultural University, Ludhiana - 141004', phone: '0161-2401960', lat: 30.9010, lon: 75.8573, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Water Analysis', 'Heavy Metals'], sampleFee: '₹50-300', turnaround: '5-10 days' },
    { name: 'District Soil Testing Lab, Patiala', type: 'government', state: 'Punjab', district: 'Patiala', address: 'Agriculture Dept, Patiala - 147001', phone: '0175-2211055', lat: 30.3398, lon: 76.3869, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Haryana
    { name: 'CCSHAU Soil Testing Lab, Hisar', type: 'government', state: 'Haryana', district: 'Hisar', address: 'CCS HAU Campus, Hisar - 125004', phone: '01662-284420', lat: 29.1492, lon: 75.7217, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Water Analysis'], sampleFee: '₹50-200', turnaround: '7-14 days' },
    { name: 'District Soil Testing Lab, Karnal', type: 'government', state: 'Haryana', district: 'Karnal', address: 'ICAR-IIWBR Complex, Karnal - 132001', phone: '0184-2267390', lat: 29.6857, lon: 76.9905, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Bihar
    { name: 'RAU Soil Testing Lab, Pusa', type: 'government', state: 'Bihar', district: 'Samastipur', address: 'Rajendra Agricultural University, Pusa - 848125', phone: '06274-240226', lat: 25.9876, lon: 85.6779, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: '₹50-200', turnaround: '7-14 days' },
    { name: 'District Soil Testing Lab, Patna', type: 'government', state: 'Bihar', district: 'Patna', address: 'Agriculture Dept, Patna - 800001', phone: '0612-2233555', lat: 25.6093, lon: 85.1376, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-15 days' },

    // West Bengal
    { name: 'BCKV Soil Testing Lab, Nadia', type: 'government', state: 'West Bengal', district: 'Nadia', address: 'Bidhan Chandra Krishi Viswavidyalaya, Mohanpur, Nadia - 741252', phone: '03473-222275', lat: 22.9456, lon: 88.5261, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients'], sampleFee: '₹50-200', turnaround: '7-14 days' },
    { name: 'State Soil Testing Lab, Kolkata', type: 'government', state: 'West Bengal', district: 'Kolkata', address: 'Writers Building Complex, Kolkata - 700001', phone: '033-22145678', lat: 22.5726, lon: 88.3639, services: ['NPK', 'pH', 'EC', 'Organic Carbon'], sampleFee: 'Free', turnaround: '10-15 days' },

    // Private labs (nationwide chains)
    { name: 'SGS India Pvt Ltd', type: 'private', state: 'Multiple', district: 'Multiple', address: 'Branches across India — visit sgs.com/india for nearest location', phone: '1800-102-3478', lat: 19.0760, lon: 72.8777, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals', 'Pesticide Residue', 'Water Analysis'], sampleFee: '₹500-5000', turnaround: '3-7 days' },
    { name: 'Intertek Testing Services', type: 'private', state: 'Multiple', district: 'Multiple', address: 'Multiple labs across India — visit intertek.com for locations', phone: '1800-200-5855', lat: 12.9716, lon: 77.5946, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals', 'Pesticide Residue', 'Fertility Report'], sampleFee: '₹800-6000', turnaround: '3-5 days' },
    { name: 'Spectro Analytical Labs', type: 'private', state: 'Multiple', district: 'Multiple', address: 'Head Office: Delhi. Labs in NCR, Punjab, Haryana, UP', phone: '011-27864821', lat: 28.6139, lon: 77.2090, services: ['NPK', 'pH', 'EC', 'Organic Carbon', 'Micronutrients', 'Heavy Metals', 'Water Analysis', 'Fertility Index'], sampleFee: '₹500-3000', turnaround: '5-7 days' },
];

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * Find nearest labs to a given location
 */
exports.findNearestLabs = (latitude, longitude, state, district, limit = 10) => {
    let results;

    if (latitude && longitude) {
        // Sort by distance
        results = SOIL_LABS.map(lab => ({
            ...lab,
            distance_km: haversineDistance(latitude, longitude, lab.lat, lab.lon),
        }));
        results.sort((a, b) => a.distance_km - b.distance_km);
    } else if (state) {
        // Filter by state, then optionally district
        const normalizedState = state.toLowerCase();
        const normalizedDistrict = (district || '').toLowerCase();

        results = SOIL_LABS.filter(lab => {
            if (lab.state === 'Multiple') return true;
            return lab.state.toLowerCase() === normalizedState;
        }).map(lab => ({
            ...lab,
            distance_km: null,
            matchType: lab.district.toLowerCase() === normalizedDistrict ? 'district' :
                        lab.state.toLowerCase() === normalizedState ? 'state' : 'national',
        }));

        // Sort: district match first, then state, then national
        const order = { district: 1, state: 2, national: 3 };
        results.sort((a, b) => (order[a.matchType] || 3) - (order[b.matchType] || 3));
    } else {
        // No location — return private national labs
        results = SOIL_LABS.filter(lab => lab.state === 'Multiple').map(lab => ({
            ...lab,
            distance_km: null,
        }));
    }

    return results.slice(0, limit);
};

/**
 * Get sample collection instructions
 */
exports.getSampleInstructions = () => ({
    title: 'How to Collect a Soil Sample',
    steps: [
        { step: 1, instruction: 'Collect samples from 10-15 spots across your field in a zigzag pattern.' },
        { step: 2, instruction: 'At each spot, dig a V-shaped hole 15-20 cm deep. Take a thin slice of soil from the clean side.' },
        { step: 3, instruction: 'Mix all collected samples thoroughly in a clean bucket.' },
        { step: 4, instruction: 'From the mixed soil, take about 500g (half kg) as your final sample.' },
        { step: 5, instruction: 'Air-dry the sample in shade (NOT in direct sunlight) for 2-3 days.' },
        { step: 6, instruction: 'Pack the dried sample in a clean cloth or plastic bag.' },
        { step: 7, instruction: 'Label the bag with: your name, farm location, crop grown, date of collection.' },
        { step: 8, instruction: 'Submit to the nearest soil testing lab within a week of collection.' },
    ],
    tips: [
        'Avoid sampling near boundaries, bunds, trees, or waterlogged areas.',
        'Do not sample immediately after applying fertilizer or manure — wait at least 4-6 weeks.',
        'Best time to sample: after harvest and before new sowing.',
        'Take separate samples from fields with different soil types or cropping patterns.',
    ],
});
