import React, { useCallback, useEffect, useRef } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { PanelImperativeHandle, PanelSize } from 'react-resizable-panels'
import { TitleBar } from './layout/TitleBar'
import { ActivityBar } from './layout/ActivityBar'
import { SidePanel } from './layout/SidePanel'
import { MainArea } from './layout/MainArea'
import { BottomPanel } from './layout/BottomPanel'
import { StatusBar } from './layout/StatusBar'
import { useAppStore } from './store/appStore'

export default function App() {
  const sidePanelOpen = useAppStore((s) => s.sidePanelOpen)
  const bottomPanelOpen = useAppStore((s) => s.bottomPanelOpen)
  const sidebarRef = useRef<PanelImperativeHandle>(null)
  const bottomRef = useRef<PanelImperativeHandle>(null)
  const sideRAFRef = useRef<number | null>(null)
  const bottomRAFRef = useRef<number | null>(null)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      applyPersistedSizes()
    } else {
      const unsub = useAppStore.persist.onFinishHydration(applyPersistedSizes)
      return unsub
    }
  }, [])

  function applyPersistedSizes() {
    if (hydratedRef.current) return
    hydratedRef.current = true
    const { sidebarWidth, bottomPanelSize, sidePanelOpen, bottomPanelOpen } = useAppStore.getState()
    requestAnimationFrame(() => {
      if (sidebarWidth && sidebarRef.current) {
        const pct = Math.max(9, Math.min(60, sidebarWidth / (window.innerWidth - 56) * 100))
        sidebarRef.current.resize(pct)
      }
      if (bottomPanelSize && bottomRef.current) {
        const pct = Math.max(5, Math.min(60, bottomPanelSize / (window.innerHeight - 44 - 24) * 100))
        bottomRef.current.resize(pct)
      }
      if (sidePanelOpen) sidebarRef.current?.expand()
      else sidebarRef.current?.collapse()
      if (bottomPanelOpen) bottomRef.current?.expand()
      else bottomRef.current?.collapse()
    })
  }

  const handleSideResize = useCallback((panelSize: PanelSize, _id: string | number | undefined, prevPanelSize: PanelSize | undefined) => {
    if (!prevPanelSize) return
    if (sideRAFRef.current != null) cancelAnimationFrame(sideRAFRef.current)
    sideRAFRef.current = requestAnimationFrame(() => {
      sideRAFRef.current = null
      const w = Math.round(panelSize.inPixels)
      if (w !== useAppStore.getState().sidebarWidth) {
        useAppStore.setState({ sidebarWidth: w })
      }
    })
  }, [])

  const handleBottomResize = useCallback((panelSize: PanelSize, _id: string | number | undefined, prevPanelSize: PanelSize | undefined) => {
    if (!prevPanelSize) return
    if (bottomRAFRef.current != null) cancelAnimationFrame(bottomRAFRef.current)
    bottomRAFRef.current = requestAnimationFrame(() => {
      bottomRAFRef.current = null
      const h = Math.round(panelSize.inPixels)
      if (h !== useAppStore.getState().bottomPanelSize) {
        useAppStore.setState({ bottomPanelSize: h })
      }
    })
  }, [])

  useEffect(() => {
    if (!sidebarRef.current) return
    if (sidePanelOpen) sidebarRef.current.expand()
    else sidebarRef.current.collapse()
  }, [sidePanelOpen])

  useEffect(() => {
    if (!bottomRef.current) return
    if (bottomPanelOpen) bottomRef.current.expand()
    else bottomRef.current.collapse()
  }, [bottomPanelOpen])

  useEffect(() => {
    const tabs = useAppStore.getState().openTabs
    for (const tab of tabs) {
      if (!tab.content && tab.path && window.electron) {
        window.electron.readFile(tab.path).then(content => {
          if (content !== null) {
            useAppStore.getState().restoreTabContent(tab.path, content)
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        const store = useAppStore.getState()
        if (store.activeModule !== 'Search') {
          store.setActiveModule('Search')
          if (!store.sidePanelOpen) store.toggleSidePanel()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-base">
      <TitleBar />
      <Group orientation="vertical" className="flex-1 min-h-0">
        <Panel defaultSize={78} minSize={20} className="min-h-0">
          <div className="h-full flex min-h-0 overflow-hidden">
            <ActivityBar />
            <Group orientation="horizontal" className="flex-1 min-h-0">
              <Panel
                panelRef={sidebarRef}
                id="sidebar"
                defaultSize={22}
                minSize={180}
                maxSize={600}
                collapsedSize={0}
                collapsible
                groupResizeBehavior="preserve-pixel-size"
                onResize={handleSideResize}
              >
                <SidePanel />
              </Panel>
              <Separator className="w-[3px] hover:bg-accent-blue transition-colors data-[resize-handle-active]:bg-accent-blue shrink-0" />
              <Panel id="editor" defaultSize={78} minSize={20}>
                <MainArea />
              </Panel>
            </Group>
          </div>
        </Panel>
        <Separator className="h-[3px] hover:bg-accent-blue transition-colors data-[resize-handle-active]:bg-accent-blue shrink-0" />
        <Panel
          panelRef={bottomRef}
          id="bottom"
          defaultSize={22}
          minSize={5}
          collapsedSize={0}
          collapsible
          onResize={handleBottomResize}
        >
          <BottomPanel />
        </Panel>
      </Group>
      <StatusBar />
    </div>
  )
}
