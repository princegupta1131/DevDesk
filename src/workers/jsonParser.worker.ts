import type { WorkerMessage, WorkerResponse } from '../types/worker';
import type { ParseError, JsonValue, JsonNode } from '../types/json';

const getValueType = (
    value: JsonValue
): 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value as 'string' | 'number' | 'boolean' | 'object';
};

const buildJsonTree = async (
    data: JsonValue,
    initialKey: string = 'root',
    onProgress?: (count: number) => void
): Promise<JsonNode> => {
    const type = getValueType(data);
    const rootNode: JsonNode = {
        key: initialKey,
        value: data,
        type,
        path: initialKey,
    };

    if (type !== 'object' && type !== 'array') {
        return rootNode;
    }

    const stack: { node: JsonNode; data: any }[] = [{ node: rootNode, data }];
    let lastYield = performance.now();
    let lastProgressReport = 0;
    let processedNodes = 0;
    const YIELD_INTERVAL_MS = 12; // Yield every 12ms to keep worker responsive
    const PROGRESS_REPORT_MS = 150; // Only report progress to UI every 150ms

    while (stack.length > 0) {
        processedNodes++;

        // Critical: Yield to event loop to allow other messages (like Cancel) to be processed
        const now = performance.now();
        if (now - lastYield > YIELD_INTERVAL_MS) {
            await new Promise(resolve => setTimeout(resolve, 0));
            lastYield = performance.now();

            // Send progress update (throttled)
            if (onProgress && now - lastProgressReport > PROGRESS_REPORT_MS) {
                onProgress(processedNodes);
                lastProgressReport = now;
            }
        }

        const { node, data: currentData } = stack.pop()!;
        const currentPath = node.path;

        if (node.type === 'object' && currentData !== null) {
            node.children = [];
            const entries = Object.entries(currentData as Record<string, JsonValue>);
            for (let i = entries.length - 1; i >= 0; i--) {
                const [childKey, childValue] = entries[i];
                const childType = getValueType(childValue);
                const childNode: JsonNode = {
                    key: childKey,
                    value: childValue,
                    type: childType,
                    path: `${currentPath}.${childKey}`,
                };
                node.children.unshift(childNode);
                if (childType === 'object' || childType === 'array') {
                    stack.push({ node: childNode, data: childValue });
                }
            }
        } else if (node.type === 'array') {
            node.children = [];
            const arrayData = currentData as JsonValue[];
            for (let i = arrayData.length - 1; i >= 0; i--) {
                const item = arrayData[i];
                const childType = getValueType(item);
                const childNode: JsonNode = {
                    key: `[${i}]`,
                    value: item,
                    type: childType,
                    path: `${currentPath}.[${i}]`,
                };
                node.children.unshift(childNode);
                if (childType === 'object' || childType === 'array') {
                    stack.push({ node: childNode, data: item });
                }
            }
        }
    }

    return rootNode;
};

const findSearchMatches = (node: JsonNode, query: string, expandedPaths: Set<string>, counter: { count: number }) => {
    const lowerQuery = query.toLowerCase();
    const keyMatch = node.key.toLowerCase().includes(lowerQuery);
    const valueMatch = node.type !== 'object' && node.type !== 'array' && String(node.value).toLowerCase().includes(lowerQuery);

    if (keyMatch) counter.count++;
    if (valueMatch) counter.count++;

    let hasChildMatch = false;
    if (node.children) {
        for (const child of node.children) {
            if (findSearchMatches(child, query, expandedPaths, counter)) {
                hasChildMatch = true;
            }
        }
    }

    if ((hasChildMatch || keyMatch) && node.children && node.children.length > 0) {
        expandedPaths.add(node.path);
    }

    return keyMatch || valueMatch || hasChildMatch;
};

/**
 * Strips single-line // comments from JSON string
 * Preserves // inside string literals
 */
const stripComments = (jsonString: string): string => {
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];
        const nextChar = jsonString[i + 1];

        // Handle escape sequences
        if (escapeNext) {
            result += char;
            escapeNext = false;
            continue;
        }

        if (char === '\\' && inString) {
            result += char;
            escapeNext = true;
            continue;
        }

        // Toggle string state
        if (char === '"' && !escapeNext) {
            inString = !inString;
            result += char;
            continue;
        }

        // Skip // comments outside strings
        if (!inString && char === '/' && nextChar === '/') {
            // Skip until end of line
            while (i < jsonString.length && jsonString[i] !== '\n') {
                i++;
            }
            continue;
        }

        result += char;
    }

    return result;
};

let lastParsedTree: JsonNode | null = null;

self.onmessage = async (e: MessageEvent<WorkerMessage<any>>) => {
    const { type, payload, id } = e.data;

    let jsonString = '';
    try {
        if (type === 'PARSE_JSON') {
            const data = payload as string | ArrayBuffer;
            if (data instanceof ArrayBuffer) {
                const decoder = new TextDecoder();
                jsonString = decoder.decode(data);
            } else {
                jsonString = data;
            }

            // Strip comments before parsing
            const cleanedJson = stripComments(jsonString);
            const parsed = JSON.parse(cleanedJson);

            // Pass progress callback
            const tree = await buildJsonTree(parsed, 'root', (count) => {
                self.postMessage({
                    type: 'PROGRESS',
                    payload: { nodesProcessed: count },
                    id
                });
            });
            lastParsedTree = tree;

            const response: WorkerResponse = {
                type: 'PARSE_SUCCESS',
                payload: tree,
                id,
            };
            self.postMessage(response);
        } else if (type === 'SEARCH_JSON') {
            const query = typeof payload === 'string' ? payload : payload?.query;
            const tree = lastParsedTree || payload?.tree;
            if (!tree || !query) {
                const response: WorkerResponse = {
                    type: 'SEARCH_SUCCESS',
                    payload: { paths: [], count: 0 },
                    id,
                };
                self.postMessage(response);
                return;
            }
            const expandedPaths = new Set<string>();
            const counter = { count: 0 };
            findSearchMatches(tree as JsonNode, query, expandedPaths, counter);

            const response: WorkerResponse = {
                type: 'SEARCH_SUCCESS',
                payload: { paths: Array.from(expandedPaths), count: counter.count },
                id,
            };
            self.postMessage(response);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const lineMatch = errorMessage.match(/position (\d+)/);
        const position = lineMatch ? parseInt(lineMatch[1]) : null;

        let lineNumber = null;
        if (position !== null && jsonString) {
            const lines = jsonString.substring(0, position).split('\n');
            lineNumber = lines.length;
        }

        const errorPayload: ParseError = {
            message: errorMessage,
            lineNumber,
        };

        const response: WorkerResponse<ParseError> = {
            type: 'PARSE_ERROR',
            payload: errorPayload,
            id,
            error: errorMessage,
        };
        self.postMessage(response);
    }
};

export { };
