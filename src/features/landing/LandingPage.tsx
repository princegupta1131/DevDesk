/**
 * Landing Page Component
 * 
 * **Purpose:**
 * Marketing landing page showcasing DevDesk's features and tools.
 * 
 * **Key Features:**
 * - Responsive hero section with gradient text
 * - Feature grid highlighting core capabilities
 * - Tool cards with hover effects
 * - Mobile-optimized layout with Tailwind breakpoints
 * 
 * **Performance:**
 * - Lazy loaded via React.lazy() in App.tsx
 * - Static content (no API calls)
 * - Animated on scroll with Tailwind animations
 * 
 * @component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
    FileJson,
    GitCompare,
    FileSpreadsheet,
    Zap,
    Shield,
    Code2,
    ArrowRight,
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const features = [
        {
            icon: <FileJson className="w-6 h-6" />,
            title: 'JSON Optimization',
            description: 'Virtualized tree viewer handles massive datasets with zero lag.',
            color: 'bg-emerald-50 text-emerald-600'
        },
        {
            icon: <GitCompare className="w-6 h-6" />,
            title: 'Smart Diff Checker',
            description: 'Structural JSON comparison with key-sorting and scroll sync.',
            color: 'bg-sky-50 text-sky-600'
        },
        {
            icon: <FileSpreadsheet className

                ="w-6 h-6" />,
            title: 'Fluent Converters',
            description: 'Bi-directional transformation between JSON, Excel, and CSV.',
            color: 'bg-amber-50 text-amber-600'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Worker-Offloaded',
            description: 'Heavy parsing happens on background threads to prevent UI freezes.',
            color: 'bg-indigo-50 text-indigo-600'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Total Privacy',
            description: 'Client-side processing. Your data never touches a server.',
            color: 'bg-violet-50 text-violet-600'
        },
        {
            icon: <Code2 className="w-6 h-6" />,
            title: 'Developer Core',
            description: 'Code-split assets and lazy loading for a lightning-fast experience.',
            color: 'bg-rose-50 text-rose-600'
        },
    ];

    const tools = [
        {
            name: 'JSON Structure Viewer',
            path: '/app/json-viewer',
            description: 'Explore massive JSON files with a high-performance virtual tree.',
            tag: 'VIRTUALIZED'
        },
        {
            name: 'Diff Checker',
            path: '/app/diff-checker',
            description: 'Compare structures with line-level accuracy and key-aware sorting.',
            tag: 'SMART DIFF'
        },
        {
            name: 'JSON ⇄ Excel',
            path: '/app/json-excel',
            description: 'Transform complex nested JSON into flat spreadsheets instantly.',
            tag: 'TRANSFORM'
        },
        {
            name: 'JSON ⇄ CSV',
            path: '/app/json-csv',
            description: 'Export structured data to legacy formats with full control.',
            tag: 'EXPORT'
        },
        {
            name: 'Excel ⇄ CSV',
            path: '/app/excel-csv',
            description: 'Bridge the gap between modern and legacy spreadsheet formats.',
            tag: 'UTILITY'
        },
        {
            name: 'Word ⇄ PDF',
            path: '/app/word-pdf',
            description: 'Lightweight document conversion for quick daily tasks.',
            tag: 'DOCS'
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-500/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full animate-float" />
                <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-violet-200/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-blue-200/20 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-default">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform duration-500">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <span className="font-bold text-gray-900 text-xl sm:text-2xl tracking-tight uppercase">DevDesk</span>
                    </div>
                    <Link
                        to="/app/json-viewer"
                        className="btn-primary-gradient px-4 sm:px-6 py-2.5 text-sm sm:text-base"
                    >
                        <span className="font-semibold">Launch App</span>
                        <ArrowRight className="w-4 h-4 hidden sm:block" />
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32 text-center overflow-hidden">
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm mb-6 sm:mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">v1.0.0 Live</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight leading-tight text-slate-800">
                        THE ULTIMATE <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600">TOOLKIT</span>
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                        High-performance utility suite for modern workflows.
                        View, diff, and convert data with zero latency and 100% privacy.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
                        <Link to="/app/json-viewer" className="w-full sm:w-auto btn-primary-gradient text-base sm:text-lg font-semibold px-8 sm:px-10 py-3 sm:py-4 shadow-2xl shadow-indigo-200">
                            Get Started
                        </Link>
                        <a href="#tools" className="w-full sm:w-auto btn-secondary text-base sm:text-lg font-semibold px-8 sm:px-10 py-3 sm:py-4 hover:border-indigo-200">
                            Explore Tools
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
                <div className="text-center mb-12 sm:mb-20 space-y-4">
                    <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Core Philosophy</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Engineered for Raw Speed</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="premium-card p-6 sm:p-8 group hover:bg-white transition-all duration-500"
                        >
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tools List */}
            <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-32">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 sm:mb-16 px-2 gap-4">
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest">The Ecosystem</h2>
                        <p className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">Choose Your Tool</p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium sm:max-w-xs uppercase leading-relaxed tracking-wider sm:text-right">
                        Every tool is isolated, lazy-loaded, and optimized for extreme scale.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {tools.map((tool, index) => (
                        <Link
                            key={index}
                            to={tool.path}
                            className="group relative bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] hover:border-indigo-600/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest">{tool.tag}</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">
                                {tool.name}
                            </h3>
                            <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed mb-6 sm:mb-8">
                                {tool.description}
                            </p>
                            <div className="flex items-center text-indigo-600 text-xs sm:text-sm font-semibold group-hover:translate-x-2 transition-transform">
                                Launch Tool <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 sm:py-16 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center space-y-6 sm:space-y-8">
                    <div className="flex items-center space-x-3 opacity-30 grayscale hover:grayscale-0 transition-all">
                        <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">D</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg tracking-tight uppercase">DevDesk</span>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-widest">
                            Built with ❤️ for Developers
                        </p>
                        <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-widest">
                            100% Local • Zero Servers • Complete Privacy
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
