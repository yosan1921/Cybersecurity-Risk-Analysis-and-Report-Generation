'use client';

import { useState } from 'react';

interface ReportExporterProps {
    analysisId: string;
    companyName: string;
    onExportStart?: () => void;
    onExportComplete?: () => void;
}

export const ReportExporter = ({
    analysisId,
    companyName,
    onExportStart,
    onExportComplete
}: ReportExporterProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf' | 'powerpoint'>('pdf');
    const [error, setError] = useState<string | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setError(null);
            onExportStart?.();

            const response = await fetch('/api/reports/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId,
                    format: selectedFormat
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export failed');
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `risk-assessment.${selectedFormat === 'powerpoint' ? 'pptx' : selectedFormat}`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) filename = filenameMatch[1];
            }

            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            onExportComplete?.();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Export failed';
            setError(message);
            console.error('Export error:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Export Report</h3>

            <div className="space-y-4">
                {/* Format Selection */}
                <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">
                        Select Export Format
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { id: 'pdf', label: 'PDF Report', icon: '📄' },
                            { id: 'excel', label: 'Excel Spreadsheet', icon: '📊' },
                            { id: 'powerpoint', label: 'PowerPoint Presentation', icon: '🎯' }
                        ].map(format => (
                            <button
                                key={format.id}
                                onClick={() => setSelectedFormat(format.id as any)}
                                className={`p-4 rounded-lg border-2 transition-all ${selectedFormat === format.id
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                                    }`}
                            >
                                <div className="text-2xl mb-2">{format.icon}</div>
                                <div className="text-sm font-medium text-white">{format.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Format Description */}
                <div className="bg-slate-700 rounded p-3">
                    <p className="text-sm text-slate-300">
                        {selectedFormat === 'pdf' && 'Professional PDF report with executive summary, risk matrix, and detailed findings.'}
                        {selectedFormat === 'excel' && 'Comprehensive Excel workbook with multiple sheets including risk details, matrix, and charts.'}
                        {selectedFormat === 'powerpoint' && 'Executive presentation with slides covering summary, distribution, matrix, and recommendations.'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500 rounded p-3">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Export Button */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${isExporting
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                        }`}
                >
                    {isExporting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Generating {selectedFormat.toUpperCase()}...
                        </span>
                    ) : (
                        `Export as ${selectedFormat.toUpperCase()}`
                    )}
                </button>

                {/* Info */}
                <p className="text-xs text-slate-400 text-center">
                    Report for: <span className="font-semibold text-slate-300">{companyName}</span>
                </p>
            </div>
        </div>
    );
};