import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosInstance';

const confidenceBadge = (confidence, low) => {
    if (low) return { text: 'Low Confidence', cls: 'bg-amber-100 text-amber-700' };
    if (confidence >= 85) return { text: 'High', cls: 'bg-[#d1fae5] text-[#065f46]' };
    if (confidence >= 65) return { text: 'Medium', cls: 'bg-blue-100 text-blue-700' };
    return { text: 'Low', cls: 'bg-red-100 text-red-700' };
};

const DiseaseHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/api/disease/history');
                setRecords(res.data);
            } catch (err) {
                setError(err.response?.data?.error || t('Failed to load detection history.'));
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    };

    return (
        <div className="page-content">

                {/* Page Header */}
                <div className="flex items-center justify-between page-header">
                    <div>
                        <h1 className="page-title">{t('Detection History')}</h1>
                        <p className="page-subtitle">
                            {t('All past plant disease analyses for your account')}
                        </p>
                    </div>
                    <Link
                        to="/disease-detection"
                        className="btn-primary text-sm flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('New Analysis')}
                    </Link>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm text-[#6b7280]">{t('Loading detection history...')}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && records.length === 0 && (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-[#1a2e2a] font-medium mb-1">{t('No detections yet')}</p>
                        <p className="text-[#6b7280] text-sm mb-4">
                            {t('history_empty_desc')}
                        </p>
                        <Link
                            to="/disease-detection"
                            className="inline-flex items-center gap-1.5 bg-[#065f46] hover:bg-[#059669] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            {t('Go to Disease Detection')}
                        </Link>
                    </div>
                )}

                {/* Records Table */}
                {!loading && records.length > 0 && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-sm font-medium text-[#374151]">
                                {records.length} {t('detection(s) found')}
                            </span>
                            <span className="text-xs text-gray-400">{t('Last 30 records')}</span>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {records.map((rec) => {
                                const badge = confidenceBadge(rec.confidence, rec.low_confidence);
                                const isOpen = expanded === rec.id;

                                return (
                                    <div key={rec.id}>
                                        <button
                                            onClick={() => setExpanded(isOpen ? null : rec.id)}
                                            className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${rec.low_confidence ? 'bg-amber-400' : 'bg-[#ecfdf5]0'}`}></div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-[#1a2e2a] truncate">
                                                            {rec.predicted_disease || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {formatDate(rec.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs text-[#6b7280]">{t('Confidence')}</p>
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {rec.confidence != null ? `${rec.confidence}%` : '—'}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.cls}`}>
                                                        {t(badge.text)}
                                                    </span>
                                                    <svg
                                                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Expanded Treatment Panel */}
                                        {isOpen && (
                                            <div className="px-5 pb-4 pt-0 bg-gray-50 border-t border-gray-100">
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1.5">
                                                        {t('Recommended Treatment')}
                                                    </p>
                                                    <p className="text-sm text-[#374151] leading-relaxed bg-white border border-gray-200 rounded-lg px-4 py-3">
                                                        {rec.treatment || t('No treatment information recorded.')}
                                                    </p>
                                                    {rec.low_confidence && (
                                                        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                                            </svg>
                                                            {t('low_confidence_note')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
    );
};

export default DiseaseHistory;
