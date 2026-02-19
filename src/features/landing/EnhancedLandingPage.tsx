import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Database,
    FileJson,
    GitCompare,
    ShieldCheck,
    Sparkles,
    TableProperties,
    Zap,
} from 'lucide-react';

import { Logo } from '../../components/Logo';

const EnhancedLandingPage: React.FC = () => {
    const coreFeatures = [
        {
            icon: <FileJson className="w-5 h-5" />,
            title: 'JSON Structure Viewer',
            desc: 'Inspect deeply nested JSON with virtualized rendering and smooth search.',
            points: ['Handles 100MB+ files', 'Tree search + path copy', 'No server upload'],
        },
        {
            icon: <GitCompare className="w-5 h-5" />,
            title: 'Diff Checker',
            desc: 'Compare text and JSON with clean side-by-side editor workflow.',
            points: ['Text + JSON modes', 'Ignore whitespace option', 'Fast local diff'],
        },
        {
            icon: <TableProperties className="w-5 h-5" />,
            title: 'Data Converters',
            desc: 'Move data between JSON, Excel, CSV, Word, and PDF with preview.',
            points: ['Bi-directional conversion', 'Editable table preview', 'Export-ready output'],
        },
    ];

    return (
        <div className="app-shell-bg min-h-screen font-sans text-slate-900">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-24 w-[32rem] h-[32rem] rounded-full bg-indigo-200/20 blur-[120px]" />
                <div className="absolute top-[22rem] -right-24 w-[32rem] h-[32rem] rounded-full bg-cyan-200/18 blur-[126px]" />
                <div className="absolute bottom-[-5rem] left-1/3 w-[24rem] h-[24rem] rounded-full bg-slate-200/18 blur-[110px]" />
            </div>

            <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <Logo className="w-10 h-10 sm:w-11 sm:h-11 shadow-xl shadow-indigo-500/20" showText={true} animated={false} />
                        <Link className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 sm:px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800" to="/app/json-viewer">
                            <span>Launch App</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            Diff Checker - JSON Viewer - Data Converter
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-slate-900">
                            Developer Tools
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-violet-600 to-cyan-600">
                                Built for Speed
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg text-slate-600">
                            Parse massive JSON, compare payloads, and convert files in one smooth workspace.
                            All processing stays inside your browser.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                            <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-slate-800" to="/app/json-viewer">
                                Try DevDesk Free
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400">
                                Explore Features
                            </a>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> No signup</span>
                            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% local processing</span>
                            <span className="inline-flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-600" /> High performance</span>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 sm:p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-md">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-bold tracking-wide text-slate-700">Live Tool Stack</p>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Client Side</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><FileJson className="w-4 h-4 text-indigo-600" /> JSON Viewer</span>
                                <span className="text-xs font-bold text-slate-500">Virtualized</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><GitCompare className="w-4 h-4 text-indigo-600" /> Diff Checker</span>
                                <span className="text-xs font-bold text-slate-500">Synced Panes</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><Database className="w-4 h-4 text-indigo-600" /> Converters</span>
                                <span className="text-xs font-bold text-slate-500">Worker Powered</span>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-slate-900 p-4 text-xs text-slate-200 font-mono">
                            <p>{'{'}</p>
                            <p className="pl-3 text-cyan-300">"speed": "optimized",</p>
                            <p className="pl-3 text-violet-300">"privacy": "browser-only",</p>
                            <p className="pl-3 text-emerald-300">"status": "ready"</p>
                            <p>{'}'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20">
                <div className="mb-12 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Core Features</p>
                    <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">
                        Everything you need for daily data workflows
                    </h2>
                    <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                        Built for developers, analysts, QA, and operations teams handling real JSON and tabular data.
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {coreFeatures.map((feature) => (
                        <div key={feature.title} className="rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
                            <ul className="mt-4 space-y-2.5">
                                {feature.points.map((point) => (
                                    <li key={point} className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-20">
                <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
                    <div className="grid gap-8 md:grid-cols-[1.35fr_1fr] md:items-center">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Ready Now</p>
                            <h3 className="mt-3 text-3xl sm:text-4xl font-black leading-tight">
                                Start processing your JSON and files in seconds
                            </h3>
                            <p className="mt-4 text-indigo-100 max-w-xl">
                                Smooth UX, zero upload risk, and tools aligned for real production workflows.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:items-start">
                            <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100" to="/app/json-viewer">
                                Launch DevDesk
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-white/10" to="/app/diff-checker">
                                Open Diff Checker
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="border-t border-slate-200/70 bg-white/70 py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
                        <Logo className="w-8 h-8 opacity-95" showText={true} animated={false} />
                        <p className="text-sm text-slate-500">Diff Checker - Viewer - Converter - Open Source</p>
                        <p className="text-xs font-semibold">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600">
                                © 2026 DevDesk •
                            </span>
                            <span className="mx-1 text-slate-700">👨🏻‍💻</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600">
                                Developed by Prince Gupta
                            </span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default EnhancedLandingPage;
