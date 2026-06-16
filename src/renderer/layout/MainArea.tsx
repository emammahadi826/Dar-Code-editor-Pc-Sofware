import React from 'react'
import { EditorTabs } from '../components/EditorTabs/EditorTabs'
import { EditorModule } from '../modules/Editor'

export function MainArea() {
  return (
    <div className="flex-1 flex flex-col bg-editor-bg overflow-hidden">
      <EditorTabs />
      <div className="flex-1 overflow-hidden">
        <EditorModule />
      </div>
    </div>
  )
}
