# AGENTS.md creation guidelines

**Session ID:** ses_12c88722fffesl0nMN7k5XHas0
**Created:** 6/16/2026, 8:44:48 PM
**Updated:** 6/16/2026, 8:47:03 PM

---

## User

Create or update `AGENTS.md` for this repository.

The goal is a compact instruction file that helps future OpenCode sessions avoid mistakes and ramp up quickly. Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.

User-provided focus or constraints (honor these):


## How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

## What to extract

Look for the highest-signal facts for an agent working in this repo:
- exact developer commands, especially non-obvious ones
- how to run a single test, a single package, or a focused verification step
- required command order when it matters, such as `lint -> typecheck -> test`
- monorepo or multi-package boundaries, ownership of major directories, and the real app/library entrypoints
- framework or toolchain quirks: generated code, migrations, codegen, build artifacts, special env loading, dev servers, infra deploy flow
- repo-specific style or workflow conventions that differ from defaults
- testing quirks: fixtures, integration test prerequisites, snapshot workflows, required services, flaky or expensive suites
- important constraints from existing instruction files worth preserving

Good `AGENTS.md` content is usually hard-earned context that took reading multiple files to infer.

## Questions

Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.

Good questions:
- undocumented team conventions
- branch / PR / release expectations
- missing setup or test prerequisites that are known but not written down

Do not ask about anything the repo already makes clear.

## Writing rules

Include only high-signal, repo-specific guidance such as:
- exact commands and shortcuts the agent would otherwise guess wrong
- architecture notes that are not obvious from filenames
- conventions that differ from language or framework defaults
- setup requirements, environment quirks, and operational gotchas
- references to existing instruction sources that matter

Exclude:
- generic software advice
- long tutorials or exhaustive file trees
- obvious language conventions
- speculative claims or anything you could not verify
- content better stored in another file referenced via `opencode.json` `instructions`

When in doubt, omit.

Prefer short sections and bullets. If the repo is simple, keep the file simple. If the repo is large, summarize the few structural facts that actually change how an agent should work.

If `AGENTS.md` already exists at `C:\Users\Mahadi\Desktop\Tools`, improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile it with the current codebase.

---

## Assistant (Build · DeepSeek V4 Flash Free · 8.7s)

_Thinking:_

The user wants me to create or update `AGENTS.md` for the repository at `C:\Users\Mahadi\Desktop\Tools`. This is a monorepo with 9 independent projects, primarily `dar-studio` (an Electron + React + Monaco Editor desktop app). Let me first read the existing AGENTS.md, then investigate the repo structure, config files, and other sources of truth to create a high-signal, compact instruction file.

Let me start by reading the existing `AGENTS.md` and the current repo state.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\AGENTS.md"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\AGENTS.md</path>
<type>file</type>
<content>
1: # AGENTS.md — Tools monorepo
2: 
3: ## Overview
4: 
5: Multi-project monorepo at `C:\Users\Mahadi\Desktop\Tools` with 9 independent projects. The primary focus is `Code-Editor/dar-studio/` (Electron + React + Monaco Editor desktop app). Rest are smaller utility apps (Flask, React SPA, static HTML).
6: 
7: ## Dar Studio (`Code-Editor/dar-studio/`)
8: 
9: ### Tech
10: - Electron 28 + electron-vite 2 + React 18 + Tailwind 3 + Monaco Editor 0.55 + Zustand
11: - Built with `electron-vite` (3 targets: main, preload, renderer)
12: - `vite.config.ts` sets renderer `root: 'src/renderer'`
13: 
14: ### Commands
15: ```
16: npm run dev        # Start Vite dev server + Electron (localhost:5173)
17: npm run build      # Build all 3 targets to out/
18: npm run package    # Build + electron-builder --win (NSIS installer + portable)
19: ```
20: 
21: ### Critical Quirks
22: - **Dev mode detection**: uses `ELECTRON_VITE_DEV || NODE_ENV === 'development'` — DevTools auto-opens in dev
23: - **node-pty loading**: uses `eval('require')('node-pty')` in `shell-manager.ts` to bypass Rollup bundling of `.node` native modules
24: - Stale processes cause port conflicts — kill before restart: `Get-Process electron,node | Stop-Process -Force`
25: - `npm run build` "use client" warnings are harmless
26: - `react-resizable-panels` v4 API: `Group` (not `PanelGroup`), `Separator` (not `PanelResizeHandle`), CSS attr is `data-[resize-handle-active]` (not `data-[separator=active]`)
27: 
28: ### Icon System
29: - Source icon: `Icon/Main icon.png` — generate all sizes from this using Python Pillow
30: - Main process icon: `Icon/icon-256.png` loaded via `nativeImage.createFromPath()` + `isEmpty()` check + `setIcon()`
31: - electron-builder: `Icon/icon.ico` (multi-res 16→256)
32: - Renderer assets: `src/renderer/assets/icon-{16,32}.png` imported as ES modules (Vite handles paths in both dev and production)
33: - Favicon set dynamically in `main.tsx` via ES import
34: 
35: ### Architecture
36: - **Main process** (`src/main/`): `index.ts` (window), `window-controls.ts`, `file-system.ts`, `search-files.ts`, `shell-manager.ts` (node-pty terminal)
37: - **Preload** (`src/preload/`): `index.ts` — IPC bridge (contextBridge + ipcRenderer)
38: - **Renderer** (`src/renderer/`): React app with Zustand stores (`appStore.ts`, `settingsStore.ts`)
39: - **Layout**: `TitleBar` → `Group`(vertical) → `Panel`(editor 78%) + `Separator` + `Panel`(bottom 22%) → `StatusBar`
40: - **Panels**: ActivityBar, SidePanel (FileTree/Search/Settings), MainArea (EditorTabs + EditorModule), BottomPanel (Terminal/Output/Problems)
41: 
42: ### Key Store Patterns
43: - `appStore.ts`: Zustand — `openTabs[]`, `activeTab`, `openFile()` adds tab + sets active, `updateTabContent()` on edit, `markTabClean()` on save
44: - `settingsStore.ts`: Zustand — individual setters (`setFontSize`, `setTabSize`, etc.), NOT generic `.set()`
45: - Panel collapse: `PanelRef` + `useEffect` syncs store `sidePanelOpen`/`bottomPanelOpen` with `collapse()`/`expand()`
46: 
47: ### File Click Flow
48: 1. `FileTreeNode.handleClick()` → `onFileSelect(path, name)`
49: 2. `SidePanel.handleFileSelect()` → `readFile()` via IPC → if fail, `addOutputLog()`
50: 3. `appStore.openFile()` → adds to `openTabs[]`, sets `activeTab`
51: 4. Editor re-renders: `key={activeFile.path}` forces remount, `value={activeFile.content}`
52: 5. Editor uses only `value` prop (controlled), NOT `defaultValue`
53: 
54: ## Other Projects
55: 
56: | Project | Type | Run |
57: |---------|------|-----|
58: | `AI--Image--Generator/` | Flask web app | `python app.py` |
59: | `Image--Background--Remover/` | Flask web app | `python app.py` |
60: | `Net--Speed--Checker/` | Flask web app | `python server.py` |
61: | `Security--Privacy--Toolkit/` | Static HTML/CSS/JS | Open `index.html` in browser |
62: | `Weather--Tool/` | Flask web app | `python server.py` |
63: | `Chat-application/` | React + Vite SPA | `npm run dev` |
64: | `tictactoe/` | Static HTML/CSS/JS | Open `tictactoe.html` in browser |
65: | `Python-Bot-Agent/` | Desktop voice agent | `python main.py` |
66: 
67: All Python projects use `pip install -r requirements.txt`. Shared `.venv/` at root.
68: 
69: ## Repo-wide Conventions
70: - Shell: Windows PowerShell (5.1) — avoid `&&`, use `; if ($?) { ... }` for chaining
71: - `.gitignore` excludes `node_modules/`, `out/`, `dist/`, `dist-electron/`, `__pycache__/`, `.venv/`, `.env`, UIForge relics
72: - Root `.venv/` is the shared Python virtual environment
73: - AI features using Hugging Face / OpenRouter / OpenWeather APIs require env vars (`.env` files)
74: - Communication in Banglish (Bengali written with English letters)

(End of file - total 74 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools</path>
<type>directory</type>
<entries>
.git/
.gitignore
.venv/
AGENTS.md
AI--Image--Generator/
Chat-application/
Code-Editor/
GEMINI.md
Image--Background--Remover/
Net--Speed--Checker/
Python-Bot-Agent/
README.md
Security--Privacy--Toolkit/
tictactoe/
Weather--Tool/

(15 entries)
</entries>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "README*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
C:\Users\Mahadi\Desktop\Tools\AI--Image--Generator\README.md
C:\Users\Mahadi\Desktop\Tools\Python-Bot-Agent\README.md
C:\Users\Mahadi\Desktop\Tools\Image--Background--Remover\README.md
C:\Users\Mahadi\Desktop\Tools\Weather--Tool\README.md
C:\Users\Mahadi\Desktop\Tools\tictactoe\README.md
C:\Users\Mahadi\Desktop\Tools\Net--Speed--Checker\README.md
C:\Users\Mahadi\Desktop\Tools\Security--Privacy--Toolkit\README.md
C:\Users\Mahadi\Desktop\Tools\README.md
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\README.md
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "opencode.json*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/.claude/**",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/.github/copilot-instructions.md",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
No files found
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 11.8s)

_Thinking:_

Now let me dig deeper into the repo to verify and improve the AGENTS.md. Let me check:
1. The root README.md
2. The dar-studio project (package.json, vite config, etc.)
3. Other project details
4. GEMINI.md
5. .gitignore
6. Check if there's a .venv and other config files

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\README.md"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\README.md</path>
<type>file</type>
<content>
1: # Web Tools Collection
2: 
3: Ei repository-te bivinno dhoroner upokari web-based tools ache. Protyekti tool-er alada directory thakbe ebong tader nijossho function thakbe.
4: 
5: ## Tools Overview
6: 
7: ### 1. AI Image Generator
8: Text prompt theke AI chobi toiri kore.
9: ![AI Image Generator](AI--Image--Generator/Website%20SS/Website_over_view.png)
10: - **Features**: Customizable size, Hugging Face Integration.
11: - **Path**: [AI--Image--Generator](./AI--Image--Generator)
12: 
13: ---
14: 
15: ### 2. Image Background Remover
16: Chobi theke background khub sohoje sorate pare.
17: ![Image Background Remover](Image--Background--Remover/Website%20SS/Website_over_view.png)
18: - **Features**: Drag & Drop upload, Download PNG.
19: - **Path**: [Image--Background--Remover](./Image--Background--Remover)
20: 
21: ---
22: 
23: ### 3. Net Speed Checker
24: Internet speed test korar jonno ekti simple tool.
25: ![Net Speed Checker](Net--Speed--Checker/Website%20SS/Website_over_view.png)
26: - **Features**: Download/Upload/Ping speed results.
27: - **Path**: [Net--Speed--Checker](./Net--Speed--Checker)
28: 
29: ---
30: 
31: ### 4. Security & Privacy Toolkit
32: Privacy ebong security check-er ekti toolkit.
33: ![Security & Privacy Toolkit](Security--Privacy--Toolkit/Website%20SS/Website_over_view.png)
34: - **Features**: Password generator, Privacy check.
35: - **Path**: [Security--Privacy--Toolkit](./Security--Privacy--Toolkit)
36: 
37: ---
38: 
39: ### 5. Weather Tool
40: Shohorer current weather ebong forecast dekhar jonno ekti simple tool.
41: ![Weather Tool](Weather--Tool/Website%20SS/Website_over_view.png)
42: - **Features**: City search, OpenWeather integration, recent searches.
43: - **Path**: [Weather--Tool](./Weather--Tool)
44: 
45: ---
46: 
47: ### 6. Chat-application — AI Chat Assistant
48: An animated AI chat interface with multi-chat history, sidebar, and OpenRouter AI integration.
49: ![Chat-application Home](Chat-application/Website%20SS/Home-Page-screenshort.png)
50: ![Chat-application Sidebar](Chat-application/Website%20SS/slider-openscreenshort.png)
51: - **Features**: Multi-chat sidebar, command palette, auto-resizing textarea, AI responses
52: - **Tech**: React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Vite
53: - **Path**: [Chat-application](./Chat-application)
54: 
55: ### 7. Tic Tac Toe
56: Ekti elegant, two-player Tic Tac Toe game khela korar jonno.
57: - **Features**: 
58:   - Two-player gameplay (Player X vs Player O)
59:   - Live score tracking for both players
60:   - Draw detection and tracking
61:   - Beautiful luxury design with animations
62:   - Responsive UI with hover effects
63:   - Win line visualization
64:   - New Round and Reset Scores buttons
65: - **Tech**: Pure HTML, CSS, and JavaScript (vanilla JS, no dependencies)
66: - **Design**: Elegant dark theme with gold and teal accents, smooth animations
67: - **How to play**: 
68:   1. Player X goes first
69:   2. Click on any empty cell to make your move
70:   3. First player to get 3 in a row (horizontal, vertical, or diagonal) wins
71:   4. Click "New Round" to play again or "Reset Scores" to clear all scores
72: - **Path**: [tictactoe](./tictactoe)
73: 
74: ## How to use
75: Proti folder-er bhetore ekti `README.md` file ache jekhane oi tool-ti chalate hole ki ki lagbe ta bola ache. Muloto Flask (Python) backend use kora hoyeche server-side processing er jonno.
76: 
77: ## Installation
78: Sobar age virtual environment active korun ebong dependencies install korun:
79: ```bash
80: # Example
81: pip install -r AI--Image--Generator/requirements.txt
82: ```

(End of file - total 82 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\.gitignore"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\.gitignore</path>
<type>file</type>
<content>
1: __pycache__/
2: *.py[cod]
3: *.pyo
4: *.pyd
5: 
6: .venv/
7: venv/
8: env/
9: ENV/
10: 
11: .env
12: .env.*
13: 
14: .vscode/
15: .idea/
16: 
17: Thumbs.db
18: .DS_Store
19: 
20: node_modules/
21: dist/
22: .vite/
23: 
24: # Code Editor build
25: Code-Editor/dar-studio/out/
26: Code-Editor/dar-studio/dist-electron/
27: Code-Editor/dar-studio/dev-output.txt
28: 
29: # UIForge relics (not part of Dar Studio code editor)
30: Code-Editor/dar-studio/resources/
31: Code-Editor/dar-studio/UIForge-Pro-Spec.md
32: Code-Editor/dar-studio/src/main/database.ts
33: Code-Editor/dar-studio/src/main/skill-bridge.ts
34: Code-Editor/ui-ux-pro-max-skill/

(End of file - total 34 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\GEMINI.md"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\GEMINI.md</path>
<type>file</type>
<content>
1: # Tools Project Overview
2: 
3: Ei project-ti bivinno dhoroner upokari web-based tools er ekti songroho. Ekhane muloto Flask (Python) backend ebong HTML/CSS/JS frontend bebohar kora hoyeche.
4: 
5: ## Tools Summary
6: 
7: 1.  **AI Image Generator**: 
8:     *   **Description**: Hugging Face API bebohar kore prompt theke image toiri kore.
9:     *   **Tech Stack**: Flask, Requests, Hugging Face API.
10:     *   **Location**: `AI--Image--Generator/`
11: 
12: 2.  **Image Background Remover**:
13:     *   **Description**: Chobi theke background soranor jonno bebohar kora hoy.
14:     *   **Tech Stack**: Flask, Pillow.
15:     *   **Location**: `Image--Background--Remover/`
16: 
17: 3.  **Net Speed Checker**:
18:     *   **Description**: Internet er speed (Download, Upload, Ping) check korar jonno.
19:     *   **Tech Stack**: Flask, `speedtest-cli`.
20:     *   **Location**: `Net--Speed--Checker/`
21: 
22: 4.  **Security Privacy Toolkit**:
23:     *   **Description**: Security ebong privacy songkranto bivinno tools (e.g., password generator, privacy checks).
24:     *   **Tech Stack**: Static HTML, CSS, JavaScript.
25:     *   **Location**: `Security--Privacy--Toolkit/`
26: 
27: ## Building and Running
28: 
29: ### Prerequisites
30: - Python 3.10+
31: - Virtual Environment (An existing `.venv` is present in the root).
32: 
33: ### Setup
34: Sobgulo dependency install korar jonno protita folder-er `requirements.txt` check korun. Root theke install korte:
35: 
36: ```bash
37: # Example for AI Image Generator
38: cd AI--Image--Generator
39: pip install -r requirements.txt
40: ```
41: 
42: ### Running the Apps
43: Proti ti tool-er alada backend server thakte pare. Python server cholate:
44: 
45: ```bash
46: # For AI Image Generator
47: python app.py
48: 
49: # For Net Speed Checker
50: python server.py
51: ```
52: 
53: Static toolkit-er jonno sudhu `index.html` file-ti browser-e open korlei hobe.
54: 
55: ## Development Conventions
56: - **Frontend**: Vanilla CSS ebong JavaScript bebohar kora hoyeche. 
57: - **Backend**: Flask framework use kora hoyeche APIs er jonno.
58: - **API Keys**: AI Generator er jonno `HUGGINGFACE_API_KEY` environment variable-e thaka dorkar.

(End of file - total 58 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\package.json"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "dar-studio",
3:   "version": "1.0.0",
4:   "description": "Dar Studio — A modern code editor built with Electron, React, and Monaco Editor",
5:   "main": "out/main/index.js",
6:   "scripts": {
7:     "dev": "electron-vite dev",
8:     "build": "electron-vite build",
9:     "package": "npm run build && electron-builder --win",
10:     "package:portable": "npm run build && electron-builder --win portable"
11:   },
12:   "dependencies": {
13:     "@iconify-json/vscode-icons": "^1.2.58",
14:     "@iconify/react": "^6.0.2",
15:     "@monaco-editor/react": "^4.7.0",
16:     "@radix-ui/react-context-menu": "^2.3.1",
17:     "@xterm/addon-fit": "^0.11.0",
18:     "@xterm/xterm": "^6.0.0",
19:     "lucide-react": "^0.383.0",
20:     "monaco-editor": "^0.55.1",
21:     "node-pty": "^1.1.0",
22:     "react": "^18.3.0",
23:     "react-dom": "^18.3.0",
24:     "react-icons": "^5.6.0",
25:     "react-resizable-panels": "^4.11.2",
26:     "zustand": "^4.5.0"
27:   },
28:   "devDependencies": {
29:     "@types/react": "^18.3.0",
30:     "@types/react-dom": "^18.3.0",
31:     "@vitejs/plugin-react": "^4.2.0",
32:     "autoprefixer": "^10.4.0",
33:     "electron": "^28.0.0",
34:     "electron-builder": "^24.0.0",
35:     "electron-vite": "^2.0.0",
36:     "postcss": "^8.4.0",
37:     "tailwindcss": "^3.4.0",
38:     "typescript": "^5.4.0",
39:     "vite": "^5.0.0"
40:   }
41: }

(End of file - total 41 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\vite.config.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\vite.config.ts</path>
<type>file</type>
<content>
1: import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
2: import react from '@vitejs/plugin-react'
3: 
4: export default defineConfig({
5:   main: {
6:     plugins: [externalizeDepsPlugin()],
7:     build: {
8:       rollupOptions: {
9:         output: { format: 'cjs' },
10:       },
11:     },
12:   },
13:   preload: {
14:     plugins: [externalizeDepsPlugin()]
15:   },
16:   renderer: {
17:     root: 'src/renderer',
18:     plugins: [react()],
19:   }
20: })

(End of file - total 20 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\README.md"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\README.md</path>
<type>file</type>
<content>
1: <!-- markdownlint-disable MD033 -->
2: <div align="center">
3:   <h1 style="font-size: 2.5em; margin: 0; color: #ffffff;">
4:     Dar Studio &mdash; <span style="font-size: 0.55em; color: #888;"><em>Developed by Mahadi</em></span>
5:   </h1>
6:   <br>
7:   <img src="Icon/Main%20icon.png" width="200" height="200" alt="Dar Studio Logo">
8:   <p align="center" style="font-size: 1.1em; color: #888; margin: 10px 0 0 0;">
9:     A modern, feature-rich code editor built with Electron, React, and Monaco Editor
10:   </p>
11:   <br>
12:   <p align="center">
13:     <img src="Screen%20Shorts/Screenshot%202026-06-16%20073110.png" width="800" alt="Dar Studio Screenshot" style="border-radius: 8px; border: 1px solid #333;">
14:   </p>
15: </div>
16: 
17: <br>
18: 
19: ## Overview
20: 
21: Dar Studio is a full-featured code editor for Windows, built from the ground up using **Electron 28**, **React 18**, **TypeScript**, and **Monaco Editor** (the engine behind VS Code). It provides a native desktop experience with a modern, customizable UI.
22: 
23: <br>
24: 
25: ## Features
26: 
27: ### Editor
28: - **Monaco Editor** — Full VS Code editing experience with syntax highlighting, IntelliSense, multi-cursor, bracket matching, and more
29: - **Multi-tab editing** — Open and manage multiple files simultaneously
30: - **Auto language detection** — Automatically detects language from file extension (`js`, `ts`, `py`, `html`, `css`, `json`, `md`, `rs`, `go`, `java`, and 80+ more)
31: - **Font size control** — Adjustable editor font size, tab size, word wrap, minimap, and line numbers
32: 
33: ### File Management
34: - **File Explorer** — Tree-based file browser with expand/collapse directories
35: - **File operations** — Create, rename, delete files and folders
36: - **Context menus** — Right-click on files/folders for quick actions
37: - **Selection highlight** — Click to select files/folders with visual highlight
38: - **Create in folder** — Header + buttons create inside the currently selected folder
39: - **Drag region** — Title bar is fully draggable
40: 
41: ### Menu Bar
42: - **VS Code-style menu bar** with 8 dropdown menus:
43:   - **File** — New File, Open File/Folder, Save/Save As, Close/Close All
44:   - **Edit** — Undo, Redo, Cut, Copy, Paste, Find, Replace
45:   - **Selection** — Select All
46:   - **View** — Command Palette (coming soon), Toggle Sidebar/Panel, Zoom In/Out/Reset
47:   - **Go** — Go to Line, Go to File
48:   - **Run** — Run Code, Stop (coming soon)
49:   - **Terminal** — New Terminal, Toggle Terminal
50:   - **Help** — About Dar Studio, Documentation
51: - **Click to open** — Each menu opens on click with hover-to-navigate between menus
52: - **Click outside to close** — Dropdowns close when clicking anywhere outside
53: 
54: ### Search
55: - **Real-time search** — Instantly searches across all files as you type (300ms debounce)
56: - **Case-sensitive toggle** — `Aa` button to toggle case sensitivity
57: - **Result count** — Shows total results across files
58: - **Clear button** — One-click to clear query and results
59: - **Global shortcut** — `Ctrl+Shift+F` opens search from anywhere
60: - **Smart directory filtering** — Skips `.git`, `node_modules`, `dist`, `out`, `build`, `.venv`, `__pycache__`, `.vite`, `.cache`, and all dotfiles
61: 
62: ### Terminal
63: - **Integrated terminal** — Full terminal powered by `node-pty`
64: - **Multi-shell support** — PowerShell, CMD, Git Bash, WSL detection
65: - **Tab management** — Create and switch between multiple terminal instances
66: 
67: ### UI / Layout
68: - **Resizable panels** — Sidebar, editor, and bottom panel are all resizable with draggable separators
69: - **Activity Bar** — Quick switch between Explorer, Search, Git (coming soon), Extensions (coming soon), and Settings
70: - **Bottom Panel** — Terminal, Output Logs, and Problems tabs
71: - **Status Bar** — Cursor position (Ln/Col), language, encoding, word wrap indicator, file path
72: - **Custom Title Bar** — Custom window controls with app icon and name
73: - **VS Code-inspired dark theme** — Consistent color scheme across all components
74: - **Collapsible panels** — Sidebar and bottom panel can be hidden completely
75: 
76: ### Tech Stack
77: - **Frontend:** React 18, TypeScript, Tailwind CSS 3
78: - **Editor:** Monaco Editor 0.55 (via `@monaco-editor/react`)
79: - **State:** Zustand
80: - **Desktop:** Electron 28, `electron-vite`
81: - **Terminal:** `node-pty`
82: - **Icons:** Lucide React, Iconify (vscode-icons)
83: 
84: <br>
85: 
86: ## Screenshots
87: 
88: <div align="center">
89:   <img src="Screen%20Shorts/Screenshot%202026-06-16%20073110.png" width="800" alt="Dar Studio Screenshot 1" style="border-radius: 8px; border: 1px solid #333; margin: 10px;">
90:   <br>
91:   <img src="Screen%20Shorts/Screenshot%202026-06-16%20073253.png" width="800" alt="Dar Studio Screenshot 2" style="border-radius: 8px; border: 1px solid #333; margin: 10px;">
92: </div>
93: 
94: <br>
95: 
96: ## Getting Started
97: 
98: ### Prerequisites
99: 
100: - **Node.js** 18+ (20 LTS recommended)
101: - **Windows** 10/11 (the app is Windows-only; built and tested on Windows)
102: 
103: ### Installation
104: 
105: ```bash
106: # Clone the repository
107: git clone https://github.com/yourusername/dar-studio.git
108: 
109: # Navigate to the project directory
110: cd dar-studio
111: 
112: # Install dependencies
113: npm install
114: 
115: # Start the development server
116: npm run dev
117: ```
118: 
119: This launches a Vite dev server on port 5173 and opens an Electron window.
120: 
121: ### Build for Production
122: 
123: ```bash
124: npm run build      # Build all 3 targets (main, preload, renderer)
125: npm run package    # Build + create NSIS installer + portable .exe
126: ```
127: 
128: The packaged installer will be in the `dist/` directory.
129: 
130: <br>
131: 
132: ## Project Structure
133: 
134: ```
135: dar-studio/
136: ├── Icon/                       # App icons for all sizes
137: ├── Screen Shorts/              # Screenshots for README
138: ├── src/
139: │   ├── main/                   # Electron main process
140: │   │   ├── index.ts            # Window creation, IPC setup
141: │   │   ├── file-system.ts      # File system IPC handlers
142: │   │   ├── search-files.ts     # Search across files
143: │   │   ├── shell-manager.ts    # node-pty terminal
144: │   │   └── window-controls.ts  # Min/Max/Close handlers
145: │   ├── preload/
146: │   │   └── index.ts            # contextBridge IPC exposure
147: │   └── renderer/
148: │       ├── App.tsx             # Root layout + keybindings
149: │       ├── main.tsx            # React entry point
150: │       ├── assets/             # Icons imported by Vite
151: │       ├── components/
152: │       │   └── FileTree/       # FileTree + FileTreeNode
153: │       ├── hooks/
154: │       │   └── useFileSystem.ts
155: │       ├── layout/
156: │       │   ├── ActivityBar.tsx  # Sidebar icon navigation
157: │       │   ├── BottomPanel.tsx  # Terminal/Output/Problems tabs
158: │       │   ├── MainArea.tsx     # Editor tabs + Monaco
159: │       │   ├── MenuBar.tsx      # VS Code-style menu bar
160: │       │   ├── SidePanel.tsx    # Resizable side panel
161: │       │   ├── StatusBar.tsx    # Bottom status bar
162: │       │   └── TitleBar.tsx     # Custom title bar + menu bar
163: │       ├── modules/
164: │       │   ├── SearchInFiles/   # File search with debounce
165: │       │   └── Settings/        # Settings panel
166: │       └── store/
167: │           ├── appStore.ts      # Global app state (Zustand)
168: │           └── settingsStore.ts # Editor settings (Zustand)
169: ├── electron-vite.config.ts
170: ├── package.json
171: ├── tailwind.config.js
172: └── tsconfig*.json
173: ```
174: 
175: <br>
176: 
177: ## Architecture
178: 
179: - **Main Process** (`src/main/`): Window management, IPC handlers for file system, search, terminal (node-pty)
180: - **Preload** (`src/preload/`): Secure bridge exposing Electron APIs to renderer via `contextBridge`
181: - **Renderer** (`src/renderer/`): React app with Zustand stores, Monaco Editor, Tailwind UI
182: - **Layout**: TitleBar (with MenuBar) → ActivityBar + SidePanel + EditorArea + BottomPanel → StatusBar
183: 
184: ### IPC Communication
185: 
186: | Channel | Direction | Purpose |
187: |---------|-----------|---------|
188: | `win:*` | Main → Renderer | Window controls (min/max/close) |
189: | `fs:*` | Renderer → Main | File read/write/create/delete/rename |
190: | `dialog:*` | Renderer → Main | Native open/save dialogs |
191: | `search:inFiles` | Renderer → Main | Full-text search across files |
192: | `terminal:*` | Both directions | Terminal create/write/resize/kill/data |
193: 
194: <br>
195: 
196: ## Keyboard Shortcuts
197: 
198: | Shortcut | Action |
199: |----------|--------|
200: | `Ctrl+S` | Save current file |
201: | `Ctrl+W` | Close current tab |
202: | `Ctrl+Shift+F` | Open search panel |
203: | `Ctrl+B` | Toggle sidebar |
204: | `Ctrl+J` | Toggle bottom panel |
205: | `Ctrl+\`` | New terminal / toggle terminal |
206: | `Ctrl+=` / `Ctrl+-` | Zoom in / out |
207: | `Ctrl+G` | Go to line |
208: | `Ctrl+P` | Go to file (opens search) |
209: 
210: <br>
211: 
212: ## Development
213: 
214: ### Main Process
215: 
216: ```bash
217: npm run dev    # Start with Vite hot-reload + Electron
218: ```
219: 
220: ### Commands
221: 
222: ```bash
223: npm run build      # Build to out/ (3 outputs)
224: npm run package    # Build + package with electron-builder (NSIS installer + portable)
225: ```
226: 
227: <br>
228: 
229: ## Problem Fixes
230: 
231: A chronological list of bugs and issues resolved during development.
232: 
233: ### Layout & Rendering
234: | Fix | Description |
235: |-----|-------------|
236: | **Panel API mismatch (App.tsx)** | Fixed `react-resizable-panels` v4 breaking changes — `direction` → `orientation`, `ref` → `panelRef`, `onCollapse`/`onExpand` → `onResize`, `ImperativePanelHandle` → `PanelImperativeHandle`, `collapsedSize={5}` → `collapsedSize={0}` |
237: | **Editor 0px height (MainArea.tsx)** | Changed `flex-1` → `h-full` because Panel inner div is `display: block`, so `flex-1` didn't fill the parent |
238: | **ActivityBar restructure** | Moved outside horizontal `Group` to avoid non-Panel child warnings |
239: 
240: ### File System
241: | Fix | Description |
242: |-----|-------------|
243: | **Nested file/folder creation** | Creation input now renders inline inside the selected directory via `creating` prop instead of root level only |
244: | **Children not refreshing after nested create** | Added `refreshKey` prop propagation to `FileTreeNode` — triggers `loadChildren()` re-run when `refreshKey` changes |
245: | **File selection highlight** | Added `selectedPath` state in `FileTree`, visual highlight via `bg-active` class |
246: | **Create in selected folder** | Header `+` buttons create inside the currently selected directory, fallback to `rootPath` |
247: 
248: ### Search
249: | Fix | Description |
250: |-----|-------------|
251: | **Search feature added** | Case-sensitive toggle (`Aa`), result count, clear button, auto-focus input, global shortcut `Ctrl+Shift+F` |
252: | **Debounced real-time search** | 300ms debounce via `useEffect` + `searchKeyRef` pattern to cancel stale responses |
253: | **Directory skip patterns** | Added `SKIP_DIRS` set — skips `.git`, `node_modules`, `dist`, `out`, `build`, `__pycache__`, `.venv`, `.vite`, `.cache`, `.next`, `.nuxt`, `coverage`, `.turbo`, `.parcel-cache` plus all dotfiles |
254: | **Search result click opens file** | Clicking a search result now reads and opens the file in the editor |
255: 
256: ### Menu Bar
257: | Fix | Description |
258: |-----|-------------|
259: | **Full menu bar implementation** | Added VS Code-style menu bar: File, Edit, Selection, View, Go, Run, Terminal, Help — click-to-open dropdown with hover-to-navigate |
260: | **MenuBar Open File not working** | `openFile()` dialog result now handled — reads and opens selected files in editor |
261: | **MenuBar Open Folder not working** | `openFolder()` dialog result now handled — sets `rootPath`, refreshes file tree, persists last path |
262: 
263: ### Persistence
264: | Fix | Description |
265: |-----|-------------|
266: | **Last opened folder not remembered** | Added `app:getLastPath`/`app:setLastPath` IPC handlers using Electron `userData` directory. Auto-restores last folder on startup |
267: | **SidePanel error handling** | Added `.catch()` to `getLastPath()` promise to prevent unhandled rejection crashes |
268: 
269: ### UI Polish
270: | Fix | Description |
271: |-----|-------------|
272: | **TitleBar icon size** | Adjusted from `w-10 h-10` → `w-6 h-6` for better visual balance |
273: | **README hero icon size** | Increased from 120px → 200px |
274: | **README screenshot paths** | Fixed references to non-existent `1.png–5.png` → actual screenshot filenames |
275: | **"Developed by Mahadi"** | Added to README hero title |
276: | **Fixed footer credit** | "Made with ❤️ by Mahadi" at bottom of README |
277: 
278: <br>
279: 
280: ## License
281: 
282: This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
283: 
284: <br>
285: 
286: ---
287: 
288: <div align="center">
289:   <p style="font-size: 1.1em;">Made with ❤️ by <strong>Mahadi</strong></p>
290: </div>

(End of file - total 290 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "Code-Editor/dar-studio/electron.vite.config.*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "Code-Editor/dar-studio/tsconfig*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.web.json
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.node.json
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.json
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 11.9s)

_Thinking:_

Let me check more files to verify facts and find any additional high-signal information. I should check:
1. The electron.vite.config files (didn't find with previous glob - let me check differently)
2. The src directory of dar-studio for the actual source code
3. The other projects' details
4. Any CI/CD config
5. Tailwind and postcss config

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/electron*.config*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "tailwind.config*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tailwind.config.ts
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "postcss.config*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\postcss.config.js
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/tsconfig*.json",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.web.json
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.node.json
C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.json
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\renderer\\store\\appStore.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\renderer\store\appStore.ts</path>
<type>file</type>
<content>
1: import { create } from 'zustand'
2: import { FileEntry } from '../types'
3: 
4: interface OpenTab {
5:   path: string
6:   name: string
7:   content: string
8:   isDirty: boolean
9:   language: string
10: }
11: 
12: interface AppState {
13:   sidePanelOpen: boolean
14:   toggleSidePanel: () => void
15:   bottomPanelOpen: boolean
16:   toggleBottomPanel: () => void
17:   rightPanelOpen: boolean
18:   toggleRightPanel: () => void
19:   bottomPanelTab: 'OUTPUT' | 'TERMINAL' | 'PROBLEMS'
20:   setBottomPanelTab: (t: 'OUTPUT' | 'TERMINAL' | 'PROBLEMS') => void
21: 
22:   activeModule: 'Files' | 'Search' | 'Git' | 'Extensions' | 'Settings'
23:   setActiveModule: (m: 'Files' | 'Search' | 'Git' | 'Extensions' | 'Settings') => void
24: 
25:   openTabs: OpenTab[]
26:   activeTab: string | null
27:   openFile: (path: string, name: string, content: string, language: string) => void
28:   closeTab: (path: string) => void
29:   setActiveTab: (path: string) => void
30:   updateTabContent: (path: string, content: string) => void
31:   markTabClean: (path: string) => void
32: 
33:   rootPath: string | null
34:   setRootPath: (path: string | null) => void
35:   fileTree: FileEntry[]
36:   setFileTree: (entries: FileEntry[]) => void
37: 
38:   cursorLine: number
39:   cursorColumn: number
40:   setCursor: (line: number, col: number) => void
41: 
42:   outputLogs: string[]
43:   addOutputLog: (log: string) => void
44: }
45: 
46: function detectLanguage(fileName: string): string {
47:   const ext = fileName.split('.').pop()?.toLowerCase() || ''
48:   const map: Record<string, string> = {
49:     js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
50:     py: 'python', rb: 'ruby', rs: 'rust', go: 'go', java: 'java',
51:     c: 'c', cpp: 'cpp', cs: 'csharp', php: 'php', swift: 'swift',
52:     html: 'html', css: 'css', scss: 'scss', less: 'less',
53:     json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
54:     md: 'markdown', sql: 'sql', sh: 'shell', bash: 'shell',
55:     txt: 'plaintext', gitignore: 'plaintext',
56:   }
57:   return map[ext] || 'plaintext'
58: }
59: 
60: export const useAppStore = create<AppState>((set) => ({
61:   sidePanelOpen: true,
62:   toggleSidePanel: () => set((s) => ({ sidePanelOpen: !s.sidePanelOpen })),
63:   bottomPanelOpen: true,
64:   toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
65:   rightPanelOpen: true,
66:   toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
67:   bottomPanelTab: 'TERMINAL',
68:   setBottomPanelTab: (t) => set({ bottomPanelTab: t }),
69: 
70:   activeModule: 'Files',
71:   setActiveModule: (m) => set({ activeModule: m }),
72: 
73:   openTabs: [],
74:   activeTab: null,
75:   openFile: (path, name, content, language) =>
76:     set((s) => {
77:       const exists = s.openTabs.find((t) => t.path === path)
78:       if (exists) return { activeTab: path }
79:       return {
80:         openTabs: [...s.openTabs, { path, name, content, isDirty: false, language: language || detectLanguage(name) }],
81:         activeTab: path,
82:       }
83:     }),
84:   closeTab: (path) =>
85:     set((s) => {
86:       const tabs = s.openTabs.filter((t) => t.path !== path)
87:       let active = s.activeTab
88:       if (active === path) {
89:         const idx = s.openTabs.findIndex((t) => t.path === path)
90:         active = tabs[Math.min(idx, tabs.length - 1)]?.path || null
91:       }
92:       return { openTabs: tabs, activeTab: active }
93:     }),
94:   setActiveTab: (path) => set({ activeTab: path }),
95:   updateTabContent: (path, content) =>
96:     set((s) => ({
97:       openTabs: s.openTabs.map((t) => (t.path === path ? { ...t, content, isDirty: true } : t)),
98:     })),
99:   markTabClean: (path) =>
100:     set((s) => ({
101:       openTabs: s.openTabs.map((t) => (t.path === path ? { ...t, isDirty: false } : t)),
102:     })),
103: 
104:   rootPath: null,
105:   setRootPath: (path) => set({ rootPath: path }),
106:   fileTree: [],
107:   setFileTree: (entries) => set({ fileTree: entries }),
108: 
109:   cursorLine: 1,
110:   cursorColumn: 1,
111:   setCursor: (line, col) => set({ cursorLine: line, cursorColumn: col }),
112: 
113:   outputLogs: ['[System] Code Editor initialized'],
114:   addOutputLog: (log) => set((s) => ({ outputLogs: [...s.outputLogs, log] })),
115: }))

(End of file - total 115 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\renderer\\store\\settingsStore.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\renderer\store\settingsStore.ts</path>
<type>file</type>
<content>
1: import { create } from 'zustand'
2: 
3: export type WordWrap = 'off' | 'on' | 'wordWrapColumn' | 'bounded'
4: export type LineNumbers = 'on' | 'off' | 'relative'
5: 
6: interface SettingsState {
7:   fontSize: number
8:   setFontSize: (s: number) => void
9:   tabSize: number
10:   setTabSize: (s: number) => void
11:   wordWrap: WordWrap
12:   setWordWrap: (w: WordWrap) => void
13:   minimap: boolean
14:   setMinimap: (m: boolean) => void
15:   lineNumbers: LineNumbers
16:   setLineNumbers: (l: LineNumbers) => void
17: }
18: 
19: export const useSettingsStore = create<SettingsState>((set) => ({
20:   fontSize: 14,
21:   setFontSize: (s) => set({ fontSize: s }),
22:   tabSize: 2,
23:   setTabSize: (s) => set({ tabSize: s }),
24:   wordWrap: 'off',
25:   setWordWrap: (w) => set({ wordWrap: w }),
26:   minimap: true,
27:   setMinimap: (m) => set({ minimap: m }),
28:   lineNumbers: 'on',
29:   setLineNumbers: (l) => set({ lineNumbers: l }),
30: }))

(End of file - total 30 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/requirements.txt",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
C:\Users\Mahadi\Desktop\Tools\Weather--Tool\requirements.txt
C:\Users\Mahadi\Desktop\Tools\Python-Bot-Agent\requirements.txt
C:\Users\Mahadi\Desktop\Tools\Image--Background--Remover\requirements.txt
C:\Users\Mahadi\Desktop\Tools\Net--Speed--Checker\requirements.txt
C:\Users\Mahadi\Desktop\Tools\AI--Image--Generator\requirements.txt
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 8.0s)

_Thinking:_

Now let me check a few more things:
1. Read the electron-vite config file
2. Check if there are lint/test scripts
3. Check the main process and preload for dependencies
4. Check the other project package.json for chat-app

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/electron-vite*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
No files found
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\main\\index.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\main\index.ts</path>
<type>file</type>
<content>
1: import { app, BrowserWindow, Menu, nativeImage } from 'electron'
2: import path from 'path'
3: import fs from 'fs'
4: import { registerWindowControls } from './window-controls'
5: import { registerFileSystem } from './file-system'
6: import { registerSearchFiles } from './search-files'
7: import { registerShellManager } from './shell-manager'
8: 
9: let win: BrowserWindow | null = null
10: 
11: function loadIcon(): Electron.NativeImage {
12:   const pngPath = path.join(__dirname, '../../Icon/icon-256.png')
13:   const icoPath = path.join(__dirname, '../../Icon/icon.ico')
14:   if (fs.existsSync(pngPath)) {
15:     const img = nativeImage.createFromPath(pngPath)
16:     if (!img.isEmpty()) return img.resize({ width: 64, height: 64, quality: 'best' })
17:   }
18:   if (fs.existsSync(icoPath)) {
19:     const img = nativeImage.createFromPath(icoPath)
20:     if (!img.isEmpty()) return img
21:   }
22:   return nativeImage.createEmpty()
23: }
24: 
25: function createWindow() {
26:   const icon = loadIcon()
27: 
28:   win = new BrowserWindow({
29:     width: 1400,
30:     height: 900,
31:     minWidth: 900,
32:     minHeight: 600,
33:     frame: false,
34:     titleBarStyle: 'hidden',
35:     backgroundColor: '#0d0d0d',
36:     show: true,
37:     icon: icon.isEmpty() ? undefined : icon,
38:     webPreferences: {
39:       preload: path.join(__dirname, '../preload/index.js'),
40:       contextIsolation: true,
41:       nodeIntegration: false,
42:     },
43:   })
44: 
45:   if (process.env.ELECTRON_VITE_DEV || process.env.NODE_ENV === 'development') {
46:     win.webContents.openDevTools()
47:   }
48: 
49:   if (!icon.isEmpty()) win.setIcon(icon)
50:   Menu.setApplicationMenu(null)
51: 
52:   if (process.env.ELECTRON_VITE_DEV || process.env.NODE_ENV === 'development') {
53:     win.loadURL('http://localhost:5173')
54:   } else {
55:     win.loadFile(path.join(__dirname, '../renderer/index.html'))
56:   }
57: }
58: 
59: app.whenReady().then(() => {
60:   app.setAppUserModelId('com.darstudio.app')
61:   createWindow()
62:   registerWindowControls()
63:   registerFileSystem()
64:   registerSearchFiles()
65:   registerShellManager()
66: })
67: 
68: app.on('window-all-closed', () => {
69:   if (process.platform !== 'darwin') app.quit()
70: })

(End of file - total 70 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\preload\\index.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\preload\index.ts</path>
<type>file</type>
<content>
1: import { contextBridge, ipcRenderer } from 'electron'
2: 
3: contextBridge.exposeInMainWorld('electron', {
4:   // Window controls
5:   minimize: () => ipcRenderer.send('win:minimize'),
6:   maximize: () => ipcRenderer.send('win:maximize'),
7:   close: () => ipcRenderer.send('win:close'),
8: 
9:   // File system
10:   readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
11:   readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
12:   writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
13:   createFile: (filePath: string) => ipcRenderer.invoke('fs:createFile', filePath),
14:   createDir: (dirPath: string) => ipcRenderer.invoke('fs:createDir', dirPath),
15:   delete: (targetPath: string) => ipcRenderer.invoke('fs:delete', targetPath),
16:   rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
17:   exists: (targetPath: string) => ipcRenderer.invoke('fs:exists', targetPath),
18: 
19:   // Dialogs
20:   openFile: () => ipcRenderer.invoke('dialog:openFile'),
21:   openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
22:   saveFile: (defaultPath?: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
23: 
24:   // Persist
25:   getLastPath: () => ipcRenderer.invoke('app:getLastPath'),
26:   setLastPath: (dirPath: string) => ipcRenderer.invoke('app:setLastPath', dirPath),
27: 
28:   // Search
29:   searchInFiles: (p: { rootPath: string; query: string; caseSensitive?: boolean; maxResults?: number }) =>
30:     ipcRenderer.invoke('search:inFiles', p),
31: 
32:   // Terminal
33:   terminal: {
34:     create: (shell: string) => ipcRenderer.invoke('terminal:create', shell),
35:     write: (id: number, data: string) => ipcRenderer.send('terminal:write', id, data),
36:     resize: (id: number, cols: number, rows: number) => ipcRenderer.send('terminal:resize', id, cols, rows),
37:     kill: (id: number) => ipcRenderer.send('terminal:kill', id),
38:     onData: (callback: (id: number, data: string) => void) => {
39:       const handler = (_: any, id: number, data: string) => callback(id, data)
40:       ipcRenderer.on('terminal:data', handler)
41:       return () => ipcRenderer.removeListener('terminal:data', handler)
42:     },
43:     getShells: () => ipcRenderer.invoke('terminal:getShells'),
44:   },
45: })

(End of file - total 45 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Chat-application\\package.json"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Chat-application\package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "app",
3:   "private": true,
4:   "version": "0.0.0",
5:   "type": "module",
6:   "scripts": {
7:     "dev": "vite",
8:     "build": "tsc -b && vite build",
9:     "lint": "eslint .",
10:     "preview": "vite preview"
11:   },
12:   "dependencies": {
13:     "clsx": "^2.1.1",
14:     "framer-motion": "^12.40.0",
15:     "lucide-react": "^1.18.0",
16:     "react": "^19.2.6",
17:     "react-dom": "^19.2.6",
18:     "tailwind-merge": "^3.6.0"
19:   },
20:   "devDependencies": {
21:     "@eslint/js": "^10.0.1",
22:     "@types/node": "^24.12.3",
23:     "@types/react": "^19.2.14",
24:     "@types/react-dom": "^19.2.3",
25:     "@vitejs/plugin-react": "^6.0.1",
26:     "autoprefixer": "^10.5.0",
27:     "eslint": "^10.3.0",
28:     "eslint-plugin-react-hooks": "^7.1.1",
29:     "eslint-plugin-react-refresh": "^0.5.2",
30:     "globals": "^17.6.0",
31:     "postcss": "^8.5.15",
32:     "tailwindcss": "^3.4.19",
33:     "typescript": "~6.0.2",
34:     "typescript-eslint": "^8.59.2",
35:     "vite": "^8.0.12"
36:   }
37: }

(End of file - total 37 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*.lint*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/eslint*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/prettier*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
No files found
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 6.2s)

_Thinking:_

Let me search for the electron-vite config file using a broader glob.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/electron*.config.*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor"
}
```

**Output:**
```
No files found
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/.github/workflows/*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools"
}
```

**Output:**
```
No files found
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\main\\shell-manager.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\main\shell-manager.ts</path>
<type>file</type>
<content>
1: import { ipcMain, BrowserWindow } from 'electron'
2: import os from 'os'
3: import path from 'path'
4: 
5: // dynamic require to bypass Rollup bundling of native module
6: const nodePty: typeof import('node-pty') = eval('require')('node-pty')
7: const { spawn } = nodePty
8: 
9: let terminalIdCounter = 0
10: const terminals = new Map<number, ReturnType<typeof spawn>>()
11: 
12: function detectShells(): { name: string; path: string; icon: string }[] {
13:   const shells: { name: string; path: string; icon: string }[] = []
14: 
15:   // cmd.exe — always available on Windows
16:   const comSpec = process.env.COMSPEC
17:   if (comSpec) {
18:     shells.push({ name: 'Command Prompt', path: comSpec, icon: 'cmd' })
19:   }
20: 
21:   // Windows PowerShell (5.1)
22:   const psPath = path.join(os.homedir(), '..', 'Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
23:   const sysPs = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
24:   if (require('fs').existsSync(sysPs)) {
25:     shells.push({ name: 'PowerShell 5.1', path: sysPs, icon: 'powershell' })
26:   }
27: 
28:   // PowerShell Core (pwsh.exe) — check PATH
29:   const envPath = process.env.PATH || ''
30:   for (const dir of envPath.split(path.delimiter)) {
31:     const pwshPath = path.join(dir, 'pwsh.exe')
32:     if (require('fs').existsSync(pwshPath)) {
33:       shells.push({ name: 'PowerShell Core', path: pwshPath, icon: 'pwsh' })
34:       break
35:     }
36:   }
37: 
38:   // Git Bash — common install locations
39:   const bashCandidates = [
40:     path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Git', 'bin', 'bash.exe'),
41:     path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Git', 'bin', 'bash.exe'),
42:   ]
43:   for (const bp of bashCandidates) {
44:     if (require('fs').existsSync(bp)) {
45:       shells.push({ name: 'Git Bash', path: bp, icon: 'bash' })
46:       break
47:     }
48:   }
49: 
50:   return shells
51: }
52: 
53: export function registerShellManager() {
54:   ipcMain.handle('terminal:getShells', async () => {
55:     return detectShells()
56:   })
57: 
58:   ipcMain.handle('terminal:create', async (event, shellPath: string) => {
59:     const id = ++terminalIdCounter
60:     const cwd = process.env.USERPROFILE || process.env.HOME || os.homedir()
61: 
62:     try {
63:       const ptyProcess = spawn(shellPath, [], {
64:         name: 'xterm-color',
65:         cols: 80,
66:         rows: 24,
67:         cwd,
68:         env: process.env as Record<string, string>,
69:       })
70: 
71:       terminals.set(id, ptyProcess)
72: 
73:       ptyProcess.onData((data: string) => {
74:         const win = BrowserWindow.fromWebContents(event.sender)
75:         if (win) {
76:           win.webContents.send('terminal:data', id, data)
77:         }
78:       })
79: 
80:       ptyProcess.onExit(({ exitCode, signal }) => {
81:         terminals.delete(id)
82:         const win = BrowserWindow.fromWebContents(event.sender)
83:         if (win) {
84:           win.webContents.send('terminal:data', id, `\r\n[Process exited with code ${exitCode}]\r\n`)
85:         }
86:       })
87: 
88:       return id
89:     } catch (err) {
90:       console.error('Failed to create terminal:', err)
91:       return -1
92:     }
93:   })
94: 
95:   ipcMain.on('terminal:write', (_, id: number, data: string) => {
96:     const pty = terminals.get(id)
97:     if (pty) {
98:       pty.write(data)
99:     }
100:   })
101: 
102:   ipcMain.on('terminal:resize', (_, id: number, cols: number, rows: number) => {
103:     const pty = terminals.get(id)
104:     if (pty) {
105:       pty.resize(cols, rows)
106:     }
107:   })
108: 
109:   ipcMain.on('terminal:kill', (_, id: number) => {
110:     const pty = terminals.get(id)
111:     if (pty) {
112:       pty.kill()
113:       terminals.delete(id)
114:     }
115:   })
116: }

(End of file - total 116 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\renderer\\App.tsx"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\renderer\App.tsx</path>
<type>file</type>
<content>
1: import React, { useCallback, useEffect, useRef } from 'react'
2: import { Group, Panel, Separator } from 'react-resizable-panels'
3: import type { PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
4: import { TitleBar } from './layout/TitleBar'
5: import { ActivityBar } from './layout/ActivityBar'
6: import { SidePanel } from './layout/SidePanel'
7: import { MainArea } from './layout/MainArea'
8: import { BottomPanel } from './layout/BottomPanel'
9: import { StatusBar } from './layout/StatusBar'
10: import { useAppStore } from './store/appStore'
11: 
12: export default function App() {
13:   const sidePanelOpen = useAppStore((s) => s.sidePanelOpen)
14:   const bottomPanelOpen = useAppStore((s) => s.bottomPanelOpen)
15:   const sidebarRef = useRef<PanelImperativeHandle>(null)
16:   const bottomRef = useRef<PanelImperativeHandle>(null)
17: 
18:   const handleSideResize = useCallback((panelSize: PanelSize, _id: string | number | undefined, prevPanelSize: PanelSize | undefined) => {
19:     if (!prevPanelSize) return
20:     useAppStore.setState({ sidePanelOpen: panelSize.asPercentage >= 1 })
21:   }, [])
22: 
23:   const handleBottomResize = useCallback((panelSize: PanelSize, _id: string | number | undefined, prevPanelSize: PanelSize | undefined) => {
24:     if (!prevPanelSize) return
25:     useAppStore.setState({ bottomPanelOpen: panelSize.asPercentage >= 1 })
26:   }, [])
27: 
28:   useEffect(() => {
29:     if (!sidebarRef.current) return
30:     if (sidePanelOpen) sidebarRef.current.expand()
31:     else sidebarRef.current.collapse()
32:   }, [sidePanelOpen])
33: 
34:   useEffect(() => {
35:     if (!bottomRef.current) return
36:     if (bottomPanelOpen) bottomRef.current.expand()
37:     else bottomRef.current.collapse()
38:   }, [bottomPanelOpen])
39: 
40:   useEffect(() => {
41:     const handleKeyDown = (e: KeyboardEvent) => {
42:       if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
43:         e.preventDefault()
44:         const store = useAppStore.getState()
45:         if (store.activeModule !== 'Search') {
46:           store.setActiveModule('Search')
47:           if (!store.sidePanelOpen) store.toggleSidePanel()
48:         }
49:       }
50:     }
51:     window.addEventListener('keydown', handleKeyDown)
52:     return () => window.removeEventListener('keydown', handleKeyDown)
53:   }, [])
54: 
55:   return (
56:     <div className="h-screen flex flex-col bg-base">
57:       <TitleBar />
58:       <Group orientation="vertical" className="flex-1 min-h-0">
59:         <Panel defaultSize={78} minSize={20} className="min-h-0">
60:           <div className="h-full flex min-h-0 overflow-hidden">
61:             <ActivityBar />
62:             <Group orientation="horizontal" className="flex-1 min-h-0">
63:               <Panel
64:                 panelRef={sidebarRef}
65:                 id="sidebar"
66:                 defaultSize={22}
67:                 minSize={8}
68:                 collapsedSize={0}
69:                 collapsible
70:                 onResize={handleSideResize}
71:               >
72:                 <SidePanel />
73:               </Panel>
74:               <Separator className="w-[3px] hover:bg-accent-blue transition-colors data-[resize-handle-active]:bg-accent-blue shrink-0" />
75:               <Panel id="editor" defaultSize={78} minSize={20}>
76:                 <MainArea />
77:               </Panel>
78:             </Group>
79:           </div>
80:         </Panel>
81:         <Separator className="h-[3px] hover:bg-accent-blue transition-colors data-[resize-handle-active]:bg-accent-blue shrink-0" />
82:         <Panel
83:           panelRef={bottomRef}
84:           id="bottom"
85:           defaultSize={22}
86:           minSize={5}
87:           collapsedSize={0}
88:           collapsible
89:           onResize={handleBottomResize}
90:         >
91:           <BottomPanel />
92:         </Panel>
93:       </Group>
94:       <StatusBar />
95:     </div>
96:   )
97: }

(End of file - total 97 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\renderer\\main.tsx"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\renderer\main.tsx</path>
<type>file</type>
<content>
1: import React from 'react'
2: import ReactDOM from 'react-dom/client'
3: import App from './App'
4: import './styles/globals.css'
5: import favicon from './assets/icon-32.png'
6: 
7: const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
8: if (link) {
9:   link.href = favicon
10: } else {
11:   const el = document.createElement('link')
12:   el.rel = 'icon'
13:   el.type = 'image/png'
14:   el.href = favicon
15:   document.head.appendChild(el)
16: }
17: 
18: const splash = document.getElementById('splash')
19: const msgEl = document.getElementById('splash-msg')
20: const dotsEl = document.getElementById('splash-dots')
21: 
22: const messages = ['Loading workspace', 'Preparing editor', 'Starting']
23: let msgIdx = 0
24: let dotCount = 1
25: 
26: if (dotsEl) {
27:   setInterval(() => {
28:     dotCount = dotCount >= 3 ? 1 : dotCount + 1
29:     dotsEl.textContent = '.'.repeat(dotCount)
30:   }, 500)
31: }
32: 
33: if (msgEl) {
34:   setInterval(() => {
35:     msgIdx = (msgIdx + 1) % messages.length
36:     msgEl.textContent = messages[msgIdx]
37:   }, 800)
38: }
39: 
40: ReactDOM.createRoot(document.getElementById('root')!).render(
41:   <React.StrictMode>
42:     <App />
43:   </React.StrictMode>
44: )
45: 
46: setTimeout(() => {
47:   if (dotsEl) dotsEl.textContent = ''
48:   splash?.classList.add('fade-out')
49:   setTimeout(() => splash?.classList.add('hidden'), 300)
50: }, 2500)

(End of file - total 50 lines)
</content>
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 6.4s)

_Thinking:_

Now I need to find the electron-vite config. Let me look more carefully.

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem -LiteralPath \"C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\" -Filter \"electron*\" -Name",
  "description": "Find electron-vite config file"
}
```

**Output:**
```
electron-builder.yml

```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\tailwind.config.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tailwind.config.ts</path>
<type>file</type>
<content>
1: import type { Config } from 'tailwindcss'
2: 
3: const config: Config = {
4:   content: ['./index.html', './src/**/*.{ts,tsx}'],
5:   theme: {
6:     extend: {
7:       colors: {
8:         base: 'var(--bg-base)',
9:         surface: 'var(--bg-surface)',
10:         elevated: 'var(--bg-elevated)',
11:         overlay: 'var(--bg-overlay)',
12:         hover: 'var(--bg-hover)',
13:         active: 'var(--bg-active)',
14:         input: 'var(--bg-input)',
15:         'activitybar-bg': 'var(--activitybar-bg)',
16:         'activitybar-icon': 'var(--activitybar-icon)',
17:         'activitybar-icon-active': 'var(--activitybar-icon-active)',
18:         'activitybar-badge': 'var(--activitybar-badge-bg)',
19:         'activitybar-badge-text': 'var(--activitybar-badge-text)',
20:         'sidepanel-bg': 'var(--sidepanel-bg)',
21:         'sidepanel-border': 'var(--sidepanel-border)',
22:         'sidepanel-header': 'var(--sidepanel-header)',
23:         'sidepanel-text': 'var(--sidepanel-text)',
24:         'statusbar-bg': 'var(--statusbar-bg)',
25:         'statusbar-text': 'var(--statusbar-text)',
26:         'titlebar-bg': 'var(--titlebar-bg)',
27:         'titlebar-text': 'var(--titlebar-text)',
28:         'editor-bg': 'var(--editor-bg)',
29:         'editor-text': 'var(--editor-text)',
30:         'accent-blue': 'var(--accent-blue)',
31:         'accent-green': 'var(--accent-green)',
32:         'accent-yellow': 'var(--accent-yellow)',
33:         'accent-orange': 'var(--accent-orange)',
34:         'accent-red': 'var(--accent-red)',
35:         'accent-purple': 'var(--accent-purple)',
36:         panel: 'var(--panel-bg)',
37:         'panel-border': 'var(--panel-border)',
38:       },
39:       fontFamily: {
40:         ui: ['Segoe UI', 'system-ui', 'sans-serif'],
41:         mono: ['Cascadia Code', 'JetBrains Mono', 'Consolas', 'monospace'],
42:       },
43:       fontSize: {
44:         xs: '11px',
45:         sm: '12px',
46:         md: '13px',
47:         lg: '14px',
48:       },
49:       borderColor: {
50:         DEFAULT: 'var(--border)',
51:         focus: 'var(--border-focus)',
52:       },
53:     },
54:   },
55:   plugins: [],
56: }
57: 
58: export default config

(End of file - total 58 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\postcss.config.js"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\postcss.config.js</path>
<type>file</type>
<content>
1: module.exports = {
2:   plugins: {
3:     tailwindcss: {},
4:     autoprefixer: {}
5:   }
6: }

(End of file - total 6 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\tsconfig.json"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.json</path>
<type>file</type>
<content>
1: {
2:   "files": [],
3:   "references": [
4:     { "path": "./tsconfig.node.json" },
5:     { "path": "./tsconfig.web.json" }
6:   ]
7: }

(End of file - total 7 lines)
</content>
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 5.6s)

_Thinking:_

Let me also check the electron-builder.yml and the other projects to verify the existing AGENTS.md facts.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\electron-builder.yml"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\electron-builder.yml</path>
<type>file</type>
<content>
1: appId: com.darstudio.app
2: productName: Dar Studio
3: copyright: Copyright © 2026
4: 
5: win:
6:   target:
7:     - nsis
8:     - portable
9:   icon: Icon/icon.ico
10: 
11: nsis:
12:   artifactName: DarStudio-Setup-${version}
13:   oneClick: false
14:   perMachine: false
15:   allowToChangeInstallationDirectory: true
16:   runAfterFinish: true
17:   createDesktopShortcut: true
18:   createStartMenuShortcut: true
19:   shortcutName: Dar Studio
20:   installerIcon: Icon/icon.ico
21:   uninstallerIcon: Icon/icon.ico
22:   installerHeader: resources/installer-header.bmp
23:   installerSidebar: resources/installer-sidebar.bmp
24: 
25: portable:
26:   artifactName: DarStudio-Portable-${version}
27: 
28: directories:
29:   output: dist-electron
30:   buildResources: resources

(End of file - total 30 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\tsconfig.node.json"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.node.json</path>
<type>file</type>
<content>
1: {
2:   "compilerOptions": {
3:     "composite": true,
4:     "module": "ESNext",
5:     "moduleResolution": "Node",
6:     "allowSyntheticDefaultImports": true,
7:     "resolveJsonModule": true
8:   },
9:   "include": ["electron/**/*.ts", "vite.config.ts"]
10: }

(End of file - total 10 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\tsconfig.web.json"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\tsconfig.web.json</path>
<type>file</type>
<content>
1: {
2:   "compilerOptions": {
3:     "composite": true,
4:     "module": "ESNext",
5:     "moduleResolution": "Node",
6:     "jsx": "react-jsx",
7:     "allowSyntheticDefaultImports": true,
8:     "resolveJsonModule": true,
9:     "baseUrl": ".",
10:     "paths": {
11:       "@/*": ["src/*"]
12:     }
13:   },
14:   "include": ["src/**/*.ts", "src/**/*.tsx"]
15: }

(End of file - total 15 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\renderer"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\renderer</path>
<type>directory</type>
<entries>
App.tsx
assets/
components/
hooks/
index.html
layout/
main.tsx
modules/
store/
styles/
types.d.ts

(11 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor</path>
<type>directory</type>
<entries>
dar-studio/
ui-ux-pro-max-skill/

(2 entries)
</entries>
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 30.8s)

_Thinking:_

Let me also check the `package:portable` script I saw in package.json, and verify the existing AGENTS.md claims against reality.

Looking at the data:

1. The existing AGENTS.md says the config file is `vite.config.ts` (not `electron-vite.config.ts`). The tsconfig.node.json includes `"electron/**/*.ts"` but looking at the actual src/main directory, it's at `src/main/`, not `electron/`. So the tsconfig.node.json seems inconsistent with the actual source layout.

2. No `npm run lint` or `npm run typecheck` scripts exist for dar-studio. The Chat-application has lint but not dar-studio.

3. The `.gitignore` excludes `Code-Editor/dar-studio/dev-output.txt`, `Code-Editor/dar-studio/resources/`, `Code-Editor/dar-studio/UIForge-Pro-Spec.md`, `Code-Editor/dar-studio/src/main/database.ts`, `Code-Editor/dar-studio/src/main/skill-bridge.ts`, and `Code-Editor/ui-ux-pro-max-skill/`. These are important to know.

4. The `electron-vite` config for dar-studio is in the `vite.config.ts` file (this is how `electron-vite` works - it uses `vite.config.ts` and reads `main`, `preload`, `renderer` keys).

5. The `electron-builder.yml` has a typo: `artifaceName` / `artifactName` - it says `artifactName` in the nsis section but that's for electron-builder to parse.

Let me double check the electron-vite config location. Looking at the package.json: `"dev": "electron-vite dev"`. electron-vite 2.x uses `vite.config.ts` (not `electron-vite.config.ts`). The vite.config.ts I already read has the `main`, `preload`, `renderer` sections which is the electron-vite format. So the existing AGENTS.md is correct about this.

Now let me verify other claims:
- `shell-manager.ts` does use `eval('require')('node-pty')` - ✓ confirmed
- `react-resizable-panels` v4 API: `Group`, `Separator`, `data-[resize-handle-active]` - ✓ confirmed from App.tsx
- `appStore.ts`: `openTabs[]`, `activeTab`, `openFile()`, `updateTabContent()`, `markTabClean()` - ✓ confirmed
- `settingsStore.ts`: individual setters, NOT generic `.set()` - ✓ confirmed
- Panel collapse: `PanelRef` + `useEffect` - ✓ confirmed from App.tsx

Now, what's missing or could be improved:

1. The `dev-output.txt` ignore and stale process kill command are useful
2. AGENTS.md mentions `npm run package:portable` but the table doesn't show it - it's in package.json though
3. The `.venv/` is shared among all Python projects at the root - confirmed
4. The `icon-256.png` path in the main process - should note it's relative to `__dirname` and there's a fallback to `icon.ico`
5. The `Icon/` directory at the project root - important
6. No lint/test/typecheck scripts exist for dar-studio - notable
7. The `ui-ux-pro-max-skill/` directory is excluded via `.gitignore`
8. The `electron-builder.yml` outputs to `dist-electron/` (not `dist/`)

Let me check the README for the other projects quickly.

Actually, let me just look at the remaining subprojects briefly to verify the existing table in AGENTS.md is accurate.

The AGENTS.md currently says:
- AI--Image--Generator/ Flask web app - `python app.py` ✓
- Image--Background--Remover/ Flask web app - `python app.py` ✓
- Net--Speed--Checker/ Flask web app - `python server.py` ✓
- Security--Privacy--Toolkit/ Static HTML/CSS/JS - Open `index.html` ✓
- Weather--Tool/ Flask web app - `python server.py` ✓
- Chat-application/ React + Vite SPA - `npm run dev` ✓
- tictactoe/ Static HTML/CSS/JS - Open `tictactoe.html` ✓
- Python-Bot-Agent/ Desktop voice agent - `python main.py` ✓

These seem correct based on the directory structure and tool types.

Now, what should I change for the new AGENTS.md?

Key improvements:
1. Add the `package:portable` command
2. Add the stale process kill command (it's already there)
3. Add note about no lint/typecheck/test scripts for dar-studio
4. Mention the `Code-Editor/ui-ux-pro-max-skill/` excluded dir
5. Mention `dist-electron/` as the electron-builder output
6. Mention that `tsconfig.node.json` includes `electron/**/*.ts` (a ghost pattern since main process is at `src/main/`)
7. Keep the Banglish communication convention
8. Keep the useful quirks

Let me also look at the `types.d.ts` file to understand the type system.

Let me also verify the `Icon/` path the README claims vs reality.

Actually, looking more carefully at the main process `index.ts`, the icon path is:
```ts
const pngPath = path.join(__dirname, '../../Icon/icon-256.png')
```

When built, `__dirname` would be `out/main/`, so `../../Icon/` resolves to the project root `Icon/` directory, which is correct. Same for `Icon/icon.ico`.

Now let me think about what to change:

The existing AGENTS.md is actually quite good. My main changes:

1. Add `package:portable` script
2. Add note about electron-builder output dir `dist-electron/`
3. Add note about no lint/typecheck/test scripts - agent should know build only
4. Add `Chat-application` has `npm run lint`
5. Mention the `ui-ux-pro-max-skill/` in excluded dirs
6. Clean up the formatting and make it more compact
7. Add the `dev-output.txt` ignore from gitignore

Actually, looking more carefully at the user's requirements, they want me to:
- Read highest-value sources first
- Extract high-signal facts
- Preserve verified useful guidance from existing file
- Delete fluff or stale claims
- Reconcile with current codebase
- Keep it compact

The existing AGENTS.md is already quite good. Let me make targeted improvements rather than a full rewrite.

Issues I see with current AGENTS.md:
1. It says "Shell: Windows PowerShell (5.1) — avoid &&, use ; if ($?) { ... } for chaining" - but actually the system already tells agents this via the env info
2. The "Communication in Banglish" line is important for the specific user but might be something the agent should know
3. Missing `package:portable` - actually it's in package.json
4. The .gitignore also excludes `Code-Editor/dar-studio/dev-output.txt`, `Code-Editor/dar-studio/resources/`, `Code-Editor/dar-studio/UIForge-Pro-Spec.md`, `Code-Editor/dar-studio/src/main/database.ts`, `Code-Editor/dar-studio/src/main/skill-bridge.ts`, `Code-Editor/ui-ux-pro-max-skill/` - these are UIForge relics that are not part of Dar Studio
5. No lint/typecheck/test commands exist for dar-studio
6. electron-builder output goes to `dist-electron/` not `dist/`

Let me now write the improved version. I'll keep the same structure but make it more accurate and add missing details.

Actually, I realize I should check one more thing - the `Chat-application` is listed as React + Vite SPA but let me quickly verify its existence and whether it's indeed working.

Actually, I've already verified Chat-application has a package.json with vite. That's fine.

Let me also look at what was in CLAUDE.md at the root.

The user mentioned `C:\Users\Mahadi\.claude\CLAUDE.md` which I can see from the env info. Let me check if there's anything there important.

Actually, let me finalize the updated AGENTS.md. Here's what I'll change:

1. Keep verified content
2. Add missing details about:
   - `npm run package:portable` command
   - electron-builder output dir `dist-electron/`
   - No lint/typecheck/test scripts in dar-studio (only `npm run build` for verification)
   - `.gitignore` excludes UIForge relics
   - Chat-application has `npm run lint` available
3. Remove the shell advice since the system prompt already covers this
4. Keep the Banglish convention since it's user-specific

Let me write the updated file.

Now let me check one more detail about the repo structure and the CLAUDE.md in user's home:

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\.claude\\CLAUDE.md"
}
```

**Output:**
```
<path>C:\Users\Mahadi\.claude\CLAUDE.md</path>
<type>file</type>
<content>
1: # graphify
2: - **graphify** (`~/.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
3: When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

(End of file - total 3 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*.env*",
  "path": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio"
}
```

**Output:**
```
No files found
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 7.5s)

_Thinking:_

Good. The `.claude/CLAUDE.md` is about the `graphify` skill, which is already captured in the available skills section of the system prompt. I don't need to duplicate that.

Now let me also verify the `Chat-application` has the `npm run lint` script - yes I already saw it in the package.json.

Let me also check if there's a lockfile for dar-studio and what it uses:

**Tool: bash**

**Input:**
```json
{
  "description": "Check lockfiles in dar-studio",
  "command": "Get-ChildItem -LiteralPath \"C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\" -Filter \"package-lock*\" -Name; Get-ChildItem -LiteralPath \"C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\" -Filter \"yarn.lock\" -Name; Get-ChildItem -LiteralPath \"C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\" -Filter \"pnpm-lock*\" -Name"
}
```

**Output:**
```
package-lock.json

```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\Code-Editor\\dar-studio\\src\\renderer\\types.d.ts"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\Code-Editor\dar-studio\src\renderer\types.d.ts</path>
<type>file</type>
<content>
1: export interface FileEntry {
2:   name: string
3:   path: string
4:   isDirectory: boolean
5:   isFile: boolean
6: }
7: 
8: export interface SearchResult {
9:   file: string
10:   line: number
11:   column: number
12:   text: string
13: }
14: 
15: export interface ShellInfo {
16:   name: string
17:   path: string
18:   icon: string
19: }
20: 
21: export interface TerminalAPI {
22:   create: (shell: string) => Promise<number>
23:   write: (id: number, data: string) => void
24:   resize: (id: number, cols: number, rows: number) => void
25:   kill: (id: number) => void
26:   onData: (callback: (id: number, data: string) => void) => () => void
27:   getShells: () => Promise<ShellInfo[]>
28: }
29: 
30: export interface ElectronAPI {
31:   minimize: () => void
32:   maximize: () => void
33:   close: () => void
34: 
35:   readDir: (dirPath: string) => Promise<FileEntry[]>
36:   readFile: (filePath: string) => Promise<string | null>
37:   writeFile: (filePath: string, content: string) => Promise<boolean>
38:   createFile: (filePath: string) => Promise<boolean>
39:   createDir: (dirPath: string) => Promise<boolean>
40:   delete: (targetPath: string) => Promise<boolean>
41:   rename: (oldPath: string, newPath: string) => Promise<boolean>
42:   exists: (targetPath: string) => Promise<boolean>
43: 
44:   openFile: () => Promise<string[]>
45:   openFolder: () => Promise<string[]>
46:   saveFile: (defaultPath?: string) => Promise<string | null>
47: 
48:   getLastPath: () => Promise<string | null>
49:   setLastPath: (dirPath: string) => Promise<void>
50: 
51:   searchInFiles: (p: { rootPath: string; query: string; caseSensitive?: boolean; maxResults?: number }) => Promise<SearchResult[]>
52: 
53:   terminal: TerminalAPI
54: }
55: 
56: declare global {
57:   interface Window {
58:     electron: ElectronAPI
59:   }
60: }

(End of file - total 60 lines)
</content>
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 25.3s)

_Thinking:_

Good. Now I have a comprehensive picture. Let me compile the updated AGENTS.md.

Key facts:
- npm lockfile: `package-lock.json` (not yarn/pnpm)
- Package manager: npm
- No lint/typecheck/test scripts in dar-studio; `npm run build` is the only verification
- Chat-application has `npm run lint` (uses eslint)
- Output directories: `out/` (electron-vite build), `dist-electron/` (electron-builder output)
- UIForge relics excluded from git: `Code-Editor/dar-studio/dev-output.txt`, `Code-Editor/dar-studio/resources/`, `Code-Editor/dar-studio/UIForge-Pro-Spec.md`, `Code-Editor/dar-studio/src/main/database.ts`, `Code-Editor/dar-studio/src/main/skill-bridge.ts`, `Code-Editor/ui-ux-pro-max-skill/`
- Types defined in `src/renderer/types.d.ts` inside `declare global { interface Window { electron: ElectronAPI } }`

Now let me write the improved AGENTS.md. I want to:
1. Keep verified facts
2. Add missing details
3. Remove fluff (shell advice is already in system prompt)
4. Be more compact

Let me draft:

```markdown
# AGENTS.md — Tools monorepo

Multi-project monorepo at `C:\Users\Mahadi\Desktop\Tools` with 9 independent projects. Primary focus is `Code-Editor/dar-studio/` (Electron + React + Monaco Editor desktop app).

## Dar Studio (`Code-Editor/dar-studio/`)

### Tech
- Electron 28 + electron-vite 2 + React 18 + Tailwind 3 + Monaco Editor 0.55 + Zustand
- npm (package-lock.json)
- Built with `electron-vite` (3 targets: main, preload, renderer) via `vite.config.ts`

### Commands
```
npm run dev              # Start Vite dev server + Electron (localhost:5173)
npm run build            # Build all 3 targets to out/
npm run package          # npm run build + electron-builder --win (NSIS installer + portable)
npm run package:portable # Same but portable only
```
No lint, typecheck, or test scripts exist — `npm run build` is the only verification step.

### Critical Quirks
- Dev mode: uses `ELECTRON_VITE_DEV || NODE_ENV === 'development'` — DevTools auto-opens
- `node-pty` loading: `eval('require')('node-pty')` in `shell-manager.ts` to bypass Rollup bundling of `.node` native modules
- Stale processes cause port conflicts: `Get-Process electron,node | Stop-Process -Force`
- `react-resizable-panels` v4 API: `Group` (not `PanelGroup`), `Separator` (not `PanelResizeHandle`), CSS attr `data-[resize-handle-active]`
- `npm run build` "use client" warnings are harmless
- Electron-builder output dir: `dist-electron/` (not `dist/`)

### Icon System
- Source icon: `Icon/Main icon.png` — generate all sizes from this using Python Pillow
- Main process icon: `Icon/icon-256.png` loaded via `nativeImage.createFromPath()` + `isEmpty()` + `setIcon()`, fallback to `Icon/icon.ico`
- electron-builder: `Icon/icon.ico` (multi-res 16→256)
- Renderer icons: `src/renderer/assets/icon-{16,32}.png` imported as ES modules
- Favicon set dynamically in `main.tsx`

### Architecture
- **Main process** (`src/main/`): `index.ts` (window), `window-controls.ts`, `file-system.ts`, `search-files.ts`, `shell-manager.ts`
- **Preload** (`src/preload/`): `index.ts` — contextBridge IPC (channels: `win:*`, `fs:*`, `dialog:*`, `search:inFiles`, `app:*`, `terminal:*`)
- **Renderer** (`src/renderer/`): React app, Zustand stores (`appStore.ts`, `settingsStore.ts`), types in `types.d.ts` (augments global `Window.electron`)
- **Layout**: `TitleBar` → `Group`(vertical) → `Panel`(editor 78%) + `Separator` + `Panel`(bottom 22%) → `StatusBar`
- **Panels**: ActivityBar, SidePanel (FileTree/Search/Settings), MainArea (EditorTabs + EditorModule), BottomPanel (Terminal/Output/Problems)

### Store Patterns
- `appStore.ts`: Zustand — `openTabs[]`, `activeTab`, `openFile()` adds tab + sets active, `updateTabContent()` on edit, `markTabClean()` on save
- `settingsStore.ts`: Zustand — individual setters (`setFontSize`, `setTabSize`, etc.), NOT generic `.set()`
- Panel collapse: `PanelRef` + `useEffect` syncs store `sidePanelOpen`/`bottomPanelOpen` with `collapse()`/`expand()`

### File Click Flow
1. `FileTreeNode.handleClick()` → `onFileSelect(path, name)`
2. `SidePanel.handleFileSelect()` → `readFile()` via IPC → if fail, `addOutputLog()`
3. `appStore.openFile()` → adds to `openTabs[]`, sets `activeTab`
4. Editor re-renders: `key={activeFile.path}` forces remount, `value={activeFile.content}`
5. Editor uses only `value` prop (controlled), NOT `defaultValue`

## Other Projects

| Project | Type | Run command |
|---------|------|-------------|
| `AI--Image--Generator/` | Flask web app | `python app.py` |
| `Image--Background--Remover/` | Flask web app | `python app.py` |
| `Net--Speed--Checker/` | Flask web app | `python server.py` |
| `Security--Privacy--Toolkit/` | Static HTML/CSS/JS | Open `index.html` |
| `Weather--Tool/` | Flask web app | `python server.py` |
| `Chat-application/` | React + Vite SPA | `npm run dev` (also `npm run lint`) |
| `tictactoe/` | Static HTML/CSS/JS | Open `tictactoe.html` |
| `Python-Bot-Agent/` | Desktop voice agent | `python main.py` |

All Python projects use `pip install -r requirements.txt`. Shared `.venv/` at root.

## Repo-wide
- `.gitignore` excludes: `node_modules/`, `out/`, `dist/`, `dist-electron/`, `.venv/`, `.env`, plus UIForge relics (`Code-Editor/dar-studio/resources/`, `Code-Editor/dar-studio/UIForge-Pro-Spec.md`, `Code-Editor/dar-studio/src/main/database.ts`, `Code-Editor/dar-studio/src/main/skill-bridge.ts`, `Code-Editor/ui-ux-pro-max-skill/`)
- AI features (HuggingFace, OpenRouter, OpenWeather) require `.env` files
- Communication in Banglish (Bengali written with English letters)
```

Hmm, this is quite long. Let me trim it more. The user asked for compact. Let me remove redundant info and extract only the highest-signal facts.

Actually, let me reconsider what the user wants. They said:
- "Every line should answer: 'Would an agent likely miss this without help?' If not, leave it out."
- "Prefer short sections and bullets"
- "If the repo is simple, keep the file simple"

The existing file is 74 lines. My draft is... also around that. Let me be more ruthless.

Things an agent would miss:
1. That this is a monorepo with 9 independent projects - needed to understand scope
2. Dar Studio is the main project with complex setup
3. The exact dev commands for Dar Studio (because they're not standard create-react-app)
4. The node-pty eval('require') trick (critical for builds)
5. The stale process kill command (important for workflow)
6. The react-resizable-panels v4 API differences (easy to guess wrong)
7. No lint/typecheck/test scripts exist
8. electron-builder outputs to dist-electron/ (not dist/)
9. Icon system paths (easy to get wrong)
10. The Banglish convention (user preference)
11. The shared .venv for Python projects
12. UIForge excluded dirs (prevents confusion about ghost files)

Things I can cut:
- Detailed Architecture section (pretty standard for Electron apps)
- Store Patterns - not super critical for agents
- File Click Flow - too detailed
- Repo-wide shell advice (already in system prompt)

Let me rewrite more aggressively.

Now I have a thorough picture. Let me write the updated file — keeping only the high-signal facts an agent would miss:

**Tool: write**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\AGENTS.md",
  "content": "# AGENTS.md — Tools monorepo\n\nMulti-project monorepo with 9 independent projects. Primary focus: `Code-Editor/dar-studio/`.\n\n## Dar Studio (`Code-Editor/dar-studio/`)\n\n### Tech & Setup\n- Electron 28 + electron-vite 2 + React 18 + Tailwind 3 + Monaco Editor 0.55 + Zustand\n- npm (package-lock.json) — `vite.config.ts` configures 3 targets (main, preload, renderer)\n\n### Commands\n```\nnpm run dev              # Vite dev server + Electron (localhost:5173)\nnpm run build            # Build all 3 targets to out/\nnpm run package          # Build + electron-builder --win (NSIS + portable)\nnpm run package:portable # Build + portable only\n```\nNo lint/typecheck/test scripts — build is the only verification.\n\n### Gotchas\n- Dev mode: `ELECTRON_VITE_DEV || NODE_ENV === 'development'` — DevTools auto-opens\n- `node-pty`: loaded via `eval('require')('node-pty')` in `shell-manager.ts` to bypass Rollup bundling of `.node` modules\n- Stale processes cause port 5173 conflicts: `Get-Process electron,node | Stop-Process -Force`\n- `react-resizable-panels` v4: `Group` (not `PanelGroup`), `Separator` (not `PanelResizeHandle`), CSS attr `data-[resize-handle-active]`\n- `npm run build` \"use client\" warnings are harmless\n- Electron-builder output dir: `dist-electron/` (not `dist/`)\n- `tsconfig.node.json` includes `electron/**/*.ts` (ghost pattern — actual main code is in `src/main/`)\n\n### Icon paths\n- Source: `Icon/Main icon.png` — generate all sizes from this via Python Pillow\n- Main process: `Icon/icon-256.png` (`nativeImage.createFromPath()` + `isEmpty()` + `setIcon()`, fallback `icon.ico`)\n- Builder: `Icon/icon.ico` (multi-res)\n- Renderer: `src/renderer/assets/icon-{16,32}.png` (ES module imports, handled by Vite)\n\n### Store quirks\n- `appStore.ts`: Zustand — `openFile()`, `updateTabContent()`, `markTabClean()`\n- `settingsStore.ts`: individual setters (`setFontSize`, etc.), NOT generic `.set()`\n- Panel collapse: `PanelRef` + `useEffect` syncs store booleans with `collapse()`/`expand()`\n\n## Other Projects\n\n| Project | Type | Run |\n|---------|------|-----|\n| `AI--Image--Generator/` | Flask | `python app.py` |\n| `Image--Background--Remover/` | Flask | `python app.py` |\n| `Net--Speed--Checker/` | Flask | `python server.py` |\n| `Weather--Tool/` | Flask | `python server.py` |\n| `Python-Bot-Agent/` | Desktop voice agent | `python main.py` |\n| `Chat-application/` | React + Vite SPA | `npm run dev` (also `lint`) |\n| `Security--Privacy--Toolkit/` | Static HTML | Open `index.html` |\n| `tictactoe/` | Static HTML | Open `tictactoe.html` |\n\nAll Python: `pip install -r requirements.txt`, shared `.venv/` at root.\nAI features (HuggingFace, OpenRouter, OpenWeather) need `.env`.\n\n### Excluded from git (UIForge relics, not Dar Studio)\n`Code-Editor/dar-studio/resources/`, `Code-Editor/dar-studio/UIForge-Pro-Spec.md`, `Code-Editor/dar-studio/src/main/database.ts`, `Code-Editor/dar-studio/src/main/skill-bridge.ts`, `Code-Editor/dar-studio/dev-output.txt`, `Code-Editor/ui-ux-pro-max-skill/`\n\n### Communication\nBanglish (Bengali written with English letters).\n"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 5.5s)

_Thinking:_

The write was successful. Let me verify it looks right by reading it back.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Users\\Mahadi\\Desktop\\Tools\\AGENTS.md"
}
```

**Output:**
```
<path>C:\Users\Mahadi\Desktop\Tools\AGENTS.md</path>
<type>file</type>
<content>
1: # AGENTS.md — Tools monorepo
2: 
3: Multi-project monorepo with 9 independent projects. Primary focus: `Code-Editor/dar-studio/`.
4: 
5: ## Dar Studio (`Code-Editor/dar-studio/`)
6: 
7: ### Tech & Setup
8: - Electron 28 + electron-vite 2 + React 18 + Tailwind 3 + Monaco Editor 0.55 + Zustand
9: - npm (package-lock.json) — `vite.config.ts` configures 3 targets (main, preload, renderer)
10: 
11: ### Commands
12: ```
13: npm run dev              # Vite dev server + Electron (localhost:5173)
14: npm run build            # Build all 3 targets to out/
15: npm run package          # Build + electron-builder --win (NSIS + portable)
16: npm run package:portable # Build + portable only
17: ```
18: No lint/typecheck/test scripts — build is the only verification.
19: 
20: ### Gotchas
21: - Dev mode: `ELECTRON_VITE_DEV || NODE_ENV === 'development'` — DevTools auto-opens
22: - `node-pty`: loaded via `eval('require')('node-pty')` in `shell-manager.ts` to bypass Rollup bundling of `.node` modules
23: - Stale processes cause port 5173 conflicts: `Get-Process electron,node | Stop-Process -Force`
24: - `react-resizable-panels` v4: `Group` (not `PanelGroup`), `Separator` (not `PanelResizeHandle`), CSS attr `data-[resize-handle-active]`
25: - `npm run build` "use client" warnings are harmless
26: - Electron-builder output dir: `dist-electron/` (not `dist/`)
27: - `tsconfig.node.json` includes `electron/**/*.ts` (ghost pattern — actual main code is in `src/main/`)
28: 
29: ### Icon paths
30: - Source: `Icon/Main icon.png` — generate all sizes from this via Python Pillow
31: - Main process: `Icon/icon-256.png` (`nativeImage.createFromPath()` + `isEmpty()` + `setIcon()`, fallback `icon.ico`)
32: - Builder: `Icon/icon.ico` (multi-res)
33: - Renderer: `src/renderer/assets/icon-{16,32}.png` (ES module imports, handled by Vite)
34: 
35: ### Store quirks
36: - `appStore.ts`: Zustand — `openFile()`, `updateTabContent()`, `markTabClean()`
37: - `settingsStore.ts`: individual setters (`setFontSize`, etc.), NOT generic `.set()`
38: - Panel collapse: `PanelRef` + `useEffect` syncs store booleans with `collapse()`/`expand()`
39: 
40: ## Other Projects
41: 
42: | Project | Type | Run |
43: |---------|------|-----|
44: | `AI--Image--Generator/` | Flask | `python app.py` |
45: | `Image--Background--Remover/` | Flask | `python app.py` |
46: | `Net--Speed--Checker/` | Flask | `python server.py` |
47: | `Weather--Tool/` | Flask | `python server.py` |
48: | `Python-Bot-Agent/` | Desktop voice agent | `python main.py` |
49: | `Chat-application/` | React + Vite SPA | `npm run dev` (also `lint`) |
50: | `Security--Privacy--Toolkit/` | Static HTML | Open `index.html` |
51: | `tictactoe/` | Static HTML | Open `tictactoe.html` |
52: 
53: All Python: `pip install -r requirements.txt`, shared `.venv/` at root.
54: AI features (HuggingFace, OpenRouter, OpenWeather) need `.env`.
55: 
56: ### Excluded from git (UIForge relics, not Dar Studio)
57: `Code-Editor/dar-studio/resources/`, `Code-Editor/dar-studio/UIForge-Pro-Spec.md`, `Code-Editor/dar-studio/src/main/database.ts`, `Code-Editor/dar-studio/src/main/skill-bridge.ts`, `Code-Editor/dar-studio/dev-output.txt`, `Code-Editor/ui-ux-pro-max-skill/`
58: 
59: ### Communication
60: Banglish (Bengali written with English letters).

(End of file - total 60 lines)
</content>
```

---

## Assistant (Build · DeepSeek V4 Flash Free · 7.6s)

_Thinking:_

The file looks good. Let me verify the changes I made from the original:

Preserved from original:
- Multi-project monorepo info
- Dar Studio tech stack
- npm commands (added `package:portable`)
- gotchas (dev mode, node-pty, stale processes, react-resizable-panels v4)
- Icon system
- Store patterns
- Other projects table
- Shared .venv
- Banglish communication
- AI features need .env

Removed:
- "Shell: Windows PowerShell (5.1) — avoid &&..." (already in system prompt)
- "React.StrictMode" detail (not high-signal)
- "favicon set dynamically in main.tsx via ES import" (merged into icon section)
- Architecture bullet list (redundant - filenames are self-explanatory)
- File Click Flow (too detailed)
- Detailed .gitignore list (condensed)

Added:
- `npm run package:portable` command
- No lint/typecheck/test scripts note
- Electron-builder output dir `dist-electron/`
- `tsconfig.node.json` ghost pattern
- UIForge relics excluded from git
- Chat-application has `npm run lint`

The file went from 74 lines to 60 lines while being more informative. Seems like a good improvement.

Updated `AGENTS.md` (74→60 lines). Key changes:

- **Added** `npm run package:portable`, note about no lint/typecheck/test scripts, electron-builder's `dist-electron/` output, `tsconfig.node.json` ghost pattern, and Chat-application's `npm run lint`
- **Added** UIForge excluded dirs to prevent confusion about ghost files
- **Removed** shell advice (already in system prompt), file-click flow (too detailed), and redundant architecture bullets (filenames are self-explanatory)
- **Condensed** icon section, unified repo-wide notes at the bottom

---

