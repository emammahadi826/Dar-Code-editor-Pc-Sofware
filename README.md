# Dar Studio

A modern code editor built with Electron, React, and Monaco Editor.

## Features

- File Explorer with tree view
- Multi-tab editor with Monaco (VS Code engine)
- Syntax highlighting for 50+ languages
- Search in files
- Built-in terminal panel
- Git integration (coming soon)

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

Opens an Electron window with hot-reload.

## Build

```bash
npm run build
```

## Package for Windows

```bash
npm run package
```

Creates an installer in `dist/`.

## Tech Stack

| Layer | Tech |
|-------|------|
| Editor | Monaco Editor (VS Code engine) |
| Framework | Electron 28 |
| UI | React 18 + Tailwind CSS |
| State | Zustand |
| Build | electron-vite + Vite 5 |
| Icons | Lucide React |
