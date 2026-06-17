import React, { useCallback, useRef } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { PanelSize } from 'react-resizable-panels'
import { useTerminalStore, SplitNode, SplitGroup, SplitLeaf } from '../../store/terminalStore'
import { TerminalView, TerminalViewHandle } from './TerminalView'

export function TerminalSplit() {
  const rootNodes = useTerminalStore((s) => s.rootNodes)
  const activeTerminalId = useTerminalStore((s) => s.activeTerminalId)
  const instances = useTerminalStore((s) => s.instances)
  const setActiveTerminal = useTerminalStore((s) => s.setActiveTerminal)
  const viewRefs = useRef<Map<number, React.RefObject<TerminalViewHandle | null>>>(new Map())

  const getOrCreateRef = useCallback((terminalId: number) => {
    if (!viewRefs.current.has(terminalId)) {
      viewRefs.current.set(terminalId, React.createRef<TerminalViewHandle>())
    }
    return viewRefs.current.get(terminalId)!
  }, [])

  const handleLeafReady = useCallback((terminalId: number) => {
    setActiveTerminal(terminalId)
  }, [setActiveTerminal])

  // split layout exists — render it
  if (rootNodes.length > 1 || (rootNodes.length === 1 && rootNodes[0].type === 'split')) {
    return <SplitGroupRenderer node={{ type: 'split', id: 'root', direction: 'horizontal', children: rootNodes as SplitNode[], sizes: rootNodes.map(() => 100 / rootNodes.length) }} />
  }

  // single leaf in rootNodes — check if it matches active, else fall through
  if (rootNodes.length === 1 && rootNodes[0].type === 'leaf') {
    const leaf = rootNodes[0] as SplitLeaf
    if (leaf.terminalId === activeTerminalId) {
      return (
        <div className="flex-1 flex bg-[#1e1e1e] min-h-0">
          <TerminalView
            key={leaf.terminalId}
            ref={getOrCreateRef(leaf.terminalId)}
            terminalId={leaf.terminalId}
            onReady={handleLeafReady}
          />
        </div>
      )
    }
  }

  // fallback: show active terminal from instances (tab switching / multi-terminal)
  if (instances.length > 0 && activeTerminalId) {
    const activeInst = instances.find((i) => i.id === activeTerminalId)
    if (activeInst) {
      return (
        <div className="flex-1 flex bg-[#1e1e1e] min-h-0">
          <TerminalView
            key={activeInst.id}
            ref={getOrCreateRef(activeInst.id)}
            terminalId={activeInst.id}
            onReady={handleLeafReady}
          />
        </div>
      )
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-editor-text opacity-30 text-sm">
      no terminal — press + to create one
    </div>
  )
}

function SplitGroupRenderer({ node }: { node: SplitGroup }) {
  const setSplitSizes = useTerminalStore((s) => s.setSplitSizes)

  const handleResize = useCallback((panelSize: PanelSize, _id: string | number | undefined) => {
    // store sizes for persistence
  }, [])

  return (
    <Group orientation={node.direction === 'horizontal' ? 'horizontal' : 'vertical'} className="flex-1 min-h-0">
      {node.children.map((child, index) => (
        <React.Fragment key={child.type === 'leaf' ? `term-${child.terminalId}` : `split-${(child as SplitGroup).id}`}>
          <Panel
            defaultSize={node.sizes[index] ?? (100 / node.children.length)}
            minSize={10}
            className="min-h-0 min-w-0"
          >
            {child.type === 'leaf' ? (
              <TerminalLeafRenderer leaf={child} />
            ) : (
              <SplitGroupRenderer node={child} />
            )}
          </Panel>
          {index < node.children.length - 1 && (
            <Separator
              className={`shrink-0 ${
                node.direction === 'horizontal'
                  ? 'w-[3px] cursor-col-resize'
                  : 'h-[3px] cursor-row-resize'
              } bg-[#3c3c3c] hover:bg-[#0078d4] transition-colors data-[resize-handle-active]:bg-[#0078d4]`}
            />
          )}
        </React.Fragment>
      ))}
    </Group>
  )
}

function TerminalLeafRenderer({ leaf }: { leaf: SplitLeaf }) {
  const setActiveTerminal = useTerminalStore((s) => s.setActiveTerminal)
  const getInstanceById = useTerminalStore((s) => s.getInstanceById)
  const ref = useRef<TerminalViewHandle>(null)

  const handleReady = useCallback((id: number) => {
    setActiveTerminal(id)
  }, [setActiveTerminal])

  const inst = getInstanceById(leaf.terminalId)

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {inst && (
        <div className="flex items-center gap-2 px-3 py-0.5 bg-[#2d2d2d] border-b border-[#3c3c3c] shrink-0 text-[11px] text-editor-text opacity-50">
          <span>{inst.shellIcon === 'powershell' || inst.shellIcon === 'pwsh' ? 'PS' : inst.shellIcon === 'cmd' ? 'CMD' : '$'}</span>
          <span>{inst.name}</span>
          <span className="ml-auto">{inst.cwd}</span>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <TerminalView
          ref={ref}
          terminalId={leaf.terminalId}
          onReady={handleReady}
        />
      </div>
    </div>
  )
}
