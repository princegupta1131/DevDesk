import React, { useState, useMemo, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from '@tanstack/react-table';
import { Trash2, Plus, Edit3, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

interface TanStackDataTableProps {
    data: any[];
    onDataChange?: (newData: any[]) => void;
    onHeaderChange?: (oldName: string, newName: string) => void;
    maxRows?: number;
    isEditable?: boolean;
}

const TanStackDataTable: React.FC<TanStackDataTableProps> = ({
    data: initialData,
    onDataChange,
    onHeaderChange,
    isEditable = true,
}) => {
    const [data, setData] = useState<any[]>(initialData);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editingHeader, setEditingHeader] = useState<string | null>(null);
    const [headerValue, setHeaderValue] = useState<string>('');

    const parentRef = useRef<HTMLDivElement>(null);

    // Sync data when initialData changes
    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Extract headers from data
    const headers = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];
        return Array.from(
            new Set(data.flatMap(item => (typeof item === 'object' && item !== null ? Object.keys(item) : [])))
        );
    }, [data]);

    // Handle cell change
    const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
        setData(newData);
        onDataChange?.(newData);
    };

    // Handle header rename
    const handleHeaderRename = (oldName: string, newName: string) => {
        if (!newName.trim() || newName === oldName) {
            setEditingHeader(null);
            return;
        }

        const newData = data.map(row => {
            const { [oldName]: value, ...rest } = row;
            return { ...rest, [newName]: value };
        });

        setData(newData);
        onDataChange?.(newData);
        onHeaderChange?.(oldName, newName);
        setEditingHeader(null);
    };

    // Handle delete row
    const handleDeleteRow = (rowIndex: number) => {
        const newData = data.filter((_, i) => i !== rowIndex);
        setData(newData);
        onDataChange?.(newData);
    };

    // Handle add row
    const handleAddRow = () => {
        const newRow = headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {});
        const newData = [...data, newRow];
        setData(newData);
        onDataChange?.(newData);
    };

    // Auto-resize textarea on mount/change
    const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
    };

    // Ref to store textarea elements
    const textareaRefs = React.useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

    // Define columns
    const columns = useMemo<ColumnDef<any>[]>(() => {
        const cols: ColumnDef<any>[] = [
            {
                id: 'index',
                header: '#',
                cell: ({ row }) => (
                    <div className="text-gray-500 font-mono text-xs">
                        {String(row.index + 1).padStart(2, '0')}
                    </div>
                ),
                size: 60,
                enableSorting: false,
                enableResizing: false,
            },
        ];

        headers.forEach(header => {
            cols.push({
                accessorKey: header,
                id: header,
                header: () => (
                    <div className="flex items-center gap-2 min-w-[150px]">
                        {editingHeader === header ? (
                            <input
                                type="text"
                                value={headerValue}
                                onChange={(e) => setHeaderValue(e.target.value)}
                                onBlur={() => handleHeaderRename(header, headerValue)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleHeaderRename(header, headerValue);
                                    if (e.key === 'Escape') setEditingHeader(null);
                                }}
                                autoFocus
                                className="bg-white border-2 border-indigo-500 rounded px-2 py-1 text-gray-900 font-medium w-full focus:outline-none"
                            />
                        ) : (
                            <div
                                className="flex items-center gap-2 cursor-pointer group/header w-full"
                                onDoubleClick={() => {
                                    if (isEditable) {
                                        setEditingHeader(header);
                                        setHeaderValue(header);
                                    }
                                }}
                                title={isEditable ? "Double-click to edit column name" : header}
                            >
                                <span className="truncate flex-1">{header}</span>
                                {isEditable && (
                                    <Edit3 className="w-3 h-3 text-indigo-400 opacity-0 group-hover/header:opacity-100 transition-opacity" />
                                )}
                            </div>
                        )}
                    </div>
                ),
                cell: ({ getValue, row, column }) => {
                    const value = getValue();
                    const displayValue = value === null ? 'null' : (typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
                    const cellId = `${row.id}_${column.id}`;

                    return (
                        <div className="flex items-start group/cell w-full py-1">
                            {isEditable ? (
                                <>
                                    <textarea
                                        ref={el => {
                                            if (el) {
                                                textareaRefs.current[cellId] = el;
                                                adjustTextareaHeight(el);
                                            }
                                        }}
                                        value={displayValue}
                                        onChange={(e) => {
                                            handleCellChange(row.index, column.id, e.target.value);
                                            adjustTextareaHeight(e.target);
                                        }}
                                        className="w-full bg-transparent border-none focus:ring-0 rounded-lg px-2 py-1 -mx-2 transition-all hover:bg-white hover:shadow-sm resize-none overflow-hidden min-h-[32px]"
                                        rows={1}
                                        style={{ height: 'auto' }}
                                    />
                                    <Edit3 className="w-3 h-3 text-indigo-400 opacity-0 group-hover/cell:opacity-100 absolute right-2 top-3 pointer-events-none" />
                                </>
                            ) : (
                                <span className="whitespace-pre-wrap break-words w-full block text-sm leading-relaxed" title={displayValue}>{displayValue}</span>
                            )}
                        </div>
                    );
                },
                enableSorting: true,
                enableResizing: true,
            });
        });

        if (isEditable) {
            cols.push({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <button
                        onClick={() => handleDeleteRow(row.index)}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-xl transition-all opacity-0 group-hover/row:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                ),
                size: 80,
                enableSorting: false,
                enableResizing: false,
            });
        }

        return cols;
    }, [headers, editingHeader, headerValue, isEditable]);

    // Create table instance
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        defaultColumn: {
            size: 200,
            minSize: 100,
            maxSize: 800,
        },
    });

    if (!data || !Array.isArray(data)) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">
                No tabular data to display
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-white/50 backdrop-blur-md border border-gray-100/50">
            <div
                ref={parentRef}
                className="flex-1 overflow-auto relative w-full"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div style={{ minWidth: '100%', width: table.getTotalSize(), display: 'block' }}>
                    <table
                        className="w-full border-collapse text-sm table-fixed bg-white"
                    >
                        <thead className="sticky top-0 z-30 bg-gray-50 border-b-2 border-gray-200 shadow-sm">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0 relative select-none"
                                            style={{ width: header.getSize() }}
                                        >
                                            <div
                                                className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-2' : ''}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <span className="text-gray-400">
                                                        {header.column.getIsSorted() === 'asc' ? (
                                                            <ArrowUp className="w-3 h-3" />
                                                        ) : header.column.getIsSorted() === 'desc' ? (
                                                            <ArrowDown className="w-3 h-3" />
                                                        ) : (
                                                            <ChevronsUpDown className="w-3 h-3 opacity-50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize hover:bg-indigo-500 opacity-0 group-hover/header:opacity-100 transition-opacity ${header.column.getIsResizing() ? 'bg-indigo-600 opacity-100' : ''
                                                    }`}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-indigo-50/30 transition-colors group/row even:bg-slate-50/40"
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="px-3 py-2 text-gray-700 font-normal relative align-top border-r border-gray-200 last:border-r-0"
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-dashed border-gray-200">
                            <Plus className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 italic">Empty Dataset</p>
                    </div>
                )}
            </div>
            {isEditable && (
                <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-between items-center shrink-0">
                    <button
                        onClick={handleAddRow}
                        className="flex items-center space-x-2.5 text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase tracking-widest transition-colors group"
                    >
                        <div className="w-7 h-7 bg-indigo-50 flex items-center justify-center rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span>Append Record</span>
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="h-4 w-px bg-gray-200" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            {table.getRowModel().rows.length} {table.getRowModel().rows.length === 1 ? 'Row' : 'Rows'} • {headers.length} {headers.length === 1 ? 'Column' : 'Columns'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TanStackDataTable;
