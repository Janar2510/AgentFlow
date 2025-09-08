import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Node, Edge, Connection } from 'react-flow'
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'react-flow'
import type { NodeChange, EdgeChange } from 'react-flow'

export interface WorkflowState {
  // Workflow metadata
  id: string | null
  name: string
  description: string
  isModified: boolean
  lastSaved: Date | null
  
  // Flow state
  nodes: Node[]
  edges: Edge[]
  
  // UI state
  selectedNodes: string[]
  selectedEdges: string[]
  isExecuting: boolean
  executionStatus: 'idle' | 'running' | 'success' | 'error'
  
  // Actions
  setWorkflow: (workflow: { id: string; name: string; description: string; nodes: Node[]; edges: Edge[] }) => void
  updateWorkflowMeta: (meta: { name?: string; description?: string }) => void
  
  // Node actions
  addNode: (node: Node) => void
  updateNode: (id: string, updates: Partial<Node>) => void
  deleteNode: (id: string) => void
  onNodesChange: (changes: NodeChange[]) => void
  
  // Edge actions
  addEdge: (connection: Connection) => void
  deleteEdge: (id: string) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  
  // Selection actions
  setSelectedNodes: (nodeIds: string[]) => void
  setSelectedEdges: (edgeIds: string[]) => void
  clearSelection: () => void
  
  // Execution actions
  executeWorkflow: () => Promise<void>
  stopExecution: () => void
  
  // Save/load actions
  saveWorkflow: () => Promise<void>
  loadWorkflow: (id: string) => Promise<void>
  createNewWorkflow: () => void
  
  // Utility actions
  reset: () => void
  markAsModified: () => void
}

const initialState = {
  id: null,
  name: 'Untitled Workflow',
  description: '',
  isModified: false,
  lastSaved: null,
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  isExecuting: false,
  executionStatus: 'idle' as const,
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setWorkflow: (workflow) => {
        set({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          nodes: workflow.nodes,
          edges: workflow.edges,
          isModified: false,
          lastSaved: new Date(),
        })
      },

      updateWorkflowMeta: (meta) => {
        set((state) => ({
          ...meta,
          isModified: true,
        }))
      },

      addNode: (node) => {
        set((state) => ({
          nodes: [...state.nodes, node],
          isModified: true,
        }))
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, ...updates } : node
          ),
          isModified: true,
        }))
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
          selectedNodes: state.selectedNodes.filter((nodeId) => nodeId !== id),
          isModified: true,
        }))
      },

      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
          isModified: changes.some(change => change.type !== 'position' && change.type !== 'dimensions'),
        }))
      },

      addEdge: (connection) => {
        set((state) => ({
          edges: addEdge(connection, state.edges),
          isModified: true,
        }))
      },

      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== id),
          selectedEdges: state.selectedEdges.filter((edgeId) => edgeId !== id),
          isModified: true,
        }))
      },

      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
          isModified: true,
        }))
      },

      setSelectedNodes: (nodeIds) => {
        set({ selectedNodes: nodeIds })
      },

      setSelectedEdges: (edgeIds) => {
        set({ selectedEdges: edgeIds })
      },

      clearSelection: () => {
        set({ selectedNodes: [], selectedEdges: [] })
      },

      executeWorkflow: async () => {
        const { nodes, edges, id } = get()
        
        if (!nodes.length) {
          throw new Error('Cannot execute empty workflow')
        }

        set({ isExecuting: true, executionStatus: 'running' })

        try {
          // TODO: Implement workflow execution API call
          const response = await fetch('/api/workflows/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workflowId: id, nodes, edges }),
          })

          if (!response.ok) {
            throw new Error('Failed to execute workflow')
          }

          const result = await response.json()
          set({ executionStatus: 'success', isExecuting: false })
          
          return result
        } catch (error) {
          set({ executionStatus: 'error', isExecuting: false })
          throw error
        }
      },

      stopExecution: () => {
        set({ isExecuting: false, executionStatus: 'idle' })
        // TODO: Implement stop execution API call
      },

      saveWorkflow: async () => {
        const { id, name, description, nodes, edges } = get()
        
        try {
          const response = await fetch('/api/workflows' + (id ? `/${id}` : ''), {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, nodes, edges }),
          })

          if (!response.ok) {
            throw new Error('Failed to save workflow')
          }

          const savedWorkflow = await response.json()
          
          set({
            id: savedWorkflow.id,
            isModified: false,
            lastSaved: new Date(),
          })
        } catch (error) {
          throw error
        }
      },

      loadWorkflow: async (workflowId) => {
        try {
          const response = await fetch(`/api/workflows/${workflowId}`)
          
          if (!response.ok) {
            throw new Error('Failed to load workflow')
          }

          const workflow = await response.json()
          get().setWorkflow(workflow)
        } catch (error) {
          throw error
        }
      },

      createNewWorkflow: () => {
        set(initialState)
      },

      reset: () => {
        set(initialState)
      },

      markAsModified: () => {
        set({ isModified: true })
      },
    }),
    {
      name: 'workflow-store',
    }
  )
)