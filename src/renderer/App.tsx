import React from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { TitleBar } from './layout/TitleBar'
import { ActivityBar } from './layout/ActivityBar'
import { SidePanel } from './layout/SidePanel'
import { MainArea } from './layout/MainArea'
import { BottomPanel } from './layout/BottomPanel'
import { StatusBar } from './layout/StatusBar'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-base">
      <TitleBar />
      <Group direction="vertical" className="flex-1">
        <Panel defaultSize={78} minSize={30}>
          <Group direction="horizontal" className="h-full">
            <ActivityBar />
            <Panel id="sidebar" defaultSize={22} minSize={8} collapsible>
              <SidePanel />
            </Panel>
            <Separator className="w-[3px] hover:bg-accent-blue transition-colors data-[separator=active]:bg-accent-blue" />
            <Panel id="editor" defaultSize={78} minSize={20}>
              <MainArea />
            </Panel>
          </Group>
        </Panel>
        <Separator className="h-[3px] hover:bg-accent-blue transition-colors data-[separator=active]:bg-accent-blue" />
        <Panel id="bottom" defaultSize={22} minSize={5} collapsible>
          <BottomPanel />
        </Panel>
      </Group>
      <StatusBar />
    </div>
  )
}
