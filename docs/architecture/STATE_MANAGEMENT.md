# State Management Architecture

## Overview

DevDesk uses React Context API with performance optimizations for global state management. This document explains the architecture, best practices, and how to work with the state.

## Why Context API?

**Requirements:**
- Share state across unrelated components
- Avoid prop drilling
- Keep state updates performant

**Why not Redux?**
- DevDesk's state is simple (6 feature slices)
- No complex middleware needed
- Context + hooks is lighter weight

## Architecture

### State Structure

```typescript
AppState
├── jsonViewer      // JSON tree viewer state
├── diffChecker     // Text/JSON diff tool state
├── jsonExcel       // JSON ↔ Excel converter
├── jsonCsv         // JSON ↔ CSV converter
├── wordPdf         // Word ↔ PDF converter
└── excelCsv        // Excel ↔ CSV converter
```

**Design Principle:** Each feature gets its own state slice for isolation.

### Files

| File | Purpose |
|------|---------|
| `src/store/AppContext.tsx` | State definitions, provider, hooks |
| `src/features/*/` | Components that consume state |

## Usage

### Reading State

```typescript
function MyComponent() {
  const { state } = useAppStore();
  
  return <div>{state.jsonViewer.jsonTree}</div>;
}
```

### Updating State

```typescript
function MyComponent() {
  const { setJsonViewer } = useAppStore();
  
  const handleParse = () => {
    setJsonViewer({ 
      jsonTree: parsedData,
      error: null 
    });
  };
}
```

**Important:** Use partial updates. Only pass fields that changed.

## Performance Optimizations

### 1. Memoized Setters

**Problem:** Without memoization, setter functions change on every render, causing child re-renders.

**Solution:**

```typescript
const setJsonViewer = React.useCallback(
  (data: Partial<JsonViewerState>) =>
    setJsonViewerState(prev => ({ ...prev, ...data })),
  []  // Empty deps = stable reference
);
```

**Impact:**
- Before: Components re-rendered on every state change
- After: Components only re-render when their specific data changes

### 2. Memoized Context Value

```typescript
const value = React.useMemo(() => ({
  state: { jsonViewer, diffChecker, ... },
  setJsonViewer,
  setDiffChecker,
  ...
}), [jsonViewer, diffChecker, ...]);
```

**Why:** Prevents unnecessary provider re-renders.

### 3. Partial Updates

```typescript
// ❌ BAD - Replaces entire state
setJsonViewer({
  jsonInput: '',
  jsonTree:null,
  fileInfo: null,
  isDirectMode: false,
  rawFile: null,
  error: null
});

// ✅ GOOD - Only updates what changed
setJsonViewer({ error: null });
```

## State Slices Explained

### JsonViewerState

**Purpose:** Manage JSON visualization

```typescript
interface JsonViewerState {
  jsonInput: string;         // Raw JSON string
  jsonTree: JsonNode | null; // Parsed tree
  fileInfo: { name, size } | null;
  isDirectMode: boolean;     // ArrayBuffer transfer mode
  rawFile: File | null;      // For Direct Mode
  error: ParseError | null;
}
```

**Key Fields:**
- `isDirectMode`: Enables zero-copy for files > 2MB
- `rawFile`: Needed for Direct Mode processing

### DiffCheckerState

**Purpose:** Compare text or JSON

```typescript
interface DiffCheckerState {
  text1: string;
  text2: string;
  mode: 'text' | 'json';
  ignoreWhitespace: boolean;
  sortKeys: boolean;  // JSON mode only
}
```

### Converter States

All follow similar pattern:

```typescript
interface ConverterState {
  inputData: string;      // Source data
  tableData: any[];       // Parsed preview
  file: File | null;
  mode: 'a-to-b' | 'b-to-a';
  isDirty: boolean;       // Unsaved changes
  ...
}
```

## Best Practices

### ✅ DO

1. **Use partial updates**
   ```typescript
   setJsonViewer({ error: null });
   ```

2. **Clear errors on new operations**
   ```typescript
   const handleNewParse = async () => {
     setJsonViewer({ error: null });  // Clear old error
     try {
       const result = await parse();
       setJsonViewer({ jsonTree: result });
     } catch (err) {
       setJsonViewer({ error: err });
     }
   };
   ```

3. **Access only needed state**
   ```typescript
   // Good
   const { state } = useAppStore();
   const tree = state.jsonViewer.jsonTree;
   
   // Also good (destructure)
   const { jsonViewer } = useAppStore().state;
   ```

### ❌ DON'T

1. **Don't mutate state directly**
   ```typescript
   // ❌ BAD
   state.jsonViewer.error = null;
   
   // ✅ GOOD
   setJsonViewer({ error: null });
   ```

2. **Don't create setters in loops**
   ```typescript
   // ❌ BAD
   items.map(item => {
     const update = () => setJsonViewer({ ... });
     return <Button onClick={update} />;
   });
   
   // ✅ GOOD
   const handleUpdate = useCallback((item) => {
     setJsonViewer({ ... });
   }, []);
   
   items.map(item => (
     <Button onClick={() => handleUpdate(item)} />
   ));
   ```

3. **Don't use context for frequently changing values**
   ```typescript
   // ❌ BAD - Mouse position updates 60 times/sec
   setJsonViewer({ mouseX: e.clientX });
   
   // ✅ GOOD - Use local state
   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
   ```

## Debugging

### React DevTools

1. Install **React Developer Tools** extension
2. Open **Components** tab
3. Find `AppProvider`
4. Inspect `value` prop to see current state

### Logging State Changes

```typescript
useEffect(() => {
  console.log('[JsonViewer] State updated:', state.jsonViewer);
}, [state.jsonViewer]);
```

### Performance Profiling

```typescript
// Enable React Profiler
import { Profiler } from 'react';

<Profiler id="JsonViewer" onRender={logRenderTime}>
  <JsonViewer />
</Profiler>
```

## Common Patterns

### Pattern: Reset State

```typescript
const handleReset = () => {
  setJsonViewer({
    jsonInput: '',
    jsonTree: null,
    fileInfo: null,
    isDirectMode: false,
    rawFile: null,
    error: null
  });
};
```

### Pattern: Toggle Mode

```typescript
const toggleMode = () => {
  setDiffChecker(prev => ({ 
    mode: prev.mode === 'text' ? 'json' : 'text' 
  }));
};
```

### Pattern: Batch Updates

```typescript
// One setState call, multiple fields
setJsonExcel({
  inputData: json,
  tableData: parsed,
  isDirty: true,
  totalRows: parsed.length
});
```

## Adding a New Feature

1. **Define state interface** in `AppContext.tsx`
   ```typescript
   interface MyFeatureState {
     data: string;
     isProcessing: boolean;
   }
   ```

2. **Add to AppState**
   ```typescript
   interface AppState {
     // ... existing
     myFeature: MyFeatureState;
   }
   ```

3. **Create initial state**
   ```typescript
   const initialMyFeature: MyFeatureState = {
     data: '',
     isProcessing: false
   };
   ```

4. **Add setter to context type**
   ```typescript
   interface AppContextType {
     // ... existing
     setMyFeature: (data: Partial<MyFeatureState>) => void;
   }
   ```

5. **Implement in AppProvider**
   ```typescript
   const [myFeature, setMyFeatureState] = useState(initialMyFeature);
   
   const setMyFeature = React.useCallback(
     (data: Partial<MyFeatureState>) =>
       setMyFeatureState(prev => ({ ...prev, ...data })),
     []
   );
   ```

6. **Add to context value**
   ```typescript
   const value = useMemo(() => ({
     state: { ..., myFeature },
     ...,
     setMyFeature
   }), [..., myFeature]);
   ```

## Future Enhancements

- [ ] Add middleware support for logging
- [ ] Implement undo/redo for converter states
- [ ] Add state persistence to localStorage
- [ ] Create custom hooks for common patterns
