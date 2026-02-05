import React, { useState, useMemo } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';
import type { JsonNode } from '../types/json';
import { copyToClipboard } from '../utils/jsonUtils';

interface JsonTreeNodeProps {
    node: JsonNode;
    searchQuery?: string;
    onToggle?: (path: string) => void;
    defaultExpanded?: boolean;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = React.memo(({
    node,
    searchQuery = '',
    onToggle,
    defaultExpanded = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [copied, setCopied] = useState(false);

    const hasChildren = node.children && node.children.length > 0;
    const isCollapsible = node.type === 'object' || node.type === 'array';

    const handleToggle = () => {
        if (isCollapsible) {
            setIsExpanded(!isExpanded);
            onToggle?.(node.path);
        }
    };

    const handleCopyPath = async () => {
        const success = await copyToClipboard(node.path);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'string':
                return 'text-emerald-500';
            case 'number':
                return 'text-sky-500';
            case 'boolean':
                return 'text-amber-500';
            case 'null':
                return 'text-slate-400';
            case 'array':
                return 'text-indigo-500';
            case 'object':
                return 'text-violet-500';
            default:
                return 'text-slate-600';
        }
    };

    const getValuePreview = () => {
        if (node.type === 'object') {
            const count = node.children?.length || 0;
            return (
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
                    {count} {count === 1 ? 'Prop' : 'Props'}
                </span>
            );
        }
        if (node.type === 'array') {
            const count = node.children?.length || 0;
            return (
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">
                    {count} {count === 1 ? 'Item' : 'Items'}
                </span>
            );
        }
        if (node.type === 'string') {
            return <span className="font-bold">"{String(node.value)}"</span>;
        }
        return <span className="font-bold tracking-tight">{String(node.value)}</span>;
    };

    const highlightText = (text: string) => {
        if (!searchQuery) return text;

        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark key={index} className="bg-indigo-500 text-white rounded-sm px-0.5 shadow-sm">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    // Check if this node or any children match the search query
    const matchesSearch = useMemo(() => {
        if (!searchQuery) return false;

        const query = searchQuery.toLowerCase();

        // Check if key matches
        if (node.key.toLowerCase().includes(query)) return true;

        // Check if value matches (for primitives)
        if (node.type !== 'object' && node.type !== 'array') {
            return String(node.value).toLowerCase().includes(query);
        }

        // Check children recursively
        const checkChildren = (n: JsonNode): boolean => {
            if (n.key.toLowerCase().includes(query)) return true;
            if (n.type !== 'object' && n.type !== 'array') {
                return String(n.value).toLowerCase().includes(query);
            }
            return n.children?.some(checkChildren) || false;
        };

        return node.children?.some(checkChildren) || false;
    }, [node, searchQuery]);

    // Auto-expand if search matches
    React.useEffect(() => {
        if (searchQuery && matchesSearch && isCollapsible) {
            setIsExpanded(true);
        }
    }, [searchQuery, matchesSearch, isCollapsible]);

    return (
        <div className="font-mono text-xs select-none">
            <div className={`flex items-start group py-0.5 px-2 rounded-lg transition-all border border-transparent ${matchesSearch ? 'bg-indigo-50/50 border-indigo-100/50' : 'hover:bg-gray-50'}`}>
                {/* Expand/Collapse Icon */}
                <button
                    onClick={handleToggle}
                    className={`mr-1 p-0.5 rounded hover:bg-white transition-all ${isCollapsible ? 'cursor-pointer' : 'invisible'
                        }`}
                    disabled={!isCollapsible}
                >
                    {isCollapsible && (
                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />
                        </div>
                    )}
                </button>

                {/* Key */}
                <span className="font-bold text-slate-800 mr-2 flex-shrink-0">
                    {highlightText(node.key)}
                    <span className="text-gray-300 ml-1">:</span>
                </span>

                {/* Value Preview */}
                <span className={`${getTypeColor(node.type)} flex-1 break-words whitespace-pre-wrap`}>
                    {getValuePreview()}
                </span>

                {/* Action Buttons */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-all">
                    <button
                        onClick={handleCopyPath}
                        className="p-1 hover:bg-white hover:shadow-sm text-gray-400 hover:text-indigo-600 rounded-lg transition-all"
                        title="Copy Node Path"
                    >
                        {copied ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                    </button>
                    {isCollapsible && (
                        <span className="text-[10px] font-black text-gray-300 uppercase">
                            {node.type}
                        </span>
                    )}
                </div>
            </div>

            {/* Children - Only render when expanded (lazy rendering) */}
            {isExpanded && hasChildren && (
                <div className="ml-4 border-l-2 border-gray-100/50 pl-2 mt-0.5 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
                    {node.children!.map((child, index) => (
                        <JsonTreeNode
                            key={`${child.path}-${index}`}
                            node={child}
                            searchQuery={searchQuery}
                            onToggle={onToggle}
                            defaultExpanded={defaultExpanded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

JsonTreeNode.displayName = 'JsonTreeNode';

export default JsonTreeNode;
