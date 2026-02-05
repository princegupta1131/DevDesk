export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export interface JsonNode {
    key: string;
    value: JsonValue;
    type: 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';
    path: string;
    isExpanded?: boolean;
    children?: JsonNode[];
}

export interface ParseError {
    message: string;
    lineNumber: number | null;
}
