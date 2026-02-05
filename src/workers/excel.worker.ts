import type { WorkerMessage, WorkerResponse } from '../types/worker';
import * as XLSX from 'xlsx';

export interface ExcelConversionRequest {
    data: string | ArrayBuffer;
    type?: 'json-to-excel' | 'excel-to-json';
    options?: {
        sheetName?: string;
        flatten?: boolean;
    };
}

export interface ExcelConversionResponse {
    data: any;
    totalRows?: number;
    fileName?: string;
}

/**
 * Flattens nested JSON object using dot notation
 */
/**
 * Flattens nested JSON object using dot notation (Iterative to prevent stack overflow)
 */
function flattenObject(obj: any): any {
    const result: any = {};
    if (obj === null || typeof obj !== 'object') return obj;

    const stack: { current: any; prefix: string }[] = [{ current: obj, prefix: '' }];

    while (stack.length > 0) {
        const { current, prefix } = stack.pop()!;

        for (const k in current) {
            if (Object.prototype.hasOwnProperty.call(current, k)) {
                const value = current[k];
                const newKey = prefix ? `${prefix}.${k}` : k;

                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    stack.push({ current: value, prefix: newKey });
                } else if (Array.isArray(value)) {
                    result[newKey] = JSON.stringify(value);
                } else {
                    result[newKey] = value;
                }
            }
        }
    }

    return result;
}

/**
 * Ensures all values in an array of objects are primitives (serializes nested stuff)
 */
function sanitizeForTabular(data: any[]): any[] {
    return data.map(item => {
        if (typeof item !== 'object' || item === null) return { value: item };

        const sanitized: any = {};
        for (const [key, value] of Object.entries(item)) {
            if (value !== null && typeof value === 'object') {
                sanitized[key] = JSON.stringify(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    });
}

self.onmessage = async (e: MessageEvent<WorkerMessage<ExcelConversionRequest>>) => {
    const { type, payload, id } = e.data;

    try {
        if (type === 'CONVERT_EXCEL') {
            const { data, type: convType, options } = payload;

            if (convType === 'json-to-excel') {
                let jsonData: any;
                if (data instanceof ArrayBuffer) {
                    const decoder = new TextDecoder();
                    jsonData = JSON.parse(decoder.decode(data));
                } else {
                    jsonData = typeof data === 'string' ? JSON.parse(data) : data;
                }

                let processedData = jsonData;

                // Ensure we have an array of objects
                if (!Array.isArray(processedData)) {
                    processedData = [processedData];
                }

                if (options?.flatten) {
                    processedData = processedData.map((item: any) => flattenObject(item));
                } else {
                    processedData = sanitizeForTabular(processedData);
                }

                const worksheet = XLSX.utils.json_to_sheet(processedData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, options?.sheetName || 'Sheet1');

                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

                const buffer = excelBuffer instanceof Uint8Array ? excelBuffer.buffer : excelBuffer;

                const response: WorkerResponse<ExcelConversionResponse> = {
                    type: 'CONVERSION_SUCCESS',
                    payload: { data: buffer },
                    id,
                };
                // @ts-ignore - Transferable check
                self.postMessage(response, [buffer]);
            } else if (convType === 'excel-to-json') {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const response: WorkerResponse<ExcelConversionResponse> = {
                    type: 'CONVERSION_SUCCESS',
                    payload: { data: jsonData },
                    id,
                };
                self.postMessage(response);
            }
        } else if (type === 'PARSE_FOR_PREVIEW') {
            const { data, options } = payload as any;
            let jsonData: any;

            if (data instanceof ArrayBuffer) {
                const decoder = new TextDecoder();
                jsonData = JSON.parse(decoder.decode(data));
            } else {
                jsonData = typeof data === 'string' ? JSON.parse(data) : data;
            }

            let processedData = jsonData;
            if (!Array.isArray(processedData)) {
                processedData = [processedData];
            }

            if (options?.flatten) {
                processedData = processedData.map((item: any) => flattenObject(item));
            }

            // Return first 1000 items for preview to keep worker response fast
            const previewData = processedData.slice(0, 1000);

            const response: WorkerResponse<any> = {
                type: 'PARSE_SUCCESS',
                payload: {
                    data: previewData,
                    totalRows: processedData.length
                },
                id,
            };
            self.postMessage(response);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const response: WorkerResponse = {
            type: 'CONVERSION_ERROR',
            payload: null,
            id,
            error: errorMessage,
        };
        self.postMessage(response);
    }
};

export { };
