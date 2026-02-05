import React from 'react';
import { Link } from 'react-router-dom';

import { Logo } from '../../components/Logo';

const EnhancedLandingPage: React.FC = () => {
    // Keep FAQ logic alive for the new design




    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50/30 font-sans text-gray-900">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-slate-200/15 blur-[140px] rounded-full"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-200/10 blur-[140px] rounded-full"></div>
            </div>

            <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
                <div className=" mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Logo className="w-10 h-10 sm:w-11 sm:h-11 shadow-xl shadow-indigo-500/20" showText={true} animated={true} />
                        </div>
                        <Link className="bg-gray-900 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2" to="/app/json-viewer" data-discover="true">
                            <span>Launch App</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-4 h-4 hidden sm:block" aria-hidden="true">
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
                <div className="text-center">
                    <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm mb-6">
                        <span className="text-sm font-semibold text-gray-700"> 💻 Diff Checker 💻 JSON Viewer ⌨️ Data Converter</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
                        Fast, Secure <span className="text-gray-700">JSON Viewer</span>
                        <br className="hidden sm:block" />&amp; Data Converter
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto">
                        Handle <strong>100MB+ JSON files</strong>, compare code, and convert between formats—all in your browser.
                        <span className="block mt-2 text-gray-700">Zero uploads. Maximum privacy. Lightning fast.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link className="w-full sm:w-auto bg-gray-900 text-white text-base font-medium px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors" to="/app/json-viewer" data-discover="true">
                            Try JSON Viewer Free
                        </Link>
                        <a href="#features" className="w-full sm:w-auto bg-white text-gray-700 font-medium px-8 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
                            See All Features
                        </a>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-5 h-5 text-green-600" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                            <span>No signUp required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-5 h-5 text-green-600" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                            <span>100% free forever</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-5 h-5 text-green-600" aria-hidden="true">
                                <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                            <span>Open source</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-semibold text-gray-500 mb-4">POWERFUL FEATURES</h2>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need for<br />JSON &amp; Data Processing</p>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Built for developers who work with APIs, data migration, and file conversions.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-braces w-6 h-6" aria-hidden="true">
                                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                                <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                                <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"></path>
                                <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">JSON Structure Viewer</h3>
                        <p className="text-gray-600 mb-4">Visualize massive JSON files up to 100MB+ with our virtualized tree viewer.</p>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Handle 15,000+ nodes</span>
                            </li>
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Real-time search</span>
                            </li>
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Direct Mode for huge files</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-compare w-6 h-6" aria-hidden="true">
                                <circle cx="18" cy="18" r="3"></circle>
                                <circle cx="6" cy="6" r="3"></circle>
                                <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                                <path d="M11 18H8a2 2 0 0 1-2-2V9"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Diff Checker</h3>
                        <p className="text-gray-600 mb-4">Compare text and JSON with intelligent structural analysis.</p>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Line-by-line comparison</span>
                            </li>
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>JSON key sorting</span>
                            </li>
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Scroll synchronization</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-spreadsheet w-6 h-6" aria-hidden="true">
                                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                                <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                                <path d="M8 13h2"></path>
                                <path d="M14 13h2"></path>
                                <path d="M8 17h2"></path>
                                <path d="M14 17h2"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Converters</h3>
                        <p className="text-gray-600 mb-4">Transform between JSON, Excel, CSV, Word, and PDF formats.</p>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Bi-directional conversion</span>
                            </li>
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Preview before export</span>
                            </li>
                            <li className="flex items-center text-gray-700 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4 text-gray-400 mr-2 flex-shrink-0" aria-hidden="true">
                                    <path d="M20 6 9 17l-5-5"></path>
                                </svg>
                                <span>Batch processing</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-br from-gray-900 via-indigo-900 to-violet-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code-xml w-5 h-5" aria-hidden="true">
                                    <path d="m18 16 4-4-4-4"></path>
                                    <path d="m6 8-4 4 4 4"></path>
                                    <path d="m14.5 4-5 16"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">API Development</h3>
                            <p className="text-indigo-100 text-sm">Inspect and validate API responses instantly</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-spreadsheet w-5 h-5" aria-hidden="true">
                                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                                    <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                                    <path d="M8 13h2"></path>
                                    <path d="M14 13h2"></path>
                                    <path d="M8 17h2"></path>
                                    <path d="M14 17h2"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Data Migration</h3>
                            <p className="text-indigo-100 text-sm">Convert between formats for smooth data transfers</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-compare w-5 h-5" aria-hidden="true">
                                    <circle cx="18" cy="18" r="3"></circle>
                                    <circle cx="6" cy="6" r="3"></circle>
                                    <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                                    <path d="M11 18H8a2 2 0 0 1-2-2V9"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Code Reviews</h3>
                            <p className="text-indigo-100 text-sm">Compare configuration files and JSON schemas</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-5 h-5" aria-hidden="true">
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Testing &amp; QA</h3>
                            <p className="text-indigo-100 text-sm">Verify test data and mock API responses</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-gray-600">Everything you need to know about DevDesk</p>
                </div>
                <div className="space-y-4">
                    {[
                        { q: 'Is my data secure with DevDesk?', a: '100% secure. DevDesk processes all files locally in your browser using Web Workers. Your data never leaves your computer or touches our servers.' },
                        { q: 'What file size limits does DevDesk support?', a: 'DevDesk can handle JSON files over 100MB using our Direct Mode feature. For standard mode, files up to 2MB load instantly with full tree visualization.' },
                        { q: 'Can I use DevDesk offline?', a: 'Yes! DevDesk is a Progressive Web App (PWA). After your first visit, you can install it and use all features completely offline.' },
                        { q: 'Which file formats can I convert?', a: 'DevDesk supports JSON ↔ Excel, JSON ↔ CSV, Excel ↔ CSV, and Word ↔ PDF conversions with full preview and bidirectional support.' },
                        { q: 'How does DevDesk compare JSON files?', a: 'Our Diff Checker offers both text-mode (line-by-line) and JSON-mode (structural) comparison with options for whitespace ignoring and key sorting.' }
                    ].map((item, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                            <button className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" onClick={() => toggleFaq(i)}>
                                <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
                                {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                            </button>
                            {openFaq === i && (
                                <div className="px-6 pb-6 text-gray-600">
                                    {item.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section> */}

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                <div className="bg-gray-900 rounded-2xl p-12 sm:p-16 text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">Start Processing Data Faster Today</h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of developers using DevDesk for fast, secure data processing. No signup required.</p>
                    <Link className="inline-flex items-center gap-3 bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors" to="/app/json-viewer" data-discover="true">
                        Launch DevDesk Now
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right w-5 h-5" aria-hidden="true">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                        </svg>
                    </Link>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <Logo className="w-8 h-8 opacity-90" showText={true} />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Diff Checker • Viewer • Converter • Open Source</p>
                    <p className="text-gray-500 text-xs">© 2026 DevDesk. Built with ❤️ for developers.</p>
                </div>
            </footer>
        </div>
    );
};

export default EnhancedLandingPage;
