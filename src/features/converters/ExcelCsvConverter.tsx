import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    FileSpreadsheet,
    Trash2,
    Download,
    Eye,
    Loader2,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/AppContext';
import { WorkerManager } from '../../utils/WorkerManager';
import FileUploader from '../../components/FileUploader';
import TanStackDataTable from '../../components/TanStackDataTable';

const ExcelCsvConverter: React.FC = () => {
    const { state, setExcelCsv, setTaskStatus } = useAppStore();
    const { file, tableData, totalRows, fileName, isDirty, isParsing } = state.excelCsv;

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [saveMode, setSaveMode] = useState<'csv' | 'xlsx'>('csv');

    const excelWorkerRef = useRef<WorkerManager<any, any> | null>(null);
    const csvWorkerRef = useRef<WorkerManager<any, any> | null>(null);

    const initWorkers = useCallback(() => {
        if (!excelWorkerRef.current) {
            excelWorkerRef.current = new WorkerManager(
                () => new Worker(new URL('../../workers/excel.worker.ts', import.meta.url), { type: 'module' })
            );
        }
        if (!csvWorkerRef.current) {
            csvWorkerRef.current = new WorkerManager(
                () => new Worker(new URL('../../workers/csv.worker.ts', import.meta.url), { type: 'module' })
            );
        }
    }, []);

    useEffect(() => {
        return () => {
            excelWorkerRef.current?.terminate();
            excelWorkerRef.current = null;
            csvWorkerRef.current?.terminate();
            csvWorkerRef.current = null;
        };
    }, []);

    const handleFileSelect = async (selectedFile: File) => {
        setExcelCsv({ file: selectedFile, fileName: selectedFile.name, isDirty: false });
        setError(null);
        setExcelCsv({ tableData: [] });
    };

    const handlePreview = async () => {
        if (!file) return;

        setExcelCsv({ isParsing: true });
        setError(null);
        setTaskStatus({ state: 'running', label: 'Preparing preview' });
        excelWorkerRef.current?.cancelAll('Superseded by a newer preview request');
        csvWorkerRef.current?.cancelAll('Superseded by a newer preview request');
        initWorkers();

        // Add timeout protection
        const timeoutId = setTimeout(() => {
            setExcelCsv({ isParsing: false });
            setError('Processing timeout - file may be too large or corrupted. Try a smaller file.');
        }, 30000); // 30 second timeout

        try {
            const extension = file.name.split('.').pop()?.toLowerCase();
            const buffer = await file.arrayBuffer();

            if (extension === 'xlsx' || extension === 'xls') {
                const result = await excelWorkerRef.current!.postMessage('CONVERT_EXCEL', {
                    data: buffer,
                    type: 'excel-to-json',
                    options: { flatten: true }
                }, [buffer], 0);

                const data = Array.isArray(result.data) ? result.data : [result.data];

                if (!data || data.length === 0) {
                    throw new Error('No data found in Excel file');
                }

                setExcelCsv({
                    tableData: data.slice(0, 1000),
                    totalRows: data.length,
                    isParsing: false
                });
            } else if (extension === 'csv') {
                const result = await csvWorkerRef.current!.postMessage('CONVERT_CSV', {
                    data: buffer,
                    type: 'csv-to-json'
                }, [buffer], 0);

                const data = Array.isArray(result) ? result : [result];

                if (!data || data.length === 0) {
                    throw new Error('No data found in CSV file');
                }

                setExcelCsv({
                    tableData: data.slice(0, 1000),
                    totalRows: data.length,
                    isParsing: false
                });
            } else {
                throw new Error('Unsupported file format. Please upload XLSX or CSV.');
            }

            clearTimeout(timeoutId);
            setTaskStatus({ state: 'done', label: 'Preview ready' });
        } catch (err) {
            if (WorkerManager.isCancelledError(err)) return;
            setError(err instanceof Error ? err.message : 'Failed to parse file');
            setExcelCsv({ isParsing: false });
            setTaskStatus({ state: 'error', label: 'Preview failed' });
        }
    };

    const handleSave = async () => {
        if (tableData.length === 0) return;

        setIsLoading(true);
        setError(null);
        setTaskStatus({ state: 'running', label: `Exporting ${saveMode.toUpperCase()}` });
        excelWorkerRef.current?.cancelAll('Superseded by a newer export request');
        csvWorkerRef.current?.cancelAll('Superseded by a newer export request');
        initWorkers();

        // Add timeout protection for export
        const timeoutId = setTimeout(() => {
            setIsLoading(false);
            setError('Export timeout - file may be too large. Try exporting fewer rows.');
        }, 60000); // 60 second timeout

        try {
            const baseName = fileName.split('.')[0];
            const timestamp = Date.now();

            if (saveMode === 'csv') {
                const result = await csvWorkerRef.current!.postMessage('CONVERT_CSV', {
                    data: JSON.stringify(tableData),
                    type: 'json-to-csv'
                }, undefined, 0);

                const blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${baseName}_converted_${timestamp}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                const result = await excelWorkerRef.current!.postMessage('CONVERT_EXCEL', {
                    data: JSON.stringify(tableData),
                    type: 'json-to-excel'
                }, undefined, 0);

                const blob = new Blob([result.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${baseName}_converted_${timestamp}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            clearTimeout(timeoutId);
            setTaskStatus({ state: 'done', label: 'Export complete' });
        } catch (err) {
            if (WorkerManager.isCancelledError(err)) return;
            setError(err instanceof Error ? err.message : 'Export failed');
            setTaskStatus({ state: 'error', label: 'Export failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        excelWorkerRef.current?.cancelAll('Cleared by user');
        csvWorkerRef.current?.cancelAll('Cleared by user');
        setExcelCsv({
            file: null,
            tableData: [],
            totalRows: null,
            fileName: '',
            isDirty: false,
            isParsing: false,
        });
        setError(null);
    };

    const handleCancelCurrentTask = useCallback(() => {
        excelWorkerRef.current?.cancelAll('Cancelled by user');
        csvWorkerRef.current?.cancelAll('Cancelled by user');
        setExcelCsv({ isParsing: false });
        setIsLoading(false);
        setTaskStatus({ state: 'cancelled', label: 'Operation cancelled' });
    }, [setExcelCsv, setTaskStatus]);

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header / Actions Area */}
            <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm space-x-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Save As</span>
                        <select
                            value={saveMode}
                            onChange={(e) => setSaveMode(e.target.value as 'csv' | 'xlsx')}
                            className="text-xs font-bold text-indigo-600 bg-transparent focus:outline-none cursor-pointer"
                        >
                            <option value="csv">CSV Document</option>
                            <option value="xlsx">Excel Spreadsheet</option>
                        </select>
                    </div>

                    {file && (
                        <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm space-x-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filename</span>
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setExcelCsv({ fileName: e.target.value })}
                                className="text-xs font-bold text-gray-700 bg-transparent focus:outline-none w-40"
                                placeholder="Export name..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={handleClear} className="btn-secondary h-11 px-5">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-bold">Reset</span>
                    </button>
                    {(isParsing || isLoading) && (
                        <button onClick={handleCancelCurrentTask} className="btn-secondary h-11 px-5">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-bold">Cancel</span>
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isLoading || tableData.length === 0}
                        className="btn-primary-gradient h-11 px-8 shadow-indigo-100"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="text-sm font-bold">Export Result</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden min-h-0 gap-8">
                {/* Left Panel: Source */}
                <div className="w-[320px] flex flex-col space-y-4 min-h-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Source</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Input Spreadsheet</p>
                    </div>

                    <div className="flex-1 flex flex-col premium-card overflow-hidden">
                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center animate-float">
                                <FileSpreadsheet className="w-10 h-10 text-indigo-600" />
                            </div>
                            <div className="text-center space-y-2 mb-4 px-4">
                                <p className="font-bold text-gray-900">Upload Data File</p>
                                <p className="text-xs text-gray-500 leading-relaxed">Select any .xlsx, .xls, or .csv file to begin processing.</p>
                            </div>
                            <FileUploader
                                accept=".xlsx,.xls,.csv"
                                onFileSelect={handleFileSelect}
                                onClear={() => setExcelCsv({ file: null })}
                                currentFile={file}
                            />
                            {file && (
                                <button
                                    onClick={handlePreview}
                                    disabled={isParsing}
                                    className="btn-primary h-12 w-full mt-4 shadow-indigo-200"
                                >
                                    {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                    <span className="text-sm">Compute Preview</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Viewport */}
                <div className="flex-1 flex flex-col space-y-4 min-h-0 min-w-0">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                Live Editor {totalRows !== null && <span className="text-indigo-600 ml-2 opacity-50 font-normal">({totalRows} Records)</span>}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Edit data before export</p>
                        </div>
                        {isDirty && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full font-black tracking-widest animate-pulse">
                                UNSAVED CHANGES
                            </span>
                        )}
                    </div>

                    <div className="flex-1 premium-card overflow-hidden relative bg-white/50">
                        {isParsing && (
                            <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                                    <div className="absolute inset-0 blur-xl bg-indigo-400/20 animate-pulse" />
                                </div>
                                <p className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase">Processing Data Stream</p>
                            </div>
                        )}

                        <div className="h-full animate-in fade-in zoom-in-95 duration-700">
                            {tableData.length > 0 ? (
                                <TanStackDataTable
                                    data={tableData}
                                    onDataChange={(newData) => {
                                        setExcelCsv({ tableData: newData, isDirty: true });
                                    }}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                        <FileSpreadsheet className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold tracking-tight">Input data to generate preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-3xl animate-in slide-in-from-bottom-6 min-w-[500px] shadow-2xl shadow-red-100/50">
                    <div className="flex items-center space-x-5 text-red-900 text-sm">
                        <div className="bg-red-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200 rotate-3">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <p className="font-black uppercase tracking-[0.1em] text-[10px] text-red-600/60 mb-1">Transformation Kernel Fault</p>
                            <p className="font-bold text-red-900 leading-snug">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="p-3 hover:bg-red-100 rounded-xl transition-colors">
                            <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelCsvConverter;
