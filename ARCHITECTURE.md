# DevDesk Architecture & Feature Documentation

## 1. Executive Summary
DevDesk is a high-performance, client-side offline developer workspace. It is designed with an **Application-Grade Architecture** that mimics desktop tools like VS Code, prioritizing main-thread responsiveness and strict memory management.

Unlike typical web apps that crash with 50MB files, DevDesk employs a **Compute-Mesh** architecture where heavy lifting is offloaded to Web Workers, and the UI uses strict Virtualization and "Circuit Breakers" to guarantee 60 FPS performance regardless of payload size.

---

## 2. Core Architecture: The "Green" Model

### 2.1 Compute-Mesh Design
The application is split into two distinct execution distinct layers:
*   **The UI Plane (Main Thread)**: Purely for rendering and user input. It is "Data Agnostic", meaning it never holds the full dataset in memory. It only holds the ~30 items currently visible on screen.
*   **The Data Plane (Web Workers)**: Background threads that handle Parsing, Filtering, Searching, and Transformation.

```mermaid
graph TD
    UserInput[User Input] --> UI[React UI Thread (Presentation)]
    UI -- "Async Messages" --> Worker[Web Worker (Compute)]
    
    subgraph "Data Plane"
        Worker --> Parser[JSON Parser]
        Worker --> Search[Search Engine]
        Worker --> Converter[File Converters]
    end
    
    Parser -- "Streamed Results" --> Worker
    Worker -- "Windowed Data (0-30)" --> UI
```

### 2.2 Performance Safeguards (The "Circuit Breakers")
To prevent browser hangs ("Application Frozen"), we implement strict limits at the architectural level:
1.  **Rendering Cap**: The `VirtualizedJsonTree` will fundamentally refuse to render more than **15,000 lines**. If a user tries to "Expand All" on a massive file, the operation is intercepted and a `⚠️ VIEW TRUNCATED` virtual node is injected.
2.  **Child Pagination**: Individual arrays/objects are capped at **200 items**. Massive arrays (e.g., 50k logs) are automatically paginated with `...and X more items` indicators.
3.  **Layout Loop Prevention**: usage of `ResizeObserver` strictly follows the **Disconnect/Re-observe** pattern wrapped in `requestAnimationFrame`. This breaks potential infinite layout loops that cause "Limit Exceeded" crashes in Chrome.
4.  **Editor Optimization**: The Monaco Editor instance is configured in "Performance Mode", with minimap, syntax decorations, and hover effects disabled for large files to reduce Main Thread blocking time.
5.  **GPU Acceleration**: List scrolling uses `will-change: transform` to bypass the browser's Paint cycle, relying solely on the GPU Compositor.

### 2.3 Progressive Feedback System
To ensure user confidence during long-running tasks:
*   **Real-Time Progress**: The parser worker emits `PROGRESS` events every 12ms.
*   **Yielding Engine**: The `buildJsonTree` algorithm yields to the event loop periodically, preventing the "Worker Unresponsive" browser warning.
*   **Feedback Loop**: The UI displays exact nodes processed ("Processed 45,200 nodes...") instead of a static spinner.

---

## 3. Feature Technical Specifications

### 3.1 JSON Viewer (High-Performance)
*   **Engine**: Custom Virtualized Tree (Recycled DOM nodes).
*   **Capacity**: Tested successfully with **100MB+** JSON files.
*   **Search**: Fully asynchronous. Search happens in a Worker; results are sent back as a list of Paths.
*   **Safety**: "Expand All" is disabled for root nodes with >2,000 children to prevent accidental freezes.

### 3.2 Diff Checker
*   **Engine**: Monaco Editor (VS Code's core) Diff implementation.
*   **Performance Config**:
    *   `minimap: { enabled: false }`
    *   `renderValidationDecorations: 'off'`
    *   `occurrencesHighlight: 'off'`
*   **Modes**: 
    *   **Text**: Line-by-line comparison.
    *   **JSON**: Structural comparison with auto-sorting of keys to handle "identical data, different order".
*   **Processing**: Diff calculation runs in a separate Worker to keep typing responsive.

### 3.3 Data Converters
All conversions happen locally (Offline-First).
*   **JSON ↔ Excel**: Checks for flat/nested structures. Supports "Flattening" strategies.
*   **JSON ↔ CSV**: streaming-compatible parsing.
*   **Excel ↔ CSV**: Cross-conversion utility.

### 3.4 Document Converter (Kernel v1.0)
*   **Word to PDF**: 
    *   *Implementation*: `mammoth.js` (Extraction) + `pdf-lib` (Generation).
    *   *Limit*: currently "Text-Fidelity". It extracts raw text and regenerates a clean PDF. Does not preserve complex complex layouts (tables/images) in this version.
*   **PDF to Word**: 
    *   *Status*: Placeholder/Limited. High-fidelity PDF->Word is computationally prohibitive in pure JS/Client-side environments currently.

---

## 4. Directory Structure
```
src/
├── components/          # Shared UI atoms (Buttons, Layouts)
│   └── VirtualizedJsonTree.tsx # THE CORE ENGINE (Virtualization Logic)
├── features/            # Business Logic Modules
│   ├── json-viewer/     # JSON Viewer Module
│   ├── diff-checker/    # Diff Module
│   └── converters/      # All File Transformation Logic
├── workers/             # The "Data Plane" (Background Threads)
│   ├── jsonParser.worker.ts
│   ├── diff.worker.ts
│   └── ...
└── store/               # Zustand Global State
```

## 5. System Evolution Roadmap
Based on architectural validation, the system will evolve through the following phases to support **Enterprise Scale (1GB+)** files:

### Phase 1: Communication Layer Optimization (COMPLETED)
*   [x] **ResizeObserver Stability**: Implemented disconnect/re-observe pattern.
*   [x] **Monaco Loading**: Configured for async resource loading.
*   [x] **Zero-Copy Transfer**: Replace `postMessage(data)` with `postMessage(data, [buffer])` to eliminate RAM doubling during transfer.
*   [x] **Debouncing**: Implement request coalescing (150ms buffer) for high-frequency Worker requests.

### Phase 2: Streaming & Responsiveness (COMPLETED)
*   [x] **Responsive Async Parser**: Implemented "Yielding Tree Builder" that pauses every 12ms to prevent worker lock-up. (Replaces Streaming Parser due to env limits).
*   [x] **Progressive Feedback**: Implemented `PROGRESS` event stream from Worker to UI for real-time status updates.
*   [ ] **IndexedDB Caching**: Store parsed file models in IndexedDB to allow page reloads without re-processing.

### Phase 3: The WASM Core
*   **Rust Integration**: Replace TypeScript parsers with Rust compiled to WebAssembly (WASM) for near-native performance.
*   **Simd-JSON**: Utilize SIMD instructions for 10x faster parsing speeds.

### Phase 4: True Desktop Architecture
*   **SharedArrayBuffer**: Establish a shared memory block between UI and Worker for instant "Pointer-based" data access (no message passing).
*   **OPFS (Origin Private File System)**: Direct disk random-access for editing inputs without loading the entire file into memory.
