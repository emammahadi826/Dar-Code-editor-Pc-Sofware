# AGENTS.md — Dar Studio

Code editor at `Code-Editor/dar-studio/` (Electron 28 + electron-vite 2 + React 18 + Tailwind 3 + Monaco 0.55 + Zustand).

## Commands
```
npm run dev              # Vite dev server + Electron (localhost:5173)
npm run build            # Build all 3 targets to out/
npm run package          # Build + electron-builder --win (NSIS + portable)
npm run package:portable # Build + portable only
```
No lint/typecheck/test scripts — build is the only verification.

## Architecture
- 3 vite targets: `main` (src/main/), `preload` (src/preload/), `renderer` (src/renderer/)
- Main process: `index.ts` creates frameless window, registers IPC handlers
- Preload: `contextBridge.exposeInMainWorld('electron', {...})` — all IPC flows through `window.electron`
- Renderer: React app with 5 activity modules — Files (real), Search (real), Settings (real), Git (placeholder), Extensions (placeholder)
- Zustand stores (`appStore.ts`, `settingsStore.ts`, `terminalStore.ts`) are **in-memory only** — no persistence (only last-opened folder via Electron `userData`)
- Windows-only — `\` hardcoded throughout, no platform branching

## Gotchas
- `node-pty`: loaded via `eval('require')('node-pty')` in `shell-manager.ts` to bypass Rollup .node bundling
- `react-resizable-panels` v4: `Group` (not `PanelGroup`), `Separator` (not `PanelResizeHandle`), CSS attr `data-[resize-handle-active]`
- Panel collapse: `PanelRef` + `useEffect` syncing store booleans with `collapse()`/`expand()`
- Monaco configured via `loader.config({ monaco })` in `modules/Editor/index.tsx` — uses `@monaco-editor/react` v4 with standalone Monaco package
- Stale processes cause port 5173 conflicts: `Get-Process electron,node | Stop-Process -Force`
- `npm run build` "use client" warnings are harmless
- Dev mode: DevTools auto-opens (`process.env.ELECTRON_VITE_DEV || NODE_ENV === 'development'`)
- StatusBar has hardcoded values: `Spaces: 2`, `UTF-8`, `Dar Studio v1.1.1`
- `Ctrl+Shift+F` triggers sidebar Search globally (and also terminal search when terminal focused)
- `terminalStore.ts` uses tree-based split architecture (`SplitNode`/`SplitGroup`/`SplitLeaf`) — NOT a flat array
- Git/Extensions modules show "coming soon" placeholders
- Version displayed in StatusBar, Settings/About, MenuBar Help — all `v1.1.1`

## Splash screen
- Video at `src/renderer/public/video.mp4` (1080×1080, 8.33s, h264, yuv420p, 1.4 MB)
- Chroma key in `main.tsx`: Canvas 2D pixel loop — `g > r+20 && g > b+20 && r < 120 && b < 120 → alpha = 0`
- Frame skip: `frameSkip % 3 !== 0 → return` (~20fps, ~66% CPU reduction)
- Cache-busting: `video.src = '/video.mp4?t=' + Date.now()`
- Canvas sizing: `width: 40vw; max-width: 450px; aspect-ratio: 1/1` (CSS) + JS `Math.min(window.innerWidth * 0.4, 450)`
- Watermark cover: green `#00ff00` rect at bottom-right, 28% × 9% of canvas
- Splash hide: `ended` event → `hideSplash()` instantly; `loadedmetadata` → fallback `duration + 3000ms`; global fallback 2500ms
- Canvas fade-in: `opacity: 0` → video `play` sets `opacity: 1` with 0.6s CSS transition
- Splash layout: flex column, centered; footer `position: absolute; bottom: 14px` relative to `#splash` (fixed)
- Title: 18px, sub: 13px, progress bar: 180px width
- Video `loop = false`, `muted = true`, `playsInline = true`
- `.play()` called with `.catch(() => {})` — may fail if no user interaction yet

## External drag-and-drop
- `fs:moveFile` IPC handler in `src/main/file-system.ts` — `copyFileSync` + `unlinkSync` (cross-drive safe)
- Preload exposes `moveFile` via `contextBridge`
- `FileTree.tsx` detects `dataTransfer.files` with `(file as any).path` (Electron API)
- "Drop here" visual overlay with opacity transition

## Icon paths
- Source: `Icon/Main icon.png` — generate sizes via Python Pillow
- Main process: `Icon/icon-256.png` (`nativeImage.createFromPath()` + `isEmpty()` + `setIcon()`, fallback `icon.ico`)
- Builder: `Icon/icon.ico` (multi-res, in `electron-builder.yml`)
- Renderer: `src/renderer/assets/icon-{16,32}.png` (ES module imports via Vite)

## Store quirks
- `appStore.ts`: `openFile(path, name, content, language, fileType?, mediaUrl?)`; tabs have `isDirty`, `language`, `fileType`, `mediaUrl`; `detectLanguage()` maps 30+ extensions
- `settingsStore.ts`: individual setters (`setFontSize`, etc.) — NOT generic `.set()`
- `terminalStore.ts`: `splitTerminal()`, `closeSplit()`, `setSplitSizes()` for split-pane management; `createNamed` IPC supports custom name + cwd

## Communication
- **Language**: ALWAYS Banglish (Bangla romanized in English script). NEVER pure Bangla, NEVER pure English.
- **User's style**: short imperative commands, direct, minimal formalities. Mixes code terminology with Banglish.
- **Phrases they use**: "koro/kori/koren" (do), "hocche" (is/are), "jokhon/tokhon" (when/then), "jemon" (for example), "tahole" (then/so), "tah hocche" (the thing is), "jate" (so that), "amon" (like this), "kintu" (but)
- **Tone**: casual, no greetings/formalities needed. Straight to the point.
- **This file is THE source** — all instructions the user gives go here. Always check this first before responding.
- **Response style**: answer concisely in Banglish, use code/repo terms as-is (don't translate technical terms), use short sentences.
- **NO auto-push**: kichu push/publish/commit korte must ask permission first. NEVER push without explicit "push koro" / "push" instruction.
