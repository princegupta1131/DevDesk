import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FileJson,
    GitCompare,
    FileSpreadsheet,
    FileText,
    Home
} from 'lucide-react';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    category?: string;
}

const navigation: NavItem[] = [
    { path: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },

    // JSON Tools
    {
        path: '/app/json-viewer',
        label: 'JSON Viewer',
        icon: <FileJson className="w-5 h-5" />,
        category: 'JSON Tools'
    },
    {
        path: '/app/json-excel',
        label: 'JSON ⇄ Excel',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        category: 'JSON Tools'
    },
    {
        path: '/app/json-csv',
        label: 'JSON ⇄ CSV',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        category: 'JSON Tools'
    },

    // Diff Tools
    {
        path: '/app/diff-checker',
        label: 'Diff Checker',
        icon: <GitCompare className="w-5 h-5" />,
        category: 'Diff Tools'
    },

    // File Converters
    {
        path: '/app/word-pdf',
        label: 'Word ⇄ PDF',
        icon: <FileText className="w-5 h-5" />,
        category: 'File Converters'
    },
];

const Sidebar: React.FC = () => {
    const location = useLocation();

    // Group navigation items by category
    const groupedNav = navigation.reduce((acc, item) => {
        const category = item.category || 'Main';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">DevDesk</span>
                </Link>
                <p className="text-xs text-gray-500 mt-1">Your everyday data companion</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {Object.entries(groupedNav).map(([category, items]) => (
                    <div key={category} className="mb-6">
                        {category !== 'Main' && (
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                                {category}
                            </h3>
                        )}
                        <ul className="space-y-1">
                            {items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`
                        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                        ${isActive
                                                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }
                      `}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                    DevDesk v1.0.0 • Phase 1
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
