import { Plus, Download, Upload, Bot } from 'lucide-react'

const NodePalette = () => {
  const nodeCategories = [
    {
      name: 'Input/Output',
      nodes: [
        { type: 'input', label: 'Input', icon: '📥', description: 'Workflow input data' },
        { type: 'output', label: 'Output', icon: '📤', description: 'Workflow output data' },
      ]
    },
    {
      name: 'Processing',
      nodes: [
        { type: 'process', label: 'Process', icon: '⚙️', description: 'Data processing step' },
        { type: 'transform', label: 'Transform', icon: '🔄', description: 'Transform data format' },
        { type: 'filter', label: 'Filter', icon: '🔍', description: 'Filter data by conditions' },
      ]
    },
    {
      name: 'Control Flow',
      nodes: [
        { type: 'condition', label: 'Condition', icon: '❓', description: 'Conditional branching' },
        { type: 'loop', label: 'Loop', icon: '🔁', description: 'Iterate over data' },
        { type: 'delay', label: 'Delay', icon: '⏳', description: 'Add time delay' },
      ]
    },
    {
      name: 'AI Agents',
      nodes: [
        { type: 'ai', label: 'AI Agent', icon: '🤖', description: 'Custom AI agent' },
        { type: 'llm', label: 'LLM', icon: '💬', description: 'Language model interaction' },
        { type: 'embedding', label: 'Embedding', icon: '🔢', description: 'Text embeddings' },
      ]
    }
  ]

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Node Palette</h3>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-muted rounded" title="Import Nodes">
              <Upload className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-muted rounded" title="Export Nodes">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Search nodes..."
          className="w-full px-3 py-1.5 text-sm border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {nodeCategories.map((category) => (
          <div key={category.name}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              {category.name}
            </h4>
            <div className="space-y-2">
              {category.nodes.map((node) => (
                <div
                  key={node.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg cursor-grab hover:shadow-md transition-shadow group"
                >
                  <div className="text-lg">{node.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{node.label}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {node.description}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Agent Marketplace Link */}
        <div className="border-t pt-4">
          <button className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-muted hover:border-primary rounded-lg transition-colors group">
            <Bot className="h-5 w-5 text-primary" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Browse Marketplace</div>
              <div className="text-xs text-muted-foreground">
                Find more AI agents
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NodePalette