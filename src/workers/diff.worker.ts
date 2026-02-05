import type { WorkerMessage, WorkerResponse } from '../types/worker';
import { diffLines, diffWords, diffJson } from 'diff';

export interface DiffRequest {
    text1: string;
    text2: string;
    mode: 'lines' | 'words' | 'json';
    ignoreWhitespace?: boolean;
}

export interface DiffResult {
    changes: Array<{
        value: string;
        added?: boolean;
        removed?: boolean;
        count?: number;
    }>;
}

self.onmessage = (e: MessageEvent<WorkerMessage<DiffRequest>>) => {
    const { type, payload, id } = e.data;

    try {
        if (type === 'COMPUTE_DIFF') {
            const { text1, text2, mode, ignoreWhitespace } = payload;

            let changes;

            if (text1.length + text2.length > 2000000) {
                // For massive text, fall back to line diff to prevent OOM/Hang
                changes = diffLines(text1, text2, { ignoreWhitespace });
            } else if (mode === 'json') {
                try {
                    // Parse JSON and use structure-aware diff
                    const obj1 = JSON.parse(text1);
                    const obj2 = JSON.parse(text2);
                    changes = diffJson(obj1, obj2);
                } catch (error) {
                    // If JSON parsing fails, fall back to line diff
                    changes = diffLines(text1, text2, { ignoreWhitespace });
                }
            } else if (mode === 'words') {
                changes = diffWords(text1, text2);
            } else {
                changes = diffLines(text1, text2, { ignoreWhitespace });
            }

            const response: WorkerResponse<DiffResult> = {
                type: 'DIFF_SUCCESS',
                payload: { changes },
                id,
            };
            self.postMessage(response);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const response: WorkerResponse = {
            type: 'DIFF_ERROR',
            payload: null,
            id,
            error: errorMessage,
        };
        self.postMessage(response);
    }
};

export { };
