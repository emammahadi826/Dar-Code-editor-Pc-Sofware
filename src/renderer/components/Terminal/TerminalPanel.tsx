import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export function TerminalPanel() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>(['Welcome to Code Editor Terminal', 'Type commands here...'])
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || !input.trim()) return
    setHistory((h) => [...h, `> ${input}`, `Unknown command: ${input}`])
    setInput('')
  }

  return (
    <div
      className="h-full flex flex-col bg-black text-green-400 font-mono text-xs p-2"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-1">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap ${line.startsWith('> ') ? 'text-green-300' : ''}`}>
            {line}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-green-300">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleSubmit}
          className="flex-1 bg-transparent text-green-400 outline-none border-none"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
