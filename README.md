# DevDesk - Fast JSON Viewer, Diff Checker & Data Converter

![DevDesk Logo](./public/devdesk-icon.svg)

**DevDesk** is a high-performance, privacy-first developer workspace designed to handle massive JSON files (100MB+), compare code and data structures, and convert between formats—all locally in your browser with zero uploads.

---

## 🚀 Why DevDesk?

**Stop switching between 5 different websites.** DevDesk consolidates your most common data tasks into one blazing-fast, offline-capable tool.

### 💎 Core Pillars
- **⚡ Extreme Speed**: Virtualized JSON tree handles 100MB+ files without lag.
- **🔒 Complete Privacy**: All processing happens locally. Your sensitive data never touches a server.
- **🎯 All-in-One Workspace**: JSON Viewer, Diff Checker, and Converters (Excel, CSV, PDF) in one unified UI.
- **💪 Professional Power**: Circuit-breaker architecture prevents crashes on massive payloads.

---

## 📁 Project Structure

```bash
src/
├── components/          # Shared UI atoms & Virtualized Core
│   └── VirtualizedJsonTree.tsx # 🔥 THE CORE ENGINE (Virtualization Logic)
├── features/            # Business Logic Modules
│   ├── json-viewer/     # JSON Viewer Feature
│   ├── diff-checker/    # Monaco-powered Diff Module
│   ├── converters/      # Transformation Logic (Excel, CSV, Word, PDF)
│   └── landing/         # Optimized Landing Page
├── workers/             # 🧠 The Data Plane (Web Workers)
│   ├── jsonParser.worker.ts # Yielding Async Parser
│   └── diff.worker.ts      # Offloaded Diffing Logic
├── store/               # Zustand Global State
├── config/              # Routing and Global Constants
└── utils/               # Worker Managers & Performance Hooks
```

---

## 🏗️ Technical Architecture ("Compute-Mesh")

DevDesk separates the **UI Plane** from the **Data Plane** to guarantee 60 FPS performance.

### 1. Yielding Parser Engine
Instead of blocking the browser, our custom parser yields to the event loop every **12ms**. This keeps the UI responsive even while analyzing a 50MB file.

### 2. Zero-Copy Data Transfer
Uses `Transferable Objects` (ArrayBuffers) to move data between threads. This eliminates memory doubling and cuts RAM usage by 50% during heavy operations.

### 3. Safety Circuit Breakers
- **Global Rendering Cap**: Hard-capped at **15,000 visible lines** to prevent DOM overload.
- **Child Pagination**: Objects/Arrays are paginated at **200 items** per node.
- **GPU Acceleration**: Uses compositor-only properties for buttery smooth scrolling.

---

## 📊 Performance Benchmarks

| File Size | Parse Time | Scroll FPS | Status |
| :--- | :--- | :--- | :--- |
| **1MB** | ~180ms | 60.0 | ✅ Perfect |
| **10MB** | ~800ms | 60.0 | ✅ Perfect |
| **50MB** | ~3.2s | 59.5 | ✅ Stable |
| **100MB** | ~7.5s | 58.0 | ✅ Stable |

---

## 🛠️ Tech Stack

- **Core**: React 19 + TypeScript 5
- **State**: Zustand (High-performance store)
- **Engine**: Web Workers (Multithreaded JS)
- **Editor**: Monaco Editor (VS Code Engine)
- **Styling**: Tailwind CSS (Glassmorphism & Micro-animations)
- **Utilities**: SheetJS, PDF-Lib, Papaparse, Lucide React

---

## 📦 Getting Started

### Prerequisites
- Node.js 20.x
- npm 10.x

### Quick Run
```bash
git clone <repository-url>
cd DevDesk
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📚 Developer Guide

### JSDoc Standards
All public APIs use professional JSDoc comments. Hover over methods in your IDE for documentation.

### Debugging Performance
Enable performance marks in your code:
```typescript
import { perfMark } from './utils/debug';
const measure = perfMark('customTask');
// ... logic
measure.end();
```

---

## 📄 License & Author

- **Author**: Prince Gupta (Sr. Software Engineer)
- **License**: MIT

---

**Built with ❤️ for the Developer Community** | v1.2.0
