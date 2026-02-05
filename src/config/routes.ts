/**
 * Application route paths.
 * 
 * Centralized route definitions for consistency and easy refactoring.
 */
export const ROUTES = {
    // Public routes
    LANDING: '/',

    // App routes
    APP: '/app',
    JSON_VIEWER: '/app/json-viewer',
    DIFF_CHECKER: '/app/diff-checker',
    JSON_EXCEL: '/app/json-excel',
    JSON_CSV: '/app/json-csv',
    EXCEL_CSV: '/app/excel-csv',
    WORD_PDF: '/app/word-pdf',
} as const;

/**
 * Route metadata for navigation and preloading.
 */
export const ROUTE_METADATA = {
    [ROUTES.JSON_VIEWER]: {
        title: 'JSON Viewer',
        description: 'View and explore JSON structures',
        preload: () => import('../features/json-viewer/JsonViewer'),
    },
    [ROUTES.DIFF_CHECKER]: {
        title: 'Diff Checker',
        description: 'Compare text and JSON files',
        preload: () => import('../features/diff-checker/DiffChecker'),
    },
    [ROUTES.JSON_EXCEL]: {
        title: 'JSON ↔ Excel',
        description: 'Convert between JSON and Excel',
        preload: () => import('../features/converters/JsonExcelConverter'),
    },
    [ROUTES.JSON_CSV]: {
        title: 'JSON ↔ CSV',
        description: 'Convert between JSON and CSV',
        preload: () => import('../features/converters/JsonCsvConverter'),
    },
    [ROUTES.EXCEL_CSV]: {
        title: 'Excel ↔ CSV',
        description: 'Convert between Excel and CSV',
        preload: () => import('../features/converters/ExcelCsvConverter'),
    },
    [ROUTES.WORD_PDF]: {
        title: 'Word ↔ PDF',
        description: 'Convert between Word and PDF',
        preload: () => import('../features/converters/WordPdfConverter'),
    },
} as const;
