import type { JsonValue, JsonNode } from '../types/json';

export const getValueType = (
    value: JsonValue
): 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value as 'string' | 'number' | 'boolean' | 'object';
};

export const buildJsonTree = (
    data: JsonValue,
    initialKey: string = 'root'
): JsonNode => {
    const type = getValueType(data);
    const rootNode: JsonNode = {
        key: initialKey,
        value: data,
        type,
        path: initialKey,
        isExpanded: false,
    };

    if (type !== 'object' && type !== 'array') {
        return rootNode;
    }

    const stack: { node: JsonNode; data: any }[] = [{ node: rootNode, data }];

    while (stack.length > 0) {
        const { node, data: currentData } = stack.pop()!;
        const currentPath = node.path;

        if (node.type === 'object' && currentData !== null) {
            node.children = [];
            const entries = Object.entries(currentData as Record<string, JsonValue>);
            // Process in reverse to maintain order when using a stack
            for (let i = entries.length - 1; i >= 0; i--) {
                const [childKey, childValue] = entries[i];
                const childType = getValueType(childValue);
                const childNode: JsonNode = {
                    key: childKey,
                    value: childValue,
                    type: childType,
                    path: `${currentPath}.${childKey}`,
                    isExpanded: false,
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
                    isExpanded: false,
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

export const searchJsonTree = (node: JsonNode, query: string): boolean => {
    const lowerQuery = query.toLowerCase();

    // Search in key
    if (node.key.toLowerCase().includes(lowerQuery)) {
        return true;
    }

    // Search in value (for primitives)
    if (node.type !== 'object' && node.type !== 'array') {
        const valueStr = String(node.value).toLowerCase();
        if (valueStr.includes(lowerQuery)) {
            return true;
        }
    }

    // Search in children
    if (node.children) {
        return node.children.some((child) => searchJsonTree(child, query));
    }

    return false;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
export const deepSortKeys = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepSortKeys);
    }

    const sortedKeys = Object.keys(obj).sort();
    const result: any = {};
    for (const key of sortedKeys) {
        result[key] = deepSortKeys(obj[key]);
    }
    return result;
};
