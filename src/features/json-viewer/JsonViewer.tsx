import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload,
    FileJson,
    Search,
    AlertCircle,
    Loader2,
    Trash2,
    ChevronDown,
    ChevronRight,
    Wand2,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { WorkerManager } from '../../utils/WorkerManager';
import VirtualizedJsonTree from '../../components/VirtualizedJsonTree';
import type { ParseError } from '../../types/json';
import { formatFileSize } from '../../utils/jsonUtils';
import { useAppStore } from '../../store/AppContext';

/**
 * JSON Structure Viewer Component
 * 
 * **Purpose:**
 * High-performance JSON visualization with support for massive files (100MB+).
 * 
 * **Key Features:**
 * - Virtualized tree rendering (only visible nodes)
 * - Worker-based parsing (non-blocking UI)
 * - Direct Mode for files > 2MB (zero-copy ArrayBuffer transfer)
 * - Real-time search with match counting
 * - Circuit breaker at 15,000 nodes to prevent crashes
 * 
 * **Performance:**
 * - Uses `jsonParser.worker.ts` for background parsing
 * - Yields to UI every 12ms during parse
 * - Maintains 60 FPS during scrolling
 * 
 * **Mobile Responsive:**
 * - Adapts layout for small screens
 * - Touch-friendly expand/collapse
 * 
 * @component
 * @example
 * ```tsx
 * <JsonViewer />  // Used in routes
 * ```
 */
const JsonViewer: React.FC = () => {
    const { state, setJsonViewer } = useAppStore();
    const { jsonInput, jsonTree, error, fileInfo, isDirectMode, rawFile } = state.jsonViewer;

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [expandAll, setExpandAll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchCount, setSearchCount] = useState<number | null>(null);
    const [processingCount, setProcessingCount] = useState<number>(0);
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));

    const workerRef = useRef<WorkerManager<any, any> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize worker once
    const initWorker = useCallback(() => {
        if (!workerRef.current) {
            workerRef.current = new WorkerManager<any, any>(
                () => new Worker(new URL('../../workers/jsonParser.worker.ts', import.meta.url), { type: 'module' })
            );
        }
    }, []);

    // Stable Parse Handler
    const handleToggle = useCallback((path: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    }, []);

    const handleParse = useCallback(async (input?: string, file?: File | null, directMode?: boolean) => {
        const sourceInput = input !== undefined ? input : jsonInput;
        const sourceFile = file !== undefined ? file : rawFile;
        const sourceDirect = directMode !== undefined ? directMode : isDirectMode;

        if (!sourceInput.trim() && !sourceFile) {
            return;
        }

        setIsLoading(true);
        setProcessingCount(0);
        setJsonViewer({ error: null });

        setTimeout(async () => {
            initWorker();
            try {
                let payload: string | ArrayBuffer;
                let transfer: Transferable[] | undefined;

                if (sourceDirect && sourceFile) {
                    payload = await sourceFile.arrayBuffer();
                    transfer = [payload];
                } else {
                    const encoder = new TextEncoder();
                    const buffer = encoder.encode(sourceInput);
                    payload = buffer.buffer;
                    transfer = [buffer.buffer];
                }

                const result = await workerRef.current!.postMessage(
                    'PARSE_JSON',
                    payload,
                    transfer,
                    0,
                    (progressData) => {
                        setProcessingCount(progressData.nodesProcessed);
                    }
                );
                setJsonViewer({ jsonTree: result, error: null });
            } catch (err: any) {
                const parseError = typeof err === 'object' && err.message
                    ? (err as ParseError)
                    : { message: String(err), lineNumber: null };
                setJsonViewer({ jsonTree: null, error: parseError });
            } finally {
                setIsLoading(false);
                setProcessingCount(0);
            }
        }, 0);
    }, [jsonInput, rawFile, isDirectMode, initWorker, setJsonViewer]);

    // Handle Search
    useEffect(() => {
        if (!jsonTree) return;
        if (!debouncedSearchQuery) {
            setExpandedPaths(new Set(['root']));
            setSearchCount(null);
            return;
        }

        initWorker();
        workerRef.current!.postMessage('SEARCH_JSON', {
            tree: jsonTree,
            query: debouncedSearchQuery
        }, undefined, 150).then((result: any) => {
            setExpandedPaths(new Set(['root', ...result.paths]));
            setSearchCount(result.count);
        });
    }, [debouncedSearchQuery, jsonTree, initWorker]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Auto-parse on mount or when jsonInput changes (if not in direct mode)
    useEffect(() => {
        if (!jsonInput.trim() || isDirectMode) return;
        const timer = setTimeout(() => handleParse(), 1000);
        return () => clearTimeout(timer);
    }, [jsonInput, isDirectMode, handleParse]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const useDirect = file.size > 2 * 1024 * 1024;
        setJsonViewer({
            fileInfo: { name: file.name, size: file.size },
            jsonTree: null,
            error: null,
            isDirectMode: useDirect,
            rawFile: file,
            jsonInput: useDirect ? '' : '' // Placeholder
        });

        if (!useDirect) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setJsonViewer({ jsonInput: content });
                handleParse(content, null, false);
            };
            reader.readAsText(file);
        } else {
            handleParse('', file, true);
        }
    };

    const handleFormat = async () => {
        if (!jsonInput.trim() && !rawFile) return;
        try {
            const content = (rawFile && isDirectMode) ? await rawFile.text() : jsonInput;
            const formatted = JSON.stringify(JSON.parse(content), null, 2);
            setJsonViewer({ jsonInput: formatted, isDirectMode: false, rawFile: null, error: null });
        } catch (err: any) {
            setJsonViewer({ error: { message: 'Invalid JSON: ' + err.message, lineNumber: null } });
        }
    };

    const handleClear = () => {
        setJsonViewer({
            jsonInput: '', jsonTree: null, error: null, fileInfo: null,
            isDirectMode: false, rawFile: null
        });
        setSearchQuery('');
        setSearchCount(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0 overflow-hidden">
                <div className="flex flex-col space-y-4 min-h-0">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Source Data</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Input your JSON here</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" id="json-file-upload" />
                            <label htmlFor="json-file-upload" className="btn-secondary h-11 px-5 cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm font-bold">Upload</span>
                            </label>
                            <button onClick={handleFormat} className="btn-secondary h-11 px-5">
                                <Wand2 className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-bold">Format</span>
                            </button>
                            <button onClick={handleClear} className="btn-secondary h-11 px-5">
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-bold">Reset</span>
                            </button>
                            <button onClick={() => handleParse()} disabled={isLoading || (!jsonInput.trim() && !rawFile)} className="btn-primary-gradient h-11 px-6">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">{processingCount > 0 ? `Processed ${processingCount.toLocaleString()}...` : 'Analyzing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <FileJson className="w-4 h-4" />
                                        <span className="text-sm">Visualize</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col premium-card overflow-hidden">
                        {fileInfo && (
                            <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100/30 flex justify-between items-center shrink-0">
                                <div className="flex items-center space-x-2">
                                    <FileJson className="w-4 h-4 text-indigo-500" />
                                    <span className="text-xs font-bold text-indigo-700 truncate max-w-[200px]">{fileInfo.name}</span>
                                    <span className="text-[10px] text-indigo-400 font-bold">({formatFileSize(fileInfo.size)})</span>
                                </div>
                                {isDirectMode && <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Turbo Mode</span>}
                            </div>
                        )}
                        <div className="flex-1 relative min-h-0">
                            {isDirectMode ? (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-6 bg-gray-50/30">
                                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float"><FileJson className="w-10 h-10 text-indigo-500" /></div>
                                    <div className="text-center max-w-xs px-6">
                                        <p className="font-bold text-gray-900 text-lg">Large Payload Detected</p>
                                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">Direct Mode enabled for maximum performance.</p>
                                    </div>
                                </div>
                            ) : (
                                <Editor height="100%" defaultLanguage="json" value={jsonInput} onChange={(v) => setJsonViewer({ jsonInput: v || '' })} theme="light" options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true, padding: { top: 24, bottom: 24 } }} />
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start space-x-4 animate-in slide-in-from-bottom-2">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-bold text-red-900 leading-none mb-1">Syntax Error</h3>
                                <p className="text-sm text-red-700 leading-relaxed font-medium">{error.message}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col space-y-4 min-h-0">
                    <div className="flex items-center justify-between px-1">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Structured View</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">Interactive Explorer</p>
                        </div>
                        {jsonTree && (
                            <div className="flex items-center space-x-2">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="modern-input h-11 pl-11 py-0 w-56 text-sm" />
                                    {searchCount !== null && <div className="absolute right-3 top-1/2 -translate-y-1/2"><span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{searchCount} matches</span></div>}
                                </div>
                                <button onClick={() => setExpandAll(true)} className="btn-secondary h-11 px-4 disabled:opacity-50" disabled={(jsonTree.children?.length || 0) > 2000}><ChevronDown className="w-4 h-4" /></button>
                                <button onClick={() => setExpandAll(false)} className="btn-secondary h-11 px-4"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 premium-card p-6 overflow-hidden bg-white/50 relative">
                        {jsonTree ? (
                            <VirtualizedJsonTree data={jsonTree} searchQuery={debouncedSearchQuery} defaultExpanded={expandAll} externalExpandedPaths={expandedPaths} onToggle={handleToggle} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100"><FileJson className="w-10 h-10 opacity-20" /></div>
                                <p className="text-sm font-bold tracking-tight">Structured view will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JsonViewer;
