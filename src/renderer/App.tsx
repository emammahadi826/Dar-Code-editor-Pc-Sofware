import React from 'react'
import { TitleBar } from './layout/TitleBar'
import { ActivityBar } from './layout/ActivityBar'
import { SidePanel } from './layout/SidePanel'
import { MainArea } from './layout/MainArea'
import { RightPanel } from './layout/RightPanel'
import { BottomPanel } from './layout/BottomPanel'
import { StatusBar } from './layout/StatusBar'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-base">
      <TitleBar />
      <div className="flex-1 flex overflow-hidden">
        <ActivityBar />
        <SidePanel />
        <MainArea />
        <RightPanel />
      </div>
      <BottomPanel />
      <StatusBar />
    </div>
  )
}
