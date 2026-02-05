import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle, Plus, File } from 'lucide-react';

interface FileUploaderProps {
    accept?: string;
    maxSize?: number; // in bytes
    onFileSelect: (file: File) => void;
    onClear?: () => void;
    currentFile?: { name: string; size: number } | null;
    disabled?: boolean;
    compact?: boolean;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const FileUploader: React.FC<FileUploaderProps> = ({
    accept = '*',
    maxSize = 100 * 1024 * 1024, // 100MB default
    onFileSelect,
    onClear,
    currentFile,
    disabled = false,
    compact = false,
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        if (maxSize && file.size > maxSize) {
            setError(`File size exceeds ${formatFileSize(maxSize)}`);
            return false;
        }

        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    }, [disabled]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (disabled) return;

        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleClearClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        onClear?.();
    };

    if (compact) {
        return (
            <div className="w-full">
                {currentFile ? (
                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-sm group">
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <Upload className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-gray-900 truncate uppercase tracking-widest">{currentFile.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{formatFileSize(currentFile.size)}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClearClick}
                            className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
                            relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300
                            ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-gray-50/30'}
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleChange}
                            disabled={disabled}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <Upload className={`w-5 h-5 ${dragActive ? 'text-indigo-600 animate-bounce' : 'text-indigo-400'}`} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Source File</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mt-2 flex items-center space-x-2 text-red-500 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3 h-3" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-500 group
                    ${dragActive ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10' : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50/50'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm hover:shadow-md'}
                `}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    disabled={disabled}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />

                <div className="relative mb-6 inline-block">
                    <div className={`w-16 h-16 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 ${dragActive ? 'scale-110' : ''}`}>
                        <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600 scale-110 animate-pulse' : 'text-indigo-500'}`} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center border border-indigo-50">
                        <Plus className="w-3 h-3 text-indigo-600" />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">
                        {dragActive ? 'Ready to process' : 'Transfer File'}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                        Drop it here or <span className="text-indigo-600 font-bold">click to browse</span>
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-center space-x-3">
                    <div className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100 italic">
                        <span className="text-[10px] text-gray-400 font-bold">Limit: {formatFileSize(maxSize)}</span>
                    </div>
                </div>
            </div>

            {currentFile && (
                <div className="mt-4 flex items-center justify-between bg-white border border-indigo-100 rounded-2xl p-4 shadow-lg shadow-indigo-500/5 animate-in slide-in-from-top-4">
                    <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <File className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {currentFile.name}
                            </p>
                            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                                {formatFileSize(currentFile.size)}
                            </p>
                        </div>
                    </div>
                    {onClear && (
                        <button
                            onClick={handleClearClick}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                            title="Detach File"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-start space-x-3 bg-red-50 border border-red-100 rounded-2xl p-4 animate-in shake-in">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Upload Blocked</p>
                        <p className="text-sm text-red-900 font-bold leading-tight">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
