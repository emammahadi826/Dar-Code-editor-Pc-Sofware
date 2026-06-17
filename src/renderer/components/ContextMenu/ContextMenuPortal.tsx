import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  separator?: boolean
  disabled?: boolean
  danger?: boolean
  onClick?: () => void
}

interface Props {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

const MENU_STYLE: React.CSSProperties = {
  position: 'fixed',
  zIndex: 9999,
  minWidth: '200px',
  maxWidth: '300px',
}

export function ContextMenuPortal({ visible, x, y, items, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [adjustedX, setAdjustedX] = React.useState(x)
  const [adjustedY, setAdjustedY] = React.useState(y)

  useEffect(() => {
    if (!visible) return
    setAdjustedX(x)
    setAdjustedY(y)
    requestAnimationFrame(() => {
      if (menuRef.current) {
        const rect = menuRef.current.getBoundingClientRect()
        if (rect.right > window.innerWidth) setAdjustedX((prev) => prev - rect.width)
        if (rect.bottom > window.innerHeight) setAdjustedY((prev) => prev - rect.height)
      }
    })
  }, [visible, x, y])

  useEffect(() => {
    if (!visible) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, onClose])

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.disabled) return
    item.onClick?.()
    onClose()
  }, [onClose])

  if (!visible) return null

  return createPortal(
    <div
      ref={menuRef}
      style={{ ...MENU_STYLE, left: adjustedX, top: adjustedY }}
      className="bg-[#252526] border border-[#3c3c3c] rounded shadow-2xl py-1 select-none"
      role="menu"
    >
      {items.map((item, idx) => {
        if (item.label === '---') {
          return <div key={idx} className="h-px bg-[#454545] mx-2 my-1" />
        }
        return (
          <button
            key={idx}
            disabled={item.disabled}
            onClick={() => handleItemClick(item)}
            className={`
              w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 outline-none
              ${item.disabled ? 'opacity-40 cursor-default' : 'cursor-pointer'}
              ${item.danger ? 'text-red-400 hover:bg-red-500/20 hover:text-red-300' : 'text-[#cccccc] hover:bg-[#37373d] hover:text-white'}
              transition-colors
            `}
            role="menuitem"
          >
            {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
            {!item.icon && <span className="w-4 shrink-0" />}
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-[#777777] ml-4 shrink-0">{item.shortcut}</span>
            )}
          </button>
        )
      })}
    </div>,
    document.body
  )
}
