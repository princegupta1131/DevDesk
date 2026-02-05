import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    FileJson,
    GitCompare,
    FileSpreadsheet,
    FileText,
    Menu,
    X,
    ArrowRightLeft,
} from 'lucide-react';
import { CommandPalette, useCommandPalette } from './CommandPalette';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    category: string;
}

const navItems: NavItem[] = [
    {
        id: 'json-viewer',
        label: 'JSON Structure Viewer',
        icon: <FileJson className="w-5 h-5" />,
        path: '/app/json-viewer',
        category: 'JSON Tools',
    },
    {
        id: 'diff-checker',
        label: 'Diff Checker',
        icon: <GitCompare className="w-5 h-5" />,
        path: '/app/diff-checker',
        category: 'Diff Tools',
    },
    {
        id: 'json-excel',
        label: 'JSON ⇄ Excel',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        path: '/app/json-excel',
        category: 'File Converters',
    },
    {
        id: 'json-csv',
        label: 'JSON ⇄ CSV',
        icon: <FileText className="w-5 h-5" />,
        path: '/app/json-csv',
        category: 'File Converters',
    },
    {
        id: 'excel-csv',
        label: 'Excel ⇄ CSV',
        icon: <ArrowRightLeft className="w-5 h-5" />,
        path: '/app/excel-csv',
        category: 'File Converters',
    },
    {
        id: 'word-pdf',
        label: 'Word ⇄ PDF',
        icon: <FileText className="w-5 h-5" />,
        path: '/app/word-pdf',
        category: 'File Converters',
    },
];

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
    const location = useLocation();
    const { open, setOpen } = useCommandPalette();

    // Group nav items by category
    const groupedItems = navItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, NavItem[]>);

    return (
        <div className="flex h-screen overflow-hidden font-sans" style={{ background: 'transparent' }}>
            {/* Command Palette */}
            <CommandPalette open={open} onOpenChange={setOpen} />
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">D</span>
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-gray-900">DevDesk</h1>
                                <p className="text-xs text-gray-500">Developer Tools</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                        {Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category}>
                                <h3 className="px-3 text-xs font-medium text-gray-500 mb-2">
                                    {category}
                                </h3>
                                <div className="space-y-1">
                                    {items.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                                                    ? 'bg-gray-100 text-gray-900 font-medium'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <div className={isActive ? 'text-indigo-600' : 'text-gray-400'}>
                                                    {item.icon}
                                                </div>
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Footer Info */}
                    {/* <div className="p-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 text-center">
                            100% Local Processing
                        </div>
                    </div> */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0" style={{ background: 'transparent' }}>
                {/* Header */}
                <header className="h-14 flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                        <h2 className="text-sm font-medium text-gray-900">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="font-medium">Local</span>
                        </div>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            GitHub
                        </a>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-[1600px] mx-auto h-full">
                        <Outlet />
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 px-6 shrink-0">
                    <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs text-gray-500">
                        {/* <div className="flex items-center gap-2">
                            <span className="font-medium">DevDesk v1.0.0</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">100% Local Processing</span>
                        </div> */}
                        <div>
                            © 2026 • Design • Developed by Prince Gupta
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
