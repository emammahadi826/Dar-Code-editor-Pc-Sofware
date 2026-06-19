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
- **Selection highlight** — Click to select files/folders with visual highlight
- **Create in folder** — Header + buttons create inside the currently selected folder
- **Tree connecting lines** — Indent guides with vertical lines and L-shaped connectors showing folder hierarchy (VS Code-style)
- **Binary file detection** — Detects binary files (.exe, .apk, .dll, .wasm, .pyc, etc.) and shows a warning with "Open Anyway" button instead of garbled text
- **Drag-and-drop moving** — Drag files/folders to move them within the tree with visual drop indicators
- **External drag-and-drop** — Drag files/folders from Windows File Explorer (or any OS app) into the file tree; Copy/Move dialog with animated popup
- **Keyboard shortcuts** — Ctrl+C/X/V (copy/cut/paste), Delete, F2 (rename), Enter (open), Ctrl+A (select all), Ctrl+Shift+N (new file) — works globally from anywhere
- **Multi-select** — Ctrl+click to toggle selection on multiple files/folders
- **Unique name generation** — Paste with duplicate name auto-generates "filename - Copy.ext", "filename - Copy (2).ext"
- **Drag region** — Title bar is fully draggable

### Context Menu
- **Dynamic right-click menu** — VS Code-style context menu built with `createPortal`, not clipped by scrollbars
- **File-type-aware items** — Menu items change based on file type (image files show preview options, folders show Open in Terminal)
- **Actions:**
  - **Reveal in Explorer** — Opens the file/folder location in Windows File Explorer
  - **Copy Path** / **Copy Relative Path** — Copies full or workspace-relative path to clipboard
  - **Open in Terminal** — Opens a new terminal at the selected folder's location (folders only)
  - **Find in Folder** — Opens search scoped to the selected folder (folders only)
  - **Open Preview** / **Open Image Preview** — Opens file in preview mode (image/non-code files)
  - **Open to the Side** — Opens file in a split editor group
  - **Cut, Copy, Paste, Delete, Rename, Download** — Standard file operations
- **Edge-aware positioning** — Automatically repositions if menu goes off-screen

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
- **Integrated terminal** — Full terminal powered by `node-pty` with Windows ConPTY API
- **Multi-shell support** — PowerShell, CMD, Git Bash, WSL detection
- **Multi-tab management** — Create, switch, rename, and close multiple terminal instances
- **Split panes** — Horizontal and vertical split layout with resizable draggable separators
- **WebGL rendering** — GPU-accelerated rendering via `@xterm/addon-webgl` for smooth performance
- **Named terminals** — Auto-named (PowerShell 1, 2, etc.) with custom rename support
- **Unicode 11 support** — Full Unicode rendering via `@xterm/addon-unicode11`
- **Search** — Terminal search with `@xterm/addon-search` (Ctrl+Shift+F toggles search bar, Enter/Shift+Enter/F3 navigation, result counter)
- **Copy/Paste** — Ctrl+V / Ctrl+Shift+V / Shift+Insert paste, Ctrl+Shift+C / Ctrl+C (copy if selected) copy, Ctrl+C pass-through for SIGINT
- **Right-click context menu** — Copy, Paste, Clear with edge-aware positioning via `createPortal`
- **Scrollback 5000** — Extended scrollback buffer
- **Alt-click cursor move** — Click any position to move cursor
- **Kill all** — Clean up all terminal processes on window close

### Splash Screen
- **Video splash** — Animated splash screen with custom video (8.33s, 1080×1080) that plays on startup
- **Chroma key removal** — Canvas 2D pixel-level green-screen removal (`g > r+30 && g > b+30 → alpha=0`) for transparent overlay effect
- **Frame skip optimization** — Renders every 3rd frame (~20fps) for ~66% CPU reduction
- **Auto-dismiss** — Splash hides immediately when video ends (`ended` event), with fallback timeout
- **Watermark concealment** — Green rectangle overlay hides source watermark during chroma key processing

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
│   │   ├── shell-manager.ts    # node-pty terminal (multi-tab, named ConPTY)
│   │   └── window-controls.ts  # Min/Max/Close handlers
│   ├── preload/
│   │   └── index.ts            # contextBridge IPC exposure
│   └── renderer/
│       ├── App.tsx             # Root layout + keybindings
│       ├── main.tsx            # React entry point
│       ├── assets/             # Icons imported by Vite
│       ├── components/
│       │   ├── ContextMenu/    # ContextMenuPortal (createPortal-based dynamic menu)
│       │   ├── FileTree/       # FileTree + FileTreeNode + contextMenuItems
│       │   └── Terminal/       # TerminalView, TerminalTabBar, TerminalSplit
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
| `terminal:*` | Both directions | Terminal create/write/resize/kill/data/list/rename/killAll |
| `shell:revealInExplorer` | Renderer → Main | Open file/folder in Windows File Explorer |
| `app:copyToClipboard` | Renderer → Main | Copy text to system clipboard |
| `fs:moveFile` | Renderer → Main | Move file/folder across drives (copy + delete) |
| `app:getLastPath` / `app:setLastPath` | Renderer → Main | Persist last opened folder path |

<br>

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+W` | Close current tab |
| `Ctrl+Shift+F` | Open search panel / terminal search |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+J` | Toggle bottom panel |
| `Ctrl+\`` | New terminal / toggle terminal |
| `Ctrl+=` / `Ctrl+-` | Zoom in / out |
| `Ctrl+G` | Go to line |
| `Ctrl+P` | Go to file (opens search) |
| `Ctrl+V` / `Ctrl+Shift+V` / `Shift+Insert` | Terminal paste |
| `Ctrl+Shift+C` | Terminal copy |
| `Ctrl+C` | Terminal copy (if selected) / SIGINT |
| `F3` | Terminal search next |
| `Shift+F3` | Terminal search previous |
| `Ctrl+C` (file tree) | Copy selected file/folder |
| `Ctrl+X` (file tree) | Cut selected file/folder |
| `Ctrl+V` (file tree) | Paste from clipboard (copy or move) |
| `Ctrl+A` (file tree) | Select all root entries |
| `Delete` (file tree) | Delete selected file/folder |
| `F2` (file tree) | Rename selected |
| `Enter` (file tree) | Open file |
| `Ctrl+Shift+N` (file tree) | New file |

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
| **Blank panel rendering** | Moved `useCallback` hooks before `if (loading)` early return to fix React Rules of Hooks violation |
| **Blank space deselection** | Replaced `e.stopPropagation()` with `data-file-row` attribute + `closest()` detection — clicking empty space deselects while file row clicks remain functional |

### Splash Screen / Video
| Fix | Description |
|-----|-------------|
| **Chroma key green fringes** | Relaxed threshold from `g > r+30 && g > b+30` to `g > r+20 && g > b+20 && r<120 && b<120` — catches compression artifacts around video edges |
| **Canvas fade-in** | Added `opacity: 0` + `.visible` class with 0.6s CSS transition instead of sudden pop |
| **Video size reduction** | Changed from 65vw/800px to 40vw/450px, adjusted title/sub/bar spacing |

### File System
| Fix | Description |
|-----|-------------|
| **Copy/Move for directories** | Added `copyRecursive()` helper that handles folders + files; `fs:moveFile` uses `rmSync` for complete source removal |
| **Copy/Move source validation** | Added `fs.existsSync()` check + `ensureDir()` before any copy/move operation — prevents silent failures |
| **File watcher (auto-refresh)** | New `file-watcher.ts` module — `fs.watch` with `recursive: true` + 300ms debounce, sends `fs:filesChanged` IPC to renderer |
| **Nested file/folder creation** | Creation input now renders inline inside the selected directory via `creating` prop instead of root level only |
| **Children not refreshing after nested create** | Added `refreshKey` prop propagation to `FileTreeNode` — triggers `loadChildren()` re-run when `refreshKey` changes |
| **File selection highlight** | Added `selectedPath` state in `FileTree`, visual highlight via `bg-active` class |
| **Create in selected folder** | Header `+` buttons create inside the currently selected directory, fallback to `rootPath` |
| **Tree connecting lines** | Added indent guides with absolute-positioned divs for vertical lines + L-shaped connectors — formula: `ancestorVerticalLines[i] = parent.ancestorVerticalLines[i] + [!parent.isLast]` |
| **Dynamic context menu** | Replaced `@radix-ui/react-context-menu` with custom `createPortal`-based `ContextMenuPortal` — prevents clipping by file tree scrollbar, supports file-type-aware items |
| **Binary file warning** | Added `BINARY_EXTENSIONS` set in `fileType.ts` — detected binary files open with warning screen (AlertTriangle icon + "Open Anyway" button) instead of garbled text |
| **MenuBar Open File** | Updated File > Open File to detect binary/media files via `getFileType()` before reading |

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

### Terminal
| Fix | Description |
|-----|-------------|
| **Full terminal rewrite** | Replaced single-instance terminal with multi-tab system — `terminalStore.ts` (Zustand), `TerminalView.tsx`, `TerminalTabBar.tsx`, `TerminalSplit.tsx` |
| **Split pane support** | Added horizontal/vertical split layout with `react-resizable-panels` — each split is a `<Group>` containing `TerminalView` instances |
| **WebGL rendering** | Installed `@xterm/addon-webgl` for GPU-accelerated terminal rendering |
| **Named terminals** | Updated `shell-manager.ts` — each terminal has a `name` + `metadata` field, auto-named as "PowerShell 1, 2..." |
| **Terminal tab switch bug** | `addInstance` always sets `activeTerminalId`, added check in `TerminalSplit` branch-1, added `React.key` prop for proper remount |
| **Copy/paste keyboard shortcuts** | Single `attachCustomKeyEventHandler` — Ctrl+V / Shift+Insert / Ctrl+Shift+V paste, Ctrl+Shift+C copy, Ctrl+C (copy if selected, SIGINT if not), Shift+Insert paste |
| **Right-click context menu** | createPortal-based menu (Copy/Paste/Clear) rendered to `document.body` — avoids clipping by terminal overflow hidden |
| **Search Addon** | Loaded `@xterm/addon-search` — Ctrl+Shift+F toggles search bar, Enter/Shift+Enter/F3 navigation, result counter, Escape dismiss |
| **Terminal options** | `scrollback: 5000`, `altClickMovesCursor: true` |
| **eval warning** | `shell-manager.ts` uses `eval('require')('node-pty')` to bypass Rollup bundling of `.node` modules — noted as expected |

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

## Changelog

### v1.1.1 (Current)
*New features and improvements over v1.1.0:*

**Splash Screen**
- **Video splash**: Custom 8.33s 1080×1080 video plays on startup with Canvas 2D rendering
- **Chroma key removal**: Pixel-level green-screen removal (`g > r+20 && g > b+20 && r<120 && b<120 → alpha=0`) for transparent overlay
- **Frame skip optimization**: Renders every 3rd frame (~20fps) for ~66% CPU reduction
- **Canvas fade-in**: CSS opacity transition 0.6s instead of sudden appearance
- **Auto-dismiss**: Hides immediately on `ended` event with fallback `duration + 3000ms` timeout
- **Watermark concealment**: Green rectangle overlay hides source watermark during processing

**File Watcher (Auto-Refresh)**
- Real-time file system watching via `fs.watch` with `recursive: true`
- **Instant file tree updates** when files are added/deleted/renamed externally (VS Code-style)
- 300ms debounce to batch rapid changes
- Auto-cleans up on workspace switch

**Keyboard Shortcuts (File Tree)**
- **Ctrl+C / Ctrl+X**: Copy / Cut selected files and folders
- **Ctrl+V**: Paste — duplicate (copy) or move (cut) with smart unique name generation
- **Ctrl+A**: Select all root entries
- **Delete**: Delete selected file/folder
- **F2**: Rename selected file/folder
- **Enter**: Open selected file in editor
- **Ctrl+Shift+N**: New file in selected folder or root
- **Global keydown listener** — shortcuts work from anywhere (editor, terminal, etc.), just like VS Code
- **Multi-select support** — Ctrl+click to toggle multiple selections; operations apply to all selected

**External Drag-and-Drop (Copy/Move Dialog)**
- Drag files/folders from Windows Explorer into file tree
- **Copy or Move?** popup with animated dialog: Copy duplicates, Move transfers with source deletion
- Recursive directory support for both operations
- Loading spinner during operation, buttons disabled while processing
- Smart source validation before copy/move

**Menu Bar**
- **Refresh button**: Added in Help section — reloads the entire renderer process

**Binary File Detection**
- Detects binary files (.exe, .apk, .dll, .wasm, .pyc, .docx, etc.) by extension
- Shows warning screen with AlertTriangle icon + "Open Anyway" button (VS Code-style)
- File > Open File dialog also handles binary/media files properly

**Terminal Enhancements**
- **Copy/paste keyboard shortcuts**: Ctrl+V / Ctrl+Shift+V / Shift+Insert paste, Ctrl+Shift+C / Ctrl+C (copy if selected) copy, Ctrl+C pass-through for SIGINT
- **Right-click context menu**: Copy, Paste, Clear with edge-aware positioning via `createPortal`
- **Search Addon**: Ctrl+Shift+F toggles search bar, Enter/Shift+Enter/F3 navigation, result counter
- **Scrollback 5000** and **alt-click cursor move**

**AGENTS.md**
- Added project-level `AGENTS.md` with full architecture, gotchas, splash details, drag-drop docs, icon paths, store quirks

**Bug Fixes**
- **Blank panel fix**: Moved `useCallback` hooks before `if (loading)` early return to fix React Rules of Hooks violation
- **Blank space deselection**: Replaced `stopPropagation` with `data-file-row` + `closest()` detection — clicking empty space deselects while file row clicks remain functional
- **Chroma key green fringes**: Threshold relaxed from `g > r+30 && g > b+30` to `g > r+20 && g > b+20 && r<120 && b<120` — catches compression artifacts
- **Copy/Move for directories**: `copyRecursive()` handles folders; `fs:moveFile` uses `rmSync` for complete removal
- **Copy/Move source validation**: Added `fs.existsSync()` check + `ensureDir()` before any operation
- **External drop dialog polish**: fade-scale animation, loading spinner, disabled buttons during operation

### v1.1.0
*New features and improvements over v1.0.0:*

**Terminal Overhaul**
- Multi-tab terminal management with create, switch, rename, and close
- Horizontal/vertical split panes with draggable separators
- WebGL GPU-accelerated rendering via `@xterm/addon-webgl`
- Named ConPTY terminals (auto-named "PowerShell 1, 2...")
- Unicode 11 support and terminal search
- **Tab switch fix**: `addInstance` always sets `activeTerminalId`, added React key for proper remount

**File Tree Enhancements**
- Indent guides with connecting lines — vertical lines + L-shaped connectors showing folder hierarchy
- Drag-and-drop file/folder moving with visual drop indicators

**Dynamic Context Menu**
- Replaced Radix context menu with custom `createPortal`-based menu (no scrollbar clipping)
- File-type-aware items: images show preview options, folders show Open in Terminal
- Reveal in Explorer, Copy Path, Copy Relative Path
- Open in Terminal, Find in Folder
- Open Preview, Open Image Preview, Open to the Side
- Cut, Copy, Paste, Delete, Rename, Download
- Edge-aware repositioning

### v1.0.0
*Initial release of Dar Studio.*

**Editor**
- Monaco Editor with syntax highlighting, IntelliSense, multi-cursor, bracket matching
- Multi-tab editing with open/manage multiple files
- Auto language detection for 80+ file extensions
- Adjustable font size, tab size, word wrap, minimap, line numbers

**File Management**
- Tree-based file explorer with expand/collapse
- Create, rename, delete files and folders
- Right-click context menu (Radix-based)
- Selection highlight and create-in-selected-folder
- Debounced real-time search with case-sensitive toggle, result count, directory skip patterns

**Menu Bar**
- VS Code-style menu bar: File, Edit, Selection, View, Go, Run, Terminal, Help
- Click-to-open with hover-to-navigate between menus

**Terminal**
- Basic integrated terminal via `node-pty`
- Multi-shell support: PowerShell, CMD, Git Bash, WSL

**UI / Layout**
- Resizable panels (sidebar, editor, bottom panel)
- Activity Bar for quick switching
- Bottom Panel with Terminal / Output / Problems tabs
- Status Bar with cursor position, language, encoding, file path
- Custom title bar with window controls
- VS Code-inspired dark theme
- Collapsible sidebar and bottom panel
- Last opened folder persistence across restarts

<br>

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<br>

---

<div align="center">
  <p style="font-size: 1.1em;">Made with ❤️ by <strong>Mahadi</strong></p>
</div>
