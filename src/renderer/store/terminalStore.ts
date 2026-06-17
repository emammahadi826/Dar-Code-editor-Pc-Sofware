import { create } from 'zustand'

export type SplitDirection = 'horizontal' | 'vertical'

export interface TerminalInstanceData {
  id: number
  name: string
  shellPath: string
  shellName: string
  shellIcon: string
  cwd: string
  createdAt: number
}

export interface SplitLeaf {
  type: 'leaf'
  terminalId: number
}

export interface SplitGroup {
  type: 'split'
  id: string
  direction: SplitDirection
  children: (SplitLeaf | SplitGroup)[]
  sizes: number[]
}

export type SplitNode = SplitLeaf | SplitGroup

let splitIdCounter = 0
function genSplitId() {
  return `split-${++splitIdCounter}`
}

interface TerminalState {
  instances: TerminalInstanceData[]
  activeTerminalId: number | null
  rootNodes: SplitNode[]
  shellPickerOpen: boolean

  addInstance: (inst: TerminalInstanceData) => void
  removeInstance: (id: number) => void
  renameInstance: (id: number, name: string) => void
  setActiveTerminal: (id: number) => void
  setShellPickerOpen: (open: boolean) => void

  splitTerminal: (terminalId: number, direction: SplitDirection) => void
  closeSplit: (nodeId: string) => void
  closeTerminal: (terminalId: number) => void
  setSplitSizes: (nodeId: string, sizes: number[]) => void

  getInstanceById: (id: number) => TerminalInstanceData | undefined
}

function findParent(
  nodes: SplitNode[],
  targetId: string | number,
  type: 'split' | 'leaf'
): { parent: SplitGroup; index: number } | null {
  for (const node of nodes) {
    if (node.type === 'split') {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        if (type === 'split' && child.type === 'split' && child.id === targetId) {
          return { parent: node, index: i }
        }
        if (type === 'leaf' && child.type === 'leaf' && child.terminalId === targetId) {
          return { parent: node, index: i }
        }
      }
      for (const child of node.children) {
        if (child.type === 'split') {
          const found = findParent([child], targetId, type)
          if (found) return found
        }
      }
    }
  }
  return null
}

function findNodeById(nodes: SplitNode[], id: string | number): SplitNode | null {
  for (const node of nodes) {
    if (node.type === 'split' && node.id === id) return node
    if (node.type === 'leaf' && node.terminalId === id) return node
    if (node.type === 'split') {
      for (const child of node.children) {
        const found = findNodeById([child], id)
        if (found) return found
      }
    }
  }
  return null
}

function buildLeaf(terminalId: number): SplitLeaf {
  return { type: 'leaf', terminalId }
}

function collectTerminalIds(nodes: SplitNode[]): number[] {
  const ids: number[] = []
  for (const node of nodes) {
    if (node.type === 'leaf') ids.push(node.terminalId)
    if (node.type === 'split') ids.push(...collectTerminalIds(node.children))
  }
  return ids
}

function removeTerminalFromTree(nodes: SplitNode[], terminalId: number): SplitNode[] {
  const result: SplitNode[] = []
  for (const node of nodes) {
    if (node.type === 'leaf') {
      if (node.terminalId !== terminalId) result.push(node)
    } else {
      const filtered = removeTerminalFromTree(node.children, terminalId)
      if (filtered.length === 0) continue
      if (filtered.length === 1) {
        result.push(filtered[0])
      } else {
        result.push({ ...node, children: filtered, sizes: node.sizes.slice(0, filtered.length) })
      }
    }
  }
  return result
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  instances: [],
  activeTerminalId: null,
  rootNodes: [],
  shellPickerOpen: false,

  addInstance: (inst) =>
    set((s) => {
      const exists = s.instances.find((i) => i.id === inst.id)
      if (exists) return s
      const newInstances = [...s.instances, inst]
      const newRoots = s.rootNodes.length === 0 ? [buildLeaf(inst.id)] : s.rootNodes
      return {
        instances: newInstances,
        rootNodes: newRoots,
        activeTerminalId: inst.id,
      }
    }),

  removeInstance: (id) =>
    set((s) => {
      const newInstances = s.instances.filter((i) => i.id !== id)
      const newRoots = removeTerminalFromTree(s.rootNodes, id)
      const activeId = s.activeTerminalId === id
        ? collectTerminalIds(newRoots)[0] ?? null
        : s.activeTerminalId
      return { instances: newInstances, rootNodes: newRoots, activeTerminalId: activeId }
    }),

  renameInstance: (id, name) =>
    set((s) => ({
      instances: s.instances.map((i) => (i.id === id ? { ...i, name } : i)),
    })),

  setActiveTerminal: (id) => set({ activeTerminalId: id }),

  setShellPickerOpen: (open) => set({ shellPickerOpen: open }),

  splitTerminal: (terminalId, direction) =>
    set((s) => {
      const node = findNodeById(s.rootNodes, terminalId)
      if (!node || node.type !== 'leaf') return s

      const parent = findParent(s.rootNodes, terminalId, 'leaf')
      const newTerminalId = -1

      const newLeaf: SplitLeaf = { type: 'leaf', terminalId: newTerminalId }

      const newGroup: SplitGroup = {
        type: 'split',
        id: genSplitId(),
        direction,
        children: [node as SplitLeaf, newLeaf],
        sizes: [50, 50],
      }

      if (!parent) {
        const newRoots = s.rootNodes.map((n) =>
          n === node ? newGroup : n
        )
        return { rootNodes: newRoots }
      }

      const replaceNode = (nodes: SplitNode[]): SplitNode[] =>
        nodes.map((n) => {
          if (n === node) return newGroup
          if (n.type === 'split') {
            return { ...n, children: replaceNode(n.children) }
          }
          return n
        })

      return { rootNodes: replaceNode(s.rootNodes) }
    }),

  closeSplit: (nodeId) =>
    set((s) => {
      const parent = findParent(s.rootNodes, nodeId, 'split')
      if (!parent) {
        const remaining = s.rootNodes.filter((n) => !(n.type === 'split' && n.id === nodeId))
        return { rootNodes: remaining.length > 0 ? remaining : s.rootNodes }
      }
      const idx = parent.parent.children.findIndex(
        (c) => c.type === 'split' && c.id === nodeId
      )
      if (idx === -1) return s
      const removedChildren = (parent.parent.children[idx] as SplitGroup).children
      const newChildren = [
        ...parent.parent.children.slice(0, idx),
        ...removedChildren,
        ...parent.parent.children.slice(idx + 1),
      ]
      const newParent: SplitGroup = {
        ...parent.parent,
        children: newChildren,
        sizes: parent.parent.sizes
          .slice(0, idx)
          .concat(removedChildren.map(() => 100 / newChildren.length))
          .concat(parent.parent.sizes.slice(idx + 1)),
      }
      const replaceInTree = (nodes: SplitNode[]): SplitNode[] =>
        nodes.map((n) => {
          if (n.type === 'split' && n.id === parent.parent.id) return newParent
          if (n.type === 'split') return { ...n, children: replaceInTree(n.children) }
          return n
        })
      return { rootNodes: replaceInTree(s.rootNodes) }
    }),

  closeTerminal: (terminalId) =>
    set((s) => {
      const newInstances = s.instances.filter((i) => i.id !== terminalId)
      const newRoots = removeTerminalFromTree(s.rootNodes, terminalId)
      const activeId = s.activeTerminalId === terminalId
        ? collectTerminalIds(newRoots)[0] ?? null
        : s.activeTerminalId
      return { instances: newInstances, rootNodes: newRoots, activeTerminalId: activeId }
    }),

  setSplitSizes: (nodeId, sizes) =>
    set((s) => {
      const updateSizes = (nodes: SplitNode[]): SplitNode[] =>
        nodes.map((n) => {
          if (n.type === 'split' && n.id === nodeId) {
            return { ...n, sizes }
          }
          if (n.type === 'split') {
            return { ...n, children: updateSizes(n.children) }
          }
          return n
        })
      return { rootNodes: updateSizes(s.rootNodes) }
    }),

  getInstanceById: (id) => get().instances.find((i) => i.id === id),
}))
