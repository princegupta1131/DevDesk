import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { ROUTES } from './config/routes';
import AppLoader from './components/AppLoader';

// Lazy load features for performance optimization
const LandingPage = lazy(() => import('./features/landing/EnhancedLandingPage'));
const JsonViewer = lazy(() => import('./features/json-viewer/JsonViewer'));
const DiffChecker = lazy(() => import('./features/diff-checker/DiffChecker'));
const JsonExcelConverter = lazy(() => import('./features/converters/JsonExcelConverter'));
const JsonCsvConverter = lazy(() => import('./features/converters/JsonCsvConverter'));
const ExcelCsvConverter = lazy(() => import('./features/converters/ExcelCsvConverter'));
const WordPdfConverter = lazy(() => import('./features/converters/WordPdfConverter'));

const LoadingScreen = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-8">
      <AppLoader
        label="Loading workspace"
        size="sm"
        showBrandText={false}
      />
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
              <Route index element={<Navigate to="json-viewer" replace />} />
              <Route path="json-viewer" element={<JsonViewer />} />
              <Route path="diff-checker" element={<DiffChecker />} />
              <Route path="json-excel" element={<JsonExcelConverter />} />
              <Route path="json-csv" element={<JsonCsvConverter />} />
              <Route path="excel-csv" element={<ExcelCsvConverter />} />
              <Route path="word-pdf" element={<WordPdfConverter />} />
              <Route path="*" element={<Navigate to="json-viewer" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
