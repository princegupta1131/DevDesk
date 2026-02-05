# Web Worker Pattern Architecture

## Overview

DevDesk uses Web Workers extensively to offload expensive operations from the main thread. This document explains the worker communication pattern, best practices, and performance considerations.

## Why Web Workers?

**Problem:** JavaScript is single-threaded. Heavy operations block the UI.

**Solution:** Move expensive work to background threads.

### Performance Impact

| Operation | Main Thread | With Worker |
|-----------|-------------|-------------|
| Parse 50MB JSON | 8.5s (UI frozen) | 8.5s (UI responsive) |
| Search 100k nodes | 2.1s (UI frozen) | 2.1s (UI responsive) |
| Diff 10k lines | 1.4s (UI frozen) | 1.4s (UI responsive) |

**Key Insight:** Workers don't make operations faster, they keep the UI responsive DURING the operation.

## Architecture

### Communication Flow

```
┌─────────────────┐                    ┌──────────────────┐
│   Main Thread   │                    │  Worker Thread   │
│  (UI/React)     │                    │  (Compute Only)  │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │  1. postMessage({                    │
         │       type: 'PARSE_JSON',            │
         │       payload: jsonString            │
         │     })                               │
         ├──────────────────────────────────────>
         │                                      │
         │                              2. Process data
         │                              3. Build result
         │                                      │
         │  4. postMessage({                    │
         │       type: 'PARSE_JSON',            │
         │       payload: jsonTree              │
         │     })                               │
         <──────────────────────────────────────┤
         │                                      │
    5. Resolve                                  │
       Promise                                  │
```

## Implementation

### Worker Manager

**File:** `src/utils/WorkerManager.ts`

Generic wrapper that provides:
- Promise-based API
- Progress reporting
- Error handling
- Debouncing
- Type safety

### Creating a Worker

```typescript
// 1. Define types
interface ParseRequest {
  json: string;
}

interface ParseResponse {
  tree: JsonNode;
  nodeCount: number;
}

// 2. Create manager
const parser = new WorkerManager<ParseRequest, ParseResponse>(
  new URL('../workers/jsonParser.worker.ts', import.meta.url)
);

// 3. Use it
const result = await parser.postMessage('PARSE_JSON', { json: data });
```

### Worker Implementation

```typescript
// jsonParser.worker.ts
onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = e.data;
  
  try {
    if (type === 'PARSE_JSON') {
      const tree = await parseJSON(payload.json);
      
      // Send result back
      postMessage({ type, payload: tree, id });
    }
  } catch (error) {
    // Send error back
    postMessage({ 
      type, 
      error: error.message, 
      id 
    });
  }
};
```

## Performance Optimizations

### 1. Transferable Objects (Zero-Copy)

**Problem:** Cloning large data between threads is expensive.

**Solution:** Transfer ownership of ArrayBuffers.

```typescript
// ❌ BAD - Copies 50MB of data
const buffer = await file.arrayBuffer();
worker.postMessage({ buffer });

// ✅ GOOD - Transfers ownership (zero-copy)
const buffer = await file.arrayBuffer();
worker.postMessage({ buffer }, [buffer]);
```

**Memory Impact:**
- Without transfer: 100MB total (50MB main + 50MB worker)
- With transfer: 50MB total (moved from main to worker)

### 2. Progress Reporting

For long operations, send progress updates:

```typescript
// In worker
for (let i = 0; i < bigArray.length; i++) {
  process(bigArray[i]);
  
  if (i % 1000 === 0) {
    postMessage({
      type: 'PROGRESS',
      payload: { 
        processed: i, 
        total: bigArray.length 
      },
      id
    });
  }
}
```

### 3. Yielding to Event Loop

Prevent "long task" warnings:

```typescript
let lastYield = Date.now();

for (const item of items) {
  processItem(item);
  
  // Yield every 12ms
  if (Date.now() - lastYield > 12) {
    await new Promise(resolve => setTimeout(resolve, 0));
    lastYield = Date.now();
  }
}
```

**Why 12ms?**
- 60 FPS requires 16ms per frame
- Leaves 4ms for browser rendering

### 4. Debouncing

Prevent redundant work for rapid updates:

```typescript
// User typing fast: "hello"
// Without debounce: 5 worker calls (h, he, hel, hell, hello)
// With 300ms debounce: 1 worker call (hello)

const results = await worker.postMessage(
  'SEARCH',
  query,
  undefined,
  300  // Wait 300ms before executing
);
```

## Error Handling

### Worker Crashes

```typescript
worker.onerror = (error) => {
  console.error('Worker crashed:', error);
  
  // Auto-restart worker
  worker = new Worker(workerUrl);
};
```

### Operation Timeouts

```typescript
const timeout = 30000; // 30 seconds

const result = await Promise.race([
  worker.postMessage('HEAVY_TASK', data),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), timeout)
  )
]);
```

## Best Practices

### ✅ DO

1. **Use workers for CPU-intensive tasks**
   - JSON parsing
   - Diff algorithms
   - Data transformations

2. **Transfer large ArrayBuffers**
   - Avoids memory clones
   - Critical for files > 1MB

3. **Yield periodically**
   - Prevents freezing warnings
   - Allows progress updates

4. **Clean up workers**
   ```typescript
   useEffect(() => {
     const worker = new WorkerManager(...);
     return () => worker.terminate();
   }, []);
   ```

### ❌ DON'T

1. **Don't access DOM from workers**
   - Workers have no DOM access
   - Use main thread for UI updates

2. **Don't create workers for small tasks**
   - Overhead isn't worth it for <100ms operations
   - Stick to main thread for simple processing

3. **Don't forget to handle errors**
   - Always catch worker errors
   - Provide fallback UI

## DevDesk Worker Inventory

| Worker | Purpose | Input | Output |
|--------|---------|-------|--------|
| `jsonParser.worker.ts` | Parse & search JSON | String/ArrayBuffer | JsonNode tree |
| `excel.worker.ts` | Excel ↔ JSON conversion | File/JSON | Table data |
| `csv.worker.ts` | CSV ↔ JSON conversion | File/JSON | Table data |

## Debugging Workers

### Chrome DevTools

1. Open **Sources** tab
2. Find worker in **Threads** panel
3. Set breakpoints in worker code
4. Step through execution

### Performance Profiling

```typescript
// In worker
const start = performance.now();
const result = parseJSON(data);
const duration = performance.now() - start;

postMessage({ type: 'PERF', payload: { duration } });
```

## Future Enhancements

- [ ] SharedArrayBuffer for parallel processing
- [ ] Worker pool for concurrent operations
- [ ] Streaming parser for ultra-large files
- [ ] WASM integration for performance-critical code
