import React from 'react'
import { EditorTabs } from '../components/EditorTabs/EditorTabs'
import { EditorModule } from '../modules/Editor'

export function MainArea() {
  return (
    <div className="flex-1 flex flex-col bg-editor-bg overflow-hidden min-h-0">
      <EditorTabs />
      <div className="flex-1 overflow-hidden min-h-0">
        <EditorModule />
      </div>
    </div>
  )
}
