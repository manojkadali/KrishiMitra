import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const DiseaseDetection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const { t } = useTranslation();

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            setError(t('invalid_image'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError(t('image_too_large'));
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        setError(null);
    };

    const handleFileSelect = (e) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const res = await api.post('/api/disease/detect', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
        } catch (err) {
            if (err.response?.data?.fallback) {
                setError(t('service_unavailable'));
            } else {
                setError(err.response?.data?.error || t('analysis_failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const confidenceColor = (conf, low) => {
        if (low) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
        if (conf >= 85) return { bar: 'bg-[#ecfdf5]0', text: 'text-[#065f46]', bg: 'bg-[#ecfdf5] border-green-200' };
        if (conf >= 65) return { bar: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
        return { bar: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50 border-red-200' };
    };

    return (
        <div className="page-content">

                {/* Page Header */}
                <div className="flex items-center justify-between page-header">
                    <div>
                        <h1 className="page-title">{t('Plant Disease Detection')}</h1>
                        <p className="page-subtitle">
                            {t('disease_det_subtitle')}
                        </p>
                    </div>
                    <Link
                        to="/disease-history"
                        className="btn-secondary text-sm hidden sm:flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('View History')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── Upload Panel ──────────────────────────────────── */}
                    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-[#1a2e2a]">{t('Select or Capture Leaf Image')}</h2>
                            <p className="text-xs text-[#6b7280] mt-0.5">
                                {t('upload_hint')}
                            </p>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 text-center p-8
                                    ${dragOver
                                        ? 'border-[#059669] bg-[#ecfdf5] scale-[1.02]'
                                        : previewUrl
                                            ? 'border-[#6ee7b7] bg-[#ecfdf5]'
                                            : 'border-gray-200 hover:border-[#059669] hover:bg-[#ecfdf5]/30 hover:scale-[1.01]'
                                    }`}
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Selected leaf"
                                        className="max-h-56 mx-auto rounded-lg object-contain"
                                    />
                                ) : (
                                    <div>
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-[#374151]">
                                            {t('drag_drop')}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t('mobile_hint')}
                                        </p>
                                    </div>
                                )}

                                {/* Hidden file input — supports camera capture on mobile */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="leaf-upload"
                                />
                            </div>

                            {/* File info row */}
                            {selectedFile && (
                                <div className="flex items-center justify-between text-xs text-[#6b7280] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                    <span className="truncate font-medium text-[#374151] mr-2">{selectedFile.name}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span>{(selectedFile.size / 1024).toFixed(0)} KB</span>
                                        <button onClick={clearAll} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-[#374151] text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                                >
                                    {t('Browse Files')}
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || loading}
                                    className="flex-1 bg-[#065f46] hover:bg-[#059669] disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            {t('Analysing...')}
                                        </span>
                                    ) : t('Analyse Leaf')}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Supported Crops Notice */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                <span className="font-medium text-[#6b7280]">{t('Supported crops')}:</span>{' '}
                                {t('supported_crops_detail')}
                            </p>
                        </div>
                    </div>

                    {/* ── Results Panel ─────────────────────────────────── */}
                    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in stagger-2">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-[#1a2e2a]">{t('Analysis Results')}</h2>
                            <p className="text-xs text-[#6b7280] mt-0.5">
                                Disease identification and recommended treatment will appear here.
                            </p>
                        </div>

                        <div className="p-5">
                            {/* Empty state */}
                            {!result && !loading && (
                                <div className="text-center py-14">
                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-[#4b6360]">{t('No results yet')}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {t('Upload a leaf image and click Analyse Leaf to begin.')}
                                    </p>
                                </div>
                            )}

                            {/* Loading state */}
                            {loading && (
                                <div className="text-center py-14">
                                    <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-sm font-medium text-[#374151]">{t('Analysing leaf image...')}</p>
                                    <p className="text-xs text-gray-400 mt-1">{t('analysis_processing')}</p>
                                </div>
                            )}

                            {/* Result */}
                            {result && !loading && (() => {
                                const conf = confidenceColor(result.confidence, result.low_confidence);
                                return (
                                    <div className="space-y-4 animate-fade-in-up">
                                        {result.low_confidence && (
                                            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm animate-shake">
                                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span>{t('low_confidence_warning')}</span>
                                            </div>
                                        )}

                                        {/* Disease Name */}
                                        <div className={`border rounded-xl p-4 ${conf.bg} animate-scale-bounce`}>
                                            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1">{t('Detected Condition')}</p>
                                            <p className={`text-2xl font-bold ${result.disease === 'Uncertain' ? 'text-amber-600' : 'text-[#1a2e2a]'}`}>
                                                {result.disease}
                                            </p>
                                        </div>

                                        {/* Confidence Score */}
                                        <div>
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-[#4b6360] font-medium">{t('Confidence Score')}</span>
                                                <span className={`font-bold ${conf.text}`}>{result.confidence}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-2 rounded-full animate-progress ${conf.bar}`}
                                                    style={{ width: `${result.confidence}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Treatment */}
                                        <div>
                                            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">{t('Recommended Treatment')}</p>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                                <p className="text-sm text-[#374151] leading-relaxed">{result.treatment}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-2">
                                            <button onClick={clearAll}
                                                className="flex-1 border border-gray-300 hover:bg-gray-50 text-[#374151] text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                                {t('Analyse Another')}
                                            </button>
                                            <Link to="/disease-history"
                                                className="flex-1 text-center border border-[#6ee7b7] hover:bg-[#ecfdf5] text-[#065f46] text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                                {t('View History')}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="mt-8 border border-gray-200 rounded-xl bg-white shadow-sm px-6 py-5 animate-fade-in stagger-3">
                    <h3 className="text-sm font-semibold text-[#1a2e2a] mb-4">{t('How Disease Detection Works')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { step: '1', title: t('Upload a Leaf Photo'), desc: t('step1_desc') },
                            { step: '2', title: t('AI Analyses the Image'), desc: t('step2_desc') },
                            { step: '3', title: t('Receive Treatment Advice'), desc: t('step3_desc') },
                        ].map(s => (
                            <div key={s.step} className="flex items-start gap-3">
                                <div className="w-7 h-7 bg-[#065f46] text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                    {s.step}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                                    <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
};

export default DiseaseDetection;
