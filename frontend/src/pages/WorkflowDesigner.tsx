import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  ConnectionMode,
} from 'react-flow'
import 'react-flow/dist/style.css'

import { useWorkflowStore } from '@/stores/workflowStore'
import WorkflowToolbar from '@/components/workflow/WorkflowToolbar'
import NodePalette from '@/components/workflow/NodePalette'
import PropertyPanel from '@/components/workflow/PropertyPanel'
import ExecutionPanel from '@/components/workflow/ExecutionPanel'

// Custom node types will be imported here
const nodeTypes = {
  // input: InputNode,
  // output: OutputNode,
  // process: ProcessNode,
  // condition: ConditionNode,
  // ai: AINode,
}

const WorkflowDesigner = () => {
  const { id } = useParams<{ id: string }>()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { fitView } = useReactFlow()
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addEdge,
    selectedNodes,
    selectedEdges,
    setSelectedNodes,
    setSelectedEdges,
    loadWorkflow,
    createNewWorkflow,
  } = useWorkflowStore()

  const [isPaletteOpen, setIsPaletteOpen] = useState(true)
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true)
  const [isExecutionOpen, setIsExecutionOpen] = useState(false)

  // Load workflow on mount if ID is provided
  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id)
    } else {
      createNewWorkflow()
    }
  }, [id, loadWorkflow, createNewWorkflow])

  const onConnect = useCallback(
    (connection: any) => addEdge(connection),
    [addEdge]
  )

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: any) => {
      setSelectedNodes(selectedNodes?.map((node: any) => node.id) || [])
      setSelectedEdges(selectedEdges?.map((edge: any) => edge.id) || [])
    },
    [setSelectedNodes, setSelectedEdges]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNodes([])
    setSelectedEdges([])
  }, [setSelectedNodes, setSelectedEdges])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <WorkflowToolbar
        onTogglePalette={() => setIsPaletteOpen(!isPaletteOpen)}
        onToggleProperties={() => setIsPropertiesOpen(!isPropertiesOpen)}
        onToggleExecution={() => setIsExecutionOpen(!isExecutionOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Node Palette */}
        {isPaletteOpen && (
          <div className="w-64 border-r bg-card/50 backdrop-blur-sm">
            <NodePalette />
          </div>
        )}

        {/* Workflow Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { strokeWidth: 2 },
            }}
            className="workflow-canvas"
            fitView
            attributionPosition="bottom-left"
          >
            <Background 
              gap={20} 
              size={1} 
              className="bg-flow-background"
            />
            <Controls className="bg-card/80 backdrop-blur-sm" />
            <MiniMap 
              className="bg-card/80 backdrop-blur-sm"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'input': return '#4ECDC4'
                  case 'output': return '#45B7D1'
                  case 'process': return '#96CEB4'
                  case 'condition': return '#FFEAA7'
                  case 'ai': return '#FF6B6B'
                  default: return '#64748b'
                }
              }}
            />

            {/* Workflow Status Panel */}
            <Panel position="top-right">
              <div className="bg-card/90 backdrop-blur-sm border rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Ready</span>
                </div>
              </div>
            </Panel>

            {/* Node Count Panel */}
            <Panel position="bottom-right">
              <div className="bg-card/90 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-sm text-sm text-muted-foreground">
                {nodes.length} nodes, {edges.length} connections
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Property Panel */}
        {isPropertiesOpen && (
          <div className="w-80 border-l bg-card/50 backdrop-blur-sm">
            <PropertyPanel
              selectedNodes={selectedNodes}
              selectedEdges={selectedEdges}
            />
          </div>
        )}
      </div>

      {/* Execution Panel (Bottom) */}
      {isExecutionOpen && (
        <div className="h-64 border-t bg-card/50 backdrop-blur-sm">
          <ExecutionPanel />
        </div>
      )}
    </div>
  )
}

// Wrap with ReactFlow provider
const WorkflowDesignerPage = () => (
  <ReactFlow>
    <WorkflowDesigner />
  </ReactFlow>
)

export default WorkflowDesignerPage