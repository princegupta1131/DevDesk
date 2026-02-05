import type { WorkerMessage, WorkerResponse } from '../types/worker';

/**
 * Type-safe Web Worker wrapper for offloading heavy computations.
 * 
 * **Purpose:**
 * Moves expensive operations (JSON parsing, Excel processing, diffs) to a background
 * thread to keep the UI responsive at 60 FPS.
 * 
 * **Key Features:**
 * - Promise-based API for async operations
 * - Progress reporting for long-running tasks
 * - Transferable objects for zero-copy data transfer (critical for large files)
 * - Debouncing support to prevent redundant work
 * - Type-safe message passing
 * 
 * **Architecture:**
 * ```
 * Main Thread                    Worker Thread
 * ───────────                    ─────────────
 * postMessage() ──[payload]──→   onmessage()
 *                                  ↓
 *                              Process data
 *                                  ↓
 *               ←──[result]────  postMessage()
 * resolve()
 * ```
 * 
 * @template TRequest - Type of data sent TO the worker
 * @template TResponse - Type of data received FROM the worker
 * 
 * @example
 * ```typescript
 * // Create a parser worker
 * const parser = new WorkerManager<string, JsonNode>(
 *   new URL('./jsonParser.worker.ts', import.meta.url)
 * );
 * 
 * // Execute parsing with progress updates
 * const tree = await parser.postMessage(
 *   'PARSE_JSON',
 *   jsonString,
 *   undefined,
 *   0,
 *   (progress) => console.log(`Nodes: ${progress.nodeCount}`)
 * );
 * 
 * // Clean up when done
 * parser.terminate();
 * ```
 */
export class WorkerManager<TRequest = unknown, TResponse = unknown> {
    private worker: Worker | null = null;
    private messageHandlers: Map<string, (response: TResponse) => void>;
    private errorHandlers: Map<string, (error: string) => void>;
    private messageId = 0;
    private workerUrl: URL;

    constructor(workerUrl: URL) {
        this.workerUrl = workerUrl;
        this.messageHandlers = new Map();
        this.errorHandlers = new Map();
    }

    private progressHandlers: Map<string, (data: any) => void> = new Map();

    /**
     * Initialize the worker
     */
    init(): void {
        if (this.worker) return;

        this.worker = new Worker(this.workerUrl, { type: 'module' });

        this.worker.onmessage = (e: MessageEvent<WorkerResponse<TResponse>>) => {
            const { type, payload, id, error } = e.data;

            if (id) {
                // Handle Progress Events
                if (type === 'PROGRESS') {
                    const progressHandler = this.progressHandlers.get(id);
                    if (progressHandler) {
                        progressHandler(payload);
                    }
                    return;
                }

                if (error) {
                    const errorHandler = this.errorHandlers.get(id);
                    errorHandler?.(error);
                    this.errorHandlers.delete(id);
                    this.messageHandlers.delete(id);
                    this.progressHandlers.delete(id);
                } else {
                    const handler = this.messageHandlers.get(id);
                    handler?.(payload);
                    this.messageHandlers.delete(id);
                    this.errorHandlers.delete(id);
                    this.progressHandlers.delete(id);
                }
            }
        };

        this.worker.onerror = (error) => {
            console.error('Worker error:', error);
        };
    }

    /**
     * Send a message to the worker and get a promise for the response
     */
    private debounceTimers: Map<string, number> = new Map();

    /**
     * Send a message to the worker and await the response.
     * 
     * **Performance Features:**
     * - Debouncing: Queues rapid calls and only executes the latest
     * - Transferable objects: Use for large ArrayBuffers (zero-copy)
     * - Progress callbacks: Get real-time updates on long operations
     * 
     * @param type - Message type identifier (e.g., 'PARSE_JSON', 'SEARCH_JSON')
     * @param payload - Data to send to the worker
     * @param transfer - ArrayBuffers to transfer (not clone) for performance
     * @param debounceMs - Milliseconds to wait before executing (default: 0)
     * @param onProgress - Callback for progress updates during processing
     * @returns Promise resolving to the worker's response
     * 
     * @example
     * ```typescript
     * // Simple usage
     * const result = await worker.postMessage('PROCESS', data);
     * 
     * // With debouncing (useful for search-as-you-type)
     * const results = await worker.postMessage(
     *   'SEARCH',
     *   searchTerm,
     *   undefined,
     *   300  // Wait 300ms before executing
     * );
     * 
     * // With transferable (for large files)
     * const buffer = await file.arrayBuffer();
     * const parsed = await worker.postMessage(
     *   'PARSE_LARGE',
     *   buffer,
     *   [buffer]  // Transfer ownership to worker
     * );
     * ```
     */
    async postMessage(
        type: string,
        payload: TRequest,
        transfer?: Transferable[],
        debounceMs: number = 0,
        onProgress?: (data: any) => void
    ): Promise<TResponse> {
        this.init();

        // If debouncing is requested
        if (debounceMs > 0) {
            return new Promise((resolve, reject) => {
                // Cancel existing timer for this operation type
                if (this.debounceTimers.has(type)) {
                    clearTimeout(this.debounceTimers.get(type));
                }

                const timerId = window.setTimeout(() => {
                    this.executePostMessage(type, payload, transfer, onProgress)
                        .then(resolve)
                        .catch(reject)
                        .finally(() => {
                            this.debounceTimers.delete(type);
                        });
                }, debounceMs);

                this.debounceTimers.set(type, timerId);
            });
        }

        return this.executePostMessage(type, payload, transfer, onProgress);
    }

    private executePostMessage(
        type: string,
        payload: TRequest,
        transfer?: Transferable[],
        onProgress?: (data: any) => void
    ): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            const id = `${type}-${this.messageId++}`;

            this.messageHandlers.set(id, resolve);
            this.errorHandlers.set(id, reject);

            if (onProgress) {
                this.progressHandlers.set(id, onProgress);
            }

            const message: WorkerMessage<TRequest> = { type, payload, id };

            if (transfer) {
                this.worker?.postMessage(message, transfer);
            } else {
                this.worker?.postMessage(message);
            }
        });
    }

    /**
     * Terminate the worker and clean up all handlers.
     * 
     * **Important:** Always call this when the worker is no longer needed
     * to prevent memory leaks.
     * 
     * @example
     * ```typescript
     * useEffect(() => {
     *   const worker = new WorkerManager(...);
     *   // Use worker...
     *   
     *   return () => worker.terminate();  // Cleanup on unmount
     * }, []);
     * ```
     */
    terminate(): void {
        this.worker?.terminate();
        this.worker = null;
        this.messageHandlers.clear();
        this.errorHandlers.clear();
    }
}
