import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    Download,
    Loader2,
    Trash2,
    AlertCircle,
    ArrowRightLeft,
    Table as TableIcon,
    Code,
    Eye,
    ChevronDown
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { WorkerManager } from '../../utils/WorkerManager';
import FileUploader from '../../components/FileUploader';
import TanStackDataTable from '../../components/TanStackDataTable';
import type { CsvConversionRequest } from '../../workers/csv.worker';
import { useAppStore } from '../../store/AppContext';

type ConversionMode = 'json-to-csv' | 'csv-to-json';
type ViewType = 'json' | 'table';

const JsonCsvConverter: React.FC = () => {
    const { state, setJsonCsv } = useAppStore();
    const {
        file,
        inputData,
        tableData,
        mode,
        totalRows,
        flatten,
        delimiter,
        isDirectMode
    } = state.jsonCsv;

    const [resultData, setResultData] = useState<any>(null);
    const [viewType, setViewType] = useState<ViewType>('table');
    const [showExportMenu, setShowExportMenu] = useState(false);

    // State setters tied to global store
    const setFile = (val: File | null) => setJsonCsv({ file: val });
    const setInputData = (val: string) => setJsonCsv({ inputData: val });
    const setTableData = (val: any[]) => setJsonCsv({ tableData: val });
    const setMode = (val: ConversionMode) => setJsonCsv({ mode: val });
    const setTotalRows = (val: number | null) => setJsonCsv({ totalRows: val });

    const setFlatten = (val: boolean) => setJsonCsv({ flatten: val });
    const setDelimiter = (val: string) => setJsonCsv({ delimiter: val });
    const setIsDirectMode = (val: boolean) => setJsonCsv({ isDirectMode: val });
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editorOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 12,
        lineNumbers: 'on' as const,
        folding: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on' as const,
        padding: { top: 12, bottom: 12 },
        formatOnPaste: false,
        formatOnType: false,
    }), []);

    const workerRef = useRef<WorkerManager<CsvConversionRequest, any> | null>(null);

    const initWorker = useCallback(() => {
        if (!workerRef.current) {
            workerRef.current = new WorkerManager<CsvConversionRequest, any>(
                new URL('../../workers/csv.worker.ts', import.meta.url)
            );
        }
    }, []);

    const validateAndPreview = useCallback(async () => {
        setError(null);

        if (mode === 'json-to-csv') {
            if (!inputData.trim() && !file) {
                setError('Please enter JSON data or upload a file first');
                return;
            }
        } else {
            if (!file) {
                setError('Please upload a CSV file first');
                return;
            }
        }

        setIsParsing(true);
        initWorker();

        try {
            let data: any;
            let transfer: Transferable[] | undefined;

            if (mode === 'json-to-csv') {
                if (isDirectMode && file) {
                    data = await file.arrayBuffer();
                    transfer = [data];
                } else {
                    data = inputData;
                }

                const result = await workerRef.current!.postMessage('PARSE_FOR_PREVIEW' as any, {
                    data,
                    options: { flatten }
                }, transfer);

                setTableData(result.data);
                setTotalRows(result.totalRows);
                setViewType('table');

            } else {
                // CSV-to-JSON preview
                data = await file!.arrayBuffer();
                transfer = [data];

                const result = await workerRef.current!.postMessage('CONVERT_CSV', {
                    data,
                    type: 'csv-to-json',
                    options: { delimiter, flatten }
                }, transfer);

                const jsonData = result;
                setResultData(jsonData);
                setTableData(Array.isArray(jsonData) ? jsonData.slice(0, 1000) : [jsonData]);
                setTotalRows(Array.isArray(jsonData) ? jsonData.length : 1);
                setViewType('table');

            }
        } catch (e) {
            setError(`Preview failed: ${e instanceof Error ? e.message : 'Invalid data structure'}`);
        } finally {
            setIsParsing(false);
        }
    }, [inputData, file, isDirectMode, flatten, delimiter, initWorker, mode]);

    const handleFileSelect = async (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setTableData([]);
        setTotalRows(null);

        if (selectedFile.size > 1 * 1024 * 1024) {
            setIsDirectMode(true);
            setInputData('');
        } else {
            setIsDirectMode(false);
            if (mode === 'json-to-csv' && selectedFile.name.toLowerCase().endsWith('.json')) {
                try {
                    const text = await selectedFile.text();
                    setInputData(text);
                } catch (err) {
                    setError('Failed to read JSON file');
                }
            }
        }
    };

    const handleClear = () => {
        setFile(null);
        setInputData('');
        setTableData([]);
        setTotalRows(null);
        setResultData(null);
        setError(null);
        setIsDirectMode(false);
    };



    const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
        if (tableData.length === 0) {
            setError('No data to export');
            return;
        }

        setIsLoading(true);
        setError(null);
        setShowExportMenu(false);

        try {
            if (format === 'xlsx') {
                // Dynamic import of xlsx library
                const XLSX = await import('xlsx');
                const ws = XLSX.utils.json_to_sheet(tableData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Data');
                XLSX.writeFile(wb, `exported_${Date.now()}.xlsx`);
            } else if (format === 'csv') {
                // Use existing worker for CSV export
                initWorker();
                const data = JSON.stringify(tableData);
                const result = await workerRef.current!.postMessage('CONVERT_CSV', {
                    data,
                    type: 'json-to-csv',
                    options: { delimiter, flatten: false }
                });

                const blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `exported_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else if (format === 'json') {
                // JSON export
                const blob = new Blob([JSON.stringify(tableData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `exported_${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError(`Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv');
        handleClear();
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header / Actions Area */}
            <div className="flex items-center justify-between px-1 shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleMode}
                        className="btn-secondary h-11 px-5 border-indigo-100 group/mode"
                    >
                        <ArrowRightLeft className="w-4 h-4 text-indigo-500 group-hover/mode:rotate-180 transition-transform duration-500" />
                        <span className="text-sm font-bold">{mode === 'json-to-csv' ? 'JSON to CSV' : 'CSV to JSON'}</span>
                    </button>

                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm space-x-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delimiter</span>
                        <select
                            value={delimiter}
                            onChange={(e) => setDelimiter(e.target.value)}
                            className="text-xs font-bold text-indigo-600 bg-transparent focus:outline-none cursor-pointer"
                        >
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="	">Tab (\t)</option>
                            <option value="|">Pipe (|)</option>
                        </select>
                    </div>

                    {mode === 'json-to-csv' && (
                        <label className="flex items-center space-x-2 cursor-pointer group bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all">
                            <input
                                type="checkbox"
                                checked={flatten}
                                onChange={(e) => setFlatten(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">Flatten</span>
                        </label>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <button onClick={handleClear} className="btn-secondary h-11 px-5">
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm font-bold">Reset</span>
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={isLoading || tableData.length === 0}
                            className="btn-primary-gradient h-11 px-8 shadow-indigo-100"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            <span className="text-sm">Export</span>
                            <ChevronDown className="w-3 h-3 ml-1" />
                        </button>

                        {showExportMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <TableIcon className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">Save as CSV</span>
                                    </button>
                                    <button
                                        onClick={() => handleExport('xlsx')}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <TableIcon className="w-4 h-4 text-emerald-600" />
                                        <span className="font-medium">Save as Excel (.xlsx)</span>
                                    </button>
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Code className="w-4 h-4 text-indigo-600" />
                                        <span className="font-medium">Save as JSON</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden min-h-0 gap-8">
                {/* Left Panel: Source */}
                <div className="w-[380px] flex flex-col space-y-4 min-h-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Source</h2>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Define your input data</p>
                    </div>

                    <div className="flex-1 flex flex-col premium-card overflow-hidden">
                        {mode === 'json-to-csv' ? (
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 relative min-h-0 border-b border-gray-50/50">
                                    {isDirectMode ? (
                                        <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-gray-50/30">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                                                <AlertCircle className="w-8 h-8 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">High-Performance Mode</p>
                                                <p className="text-xs text-gray-500 mt-2 leading-relaxed px-4">Direct memory access active. Text view disabled to preserve system resources.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsDirectMode(false)}
                                                className="text-[10px] text-indigo-600 font-black uppercase tracking-widest hover:underline"
                                            >
                                                Show text anyway
                                            </button>
                                        </div>
                                    ) : (
                                        <Editor
                                            height="100%"
                                            defaultLanguage="json"
                                            value={inputData}
                                            onChange={(value) => setInputData(value || '')}
                                            theme="light"
                                            options={{ ...editorOptions, padding: { top: 20, bottom: 20 } }}
                                        />
                                    )}
                                </div>
                                <div className="p-6 bg-gray-50/50 flex flex-col space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Or Import File</span>
                                        {file && mode === 'json-to-csv' && (
                                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">FILE LOADED</span>
                                        )}
                                    </div>
                                    <FileUploader
                                        accept=".json"
                                        onFileSelect={handleFileSelect}
                                        onClear={() => setFile(null)}
                                        currentFile={file}
                                        compact
                                    />
                                    <button
                                        onClick={validateAndPreview}
                                        disabled={isParsing || (!inputData.trim() && !file)}
                                        className="btn-primary h-11 w-full bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                        <span className="text-sm">Compute Table</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center animate-float">
                                    <Code className="w-10 h-10 text-indigo-600" />
                                </div>
                                <div className="text-center space-y-2 mb-4 px-4">
                                    <p className="font-bold text-gray-900">Upload CSV File</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">Drop your .csv or .txt file here to begin parsing the data structure.</p>
                                </div>
                                <FileUploader
                                    accept=".csv,.txt"
                                    onFileSelect={handleFileSelect}
                                    onClear={() => setFile(null)}
                                    currentFile={file}
                                />
                                {file && (
                                    <button
                                        onClick={validateAndPreview}
                                        disabled={isParsing}
                                        className="btn-primary h-12 w-full mt-4 shadow-indigo-200"
                                    >
                                        {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                        <span className="text-sm">Analyze Structure</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Viewport */}
                <div className="flex-1 flex flex-col space-y-4 min-h-0">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                Transformed View {totalRows !== null && <span className="text-indigo-600 ml-2 opacity-50 font-normal">({totalRows} Records)</span>}
                            </h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Editable Workspace</p>
                        </div>
                        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center border border-gray-200/50 shadow-inner">
                            <button
                                onClick={() => setViewType('table')}
                                className={`flex items-center space-x-2 px-4 h-9 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all ${viewType === 'table' ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                                <span>TABLE</span>
                            </button>
                            <button
                                onClick={() => setViewType('json')}
                                className={`flex items-center space-x-2 px-4 h-9 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all ${viewType === 'json' ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Code className="w-3.5 h-3.5" />
                                <span>JSON</span>
                            </button>
                        </div>
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

                        {viewType === 'table' ? (
                            <div className="h-full animate-in fade-in zoom-in-95 duration-700">
                                {tableData.length > 0 ? (
                                    <TanStackDataTable
                                        data={tableData}
                                        onDataChange={(newData) => {
                                            setTableData(newData);
                                        }}
                                        onHeaderChange={() => {
                                            // Column rename handled in DataPreviewTable
                                        }}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                            <TableIcon className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p className="text-sm font-bold tracking-tight">Input data to generate preview</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full overflow-auto custom-scrollbar bg-gray-900 animate-in fade-in duration-500">
                                <pre className="font-mono text-[13px] text-gray-300 p-8 min-w-full leading-relaxed selection:bg-indigo-500/30">
                                    {totalRows && totalRows > 1000 && (
                                        <div className="mb-6 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 font-bold text-xs flex items-center space-x-3">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Displaying head (1,000 records) for low-latency scrolling. Export will contain full dataset.</span>
                                        </div>
                                    )}
                                    {resultData && mode === 'csv-to-json'
                                        ? JSON.stringify(resultData, null, 2)
                                        : tableData.length > 0
                                            ? JSON.stringify(tableData, null, 2)
                                            : '// No data transformed yet. Use Compute Table to begin.'}
                                </pre>
                            </div>
                        )}
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

export default JsonCsvConverter;
