import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const DiseaseDetection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null); // Clear old results
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/disease/detect', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.fallback) {
                setError("Disease detection service is currently unavailable. Please try again later.");
            } else {
                setError(err.response?.data?.error || "Failed to process image.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Crop Disease Detection</h1>
                    <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">&larr; Dashboard</Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
                    <p className="mb-4 text-gray-600">Upload a clear picture of a damaged plant leaf to detect potential diseases and receive treatment advice.</p>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Select Image
                        </label>
                        {selectedFile && <span className="mt-2 text-sm text-gray-500">{selectedFile.name}</span>}
                    </div>

                    {previewUrl && (
                        <div className="mt-6 flex justify-center">
                            <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg shadow-sm border" />
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || loading}
                            className={`w-full md:w-auto px-6 py-3 rounded text-white font-bold transition ${!selectedFile || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'
                                }`}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Leaf'}
                        </button>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Result State */}
                    {result && (
                        <div className={`mt-8 p-6 rounded-lg border-2 shadow-sm ${result.low_confidence ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Analysis Results</h2>

                            {result.low_confidence && (
                                <div className="mb-4 bg-orange-100 text-orange-800 p-3 rounded text-sm font-semibold flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                    Confidence is low. Ensure the image is focused clearly on the leaf.
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Detected Disease</p>
                                    <p className={`text-xl font-bold ${result.disease === 'Uncertain' ? 'text-orange-600' : 'text-gray-900'}`}>{result.disease}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Confidence Score</p>
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                            <div className={`h-2.5 rounded-full ${result.low_confidence ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${result.confidence}%` }}></div>
                                        </div>
                                        <span className="font-bold text-gray-700">{result.confidence}%</span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 mt-2">
                                    <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Recommended Treatment</p>
                                    <p className="text-gray-800 bg-white p-3 rounded border text-sm italic">{result.treatment}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiseaseDetection;
