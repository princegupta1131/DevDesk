import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    GitCompare,
    Loader2,
    Trash2,
    Settings
} from 'lucide-react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { WorkerManager } from '../../utils/WorkerManager';
import type { DiffRequest, DiffResult } from '../../workers/diff.worker';
import { useAppStore } from '../../store/AppContext';

type DiffMode = 'text' | 'json';

/**
 * Diff Checker Component
 * 
 * **Purpose:**
 * Compare two text or JSON inputs with intelligent diffing.
 * 
 ** **Key Features:**
 * - Text mode: Line-by-line comparison
 * - JSON mode: Structural comparison with key sorting
 * - Whitespace ignore option
 * - Side-by-side Monaco editor with diff highlighting
 * - Worker-based diff computation (non-blocking)
 * 
 * **Mobile Responsive:**
 * - Stacks editors vertically on small screens
 * - Touch-friendly controls
 * 
 * @component
 */
const DiffChecker: React.FC = () => {
    const { state, setDiffChecker } = useAppStore();
    const { text1, text2, mode, ignoreWhitespace } = state.diffChecker;

    const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helpers
    const setText1 = (val: string) => setDiffChecker({ text1: val });
    const setText2 = (val: string) => setDiffChecker({ text2: val });
    const setMode = (val: DiffMode) => setDiffChecker({ mode: val });
    const setIgnoreWhitespace = (val: boolean) => setDiffChecker({ ignoreWhitespace: val });

    const commonOptions = useMemo(() => ({
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on' as const,
        folding: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on' as const,
        padding: { top: 16, bottom: 16 },
        formatOnPaste: false,
        formatOnType: false,
    }), []);

    const diffOptions = useMemo(() => ({
        ...commonOptions,
        renderSideBySide: true,
        readOnly: true,
        originalEditable: false,
        useInlineViewWhenSpaceIsLimited: true,
    }), [commonOptions]);

    const workerRef = useRef<WorkerManager<DiffRequest, DiffResult> | null>(null);

    // Initialize worker
    const initWorker = useCallback(() => {
        if (!workerRef.current) {
            workerRef.current = new WorkerManager<DiffRequest, DiffResult>(
                new URL('../../workers/diff.worker.ts', import.meta.url)
            );
        }
    }, []);

    const handleCompare = useCallback(async () => {
        if (!text1.trim() && !text2.trim()) {
            setError('Please enter text in at least one editor');
            return;
        }

        setIsLoading(true);
        setError(null);
        initWorker();

        try {
            let processed1 = text1;
            let processed2 = text2;

            if (mode === 'json' && state.diffChecker.sortKeys) {
                try {
                    const obj1 = JSON.parse(text1);
                    const obj2 = JSON.parse(text2);
                    const { deepSortKeys } = await import('../../utils/jsonUtils');
                    processed1 = JSON.stringify(deepSortKeys(obj1), null, 2);
                    processed2 = JSON.stringify(deepSortKeys(obj2), null, 2);

                    // Update the state with sorted strings so they appear in DiffEditor
                    setDiffChecker({ text1: processed1, text2: processed2 });
                } catch (e) {
                    throw new Error('Invalid JSON structure. Sorting failed.');
                }
            }

            const result = await workerRef.current!.postMessage('COMPUTE_DIFF', {
                text1: processed1,
                text2: processed2,
                mode: mode === 'json' ? 'json' : 'lines',
                ignoreWhitespace,
            });

            setDiffResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to compute diff');
            setDiffResult(null);
        } finally {
            setIsLoading(false);
        }
    }, [text1, text2, mode, ignoreWhitespace, state.diffChecker.sortKeys, initWorker, setDiffChecker]);

    const handleClear = () => {
        setText1('');
        setText2('');
        setDiffResult(null);
        setError(null);
    };

    const handleSwap = () => {
        const temp = text1;
        setText1(text2);
        setText2(temp);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Diff Checker
                </h1>
                <p className="text-gray-600">
                    Compare text or JSON with side-by-side highlighting
                </p>
            </div>

            {/* Controls */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Mode Toggle */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Mode:</span>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setMode('text')}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${mode === 'text'
                                        ? 'bg-white text-primary-700 font-medium shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Text
                                </button>
                                <button
                                    onClick={() => setMode('json')}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${mode === 'json'
                                        ? 'bg-white text-primary-700 font-medium shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ignoreWhitespace}
                                    onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">Ignore whitespace</span>
                            </label>
                            {mode === 'json' && (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={state.diffChecker.sortKeys || false}
                                        onChange={(e) => setDiffChecker({ sortKeys: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Sort JSON Keys</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSwap}
                            className="btn-outline flex items-center space-x-2"
                            title="Swap left and right"
                        >
                            <GitCompare className="w-4 h-4" />
                            <span>Swap</span>
                        </button>
                        <button
                            onClick={handleClear}
                            className="btn-secondary"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                        <button
                            onClick={handleCompare}
                            disabled={isLoading}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Computing...</span>
                                </>
                            ) : (
                                <>
                                    <GitCompare className="w-4 h-4" />
                                    <span>Compare</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-gray-50/50">
                {!diffResult ? (
                    /* Input Mode */
                    <div className="h-full grid grid-cols-2 gap-6 p-6 min-h-0">
                        {/* Left Editor */}
                        <div className="flex flex-col space-y-3 min-h-0">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Original Content</h2>
                                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                    {text1.split('\n').length} LINES
                                </span>
                            </div>
                            <div className="flex-1 min-h-0 border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <Editor
                                    height="100%"
                                    language={mode === 'json' ? 'json' : 'plaintext'}
                                    value={text1}
                                    onChange={(val) => setText1(val || '')}
                                    theme="light"
                                    options={commonOptions}
                                />
                            </div>
                        </div>

                        {/* Right Editor */}
                        <div className="flex flex-col space-y-3 min-h-0">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modified Content</h2>
                                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                    {text2.split('\n').length} LINES
                                </span>
                            </div>
                            <div className="flex-1 min-h-0 border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <Editor
                                    height="100%"
                                    language={mode === 'json' ? 'json' : 'plaintext'}
                                    value={text2}
                                    onChange={(val) => setText2(val || '')}
                                    theme="light"
                                    options={commonOptions}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Diff View */
                    <div className="h-full flex flex-col min-h-0">
                        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <GitCompare className="w-5 h-5 text-primary-600" />
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Comparison Result</h2>
                            </div>
                            <button
                                onClick={() => setDiffResult(null)}
                                className="btn-secondary h-8 px-4 text-xs font-bold"
                            >
                                BACK TO EDIT
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <DiffEditor
                                height="100%"
                                original={text1}
                                modified={text2}
                                language={mode === 'json' ? 'json' : 'plaintext'}
                                theme="light"
                                options={diffOptions}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="border-t border-gray-200 p-4 bg-red-50">
                    <div className="flex items-center space-x-2 text-red-700">
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiffChecker;
