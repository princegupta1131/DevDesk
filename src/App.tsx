import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { ROUTES } from './config/routes';

// Lazy load features for performance optimization
const LandingPage = lazy(() => import('./features/landing/EnhancedLandingPage'));
const JsonViewer = lazy(() => import('./features/json-viewer/JsonViewer'));
const DiffChecker = lazy(() => import('./features/diff-checker/DiffChecker'));
const JsonExcelConverter = lazy(() => import('./features/converters/JsonExcelConverter'));
const JsonCsvConverter = lazy(() => import('./features/converters/JsonCsvConverter'));
const ExcelCsvConverter = lazy(() => import('./features/converters/ExcelCsvConverter'));
const WordPdfConverter = lazy(() => import('./features/converters/WordPdfConverter'));

// Loading tasks - extracted outside component to prevent recreation
const LOADING_TASKS = [
  "Initializing Dev Environment...",
  "Diff Checker...",
  "JSON Viewer...",
  "JSON Excel Converter...",
  "JSON CSV Converter...",
  "Excel CSV Converter...",
  "Word PDF Converter...",
];

const LoadingScreen = () => {
  const [taskIndex, setTaskIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTaskIndex((prev) => (prev + 1) % LOADING_TASKS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []); // Fixed: removed tasks.length dependency

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8 bg-slate-50">
      <div className="relative mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />

        {/* Main Logo Card */}
        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-indigo-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent" />

          <div className="relative flex flex-col items-center">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-indigo-600 font-black text-2xl animate-[bounce_2s_infinite]">{'{'}</span>
              <div className="w-1.5 h-6 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-indigo-600 font-black text-2xl animate-[bounce_2s_infinite_0.5s]">{'}'}</span>
            </div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-violet-400 rounded-lg animate-float opacity-50" />
        <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-indigo-400 rounded-full animate-float [animation-delay:1s] opacity-50" />
      </div>

      <div className="flex flex-col items-center space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            DevDesk <span className="text-indigo-500">Workspace</span>
          </span>
        </div>

        <div className="h-4 flex items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-in fade-in slide-in-from-bottom-1 duration-300">
            {LOADING_TASKS[taskIndex]}
          </p>
        </div>
      </div>

      {/* Progress Bar Background */}
      <div className="mt-8 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 w-1/3 rounded-full animate-[shimmer_2s_infinite] origin-left"
          style={{ width: '100%', animationDuration: '3s' }} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path={ROUTES.LANDING} element={<LandingPage />} />
            <Route path={ROUTES.APP} element={<Layout />}>
              <Route path="json-viewer" element={<JsonViewer />} />
              <Route path="diff-checker" element={<DiffChecker />} />
              <Route path="json-excel" element={<JsonExcelConverter />} />
              <Route path="json-csv" element={<JsonCsvConverter />} />
              <Route path="excel-csv" element={<ExcelCsvConverter />} />
              <Route path="word-pdf" element={<WordPdfConverter />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
