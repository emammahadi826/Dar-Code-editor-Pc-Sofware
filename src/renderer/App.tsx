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

  const handleSideResize = useCallback((panelSize: PanelSize, _id: string | number | undefined, prevPanelSize: PanelSize | undefined) => {
    if (!prevPanelSize) return
    useAppStore.setState({ sidePanelOpen: panelSize.asPercentage >= 1 })
  }, [])

  const handleBottomResize = useCallback((panelSize: PanelSize, _id: string | number | undefined, prevPanelSize: PanelSize | undefined) => {
    if (!prevPanelSize) return
    useAppStore.setState({ bottomPanelOpen: panelSize.asPercentage >= 1 })
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
                defaultSize={300}
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
