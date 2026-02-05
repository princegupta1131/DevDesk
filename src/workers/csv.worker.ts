import type { WorkerMessage, WorkerResponse } from '../types/worker';
import Papa from 'papaparse';

export interface CsvConversionRequest {
    data: string | ArrayBuffer;
    type?: 'json-to-csv' | 'csv-to-json';
    options?: {
        delimiter?: string;
        flatten?: boolean;
    };
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

self.onmessage = async (e: MessageEvent<WorkerMessage<CsvConversionRequest>>) => {
    const { type, payload, id } = e.data;

    try {
        if (type === 'CONVERT_CSV') {
            const { data, type: convType, options } = payload;

            let stringData = '';
            if (data instanceof ArrayBuffer) {
                const decoder = new TextDecoder();
                stringData = decoder.decode(data);
            } else {
                stringData = data;
            }

            if (convType === 'json-to-csv') {
                const jsonData = JSON.parse(stringData);
                let processedData = jsonData;

                if (options?.flatten) {
                    processedData = jsonData.map((item: any) => flattenObject(item));
                } else {
                    processedData = sanitizeForTabular(jsonData);
                }

                const csv = Papa.unparse(processedData, {
                    delimiter: options?.delimiter || ',',
                });

                const response: WorkerResponse<string> = {
                    type: 'CONVERSION_SUCCESS',
                    payload: csv,
                    id,
                };
                self.postMessage(response);
            } else if (convType === 'csv-to-json') {
                const results = Papa.parse(stringData, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    delimiter: options?.delimiter || '',
                });

                const response: WorkerResponse<any[]> = {
                    type: 'CONVERSION_SUCCESS',
                    payload: results.data,
                    id,
                };
                self.postMessage(response);
            }
        } else if (type === 'PARSE_FOR_PREVIEW') {
            const { data, options } = payload as any;
            let stringData = '';
            if (data instanceof ArrayBuffer) {
                const decoder = new TextDecoder();
                stringData = decoder.decode(data);
            } else {
                stringData = data;
            }

            const jsonData = JSON.parse(stringData);
            let processedData = jsonData;
            if (!Array.isArray(processedData)) {
                processedData = [processedData];
            }

            if (options?.flatten) {
                processedData = processedData.map((item: any) => flattenObject(item));
            }

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
