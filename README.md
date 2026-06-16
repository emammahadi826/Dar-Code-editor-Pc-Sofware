<!-- markdownlint-disable MD033 -->
<div align="center">
  <h1 style="font-size: 2.5em; margin: 0; color: #ffffff;">
    Dar Studio &mdash; <span style="font-size: 0.55em; color: #888;"><em>Developed by Mahadi</em></span>
  </h1>
  <br>
  <img src="Icon/Main%20icon.png" width="200" height="200" alt="Dar Studio Logo">
  <p align="center" style="font-size: 1.1em; color: #888; margin: 10px 0 0 0;">
    A modern, feature-rich code editor built with Electron, React, and Monaco Editor
  </p>
  <br>
  <p align="center">
    <img src="Screen%20Shorts/Screenshot%202026-06-16%20073110.png" width="800" alt="Dar Studio Screenshot" style="border-radius: 8px; border: 1px solid #333;">
  </p>
</div>

<br>

## Overview

Dar Studio is a full-featured code editor for Windows, built from the ground up using **Electron 28**, **React 18**, **TypeScript**, and **Monaco Editor** (the engine behind VS Code). It provides a native desktop experience with a modern, customizable UI.

<br>

## Features

### Editor
- **Monaco Editor** — Full VS Code editing experience with syntax highlighting, IntelliSense, multi-cursor, bracket matching, and more
- **Multi-tab editing** — Open and manage multiple files simultaneously
- **Auto language detection** — Automatically detects language from file extension (`js`, `ts`, `py`, `html`, `css`, `json`, `md`, `rs`, `go`, `java`, and 80+ more)
- **Font size control** — Adjustable editor font size, tab size, word wrap, minimap, and line numbers

### File Management
- **File Explorer** — Tree-based file browser with expand/collapse directories
- **File operations** — Create, rename, delete files and folders
- **Context menus** — Right-click on files/folders for quick actions
- **Selection highlight** — Click to select files/folders with visual highlight
- **Create in folder** — Header + buttons create inside the currently selected folder
- **Drag region** — Title bar is fully draggable

### Menu Bar
- **VS Code-style menu bar** with 8 dropdown menus:
  - **File** — New File, Open File/Folder, Save/Save As, Close/Close All
  - **Edit** — Undo, Redo, Cut, Copy, Paste, Find, Replace
  - **Selection** — Select All
  - **View** — Command Palette (coming soon), Toggle Sidebar/Panel, Zoom In/Out/Reset
  - **Go** — Go to Line, Go to File
  - **Run** — Run Code, Stop (coming soon)
  - **Terminal** — New Terminal, Toggle Terminal
  - **Help** — About Dar Studio, Documentation
- **Click to open** — Each menu opens on click with hover-to-navigate between menus
- **Click outside to close** — Dropdowns close when clicking anywhere outside

### Search
- **Real-time search** — Instantly searches across all files as you type (300ms debounce)
- **Case-sensitive toggle** — `Aa` button to toggle case sensitivity
- **Result count** — Shows total results across files
- **Clear button** — One-click to clear query and results
- **Global shortcut** — `Ctrl+Shift+F` opens search from anywhere
- **Smart directory filtering** — Skips `.git`, `node_modules`, `dist`, `out`, `build`, `.venv`, `__pycache__`, `.vite`, `.cache`, and all dotfiles

### Terminal
- **Integrated terminal** — Full terminal powered by `node-pty`
- **Multi-shell support** — PowerShell, CMD, Git Bash, WSL detection
- **Tab management** — Create and switch between multiple terminal instances

### UI / Layout
- **Resizable panels** — Sidebar, editor, and bottom panel are all resizable with draggable separators
- **Activity Bar** — Quick switch between Explorer, Search, Git (coming soon), Extensions (coming soon), and Settings
- **Bottom Panel** — Terminal, Output Logs, and Problems tabs
- **Status Bar** — Cursor position (Ln/Col), language, encoding, word wrap indicator, file path
- **Custom Title Bar** — Custom window controls with app icon and name
- **VS Code-inspired dark theme** — Consistent color scheme across all components
- **Collapsible panels** — Sidebar and bottom panel can be hidden completely

### Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS 3
- **Editor:** Monaco Editor 0.55 (via `@monaco-editor/react`)
- **State:** Zustand
- **Desktop:** Electron 28, `electron-vite`
- **Terminal:** `node-pty`
- **Icons:** Lucide React, Iconify (vscode-icons)

<br>

## Screenshots

<div align="center">
  <img src="Screen%20Shorts/Screenshot%202026-06-16%20073110.png" width="800" alt="Dar Studio Screenshot 1" style="border-radius: 8px; border: 1px solid #333; margin: 10px;">
  <br>
  <img src="Screen%20Shorts/Screenshot%202026-06-16%20073253.png" width="800" alt="Dar Studio Screenshot 2" style="border-radius: 8px; border: 1px solid #333; margin: 10px;">
</div>

<br>

## Getting Started

### Prerequisites

- **Node.js** 18+ (20 LTS recommended)
- **Windows** 10/11 (the app is Windows-only; built and tested on Windows)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dar-studio.git

# Navigate to the project directory
cd dar-studio

# Install dependencies
npm install

# Start the development server
npm run dev
```

This launches a Vite dev server on port 5173 and opens an Electron window.

### Build for Production

```bash
npm run build      # Build all 3 targets (main, preload, renderer)
npm run package    # Build + create NSIS installer + portable .exe
```

The packaged installer will be in the `dist/` directory.

<br>

## Project Structure

```
dar-studio/
├── Icon/                       # App icons for all sizes
├── Screen Shorts/              # Screenshots for README
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts            # Window creation, IPC setup
│   │   ├── file-system.ts      # File system IPC handlers
│   │   ├── search-files.ts     # Search across files
│   │   ├── shell-manager.ts    # node-pty terminal
│   │   └── window-controls.ts  # Min/Max/Close handlers
│   ├── preload/
│   │   └── index.ts            # contextBridge IPC exposure
│   └── renderer/
│       ├── App.tsx             # Root layout + keybindings
│       ├── main.tsx            # React entry point
│       ├── assets/             # Icons imported by Vite
│       ├── components/
│       │   └── FileTree/       # FileTree + FileTreeNode
│       ├── hooks/
│       │   └── useFileSystem.ts
│       ├── layout/
│       │   ├── ActivityBar.tsx  # Sidebar icon navigation
│       │   ├── BottomPanel.tsx  # Terminal/Output/Problems tabs
│       │   ├── MainArea.tsx     # Editor tabs + Monaco
│       │   ├── MenuBar.tsx      # VS Code-style menu bar
│       │   ├── SidePanel.tsx    # Resizable side panel
│       │   ├── StatusBar.tsx    # Bottom status bar
│       │   └── TitleBar.tsx     # Custom title bar + menu bar
│       ├── modules/
│       │   ├── SearchInFiles/   # File search with debounce
│       │   └── Settings/        # Settings panel
│       └── store/
│           ├── appStore.ts      # Global app state (Zustand)
│           └── settingsStore.ts # Editor settings (Zustand)
├── electron-vite.config.ts
├── package.json
├── tailwind.config.js
└── tsconfig*.json
```

<br>

## Architecture

- **Main Process** (`src/main/`): Window management, IPC handlers for file system, search, terminal (node-pty)
- **Preload** (`src/preload/`): Secure bridge exposing Electron APIs to renderer via `contextBridge`
- **Renderer** (`src/renderer/`): React app with Zustand stores, Monaco Editor, Tailwind UI
- **Layout**: TitleBar (with MenuBar) → ActivityBar + SidePanel + EditorArea + BottomPanel → StatusBar

### IPC Communication

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `win:*` | Main → Renderer | Window controls (min/max/close) |
| `fs:*` | Renderer → Main | File read/write/create/delete/rename |
| `dialog:*` | Renderer → Main | Native open/save dialogs |
| `search:inFiles` | Renderer → Main | Full-text search across files |
| `terminal:*` | Both directions | Terminal create/write/resize/kill/data |

<br>

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+W` | Close current tab |
| `Ctrl+Shift+F` | Open search panel |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+J` | Toggle bottom panel |
| `Ctrl+\`` | New terminal / toggle terminal |
| `Ctrl+=` / `Ctrl+-` | Zoom in / out |
| `Ctrl+G` | Go to line |
| `Ctrl+P` | Go to file (opens search) |

<br>

## Development

### Main Process

```bash
npm run dev    # Start with Vite hot-reload + Electron
```

### Commands

```bash
npm run build      # Build to out/ (3 outputs)
npm run package    # Build + package with electron-builder (NSIS installer + portable)
```

<br>

## Problem Fixes

A chronological list of bugs and issues resolved during development.

### Layout & Rendering
| Fix | Description |
|-----|-------------|
| **Panel API mismatch (App.tsx)** | Fixed `react-resizable-panels` v4 breaking changes — `direction` → `orientation`, `ref` → `panelRef`, `onCollapse`/`onExpand` → `onResize`, `ImperativePanelHandle` → `PanelImperativeHandle`, `collapsedSize={5}` → `collapsedSize={0}` |
| **Editor 0px height (MainArea.tsx)** | Changed `flex-1` → `h-full` because Panel inner div is `display: block`, so `flex-1` didn't fill the parent |
| **ActivityBar restructure** | Moved outside horizontal `Group` to avoid non-Panel child warnings |

### File System
| Fix | Description |
|-----|-------------|
| **Nested file/folder creation** | Creation input now renders inline inside the selected directory via `creating` prop instead of root level only |
| **Children not refreshing after nested create** | Added `refreshKey` prop propagation to `FileTreeNode` — triggers `loadChildren()` re-run when `refreshKey` changes |
| **File selection highlight** | Added `selectedPath` state in `FileTree`, visual highlight via `bg-active` class |
| **Create in selected folder** | Header `+` buttons create inside the currently selected directory, fallback to `rootPath` |

### Search
| Fix | Description |
|-----|-------------|
| **Search feature added** | Case-sensitive toggle (`Aa`), result count, clear button, auto-focus input, global shortcut `Ctrl+Shift+F` |
| **Debounced real-time search** | 300ms debounce via `useEffect` + `searchKeyRef` pattern to cancel stale responses |
| **Directory skip patterns** | Added `SKIP_DIRS` set — skips `.git`, `node_modules`, `dist`, `out`, `build`, `__pycache__`, `.venv`, `.vite`, `.cache`, `.next`, `.nuxt`, `coverage`, `.turbo`, `.parcel-cache` plus all dotfiles |
| **Search result click opens file** | Clicking a search result now reads and opens the file in the editor |

### Menu Bar
| Fix | Description |
|-----|-------------|
| **Full menu bar implementation** | Added VS Code-style menu bar: File, Edit, Selection, View, Go, Run, Terminal, Help — click-to-open dropdown with hover-to-navigate |
| **MenuBar Open File not working** | `openFile()` dialog result now handled — reads and opens selected files in editor |
| **MenuBar Open Folder not working** | `openFolder()` dialog result now handled — sets `rootPath`, refreshes file tree, persists last path |

### Persistence
| Fix | Description |
|-----|-------------|
| **Last opened folder not remembered** | Added `app:getLastPath`/`app:setLastPath` IPC handlers using Electron `userData` directory. Auto-restores last folder on startup |
| **SidePanel error handling** | Added `.catch()` to `getLastPath()` promise to prevent unhandled rejection crashes |

### UI Polish
| Fix | Description |
|-----|-------------|
| **TitleBar icon size** | Adjusted from `w-10 h-10` → `w-6 h-6` for better visual balance |
| **README hero icon size** | Increased from 120px → 200px |
| **README screenshot paths** | Fixed references to non-existent `1.png–5.png` → actual screenshot filenames |
| **"Developed by Mahadi"** | Added to README hero title |
| **Fixed footer credit** | "Made with ❤️ by Mahadi" at bottom of README |

<br>

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<br>

---

<div align="center">
  <p style="font-size: 1.1em;">Made with ❤️ by <strong>Mahadi</strong></p>
</div>
