# Dar Studio

Dar Studio — A modern, lightweight code editor for Windows built with Electron, React, and Monaco Editor (same engine as VS Code).

## Features

- **File Explorer** — Tree view with folder navigation, create/rename/delete files
- **Multi-Tab Editor** — Monaco Editor with syntax highlighting for 50+ languages
- **Search in Files** — Full-text search across your project
- **Built-in Terminal** — Integrated terminal panel (powered by xterm.js + node-pty)
- **Customizable** — Font size, tab size, word wrap, minimap, line numbers
- **VS Code-style UI** — Activity bar, side panel, tab bar, status bar

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
cd dar-studio
npm install
```

## Development

```bash
npm run dev
```

Opens an Electron window with hot-reload via Vite.

## Build

```bash
npm run build
```

Builds the app to the `out/` directory.

## Package for Windows

```bash
npm run package
```

Creates an NSIS installer and portable exe in `dist/` (requires electron-builder).

## Tech Stack

| Layer | Tech |
|-------|------|
| Editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) 0.55 |
| Framework | [Electron](https://www.electronjs.org/) 28 |
| UI | [React](https://react.dev/) 18 + [Tailwind CSS](https://tailwindcss.com/) 3 |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Build | [electron-vite](https://electron-vite.org/) 2 + Vite 5 |
| Terminal | [xterm.js](https://xtermjs.org/) + [node-pty](https://github.com/microsoft/node-pty) |
| Icons | [Lucide React](https://lucide.dev/) + [VS Code Icons](https://github.com/vscode-icons/vscode-icons) |
| Panels | [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) |

## Architecture

```
src/
├── main/              # Electron main process
│   ├── index.ts       # Window creation, app lifecycle
│   ├── file-system.ts # File read/write/delete operations
│   ├── search-files.ts# Full-text search
│   ├── shell-manager.ts # Terminal (node-pty)
│   ├── window-controls.ts # Minimize/maximize/close
│   ├── skill-bridge.ts # External skill integration
│   └── database.ts   # Local data persistence
├── preload/
│   └── index.ts       # IPC bridge (contextBridge)
└── renderer/          # React app
    ├── layout/        # Shell layout components
    ├── components/    # Reusable UI components
    ├── modules/       # Feature modules (Editor, Settings, etc.)
    ├── store/         # Zustand state management
    ├── hooks/         # Custom React hooks
    └── styles/        # Global CSS + Tailwind
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save file |
| `Ctrl+B` | Toggle sidebar |
| `` Ctrl+` `` | Toggle terminal |

## Key Bindings (Editor)

- `Ctrl+S` — Save
- `Ctrl+F` — Find
- `Ctrl+H` — Find & Replace
- `Ctrl+D` — Add selection to next find match

## Notes

- The first startup may be slow as node-pty detects available shells
- Web worker warnings from Monaco are cosmetic and don't affect functionality
- Built and tested on Windows 10/11
